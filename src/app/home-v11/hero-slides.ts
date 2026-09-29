import type { HomeV11Content } from '@/lib/content-utils';
import type { HomeV11Data } from './data';
import type { ValueFormat } from './LiveChart';

export type HeroSlideKey = keyof HomeV11Data['hero'];

/**
 * The hero rail's slides in the order of `hero.slides` in home-v11.json: the series each one charts and its case
 * study. Add, move or remove a slide here and in the JSON together. Every other page finds a slide's words with
 * `heroSlide(home, key)`, never by position: on 2026-09-29 a slide inserted at position 3 had shifted every
 * numbered lookup by one and put the wrong client's name on results cards across the site.
 */
export const HERO_SLIDES: { series: HeroSlideKey; href: string; format: ValueFormat; compact?: boolean }[] = [
  { series: 'lf', format: 'pct', href: '/case-studies/loudface-aeo-case-study' },
  { series: 'genie', format: 'index', href: '/case-studies/genie-teacher-organic-growth' },
  { series: 'health', format: 'index', href: '/case-studies/anonymous-health-tech-organic-growth' },
  { series: 'delshad', format: 'index', href: '/case-studies/delshad-legal-content-engine' },
  { series: 'tm', format: 'indexWeek', href: '/case-studies/trademomentum-niche-aeo-organic-growth' },
  { series: 'stealth', format: 'pct', href: '/case-studies/stealth-fintech-ai-visibility', compact: true },
  { series: 'genieLeads', format: 'index', href: '/case-studies/genie-teacher-organic-growth' },
];

/** The words of the hero slide that charts `key`. */
export function heroSlide(home: HomeV11Content, key: HeroSlideKey): HomeV11Content['hero']['slides'][number] {
  return home.hero.slides[HERO_SLIDES.findIndex((s) => s.series === key)];
}
