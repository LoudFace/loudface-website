import Link from 'next/link';
import lost from '@/data/content/lost-v11.json';
import { ArrowUpRight, Eyebrow } from '../home-v11/ui';

/**
 * The 404 and error pages in v11 (2026-09-26): the message, the way back, and the live page's four links as a plain
 * list on hairlines (06-A Ramp "something doesn't feel right", 06-B Mercury). A utility page: no picture borrowed from
 * another page (review, 2026-09-26). Renders inside the site layout.
 * Reads lost-v11.json directly: error.tsx is a client component, so it cannot use the server content getters.
 */
export function LostPageV11({ kind, onRetry }: { kind: 'notFound' | 'error'; onRetry?: () => void }) {
  const t = lost[kind];
  return (
    <div className="v11 lost">
      <section className="lost-page" data-hero="light">
        <div className="v11-wrap">
          <Eyebrow>{t.code}</Eyebrow>
          <h1>{t.title}</h1>
          <p className="lost-body">{t.body}</p>
          <div className="lost-ctas">
            {onRetry ? (
              <button type="button" className="v11-btn is-ink" onClick={onRetry}><span>{t.primary}</span></button>
            ) : (
              <Link href="/" className="v11-btn is-ink"><span>{t.primary}</span></Link>
            )}
            <Link href={onRetry ? '/' : '/case-studies'} className="v11-btn is-line"><span>{t.secondary}</span></Link>
          </div>
          <h2 className="lost-k">{lost.waysTitle}</h2>
          <ul className="lost-ways">
            {lost.ways.map((w) => (
              <li key={w.href}>
                <Link href={w.href}><span>{w.label}</span><ArrowUpRight /></Link>
              </li>
            ))}
          </ul>
          {/* A dead end for a person, but an AI crawler can recover from it: the two files that list every URL. */}
          <p className="lost-index">{lost.indexLead} <a href="/sitemap.xml">sitemap.xml</a> · <a href="/llms.txt">llms.txt</a></p>
        </div>
      </section>
    </div>
  );
}
