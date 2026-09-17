/**
 * Content Layer Utilities
 *
 * This module provides utilities for working with local JSON content files.
 * These files store static text content that was previously hardcoded in components.
 *
 * NOTE: This is separate from Sanity CMS. The CMS handles dynamic data
 * via GROQ queries. This module handles static component defaults from JSON.
 *
 * SERVER-ONLY (safe-by-construction). The module-level `contentRegistry`
 * eagerly references all ~26 JSON files, and that live binding defeats
 * tree-shaking — any *client* component importing even a single getter from
 * here would drag the entire content graph (~200KB raw) into its client
 * chunk. The `server-only` import makes that a hard build error instead of a
 * silent bundle bloat. Client components must receive their copy as props
 * from a Server Component parent (see NewsletterForm ← Footer).
 */
import 'server-only';
import { markTree } from '@/lib/inline-edit/server';

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
import navContent from "@/data/content/nav.json";
import newsletterContent from "@/data/content/newsletter.json";
import workContent from "@/data/content/work.json";
import aboutContent from "@/data/content/about.json";
import servicesWebflowContent from "@/data/content/services-webflow.json";
import servicesSeoAeoContent from "@/data/content/services-seo-aeo.json";
import servicesGeoAgencyContent from "@/data/content/services-geo-agency.json";
import servicesCroContent from "@/data/content/services-cro.json";
import servicesCopywritingContent from "@/data/content/services-copywriting.json";
import servicesUxUiDesignContent from "@/data/content/services-ux-ui-design.json";
import servicesGrowthAutopilotContent from "@/data/content/services-growth-autopilot.json";
import seoForHubContent from "@/data/content/seo-for-hub.json";
import seoForSaasContent from "@/data/content/seo-for-saas.json";
import seoForB2bContent from "@/data/content/seo-for-b2b.json";
import homepageContent from "@/data/content/homepage.json";
import pricingContent from "@/data/content/pricing.json";
import contactContent from "@/data/content/contact.json";
import servicesContent from "@/data/content/services.json";

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
  aiLinksLabel?: string;
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
  href?: string;
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

