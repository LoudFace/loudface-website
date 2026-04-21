/**
 * Tier 3 SEO fixer — category assignment + heading hierarchy normalization
 * + FAQ generation for sparse posts.
 *
 *   Part A (category): rule-based slug/name match against our 7 categories.
 *     Tech · Growth · Explainer · Guide · Tech Comparison · Integrations · Marketing
 *
 *   Part B (heading hierarchy): detects h2→h4 skips. Auto-fixes ONLY when
 *     every h4 in the article could safely become h3 (i.e. no existing h3s
 *     to collide with). Otherwise, logs for manual review.
 *
 *   Part C (FAQ): for posts with fewer than 3 FAQ entries, uses Claude to
 *     generate 4–6 buyer-intent questions pulled from the article body.
 *
 * Run: npx tsx scripts/seo-fix-tier3.ts [--dry-run]
 */

import { sanityClient } from './visuals/lib/sanity';
import { generate, extractJson } from './visuals/lib/claude';

interface Row {
  _id: string;
  slug: string;
  name: string;
  content?: string;
  categoryRef?: string;
  categoriesRefs?: string[];
  faq?: Array<{ _key?: string; question: string; answer: string }>;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Rule-based category assignment. Order matters: first match wins. Patterns
// are simple word fragments against the slug (kebab-case) — stable and
// transparent vs. running a classifier on every article body.
const CATEGORY_RULES: Array<{ categorySlug: string; patterns: RegExp[] }> = [
  // Integrations: specific third-party tooling
  {
    categorySlug: 'integrations',
    patterns: [/zapier/, /auth0/, /analytics/, /search-console/, /hubspot/, /salesforce/, /stripe/, /algolia/],
  },
  // Tech Comparison: versus / alternatives / compared
  {
    categorySlug: 'tech-comparison',
    patterns: [/\bvs\b/, /\balternatives\b/, /\bcompared\b/, /\bcomparison\b/],
  },
  // Guide: explicit guide language
  {
    categorySlug: 'guide',
    patterns: [/\bguide\b/, /\bhow-to\b/, /\bmastering\b/, /\btutorial\b/, /\bplaybook\b/, /\bhandbook\b/],
  },
  // Marketing: agency, pricing, conversion, funnels, SEO/AEO/growth topics
  {
    categorySlug: 'marketing',
    patterns: [/\bagency\b/, /\bagencies\b/, /\bpricing\b/, /\bfunnel\b/, /\bconversion\b/, /\bcro\b/, /\bseo\b/, /\baeo\b/, /\bgrowth\b/, /\brevenue\b/, /\bmarketing\b/, /\bbranding\b/, /\bllm-source\b/, /\bcitation\b/, /\bshare-of-answer\b/, /\be-e-a-t|eeat\b/],
  },
  // Tech: Webflow / CMS / code / development / design
  {
    categorySlug: 'tech',
    patterns: [/\bwebflow\b/, /\bcms\b/, /\bcode\b/, /\bdevelopment\b/, /\bdevlink\b/, /\bapi\b/, /\bui\b/, /\bdesign\b/, /\blottie\b/, /\bheadless\b/, /\breact\b/, /\bnext\b/, /\bbuilt-in\b/],
  },
  // Explainer: what is / understanding / landscape / overview
  {
    categorySlug: 'explainer',
    patterns: [/\bwhat-is\b/, /\bunderstanding\b/, /\bunderstand\b/, /\bexplain\b/, /\blandscape\b/, /\boverview\b/, /\bbeginners?\b/],
  },
  // Growth: SaaS growth, scaling, fintech etc.
  {
    categorySlug: 'growth',
    patterns: [/\bsaas\b/, /\bb2b\b/, /\bstartups?\b/, /\bscale\b/, /\bscaling\b/, /\bfintech\b/, /\becommerce\b/, /\bhealthcare\b/, /\benterprise\b/],
  },
];

function pickCategory(slug: string, name: string, categoriesByslug: Map<string, Category>): string | null {
  const haystack = `${slug} ${name.toLowerCase()}`.replace(/[^a-z0-9\s-]/g, ' ');
  for (const { categorySlug, patterns } of CATEGORY_RULES) {
    if (patterns.some((p) => p.test(haystack))) {
      return categoriesByslug.get(categorySlug)?._id ?? null;
    }
  }
  return null;
}

/**
 * Analyze the HTML content's heading sequence. Returns a new HTML string
 * if a safe remap is possible (promote h4→h3, h5→h4, h6→h5 when no h3
 * exists in the article to collide with). Returns null if the content
 * should stay as-is.
 */
function normalizeHeadingHierarchy(html: string): { html: string; changed: boolean } | null {
  const headings = Array.from(html.matchAll(/<(h[1-6])\b/gi)).map((m) => m[1].toLowerCase());
  const hasSkip = headings.some((tag, i) => {
    if (i === 0) return false;
    const prev = Number(headings[i - 1][1]);
    const curr = Number(tag[1]);
    return curr - prev > 1;
  });
  if (!hasSkip) return null;

  const hasH3 = headings.includes('h3');
  if (hasH3) return null; // can't safely promote — mixing h3 and demoted h4→h3 risks collisions

  const promoted = html
    .replace(/<h4(\b[^>]*)>([\s\S]*?)<\/h4>/gi, '<h3$1>$2</h3>')
    .replace(/<h5(\b[^>]*)>([\s\S]*?)<\/h5>/gi, '<h4$1>$2</h4>')
    .replace(/<h6(\b[^>]*)>([\s\S]*?)<\/h6>/gi, '<h5$1>$2</h5>');

  return { html: promoted, changed: promoted !== html };
}

const FAQ_SYSTEM_PROMPT = `You generate FAQ entries for a B2B SaaS agency's blog post. Given the article's body, return 4-6 buyer-intent questions that a reader would actually type into Google, ChatGPT, or Perplexity — along with concise, specific answers drawn from the article's own claims.

Rules:
- No AI-slop: delve, leverage, utilize, harness, pivotal, robust, seamless, transformative, landscape, paradigm, moreover, furthermore, indeed, ultimate, comprehensive, game-changer, unlock, unleash, empower, elevate.
- Active voice. Concrete. Specific. No corporate hedging.
- Each question should be a real query, not a marketing setup. Avoid "What are the benefits of X?"-shape questions.
- Each answer: 2–4 sentences, 200–500 characters. Directly answers the question with specifics from the article.
- Return JSON: { "faq": [{ "question": "...", "answer": "..." }, ...] }. No markdown fences, no prose.`;

async function generateFaq(row: Row): Promise<Array<{ question: string; answer: string }>> {
  const bodyText = (row.content ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 6000);
  const user = [
    `Article title: ${row.name}`,
    `Slug: ${row.slug}`,
    '',
    'Article body (first 6000 chars of stripped HTML):',
    '---',
    bodyText,
    '---',
    '',
    'Return the JSON as specified. 4-6 FAQ entries.',
  ].join('\n');

  const raw = await generate({ system: FAQ_SYSTEM_PROMPT, user, maxTokens: 2000 });
  const parsed = extractJson<{ faq: Array<{ question: string; answer: string }> }>(raw);
  return parsed.faq ?? [];
}

async function main() {
  const client = sanityClient();
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');

  const [rows, categories] = await Promise.all([
    client.fetch<Row[]>(
      `*[_type == "blogPost" && !(_id in path("drafts.**"))]{
        _id,
        "slug": slug.current,
        name,
        content,
        "categoryRef": category._ref,
        "categoriesRefs": categories[]._ref,
        faq
      } | order(publishedDate desc)`,
    ),
    client.fetch<Category[]>(`*[_type == "category"]{ _id, name, "slug": slug.current }`),
  ]);

  const byslug = new Map<string, Category>();
  for (const c of categories) byslug.set(c.slug, c);

  let categoryAssigned = 0;
  let categorySkipped = 0;
  let hierarchyFixed = 0;
  let hierarchyManual = 0;
  let faqGenerated = 0;
  let faqFailed = 0;

  for (const row of rows) {
    const patches: Record<string, unknown> = {};
    const notes: string[] = [];

    // A. Category assignment
    const hasCategory = !!row.categoryRef || (row.categoriesRefs?.length ?? 0) > 0;
    if (!hasCategory) {
      const catId = pickCategory(row.slug, row.name, byslug);
      if (catId) {
        patches.category = { _type: 'reference', _ref: catId };
        const cat = categories.find((c) => c._id === catId);
        notes.push(`category=${cat?.name}`);
        categoryAssigned++;
      } else {
        categorySkipped++;
      }
    }

    // B. Heading hierarchy
    if (row.content) {
      const result = normalizeHeadingHierarchy(row.content);
      if (result && result.changed) {
        patches.content = result.html;
        notes.push('headings-normalized');
        hierarchyFixed++;
      } else if (result === null && /<h([2-6])\b[\s\S]*?<h([2-6])\b/i.test(row.content)) {
        // Heuristic re-check for skip that can't be auto-fixed (has h3 already)
        const headings = Array.from(row.content.matchAll(/<h([1-6])\b/gi)).map((m) => Number(m[1]));
        const hasSkip = headings.some((h, i) => i > 0 && h - headings[i - 1] > 1);
        if (hasSkip) hierarchyManual++;
      }
    }

    if (Object.keys(patches).length > 0) {
      console.log(`  · ${row.slug}: ${notes.join(', ')}`);
      if (!dryRun) {
        await client.patch(row._id).set(patches).commit();
      }
    }
  }

  // C. FAQ generation — separate pass so Claude rate-limiting doesn't block
  // category / heading work.
  console.log('\n→ FAQ generation pass for posts with < 3 entries...');
  for (const row of rows) {
    const faqCount = row.faq?.length ?? 0;
    if (faqCount >= 3) continue;

    process.stdout.write(`  · ${row.slug} (has ${faqCount}) ... `);
    try {
      const generated = await generateFaq(row);
      if (generated.length === 0) {
        console.log('empty response');
        continue;
      }
      const merged = [
        ...(row.faq ?? []),
        ...generated.map((f, i) => ({ _key: `faq-gen-${Date.now()}-${i}`, _type: 'object', question: f.question, answer: f.answer })),
      ];
      console.log(`generated ${generated.length}, total ${merged.length}`);
      if (!dryRun) {
        await client.patch(row._id).set({ faq: merged }).commit();
      }
      faqGenerated++;
    } catch (err) {
      faqFailed++;
      console.log('failed');
      console.error(`    ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n━━━ Tier 3 summary ━━━`);
  console.log(`  Categories assigned:    ${categoryAssigned}`);
  console.log(`  Category skipped (no rule match): ${categorySkipped}`);
  console.log(`  Heading hierarchy auto-fixed:     ${hierarchyFixed}`);
  console.log(`  Heading hierarchy manual review:  ${hierarchyManual}`);
  console.log(`  FAQ generated:          ${faqGenerated}`);
  console.log(`  FAQ failed:             ${faqFailed}`);
  if (dryRun) console.log(`  (dry-run — no writes committed)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
