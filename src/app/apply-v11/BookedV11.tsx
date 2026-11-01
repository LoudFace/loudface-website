import type { ApplyBookedContent, ApplyContent } from '@/lib/content-utils';
import type { HomeV11Data, ProofKey, Series } from '../home-v11/data';
import { ChartPanel } from '../home-v11/ChartPanel';
import { img, personPhoto } from '../home-v11/ui';
import { splitTitle } from '../case-v11/series';
import { ApplyFooter, ApplyGuarantee, hand } from './ApplyV11';

/**
 * /apply/booked: where an /apply booking lands (Arnel approved the Paper boards "Proposed · Apply booked · show-up
 * page" on 2026-11-01). Its only job is to raise the show-up rate: the call is confirmed (with nothing about the
 * visitor, who arrives with a clean URL), three steps make sure they come and come prepared, Arnel says one line, and
 * two real Search Console charts plus the signed guarantee give them something to read while they wait.
 * Copy in apply-booked.json (the letter and footer are /apply's, apply.json); every figure and chart is a case
 * study's published number and series (home-v11/data.ts).
 */

/** The two proof charts: Genie Teacher's weekly clicks (not Delshad, who is /apply's hero) and Pond's impressions. */
function proofCards(c: ApplyBookedContent, data: HomeV11Data | null) {
  const rows: { key: 'genie' | 'pond'; proof: ProofKey; series?: Series; logo?: string }[] = [
    { key: 'genie', proof: 'genieClicks', series: data?.genieWeekly, logo: img('logos/genie-icon.png') },
    { key: 'pond', proof: 'pond', series: data?.hero.pond },
  ];
  return rows.flatMap((r) => {
    const p = data?.proof[r.proof];
    if (!p || !r.series) return [];
    const t = splitTitle(p.title);
    // The study's own window, with its arrow read aloud: "May 2026 average → 7 days to …" → "… against the 7 days to …"
    const note = t.note?.replace(/\s*→\s*/, ' against the ');
    return [{ ...r, value: p.value, label: t.label, note, copy: c.proof[r.key] }];
  });
}

function Icon({ kind }: { kind: 'cal' | 'video' | 'list' }) {
  return (
    <span className="bk-ico" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'cal' && (
          <>
            <rect x="3.5" y="5" width="17" height="15" rx="3" stroke="#4f46e5" strokeWidth="1.6" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="#4f46e5" strokeWidth="1.6" />
            <path d="M8.5 14.2l2.2 2.2 4.6-4.8" stroke="#1b7f4b" strokeWidth="1.8" />
          </>
        )}
        {kind === 'video' && (
          <>
            <rect x="3" y="6" width="13" height="12" rx="3" stroke="#4f46e5" strokeWidth="1.6" />
            <path d="M16 10.5l5-3v9l-5-3" stroke="#4f46e5" strokeWidth="1.6" />
          </>
        )}
        {kind === 'list' && <path d="M5 6.5h14M5 12h14M5 17.5h9" stroke="#4f46e5" strokeWidth="1.7" />}
      </svg>
    </span>
  );
}

export function BookedV11({ c, apply, data }: { c: ApplyBookedContent; apply: ApplyContent; data: HomeV11Data | null }) {
  const k = c.card;
  const cards = proofCards(c, data);
  const note = (
    <div className="bk-note">
      <img src={personPhoto('arnel-bukva')} alt="Arnel Bukva" width={64} height={64} />
      <div>
        <p className="bk-quote"><span>{c.head.quote}</span></p>
        <div className="bk-by"><span>{c.head.quoteBy}</span></div>
      </div>
    </div>
  );

  return (
    <div className={`v11 ap bk ${hand.variable}`}>
      <section className="bk-hero">
        <div className="bk-left">
          <div className="bk-top">
            <img src={img('wordmark-white.svg')} alt="LoudFace" width={133} height={28} className="ap-logo" />
            <div className="bk-tag">
              <b aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.3l2.3 2.3 4.7-5" stroke="#1a1040" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></b>
              <span>{c.head.tag}</span>
            </div>
          </div>
          <h1 className="bk-h1"><span>{c.head.headline}</span> <span className="ap-ghost">{c.head.headlineGhost}</span></h1>
          <p className="bk-lede"><span>{c.head.body}</span></p>
          <div className="bk-note-wrap">{note}</div>
        </div>

        <div className="bk-right">
          <div className="bk-plate">
            <div className="bk-card">
              <h2 className="bk-card-t"><span>{k.title}</span></h2>
              <p className="bk-card-s"><span>{k.sub}</span></p>
              <ol className="bk-steps">
                <li className="bk-step">
                  <Icon kind="cal" />
                  <div>
                    <h3 className="bk-st"><span>{k.invite.title}</span></h3>
                    <p className="bk-sp"><span>{k.invite.body}</span></p>
                    <div className="bk-ui" aria-hidden="true">
                      <span className="bk-q">{k.invite.going}</span>
                      <span className="bk-pill is-yes">{k.invite.yes}</span>
                      <span className="bk-pill">{k.invite.maybe}</span>
                      <span className="bk-pill">{k.invite.no}</span>
                    </div>
                  </div>
                </li>
                <li className="bk-step">
                  <Icon kind="video" />
                  <div>
                    <h3 className="bk-st"><span>{k.join.title}</span></h3>
                    <p className="bk-sp"><span>{k.join.body}</span></p>
                    <div className="bk-tags" aria-hidden="true">
                      <span className="bk-chip">{k.join.length}</span>
                      <span className="bk-chip"><img src={img('logos/fav-google-g.png')} alt="" width={16} height={16} />{k.join.console}</span>
                      <span className="bk-chip">{k.join.site}</span>
                    </div>
                  </div>
                </li>
                <li className="bk-step">
                  <Icon kind="list" />
                  <div>
                    <h3 className="bk-st"><span>{k.cover.title}</span></h3>
                    <p className="bk-sp"><span>{k.cover.body}</span></p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {cards.length > 0 && (
        <section className="bk-proof">
          <div className="bk-proof-in">
            <div className="ap-eyebrow"><i aria-hidden="true" /><span>{c.proof.eyebrow}</span></div>
            <h2 className="ap-h2"><span>{c.proof.heading}</span> <span className="ap-ghost2">{c.proof.headingGhost}</span></h2>
            <div className="bk-pgrid">
              {cards.map((x) => (
                <article className="bk-pcard" key={x.key}>
                  <div className="bk-pk">
                    {x.logo && <img src={x.logo} alt="" width={22} height={22} />}
                    <span>{x.copy.client}</span>
                  </div>
                  <div className="bk-pbig">{x.value}</div>
                  <p className="bk-pcap"><span>{x.copy.lead}</span>{x.note ? ' ' : ''}{x.note && <span>{x.note}.</span>}</p>
                  <div className="bk-pchart">
                    <ChartPanel title={x.label} source={c.proof.source} series={x.series as Series} format="index" tip={x.copy.tip} height={300} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <ApplyGuarantee g={apply.guarantee} body={<span>{c.guaranteeBody}</span>} />
      <ApplyFooter f={apply.footer} />
    </div>
  );
}
