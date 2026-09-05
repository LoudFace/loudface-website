import 'server-only';
import { createClient } from 'next-sanity';
import type { PortableTextBlock } from '@portabletext/types';

/**
 * The PRIVATE proposals dataset — server only.
 *
 * The marketing dataset (`production`) is public: anyone with the project ID
 * can read every document in it. Proposal pricing must never live there, so
 * proposals sit in a separate dataset with `aclMode: private`, readable only
 * with a token.
 *
 * `import 'server-only'` at the top is the guard: importing this module from
 * anything that ships to the browser is a build error, not a leak.
 *
 * Env:
 *   SANITY_PROPOSALS_TOKEN    read token for the private dataset (required)
 *   SANITY_PROPOSALS_DATASET  dataset name (defaults to `proposals`)
 */

const API_VERSION = '2025-03-29';

let cached: ReturnType<typeof createClient> | null = null;

function getProposalsClient() {
  if (cached) return cached;

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_PROPOSALS_TOKEN;
  const dataset = process.env.SANITY_PROPOSALS_DATASET || 'proposals';

  if (!projectId || !token) return null;

  cached = createClient({
    projectId,
    dataset,
    apiVersion: API_VERSION,
    // The CDN caches by dataset+query and we are reading gated content on a
    // per-request basis. Always go to the Content Lake.
    useCdn: false,
    perspective: 'published',
    token,
    stega: false,
  });

  return cached;
}

/* ── Shapes ───────────────────────────────────────────────────────────── */

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'expired';

/** Everything the gate needs, and NOTHING a reader would want to see. */
export interface ProposalGate {
  token: string;
  accessCode: string;
  validUntil: string;
  status: ProposalStatus;
}

export interface ProposalTier {
  _key: string;
  name: string;
  price: string;
  cadence?: string;
  description?: string;
  recommended?: boolean;
}

export interface ProposalBullet {
  _key: string;
  lead?: string;
  text: string;
}

export interface ProposalTimelineItem {
  _key: string;
  label: string;
  body: string;
  kind?: 'execution';
}

export interface ProposalEngagementExample {
  label?: string;
  goal: string;
  workstreams: Array<{ _key: string; label: string; body: string }>;
  outcome: string;
  returnLabel?: string;
}

export interface ProposalTableRow {
  _key: string;
  cells: string[];
}

export type ProofTone = 'light' | 'dark';

export type ReviewPlatformName = 'clutch' | 'google' | 'trustpilot';

export interface ProposalMetric {
  _key: string;
  value: string;
  label: string;
  source?: string;
}

export interface ProposalVideoTestimonial {
  _key: string;
  quote: string;
  name?: string;
  role?: string;
  company?: string;
  videoUrl?: string;
  posterUrl?: string;
  orientation?: 'landscape' | 'portrait';
  duration?: string;
}

export interface ProposalReviewPlatform {
  _key: string;
  platform: ReviewPlatformName;
  rating: number;
  reviewCount: number;
  note?: string;
  url: string;
}

export interface ProposalReview {
  _key: string;
  title?: string;
  body: string;
  author?: string;
  company?: string;
  platform?: ReviewPlatformName;
  date?: string;
}

export interface ProposalSlider {
  min: number;
  max: number;
  step?: number;
  value: number;
  note?: string;
}

export interface ProposalForecastAssumptions {
  aiQuestionsPerMonth: number;
  aiClickRate: number;
  googleCtr: number;
  ramp?: number[];
}

export interface ProposalRailMetric {
  _key: string;
  value: string;
  label: string;
  source?: string;
}

export type ProposalSection =
  | { _key: string; _type: 'richTextSection'; heading?: string; body: PortableTextBlock[] }
  | {
      _key: string;
      _type: 'tableSection';
      heading?: string;
      columns?: string[];
      rows: ProposalTableRow[];
      note?: string;
    }
  | {
      _key: string;
      _type: 'pricingTiersSection';
      heading?: string;
      tiers: ProposalTier[];
      anchor?: string;
      note?: string;
    }
  | {
      _key: string;
      _type: 'timelineSection';
      heading?: string;
      intro?: string;
      variant?: 'engagementLoop';
      gateLabel?: string;
      gate?: { body?: string; items?: string[] };
      showWeek?: boolean;
      illustrativeExample?: ProposalEngagementExample;
      items: ProposalTimelineItem[];
    }
  | {
      _key: string;
      _type: 'bulletListSection';
      heading?: string;
      intro?: string;
      variant?: 'workingTogether';
      items: ProposalBullet[];
    }
  | {
      _key: string;
      _type: 'caseProofSection';
      heading?: string;
      intro?: string;
      slugs: string[];
      chartsPerCase?: number;
    }
  | {
      _key: string;
      _type: 'metricsSection';
      heading?: string;
      tone?: ProofTone;
      intro?: string;
      metrics: ProposalMetric[];
    }
  | {
      _key: string;
      _type: 'askAiSection';
      heading?: string;
      intro?: string;
      questions: Array<{ _key: string; question: string; short?: string; vendors: Array<{ _key: string; name: string; share: number }> }>;
      source?: string;
    }
  | {
      _key: string;
      _type: 'standingSection';
      heading?: string;
      stats?: Array<{ _key: string; value: string; label: string; lead?: boolean }>;
      gapHeading?: string;
      gap?: Array<{ _key: string; pageType: string; citations: number; coverage?: string; tone?: 'gap' | 'asset' }>;
      closing?: string;
      source?: string;
    }
  | {
      _key: string;
      _type: 'forecastSection';
      heading?: string;
      intro?: string;
      shareOfVoice: ProposalSlider;
      impressions: ProposalSlider;
      conversion: ProposalSlider;
      assumptions: ProposalForecastAssumptions;
      todayLine?: string;
      note?: string;
    }
  | {
      _key: string;
      _type: 'tracksSection';
      heading?: string;
      intro?: string;
      tracks?: Array<{ _key: string; label: string; items?: Array<{ _key: string; count?: string; text: string }> }>;
      targetsLabel?: string;
      targets?: string[];
    }
  | {
      _key: string;
      _type: 'gateSection';
      heading?: string;
      body: string;
      items?: string[];
    }
  | {
      _key: string;
      _type: 'monthsSection';
      heading?: string;
      intro?: string;
      months?: Array<{ _key: string; label: string; title: string; items?: string[]; proves?: string }>;
      measuresLabel?: string;
      measures?: Array<{ _key: string; label: string; note?: string }>;
      note?: string;
    };

