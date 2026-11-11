import { stegaClean } from '@sanity/client/stega';
import type { ResearchStudy, TeamMember } from '@/lib/types';
import { rewriteLegacyUrls } from '@/lib/seo-utils';
import { buildHeadingWithId } from '@/lib/html-utils';
import { teamTitle } from '@/lib/team-titles';
import { cachedCmsImage } from '@/lib/image-utils';
import { personAvatar, personPhoto } from '../home-v11/ui';
import { SERIES, type ChartGround, type ChartTone, type ResearchFigure, type SeriesKey } from './contract';

/**
 * The /research pages' view of the CMS data (direction G, approved 2026-11-03). Everything a page prints is read
 * here from Sanity `research` documents and `teamMember`s: counts, dates, the series' lead numbers, the figure
 * order. Nothing is typed in. Copy (labels, headings) lives in src/data/content/research-v11.json.
 */

export const SITE = 'https://www.loudface.co';
export const paperHref = (slug: string) => `/research/${slug}`;
export const paperUrl = (slug: string) => `${SITE}${paperHref(slug)}`;

const DAY = (iso?: string) => (iso ? Date.parse(iso.length <= 10 ? `${iso}T00:00:00Z` : iso) : NaN);
const fmt = (iso: string | undefined, o: Intl.DateTimeFormatOptions) => {
  const t = DAY(iso);
  return Number.isNaN(t) ? '' : new Date(t).toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' });
};
/** 25 Oct 2026 */
export const shortDate = (iso?: string) => fmt(iso, { day: 'numeric', month: 'short', year: 'numeric' });
/** 15 October 2026 */
export const longDate = (iso?: string) => fmt(iso, { day: 'numeric', month: 'long', year: 'numeric' });
/** 1 June */
export const dayMonth = (iso?: string) => fmt(iso, { day: 'numeric', month: 'long' });
export const isoDay = (iso?: string) => (iso ? iso.slice(0, 10) : undefined);

/** The colour block a paper's series owns (the `on-<key>` class in research.css). */
export const onSeries = (k: SeriesKey) => `on-${k}`;

/** How a chart is drawn on its series colour: indigo and green on the stage kit, coral and butter on the colour kit. */
export function seriesChart(k: SeriesKey): { ground: ChartGround; tone: ChartTone } {
  const tone = SERIES[k].chartTone;
  return { ground: tone === 'coral' || tone === 'butter' ? 'colour' : 'stage', tone };
}
/** Each series' colour lit on night (≥ 7:1 on #0b0a2e), the accent of its figures on night panels. */
export const LIT: Record<SeriesKey, string> = { index: '#b7aaf2', saas: '#f59a7b', ai: '#86dcb4', meas: '#fcd68a' };
export const NIGHT_CHART = { ground: 'stage', tone: 'night' } as const satisfies { ground: ChartGround; tone: ChartTone };
export const STAGE_CHART = { ground: 'stage', tone: 'indigo' } as const satisfies { ground: ChartGround; tone: ChartTone };

/**
 * "101 of 336" → ["101", "of 336"], so the count prints large and its base small, as the boards draw it. Any other
 * value stays whole. In editing mode Sanity appends its invisible marker, the pattern stops matching and the value
 * is printed whole, so an edit never lands in half of a split value.
 */
export function splitOf(value: string): [string, string | null] {
  const m = value.match(/^([\d.,]+) (of [\d,]+)$/);
  return m ? [m[1], m[2]] : [value, null];
}

/** The first count in a sample line and the word after it: "160,240 citations, 23,545 conversations" → 160240. */
export function sampleSize(sample?: string): { n: number; shown: string; unit: string } | null {
  const m = sample?.match(/([\d][\d,]*(?:\.\d+)?)\s+([A-Za-z-]+)/);
  if (!m) return null;
  return { n: Number(m[1].replace(/,/g, '')), shown: m[1], unit: m[2] };
}

/* ------------------------------------------------------------------ people */

export interface Person {
  slug?: string;
  name: string;
  title?: string;
  avatar?: string;
  photo?: string;
  member?: TeamMember;
}

/** The four leads have studio portraits at known paths (home-v11/ui.ts); anyone else uses their CMS picture. */
const HOUSE = new Set(['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi']);

export function personOf(m: TeamMember): Person {
  const house = !!m.slug && HOUSE.has(m.slug);
  const pic = m['profile-picture']?.url;
  return {
    slug: m.slug,
    name: m.name,
    title: teamTitle(m.slug, m['job-title']),
    avatar: house ? personAvatar(m.slug) : cachedCmsImage(pic, 128),
    photo: house ? personPhoto(m.slug) : cachedCmsImage(pic, 828),
    member: m,
  };
}

/* ------------------------------------------------------------------ papers */

export interface PaperCard {
  slug: string;
  href: string;
  name: string;
  paperTitle?: string;
  series: SeriesKey;
  kind: string;
  date?: string;
  updated?: string;
  sample?: string;
  excerpt?: string;
  finding?: string;
  lead?: { value: string; label: string; note?: string };
  leadFigure?: ResearchFigure;
  authors: string[];
  featured: boolean;
  dataWindow?: string;
  engines: string[];
}

