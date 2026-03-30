import type {
  AIPlatform,
  DFSLLMResponseResult,
  PlatformResult,
  Sentiment,
  SourceCitation,
} from './types';

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

  const lowerText = fullText.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  const lowerDomain = brandDomain.toLowerCase().replace(/^www\./, '');

  // Check for brand mention
  const mentioned = lowerText.includes(lowerBrand) || lowerText.includes(lowerDomain);

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
 * Extract a relevant snippet around the brand mention.
 */
function extractSnippet(text: string, brandName: string): string {
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  const idx = lowerText.indexOf(lowerBrand);

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
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  // Only analyze text near brand mentions
  const idx = lowerText.indexOf(lowerBrand);
  if (idx === -1) return 'neutral';

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
  const lowerBrand = brandName.toLowerCase();

  // Context signals that indicate the sentence is about the CORRECT entity.
  // Built from domain keywords + industry + common business descriptors.
  const domainWords = (domain ?? '')
    .replace(/^www\./, '')
    .replace(/\.(com|io|co|net|org|ai|app|dev)$/, '')
    .split(/[-_.]/)
    .filter((w) => w.length > 2);

  const positiveSignals = [
    // Business context
    'agency', 'company', 'startup', 'founded', 'team', 'clients',
    'services', 'software', 'saas', 'b2b',
    // Common SaaS/agency terms
    'webflow', 'seo', 'aeo', 'cro', 'marketing', 'website', 'web design',
    'conversion', 'organic growth', 'digital', 'development',
    // Industry terms (strongest signal for correct entity)
    ...(industry ? industry.toLowerCase().split(/\s+/).map(() => industry!.toLowerCase()) : []),
    ...domainWords.map((w) => w.toLowerCase()),
  ];

  // Signals that the sentence is about a DIFFERENT entity with the same name
  const negativeSignals = [
    // Hardware/products that aren't the company
    'helmet', 'biker', 'bone-conduction', 'glasses', 'eyewear', 'headphones',
    'speaker', 'audio device', 'wearable',
    // Music/entertainment
    'band', 'album', 'song', 'gig', 'music', 'musician', 'recording artist',
    'wisconsin', 'racine',
    // Apparel (common for brand name conflicts)
    'apparel', 'clothing', 'fashion', 'streetwear', 'merch',
    // Sound studio
    'sound design', 'music composition',
    // Different company with same name (CX/comms platforms, TV channels, etc.)
    'customer experience platform', 'cx platform', 'customer engagement platform',
    'cloud communications', 'enterprise communications', 'contact center',
    'call center', 'telephony', 'pbx', 'voip',
    'tv channel', 'television channel', 'streaming service', 'anime channel',
    'tokusatsu', 'live-action', 'kanji', 'japanese term',
    'accounts receivable automation', 'payment collections',
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
        // Skip questions
        if (s.endsWith('?')) return false;
        // Skip sentences that are just labels/headers (no verb)
        if (s.endsWith(':')) return false;
        // Skip meta-commentary ("Based on my search results...")
        if (s.startsWith('Based on my search') || s.startsWith('I ')) return false;
        if (s.startsWith('Could you') || s.startsWith('It appears')) return false;
        // Must mention the brand
        if (!s.toLowerCase().includes(lowerBrand)) return false;
        return true;
      });

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();

      // Score: positive for relevance, negative for wrong-entity signals
      let score = 0;

      for (const signal of positiveSignals) {
        if (lower.includes(signal)) score += 2;
      }
      for (const signal of negativeSignals) {
        if (lower.includes(signal)) score -= 5; // Heavy penalty for wrong entity
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
  fallbackIndustry?: string,
): { category: string; industry: string; entityType: 'product' | 'service' } {
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
    const category = fallbackIndustry?.toLowerCase() || 'software';
    return { category, industry: fallbackIndustry || 'technology', entityType: 'product' };
  }

  // Step 1: Determine entity type (service/agency vs product/software)
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
  for (const s of serviceSignals) {
    if (allText.includes(s)) serviceScore++;
  }
  for (const s of productSignals) {
    if (allText.includes(s)) productScore++;
  }
  let entityType: 'product' | 'service' = serviceScore > productScore ? 'service' : 'product';

  // Step 2: Determine category using keyword scoring (most specific wins)
  const categoryDefs = [
    // Service categories
    { keywords: ['webflow', 'web design', 'web development', 'website design', 'website development'], cat: 'web design agency', ind: 'Professional Services', forType: 'service' as const, weight: 3 },
    { keywords: ['seo', 'search engine optimization', 'aeo', 'cro', 'conversion rate', 'organic growth'], cat: 'SEO & growth agency', ind: 'Professional Services', forType: 'service' as const, weight: 3 },
    { keywords: ['branding', 'brand identity', 'creative agency', 'design agency'], cat: 'design agency', ind: 'Professional Services', forType: 'service' as const, weight: 2 },
    { keywords: ['marketing agency', 'digital marketing', 'advertising agency', 'media agency'], cat: 'marketing agency', ind: 'Professional Services', forType: 'service' as const, weight: 2 },
    { keywords: ['consulting', 'management consulting', 'strategy consulting'], cat: 'consulting', ind: 'Professional Services', forType: 'service' as const, weight: 2 },
    // Product categories
    { keywords: ['crm', 'customer relationship'], cat: 'CRM', ind: 'SaaS', forType: 'product' as const, weight: 3 },
    { keywords: ['project management', 'task management', 'workflow'], cat: 'project management', ind: 'SaaS', forType: 'product' as const, weight: 3 },
    { keywords: ['e-commerce', 'ecommerce', 'online store', 'online shop'], cat: 'e-commerce', ind: 'E-commerce', forType: 'product' as const, weight: 3 },
    { keywords: ['analytics', 'data analysis', 'business intelligence'], cat: 'analytics', ind: 'SaaS', forType: 'product' as const, weight: 2 },
    { keywords: ['fintech', 'financial', 'banking', 'payment', 'payments'], cat: 'fintech', ind: 'Fintech', forType: 'product' as const, weight: 2 },
    { keywords: ['healthcare', 'health', 'medical', 'clinical'], cat: 'healthcare', ind: 'Healthcare', forType: 'product' as const, weight: 2 },
    { keywords: ['education', 'learning', 'edtech', 'lms'], cat: 'education', ind: 'Education', forType: 'product' as const, weight: 2 },
    { keywords: ['real estate', 'property', 'proptech'], cat: 'real estate', ind: 'Real Estate', forType: 'product' as const, weight: 2 },
    { keywords: ['legal', 'law firm', 'legaltech'], cat: 'legal', ind: 'Legal', forType: 'product' as const, weight: 2 },
    { keywords: ['hr', 'human resources', 'recruiting', 'talent'], cat: 'HR', ind: 'SaaS', forType: 'product' as const, weight: 2 },
    { keywords: ['cybersecurity', 'security', 'infosec'], cat: 'cybersecurity', ind: 'Technology', forType: 'product' as const, weight: 2 },
    { keywords: ['artificial intelligence', 'machine learning', 'ai-powered'], cat: 'AI', ind: 'Technology', forType: 'product' as const, weight: 2 },
    { keywords: ['saas', 'software as a service', 'cloud'], cat: 'SaaS', ind: 'SaaS', forType: 'product' as const, weight: 1 },
    { keywords: ['marketing', 'advertising'], cat: 'marketing', ind: 'Marketing', forType: 'product' as const, weight: 1 },
    { keywords: ['design', 'creative'], cat: 'design', ind: 'Design', forType: 'product' as const, weight: 1 },
  ];

  let bestCategory = { cat: 'software', ind: fallbackIndustry || 'technology', score: 0 };

  for (const def of categoryDefs) {
    let score = 0;
    for (const kw of def.keywords) {
      if (allText.includes(kw)) score += def.weight;
    }
    // Boost categories that match the detected entity type
    if (def.forType === entityType) score += 1;

    if (score > bestCategory.score) {
      bestCategory = { cat: def.cat, ind: def.ind, score };
    }
  }

  // Use the fallback industry as category if nothing scored
  if (bestCategory.score === 0 && fallbackIndustry) {
    bestCategory.cat = fallbackIndustry.toLowerCase();
    bestCategory.ind = fallbackIndustry;
  }

  // Override: if the category name itself signals a service, force the entity type
  const serviceCategoryKeywords = ['agency', 'consulting', 'firm', 'studio', 'services'];
  if (serviceCategoryKeywords.some((kw) => bestCategory.cat.toLowerCase().includes(kw))) {
    entityType = 'service';
  }

  return { category: bestCategory.cat, industry: bestCategory.ind, entityType };
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
  industry?: string,
): { name: string; mentionCount: number }[] {
  const lowerBrand = companyName.toLowerCase();
  const nameCounts = new Map<string, number>();

  // Competitive context keywords — we only extract names near these
  const competitiveContextRe = /competitor|alternative|rival|instead of|compared|versus|vs\.|switch from|replace|similar to/i;

  // Wrong-entity signals: sections mentioning these are about a different entity
  const wrongEntitySignals = [
    'communications platform', 'cx platform', 'customer experience platform',
    'customer engagement platform', 'cloud communications', 'enterprise communications',
    'contact center', 'call center', 'telephony', 'pbx', 'voip',
    'tv channel', 'television channel', 'streaming service',
    'tokusatsu', 'live-action', 'kanji', 'virtue',
    'helmet', 'biker', 'bone-conduction', 'glasses', 'eyewear',
    'apparel', 'clothing', 'fashion', 'streetwear',
    'music composition', 'sound design', 'recording artist',
  ];

  // Right-entity signals: industry-related terms that confirm the correct entity
  const rightEntitySignals = [
    ...(industry ? industry.toLowerCase().split(/\s+/) : []),
    'payroll', 'compensation', 'compliance', 'token', 'crypto',
    'saas', 'b2b', 'software', 'platform',
  ];

  for (const r of responses) {
    if (!r.rawResponse) continue;

    // Score the response: skip if it's primarily about the wrong entity
    const lowerResponse = r.rawResponse.toLowerCase();
    let wrongScore = 0;
    let rightScore = 0;
    for (const s of wrongEntitySignals) { if (lowerResponse.includes(s)) wrongScore++; }
    for (const s of rightEntitySignals) { if (lowerResponse.includes(s)) rightScore++; }
    // Skip if wrong-entity signals dominate (likely about a different company)
    if (wrongScore > rightScore && wrongScore >= 2) continue;

    // Split into paragraphs/sections and only process those with competitive context
    const sections = r.rawResponse.split(/\n{2,}/);

    for (const section of sections) {
      if (!competitiveContextRe.test(section)) continue;

      // Skip sections about the wrong entity
      const lowerSection = section.toLowerCase();
      if (wrongEntitySignals.some((s) => lowerSection.includes(s))) continue;

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
  // Reject common English words that happen to be capitalized in markdown
  // This is a comprehensive list to prevent false positives
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
    // Common English words often capitalized
    'close', 'open', 'help', 'scout', 'rise', 'base', 'link', 'share',
    'reach', 'flow', 'hub', 'core', 'edge', 'spark', 'pulse', 'wave',
    'ease', 'use', 'quality', 'support', 'security', 'integration',
    'step', 'steps', 'next', 'first', 'last', 'final',
    // Service/industry terms (not company names)
    'stablecoin', 'payroll', 'crypto', 'token', 'compensation', 'tax',
    'contractor', 'management', 'payment', 'payments', 'global',
    'marketing', 'design', 'development', 'growth', 'strategy',
    'seo', 'cro', 'aeo', 'saas', 'b2b',
  ]);
  if (words.some((w) => notCompanyNames.has(w.toLowerCase()))) return false;
  // Reject multi-word generic phrases
  const genericPhrases = new Set([
    'general impression', 'food quality', 'ease of use', 'price point',
    'customer support', 'contractor management', 'stablecoin payroll',
    'key features', 'main competitors', 'top alternatives', 'next steps',
    'company info', 'integrated growth', 'how it works',
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
  industry?: string,
): string | null {
  // Business context signals (descriptions matching these are more likely correct)
  const businessSignals = [
    'platform', 'software', 'saas', 'agency', 'company', 'service',
    'solution', 'tool', 'startup', 'provider', 'payroll', 'compliance',
    'marketing', 'development', 'consulting', 'analytics',
    ...(industry ? industry.toLowerCase().split(/\s+/) : []),
  ];

  // Wrong-entity signals (descriptions matching these are about a different entity)
  const wrongEntitySignals = [
    'musician', 'artist', 'band', 'album', 'song', 'singer',
    'tv channel', 'television', 'streaming', 'anime', 'tokusatsu',
    'japanese term', 'japanese word', 'kanji', 'virtue',
    'helmet', 'biker', 'glasses', 'eyewear', 'headphones',
    'apparel', 'clothing', 'fashion',
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
