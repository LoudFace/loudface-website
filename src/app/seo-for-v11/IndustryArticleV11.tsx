import type { ReactNode } from 'react';
import type { HomeV11Content, IndustryV11Content } from '@/lib/content-utils';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, Eyebrow } from '../home-v11/ui';
import type { HomeV11Data } from '../home-v11/data';
import { ServiceResults, resultSlugs } from '../service-v11/proof';
import { RelatedIndustries } from './related';
import type { ArticlePanel, SeoForArticle } from './types';
import type { HubCard } from './views';
import { IndustryVoices } from './voices';
import { strip } from '@/lib/inline-edit/mark';
import { cachedCmsImage, cachedCmsSrcSet } from '@/lib/image-utils';

/**
 * IndustryArticleV11: the /seo-for long reads (HR tech, AI startups, EdTech) in v11 (2026-09-26). These pages are
 * articles, not service pages (DESIGN.md §8), so they read like one: the short answer beside the client proof, the
 * buyer questions as a table, then the argument with its contents rail. Copy is the live pages', moved unchanged
 * into seo-for-<slug>.json. Tiles from design-lab/harvest/2026-09-26/industry are named above each section.
 */

/** A client result as a small readable window: its site's domain, what was measured, the figures. */
function ProofPanel({ domain, panel }: { domain: string; panel: ArticlePanel }) {
  return (
    <div className="ia-panel">
      <div className="sk-browser-bar">
        <span className="v11-lights" aria-hidden="true"><span /><span /><span /></span>
        <span className="sk-browser-url">{domain}</span>
      </div>
      <div className="ia-panel-body">
        <div className="ia-panel-title">{panel.title}</div>
        <ul>
          {panel.stats.map((s) => (
            <li key={s.label}><b>{s.value}</b><span>{s.label}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function IndustryArticleV11({ slug, a, c, home, data, related }: { slug: string; a: SeoForArticle; c: IndustryV11Content; home: HomeV11Content; data: HomeV11Data | null; related: HubCard[] }) {
  const L = c.labels;
  const t = home.testimonials;
  const resultsKey = `seo-for-${slug}`;
  const voicesAvoid = resultSlugs(resultsKey);
  const sections: { key: string; node: ReactNode }[] = [];

  // 2 · the buyer questions as a table you can scan (07-A Ramp vs Amex, 07-C Webflow compare)
  sections.push({
    key: 'questions',
    node: (
      <div className="v11-wrap" id="buyer-questions">
        <div className="sv-head">
          <div><h2 className="v11-h2">{a.questions.title}</h2></div>
        </div>
        <div className="ia-intro">
          {a.intro.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
        </div>
        <div className="v11-table-wrap is-plain ia-table">
          <table className="sv-table">
            <thead><tr>{a.questions.columns.map((col) => <th key={col} scope="col">{col}</th>)}</tr></thead>
            <tbody>
              {a.questions.rows.map((r) => (
                <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ia-note">{a.questions.note}</p>
      </div>
    ),
  });

  // 3 · the argument, with its contents rail (06-C Linear Method, 06-E Stripe story with its rail)
  sections.push({
    key: 'story',
    node: (
      <div className="v11-wrap">
        <div className="cs-story">
          <aside className="cs-rail">
            <nav className="sv-toc" aria-label={strip(L.onThisPage)}>
              <div className="sv-toc-k">{L.onThisPage}</div>
              {a.parts.map((p, i) => <a key={p.title} href={`#part-${i + 1}`}>{p.title}</a>)}
            </nav>
          </aside>
          <div className="ia-body">
            {a.parts.map((p, i) => (
              <section key={p.title} id={`part-${i + 1}`} className={`ia-part ${p.image || p.panel ? 'is-figure' : ''}`}>
                <h2>{p.title}</h2>
                <div className="v11-prose" dangerouslySetInnerHTML={{ __html: p.html }} />
                {p.image && p.image.src !== a.proof.image?.src && (
                  <figure className="ia-figure">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="ia-shot" src={cachedCmsImage(`${p.image.src}?w=1400&fm=webp&q=82`, 1920)} srcSet={cachedCmsSrcSet(`${p.image.src}?w=1400&fm=webp&q=82`, [828, 1920])} sizes="(max-width: 767px) 92vw, 1296px" alt={p.image.alt} width={1400} height={875} loading="lazy" />
                    {p.image.caption && <figcaption>{p.image.caption}</figcaption>}
                  </figure>
                )}
                {p.panel && <figure className="ia-figure"><ProofPanel domain={a.proof.domain} panel={p.panel} /></figure>}
              </section>
            ))}
          </div>
        </div>
      </div>
    ),
  });

  // 4 · the published results (the homepage's results section), then the FAQ and the clients in their words
  sections.push({
    key: 'results',
    node: (
      <div className="v11-wrap">
        <div className="sv-head">
          <div><h2 className="v11-h2" dangerouslySetInnerHTML={{ __html: home.results.heading }} /></div>
          <p>{home.results.body}</p>
        </div>
        <ServiceResults slug={resultsKey} home={home} data={data} />
      </div>
    ),
  });

  sections.push({
    key: 'faq',
    node: (
      <div className="v11-wrap v11-faq">
        <div className="v11-faq-head"><h2 className="v11-h2">{a.faq.title}</h2></div>
        <div className="v11-faq-list">
          {a.faq.items.map((f, i) => (
            <details key={f.question} className="v11-faq-item" open={i === 0}>
              <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
              <div className="v11-faq-a">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>
    ),
  });

  sections.push({
    key: 'voices',
    node: (
      <div className="v11-wrap">
        <div className="sv-head"><div><h2 className="v11-h2" dangerouslySetInnerHTML={{ __html: t.heading }} /></div></div>
        <IndustryVoices t={t} avoid={voicesAvoid} />
      </div>
    ),
  });

  sections.push({ key: 'more', node: <RelatedIndustries c={c} cards={related} /> });

  const faqAt = sections.findIndex((x) => x.key === 'faq');
  const ground = (i: number) => ((i - faqAt) % 2 === 0 ? 'v11-warm' : 'v11-white');

  return (
    <div className="v11 in ia">
      {/* 1 · the question and the short answer, beside the client proof for this market (06-E Stripe customer story,
          01-D Vercel head) */}
      <section className="in-hero ia-hero" data-hero="light">
        <div className="v11-wrap">
          <div className="in-hero-top">
            <div>
              <Eyebrow>{a.hero.eyebrow}</Eyebrow>
              <h1>{a.hero.h1}</h1>
            </div>
            <div className="in-hero-side">
              {a.hero.sub && <p>{a.hero.sub}</p>}
              <div className="in-hero-ctas">
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{a.hero.primaryCta}</span></a>
                <a href="#buyer-questions" className="v11-link"><span>{a.hero.secondaryCta}</span><ArrowRight /></a>
              </div>
            </div>
          </div>
          <div className="ia-lead">
            <div className="ia-answer">
              <div className="ia-answer-k">{a.answer.label}</div>
              <p>{a.answer.text}</p>
            </div>
            <figure className="ia-proof">
              {a.proof.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="ia-shot" src={cachedCmsImage(`${a.proof.image.src}?w=1400&fm=webp&q=82`, 1920)} srcSet={cachedCmsSrcSet(`${a.proof.image.src}?w=1400&fm=webp&q=82`, [828, 1920])} sizes="(max-width: 767px) 92vw, 1296px" alt={a.proof.image.alt} width={1400} height={875} fetchPriority="high" />
              ) : a.proof.panel ? (
                <ProofPanel domain={a.proof.domain} panel={a.proof.panel} />
              ) : null}
              {a.proof.note.length > 0 && <figcaption>{a.proof.note.map((n) => <span key={n}>{n}</span>)}</figcaption>}
            </figure>
          </div>
        </div>
      </section>
      {sections.map((x, i) => (
        <section key={x.key} className={`v11-sec ${ground(i)} is-${x.key}`}>{x.node}</section>
      ))}
      <Closing c={{ ...home.closing, heading: a.cover.title, agenda: [] }} lede={a.cover.text} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
