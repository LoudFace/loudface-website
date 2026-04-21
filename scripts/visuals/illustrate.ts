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
import { pathToFileURL } from 'url';
import { generateImage, uploadLocalFile } from './lib/fal';
import { readIllustrationTemplate, renderPrompt } from './lib/prompts';
import { ShotListSchema, type IllustrationResult } from './types';

const CACHE_ROOT = path.resolve(process.cwd(), '.visuals-cache');

export interface IllustrateOpts {
  /**
   * Optional reference image(s) for style consistency. Can be:
   *   - Public URL (https://...)
   *   - Local file path (will be uploaded to fal storage)
   * When provided, all illustration shots route to the `/edit` variant of
   * their model with the reference attached as `image_urls`.
   */
  referenceImage?: string;
  /**
   * Optional model override — forces every shot onto the same fal model
   * regardless of what the template frontmatter says. Used for A/B
   * experiments ("run the same article through gpt-image-1.5 AND nano-banana-2,
   * put results in different dirs, compare").
   * Supported values: "fal-ai/gpt-image-1.5", "fal-ai/nano-banana-2"
   */
  modelOverride?: string;
  /**
   * Optional suffix for the output directory + results file, so multiple
   * experiment runs can coexist. e.g. suffix "gpt" writes to
   * .visuals-cache/<slug>/illustrations-gpt/ and illustrations-gpt.json.
   */
  suffix?: string;
}

/**
 * Translates an aspect ratio enum (nano-banana style) to the closest
 * image_size enum accepted by gpt-image-1.5.
 */
function aspectRatioToImageSize(aspectRatio: string | undefined): string {
  switch (aspectRatio) {
    case '16:9':
    case '21:9':
    case '3:2':
      return '1536x1024';
    case '9:16':
    case '2:3':
      return '1024x1536';
    case '1:1':
    case '4:3':
    case '5:4':
    case '4:5':
    case '3:4':
    default:
      return '1024x1024';
  }
}

/**
 * Translates an image_size enum (gpt-image-1.5 style) to the closest
 * aspect_ratio + resolution pair accepted by nano-banana-2.
 */
function imageSizeToAspectAndResolution(
  imageSize: string | undefined,
): { aspectRatio: string; resolution: string } {
  switch (imageSize) {
    case '1536x1024':
      return { aspectRatio: '3:2', resolution: '2K' };
    case '1024x1536':
      return { aspectRatio: '2:3', resolution: '2K' };
    case '1024x1024':
    default:
      return { aspectRatio: '1:1', resolution: '1K' };
  }
}

