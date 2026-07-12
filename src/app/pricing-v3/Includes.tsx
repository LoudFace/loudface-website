/**
 * Includes — "What every plan includes" icon band (7 tiles, 4+3 grid) followed
 * by the Special Arrangements editorial strip.
 */
const d = (v: string) => ({ ['--d' as string]: v });

const ITEMS: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: 'Full Autopilot ownership',
    desc: 'We own the roadmap, planning, and execution. You approve, we ship.',
    icon: <path d="M12 2l2.4 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-1.5z" strokeLinejoin="round" />,
  },
  {
    title: '2h response time',
    desc: 'Fast async communication during business hours.',
    icon: <path d="M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: 'Scoreboard',
    desc: "Live dashboard tracking what's in progress, what shipped, and what's next.",
    icon: <path d="M4 5h16v11H4zM4 20h16M9 9l2 2 3-4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: 'Monthly Memo',
    desc: "Strategic summary of what happened, what we learned, and where we're headed.",
    icon: <path d="M6 3h12v18l-6-3-6 3zM9 8h6M9 12h6" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: 'Quarterly Focus',
    desc: 'All work aligned around one high-impact objective each quarter.',
    icon: <path d="M12 3v3M12 12l4 2M3 12a9 9 0 1018 0 9 9 0 00-18 0z" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: 'Showcases',
    desc: 'Regular walkthroughs of work-in-progress before anything goes live.',
    icon: <path d="M3 5h18v11H3zM8 20h8M12 16v4M8 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: 'Maintenance',
    desc: 'Ongoing fixes, updates, and polish batched into your cadence.',
    icon: <path d="M14 4l6 6M3 21l1-5L15 5l4 4L8 20zM12 8l4 4" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

export function Includes() {
  return (
    <section className="includes" id="includes">
      <div className="container">
        <div className="includes-head rv">
          <span className="eyebrow">
            <i></i>Every plan
          </span>
          <h2 className="display">
            What every plan <span className="ghost">includes.</span>
          </h2>
          <p className="lede">
            The tier decides your velocity. These seven never change &mdash; they come with Solo,
            Dual, and Scale alike.
          </p>
        </div>
        <div className="inc-band rv" style={d('.06s')}>
          {ITEMS.map((item) => (
            <div className="inc-cell" key={item.title}>
              <div className="tico">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {item.icon}
                </svg>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpecialArrangements() {
  return (
    <section className="spec" id="arrangements">
      <div className="container">
        <div className="spec-card rv">
          <div className="spec-top">
            <h2>Special Arrangements</h2>
          </div>
          <p className="spec-desc">
            Every engagement runs through a retainer, but we flex the structure when it makes sense:
          </p>
          <div className="spec-two">
            <div className="spec-opt">
              <h3>
                <i aria-hidden="true"></i>Have a fixed scope?
              </h3>
              <p>
                We deliver it inside a retainer with a 3-month minimum. You get the same team,
                cadence, and Scoreboard. We just point all the velocity at your defined deliverable
                until it ships.
              </p>
            </div>
            <div className="spec-opt">
              <h3>
                <i aria-hidden="true"></i>Performance deals
              </h3>
              <p>
                For the right partnership, we tie part of our fee to results. You pay for outcomes,
                not hours. Available case-by-case.
              </p>
            </div>
          </div>
          <div className="spec-cta">
            <a className="btn btn-ink btn-md" href="#book-modal" data-cal-trigger="">
              Talk to Us About Your Scope
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
