/**
 * Illustration worker — reads a plan.json, generates all illustration shots via
 * fal.ai, saves PNGs + metadata to .visuals-cache/<slug>/illustrations/.
 *
 * Results are cached by sha(model + prompt) — re-running with the same inputs
 * is free. Safe to interrupt and resume.
 *
 * Usage: npx tsx scripts/visuals/illustrate.ts <slug>
 */

import fs from 'fs';
import path from 'path';
import { generateImage } from './lib/fal';
import { readIllustrationTemplate, renderPrompt } from './lib/prompts';
import { ShotListSchema, type IllustrationResult } from './types';

const CACHE_ROOT = path.resolve(process.cwd(), '.visuals-cache');

export async function illustratePlan(slug: string): Promise<IllustrationResult[]> {
  const planPath = path.join(CACHE_ROOT, slug, 'plan.json');
  if (!fs.existsSync(planPath)) {
    throw new Error(`No plan found at ${planPath}. Run plan.ts first.`);
  }

  const plan = ShotListSchema.parse(JSON.parse(fs.readFileSync(planPath, 'utf-8')));
  const illustrationShots = plan.shots.filter((s) => s.type === 'illustration');

  if (illustrationShots.length === 0) {
    console.log('→ No illustration shots in plan. Nothing to do.');
    return [];
  }

  const outDir = path.join(CACHE_ROOT, slug, 'illustrations');
  const cacheDir = path.join(CACHE_ROOT, '_fal-cache');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`→ Generating ${illustrationShots.length} illustrations via fal.ai...`);

  const results: IllustrationResult[] = [];
  for (const shot of illustrationShots) {
    if (!shot.template || !shot.subject) {
      console.warn(`  ⚠  Skipping "${shot.slot}" — missing template or subject`);
      continue;
    }

    const template = readIllustrationTemplate(shot.template);
    const finalPrompt = renderPrompt(template, shot.subject);
    const outputPath = path.join(outDir, `${shot.slot}.png`);

    process.stdout.write(`  · ${shot.slot} [${template.model}] ... `);
    try {
      const result = await generateImage({
        model: template.model,
        prompt: finalPrompt,
        negativePrompt: template.negativePrompt,
        aspectRatio: template.aspectRatio,
        resolution: template.resolution,
        outputPath,
        cacheDir,
      });

      console.log(result.cached ? 'cached ✓' : `generated ✓ (${result.requestId})`);

      results.push({
        slot: shot.slot,
        localPath: result.localPath,
        sha: result.sha,
        generation: {
          promptTemplate: shot.template,
          subject: shot.subject,
          finalPrompt: result.finalPrompt,
          negativePrompt: template.negativePrompt,
          model: template.model,
          requestId: result.requestId,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.log('failed ✗');
      console.error(`    ${err instanceof Error ? err.message : err}`);
      throw err;
    }
  }

  const resultsPath = path.join(CACHE_ROOT, slug, 'illustrations.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`✓ Saved ${results.length} illustrations → .visuals-cache/${slug}/illustrations/`);

  return results;
}

// ── CLI ─────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/visuals/illustrate.ts <slug>');
    process.exit(1);
  }
  try {
    await illustratePlan(slug);
  } catch (err) {
    console.error('✗ Illustration worker failed:');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

