/**
 * Real AI-search data for the TradeMomentum case study instruments.
 *
 * Pulled from Peec AI on 2026-08-31, project "Trademomentum"
 * (`or_f224232d-bf13-430b-81a4-93ef355237b2`), brand `kw_87af5194…`, via the
 * Executor `peec_mcp` connection. Nothing here is illustrative.
 *
 * WHAT IS DELIBERATELY ABSENT, and why:
 * - No absolute traffic counts. The house public-numbers policy allows
 *   percentages, multipliers, positions and CTR on a public case study, never
 *   raw session or click totals.
 * - No competitor ranking chart. TradeMomentum sits 6th of 12 tracked brands
 *   on raw visibility; the honest strong story here is the CLIMB and the
 *   POSITION, so those are what the instruments show. Picking the flattering
 *   cut of a real dataset is still spin — this omits the weak metric rather
 *   than restating it as something it isn't.
 */

export type EngineId = 'chatgpt' | 'perplexity' | 'googleAio';

export interface Engine {
  id: EngineId;
  modelId: string;
  label: string;
}

/** The three engines Peec tracks on this project. */
export const ENGINES: Engine[] = [
  { id: 'chatgpt', modelId: 'chatgpt-scraper', label: 'ChatGPT' },
  { id: 'perplexity', modelId: 'perplexity-scraper', label: 'Perplexity' },
  { id: 'googleAio', modelId: 'google-ai-overview-scraper', label: 'Google AI Overviews' },
];

/**
 * dimensions:["week"], 2026-07-06 → 2026-08-24.
 * `visibility` = share of tracked AI answers in the category that name
 * TradeMomentum. `position` = mean rank inside the answers that cite them.
 */
export const weeklyVisibility = [
  { week: '2026-07-06', visibility: 0.0433, position: 2.6 },
  { week: '2026-07-13', visibility: 0.0478, position: 2.7 },
  { week: '2026-07-20', visibility: 0.0302, position: 2.5 },
  { week: '2026-07-27', visibility: 0.0478, position: 1.6 },
  { week: '2026-08-03', visibility: 0.1136, position: 1.9 },
  { week: '2026-08-10', visibility: 0.1209, position: 2.0 },
  { week: '2026-08-17', visibility: 0.1178, position: 2.1 },
  { week: '2026-08-24', visibility: 0.1406, position: 1.9 },
];

/** dimensions:["model_id"], same window. One row per engine. */
export const byEngine = [
  { engine: 'googleAio' as EngineId, label: 'Google AI Overviews', visibility: 0.0731, position: 2.0, mentions: 572 },
  { engine: 'perplexity' as EngineId, label: 'Perplexity', visibility: 0.0721, position: 2.0, mentions: 416 },
  { engine: 'chatgpt' as EngineId, label: 'ChatGPT', visibility: 0.0455, position: 2.8, mentions: 439 },
];

/** Headline figures, all derived from the two series above. */
export const headline = {
  /** Latest complete week. */
  currentVisibility: 0.1406,
  /** First week of the tracked window. */
  startVisibility: 0.0433,
  /** 0.1406 / 0.0433, rounded to one decimal. */
  multiple: 3.2,
  /** Mean rank across the window's cited answers. */
  meanPosition: 1.9,
  weeks: 7,
};

export const SOURCE_NOTE = 'Peec AI · 2026-08-31 · weekly, 6 Jul to 24 Aug 2026';

