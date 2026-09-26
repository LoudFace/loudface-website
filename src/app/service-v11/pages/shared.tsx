import { useId, type ReactNode } from 'react';
import { img } from '../../home-v11/ui';
import type { HomeV11Content } from '@/lib/content-utils';
import { CheckPill, QuoteCell, Tag, Ui, UiHead, VideoCell } from '../kit';

/** Pieces more than one service page draws on. */

/**
 * A pattern or gradient id unique to one drawing. A fixed id broke the second copy of a card on the same page (the
 * menu preview draws the page's own hero card, 2026-09-27): url(#id) resolves to the first element with that id.
 */
function useSvgId(name: string) {
  return `${name}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/** The hero's before/after card: one number, two bars. */
export function BeforeAfterCard({ label, client, num, before, after }: { label: string; client: string; num: string; before: string; after: string }) {
  const hatch = useSvgId('sk-card-h');
  return (
    <div className="sk-card">
      <div className="sk-card-head"><b>{label}</b><span>{client}</span></div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
        <div className="sk-card-num">{num}</div>
        <svg width="96" height="54" viewBox="0 0 96 54" aria-hidden="true">
          <defs><pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="2" /></pattern></defs>
          <rect x="6" y="40" width="34" height="14" rx="2" fill="#e8e6f3" />
          <rect x="54" y="0" width="34" height="54" rx="2" fill={`url(#${hatch})`} stroke="#4f46e5" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="sk-card-foot"><span>{before}</span><span>{after}</span></div>
    </div>
  );
}

/** A number card with a small line: the share of AI answers climbing. */
export function ClimbCard({ label, client, from, to, foot, footRight }: { label: string; client: string; from: string; to: string; foot: string; footRight?: string }) {
  const fade = useSvgId('sk-climb');
  return (
    <div className="sk-card">
      <div className="sk-card-head"><b>{label}</b><span>{client}</span></div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 22, color: '#a3a0b8', letterSpacing: '-0.03em', paddingBottom: 4 }}>{from}</span>
        <svg width="34" height="12" viewBox="0 0 34 12" aria-hidden="true" style={{ marginBottom: 12 }}><path d="M1 6h30M26 1.5L31 6l-5 4.5" fill="none" stroke="#a3a0b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="sk-card-num">{to}</span>
      </div>
      <svg viewBox="0 0 250 46" width="100%" height="46" aria-hidden="true" preserveAspectRatio="none">
        <defs><linearGradient id={fade} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f46e5" stopOpacity="0.22" /><stop offset="1" stopColor="#4f46e5" stopOpacity="0" /></linearGradient></defs>
        <path d="M0 44 C40 44 60 42 90 38 S140 30 165 22 S215 6 250 3 L250 46 L0 46 Z" fill={`url(#${fade})`} />
        <path d="M0 44 C40 44 60 42 90 38 S140 30 165 22 S215 6 250 3" fill="none" stroke="#4f46e5" strokeWidth="1.75" />
      </svg>
      <div className="sk-card-foot"><span>{foot}</span>{footRight && <span>{footRight}</span>}</div>
    </div>
  );
}

/** A page wireframe: logo, nav, headline bars, one button, a logo row. Optional pills annotate it. */
export function Wireframe({ pills, cta = true }: { pills?: string[]; cta?: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <Ui style={{ gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <i className="sk-bar is-ink" style={{ width: 60, height: 10 }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <i className="sk-bar" style={{ width: 34 }} /><i className="sk-bar" style={{ width: 34 }} />
            <i className="sk-bar is-ind" style={{ width: 52, height: 18, borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 14 }}>
          <i className="sk-bar is-ink" style={{ width: '82%', height: 16 }} />
          <i className="sk-bar is-ink" style={{ width: '60%', height: 16 }} />
          <i className="sk-bar is-soft" style={{ width: '72%' }} />
          <i className="sk-bar is-soft" style={{ width: '54%' }} />
        </div>
        {cta && <i className="sk-bar is-ind" style={{ width: 96, height: 26, borderRadius: 99, marginTop: 4 }} />}
        <div style={{ display: 'flex', gap: 14, paddingTop: 8, borderTop: '1px solid #efeef5' }}>
          {[0, 1, 2, 3].map((k) => <i key={k} className="sk-bar" style={{ width: 40, height: 9, background: '#c9c7d8', borderRadius: 3 }} />)}
        </div>
      </Ui>
      {pills && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: -26, marginLeft: -30, position: 'relative' }}>
          {pills.map((p) => <CheckPill key={p}>{p}</CheckPill>)}
        </div>
      )}
    </div>
  );
}

