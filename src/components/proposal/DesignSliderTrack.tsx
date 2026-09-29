'use client';

import { useCallback, useRef } from 'react';
import { SliderNav } from '@/components/ui/SliderNav';
import type { DesignWork } from '@/sanity/lib/designWork';

const card = 'rounded-2xl bg-white shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)]';

export function DesignSliderTrack({ heading, intro, items, figmaUrl }: { heading?: string; intro?: string; items: DesignWork[]; figmaUrl?: string }) {
  const track = useRef<HTMLUListElement>(null);

  const step = useCallback((dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const slide = el.querySelector('li');
    const width = slide ? slide.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * width, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {heading && (
            <h2 className="text-[22px] font-medium leading-tight tracking-[-0.03em] text-surface-950 sm:text-[26px]">{heading}</h2>
          )}
          {intro && <p className="mt-3 max-w-[62ch] text-[15.5px] leading-relaxed text-surface-700">{intro}</p>}
        </div>
        <SliderNav className="hidden shrink-0 sm:flex" onPrevClick={() => step(-1)} onNextClick={() => step(1)} />
      </div>
      <div className="mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4">
        <ul
          ref={track}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={heading ?? 'Design case studies'}
        >
          {items.map((w) => (
            <li key={w.slug} className="w-[84%] shrink-0 snap-start sm:w-[calc(50%-6px)]">
              <a
                href={`https://www.loudface.co/case-studies/${w.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex h-full flex-col overflow-hidden ${card}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${w.image!.url}?w=900&auto=format`}
                  alt={w.image?.alt || `${w.name} website, designed by LoudFace`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[15px] font-medium text-surface-950">{w.name.split(':')[0].trim()}</p>
                    {w.industry && <p className="shrink-0 text-[12.5px] text-surface-500">{w.industry}</p>}
                  </div>
                  {w.resultNumber && (
                    <p className="text-[13.5px] leading-snug text-surface-700">
                      <span className="proposal-num mr-1.5 font-medium text-primary-700">{w.resultNumber}</span>
                      {w.resultTitle}
                    </p>
                  )}
                  <p className="mt-auto pt-1 text-[13px] font-medium text-primary-700 group-hover:underline">Read the case study</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
        {figmaUrl && (
          <div className="flex justify-end px-2 pb-1 pt-4">
            <a href={figmaUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-surface-950 px-4 py-2 text-[13.5px] font-medium text-white">
              Open the Figma file
            </a>
          </div>
        )}
      </div>
    </>
  );
}
