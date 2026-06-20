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
 * Build an `ImageObject` from a CMS image URL.
 *
 * Sanity asset URLs encode the original dimensions as `-WIDTHxHEIGHT` in
 * the filename (e.g. `...-1216x810.png`). When the pattern matches, we
 * emit accurate `width`/`height` so Google's Rich Results validator and
 * AI crawlers see a truthful aspect ratio. When it doesn't match (custom
 * URLs, query-string transforms that drop the suffix), we omit dimensions
 * entirely rather than guess — Google infers them from the bytes anyway.
 *
 * Explicit `width`/`height` overrides parsing for callers that already
 * know the rendered crop. Returns undefined for empty input so callers
 * can spread conditionally (`...(img && { image: img })`).
 */
export function buildImageObject(
  url: string | undefined,
  width?: number,
  height?: number,
): object | undefined {
  if (!url) return undefined;

  let resolvedWidth = width;
  let resolvedHeight = height;

  if (resolvedWidth === undefined || resolvedHeight === undefined) {
    // Match `-1216x810.png` or `-1216x810.png?w=...` — strip query first.
    const noQuery = url.split('?', 1)[0];
    const match = noQuery.match(/-(\d+)x(\d+)\.[a-z0-9]+$/i);
    if (match) {
      resolvedWidth = resolvedWidth ?? Number.parseInt(match[1], 10);
      resolvedHeight = resolvedHeight ?? Number.parseInt(match[2], 10);
    }
  }

  return {
    '@type': 'ImageObject',
    url,
    ...(resolvedWidth ? { width: resolvedWidth } : {}),
    ...(resolvedHeight ? { height: resolvedHeight } : {}),
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
 * Build HowTo JSON-LD by detecting time-coded H3 steps in body HTML.
 *
 * Triggers when a post has three or more H3 headings shaped like
 * `0–15: Build the prompt set` (an integer range followed by colon and
 * a step name). This pattern is how we structure how-to-style posts at
 * LoudFace, and it's distinct enough that we won't false-positive on
 * regular blog posts.
 *
 * Pairing HowTo with FAQPage + BlogPosting on the same page is the
 * highest-impact AEO move for step-by-step content — Google AI Overview
 * selection rates climb meaningfully when the schema stack matches the
 * content shape.
 *
 * Returns null when the pattern doesn't match so the caller can omit
 * the script tag entirely (cleaner than emitting an invalid schema).
 */
export function buildHowToSchema(
  html: string | undefined,
  name: string,
  url: string,
  description?: string,
): object | null {
  if (!html) return null;

  // Match `<h3 ...>0–15: Step name</h3>` — handles both ASCII hyphen and
  // en-dash, and captures everything until the next h2/h3 as step body.
  const stepRegex =
    /<h3[^>]*>\s*(\d+)\s*[-–]\s*(\d+)\s*:\s*([^<]+?)\s*<\/h3>([\s\S]*?)(?=<h[23]|$)/gi;
  const matches = Array.from(html.matchAll(stepRegex));

  if (matches.length < 3) return null;

  // Total runtime = end-minute of the last step. Encoded as ISO-8601
  // duration ("PT90M") because Schema.org requires that format.
  const lastEnd = Number.parseInt(matches[matches.length - 1][2], 10);

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    url,
    ...(description ? { description } : {}),
    ...(Number.isFinite(lastEnd) ? { totalTime: `PT${lastEnd}M` } : {}),
    step: matches.map((m, i) => {
      const startMin = m[1];
      const endMin = m[2];
      const stepName = `${startMin}–${endMin}: ${m[3].trim()}`;
      // First ~300 chars of the step body keeps the schema lean while
      // still giving AI engines enough text to extract a meaningful chunk.
      const stepText = stripHtml(m[4]).slice(0, 300).trim();
      return {
        '@type': 'HowToStep',
        position: i + 1,
        name: stepName,
        text: stepText,
      };
    }),
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
 * Build ItemList JSON-LD for ranked "Best X (Ranked)" listicles.
 *
 * Detects numbered H2 headings ("<h2>1. LoudFace: best for…</h2>",
 * "<h2>2. …") — the shape every LoudFace agency listicle uses — and emits
 * an ordered ItemList so AI engines and Google parse the ranking as
 * structured data rather than guessing it from prose. None of the
 * competitors in our tracked set expose ItemList, so this is a cheap
 * differentiator that applies to every ranked listicle at once.
 *
 * Requires at least 3 sequentially-numbered entries starting at 1 (guards
 * against numbered headings that aren't a ranking). Returns null otherwise
 * so the caller can omit the script tag.
 */
export function buildItemListSchema(
  html: string | undefined,
  name: string,
  url: string,
): object | null {
  if (!html) return null;

  // Match `<h2 ...>1. Agency Name: best for …</h2>` — capture the rank plus
  // the heading text. The agency name is the label up to the first colon.
  const itemRegex = /<h2[^>]*>\s*(\d+)\.\s+([^<]+?)\s*<\/h2>/gi;
  const items: { position: number; nameText: string }[] = [];
  for (const m of html.matchAll(itemRegex)) {
    const position = Number.parseInt(m[1], 10);
    const nameText = stripHtml(m[2]).split(':')[0].trim();
    if (Number.isFinite(position) && nameText) {
      items.push({ position, nameText });
    }
  }

  // Need a real ranked list: 3+ entries, starting at 1, sequential.
  if (items.length < 3 || items[0].position !== 1) return null;
  if (!items.every((it, i) => it.position === i + 1)) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: items.map((it) => ({
      '@type': 'ListItem',
      position: it.position,
      name: it.nameText,
    })),
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
