/**
 * Content Layer Utilities
 *
 * This module provides utilities for working with local JSON content files.
 * These files store static text content that was previously hardcoded in components.
 *
 * NOTE: This is separate from the Webflow CMS system. The CMS Control Panel
 * handles dynamic data from Webflow API. This handles static component defaults.
 */

// Content file imports - add new content files here as they're created
import ctaContent from '../data/content/cta.json';
import heroContent from '../data/content/hero.json';
import faqContent from '../data/content/faq.json';
import approachContent from '../data/content/approach.json';
import marketingContent from '../data/content/marketing.json';
import partnersContent from '../data/content/partners.json';
import knowledgeContent from '../data/content/knowledge.json';
import resultsContent from '../data/content/results.json';
import auditContent from '../data/content/audit.json';
import caseStudySliderContent from '../data/content/case-study-slider.json';
import newsletterContent from '../data/content/newsletter.json';
import faqItemsContent from '../data/content/faq-items.json';

// Type definitions for content files
export interface CTAContent {
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface HeroContent {
  headline: string;
  description: string;
  ctaText: string;
  aiLinks: Array<{
    name: string;
    url: string;
  }>;
}

export interface FAQContent {
  title: string;
  subtitle: string;
  footerTitle: string;
  footerText: string;
  footerCtaText: string;
}

export interface ProcessStep {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
  description: string;
}

export interface ApproachContent {
  title: string;
  highlightWord: string;
  subtitle: string;
  steps: ProcessStep[];
  statsHeading: string;
  stats: Stat[];
}

export interface MarketingCard {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
}

export interface MarketingContent {
  title: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  cards: MarketingCard[];
  ctaText: string;
}

export interface PartnersContent {
  starRatingPrefix: string;
  starRatingSuffix: string;
  tagline: string;
}

export interface KnowledgeContent {
  title: string;
  highlightWord: string;
  description: string;
  readTime: string;
}

export interface VideoTestimonial {
  name: string;
  role: string;
  videoUrl: string;
  videoTitle?: string;
}

export interface ResultsContent {
  title: string;
  subtitle: string;
  videoTestimonials: VideoTestimonial[];
  ctaText: string;
  ctaHref: string;
}

export interface Challenge {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
}

export interface AuditContent {
  title: string;
  highlightText: string;
  description: string;
  challenges: Challenge[];
}

export interface CaseStudySliderContent {
  title: string;
  ctaText: string;
}

export interface NewsletterContent {
  placeholder: string;
  buttonText: string;
  loadingText: string;
  successMessage: string;
  errorMessage: string;
  networkErrorMessage: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQItemsContent {
  items: FAQItem[];
}

// Content registry - maps file names to their content
const contentRegistry: Record<string, unknown> = {
  'cta': ctaContent,
  'hero': heroContent,
  'faq': faqContent,
  'approach': approachContent,
  'marketing': marketingContent,
  'partners': partnersContent,
  'knowledge': knowledgeContent,
  'results': resultsContent,
  'audit': auditContent,
  'case-study-slider': caseStudySliderContent,
  'newsletter': newsletterContent,
  'faq-items': faqItemsContent,
};

/**
 * Get content by file name
 * @param name - Content file name (without .json extension)
 * @returns The content object or undefined if not found
 */
export function getContent<T = unknown>(name: string): T | undefined {
  return contentRegistry[name] as T | undefined;
}

/**
 * Get CTA section content
 */
export function getCTAContent(): CTAContent {
  return ctaContent as CTAContent;
}

/**
 * Get Hero section content
 */
export function getHeroContent(): HeroContent {
  return heroContent as HeroContent;
}

/**
 * Get FAQ section content
 */
export function getFAQContent(): FAQContent {
  return faqContent as FAQContent;
}

/**
 * Get Approach section content
 */
export function getApproachContent(): ApproachContent {
  return approachContent as ApproachContent;
}

/**
 * Get Marketing section content
 */
export function getMarketingContent(): MarketingContent {
  return marketingContent as MarketingContent;
}

/**
 * Get Partners section content
 */
export function getPartnersContent(): PartnersContent {
  return partnersContent as PartnersContent;
}

/**
 * Get Knowledge section content
 */
export function getKnowledgeContent(): KnowledgeContent {
  return knowledgeContent as KnowledgeContent;
}

/**
 * Get Results section content
 */
export function getResultsContent(): ResultsContent {
  return resultsContent as ResultsContent;
}

/**
 * Get Audit section content
 */
export function getAuditContent(): AuditContent {
  return auditContent as AuditContent;
}

/**
 * Get Case Study Slider section content
 */
export function getCaseStudySliderContent(): CaseStudySliderContent {
  return caseStudySliderContent as CaseStudySliderContent;
}

/**
 * Get Newsletter form content
 */
export function getNewsletterContent(): NewsletterContent {
  return newsletterContent as NewsletterContent;
}

/**
 * Get FAQ items content
 */
export function getFAQItemsContent(): FAQItemsContent {
  return faqItemsContent as FAQItemsContent;
}

/**
 * List all available content files
 * @returns Array of content file names
 */
export function listContentFiles(): string[] {
  return Object.keys(contentRegistry);
}

/**
 * Check if a content file exists
 * @param name - Content file name to check
 */
export function hasContent(name: string): boolean {
  return name in contentRegistry;
}

/**
 * Convert newlines to <br> tags for HTML rendering
 * Use with Astro's set:html directive: <p set:html={nl2br(text)} />
 * @param text - Text that may contain newlines
 * @returns HTML string with <br> tags
 */
export function nl2br(text: string): string {
  if (!text) return '';
  // Escape HTML entities first, then convert newlines
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}
