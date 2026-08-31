/**
 * TradeMomentum case-study instruments — data aligned to the PUBLISHED page.
 *
 * This is a rebuild of the dev-preview draft's dataset. The draft indexed
 * everything to September 2025, which quietly contradicted the live case study:
 * the page's headline is "~12x impressions", and on a September baseline the
 * same Search Console data reads 24.8x. Two numbers for one fact on one screen.
 *
 * Reconciled against the live Sanity document
 * (`trademomentum-niche-aeo-organic-growth`) on 2026-08-31. Every published
 * claim checks out once its own baseline is used:
 *
 *   "~12x impressions"     DECEMBER baseline, monthly. Dec 6,464 -> Jul 75,907
 *                          = 11.7x. The page's existing growth chart is already
 *                          indexed to December, so this is the page's own frame.
 *   "7.2x Google clicks"   WEEKLY, Sep 2025 -> Aug 2026 (46 -> 332/wk).
 *   "8.8% -> 34.4%"        The "Trading communities" TOPIC, not a single prompt,
 *                          6 Jul -> 24 Aug 2026.
 *   "1.8 average position" The prompt "top momentum trading communities".
 *
 * So everything here is indexed to DECEMBER 2025 = 100, matching the page.
 *
 * Sources: Google Search Console (`sc-domain:trademomentum.org`) and Peec AI
 * (project `or_f224232d…`, brand `kw_87af5194…`), both pulled 2026-08-31 via
 * Executor. Absolute traffic counts are never published — house policy allows
 * percentages, multipliers, positions and CTR only.
 */

export type EngineId = 'chatgpt' | 'perplexity' | 'googleAio';

export interface Engine {
  id: EngineId;
  modelId: string;
  label: string;
}

export const ENGINES: Engine[] = [
  { id: 'chatgpt', modelId: 'chatgpt-scraper', label: 'ChatGPT' },
  { id: 'perplexity', modelId: 'perplexity-scraper', label: 'Perplexity' },
  { id: 'googleAio', modelId: 'google-ai-overview-scraper', label: 'Google AI Overviews' },
];

/* ── 1. The published headline claims ─────────────────────────────────── */

export const claims = {
  /** result-1 on the Sanity document. Weekly, Sep 2025 → Aug 2026. */
  clicksMultiple: '7.2x',
  clicksBasis: 'Google clicks per week, Sep 2025 → Aug 2026',
  /** From the page title. December baseline, monthly — verified 11.7x. */
  impressionsMultiple: '11.7x',
  impressionsBasis: 'Google impressions, Dec 2025 → Jul 2026',
  /** result-3. Peec AI. */
  citedPosition: 1.8,
  citedPositionBasis: 'on "top momentum trading communities"',
};

/* ── 2. Google Search Console, indexed to December 2025 = 100 ─────────── */
/**
 * Monthly. December is the baseline because the page is. August is a PARTIAL
 * month (1–24 Aug) and is flagged, so the dip does not read as a decline.
 */
export const gscMonthly = [
  { month: 'Sep', impressions: 41, clicks: 78, partial: false },
  { month: 'Oct', impressions: 44, clicks: 75, partial: false },
  { month: 'Nov', impressions: 68, clicks: 62, partial: false },
  { month: 'Dec', impressions: 100, clicks: 100, partial: false },
  { month: 'Jan', impressions: 280, clicks: 161, partial: false },
  { month: 'Feb', impressions: 339, clicks: 150, partial: false },
  { month: 'Mar', impressions: 577, clicks: 163, partial: false },
  { month: 'Apr', impressions: 479, clicks: 163, partial: false },
  { month: 'May', impressions: 620, clicks: 172, partial: false },
  { month: 'Jun', impressions: 1142, clicks: 379, partial: false },
  { month: 'Jul', impressions: 1174, clicks: 332, partial: false },
  { month: 'Aug', impressions: 1029, clicks: 343, partial: true },
];

