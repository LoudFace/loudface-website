import type {
  AIPlatform,
  DFSLLMResponseResult,
  PlatformResult,
  Sentiment,
  SourceCitation,
} from './types';

function escapeRegex(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Context words that suggest a bare word match is naming a company/product
 * rather than using the word generically. Used only for common-word brand
 * names (see `isGenericWordName`).
 */
const BRAND_CONTEXT_WORDS = [
  'app', 'platform', 'company', 'tool', 'software', 'vendor', 'brand',
  'startup', 'service', 'product', 'saas', 'website',
];

/**
 * A single short, all-alphabetic word ("Linear", "Ramp", "Notion") is the
 * shape that produces false positives on a bare word-boundary match — "a
 * linear workflow", "up the ramp". Multi-word names, names with digits/
 * punctuation, or longer names are distinctive enough that a plain match is
 * safe. 8 chars is a rough cutoff for "reads like an ordinary English word".
 */
function isGenericWordName(name: string): boolean {
  return /^[a-z]+$/i.test(name) && name.length <= 8;
}

/**
 * Does the text mention the brand?
 * - Domain match is a boundary-aware match against the normalized domain —
 *   not a raw substring — so `ramp.com` doesn't match inside `offramp.com`.
 * - Brand name match is word-boundary-aware so short names don't match
 *   substrings ("test" must not match "testing" / "contestant").
 * - For common-word brand names (see `isGenericWordName`), a bare match is
 *   not enough on its own — we additionally require the match to look like
 *   a proper noun (capitalized in the source text), to sit near a company/
 *   product context word, or for the brand's domain to also appear in the
 *   text. This stops generic-word inflation ("a linear workflow" counting
 *   as a mention of Linear) without dropping real mentions of distinctive
 *   names, which skip this extra check entirely.
 */
export function mentionsBrand(
  text: string,
  brandName: string,
  brandDomain: string,
): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();

  // Domain check: boundary-anchored match against the normalized domain
  // (strip www). A plain `.includes()` would also match `ramp.com` inside
  // `offramp.com` or `notramp.com` — anchor so the char before the match
  // isn't itself a domain/hostname character.
  const cleanedDomain = brandDomain.toLowerCase().replace(/^www\./, '');
  if (cleanedDomain) {
    const domainRe = new RegExp(
      `(?:^|[^a-z0-9.-])${escapeRegex(cleanedDomain)}(?=$|[^a-z0-9-])`,
      'i',
    );
    if (domainRe.test(lowerText)) return true;
  }

  if (!brandName) return false;

  // Use word-boundary match for the brand name
  const escaped = escapeRegex(brandName.toLowerCase());
  const re = new RegExp(`(?:^|[^a-z0-9])(${escaped})(?=$|[^a-z0-9])`, 'gi');

  if (!isGenericWordName(brandName)) {
    return re.test(text);
  }

  // Common-word brand name — require a proximity/context signal per-match.
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const matched = match[1];
    if (/^[A-Z]/.test(matched)) return true; // looks like a proper noun in context

    const windowStart = Math.max(0, match.index - 60);
    const windowEnd = Math.min(text.length, match.index + matched.length + 60);
    const window = lowerText.slice(windowStart, windowEnd);
    if (BRAND_CONTEXT_WORDS.some((w) => window.includes(w))) return true;

    if (match.index === re.lastIndex) re.lastIndex++; // guard against zero-length matches
  }
  return false;
}

/**
 * Parse a DataForSEO LLM response into a structured PlatformResult.
 * Checks whether the brand is mentioned, cited, and determines sentiment.
 */
export function parseResponse(
  platform: AIPlatform,
  result: DFSLLMResponseResult | null,
  brandName: string,
  brandDomain: string,
): PlatformResult {
  if (!result) {
    return {
      platform,
      mentioned: false,
      cited: false,
      sentiment: 'neutral',
      snippet: '',
      sources: [],
    };
  }

  const fullText = result.items
    .map((item) => {
      if (item.sections?.length) {
        return item.sections.map((s) => s.text).join('\n');
      }
      return item.text ?? '';
    })
    .join('\n');

  const lowerDomain = brandDomain.toLowerCase().replace(/^www\./, '');
  const mentioned = mentionsBrand(fullText, brandName, brandDomain);

  // Own-domain citation check needs an exact (or subdomain) hostname match —
  // a raw substring test would count `notbrand.com/x` as a citation for
  // `brand.com`. Parse each citation URL's hostname and compare it against
  // the normalized registrable domain.
  function isOwnDomainCitation(url: string): boolean {
    if (!lowerDomain) return false;
    try {
      const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
      return host === lowerDomain || host.endsWith(`.${lowerDomain}`);
    } catch {
      return false;
    }
  }

  const sources: SourceCitation[] = [];
  for (const item of result.items) {
    if (item.annotations) {
      for (const ann of item.annotations) {
        if (ann.url) sources.push({ url: ann.url, title: ann.title });
      }
    }
    if (item.sections) {
      for (const section of item.sections) {
        if (section.annotations) {
          for (const ann of section.annotations) {
            if (ann.url) sources.push({ url: ann.url, title: ann.title });
          }
        }
      }
    }
  }
  if (result.extra?.annotations) {
    for (const ann of result.extra.annotations) {
      if (ann.url) sources.push({ url: ann.url, title: ann.title });
    }
  }

  const cited = sources.some((s) => isOwnDomainCitation(s.url));
  const snippet = extractSnippet(fullText, brandName);
  const sentiment = analyzeSentiment(fullText, brandName);

  return {
    platform,
    mentioned,
    cited,
    sentiment,
    snippet,
    sources,
    rawResponse: fullText,
  };
}

