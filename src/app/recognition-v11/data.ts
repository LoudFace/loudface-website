import 'server-only';
import { cmsTypeTag } from '@/lib/cms-data';
import { withRetry } from '@/lib/cms-retry';
import { cachedReadClient } from '@/lib/sanity.client';
import { MARKS, NAMES, SHOTS, type Box } from './logos';

/**
 * Recognition data (2026-10-30, honours rebuild). Two Sanity reads, both kept current by the content engine
 * (scripts/recognition-sync.mjs):
 *   - every outside list that names LoudFace as an entry: `recognition`, `status == "listed"` and not hidden. The sync
 *     merges URLs that redirect to one page (those documents become `merged`), so each document is one honour.
 *   - `recognition-ai-standing`: how often each AI engine names LoudFace on non-branded agency questions, ranked
 *     against the agencies we track in Peec.
 * Every number the page prints is counted here; components only draw. Verdicts are the publisher's own words as the
 * sync read them (`verdict`); they are quoted, never written or shortened here. A failed read throws (AGENTS.md,
 * CMS Data Fetching).
 */

const LISTS = `*[_type == "recognition" && status == "listed" && hidden != true]{
  _id, publisher, title, url, domain, rank, listSize, linkFollowed, aiCitations, aiCitationsWindow, lastChecked, verdict, verdictSource, hidden
}`;
const AI = `*[_id == "recognition-ai-standing"][0]{ window, prompts, checkedAt, engines[]{ engine, name, visibility, rank, of } }`;

interface Doc {
  _id: string;
  publisher: string | null;
  title: string | null;
  url: string;
  domain: string;
  rank: number | null;
  listSize: number | null;
  linkFollowed: boolean | null;
  aiCitations: number | null;
  aiCitationsWindow: string | null;
  lastChecked: string | null;
  verdict: string | null;
  verdictSource: string | null;
}

interface AiDoc {
  window: string;
  prompts: number;
  checkedAt: string;
  engines: { engine: string; name: string; visibility: number; rank: number; of: number }[];
}

export type Topic = 'fintech' | 'saas' | 'aeo' | 'geo' | 'other';

export interface Honour {
  key: string;
  url: string;
  domain: string;
  publisher: string;
  mark: string | null;
  /** The list's own title without the publisher's name or the year (shown apart). */
  honour: string;
  /** The list's full title as published. */
  title: string;
  year: string | null;
  rank: number | null;
  listSize: number | null;
  followed: boolean;
  citations: number;
  /** The publisher's verdict on us, in its own words; null when the sync found none, it arrived cut off, or it is
   *  about Webflow. */
  verdict: string | null;
  topics: Topic[];
  /** Industry named in the title when it is not fintech or SaaS. */
  industry: Industry | null;
  hero?: string;
  heroPhone?: string;
  heroBox?: Box;
  /** The entry as the publisher shows it, for "What we are recognised for" (logos.ts SHOTS). */
  card?: string;
  cardPhone?: string;
  cardH?: number;
  cardBox?: Box;
  cardFor?: Topic;
}

export interface TopicGroup { topic: Topic; count: number; shown: Honour | null; quotes: Honour[]; industries: Industry[] }
export interface Engine { name: string; mark: 'chatgpt' | 'perplexity' | 'googleAio'; visibility: number; rank: number; of: number }

export interface RecognitionData {
  honours: Honour[];
  /** The same honours, the lists AI engines cite most first (the full record's order). */
  byCitations: Honour[];
  count: number;
  publishers: number;
  ranked: number;
  first: number;
  top3: number;
  top10: number;
  groups: TopicGroup[];
  engines: Engine[];
  prompts: number;
  /** "30 Sep to 30 Oct 2026": the AI standing window. */
  aiWindow: string;
  /** "30 Oct 2026": the newest list check. */
  checked: string;
}

const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const DAY_NO_YEAR = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const ENTITIES: Record<string, string> = { '&middot;': '·', '&amp;': '&', '&nbsp;': ' ', '&#39;': "'", '&quot;': '"' };
const decode = (s: string) => s.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);

/** Drops a trailing " | Publisher" (or " - ", " — ") when the tail is the publisher's own name. */
function withoutPublisher(title: string, publisher: string, domain: string): string {
  const m = title.match(/^(.*\S)\s+[|\-–—]\s+([^|\-–—]+)$/);
  if (!m) return title.trim();
  const tail = squash(m[2]);
  const base = squash(domain.split('.')[0]);
  const named = squash(publisher);
  const isPublisher = tail.startsWith(base) || base.startsWith(tail) || tail === named || tail.startsWith(named);
  return isPublisher && m[1].length >= 20 ? m[1].trim() : title.trim();
}

