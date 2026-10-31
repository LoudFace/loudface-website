import { Fragment, type ReactNode } from 'react';
import { asset } from '@/lib/assets';
import type { HomeV11Content, RecognitionV11Content } from '@/lib/content-utils';
import { EngineMark } from '../case-detail-v3/EngineMarks';
import { ChatWindow } from '../home-v11/Bento';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, ArrowUpRight, CAL, Eyebrow } from '../home-v11/ui';
import type { Engine, Honour, RecognitionData, Topic } from './data';
import type { Box } from './logos';
import { Mark, RecognitionIndex } from './RecognitionIndex';

/**
 * /recognition in v11, the honours direction (2026-10-30, after Arnel rejected the "ledger of mentions" boards: a
 * recognition page presents each list as an honour, what we are recognised for, by whom, at what placement, in the
 * publisher's words; counts and the index support it). Sections and the reference tile each is built against
 * (design-lab/harvest/2026-10-30/recognition/curated):
 *   R1 Hero              ranking-table-A Büro: the top honour as its publisher shows it, one line of counts, AI standing
 *   R2 Honours           ranking-table-A Büro + ranking-table-B Locomotive: an awards table grouped by placement
 *   R3 Recognised for    press-quotes-A Apollo + press-wall-A Harvey: verdicts in the publishers' words, by topic
 *   R4 Recognised by AI  ranking-table-D Aside: per engine, our place among the agencies tracked, never blended
 *   R5 The full record   index-list-A Claude: every honour, searchable, each linking out
 * Every list links out with rel="noopener nofollow": the honours are proof for readers, and most publishers are
 * agencies, so no ranking value passes to them (Arnel, 2026-10-31).
 */

type C = RecognitionV11Content;
const ext = { target: '_blank', rel: 'noopener nofollow' } as const;
const pct = (v: number) => `${Math.round(v * 100)}%`;
const ENGINE_NAME: Record<Engine['mark'], 'chatgpt' | 'perplexity' | 'googleAio'> = { chatgpt: 'chatgpt', perplexity: 'perplexity', googleAio: 'googleAio' };

/** `phone`: the same entry captured at phone width, so its words reflow and stay readable under 768px. */
function Shot({ src, phone, box, w, h, alt, priority = false }: { src: string; phone?: string; box?: Box; w: number; h: number; alt: string; priority?: boolean }) {
  return (
    <div className={`rc-shot ${phone ? 'has-phone' : ''}`} style={{ width: w, height: h }}>
      <picture>
        {phone && <source media="(max-width: 767px)" srcSet={asset(`/images/recognition/shots/${phone}`)} />}
        <img src={asset(`/images/recognition/shots/${src}`)} alt={alt} width={w} height={h} style={{ width: w, height: h }} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />
      </picture>
      {box && <span className="rc-shot-box" style={{ left: box.x - 7, top: box.y - 6, width: Math.min(box.w + 14, w - box.x - 2), height: box.h + 12 }} aria-hidden="true" />}
    </div>
  );
}

function Head({ eyebrow, title, ghost, body }: { eyebrow: string; title: ReactNode; ghost: ReactNode; body?: ReactNode }) {
  return (
    <div className="v11-head">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="v11-h2"><span>{title}</span> <span className="ghost">{ghost}</span></h2>
      </div>
      {body && <p style={{ width: 440 }}>{body}</p>}
    </div>
  );
}

/** Our place among the tracked agencies: one slot per agency in rank order, ours filled. */
function Places({ rank, of }: { rank: number; of: number }) {
  return (
    <span className="rc-places" aria-hidden="true">
      {Array.from({ length: of }, (_, i) => <i key={i} className={i + 1 === rank ? 'is-us' : ''} />)}
    </span>
  );
}

const engineLabel = (c: C, e: Engine) => c.ai[e.mark];

