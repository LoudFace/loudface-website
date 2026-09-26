import type { ReactNode } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import type { HomeV11Data, Series } from '../home-v11/data';
import { ResultCase } from '../home-v11/ResultCase';
import { VideoCard } from '../home-v11/Testimonials';
import type { ValueFormat } from '../home-v11/LiveChart';

/**
 * A service page's proof, in the homepage's own parts (DESIGN.md §2, §7): one feature result and three smaller
 * ones (`ResultCase`, as the homepage "Results" section), then the client voices (`VideoCard`, `QuoteCard`), each
 * picked per service from the same verified pool the homepage draws on. Copy comes from home-v11.json.
 */

type Key = 'delshadSearch' | 'genieSearch' | 'tmClicks' | 'lfAi' | 'stealthAi' | 'genieLeads' | 'delshadLeads';

interface Pick {
  series: (d: HomeV11Data) => Series;
  href: string;
  icon?: string;
  square?: boolean;
  pin: boolean;
  format: ValueFormat;
  /** Where the words come from: a homepage results case (its claim) and a hero slide. */
  from: { cases?: number; slide: number };
  /** The chart is the slide's series, not the case's: the number, label and source come from the slide. */
  own?: boolean;
}

const POOL: Record<Key, Pick> = {
  delshadSearch: { series: (d) => d.results.delshad, href: '/case-studies/delshad-legal-content-engine', icon: 'logos/delshad-icon.jpeg', pin: true, format: 'index', from: { cases: 0, slide: 2 } },
  genieSearch: { series: (d) => d.results.genie, href: '/case-studies/genie-teacher-organic-growth', icon: 'logos/genie-icon.png', pin: true, format: 'index', from: { cases: 1, slide: 1 } },
  tmClicks: { series: (d) => d.hero.tm, href: '/case-studies/trademomentum-niche-aeo-organic-growth', icon: 'logos/trademomentum-icon.png', square: true, pin: true, format: 'indexWeek', from: { cases: 2, slide: 3 } },
  lfAi: { series: (d) => d.results.lf, href: '/case-studies/loudface-aeo-case-study', pin: false, format: 'pct', from: { cases: 3, slide: 0 } },
  stealthAi: { series: (d) => d.hero.stealth, href: '/case-studies/stealth-fintech-ai-visibility', icon: 'logos/anonymous-icon.svg', pin: false, format: 'pct', from: { slide: 4 } },
  genieLeads: { series: (d) => d.hero.genieLeads, href: '/case-studies/genie-teacher-organic-growth', icon: 'logos/genie-icon.png', pin: true, format: 'index', from: { slide: 5 } },
  delshadLeads: { series: (d) => d.hero.delshad, href: '/case-studies/delshad-legal-content-engine', icon: 'logos/delshad-icon.jpeg', pin: true, format: 'index', from: { cases: 0, slide: 2 }, own: true },
};

/** Which results each service shows, one client per cell; the first is the feature. Build services lead with
 *  leads, search services with visibility. A one-week spike (genieLeads) never leads. */
const RESULTS: Record<string, Key[]> = {
  cro: ['delshadLeads', 'genieLeads', 'tmClicks', 'lfAi'],
  webflow: ['genieSearch', 'delshadLeads', 'tmClicks', 'stealthAi'],
  'ux-ui-design': ['delshadLeads', 'genieSearch', 'tmClicks', 'lfAi'],
  copywriting: ['delshadLeads', 'genieLeads', 'tmClicks', 'lfAi'],
  'seo-aeo': ['lfAi', 'genieSearch', 'tmClicks', 'stealthAi'],
  'organic-growth': ['delshadSearch', 'genieSearch', 'tmClicks', 'lfAi'],
  'geo-agency': ['lfAi', 'stealthAi', 'delshadSearch', 'genieSearch'],
  'ai-overviews': ['lfAi', 'genieSearch', 'delshadSearch', 'tmClicks'],
  'growth-autopilot': ['genieSearch', 'delshadLeads', 'lfAi', 'tmClicks'],
  /** The case studies index hero: the flagship studies' own published charts. */
  'case-studies': ['lfAi', 'genieSearch', 'delshadLeads', 'tmClicks'],
  /** The industry pages (/seo-for/*): the vertical's own client leads where one has a published series. */
  /** The industry hub: the flagship studies, each from a different market. */
  'seo-for-hub': ['delshadLeads', 'lfAi', 'tmClicks', 'stealthAi'],
  /** The long reads sit under the homepage's "Measured in leads" heading, so leads lead. */
  'seo-for-hr-tech': ['delshadLeads', 'genieSearch', 'tmClicks', 'lfAi'],
  'seo-for-ai-startups': ['delshadLeads', 'lfAi', 'stealthAi', 'tmClicks'],
  'seo-for-edtech': ['delshadLeads', 'genieSearch', 'tmClicks', 'lfAi'],
  'seo-for-saas': ['tmClicks', 'delshadLeads', 'stealthAi', 'genieLeads'],
  'seo-for-b2b': ['delshadLeads', 'lfAi', 'genieSearch', 'tmClicks'],
  'seo-for-fintech': ['stealthAi', 'lfAi', 'tmClicks', 'genieSearch'],
  'seo-for-startups': ['genieSearch', 'tmClicks', 'delshadLeads', 'lfAi'],
  'seo-for-ecommerce': ['tmClicks', 'genieSearch', 'delshadLeads', 'lfAi'],
  'seo-for-healthcare': ['delshadSearch', 'genieSearch', 'tmClicks', 'lfAi'],
  'seo-for-cybersecurity': ['lfAi', 'stealthAi', 'genieSearch', 'tmClicks'],
  'seo-for-devtools': ['lfAi', 'genieSearch', 'tmClicks', 'delshadLeads'],
};

