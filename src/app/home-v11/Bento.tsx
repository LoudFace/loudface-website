import type { ReactNode } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import { Eyebrow, SectionHead, img } from './ui';

type C = HomeV11Content['bento'];

/**
 * The one AI answer window (DESIGN.md §7): a ChatGPT answer at true size, the product UI that shows what "being the
 * answer" looks like. `className="is-hero"` draws it at a service hero picture's size. `sourceIcon` is the first
 * source's favicon; `null` draws the plain placeholder (an example answer). An empty `answerBrand` draws no highlight
 * and an empty `sourceOne` no sources (a real answer that named no one, or cited nothing).
 */
export function ChatWindow({ c, className = '', sourceIcon = 'logos/toku-app-icon.png' }: { c: C['chat']; className?: string; sourceIcon?: string | null }) {
  return (
    <div className={`v11-chat ${className}`}>
      <div className="v11-chat-bar">
        <span className="v11-lights" aria-hidden="true"><span /><span /><span /></span>
        <div className="v11-chat-model">
          <span>{c.model}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 3.8L5 6.3l2.5-2.5" fill="none" stroke="#8a87a3" strokeWidth="1.4" strokeLinecap="round" /></svg>
        </div>
      </div>
      <div className="v11-chat-body">
        <div className="v11-chat-ask"><span>{c.question}</span></div>
        <div className="v11-chat-reply">
          <span className="v11-chat-avatar" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.2" fill="none" stroke="#fff" strokeWidth="1.4" /></svg>
          </span>
          <div className="v11-chat-text">
            <div className="v11-chat-answer">
              <span>{c.answerLead}</span>
              {c.answerBrand && <span className="is-brand">{c.answerBrand}</span>}
              {c.answerTail && <span>{c.answerTail}</span>}
            </div>
            {c.sourceOne && (
              <>
                <div className="v11-chat-sources-label">{c.sourcesLabel}</div>
                <div className="v11-chat-sources">
                  <span className="is-on">
                    {sourceIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" src={img(sourceIcon)} alt="" width={16} height={16} />
                    ) : <span className="v11-chat-fav" aria-hidden="true" />}
                    <span>{c.sourceOne}</span>
                  </span>
                  {c.sourceTwo && (
                    <span>
                      <span className="v11-chat-fav" aria-hidden="true" />
                      <span>{c.sourceTwo}</span>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="v11-chat-input">
        <span>{c.inputHint}</span>
        <span className="v11-chat-send" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 10V2M2.8 5.2L6 2l3.2 3.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </div>
  );
}

function Tile({ t, k, children }: { t: C['tiles'][number]; k: 'ai' | 'search' | 'design' | 'build'; children: ReactNode }) {
  const dark = k === 'ai';
  return (
    <div className={`v11-tile is-${k}`}>
      {!dark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img(`bento-${k}.webp`)} alt="" className="v11-tile-photo" loading="lazy" />
      )}
      <div className="v11-tile-copy">
        <Eyebrow dot={dark ? '#ffffff' : '#1a1040'} color={dark ? '#ffffff' : '#1a1040'}>{t.label}</Eyebrow>
        <p>{t.heading}</p>
      </div>
      {children}
    </div>
  );
}

export function Bento({ c }: { c: C }) {
  const [ai, search, design, build] = c.tiles;
  return (
    <section className="v11-sec v11-warm">
      <div className="v11-wrap">
        <SectionHead eyebrow={c.eyebrow} heading={c.heading} body={c.body} />
        <div className="v11-bento">
          <Tile t={ai} k="ai">
            <div className="v11-tile-ui"><ChatWindow c={c.chat} /></div>
            <div className="v11-tile-stat is-ai">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={img('logos/toku-white.png')} alt="Toku" width={46} height={13} />
              <div className="v11-tile-big">{ai.metric}</div>
              <div className="v11-tile-cap">{ai.caption}</div>
            </div>
          </Tile>
          <Tile t={search} k="search">
            <div className="v11-tile-stat is-search">
              <div className="v11-tile-client">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={img('logos/genie-icon.png')} alt="" width={20} height={20} className="v11-case-icon" />
                <span>{search.client}</span>
              </div>
              <div className="v11-tile-big">{search.metric}</div>
              <div className="v11-tile-cap">{search.caption}</div>
            </div>
          </Tile>
          <Tile t={design} k="design">
            <div className="v11-tile-stat">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={img('logos/dimer-health-ink.png')} alt="Dimer Health" width={65} height={22} />
              <div className="v11-tile-big">{design.metric}</div>
              <div className="v11-tile-cap">{design.caption}</div>
            </div>
          </Tile>
          <Tile t={build} k="build">
            <div className="v11-tile-stat">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={img('logos/ceipal-ink.png')} alt="Ceipal" width={67} height={22} />
              <div className="v11-tile-big">{build.metric}</div>
              <div className="v11-tile-cap">{build.caption}</div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