/* ── Daily per engine, last 30 days ───────────────────────────────────── */
/** dimensions:["date","model_id"], 2026-07-26 → 2026-08-24. Values are shares. */
export const dailyByEngine = [
  { date: '2026-07-26', googleAio: 0.0349, chatgpt: 0.0235, perplexity: 0.0111 },
  { date: '2026-07-27', googleAio: 0.0682, chatgpt: 0.0115, perplexity: 0.0111 },
  { date: '2026-07-28', googleAio: 0.046, chatgpt: 0.0222, perplexity: 0.0111 },
  { date: '2026-07-29', googleAio: 0.0233, chatgpt: 0.0222, perplexity: 0.0222 },
  { date: '2026-07-30', googleAio: 0.0449, chatgpt: 0.0111, perplexity: 0.0111 },
  { date: '2026-07-31', googleAio: 0.0826, chatgpt: 0.0702, perplexity: 0.0893 },
  { date: '2026-08-01', googleAio: 0.119, chatgpt: 0.0698, perplexity: 0.093 },
  { date: '2026-08-02', googleAio: 0.125, chatgpt: 0.093, perplexity: 0.0976 },
  { date: '2026-08-03', googleAio: 0.0732, chatgpt: 0.0698, perplexity: 0.1628 },
  { date: '2026-08-04', googleAio: 0.0952, chatgpt: 0.0698, perplexity: 0.1163 },
  { date: '2026-08-05', googleAio: 0.1429, chatgpt: 0.1163, perplexity: 0.1163 },
  { date: '2026-08-06', googleAio: 0.1026, chatgpt: 0.1395, perplexity: 0.1628 },
  { date: '2026-08-07', googleAio: 0.1429, chatgpt: 0.093, perplexity: 0.1395 },
  { date: '2026-08-08', googleAio: 0.0976, chatgpt: 0.093, perplexity: 0.1395 },
  { date: '2026-08-09', googleAio: 0.1, chatgpt: 0.0698, perplexity: 0.1395 },
  { date: '2026-08-10', googleAio: 0.0976, chatgpt: 0.093, perplexity: 0.122 },
  { date: '2026-08-11', googleAio: 0.1163, chatgpt: 0.0698, perplexity: 0.1628 },
  { date: '2026-08-12', googleAio: 0.1628, chatgpt: 0.0698, perplexity: 0.1429 },
  { date: '2026-08-13', googleAio: 0.122, chatgpt: 0.0465, perplexity: 0.1628 },
  { date: '2026-08-14', googleAio: 0.1667, chatgpt: 0.0698, perplexity: 0.1628 },
  { date: '2026-08-15', googleAio: 0.093, chatgpt: 0.1628, perplexity: 0.1163 },
  { date: '2026-08-16', googleAio: 0.122, chatgpt: 0.1163, perplexity: 0.1628 },
  { date: '2026-08-17', googleAio: 0.122, chatgpt: 0.1163, perplexity: 0.1395 },
  { date: '2026-08-18', googleAio: 0.093, chatgpt: 0.1628, perplexity: 0.1163 },
  { date: '2026-08-19', googleAio: 0.0976, chatgpt: 0.1395, perplexity: 0.0952 },
  { date: '2026-08-20', googleAio: 0.119, chatgpt: 0.0698, perplexity: 0.1463 },
  { date: '2026-08-21', googleAio: 0.075, chatgpt: 0.1163, perplexity: 0.1395 },
  { date: '2026-08-22', googleAio: 0.093, chatgpt: 0.093, perplexity: 0.1395 },
  { date: '2026-08-23', googleAio: 0.119, chatgpt: 0.1395, perplexity: 0.1395 },
  { date: '2026-08-24', googleAio: 0.1667, chatgpt: 0.1163, perplexity: 0.1395 },
];

/* ── Prompt coverage funnel ───────────────────────────────────────────── */
/**
 * dimensions:["prompt_id"], August 2026. Peec tracks 43 prompts on this
 * project; TWO of them ("is TradeMomentum legit", "TradeMomentum reviews") are
 * BRANDED — being visible on your own name is table stakes, not a result, and
 * both sit near 99%. Including them would inflate every stage, so the funnel
 * counts the 41 NON-BRANDED buyer prompts only. That exclusion is the whole
 * reason this reads as a real number rather than a flattering one.
 */
export const promptFunnel = [
  { label: 'Non-branded buyer prompts tracked', value: 41 },
  { label: 'Prompts where AI names TradeMomentum', value: 18 },
  { label: 'Prompts where it holds 30%+ of answers', value: 4 },
];

/** The four prompts TradeMomentum genuinely owns, with its rank on each. */
export const ownedPrompts = [
  { prompt: 'Top momentum trading communities', visibility: 0.6901, position: 1.8 },
  { prompt: 'Best 60-day trading bootcamp', visibility: 0.6761, position: 1.9 },
  { prompt: 'Best trading rooms for beginners', visibility: 0.6056, position: 1.4 },
  { prompt: 'Best day trading chat rooms', visibility: 0.375, position: 2.7 },
];

