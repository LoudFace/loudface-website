/**
 * HTML Parsing Utilities
 *
 * Server-side utilities for splitting CMS RichText HTML at structural
 * boundaries. Extends the regex pattern from extractTocAndAddIds
 * (blog/case-study pages) to support section-level splitting.
 */

export interface ProseSection {
  id: string;
  heading: string;
  summary: string;   // Plain text of first <p> (HTML tags stripped)
  body: string;      // HTML content AFTER the first <p>
  index: number;
}

export interface DeliverableItem {
  title: string;
  description: string;
}

/**
 * Extracts the first <p> from an HTML string.
 * Returns the paragraph text (tags stripped) as `summary`,
 * and the remaining HTML as `rest`.
 */
function extractFirstParagraph(html: string): { summary: string; rest: string } {
  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (pMatch) {
    const summary = pMatch[1].replace(/<[^>]*>/g, '').trim();
    const pEnd = html.indexOf('</p>') + 4;
    const rest = html.slice(pEnd).trim();
    return { summary, rest };
  }
  // No <p> found — use first 200 chars stripped as summary
  const stripped = html.replace(/<[^>]*>/g, '').trim();
  return { summary: stripped.slice(0, 200), rest: html };
}

/**
 * Splits RichText HTML at <h2> boundaries.
 *
 * Each H2 starts a new section. Content before the first H2
 * becomes a preamble section (heading = ''). H3s stay inside
 * their parent H2 section's body.
 *
 * Returns empty array only if html is empty/undefined.
 * Returns a single section with the full HTML if fewer than 2 H2s found.
 */
