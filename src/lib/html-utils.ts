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
