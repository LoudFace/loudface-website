import type { AiAuditContent, HomeV11Content } from '@/lib/content-utils';
import { AuditLandingForm } from '../(site)/ai-audit/_components/AuditLandingForm';
import { FooterV11 } from '../home-v11/FooterV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Reveal } from '../home-v11/Reveal';
import { Eyebrow, LfMark, img } from '../home-v11/ui';
import { IndustryVoices } from '../seo-for-v11/voices';
import { strip } from '@/lib/inline-edit/mark';

/**
 * /ai-audit in v11 (2026-09-26). The page's picture is the report the visitor receives: its scorecard and its
 * engine-by-engine query table, drawn at a readable size from the example report (/audit/demo, the sample company
 * Acme Corp) and labelled as an example. The form is the live one (AuditLandingForm), restyled by audit.css.
 * Tiles from design-lab/harvest/2026-09-26/singles: 02-A Retool (form beside the proof), 02-B Vercel demo form.
 */

const ICONS: Record<string, string> = { ChatGPT: 'fav-chatgpt.webp', Claude: 'fav-claude.png', Gemini: 'fav-gemini.png', Perplexity: 'fav-perplexity.png' };

/** What the report windows need: the landing page passes its example (ai-audit.json), the report builds one from real results. */
type Tone = 'good' | 'warn' | 'bad';
export interface ScoreView {
  label: string;
  company: string;
  scorecardTitle: string;
  grade: string;
  gradeLabel: string;
  gradeTone?: Tone;
  // tone: 'good' | 'warn' | 'bad' (a string, so the landing's JSON example can set it)
  metrics: { label: string; value: string; status: string; good?: boolean; tone?: Tone | string; note?: string }[];
  voiceTitle: string;
  voice: { brand: string; value: number; self?: boolean }[];
}
export interface QueryView {
  label: string;
  company: string;
  queriesTitle: string;
  queriesNote: string;
  queriesScore: string;
  scoreTone?: Tone;
  engines: string[];
  queries: { prompt: string; hits: boolean[] }[];
}

function ReportHead({ x, title }: { x: { label: string; company: string }; title: string }) {
  return (
    <div className="au-rep-head">
      <span className="is-brand"><LfMark size={16} /><span>{title}</span></span>
      <span className="is-meta">{x.label} · {x.company}</span>
    </div>
  );
}

