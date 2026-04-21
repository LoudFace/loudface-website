/**
 * Orchestrator — plan → illustrate → compose.
 *
 * Usage:
 *   npx tsx scripts/visuals/run.ts <slug>
 *   npx tsx scripts/visuals/run.ts <slug> --skip-plan      (re-use existing plan)
 *   npx tsx scripts/visuals/run.ts <slug> --skip-compose   (stop before Sanity write)
 *   npx tsx scripts/visuals/run.ts <slug> --plan-only
 *   npx tsx scripts/visuals/run.ts <slug> --reference <url-or-local-path>
 *       Use a reference image to lock visual style across all illustrations.
 */

import fs from 'fs';
import path from 'path';
import { planVisualsForSlug } from './plan';
import { illustratePlan } from './illustrate';
import { composeForSlug } from './compose';

interface Flags {
  skipPlan: boolean;
  skipIllustrate: boolean;
  skipCompose: boolean;
  planOnly: boolean;
  referenceImage?: string;
}

function parseFlags(argv: string[]): Flags {
  const refIdx = argv.findIndex((a) => a === '--reference');
  return {
    skipPlan: argv.includes('--skip-plan'),
    skipIllustrate: argv.includes('--skip-illustrate'),
    skipCompose: argv.includes('--skip-compose'),
    planOnly: argv.includes('--plan-only'),
    referenceImage: refIdx >= 0 ? argv[refIdx + 1] : undefined,
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const slug = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--reference');
  if (!slug) {
    console.error(
      'Usage: npx tsx scripts/visuals/run.ts <slug> [--skip-plan|--skip-illustrate|--skip-compose|--plan-only] [--reference <url-or-path>]',
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
    await illustratePlan(slug, { referenceImage: flags.referenceImage });
  } else {
    console.log('→ Skipping illustration worker');
  }

  if (!flags.skipCompose) {
    await composeForSlug(slug);
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
