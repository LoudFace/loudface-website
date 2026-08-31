/**
 * Real AI-search data behind the case-study chart gallery.
 *
 * EVERY number in this file was pulled from Peec AI on 2026-08-31 for the
 * LoudFace project (`or_85a7fe4b…`), via the Executor `peec_mcp` connection.
 * Nothing here is illustrative, indexed, or invented — if a series could not be
 * sourced, the chart that needed it was cut rather than filled.
 *
 * Peec's `get_brand_report` was queried with these dimensions:
 *   ["week"]                  -> weeklyVisibility
 *   ["month","model_id"]      -> monthlyByEngine
 *   ["date","model_id"]       -> dailyByEngine
 *   ["prompt_id"]             -> promptPerformance
 *   ["prompt_id","week"]      -> promptWeekMatrix
 *   ["topic_id","model_id"]   -> topicToEngine
 *   ["model_id"] (no filter)  -> competitorsByEngine
 *
 * `visibility` is the share of tracked AI answers that mention the brand.
 * `position` is the mean rank of the brand inside answers that cite it.
 * `visibilityTotal` is the number of AI answers tracked in that bucket.
 */

/* ── Engines ──────────────────────────────────────────────────────────── */

export type EngineId = 'chatgpt' | 'perplexity' | 'googleAio';

export interface Engine {
  id: EngineId;
  /** Peec's model_id, kept so a future automated refresh can map back. */
  modelId: string;
  label: string;
  shortLabel: string;
  color: string;
}

export const ENGINES: Engine[] = [
  { id: 'chatgpt', modelId: 'chatgpt-scraper', label: 'ChatGPT', shortLabel: 'ChatGPT', color: 'var(--chart-1)' },
  { id: 'perplexity', modelId: 'perplexity-scraper', label: 'Perplexity', shortLabel: 'Perplexity', color: 'var(--chart-2)' },
  { id: 'googleAio', modelId: 'google-ai-overview-scraper', label: 'Google AI Overviews', shortLabel: 'Google AIO', color: 'var(--chart-3)' },
];

/* ── 1. Weekly visibility, whole account ──────────────────────────────── */
/** dimensions:["week"], 2026-04-06 → 2026-08-24. `visibility` is a 0–1 share. */
export const weeklyVisibility = [
  { week: '2026-04-06', visibility: 0.0014, position: 4.0, answersTracked: 720 },
  { week: '2026-04-13', visibility: 0.0, position: null, answersTracked: 713 },
  { week: '2026-04-20', visibility: 0.0012, position: null, answersTracked: 850 },
  { week: '2026-04-27', visibility: 0.006, position: 2.2, answersTracked: 829 },
  { week: '2026-05-04', visibility: 0.0082, position: 1.4, answersTracked: 853 },
  { week: '2026-05-11', visibility: 0.0101, position: 4.3, answersTracked: 888 },
  { week: '2026-05-18', visibility: 0.032, position: 4.2, answersTracked: 813 },
  { week: '2026-05-25', visibility: 0.0724, position: 3.6, answersTracked: 1629 },
  { week: '2026-06-01', visibility: 0.1004, position: 3.2, answersTracked: 1563 },
  { week: '2026-06-08', visibility: 0.0921, position: 2.8, answersTracked: 1879 },
  { week: '2026-06-15', visibility: 0.1154, position: 2.8, answersTracked: 1872 },
  { week: '2026-06-22', visibility: 0.0749, position: 2.8, answersTracked: 1869 },
  { week: '2026-06-29', visibility: 0.0637, position: 2.5, answersTracked: 1838 },
  { week: '2026-07-06', visibility: 0.0659, position: 2.5, answersTracked: 1852 },
  { week: '2026-07-13', visibility: 0.0649, position: 3.0, answersTracked: 1865 },
  { week: '2026-07-20', visibility: 0.0736, position: 2.5, answersTracked: 1861 },
  { week: '2026-07-27', visibility: 0.0884, position: 2.5, answersTracked: 1866 },
  { week: '2026-08-03', visibility: 0.1138, position: 2.5, answersTracked: 1863 },
  { week: '2026-08-10', visibility: 0.1364, position: 2.6, answersTracked: 1891 },
  { week: '2026-08-17', visibility: 0.1241, position: 3.1, answersTracked: 1854 },
];

/**
 * The plateau LoudFace has held since the start of August, taken straight from
 * the last three complete weeks above (10.86% floor is the partial 24 Aug week
 * and is excluded). Used as the reference band — it is measured, not a target.
 */
