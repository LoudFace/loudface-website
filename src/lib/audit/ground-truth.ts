/**
 * Ground-truth scraper.
 *
 * Fetches the target URL and extracts the authoritative anchor we hand to the
 * LLM extraction layer — so the model can disambiguate same-name entities
 * (e.g. LoudFace.co agency vs. "LoudFace" wearable device), validate claims,
 * and stay anchored to what the site actually says about itself.
 *
 * Returns `null` if the fetch fails entirely. Individual fields may be empty
 * strings when the page lacks them — that's surfaced to the caller as a
 * `confidence` signal rather than a failure.
 */

import { cleanDomain, fetchHtml } from './extract-brand';

export interface GroundTruth {
  url: string;
  domain: string;
  title: string;
  metaDescription: string;
  ogDescription: string;
  h1: string;
  bodyExcerpt: string;
  /** Compact JSON-LD/schema.org facts (name, foundingDate, address(es), founder(s), etc.) —
   *  the site's own authoritative self-description. Empty string if no JSON-LD parsed. */
  structuredData: string;
  /** <footer> text (offices, addresses, contact info) — often the only place a multi-office
   *  company lists every location in plain text. Empty string if no <footer> was found. */
  footerText: string;
  /** Signal for downstream prompts: "high" when most of title/description/body/structured-data
   *  landed, else "low". */
  confidence: 'high' | 'medium' | 'low';
}

const FETCH_TIMEOUT_MS = 8000;
const BODY_EXCERPT_CHARS = 1500;
const STRUCTURED_DATA_MAX_CHARS = 1200;
const FOOTER_TEXT_MAX_CHARS = 600;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function extractMetaContent(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]).trim();
  }
  return '';
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : '';
}

function extractFirstH1(html: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m?.[1]) return '';
  // Strip inner tags like <span>, keep the text
  const inner = m[1].replace(/<[^>]+>/g, ' ');
  return decodeEntities(inner).replace(/\s+/g, ' ').trim();
}

function extractBodyExcerpt(html: string): string {
  // Grab the body, or fall back to the first large chunk of HTML
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;

  // Strip noise: scripts, styles, noscript, svg, templates, comments
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Strip nav/footer/header so we don't waste the excerpt on boilerplate
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, ' ');

  // Drop all remaining tags, collapse whitespace, decode entities
  const text = decodeEntities(body.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= BODY_EXCERPT_CHARS) return text;
  // Try to cut on a sentence boundary
  const cut = text.slice(0, BODY_EXCERPT_CHARS);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop > BODY_EXCERPT_CHARS * 0.6) return cut.slice(0, lastStop + 1);
  return cut + '…';
}

// ─── Footer / contact-info extraction ───────────────────────────────
// Office addresses for multi-location companies live in the footer far more
// often than anywhere else in the visible page, but extractBodyExcerpt()
// above deliberately strips <footer> out of the main excerpt (it's
// boilerplate for excerpt purposes). This pulls the same markup into its
// own dedicated, capped field instead of losing it entirely.