export function toCard(raw: ResearchStudy): PaperCard {
  // In Draft Mode Sanity marks every string for the editors; the series and kind are machine values, read clean.
  const s = { ...raw, series: stegaClean(raw.series), kind: stegaClean(raw.kind) };
  if (!s.series || !SERIES[s.series]) throw new Error(`[research] paper "${s.slug}" has no series`);
  return {
    slug: s.slug,
    href: paperHref(s.slug),
    name: s.name,
    paperTitle: s['paper-title'],
    series: s.series,
    kind: s.kind ?? '',
    date: s['published-date'],
    updated: s['last-updated'],
    sample: s['sample-summary'],
    excerpt: s.excerpt,
    finding: s['headline-finding'],
    lead: s['lead-number'],
    leadFigure: s['lead-figure'] ?? s.figures?.find((f) => f.placement === 'lead'),
    authors: s.authors ?? [],
    featured: !!s.featured,
    dataWindow: s['data-window'],
    engines: s.engines ?? [],
  };
}

const newestFirst = (a: PaperCard, b: PaperCard) => DAY(b.date) - DAY(a.date);

/** A grid card is wide when its chart is a table of cells or several panels; those read badly in one column. */
const WIDE_TYPES = new Set(['matrix', 'dots', 'table', 'multiples', 'slope']);
export const isWide = (p: PaperCard) => !!p.leadFigure && WIDE_TYPES.has(p.leadFigure.spec.type);

/**
 * Every paper, newest first, packed for the three-column grid: a wide card (two columns) never starts in the last
 * column; the next narrow card takes that slot and the wide card moves down one place.
 */
export function packed(papers: PaperCard[]): PaperCard[] {
  const rest = [...papers].sort(newestFirst);
  const out: PaperCard[] = [];
  let col = 0;
  while (rest.length) {
    let i = 0;
    if (col === 2 && isWide(rest[0])) {
      const j = rest.findIndex((p) => !isWide(p));
      if (j > 0) i = j;
    }
    const [p] = rest.splice(i, 1);
    out.push(p);
    col = (col + (isWide(p) && col < 2 ? 2 : 1)) % 3;
  }
  return out;
}

export interface SeriesSummary {
  key: SeriesKey;
  count: number;
  latest?: string;
  /** The series' strongest number: the paper resting on the largest sample. */
  lead: PaperCard;
}

export interface HubView {
  papers: PaperCard[];
  newest: PaperCard[];
  oldest?: string;
  series: SeriesSummary[];
  largest: { shown: string; unit: string } | null;
  featured?: PaperCard;
  latest: PaperCard[];
  grid: PaperCard[];
  counts: Record<SeriesKey, number>;
}

const bySample = (a: PaperCard, b: PaperCard) => (sampleSize(b.sample)?.n ?? 0) - (sampleSize(a.sample)?.n ?? 0) || newestFirst(a, b);

export function hubView(studies: ResearchStudy[]): HubView {
  const papers = studies.map(toCard).sort(newestFirst);
  if (!papers.length) throw new Error('[research] no papers to show');
  const newest = papers.slice(0, 4);
  const keys = Object.keys(SERIES) as SeriesKey[];
  const series: SeriesSummary[] = [];
  for (const key of keys) {
    const list = papers.filter((p) => p.series === key);
    if (list.length) series.push({ key, count: list.length, latest: list[0].date, lead: [...list].sort(bySample)[0] });
  }
  const largestPaper = [...papers].sort(bySample)[0];
  const largest = sampleSize(largestPaper?.sample);
  const featured = papers.find((p) => p.featured) ?? largestPaper;
  const shown = new Set([...newest, ...series.map((s) => s.lead), featured].map((p) => p.slug));
  const counts = Object.fromEntries(keys.map((k) => [k, papers.filter((p) => p.series === k).length])) as Record<SeriesKey, number>;
  return {
    papers,
    newest,
    oldest: papers[papers.length - 1].date,
    series,
    largest: largest ? { shown: largest.shown, unit: largest.unit } : null,
    featured,
    latest: papers.filter((p) => !shown.has(p.slug) && p.lead),
    grid: packed(papers),
    counts,
  };
}

/** Three other papers for the foot of a paper: the newest in its own series, then each other series' lead paper. */
export function moreResearch(slug: string, studies: ResearchStudy[]): PaperCard[] {
  const papers = studies.map(toCard).filter((p) => p.slug !== slug).sort(newestFirst);
  const found = studies.find((s) => s.slug === slug);
  const self = found ? toCard(found) : undefined;
  const out: PaperCard[] = [];
  const same = papers.find((p) => p.series === self?.series);
  if (same) out.push(same);
  for (const key of Object.keys(SERIES) as SeriesKey[]) {
    if (out.length >= 3) break;
    if (key === self?.series) continue;
    const list = papers.filter((p) => p.series === key);
    if (list.length) out.push([...list].sort(bySample)[0]);
  }
  for (const p of papers) if (out.length < 3 && !out.includes(p)) out.push(p);
  return out.slice(0, 3);
}

