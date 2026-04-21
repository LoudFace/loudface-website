// ─── Brand Baseline Queries (Phase 1) ───────────────────────────────

export function getBrandQueries(company: string): string[] {
  return [
    `What is ${company}?`,
    `Tell me about ${company}`,
    `${company} reviews and reputation`,
    `Is ${company} any good?`,
    `${company} pricing and plans`,
    `What does ${company} do?`,
    `${company} vs competitors`,
    `Who uses ${company}?`,
    `${company} features and capabilities`,
    `Should I consider ${company}?`,
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

  if (entityType === 'service') {
    return [
      // Evaluation / shortlisting
      `Best ${category} for B2B SaaS companies`,
      `Top ${category} providers in 2026`,
      `Which ${category} should I hire?`,
      industryNeeded
        ? `Recommended ${category} for ${industry} clients`
        : `Recommended ${category} for growing businesses`,
      // Buyer-journey / intent
      `Best ${category} for startups with a limited budget`,
      `Enterprise-grade ${category} with proven case studies`,
      `What ${category} do venture-backed companies hire?`,
      `How do I choose a ${category} — what matters most?`,
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
      // Shortlisting
      `Best ${category} in 2026`,
      `Top ${category} to buy right now`,
      `Which ${category} should I buy?`,
      industryNeeded
        ? `Recommended ${category} for ${industry} shoppers`
        : `Recommended ${category} for everyday use`,
      // Buyer-journey / intent
      `Best ${category} for under $100`,
      `Premium ${category} worth the money`,
      sustainabilityQuery,
      `What ${category} do reviewers recommend most?`,
    ];
  }
  return [
    // Shortlisting
    `Best ${category} software in 2026`,
    industryNeeded ? `Top ${category} tools for ${industry}` : `Top ${category} tools`,
    `What ${category} solution should I use?`,
    `Recommended ${category} platforms for businesses`,
    // Buyer-journey / intent
    `Best ${category} for early-stage startups`,
    `Enterprise ${category} with the best security and compliance`,
    industryNeeded
      ? `Which ${category} tool is best for ${industry} companies?`
      : `Which ${category} tool is best for scaling companies?`,
    `How do I pick a ${category} — what should I compare?`,
  ];
}
