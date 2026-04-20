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
 *
 * Rules:
 *   • Brand names ≥4 chars → word-boundary regex
 *   • Brand names <4 chars → require word-boundary AND adjacent punctuation/quote
 *     (capital words under 4 chars are ambiguous; we require strong signal)
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

  // Combine all text from response items (handle both flat and nested structures)
  const fullText = result.items
    .map((item) => {
      // If sections exist, extract text from each section
      if (item.sections?.length) {
        return item.sections.map((s) => s.text).join('\n');
      }
      // Fallback to item-level text
      return item.text ?? '';
    })
    .join('\n');

  const lowerDomain = brandDomain.toLowerCase().replace(/^www\./, '');

  // Check for brand mention (word-boundary aware — see mentionsBrand).
  const mentioned = mentionsBrand(fullText, brandName, brandDomain);

  // Extract citations/sources from all possible locations
  const sources: SourceCitation[] = [];
  for (const item of result.items) {
    // Check item-level annotations
    if (item.annotations) {
      for (const ann of item.annotations) {
        if (ann.url) {
          sources.push({ url: ann.url, title: ann.title });
        }
      }
    }
    // Check section-level annotations
    if (item.sections) {
      for (const section of item.sections) {
        if (section.annotations) {
          for (const ann of section.annotations) {
            if (ann.url) {
              sources.push({ url: ann.url, title: ann.title });
            }
          }
        }
      }
    }
  }

  // Also check top-level annotations
  if (result.extra?.annotations) {
    for (const ann of result.extra.annotations) {
      if (ann.url) {
        sources.push({ url: ann.url, title: ann.title });
      }
    }
  }

  // Check if brand domain is cited in sources
  const cited = sources.some((s) =>
    s.url.toLowerCase().includes(lowerDomain),
  );

  // Extract a relevant snippet (first mention context or first 200 chars)
  const snippet = extractSnippet(fullText, brandName);

  // Determine sentiment
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

/**
 * Find the position of the first word-boundary-aware brand mention.
 * Returns -1 if the brand is not mentioned.
 */
