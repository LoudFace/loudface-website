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
import ctaContent from "@/data/content/cta.json";
import heroContent from "@/data/content/hero.json";
import faqContent from "@/data/content/faq.json";
import approachContent from "@/data/content/approach.json";
import marketingContent from "@/data/content/marketing.json";
import partnersContent from "@/data/content/partners.json";
import knowledgeContent from "@/data/content/knowledge.json";
import resultsContent from "@/data/content/results.json";
import auditContent from "@/data/content/audit.json";
import caseStudySliderContent from "@/data/content/case-study-slider.json";
import newsletterContent from "@/data/content/newsletter.json";
import faqItemsContent from "@/data/content/faq-items.json";
import workContent from "@/data/content/work.json";
import aboutContent from "@/data/content/about.json";
import servicesWebflowContent from "@/data/content/services-webflow.json";
import servicesSeoAeoContent from "@/data/content/services-seo-aeo.json";
import servicesCroContent from "@/data/content/services-cro.json";

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

export interface WorkStat {
  number: string;
  label: string;
}

export interface WorkContent {
  headline: string;
  highlightWord: string;
  description: string;
  stats: WorkStat[];
  galleryTitle: string;
  galleryHighlightWord: string;
  gallerySubtitle: string;
  viewProjectText: string;
  backToTopText: string;
}

export interface AboutHero {
  badge: string;
  badgeIcon: string;
  headline: string;
  highlightWords: string[];
  description: string;
  ctaText: string;
}

export interface AboutCounterStat {
  number: string;
  label: string;
  description: string;
}

export interface AboutCounter {
  stats: AboutCounterStat[];
  awardBadge: string;
}

export interface AboutJourney {
  badge: string;
  headline: string;
  description: string;
  image: string;
}

export interface AboutTeamCtaCard {
  indicator: string;
  headline: string;
  description: string;
  ctaText: string;
}

export interface AboutTeam {
  badge: string;
  title: string;
  highlightWord: string;
  subtitle: string;
  ctaCard: AboutTeamCtaCard;
}

export interface AboutAwardItem {
  icon: string;
  title: string;
  description: string;
}

export interface AboutAwards {
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  items: AboutAwardItem[];
}

export interface AboutFaqItem {
  question: string;
  answer: string;
}

export interface AboutFaq {
  title: string;
  highlightWord: string;
  items: AboutFaqItem[];
  footerText: string;
  footerCtaText: string;
}

export interface AboutFinalCta {
  title: string;
  description: string;
  ctaText: string;
}

export interface AboutContent {
  hero: AboutHero;
  counter: AboutCounter;
  journey: AboutJourney;
  team: AboutTeam;
  awards: AboutAwards;
  faq: AboutFaq;
  finalCta: AboutFinalCta;
}

export interface ServicesWebflowStat {
  value: string;
  label: string;
  description?: string;
}

export interface ServicesWebflowContent {
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { value: string; label: string }[];
  problems: {
    title: string;
    highlightWord: string;
    items: { number: string; title: string; description: string }[];
  };
  approach: {
    title: string;
    highlightWord: string;
    intro: string;
    steps: { number: string; title: string; description: string }[];
  };
  capabilities: {
    title: string;
    highlightWord: string;
    items: { title: string; description: string; span: number }[];
  };
  credibility: {
    title: string;
    highlightWord: string;
    stats: ServicesWebflowStat[];
    description: string;
    badges: { src: string; alt: string }[];
  };
  caseStudies: {
    title: string;
    highlightWord: string;
    cta: string;
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  cta: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
}

export interface ServicesSeoAeoTrack {
  label: string;
  title: string;
  description: string;
  items: string[];
}

export interface ServicesSeoAeoContent {
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { value: string; label: string }[];
  problems: {
    title: string;
    highlightWord: string;
    items: { number: string; title: string; description: string }[];
  };
  approach: {
    title: string;
    highlightWord: string;
    intro: string;
    steps: { number: string; title: string; description: string }[];
  };
  tracks: {
    title: string;
    highlightWord: string;
    description: string;
    bridge: string;
    seo: ServicesSeoAeoTrack;
    aeo: ServicesSeoAeoTrack;
  };
  capabilities: {
    title: string;
    highlightWord: string;
    items: { title: string; description: string }[];
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  cta: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
}

export interface ServicesCroContent {
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { value: string; label: string }[];
  problems: {
    title: string;
    highlightWord: string;
    items: { number: string; title: string; description: string }[];
  };
  approach: {
    title: string;
    highlightWord: string;
    intro: string;
    steps: { number: string; title: string; description: string }[];
  };
  capabilities: {
    title: string;
    highlightWord: string;
    items: { title: string; description: string }[];
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  cta: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
}

// Content registry - maps file names to their content
const contentRegistry: Record<string, unknown> = {
  cta: ctaContent,
  hero: heroContent,
  faq: faqContent,
  approach: approachContent,
  marketing: marketingContent,
  partners: partnersContent,
  knowledge: knowledgeContent,
  results: resultsContent,
  audit: auditContent,
  "case-study-slider": caseStudySliderContent,
  newsletter: newsletterContent,
  "faq-items": faqItemsContent,
  work: workContent,
  about: aboutContent,
  "services-webflow": servicesWebflowContent,
  "services-seo-aeo": servicesSeoAeoContent,
  "services-cro": servicesCroContent,
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
 * Get Work page content
 */
export function getWorkContent(): WorkContent {
  return workContent as WorkContent;
}

/**
 * Get About page content
 */
export function getAboutContent(): AboutContent {
  return aboutContent as AboutContent;
}

/**
 * Get Services Webflow page content
 */
export function getServicesWebflowContent(): ServicesWebflowContent {
  return servicesWebflowContent as ServicesWebflowContent;
}

/**
 * Get Services SEO/AEO page content
 */
export function getServicesSeoAeoContent(): ServicesSeoAeoContent {
  return servicesSeoAeoContent as ServicesSeoAeoContent;
}

/**
 * Get Services CRO page content
 */
export function getServicesCroContent(): ServicesCroContent {
  return servicesCroContent as ServicesCroContent;
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
 * Use with dangerouslySetInnerHTML: <p dangerouslySetInnerHTML={{ __html: nl2br(text) }} />
 * @param text - Text that may contain newlines
 * @returns HTML string with <br> tags
 */
export function nl2br(text: string): string {
  if (!text) return "";
  // Escape HTML entities first, then convert newlines
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}
