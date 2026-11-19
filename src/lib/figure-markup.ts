/**
 * The Team App's article figure as markup, checked before the blog draws it. The content engine runs the same
 * checks before it writes one (content-engine scripts/visuals/lib/figure-markup.mjs). Our own tools are the only
 * writers of the CMS, so this guards against a mistake; it is not a sanitizer.
 */

export const FIGURE_MARKUP_START = '<div class="fx-embed">';
export const FIGURE_MARKUP_MAX_CHARS = 40_000;

const FORBIDDEN: ReadonlyArray<readonly [RegExp, string]> = [
  [/<script/i, '<script'],
  [/\son[a-z]+\s*=/i, 'an event attribute'],
  [/javascript:/i, 'javascript:'],
  [/<iframe/i, '<iframe'],
  [/<object/i, '<object'],
  [/<link/i, '<link'],
];

/** The reason the markup may not be drawn, or null when it may. */
export function figureMarkupRefusal(markup: unknown): string | null {
  if (typeof markup !== 'string' || !markup.startsWith(FIGURE_MARKUP_START)) return `does not start with ${FIGURE_MARKUP_START}`;
  if (markup.length > FIGURE_MARKUP_MAX_CHARS) return `is ${markup.length} characters, over the ${FIGURE_MARKUP_MAX_CHARS} limit`;
  for (const [pattern, name] of FORBIDDEN) if (pattern.test(markup)) return `contains ${name}`;
  return null;
}