export interface NavContent {
  links: Array<{
    label: string;
    href: string;
  }>;
  dropdowns: {
    services: {
      label: string;
      description: string;
      items: Array<{
        icon: string;
        iconAlt: string;
        title: string;
        description: string;
        href: string;
      }>;
    };
    industries: {
      label: string;
      description: string;
      items: Array<{
        icon: string;
        iconAlt: string;
        title: string;
        description: string;
        href: string;
      }>;
    };
  };
  dropdownCta: {
    prompt: string;
    action: string;
  };
  ctaText: string;
  logoAriaLabel: string;
  logoAlt: string;
  mainNavigationAriaLabel: string;
  menuToggleAriaLabel: string;
  mobileMenuAriaLabel: string;
  mobileNavigationAriaLabel: string;
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

/**
 * About page content (about-v3 design).
 *
 * Replaces an older, pre-v3 About page's content shape that was never wired
 * up (dead scaffolding since the about-v3 rollout). This shape matches the
 * live about-v3 section components in src/app/about-v3/*. Team member data
 * (names, roles, photos, per-person facts/quotes) stays live from Sanity /
 * TEAM_COPY (see src/app/about-v3/data.ts) — it is not page-shaped static
 * copy, so it is not part of this content file.
 */
export interface AboutHeroContent {
  eyebrowBrand: string;
  eyebrowSince: string;
  headline: string;
  headlineHighlight: string;
  /** Ends mid-sentence, right before the live team-size number. */
  description: string;
  /** Continues the sentence right after the live team-size number. */
  descriptionSuffix: string;
  ctaText: string;
  responseTime: string;
  meetTeamText: string;
}

export interface AboutLedgerRow {
  title: string;
  description: string;
  /** Only the "Team members" row: continues past the live team-size figure. */
  descriptionSuffix?: string;
  /** Omitted on the "Team members" row, where the figure is the live team size. */
  fig?: string;
  chipClient?: string;
  chipTag?: string;
}

export interface AboutLedgerContent {
  eyebrow: string;
  headline: string;
  headlineHighlight: string;
  intro: string;
  operationLabel: string;
  outcomesLabel: string;
  /** Exactly 6 rows: 3 "operation" rows, then 3 "outcomes" rows. */
  rows: AboutLedgerRow[];
  closingText: string;
  closingLinkText: string;
}

export interface AboutTimelineItem {
  year: string;
  description: string;
}

export interface AboutStoryContent {
  founderHeadline: string;
  founderQuotePrefix: string;
  founderQuoteEmphasis: string;
  founderQuoteSuffix: string;
  founderName: string;
  founderRole: string;
  logoPanelHeadline: string;
  logoPanelSubtitle: string;
  enterpriseHeadline: string;
  enterpriseDescription: string;
  /** Exactly 4 entries, oldest first. */
  timeline: AboutTimelineItem[];
}

export interface AboutValueTrack {
  label: string;
  prefix: string;
  linkText: string;
  suffix: string;
}

export interface AboutValuesContent {
  headline: string;
  headlineHighlight: string;
  build: AboutValueTrack;
  grow: AboutValueTrack;
  oneTeam: { label: string; description: string };
}

export interface AboutTeamSectionContent {
  eyebrow: string;
  headline: string;
  subtitle: string;
  fullProfileText: string;
}

export interface AboutAwardItem {
  title: string;
  description: string;
}

export interface AboutAwardsContent {
  eyebrow: string;
  headline: string;
  items: AboutAwardItem[];
  closingText: string;
  closingHighlight: string;
}

export interface AboutFaqStat {
  /** Omitted for the one stat whose figure is the live team size (see AboutFaqContent). */
  value?: string;
  label: string;
}

export interface AboutFaqItem {
  question: string;
  answer: string;
  open?: boolean;
}

export interface AboutFaqContent {
  panelTitle: string;
  panelText: string;
  ctaText: string;
  stats: AboutFaqStat[];
  items: AboutFaqItem[];
}

export interface AboutCoverCtaContent {
  eyebrowLeft: string;
  eyebrowRight: string;
  headline: string;
  description: string;
  ctaText: string;
  responseTime: string;
  creditLeft: string;
  creditRight: string;
}

export interface AboutContent {
  hero: AboutHeroContent;
  ledger: AboutLedgerContent;
  story: AboutStoryContent;
  values: AboutValuesContent;
  team: AboutTeamSectionContent;
  awards: AboutAwardsContent;
  faq: AboutFaqContent;
  coverCta: AboutCoverCtaContent;
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
    subheadline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { value: string; label: string; href?: string }[];
  whatIsAeo: {
    eyebrow: string;
    title: string;
    answer: string;
    body: string;
    linkText: string;
    linkHref: string;
  };
  comparison: {
    title: string;
    highlightWord: string;
    intro: string;
    columns: string[];
    rows: { discipline: string; optimizesFor: string; whereWeShowUp: string }[];
    note: string;
  };
  problems: {
    title: string;
    highlightWord: string;
    subtitle: string;
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
    headline: string;
    description: string;
    bridge: string;
    seo: ServicesSeoAeoTrack;
    aeo: ServicesSeoAeoTrack;
    geo: ServicesSeoAeoTrack;
  };
  capabilities: {
    title: string;
    highlightWord: string;
    items: { title: string; description: string }[];
  };
  pricing: {
    title: string;
    answer: string;
    body: string;
    linkText: string;
    linkHref: string;
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
  cta: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    disclaimer: string;
  };
}

export interface ServicesGeoAgencyScorecardRow {
  capability: string;
  requires: string;
  delivers: string;
}

export interface ServicesGeoAgencyContent {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    definition: string;
    proof: string;
    primaryCta: string;
    secondaryCta: string;
  };
  scorecard: {
    intro: string;
    columns: string[];
    rows: ServicesGeoAgencyScorecardRow[];
  };
  whatIsGeo: {
    title: string;
    paragraphs: string[]; // may contain inline <a> HTML
  };
  comparison: {
    title: string;
    intro: string;
    columns: string[];
    rows: { discipline: string; optimizesFor: string; whereWeShowUp: string }[];
    notes: string[];
  };
  howWeWork: {
    intro: string; // contains inline <a> HTML
    steps: { number: string; title: string; description: string }[];
  };
  proof: {
    intro: string;
    items: string[]; // each a <strong>Label.</strong> + prose HTML string
  };
  timeline: {
    title: string;
    intro: string;
    speeds: { label: string; body: string }[];
    outro: string; // contains inline <a> HTML
  };
  pricing: {
    title: string;
    paragraphs: string[]; // first contains inline <a> HTML
  };
  measurement: {
    title: string;
    paragraphs: string[];
    questionsIntro: string;
    questions: string[];
  };
  faq: {
    items: FAQItem[];
  };
  cta: {
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };
}

