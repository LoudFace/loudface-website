import { Caveat } from 'next/font/google';
import Link from 'next/link';
import { asset } from '@/lib/assets';
import type { ApplyContent } from '@/lib/content-utils';
import type { HomeV11Data } from '../home-v11/data';
import { proofValue } from '../home-v11/hero-slides';
import { img, personPhoto } from '../home-v11/ui';
import { ApplyChart, barGeometry, chartDates } from './ApplyChart';
import { ApplyHero } from './ApplyHero';

/**
 * /apply, the Meta-ads application page: design D, "B look, A content" (Arnel picked it on 2026-10-31; Paper file
 * "LoudFace Website · v11", boards "Proposed · Apply D · B look, A content" on Desktop · v11 and Phone · v11).
 * One ink stage: the promise, Delshad Legal's Search Console chart with the guarantee's bar drawn on it and three
 * results on the left, the application card on the brand plate on the right. Below it the signed guarantee letter,
 * then a thin footer. No site header: visitors arrive from an ad, and the only way on is the application.
 * Every figure is a case study's published number (home-v11/data.ts PROOF); copy in apply.json.
 */
const hand = Caveat({ subsets: ['latin'], weight: ['600'], variable: '--font-hand', preload: false });

const ENGINES = ['fav-chatgpt.webp', 'fav-claude.png', 'fav-gemini.png', 'fav-perplexity.png'].map((f) => img(`logos/${f}`));

export function ApplyV11({ c, data }: { c: ApplyContent; data: HomeV11Data | null }) {
  const series = data?.hero.delshad;
  const dates = series ? chartDates(series) : null;
  const m3 = series ? barGeometry(series) : null;
  const m3Pct = series && m3 ? (m3.x(m3.monthThree) / 600) * 100 : 0;
  const cells = [
    { n: proofValue(data, 'pond'), l: c.proof.pondLabel },
    { n: proofValue(data, 'hayesSearches'), l: c.proof.hayesLabel },
    { n: c.proof.teams, l: c.proof.teamsLabel },
  ].filter((x) => x.n);

  const head = (
    <div className="ap-head">
      <img src={img('wordmark-white.svg')} alt="LoudFace" width={133} height={28} className="ap-logo" />
      <div className="ap-chip">
        <i aria-hidden="true" />
        <span className="ap-wide"><span>{c.head.audience}</span></span>
        <span className="ap-narrow"><span>{c.head.audienceShort}</span></span>
      </div>
    </div>
  );

  const headline = (
    <h1 className="ap-h1">
      <span className="ap-h1-promise"><span>{c.head.headline}</span> <span className="ap-ghost">{c.head.headlineGhost}</span></span>
      <span className="ap-h1-cal" aria-hidden="true"><span>{c.head.calHeadline}</span> <span className="ap-ghost">{c.head.calHeadlineGhost}</span></span>
    </h1>
  );

  const rest = (
    <>
      <p className="ap-lede"><span>{c.head.body}</span></p>
      {series && dates && (
        <figure className="ap-chart">
          <div className="ap-ch-head">
            <div className="ap-ch-k"><span>{c.chart.client}</span> · <span className="ap-ch-m">{c.chart.metric}</span><span className="ap-wide ap-ch-m"> · <span>{c.chart.source}</span></span></div>
            <div className="ap-ch-big">{proofValue(data, 'delshadClicks')}</div>
          </div>
          <ApplyChart series={series} barLabel={c.chart.bar} barShort={c.chart.barShort} />
          <figcaption className="ap-ch-cap">
            <span>{dates.first} · <span>{c.chart.start}</span></span>
            <span className="ap-ch-m3" style={{ left: `${m3Pct}%` }}><span>{c.chart.monthThree}</span></span>
            <span>{dates.last}</span>
          </figcaption>
        </figure>
      )}
      <div className="ap-cells">
        {cells.map((x, i) => (
          <div className="ap-cell" key={i}><div className="ap-cell-n">{x.n}</div><div className="ap-cell-l"><span>{x.l}</span></div></div>
        ))}
      </div>
    </>
  );

  const g = c.guarantee;
  return (
    <div className={`v11 ap ${hand.variable}`}>
      <ApplyHero c={c} head={head} headline={headline} rest={rest} avatar={personPhoto('arnel-bukva')} engines={ENGINES} />

      <section className="ap-band">
        <div className="ap-band-in">
          <div className="ap-gplate">
            <div className="ap-sheet">
              <div className="ap-sheet-h"><img src={asset('/images/loudface.svg')} alt="LoudFace" width={92} height={19} /><span>{g.example}</span></div>
              <div className="ap-sheet-t"><span>{g.title}</span></div>
              <div className="ap-sheet-rows">
                {g.rows.map((r, i) => (
                  <div className="ap-sheet-row" key={i}><span className="ap-sheet-k">{r.label}</span><span className="ap-sheet-v">{r.value}</span></div>
                ))}
              </div>
              <div className="ap-sign">
                <div><div className="ap-hand">{g.signature}</div><div className="ap-who2"><span>{g.signer}</span></div></div>
                <div className="ap-who2"><span>{g.binding}</span></div>
              </div>
            </div>
          </div>
          <div className="ap-band-copy">
            <div className="ap-eyebrow"><i aria-hidden="true" /><span>{g.eyebrow}</span></div>
            <h2 className="ap-h2"><span>{g.heading}</span> <span className="ap-ghost2">{g.headingGhost}</span></h2>
            <p className="ap-p"><span>{g.body}</span></p>
            <div className="ap-hostline">
              <img src={personPhoto('arnel-bukva')} alt="Arnel Bukva" width={56} height={56} />
              <div><div className="ap-hostline-t"><span>{g.hostTitle}</span></div><div className="ap-hostline-s"><span>{g.hostBody}</span></div></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="ap-footer">
        <div className="ap-footer-row">
          <span>{c.footer.legal}</span>
          <span className="ap-footer-links"><Link href="/privacy">{c.footer.privacy}</Link><Link href="/terms">{c.footer.terms}</Link></span>
        </div>
        <p className="ap-footer-note"><span>{c.footer.note}</span></p>
      </footer>
    </div>
  );
}
