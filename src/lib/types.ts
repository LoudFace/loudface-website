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

/**
 * Opt-in ranked-list / roster metadata, set in Studio on leaderboard posts
 * whose ranking lives in a TABLE rather than numbered <h3> headings. When
 * present with 3+ `items`, it drives the ItemList JSON-LD (see
 * `buildItemListSchema`). Classic numbered-heading listicles leave this empty
 * and auto-emit from their headings instead.
 */
export interface RankedList {
  /** The rostered/ranked entities, in page order. 3+ required to emit. */
  items?: string[];
  /** true = a true ranking (ItemListOrderAscending); false/absent = an unordered roster. */
  ordered?: boolean;
  /** Optional display name for the list; falls back to the post title. */
  title?: string;
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
  "ranked-list"?: RankedList;
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
