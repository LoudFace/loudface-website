import type { HomeV11Content } from '@/lib/content-utils';
import { SectionHead, img } from './ui';

const TEAM = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];
const DOT = ['#3d38cf', '#b4a7ec', '#ec6c48', '#e2ad3c'];

/** The four leads at full size, then the specialists and the agents behind them, so a small core reads as senior. */
export function Team({ c }: { c: HomeV11Content['team'] }) {
  return (
    <section className="v11-sec v11-white">
      <div className="v11-wrap">
        <SectionHead eyebrow={c.eyebrow} heading={c.heading} body={c.body} />
        <div className="v11-team">
          {c.people.map((p, i) => (
            <div key={TEAM[i]} className="v11-member">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(`team/${TEAM[i]}.jpg`)} alt="" width={306} height={372} loading="lazy" />
              <div className="v11-member-name">{p.person}</div>
              <div className="v11-member-role">{p.jobTitle}</div>
              <div className="v11-member-does"><span className="v11-member-dot" style={{ background: DOT[i] }} /><span>{p.does}</span></div>
            </div>
          ))}
          <div className="v11-bench">
            <div className="v11-bench-copy">
              <div className="v11-bench-head">{c.benchHeading}</div>
              <p>{c.benchBody}</p>
              <ul className="v11-bench-roles">
                {c.benchRoles.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
          <div className="v11-team-note">
            <div className="v11-team-note-head">{c.noteHeading}</div>
            <div className="v11-team-note-foot">
              <div className="v11-stack is-34">
                {TEAM.map((w) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img loading="lazy" key={w} src={img(`avatars/${w}.png`)} alt="" width={34} height={34} className="v11-av" />
                ))}
                <span className="v11-team-agent" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round"><path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M9.5 2.5L8.1 3.9M3.9 8.1L2.5 9.5" /></svg>
                </span>
              </div>
              <p>{c.noteBody}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
