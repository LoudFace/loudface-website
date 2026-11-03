/**
 * A research figure's chart is stored in Sanity as JSON text (`figures[].spec`). This file reads that text into a
 * ChartSpec for two callers: the Studio's validation rule (src/sanity/schemas/research.ts), so a bad spec cannot be
 * published, and the reads in src/lib/cms-data.ts and src/lib/llms-utils.ts, which throw on a bad spec instead of
 * drawing a broken page. The checking itself is the chart drawer's own parser (src/app/research-v11/charts/parse.ts),
 * so the Studio, the data layer and the drawer accept exactly the same specs; this file only adds which paper and
 * figure failed.
 *
 * No Next or React imports: the Studio bundle loads this file too.
 */
import type { ChartSpec } from '../app/research-v11/contract';
import { parseChartSpec } from '../app/research-v11/charts/parse';

export const FIGURE_PLACEMENTS = ['lead', 'band', 'afterH2'] as const;

/**
 * Read a figure's JSON text into a ChartSpec. Throws with the reason; `where` names the paper and the figure so the
 * error says which document to fix.
 */
export function parseChartSpecText(text: unknown, where: string): ChartSpec {
  try {
    return parseChartSpec(text as string);
  } catch (error) {
    throw new Error(`${where}: ${(error as Error).message}`);
  }
}

/** The Studio form of the same check: true when valid, otherwise the message to show. */
export function chartSpecValidation(text: unknown): true | string {
  if (text === undefined || text === null || text === '') return true; // required() reports the empty case
  try {
    parseChartSpec(text as string);
    return true;
  } catch (error) {
    return (error as Error).message;
  }
}