export const augustOperatingRange = { low: 0.1138, high: 0.1364 };

/* ── 2. Monthly visibility by engine ──────────────────────────────────── */
/** dimensions:["month","model_id"], 2026-04-01 → 2026-08-24. */
export const monthlyByEngine = [
  { month: 'Apr', chatgpt: 0, perplexity: 0.0011, googleAio: 0.0046, cChatgpt: 0, cPerplexity: 1, cGoogleAio: 4 },
  { month: 'May', chatgpt: 0.0321, perplexity: 0.0315, googleAio: 0.0439, cChatgpt: 50, cPerplexity: 49, cGoogleAio: 63 },
  { month: 'Jun', chatgpt: 0.0621, perplexity: 0.0979, googleAio: 0.1234, cChatgpt: 163, cPerplexity: 256, cGoogleAio: 305 },
  { month: 'Jul', chatgpt: 0.053, perplexity: 0.0739, googleAio: 0.0812, cChatgpt: 147, cPerplexity: 203, cGoogleAio: 219 },
  { month: 'Aug', chatgpt: 0.1543, perplexity: 0.1283, googleAio: 0.0826, cChatgpt: 336, cPerplexity: 276, cGoogleAio: 172 },
];

/** Answers citing LoudFace per month — the three engines summed. */
export const monthlyCitedAnswers = monthlyByEngine.map((m) => ({
  month: m.month,
  cited: m.cChatgpt + m.cPerplexity + m.cGoogleAio,
}));

/* ── 3. Daily visibility by engine, last 30 days ──────────────────────── */
/**
 * dimensions:["date","model_id"], 2026-07-26 → 2026-08-24.
 * `chatgptPosition` is the mean rank LoudFace held inside ChatGPT answers that
 * cited it that day — the second axis of the biaxial scatter.
 */
export const dailyByEngine = [
  { date: '2026-07-26', chatgpt: 0.0349, perplexity: 0.0889, googleAio: 0.1124 , chatgptPosition: 3 },
  { date: '2026-07-27', chatgpt: 0.0602, perplexity: 0.0778, googleAio: 0.1222 , chatgptPosition: 3.8 },
  { date: '2026-07-28', chatgpt: 0.0556, perplexity: 0.1, googleAio: 0.0795 , chatgptPosition: 2.6 },
  { date: '2026-07-29', chatgpt: 0.0333, perplexity: 0.0889, googleAio: 0.0899 , chatgptPosition: 4.7 },
  { date: '2026-07-30', chatgpt: 0.0778, perplexity: 0.1, googleAio: 0.1176 , chatgptPosition: 3 },
  { date: '2026-07-31', chatgpt: 0.0556, perplexity: 0.1034, googleAio: 0.0795 , chatgptPosition: 4.2 },
  { date: '2026-08-01', chatgpt: 0.1, perplexity: 0.1333, googleAio: 0.0889 , chatgptPosition: 4.2 },
  { date: '2026-08-02', chatgpt: 0.0444, perplexity: 0.1556, googleAio: 0.093 , chatgptPosition: 4.8 },
  { date: '2026-08-03', chatgpt: 0.1111, perplexity: 0.1461, googleAio: 0.0899 , chatgptPosition: 2.9 },
  { date: '2026-08-04', chatgpt: 0.0556, perplexity: 0.1222, googleAio: 0.0899 , chatgptPosition: 3 },
  { date: '2026-08-05', chatgpt: 0.1, perplexity: 0.1556, googleAio: 0.1136 , chatgptPosition: 3.9 },
  { date: '2026-08-06', chatgpt: 0.0667, perplexity: 0.1222, googleAio: 0.1279 , chatgptPosition: 4 },
  { date: '2026-08-07', chatgpt: 0.0778, perplexity: 0.1889, googleAio: 0.0941 , chatgptPosition: 3.7 },
  { date: '2026-08-08', chatgpt: 0.1111, perplexity: 0.1667, googleAio: 0.1084 , chatgptPosition: 1.6 },
  { date: '2026-08-09', chatgpt: 0.0889, perplexity: 0.1818, googleAio: 0.0698 , chatgptPosition: 1.8 },
  { date: '2026-08-10', chatgpt: 0.1, perplexity: 0.1573, googleAio: 0.1264 , chatgptPosition: 3.4 },
  { date: '2026-08-11', chatgpt: 0.1111, perplexity: 0.1744, googleAio: 0.0805 , chatgptPosition: 2.2 },
  { date: '2026-08-12', chatgpt: 0.1, perplexity: 0.125, googleAio: 0.1084 , chatgptPosition: 3.2 },
  { date: '2026-08-13', chatgpt: 0.1889, perplexity: 0.1977, googleAio: 0.1176 , chatgptPosition: 3.2 },
  { date: '2026-08-14', chatgpt: 0.2222, perplexity: 0.1058, googleAio: 0.0762 , chatgptPosition: 2.7 },
  { date: '2026-08-15', chatgpt: 0.2444, perplexity: 0.0778, googleAio: 0.075 , chatgptPosition: 2.6 },
  { date: '2026-08-16', chatgpt: 0.2778, perplexity: 0.1348, googleAio: 0.0476 , chatgptPosition: 2.8 },
  { date: '2026-08-17', chatgpt: 0.2111, perplexity: 0.0889, googleAio: 0.0976 , chatgptPosition: 2.8 },
  { date: '2026-08-18', chatgpt: 0.2, perplexity: 0.1333, googleAio: 0.0698 , chatgptPosition: 3.1 },
  { date: '2026-08-19', chatgpt: 0.2778, perplexity: 0.0698, googleAio: 0.0465 , chatgptPosition: 4 },
  { date: '2026-08-20', chatgpt: 0.2333, perplexity: 0.0778, googleAio: 0.0575 , chatgptPosition: 3.3 },
  { date: '2026-08-21', chatgpt: 0.1889, perplexity: 0.0889, googleAio: 0.0568 , chatgptPosition: 3.4 },
  { date: '2026-08-22', chatgpt: 0.1889, perplexity: 0.0889, googleAio: 0.0568 , chatgptPosition: 3.2 },
  { date: '2026-08-23', chatgpt: 0.2111, perplexity: 0.093, googleAio: 0.0471 , chatgptPosition: 3.2 },
  { date: '2026-08-24', chatgpt: 0.1778, perplexity: 0.1, googleAio: 0.046 , chatgptPosition: 2.4 },
];