const slugOf = (k: Key) => POOL[k].href.split('/').pop() as string;
/** Filled in this order when a page's own set loses cells to `avoid`. */
const FALLBACK: Key[] = ['lfAi', 'tmClicks', 'delshadLeads', 'genieSearch', 'stealthAi', 'delshadSearch', 'genieLeads'];
/** A peaked series and a one-week spike never lead (their feature captions do not read as a trend). */
const NO_LEAD: Key[] = ['stealthAi', 'genieLeads'];

/**
 * The four results a page shows, one client per cell. `avoid` takes case-study slugs and result keys already shown
 * elsewhere on the page (a hero card, a tile chart), so no figure appears twice; lost cells refill from FALLBACK.
 * With no `avoid` a service page's own set comes back unchanged.
 */
export function resultKeys(slug: string, avoid: string[] = []): Key[] {
  const out: Key[] = [];
  const clients = new Set<string>();
  for (const k of [...(RESULTS[slug] ?? RESULTS['seo-aeo']), ...FALLBACK]) {
    const s = slugOf(k);
    if (avoid.includes(k) || avoid.includes(s) || clients.has(s)) continue;
    out.push(k);
    clients.add(s);
    if (out.length === 4) break;
  }
  const lead = out.findIndex((k) => !NO_LEAD.includes(k));
  if (lead > 0) out.unshift(...out.splice(lead, 1));
  return out;
}
/** The case-study slugs behind a page's results, for the sections after them to avoid. */
export const resultSlugs = (slug: string, avoid: string[] = []) => resultKeys(slug, avoid).map(slugOf);

export function ServiceResults({ slug, home, data, avoid }: { slug: string; home: HomeV11Content; data: HomeV11Data | null; avoid?: string[] }): ReactNode {
  const keys = resultKeys(slug, avoid);
  return (
    <div className="v11-rgrid">
      {keys.map((k, i) => {
        const p = POOL[k];
        const slide = home.hero.slides[p.from.slide];
        const kase = p.from.cases !== undefined ? home.results.cases[p.from.cases] : undefined;
        const caseWords = p.own ? undefined : kase;
        return (
          <ResultCase
            key={k}
            feature={i === 0}
            icon={p.icon}
            square={p.square}
            href={p.href}
            linkLabel={home.results.caseLink}
            client={slide.client}
            claim={kase?.claim ?? (i === 0 ? slide.caption : <>{slide.metric} {slide.caption}</>)}
            metric={i === 0 ? (caseWords?.metric ?? slide.metric) : undefined}
            metricLabel={i === 0 ? (caseWords?.metricLabel ?? (kase ? slide.caption : <>{home.results.against} {slide.tip}</>)) : undefined}
            chartLabel={caseWords?.chartLabel ?? slide.tag}
            source={caseWords?.source}
            series={data ? p.series(data) : null}
            format={p.format}
            tip={slide.tip}
            pin={p.pin}
          />
        );
      })}
    </div>
  );
}

/** The three client videos in one row (kept for pages whose proof grid has no videos). */
export function ServiceVoices({ home }: { home: HomeV11Content }): ReactNode {
  return (
    <div className="v11-cards3">
      {home.testimonials.videos.map((v, i) => <VideoCard key={i} v={v} i={i} />)}
    </div>
  );
}
