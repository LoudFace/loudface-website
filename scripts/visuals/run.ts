/**
 * Orchestrator — plan → illustrate → screenshot → compose.
 *
 * Usage:
 *   npx tsx scripts/visuals/run.ts <slug>
 *   npx tsx scripts/visuals/run.ts <slug> --skip-plan        (re-use existing plan)
 *   npx tsx scripts/visuals/run.ts <slug> --skip-illustrate  (skip fal.ai calls)
 *   npx tsx scripts/visuals/run.ts <slug> --skip-screenshot  (skip Playwright captures)
 *   npx tsx scripts/visuals/run.ts <slug> --skip-compose     (stop before Sanity write)
 *   npx tsx scripts/visuals/run.ts <slug> --plan-only
 *   npx tsx scripts/visuals/run.ts <slug> --merge
 *       Preserve existing draft visuals whose `_key` matches a plan slot.
 *       Use when re-running after hand-editing captions in Studio.
 *   npx tsx scripts/visuals/run.ts <slug> --reference <url-or-local-path>
 *       Use a reference image to lock visual style across all illustrations.
 */

import fs from 'fs';
import path from 'path';
import { planVisualsForSlug } from './plan';
import { illustratePlan } from './illustrate';
import { screenshotPlan } from './screenshot';
import { composeForSlug } from './compose';

interface Flags {
  skipPlan: boolean;
  skipIllustrate: boolean;
  skipScreenshot: boolean;
  skipCompose: boolean;
  planOnly: boolean;
  merge: boolean;
  referenceImages: string[];
}

function parseFlags(argv: string[]): Flags {
  const referenceImages: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--reference' && argv[i + 1]) {
      referenceImages.push(argv[i + 1]);
    }
  }
  return {
    skipPlan: argv.includes('--skip-plan'),
    skipIllustrate: argv.includes('--skip-illustrate'),
    skipScreenshot: argv.includes('--skip-screenshot'),
    skipCompose: argv.includes('--skip-compose'),
    planOnly: argv.includes('--plan-only'),
    merge: argv.includes('--merge'),
    referenceImages,
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const FLAGS_WITH_VALUE = new Set(['--reference']);
  const slug = argv.find((a, i) => !a.startsWith('--') && !FLAGS_WITH_VALUE.has(argv[i - 1] ?? ''));
  if (!slug) {
    console.error(
      'Usage: npx tsx scripts/visuals/run.ts <slug> [--skip-plan|--skip-illustrate|--skip-screenshot|--skip-compose|--plan-only|--merge] [--reference <url-or-path>]',
    );
    process.exit(1);
  }

  const flags = parseFlags(argv);
  const planPath = path.resolve(process.cwd(), `.visuals-cache/${slug}/plan.json`);

  console.log(`\n━━━ Visuals pipeline for "${slug}" ━━━\n`);

  if (!flags.skipPlan) {
    await planVisualsForSlug(slug);
  } else if (!fs.existsSync(planPath)) {
    throw new Error(`--skip-plan used but no plan exists at ${planPath}`);
  } else {
    console.log(`→ Skipping planner (re-using ${planPath})`);
  }

  if (flags.planOnly) {
    console.log('\n✓ Plan complete. Review .visuals-cache/<slug>/plan.md before proceeding.\n');
    return;
  }

  if (!flags.skipIllustrate) {
    await illustratePlan(slug, { referenceImages: flags.referenceImages });
  } else {
    console.log('→ Skipping illustration worker');
  }

  if (!flags.skipScreenshot) {
    await screenshotPlan(slug);
  } else {
    console.log('→ Skipping screenshot worker');
  }

  if (!flags.skipCompose) {
    await composeForSlug(slug, { merge: flags.merge });
  } else {
    console.log('→ Skipping compose step (not writing to Sanity)');
  }

  console.log('\n✓ Pipeline complete.\n');
}

main().catch((err) => {
  console.error('\n✗ Pipeline failed:');
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
