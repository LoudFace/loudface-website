/**
 * Webflow → Sanity Migration Verification Script
 *
 * Compares all collections between Webflow (source) and Sanity (destination)
 * to verify the migration was complete and accurate.
 *
 * Usage: npx tsx scripts/verify-migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Load env vars ──────────────────────────────────────────────────
function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const projectRoot = path.resolve(__dirname, '..');
loadEnv(path.join(projectRoot, '.env'));
loadEnv(path.join(projectRoot, '.env.local')); // overrides

// ── Config ─────────────────────────────────────────────────────────
const WEBFLOW_TOKEN = process.env.WEBFLOW_SITE_API_TOKEN!;
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN!;

if (!WEBFLOW_TOKEN) throw new Error('Missing WEBFLOW_SITE_API_TOKEN');
if (!SANITY_PROJECT_ID) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
if (!SANITY_DATASET) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');

const COLLECTIONS: Record<string, { webflowId: string; sanityType: string }> = {
  'blog':               { webflowId: '67b46d898180d5b8499f87e8', sanityType: 'blogPost' },
  'case-studies':       { webflowId: '67bcc512271a06e2e0acc70d', sanityType: 'caseStudy' },
  'testimonials':       { webflowId: '67bd0c6f1a9fdd9770be5469', sanityType: 'testimonial' },
  'clients':            { webflowId: '67c6f017e3221db91323ff13', sanityType: 'client' },
  'blog-faq':           { webflowId: '67bd3732a35ec40d3038b40a', sanityType: 'blogFaq' },
  'team-members':       { webflowId: '68d819d1810ef43a5ef97da4', sanityType: 'teamMember' },
  'technologies':       { webflowId: '67be3e735523f789035b6c56', sanityType: 'technology' },
  'categories':         { webflowId: '67b46e2d70ec96bfb7787071', sanityType: 'category' },
  'industries':         { webflowId: '67bd0a772117f7c7227e7b4d', sanityType: 'industry' },
  'service-categories': { webflowId: '67bcfb9cdb20a1832e2799c3', sanityType: 'serviceCategory' },
  'seo-pages':          { webflowId: '6988a63150526a37d700fae3', sanityType: 'seoPage' },
};

// ── Webflow API helpers ────────────────────────────────────────────
async function webflowFetch(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}`, 'accept-version': '2.0.0' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webflow API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function fetchAllWebflowItems(collectionId: string): Promise<any[]> {
  const items: any[] = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const data = await webflowFetch(
      `https://api.webflow.com/v2/collections/${collectionId}/items?limit=${limit}&offset=${offset}`
    );
    const batch = data.items || [];
    items.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return items;
}

// ── Sanity API helpers ─────────────────────────────────────────────
async function sanityQuery(query: string, params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams({ query });
  for (const [k, v] of Object.entries(params)) {
    qs.set(`$${k}`, JSON.stringify(v));
  }
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2025-03-29/data/query/${SANITY_DATASET}?${qs}`;
  const headers: Record<string, string> = {};
  if (SANITY_TOKEN) headers.Authorization = `Bearer ${SANITY_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sanity API error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.result;
}

// ── Helpers ────────────────────────────────────────────────────────
function getWebflowSlug(item: any): string {
  return item.fieldData?.slug || item.slug || '';
}

function getWebflowName(item: any): string {
  return item.fieldData?.name || item.fieldData?.title || item.name || '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function sample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       WEBFLOW → SANITY MIGRATION VERIFICATION REPORT       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();

  let totalWebflow = 0;
  let totalSanity = 0;
  let totalMissing = 0;
  const issues: string[] = [];

  // Store fetched data for cross-reference checks
  let sanityClients: any[] = [];

  for (const [name, { webflowId, sanityType }] of Object.entries(COLLECTIONS)) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`  ${name.toUpperCase()} (Webflow: ${webflowId} → Sanity: ${sanityType})`);
    console.log(`${'─'.repeat(60)}`);

    // Fetch from both sources
    let wfItems: any[];
    try {
      wfItems = await fetchAllWebflowItems(webflowId);
    } catch (e: any) {
      console.log(`  ⚠ Webflow fetch failed: ${e.message}`);
      issues.push(`${name}: Webflow fetch failed`);
      continue;
    }

    // Filter to published only (isDraft === false or not present)
    const publishedWf = wfItems.filter(item => !item.isDraft);

    let sanityItems: any[];
    try {
      sanityItems = await sanityQuery(
        `*[_type == $type]{ _id, _type, slug, title, name, "slugCurrent": slug.current }`,
        { type: sanityType }
      );
    } catch (e: any) {
      console.log(`  ⚠ Sanity fetch failed: ${e.message}`);
      issues.push(`${name}: Sanity fetch failed`);
      continue;
    }

    // Store clients for later reference check
    if (name === 'clients') {
      sanityClients = sanityItems;
    }

    // Count comparison
    const wfCount = publishedWf.length;
    const snCount = sanityItems.length;
    totalWebflow += wfCount;
    totalSanity += snCount;

    const countMatch = wfCount === snCount ? '✓' : '✗';
    console.log(`  Count: Webflow=${wfCount}  Sanity=${snCount}  ${countMatch}`);

    if (wfCount !== snCount) {
      issues.push(`${name}: count mismatch (WF=${wfCount}, Sanity=${snCount})`);
    }

    // Slug-by-slug comparison
    const sanitySlugSet = new Set(
      sanityItems.map((s: any) => s.slugCurrent || s.slug?.current || s.slug || '').filter(Boolean)
    );
    const wfSlugs = publishedWf.map(getWebflowSlug).filter(Boolean);
    const missingSlugs = wfSlugs.filter(s => !sanitySlugSet.has(s));

    if (missingSlugs.length > 0) {
      totalMissing += missingSlugs.length;
      console.log(`  Missing in Sanity (${missingSlugs.length}):`);
      for (const slug of missingSlugs.slice(0, 10)) {
        console.log(`    - ${slug}`);
      }
      if (missingSlugs.length > 10) {
        console.log(`    ... and ${missingSlugs.length - 10} more`);
      }
      issues.push(`${name}: ${missingSlugs.length} items missing from Sanity`);
    } else if (wfSlugs.length > 0) {
      console.log(`  Slug coverage: all ${wfSlugs.length} Webflow slugs found in Sanity ✓`);
    }

    // Extra items in Sanity (not in Webflow)
    const wfSlugSet = new Set(wfSlugs);
    const sanitySlugArr = sanityItems.map((s: any) => s.slugCurrent || s.slug?.current || s.slug || '').filter(Boolean);
    const extraInSanity = sanitySlugArr.filter((s: string) => !wfSlugSet.has(s));
    if (extraInSanity.length > 0) {
      console.log(`  Extra in Sanity (${extraInSanity.length}):`);
      for (const slug of extraInSanity.slice(0, 5)) {
        console.log(`    + ${slug}`);
      }
    }

    // Sample field comparison (3 items)
    const sampled = sample(publishedWf, 3);
    if (sampled.length > 0) {
      console.log(`  Field comparison (${sampled.length} sampled items):`);
      const sanityBySlug = new Map(
        sanityItems.map((s: any) => [s.slugCurrent || s.slug?.current || s.slug || '', s])
      );
      for (const wfItem of sampled) {
        const slug = getWebflowSlug(wfItem);
        const wfName = getWebflowName(wfItem);
        const snItem = sanityBySlug.get(slug);
        if (!snItem) {
          console.log(`    ${slug}: NOT FOUND in Sanity`);
          continue;
        }
        const snName = snItem.name || snItem.title || '';
        const nameMatch = wfName === snName ? '✓' : '✗';
        console.log(`    ${slug}:`);
        console.log(`      name: WF="${wfName}" → SN="${snName}" ${nameMatch}`);
        if (wfName !== snName) {
          issues.push(`${name}/${slug}: name mismatch`);
        }
      }
    }
  }

  // ── Blog content comparison (first 50 chars of 5 random posts) ──
  console.log(`\n${'─'.repeat(60)}`);
  console.log('  BLOG CONTENT COMPARISON (5 random posts, first 50 chars)');
  console.log(`${'─'.repeat(60)}`);

  try {
    const wfBlogItems = await fetchAllWebflowItems(COLLECTIONS['blog'].webflowId);
    const publishedBlog = wfBlogItems.filter(item => !item.isDraft);

    // Fetch Sanity blog posts with body text
    const sanityBlogPosts = await sanityQuery(
      `*[_type == "blogPost"]{
        "slugCurrent": slug.current,
        title,
        "bodyText": pt::text(body),
        "bodyRaw": body[0..2]
      }`
    );

    const sanityBlogBySlug = new Map(
      sanityBlogPosts.map((s: any) => [s.slugCurrent, s])
    );

    const blogSample = sample(publishedBlog, 5);
    for (const wfPost of blogSample) {
      const slug = getWebflowSlug(wfPost);
      const wfContent = wfPost.fieldData?.['post-body'] || wfPost.fieldData?.['blog-content'] || wfPost.fieldData?.content || '';
      const wfText = stripHtml(wfContent).slice(0, 50);

      const snPost = sanityBlogBySlug.get(slug);
      if (!snPost) {
        console.log(`  ${slug}: NOT FOUND in Sanity`);
        continue;
      }
      const snText = ((snPost as Record<string, unknown>).bodyText as string || '').slice(0, 50);

      console.log(`  ${slug}:`);
      console.log(`    WF: "${wfText}"`);
      console.log(`    SN: "${snText}"`);
      if (wfText && snText) {
        // Normalize whitespace for comparison
        const wfNorm = wfText.replace(/\s+/g, ' ').toLowerCase();
        const snNorm = snText.replace(/\s+/g, ' ').toLowerCase();
        const match = wfNorm === snNorm ? '✓ exact match' :
          wfNorm.slice(0, 30) === snNorm.slice(0, 30) ? '~ partial match' : '✗ different';
        console.log(`    ${match}`);
      }
    }
  } catch (e: any) {
    console.log(`  ⚠ Blog content comparison failed: ${e.message}`);
  }

  // ── Case study → client reference check ──
  console.log(`\n${'─'.repeat(60)}`);
  console.log('  CASE STUDY → CLIENT REFERENCE CHECK');
  console.log(`${'─'.repeat(60)}`);

  try {
    const sanityCaseStudies = await sanityQuery(
      `*[_type == "caseStudy"]{
        "slugCurrent": slug.current,
        title,
        name,
        "clientRef": client._ref,
        "clientName": client->name
      }`
    );

    const sanityClientIds = new Set(sanityClients.map((c: any) => c._id));
    let validRefs = 0;
    let brokenRefs = 0;
    let noRefs = 0;

    for (const cs of sanityCaseStudies) {
      if (!cs.clientRef) {
        noRefs++;
        continue;
      }
      if (sanityClientIds.has(cs.clientRef)) {
        validRefs++;
      } else {
        brokenRefs++;
        console.log(`  BROKEN: "${cs.name || cs.title}" → client ref ${cs.clientRef} (resolved: ${cs.clientName || 'null'})`);
        issues.push(`case-study/${cs.slugCurrent}: broken client reference`);
      }
    }

    console.log(`  Total: ${sanityCaseStudies.length} case studies`);
    console.log(`  Valid client refs: ${validRefs} ✓`);
    console.log(`  Broken client refs: ${brokenRefs} ${brokenRefs > 0 ? '✗' : '✓'}`);
    console.log(`  No client ref: ${noRefs}`);
  } catch (e: any) {
    console.log(`  ⚠ Reference check failed: ${e.message}`);
  }

  // ── Summary ──────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  SUMMARY');
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Total Webflow items: ${totalWebflow}`);
  console.log(`  Total Sanity items:  ${totalSanity}`);
  console.log(`  Missing from Sanity: ${totalMissing}`);
  console.log();

  if (issues.length === 0) {
    console.log('  ✓ MIGRATION LOOKS COMPLETE — no issues found');
  } else {
    console.log(`  ✗ ${issues.length} ISSUE(S) FOUND:`);
    for (const issue of issues) {
      console.log(`    - ${issue}`);
    }
  }
  console.log();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
