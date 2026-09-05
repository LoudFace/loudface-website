/**
 * Sanity CMS Type Definitions
 * Centralized TypeScript interfaces for CMS data
 */

/**
 * Image field structure from CMS
 * Shape: { url, alt } — used by all components that render CMS images
 */
export interface CmsImage {
  url: string;
  alt: string | null;
}


/**
 * Case Study CMS item
 */
export interface CaseStudy {
  id: string;
  slug: string;
  name: string;
  "project-title": string;
  "paragraph-summary"?: string;
  "main-body"?: string;
  "main-project-image-thumbnail"?: CmsImage;
  "client-logo"?: CmsImage;
  "client-logo-inversed"?: CmsImage;
  "client-color": string;
  "secondary-client-color"?: string;
  "company-size"?: string;
  country?: string;
  "website-link"?: string;
  "visit-the-website"?: string;
  "result-1---number": string;
  "result-1---title": string;
  "result-2---number"?: string;
  "result-2---title"?: string;
  "result-3---number"?: string;
  "result-3---title"?: string;
  featured?: boolean;
  disciplines?: string[];
  client: string;
  industry?: string;
  industries?: string[];
  testimonial?: string;
  technologies?: string[];
  "services-provided"?: string[];
  charts?: CaseStudyChart[];
  instruments?: CaseStudyInstruments;
  faq?: FAQItem[];
  _createdAt?: string;
  _updatedAt?: string;
}

/**
 * Client CMS item
 */
export interface Client {
  id: string;
  name: string;
  slug: string;
  "showcase-logo"?: boolean;
  "colored-logo"?: CmsImage;
  "light-logo"?: CmsImage;
  "dark-logo"?: CmsImage;
}

/**
 * Testimonial CMS item
 */
export interface Testimonial {
  id: string;
  name: string;
  slug: string;
  role?: string;
  "testimonial-body"?: string;
  "profile-image"?: CmsImage;
  "case-study"?: string;
  client?: string;
}

/**
 * Blog Post CMS item
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  displayValue?: string;
  secondaryDisplayValue?: string;
}

export interface CaseStudyChart {
  title: string;
  chartType: 'barComparison' | 'horizontalBar' | 'growthCurve';
  legendPrimary?: string;
  legendSecondary?: string;
  data: ChartDataPoint[];
}

/**
 * The AI-engine identifiers the instruments board and its charts key rows to.
 * A plain string-literal union — kept self-contained (not re-exported from a
 * single canonical spot) because every consumer only needs structural
 * compatibility, not a shared import.
 */
export type InstrumentEngineId = 'chatgpt' | 'perplexity' | 'gemini' | 'googleAio';

/**
 * The reusable "AI Search & Organic Growth" chart board (`InstrumentsBoard`,
 * `src/app/case-detail-v3/InstrumentsBoard.tsx`). Generalised from the
 * TradeMomentum case study's proven `TradeMomentumInstruments` band — every
 * field is optional, and the board only renders the cells with data.
 */
