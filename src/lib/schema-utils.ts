/**
 * Schema Utilities
 *
 * Server-side utilities for generating JSON-LD structured data.
 * Used by blog posts, case studies, and other content pages to add
 * FAQPage, Speakable, and Review schemas for SEO/AEO visibility.
 */

import { splitProseByH2 } from './html-utils';
import type { BlogPost, TeamMember } from './types';

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

/* ─── Ranked-List Extraction (listicles) ───────────────────────── */

/**
 * Titles that promise a ranking: "Best …", "… (Ranked)", "Alternatives to …".
 * Guides, how-tos and "why" posts also number their sections, and a numbered
 * section is not a ranked item, so the title decides whether a post is a
 * ranking at all. Measured 2026-09-29 against all 130 published posts: every
 * ranked listicle matches, no guide or how-to does.
 */
const RANKED_TITLE = /\b(best|ranked|alternatives to)\b/i;

export function isRankedListTitle(title: string | undefined): boolean {
  return !!title && RANKED_TITLE.test(title);
}

const NUMBERED = /^(\d{1,2})[.)]\s+(.+)/;

/**
 * Visible text of an HTML fragment, as the blog renderer shows it: inline tags
 * removed without adding spaces, entities decoded once, curly quotes
 * straightened (blog-v11/view.ts does the same to the body).
 */
function visibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&(nbsp|quot|apos|rsquo|lsquo|amp);/g, (_, name: string) =>
      ({ nbsp: ' ', quot: '"', apos: "'", rsquo: "'", lsquo: "'", amp: '&' })[name] ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The entity a ranked entry names: "LoudFace: best for seed to Series B" is
 * LoudFace. Text before the first colon, or the whole entry when it has none.
 */
function entryName(text: string): string {
  const clean = text.replace(/\s+:/g, ':');
  const colon = clean.indexOf(': ');
  return (colon > 0 ? clean.slice(0, colon) : clean).trim();
}

/**
 * Numbered entries in document order. Returns them only when the numbers read
 * exactly 1, 2, 3 … N as the visitor sees them: a restart (two separate
 * numbered lists), a gap or a reordering means the list is not one ranking,
 * and no schema beats schema that disagrees with the page.
 */
function rankedRun(texts: string[], min: number): string[] {
  const entries: { pos: number; name: string }[] = [];
  for (const text of texts) {
    const numbered = text.match(NUMBERED);
    if (numbered) entries.push({ pos: parseInt(numbered[1], 10), name: entryName(numbered[2]) });
  }
  if (entries.length < min) return [];
  if (!entries.every((entry, i) => entry.pos === i + 1 && entry.name)) return [];
  return entries.map((entry) => entry.name);
}

/** Heading texts at one level. The renderer shows body <h1>s as <h2>s, so level 2 reads both. */
function headingTexts(html: string, level: 2 | 3): string[] {
  const headings = level === 2 ? /<h([12])\b[^>]*>([\s\S]*?)<\/h\1>/gi : /<h(3)\b[^>]*>([\s\S]*?)<\/h3>/gi;
  return Array.from(html.matchAll(headings), (match) => visibleText(match[2]));
}

/** First-column cells of each <table>, one array per table. */
function tableFirstColumns(html: string): string[][] {
  return Array.from(html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi), (table) =>
    Array.from(table[1].matchAll(/<tr[^>]*>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi), (cell) => visibleText(cell[1])),
  );
}

/**
 * Extract ranked entries from listicle HTML, in the order the page shows them.
 * Sources, first match wins:
 *   1. <h3> headings "N. Name: best for …" (three or more)
 *   2. <h2> (or body <h1>, which renders as <h2>) headings "N. Name" (five or
 *      more; the higher bar keeps short numbered how-to sections out)
 *   3. the first <table> whose first column reads "1. Name", "2. Name" …
 *      (three or more), for listicles that rank in a table and describe each
 *      entry in paragraphs, as the proptech post does.
 * Does not judge whether the post is a ranking; buildItemListSchema does that.
 */
export function extractRankedListFromHTML(html: string | undefined): string[] {
  if (!html) return [];

  const h3 = rankedRun(headingTexts(html, 3), 3);
  if (h3.length) return h3;

  const h2 = rankedRun(headingTexts(html, 2), 5);
  if (h2.length) return h2;

  for (const column of tableFirstColumns(html)) {
    const rows = rankedRun(column, 3);
    if (rows.length) return rows;
  }

  return [];
}

/**
 * Build ItemList JSON-LD for ranked listicles. Returns null unless the title
 * promises a ranking and the body carries one clean 1…N ranked list. Items have
 * no url: no ranked entry has its own page on this site.
 */
export function buildItemListSchema(
  html: string | undefined,
  name: string,
  url: string,
): object | null {
  if (!isRankedListTitle(name)) return null;
  const entries = extractRankedListFromHTML(html);
  if (!entries.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: entries.length,
    itemListElement: entries.map((entryName, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entryName,
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
 * Build Dataset JSON-LD for first-party data studies.
 *
 * Opt-in only: emits nothing unless the post carries a `dataset-meta` object
 * with at least a `name` and `description` (set in Studio on original-research
 * posts). Regular blog posts leave the field empty and get no Dataset schema,
 * so this never mislabels an opinion piece as a dataset.
 *
 * Labels the study as original research for Google Dataset Search and AI
 * engines. Every prop is a well-supported schema.org/Dataset property; the
 * editor supplies the research-specific fields (temporalCoverage, the measured
 * variables, the measurement technique) while `creator`, `url`, and
 * `datePublished` are derived from LoudFace + the post so they can't drift.
 */
export function buildDatasetSchema(
  post: BlogPost,
  url: string,
): object | null {
  const meta = post['dataset-meta'];
  if (!meta?.name || !meta?.description) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: meta.name,
    description: meta.description,
    url,
    creator: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: SITE_URL,
    },
    ...(meta.temporalCoverage && { temporalCoverage: meta.temporalCoverage }),
    ...(meta.variableMeasured?.length && { variableMeasured: meta.variableMeasured }),
    ...(meta.measurementTechnique && { measurementTechnique: meta.measurementTechnique }),
    ...(meta.keywords?.length && { keywords: meta.keywords }),
    ...(post['published-date'] && { datePublished: post['published-date'] }),
    ...(meta.license && { license: meta.license }),
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
