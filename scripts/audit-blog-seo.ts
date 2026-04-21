/**
 * SEO + AEO audit for all published blog posts.
 *
 * Queries Sanity for every blogPost, runs a battery of checks, and prints
 * a scorecard per-article plus a rollup of issues sorted by severity.
 *
 * Checks performed:
 *   - metaTitle present, length 30–48 (so layout's " | LoudFace" suffix
 *     fits inside the 60-char SERP limit)
 *   - metaDescription present, length 120–160
 *   - excerpt present (used for og:description fallback + article cards)
 *   - thumbnail with alt text (required for OG image + article hero)
 *   - author reference (required for JSON-LD Person schema)
 *   - category or categories (topical clustering + related-posts routing)
 *   - FAQ populated (drives FAQPage schema — auto-extract is a fallback)
 *   - timeToRead set (shown on cards + detail page)
 *   - publishedDate + lastUpdated
 *   - content non-empty, word count reasonable for topic
 *   - H1 downgraded (no <h1> in CMS content; page provides the H1)
 *   - heading hierarchy (no H2 → H4 jumps)
 *   - internal links (3+ per SEO standards)
 *   - images have non-empty alt
 *   - canonical slug is kebab-case, no legacy URL fragments
 *
 * Run: npx tsx scripts/audit-blog-seo.ts
 */

import { sanityClient } from './visuals/lib/sanity';

interface BlogRow {
  _id: string;
  name: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  content?: string;
  timeToRead?: string;
  publishedDate?: string;
  lastUpdated?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  authorRef?: string;
  categoryRef?: string;
  categoriesRefs?: string[];
  faqCount: number;
  visualCount: number;
}

type Severity = 'error' | 'warn' | 'info';
interface Issue {
  severity: Severity;
  check: string;
  detail: string;
}

const MAX_PAGE_TITLE = 48; // layout adds " | LoudFace" = 12 → 60 total
const MIN_PAGE_TITLE = 30; // under this, SERP looks thin
const MAX_META_DESC = 160;
const MIN_META_DESC = 120;

async function main() {
  const client = sanityClient();

  // Fetch all published (non-draft) blogPosts with SEO-relevant fields.
  const rows = await client.fetch<BlogRow[]>(
    `*[_type == "blogPost" && !(_id in path("drafts.**"))]{
      _id,
      name,
      "slug": slug.current,
      metaTitle,
      metaDescription,
      excerpt,
      content,
      timeToRead,
      publishedDate,
      lastUpdated,
      "thumbnailUrl": thumbnail.asset->url,
      "thumbnailAlt": thumbnail.alt,
      "authorRef": author._ref,
      "categoryRef": category._ref,
      "categoriesRefs": categories[]._ref,
      "faqCount": count(faq),
      "visualCount": count(visuals)
    } | order(publishedDate desc)`,
  );

  console.log(`\n━━━ SEO/AEO audit of ${rows.length} blog posts ━━━\n`);

  const perArticle: Array<{ row: BlogRow; issues: Issue[] }> = [];
  const errorCount = { error: 0, warn: 0, info: 0 };

  for (const row of rows) {
    const issues = checkArticle(row);
    perArticle.push({ row, issues });
    for (const i of issues) errorCount[i.severity]++;
  }

  // ── Per-article report ──
  for (const { row, issues } of perArticle) {
    const errors = issues.filter((i) => i.severity === 'error');
    const warns = issues.filter((i) => i.severity === 'warn');
    const infos = issues.filter((i) => i.severity === 'info');
    const icon = errors.length > 0 ? '✗' : warns.length > 0 ? '⚠' : '✓';
    console.log(`${icon} /${row.slug}`);
    console.log(`   ${row.name}`);
    if (errors.length === 0 && warns.length === 0 && infos.length === 0) {
      console.log(`   · no issues`);
    }
    for (const i of [...errors, ...warns, ...infos]) {
      const sev = i.severity === 'error' ? 'ERR ' : i.severity === 'warn' ? 'WARN' : 'INFO';
      console.log(`   · [${sev}] ${i.check}: ${i.detail}`);
    }
    console.log('');
  }

  // ── Rollup ──
  console.log('━━━ Rollup ━━━');
  console.log(`  Posts audited:   ${rows.length}`);
  console.log(`  Errors:          ${errorCount.error}`);
  console.log(`  Warnings:        ${errorCount.warn}`);
  console.log(`  Info:            ${errorCount.info}`);

  // Top issue patterns across the catalog
  const issueFreq = new Map<string, number>();
  for (const { issues } of perArticle) {
    for (const i of issues) {
      issueFreq.set(i.check, (issueFreq.get(i.check) ?? 0) + 1);
    }
  }
  const sortedIssues = [...issueFreq.entries()].sort((a, b) => b[1] - a[1]);
  if (sortedIssues.length > 0) {
    console.log(`\n  Most common issues:`);
    for (const [check, count] of sortedIssues.slice(0, 10)) {
      console.log(`    ${String(count).padStart(3)} × ${check}`);
    }
  }

  // Duplicate metaTitle / metaDescription detection across articles
  const titleDupes = findDuplicates(perArticle.map(({ row }) => ({ slug: row.slug, value: row.metaTitle })));
  const descDupes = findDuplicates(perArticle.map(({ row }) => ({ slug: row.slug, value: row.metaDescription })));
  if (titleDupes.length > 0) {
    console.log(`\n  ⚠  Duplicate metaTitle across slugs:`);
    for (const { value, slugs } of titleDupes) console.log(`    "${value}" → ${slugs.join(', ')}`);
  }
  if (descDupes.length > 0) {
    console.log(`\n  ⚠  Duplicate metaDescription across slugs:`);
    for (const { value, slugs } of descDupes) console.log(`    "${value?.slice(0, 60)}…" → ${slugs.join(', ')}`);
  }
  console.log('');
}