/** A status list: rows of name and state. */
export function StatusList({ head, right, rows }: { head: string; right?: string; rows: { k: ReactNode; v?: ReactNode; tag?: string; tone?: 'good' | 'ind' | 'grey' | 'warn' }[] }) {
  return (
    <Ui style={{ gap: 0 }}>
      <UiHead left={head} right={right} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {rows.map((r, i) => (
          <div key={i} className="sk-row">
            <span className="is-k">{r.k}</span>
            <span className="is-v">{r.v && <b>{r.v}</b>}{r.tag && <Tag tone={r.tone ?? 'good'}>{r.tag}</Tag>}</span>
          </div>
        ))}
      </div>
    </Ui>
  );
}

/** A headline struck through and its rewrite: the redline. */
export function Redline({ head, right, before, after, why }: { head: string; right?: string; before: string; after: string; why: string }) {
  return (
    <Ui>
      <UiHead left={head} right={right} />
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 17, lineHeight: '22px', color: '#a3a0b8', textDecoration: 'line-through' }}>{before}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 17, lineHeight: '22px', background: '#eef0ff', borderRadius: 6, padding: '6px 8px' }}>{after}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, color: 'var(--ind)' }}><i style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--ind)' }} />{why}</div>
    </Ui>
  );
}

/** The AI engines' own icons (fetched via openbrand / Google favicons into public/images/home-v11/logos). */
export const ENGINES = [
  { name: 'ChatGPT', icon: 'fav-chatgpt.webp' },
  { name: 'Perplexity', icon: 'fav-perplexity.png' },
  { name: 'Google AI Overviews', icon: 'fav-google-g.png' },
  { name: 'Gemini', icon: 'fav-gemini.png' },
] as const;

export function EngineIcon({ i, size = 20 }: { i: number; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={img(`logos/${ENGINES[i].icon}`)} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: size * 0.28, flexShrink: 0 }} />;
}

export const logo = (p: string) => img(`logos/${p}`);

/* ------------------------------------------------ social proof cells, shared by the service pages' proof grids */
type Voices = HomeV11Content['testimonials'];
/** Genie Teacher's Clutch review, its published link (the case study uses the same one). */
const GENIE_REVIEW = { href: 'https://clutch.co/go-to-review/0b257a96-f556-4380-9e58-ba62f822638b/484569', label: 'Read the review on Clutch' };
/** `plain` drops the figure, for a page that already shows Genie Teacher's number elsewhere. */
export const GenieQuote = ({ t, plain }: { t: Voices; plain?: boolean }) => (
  <QuoteCell brandIcon="logos/genie-icon.png" logoAlt="Genie Teacher" logoW={120} logoH={24} big={plain ? undefined : t.cards[1].metric} cap={plain ? undefined : t.cards[1].caption} quote={t.cards[1].quote} person={t.cards[1].person} role={t.cards[1].jobTitle} initial={t.cards[1].initial} review={GENIE_REVIEW} tone="ind" className={plain ? 'is-plain' : ''} />
);
export const BrandfirmQuote = ({ t }: { t: Voices }) => (
  <QuoteCell logo="logos/brandfirm.png" logoAlt="Brandfirm" logoW={108} logoH={22} big={t.cards[2].metric} cap={t.cards[2].caption} quote={t.cards[2].quote} person={t.cards[2].person} role={t.cards[2].jobTitle} face="people/daan-smit.webp" tone="orange" />
);
export const TokuQuote = ({ t, wide }: { t: Voices; wide?: boolean }) => (
  <QuoteCell wide={wide} logo="logos/toku-ink.png" logoAlt="Toku" logoW={70} logoH={20} big={t.cards[0].metric} cap={t.cards[0].caption} quote={t.cards[0].quote} person={t.cards[0].person} role={t.cards[0].jobTitle} face="people/kenneth-o-friel.webp" tone="ind" />
);
/** A client video, wide; `n` indexes home-v11.json testimonials.videos (0 Outbound, 1 Dimer, 2 Reiterate). */
const WHO = ['maksim', 'sarig', 'elizabete'] as const;
export const VideoProof = ({ t, n, big, cap }: { t: Voices; n: 0 | 1 | 2; big?: string; cap?: string }) => (
  <VideoCell who={WHO[n]} big={big} cap={cap} quote={t.videos[n].quote} person={t.videos[n].person} role={t.videos[n].jobTitle} duration={t.videos[n].duration} />
);
