/**
 * Layout-only passes over a case study's article HTML. They move or drop whole blocks the page already shows
 * elsewhere; they never change a word.
 */

/** The article's opening "Short answer:" paragraph repeats the summary the page leads with; drop that one block. */
export function dropShortAnswer(html: string): { html: string; dropped: boolean } {
  const m = html.match(/^\s*<p[^>]*>\s*<strong>\s*Short answer:?\s*<\/strong>[\s\S]*?<\/p>/i);
  if (!m) return { html, dropped: false };
  return { html: html.slice(m[0].length), dropped: true };
}

/** Wide figures: images in the article break out of the text column. */
export function markWideFigures(html: string): string {
  return html.replace(/<figure(?![^>]*class=)([^>]*)>/gi, '<figure class="cs-wide"$1>').replace(/<p>\s*(<img[^>]+>)\s*<\/p>/gi, '<figure class="cs-wide">$1</figure>');
}
