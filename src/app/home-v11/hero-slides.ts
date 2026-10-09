import type { HomeV11Content } from '@/lib/content-utils';
import type { HomeV11Data, Proof, ProofKey, Series } from './data';
import type { ValueFormat } from './LiveChart';

export type HeroSlideKey = keyof HomeV11Data['hero'];

/**
 * The hero rail's slides in the order of `hero.slides` in home-v11.json: the series each one charts and its case
 * study. Add, move or remove a slide here and in the JSON together. Every other page finds a slide's words with
 * `heroSlide(home, key)`, never by position: on 2026-09-29 a slide inserted at position 3 had shifted every
 * numbered lookup by one and put the wrong client's name on results cards across the site.
 */
/** `proof` names the printed figure when it is not the slide's own key (Delshad's slide charts its clicks, not its leads). */
export const HERO_SLIDES: { series: HeroSlideKey; proof?: ProofKey; href: string; format: ValueFormat; compact?: boolean }[] = [
  { series: 'lf', format: 'pct', href: '/case-studies/loudface-aeo-case-study', compact: true },
  { series: 'genie', format: 'index', href: '/case-studies/genie-teacher-organic-growth' },
  { series: 'health', format: 'index', href: '/case-studies/anonymous-health-tech-organic-growth' },
  { series: 'delshad', proof: 'delshadClicks', format: 'index', href: '/case-studies/delshad-legal-content-engine' },
  { series: 'tm', format: 'index', href: '/case-studies/trademomentum-niche-aeo-organic-growth' },
  { series: 'stealth', format: 'pct', href: '/case-studies/stealth-fintech-ai-visibility', compact: true },
  { series: 'genieClicks', format: 'index', href: '/case-studies/genie-teacher-organic-growth' },
];

/** The words of the hero slide that charts `key`. */
export function heroSlide(home: HomeV11Content, key: HeroSlideKey): HomeV11Content['hero']['slides'][number] {
  return home.hero.slides[HERO_SLIDES.findIndex((s) => s.series === key)];
}

/** The number a tile prints: the case study's own published figure (data.ts `PROOF`), never a typed copy. */
export function proofValue(data: HomeV11Data | null, key: ProofKey): string | undefined {
  return data?.proof[key]?.value;
}

/** The first and last month a series covers, e.g. "Apr 2026" and "Oct 2026", for a chart's date row. */
export function periodOf(s?: Series): { start?: string; end?: string } {
  const label = (iso?: string) =>
    iso ? new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : undefined;
  return { start: label(s?.dates[0]), end: label(s?.dates.at(-1)) };
}

/** A published figure's last reading: "0 → 97.8%" gives "97.8%"; a single figure comes back as is. */
export function proofEnd(data: HomeV11Data | null, key: ProofKey): string | undefined {
  return data?.proof[key]?.value.split('→').at(-1)?.trim();
}

/** A published figure as a number, for drawing it (a bar's width): "39.3%" gives 39.3. */
export function proofNumber(data: HomeV11Data | null, key: ProofKey): number {
  return parseFloat((data?.proof[key]?.value ?? '').replace(/[^\d.]/g, '')) || 0;
}

/** The whole published figure (value and its title), when a caption needs both. */
export function proof(data: HomeV11Data | null, key: ProofKey): Proof | undefined {
  return data?.proof[key];
}

/**
 * Copy that quotes a client figure mid-sentence. The content file keeps the words around it and names the figure
 * (`{ "proof_key": "toku" }`, or `{ "proof_end_key": "toku" }` for its last reading), so the sentence never carries a
 * typed copy of the number. A plain string passes through.
 */
export type ProofPart = string | { proof_key: string } | { proof_end_key: string };
export function proofText(parts: string | readonly ProofPart[], data: HomeV11Data | null): string {
  if (typeof parts === 'string') return parts;
  return parts
    .map((p) => {
      if (typeof p === 'string') return p;
      const key = ('proof_key' in p ? p.proof_key : p.proof_end_key) as ProofKey;
      const v = 'proof_key' in p ? proofValue(data, key) : proofEnd(data, key);
      if (v === undefined && data) console.error(`[proofText] no published figure for "${key}"`);
      return v ?? '';
    })
    .join('');
}
