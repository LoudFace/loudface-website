/**
 * Schema Utilities
 *
 * Server-side utilities for generating JSON-LD structured data.
 * Used by blog posts, case studies, and other content pages to add
 * FAQPage, Speakable, and Review schemas for SEO/AEO visibility.
 */

import { splitProseByH2 } from './html-utils';
import type { TeamMember } from './types';

/* ─── Types ────────────────────────────────────────────────────── */

interface FAQItem {
  question: string;
  answer: string;
}

const SITE_URL = 'https://www.loudface.co';
const SITE_LOGO_URL = `${SITE_URL}/images/loudface.svg`;

/* ─── Helpers ──────────────────────────────────────────────────── */

/** Strip HTML tags from a string, collapsing whitespace. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Headings that don't make good FAQ questions. */
const GENERIC_HEADINGS = new Set([
  'conclusion',
  'summary',
  'references',
  'final thoughts',
  'wrapping up',
  'in closing',
  'related posts',
  'related articles',
  'about the author',
  'table of contents',
  'sources',
  'further reading',
]);

/** First word of an interrogative heading — used to detect question-shape. */
const QUESTION_STARTERS = /^(what|how|why|when|where|who|should|can|could|does|do|is|are|will|would|which)\b/i;

/** True when a heading reads like a question that AI engines can quote back. */
function isQuestionHeading(heading: string): boolean {
  const trimmed = heading.trim();
  return trimmed.endsWith('?') || QUESTION_STARTERS.test(trimmed);
}

/* ─── Entity / Author / Publisher schema ─────────────────────────── */

/**
 * Build a Person schema fragment for an article author.
 *
 * Inlines `sameAs` (LinkedIn / X) so AI systems can disambiguate the
 * author entity — the bare name "Arnel Bukva" is ambiguous, but the
 * LinkedIn URL is a unique identifier they cross-reference against
 * their knowledge graphs.
 *
 * Falls back to a LoudFace organisation-style author when the post
 * has no authored team member (e.g. legacy CMS records).
 */
export function buildArticleAuthorSchema(member: TeamMember | null | undefined): object {
  if (!member) {
    return {
      '@type': 'Organization',
      name: 'LoudFace',
      url: SITE_URL,
    };
  }

  const sameAs: string[] = [];
  if (member['linkedin-url']) sameAs.push(member['linkedin-url']);
  if (member['twitter-url']) sameAs.push(member['twitter-url']);

  return {
    '@type': 'Person',
    name: member.name,
    ...(member['job-title'] && { jobTitle: member['job-title'] }),
    ...(member['profile-picture']?.url && { image: member['profile-picture'].url }),
    url: member.slug
      ? `${SITE_URL}/team/${member.slug}`
      : `${SITE_URL}/about`,
    ...(sameAs.length > 0 && { sameAs }),
    worksFor: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: SITE_URL,
    },
  };
}

/**
 * Standard Organization publisher block including a logo ImageObject.
 *
 * Google requires `publisher.logo` as an ImageObject for `Article` /
 * `BlogPosting` rich results — bare URLs are silently dropped from the
 * Rich Results test. Use this everywhere we render an article-type schema.
 */
export function buildOrganizationPublisher(): object {
  return {
    '@type': 'Organization',
    name: 'LoudFace',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: SITE_LOGO_URL,
    },
  };
}

/**
 * Build an `ImageObject` from a CMS image URL with explicit dimensions.
 *
 * Returns undefined for empty input so callers can spread conditionally
 * (`...(img && { image: img })`). Defaults match a standard 16:9 OG aspect
 * ratio; pass exact dimensions when the source aspect differs.
 */
export function buildImageObject(
  url: string | undefined,
  width = 1200,
  height = 675,
): object | undefined {
  if (!url) return undefined;
  return {
    '@type': 'ImageObject',
    url,
    width,
    height,
  };
}

/* ─── FAQ Extraction ───────────────────────────────────────────── */

/**
 * Extract FAQ items from CMS HTML content by splitting at H2 boundaries.
 *
 * Each H2 heading becomes a question, and the first paragraph after it
 * becomes the answer. Generic headings (Conclusion, Summary, etc.) and
 * very short answers are filtered out.
 *
 * Headings that read like questions ("What is X?", "How does Y work?")
 * are promoted to the top so AI engines surface them first — descriptive
 * headings are kept as a fallback only.
 *
 * Returns empty array if fewer than 2 valid items (Google requires 2+).
 * Caps at 10 items (Google recommendation).
 */
export function extractFAQFromHTML(html: string | undefined): FAQItem[] {
  if (!html) return [];

  const sections = splitProseByH2(html);
  const questionItems: FAQItem[] = [];
  const otherItems: FAQItem[] = [];

  for (const section of sections) {
    // Skip preamble (no heading) and generic headings
    if (!section.heading) continue;
    if (GENERIC_HEADINGS.has(section.heading.toLowerCase())) continue;

    // Need a meaningful answer (at least 20 chars stripped)
    const answerText = section.summary;
    if (!answerText || answerText.length < 20) continue;

    const item: FAQItem = { question: section.heading, answer: answerText };
    if (isQuestionHeading(section.heading)) {
      questionItems.push(item);
    } else {
      otherItems.push(item);
    }

    // Stop collecting once we have plenty to choose from
    if (questionItems.length + otherItems.length >= 15) break;
  }

  // Prefer question-shaped headings; pad with descriptive headings if needed
  const items = [...questionItems, ...otherItems].slice(0, 10);

  // Google requires at least 2 FAQ items
  return items.length >= 2 ? items : [];
}

/* ─── Schema Builders ──────────────────────────────────────────── */

/**
 * Build FAQPage JSON-LD schema from FAQ items.
 * Returns null if fewer than 2 items (not worth generating).
 */
export function buildFAQSchema(items: FAQItem[]): object | null {
  if (items.length < 2) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(item.answer),
      },
    })),
  };
}

/**
 * Build WebPage + SpeakableSpecification JSON-LD.
 * Matches the pattern used on homepage and service pages.
 */
export function buildSpeakableSchema(name: string, url: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url,
  };
}

/**
 * Build Review JSON-LD from a testimonial.
 * Used on case study pages that have client testimonials.
 */
export function buildReviewSchema(
  testimonial: { name: string; role?: string; quote: string },
  subjectName: string,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Organization',
      name: 'LoudFace',
    },
    reviewBody: stripHtml(testimonial.quote),
    author: {
      '@type': 'Person',
      name: testimonial.name,
      ...(testimonial.role && { jobTitle: testimonial.role }),
    },
    publisher: {
      '@type': 'Organization',
      name: subjectName,
    },
  };
}
