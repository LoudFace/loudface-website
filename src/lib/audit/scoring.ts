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
  // Discovery Visibility: % of category queries where brand appears
  const totalCatResults = categoryVisibility.queries.flatMap((q) => q.results);
  const catMentions = totalCatResults.filter((r) => r.mentioned).length;
  const discoveryVisibility = totalCatResults.length > 0
    ? Math.round((catMentions / totalCatResults.length) * 100)
    : 0;

  // Share of Voice: brand mentions across competitor queries vs total mentions
  const allCompResults = competitorContext.queries.flatMap((q) => q.results);
  const brandInComp = allCompResults.filter((r) => r.mentioned).length;
  const totalCompResponses = allCompResults.length;
  const shareOfVoice = totalCompResponses > 0
    ? Math.round((brandInComp / totalCompResponses) * 100)
    : 0;

  // Competitive Standing: rank among competitors by recommendation rate
  const competitorMentions = Object.entries(
    competitorContext.shareOfVoiceByCompetitor,
  ).sort(([, a], [, b]) => b - a);

  // Find brand's rank (brand itself won't be in competitor list, so compare by shareOfVoice)
  let competitiveStanding = 1;
  for (const [, rate] of competitorMentions) {
    if (rate > shareOfVoice) competitiveStanding++;
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

function calculateGrade(visibility: number, sov: number): OverallGrade {
  if (visibility >= 70 && sov >= 40) return 'A';
  if (visibility >= 50 && sov >= 25) return 'B';
  if (visibility >= 30 && sov >= 15) return 'C';
  if (visibility >= 15) return 'D';
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
): PlatformBreakdown {
  const breakdown = {} as PlatformBreakdown;

  for (const platform of ALL_PLATFORMS) {
    const platformResults = allResults.filter((r) => r.platform === platform);
    breakdown[platform] = calculatePlatformScore(platformResults);
  }

  return breakdown;
}

function calculatePlatformScore(results: PlatformResult[]): PlatformScore {
  if (results.length === 0) {
    return { mentionRate: 0, citationRate: 0, sentiment: 'neutral', topMentions: [] };
  }

  const mentions = results.filter((r) => r.mentioned).length;
  const citations = results.filter((r) => r.cited).length;

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

  return {
    mentionRate: Math.round((mentions / results.length) * 100),
    citationRate: Math.round((citations / results.length) * 100),
    sentiment: dominantSentiment,
    topMentions,
  };
}

// ─── Action Items ───────────────────────────────────────────────────

export function generateActionItems(
  scores: AuditScores,
  brandBaseline: BrandBaselineData,
  competitorContext: CompetitorContextData,
  categoryVisibility: CategoryVisibilityData,
): ActionItem[] {
  const items: ActionItem[] = [];

  // Fix inaccuracies first (high priority)
  if (brandBaseline.inaccuracies.length > 0) {
    items.push({
      priority: 'high',
      title: 'Correct Inaccurate AI Information',
      description:
        'AI platforms are surfacing incorrect information about your brand. Update your website content, structured data, and key landing pages to ensure AI models have accurate source material to reference.',
      linkedService: '/services/seo-aeo',
    });
  }

  // Improve source visibility
  if (scores.platformCoverage < 3) {
    items.push({
      priority: 'high',
      title: 'Increase Platform Coverage',
      description: `Your brand is only recognized by ${scores.platformCoverage} of 4 major AI platforms. Build presence through authoritative content, PR mentions, and directory listings that AI models use as training data.`,
      linkedService: '/services/seo-aeo',
    });
  }

  // Content gaps
  if (brandBaseline.gaps.length > 0) {
    items.push({
      priority: 'high',
      title: 'Fill Knowledge Gaps',
      description:
        'AI platforms are missing key information about your brand. Create comprehensive, well-structured content covering your products, pricing, use cases, and differentiators.',
      linkedService: '/services/copywriting',
    });
  }

  // Low category visibility
  if (scores.discoveryVisibility < 40) {
    items.push({
      priority: 'medium',
      title: 'Improve Category Visibility',
      description: `When users search for solutions in your category, you appear in only ${scores.discoveryVisibility}% of AI responses. Create definitive category content and comparisons to establish authority.`,
      linkedService: '/services/seo-aeo',
    });
  }

  // Low share of voice
  if (scores.shareOfVoice < 25) {
    items.push({
      priority: 'medium',
      title: 'Boost Competitive Share of Voice',
      description: `Your brand appears in only ${scores.shareOfVoice}% of competitive queries. Build comparison pages, earn review site mentions, and create differentiation content.`,
      linkedService: '/services/copywriting',
    });
  }

  // Website not cited
  const uncitedCount = brandBaseline.queries
    .flatMap((q) => q.results)
    .filter((r) => r.mentioned && !r.cited).length;
  if (uncitedCount > 5) {
    items.push({
      priority: 'medium',
      title: 'Improve Source Attribution',
      description:
        'AI platforms mention your brand but rarely cite your website directly. Optimize your site structure, add schema markup, and build authoritative backlinks to become a primary source.',
      linkedService: '/services/seo-aeo',
    });
  }

  // If everything is bad
  if (scores.overallGrade === 'F') {
    items.push({
      priority: 'high',
      title: 'Build AI Visibility From Scratch',
      description:
        'Your brand has minimal AI visibility. This requires a comprehensive strategy: content creation, technical SEO, authority building, and structured data implementation.',
      linkedService: '/services/growth-autopilot',
    });
  }

  return items.slice(0, 6); // Max 6 action items
}
