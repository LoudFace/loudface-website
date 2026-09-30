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

/** An `id="…"` / `id='…'` / bare `id=x` attribute, including its leading whitespace. */
const ID_ATTRIBUTE = /\s+id\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/** Strips every id attribute out of a tag's raw attribute string. */
export function stripIdAttributes(attrs: string): string {
  return attrs.replace(ID_ATTRIBUTE, '');
}

/** Counts id attributes in a raw open tag. The well-formedness check for id injection. */
export function countIdAttributes(openTag: string): number {
  return (openTag.match(/\sid\s*=/gi) ?? []).length;
}

/**
 * Builds a heading tag carrying exactly one id.
 *
 * Why this exists: the CMS rich-text export ships many headings with a stray
 * `id=""`. The TOC pipelines (blog + case studies) appended their generated id to
 * the heading's existing attributes without stripping that one first, emitting:
 *
 *     <h2 id="" id="section-0-background">
 *
 * An HTML parser keeps the FIRST id on a tag and discards the rest, so every
 * anchor targeting the injected id resolved to nothing: a completely dead table
 * of contents on 20 of 26 case studies and 16 blog posts, on every viewport.
 *
 * The systemic lesson, which is the real reason this is a shared function rather
 * than two inline fixes: regex post-processing of CMS HTML has no well-formedness
 * invariant. Nothing downstream re-parses the output, so an invalid tag ships
 * silently — it looked correct in the source, in review, and in the rendered page,
 * and only the anchors were dead. Any codepath that injects an attribute into CMS
 * HTML should assert its result instead of trusting the concatenation.
 *
 * Honest limitation: `stripIdAttributes` is itself a regex, so a pathological
 * attribute value (`title=" id=x "`) could defeat it. The count check below is the
 * cheap invariant that catches the duplicate case; when it trips we drop the
 * source attrs rather than ship a tag the parser will silently mis-read.
 */
export function buildHeadingWithId(tag: string, attrs: string, id: string, content: string): string {
  let openTag = `<${tag}${stripIdAttributes(attrs)} id="${id}">`;

  if (countIdAttributes(openTag) !== 1) {
    console.error(
      `[html-utils] id injection produced a malformed tag, dropping source attrs: ${openTag}`,
    );
    openTag = `<${tag} id="${id}">`;
  }

  return `${openTag}${content}</${tag}>`;
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

/** Plain text of a cell: tags dropped, whitespace collapsed; entities stay encoded, which is valid inside an attribute. */
function cellText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
}