export interface CaseStudyInstruments {
  /** Source line for the AI board, e.g. "Peec AI · 6 Jul – 24 Aug 2026". */
  aiSource?: string;
  /** Source line for the Google board, e.g. "Google Search Console · indexed to Dec 2025 = 100". */
  gscSource?: string;
  /** ISO date the engagement began; drawn as a marker on the Google line. */
  engagementStart?: string;
  topicClimb?: {
    title: string;
    caption: string;
    /** `value` is a share, 0–1 (e.g. 0.333 for 33.3%). */
    points: { week: string; value: number }[];
  };
  rankOverTime?: {
    label: string;
    from: number;
    to: number;
    caption: string;
    /** Lower `position` is better. */
    points: { week: string; position: number }[];
  };
  engineBeforeAfter?: {
    beforeLabel: string;
    afterLabel: string;
    caption: string;
    /** `before`/`after` are shares, 0–1. */
    rows: { engine: InstrumentEngineId; before: number; after: number }[];
  };
  indexedTrend?: {
    title: string;
    /** e.g. "Dec" — the confidentiality formatter prints values as a multiple of this baseline. */
    baselineLabel: string;
    caption: string;
    /** `impressions`/`clicks` are indexed to the baseline month = 100 — for a
     *  daily series, 100 is the baseline month's average DAY, so the baseline
     *  label on the page keeps its meaning at either resolution.
     *  `date` (ISO "YYYY-MM-DD") is present on daily points and absent on the
     *  older monthly ones, which still derive their date from `startMonthIso`. */
    points: { month: string; date?: string; impressions: number; clicks: number; partial?: boolean }[];
    /** The calendar month the first point represents, e.g. "2025-09". */
    startMonthIso: string;
  };
  /** Weekly leads/enquiries, indexed so the shape is public and the client's
   *  own volume is not. See the confidentiality note on `points`. */
  leadGrowth?: {
    title: string;
    /** The published multiplier, pre-formatted, e.g. "2.7x". */
    multiple: string;
    /** What the multiplier counts, e.g. "more case enquiries a week". */
    multipleLabel: string;
    /** The window the multiplier is measured against, e.g. "the first four weeks". */
    baselineLabel: string;
    caption: string;
    /** Source line for the leads board, e.g. "PostHog, 9 Jun - 30 Aug 2026". */
    source?: string;
    /** `value` is INDEXED to the baseline window = 100, never a lead count.
     *  Publishing raw enquiry volumes is out of policy; the multiplier and the
     *  shape of the climb are what a reader needs. */
    points: { week: string; value: number }[];
  };
  publishedResult?: {
    rows: { value: string; unit: string }[];
    positionFrom?: number;
    positionTo?: number;
    caption: string;
  };
}

/**
 * Opt-in metadata that flags a blog post as a first-party data study and
 * feeds the `Dataset` JSON-LD (see `buildDatasetSchema`). Absent on ordinary
 * posts — only original-research pieces fill this in. `name` + `description`
 * are the minimum required to emit the schema.
 */
export interface DatasetMeta {
  name?: string;
  description?: string;
  /** ISO-8601 interval, e.g. "2026-06-28/2026-07-28". */
  temporalCoverage?: string;
  variableMeasured?: string[];
  measurementTechnique?: string;
  keywords?: string[];
  /** License URL, if the study is published under a standard one. */
  license?: string;
}

export interface BlogPost {
  id: string;
  name: string;
  slug: string;
  "meta-title"?: string;
  "meta-description"?: string;
  thumbnail?: CmsImage;
  excerpt?: string;
  "direct-answer"?: string;
  content?: string;
  // Declared `string` in the Sanity schema, but migrated documents can store a
  // number — typed as both so callers coerce rather than assume (see formatReadTime).
  "time-to-read"?: string | number;
  featured?: boolean;
  "published-date"?: string;
  "last-updated"?: string;
  author?: string;
  category?: string;
  categories?: string[];
  faq?: FAQItem[];
  visuals?: BlogVisual[];
  "dataset-meta"?: DatasetMeta;
}

export interface ResearchDataFile {
  label: string;
  url: string;
  note?: string;
}

/**
 * A research study on /research/[slug].
 *
 * The evidence fields (sample, methodology, limitations) are separate from
 * `content` on purpose: they are what makes a study citable rather than
 * quotable, and keeping them as fields means the Studio asks for them every
 * time instead of relying on an author remembering a heading.
 */
export interface ResearchStudy {
  id: string;
  name: string;
  slug: string;
  "meta-title"?: string;
  "meta-description"?: string;
  thumbnail?: CmsImage;
  excerpt?: string;
  "headline-finding"?: string;
  "key-takeaways"?: string[];
  content?: string;
  "sample-summary"?: string;
  methodology?: string;
  limitations?: string;
  appendix?: string;
  "data-files"?: ResearchDataFile[];
  "time-to-read"?: string | number;
  featured?: boolean;
  "published-date"?: string;
  "last-updated"?: string;
  authors?: string[];
  supersedes?: string;
  superseded?: string;
  faq?: FAQItem[];
  visuals?: BlogVisual[];
  "dataset-meta"?: DatasetMeta;
}