function extractFooterText(html: string): string {
  const footerRe = /<footer[^>]*>([\s\S]*?)<\/footer>/gi;
  const chunks: string[] = [];
  for (const match of html.matchAll(footerRe)) {
    if (match[1]) chunks.push(match[1]);
  }
  if (chunks.length === 0) return '';

  const stripped = chunks
    .join(' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const text = decodeEntities(stripped.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= FOOTER_TEXT_MAX_CHARS) return text;

  // Footers overwhelmingly put sitemap-style nav columns first and the
  // legal/contact/address bar last (this project's own legacy Footer.tsx
  // does exactly that: nav grid → AI/social row → office locations →
  // copyright). Truncating from the front would cut off before ever
  // reaching the office addresses this field exists to capture, so keep
  // the tail instead.
  return `…${text.slice(-FOOTER_TEXT_MAX_CHARS)}`;
}

// ─── JSON-LD / schema.org structured-data extraction ────────────────
// Organization/LocalBusiness JSON-LD is the site's own authoritative
// self-description — foundingDate, registered address(es), founders, etc.
// It's also the one place multi-office companies reliably machine-tag every
// location, not just whichever one happens to be in visible body copy.
// Parsed by hand (JSON.parse per <script> block, wrapped in try/catch) — no
// HTML/JSON-LD parsing library dependency.

/** schema.org types worth pulling entity facts from. Mirrors the type list
 *  extract-brand.ts uses for org-name detection (Organization/LocalBusiness/
 *  Corporation and its common subtypes), plus WebSite. */
const ENTITY_SCHEMA_TYPES = new Set([
  'Organization', 'Corporation', 'LocalBusiness', 'OnlineBusiness', 'OnlineStore',
  'NewsMediaOrganization', 'EducationalOrganization', 'GovernmentOrganization', 'NGO',
  'MedicalOrganization', 'ProfessionalService', 'Restaurant', 'Store', 'WebSite',
]);

/** Normalize a value that may be absent, a single item, or an array into an array. */
function asArray<T = unknown>(v: unknown): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? (v as T[]) : [v as T];
}

/** Coerce a JSON-LD scalar (string or number) into a trimmed, decoded string. Anything else
 *  (objects, booleans) resolves to '' — callers that need object shapes handle those explicitly. */
function asString(v: unknown): string {
  if (typeof v === 'string') return decodeEntities(v).trim();
  if (typeof v === 'number') return String(v);
  return '';
}

/** Pull a display name out of either a bare string or a `{ name }`-shaped node — schema.org
 *  Person/Thing references (founder, areaServed, knowsAbout) are commonly inlined either way. */
function nodeDisplayName(v: unknown): string {
  if (typeof v === 'string') return decodeEntities(v).trim();
  if (v && typeof v === 'object' && 'name' in (v as Record<string, unknown>)) {
    return asString((v as Record<string, unknown>).name);
  }
  return '';
}

/** Assemble a PostalAddress-shaped node (or a bare string) into one readable line. */
function formatAddress(addr: unknown): string {
  if (!addr) return '';
  if (typeof addr === 'string') return decodeEntities(addr).trim();
  if (typeof addr !== 'object') return '';
  const a = addr as Record<string, unknown>;
  const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry]
    .map((p) => asString(p))
    .filter((p) => p.length > 0);
  return parts.join(', ');
}

/** `numberOfEmployees` is typically a QuantitativeValue ({ value } or { minValue, maxValue }),
 *  but some sites just put a raw number or string. */
function formatNumberOfEmployees(v: unknown): string {
  if (v === undefined || v === null) return '';
  const direct = asString(v);
  if (direct) return direct;
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const value = asString(o.value);
    if (value) return value;
    const min = asString(o.minValue);
    const max = asString(o.maxValue);
    if (min && max) return `${min}-${max}`;
    return min || max;
  }
  return '';
}

/**
 * Flatten a parsed JSON-LD payload into a list of plain entity nodes. Handles
 * all three shapes the spec allows: a single object, an array of objects,
 * and an object (or array element) that wraps its entities in `@graph`.
 * Recurses so `@graph`-inside-an-array-inside-`@graph` still resolves.
 */
function flattenJsonLdNodes(node: unknown): Record<string, unknown>[] {
  if (Array.isArray(node)) return node.flatMap((n) => flattenJsonLdNodes(n));
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj['@graph'])) {
      return (obj['@graph'] as unknown[]).flatMap((n) => flattenJsonLdNodes(n));
    }
    return [obj];
  }
  return [];
}

/** Every place a node might carry a postal address: its own `address`, or a `location`
 *  (Place) that either wraps an `address` or is itself address-shaped. */
function collectAddressSources(entity: Record<string, unknown>): unknown[] {
  const sources: unknown[] = [...asArray(entity.address)];
  for (const loc of asArray(entity.location)) {
    if (loc && typeof loc === 'object' && 'address' in (loc as Record<string, unknown>)) {
      sources.push(...asArray((loc as Record<string, unknown>).address));
    } else if (loc) {
      sources.push(loc);
    }
  }
  return sources;
}

