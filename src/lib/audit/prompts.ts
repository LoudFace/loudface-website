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

/**
 * Whether appending "for {industry}" to this framing would be redundant —
 * false when the industry word already appears in the framing text (e.g.
 * framing "SEO agency" with industry "agency"). Computed per-framing, not
 * just for the primary category, so aliases that already contain the
 * industry word don't get a doubled-up "... for agency clients" suffix.
 */
function industryNeededFor(framing: string, industry: string): boolean {
  return Boolean(industry) && !framing.toLowerCase().includes(industry.toLowerCase());
}

/**
 * True when the framing already ends in a noun "brands"/"stores" would
 * double up on. When the category already ends in a noun like "brand",
 * "box", "retailer", or "store", we drop the trailing "brands"/"stores" to
 * avoid reading "brand brands" / "box brands".
 */
function endsInBrandNoun(framing: string): boolean {
  return /\b(brand|brands|box|boxes|retailer|retailers|store|stores|shop|shops|marketplace|marketplaces)$/i.test(
    framing.trim(),
  );
}

/**
 * ~7 queries × 4 platforms = ~28 calls. Widened from a flat 5 — 5
 * near-identical queries all wrapping the same (often over-narrow)
 * `category` string under-sampled real buyer search behavior: a brand
 * categorized as "B2B SaaS web design and growth agency" turned every query
 * into a variant of that one compound nobody actually searches, so a real
 * brand could score a false 0% category discovery. Real unbranded prompts
 * land on broader or adjacent framings (Peec-observed for a LoudFace-shaped
 * brand: "Top B2B SaaS SEO agencies", "AI search marketing agency for
 * SaaS"). Spreading varied-intent templates across `category` PLUS its
 * `aliases` samples that real breadth instead of one narrow framing five
 * times over.
 */
export function getCategoryQueries(
  category: string,
  aliases: string[],
  industry: string,
  entityType: 'product' | 'service' | 'brand' = 'product',
): string[] {
  const framings = Array.from(
    new Set([category, ...aliases].map((f) => f.trim()).filter(Boolean)),
  );
  if (framings.length === 0) framings.push(category);

  // Cycle framing i across template i so every query varies BOTH intent and
  // framing. With no aliases (framings.length === 1), every template still
  // applies to the single category — the same ~7 varied-intent queries, just
  // spread over one framing instead of several.
  const pick = (i: number) => framings[i % framings.length];

  let templates: Array<(framing: string) => string>;

  if (entityType === 'service') {
    templates = [
      (f) => `Best ${f} in 2026`,
      (f) => `Top ${f} providers in 2026`,
      (f) => `Which ${f} should I hire?`,
      (f) =>
        industryNeededFor(f, industry)
          ? `Recommended ${f} for ${industry} clients`
          : `Recommended ${f} for growing businesses`,
      (f) => `Best ${f} for startups with a limited budget`,
      (f) => `Most trusted ${f} right now`,
      (f) =>
        industryNeededFor(f, industry)
          ? `${f} options for ${industry} teams`
          : `${f} options worth shortlisting`,
    ];
  } else if (entityType === 'brand') {
    // Ecommerce / consumer brands / marketplaces — no "software/tools/platforms" wording.
    templates = [
      (f) => `Best ${f} in 2026`,
      (f) => `Top ${f} to buy right now`,
      (f) => `Which ${f} should I buy?`,
      (f) =>
        industryNeededFor(f, industry)
          ? `Recommended ${f} for ${industry} shoppers`
          : `Recommended ${f} for everyday use`,
      (f) => `Premium ${f} worth the money`,
      (f) =>
        endsInBrandNoun(f)
          ? `Most sustainable ${f} in 2026`
          : `Most sustainable ${f} brands in 2026`,
      (f) => `Top-rated ${f} for first-time buyers`,
    ];
  } else {
    templates = [
      (f) => `Best ${f} software in 2026`,
      (f) => (industryNeededFor(f, industry) ? `Top ${f} tools for ${industry}` : `Top ${f} tools`),
      (f) => `What ${f} solution should I use?`,
      (f) => `Recommended ${f} platforms for businesses`,
      (f) => `Best ${f} for early-stage startups`,
      (f) => `Most popular ${f} tools right now`,
      (f) =>
        industryNeededFor(f, industry)
          ? `${f} platforms built for ${industry}`
          : `${f} platforms worth trying`,
    ];
  }

  const queries = templates.map((tpl, i) => tpl(pick(i)));

  // Safety net: collapse any exact-duplicate strings (e.g. an alias
  // identical in wording to a generated query for another framing), cap at 7.
  return Array.from(new Set(queries)).slice(0, 7);
}