/**
 * The honour's name, read like an award: the list's own words with the year lifted out (shown apart), the entry count
 * dropped (the placement says "of 16"), and a trailing " | Reviews & Pricing" kind of tag dropped.
 * "The 18 Best SaaS SEO Agencies for 2026 (Reviewed)" → "The Best SaaS SEO Agencies (Reviewed)", 2026.
 */
function honourOf(title: string): { honour: string; year: string | null } {
  const year = title.match(/\b(20\d\d)\b/)?.[1] ?? null;
  const honour = title
    .replace(/^(.{20,}?)\s+\|\s+[^|]+$/, '$1')
    .replace(/^((?:The|Top)\s+)?\d+\s+(?=\S)/i, '$1')
    .replace(/\s*\((?:20\d\d)\)/g, '')
    .replace(/\s+(?:in|for)\s+20\d\d\b/gi, '')
    .replace(/\s+20\d\d\b/g, '')
    .replace(/\s+—\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { honour: honour.length >= 12 ? honour : title, year };
}

/**
 * A verdict is quoted only when it reads as the publisher wrote it. The sync caps a verdict at about 180 characters
 * and some labels run into the next block on the page ("… reported in pipeline “Our total…", "… one retainer Minimum
 * deal From $5,000 …"); those are left out rather than shortened (never edit a verdict).
 */
function cleanVerdict(v: string | null, source: string | null): string | null {
  if (!v) return null;
  let t = decode(v).trim();
  // A verdict read from a label ("Best for: …") arrives with the label's colon dropped; put back the publisher's own.
  if (source === 'label') t = t.replace(/^(Best for|Good fit for)\s+(?!:)/, '$1: ');
  if (t.length >= 176) return null;
  if (/[“”"]|Minimum deal|Published on/i.test(t)) return null;
  // Webflow is a credential, not what we are recommended for (Arnel, 2026-10-29): such verdicts are not quoted.
  if (/webflow/i.test(t)) return null;
  return t;
}

const TOPICS: [Topic, RegExp][] = [
  ['fintech', /fintech|financ|payment|banking|(?<!health )insurance/i],
  ['saas', /saas/i],
  ['aeo', /\baeo\b|answer engine/i],
  ['geo', /\bgeo\b|generative engine/i],
];
/** Industries other than fintech and SaaS; keys of recognition-v11.json `for.industries`, which holds their names. */
export type Industry = 'cyber' | 'health' | 'edu' | 'dev' | 'legal' | 'homeImprovement' | 'homeSecurity' | 'fitness' | 'nonprofit' | 'agentic' | 'startups' | 'tech';
const INDUSTRIES: [Industry, RegExp][] = [
  ['cyber', /cyber/i], ['health', /health/i], ['edu', /educat|edtech/i], ['dev', /developer tool|devtools/i],
  ['legal', /legal/i], ['homeImprovement', /home improvement/i], ['homeSecurity', /home security/i], ['fitness', /fitness/i],
  ['nonprofit', /nonprofit/i], ['agentic', /agentic/i], ['startups', /vc-backed|startup/i], ['tech', /tech companies/i],
];

const ENGINE_MARK: Record<string, Engine['mark']> = { 'ChatGPT UI': 'chatgpt', 'Perplexity UI': 'perplexity', 'Google AI Overview': 'googleAio' };

export async function getRecognitionData(): Promise<RecognitionData> {
  const tag = { next: { revalidate: 3600, tags: [cmsTypeTag('recognition')] } };
  const [docs, ai] = await Promise.all([
    withRetry((retry) => cachedReadClient.fetch<Doc[]>(LISTS, {}, { ...tag, ...retry })),
    withRetry((retry) => cachedReadClient.fetch<AiDoc | null>(AI, {}, { ...tag, ...retry })),
  ]);
  if (!docs.length) throw new Error('Recognition: Sanity returned no listed recognition documents');
  if (!ai?.engines?.length) throw new Error('Recognition: recognition-ai-standing is missing or has no engines');

  const honours: Honour[] = docs.map((d) => {
    const publisher = NAMES[d.domain] ?? d.publisher ?? d.domain;
    const title = withoutPublisher(decode(d.title ?? d.url), publisher, d.domain);
    const { honour, year } = honourOf(title);
    const topics = TOPICS.filter(([, re]) => re.test(title)).map(([t]) => t);
    const industry = INDUSTRIES.find(([, re]) => re.test(title))?.[0] ?? null;
    if (industry) topics.push('other');
    return {
      key: d._id,
      url: d.url,
      domain: d.domain,
      publisher,
      mark: MARKS[d.domain] ?? null,
      honour,
      title,
      year,
      rank: d.rank ?? null,
      listSize: d.rank ? d.listSize ?? null : null,
      followed: !!d.linkFollowed,
      citations: d.aiCitations ?? 0,
      verdict: cleanVerdict(d.verdict, d.verdictSource),
      topics,
      industry,
      ...(SHOTS[d.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')] ?? {}),
    };
  });
  // Highest placement first; among equals, the list AI engines cite most.
  honours.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999) || b.citations - a.citations || a.honour.localeCompare(b.honour));

  const ranked = honours.filter((h) => h.rank);
  const within = (n: number) => ranked.filter((h) => (h.rank as number) <= n).length;

  // "In their words": per topic, the captured entry plus the highest-placed verdict from another list that the page
  // does not already show; the same words never appear twice on the page.
  // Each topic shows one entry as its publisher shows it (a capture, `cardFor`). The awards table quotes the other #1 to
  // #3 verdicts, so those words, and the captured ones, are taken before the groups pick a typed quote.
  // One verdict per publisher on the page: publishers already quoted in the awards table or shown in a capture are taken.
  const quoted = honours.filter((h) => h.verdict && (h.card || (h.rank && h.rank <= 3)));
  const usedText = new Set<string>(quoted.map((h) => h.verdict as string));
  const usedPub = new Set<string>(quoted.map((h) => h.domain));
  const usedKey = new Set<string>();
  // Picked in this order (industries before the broad AEO and GEO topics, which would take every verdict), shown in
  // DISPLAY order.
  const picked: TopicGroup[] = (['fintech', 'saas', 'other', 'aeo', 'geo'] as Topic[]).map((topic) => {
    const members = honours.filter((h) => h.topics.includes(topic));
    // A Webflow list is not quoted as what we are recognised for (Webflow is a credential, Arnel 2026-10-29); it stays
    // in the full record.
    const pick = (pool: Honour[]) => pool.find((h) => h.verdict && !/webflow/i.test(h.title) && !usedText.has(h.verdict) && !usedPub.has(h.domain) && !usedKey.has(h.key));
    const shown = honours.find((h) => h.cardFor === topic) ?? null;
    const quotes: Honour[] = [];
    for (let i = 0; i < 1; i++) {
      const q = pick(members);
      if (!q) break;
      quotes.push(q);
      usedText.add(q.verdict as string);
      usedPub.add(q.domain);
      usedKey.add(q.key);
    }
    return {
      topic,
      count: members.length,
      shown,
      quotes,
      industries: topic === 'other' ? [...new Set(members.map((h) => h.industry as Industry))] : [],
    };
  }).filter((g) => g.count > 0);
  const DISPLAY: Topic[] = ['fintech', 'saas', 'aeo', 'geo', 'other'];
  const groups = [...picked].sort((a, b) => DISPLAY.indexOf(a.topic) - DISPLAY.indexOf(b.topic));

  const engines: Engine[] = ai.engines
    .map((e) => ({ name: e.name, mark: ENGINE_MARK[e.name], visibility: e.visibility, rank: e.rank, of: e.of }))
    .filter((e) => e.mark)
    .sort((a, b) => a.rank - b.rank);
  if (engines.length !== ai.engines.length) throw new Error('Recognition: an AI engine name is not mapped to a mark');

  const checkedAt = docs.map((d) => d.lastChecked).filter(Boolean).sort().at(-1);
  const win = ai.window.split('..').map((s) => new Date(`${s}T00:00:00Z`));
  if (!checkedAt || win.length !== 2) throw new Error('Recognition: missing lastChecked or AI window');

  return {
    honours,
    byCitations: [...honours].sort((a, b) => b.citations - a.citations || (a.rank ?? 999) - (b.rank ?? 999)),
    count: honours.length,
    publishers: new Set(honours.map((h) => h.domain)).size,
    ranked: ranked.length,
    first: within(1),
    top3: within(3),
    top10: within(10),
    groups,
    engines,
    prompts: ai.prompts,
    aiWindow: `${DAY_NO_YEAR.format(win[0])} to ${DAY.format(win[1])}`,
    checked: DAY.format(new Date(checkedAt)),
  };
}