/* ------------------------------------------------------------------ the body */

export interface TocEntry {
  id: string;
  text: string;
  figures: number[];
}

export interface NumberedFigure extends ResearchFigure {
  n: number;
}

export interface BodyView {
  /** segments[0] is the text before the first H2; segments[i] is the i-th H2 and what follows it. */
  segments: string[];
  /** Figures to draw after segments[i]. */
  after: NumberedFigure[][];
  toc: TocEntry[];
  lead?: NumberedFigure;
  band?: NumberedFigure;
}

/** Each table in a block of CMS HTML inside the night reading wrapper, which scrolls a wide table in its own box. */
export const wrapTables = (html: string) => html.replace(/<table\b[\s\S]*?<\/table>/gi, (m) => `<div class="rs-table">${m}</div>`);

/**
 * The paper's body as the page draws it: each H2 gets an id (the contents rail links to it), tables get the night
 * reading wrapper, and the body is cut at its H2s so the figures placed `afterH2` sit between the sections. The
 * text itself is untouched (the inline editor matches sentences against the stored HTML). Figures are numbered as
 * a reader meets them: the lead figure 1, then the body's figures in order, then the band.
 */
export function bodyView(html: string | undefined, figures: ResearchFigure[] = []): BodyView {
  let src = (html ?? '').replace(/http:\/\/loudface\.co/g, 'https://www.loudface.co');
  src = rewriteLegacyUrls(src);
  src = src.replace(/<script\b/gi, '&lt;script').replace(/<\/script>/gi, '&lt;/script&gt;');
  src = wrapTables(src);
  const heads: { id: string; text: string }[] = [];
  src = src.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs: string, content: string) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section'}-${heads.length + 1}`;
    heads.push({ id, text });
    return buildHeadingWithId('h2', attrs, id, content);
  });
  const cuts: number[] = [];
  const re = /<h2\b/gi;
  for (let m = re.exec(src); m; m = re.exec(src)) cuts.push(m.index);
  const segments = cuts.length ? [src.slice(0, cuts[0]), ...cuts.map((c, i) => src.slice(c, cuts[i + 1] ?? src.length))] : [src];

  const after: NumberedFigure[][] = segments.map(() => []);
  let n = 0;
  const leadFig = figures.find((f) => f.placement === 'lead');
  const lead = leadFig ? { ...leadFig, n: ++n } : undefined;
  const inBody = figures
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => f.placement === 'afterH2')
    .sort((a, b) => (a.f.h2Index ?? 0) - (b.f.h2Index ?? 0) || a.i - b.i);
  for (const { f } of inBody) {
    const seg = Math.min(segments.length - 1, (f.h2Index ?? 0) + 1);
    after[seg].push({ ...f, n: ++n });
  }
  const bandFig = figures.find((f) => f.placement === 'band');
  const band = bandFig ? { ...bandFig, n: ++n } : undefined;

  // Which figures each section's contents line names: the ones drawn after it, and the lead figure on the first
  // section (the opening finding). The band sits after the body and is named by no section.
  const toc: TocEntry[] = heads.map((h, i) => ({ ...h, figures: after[i + 1].map((f) => f.n) }));
  if (lead && toc[0]) toc[0].figures.unshift(lead.n);
  return { segments, after, toc, lead, band };
}

/* ------------------------------------------------------------------ citation */

/** "Arnel Bukva" → "Bukva, A." */
const apaName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const last = parts.pop() ?? '';
  return parts.length ? `${last}, ${parts.map((p) => `${p[0]}.`).join(' ')}` : last;
};

/** An APA 7 reference: Author, A. (2026, June 1). Title. Publisher. URL */
export function apaCitation(o: { authors: string[]; date?: string; title: string; publisher: string; slug: string }): string {
  const names = o.authors.map(apaName);
  const who = names.length > 1 ? `${names.slice(0, -1).join(', ')}, & ${names[names.length - 1]}` : names[0] ?? 'LoudFace';
  const t = DAY(o.date);
  const when = Number.isNaN(t)
    ? 'n.d.'
    : `${new Date(t).getUTCFullYear()}, ${new Date(t).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}`;
  const title = /[.?!]$/.test(o.title) ? o.title : `${o.title}.`;
  return `${who} (${when}). ${title} ${o.publisher}. ${paperUrl(o.slug)}`;
}

/** "Benchmark tables.csv" → "CSV", for the download button's label. */
export const fileKind = (url?: string) => url?.match(/\.([a-z0-9]{2,5})(?:[?#]|$)/i)?.[1]?.toUpperCase();

/** "ChatGPT, Perplexity and Google AI Overviews" */
export const listOf = (xs: string[], and = 'and') => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}`);