/* ── 4. Mention split by engine, August ───────────────────────────────── */
/** Total mentions of LoudFace inside AI answers, August 2026. */
export const augustMentionsByEngine = [
  { engine: 'chatgpt' as EngineId, label: 'ChatGPT', mentions: 759 },
  { engine: 'perplexity' as EngineId, label: 'Perplexity', mentions: 429 },
  { engine: 'googleAio' as EngineId, label: 'Google AI Overviews', mentions: 314 },
];

/* ── 5. Prompt-level performance, August ──────────────────────────────── */
/**
 * dimensions:["prompt_id"], 2026-08-01 → 2026-08-24. One row per tracked buyer
 * prompt: how often LoudFace appears, and where in the answer it lands.
 * Only prompts LoudFace actually reached are listed; the 34 prompts still at
 * zero visibility are counted in `promptFunnel` but carry no position value.
 */
export const promptPerformance = [
  { prompt: 'Agency that combines SEO, AEO, and Webflow for B2B SaaS', visibility: 0.6667, position: 1.2, mentions: 89 },
  { prompt: 'Best AEO agency for B2B fintech payroll and payments companies', visibility: 0.6111, position: 1.6, mentions: 129 },
  { prompt: 'AEO agency for fintech infrastructure companies', visibility: 0.6111, position: 2.7, mentions: 73 },
  { prompt: 'Top AEO agency, fintech', visibility: 0.6056, position: 2.1, mentions: 114 },
  { prompt: 'AEO and SEO agency for B2B fintech infrastructure', visibility: 0.5469, position: 2.3, mentions: 62 },
  { prompt: 'SEO agency for developer tools and developer-first SaaS', visibility: 0.4583, position: 3.3, mentions: 50 },
  { prompt: 'Best agency for ChatGPT and Perplexity citations', visibility: 0.4571, position: 1.5, mentions: 63 },
  { prompt: 'Best B2B SaaS organic growth agency 2026', visibility: 0.4507, position: 2.6, mentions: 60 },
  { prompt: 'Best AEO agency for fintech companies', visibility: 0.4507, position: 3.2, mentions: 59 },
  { prompt: 'SEO agency for cybersecurity SaaS companies', visibility: 0.3889, position: 3.6, mentions: 37 },
  { prompt: 'Top organic growth agencies for SaaS brands', visibility: 0.3662, position: 2.9, mentions: 49 },
  { prompt: 'Best organic growth agency for Series B SaaS companies', visibility: 0.2958, position: 4.1, mentions: 32 },
  { prompt: 'AEO agency for B2B SaaS payments and money movement companies', visibility: 0.2676, position: 1.6, mentions: 48 },
  { prompt: 'Agency for SaaS organic revenue growth', visibility: 0.25, position: 3.7, mentions: 25 },
  { prompt: 'Who are the best B2B SaaS marketing agencies for organic growth', visibility: 0.2113, position: 3.2, mentions: 27 },
  { prompt: 'Webflow Enterprise Partner agencies for B2B SaaS companies', visibility: 0.2083, position: 4.0, mentions: 17 },
  { prompt: 'Agency to improve share of voice in AI answers for SaaS', visibility: 0.1857, position: 3.5, mentions: 17 },
  { prompt: 'Which agency is best for SaaS organic traffic growth', visibility: 0.1857, position: 1.9, mentions: 22 },
  { prompt: 'Best AEO and SEO agency for B2B tech companies', visibility: 0.1594, position: 3.0, mentions: 32 },
  { prompt: 'SEO agency for fintech companies', visibility: 0.1571, position: 3.8, mentions: 18 },
  { prompt: 'Best CRO agency for SaaS websites', visibility: 0.1528, position: 5.2, mentions: 19 },
  { prompt: 'Hire AEO agency for B2B SaaS', visibility: 0.1408, position: 2.1, mentions: 20 },
  { prompt: 'Best Webflow agency for high-converting SaaS websites', visibility: 0.1408, position: 2.8, mentions: 19 },
  { prompt: 'CRO and UX agency for B2B SaaS', visibility: 0.0986, position: 4.0, mentions: 8 },
  { prompt: 'Best B2B SaaS organic growth agency for AI search visibility', visibility: 0.0972, position: 2.7, mentions: 24 },
  { prompt: 'Best AEO agencies 2026', visibility: 0.0758, position: 8.4, mentions: 10 },
  { prompt: 'Webflow Premium Enterprise partner for SaaS brands', visibility: 0.0704, position: 1.3, mentions: 8 },
  { prompt: 'Best agency for getting mentioned in Perplexity and ChatGPT', visibility: 0.0704, position: 1.0, mentions: 7 },
  { prompt: 'SEO agency for HR tech SaaS companies', visibility: 0.0294, position: 9.0, mentions: 2 },
  { prompt: 'Best B2B SaaS SEO agencies compared', visibility: 0.0286, position: 9.0, mentions: 5 },
  { prompt: 'Top B2B SaaS SEO agencies in 2026', visibility: 0.0278, position: 9.5, mentions: 3 },
  { prompt: 'Top answer engine optimization agencies', visibility: 0.0139, position: 8.0, mentions: 2 },
];

