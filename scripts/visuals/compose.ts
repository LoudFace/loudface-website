/**
 * Compose — uploads illustrations to Sanity, assembles the visuals array,
 * writes a draft of the blog post. Never publishes.
 *
 * Usage: npx tsx scripts/visuals/compose.ts <slug>
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fetchBlogPostBySlug, sanityClient, draftId, uploadImageAsset, publishedId } from './lib/sanity';
import {
  ShotListSchema,
  IllustrationResultSchema,
  ScreenshotResultSchema,
  type IllustrationResult,
  type ScreenshotResult,
} from './types';

const CACHE_ROOT = path.resolve(process.cwd(), '.visuals-cache');

interface SanityVisual {
  _key: string;
  _type: 'blogVisual';
  position: { anchor: 'hero' | 'after-h2' | 'end'; h2Index?: number };
  type: 'illustration' | 'chart' | 'screenshot';
  alt: string;
  caption?: string;
  asset?: { _type: 'image'; asset: { _type: 'reference'; _ref: string } };
  generation?: Record<string, unknown>;
  chart?: Record<string, unknown>;
  capture?: {
    sourceUrl: string;
    capturedAt: string;
    viewport: string;
  };
}

export async function composeForSlug(slug: string): Promise<void> {
  const cacheDir = path.join(CACHE_ROOT, slug);
  const planPath = path.join(cacheDir, 'plan.json');
  const illustrationsPath = path.join(cacheDir, 'illustrations.json');
  const screenshotsPath = path.join(cacheDir, 'screenshots.json');

  if (!fs.existsSync(planPath)) {
    throw new Error(`No plan found at ${planPath}. Run plan.ts first.`);
  }

  const plan = ShotListSchema.parse(JSON.parse(fs.readFileSync(planPath, 'utf-8')));
  const illustrations: IllustrationResult[] = fs.existsSync(illustrationsPath)
    ? JSON.parse(fs.readFileSync(illustrationsPath, 'utf-8')).map((x: unknown) => IllustrationResultSchema.parse(x))
    : [];
  const screenshots: ScreenshotResult[] = fs.existsSync(screenshotsPath)
    ? JSON.parse(fs.readFileSync(screenshotsPath, 'utf-8')).map((x: unknown) => ScreenshotResultSchema.parse(x))
    : [];

  const post = await fetchBlogPostBySlug(slug);
  if (!post) {
    throw new Error(`No blogPost found with slug "${slug}"`);
  }

  const illustrationBySlot = new Map(illustrations.map((r: IllustrationResult) => [r.slot, r]));
  const screenshotBySlot = new Map(screenshots.map((r: ScreenshotResult) => [r.slot, r]));

  const visuals: SanityVisual[] = [];
  const client = sanityClient();

  const uploadCount = illustrations.length + screenshots.length;
  console.log(`→ Uploading ${uploadCount} images to Sanity assets (${illustrations.length} illustrations, ${screenshots.length} screenshots)...`);

  for (const shot of plan.shots) {
    if (shot.type === 'illustration') {
      const result = illustrationBySlot.get(shot.slot);
      if (!result) {
        console.warn(`  ⚠  No generated image for slot "${shot.slot}" — skipping`);
        continue;
      }
      const filename = `${slug}__${shot.slot}.png`;
      process.stdout.write(`  · ${shot.slot} ... `);
      const asset = await uploadImageAsset(result.localPath, filename);
      console.log(`uploaded (${asset._id})`);

      visuals.push({
        _key: shot.slot,
        _type: 'blogVisual',
        position: shot.position,
        type: 'illustration',
        alt: shot.alt,
        ...(shot.caption && { caption: shot.caption }),
        asset: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
        generation: result.generation,
      });
    } else if (shot.type === 'screenshot') {
      const result = screenshotBySlot.get(shot.slot);
      if (!result) {
        console.warn(`  ⚠  No captured screenshot for slot "${shot.slot}" — skipping`);
        continue;
      }
      const filename = `${slug}__${shot.slot}.png`;
      process.stdout.write(`  · ${shot.slot} ... `);
      const asset = await uploadImageAsset(result.localPath, filename);
      console.log(`uploaded (${asset._id})`);

      visuals.push({
        _key: shot.slot,
        _type: 'blogVisual',
        position: shot.position,
        type: 'screenshot',
        alt: shot.alt,
        ...(shot.caption && { caption: shot.caption }),
        asset: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
        capture: {
          sourceUrl: result.capture.sourceUrl,
          capturedAt: result.capture.capturedAt,
          viewport: result.capture.viewport,
        },
      });
    } else if (shot.type === 'chart' && shot.chart) {
      // Sanity requires a unique `_key` on every array-of-object item. The
      // chart.data rows are a nested array, so they each need their own key.
      const chart = {
        ...shot.chart,
        data: shot.chart.data.map((d, i) => ({
          _key: `${shot.slot}-row-${i}`,
          ...d,
        })),
      };
      visuals.push({
        _key: shot.slot,
        _type: 'blogVisual',
        position: shot.position,
        type: 'chart',
        alt: shot.alt,
        ...(shot.caption && { caption: shot.caption }),
        chart,
      });
    }
  }

  console.log(`→ Writing draft to Sanity with ${visuals.length} visuals...`);
  const targetDraftId = draftId(post._id);

  // Fetch existing draft if present, so we can preserve any concurrent edits
  const existingDraft = await client.getDocument(targetDraftId);

  if (existingDraft) {
    // Heal drafts corrupted by an earlier projection bug: if slug was flattened
    // to a bare string, recreate the draft from the published doc.
    const draftSlug = (existingDraft as { slug?: unknown }).slug;
    const slugIsBroken = typeof draftSlug === 'string';
    if (slugIsBroken) {
      console.log('  ⚠  Existing draft has malformed slug — recreating from published doc.');
      await writeFreshDraft(client, post, targetDraftId, visuals);
    } else {
      await client.patch(targetDraftId).set({ visuals }).commit();
    }
  } else {
    await writeFreshDraft(client, post, targetDraftId, visuals);
  }

  const studioPath = `/studio/structure/blogPost;${publishedId(post._id)}`;
  const studioBase = process.env.STUDIO_BASE_URL ?? 'http://localhost:3005';
  console.log(`✓ Draft ready for review.`);
  console.log(`  Studio (local): ${studioBase}${studioPath}`);
  console.log(`  Studio (prod):  https://www.loudface.co${studioPath}`);
  console.log(`  Visuals attached: ${visuals.length}`);
  logVisualPositions(visuals);
}

function logVisualPositions(visuals: SanityVisual[]) {
  for (const v of visuals) {
    const pos = v.position.anchor === 'after-h2' ? `after H2 #${v.position.h2Index}` : v.position.anchor;
    console.log(`    · ${v._key} → ${v.type} @ ${pos}`);
  }
}

/**
 * Writes a draft from scratch by copying every field from the published doc,
 * stamping the draft ID, and attaching visuals. Strips system fields that
 * Sanity regenerates (_rev, _createdAt, _updatedAt) to avoid revision conflicts.
 */
async function writeFreshDraft(
  client: ReturnType<typeof sanityClient>,
  publishedDoc: Record<string, unknown>,
  targetDraftId: string,
  visuals: SanityVisual[],
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _rev, _createdAt, _updatedAt, ...rest } = publishedDoc as Record<string, unknown>;
  await client.createOrReplace({
    ...rest,
    _id: targetDraftId,
    visuals,
  } as never);
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/visuals/compose.ts <slug>');
    process.exit(1);
  }
  try {
    await composeForSlug(slug);
  } catch (err) {
    console.error('✗ Compose failed:');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Use pathToFileURL so paths with spaces get URL-encoded to match import.meta.url.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
