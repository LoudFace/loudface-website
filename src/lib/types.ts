/**
 * Webflow CMS Type Definitions
 * Centralized TypeScript interfaces for CMS data
 */

/**
 * Base Webflow item structure from API v2 response
 */
export interface WebflowItem {
  id: string;
  fieldData: Record<string, unknown>;
  isDraft?: boolean;
  isArchived?: boolean;
  createdOn?: string;
  lastUpdated?: string;
}

/**
 * Image field structure from Webflow
 */
export interface WebflowImage {
  url: string;
  alt: string | null;
}

/**
 * Case Study CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface CaseStudy {
  id: string;
  slug: string;
  name: string;
  "project-title": string;
  "paragraph-summary"?: string;
  "main-body"?: string; // Rich text content
  "main-project-image-thumbnail"?: WebflowImage;
  "client-logo"?: WebflowImage;
  "client-logo-inversed"?: WebflowImage;
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
  client: string; // Reference ID to clients collection
  industry?: string; // Reference ID to industries collection
  industries?: string[]; // Multi-reference to industries collection
  testimonial?: string; // Reference ID to testimonials collection
  technologies?: string[]; // Multi-reference to technologies collection
  "services-provided"?: string[]; // Multi-reference to service-categories collection
}

/**
 * Client CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface Client {
  id: string;
  name: string;
  slug: string;
  "showcase-logo"?: boolean;
  "colored-logo"?: WebflowImage;
  "light-logo"?: WebflowImage;
  "dark-logo"?: WebflowImage;
}

/**
 * Testimonial CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface Testimonial {
  id: string;
  name: string;
  slug: string;
  role?: string;
  "testimonial-body"?: string; // Rich text content
  "profile-image"?: WebflowImage;
  "case-study"?: string; // Reference ID to case-studies collection
  client?: string; // Reference ID to clients collection
}

/**
 * Blog Post CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface BlogPost {
  id: string;
  name: string;
  slug: string;
  "meta-title"?: string;
  "meta-description"?: string;
  thumbnail?: WebflowImage;
  excerpt?: string;
  content?: string; // Rich text content (main body)
  "time-to-read"?: string;
  featured?: boolean;
  "published-date"?: string;
  author?: string; // Reference ID to team-members collection
  category?: string; // Reference ID to categories collection (main category)
  categories?: string[]; // Multi-reference to categories collection
}

/**
 * Category CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string; // Color field
}

/**
 * Team Member CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  "profile-picture"?: WebflowImage;
  "bio-summary"?: string;
  "job-title"?: string;
}

/**
 * Technology CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface Technology {
  id: string;
  name: string;
  slug: string;
  logo?: WebflowImage;
}

/**
 * Industry CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface Industry {
  id: string;
  name: string;
  slug: string;
  "radio-filter---checked-attribute"?: string;
}

/**
 * Service Category CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

/**
 * SEO Page CMS item (programmatic SEO hub)
 * Complete interface covering all fields from the seo-pages collection
 */
export interface SeoPage {
  id: string;
  name: string;
  slug: string;
  "meta-title"?: string;
  "meta-description"?: string;
  industry?: string; // Reference ID to industries collection
  "display-order"?: number;
  "hero-headline"?: string;
  "hero-subtitle"?: string;
  "hero-description"?: string;
  "hero-image"?: WebflowImage;
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
  "main-body"?: string; // RichText — long-form prose section
  "deliverables"?: string; // RichText — detailed deliverables list
  "cta-title"?: string;
  "cta-subtitle"?: string;
}

/**
 * Blog FAQ CMS item
 * Complete interface covering all fields from cms-schemas.json
 */
export interface BlogFAQ {
  id: string;
  name: string;
  slug: string;
  "blog-post"?: string; // Reference ID to blog collection
}

/**
 * Webflow API v2 collection response
 */
export interface WebflowCollectionResponse<T = WebflowItem> {
  items: T[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * Helper type to normalize Webflow item (merge id with fieldData)
 */
export type NormalizedItem<T> = Omit<T, "fieldData"> & T;
