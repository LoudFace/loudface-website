import type { ReactNode } from 'react';
import Link from 'next/link';
import type { HomeV11Content, IndustryV11Content } from '@/lib/content-utils';
import { ChatWindow } from '../home-v11/Bento';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { KeyResults } from '../home-v11/KeyResults';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import type { HomeV11Data } from '../home-v11/data';
import { ArrowRight, ArrowUpRight, Eyebrow, LfMark } from '../home-v11/ui';
import { ServiceResults, resultSlugs } from '../service-v11/proof';
import { TileChart } from '../service-v11/pages/growth-autopilot';
import { Wireframe } from '../service-v11/pages/shared';
import { RelatedIndustries } from './related';
import type { IndustryView } from './types';
import type { HubCard } from './views';
import { IndustryVoices } from './voices';
import { cachedCmsImage } from '@/lib/image-utils';

/**
 * IndustryPageV11: the /seo-for/<industry> template in v11 (2026-09-26). A service for one market, so it shares the
 * service template's parts (program tiles, live results, the program sheet on the brand plate, the proof grid) and
 * opens on its own picture: the work for that market, as the case studies' covers with their published results.
 * Each section is built against a tile from design-lab/harvest/2026-09-26/industry (contact-sheets.pdf), named in the
 * comment above it. Copy is the page's own (its JSON or Sanity document); industry-v11.json holds the labels and the
 * example AI answer each market's problem section shows.
 */

function Head({ eyebrow, title, lede }: { eyebrow?: string; title: ReactNode; lede?: ReactNode }) {
  return (
    <div className="sv-head">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="v11-h2">{title}</h2>
      </div>
      {lede && <p>{lede}</p>}
    </div>
  );
}

const TONES = ['is-ind', 'is-lav', 'is-peach'];

