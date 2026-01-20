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
 * Comprehensive interface covering all fields used across components
 */
export interface CaseStudy {
  id: string;
  slug: string;
  name: string;
  'project-title': string;
  'paragraph-summary'?: string;
  'main-project-image-thumbnail'?: WebflowImage;
  'client-color': string;
  'result-1---number': string;
  'result-1---title': string;
  client: string; // Reference ID to clients collection
  featured?: boolean;
  industry?: string; // Reference ID to industries collection
  country?: string;
  [key: string]: unknown; // Allow additional fields from schema
}

/**
 * Client CMS item
 */
export interface Client {
  id: string;
  name: string;
  slug: string;
  'colored-logo': WebflowImage;
  'showcase-logo': boolean;
}

/**
 * Testimonial CMS item
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  'testimonial-body': string;
  'profile-image': WebflowImage;
  'case-study': string | null; // Reference to case study
}

/**
 * Blog Post CMS item
 */
export interface BlogPost {
  id: string;
  name: string;
  slug: string;
  excerpt: string;
  thumbnail: WebflowImage;
  author: string; // Reference ID
  category: string; // Reference ID
  'published-date': string;
}

/**
 * Category CMS item
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
}

/**
 * Team Member CMS item
 */
export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  role?: string;
  bio?: string;
  image?: WebflowImage;
  'profile-image'?: WebflowImage;
  [key: string]: unknown; // Allow additional fields from schema
}

/**
 * Technology CMS item
 */
export interface Technology {
  id: string;
  name: string;
  slug: string;
  logo?: WebflowImage;
}

/**
 * Industry CMS item
 */
export interface Industry {
  id: string;
  name: string;
  slug: string;
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
export type NormalizedItem<T> = Omit<T, 'fieldData'> & T;
