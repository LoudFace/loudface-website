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
  client: string;
  industry?: string;
  industries?: string[];
  testimonial?: string;
  technologies?: string[];
  "services-provided"?: string[];
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
export interface BlogPost {
  id: string;
  name: string;
  slug: string;
  "meta-title"?: string;
  "meta-description"?: string;
  thumbnail?: CmsImage;
  excerpt?: string;
  content?: string;
  "time-to-read"?: string;
  featured?: boolean;
  "published-date"?: string;
  "last-updated"?: string;
  author?: string;
  category?: string;
  categories?: string[];
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
