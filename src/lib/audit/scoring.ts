import type {
  AuditResults,
  AuditScores,
  OverallGrade,
  TrafficLight,
  PlatformBreakdown,
  PlatformResult,
  PlatformScore,
  Sentiment,
  ActionItem,
  AIPlatform,
  BrandBaselineData,
  CompetitorContextData,
  CategoryVisibilityData,
} from './types';

const ALL_PLATFORMS: AIPlatform[] = ['chatgpt', 'claude', 'gemini', 'perplexity'];

// ─── Score Calculation ──────────────────────────────────────────────

export function calculateScores(
  brandBaseline: BrandBaselineData,
  competitorContext: CompetitorContextData,
  categoryVisibility: CategoryVisibilityData,
): AuditScores {
  // Discovery Visibility: % of category queries where brand appears (Phase 3).
  const totalCatResults = categoryVisibility.queries.flatMap((q) => q.results);
  const catMentions = totalCatResults.filter((r) => r.mentioned).length;
  const discoveryVisibility = totalCatResults.length > 0
    ? Math.round((catMentions / totalCatResults.length) * 100)
    : 0;

  // Share of Voice uses the SAME Phase 3 (unbranded category) responses that
  // drive Discovery Visibility. This is the only place where brand + all
  // competitors can be measured against identical prompts, so it's the only
  // apples-to-apples SoV we have. The brand's SoV is its share of all entity
  // mentions (brand + competitors) across Phase 3 responses — not just a raw
  // mention rate — so it reflects competitive pressure.
  const competitorSoVMap = competitorContext.shareOfVoiceByCompetitor;
  const totalCompetitorSoV = Object.values(competitorSoVMap).reduce((s, n) => s + n, 0);
  const brandMentionRatePhase3 = discoveryVisibility; // same denominator
  const shareOfVoice = totalCompetitorSoV + brandMentionRatePhase3 > 0
    ? Math.round((brandMentionRatePhase3 / (totalCompetitorSoV + brandMentionRatePhase3)) * 100)
    : 0;

  // Competitive Standing: rank brand vs competitors using Phase 3 rates.
  let competitiveStanding = 1;
  for (const rate of Object.values(competitorSoVMap)) {
    if (rate > brandMentionRatePhase3) competitiveStanding++;
  }

  // Platform Coverage: how many platforms mention the brand in Phase 1
  const platformsMentioning = new Set<string>();
  for (const query of brandBaseline.queries) {
    for (const result of query.results) {
      if (result.mentioned) platformsMentioning.add(result.platform);
    }
  }
  const platformCoverage = platformsMentioning.size;

  const overallGrade = calculateGrade(discoveryVisibility, shareOfVoice);

  return {
    discoveryVisibility,
    shareOfVoice,
    competitiveStanding,
    competitorsTracked: competitorContext.competitors.length,
    platformCoverage,
    overallGrade,
  };
}

/**
 * Grade thresholds are calibrated to real-world AI visibility distributions.
 * Category leaders often hit 40-60% Phase-3 visibility and 30-40% SoV.
 * Niche/emerging brands typically land at 5-20% visibility, 5-15% SoV.
 * The old thresholds (A: 70/40) were unreachable — almost nothing graded above D.
 */
function calculateGrade(visibility: number, sov: number): OverallGrade {
  if (visibility >= 55 && sov >= 30) return 'A';
  if (visibility >= 35 && sov >= 18) return 'B';
  if (visibility >= 18 && sov >= 8) return 'C';
  if (visibility >= 5 || sov >= 3) return 'D';
  return 'F';
}

// ─── Traffic Light ──────────────────────────────────────────────────