/* =========================================================== R1 hero */
function Hero({ c, d }: { c: C; d: RecognitionData }) {
  const top = d.honours.find((h) => h.hero) ?? d.honours[0];
  const lead = d.engines[0];
  return (
    <section className="rc-hero" data-hero="light" data-paper-name="R1 Hero">
      <div className="v11-wrap rc-hero-grid">
        <div className="rc-hero-copy">
          <Eyebrow>{c.hero.eyebrow}</Eyebrow>
          <h1>{c.hero.h1}</h1>
          <p className="rc-line">
            <span>{c.hero.lineFirst}</span> <b>{d.first}</b> <span>{c.hero.lineTop3}</span> <b>{d.top3}</b><span>{c.hero.lineStop}</span>{' '}
            <span>{c.hero.lineAiLead}</span> <span>{engineLabel(c, lead)}</span> <span>{c.hero.lineAiMid}</span> <b>#{lead.rank}</b>{' '}
            <span>{c.hero.lineAiOf}</span> {lead.of} <span>{c.hero.lineAiTail}</span>
          </p>
          <div className="rc-ctas">
            <a href="#book" className="v11-btn is-ink" {...CAL}><span>{c.hero.ctaPrimary}</span></a>
            <a href="#record" className="v11-link"><span>{c.hero.ctaSecondary}</span><ArrowRight /></a>
          </div>
        </div>
        <figure className="rc-hero-pic">
          <div className="rc-ground">
            <div className="rc-window">
              <div className="rc-window-bar"><span className="rc-dots" aria-hidden="true"><i /><i /><i /></span><span className="rc-url">{top.url.replace(/^https?:\/\//, '')}</span></div>
              {top.hero && <Shot src={top.hero} phone={top.heroPhone} box={top.heroBox} w={680} h={362} alt={`${top.publisher}: ${top.title}`} priority />}
            </div>
          </div>
          <figcaption className="rc-hero-cap">
            <span className="rc-hero-cap-rank"><b>#{top.rank}</b><span>{c.hero.shotOf} {top.listSize}</span></span>
            <div className="rc-hero-cap-t">
              <span className="is-k">{c.hero.shotKicker}</span>
              <a href={top.url} {...ext} className="is-t">{top.honour}</a>
              <span className="is-p"><Mark mark={top.mark} size={18} />{top.publisher}{top.year ? `, ${top.year}` : ''}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* =========================================================== R2 honours: an awards table by placement */
function HonourRow({ h, c }: { h: Honour; c: C }) {
  return (
    <li>
      <a href={h.url} {...ext} className="rc-award">
        <span className={`rc-award-pub ${h.mark ? '' : 'is-word'}`}>{h.mark && <Mark mark={h.mark} size={28} />}<span>{h.publisher}</span></span>
        <span className="rc-award-honour">
          <span className="is-t">{h.honour}</span>
          <span className="is-m"><span>{c.honours.of}</span> {h.listSize} <span>{c.honours.agencies}</span>{h.year ? ` · ${h.year}` : ''}</span>
        </span>
        <span className="rc-award-verdict">{h.verdict ? `“${h.verdict}”` : ''}</span>
        <span className="rc-award-go" aria-hidden="true"><ArrowUpRight /></span>
      </a>
    </li>
  );
}

function Honours({ c, d }: { c: C; d: RecognitionData }) {
  const groups: { place: number; label: string }[] = [
    { place: 1, label: c.honours.first }, { place: 2, label: c.honours.second }, { place: 3, label: c.honours.third },
  ];
  const tens = d.honours.filter((h) => h.rank && h.rank >= 4 && h.rank <= 10);
  return (
    <section className="v11-sec v11-warm" data-paper-name="R2 Honours">
      <div className="v11-wrap">
        <Head eyebrow={c.honours.eyebrow} title={c.honours.title} ghost={c.honours.titleGhost} body={c.honours.body} />
        <div className="rc-awards">
          {groups.map((g) => {
            const rows = d.honours.filter((h) => h.rank === g.place);
            if (!rows.length) return null;
            return (
              <div key={g.place} className="rc-awards-group">
                <div className="rc-awards-place"><b>#{g.place}</b><span>{g.label}</span></div>
                <ol>{rows.map((h) => <HonourRow key={h.key} h={h} c={c} />)}</ol>
              </div>
            );
          })}
          <div className="rc-awards-group is-ten">
            <div className="rc-awards-place" />
            <p className="rc-awards-ten">
              <span>{c.honours.topTen}</span> <b>{tens.length}</b> <span>{c.honours.topTenTail}</span>{' '}
              <a href="#record" className="v11-link"><span>{c.honours.topTenLink}</span><ArrowRight /></a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================== R3 what we are recognised for, in their words */
function Quote({ h, c }: { h: Honour; c: C }) {
  return (
    <a href={h.url} {...ext} className="rc-quote">
      <span className="rc-quote-pub"><Mark mark={h.mark} size={24} /><b>{h.publisher}</b></span>
      <span className="rc-quote-t">“{h.verdict}”</span>
      <span className="rc-quote-a">{h.rank ? `#${h.rank} ${c.honours.of} ${h.listSize} · ` : ''}{h.honour}</span>
    </a>
  );
}

/** One entry as its publisher shows it, with the honour under it (the hero's treatment, smaller). */
function Entry({ h, c }: { h: Honour; c: C }) {
  return (
    <a href={h.url} {...ext} className="rc-entry">
      <span className="rc-entry-win">
        <span className="rc-window-bar is-sm"><span className="rc-dots" aria-hidden="true"><i /><i /><i /></span><span className="rc-url">{h.url.replace(/^https?:\/\/(www\.)?/, '')}</span></span>
        <Shot src={h.card as string} phone={h.cardPhone} box={h.cardBox} w={600} h={h.cardH ?? 230} alt={`${h.publisher}: ${h.title}`} />
      </span>
      <span className="rc-entry-cap">
        {h.rank && <b>#{h.rank} <span>{c.honours.of} {h.listSize}</span></b>}
        <span className="rc-entry-t"><span className="is-p"><Mark mark={h.mark} size={18} />{h.publisher}</span></span>
      </span>
    </a>
  );
}

function RecognisedFor({ c, d }: { c: C; d: RecognitionData }) {
  const name = (t: Topic) => c.for[t];
  return (
    <section className="v11-sec v11-white" data-paper-name="R3 Recognised for">
      <div className="v11-wrap">
        <Head eyebrow={c.for.eyebrow} title={c.for.title} ghost={c.for.titleGhost} body={c.for.body} />
        <div className="rc-for">
          {d.groups.map((g) => (
            <div key={g.topic} className="rc-for-row">
              <div className="rc-for-side">
                <h3>{name(g.topic)}</h3>
                <p className="rc-for-n"><span>{c.for.countLead}</span> <b>{g.count}</b> <span>{c.for.countTail}</span></p>
                {g.industries.length > 0 && (
                  <p className="rc-for-ind">
                    <span>{c.for.including}</span>{' '}
                    {g.industries.slice(0, 4).map((k, i) => <Fragment key={k}>{i ? ', ' : ''}<span>{c.for.industries[k]}</span></Fragment>)}
                    {g.industries.length > 4 ? <> <span>{c.for.andMore}</span> {g.industries.length - 4} <span>{c.for.more}</span></> : null}.
                  </p>
                )}
              </div>
              {g.shown ? <Entry h={g.shown} c={c} /> : <span />}
              <div className="rc-for-quotes">{g.quotes.map((h) => <Quote key={h.key} h={h} c={c} />)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================== R4 recognised by AI, per engine */
function ByAi({ c, d }: { c: C; d: RecognitionData }) {
  const of = d.engines[0]?.of;
  return (
    <section className="v11-sec v11-warm" data-paper-name="R4 Recognised by AI">
      <div className="v11-wrap">
        <Head eyebrow={c.ai.eyebrow} title={c.ai.title} ghost={c.ai.titleGhost} body={c.ai.body} />
        <div className="rc-ai">
          <figure className="rc-ai-chat">
            <ChatWindow c={c.ai.chat} className="rc-chat" sourceIcon={null} />
            <figcaption>{c.ai.chatMeta}</figcaption>
          </figure>
          <div className="rc-ai-rows">
            {d.engines.map((e) => (
              <figure key={e.name} className="rc-ai-row">
                <figcaption className="rc-engine is-lg"><EngineMark engine={ENGINE_NAME[e.mark]} size={24} /><span>{engineLabel(c, e)}</span></figcaption>
                <div className="rc-ai-share"><b>{pct(e.visibility)}</b><span>{c.ai.shareTail}</span></div>
                <div className="rc-ai-place">
                  <div className="rc-ai-rank"><b>#{e.rank}</b><span><span>{c.ai.rankOf}</span> {e.of} <span>{c.ai.rankTail}</span></span></div>
                  <Places rank={e.rank} of={e.of} />
                  <span className="rc-ai-ends"><span>1</span><span>{e.of}</span></span>
                </div>
              </figure>
            ))}
          </div>
        </div>
        <p className="rc-src rc-ai-src"><span>{c.ai.source}</span>. {d.prompts} <span>{c.ai.questions}</span>, {d.aiWindow}. {of} <span>{c.ai.agencies}</span>.</p>
      </div>
    </section>
  );
}

/* =========================================================== R5 the full record */
function Record({ c, d }: { c: C; d: RecognitionData }) {
  return (
    <section className="v11-sec v11-white" id="record" data-paper-name="R5 Full record">
      <div className="v11-wrap rc-split">
        <div className="rc-split-side">
          <Eyebrow>{c.index.eyebrow}</Eyebrow>
          <h2 className="v11-h2"><span>{c.index.title}</span> <span className="ghost">{c.index.titleGhost}</span></h2>
          <p className="rc-split-body">{c.index.body}</p>
        </div>
        <RecognitionIndex honours={d.byCitations} c={c.index} initial={10} />
      </div>
    </section>
  );
}

export function RecognitionV11({ c, home, d }: { c: C; home: HomeV11Content; d: RecognitionData }) {
  return (
    <div className="v11 rc">
      <Hero c={c} d={d} />
      <Honours c={c} d={d} />
      <RecognisedFor c={c} d={d} />
      <ByAi c={c} d={d} />
      <Record c={c} d={d} />
      <Closing c={home.closing} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