function findBrandIndex(text: string, brandName: string): number {
  if (!text || !brandName) return -1;
  const escaped = escapeRegex(brandName.toLowerCase());
  const re = new RegExp(`(?:^|[^a-z0-9])(${escaped})(?=$|[^a-z0-9])`, 'i');
  const match = re.exec(text);
  if (!match) return -1;
  return match.index + match[0].toLowerCase().indexOf(brandName.toLowerCase());
}

/**
 * Like `findBrandIndex`, but returns every mention index instead of just the
 * first. Used by `analyzeSentiment` so multi-mention responses aren't judged
 * on their first mention alone (e.g. a response that opens neutrally on the
 * brand but turns negative three paragraphs later).
 */
function findAllBrandIndices(text: string, brandName: string): number[] {
  if (!text || !brandName) return [];
  const escaped = escapeRegex(brandName.toLowerCase());
  const re = new RegExp(`(?:^|[^a-z0-9])(${escaped})(?=$|[^a-z0-9])`, 'gi');
  const lowerBrand = brandName.toLowerCase();
  const indices: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    indices.push(match.index + match[0].toLowerCase().indexOf(lowerBrand));
    if (match.index === re.lastIndex) re.lastIndex++; // guard against zero-length matches
  }
  return indices;
}

function extractSnippet(text: string, brandName: string): string {
  const idx = findBrandIndex(text, brandName);
  if (idx === -1) {
    return text.slice(0, 200).trim() + (text.length > 200 ? '...' : '');
  }
  const start = Math.max(0, idx - 100);
  const end = Math.min(text.length, idx + brandName.length + 100);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

const SENTIMENT_POSITIVE_SIGNALS = [
  'excellent', 'great', 'best', 'top', 'leading', 'popular',
  'highly rated', 'well-known', 'trusted', 'reliable', 'innovative',
  'recommended', 'strong', 'impressive', 'standout', 'powerful',
];
const SENTIMENT_NEGATIVE_SIGNALS = [
  'limited', 'lacks', 'expensive', 'criticism', 'drawback',
  'downside', 'weakness', 'concern', 'issue', 'problem',
  'behind', 'outdated', 'struggle', 'complaint', 'poor',
];
/** Negators that flip a signal word's polarity when they appear shortly before it. */
const SENTIMENT_NEGATORS = [
  'not', 'no', 'never', "isn't", "aren't", "wasn't", "weren't",
  "doesn't", "don't", "didn't", "won't", "wouldn't", 'no longer',
];

/**
 * Does a negator appear within ~3 tokens (approximated as ~20 chars, which
 * covers "is not really", "does not seem") immediately before this signal
 * word's position in the window?
 */
function isNegatedAt(window: string, matchIndex: number): boolean {
  const before = window.slice(Math.max(0, matchIndex - 20), matchIndex);
  // Word-boundary test, not substring — a bare `.includes('no')` would false-
  // positive inside ordinary words like "known" or "no longer" inside "known".
  return SENTIMENT_NEGATORS.some((n) => new RegExp(`\\b${escapeRegex(n)}\\b`, 'i').test(before));
}

/** Sum +1/-1 per signal-word occurrence in a window, flipping polarity when negated. */
function scoreWindow(window: string, signals: string[], polarity: 1 | -1): number {
  let score = 0;
  for (const word of signals) {
    let idx = window.indexOf(word);
    while (idx !== -1) {
      score += isNegatedAt(window, idx) ? -polarity : polarity;
      idx = window.indexOf(word, idx + word.length);
    }
  }
  return score;
}

/**
 * Aggregates signal words across every mention of the brand in the response
 * (not just the first), with a lightweight negation flip so "not a great
 * fit" doesn't count as a positive hit.
 */
function analyzeSentiment(text: string, brandName: string): Sentiment {
  const indices = findAllBrandIndices(text, brandName);
  if (indices.length === 0) return 'neutral';

  const lowerText = text.toLowerCase();

  let score = 0;
  for (const idx of indices) {
    const window = lowerText.slice(
      Math.max(0, idx - 200),
      Math.min(lowerText.length, idx + brandName.length + 200),
    );
    score += scoreWindow(window, SENTIMENT_POSITIVE_SIGNALS, 1);
    score += scoreWindow(window, SENTIMENT_NEGATIVE_SIGNALS, -1);
  }

  if (score >= 2) return 'positive';
  if (score <= -2) return 'negative';
  return 'neutral';
}

// ─── Competitor Filtering ───────────────────────────────────────────

/**
 * Generic high-traffic domains that are never real business competitors.
 * DataForSEO keyword-overlap often returns these because they rank for
 * similar informational keywords.
 */
const NEVER_COMPETITOR_DOMAINS = new Set([
  'x.com', 'twitter.com', 'facebook.com', 'linkedin.com', 'instagram.com',
  'tiktok.com', 'reddit.com', 'threads.net',
  'google.com', 'bing.com', 'yahoo.com', 'wikipedia.org', 'youtube.com',
  'github.com', 'medium.com', 'substack.com',
  'techcrunch.com', 'forbes.com', 'bloomberg.com', 'bbc.com', 'cnn.com',
  'reuters.com', 'nytimes.com', 'theverge.com', 'wired.com',
  'binance.com', 'coinbase.com', 'kraken.com', 'coinmarketcap.com',
  'coingecko.com', 'crypto.com',
  'amazon.com', 'ebay.com', 'walmart.com', 'shopify.com',
  'g2.com', 'capterra.com', 'trustpilot.com', 'glassdoor.com',
  'crunchbase.com', 'producthunt.com',
  // Reference / educational / government — co-rank for informational queries
  // but are never real business competitors. Observed polluting DFS results
  // for dominant fintech/SaaS brands (e.g., Investopedia for stripe.com).
  'investopedia.com', 'nerdwallet.com', 'thebalance.com', 'thebalancemoney.com',
  'consumerreports.org', 'bankrate.com', 'creditkarma.com',
  'irs.gov', 'sec.gov', 'treasury.gov', 'ftc.gov', 'nist.gov', 'europa.eu',
  'who.int', 'un.org', 'cdc.gov', 'sba.gov', 'uspto.gov',
  'microsoft.com', 'apple.com',
  'wsj.com', 'ft.com', 'economist.com', 'businessinsider.com',
  'entrepreneur.com', 'inc.com', 'fastcompany.com',
  'investor.gov', 'usa.gov', 'uschamber.com',
  'stackoverflow.com', 'stackexchange.com', 'quora.com',
  // Job boards and business directories — co-rank for remote-work / payroll / legal
  // keywords but aren't direct competitors to fintech/SaaS.
  'indeed.com', 'ziprecruiter.com', 'monster.com', 'careerbuilder.com',
  // Vertical review / information sites that show up for retail & healthcare queries.
  'allaboutvision.com', 'aao.org', 'runrepeat.com',
  'healthline.com', 'webmd.com', 'mayoclinic.org',
  'clevelandclinic.org', 'hopkinsmedicine.org', 'nih.gov', 'medlineplus.gov',
  'nerdynav.com', 'tomsguide.com', 'cnet.com', 'pcmag.com',
  'themodestman.com', 'consumeraffairs.com',
  // Business registries and corporate-info aggregators — pollute citation
  // analysis for brands with EU/UK entities (observed on patagonia.com).
  'dnb.com', 'northdata.com', 'pappers.fr', 'opencorporates.com',
  'find-and-update.company-information.service.gov.uk',
  'companieshouse.gov.uk', 'bloomberg.com',
  // Developer reference / education sites — DFS keyword-overlap picks these
  // up for agencies that blog about web tech (Finsweet, Flow Ninja).
  // Conservative list: only sites that are never real competitors to
  // anyone. Tools like ahrefs.com / semrush.com stay off this list because
  // they're valid competitors for SEO brands.
  'mozilla.org', 'developer.mozilla.org', 'w3schools.com', 'dev.to',
  'freecodecamp.org', 'css-tricks.com', 'smashingmagazine.com',
  'sitepoint.com', 'tutorialspoint.com', 'geeksforgeeks.org',
  'scribd.com',
]);

/**
 * Filter DataForSEO keyword-overlap competitors to remove obviously
 * wrong results (social media, exchanges, news sites, etc.)
 * and the audited company itself.
 */
export function filterDFSCompetitors(
  competitors: { domain: string; intersections: number }[],
  auditedDomain: string,
): { domain: string; intersections: number }[] {
  const cleanAudited = auditedDomain.replace(/^www\./, '').toLowerCase();

  return competitors.filter((c) => {
    const clean = c.domain.replace(/^www\./, '').toLowerCase();
    if (clean === cleanAudited) return false;
    if (NEVER_COMPETITOR_DOMAINS.has(clean)) return false;
    return true;
  });
}
