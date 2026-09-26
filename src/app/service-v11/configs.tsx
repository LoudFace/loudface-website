import { getServiceConfig, type ServiceConfig } from '../service-v3/data';
import { AI_OVERVIEWS_BODY_HTML } from '../service-v3/ai-overviews-body';

/**
 * v11 config overrides. /services/ai-overviews was an article on a service URL (2026-09-24, Arnel: "is that really
 * a service page, or is it a blog article?"). The v11 service page is built from sentences lifted verbatim from the
 * verified article (spine-id a2a04f97-6633-4f55-ae3c-00f21c24a213); the only new words are the short tile and
 * pillar labels. The article itself moves to the blog, unchanged, through the content engine.
 */
const base = getServiceConfig('ai-overviews')!;

const aiOverviews: ServiceConfig = {
  ...base,
  body: undefined,
  deliver: {
    title: <>What we do for <span className="ghost">AI Overviews.</span></>,
    lede: 'This runs inside one program across SEO, AEO and GEO, content and the site itself, on a single retainer, rather than as a separate vendor bolted onto the others.',
    tiles: [
      { title: 'Fan-out mapping, and knowing where to stop', desc: 'We record the sub-queries the models actually issue around your buying questions, then check which of them your existing pages already answer well and which are genuinely uncovered.' },
      { title: 'Eligibility, checked at both levels', desc: 'The site level first: inclusion in Search generative AI features, which is a Search Console setting and a hard gate on display. Then page by page: indexed, crawlable, and free of the preview controls that quietly remove you.' },
      { title: 'Extraction structure', desc: 'A self-sufficient answer near the top of each page, tables where the answer is comparative, and headings that match the sub-query rather than the head term.' },
      { title: 'Entity clarity', desc: 'One consistent description of what your product is and who it is for, across your own pages and the third-party pages the models retrieve alongside them.' },
      { title: 'Freshness on the pages that earn it', desc: 'AI Overviews sit on the live index, so a correction to a retrieved page can change an answer in days. We use that where it pays and leave the rest alone.' },
      { title: 'Structured data kept honest', desc: 'We keep it because it earns rich results, and we keep the markup matching the visible page, which is what Google asks. We do not sell it as an AI lever, because Google says it is not one.' },
    ],
  },
  runway: {
    title: <>What you get, <span className="ghost">and when.</span></>,
    lede: 'Kickoff is within 48 hours of signature.',
    pillars: [
      { kind: 'row', fig: 0, title: 'The first week', desc: 'Access is set up, the Scoreboard goes live, and the first fixes and calibration articles ship in the same week. You meet the delivery team and see shipped work inside five days.' },
      { kind: 'card', title: 'Every week after', desc: 'From then on you get the Scoreboard, the live dashboard tracking what is in progress, what shipped and what is next, a weekly showcase of the work before it goes live, more often on the higher tiers, and the Monthly Memo.' },
      { kind: 'row', fig: 1, title: 'AI Overviews on its own line', desc: 'The AI Overviews reading sits in there per prompt, on its own rather than inside a blended cross-engine average.' },
      { kind: 'card', title: 'Pricing', desc: 'Engagements start from $5k a month. Solo Autopilot runs one track, Dual Autopilot two in parallel, and Scale Autopilot three to four concurrent initiatives.' },
    ],
  },
};

const OVERRIDES: Record<string, ServiceConfig> = { 'ai-overviews': aiOverviews };

export function getServiceConfigV11(slug: string): ServiceConfig | undefined {
  return OVERRIDES[slug] ?? getServiceConfig(slug);
}

/** The verified "Who this is not for" list, read from the verified article so it stays verbatim. */
export const AIO_NOT_FOR: string[] = (() => {
  const html = AI_OVERVIEWS_BODY_HTML;
  const at = html.indexOf('<h2>Who this is not for</h2>');
  const list = html.slice(at, html.indexOf('</ul>', at));
  return [...list.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
})();

/** The verified fan-out sentence pair, read from the article so it stays verbatim. */
export const AIO_FANOUT_LEDE: string = (() => {
  const m = AI_OVERVIEWS_BODY_HTML.match(/Google draws the line at intent:[\s\S]*?what not to write\./);
  return (m?.[0] ?? '').replace(/&quot;/g, '"').replace(/<[^>]+>/g, '');
})();