function checkArticle(row: BlogRow): Issue[] {
  const issues: Issue[] = [];

  // metaTitle
  if (!row.metaTitle || !row.metaTitle.trim()) {
    issues.push({ severity: 'error', check: 'metaTitle', detail: 'missing — layout falls back to name' });
  } else if (row.metaTitle.length > MAX_PAGE_TITLE) {
    issues.push({
      severity: 'warn',
      check: 'metaTitle',
      detail: `${row.metaTitle.length} chars > ${MAX_PAGE_TITLE} (gets truncated)`,
    });
  } else if (row.metaTitle.length < MIN_PAGE_TITLE) {
    issues.push({
      severity: 'info',
      check: 'metaTitle',
      detail: `${row.metaTitle.length} chars < ${MIN_PAGE_TITLE} (SERP looks thin)`,
    });
  }

  // metaDescription
  if (!row.metaDescription || !row.metaDescription.trim()) {
    issues.push({ severity: 'error', check: 'metaDescription', detail: 'missing' });
  } else {
    const len = row.metaDescription.length;
    if (len > MAX_META_DESC) {
      issues.push({ severity: 'warn', check: 'metaDescription', detail: `${len} chars > ${MAX_META_DESC} (truncated in SERP)` });
    } else if (len < MIN_META_DESC) {
      issues.push({ severity: 'warn', check: 'metaDescription', detail: `${len} chars < ${MIN_META_DESC} (flagged "too short")` });
    }
  }

  // excerpt
  if (!row.excerpt || row.excerpt.trim().length < 50) {
    issues.push({
      severity: row.excerpt ? 'warn' : 'error',
      check: 'excerpt',
      detail: row.excerpt ? `${row.excerpt.length} chars (too thin for card + og:description fallback)` : 'missing',
    });
  }

  // thumbnail
  if (!row.thumbnailUrl) {
    issues.push({ severity: 'error', check: 'thumbnail', detail: 'missing (breaks OG image + article hero)' });
  } else if (!row.thumbnailAlt || !row.thumbnailAlt.trim()) {
    issues.push({ severity: 'warn', check: 'thumbnail.alt', detail: 'thumbnail has no alt text' });
  }

  // author
  if (!row.authorRef) {
    issues.push({ severity: 'error', check: 'author', detail: 'missing (breaks JSON-LD Person schema)' });
  }

  // category
  const hasCategory = !!row.categoryRef || (row.categoriesRefs?.length ?? 0) > 0;
  if (!hasCategory) {
    issues.push({ severity: 'warn', check: 'category', detail: 'no category reference (hurts topical clustering)' });
  }

  // FAQ
  if (!row.faqCount || row.faqCount === 0) {
    issues.push({
      severity: 'warn',
      check: 'faq',
      detail: 'no explicit FAQ entries (auto-extract from H2s is imperfect)',
    });
  } else if (row.faqCount < 3) {
    issues.push({ severity: 'info', check: 'faq', detail: `only ${row.faqCount} FAQ entries (aim for 4–7)` });
  }

  // timeToRead
  if (!row.timeToRead) {
    issues.push({ severity: 'info', check: 'timeToRead', detail: 'missing (shown on cards)' });
  }

  // dates
  if (!row.publishedDate) {
    issues.push({ severity: 'error', check: 'publishedDate', detail: 'missing (breaks schema + sort order)' });
  }
  if (!row.lastUpdated) {
    issues.push({ severity: 'info', check: 'lastUpdated', detail: 'missing (schema dateModified falls back to publishedDate)' });
  }

  // content
  if (!row.content || !row.content.trim()) {
    issues.push({ severity: 'error', check: 'content', detail: 'empty' });
  } else {
    const text = row.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text.split(' ').filter(Boolean).length;
    if (wordCount < 500) {
      issues.push({ severity: 'warn', check: 'wordCount', detail: `${wordCount} words (thin for blog content)` });
    }

    // H1 sniff
    if (/<h1\b/i.test(row.content)) {
      issues.push({ severity: 'warn', check: 'h1-in-content', detail: 'CMS content has <h1> (page provides H1; will be downgraded at render)' });
    }

    // Heading hierarchy (no H2 → H4 jumps)
    const headings = Array.from(row.content.matchAll(/<h([1-6])\b/gi)).map((m) => Number(m[1]));
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] - headings[i - 1] > 1) {
        issues.push({
          severity: 'warn',
          check: 'heading-hierarchy',
          detail: `h${headings[i - 1]} → h${headings[i]} (skipped a level)`,
        });
        break; // report once per article, not per jump
      }
    }

    // Internal link count (same-domain or path-relative)
    const linkMatches = row.content.match(/href="([^"]+)"/g) ?? [];
    const internalLinks = linkMatches.filter((m) =>
      /href="(https?:\/\/(www\.)?loudface\.co[^"]*|\/[^"]*)/.test(m),
    );
    if (internalLinks.length < 3) {
      issues.push({
        severity: 'warn',
        check: 'internal-links',
        detail: `${internalLinks.length} internal links (SEO standards = 3+)`,
      });
    }

    // Image alt text check — any <img> without an alt attribute
    const imgs = row.content.match(/<img\b[^>]*>/gi) ?? [];
    const imgsWithoutAlt = imgs.filter((img) => !/\balt\s*=\s*"/i.test(img));
    if (imgsWithoutAlt.length > 0) {
      issues.push({
        severity: 'warn',
        check: 'img-alt',
        detail: `${imgsWithoutAlt.length}/${imgs.length} <img> tag(s) missing alt attribute`,
      });
    }
  }

  // slug sanity
  if (!row.slug) {
    issues.push({ severity: 'error', check: 'slug', detail: 'missing' });
  } else if (!/^[a-z0-9-]+$/.test(row.slug)) {
    issues.push({ severity: 'warn', check: 'slug', detail: `"${row.slug}" is not kebab-case` });
  }

  return issues;
}

function findDuplicates(items: Array<{ slug: string; value?: string }>) {
  const buckets = new Map<string, string[]>();
  for (const { slug, value } of items) {
    if (!value) continue;
    const key = value.trim();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(slug);
  }
  return [...buckets.entries()]
    .filter(([, slugs]) => slugs.length > 1)
    .map(([value, slugs]) => ({ value, slugs }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
