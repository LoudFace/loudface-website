/**
 * Tier 2 SEO fixer — Claude-assisted rewrites for fields that need judgment.
 *
 *   - metaTitle > 48 chars: rewrite to fit under 48, preserve specificity and
 *     primary keyword, stay editorial rather than click-bait.
 *   - metaDescription missing, < 120 chars, or > 160 chars: rewrite to land
 *     cleanly in the 120-160 range.
 *   - excerpt missing or under 50 chars: generate a 1-2 sentence summary from
 *     the article body that works as both card preview and og:description
 *     fallback.
 *
 * Each post gets ONE Claude call that returns all three fields at once, so
 * it's ~1 API call per needful post (~57 posts worst case).
 *
 * Run: npx tsx scripts/seo-fix-tier2.ts [--dry-run] [--slug <slug>]
 */

import { sanityClient } from './visuals/lib/sanity';
import { generate, extractJson } from './visuals/lib/claude';

interface Row {
  _id: string;
  slug: string;
  name: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
}

const MAX_TITLE = 48;
const MAX_DESC = 160;
const MIN_DESC = 120;

const SYSTEM_PROMPT = `You rewrite SEO metadata for a B2B SaaS agency's blog. Each request gives you an article title, body, and the current metadata. You return ONE JSON object with optional keys: metaTitle, metaDescription, excerpt.

Rules the writing must follow (this is a strict style bar, not a suggestion):
- No AI-slop words or phrases: delve, leverage, utilize, harness, pivotal, robust, innovative, seamless, transformative, tapestry, landscape (figurative), paradigm, cornerstone, moreover, furthermore, indeed, ultimate, comprehensive, game-changer, unlock, unleash, empower, elevate.
- No sycophantic or marketer cliches: "in today's fast-paced world", "in an ever-evolving landscape", "we understand that", "a world where".
- Active voice. Concrete nouns. Specific claims. No hedging.
- metaTitle: MUST be 30–48 characters after stripping any trailing " | LoudFace". Lead with the primary keyword. Year-specific titles keep the year. Keep the distinctive phrasing of the existing title when possible — don't flatten it into something generic.
- metaDescription: MUST be 120–160 characters. Concrete value proposition, ideally includes the primary keyword naturally. End with a reason to click. No "Read more about...", no "In this article, we will".
- excerpt: 1–2 sentences, 120–200 characters, acts as both article-card preview and og:description fallback. State what the reader will learn or what the article argues. No generic throat-clearing.

Only include keys for fields that need changing. If a field is already good, omit it. Return raw JSON, no markdown fences, no prose.`;

function needsTitleFix(row: Row): boolean {
  if (!row.metaTitle) return true;
  const t = row.metaTitle.trim();
  return t.length < 30 || t.length > MAX_TITLE;
}

function needsDescFix(row: Row): boolean {
  if (!row.metaDescription) return true;
  const d = row.metaDescription.trim();
  return d.length < MIN_DESC || d.length > MAX_DESC;
}

function needsExcerptFix(row: Row): boolean {
  return !row.excerpt || row.excerpt.trim().length < 50;
}

async function rewriteOne(row: Row): Promise<{ metaTitle?: string; metaDescription?: string; excerpt?: string }> {
  const fields: string[] = [];
  if (needsTitleFix(row)) fields.push('metaTitle');
  if (needsDescFix(row)) fields.push('metaDescription');
  if (needsExcerptFix(row)) fields.push('excerpt');
  if (fields.length === 0) return {};

  const bodyText = (row.content ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000);

  const user = [
    `Article title: ${row.name}`,
    `Slug: ${row.slug}`,
    '',
    `Current metaTitle: ${row.metaTitle ?? '(missing)'} (${(row.metaTitle ?? '').length} chars)`,
    `Current metaDescription: ${row.metaDescription ?? '(missing)'} (${(row.metaDescription ?? '').length} chars)`,
    `Current excerpt: ${row.excerpt ?? '(missing)'} (${(row.excerpt ?? '').length} chars)`,
    '',
    `Fields that need rewriting: ${fields.join(', ')}`,
    '',
    'Article body (first 4000 chars of stripped HTML):',
    '---',
    bodyText,
    '---',
    '',
    'Return a JSON object with only the keys listed above that need rewriting. Apply the rules exactly. Do NOT return fields that are already good.',
  ].join('\n');

  const raw = await generate({ system: SYSTEM_PROMPT, user, maxTokens: 800 });
  const parsed = extractJson<{ metaTitle?: string; metaDescription?: string; excerpt?: string }>(raw);
  return parsed;
}

