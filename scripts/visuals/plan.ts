/**
 * Planner — reads a blog post from Sanity, asks Claude to produce a shot list,
 * validates against Zod, saves to .visuals-cache/<slug>/plan.json.
 *
 * Usage: npx tsx scripts/visuals/plan.ts <slug>
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fetchBlogPostBySlug } from './lib/sanity';
import { generate, extractJson } from './lib/claude';
import { readSystemPrompt } from './lib/prompts';
import { outline, toPlannerMarkdown } from './lib/article';
import { ShotListSchema, type ShotList } from './types';

const CACHE_ROOT = path.resolve(process.cwd(), '.visuals-cache');

export async function planVisualsForSlug(slug: string): Promise<ShotList> {
  const post = await fetchBlogPostBySlug(slug);
  if (!post) {
    throw new Error(`No blogPost found with slug "${slug}"`);
  }
  if (!post.content) {
    throw new Error(`Blog post "${slug}" has no content field`);
  }

  const structure = outline(post.content);
  const plannerInput = toPlannerMarkdown(post.content, post.name);

  console.log(`→ Article: "${post.name}" (${structure.wordCount} words, ${structure.h2s.length} H2s)`);
  console.log('→ Calling Claude for shot list...');

  const system = readSystemPrompt();
  const user = [
    `Article slug: ${slug}`,
    `Article title: ${post.name}`,
    `Word count: ${structure.wordCount}`,
    `H2 count: ${structure.h2s.length}`,
    '',
    'H2 outline (use these indices in position.h2Index):',
    ...structure.h2s.map((h) => `  ${h.index}. ${h.text}`),
    '',
    'Article body (H2s annotated with their index):',
    '---',
    plannerInput,
    '---',
    '',
    'Return the shot list as a single JSON object. No prose, no markdown fences.',
  ].join('\n');

  const raw = await generate({ system, user });
  const parsed = extractJson(raw);
  const validated = ShotListSchema.parse(parsed);

  if (validated.articleSlug !== slug) {
    validated.articleSlug = slug;
  }
  validated.articleTitle = post.name;

  validateAgainstStructure(validated, structure.h2s.length);

  const cacheDir = path.join(CACHE_ROOT, slug);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, 'plan.json'), JSON.stringify(validated, null, 2));
  fs.writeFileSync(path.join(cacheDir, 'plan.md'), renderPreview(validated));

  console.log(`✓ Saved plan → .visuals-cache/${slug}/plan.json (${validated.shots.length} shots)`);
  return validated;
}

function validateAgainstStructure(list: ShotList, h2Count: number) {
  const slots = new Set<string>();
  for (const shot of list.shots) {
    if (slots.has(shot.slot)) {
      throw new Error(`Duplicate slot name: "${shot.slot}"`);
    }
    slots.add(shot.slot);

    if (shot.position.anchor === 'after-h2') {
      const idx = shot.position.h2Index!;
      if (idx < 1 || idx > h2Count) {
        throw new Error(`Shot "${shot.slot}" references H2 #${idx} but article has ${h2Count} H2s`);
      }
    }

    // Hard block on known bot-walled URL patterns. The planner prompt also
    // tells Claude not to emit these, but this guard ensures a regressed
    // prompt can never slip a dead-on-arrival capture into a plan.
    if (shot.type === 'screenshot' && shot.capture?.sourceUrl) {
      assertScreenshotUrlIsSafe(shot.slot, shot.capture.sourceUrl);
    }
  }

  const heroCount = list.shots.filter((s) => s.position.anchor === 'hero').length;
  if (heroCount !== 1) {
    throw new Error(`Expected exactly 1 hero shot, got ${heroCount}`);
  }
}

/**
 * Known targets that Cloudflare/Datadome will wall. Direct Perplexity live
 * search URLs (as opposed to share permalinks at /search/<slug>-<id>) have a
 * 100% capture-fails rate empirically. Extend this list as we discover more.
 */
function assertScreenshotUrlIsSafe(slot: string, rawUrl: string): void {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Shot "${slot}" has an unparseable sourceUrl: ${rawUrl}`);
  }
  // Perplexity live queries: /search?q=... bot-walls every time. Permalinks
  // are /search/<slug>-<id> and those DO render, so we only block the /search
  // path when a `q` search param is present.
  if (url.hostname.endsWith('perplexity.ai') && url.pathname === '/search' && url.searchParams.has('q')) {
    throw new Error(
      `Shot "${slot}" targets a live Perplexity search URL (${rawUrl}). ` +
      `These always capture the Cloudflare bot-challenge page. ` +
      `Use a share permalink (perplexity.ai/search/<slug>-<id>) or switch to a Google AI Overview screenshot / chart.`,
    );
  }
}

function renderPreview(list: ShotList): string {
  const lines: string[] = [];
  lines.push(`# Shot list: ${list.articleTitle}`);
  lines.push('');
  lines.push(`Slug: \`${list.articleSlug}\``);
  lines.push(`Generated: ${list.generatedAt}`);
  lines.push(`Shots: ${list.shots.length}`);
  lines.push('');
  for (const shot of list.shots) {
    const pos = shot.position.anchor === 'after-h2'
      ? `after H2 #${shot.position.h2Index}`
      : shot.position.anchor;
    lines.push(`## ${shot.slot}`);
    lines.push(`- **Type:** ${shot.type}`);
    lines.push(`- **Position:** ${pos}`);
    lines.push(`- **Alt:** ${shot.alt}`);
    if (shot.caption) lines.push(`- **Caption:** ${shot.caption}`);
    if (shot.type === 'illustration') {
      lines.push(`- **Template:** ${shot.template}`);
      lines.push(`- **Subject:** ${shot.subject}`);
    }
    if (shot.type === 'chart' && shot.chart) {
      lines.push(`- **Chart:** ${shot.chart.kind} — "${shot.chart.title}"`);
      lines.push(`- **Data:** ${shot.chart.data.map((d) => `${d.label}=${d.value}${d.unit ?? ''}`).join(', ')}`);
      if (shot.chart.source) lines.push(`- **Source:** ${shot.chart.source}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// ── CLI ─────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/visuals/plan.ts <slug>');
    process.exit(1);
  }
  try {
    await planVisualsForSlug(slug);
  } catch (err) {
    console.error('✗ Planner failed:');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Use pathToFileURL so paths with spaces get URL-encoded to match import.meta.url.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
