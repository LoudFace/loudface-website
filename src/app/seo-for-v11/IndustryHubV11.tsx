import type { ReactNode } from 'react';
import Link from 'next/link';
import type { HomeV11Content, IndustryV11Content, SeoForHubContent } from '@/lib/content-utils';
import { ChatWindow } from '../home-v11/Bento';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import type { HomeV11Data } from '../home-v11/data';
import { ArrowRight, ArrowUpRight, Eyebrow, LfMark } from '../home-v11/ui';
import { ServiceResults, resultSlugs } from '../service-v11/proof';
import type { HubCard } from './views';
import { IndustryVoices } from './voices';
import { cachedCmsImage } from '@/lib/image-utils';

/**
 * IndustryHubV11: /seo-for in v11 (2026-09-26). The hub's picture is the markets themselves: every industry page as a
 * card with its lead client's cover and published result. Then why the market changes the work (the same buyer
 * question answered from different sources in three markets), the results, the program sheet, the clients, the FAQ.
 * Copy is the live hub's (seo-for-hub.json); tiles from design-lab/harvest/2026-09-26/industry are named per section.
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

const CHAT_MARKETS = ['saas', 'fintech', 'healthcare'] as const;

export function IndustryHubV11({ h, cards, c, home, data }: { h: SeoForHubContent; cards: HubCard[]; c: IndustryV11Content; home: HomeV11Content; data: HomeV11Data | null }) {
  const L = c.labels;
  const t = home.testimonials;
  const label = (key: string) => c.other.find((o) => o.href === `/seo-for/${key}`)?.label ?? key;
  const chats = c.chat as Record<string, HomeV11Content['bento']['chat']>;
  // no client figure twice: the cards show each lead study's result, so the sections below skip those studies
  const shown = cards.map((k) => k.study).filter((x): x is string => Boolean(x));
  const voicesAvoid = [...shown, ...resultSlugs('seo-for-hub', shown)];
  const sections: { key: string; node: ReactNode }[] = [];

  // 2 · why the market changes the work: one buyer question per market, answered from different sources
  //     (02-D Clay "how teams like yours use Clay", 03-C Ramp reasons with their UI)
  sections.push({
    key: 'why',
    node: (
      <div className="v11-wrap">
        <Head title={h.valueProps.title} />
        <div className="hb-chats">
          {CHAT_MARKETS.map((k) => (
            <figure key={k} className="hb-chat">
              <ChatWindow c={chats[k]} sourceIcon={null} />
              <figcaption>{label(k)}</figcaption>
            </figure>
          ))}
        </div>
        <p className="hb-chats-note">{L.hubChatCaption}</p>
        <ol className="hb-props">
          {h.valueProps.items.map((p) => (
            <li key={p.title}><h3>{p.title}</h3><p>{p.description}</p></li>
          ))}
        </ol>
      </div>
    ),
  });

  sections.push({
    key: 'results',
    node: (
      <div className="v11-wrap">
        <Head eyebrow={L.resultsEyebrow} title={<span dangerouslySetInnerHTML={{ __html: home.results.heading }} />} lede={home.results.body} />
        <ServiceResults slug="seo-for-hub" home={home} data={data} avoid={shown} />
      </div>
    ),
  });

  // 4 · one method, calibrated per market: the program as a written sheet (04-A Ramp steps, the service runway)
  sections.push({
    key: 'approach',
    node: (
      <div className="v11-wrap" id="approach">
        <Head eyebrow={L.approachEyebrow} title={h.approach.title} lede={h.approach.intro} />
        <div className="v11-svc-plate">
          <div className="v11-sheet is-program">
            <div className="v11-sheet-head">
              <span className="is-brand"><LfMark size={20} /><span>LoudFace</span></span>
              <span className="is-meta">{h.hero.eyebrow} · {L.sheetMeta}</span>
            </div>
            <div className="v11-program">
              {h.approach.steps.map((p) => (
                <div key={p.title} className="v11-program-row">
                  <div className="v11-program-title">{p.title}</div>
                  <p>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  });

  sections.push({
    key: 'voices',
    node: (
      <div className="v11-wrap">
        <Head eyebrow={t.eyebrow} title={<span dangerouslySetInnerHTML={{ __html: t.heading }} />} />
        <IndustryVoices t={t} avoid={voicesAvoid} />
      </div>
    ),
  });

  sections.push({
    key: 'faq',
    node: (
      <div className="v11-wrap v11-faq">
        <div className="v11-faq-head"><h2 className="v11-h2">{h.faq.title}</h2></div>
        <div className="v11-faq-list">
          {h.faq.items.map((f, i) => (
            <details key={f.question} className="v11-faq-item" open={i === 0}>
              <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
              <div className="v11-faq-a">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>
    ),
  });

  const faqAt = sections.findIndex((x) => x.key === 'faq');
  const ground = (i: number) => ((i - faqAt) % 2 === 0 ? 'v11-warm' : 'v11-white');

  return (
    <div className="v11 in hb">
      {/* 1 · the markets as the hero's picture: each industry page with its lead client (02-B Dropbox industries,
          02-C Stripe customers by use case, 01-D Vercel head with figures) */}
      <section className="in-hero hb-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="in-hero-top">
            <div>
              <Eyebrow>{h.hero.eyebrow}</Eyebrow>
              <h1 dangerouslySetInnerHTML={{ __html: h.hero.headline }} />
            </div>
            <div className="in-hero-side">
              <p>{h.hero.description}</p>
              <div className="in-hero-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{h.hero.primaryCta}</span></a>
                <a href="#approach" className="v11-link"><span>{h.hero.secondaryCta}</span><ArrowRight /></a>
              </div>
            </div>
          </div>
          <div className="sv-band is-light hb-band">
            {h.stats.map((s) => (
              <div key={s.label}><span className="is-v">{s.value}</span><span className="is-s">{s.label}</span></div>
            ))}
          </div>
          <div className="hb-grid">
            {cards.map((k) => (
              <Link key={k.href} href={k.href} className="hb-card">
                <div className="in-card-shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {k.imageUrl && <img src={cachedCmsImage(`${k.imageUrl}?w=900&fm=webp&q=80`, 828)} alt={k.client ? `${k.client}, a LoudFace case study` : ''} width={900} height={562} loading="lazy" />}
                </div>
                <div className="hb-card-copy">
                  <span className="is-label">{k.label}</span>
                  <span className="is-head">{k.headline}</span>
                  {k.client && (
                    <span className="is-proof"><b>{k.number}</b> <span>{k.title}</span> <span className="is-client">· {k.client}</span></span>
                  )}
                  <span className="is-go" aria-hidden="true"><ArrowUpRight /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <LogoGrid c={home.logos} />
      {sections.map((x, i) => (
        <section key={x.key} className={`v11-sec ${ground(i)} is-${x.key}`}>{x.node}</section>
      ))}
      <Closing c={home.closing} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
