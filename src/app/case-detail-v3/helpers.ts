/**
 * case-detail-v3 helpers — pure, server-safe field logic for the detail template.
 *
 * The signature hero object has two variants driven ENTIRELY by the study's own
 * `result-1-number` (safe claim: per-study stat, client named, nothing invented):
 *   - TWO-STATE (before → after): when the lead result encodes a transition
 *     (e.g. Toku "0 → 86%", LoudFace "0.18% → 10.4%"), split it into a before
 *     state and an after state and render the answer card.
 *   - SINGLE-STATE: any single-value lead result (e.g. "288%", "$200K", "20+")
 *     degrades to a one-column result card in the same glass family.
 *
 * Live data (26 studies, 2026-07-14): exactly 2 studies encode a transition;
 * the other 24 are single-value — so the split is real where the story is a
 * climb, and degrades cleanly everywhere else.
 */

export interface ResultTransition {
  before: string;
  after: string;
}

const TRANSITION_SPLIT = /\s*(?:→|⟶|➜|-+>)\s*/;

/**
 * Parse a result-number string into { before, after } if it encodes a
 * transition, else null. Only splits on an explicit arrow token so a hyphenated
 * value ("Under 90-days", "3-4") is never mis-split — both sides must be
 * non-empty and the arrow must be present.
 */
export function parseResultTransition(raw: string | undefined): ResultTransition | null {
  if (!raw) return null;
  if (!TRANSITION_SPLIT.test(raw)) return null;
  const parts = raw.split(TRANSITION_SPLIT).map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  const [before, after] = parts;
  if (!before || !after) return null;
  return { before, after };
}

export interface ResultStat {
  number: string;
  title: string;
}

/** Collect the populated result stats (result-1 required, 2 & 3 optional). */
export function collectResults(study: {
  'result-1---number'?: string;
  'result-1---title'?: string;
  'result-2---number'?: string;
  'result-2---title'?: string;
  'result-3---number'?: string;
  'result-3---title'?: string;
}): ResultStat[] {
  return [
    { number: study['result-1---number'], title: study['result-1---title'] ?? '' },
    { number: study['result-2---number'], title: study['result-2---title'] ?? '' },
    { number: study['result-3---number'], title: study['result-3---title'] ?? '' },
  ].filter((r): r is ResultStat => Boolean(r.number));
}

/** Strip HTML tags to a plain string (for the testimonial pull-quote fallback). */
export function stripTags(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