/**
 * The three funnel stages, counted from the full 90-prompt August report.
 * 90 prompts tracked -> 56 where LoudFace appeared at least once -> 21 where
 * LoudFace held 20%+ of answers.
 */
export const promptFunnel = [
  { label: 'Buyer prompts tracked', value: 90 },
  { label: 'Prompts where AI cites LoudFace', value: 56 },
  { label: 'Prompts where we hold 20%+ of answers', value: 21 },
];

/* ── 6. Prompt × week visibility matrix ──────────────────────────────── */
/** dimensions:["prompt_id","week"], 2026-06-08 → 2026-08-24, top 10 prompts. */
export const matrixWeeks = [
  '2026-06-08', '2026-06-15', '2026-06-22', '2026-06-29', '2026-07-06', '2026-07-13',
  '2026-07-20', '2026-07-27', '2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24',
];

export const promptWeekMatrix = [
  { prompt: 'SEO + AEO + Webflow', values: [0.5, 0.381, 0.381, 0.5238, 0.7143, 0.4, 0.5714, 0.619, 0.7143, 0.6842, 0.6, 0.6667] },
  { prompt: 'Fintech payroll & payments', values: [0.45, 0.2381, 0.3333, 0.2381, 0.1429, 0.381, 0.4, 0.7143, 0.7619, 0.5714, 0.4762, 0.3333] },
  { prompt: 'AEO, fintech infra', values: [0.05, 0.1905, 0.1429, 0.1, 0.0476, 0.0476, 0.0476, 0.1905, 0.2381, 0.7619, 0.9048, 0.6667] },
  { prompt: 'Top AEO agency, fintech', values: [0.5, 0.4286, 0.35, 0.1429, 0.381, 0.381, 0.3, 0.2857, 0.4762, 0.7, 0.6667, 1] },
  { prompt: 'AEO + SEO, fintech infra', values: [0.1, 0.2381, 0.15, 0.2105, 0.3889, 0.3333, 0.1429, 0.5238, 0.45, 0.4737, 0.6875, 0.6667] },
  { prompt: 'Developer-first SaaS', values: [0, 0, 0, 0, 0, 0, 0, 0.0952, 0.2857, 0.619, 0.5238, 0.6667] },
  { prompt: 'B2B SaaS growth agency', values: [0.5714, 0.65, 0.381, 0.1905, 0.4, 0.2381, 0.3333, 0.25, 0.4762, 0.4286, 0.55, 0.3333] },
  { prompt: 'Best AEO agency, fintech', values: [0.3684, 0.5238, 0.1905, 0.0952, 0.1429, 0.1905, 0.1905, 0.0952, 0.35, 0.5714, 0.5238, 0.3333] },
  { prompt: 'ChatGPT & Perplexity', values: [0.55, 0.35, 0.2, 0.4, 0.0476, 0.3, 0.5238, 0.381, 0.45, 0.381, 0.5, 0.6667] },
  { prompt: 'Cybersecurity SaaS', values: [0, 0, 0, 0, 0, 0, 0.0476, 0.2857, 0.2857, 0.4286, 0.4762, 0.3333] },
];