export async function illustratePlan(
  slug: string,
  opts: IllustrateOpts = {},
): Promise<IllustrationResult[]> {
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

  const dirSuffix = opts.suffix ? `-${opts.suffix}` : '';
  const outDir = path.join(CACHE_ROOT, slug, `illustrations${dirSuffix}`);
  const cacheDir = path.join(CACHE_ROOT, '_fal-cache');
  fs.mkdirSync(outDir, { recursive: true });

  // Resolve reference image to a public URL (upload local file if needed).
  let referenceUrl: string | undefined;
  if (opts.referenceImage) {
    if (/^https?:\/\//i.test(opts.referenceImage)) {
      referenceUrl = opts.referenceImage;
      console.log(`→ Using style reference: ${referenceUrl}`);
    } else {
      const resolved = path.resolve(opts.referenceImage);
      if (!fs.existsSync(resolved)) {
        throw new Error(`Reference image not found: ${resolved}`);
      }
      console.log(`→ Uploading style reference to fal storage: ${resolved}`);
      referenceUrl = await uploadLocalFile(resolved);
      console.log(`  hosted at: ${referenceUrl}`);
    }
  }

  console.log(
    `→ Generating ${illustrationShots.length} illustrations via fal.ai${referenceUrl ? ' (edit mode, style-locked)' : ''}...`,
  );

  const results: IllustrationResult[] = [];
  const failures: Array<{ slot: string; error: string }> = [];
  for (const shot of illustrationShots) {
    if (!shot.template || !shot.subject) {
      console.warn(`  ⚠  Skipping "${shot.slot}" — missing template or subject`);
      continue;
    }

    const template = readIllustrationTemplate(shot.template);
    const hasReference = !!referenceUrl;
    // When a reference is attached, renderPrompt drops the style block and
    // style-negatives and appends a directive telling the model to mimic the
    // reference. Without a reference, the full template (subject + style +
    // both negative groups) is used.
    const { prompt: finalPrompt, negativePrompt } = renderPrompt(template, shot.subject, {
      hasReference,
    });

    // Resolve final model + dimensional params. If --model override is set,
    // swap the template's model out AND translate its dimension hint into the
    // new model family's accepted param shape (aspect_ratio↔image_size).
    const effectiveModel = opts.modelOverride ?? template.model;
    const isGpt = effectiveModel.includes('gpt-image');
    let effectiveAspectRatio = template.aspectRatio;
    let effectiveResolution = template.resolution;
    let effectiveImageSize = template.imageSize;
    const effectiveQuality = template.quality;
    const effectiveInputFidelity = template.inputFidelity;

    if (opts.modelOverride) {
      if (isGpt && !template.imageSize) {
        effectiveImageSize = aspectRatioToImageSize(template.aspectRatio);
      } else if (!isGpt && !template.aspectRatio) {
        const mapped = imageSizeToAspectAndResolution(template.imageSize);
        effectiveAspectRatio = mapped.aspectRatio;
        effectiveResolution = mapped.resolution;
      }
    }

    const outputPath = path.join(outDir, `${shot.slot}.png`);

    process.stdout.write(`  · ${shot.slot} [${effectiveModel}] ... `);
    try {
      const result = await generateImage({
        model: effectiveModel,
        prompt: finalPrompt,
        negativePrompt,
        aspectRatio: effectiveAspectRatio,
        resolution: effectiveResolution,
        imageSize: effectiveImageSize,
        quality: effectiveQuality,
        inputFidelity: effectiveInputFidelity,
        ...(referenceUrl && { imageUrls: [referenceUrl] }),
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
          negativePrompt,
          model: effectiveModel,
          requestId: result.requestId,
          generatedAt: new Date().toISOString(),
          hasReference,
        },
      });
    } catch (err) {
      // Soft-fail: a single fal.ai timeout, content-policy rejection, or
      // model blip shouldn't kill the rest of the run. Cached illustrations
      // already written to disk stay; compose will log a warning and skip
      // this slot, emitting the article with the remaining visuals.
      const msg = err instanceof Error ? err.message : String(err);
      console.log('failed ✗ (skipping)');
      console.error(`    ${msg}`);
      failures.push({ slot: shot.slot, error: msg });
      continue;
    }
  }

  const resultsPath = path.join(CACHE_ROOT, slug, `illustrations${dirSuffix}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(
    `✓ Saved ${results.length} illustrations → .visuals-cache/${slug}/illustrations${dirSuffix}/`,
  );

  if (failures.length > 0) {
    console.warn(`⚠  ${failures.length} illustration(s) failed — compose will skip those slots:`);
    for (const f of failures) {
      console.warn(`    · ${f.slot}: ${f.error}`);
    }
  }

  return results;
}

// ── CLI ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  const flagValue = (name: string): string | undefined => {
    const i = args.findIndex((a) => a === name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const referenceImage = flagValue('--reference');
  const modelOverride = flagValue('--model');
  const suffix = flagValue('--suffix');

  if (!slug) {
    console.error(
      'Usage: npx tsx scripts/visuals/illustrate.ts <slug> [--reference <url-or-path>] [--model <fal-model>] [--suffix <name>]',
    );
    process.exit(1);
  }
  try {
    await illustratePlan(slug, { referenceImage, modelOverride, suffix });
  } catch (err) {
    console.error('✗ Illustration worker failed:');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Use pathToFileURL so paths with spaces (e.g. "Code Projects") get URL-encoded
// to match what import.meta.url produces — naive `file://${argv[1]}` concat breaks.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

