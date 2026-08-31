/**
 * The instruments band shown in situ — hero copy above, story below — so the
 * two-thirds-of-a-viewport rule can actually be judged. A band that looks fine
 * alone can still swallow the page it sits in; this page is what tests that.
 *
 * Not indexed. Production case studies are untouched until Arnel picks.
 */
import type { Metadata } from 'next';
import './case-instruments.css';
import { CaseStudyInstruments } from './CaseStudyInstruments';
import { SearchInstruments } from './SearchInstruments';

export const metadata: Metadata = {
  title: 'Case-study instruments in situ',
  robots: { index: false, follow: false },
};

export default function CaseStudyInstrumentsPage() {
  return (
    <main style={{ background: '#fbfbfe', minHeight: '100vh', color: '#1a1633' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b6790', fontWeight: 500 }}>
          Case study · AI Search &amp; Organic Growth
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontWeight: 500,
            marginTop: '1rem',
            textWrap: 'balance',
          }}
        >
          TradeMomentum: niche AEO and 12× impressions
        </h1>
        <p style={{ marginTop: '1.25rem', maxWidth: '60ch', color: '#4a4670', fontSize: '1.0625rem', lineHeight: 1.6 }}>
          A trading-education brand competing against names with a decade of head start. The work was to get
          named in the AI answers their buyers actually ask for.
        </p>

        <div style={{ marginTop: '3rem' }}>
          <CaseStudyInstruments clientName="TradeMomentum" />
        </div>

        {/* Second board. Separate band, same language — see SearchInstruments. */}
        <div style={{ marginTop: '2.5rem' }}>
          <SearchInstruments clientName="TradeMomentum" />
        </div>

        {/* Story continues below — this is what the two-thirds cap protects. */}
        <div style={{ marginTop: '3.5rem', maxWidth: '68ch' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.01em' }}>What we did</h2>
          <p style={{ marginTop: '1rem', color: '#4a4670', lineHeight: 1.7, textWrap: 'pretty' }}>
            Placeholder body copy, here only so the band above can be judged against real page context. The
            point of the two-thirds cap is that a reader scrolling this page reaches this paragraph without
            having to scroll past a wall of charts first. If the instruments push this out of sight on a
            laptop, the band is too tall regardless of how good the charts look on their own.
          </p>
          <p style={{ marginTop: '1rem', color: '#4a4670', lineHeight: 1.7, textWrap: 'pretty' }}>
            The charts are the evidence, not the argument. They should read in about three seconds and then
            get out of the way.
          </p>
        </div>
      </div>
    </main>
  );
}