/**
 * Six prompts, first tracked week against the latest — the same matrix rows,
 * read end to end. Powers the radar.
 */
export const radarPrompts = [
  { label: 'SEO + AEO + Webflow', june: 0.5, august: 0.6667 },
  { label: 'Fintech payroll', june: 0.45, august: 0.3333 },
  { label: 'Fintech infrastructure', june: 0.05, august: 0.6667 },
  { label: 'Top AEO fintech 2026', june: 0.5, august: 1.0 },
  { label: 'AEO + SEO fintech', june: 0.1, august: 0.6667 },
  { label: 'Developer-first SaaS', june: 0.0, august: 0.6667 },
];

/* ── 7. Topic → engine flows ──────────────────────────────────────────── */
/** dimensions:["topic_id","model_id"], August 2026. Values are mention counts. */
export const topicToEngine = [
  { topic: 'AEO / AI search for SaaS', chatgpt: 524, perplexity: 146, googleAio: 166 },
  { topic: 'B2B SaaS SEO agency', chatgpt: 199, perplexity: 210, googleAio: 140 },
  { topic: 'Webflow for SaaS', chatgpt: 5, perplexity: 39, googleAio: 3 },
  { topic: 'Competitor comparison', chatgpt: 11, perplexity: 24, googleAio: 5 },
  { topic: 'Converting AI & search traffic', chatgpt: 20, perplexity: 10, googleAio: 0 },
];

/* ── 8. Category standing ─────────────────────────────────────────────── */
/**
 * dimensions:["model_id"], unfiltered, 2026-06-01 → 2026-08-24. The tracked
 * agency set, per engine. Competitor names are the real tracked brands — this
 * is our own category report, not a client's, so naming them is ours to do.
 */
export const competitorsByEngine = [
  { brand: 'Omniscient', chatgpt: 0.3672, perplexity: 0.1653, googleAio: 0.2704 },
  { brand: 'Siege Media', chatgpt: 0.3126, perplexity: 0.1162, googleAio: 0.1625 },
  { brand: 'First Page Sage', chatgpt: 0.214, perplexity: 0.1453, googleAio: 0.2452 },
  { brand: 'Skale', chatgpt: 0.2274, perplexity: 0.0379, googleAio: 0.168 },
  { brand: 'Directive Consulting', chatgpt: 0.2224, perplexity: 0.0929, googleAio: 0.1974 },
  { brand: 'LoudFace', chatgpt: 0.0853, perplexity: 0.0978, googleAio: 0.096 },
];

/** Peak weekly visibility across the tracked window — the gauge's centre value. */
export const peakWeeklyVisibility = 0.1364;
/** Where that peak ranks us in the tracked agency set. */
export const categoryRank = { position: 8, outOf: 26 };
/** Mean rank inside answers that cite us, August. */
export const meanCitedPosition = 2.6;

export const SOURCE_NOTE = 'Peec AI · LoudFace project · pulled 2026-08-31';
