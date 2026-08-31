import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/instruments/instruments.css';
import { AnswerReadout } from '../../../home-v3/instruments/AnswerReadout';
import { SystemStages } from '../../../home-v3/instruments/SystemStages';
import { ResultsInstrument } from '../../../home-v3/instruments/ResultsInstrument';
import { ProcessArtifacts } from '../../../home-v3/instruments/ProcessArtifacts';
import { SystemMatrix } from '../../../home-v3/instruments/SystemMatrix';

/**
 * Preview-only route for the homepage-section variation.
 *
 * Two concepts, identical content, different ground:
 *   A — CRISP: instruments as white panels on dotted paper, one deep stage for
 *       contrast. Reads as a technical manual.
 *   B — DEEP:  the same instruments as glass panels on night-indigo fields.
 *       Reads as a control room.
 *
 * The live homepage is untouched. Shared chrome (header/footer) is deliberately
 * not re-designed here — it comes from the (site) layout, verbatim.
 */
export const metadata: Metadata = {
  title: 'Homepage instruments — concept preview',
  robots: { index: false, follow: false },
};

type Ground = 'light' | 'dark';

function Sections({ ground }: { ground: Ground }) {
  const g = ground === 'dark' ? 'ci-dark' : 'ci-light';
  const alt = ground === 'dark' ? 'ci-light' : 'ci-dark';

  return (
    <>
      <section className={`ci ${g}`}>
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">The problem</span>
            <h2>Your buyers are asking. The answer names someone else.</h2>
            <p>
              Buyers now open an assistant before they open a search engine. If your pages are not built to be quoted,
              the answer they get is a list of your competitors — and you never enter the conversation.
            </p>
          </div>
          <AnswerReadout />
        </div>
      </section>

      <section className={`ci ${alt}`}>
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">What we do</span>
            <h2>One system, four stages</h2>
            <p>
              From the single term your homepage has to own, through to the page that turns a visitor into a booked
              call. Pick a stage to see what the work actually looks like.
            </p>
          </div>
          <SystemStages />
        </div>
      </section>

      <section className={`ci ${g}`}>
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Results</span>
            <h2>Numbers, not adjectives</h2>
          </div>
          <ResultsInstrument />
        </div>
      </section>

      <section className={`ci ${g}`}>
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">The engagement</span>
            <h2>What working with us looks like</h2>
            <p>
              No 47-slide proposals and no three-month discovery phase. Four gates, and the thing you receive at each
              one.
            </p>
          </div>
          <ProcessArtifacts />
        </div>
      </section>

      <section className={`ci ${alt}`}>
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Why one partner</span>
            <h2>The whole system, not the pieces</h2>
            <p>
              Most routes sell you one part of it: the words, the links, the tool. We run the whole chain and answer for
              the outcome at the end of it.
            </p>
          </div>
          <SystemMatrix />
        </div>
      </section>
    </>
  );
}

export default function HomeInstrumentsPreview() {
  return (
    <main className="hpv3">
      <div className="ci ci-intro ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Concept A — crisp</span>
            <h2>Instruments on paper</h2>
            <p>
              Every section carries a working miniature of the thing it claims. White panels, hairline indigo structure,
              dotted engineering paper. One deep stage for contrast.
            </p>
          </div>
        </div>
      </div>
      <Sections ground="light" />

      <div className="ci ci-intro ci-dark">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Concept B — deep</span>
            <h2>Instruments on the stage</h2>
            <p>
              The same instruments, rebuilt as glass panels floating on night-indigo fields. One crisp-light stage for
              contrast.
            </p>
          </div>
        </div>
      </div>
      <Sections ground="dark" />
    </main>
  );
}