/**
 * Extract every `<script type="application/ld+json">` block from the raw
 * HTML, parse it, and collapse whatever Organization/LocalBusiness/
 * Corporation/ProfessionalService/WebSite facts it finds into one compact,
 * readable block. Multiple qualifying nodes (e.g. one LocalBusiness per
 * office in a `@graph`) are merged rather than overwritten — that's the only
 * way a multi-office company's addresses all survive into the summary.
 *
 * Malformed JSON-LD is skipped block-by-block; a syntax error in one script
 * tag never loses the facts sitting in another.
 */
function extractStructuredData(html: string): string {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const nodes: Record<string, unknown>[] = [];
  for (const match of html.matchAll(scriptRe)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      nodes.push(...flattenJsonLdNodes(parsed));
    } catch {
      continue; // malformed JSON-LD in this block — skip it, keep going
    }
  }
  if (nodes.length === 0) return '';

  const names = new Set<string>();
  const sameAs = new Set<string>();
  const addresses = new Set<string>();
  const founders = new Set<string>();
  const areaServed = new Set<string>();
  const knowsAbout = new Set<string>();
  const telephones = new Set<string>();
  const emails = new Set<string>();
  let foundingDate = '';
  let description = '';
  let url = '';
  let slogan = '';
  let numberOfEmployees = '';

  for (const entity of nodes) {
    const rawType = entity['@type'] as string | string[] | undefined;
    const types = Array.isArray(rawType) ? rawType : rawType ? [rawType] : [];
    if (!types.some((t) => ENTITY_SCHEMA_TYPES.has(t))) continue;

    const name = asString(entity.name) || asString(entity.legalName);
    if (name) names.add(name);

    foundingDate = foundingDate || asString(entity.foundingDate);
    description = description || asString(entity.description);
    url = url || asString(entity.url);
    slogan = slogan || asString(entity.slogan);
    numberOfEmployees = numberOfEmployees || formatNumberOfEmployees(entity.numberOfEmployees);

    for (const s of asArray<string>(entity.sameAs)) {
      const v = asString(s);
      if (v) sameAs.add(v);
    }

    for (const addr of collectAddressSources(entity)) {
      const formatted = formatAddress(addr);
      if (formatted) addresses.add(formatted);
    }

    for (const f of [...asArray(entity.founder), ...asArray(entity.founders)]) {
      const fname = nodeDisplayName(f);
      if (fname) founders.add(fname);
    }

    for (const a of asArray(entity.areaServed)) {
      const aname = nodeDisplayName(a);
      if (aname) areaServed.add(aname);
    }

    for (const k of asArray(entity.knowsAbout)) {
      const kname = nodeDisplayName(k);
      if (kname) knowsAbout.add(kname);
    }

    for (const t of asArray<string>(entity.telephone)) {
      const v = asString(t);
      if (v) telephones.add(v);
    }

    for (const e of asArray<string>(entity.email)) {
      const v = asString(e);
      if (v) emails.add(v);
    }
  }

  const lines: string[] = [];
  if (names.size) lines.push(`Name: ${[...names].join(' / ')}`);
  if (foundingDate) lines.push(`Founded: ${foundingDate}`);
  if (description) lines.push(`Description: ${description}`);
  if (slogan) lines.push(`Slogan: ${slogan}`);
  if (url) lines.push(`URL: ${url}`);
  if (addresses.size === 1) {
    lines.push(`Location: ${[...addresses][0]}`);
  } else if (addresses.size > 1) {
    // Multiple addresses is how multi-office companies signal it — keep all of them,
    // never collapse to "the first one found".
    lines.push(`Locations:\n${[...addresses].map((a) => `  - ${a}`).join('\n')}`);
  }
  if (founders.size) lines.push(`Founder(s): ${[...founders].join(', ')}`);
  if (numberOfEmployees) lines.push(`Employees: ${numberOfEmployees}`);
  if (areaServed.size) lines.push(`Area served: ${[...areaServed].join(', ')}`);
  if (knowsAbout.size) lines.push(`Knows about: ${[...knowsAbout].join(', ')}`);
  if (telephones.size) lines.push(`Phone: ${[...telephones].join(', ')}`);
  if (emails.size) lines.push(`Email: ${[...emails].join(', ')}`);
  if (sameAs.size) lines.push(`Verified profiles (sameAs): ${[...sameAs].join(', ')}`);

  const block = lines.join('\n');
  if (block.length <= STRUCTURED_DATA_MAX_CHARS) return block;
  const cut = block.slice(0, STRUCTURED_DATA_MAX_CHARS);
  const lastBreak = cut.lastIndexOf('\n');
  return lastBreak > STRUCTURED_DATA_MAX_CHARS * 0.5 ? `${cut.slice(0, lastBreak)}\n…` : `${cut}…`;
}