export function getTrafficLight(score: number): TrafficLight {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

// ─── Platform Breakdown ─────────────────────────────────────────────

export function calculatePlatformBreakdown(
  allResults: PlatformResult[],
  brandDomain: string = '',
): PlatformBreakdown {
  const breakdown = {} as PlatformBreakdown;
  const cleanBrandDomain = brandDomain.replace(/^www\./, '').toLowerCase();

  for (const platform of ALL_PLATFORMS) {
    const platformResults = allResults.filter((r) => r.platform === platform);
    breakdown[platform] = calculatePlatformScore(platformResults, cleanBrandDomain);
  }

  return breakdown;
}

/**
 * Normalize a URL to a registrable domain (strip scheme, www, and subdomains
 * for common one-level TLDs). We use a simple heuristic rather than a PSL
 * dependency — for citation aggregation this is good enough.
 */
function normalizeCitationDomain(raw: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function calculatePlatformScore(
  results: PlatformResult[],
  brandDomain: string,
): PlatformScore {
  if (results.length === 0) {
    return { mentionRate: 0, citationRate: 0, sentiment: 'neutral', topMentions: [] };
  }

  const mentions = results.filter((r) => r.mentioned).length;
  const citations = results.filter((r) => r.cited).length;
  const mentionRate = Math.round((mentions / results.length) * 100);
  const citationRate = Math.round((citations / results.length) * 100);

  const sentimentCounts: Record<Sentiment, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  for (const r of results) {
    sentimentCounts[r.sentiment]++;
  }

  const dominantSentiment = (
    Object.entries(sentimentCounts) as [Sentiment, number][]
  ).sort(([, a], [, b]) => b - a)[0][0];

  const topMentions = results
    .filter((r) => r.mentioned && r.snippet)
    .slice(0, 3)
    .map((r) => r.snippet);

  // Aggregate cited domains across all this platform's responses.
  // Multiple annotations from the same domain in one response still count once
  // so we measure breadth of sources, not raw link count.
  const domainCountMap = new Map<string, number>();
  for (const r of results) {
    const seen = new Set<string>();
    for (const s of r.sources) {
      const d = normalizeCitationDomain(s.url);
      if (!d || seen.has(d)) continue;
      seen.add(d);
      domainCountMap.set(d, (domainCountMap.get(d) ?? 0) + 1);
    }
  }

  const topCitedDomains = Array.from(domainCountMap.entries())
    .map(([domain, count]) => ({
      domain,
      count,
      isOwn: brandDomain !== '' && domain.includes(brandDomain),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const insight = buildPlatformInsight({
    mentionRate,
    citationRate,
    topCitedDomains,
    sentiment: dominantSentiment,
    sampleSize: results.length,
  });

  return {
    mentionRate,
    citationRate,
    sentiment: dominantSentiment,
    topMentions,
    insight,
    topCitedDomains,
  };
}

/**
 * Produce a one-sentence diagnosis for this platform's coverage. The sentence
 * names the behavior the reader should act on — not just the numbers.
 */
function buildPlatformInsight(args: {
  mentionRate: number;
  citationRate: number;
  topCitedDomains: Array<{ domain: string; count: number; isOwn: boolean }>;
  sentiment: Sentiment;
  sampleSize: number;
}): string {
  const { mentionRate, citationRate, topCitedDomains, sentiment, sampleSize } = args;
  if (sampleSize === 0) return 'No responses returned for this platform.';

  const ownCited = topCitedDomains.some((d) => d.isOwn);
  const topThird = topCitedDomains.slice(0, 3).map((d) => d.domain);

  if (mentionRate === 0) {
    return 'Does not recognize your brand in any branded query — no coverage to work with.';
  }

  if (mentionRate < 25) {
    return topThird.length
      ? `Barely recognizes you. When it answers, it leans on ${topThird.join(', ')} — target those sources to enter the conversation.`
      : 'Barely recognizes you, with no consistent source domains cited.';
  }

  if (mentionRate < 60) {
    if (ownCited && citationRate > 40) {
      return 'Recognizes you and cites your own site — the fundamentals are in place but coverage is uneven.';
    }
    return topThird.length
      ? `Partial recognition. Cites ${topThird.join(', ')} over your own site — your pages are not the canonical source yet.`
      : 'Partial recognition with no clear source pattern — inconsistent pickup across queries.';
  }

  // mentionRate >= 60
  if (ownCited && citationRate >= 50) {
    return sentiment === 'negative'
      ? 'Strong recognition and cites your site, but the framing skews critical — review snippets and address the negative narrative.'
      : 'Strong recognition and cites your own site directly — this platform is working for you.';
  }
  return topThird.length
    ? `Recognizes you consistently but cites ${topThird.join(', ')} instead of your site — own the narrative with your own pages.`
    : 'Recognizes you consistently but does not cite your site — build content that answers these queries directly.';
}

// ─── Action Items ───────────────────────────────────────────────────

export function generateActionItems(
  scores: AuditScores,
  brandBaseline: BrandBaselineData,
  competitorContext: CompetitorContextData,
  categoryVisibility: CategoryVisibilityData,
): ActionItem[] {
  const items: ActionItem[] = [];
  const categoryLabel = categoryVisibility.inferredCategory || 'your category';

  // ─── High-priority: specific, data-driven ──────────────────────────

  // Inaccuracies — quote the specific claim AI is getting wrong.
  if (brandBaseline.inaccuracies.length > 0) {
    const firstInaccuracy = truncate(brandBaseline.inaccuracies[0], 140);
    items.push({
      priority: 'high',
      title: 'Correct the biggest factual error',
      description: `AI platforms are saying: "${firstInaccuracy}" Fix the canonical page on your site (About, homepage, or the relevant product page) and add Organization / Product schema so models re-learn from authoritative markup.`,
      linkedService: '/services/seo-aeo',
    });
  }

  // Platform coverage gap — name the silent platforms.
  if (scores.platformCoverage < 3) {
    const silent = identifySilentPlatforms(brandBaseline);
    const silentList = silent.length ? silent.join(', ') : 'most platforms';
    items.push({
      priority: 'high',
      title: `Get into ${silentList}`,
      description: `${silentList} ${silent.length === 1 ? 'does not recognize' : 'do not recognize'} your brand at all. The fastest path in is earning mentions on the sources those platforms cite: Reddit, review sites, industry editorial, and authoritative directories.`,
      linkedService: '/services/seo-aeo',
    });
  }

  // Knowledge gap — quote the biggest gap, not a generic "fill gaps".
  if (brandBaseline.gaps.length > 0) {
    const firstGap = truncate(brandBaseline.gaps[0], 140);
    items.push({
      priority: 'high',
      title: 'Fix the most visible knowledge gap',
      description: `AI is missing: "${firstGap}" Publish a dedicated page on your site answering this directly (headline = question, first paragraph = direct answer, schema-marked up), then earn links to it.`,
      linkedService: '/services/copywriting',
    });
  }

  // Not cited — AI mentions you but doesn't cite you.
  const branded = brandBaseline.queries.flatMap((q) => q.results);
  const mentionedCount = branded.filter((r) => r.mentioned).length;
  const citedCount = branded.filter((r) => r.cited).length;
  const uncitedCount = mentionedCount - citedCount;
  if (mentionedCount > 0 && uncitedCount / mentionedCount > 0.5) {
    items.push({
      priority: 'high',
      title: 'Become your own primary source',
      description: `AI mentions you in ${mentionedCount} responses but only cites your site in ${citedCount} of them. You are not the canonical source on your own brand. Audit which pages AI could cite (about, pricing, products, case studies) and make them the authoritative answer — clear H1s, schema markup, inline facts AI can quote.`,
      linkedService: '/services/seo-aeo',
    });
  }

  // ─── Medium-priority: competitive and category ─────────────────────

  if (scores.discoveryVisibility < 40) {
    const topCompetitor = competitorContext.competitors[0];
    const competitorHint = topCompetitor
      ? ` ${topCompetitor.name} is winning most of these queries — study which pages AI cites for them and match their depth.`
      : '';
    items.push({
      priority: 'medium',
      title: `Show up for "best ${categoryLabel}" searches`,
      description: `You appear in only ${scores.discoveryVisibility}% of unbranded category queries. Publish a definitive "Best ${categoryLabel} in 2026" page on your site and a comparison vs your top competitors.${competitorHint}`,
      linkedService: '/services/seo-aeo',
    });
  }

  if (scores.shareOfVoice < 25) {
    const topRival = competitorContext.competitors[0]?.name;
    items.push({
      priority: 'medium',
      title: 'Close the share-of-voice gap',
      description: topRival
        ? `Your share of voice is ${scores.shareOfVoice}%. Build a "Why [your brand] over ${topRival}" comparison page and earn coverage on the review sites AI is already citing for ${topRival}.`
        : `Your share of voice is ${scores.shareOfVoice}% — AI favors your competitors when users ask generic category questions. Build comparison pages and earn review-site coverage.`,
      linkedService: '/services/copywriting',
    });
  }

  // ─── Contextual catch-all ──────────────────────────────────────────

  if (scores.overallGrade === 'F' && items.length === 0) {
    items.push({
      priority: 'high',
      title: 'Build AI visibility from scratch',
      description:
        'Your brand has no meaningful AI presence yet. Start with a comprehensive content + structured-data foundation: a canonical about page, a pricing page, case studies with schema, and strong Organization markup. Earning editorial mentions comes next.',
      linkedService: '/services/growth-autopilot',
    });
  }

  return items.slice(0, 6); // Max 6 action items
}

function truncate(s: string, max: number): string {
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max).replace(/\s+\S*$/, '');
  return cut + '…';
}

function identifySilentPlatforms(brandBaseline: BrandBaselineData): string[] {
  const displayNames: Record<AIPlatform, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    perplexity: 'Perplexity',
  };
  const mentionedSet = new Set<AIPlatform>();
  for (const query of brandBaseline.queries) {
    for (const result of query.results) {
      if (result.mentioned) mentionedSet.add(result.platform);
    }
  }
  return ALL_PLATFORMS
    .filter((p) => !mentionedSet.has(p))
    .map((p) => displayNames[p]);
}