/** Visible length of a cell's text, counting each entity as one character. */
function visibleLength(text: string): number {
  return text.replace(/&[a-z0-9#]+;/gi, 'x').length;
}

/** Adds an attribute to an open tag unless the tag already carries one of that name. */
function withAttr(openTag: string, name: string, value: string): string {
  if (new RegExp(`\\s${name}\\s*=`, 'i').test(openTag)) return openTag;
  return openTag.replace(/^<([a-z0-9]+)/i, `<$1 ${name}="${value}"`);
}

/**
 * Key column sizes, in characters of its longest cell. Up to SHORT it stays on one line ("Google AI Overviews");
 * up to MID it wraps inside a column no narrower than a rank and its first word ("10. Directive / Consulting"; the
 * longest "N. word" in the corpus on 2026-09-30 was 16 characters, "8. OutreachBloom"); a longer key takes a share.
 */
const SHORT_KEY_CHARS = 20;
const MID_KEY_CHARS = 28;

/**
 * Prepares one CMS table for a phone layout that stacks each row into a card.
 *
 * Every body cell gets `data-label` from its column's header, which the phone CSS prints above the value,
 * `data-num` when it is one figure or range, and `data-short` when a phone card may pair it with another short
 * value (tables of five columns or more). The row whose name is LoudFace gets `data-us`. The table
 * gets `data-cols` (its column count), `data-rank` when its first column holds only rank numbers, and
 * `data-key` ("short" or "mid", see SHORT_KEY_CHARS) for the length of its key column (the first, or the second
 * beside a rank). Only a
 * table with exactly one header row of `<th>` cells, no row headers in the body and no spanning cells is prepared; anything else is returned
 * as it came and keeps the sideways-scrolling frame. Explicit ARIA roles keep the table's semantics once CSS turns
 * its rows into blocks (Chrome and Safari drop the implicit table roles when `display` changes). Only attributes
 * are added, never text, so the inline editor's sentence matching on the body is untouched.
 */
function prepareStackedTable(table: string): { html: string; stacked: boolean } {
  const head = table.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i);
  if (!head || (head[1].match(/<tr\b/gi) ?? []).length !== 1 || /\b(?:colspan|rowspan)\s*=/i.test(table)) {
    return { html: table, stacked: false };
  }
  const labels = [...head[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((m) => cellText(m[1]).replace(/"/g, '&quot;'));
  if (labels.length < 2) return { html: table, stacked: false };

  const headEnd = (head.index ?? 0) + head[0].length;
  // a body row led by a <th> row header would shift every label by one column; keep such a table scrolling
  if (/<th\b/i.test(table.slice(headEnd))) return { html: table, stacked: false };
  const rows = [...table.slice(headEnd).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cellText(cell[1])),
  );
  const column = (i: number) => rows.map((cells) => cells[i] ?? '');
  // every first cell a bare rank ("1", "2.", "#3"): the key column is then the name beside it
  const ranked = rows.length > 0 && column(0).every((text) => /^#?\d{1,3}\.?$/.test(text));
  const keyLength = Math.max(0, ...column(ranked ? 1 : 0).map(visibleLength));
  const keyIndex = ranked ? 1 : 0;
  let rowIndex = 0;
  const body = table.slice(headEnd).replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (row) => {
    const texts = rows[rowIndex++] ?? [];
    let index = 0;
    // our own row is marked, as on the services comparison table (.sv-table tr.is-us)
    const marked = /\bLoudFace\b/.test(texts[keyIndex] ?? '') ? row.replace(/^<tr\b[^>]*>/i, (open) => withAttr(open, 'data-us', '')) : row;
    return marked.replace(/<td\b[^>]*>/gi, (open) => {
      const i = index++;
      const text = texts[i] ?? '';
      let tag = labels[i] ? withAttr(open, 'data-label', labels[i]) : open;
      // a cell that is one figure or range gets tabular figures; prose keeps the font's own (a tabular "1" gapes in "3-12")
      if (i > 0 && visibleLength(text) <= 20 && /^[~≈<>+\-]?[$€£]?\d/.test(text)) tag = withAttr(tag, 'data-num', '');
      // a short value under a short label may share a line with another in a phone card (wide tables only)
      if (i > keyIndex && labels.length >= 5 && visibleLength(text) <= 18 && visibleLength(labels[i] ?? '') <= 18) tag = withAttr(tag, 'data-short', '');
      return tag;
    });
  });

  const withRoles = (part: string, th: 'columnheader' | 'rowheader') =>
    part
      .replace(/<(?:thead|tbody|tfoot)\b[^>]*>/gi, (open) => withAttr(open, 'role', 'rowgroup'))
      .replace(/<tr\b[^>]*>/gi, (open) => withAttr(open, 'role', 'row'))
      .replace(/<th\b[^>]*>/gi, (open) => withAttr(open, 'role', th))
      .replace(/<td\b[^>]*>/gi, (open) => withAttr(open, 'role', 'cell'));
  let html = withRoles(table.slice(0, headEnd), 'columnheader') + withRoles(body, 'rowheader');
  html = html.replace(/^<table\b[^>]*>/i, (open) => {
    let marked = withAttr(withAttr(withAttr(open, 'role', 'table'), 'data-stack', ''), 'data-cols', String(labels.length));
    if (ranked) marked = withAttr(marked, 'data-rank', '');
    if (keyLength <= SHORT_KEY_CHARS) return withAttr(marked, 'data-key', 'short');
    return keyLength <= MID_KEY_CHARS ? withAttr(marked, 'data-key', 'mid') : marked;
  });
  return { html, stacked: true };
}

/**
 * Wraps every table in an article body in `.blog-table-wrap` (the card frame, and the sideways scroll for a table
 * wider than the column) and prepares it for the phone card layout (`prepareStackedTable`). Inline `style`
 * attributes on table parts come from pasted HTML in three posts and would override the house table style, so they
 * are dropped; an empty `<caption>` (an editor artefact) is removed.
 */
export function prepareBodyTables(html: string): string {
  return html.replace(/<table\b[\s\S]*?<\/table>/gi, (raw) => {
    const clean = raw
      .replace(/(<(?:table|caption|thead|tbody|tfoot|tr|th|td)\b[^>]*?)\s+style\s*=\s*(?:"[^"]*"|'[^']*')/gi, '$1')
      .replace(/<caption\b[^>]*>(?:\s|&nbsp;|<\/?p>|<br\s*\/?>)*<\/caption>/gi, '');
    const { html: table, stacked } = prepareStackedTable(clean);
    return `<div class="blog-table-wrap${stacked ? ' is-stack' : ''}">${table}</div>`;
  });
}