function scoreConfidence(
  title: string,
  description: string,
  body: string,
  structuredData: string,
): 'high' | 'medium' | 'low' {
  let score = 0;
  if (title.length >= 5) score++;
  if (description.length >= 30) score++;
  if (body.length >= 400) score++;
  // JSON-LD is a high-authority, self-declared signal — worth as much as any one of the above.
  if (structuredData.length > 0) score++;
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Fetch the URL and return the structured ground-truth anchor.
 * Returns `null` only if the fetch fails outright — a partial response still
 * returns a GroundTruth with empty fields and a "low" confidence tag.
 */
export async function scrapeGroundTruth(url: string): Promise<GroundTruth | null> {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  const domain = cleanDomain(normalized);
  if (!domain || !domain.includes('.')) return null;

  const html = await fetchHtml(normalized, FETCH_TIMEOUT_MS);
  if (!html) return null;

  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : html.slice(0, 50000);

  const title = extractTitle(head);
  const metaDescription = extractMetaContent(head, 'description');
  const ogDescription =
    extractMetaContent(head, 'og:description') ||
    extractMetaContent(head, 'twitter:description');
  const h1 = extractFirstH1(html);

  // Both run against the raw, unstripped HTML — extractBodyExcerpt() below
  // strips <script>/<nav>/<footer>/<header> for excerpt purposes, which
  // would otherwise erase the JSON-LD and office-address facts these two
  // are specifically here to preserve.
  const structuredData = extractStructuredData(html);
  const footerText = extractFooterText(html);

  const bodyExcerpt = extractBodyExcerpt(html);

  const confidence = scoreConfidence(
    title,
    metaDescription || ogDescription,
    bodyExcerpt,
    structuredData,
  );

  return {
    url: normalized,
    domain,
    title,
    metaDescription,
    ogDescription,
    h1,
    bodyExcerpt,
    structuredData,
    footerText,
    confidence,
  };
}

/**
 * Format a ground-truth object as a prompt-ready context block.
 * Kept deterministic so the LLM extraction layer can feed it into system/user prompts.
 */
export function formatGroundTruthForPrompt(gt: GroundTruth): string {
  const lines: string[] = [];
  lines.push(`URL: ${gt.url}`);
  lines.push(`Domain: ${gt.domain}`);
  if (gt.title) lines.push(`Title: ${gt.title}`);
  if (gt.metaDescription) lines.push(`Meta description: ${gt.metaDescription}`);
  if (gt.ogDescription && gt.ogDescription !== gt.metaDescription) {
    lines.push(`Open Graph description: ${gt.ogDescription}`);
  }
  if (gt.h1) lines.push(`H1: ${gt.h1}`);
  if (gt.bodyExcerpt) lines.push(`Body excerpt:\n${gt.bodyExcerpt}`);
  if (gt.structuredData) {
    lines.push(`Structured data (JSON-LD / schema.org — authoritative self-description):\n${gt.structuredData}`);
  }
  if (gt.footerText) {
    lines.push(`Footer / contact info:\n${gt.footerText}`);
  }
  return lines.join('\n');
}