/* ── Google Search Console ────────────────────────────────────────────── */
/**
 * Pulled from Search Console on 2026-08-31, property
 * `sc-domain:trademomentum.org`, via the Executor `google_search_console`
 * connection. Daily rows rolled into months.
 *
 * INDEXED, NOT ABSOLUTE. The house public-numbers policy forbids exact traffic
 * counts on a public case study, so clicks and impressions are published as an
 * index against September 2025 = 100. The multipliers below are computed from
 * the real totals before indexing, so they are exact.
 *
 * August 2026 is a PARTIAL month (1–24 Aug) and is marked as such — leaving it
 * unlabelled would read as a decline that did not happen.
 */
export const gscMonthly = [
  { month: 'Sep', clicks: 100, impressions: 100, position: 19.4, partial: false },
  { month: 'Oct', clicks: 96, impressions: 106, position: 11.5, partial: false },
  { month: 'Nov', clicks: 79, impressions: 163, position: 11.2, partial: false },
  { month: 'Dec', clicks: 128, impressions: 241, position: 18.3, partial: false },
  { month: 'Jan', clicks: 206, impressions: 676, position: 12.3, partial: false },
  { month: 'Feb', clicks: 192, impressions: 819, position: 9.9, partial: false },
  { month: 'Mar', clicks: 208, impressions: 1392, position: 8.0, partial: false },
  { month: 'Apr', clicks: 208, impressions: 1157, position: 8.4, partial: false },
  { month: 'May', clicks: 220, impressions: 1497, position: 9.2, partial: false },
  { month: 'Jun', clicks: 486, impressions: 2754, position: 9.9, partial: false },
  { month: 'Jul', clicks: 425, impressions: 2833, position: 9.7, partial: false },
  { month: 'Aug', clicks: 440, impressions: 2482, position: 10.8, partial: true },
];

/** Computed from the real monthly totals, Sep 2025 vs Aug 2026. */
export const gscHeadline = {
  clicksMultiple: 4.4,
  impressionsMultiple: 24.8,
  positionFrom: 19.4,
  positionTo: 10.8,
  window: 'Sep 2025 → Aug 2026',
};

/**
 * Share of clicks among the ten strongest pages, Jun–Aug 2026. Shares, not
 * counts — same policy reason as above.
 *
 * NO LONGER CHARTED. The "Where the Google clicks land" cell was dropped on
 * 2026-08-31 so the Google board clears two thirds of a short laptop viewport.
 * The data is kept because `alsoCitedByAI` still feeds the overlap line on the
 * board — and because the chart may come back if the board earns more room.
 *
 * `alsoCitedByAI` marks a page that ALSO appears in TradeMomentum's owned AI
 * prompts. That overlap is the whole argument for showing these two boards
 * together: the same asset earns in Google and in the AI answer.
 */
export const gscTopPages = [
  // The homepage takes 63.3% of the top-ten clicks. It is EXCLUDED from the
  // chart: at that size every content page collapses into an unreadable stub,
  // and homepage clicks are mostly brand and direct search rather than
  // anything the content work earned. The share figure stays here, and the
  // caption states the exclusion — hiding it silently would overstate the
  // content pages.
  { page: 'Homepage', share: 63.3, position: 8.8, alsoCitedByAI: false, excludeFromChart: true },
  { page: 'Pricing', share: 7.8, position: 5.6, alsoCitedByAI: false },
  { page: 'Best communities', share: 6.3, position: 9.5, alsoCitedByAI: true },
  { page: 'Setup checklist', share: 4.1, position: 7.9, alsoCitedByAI: false },
  { page: 'Testimonials', share: 4.1, position: 4.5, alsoCitedByAI: false },
  { page: 'Best chatrooms', share: 4.0, position: 9.1, alsoCitedByAI: true },
  { page: '5-minute chart', share: 3.4, position: 6.0, alsoCitedByAI: false },
  { page: 'Chatroom page', share: 2.6, position: 10.4, alsoCitedByAI: true },
  { page: '60-day bootcamp', share: 2.2, position: 8.3, alsoCitedByAI: true },
  { page: 'Small-cap guide', share: 2.1, position: 10.3, alsoCitedByAI: false },
];

export const GSC_SOURCE_NOTE = 'Google Search Console · pulled 2026-08-31 · indexed to Sep 2025 = 100';
