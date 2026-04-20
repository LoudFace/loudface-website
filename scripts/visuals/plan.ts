/**
 * Planner — reads a blog post from Sanity, asks Claude to produce a shot list,
 * validates against Zod, saves to .visuals-cache/<slug>/plan.json.
 *
 * Usage: npx tsx scripts/visuals/plan.ts <slug>
 */

import fs from 'fs';
import path from 'path';
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
  }

  const heroCount = list.shots.filter((s) => s.position.anchor === 'hero').length;
  if (heroCount !== 1) {
    throw new Error(`Expected exactly 1 hero shot, got ${heroCount}`);
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
