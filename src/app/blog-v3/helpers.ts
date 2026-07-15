/** blog-v3 shared, framework-free helpers. */

/** Monogram initials from a display name (max 2 chars), for the no-photo avatar. */
export function initials(name?: string | null): string {
  if (!name) return 'LF';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'LF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "Apr 28, 2026" — the site-wide short date format used on the old blog template. */
export function formatShortDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Per-article AI "explore / verify" deep links (passive AEO surface). */
export function aiExploreLinks(articleUrl: string): { name: string; ic: string; href: string }[] {
  const summarize = `Summarize the key insights from "${articleUrl}"`;
  const plain = `Summarize ${articleUrl}`;
  return [
    { name: 'ChatGPT', ic: 'GP', href: `https://chatgpt.com/?prompt=${encodeURIComponent(summarize)}` },
    { name: 'Claude', ic: 'C', href: `https://claude.ai/new?q=${encodeURIComponent(summarize)}` },
    { name: 'Perplexity', ic: 'P', href: `https://www.perplexity.ai/search/new?q=${encodeURIComponent(summarize)}` },
    { name: 'Google AI', ic: 'G', href: `https://www.google.com/search?udm=50&q=${encodeURIComponent(plain)}` },
    { name: 'Grok', ic: 'Gr', href: `https://grok.com/?q=${encodeURIComponent(plain)}` },
  ];
}

/** Rough spoken-read estimate for the answer card, rounded to 5s, floored at 15s. */
export function answerReadSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(15, Math.round(words / 2 / 5) * 5);
}