/** Average Google position over the same window. Lower is better. */
export const googlePosition = { from: 19.4, to: 10.8 };

/* ── 3. The claim the case study leads its AI story with ──────────────── */
/**
 * dimensions:["topic_id","week"] filtered to the "Trading communities" topic —
 * the exact thing result-2 measures. 6 Jul = 8.80% matches the published figure
 * exactly; the last week measures 33.33% against a published 34.4%.
 */
export const tradingCommunitiesWeekly = [
  { week: '2026-07-06', visibility: 0.088, position: 1.1 },
  { week: '2026-07-13', visibility: 0.1322, position: 1.9 },
  { week: '2026-07-20', visibility: 0.1129, position: 2.8 },
  { week: '2026-07-27', visibility: 0.1, position: 1.6 },
  { week: '2026-08-03', visibility: 0.216, position: 2.4 },
  { week: '2026-08-10', visibility: 0.224, position: 2.8 },
  { week: '2026-08-17', visibility: 0.232, position: 3.1 },
  { week: '2026-08-24', visibility: 0.3333, position: 3.0 },
];

/**
 * The published result-2 says 34.4%; this pull of the same window and topic
 * measures 33.33%. Within rounding of a partial final week, but the two should
 * be made to agree before the page ships with a chart beside the claim.
 */
export const tradingCommunitiesNote = {
  published: '34.4%',
  measured: '33.3%',
};

/* ── 4. Where the AI citations come from ──────────────────────────────── */
/** dimensions:["model_id"], 6 Jul → 24 Aug 2026. Shares of total mentions. */
export const byEngine = [
  { engine: 'googleAio' as EngineId, label: 'Google AI Overviews', visibility: 0.0731, mentions: 572 },
  { engine: 'perplexity' as EngineId, label: 'Perplexity', visibility: 0.0721, mentions: 416 },
  { engine: 'chatgpt' as EngineId, label: 'ChatGPT', visibility: 0.0455, mentions: 439 },
];

/* ── 4b. Before and after, per engine ─────────────────────────────────── */
/**
 * dimensions:["month","model_id"], monthly visibility per engine.
 *
 * This replaced a "share of the category leader" cell. That cell was a static
 * number — TradeMomentum at 7.3% of the leader — and a static number invites
 * exactly the wrong question on a case study: "so what did the agency do?"
 * (Arnel, 2026-08-31). A case study has to show CHANGE.
 *
 * May is the reference month rather than March: March and April predate the
 * content work landing, and May is the flat floor the engagement started from.
 * August is the latest month. Both are real monthly figures, not endpoints
 * picked for effect — every month in between is listed under `engineMonthly`
 * so the shape can be checked.
 */
export const engineBeforeAfter = [
  { engine: 'chatgpt' as EngineId, label: 'ChatGPT', before: 0.0142, after: 0.0998 },
  { engine: 'perplexity' as EngineId, label: 'Perplexity', before: 0.0297, after: 0.1357 },
  { engine: 'googleAio' as EngineId, label: 'Google AI Overviews', before: 0.0573, after: 0.1153 },
];

export const engineBeforeAfterWindow = { before: 'May 2026', after: 'Aug 2026' };

/** Every month, so the two-point comparison above can be sanity-checked. */
export const engineMonthly = [
  { month: 'Mar', chatgpt: 0.0204, perplexity: 0.0587, googleAio: 0.0906 },
  { month: 'Apr', chatgpt: 0.0142, perplexity: 0.0349, googleAio: 0.0562 },
  { month: 'May', chatgpt: 0.0142, perplexity: 0.0297, googleAio: 0.0573 },
  { month: 'Jun', chatgpt: 0.0204, perplexity: 0.0298, googleAio: 0.0802 },
  { month: 'Jul', chatgpt: 0.0221, perplexity: 0.041, googleAio: 0.056 },
  { month: 'Aug', chatgpt: 0.0998, perplexity: 0.1357, googleAio: 0.1153 },
];

