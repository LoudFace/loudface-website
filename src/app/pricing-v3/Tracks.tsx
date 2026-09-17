/**
 * Tracks — deep split-asym stage: Build + Growth track cards plus the A+B
 * connector strip. Build carries a real client shot (LIQID, Sanity CDN);
 * Growth carries the abstract "growth scoreboard" SVG (relative bars only —
 * no invented numeric claims).
 */
import Image from 'next/image';
import type { PricingTracksContent } from '@/lib/content-utils';
const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const d = (v: string) => ({ ['--d' as string]: v });

export function Tracks({ content }: { content: PricingTracksContent }) {
  return (
    <section className="tracks diag" id="tracks">
      <div className="container">
        <div className="tracks-head rv">
          <h2 className="display on-dark">
            {content.headline} <span className="ghost">{content.headlineHighlight}</span>
          </h2>
          <p className="lede on-dark">
            {content.intro}
          </p>
        </div>
        <div className="tracks-grid">
          <article className="tk is-lead rv">
            <span className="tk-num">{content.build.badge}</span>
            <h3>{content.build.title}</h3>
            <p className="tagline">{content.build.tagline}</p>
            <p>
              {content.build.description}
            </p>
            <div className="tk-tags">
              <span className="tk-tag">{content.build.tags[0]}</span>
              <span className="tk-tag">{content.build.tags[1]}</span>
              <span className="tk-tag">{content.build.tags[2]}</span>
              <span className="tk-tag">{content.build.tags[3]}</span>
              <span className="tk-tag">{content.build.tags[4]}</span>
            </div>
            <div className="tk-shot" aria-hidden="true">
              <Image
                src={`${CDN}5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp?w=1000&h=540&fit=crop&crop=top&fm=webp&q=82`}
                alt=""
                width={1000}
                height={540}
                quality={82}
                loading="lazy"
              />
              <span className="rpill">
                <i></i>
                <b>Built by LoudFace</b>
                <span>LIQID</span>
              </span>
            </div>
          </article>
          <article className="tk is-lead rv" style={d('.08s')}>
            <span className="tk-num">{content.growth.badge}</span>
            <h3>{content.growth.title}</h3>
            <p className="tagline">{content.growth.tagline}</p>
            <p>
              {content.growth.description}
            </p>
            <div className="tk-tags">
              <span className="tk-tag">{content.growth.tags[0]}</span>
              <span className="tk-tag">{content.growth.tags[1]}</span>
              <span className="tk-tag">{content.growth.tags[2]}</span>
              <span className="tk-tag">{content.growth.tags[3]}</span>
            </div>
            <div className="tk-fig" aria-hidden="true">
              <svg viewBox="0 0 480 252" preserveAspectRatio="xMidYMid slice">
                <text x="24" y="34" className="hd">GROWTH SCOREBOARD</text>
                <text x="456" y="34" textAnchor="end">WEEKLY CADENCE</text>
                <line className="grid" x1="24" y1="118" x2="278" y2="118" />
                <line className="grid" x1="24" y1="88" x2="278" y2="88" />
                <line className="grid" x1="24" y1="58" x2="278" y2="58" />
                <path className="sparkfill" d="M24 118 L24 108 L70 100 L116 104 L162 84 L208 74 L254 56 L278 50 L278 118 Z" />
                <path className="spark" d="M24 108 L70 100 L116 104 L162 84 L208 74 L254 56 L278 50" />
                <circle className="dot" cx="278" cy="50" r="4" />
                <text x="316" y="72">SEO</text>
                <rect className="bar-bg" x="316" y="80" width="140" height="6" rx="3" />
                <rect className="bar" x="316" y="80" width="112" height="6" rx="3" />
                <text x="316" y="112">AEO</text>
                <rect className="bar-bg" x="316" y="120" width="140" height="6" rx="3" />
                <rect className="bar" x="316" y="120" width="86" height="6" rx="3" />
                <text x="316" y="152">CONTENT</text>
                <rect className="bar-bg" x="316" y="160" width="140" height="6" rx="3" />
                <rect className="bar" x="316" y="160" width="126" height="6" rx="3" />
                <text x="24" y="152">WK 01</text>
                <text x="110" y="152">WK 02</text>
                <text x="196" y="152">WK 03</text>
                <text x="24" y="196" className="hd">SHIPPED &#9646;&#9646;&#9646;&#9646;&#9646;&#9646;</text>
                <text x="24" y="222">IN PROGRESS &#9646;&#9646;&#9646;</text>
                <text x="316" y="196" className="hd">RESPONSE &lt; 2H</text>
                <text x="316" y="222">MEMO MONTHLY</text>
              </svg>
            </div>
          </article>
          <div className="tk-both rv" style={d('.14s')}>
            <span className="glyph">{content.connectorGlyph}</span>
            <p>
              {content.connectorText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