/** The report's scorecard: the grade and the five scores, as in the real deck's executive scorecard. */
export function Scorecard({ x }: { x: ScoreView }) {
  return (
    <div className="au-rep">
      <ReportHead x={x} title={x.scorecardTitle} />
      <div className="au-grade">
        <span className={`is-g is-${x.gradeTone ?? 'good'}`}>{x.grade}</span>
        <span className="is-k">{x.gradeLabel}</span>
      </div>
      <div className="au-metrics">
        {x.metrics.map((m) => (
          <div key={m.label} className="au-metric">
            <span className="is-k">{m.label}</span>
            <span className="is-v">{m.value}</span>
            <span className={`is-s is-${strip(m.tone ?? (m.good ? 'good' : 'warn'))}`}>{m.status}</span>
            {m.note && <span className="is-note">{m.note}</span>}
          </div>
        ))}
      </div>
      {x.voice.length > 0 && <div className="au-voice">
        <div className="au-voice-k">{x.voiceTitle}</div>
        {x.voice.map((b) => (
          <div key={b.brand} className={`au-bar ${b.self ? 'is-self' : ''}`}>
            <span className="is-n">{b.brand}</span>
            <span className="is-track"><i style={{ width: `${b.value}%` }} /></span>
            <span className="is-v">{b.value}%</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

/** The report's category-discovery table: which engine names the company for each unbranded buyer question. */
export function Queries({ x }: { x: QueryView }) {
  const Mark = ({ on }: { on: boolean }) => (
    on
      ? <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Named"><circle cx="8" cy="8" r="8" fill="#e3f5ea" /><path d="M4.6 8.2l2.2 2.2 4.6-4.8" fill="none" stroke="#1b7f4b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      // a miss is the finding, so it is the stronger mark (review 2026-09-26: the grey cross read at 2.3:1)
      : <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Not named"><circle cx="8" cy="8" r="8" fill="#fdece4" /><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" fill="none" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" /></svg>
  );
  return (
    <div className="au-rep au-q">
      <ReportHead x={x} title={x.queriesTitle} />
      <div className={`au-q-top is-${x.scoreTone ?? 'warn'}`}><b>{x.queriesScore}</b><span>{x.queriesNote}</span></div>
      <div className="au-q-grid" role="table">
        <div className="au-q-row is-head" role="row">
          <span role="columnheader" />
          {x.engines.map((e) => (
            <span key={e} role="columnheader" className="is-eng">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={img(`logos/${ICONS[e]}`)} alt="" width={18} height={18} />
              <span>{e}</span>
            </span>
          ))}
        </div>
        {x.queries.map((q) => (
          <div key={q.prompt} className="au-q-row" role="row">
            <span role="cell" className="is-p">{q.prompt}</span>
            {q.hits.map((h, i) => <span key={i} role="cell" className="is-m"><Mark on={h} /></span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditPageV11({ c, home }: { c: AiAuditContent; home: HomeV11Content }) {
  // the example is the same sample company, with the same numbers, as the example report (/audit/demo)
  const x = c.example;
  return (
    <div className="v11 au">
      {/* 1 · the question, the form, and the report you get back */}
      <section className="au-hero" data-hero="light">
        <div className="v11-wrap au-hero-grid">
          <div className="au-hero-copy">
            <Eyebrow>{c.hero.eyebrow}</Eyebrow>
            <h1>{c.hero.headline} <span className="ghost">{c.hero.headlineGhost}</span></h1>
            <p className="au-sub">{c.hero.sub}</p>
            <div className="au-form" id="audit-form"><AuditLandingForm /></div>
          </div>
          <figure className="au-pic">
            <div className="au-ground"><Scorecard x={x} /></div>
            <figcaption>{x.caption}</figcaption>
            <div className="au-gets">
              <h2>{c.hero.benefitsTitle}</h2>
              <ul>{c.hero.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </figure>
        </div>
      </section>

      <LogoGrid c={home.logos} />

      {/* 2 · why it matters, beside the query table that shows the gap (02-A Retool proof panel, 07 compare tables) */}
      <section className="v11-sec v11-warm">
        <div className="v11-wrap au-problem">
          <div>
            <h2 className="v11-h2">{c.problem.title}</h2>
            <p className="au-lede">{c.problem.p1}</p>
            <p>{c.problem.p2}</p>
            <p className="is-strong">{c.problem.p3}</p>
            <h3>{c.problem.revealsTitle}</h3>
            <ul className="au-reveals">{c.problem.reveals.map((r) => <li key={r}>{r}</li>)}</ul>
            <a href="#audit-form" className="v11-btn is-ink"><span>{c.problem.cta}</span></a>
          </div>
          <div className="au-q-pic"><Queries x={x} /></div>
        </div>
      </section>

      {/* 3 · the clients in their own words (the service template's proof grid) */}
      <section className="v11-sec v11-white">
        <div className="v11-wrap">
          <div className="sv-head">
            <div>
              <Eyebrow>{home.testimonials.eyebrow}</Eyebrow>
              <h2 className="v11-h2" dangerouslySetInnerHTML={{ __html: home.testimonials.heading }} />
            </div>
          </div>
          <IndustryVoices t={home.testimonials} avoid={[]} />
        </div>
      </section>

      <section className="v11-sec v11-warm">
        <div className="v11-wrap v11-faq">
          <div className="v11-faq-head"><h2 className="v11-h2">{c.faq.title}</h2></div>
          <div className="v11-faq-list">
            {c.faq.items.map((f, i) => (
              <details key={f.question} className="v11-faq-item" open={i === 0}>
                <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                <div className="v11-faq-a">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · the closing: the same form on the homepage's closing stage */}
      <section className="v11-closing au-closing">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img('closing-terrain-1920.webp')} srcSet={`${img('closing-terrain-1280.webp')} 1280w, ${img('closing-terrain-1920.webp')} 1920w, ${img('closing-terrain-2560.webp')} 2560w`} sizes="(max-width: 767px) 820px, 100vw" alt="" className="v11-closing-bg" loading="lazy" />
        <div className="v11-wrap au-closing-grid">
          <div>
            <Eyebrow dot="#ffffff" color="#dcd9fe">{c.hero.eyebrow}</Eyebrow>
            <h2 className="v11-closing-h2">{c.final.title}</h2>
            <p className="v11-closing-lede">{c.final.note}</p>
          </div>
          <div className="au-form is-card"><AuditLandingForm /></div>
        </div>
      </section>
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