/* ── 4c. The category leader in each engine ───────────────────────────── */
/**
 * dimensions:["model_id"], unfiltered, 6 Jul → 24 Aug 2026 — the strongest
 * brand in each engine, and where TradeMomentum sits against it.
 *
 * This exists to give the per-engine figures a REAL ceiling. They were drawn
 * as gauges scaled to TradeMomentum's own best engine, which meant Google read
 * as a completely full dial at 7.3% — the shape claimed saturation the data
 * never supported. A gauge needs a meaningful maximum; the category leader is
 * one, an arbitrary self-referential max is not.
 *
 * It is not a flattering picture (6th and 7th of 12), and that is the point:
 * the honest frame for a challenger is the size of the gap, which is also the
 * size of the opportunity.
 */
export const engineLeaders = [
  { engine: 'googleAio' as EngineId, leader: 'Warrior Trading', leaderVisibility: 0.5402, rank: 6, of: 12 },
  { engine: 'perplexity' as EngineId, leader: 'bearbulltraders', leaderVisibility: 0.3587, rank: 7, of: 12 },
  { engine: 'chatgpt' as EngineId, leader: 'bearbulltraders', leaderVisibility: 0.3394, rank: 7, of: 12 },
];

/* ── 4d. Mean cited position over time ────────────────────────────────── */
/**
 * dimensions:["week"], 11 May → 24 Aug 2026. The average place TradeMomentum
 * takes inside the AI answers that cite it. LOWER IS BETTER — 1.0 would mean
 * always named first.
 *
 * This replaced a static "1.8" figure and the engine ring. Both were snapshots:
 * they said where the brand stands, never what changed, which on a case study
 * invites "so what did the agency do?" (Arnel, 2026-08-31). 3.9 to 1.9 over the
 * engagement is the same fact told as a movement.
 */
export const positionWeekly = [
  { week: '2026-05-11', position: 3.9 },
  { week: '2026-05-18', position: 3.1 },
  { week: '2026-05-25', position: 2.8 },
  { week: '2026-06-01', position: 2.4 },
  { week: '2026-06-08', position: 2.5 },
  { week: '2026-06-15', position: 2.4 },
  { week: '2026-06-22', position: 2.4 },
  { week: '2026-06-29', position: 2.9 },
  { week: '2026-07-06', position: 2.6 },
  { week: '2026-07-13', position: 2.7 },
  { week: '2026-07-20', position: 2.5 },
  { week: '2026-07-27', position: 1.6 },
  { week: '2026-08-03', position: 1.9 },
  { week: '2026-08-10', position: 2.0 },
  { week: '2026-08-17', position: 2.1 },
  { week: '2026-08-24', position: 1.9 },
];

export const positionChange = { from: 3.9, to: 1.9 };

/* ── 5. The prompts the product actually competes for ─────────────────── */
/**
 * August 2026, per prompt. These are the three the published page already
 * charts, plus their real cited position — the page shows visibility only.
 */
export const productPrompts = [
  { prompt: 'Top momentum trading communities', visibility: 0.6901, position: 1.8 },
  { prompt: 'Best 60-day trading bootcamp', visibility: 0.6761, position: 1.9 },
  { prompt: 'Best trading rooms for beginners', visibility: 0.6056, position: 1.4 },
  { prompt: 'Best day trading chat rooms', visibility: 0.375, position: 2.7 },
];

/**
 * Coverage of the 41 non-branded buyer prompts. TradeMomentum's own two
 * brand-name prompts ("is TradeMomentum legit", "TradeMomentum reviews") sit
 * near 99% and are excluded — being visible on your own name is table stakes.
 */
export const promptCoverage = { total: 41, cited: 18, owned: 4 };

export const AI_SOURCE = 'Peec AI · 6 Jul – 24 Aug 2026';
export const GSC_SOURCE = 'Google Search Console · indexed to Dec 2025 = 100';
