// ─── Brand Baseline Queries (Phase 1) ───────────────────────────────

export function getBrandQueries(company: string): string[] {
  // 6 queries × 4 platforms = 24 calls. Trimmed from 10 — "Tell me about X"
  // and "What does X do" duplicated "What is X"; "Should I consider X" and
  // "X features and capabilities" duplicated "Is X any good" / "pricing and
  // plans". The remaining six cover the distinct jobs: identity, reputation,
  // quality judgement, pricing, competitive framing, and customer fit.
  return [
    `What is ${company}?`,
    `${company} reviews and reputation`,
    `Is ${company} any good?`,
    `${company} pricing and plans`,
    `${company} vs competitors`,
    `Who uses ${company}?`,
  ];
}

// ─── Competitor Context Queries (Phase 2) ───────────────────────────

export function getCompetitorQueries(
  competitor: string,
  category: string,
  entityType: 'product' | 'service' | 'brand' = 'product',
): string[] {
  if (entityType === 'service') {
    return [
      `Best alternatives to ${competitor}`,
      `What should I use instead of ${competitor}?`,
      `${competitor} vs other ${category} providers`,
      `Compare ${category} agencies like ${competitor}`,
      `Is there a better ${category} than ${competitor}?`,
    ];
  }
  if (entityType === 'brand') {
    return [
      `Best alternatives to ${competitor}`,
      `What should I buy instead of ${competitor}?`,
      `${competitor} vs other ${category} brands`,
      `Brands similar to ${competitor}`,
      `Is there a better ${category} than ${competitor}?`,
    ];
  }
  return [
    `Best alternatives to ${competitor}`,
    `What should I use instead of ${competitor}?`,
    `${competitor} vs other ${category} tools`,
    `Compare ${competitor} options in ${category}`,
    `Is there a better option than ${competitor} for ${category}?`,
  ];
}

// ─── Category Visibility Queries (Phase 3) ──────────────────────────

export function getCategoryQueries(
  category: string,
  industry: string,
  entityType: 'product' | 'service' | 'brand' = 'product',
): string[] {
  // Avoid "for agency" style duplication when the industry word already appears in the category.
  const catLower = category.toLowerCase();
  const industryNeeded = industry && !catLower.includes(industry.toLowerCase());

  // 5 queries per entity type × 4 platforms = 20 calls. Trimmed from 8 —
  // the dropped queries were lower-intent ("how do I pick", "enterprise X
  // with compliance") that rarely returned brand mentions. What remains is
  // the shortlisting + buyer-persona variety, which drives most of the
  // useful discovery signal.
  if (entityType === 'service') {
    return [
      `Best ${category} for B2B SaaS companies`,
      `Top ${category} providers in 2026`,
      `Which ${category} should I hire?`,
      industryNeeded
        ? `Recommended ${category} for ${industry} clients`
        : `Recommended ${category} for growing businesses`,
      `Best ${category} for startups with a limited budget`,
    ];
  }
  if (entityType === 'brand') {
    // Ecommerce / consumer brands / marketplaces — no "software/tools/platforms" wording.
    // When the category already ends in a noun like "brand", "box", "retailer", or "store",
    // we drop the trailing "brands"/"stores" to avoid reading "brand brands" / "box brands".
    const trailsInBrandNoun = /\b(brand|brands|box|boxes|retailer|retailers|store|stores|shop|shops|marketplace|marketplaces)$/i.test(catLower.trim());
    const sustainabilityQuery = trailsInBrandNoun
      ? `Most sustainable ${category} in 2026`
      : `Most sustainable ${category} brands in 2026`;

    return [
      `Best ${category} in 2026`,
      `Top ${category} to buy right now`,
      industryNeeded
        ? `Recommended ${category} for ${industry} shoppers`
        : `Recommended ${category} for everyday use`,
      `Premium ${category} worth the money`,
      sustainabilityQuery,
    ];
  }
  return [
    `Best ${category} software in 2026`,
    industryNeeded ? `Top ${category} tools for ${industry}` : `Top ${category} tools`,
    `What ${category} solution should I use?`,
    `Recommended ${category} platforms for businesses`,
    `Best ${category} for early-stage startups`,
  ];
}