export interface ProposalRailClip {
  _key: string;
  videoUrl?: string;
  posterUrl?: string;
  label?: string;
  orientation?: 'landscape' | 'portrait';
  name?: string;
  duration?: string;
}

export interface ProposalRailQuote {
  _key: string;
  text: string;
  author?: string;
  company?: string;
  platform?: ReviewPlatformName;
}

export interface ProposalClipStrip {
  heading?: string;
  clips?: ProposalRailClip[];
}

export interface ProposalProofRail {
  heading?: string;
  platforms?: ProposalReviewPlatform[];
  metrics?: ProposalRailMetric[];
  quotesHeading?: string;
  quotes?: ProposalRailQuote[];
}

export interface Proposal {
  title: string;
  clientName: string;
  preparedFor?: string[];
  token: string;
  validUntil: string;
  status: ProposalStatus;
  heroSummary?: PortableTextBlock[];
  heroQuote?: string;
  heroQuoteBy?: string;
  priceLine?: string;
  clipStrip?: ProposalClipStrip;
  proofRail?: ProposalProofRail;
  sections?: ProposalSection[];
  contactEmail?: string;
}

/* ── Queries ──────────────────────────────────────────────────────────── */

/**
 * Deliberately minimal. This is the ONLY query that runs before the access
 * code is accepted, and it returns no readable content — no client name, no
 * price, no sections. Nothing here can end up in the locked page's HTML.
 */
const GATE_QUERY = `*[_type == "proposal" && token == $token][0]{
  token, accessCode, validUntil, status
}`;

/** Runs only after the cookie has been verified. */
const CONTENT_QUERY = `*[_type == "proposal" && token == $token][0]{
  title, clientName, preparedFor, token, validUntil, status,
  heroSummary, heroQuote, heroQuoteBy, priceLine, contactEmail,
  clipStrip{ heading, clips[]{ _key, videoUrl, posterUrl, label, orientation, name, duration } },
  proofRail{
    heading, quotesHeading,
    platforms[]{ _key, platform, rating, reviewCount, note, url },
    metrics[]{ _key, value, label, source },
    quotes[]{ _key, text, author, company, platform }
  },
  sections[]{
    ...,
    rows[]{ _key, cells },
    tiers[]{ _key, name, price, cadence, description, recommended },
    items[]{ _key, label, body, lead, text, kind },
    illustrativeExample{
      label, goal, outcome, returnLabel,
      workstreams[]{ _key, label, body }
    },
    metrics[]{ _key, value, label, source },
    slugs,
    questions[]{ _key, question, short, vendors[]{ _key, name, share } },
    stats[]{ _key, value, label, lead },
    gap[]{ _key, pageType, citations, coverage, tone },
    shareOfVoice, impressions, conversion, assumptions,
    tracks[]{ _key, label, items[]{ _key, count, text } },
    gate,
    showWeek,
    targets,
    months[]{ _key, label, title, items, proves },
    measures[]{ _key, label, note }
  }
}`;

async function query<T>(groq: string, token: string): Promise<T | null> {
  const client = getProposalsClient();
  if (!client) {
    console.error(
      '[proposals] SANITY_PROPOSALS_TOKEN or NEXT_PUBLIC_SANITY_PROJECT_ID is not set — every /p/ URL will 404.'
    );
    return null;
  }

  const params: Record<string, unknown> = { token };
  try {
    return ((await client.fetch(groq, params)) as T) ?? null;
  } catch (error) {
    console.error('[proposals] Content Lake read failed:', error);
    return null;
  }
}

/** Access facts only. Safe to call before the gate is passed. */
export function fetchProposalGate(token: string): Promise<ProposalGate | null> {
  return query<ProposalGate>(GATE_QUERY, token);
}

/** The readable proposal. NEVER call this before verifying the access cookie. */
export function fetchProposalContent(token: string): Promise<Proposal | null> {
  return query<Proposal>(CONTENT_QUERY, token);
}
