/**
 * Ledger — "Six numbers, sources attached." Index list on crisp white (B).
 * The team-member count is derived from the live CMS team length; the other
 * figures are editorial and stay literal.
 */
import Link from 'next/link';
import type { AboutLedgerContent } from '@/lib/content-utils';

/** Wraps one substring of an editorial string in a Link, leaving the rest as plain text. */
function linkedText(text: string, phrase: string, href: string) {
  const idx = text.indexOf(phrase);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Link href={href}>{phrase}</Link>
      {text.slice(idx + phrase.length)}
    </>
  );
}

export function Ledger({
  teamCount,
  content,
}: {
  teamCount: number;
  content: AboutLedgerContent;
}) {
  return (
    <section className="ledger" id="ledger">
      <div className="container">
        <div className="ledger-head rv">
          <div>
            <span className="eyebrow">
              <i></i>{content.eyebrow}
            </span>
            <h2 className="display" style={{ marginTop: '20px' }}>
              {content.headline} <span className="ghost">{content.headlineHighlight}</span>
            </h2>
            <p className="lede">
              {content.intro}
            </p>
          </div>
        </div>

        <div className="ledger-list">
          <div className="lgroup rv">{content.operationLabel}</div>
          <div className="lrow rv">
            <div className="lname">
              <h3>{content.rows[0].title}</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>
              {content.rows[0].description}{teamCount}{content.rows[0].descriptionSuffix}
            </p>
            <div className="lfig">
              <div className="fig tab">{teamCount}</div>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.05s' }}>
            <div className="lname">
              <h3>{content.rows[1].title}</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>
              {content.rows[1].description}
            </p>
            <div className="lfig">
              <div className="fig tab">{content.rows[1].fig}</div>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.1s' }}>
            <div className="lname">
              <h3>{content.rows[2].title}</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>
              {content.rows[2].description}
            </p>
            <div className="lfig">
              <div className="fig tab">{content.rows[2].fig}</div>
            </div>
          </div>

          <div className="lgroup rv">{content.outcomesLabel}</div>
          <div className="lrow rv">
            <div className="lname">
              <h3>{content.rows[3].title}</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>{content.rows[3].description}</p>
            <div className="lfig">
              <div className="fig tab">{content.rows[3].fig}</div>
              <span className="lchip">
                <i></i>
                <b>{content.rows[3].chipClient}</b>
                <span>{content.rows[3].chipTag}</span>
              </span>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.05s' }}>
            <div className="lname">
              <h3>{content.rows[4].title}</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>{linkedText(content.rows[4].description, 'the answer that matters in Toku’s category', '/case-studies/toku-ai-cited-pipeline')}</p>
            <div className="lfig">
              <div className="fig tab">{content.rows[4].fig}</div>
              <span className="lchip">
                <i></i>
                <b>{content.rows[4].chipClient}</b>
                <span>{content.rows[4].chipTag}</span>
              </span>
            </div>
          </div>
          <div className="lrow rv" style={{ ['--d' as string]: '.1s' }}>
            <div className="lname">
              <h3>{content.rows[5].title}</h3>
              <span className="leader" aria-hidden="true"></span>
            </div>
            <p>{content.rows[5].description}</p>
            <div className="lfig">
              <div className="fig tab">{content.rows[5].fig}</div>
              <span className="lchip">
                <i></i>
                <b>{content.rows[5].chipClient}</b>
                <span>{content.rows[5].chipTag}</span>
              </span>
            </div>
          </div>

          <div className="lclose rv">
            <p>{content.closingText}</p>
            <Link href="/work">
              {content.closingLinkText} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
