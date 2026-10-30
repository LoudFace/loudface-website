'use client';

import { useMemo, useState } from 'react';
import { asset } from '@/lib/assets';
import type { RecognitionV11Content } from '@/lib/content-utils';
import type { Honour } from './data';

type L = RecognitionV11Content['index'];
type Filter = 'all' | 'top3' | 'top10' | 'fintech' | 'saas';

const passes = (h: Honour, f: Filter) =>
  f === 'all'
  || (f === 'top3' && !!h.rank && h.rank <= 3)
  || (f === 'top10' && !!h.rank && h.rank <= 10)
  || (f === 'fintech' && h.topics.includes('fintech'))
  || (f === 'saas' && h.topics.includes('saas'));

const Arrow = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9l6-6M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Search = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="7.8" cy="7.8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
);

/** A publisher's own site icon (logos.ts says where each came from); nothing when it has no usable mark. */
export function Mark({ mark, size, className = '' }: { mark: string | null; size: number; className?: string }) {
  if (!mark) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset(`/images/recognition/logos/${mark}.png`)} alt="" width={size} height={size} className={`rc-mark ${className}`} style={{ width: size, height: size }} loading="lazy" />;
}

/**
 * The full record (index-list-A, Claude publications): a search box, five filters and every honour on hairline rows,
 * highest placement first. Every row stays in the HTML, so a reader or an AI engine sees every link; filtering and the
 * "show all" cap only hide rows.
 */
export function RecognitionIndex({ honours, c, initial }: { honours: Honour[]; c: L; initial: number }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');
  const [all, setAll] = useState(false);
  const filters: { k: Filter; label: string }[] = [
    { k: 'all', label: c.all }, { k: 'top3', label: c.top3 }, { k: 'top10', label: c.top10 }, { k: 'fintech', label: c.fintech }, { k: 'saas', label: c.saas },
  ];
  const counts = useMemo(
    () => Object.fromEntries((['all', 'top3', 'top10', 'fintech', 'saas'] as Filter[]).map((k) => [k, honours.filter((h) => passes(h, k)).length])),
    [honours],
  );
  const needle = q.trim().toLowerCase();
  const shown = honours.map((h) => passes(h, f) && (!needle || `${h.publisher} ${h.title} ${h.domain}`.toLowerCase().includes(needle)));
  const matches = shown.filter(Boolean).length;
  const capped = !all && !needle && f === 'all';
  // the nth matching row, so the capped view shows the first `initial` matches
  const order = shown.reduce<number[]>((acc, m, i) => { acc.push((i ? acc[i - 1] : 0) + (m ? 1 : 0)); return acc; }, []);

  return (
    <div className="rc-index">
      <div className="rc-tools">
        <label className="rc-search">
          <span className="v11-sr">{c.searchAriaLabel}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPlaceholder} />
          <Search />
        </label>
        <div className="rc-filters" role="group" aria-label={c.filterAriaLabel}>
          {filters.map((x) => (
            <button key={x.k} type="button" className={`rc-chip ${f === x.k ? 'is-on' : ''}`} aria-pressed={f === x.k} onClick={() => setF(x.k)}>
              <span>{x.label}</span><span className="rc-chip-n">{counts[x.k]}</span>
            </button>
          ))}
        </div>
      </div>
      <ol className="rc-rows">
        {honours.map((h, i) => (
          <li key={h.key} className="rc-row" hidden={!(shown[i] && (!capped || order[i] <= initial))}>
            <span className="rc-mark-slot is-28"><Mark mark={h.mark} size={28} /></span>
            <a href={h.url} target="_blank" rel="noopener" className="rc-row-main">
              <span className="rc-row-title">{h.honour}</span>
              <span className="rc-row-meta">
                <span className={h.rank ? 'rc-pos-c' : ''}>{h.rank ? `#${h.rank} ${c.of} ${h.listSize ?? '?'}` : h.listed ? c.listed : c.recommended}</span>
                <span>{h.publisher}</span>
                {h.year && <span>{h.year}</span>}
                {h.citations > 0 && <span>{h.citations.toLocaleString('en-US')} {h.citations === 1 ? c.colCitation : c.colCitations}</span>}
              </span>
            </a>
            <a href={h.url} target="_blank" rel="noopener" className="rc-open" aria-label={`${c.openAriaLabel}: ${h.title}`}><Arrow /></a>
          </li>
        ))}
      </ol>
      {matches === 0 && <p className="rc-empty">{c.empty}</p>}
      <div className="rc-index-foot">
        {(matches > initial || all) && !needle && f === 'all' && (
          <button type="button" className="v11-btn is-line" onClick={() => setAll((v) => !v)} aria-expanded={all}>
            {all ? <span>{c.showFewer}</span> : <span><span>{c.showAll}</span> {honours.length} <span>{c.showAllTail}</span></span>}
          </button>
        )}
        <p className="rc-src">{c.source}</p>
      </div>
    </div>
  );
}
