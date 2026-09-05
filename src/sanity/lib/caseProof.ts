import 'server-only';
import { cachedReadClient } from '@/lib/sanity.client';
import type { CaseStudyChart } from '@/lib/types';

/**
 * Case-study proof for the proposal surface.
 *
 * A proposal lives in the PRIVATE `proposals` dataset; case studies live in the
 * public `production` one, and Sanity cannot reference across datasets. So the
 * proposal stores nothing but a list of slugs and the numbers are read from the
 * live case study at render time.
 *
 * That is the point: the charts a prospect sees in a proposal are the same
 * charts on the public page, and they cannot drift. Nobody re-types a number
 * into a proposal and gets it wrong.
 *
 * Direction of travel matters — this reads FROM the public dataset. Nothing
 * about a proposal is ever written to it.
 */

export interface CaseProofInstruments {
  topicClimb?: { title: string; caption: string; points: { week: string; value: number }[] };
  indexedTrend?: {
    title: string;
    baselineLabel: string;
    caption: string;
    startMonthIso: string;
    points: { month: string; date?: string; impressions: number; clicks: number }[];
  };
}

export interface CaseProof {
  slug: string;
  name: string;
  resultNumber?: string;
  resultTitle?: string;
  clientColor?: string;
  charts?: CaseStudyChart[];
  instruments?: CaseProofInstruments;
}

const QUERY = `*[_type == "caseStudy" && slug.current in $slugs]{
  "slug": slug.current,
  name,
  "resultNumber": result1Number,
  "resultTitle": result1Title,
  clientColor,
  "charts": charts[]{
    title, chartType, legendPrimary, legendSecondary,
    data[]{ label, value, secondaryValue, displayValue, secondaryDisplayValue }
  },
  "instruments": instruments{
    topicClimb{ title, caption, points[]{ week, value } },
    indexedTrend{ title, baselineLabel, caption, startMonthIso, points[]{ month, date, impressions, clicks } }
  }
}`;

/**
 * Returns the requested case studies in the order the proposal lists them —
 * GROQ's `in` does not preserve it, and the running order of a proposal is an
 * editorial decision, not a database one.
 */
export async function fetchCaseProof(slugs: string[]): Promise<CaseProof[]> {
  const wanted = slugs.filter(Boolean);
  if (wanted.length === 0) return [];

  try {
    const rows = (await cachedReadClient.fetch(QUERY, { slugs: wanted })) as CaseProof[];
    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    return wanted.map((slug) => bySlug.get(slug)).filter((row): row is CaseProof => Boolean(row));
  } catch (error) {
    // A proposal must still open if the marketing dataset hiccups. The block
    // renders nothing rather than taking the price down with it.
    console.error('[proposals] case-study proof read failed:', error);
    return [];
  }
}