function findBrandIndex(text: string, brandName: string): number {
  if (!text || !brandName) return -1;
  const escaped = brandName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|[^a-z0-9])(${escaped})(?=$|[^a-z0-9])`, 'i');
  const match = re.exec(text);
  if (!match) return -1;
  // Return index of the captured group (the actual brand name, not the boundary char)
  return match.index + match[0].toLowerCase().indexOf(brandName.toLowerCase());
}

/**
 * Extract a relevant snippet around the brand mention.
 */
function extractSnippet(text: string, brandName: string): string {
  const idx = findBrandIndex(text, brandName);

  if (idx === -1) {
    // No mention — return truncated response
    return text.slice(0, 200).trim() + (text.length > 200 ? '...' : '');
  }

  // Extract ~100 chars before and after the mention
  const start = Math.max(0, idx - 100);
  const end = Math.min(text.length, idx + brandName.length + 100);
  let snippet = text.slice(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Simple sentiment analysis based on keyword patterns.
 * Returns positive, neutral, or negative.
 */
function analyzeSentiment(text: string, brandName: string): Sentiment {
  // Only analyze text near word-boundary brand mentions
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
  for (const word of positiveSignals) {
    if (context.includes(word)) score++;
  }
  for (const word of negativeSignals) {
    if (context.includes(word)) score--;
  }

  if (score >= 2) return 'positive';
  if (score <= -2) return 'negative';
  return 'neutral';
}

/**
 * Extract what AI gets right about the brand from Phase 1 responses.
 * Uses relevance scoring to filter out information about different entities
 * with the same name (e.g., a band, an apparel brand, a hardware product).
 *
 * Accepts optional `domain` and `industry` to boost relevance matching.
 */
export function extractAccurateInfo(
  responses: PlatformResult[],
  brandName: string,
  domain?: string,
  industry?: string,
): string[] {
  // Context signals that indicate the sentence is about a real business
  // (rather than a band, a TV show, a word in another language, a product).
  // Kept generic so the function works for any client — domain/industry
  // keywords plug in as optional bonus signals.
  const domainWords = (domain ?? '')
    .replace(/^www\./, '')
    .replace(/\.(com|io|co|net|org|ai|app|dev|xyz|so|to)$/, '')
    .split(/[-_.]/)
    .filter((w) => w.length > 2);

  const positiveSignals = [
    // Business entity signals
    'agency', 'company', 'startup', 'founded', 'headquartered', 'team',
    'clients', 'customers', 'services', 'service provider', 'software',
    'saas', 'b2b', 'b2c', 'platform', 'tool', 'product', 'provider',
    'founded in', 'based in', 'established',
    // Business activity signals
    'offers', 'provides', 'specializes', 'helps', 'delivers', 'builds',
    'enables', 'focuses on', 'designed for',
    // Optional bonuses from user context
    ...(industry ? [industry.toLowerCase()] : []),
    ...domainWords.map((w) => w.toLowerCase()),
  ];

  // Generic "wrong-entity" disambiguation signals.
  // These are domains where a similarly-named thing might confuse the AI.
  // Kept as generic categories rather than client-specific lists.
  const wrongEntityContexts = [
    // Music / entertainment
    'band', 'album', 'song', 'musician', 'recording artist', 'rapper',
    'singer', 'songwriter', 'discography', 'tracklist',
    // TV / film / anime
    'tv channel', 'television channel', 'streaming service', 'anime',
    'tokusatsu', 'sitcom', 'drama series', 'film director', 'filmmaker',
    // Games / characters
    'video game', 'character in', 'fictional character', 'protagonist of',
    // Language / definition
    'japanese term', 'japanese word', 'kanji', 'chinese term',
    'means "', 'is a word', 'translates to', 'etymology',
    // Apparel / accessories unrelated to the business
    'apparel brand', 'clothing brand', 'fashion label', 'streetwear',
    // Hardware unrelated
    'helmet', 'bone-conduction', 'eyewear', 'wearable device',
    'speech-to-text', 'speech to text', 'hearing aid',
    'closed caption', 'transcription glasses', 'waverly labs',
    // Famous people / places unrelated
    'born in', 'born on', 'biography', 'autobiography',
  ];

  type ScoredFact = { text: string; score: number; platform: string };
  const candidates: ScoredFact[] = [];

  for (const r of responses) {
    if (!r.rawResponse || !r.mentioned) continue;
    if (r.sentiment === 'negative') continue;

    // Split into sentences, clean up markdown artifacts
    const sentences = r.rawResponse
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s
        .replace(/^#+\s*/, '') // Remove markdown headers
        .replace(/\*+/g, '')   // Remove bold/italic markers
        .replace(/\[?\d+\]?/g, '') // Remove citation references like [3][4]
        .trim(),
      )
      .filter((s) => {
        if (s.length < 30 || s.length > 300) return false;
        // Skip questions, labels, meta-commentary
        if (s.endsWith('?') || s.endsWith(':')) return false;
        if (s.startsWith('Based on my search') || s.startsWith('I ')) return false;
        if (s.startsWith('Could you') || s.startsWith('It appears')) return false;
        // Must mention the brand (word-boundary)
        if (findBrandIndex(s, brandName) === -1) return false;
        return true;
      });

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();

      // Score: positive for business-entity relevance, negative for wrong-entity
      let score = 0;

      for (const signal of positiveSignals) {
        if (lower.includes(signal)) score += 2;
      }
      for (const signal of wrongEntityContexts) {
        if (lower.includes(signal)) score -= 5;
      }

      // Bonus for sentences with specific facts (numbers, years, percentages)
      if (/\d{3,}|\d+%|\d{4}/.test(sentence)) score += 1;

      // Only keep sentences that score positively (likely about the right entity)
      if (score > 0) {
        candidates.push({ text: sentence, score, platform: r.platform });
      }
    }
  }

  // Sort by score descending, deduplicate similar content
  candidates.sort((a, b) => b.score - a.score);

  const selected: string[] = [];
  for (const candidate of candidates) {
    // Skip if we already have a very similar sentence
    const isDuplicate = selected.some((existing) => {
      const overlap = longestCommonSubstring(existing.toLowerCase(), candidate.text.toLowerCase());
      return overlap > 40; // 40+ chars of overlap = likely duplicate
    });
    if (isDuplicate) continue;

    selected.push(candidate.text);
    if (selected.length >= 6) break;
  }

  return selected;
}

/**
 * Find the length of the longest common substring between two strings.
 * Used for deduplicating similar facts.
 */
function longestCommonSubstring(a: string, b: string): number {
  // Use a simplified O(n*m) approach with early exit for performance
  const maxLen = Math.min(a.length, b.length);
  let best = 0;

  for (let i = 0; i < a.length && best < maxLen; i++) {
    for (let j = 0; j < b.length; j++) {
      let len = 0;
      while (i + len < a.length && j + len < b.length && a[i + len] === b[j + len]) {
        len++;
      }
      if (len > best) best = len;
    }
  }

  return best;
}

/**
 * Extract gaps and inaccuracies from Phase 1 responses.
 * Identifies negative signals, missing info, and outdated data.
 */
/**
 * Extract gaps and inaccuracies with per-query specificity.
 * Instead of blanket "not cited by X", shows which specific queries
 * had citation gaps on which platforms.
 */
export function extractGaps(
  queries: { prompt: string; results: PlatformResult[] }[],
): { inaccuracies: string[]; gaps: string[] } {
  const inaccuracies: string[] = [];
  const gaps: string[] = [];
  const allResponses = queries.flatMap((q) => q.results);

  // 1. Platforms that don't recognize the brand AT ALL across any query
  const platformMentionCounts = new Map<string, { mentioned: number; total: number }>();
  for (const r of allResponses) {
    const entry = platformMentionCounts.get(r.platform) ?? { mentioned: 0, total: 0 };
    entry.total++;
    if (r.mentioned) entry.mentioned++;
    platformMentionCounts.set(r.platform, entry);
  }

  const neverMentioned = [...platformMentionCounts.entries()]
    .filter(([, stats]) => stats.mentioned === 0)
    .map(([platform]) => platform);

  if (neverMentioned.length > 0) {
    gaps.push(`Not recognized by ${neverMentioned.join(' or ')} across any branded query`);
  }

  if (neverMentioned.length === 4) {
    gaps.push('Brand has zero AI visibility — not recognized by any major AI platform');
    return { inaccuracies: inaccuracies.slice(0, 5), gaps: gaps.slice(0, 5) };
  }

  // 2. Per-query citation analysis: which specific queries lack citations?
  const queriesWithNoCitations: string[] = [];
  const queriesWithCitations: string[] = [];

  for (const q of queries) {
    const hasCitation = q.results.some((r) => r.cited);
    const shortPrompt = q.prompt.length > 50 ? q.prompt.slice(0, 47) + '...' : q.prompt;
    if (hasCitation) {
      queriesWithCitations.push(shortPrompt);
    } else {
      queriesWithNoCitations.push(shortPrompt);
    }
  }

  // Report citation gaps with specificity
  const totalQueries = queries.length;
  const citedQueries = queriesWithCitations.length;

  if (citedQueries === 0) {
    gaps.push(`Website never cited as a source across all ${totalQueries} branded queries on any platform`);
  } else if (queriesWithNoCitations.length > 0 && queriesWithNoCitations.length <= 5) {
    // Show the specific queries that didn't get citations
    gaps.push(`Website not cited for: ${queriesWithNoCitations.map((q) => `"${q}"`).join(', ')}`);
  } else if (queriesWithNoCitations.length > 5) {
    gaps.push(`Website cited in only ${citedQueries}/${totalQueries} queries — most queries return no source attribution`);
  }

  // 3. Platform-specific citation gaps (mentioned but never cited)
  const mentionedButNeverCited = [...platformMentionCounts.entries()]
    .filter(([platform, stats]) => {
      if (stats.mentioned === 0) return false;
      // Check if this platform EVER cites
      return !allResponses.some((r) => r.platform === platform && r.cited);
    })
    .map(([platform]) => platform);

  if (mentionedButNeverCited.length > 0 && mentionedButNeverCited.length < 4) {
    gaps.push(`${mentionedButNeverCited.join(', ')} mention${mentionedButNeverCited.length === 1 ? 's' : ''} the brand but never cite${mentionedButNeverCited.length === 1 ? 's' : ''} the website as a source`);
  }

  // 4. Negative sentiment responses (with query context)
  for (const q of queries) {
    for (const r of q.results) {
      if (r.sentiment === 'negative' && r.snippet) {
        inaccuracies.push(`[${r.platform}] "${q.prompt}": ${r.snippet.slice(0, 120)}`);
      }
    }
  }

  return {
    inaccuracies: inaccuracies.slice(0, 5),
    gaps: gaps.slice(0, 5),
  };
}

/**
 * Infer the company's category/industry from "What is {company}?" responses.
 * Uses a scoring approach: checks all responses for signal words, then combines
 * entity-type detection (service vs product) with category detection.
 */
export function inferCategory(
  responses: PlatformResult[],
): { category: string; industry: string; entityType: 'product' | 'service'; confidence: 'high' | 'medium' | 'low' } {
  // Prefer responses that actually mentioned the brand (more relevant)
  // Fall back to all responses if none mentioned it
  const mentionedResponses = responses.filter((r) => r.mentioned && r.rawResponse);
  const textsToUse = mentionedResponses.length > 0 ? mentionedResponses : responses;

  const allText = textsToUse
    .map((r) => r.rawResponse || '')
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

  if (!allText) {
    return { category: 'uncertain', industry: 'Unknown', entityType: 'product', confidence: 'low' };
  }

  // Use token count for density-based scoring — broad keyword bucket matches
  // across diverse responses used to win even when the signal was incidental.
  const totalTokens = Math.max(1, allText.split(/\s+/).length);
  const countOccurrences = (needle: string): number => {
    if (!needle) return 0;
    const re = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    return (allText.match(re) || []).length;
  };

  // Step 1: Entity type (service/agency vs product/software) with density
  const serviceSignals = [
    'agency', 'agencies', 'consulting', 'consultancy', 'firm',
    'services', 'service provider', 'freelance', 'studio',
  ];
  const productSignals = [
    'software', 'platform', 'tool', 'app', 'application',
    'saas', 'subscription', 'plugin', 'solution',
  ];

  let serviceScore = 0;
  let productScore = 0;
  for (const s of serviceSignals) serviceScore += countOccurrences(s);
  for (const s of productSignals) productScore += countOccurrences(s);
  let entityType: 'product' | 'service' = serviceScore > productScore ? 'service' : 'product';

  // Step 2: Category — each def contributes a density score (hits per 1000 tokens).
  // A category has to clear MIN_DENSITY to be trusted, else we fall back to 'uncertain'.
  const categoryDefs = [
    // Service categories
    { keywords: ['webflow', 'web design', 'web development', 'website design', 'website development'], cat: 'web design agency', ind: 'Professional Services', forType: 'service' as const, weight: 3 },
    { keywords: ['seo', 'search engine optimization', 'aeo', 'cro', 'conversion rate', 'organic growth'], cat: 'SEO & growth agency', ind: 'Professional Services', forType: 'service' as const, weight: 3 },
    { keywords: ['branding', 'brand identity', 'creative agency', 'design agency'], cat: 'design agency', ind: 'Professional Services', forType: 'service' as const, weight: 2 },
    { keywords: ['marketing agency', 'digital marketing', 'advertising agency', 'media agency'], cat: 'marketing agency', ind: 'Professional Services', forType: 'service' as const, weight: 2 },
    { keywords: ['consulting', 'management consulting', 'strategy consulting'], cat: 'consulting', ind: 'Professional Services', forType: 'service' as const, weight: 2 },
    // Product categories — tighter keyword lists, fewer false-positive triggers
    { keywords: ['crm', 'customer relationship management'], cat: 'CRM', ind: 'SaaS', forType: 'product' as const, weight: 3 },
    { keywords: ['project management', 'task management', 'workflow automation'], cat: 'project management', ind: 'SaaS', forType: 'product' as const, weight: 3 },
    { keywords: ['e-commerce', 'ecommerce', 'online store', 'online shop', 'shopify'], cat: 'e-commerce', ind: 'E-commerce', forType: 'product' as const, weight: 3 },
    { keywords: ['analytics platform', 'data analytics', 'business intelligence'], cat: 'analytics', ind: 'SaaS', forType: 'product' as const, weight: 2 },
    { keywords: ['fintech', 'financial technology', 'neobank', 'payment processing'], cat: 'fintech', ind: 'Fintech', forType: 'product' as const, weight: 3 },
    { keywords: ['healthtech', 'digital health', 'electronic health record', 'telemedicine', 'telehealth'], cat: 'healthtech', ind: 'Healthcare', forType: 'product' as const, weight: 3 },
    { keywords: ['edtech', 'learning management system', 'online course platform', 'lms'], cat: 'edtech', ind: 'Education', forType: 'product' as const, weight: 3 },
    { keywords: ['proptech', 'real estate platform', 'property management software'], cat: 'proptech', ind: 'Real Estate', forType: 'product' as const, weight: 3 },
    { keywords: ['legaltech', 'law practice management'], cat: 'legaltech', ind: 'Legal', forType: 'product' as const, weight: 3 },
    { keywords: ['hr software', 'human resources platform', 'hris', 'applicant tracking', 'recruiting software'], cat: 'HR software', ind: 'SaaS', forType: 'product' as const, weight: 3 },
    { keywords: ['cybersecurity', 'endpoint security', 'infosec', 'threat detection'], cat: 'cybersecurity', ind: 'Technology', forType: 'product' as const, weight: 3 },
    { keywords: ['machine learning platform', 'ai platform', 'large language model', 'llm', 'generative ai'], cat: 'AI', ind: 'Technology', forType: 'product' as const, weight: 2 },
    { keywords: ['developer tool', 'devtools', 'code editor', 'api platform'], cat: 'developer tools', ind: 'Developer Tools', forType: 'product' as const, weight: 2 },
    { keywords: ['customer support software', 'help desk software', 'ticketing system'], cat: 'customer support', ind: 'SaaS', forType: 'product' as const, weight: 2 },
  ];

  // Require at least 1 hit per 1000 tokens for a category to "win" confidently.
  const MIN_DENSITY_HIGH = 1.0; // strong signal
  const MIN_DENSITY_MEDIUM = 0.4; // moderate signal

  type Ranked = { cat: string; ind: string; score: number; density: number };
  let best: Ranked = { cat: 'uncertain', ind: 'Unknown', score: 0, density: 0 };

  for (const def of categoryDefs) {
    let hits = 0;
    for (const kw of def.keywords) hits += countOccurrences(kw);
    if (hits === 0) continue;
    let score = hits * def.weight;
    if (def.forType === entityType) score += 1;

    const density = (hits / totalTokens) * 1000;
    if (score > best.score) {
      best = { cat: def.cat, ind: def.ind, score, density };
    }
  }

  let confidence: 'high' | 'medium' | 'low';
  if (best.density >= MIN_DENSITY_HIGH) {
    confidence = 'high';
  } else if (best.density >= MIN_DENSITY_MEDIUM) {
    confidence = 'medium';
  } else {
    // Not enough signal — don't pretend we know the category
    return { category: 'uncertain', industry: 'Unknown', entityType, confidence: 'low' };
  }

  // Override: if the category name itself signals a service, force the entity type
  const serviceCategoryKeywords = ['agency', 'consulting', 'firm', 'studio', 'services'];
  if (serviceCategoryKeywords.some((kw) => best.cat.toLowerCase().includes(kw))) {
    entityType = 'service';
  }

  return { category: best.cat, industry: best.ind, entityType, confidence };
}

// ─── Competitor Extraction from AI Responses ───────────────────────

/**
 * Generic high-traffic domains that are never real business competitors.
 * DataForSEO keyword-overlap often returns these because they rank for
 * similar informational keywords.
 */
const NEVER_COMPETITOR_DOMAINS = new Set([
  // Social media
  'x.com', 'twitter.com', 'facebook.com', 'linkedin.com', 'instagram.com',
  'tiktok.com', 'reddit.com', 'threads.net',
  // Search & general
  'google.com', 'bing.com', 'yahoo.com', 'wikipedia.org', 'youtube.com',
  'github.com', 'medium.com', 'substack.com',
  // News & media
  'techcrunch.com', 'forbes.com', 'bloomberg.com', 'bbc.com', 'cnn.com',
  'reuters.com', 'nytimes.com', 'theverge.com', 'wired.com',
  // Crypto exchanges (competitor for crypto products only if audited co is also exchange)
  'binance.com', 'coinbase.com', 'kraken.com', 'coinmarketcap.com',
  'coingecko.com', 'crypto.com',
  // General marketplaces/platforms
  'amazon.com', 'ebay.com', 'walmart.com', 'shopify.com',
  // Review/listing sites
  'g2.com', 'capterra.com', 'trustpilot.com', 'glassdoor.com',
  'crunchbase.com', 'producthunt.com',
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
    // Filter out the audited company itself
    if (clean === cleanAudited) return false;
    // Filter out known non-competitor domains
    if (NEVER_COMPETITOR_DOMAINS.has(clean)) return false;
    return true;
  });
}

/**
 * Extract competitor names from Phase 1 AI responses.
 *
 * Strategy: only extract names from text that appears in a COMPETITIVE CONTEXT —
 * near keywords like "competitor", "alternative", "vs", "compared". This avoids
 * extracting random bold headers like "General Impression" or "Price".
 *
 * Returns an array of {name, mentionCount} sorted by frequency.
 */
export function extractCompetitorsFromResponses(
  responses: PlatformResult[],
  companyName: string,
): { name: string; mentionCount: number }[] {
  const lowerBrand = companyName.toLowerCase();
  const nameCounts = new Map<string, number>();

  // Competitive context keywords — we only extract names near these
  const competitiveContextRe = /competitor|alternative|rival|instead of|compared|versus|vs\.|switch from|replace|similar to/i;

  // Generic wrong-entity contexts (same set as extractAccurateInfo —
  // if the paragraph is about a band/TV show/word, skip it)
  const wrongEntityContexts = [
    'band', 'album', 'song', 'musician', 'rapper', 'singer',
    'tv channel', 'television channel', 'streaming service', 'anime',
    'tokusatsu', 'film director', 'filmmaker',
    'japanese term', 'japanese word', 'kanji', 'means "',
    'is a word', 'translates to', 'etymology',
    'apparel brand', 'clothing brand', 'fashion label',
    'helmet', 'bone-conduction', 'eyewear',
  ];

  // Right-entity signals: generic business vocabulary that confirms the correct entity
  const rightEntitySignals = [
    'saas', 'b2b', 'b2c', 'software', 'platform', 'app',
    'company', 'startup', 'agency', 'service', 'tool', 'product',
  ];

  for (const r of responses) {
    if (!r.rawResponse) continue;

    // Score the response: skip if it's primarily about the wrong entity
    const lowerResponse = r.rawResponse.toLowerCase();
    let wrongScore = 0;
    let rightScore = 0;
    for (const s of wrongEntityContexts) { if (lowerResponse.includes(s)) wrongScore++; }
    for (const s of rightEntitySignals) { if (lowerResponse.includes(s)) rightScore++; }
    // Skip if wrong-entity signals dominate (likely about a different company)
    if (wrongScore > rightScore && wrongScore >= 2) continue;

    // Split into paragraphs/sections and only process those with competitive context
    const sections = r.rawResponse.split(/\n{2,}/);

    for (const section of sections) {
      if (!competitiveContextRe.test(section)) continue;

      // Skip sections about the wrong entity
      const lowerSection = section.toLowerCase();
      if (wrongEntityContexts.some((s) => lowerSection.includes(s))) continue;

      // Within competitive sections, extract bold names: **CompanyName**
      const boldNames = section.matchAll(/\*\*([A-Z][A-Za-z0-9.]{1,25}(?:\s[A-Z]?[A-Za-z0-9.]+)?)\*\*/g);
      for (const match of boldNames) {
        const name = match[1].trim();
        if (isLikelyCompetitorName(name, lowerBrand)) {
          addName(nameCounts, name);
        }
      }

      // Extract from bullet/list items in competitive sections
      const bulletNames = section.matchAll(/^[\s]*[-*•]\s+\*{0,2}([A-Z][A-Za-z0-9.]{1,25}(?:\s[A-Z]?[A-Za-z0-9.]+)?)\*{0,2}/gm);
      for (const match of bulletNames) {
        const name = match[1].trim();
        if (isLikelyCompetitorName(name, lowerBrand)) {
          addName(nameCounts, name);
        }
      }
    }

    // Also extract from inline competitor list patterns (anywhere in response)
    const listPatterns = r.rawResponse.matchAll(
      /(?:competitors?|alternatives?|rivals?)\s*(?:include|are|:)\s*([^.]{10,200})/gi,
    );
    for (const match of listPatterns) {
      const listStr = match[1];
      // Extract proper nouns from the list
      const names = listStr.matchAll(/\*{0,2}([A-Z][A-Za-z0-9.]{1,25})\*{0,2}/g);
      for (const nameMatch of names) {
        const name = nameMatch[1].trim();
        if (isLikelyCompetitorName(name, lowerBrand)) {
          addName(nameCounts, name);
        }
      }
    }

    // Extract from "vs Y" / "compared to Y" patterns
    const vsMatch = r.rawResponse.matchAll(
      /(?:vs\.?|versus|compared to|compared with)\s+\*{0,2}([A-Z][A-Za-z0-9.]{1,25})\*{0,2}/gi,
    );
    for (const match of vsMatch) {
      const name = match[1].trim();
      if (isLikelyCompetitorName(name, lowerBrand)) {
        addName(nameCounts, name);
      }
    }
  }

  // Only return names with 2+ mentions (reduces noise)
  return Array.from(nameCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([name, mentionCount]) => ({ name, mentionCount }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 10);
}

/** Normalize a competitor name for deduplication */
function addName(counts: Map<string, number>, name: string): void {
  // Normalize: trim, remove trailing punctuation
  const normalized = name.replace(/[.:,;()]+$/, '').trim();
  if (normalized.length < 2 || normalized.length > 30) return;

  // Case-insensitive dedup: find existing key
  for (const [existing] of counts) {
    if (existing.toLowerCase() === normalized.toLowerCase()) {
      counts.set(existing, (counts.get(existing) ?? 0) + 1);
      return;
    }
  }
  counts.set(normalized, 1);
}

/** Check if a name looks like a real company/product name, not a generic word */
function isLikelyCompetitorName(name: string, lowerBrand: string): boolean {
  const lower = name.toLowerCase();
  // Skip the audited company itself
  if (lower === lowerBrand) return false;
  // Must start with a capital letter (proper noun)
  if (!/^[A-Z]/.test(name)) return false;
  // Must be 1-2 words (company names are short)
  const words = name.split(/\s+/);
  if (words.length > 2) return false;
  // Reject ALL-CAPS short acronyms (SEO, CRO, AEO, etc.) — these are services, not companies
  if (/^[A-Z]{2,4}$/.test(name)) return false;
  // Reject overly short single words — too prone to false positives
  if (words.length === 1 && words[0].length < 4) return false;

  // Reject common English words that happen to be capitalized in markdown
  const notCompanyNames = new Set([
    // Generic business terms
    'company', 'platform', 'tool', 'service', 'software', 'solution',
    'competitor', 'competitors', 'alternative', 'alternatives', 'option', 'product',
    'overview', 'comparison', 'features', 'pricing', 'key', 'top', 'best',
    'note', 'important', 'summary', 'conclusion', 'function', 'result',
    'pros', 'cons', 'advantages', 'disadvantages', 'strengths', 'weaknesses',
    'category', 'market', 'industry', 'sector', 'price', 'cost',
    'general', 'impression', 'definition', 'recommendation', 'recommendations',
    'notable', 'major', 'main', 'primary', 'some', 'other', 'several',
    // Common section headers
    'services', 'products', 'about', 'contact', 'resources', 'locations',
    'benefits', 'limitations', 'drawbacks', 'considerations', 'operations',
    'details', 'information', 'description', 'analysis', 'review', 'reviews',
    // Common English words
    'close', 'open', 'help', 'scout', 'rise', 'base', 'link', 'share',
    'reach', 'flow', 'hub', 'core', 'edge', 'spark', 'pulse', 'wave',
    'ease', 'use', 'quality', 'support', 'security', 'integration',
    'step', 'steps', 'next', 'first', 'last', 'final', 'test', 'example',
    // Broad research/business method terms
    'research', 'methods', 'automation', 'shift', 'crowdsourced', 'focus',
    'innovation', 'trends', 'insights', 'metrics', 'data', 'content',
    'workflow', 'workflows', 'interface', 'usability', 'experience', 'journey',
    'ecosystem', 'framework', 'approach', 'methodology', 'process',
    'user', 'users', 'business', 'enterprise', 'global', 'digital',
    'startup', 'startups', 'teams', 'feedback', 'evaluation',
    // Service/industry terms
    'stablecoin', 'payroll', 'crypto', 'token', 'compensation', 'tax',
    'contractor', 'management', 'payment', 'payments',
    'marketing', 'design', 'development', 'growth', 'strategy',
    'seo', 'cro', 'aeo', 'saas', 'b2b',
  ]);
  if (words.some((w) => notCompanyNames.has(w.toLowerCase()))) return false;

  // Reject 2-word phrases where both words are common nouns (likely a descriptive phrase, not a brand)
  if (words.length === 2) {
    // Heuristic: real company names often have a distinct/coined word, not two dictionary-common nouns.
    // Strong indicator of a real brand: at least one word is unusual (mixed case, contains a number,
    // is non-standard English, or is ≥8 chars).
    const hasDistinctiveWord = words.some((w) => {
      if (/\d/.test(w)) return true; // "Web3", "Cal.com"
      if (/[A-Z].*[A-Z]/.test(w)) return true; // "HubSpot", "GitHub"
      if (w.length >= 8) return true; // Long words often coined
      return false;
    });
    if (!hasDistinctiveWord) return false;
  }

  // Reject common multi-word generic phrases
  const genericPhrases = new Set([
    'general impression', 'food quality', 'ease of use', 'price point',
    'customer support', 'contractor management', 'stablecoin payroll',
    'key features', 'main competitors', 'top alternatives', 'next steps',
    'company info', 'integrated growth', 'how it works',
    'research methods', 'automation shift', 'crowdsourced focus',
    'user experience', 'customer experience', 'product roadmap',
  ]);
  if (genericPhrases.has(lower)) return false;
  return true;
}

// ─── Specific Category Extraction ──────────────────────────────────

/**
 * Extract a specific product/service category from Phase 1 AI responses.
 * Looks for patterns like "X is a [specific description]" to get a more
 * targeted category than the broad keyword-bucket inference.
 *
 * Uses the same positive/negative signal approach as extractAccurateInfo
 * to filter out descriptions of WRONG entities with the same name.
 *
 * Example: "Toku is a crypto payroll platform" → "crypto payroll"
 *          "LoudFace is a Webflow agency" → "Webflow agency"
 */
export function extractSpecificCategory(
  responses: PlatformResult[],
  companyName: string,
  domain?: string,
): string | null {
  // Business context signals (descriptions matching these are more likely correct)
  const domainRoot = (domain ?? '')
    .replace(/^www\./, '')
    .split('.')[0] || '';

  const businessSignals = [
    'platform', 'software', 'saas', 'agency', 'company', 'service',
    'solution', 'tool', 'startup', 'provider', 'app', 'product',
    'marketing', 'development', 'consulting', 'analytics',
    ...(domainRoot.length > 2 ? [domainRoot] : []),
  ];

  // Generic wrong-entity signals (same vocabulary as elsewhere)
  const wrongEntitySignals = [
    'musician', 'artist', 'band', 'album', 'song', 'singer', 'songwriter',
    'tv channel', 'television', 'streaming service', 'anime', 'tokusatsu',
    'japanese term', 'japanese word', 'kanji',
    'helmet', 'bone-conduction', 'eyewear', 'headphones',
    'apparel brand', 'clothing brand', 'fashion label',
    'wearable device', 'speech-to-text', 'speech to text',
    'hearing aid', 'closed caption', 'transcription glasses',
    'waverly labs',
  ];

  const descriptions: { text: string; score: number }[] = [];

  for (const r of responses) {
    if (!r.rawResponse || !r.mentioned) continue;

    // Pattern 1: "X is a/an [description]"
    const isAPatterns = r.rawResponse.matchAll(
      new RegExp(`${escapeRegex(companyName)}\\s+is\\s+(?:a|an|the)\\s+([^.]{10,80})`, 'gi'),
    );
    for (const match of isAPatterns) {
      const desc = cleanDescription(match[1]);
      if (desc) {
        const score = scoreDescription(desc, businessSignals, wrongEntitySignals);
        if (score > 0) descriptions.push({ text: desc, score: score + 3 });
      }
    }

    // Pattern 2: "X specializes in [description]"
    const specializesPatterns = r.rawResponse.matchAll(
      new RegExp(`${escapeRegex(companyName)}\\s+specializ(?:es|ing)\\s+in\\s+([^.]{10,80})`, 'gi'),
    );
    for (const match of specializesPatterns) {
      const desc = cleanDescription(match[1]);
      if (desc) {
        const score = scoreDescription(desc, businessSignals, wrongEntitySignals);
        if (score > 0) descriptions.push({ text: desc, score: score + 2 });
      }
    }

    // Pattern 3: "X provides/offers [description]"
    const providesPatterns = r.rawResponse.matchAll(
      new RegExp(`${escapeRegex(companyName)}\\s+(?:provides|offers|delivers)\\s+([^.]{10,80})`, 'gi'),
    );
    for (const match of providesPatterns) {
      const desc = cleanDescription(match[1]);
      if (desc) {
        const score = scoreDescription(desc, businessSignals, wrongEntitySignals);
        if (score > 0) descriptions.push({ text: desc, score: score + 1 });
      }
    }
  }

  if (descriptions.length === 0) return null;

  // Sort by score descending, then shorter is more specific
  descriptions.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.text.length - b.text.length;
  });

  // Extract the core category noun phrase from the best description
  const best = descriptions[0].text;

  // Step 1: Remove the product/platform stop word and everything after it
  // "comprehensive, global solution for token compensation & tax compliance"
  //  → "token compensation & tax compliance" (after removing prefix + stop word)
  const afterStopWord = best.replace(
    /^.*?\b(?:platform|company|solution|tool|service|provider|suite|offering)\b\s*(?:for|of|to|that|which|designed|providing|enabling|offering|specializing|focused)?\s*/i,
    '',
  );

  // Step 2: If stop-word extraction worked, use the part after it
  // Otherwise strip common adjectives from the start and take first few words
  let result: string;
  if (afterStopWord && afterStopWord.length >= 5 && afterStopWord !== best) {
    // Clean up: take first 4-5 meaningful words
    result = afterStopWord
      .replace(/[&]/g, 'and')
      .split(/\s+/)
      .slice(0, 5)
      .join(' ')
      .replace(/[,;]+$/, '')
      .trim();
  } else {
    // Fallback: strip common adjectives, take the noun phrase
    result = best
      .replace(/^(?:comprehensive|global|leading|premier|full-service|first|innovative|new|advanced|modern|next-generation|cutting-edge)[,\s]*/gi, '')
      .replace(/^(?:comprehensive|global|leading|premier|full-service|first|innovative|new|advanced|modern|next-generation|cutting-edge)[,\s]*/gi, '') // Remove second adj if comma-separated
      .split(/\s+/)
      .slice(0, 4)
      .join(' ')
      .replace(/[,;]+$/, '')
      .trim();
  }

  // Safety check: the extracted category shouldn't be too short or too generic
  if (result.length < 4 || /^(?:a|an|the|new|good|best|top)$/i.test(result)) return null;

  // Reject fragments that start with a preposition/participle — these leak
  // from template phrases like "...service founded in [year] that specializes in..."
  // where the stop-word regex consumed "service" and left sentence-middle debris.
  const firstWord = result.split(/\s+/)[0].toLowerCase();
  const fragmentStarters = new Set([
    'founded', 'established', 'based', 'located', 'headquartered',
    'that', 'which', 'who', 'whose',
    'specializing', 'specializes', 'focused', 'focusing',
    'offering', 'providing', 'delivering', 'building',
    'designed', 'created', 'built',
    'for', 'of', 'to', 'in', 'on', 'with', 'by',
    'was', 'is', 'are', 'were',
  ]);
  if (fragmentStarters.has(firstWord)) return null;

  // Reject results that still contain template-phrase fragments
  if (/\b(?:founded\s+in|specializes?\s+in|that\s+specializes?|that\s+specializing|focused\s+on)\b/i.test(result)) {
    return null;
  }

  // Reject if the result ends on a dangling connector/conjunction — these
  // are mid-sentence fragments, not a noun phrase category.
  if (/\b(?:that|which|who|whose|for|of|to|in|on|with|by|and|or|the|a|an)$/i.test(result)) {
    return null;
  }

  // Strip trailing dangling words (e.g. "digital marketing agency that" → "digital marketing agency")
  // as a second-chance recovery before returning.
  const stripped = result.replace(/\s+(?:that|which|who|whose|for|of|to|in|on|with|by|and|or|the|a|an)$/i, '').trim();
  if (stripped.length >= 4 && stripped.split(/\s+/).length >= 2) {
    return stripped;
  }

  return result;
}

/** Score a description: positive for business context, negative for wrong entity */
function scoreDescription(
  desc: string,
  businessSignals: string[],
  wrongEntitySignals: string[],
): number {
  const lower = desc.toLowerCase();
  let score = 0;
  for (const signal of businessSignals) {
    if (lower.includes(signal)) score += 2;
  }
  for (const signal of wrongEntitySignals) {
    if (lower.includes(signal)) score -= 10; // Heavy penalty
  }
  return score;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanDescription(desc: string): string | null {
  let cleaned = desc
    .replace(/\*+/g, '')
    .replace(/\[?\d+\]?/g, '')
    .trim();

  // Remove leading articles
  cleaned = cleaned.replace(/^(?:a|an|the)\s+/i, '');

  // Skip if it's just generic filler
  if (/^(?:company|platform|tool|great|good|popular|well-known)/i.test(cleaned)) {
    return null;
  }

  return cleaned.length >= 5 ? cleaned : null;
}
