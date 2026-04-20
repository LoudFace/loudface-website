/**
 * Utilities for extracting structure from blog post HTML bodies.
 * Used by the planner (to show H2s to Claude) and by the renderer.
 */

export interface ArticleOutline {
  h2s: { index: number; text: string }[];
  paragraphCount: number;
  wordCount: number;
}

export function outline(html: string): ArticleOutline {
  const h2s: { index: number; text: string }[] = [];
  let index = 0;
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  while ((match = h2Regex.exec(html)) !== null) {
    index += 1;
    h2s.push({ index, text: stripTags(match[1]).trim() });
  }
  const paragraphCount = (html.match(/<p[^>]*>/gi) ?? []).length;
  const text = stripTags(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return { h2s, paragraphCount, wordCount };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

/**
 * Plain-text skeleton for passing to the planner. H2s are prefixed with their
 * 1-based index so Claude can reference them in position anchors.
 */
export function toPlannerMarkdown(html: string, title: string): string {
  let index = 0;
  const annotated = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner) => {
    index += 1;
    const clean = stripTags(inner).trim();
    return `\n\n## [H2 #${index}] ${clean}\n\n`;
  });
  const plain = stripTags(annotated)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return `# ${title}\n\n${plain}`;
}
