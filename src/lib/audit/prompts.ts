// ─── Brand Baseline Queries (Phase 1) ───────────────────────────────

export function getBrandQueries(company: string, industry?: string): string[] {
  const cat = industry || 'their industry';
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
    `Should I use ${company} for ${cat}?`,
  ];
}

// ─── Competitor Context Queries (Phase 2) ───────────────────────────

export function getCompetitorQueries(
  competitor: string,
  category: string,
  entityType: 'product' | 'service' = 'product',
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
  entityType: 'product' | 'service' = 'product',
): string[] {
  if (entityType === 'service') {
    return [
      `Best ${category} for B2B SaaS companies`,
      `Top ${category} providers in 2026`,
      `Which ${category} should I hire?`,
      `Recommended ${category} for ${industry}`,
      `Best ${category} for startups and growing companies`,
    ];
  }
  return [
    `Best ${category} software in 2026`,
    `Top ${category} tools for ${industry}`,
    `What ${category} solution should I use?`,
    `Recommended ${category} platforms for businesses`,
    `Which ${category} tool is best for ${industry} companies?`,
  ];
}