export function IndustryPageV11({ v, c, home, data, related }: { v: IndustryView; c: IndustryV11Content; home: HomeV11Content; data: HomeV11Data | null; related: HubCard[] }) {
  const L = c.labels;
  // no client figure twice on one page: results skip the hero's studies and the tiles' charts, voices skip both
  const shown = [...v.work.map((w) => w.slug), ...(v.layers?.length ? ['genieSearch', 'lfAi'] : [])];
  const resultsKey = `seo-for-${v.key}`;
  const voicesAvoid = [...shown, ...resultSlugs(resultsKey, shown)];
  const t = home.testimonials;
  const s = home.hero.slides;
  const chat = (c.chat as Record<string, HomeV11Content['bento']['chat']>)[v.key] ?? c.chat.saas;
  const sections: { key: string; node: ReactNode }[] = [];

  // 2 · why this market stalls: the example answer beside the three problems (03-A Deel challenges, 03-C Ramp reasons)
  sections.push({
    key: 'pain',
    node: (
      <div className="v11-wrap">
        <Head eyebrow={L.painEyebrow} title={v.painTitle} lede={v.painLede} />
        <div className="in-pain">
          <figure className="in-pain-pic">
            <div className="in-pain-ground"><ChatWindow c={chat} sourceIcon={null} /></div>
            <figcaption>{L.chatCaption}</figcaption>
          </figure>
          <ol className="in-pains">
            {v.pains.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                {p.sub && <p className="is-sub">{p.sub}</p>}
                <p>{p.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    ),
  });

  // 3 · the program, one tile per layer with the published series it moves (the service template's tiles)
  if (v.layers?.length) {
    const art = [
      <TileChart key="seo" head="Google impressions a day" client="Genie Teacher" num="150×" series={data?.hero.genie} format="index" tip={s[1].tip} />,
      <TileChart key="aeo" head="Share of AI answers" client="LoudFace" num={s[0].metric} series={data?.hero.lf} format="pct" tip={s[0].tip} />,
      <Wireframe key="cro" pills={L.croPills} />,
    ];
    sections.push({
      key: 'layers',
      node: (
        <div className="v11-wrap">
          <Head eyebrow={L.layersEyebrow} title={v.layersTitle} lede={v.layersLede} />
          <div className="sv-tiles">
            <div className="sv-tiles-row">
              {v.layers.map((l, i) => (
                <div key={l.title} className={`sv-tile ${TONES[i % 3]}`}>
                  <div className="sv-tile-title">{l.title}</div>
                  <p className="sv-tile-desc">{l.subtitle}</p>
                  <ul className="in-layer-items">{l.items.map((it) => <li key={it}>{it}</li>)}</ul>
                  {art[i] && <div className="sv-tile-art">{art[i]}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    });
  }

  // 4 · results: the page's own figures, then the published charts (05-H Vercel figures over lines, 05-A Ramp)
  sections.push({
    key: 'results',
    node: (
      <div className="v11-wrap">
        <Head eyebrow={L.resultsEyebrow} title={v.resultsTitle} lede={v.resultsLede} />
        {v.stats.length > 0 && <KeyResults items={v.stats} />}
        <div className="in-charts"><ServiceResults slug={resultsKey} home={home} data={data} avoid={shown} /></div>
      </div>
    ),
  });

  // 5 · how the work runs: the program as one written sheet on the brand plate (04-A Ramp steps, the service runway)
  sections.push({
    key: 'approach',
    node: (
      <div className="v11-wrap" id="approach">
        <Head eyebrow={L.approachEyebrow} title={v.strategyTitle} lede={v.strategyLede} />
        <div className="v11-svc-plate">
          <div className="v11-sheet is-program">
            <div className="v11-sheet-head">
              <span className="is-brand"><LfMark size={20} /><span>LoudFace</span></span>
              <span className="is-meta">{v.eyebrow} · {L.sheetMeta}</span>
            </div>
            <div className="v11-program">
              {v.steps.map((p) => (
                <div key={p.title} className="v11-program-row">
                  <div className="v11-program-title">{p.title}</div>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  });

  // 6 · the long read, with what's included beside it (06-E Stripe customer story with its facts rail)
  if (v.proseHtml || v.deliverables?.length) {
    sections.push({
      key: 'detail',
      node: (
        <div className="v11-wrap">
          <Head eyebrow={L.detailEyebrow} title={v.proseTitle ?? L.includedTitle} />
          <div className={`in-detail ${v.proseHtml ? '' : 'is-solo'}`}>
            {v.proseHtml && <div className="v11-prose in-prose" dangerouslySetInnerHTML={{ __html: v.proseHtml }} />}
            {v.deliverables && v.deliverables.length > 0 && (
              <aside className="in-included">
                <h3>{L.includedTitle}</h3>
                <ul>
                  {v.deliverables.map((d) => (
                    <li key={d.title}>
                      <b>{d.title}</b>
                      {d.description && <span>{d.description}</span>}
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>
      ),
    });
  }

  sections.push({
    key: 'faq',
    node: (
      <div className="v11-wrap v11-faq">
        <div className="v11-faq-head">
          <h2 className="v11-h2">{v.faqTitle}</h2>
          {v.offer && (
            <div className="in-offer">
              <h3>{v.offer.headline}</h3>
              <p>{v.offer.sub}</p>
              <Link className="v11-btn is-ink" href={v.offer.href}><span>{v.offer.cta}</span></Link>
            </div>
          )}
        </div>
        <div className="v11-faq-list">
          {v.faqItems.map((f, i) => (
            <details key={f.question} className="v11-faq-item" open={i === 0}>
              <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
              <div className="v11-faq-a" dangerouslySetInnerHTML={{ __html: f.answer }} />
            </details>
          ))}
        </div>
      </div>
    ),
  });

  // 8 · the clients in their own words (the service template's proof grid), no figure already on the page
  sections.push({
    key: 'voices',
    node: (
      <div className="v11-wrap">
        <Head eyebrow={t.eyebrow} title={<span dangerouslySetInnerHTML={{ __html: t.heading }} />} />
        <IndustryVoices t={t} avoid={voicesAvoid} />
      </div>
    ),
  });

  // 9 · the other markets as cards with their lead client's site, then any related reading (the service template's
  //     related-service photo cards; 02-C Stripe customers by use case)
  sections.push({ key: 'more', node: <RelatedIndustries c={c} cards={related} posts={v.posts} /> });

  const faqAt = sections.findIndex((x) => x.key === 'faq');
  const ground = (i: number) => ((i - faqAt) % 2 === 0 ? 'v11-warm' : 'v11-white');

  return (
    <div className="v11 in">
      {/* 1 · the market named, over the work we did for it (01-D Vercel head with figures, 01-I Stripe customer covers) */}
      <section className="in-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="in-hero-top">
            <div>
              <Eyebrow>{v.eyebrow}</Eyebrow>
              <h1>{v.h1}</h1>
            </div>
            <div className="in-hero-side">
              {v.lead && <p className="is-lead">{v.lead}</p>}
              {v.sub && <p>{v.sub}</p>}
              <div className="in-hero-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{L.primaryCta}</span></a>
                <a href="#approach" className="v11-link"><span>{L.secondaryCta}</span><ArrowRight /></a>
              </div>
            </div>
          </div>
          {v.work.length > 0 && (
            <div className="in-work">
              <div className="in-work-label">{v.workTitle}</div>
              <div className={`in-work-row is-${v.work.length}`}>
                {v.work.map((w) => (
                  <Link key={w.slug} href={`/case-studies/${w.slug}`} className="in-card">
                    <div className="in-card-shot">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {w.imageUrl && <img src={cachedCmsImage(`${w.imageUrl}?w=900&fm=webp&q=80`, 828)} alt={`${w.client}, a LoudFace case study`} width={900} height={562} loading="eager" />}
                    </div>
                    <div className="in-card-copy">
                      <span className="is-client">{w.client}</span>
                      {w.number && <span className="is-num">{w.number}</span>}
                      <span className="is-title">{w.title}</span>
                      <span className="is-go">{L.readStudy}<ArrowUpRight /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <LogoGrid c={home.logos} />
      {sections.map((x, i) => (
        <section key={x.key} className={`v11-sec ${ground(i)} is-${x.key}`}>{x.node}</section>
      ))}
      <Closing c={{ ...home.closing, heading: v.ctaTitle, agenda: [] }} lede={v.ctaSubtitle} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
