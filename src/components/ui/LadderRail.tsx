'use client';

import { useEffect, useRef } from 'react';

/**
 * LadderRail Component
 *
 * Fixed left-edge scroll-spy rail for service child-pages (desktop >=1280px only).
 * Originated in the "Question Ladder" service-page-v3 concept — the one signature
 * differentiator that concept introduced over the About/Pricing v3 references.
 *
 * What it does:
 * - Lists the page's H2 "answer sections" as short nav labels (rungs)
 * - Draws a hairline spine with a marching-ants "live" segment that grows to the active rung
 * - Scroll-spies via IntersectionObserver to set the active rung
 * - Inverts color (on-dark) when the rail's vertical midpoint overlaps a `.stage`
 *   (dark-indigo) section — computed on scroll via getBoundingClientRect, not by section
 *   background color per se, so it stays correct if stage order changes
 * - Is a click-to-scroll in-page nav (scrollIntoView smooth) as well as a passive indicator
 *
 * Every service child-page (Webflow, SEO/AEO, GEO, CRO, UX/UI Design, Copywriting,
 * Growth Autopilot) should reference THIS component with a different `sections` array —
 * never a page-local reimplementation. Everything besides `sections` (spine geometry,
 * dark-inversion, IO thresholds) is internal behavior, not configuration, to keep the
 * rail consistent across every service page.
 *
 * Requires each target section element to carry `id={section.id}` and the page to include
 * at least one `.stage` element (dark-indigo section) for the on-dark inversion to have
 * something to detect against — pages with no dark stages simply never invert.
 */

interface LadderSection {
  /** DOM id of the target section (must match an element's id on the page) */
  id: string;
  /** Short nav label shown on hover / active state */
  label: string;
}

interface LadderRailProps {
  /** One entry per rung, in DOM order */
  sections: LadderSection[];
}

export function LadderRail({ sections }: LadderRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const ladder = railRef.current;
    const live = liveRef.current;
    if (!ladder || !live) return;

    const rungs = [...ladder.querySelectorAll<HTMLAnchorElement>('.rung')];
    const ids = sections.map((s) => s.id);
    const targets = ids.map((id) => document.getElementById(id));
    const darkStages = [...document.querySelectorAll<HTMLElement>('.stage')];

    // rung vertical centers in the spine viewBox (0 0 12 296), evenly spaced
    const spineTop = 10;
    const spineBottom = 286;
    const step = rungs.length > 1 ? (spineBottom - spineTop) / (rungs.length - 1) : 0;
    const yTops = rungs.map((_, i) => spineTop + step * i);

    function setActive(i: number) {
      rungs.forEach((r, k) => r.classList.toggle('active', k === i));
      live?.setAttribute('y2', String(yTops[i]));
    }

    // click to scroll
    const clickHandlers = rungs.map((r) => {
      const handler = (e: MouseEvent) => {
        e.preventDefault();
        const target = r.dataset.target;
        if (target) document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      r.addEventListener('click', handler);
      return { r, handler };
    });

    // spy which answer-section is in view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = ids.indexOf(entry.target.id);
            if (i >= 0) setActive(i);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    targets.forEach((t) => t && io.observe(t));

    // invert rail colour when it overlaps a dark stage
    function invert() {
      if (!ladder) return;
      const mid = window.innerHeight / 2;
      let onDark = false;
      darkStages.forEach((d) => {
        const b = d.getBoundingClientRect();
        if (b.top < mid && b.bottom > mid) onDark = true;
      });
      ladder.classList.toggle('on-dark', onDark);
    }
    invert();
    window.addEventListener('scroll', invert, { passive: true });

    setActive(0);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', invert);
      clickHandlers.forEach(({ r, handler }) => r.removeEventListener('click', handler));
    };
  }, [sections]);

  return (
    <div className="ladder" id="ladder" aria-hidden="true" ref={railRef}>
      <svg className="spine" viewBox="0 0 12 296" preserveAspectRatio="none">
        <line className="spine-track" x1="6" y1="10" x2="6" y2="286" />
        <line className="spine-live" ref={liveRef} x1="6" y1="10" x2="6" y2="10" />
      </svg>
      {sections.map((s) => (
        <a className="rung" data-target={s.id} key={s.id}>
          <span className="node" />
          <span className="rlab">{s.label}</span>
        </a>
      ))}

      <style>{`
        .ladder{position:fixed;left:20px;top:50%;transform:translateY(-50%);z-index:55;width:48px;display:none;flex-direction:column;align-items:center}
        .ladder svg.spine{position:absolute;left:50%;top:0;transform:translateX(-50%);height:100%;width:12px;overflow:visible;pointer-events:none}
        .ladder .rung{position:relative;display:flex;align-items:center;justify-content:center;height:74px;width:48px;cursor:pointer}
        .ladder .node{width:11px;height:11px;border-radius:50%;border:1.5px solid rgba(30,27,75,.32);background:#fff;transition:border-color .3s var(--ease-out, ease-out),background .3s var(--ease-out, ease-out),box-shadow .3s var(--ease-out, ease-out);z-index:2}
        .ladder .rung .rlab{position:absolute;left:3.25rem;top:50%;transform:translateY(-50%) translateX(-.25rem);font-family:var(--font-sans);font-weight:700;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(30,27,75,.4);white-space:nowrap;opacity:0;transition:opacity .3s var(--ease-out, ease-out),transform .3s var(--ease-out, ease-out),color .3s var(--ease-out, ease-out);pointer-events:none}
        .ladder .rung:hover .rlab{opacity:1;transform:translateY(-50%) translateX(0)}
        .ladder .rung.active .node{border-color:var(--accent, #4f46e5);background:var(--accent, #4f46e5);box-shadow:0 0 0 4px rgba(79,70,229,.14)}
        .ladder .rung.active .rlab{opacity:1;transform:translateY(-50%) translateX(0);color:var(--accent, #4f46e5)}
        .ladder.on-dark .node{border-color:rgba(255,255,255,.4);background:rgba(30,27,75,.6)}
        .ladder.on-dark .rung .rlab{color:rgba(255,255,255,.5)}
        .ladder.on-dark .rung.active .node{border-color:var(--accent-ll, #a5b4fc);background:var(--accent-ll, #a5b4fc);box-shadow:0 0 0 4px rgba(165,180,252,.18)}
        .ladder.on-dark .rung.active .rlab{color:var(--accent-ll, #a5b4fc)}
        .spine-track{stroke:rgba(30,27,75,.16);stroke-width:2}
        .spine-live{stroke:var(--accent, #4f46e5);stroke-width:2;stroke-dasharray:5 7;animation:ladderMarch 1.1s linear infinite}
        .ladder.on-dark .spine-track{stroke:rgba(255,255,255,.18)}
        .ladder.on-dark .spine-live{stroke:var(--accent-ll, #a5b4fc)}
        @keyframes ladderMarch{to{stroke-dashoffset:-24}}
        @media(min-width:1280px){.ladder{display:flex}}
      `}</style>
    </div>
  );
}
