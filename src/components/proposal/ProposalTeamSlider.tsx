'use client';

import { useCallback, useRef } from 'react';
import { SliderNav } from '@/components/ui/SliderNav';

/**
 * The people on the account, as a slider (Arnel, 2026-10-26: "a slider of our
 * team, similar to the About page"). It follows "One team runs both sides" and
 * puts names and faces to it: the four leads from /about, on the About page's
 * own tile grounds, then one card for the bench behind them.
 *
 * The copy and photos are the About page's (src/data/content/about-v11.json and
 * personPhoto), passed in by ProposalCardsDocument, so the two never drift.
 */

export type TeamLead = { slug: string; name: string; role: string; fact: string; photo: string };
export type TeamBench = { heading: string; body: string; roles: string[] };

/* The About page's tile grounds (about.css .ab-member.is-*), in the same order. */
const GROUNDS = [
  'radial-gradient(ellipse 80% 70% at 50% 100%, #d4cbfa 0%, rgba(212,203,250,0) 70%), #e9e3fd',
  'radial-gradient(ellipse 80% 70% at 50% 100%, #f9c2ab 0%, rgba(249,194,171,0) 70%), #fde3d7',
  'radial-gradient(ellipse 80% 70% at 50% 100%, #f4d78f 0%, rgba(244,215,143,0) 70%), #fcedc8',
  'radial-gradient(ellipse 80% 70% at 50% 100%, #b5e6cd 0%, rgba(181,230,205,0) 70%), #dcf2e6',
];

const card = 'rounded-2xl bg-white shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)]';
const slide = 'w-[78%] shrink-0 snap-start sm:w-[calc((100%-24px)/2.5)]';

export function ProposalTeamSlider({ leads, bench, index }: { leads: TeamLead[]; bench: TeamBench; index: number }) {
  const track = useRef<HTMLUListElement>(null);

  // Scroll to the next or previous card's own edge. A relative scrollBy stalls at
  // the end of a snapping row: going back from the clamped end lands on the same
  // snap point, so "previous" did nothing there.
  const step = useCallback((dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const lefts = [...el.children].map((c) => Math.min((c as HTMLElement).offsetLeft - el.offsetLeft, max));
    const now = el.scrollLeft;
    const target = dir > 0 ? lefts.find((x) => x > now + 4) ?? max : [...lefts].reverse().find((x) => x < now - 4) ?? 0;
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  return (
    <section
      id={`section-team-${index + 1}`}
      data-proposal-section="The people on your account"
      data-proposal-type="teamSlider"
      className="py-12 sm:py-14"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[22px] font-medium leading-tight tracking-[-0.03em] text-surface-950 sm:text-[26px]">The people on your account</h2>
          <p className="mt-2 max-w-[62ch] text-[15px] text-surface-600">
            One lead runs your account day to day and is your escalation point. Developers, designers, writers and link builders join as your plan calls for them.
          </p>
        </div>
        <SliderNav className="hidden shrink-0 sm:flex" onPrevClick={() => step(-1)} onNextClick={() => step(1)} />
      </div>

      <div className="mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4">
        <ul
          ref={track}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="The LoudFace team"
        >
          {leads.map((p, i) => (
            <li key={p.slug} className={slide}>
              <figure className={`m-0 flex h-full flex-col overflow-hidden ${card}`}>
                <div className="relative aspect-[306/300] overflow-hidden" style={{ background: GROUNDS[i % GROUNDS.length] }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt={p.name} width={800} height={800} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <figcaption className="flex flex-1 flex-col p-4">
                  <a
                    href={`https://www.loudface.co/team/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[17px] font-medium tracking-[-0.015em] text-surface-950 hover:underline hover:underline-offset-4"
                  >
                    {p.name}
                  </a>
                  <p className="mt-0.5 text-[13px] font-medium text-primary-700">{p.role}</p>
                  <p className="mt-2.5 text-[13.5px] leading-snug text-surface-700">{p.fact}</p>
                </figcaption>
              </figure>
            </li>
          ))}
          <li className={slide}>
            <div className={`flex h-full flex-col p-5 ${card}`}>
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <p className="mt-4 text-[17px] font-medium tracking-[-0.015em] text-surface-950">{bench.heading}</p>
              <p className="mt-2 text-[13.5px] leading-snug text-surface-700">{bench.body}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {bench.roles.map((r) => (
                  <li key={r} className="rounded-full bg-primary-50 px-2.5 py-1 text-[12px] font-medium text-primary-800">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
