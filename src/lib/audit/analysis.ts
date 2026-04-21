import type {
  AIPlatform,
  DFSLLMResponseResult,
  PlatformResult,
  Sentiment,
  SourceCitation,
} from './types';

/**
 * Does the text mention the brand?
 * - Domain match is always a whole-token match (avoids "Toku" matching "tokusatsu").
 * - Brand name match is word-boundary-aware so short names don't match
 *   substrings ("test" must not match "testing" / "contestant").
 */
export function mentionsBrand(
  text: string,
  brandName: string,
  brandDomain: string,
): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();

  // Domain check: match the root (strip www and TLD) and the full domain
  const cleanedDomain = brandDomain.toLowerCase().replace(/^www\./, '');
  if (cleanedDomain && lowerText.includes(cleanedDomain)) {
    return true;
  }

  if (!brandName) return false;

  // Use word-boundary match for the brand name
  const escaped = brandName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i');
  return re.test(text);
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

  const cited = sources.some((s) => s.url.toLowerCase().includes(lowerDomain));
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
  const escaped = brandName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|[^a-z0-9])(${escaped})(?=$|[^a-z0-9])`, 'i');
  const match = re.exec(text);
  if (!match) return -1;
  return match.index + match[0].toLowerCase().indexOf(brandName.toLowerCase());
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

function analyzeSentiment(text: string, brandName: string): Sentiment {
  const idx = findBrandIndex(text, brandName);
  if (idx === -1) return 'neutral';

  const lowerText = text.toLowerCase();
  const context = lowerText.slice(
    Math.max(0, idx - 200),
    Math.min(lowerText.length, idx + brandName.length + 200),
  );

  const positiveSignals = [
    'excellent', 'great', 'best', 'top', 'leading', 'popular',
    'highly rated', 'well-known', 'trusted', 'reliable', 'innovative',
    'recommended', 'strong', 'impressive', 'standout', 'powerful',
  ];
  const negativeSignals = [
    'limited', 'lacks', 'expensive', 'criticism', 'drawback',
    'downside', 'weakness', 'concern', 'issue', 'problem',
    'behind', 'outdated', 'struggle', 'complaint', 'poor',
  ];

  let score = 0;
  for (const word of positiveSignals) if (context.includes(word)) score++;
  for (const word of negativeSignals) if (context.includes(word)) score--;

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