export function splitProseByH2(html: string | undefined): ProseSection[] {
  if (!html?.trim()) return [];

  // Split on <h2> tags, keeping the delimiter
  const parts = html.split(/(?=<h2[\s>])/i);
  const sections: ProseSection[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    // Try to extract the H2 heading from this part
    const h2Match = part.match(/<h2[^>]*>(.*?)<\/h2>/i);

    if (h2Match) {
      const headingHtml = h2Match[1];
      const heading = headingHtml.replace(/<[^>]*>/g, '').trim();
      const id = `section-${sections.length}-${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

      // Body is everything after the </h2> tag
      const bodyStart = part.indexOf('</h2>') + 5;
      const rawBody = part.slice(bodyStart).trim();

      // Extract first <p> as summary, remainder as body
      const { summary, rest } = extractFirstParagraph(rawBody);

      sections.push({ id, heading, summary, body: rest, index: sections.length });
    } else if (part.trim()) {
      // Preamble content before the first H2
      const { summary, rest } = extractFirstParagraph(part);
      sections.push({ id: 'preamble', heading: '', summary, body: rest, index: sections.length });
    }
  }

  return sections;
}

/* ─── Service mention auto-linking ───────────────────────────────────
 *
 * Adds the first internal-service link for each term inside a body of CMS
 * HTML — so paragraph mentions of "AEO", "CRO", and "Webflow" route readers
 * (and AI crawlers extracting entity relationships) to the relevant service
 * page. Each term is linked at most once per article: the first occurrence
 * wins, subsequent mentions stay as plain text to keep the prose readable.
 *
 * Skips:
 *   - Anchors already wrapping the term (`<a>...AEO...</a>`)
 *   - Code / pre blocks
 *   - Headings (we only enter <p>, <li>, <td> blocks)
 *   - HTML tag attributes (split-on-tags tokenization sees attrs as part of
 *     the opening tag, never as a text segment)
 */

interface ServiceLinkRule {
  /** Word-boundary-anchored regex matching one occurrence (no /g flag — handled below). */
  pattern: RegExp;
  /** Internal pathname to link to. */
  href: string;
}

const SERVICE_LINK_RULES: ReadonlyArray<ServiceLinkRule> = [
  { pattern: /\bAEO\b/, href: '/services/seo-aeo' },
  { pattern: /\bCRO\b/, href: '/services/cro' },
  { pattern: /\bWebflow\b/, href: '/services/webflow' },
];

const FORBIDDEN_LINK_PARENTS = new Set(['a', 'code', 'pre']);

/**
 * Replace the first occurrence of `pattern` in `html` with an anchor
 * pointing to `href`, skipping text inside <a>, <code>, <pre>.
 * Returns null if no replacement was made.
 */
function linkFirstOccurrence(
  html: string,
  pattern: RegExp,
  href: string,
): string | null {
  // Tokenise into alternating tags / text segments. Tags appear as a single
  // token starting with '<'; everything else is text the user can read.
  const tokens = html.split(/(<[^>]+>)/);
  let depth = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (token.startsWith('<')) {
      const tagMatch = token.match(/^<\s*(\/?)\s*(\w+)/);
      if (!tagMatch) continue;
      const [, slash, rawName] = tagMatch;
      const tagName = rawName.toLowerCase();
      if (!FORBIDDEN_LINK_PARENTS.has(tagName)) continue;
      // Self-closing tag (e.g. <a/>) doesn't change depth.
      if (token.endsWith('/>')) continue;
      depth = slash ? Math.max(0, depth - 1) : depth + 1;
      continue;
    }

    if (depth > 0) continue; // inside forbidden parent
    const match = token.match(pattern);
    if (!match || match.index === undefined) continue;

    const before = token.slice(0, match.index);
    const after = token.slice(match.index + match[0].length);
    tokens[i] = `${before}<a href="${href}">${match[0]}</a>${after}`;
    return tokens.join('');
  }

  return null;
}

/** Detect service hrefs the article already links to so we don't double-link. */
function detectExistingServiceLinks(html: string): Set<string> {
  const found = new Set<string>();
  for (const rule of SERVICE_LINK_RULES) {
    const escaped = rule.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const anchorRegex = new RegExp(`<a[^>]+href=(?:"|')${escaped}(?:"|')`, 'i');
    if (anchorRegex.test(html)) {
      found.add(rule.href);
    }
  }
  return found;
}

/**
 * Add internal-service links for first mentions of AEO / CRO / Webflow
 * inside paragraph-like blocks (`<p>`, `<li>`, `<td>`). Each service is
 * linked at most once per article; subsequent mentions remain plain text.
 *
 * Existing anchors pointing to the service hrefs short-circuit the rule —
 * if the author already linked "AEO" once in the post, the auto-linker
 * leaves the rest alone instead of stacking a second link.
 *
 * Pass `skipHrefs` to suppress linking on pages where the URL would loop
 * the reader back to themselves (e.g. don't link "Webflow" on the
 * /services/webflow page itself).
 */
export function autoLinkServiceMentions(
  html: string | undefined,
  skipHrefs: ReadonlySet<string> = new Set(),
): string {
  if (!html) return html ?? '';

  const linked = new Set<string>([
    ...skipHrefs,
    ...detectExistingServiceLinks(html),
  ]);

  // Short-circuit when every service is already accounted for.
  if (linked.size >= SERVICE_LINK_RULES.length) return html;

  return html.replace(
    /<(p|li|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (block, tag: string, attrs: string, inner: string) => {
      let updated = inner;
      for (const rule of SERVICE_LINK_RULES) {
        if (linked.has(rule.href)) continue;
        const next = linkFirstOccurrence(updated, rule.pattern, rule.href);
        if (next !== null) {
          updated = next;
          linked.add(rule.href);
        }
      }
      return updated === inner ? block : `<${tag}${attrs}>${updated}</${tag}>`;
    },
  );
}

/**
 * Wrap every `<pre>...</pre>` block with a code-block container that has
 * a header band showing the detected language + a copy affordance.
 *
 * Detects the language from a `language-*` class on the inner `<code>` (the
 * standard convention for Markdown-derived HTML). Falls back to "code".
 *
 * The copy button is wired up by a small client island at runtime; the
 * server only emits markup with `data-copy` so the island can find it.
 */
export function wrapCodeBlocks(html: string | undefined): string {
  if (!html) return '';
  return html.replace(
    /<pre\b([^>]*)>([\s\S]*?)<\/pre>/gi,
    (_match, preAttrs: string, inner: string) => {
      // Detect language from `class="language-foo"` on the inner <code>
      const langMatch = inner.match(/<code[^>]*class="[^"]*language-([\w-]+)/i);
      const lang = langMatch ? langMatch[1] : 'code';
      const labelText = lang === 'code' ? 'Snippet' : lang.toUpperCase();
      // Preserve the original <pre>...</pre> verbatim so it keeps its
      // classes, attributes, and inner code highlighting (if any).
      return `<div class="code-block" data-lang="${escapeHtml(lang)}">
        <div class="code-block__head">
          <span class="code-block__lang">${escapeHtml(labelText)}</span>
          <button class="code-block__copy" type="button" data-copy aria-label="Copy code to clipboard">Copy</button>
        </div>
        <pre${preAttrs}>${inner}</pre>
      </div>`;
    },
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Extract a TL;DR-style direct answer from the article body HTML.
 *
 * Strategy:
 *   1. Look for the first paragraph whose text starts with "TL;DR:" or
 *      contains a leading <strong>TL;DR</strong> / <b>TL;DR</b>. Lift the
 *      text after the marker.
 *   2. Fall back to the first paragraph of the article that's at least 20
 *      words long.
 *   3. Trim to ~75 words so the rendered block stays tight.
 *
 * Used as a graceful fallback for posts that don't yet have a curated
 * `directAnswer` field in the CMS. Strips inline HTML — DirectAnswer
 * renders plain text only.
 *
 * Returns `null` when no usable paragraph exists.
 */
export function extractDirectAnswer(html: string | undefined): string | null {
  if (!html) return null;

  const tldrRegex =
    /<p\b[^>]*>\s*(?:<(?:strong|b)[^>]*>\s*)?TL;DR[:\s]*(?:<\/(?:strong|b)>)?\s*([\s\S]*?)<\/p>/i;
  const tldrMatch = html.match(tldrRegex);
  if (tldrMatch) {
    const txt = tldrMatch[1].replace(/<[^>]*>/g, '').trim();
    if (txt.length > 20) {
      return truncateWords(txt, 75);
    }
  }

  // Fallback: first paragraph with >= 20 words.
  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length >= 20) {
      return truncateWords(text, 75);
    }
  }

  return null;
}

function truncateWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text.trim();
  return words.slice(0, max).join(' ') + '…';
}

/**
 * Remove a TL;DR paragraph from the article body. Used together with the
 * DirectAnswer extraction above so the same span doesn't render twice —
 * once in the DirectAnswer block, again as the article's opening
 * paragraph. Conservative: only strips the FIRST paragraph that starts with
 * the TL;DR marker. Other "TL;DR" mentions deeper in the body are kept.
 */
export function stripFirstTldr(html: string | undefined): string {
  if (!html) return '';
  return html.replace(
    /<p\b[^>]*>\s*(?:<(?:strong|b)[^>]*>\s*)?TL;DR[:\s]*(?:<\/(?:strong|b)>)?[\s\S]*?<\/p>\s*/i,
    '',
  );
}

/**
 * Extracts deliverable items from a <ul><li> HTML structure.
 *
 * Expected format:
 *   <li><strong>Title</strong> — Description text...</li>
 *
 * Returns empty array if parsing fails or HTML has no list items.
 */
export function parseDeliverableItems(html: string | undefined): DeliverableItem[] {
  if (!html?.trim()) return [];

  const items: DeliverableItem[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;

  while ((match = liRegex.exec(html)) !== null) {
    const content = match[1].trim();
    const strongMatch = content.match(/<strong>([\s\S]*?)<\/strong>/i);

    if (strongMatch) {
      const title = strongMatch[1].replace(/<[^>]*>/g, '').trim();
      // Get everything after </strong>, strip leading separator (—, -, :)
      const afterStrong = content.slice(content.indexOf('</strong>') + 9);
      const description = afterStrong.replace(/^\s*[—–\-:]\s*/, '').trim();
      items.push({ title, description });
    } else {
      // No <strong> tag — use the whole content as description
      const text = content.replace(/<[^>]*>/g, '').trim();
      if (text) {
        items.push({ title: text, description: '' });
      }
    }
  }

  return items;
}
