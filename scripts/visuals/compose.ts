/**
 * Compose — uploads illustrations to Sanity, assembles the visuals array,
 * writes a draft of the blog post. Never publishes.
 *
 * Usage: npx tsx scripts/visuals/compose.ts <slug>
 */

import fs from 'fs';
import path from 'path';
import { fetchBlogPostBySlug, sanityClient, draftId, uploadImageAsset, publishedId } from './lib/sanity';
import { ShotListSchema, IllustrationResultSchema, type IllustrationResult } from './types';

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
}

export async function composeForSlug(slug: string): Promise<void> {
  const cacheDir = path.join(CACHE_ROOT, slug);
  const planPath = path.join(cacheDir, 'plan.json');
  const illustrationsPath = path.join(cacheDir, 'illustrations.json');

  if (!fs.existsSync(planPath)) {
    throw new Error(`No plan found at ${planPath}. Run plan.ts first.`);
  }

  const plan = ShotListSchema.parse(JSON.parse(fs.readFileSync(planPath, 'utf-8')));
  const illustrations: IllustrationResult[] = fs.existsSync(illustrationsPath)
    ? JSON.parse(fs.readFileSync(illustrationsPath, 'utf-8')).map((x: unknown) => IllustrationResultSchema.parse(x))
    : [];

  const post = await fetchBlogPostBySlug(slug);
  if (!post) {
    throw new Error(`No blogPost found with slug "${slug}"`);
  }

  const illustrationBySlot = new Map(illustrations.map((r: IllustrationResult) => [r.slot, r]));

  const visuals: SanityVisual[] = [];
  const client = sanityClient();

  console.log(`→ Uploading ${illustrations.length} illustrations to Sanity assets...`);

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
    } else if (shot.type === 'chart' && shot.chart) {
      visuals.push({
        _key: shot.slot,
        _type: 'blogVisual',
        position: shot.position,
        type: 'chart',
        alt: shot.alt,
        ...(shot.caption && { caption: shot.caption }),
        chart: shot.chart,
      });
    }
  }

  console.log(`→ Writing draft to Sanity with ${visuals.length} visuals...`);
  const targetDraftId = draftId(post._id);

  // Fetch existing draft if present, so we can preserve any concurrent edits
  const existingDraft = await client.getDocument(targetDraftId);

  if (existingDraft) {
    await client.patch(targetDraftId).set({ visuals }).commit();
  } else {
    await client.createOrReplace({
      ...post,
      _id: targetDraftId,
      visuals,
    });
  }

  const studioPath = `/studio/desk/blogPost;${publishedId(post._id)}`;
  console.log(`✓ Draft ready for review.`);
  console.log(`  Studio: ${studioPath}`);
  console.log(`  Visuals attached: ${visuals.length}`);
  logVisualPositions(visuals);
}

function logVisualPositions(visuals: SanityVisual[]) {
  for (const v of visuals) {
    const pos = v.position.anchor === 'after-h2' ? `after H2 #${v.position.h2Index}` : v.position.anchor;
    console.log(`    · ${v._key} → ${v.type} @ ${pos}`);
  }
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
