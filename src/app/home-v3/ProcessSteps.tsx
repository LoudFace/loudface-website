import type { HomeV3ProcessContent } from '@/lib/content-utils';

/** ProcessSteps — "How an engagement works": four gates on one dashed runway. Maps content.steps. */
const STEP_LAYOUT = [
  { live: false, delay: undefined as string | undefined },
  { live: false, delay: '.07s' },
  { live: true, delay: '.14s' },
  { live: false, delay: '.21s' },
];

export function ProcessSteps({ content }: { content: HomeV3ProcessContent }) {
  return (
    <section className="process">
      <div className="container">
        <div className="sec-head rv" style={{ marginBottom: 0 }}>
          <div>
            <h2 className="sec">{content.headline}</h2>
            <p className="sub">{content.subtitle}</p>
          </div>
        </div>
        <ol className="steps">
          {STEP_LAYOUT.map((layout, i) => {
            const s = content.steps[i];
            return (
              <li key={s.gate} className={`step${layout.live ? ' live' : ''} rv`} style={layout.delay ? { transitionDelay: layout.delay } : undefined}>
                <span className="node" aria-hidden="true"></span>
                <span className="gate">{s.gate}</span>
                <article>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
