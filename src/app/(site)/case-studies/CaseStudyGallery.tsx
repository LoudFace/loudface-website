'use client';

/**
 * Client-side filterable case-study gallery.
 *
 * Cards are pre-resolved server-side (page.tsx) into plain data, so this stays
 * a thin client component. Default tab is "All", which renders every discipline
 * group stacked with headers — so the server-rendered HTML contains all studies
 * (crawlers/AI engines see everything); the tabs filter the view client-side.
 */

import { useState } from 'react';
import Link from 'next/link';

export type GalleryCard = {
  slug: string;
  title: string;
  summary?: string;
  disciplines: string[];
  thumbSrc: string;
  thumbSrcset?: string;
  thumbAlt: string;
  industryName?: string;
  technologies: { id: string; name: string }[];
  clientColor: string;
  statTextColor: string;
  result1Number?: string;
  result1Title?: string;
  result2Number?: string;
  result2Title?: string;
  clientLogoSrc?: string;
  clientName?: string;
  featured?: boolean;
};

export function CaseStudyGallery({
  cards,
  disciplineOrder,
  viewProjectText,
}: {
  cards: GalleryCard[];
  disciplineOrder: string[];
  viewProjectText: string;
}) {
  const [active, setActive] = useState<string>('all');

  // a study counts toward every discipline it is tagged with (so tab badges reflect the filtered set)
  const counts: Record<string, number> = {};
  for (const c of cards) for (const d of c.disciplines) counts[d] = (counts[d] || 0) + 1;

  const groups = disciplineOrder.filter((d) => (counts[d] || 0) > 0);
  const tabs = [{ label: 'All', value: 'all', count: cards.length }, ...groups.map((d) => ({ label: d, value: d, count: counts[d] }))];

  const visibleGroups = groups.filter((d) => active === 'all' || active === d);

  return (
    <div>
      {/* Filter tabs */}
      <div role="tablist" aria-label="Filter case studies by discipline" className="flex flex-wrap gap-2 justify-start">
        {tabs.map((t) => {
          const isActive = active === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 ${
                isActive
                  ? 'bg-surface-900 text-white border-surface-900'
                  : 'bg-white text-surface-700 border-surface-200 hover:border-surface-300 hover:bg-surface-50'
              }`}
            >
              {t.label}
              <span className={`text-xs ${isActive ? 'text-white/70' : 'text-surface-400'}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Discipline sections */}
      {visibleGroups.map((discipline) => {
        // "All" view groups each study once under its PRIMARY (first) discipline — no duplicates.
        // A specific tab shows every study tagged with that discipline (multi-tagged studies appear under each).
        const groupCards =
          active === 'all'
            ? cards.filter((c) => c.disciplines[0] === discipline)
            : cards.filter((c) => c.disciplines.includes(discipline));
        return (
          <section key={discipline} aria-label={discipline} className="mt-12 first:mt-10">
            <div className="flex items-baseline justify-between gap-4 border-b border-surface-200 pb-3">
              <h2 className="text-xl md:text-2xl font-medium text-surface-900">{discipline}</h2>
              <span className="text-sm text-surface-500 whitespace-nowrap">
                {groupCards.length} {groupCards.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupCards.map((card, index) => {
                const hasBothStats = card.result1Number && card.result2Number;
                return (
                  <Link
                    key={card.slug}
                    href={`/case-studies/${card.slug}`}
                    className="group relative bg-white rounded-2xl border border-surface-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-surface-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={card.thumbSrc}
                        srcSet={card.thumbSrcset}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        alt={card.thumbAlt}
                        width="800"
                        height="500"
                        loading={index < 3 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      {card.industryName && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-surface-700 shadow-sm">
                          {card.industryName}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {card.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {card.technologies.slice(0, 3).map((tech) => (
                            <span key={tech.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 rounded text-2xs font-medium text-surface-600">
                              {tech.name}
                            </span>
                          ))}
                          {card.technologies.length > 3 && (
                            <span className="px-2 py-0.5 bg-surface-100 rounded text-2xs font-medium text-surface-500">
                              +{card.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="font-medium text-lg text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {card.title}
                      </h3>

                      {card.summary && (
                        <p className="mt-2 text-sm text-surface-600 line-clamp-2">{card.summary}</p>
                      )}

                      {(card.result1Number || card.result2Number) && (
                        <div className={`mt-4 ${hasBothStats ? 'grid grid-cols-2 gap-2' : ''}`}>
                          {card.result1Number && (
                            <div className="rounded-lg p-3" style={{ backgroundColor: card.clientColor, color: card.statTextColor }}>
                              <span className="block text-xl font-medium">{card.result1Number}</span>
                              <span className="text-xs opacity-75 line-clamp-1">{card.result1Title}</span>
                            </div>
                          )}
                          {card.result2Number && (
                            <div className="rounded-lg p-3" style={{ backgroundColor: card.clientColor, color: card.statTextColor }}>
                              <span className="block text-xl font-medium">{card.result2Number}</span>
                              <span className="text-xs opacity-75 line-clamp-1">{card.result2Title}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
                        <div className="flex-shrink-0">
                          {card.clientLogoSrc ? (
                            <img
                              src={card.clientLogoSrc}
                              alt={card.clientName || 'Client'}
                              width="120"
                              height="20"
                              className="h-5 w-auto max-w-[100px] object-contain opacity-60 group-hover:opacity-100 transition-opacity origin-left"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-sm font-medium text-surface-400">{card.clientName || ''}</span>
                          )}
                        </div>

                        <span className="flex items-center gap-1.5 text-sm font-medium text-surface-500 group-hover:text-primary-600 transition-colors">
                          {viewProjectText}
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