export interface SeoForHubContent {
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: { value: string; label: string }[];
  valueProps: {
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
  faq: {
    title: string;
    items: FAQItem[];
  };
}

export interface SeoForSaasProblemItem {
  number: string;
  title: string;
  subtitle: string;
  body: string;
}

export interface SeoForSaasLayer {
  number: string;
  title: string;
  subtitle: string;
  items: string[];
}

export interface SeoForSaasCaseStudy {
  name: string;
  metric: string;
  description: string;
  tags: string[];
  slug: string;
}

export interface SeoForB2bProblemItem {
  number: string;
  title: string;
  subtitle: string;
  body: string;
}

export interface SeoForB2bCaseStudy {
  name: string;
  metric: string;
  description: string;
  tags: string[];
  slug: string;
}

export interface SeoForB2bRelatedInsight {
  title: string;
  slug: string;
  description: string;
}

export interface SeoForB2bContent {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  problem: {
    label: string;
    items: SeoForB2bProblemItem[];
  };
  howWeBuild: {
    label: string;
    headline: string;
    body: string;
    steps: { number: string; title: string; description: string }[];
  };
  ctaBreak: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  stats: {
    headline: string;
    items: { value: string; label: string }[];
  };
  caseStudies: {
    label: string;
    headline: string;
    items: SeoForB2bCaseStudy[];
    cta: string;
  };
  bottomCta: {
    headline: string;
    body: string;
    primaryCta: string;
    disclaimer: string;
  };
  faq: {
    label: string;
    items: FAQItem[];
  };
  relatedInsights: {
    label: string;
    headline: string;
    items: SeoForB2bRelatedInsight[];
  };
}

export interface SeoForSaasContent {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  problem: {
    label: string;
    items: SeoForSaasProblemItem[];
  };
  numbers: {
    headline: string;
    stats: { value: string; label: string }[];
  };
  howWeWork: {
    label: string;
    headline: string;
    body: string;
    steps: { number: string; title: string; description: string }[];
  };
  ctaBreak: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  system: {
    label: string;
    headline: string;
    body: string;
    layers: SeoForSaasLayer[];
  };
  caseStudies: {
    label: string;
    headline: string;
    items: SeoForSaasCaseStudy[];
    cta: string;
  };
  faq: {
    label: string;
    items: FAQItem[];
  };
  bottomCta: {
    headline: string;
    body: string;
    primaryCta: string;
    disclaimer: string;
  };
}

export interface HomepageProblemItem {
  bold: string;
  body: string;
}

export interface HomepageTrack {
  label: string;
  title: string;
  subtitle: string;
  body: string;
  detail: string;
  capabilities: string[];
}

export interface HomepageProcessStep {
  number: string;
  title: string;
  timeline: string;
  body: string;
}

export interface HomepageStatItem {
  value: string;
  label: string;
  description: string;
}

export interface HomepageContent {
  hero: {
    headline: string;
    description: string;
    ctaText: string;
    aiLinksLabel: string;
  };
  partners: {
    tagline: string;
  };
  problem: {
    heading: string;
    items: HomepageProblemItem[];
  };
  tracks: {
    heading: string;
    intro: string;
    build: HomepageTrack;
    grow: HomepageTrack;
    connector: string;
  };
  results: {
    heading: string;
    subtitle: string;
  };
  process: {
    heading: string;
    subtitle: string;
    steps: HomepageProcessStep[];
  };
  stats: {
    heading: string;
    items: HomepageStatItem[];
  };
  blog: {
    title: string;
    subtitle: string;
  };
  faq: FAQItem[];
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

export interface ServicesGrowthAutopilotContent {
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
    items: { number: string; title: string; description: string; tag: string }[];
  };
  approach: {
    title: string;
    highlightWord: string;
    intro: string;
    layers: { number: string; title: string; description: string; items: string[] }[];
  };
  packages: {
    title: string;
    highlightWord: string;
    items: {
      name: string;
      tagline: string;
      featured: boolean;
      badge?: string;
      features: string[];
      ctaText: string;
    }[];
  };
  caseStudies: {
    title: string;
    subtitle: string;
    items: {
      metric: string;
      metricLabel: string;
      client: string;
      description: string;
      tags: string[];
    }[];
  };
  audit: {
    eyebrow: string;
    title: string;
    description: string;
    checks: string[];
    note: string;
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

export interface ServicesCopywritingTrack {
  label: string;
  title: string;
  description: string;
  items: string[];
}

export interface ServicesCopywritingContent {
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
    build: ServicesCopywritingTrack;
    growth: ServicesCopywritingTrack;
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

export interface ServicesUxUiDesignTrack {
  label: string;
  title: string;
  description: string;
  items: string[];
}

export interface ServicesUxUiDesignContent {
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
    build: ServicesUxUiDesignTrack;
    growth: ServicesUxUiDesignTrack;
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

/**
 * Pricing page content (pricing-v3 design).
 *
 * Replaces an older, pre-v3 Pricing page's content shape that was never
 * wired up (dead scaffolding since the pricing-v3 rollout). This shape
 * matches the live pricing-v3 section components in src/app/pricing-v3/*.
 * Client testimonials (Exhibits) stay live from Sanity — not page-shaped
 * static copy, so not part of this content file. faq.items is also the
 * source PRICING_FAQ (src/app/pricing-v3/data.ts) reads via rawContent()
 * for the page's FAQPage JSON-LD.
 */
export interface PricingTier {
  /**
   * Named tierName, not name: a bare "name" key matches the inline-edit
   * MACHINE_KEY denylist (src/lib/inline-edit/server.ts) and would silently
   * never get an edit marker, even though this is visible copy.
   */
  tierName: string;
  tagline: string;
  description: string;
  features: string[];
  /** Omitted for Scale, the tier with no "move up" hint. */
  hint?: string;
  featured?: boolean;
  /** Shown only when featured. */
  badge?: string;
  ctaText: string;
}

export interface PricingHeroContent {
  eyebrowBrand: string;
  eyebrowSub: string;
  headline: string;
  headlineHighlight: string;
  description: string;
  anchorLabel: string;
  anchorPrice: string;
  anchorPeriod: string;
  tiers: PricingTier[];
  qualifierPrefix: string;
  qualifierHighlight: string;
}

export interface PricingStep {
  number: string;
  title: string;
  description: string;
}

export interface PricingHowItWorksContent {
  headline: string;
  headlineHighlight: string;
  intro: string;
  ctaText: string;
  responseTime: string;
  steps: PricingStep[];
  capsuleText: string;
}

export interface PricingTrack {
  badge: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
}

export interface PricingTracksContent {
  headline: string;
  headlineHighlight: string;
  intro: string;
  build: PricingTrack;
  growth: PricingTrack;
  connectorGlyph: string;
  connectorText: string;
}

export interface PricingCompareRow {
  label: string;
  solo: string;
  dual: string;
  scale: string;
  emph?: boolean;
}

export interface PricingCompareContent {
  eyebrow: string;
  headline: string;
  headlineHighlight: string;
  intro: string;
  columns: {
    feature: string;
    solo: string;
    soloTag: string;
    dual: string;
    dualTag: string;
    scale: string;
    scaleTag: string;
  };
  rows: PricingCompareRow[];
  footnote: string;
}

export interface PricingIncludesContent {
  eyebrow: string;
  headline: string;
  headlineHighlight: string;
  intro: string;
  items: { title: string; description: string }[];
}

export interface PricingSpecialArrangementsContent {
  title: string;
  description: string;
  options: { title: string; description: string }[];
  ctaText: string;
}

export interface PricingExhibitsContent {
  headline: string;
  headlineHighlight: string;
}

export interface PricingFaqStat {
  value: string;
  /** Only the price stat carries a unit suffix rendered in a smaller span. */
  period?: string;
  label: string;
}

export interface PricingFaqItem {
  question: string;
  answer: string;
  /** Rich-text variant with inline <strong> — used in place of `answer` when present. */
  answerHtml?: string;
}

export interface PricingFaqContent {
  panelTitleHighlight: string;
  panelTitleRest: string;
  panelText: string;
  ctaText: string;
  stats: PricingFaqStat[];
  items: PricingFaqItem[];
}

export interface PricingCoverCtaContent {
  eyebrowLeft: string;
  eyebrowRight: string;
  headline: string;
  description: string;
  ctaText: string;
  exploreLabel: string;
  exploreLinkText: string;
  creditLeft: string;
  creditRight: string;
}

export interface PricingContent {
  hero: PricingHeroContent;
  logos: { lead: string };
  howItWorks: PricingHowItWorksContent;
  tracks: PricingTracksContent;
  compare: PricingCompareContent;
  includes: PricingIncludesContent;
  specialArrangements: PricingSpecialArrangementsContent;
  exhibits: PricingExhibitsContent;
  faq: PricingFaqContent;
  coverCta: PricingCoverCtaContent;
}

/**
 * Contact page content (contact-v3 design, net-new route).
 *
 * The office street addresses / city names double as the source the page's
 * ContactPage JSON-LD reads (see OFFICES in src/app/contact-v3/data.ts) —
 * that JSON-LD keeps its own separately-authored schema.PostalAddress
 * fields, so no rawContent() indirection is needed there. faq.items is the
 * source CONTACT_FAQ (src/app/contact-v3/data.ts) reads via rawContent()
 * for the page's FAQPage JSON-LD.
 */
export interface ContactHeroContent {
  eyebrow: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  ctaText: string;
  emailPrefix: string;
  cardKicker: string;
  cardChip: string;
  cardTitle: string;
  cardMetaVideo: string;
  cardMetaFounder: string;
  cardLabel: string;
  /** Exactly 3 agenda lines. */
  agenda: string[];
}

export interface ContactNextStep {
  title: string;
  chip: string;
  body: string;
}

export interface ContactNextStepsContent {
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  subtitle: string;
  /** Exactly 4 steps; the illustrative calendar companion card is aria-hidden decoration and stays in code. */
  steps: ContactNextStep[];
}

export interface ContactCity {
  city: string;
  /** Exactly 2 address lines. */
  lines: string[];
}

export interface ContactFact {
  number: string;
  /** Only "years" and "sites" carry a styled "+" suffix. */
  numberSuffix?: string;
  label: string;
  /** Continues right after the bold label, e.g. " as a Webflow Enterprise Partner." */
  description: string;
}

export interface ContactOfficesContent {
  eyebrow: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  subtitle: string;
  /** Exactly 2 cities, same order as OFFICES in contact-v3/data.ts (San Francisco, Dubai). */
  cities: ContactCity[];
  localLabel: string;
  facts: {
    reply: ContactFact;
    years: ContactFact;
    sites: ContactFact;
  };
  founderQuote: string;
}

export interface ContactFaqContent {
  headline: string;
  intro: string;
  ctaText: string;
  items: FAQItem[];
}

export interface ContactCoverCtaContent {
  eyebrowLeft: string;
  eyebrowRight: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  ctaText: string;
  responseTime: string;
  creditLeft: string;
  creditRight: string;
}

export interface ContactContent {
  hero: ContactHeroContent;
  logos: { lead: string };
  nextSteps: ContactNextStepsContent;
  offices: ContactOfficesContent;
  faq: ContactFaqContent;
  coverCta: ContactCoverCtaContent;
}

/**
 * Services hub page content (services-v3 design, the /services index only).
 *
 * The 8 individual /services/<slug> pages are a separate, shared-template
 * system (service-v3/ServicePageV3.tsx + service-v3/data.tsx) where the copy
 * is embedded directly in JSX config fields — out of scope for this content
 * layer for now; extracting it safely means redesigning that shared
 * template, not just wiring a getter.
 *
 * index.entries and faq.items double as the source ItemList/FAQPage JSON-LD
 * in page.tsx reads via rawContent() (see SERVICES / SERVICES_FAQ in
 * services-v3/data.ts).
 */
export interface ServicesHeroContent {
  eyebrowBrand: string;
  eyebrowYears: string;
  headline: string;
  headlineHighlight: string;
  description: string;
  ctaText: string;
  seeAllText: string;
}

export interface ServicesExhibitItem {
  rpill: string;
  tag: string;
  /** Named clientName, not name — see the note on PricingTier.tierName. */
  clientName: string;
  dom: string;
  what: string;
  /** Exactly 3 credits; hrefs are route paths and stay in code. */
  credits: { label: string }[];
  /** "outPrefix + <highlight> + outSuffix" — one side is "" depending on which side is emphasized. */
  outPrefix: string;
  outHighlight: string;
  outSuffix: string;
}

export interface ServicesExhibitStat {
  value: string;
  label: string;
  /** Only the conversion-lift stat carries an attribution line. */
  source?: string;
}

export interface ServicesExhibitsContent {
  eyebrow: string;
  headline: string;
  headlineHighlight: string;
  intro: string;
  noteText: string;
  creditsLabel: string;
  outcomeLabel: string;
  /** Exactly 3 exhibits. */
  items: ServicesExhibitItem[];
  /** Exactly 3 stats. */
  stats: ServicesExhibitStat[];
}

export interface ServicesIndexEntry {
  /** Route slug under /services — not editable copy, kept here only to pair with name/blurb. */
  slug: string;
  /** Named serviceName, not name — see the note on PricingTier.tierName. */
  serviceName: string;
  blurb: string;
  /**
   * Deliberately NOT here: 'build' | 'grow'. That value is compared with
   * `===` in ServicesIndex.tsx to split the two track lists — if it went
   * through markTree in draft mode it would get an invisible edit-marker
   * appended, the `===` would silently stop matching, and both lists would
   * render empty. It stays in code as TRACK_BY_SLUG (services-v3/data.ts).
   */
}

export interface ServicesIndexContent {
  headline: string;
  headlineHighlight: string;
  intro: string;
  buildNum: string;
  buildLabel: string;
  buildTagline: string;
  growNum: string;
  growLabel: string;
  growTagline: string;
  growNote: string;
  bothGlyph: string;
  bothText: string;
  amtPrefix: string;
  amtValue: string;
  /** Exactly 8 entries, same order as SERVICES in services-v3/data.ts. */
  entries: ServicesIndexEntry[];
}

export interface ServicesClarifierColumn {
  abbr: string;
  question: string;
  bodyPrefix: string;
  bodyBold: string;
  bodySuffix: string;
  unitPrefix: string;
  unitBold: string;
  unitSuffix: string;
  /** Only the GEO column carries the proof line. */
  proof?: string;
  linkText: string;
}

export interface ServicesClarifierContent {
  kicker: string;
  headlineLine1: string;
  headlineHighlight: string;
  headlineSuffix: string;
  intro: string;
  seo: ServicesClarifierColumn;
  geo: ServicesClarifierColumn;
}

export interface ServicesFaqItem {
  question: string;
  answer: string;
  /** Rich-text variant with inline <strong> — used in place of `answer` when present. */
  answerHtml?: string;
}

export interface ServicesFaqContent {
  headline: string;
  headlineHighlight: string;
  items: ServicesFaqItem[];
}

export interface ServicesCoverCtaContent {
  eyebrowLeft: string;
  eyebrowRight: string;
  headline: string;
  description: string;
  ctaText: string;
  responseTime: string;
  creditLeft: string;
  creditRight: string;
}

export interface ServicesContent {
  hero: ServicesHeroContent;
  logos: { lead: string };
  exhibits: ServicesExhibitsContent;
  index: ServicesIndexContent;
  clarifier: ServicesClarifierContent;
  faq: ServicesFaqContent;
  coverCta: ServicesCoverCtaContent;
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
  nav: navContent,
  newsletter: newsletterContent,
  work: workContent,
  about: aboutContent,
  "services-webflow": servicesWebflowContent,
  "services-seo-aeo": servicesSeoAeoContent,
  "services-geo-agency": servicesGeoAgencyContent,
  "services-cro": servicesCroContent,
  "services-copywriting": servicesCopywritingContent,
  "services-ux-ui-design": servicesUxUiDesignContent,
  "seo-for-hub": seoForHubContent,
  "seo-for-saas": seoForSaasContent,
  "seo-for-b2b": seoForB2bContent,
  homepage: homepageContent,
  pricing: pricingContent,
  contact: contactContent,
  services: servicesContent,
};

/**
 * Get content by file name
 * @param name - Content file name (without .json extension)
 * @returns The content object or undefined if not found
 */
/**
 * Unmarked content, for anything that is not visible page text: metadata,
 * JSON-LD, hand-built alt attributes, anything read at module scope.
 * Editing marks must never reach those.
 */
export function rawContent<T = unknown>(name: string): T {
  return contentRegistry[name] as T;
}

export async function getContent<T = unknown>(name: string): Promise<T | undefined> {
  const value = contentRegistry[name] as T | undefined;
  return value === undefined ? undefined : markTree(name, value);
}

/**
 * Get CTA section content
 */
export async function getCTAContent(): Promise<CTAContent> {
  return markTree('cta', ctaContent as CTAContent);
}

/**
 * Get Hero section content
 */
export async function getHeroContent(): Promise<HeroContent> {
  return markTree('hero', heroContent as HeroContent);
}

/**
 * Get FAQ section content
 */
export async function getFAQContent(): Promise<FAQContent> {
  return markTree('faq', faqContent as FAQContent);
}

/**
 * Get Approach section content
 */
export async function getApproachContent(): Promise<ApproachContent> {
  return markTree('approach', approachContent as ApproachContent);
}

/**
 * Get Marketing section content
 */
export async function getMarketingContent(): Promise<MarketingContent> {
  return markTree('marketing', marketingContent as MarketingContent);
}

/**
 * Get Partners section content
 */
export async function getPartnersContent(): Promise<PartnersContent> {
  return markTree('partners', partnersContent as PartnersContent);
}

/**
 * Get Knowledge section content
 */
export async function getKnowledgeContent(): Promise<KnowledgeContent> {
  return markTree('knowledge', knowledgeContent as KnowledgeContent);
}

/**
 * Get Results section content
 */
export async function getResultsContent(): Promise<ResultsContent> {
  return markTree('results', resultsContent as ResultsContent);
}

/**
 * Get Audit section content
 */
export async function getAuditContent(): Promise<AuditContent> {
  return markTree('audit', auditContent as AuditContent);
}

/**
 * Get Case Study Slider section content
 */
export async function getCaseStudySliderContent(): Promise<CaseStudySliderContent> {
  return markTree('case-study-slider', caseStudySliderContent as CaseStudySliderContent);
}

/**
 * Get navigation content
 */
export async function getNavContent(): Promise<NavContent> {
  return markTree('nav', navContent as NavContent);
}

/**
 * Get Newsletter form content
 */
export async function getNewsletterContent(): Promise<NewsletterContent> {
  return markTree('newsletter', newsletterContent as NewsletterContent);
}

/**
 * Get Work page content
 */
export async function getWorkContent(): Promise<WorkContent> {
  return markTree('work', workContent as WorkContent);
}

/**
 * Get About page content
 */
export async function getAboutContent(): Promise<AboutContent> {
  return markTree('about', aboutContent as AboutContent);
}

/**
 * Get Services Webflow page content
 */
export async function getServicesWebflowContent(): Promise<ServicesWebflowContent> {
  return markTree('services-webflow', servicesWebflowContent as ServicesWebflowContent);
}

/**
 * Get Services SEO/AEO page content
 */
export async function getServicesSeoAeoContent(): Promise<ServicesSeoAeoContent> {
  return markTree('services-seo-aeo', servicesSeoAeoContent as ServicesSeoAeoContent);
}

/**
 * Get Services GEO Agency (/services/geo-agency) page content.
 * Dedicated shape — dual-verified approved body (content-engine loop, 2026-07-13):
 * hero + first-screen scorecard + what-is-GEO + GEO/AEO/SEO comparison + program
 * steps + proof + timeline + pricing + measurement (+ 7 questions) + FAQ + CTA.
 */
export async function getServicesGeoAgencyContent(): Promise<ServicesGeoAgencyContent> {
  return markTree('services-geo-agency', servicesGeoAgencyContent as ServicesGeoAgencyContent);
}

/**
 * Get Services CRO page content
 */
export async function getServicesCroContent(): Promise<ServicesCroContent> {
  return markTree('services-cro', servicesCroContent as ServicesCroContent);
}

/**
 * Get Services Copywriting page content
 */
export async function getServicesCopywritingContent(): Promise<ServicesCopywritingContent> {
  return markTree('services-copywriting', servicesCopywritingContent as ServicesCopywritingContent);
}

/**
 * Get Services UX/UI Design page content
 */
export async function getServicesUxUiDesignContent(): Promise<ServicesUxUiDesignContent> {
  return markTree('services-ux-ui-design', servicesUxUiDesignContent as ServicesUxUiDesignContent);
}

/**
 * Get Services Growth Autopilot page content
 */
export async function getServicesGrowthAutopilotContent(): Promise<ServicesGrowthAutopilotContent> {
  return markTree('services-growth-autopilot', servicesGrowthAutopilotContent as ServicesGrowthAutopilotContent);
}

/**
 * Get SEO for Industry hub page content
 */
export async function getSeoForHubContent(): Promise<SeoForHubContent> {
  return markTree('seo-for-hub', seoForHubContent as SeoForHubContent);
}

/**
 * Get SEO for SaaS page content
 */
export async function getSeoForSaasContent(): Promise<SeoForSaasContent> {
  return markTree('seo-for-saas', seoForSaasContent as SeoForSaasContent);
}

/**
 * Get SEO for B2B page content
 */
export async function getSeoForB2bContent(): Promise<SeoForB2bContent> {
  return markTree('seo-for-b2b', seoForB2bContent as SeoForB2bContent);
}

/**
 * Get Homepage content
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  return markTree('homepage', homepageContent as HomepageContent);
}

/**
 * Get Pricing page content
 */
export async function getPricingContent(): Promise<PricingContent> {
  return markTree('pricing', pricingContent as PricingContent);
}

/**
 * Get Contact page content
 */
export async function getContactContent(): Promise<ContactContent> {
  return markTree('contact', contactContent as ContactContent);
}

/**
 * Get Services hub page content
 */
export async function getServicesContent(): Promise<ServicesContent> {
  return markTree('services', servicesContent as ServicesContent);
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
