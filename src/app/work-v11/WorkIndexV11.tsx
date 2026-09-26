import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { HomeV11Content, WorkV11Content } from '@/lib/content-utils';
import type { HomeV11Data } from '../home-v11/data';
import { ServiceResults } from '../service-v11/proof';
import type { CaseStudy, Client } from '@/lib/types';
import { getTintColors } from '@/lib/color-utils';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { KeyResults } from '../home-v11/KeyResults';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, ArrowUpRight, SectionHeadNode } from '../home-v11/ui';
import { splitTitle } from '../case-v11/series';
import { strip } from '@/lib/inline-edit/mark';
import { cachedCmsImage, cachedCmsSrcSet } from '@/lib/image-utils';

/**
 * The /case-studies index in v11 (DESIGN.md §6, §7). Copy in src/data/content/work-v11.json; every card is a live
 * Sanity study. References from the 2026-09-25 harvest (design-lab/harvest/2026-09-25/services-hub, work-tagged):
 * a big title over a mosaic of stories (174 Ramp), cards on the client's own colour (185 Maze) and a filter row over
 * grouped stories (153 Retool). The hero's picture is the page's promise ("receipts attached"): the flagship studies'
 * own published charts, in the result cells the service pages use (2026-09-25; replaced four drawn paper receipts).
 */

type Study = CaseStudy & { id: string };

const DISCIPLINES = ['AI Search & Organic Growth', 'Conversion Optimization', 'Web Design & Branding'];
const DISCIPLINE_ID: Record<string, string> = {
  'AI Search & Organic Growth': 'ai-search', 'Conversion Optimization': 'conversion', 'Web Design & Branding': 'web-design',
};
const FALLBACK = 'Web Design & Branding';
const THUMB = '?w=1000&h=625&fit=crop&crop=top&fm=webp&q=80';

const nameOf = (s: Study, clients: Map<string, Client>) => (s.client && clients.get(s.client)?.name) || s.name.split(':')[0].trim();
const primary = (s: Study) => (Array.isArray(s.disciplines) && s.disciplines[0]) || FALLBACK;

function Card({ s, clients, lead, cta }: { s: Study; clients: Map<string, Client>; lead?: boolean; cta: string }) {
  const name = nameOf(s, clients);
  const t = getTintColors(s['client-color']);
  const r = s['result-1---title'] ? splitTitle(s['result-1---title']) : undefined;
  const logo = s['client-logo']?.url;
  const thumb = s['main-project-image-thumbnail']?.url;
  return (
    <Link href={`/case-studies/${s.slug}`} className={`wk-card ${lead ? 'is-lead' : ''}`} style={{ '--c-base': t.base, '--c-glow': t.glow, '--c-clear': t.clear } as CSSProperties}>
      <div className="wk-card-pic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {thumb && <img src={cachedCmsImage(`${thumb}${THUMB}`, 1080)} srcSet={cachedCmsSrcSet(`${thumb}${THUMB}`, [640, 1080])} sizes="(max-width: 767px) 92vw, 50vw" alt={s['main-project-image-thumbnail']?.alt || name} loading="lazy" width={1000} height={625} />}
      </div>
      <div className="wk-card-body">
        <div className="wk-card-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? <img loading="lazy" className="wk-card-logo" src={cachedCmsImage(logo, 384)} alt={name} /> : <span className="wk-card-name">{name}</span>}
          <span className="wk-card-go" aria-hidden="true"><ArrowUpRight /></span>
        </div>
        {s['result-1---number'] && (
          <div className="wk-card-result">
            <b>{s['result-1---number']}</b>
            {r && <span>{r.label}</span>}
          </div>
        )}
        <p className="wk-card-title">{s['project-title'] || s.name}</p>
        {lead && s['paragraph-summary'] && <p className="wk-card-sum">{s['paragraph-summary']}</p>}
        {lead && <span className="wk-card-cta">{cta}<ArrowRight /></span>}
      </div>
    </Link>
  );
}

export function WorkIndexV11({ c, home, data, studies, clients }: { c: WorkV11Content; home: HomeV11Content; data: HomeV11Data | null; studies: Study[]; clients: Map<string, Client> }) {
  const list = studies.filter((s) => s.slug);
  const groups = DISCIPLINES.map((d) => ({
    d,
    items: list
      .filter((s) => (DISCIPLINES.includes(primary(s)) ? primary(s) : FALLBACK) === d)
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
  })).filter((g) => g.items.length);
  return (
    <div className="v11 wk">
      {/* 1 · the promise, then its proof: the flagship studies' published charts */}
      <section className="wk-hero" data-hero="light">
        <div className="v11-wrap wk-hero-grid">
          <div className="wk-hero-copy">
            <div className="wk-hero-eyebrow"><span>{c.hero.eyebrow}</span><span className="is-sub">{list.length} {c.hero.studiesLabel}</span></div>
            <h1>{c.hero.headline} <span className="ghost">{c.hero.headlineHighlight}</span></h1>
            <p>{c.hero.description}</p>
            <div className="wk-hero-ctas">
              <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{c.hero.ctaText}</span></a>
              <a href="#archive" className="v11-link wk-tap"><span>{c.hero.jumpText}</span><ArrowRight /></a>
            </div>
          </div>
        </div>
        <div className="v11-wrap wk-hero-proof" aria-label={strip(c.hero.receiptLabel)}>
          <ServiceResults slug="case-studies" home={home} data={data} />
        </div>
      </section>

      {/* 2 · the archive, grouped by what the study was for (153 Retool filter row, 185 Maze cards) */}
      <section className="v11-sec v11-white wk-archive" id="archive">
        <div className="v11-wrap">
          <div className="wk-filter" aria-label={strip(c.archive.filterLabel)}>
            <span className="is-label">{c.archive.filterLabel}</span>
            <a href="#archive" className="wk-chip is-on"><span>{c.archive.allLabel}</span><b>{list.length}</b></a>
            {groups.map((g) => <a key={g.d} href={`#${DISCIPLINE_ID[g.d]}`} className="wk-chip"><span>{g.d}</span><b>{g.items.length}</b></a>)}
          </div>
          {groups.map((g, gi) => (
            <div key={g.d} className="wk-group" id={DISCIPLINE_ID[g.d]}>
              <div className="wk-group-head"><h2>{g.d}</h2><span>{g.items.length} {c.hero.studiesLabel}</span></div>
              <div className="wk-grid">
                {g.items.map((s, i) => <Card key={s.slug} s={s} clients={clients} lead={gi === 0 && i === 0} cta={c.archive.caseLinkText} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <LogoGrid c={home.logos} />

      {/* 3 · the numbers we stand behind, and how to read the studies */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap">
          <SectionHeadNode eyebrow={c.proof.eyebrow} title={<>{c.proof.headline} <span className="ghost">{c.proof.headlineHighlight}</span></>} body={c.proof.body} bodyWidth={440} />
          <KeyResults items={c.proof.items.slice(0, 3).map((k) => ({ value: k.value, label: k.label }))} />
          <KeyResults items={c.proof.items.slice(3).map((k) => ({ value: k.value, label: k.label, note: k.note }))} />
          <div className="wk-read">
            <div className="wk-read-main">
              <h3>{c.receipts.headline} <span className="ghost">{c.receipts.headlineHighlight}</span></h3>
              <p>{c.receipts.body}</p>
            </div>
            <ul className="wk-read-points">
              {c.receipts.points.map((p) => <li key={p.title}><b>{p.title}</b><span>{p.text}</span></li>)}
            </ul>
          </div>
        </div>
      </section>

      <Closing c={{ ...home.closing, heading: c.closing.heading }} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
