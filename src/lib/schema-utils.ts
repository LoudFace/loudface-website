/**
 * Schema Utilities
 *
 * Server-side utilities for generating JSON-LD structured data.
 * Used by blog posts, case studies, and other content pages to add
 * FAQPage, Speakable, and Review schemas for SEO/AEO visibility.
 */

import { splitProseByH2 } from './html-utils';

/* ─── Types ────────────────────────────────────────────────────── */

interface FAQItem {
  question: string;
  answer: string;
}

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

/* ─── FAQ Extraction ───────────────────────────────────────────── */

/**
 * Extract FAQ items from CMS HTML content by splitting at H2 boundaries.
 *
 * Each H2 heading becomes a question, and the first paragraph after it
 * becomes the answer. Generic headings (Conclusion, Summary, etc.) and
 * very short answers are filtered out.
 *
 * Returns empty array if fewer than 2 valid items (Google requires 2+).
 * Caps at 10 items (Google recommendation).
 */
export function extractFAQFromHTML(html: string | undefined): FAQItem[] {
  if (!html) return [];

  const sections = splitProseByH2(html);
  const items: FAQItem[] = [];

  for (const section of sections) {
    // Skip preamble (no heading) and generic headings
    if (!section.heading) continue;
    if (GENERIC_HEADINGS.has(section.heading.toLowerCase())) continue;

    // Need a meaningful answer (at least 20 chars stripped)
    const answerText = section.summary;
    if (!answerText || answerText.length < 20) continue;

    items.push({
      question: section.heading,
      answer: answerText,
    });

    // Cap at 10 items
    if (items.length >= 10) break;
  }

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
