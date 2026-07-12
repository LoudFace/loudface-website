/**
 * Ledger — "Six numbers, sources attached." Index list on crisp white (B).
 * The team-member count is derived from the live CMS team length; the other
 * figures are editorial and stay literal.
 */
import Link from 'next/link';

export function Ledger({ teamCount }: { teamCount: number }) {
  return (
    <section className="ledger" id="ledger">
      <div className="container">
        <div className="ledger-head rv">
          <div>
            <span className="eyebrow">
              <i></i>The ledger
            </span>
            <h2 className="display" style={{ marginTop: '20px' }}>
              Six numbers, <span className="ghost">sources attached.</span>
            </h2>
            <p className="lede">
              Every engagement leaves a paper trail. This is ours: pulled from real client work
              between 2017 and today. Where a number has a client, the client is named.
            </p>
          </div>
        </div>

        <div className="ledger-list">
          <div className="lgroup rv">The operation</div>
          <div className="lrow rv">
            <div className="lname">
              <h3>Team members</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>
              Designers, developers, and marketers. Every engagement is staffed from the same
              seven-person bench: the people below are the people on your project.
            </p>
            <div className="lfig">
              <div className="fig tab">{teamCount}</div>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.05s' }}>
            <div className="lname">
              <h3>Companies served</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>
              From funded startups to enterprises like Montblanc and Radisson. Different
              industries, same job: a site that has to earn its keep.
            </p>
            <div className="lfig">
              <div className="fig tab">100+</div>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.1s' }}>
            <div className="lname">
              <h3>Years on Webflow</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>
              Early adopters in 2017, back when it was the risky choice. Webflow Enterprise
              Partner today.
            </p>
            <div className="lfig">
              <div className="fig tab">7+</div>
            </div>
          </div>

          <div className="lgroup rv">The outcomes</div>
          <div className="lrow rv">
            <div className="lname">
              <h3>Increase in conversions</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>Measured across the Dimer Health engagement over a six-month optimization period.</p>
            <div className="lfig">
              <div className="fig tab">288%</div>
              <span className="lchip">
                <i></i>
                <b>Dimer Health</b>
                <span>CRO</span>
              </span>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.05s' }}>
            <div className="lname">
              <h3>AI visibility on the core prompt</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>From absent to cited on the answer that matters in Toku&rsquo;s category.</p>
            <div className="lfig">
              <div className="fig tab">0&thinsp;&rarr;&thinsp;86%</div>
              <span className="lchip">
                <i></i>
                <b>Toku</b>
                <span>AEO</span>
              </span>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.1s' }}>
            <div className="lname">
              <h3>Sales in the first 30 days</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>Attributed in the month after the rebuilt site went live.</p>
            <div className="lfig">
              <div className="fig tab">$200K</div>
              <span className="lchip">
                <i></i>
                <b>Outbound Specialist</b>
                <span>Launch</span>
              </span>
            </div>
          </div>

          <div className="lclose rv">
            <p>Every line above comes from a shipped engagement. Clients named, periods stated.</p>
            <Link href="/work">
              Explore the work <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