export interface BlogVisualPosition {
  anchor: 'hero' | 'after-h2' | 'end';
  h2Index?: number;
}

export interface BlogVisualChartDatum {
  label: string;
  value: number;
  series?: string;
  unit?: string;
}

export interface BlogVisualChart {
  kind: 'bar' | 'horizontalBar' | 'stat' | 'table';
  title?: string;
  xAxis?: string;
  yAxis?: string;
  data: BlogVisualChartDatum[];
  source?: string;
  sourceUrl?: string;
}

/**
 * Metadata recorded when a screenshot visual is captured. Surfaced in the
 * article UI as a "Source:" link under the image so readers can verify the
 * capture against the live page.
 */
export interface BlogVisualCapture {
  sourceUrl?: string;
  capturedAt?: string;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}

export interface BlogVisual {
  _key?: string;
  position: BlogVisualPosition;
  type: 'illustration' | 'chart' | 'screenshot';
  alt: string;
  caption?: string;
  asset?: CmsImage;
  generation?: {
    promptTemplate?: string;
    subject?: string;
    finalPrompt?: string;
    negativePrompt?: string;
    model?: string;
    requestId?: string;
    generatedAt?: string;
  };
  chart?: BlogVisualChart;
  capture?: BlogVisualCapture;
}

/**
 * Category CMS item
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

/**
 * Team Member CMS item
 */
export interface TeamMember {
  _updatedAt?: string;
  id: string;
  name: string;
  slug: string;
  "profile-picture"?: CmsImage;
  "bio-summary"?: string;
  "job-title"?: string;
  "linkedin-url"?: string;
  "twitter-url"?: string;
  skills?: string[];
}

/**
 * Technology CMS item
 */
export interface Technology {
  id: string;
  name: string;
  slug: string;
  logo?: CmsImage;
}

/**
 * Industry CMS item
 */
export interface Industry {
  id: string;
  name: string;
  slug: string;
  "radio-filter---checked-attribute"?: string;
}

/**
 * Service Category CMS item
 */
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

/**
 * SEO Page CMS item (programmatic SEO hub)
 */
export interface SeoPage {
  _updatedAt?: string;
  id: string;
  name: string;
  slug: string;
  "meta-title"?: string;
  "meta-description"?: string;
  industry?: string;
  "display-order"?: number;
  "hero-headline"?: string;
  "hero-subtitle"?: string;
  "hero-description"?: string;
  "hero-image"?: CmsImage;
  "pain-points-title"?: string;
  "pain-point-1-title"?: string;
  "pain-point-1-desc"?: string;
  "pain-point-2-title"?: string;
  "pain-point-2-desc"?: string;
  "pain-point-3-title"?: string;
  "pain-point-3-desc"?: string;
  "strategy-title"?: string;
  "strategy-intro"?: string;
  "strategy-step-1-title"?: string;
  "strategy-step-1-desc"?: string;
  "strategy-step-2-title"?: string;
  "strategy-step-2-desc"?: string;
  "strategy-step-3-title"?: string;
  "strategy-step-3-desc"?: string;
  "strategy-step-4-title"?: string;
  "strategy-step-4-desc"?: string;
  "results-title"?: string;
  "stat-1-value"?: string;
  "stat-1-label"?: string;
  "stat-2-value"?: string;
  "stat-2-label"?: string;
  "stat-3-value"?: string;
  "stat-3-label"?: string;
  "faq-1-question"?: string;
  "faq-1-answer"?: string;
  "faq-2-question"?: string;
  "faq-2-answer"?: string;
  "faq-3-question"?: string;
  "faq-3-answer"?: string;
  "faq-4-question"?: string;
  "faq-4-answer"?: string;
  "faq-5-question"?: string;
  "faq-5-answer"?: string;
  "main-body"?: string;
  "deliverables"?: string;
  "cta-title"?: string;
  "cta-subtitle"?: string;
}

/**
 * Blog FAQ CMS item
 */
export interface BlogFAQ {
  id: string;
  name: string;
  slug: string;
  "blog-post"?: string;
}
