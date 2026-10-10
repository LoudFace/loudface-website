import 'server-only';
import { cachedReadClient } from '@/lib/sanity.client';
import type { CaseStudyChart, CaseStudyInstruments } from '@/lib/types';

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

export interface CaseProof {
  slug: string;
  name: string;
  resultNumber?: string;
  resultTitle?: string;
  result2Number?: string;
  result2Title?: string;
  clientColor?: string;
  charts?: CaseStudyChart[];
  /** The same instruments the case page reads, so the proposal picks the same lead chart. */
  instruments?: CaseStudyInstruments;
}

const QUERY = `*[_type == "caseStudy" && slug.current in $slugs]{
  "slug": slug.current,
  name,
  "resultNumber": result1Number,
  "resultTitle": result1Title,
  "result2Number": result2Number,
  "result2Title": result2Title,
  clientColor,
  "charts": charts[]{
    title, chartType, legendPrimary, legendSecondary,
    data[]{ label, value, secondaryValue, displayValue, secondaryDisplayValue }
  },
  "instruments": instruments{
    aiSource,
    gscSource,
    engagementStart,
    topicClimb{ title, caption, points[]{ week, value } },
    rankOverTime{ label, from, to, caption, points[]{ week, position } },
    engineBeforeAfter{ beforeLabel, afterLabel, caption, rows[]{ engine, before, after } },
    indexedTrend{ title, baselineLabel, caption, startMonthIso, points[]{ month, date, impressions, clicks, partial } },
    leadGrowth{ title, multiple, multipleLabel, baselineLabel, caption, source, points[]{ week, value } },
    clickGrowth{ title, baselineLabel, source, points[]{ week, value } },
    publishedResult{ rows[]{ value, unit }, positionFrom, positionTo, caption }
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