function validate(result: { metaTitle?: string; metaDescription?: string; excerpt?: string }): string[] {
  const warnings: string[] = [];
  if (result.metaTitle && (result.metaTitle.length < 30 || result.metaTitle.length > MAX_TITLE)) {
    warnings.push(`metaTitle ${result.metaTitle.length} chars (wanted 30–${MAX_TITLE})`);
  }
  if (result.metaDescription && (result.metaDescription.length < MIN_DESC || result.metaDescription.length > MAX_DESC)) {
    warnings.push(`metaDescription ${result.metaDescription.length} chars (wanted ${MIN_DESC}–${MAX_DESC})`);
  }
  return warnings;
}

async function main() {
  const client = sanityClient();
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const slugArg = argv[argv.indexOf('--slug') + 1];

  let query = `*[_type == "blogPost" && !(_id in path("drafts.**"))]`;
  const params: Record<string, unknown> = {};
  if (slugArg && !slugArg.startsWith('--')) {
    query = `*[_type == "blogPost" && !(_id in path("drafts.**")) && slug.current == $slug]`;
    params.slug = slugArg;
  }

  const rows = await client.fetch<Row[]>(
    `${query}{
      _id,
      "slug": slug.current,
      name,
      content,
      metaTitle,
      metaDescription,
      excerpt
    } | order(publishedDate desc)`,
    params,
  );

  const needful = rows.filter((r) => needsTitleFix(r) || needsDescFix(r) || needsExcerptFix(r));
  console.log(`→ ${rows.length} posts fetched, ${needful.length} need metadata rewrites.`);
  if (dryRun) console.log('  (dry-run: will not write to Sanity)');
  console.log('');

  let titleFixed = 0;
  let descFixed = 0;
  let excerptFixed = 0;
  let failed = 0;

  for (const row of needful) {
    process.stdout.write(`  · ${row.slug} ... `);
    try {
      const result = await rewriteOne(row);
      const warnings = validate(result);
      const patches: Record<string, string> = {};
      if (result.metaTitle && needsTitleFix(row)) { patches.metaTitle = result.metaTitle; titleFixed++; }
      if (result.metaDescription && needsDescFix(row)) { patches.metaDescription = result.metaDescription; descFixed++; }
      if (result.excerpt && needsExcerptFix(row)) { patches.excerpt = result.excerpt; excerptFixed++; }

      if (Object.keys(patches).length === 0) {
        console.log('no changes');
        continue;
      }

      const fieldsUpdated = Object.keys(patches).join(', ');
      console.log(`updated ${fieldsUpdated}${warnings.length ? ` (warnings: ${warnings.join('; ')})` : ''}`);

      if (!dryRun) {
        await client.patch(row._id).set(patches).commit();
      }
    } catch (err) {
      failed++;
      console.log('failed');
      console.error(`    ${err instanceof Error ? err.message : err}`);
    }

    // Light rate-limit: 600ms between calls keeps us well under OpenRouter's
    // per-second limits without stretching the total run.
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\n━━━ Tier 2 summary ━━━`);
  console.log(`  metaTitle rewrites:       ${titleFixed}`);
  console.log(`  metaDescription rewrites: ${descFixed}`);
  console.log(`  excerpt generations:      ${excerptFixed}`);
  console.log(`  Failed:                   ${failed}`);
  console.log(`  Total field writes:       ${titleFixed + descFixed + excerptFixed}`);
  if (dryRun) console.log(`  (dry-run — no writes committed)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
