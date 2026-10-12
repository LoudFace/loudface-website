import type { ReactNode } from 'react';
import { LaunchSteps } from './LaunchSteps';

/**
 * The launch stack: the team drawn as a two-stage rocket with side boosters on its pad, with callouts, as a
 * self-running figure (homepage What we do, since 2026-10-12). The figure is a standalone page,
 * public/figures/launch-stack-portrait.html, built from design-lab/anatomy/launch-stack-src (Anatomy skill; its README
 * says how to rebuild). It runs in a same-origin iframe: `ground` sets its background to the section's ground so it
 * sits flush, `still` shows the finished, fully labelled frame. Below 600px the figure drops its callouts and crops to
 * the rocket, so the frame turns 5:9 (.v11-launch-frame).
 */
export function LaunchStackFigure({ ground = 'f6f6f6', title, still = false }: { ground?: string; title: string; still?: boolean }) {
  return (
    <iframe
      className="v11-launch-frame"
      src={`/figures/launch-stack-portrait.html?ground=${ground}${still ? '&still' : ''}`}
      title={title}
      loading="lazy"
      style={{ background: `#${ground}` }}
    />
  );
}

/**
 * The eyebrow and heading run across the section (two lines at desktop), then two columns: the lede and the four
 * engagement steps the figure lights as it runs on the left (sticky while the figure plays), the figure on the right
 * at 800px. Below 1280px they stack.
 */
export function LaunchStackSection({ eyebrow, title, lede, steps, ground = 'f6f6f6', still = false, figureTitle }: { eyebrow: string; title: ReactNode; lede: string; steps: { when: string; heading: string; outcome: string }[]; ground?: string; still?: boolean; figureTitle: string }) {
  return (
    <section className="v11-sec v11-warm">
      <div className="v11-wrap">
        <div className="v11-eyebrow">{eyebrow}</div>
        <h2 className="v11-h2 v11-launch-h2">{title}</h2>
        <div className="v11-launch">
          <div className="v11-launch-copy">
            <p className="v11-launch-lede">{lede}</p>
            <LaunchSteps steps={steps} />
          </div>
          <div className="v11-launch-fig">
            <LaunchStackFigure ground={ground} still={still} title={figureTitle} />
          </div>
        </div>
      </div>
    </section>
  );
}
