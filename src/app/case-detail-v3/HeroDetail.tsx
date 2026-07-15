/**
 * HeroDetail — the electric split-screen hero (server component, zero client JS).
 *
 * Left: breadcrumb + client identity + H1 (data-speakable) + summary + a booking
 * CTA. Right: the signature hero object, in one of two variants:
 *   - two-state answer card, when the lead result encodes a before → after climb
 *   - single-state result card otherwise (same glass family, one column)
 *
 * The dark→scrolled nav flip is owned by the shared (site) Header in its
 * heroTheme="dark" variant (keys off this `.hero` element), so no page script.
 */
import Link from 'next/link';
import type { ResultTransition, ResultStat } from './helpers';

const ArrowIcon = () => (
  <svg className="arrow" width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
    <path d="M9 1l5 5-5 5M14 6H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface HeroDetailProps {
  projectTitle: string;
  summary?: string;
  clientName?: string;
  clientLogoUrl?: string;
  industryName?: string;
  country?: string;
  transition: ResultTransition | null;
  result1: ResultStat;
  result2?: ResultStat;
}

export function HeroDetail({
  projectTitle,
  summary,
  clientName,
  clientLogoUrl,
  industryName,
  country,
  transition,
  result1,
  result2,
}: HeroDetailProps) {
  return (
    <section className="hero" aria-label="Case study overview">
      <div className="container-wide">
        <nav className="hero-crumb" aria-label="Breadcrumb">
          <Link href="/case-studies">Case Studies</Link>
          <span className="sep" aria-hidden="true">/</span>
          {clientLogoUrl && (
            <span className="client-chip">
              <img src={clientLogoUrl} alt={clientName ? `${clientName} logo` : 'Client logo'} height={15} loading="eager" />
            </span>
          )}
          <span>{clientName || projectTitle}</span>
          {industryName && (
            <>
              <span className="sep" aria-hidden="true">·</span>
              <span className="ind">{industryName}</span>
            </>
          )}
          {country && (
            <>
              <span className="sep" aria-hidden="true">·</span>
              <span className="ind">{country}</span>
            </>
          )}
        </nav>

        <div className={`hero-grid${transition ? '' : ' single'}`}>
          <div className="hero-claim">
            <h1 data-speakable>{projectTitle}</h1>
            {summary && <p className="hero-sum" data-speakable>{summary}</p>}
            <div className="hero-actions">
              <button type="button" className="btn btn-light" data-cal-trigger>
                Book an intro call <ArrowIcon />
              </button>
              <span className="slots">2h response time</span>
            </div>
          </div>

          <div className="hero-object">
            {transition ? (
              <div className="answer-card">
                <div className="ac-head">
                  <span className="ac-spark" aria-hidden="true">✦</span> The shift
                  <span className="ac-live">tracked</span>
                </div>
                <div className="ac-states">
                  <div className="ac-state ac-before">
                    <span className="ac-when">Before</span>
                    <span className="ac-txt tnum">{transition.before}</span>
                  </div>
                  <div className="ac-state ac-now">
                    <span className="ac-when">Now</span>
                    <span className="ac-txt tnum">{transition.after}</span>
                  </div>
                </div>
                <div className="ac-delta">
                  <span className="ac-delta-num tnum">{result1.number}</span>
                  <span className="ac-delta-lab">{result1.title}</span>
                </div>
              </div>
            ) : (
              <div className="answer-card">
                <div className="ac-head">
                  <span className="ac-spark" aria-hidden="true">✦</span> The result
                </div>
                <div className="rc-main">
                  <div className="rc-num tnum">{result1.number}</div>
                  <div className="rc-lab">{result1.title}</div>
                </div>
                {result2 && (
                  <div className="rc-more">
                    <b className="tnum">{result2.number}</b>
                    <span>{result2.title}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
