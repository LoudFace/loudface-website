/**
 * NextSteps — the "what happens next" engagement thread: a 4-step vertical
 * timeline (book → intro call → plan in writing → kickoff) beside a decorative
 * calendar companion card that mirrors the actual booking surface. The
 * calendar is aria-hidden and static (illustrative month, not live data) —
 * the four steps already read in full on the left.
 */
const STEPS = [
  {
    title: 'You book the call',
    chip: 'now',
    body:
      "The button opens our calendar. Pick a slot that works and you're on the thread. That's the whole sign-up: no intake questionnaire standing between you and a conversation.",
    origin: true,
  },
  {
    title: 'The intro call',
    chip: '30 min',
    body:
      "Thirty minutes over video. We pull up your live site, you tell us where it hurts, and we give you an honest read on what we'd change and why. It's useful whether or not we work together.",
  },
  {
    title: 'The plan, in writing',
    chip: '2h response',
    body:
      'Within two working hours of the call you get a written recap and a proposed shape of work. Clear scope, one flat rate, cancel anytime.',
  },
  {
    title: 'Kickoff',
    chip: 'weekly ships',
    body:
      'Approve it and the weekly ship cadence begins. You get a direct line to the people actually doing the work, not an account manager relaying messages in between.',
  },
];

const chev = (path: string) => (
  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d={path} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Static illustrative month grid: [label, modifier] */
const DAYS: [string, '' | 'muted' | 'avail' | 'sel'][] = [
  ['28', 'muted'], ['29', 'muted'], ['30', 'muted'], ['31', 'muted'], ['1', ''], ['2', ''], ['3', ''],
  ['4', ''], ['5', ''], ['6', ''], ['7', ''], ['8', ''], ['9', ''], ['10', ''],
  ['11', ''], ['12', ''], ['13', ''], ['14', 'sel'], ['15', 'avail'], ['16', ''], ['17', 'avail'],
  ['18', 'avail'], ['19', ''], ['20', 'avail'], ['21', ''], ['22', 'avail'], ['23', ''], ['24', ''],
  ['25', 'avail'], ['26', ''], ['27', ''], ['28', ''], ['29', ''], ['30', ''], ['31', ''],
];

export function NextSteps() {
  return (
    <section className="next" aria-label="What happens after you book">
      <div className="wrap next__grid">
        <div className="next__left">
          <div className="next__head rv">
            <h2>
              Booking is the <span className="hl-l">first move</span>, not a form to fill.
            </h2>
            <p className="next__sub">
              One click sets a real sequence in motion. Here&rsquo;s the exact path every LoudFace
              engagement runs, starting the moment you hit the button.
            </p>
          </div>

          <div className="steps rv" style={{ ['--d' as string]: '.08s' }}>
            {STEPS.map((s) => (
              <div className={`step${s.origin ? ' step--origin' : ''}`} key={s.title}>
                <div className="step__row">
                  <h3>{s.title}</h3>
                  <span className="step__chip">{s.chip}</span>
                </div>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* illustrated companion — the actual booking surface, not a second copy of the step list */}
        <aside className="cal-card rv" style={{ ['--d' as string]: '.12s' }} aria-hidden="true">
          <div className="cal__head">
            <span className="cal__month">August 2026</span>
            <div className="cal__nav">
              <span>{chev('M6.5 1.5 2.5 5l4 3.5')}</span>
              <span>{chev('M3.5 1.5 7.5 5l-4 3.5')}</span>
            </div>
          </div>
          <div className="cal__dow">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dw, i) => (
              <span key={i}>{dw}</span>
            ))}
          </div>
          <div className="cal__grid">
            {DAYS.map(([label, mod], i) => (
              <span key={i} className={`cal__day${mod ? ` cal__day--${mod}` : ''}`}>
                {label}
                {mod === 'sel' && <span className="live-dot"></span>}
              </span>
            ))}
          </div>
          <div className="cal__rule"></div>
          <div className="cal__slots-label">
            <span>Thu, Aug 14</span>
            <span className="cal__tz">PT</span>
          </div>
          <div className="cal__slots">
            <div className="cal__slot"><span>9:00 AM</span></div>
            <div className="cal__slot cal__slot--sel">
              <span>11:30 AM</span>
              <span className="cal__check">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2 5 8.7l4.5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <div className="cal__slot"><span>2:00 PM</span></div>
            <div className="cal__slot"><span>4:30 PM</span></div>
          </div>
          <div className="cal__foot">Same calendar you&rsquo;ll book on &nbsp;&middot;&nbsp; 30 min &nbsp;&middot;&nbsp; no intake form</div>
        </aside>
      </div>
    </section>
  );
}
