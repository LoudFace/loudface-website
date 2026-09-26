import { Fragment, type ReactNode } from 'react';
import type { Series } from '../../home-v11/data';
import { ChartPanel } from '../../home-v11/ChartPanel';
import { img } from '../../home-v11/ui';
import { Tag } from '../kit';
import { EngineIcon } from './shared';

/**
 * Hero pictures for the services that are not a site we built: each one the product screen the service lives in,
 * drawn at 1:1 at the size of a site screenshot (2026-09-25). A site screenshot suits CRO, Webflow and design; for
 * search and the system, the screen is the tracker, the console, the board or the draft. An AI answer is never drawn
 * here: it is the library's ChatWindow (GEO passes it `is-hero`). Charts go through ChartPanel (DESIGN.md §7).
 * Every screen is an example unless it carries a client's own published figure.
 */

/** A browser window for a site (`url`) or an app window with a plain title (`title`). */
function Frame({ url, title, className = '', children }: { url?: string; title?: string; className?: string; children: ReactNode }) {
  return (
    <div className="sk-browser sv-ha">
      <div className="sk-browser-bar">
        <span className="v11-lights" aria-hidden="true"><span /><span /><span /></span>
        {url ? <span className="sk-browser-url">{url}</span> : <span className="sv-ha-title">{title}</span>}
      </div>
      <div className={`sv-ha-body ${className}`}>{children}</div>
    </div>
  );
}

type Seen = boolean | null;

/** SEO + AEO: the weekly tracker, each query's Google position beside whether each engine cites the page. */
export function RankTracker({ title, meta, rows }: { title: string; meta: string; rows: { q: string; pos: string; move?: string; seen: Seen[] }[] }) {
  return (
    <Frame title="Visibility tracker · this week" className="sv-ha-rank">
      <div className="sv-ha-board-head"><b>{title}</b><span>{meta}</span></div>
      <div className="sv-ha-grid">
        <span className="is-h">Query</span>
        <span className="is-h is-c">Google</span>
        {[0, 1, 3].map((i) => <span key={i} className="is-h is-c"><EngineIcon i={i} size={16} /></span>)}
        {rows.map((r) => (
          <Fragment key={r.q}>
            <span className="is-q">{r.q}</span>
            <span className="is-c is-pos"><b>{r.pos}</b>{r.move && <em>{r.move}</em>}</span>
            {r.seen.map((x, i) => (
              <span key={i} className="is-c">{x ? <i className="sv-ha-yes" role="img" aria-label="cited" /> : <i className="sv-ha-no" role="img" aria-label="not cited" />}</span>
            ))}
          </Fragment>
        ))}
      </div>
    </Frame>
  );
}

/** Organic growth: Search Console for a client we grow, two of its published figures above its own curve. */
export function ConsoleChart({ client, icon, figures, plotTitle, series, tip }: { client: string; icon: string; figures: { k: string; v: string; s: string }[]; plotTitle: string; series?: Series; tip: string }) {
  return (
    <Frame url="search.google.com/search-console" className="sv-ha-gsc">
      <div className="sv-ha-gsc-top">
        <span className="is-t">Performance on Search results</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="is-p"><img src={img(icon)} alt="" width={18} height={18} />{client}</span>
      </div>
      <div className="sv-ha-chips"><span>Search type: Web</span><span>Date: May to September 2026</span></div>
      <div className="sv-ha-tiles">
        {figures.map((f, i) => (
          <div key={f.k} className={`sv-ha-tile ${i === 0 ? 'is-on' : 'is-alt'}`}>
            <span className="is-k"><i />{f.k}</span>
            <b>{f.v}</b>
            <span className="is-s">{f.s}</span>
          </div>
        ))}
      </div>
      <div className="sv-ha-plot">
        {series && <ChartPanel title={plotTitle} series={series} format="index" tip={tip} height={160} />}
      </div>
    </Frame>
  );
}

type Task = { tag: 'SEO' | 'AEO' | 'CRO'; t: string; who: string; when: string };

/** Growth Autopilot: one board for the three disciplines, each card owned by a named person on the team. */
export function GrowthBoard({ title, meta, cols }: { title: string; meta: string; cols: { k: string; tone: 'done' | 'doing' | 'next'; tasks: Task[] }[] }) {
  return (
    <Frame title="Growth board · this month" className="sv-ha-board">
      <div className="sv-ha-board-head"><b>{title}</b><span>{meta}</span></div>
      <div className="sv-ha-lanes">
        {cols.map((c) => (
          <div key={c.k} className="sv-ha-lane">
            <div className={`sv-ha-lane-h is-${c.tone}`}><i />{c.k}<span>{c.tasks.length}</span></div>
            {c.tasks.map((t) => (
              <div key={t.t} className="sv-ha-task">
                <Tag tone={t.tag === 'CRO' ? 'warn' : t.tag === 'AEO' ? 'good' : 'ind'}>{t.tag}</Tag>
                <b>{t.t}</b>
                <div className="sv-ha-task-foot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(`avatars/${t.who}.png`)} alt="" width={22} height={22} />
                  <span>{t.when}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/** Copywriting: the page the brief produced, live on the example site, with the writer's notes pinned to it. */
export function DraftPage({ brand, eyebrow, headline, sub, primary, secondary, notes, rows }: { brand: string; eyebrow: string; headline: string; sub: string; primary: string; secondary: string; notes: { who: string; name: string; text: string }[]; rows: { k: string; v: string }[] }) {
  return (
    <Frame url={`${brand}.com`} className="sv-ha-page">
      <div className="sv-ha-nav">
        <span className="is-logo"><i />{brand}</span>
        <span className="is-links"><i /><i /><i /></span>
        <span className="is-btn">{primary}</span>
      </div>
      <div className="sv-ha-hero">
        <span className="sv-ha-eyebrow">{eyebrow}</span>
        <div className="sv-ha-h">{headline}</div>
        <p className="sv-ha-sub">{sub}</p>
        <div className="sv-ha-btns"><span className="is-ink">{primary}</span><span className="is-line">{secondary}</span></div>
      </div>
      <div className="sv-ha-shot" aria-hidden="true">
        {rows.map((r) => <div key={r.k} className="sv-ha-shot-row"><b>{r.k}</b><span className="is-ok"><i />{r.v}</span></div>)}
      </div>
      {notes.map((n, i) => (
        <div key={n.text} className={`sv-ha-note is-${i + 1}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(`avatars/${n.who}.png`)} alt="" width={28} height={28} />
          <div className="sv-ha-note-b"><b>{n.name}</b><span>{n.text}</span></div>
        </div>
      ))}
    </Frame>
  );
}
