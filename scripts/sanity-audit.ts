/**
 * Sanity CMS Data Integrity Audit
 *
 * Runs GROQ queries to count documents, check required fields,
 * find broken references, and detect leftover Webflow CDN URLs.
 *
 * Usage: npx tsx scripts/sanity-audit.ts
 */

import { createClient } from 'next-sanity';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env vars from .env and .env.local
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local'), override: true });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

// ─── Helpers ─────────────────────────────────────────────
function header(title: string) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function subheader(title: string) {
  console.log(`\n  ── ${title} ──`);
}

const WEBFLOW_CDN_PATTERN = 'uploads-ssl.webflow.com';

// All document types from the schema
const DOC_TYPES = [
  'blogPost', 'caseStudy', 'client', 'testimonial',
  'category', 'industry', 'technology', 'serviceCategory',
  'teamMember', 'blogFaq', 'seoPage',
];

async function run() {
  console.log('Sanity CMS Data Integrity Audit');
  console.log(`Project: ${projectId} | Dataset: ${dataset}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  // ─── 1. Count documents by type ─────────────────────────
  header('1. Document Counts by Type');

  const countQuery = `{
    ${DOC_TYPES.map(t => `"${t}": count(*[_type == "${t}"])`).join(',\n    ')}
  }`;
  const counts: Record<string, number> = await client.fetch(countQuery);

  let totalDocs = 0;
  for (const [type, count] of Object.entries(counts)) {
    console.log(`  ${type.padEnd(20)} ${String(count).padStart(4)}`);
    totalDocs += count;
  }
  console.log(`  ${'─'.repeat(26)}`);
  console.log(`  ${'TOTAL'.padEnd(20)} ${String(totalDocs).padStart(4)}`);

  // Also check for unknown types
  const allTypesQuery = `array::unique(*[]._type)`;
  const allTypes: string[] = await client.fetch(allTypesQuery);
  const unknownTypes = allTypes.filter(t => !DOC_TYPES.includes(t) && !t.startsWith('system.') && !t.startsWith('sanity.'));
  if (unknownTypes.length > 0) {
    console.log(`\n  ⚠ Unknown document types found: ${unknownTypes.join(', ')}`);
  }

  // ─── 2. Missing required fields (name, slug) ───────────
  header('2. Documents Missing Required Fields (name, slug)');

  let missingFieldsTotal = 0;
  for (const type of DOC_TYPES) {
    const missingName = await client.fetch<Array<{_id: string}>>(
      `*[_type == "${type}" && (!defined(name) || name == "")]{ _id }`
    );
    const missingSlug = await client.fetch<Array<{_id: string}>>(
      `*[_type == "${type}" && (!defined(slug) || !defined(slug.current) || slug.current == "")]{ _id }`
    );

    if (missingName.length > 0 || missingSlug.length > 0) {
      console.log(`  ${type}:`);
      if (missingName.length > 0) {
        console.log(`    Missing name: ${missingName.length} docs — ${missingName.map(d => d._id).join(', ')}`);
        missingFieldsTotal += missingName.length;
      }
      if (missingSlug.length > 0) {
        console.log(`    Missing slug: ${missingSlug.length} docs — ${missingSlug.map(d => d._id).join(', ')}`);
        missingFieldsTotal += missingSlug.length;
      }
    }
  }
  if (missingFieldsTotal === 0) {
    console.log('  All documents have name and slug fields. OK');
  }

  // ─── 3. Broken references ──────────────────────────────
  header('3. Broken References');

  // Find all references and check if targets exist
  const brokenRefsQuery = `*[_type in $types]{
    _id,
    _type,
    "refs": {
      "author": author._ref,
      "category": category._ref,
      "client": client._ref,
      "industry": industry._ref,
      "testimonial": testimonial._ref,
      "categories": categories[]._ref,
      "industries": industries[]._ref,
      "technologies": technologies[]._ref,
      "servicesProvided": servicesProvided[]._ref,
      "caseStudy": caseStudy._ref
    }
  }`;

  const docsWithRefs = await client.fetch<Array<{_id: string; _type: string; refs: Record<string, string | string[] | null>}>>(
    brokenRefsQuery,
    { types: DOC_TYPES }
  );

  // Collect all referenced IDs
  const allRefIds = new Set<string>();
  for (const doc of docsWithRefs) {
    for (const val of Object.values(doc.refs)) {
      if (typeof val === 'string' && val) allRefIds.add(val);
      if (Array.isArray(val)) val.filter(Boolean).forEach(id => allRefIds.add(id));
    }
  }

  // Check which IDs exist
  const existingIds = new Set<string>();
  if (allRefIds.size > 0) {
    const refArray = Array.from(allRefIds);
    // Query in batches of 200
    for (let i = 0; i < refArray.length; i += 200) {
      const batch = refArray.slice(i, i + 200);
      const existing = await client.fetch<string[]>(
        `*[_id in $ids]._id`,
        { ids: batch }
      );
      existing.forEach(id => existingIds.add(id));
    }
  }

  let brokenCount = 0;
  for (const doc of docsWithRefs) {
    const broken: string[] = [];
    for (const [field, val] of Object.entries(doc.refs)) {
      if (typeof val === 'string' && val && !existingIds.has(val)) {
        broken.push(`${field} -> ${val}`);
      }
      if (Array.isArray(val)) {
        for (const id of val) {
          if (id && !existingIds.has(id)) {
            broken.push(`${field}[] -> ${id}`);
          }
        }
      }
    }
    if (broken.length > 0) {
      console.log(`  ${doc._type} "${doc._id}": ${broken.join(', ')}`);
      brokenCount += broken.length;
    }
  }
  if (brokenCount === 0) {
    console.log('  No broken references found. OK');
  } else {
    console.log(`\n  Total broken references: ${brokenCount}`);
  }

  // ─── 4. Images missing asset URLs ─────────────────────
  header('4. Images Missing Asset URLs');

  // Check key image fields across types
  const imageChecks: Array<{ type: string; field: string; label: string }> = [
    { type: 'blogPost', field: 'thumbnail', label: 'Blog Post thumbnail' },
    { type: 'caseStudy', field: 'mainProjectImageThumbnail', label: 'Case Study main image' },
    { type: 'caseStudy', field: 'clientLogo', label: 'Case Study client logo' },
    { type: 'client', field: 'coloredLogo', label: 'Client colored logo' },
    { type: 'client', field: 'lightLogo', label: 'Client light logo' },
    { type: 'client', field: 'darkLogo', label: 'Client dark logo' },
    { type: 'testimonial', field: 'profileImage', label: 'Testimonial profile image' },
    { type: 'teamMember', field: 'profileImage', label: 'Team Member profile image' },
  ];

  let missingAssets = 0;
  for (const check of imageChecks) {
    const missing = await client.fetch<Array<{_id: string; name: string}>>(
      `*[_type == "${check.type}" && defined(${check.field}) && !defined(${check.field}.asset)]{_id, name}`
    );
    if (missing.length > 0) {
      console.log(`  ${check.label}: ${missing.length} docs have field but no asset`);
      missing.forEach(d => console.log(`    - ${d.name || d._id}`));
      missingAssets += missing.length;
    }
  }
  if (missingAssets === 0) {
    console.log('  All image fields with data have valid asset references. OK');
  }

  // ─── 5. Blog posts content field ──────────────────────
  header('5. Blog Posts — Content Field');

  const blogContentQuery = `{
    "total": count(*[_type == "blogPost"]),
    "withContent": count(*[_type == "blogPost" && defined(content) && content != ""]),
    "withoutContent": count(*[_type == "blogPost" && (!defined(content) || content == "")]),
    "emptyList": *[_type == "blogPost" && (!defined(content) || content == "")]{ _id, name }
  }`;
  const blogContent = await client.fetch<{total: number; withContent: number; withoutContent: number; emptyList: Array<{_id: string; name: string}>}>(blogContentQuery);

  console.log(`  Total blog posts:      ${blogContent.total}`);
  console.log(`  With content:          ${blogContent.withContent}`);
  console.log(`  Missing content:       ${blogContent.withoutContent}`);
  if (blogContent.emptyList.length > 0) {
    subheader('Blog posts without content');
    blogContent.emptyList.forEach(p => console.log(`    - ${p.name || p._id}`));
  }

  // ─── 6. Case studies required result fields ───────────
  header('6. Case Studies — Required Result Fields');

  const csResultsQuery = `{
    "total": count(*[_type == "caseStudy"]),
    "withResult1": count(*[_type == "caseStudy" && defined(result1Number) && result1Number != "" && defined(result1Title) && result1Title != ""]),
    "missingResult1": *[_type == "caseStudy" && (!defined(result1Number) || result1Number == "" || !defined(result1Title) || result1Title == "")]{ _id, name, result1Number, result1Title }
  }`;
  const csResults = await client.fetch<{total: number; withResult1: number; missingResult1: Array<{_id: string; name: string; result1Number: string; result1Title: string}>}>(csResultsQuery);

  console.log(`  Total case studies:     ${csResults.total}`);
  console.log(`  With result1 complete:  ${csResults.withResult1}`);
  console.log(`  Missing result1 data:   ${csResults.missingResult1.length}`);
  if (csResults.missingResult1.length > 0) {
    subheader('Case studies missing result1Number or result1Title');
    csResults.missingResult1.forEach(cs => {
      console.log(`    - ${cs.name || cs._id} (num: ${cs.result1Number || 'MISSING'}, title: ${cs.result1Title || 'MISSING'})`);
    });
  }

  // ─── 7. Documents with empty/null slug ────────────────
  header('7. Documents with Empty/Null Slug');

  let emptySlugTotal = 0;
  for (const type of DOC_TYPES) {
    const emptySlugs = await client.fetch<Array<{_id: string; name: string}>>(
      `*[_type == "${type}" && (!defined(slug) || !defined(slug.current) || slug.current == "")]{ _id, name }`
    );
    if (emptySlugs.length > 0) {
      console.log(`  ${type}: ${emptySlugs.length} docs`);
      emptySlugs.forEach(d => console.log(`    - ${d.name || d._id}`));
      emptySlugTotal += emptySlugs.length;
    }
  }
  if (emptySlugTotal === 0) {
    console.log('  All documents have valid slugs. OK');
  }

  // ─── 8. Blog posts with/without thumbnails ────────────
  header('8. Blog Post Thumbnails');

  const blogThumbQuery = `{
    "total": count(*[_type == "blogPost"]),
    "withThumb": count(*[_type == "blogPost" && defined(thumbnail) && defined(thumbnail.asset)]),
    "withoutThumb": count(*[_type == "blogPost" && (!defined(thumbnail) || !defined(thumbnail.asset))]),
    "missingList": *[_type == "blogPost" && (!defined(thumbnail) || !defined(thumbnail.asset))]{ _id, name }
  }`;
  const blogThumbs = await client.fetch<{total: number; withThumb: number; withoutThumb: number; missingList: Array<{_id: string; name: string}>}>(blogThumbQuery);

  console.log(`  Total blog posts:      ${blogThumbs.total}`);
  console.log(`  With thumbnail:        ${blogThumbs.withThumb}`);
  console.log(`  Without thumbnail:     ${blogThumbs.withoutThumb}`);
  if (blogThumbs.missingList.length > 0) {
    subheader('Blog posts without thumbnails');
    blogThumbs.missingList.forEach(p => console.log(`    - ${p.name || p._id}`));
  }

  // ─── 9. Clients with/without colored logos ────────────
  header('9. Client Colored Logos');

  const clientLogoQuery = `{
    "total": count(*[_type == "client"]),
    "withLogo": count(*[_type == "client" && defined(coloredLogo) && defined(coloredLogo.asset)]),
    "withoutLogo": count(*[_type == "client" && (!defined(coloredLogo) || !defined(coloredLogo.asset))]),
    "missingList": *[_type == "client" && (!defined(coloredLogo) || !defined(coloredLogo.asset))]{ _id, name }
  }`;
  const clientLogos = await client.fetch<{total: number; withLogo: number; withoutLogo: number; missingList: Array<{_id: string; name: string}>}>(clientLogoQuery);

  console.log(`  Total clients:         ${clientLogos.total}`);
  console.log(`  With colored logo:     ${clientLogos.withLogo}`);
  console.log(`  Without colored logo:  ${clientLogos.withoutLogo}`);
  if (clientLogos.missingList.length > 0) {
    subheader('Clients without colored logos');
    clientLogos.missingList.forEach(c => console.log(`    - ${c.name || c._id}`));
  }

  // ─── 10. Webflow CDN URLs in rich text fields ─────────
  header('10. Webflow CDN URLs in Rich Text Fields');

  // Check mainBody, content, testimonialBody for Webflow CDN references
  const richTextChecks: Array<{ type: string; field: string; label: string }> = [
    { type: 'caseStudy', field: 'mainBody', label: 'Case Study mainBody' },
    { type: 'blogPost', field: 'content', label: 'Blog Post content' },
    { type: 'testimonial', field: 'testimonialBody', label: 'Testimonial body' },
  ];

  let webflowUrlTotal = 0;
  for (const check of richTextChecks) {
    const withWebflow = await client.fetch<Array<{_id: string; name: string; field: string}>>(
      `*[_type == "${check.type}" && ${check.field} match "*${WEBFLOW_CDN_PATTERN}*"]{ _id, name, "field": ${check.field} }`
    );
    if (withWebflow.length > 0) {
      console.log(`  ${check.label}: ${withWebflow.length} docs contain Webflow CDN URLs`);
      for (const doc of withWebflow) {
        // Extract the actual URLs
        const urls = (doc.field || '').match(/https?:\/\/uploads-ssl\.webflow\.com[^\s"')>]*/g) || [];
        console.log(`    - ${doc.name || doc._id} (${urls.length} URLs)`);
        urls.slice(0, 3).forEach(u => console.log(`      ${u}`));
        if (urls.length > 3) console.log(`      ... and ${urls.length - 3} more`);
      }
      webflowUrlTotal += withWebflow.length;
    }
  }

  // Also check image fields that might still point to Webflow via external URL stored as string
  // (This would be if images were stored as URL strings instead of Sanity image references)
  const imageUrlChecks = await client.fetch<Array<{_id: string; _type: string; name: string}>>(
    `*[_type in $types && (
      mainProjectImageThumbnail.asset._ref match "*webflow*" ||
      thumbnail.asset._ref match "*webflow*" ||
      coloredLogo.asset._ref match "*webflow*" ||
      profileImage.asset._ref match "*webflow*"
    )]{ _id, _type, name }`,
    { types: DOC_TYPES }
  );
  if (imageUrlChecks.length > 0) {
    console.log(`\n  Image asset refs containing "webflow": ${imageUrlChecks.length}`);
    imageUrlChecks.forEach(d => console.log(`    - ${d._type}: ${d.name || d._id}`));
    webflowUrlTotal += imageUrlChecks.length;
  }

  if (webflowUrlTotal === 0) {
    console.log('  No Webflow CDN URLs found in rich text or image fields. OK');
  }

  // ─── Summary ──────────────────────────────────────────
  header('SUMMARY');

  const issues: string[] = [];
  if (missingFieldsTotal > 0) issues.push(`${missingFieldsTotal} documents missing required fields`);
  if (brokenCount > 0) issues.push(`${brokenCount} broken references`);
  if (missingAssets > 0) issues.push(`${missingAssets} images with missing asset URLs`);
  if (blogContent.withoutContent > 0) issues.push(`${blogContent.withoutContent} blog posts without content`);
  if (csResults.missingResult1.length > 0) issues.push(`${csResults.missingResult1.length} case studies missing result1 data`);
  if (emptySlugTotal > 0) issues.push(`${emptySlugTotal} documents with empty slugs`);
  if (blogThumbs.withoutThumb > 0) issues.push(`${blogThumbs.withoutThumb} blog posts without thumbnails`);
  if (clientLogos.withoutLogo > 0) issues.push(`${clientLogos.withoutLogo} clients without colored logos`);
  if (webflowUrlTotal > 0) issues.push(`${webflowUrlTotal} documents with remaining Webflow CDN URLs`);

  if (issues.length === 0) {
    console.log('  All checks passed. No data integrity issues found.');
  } else {
    console.log(`  ${issues.length} issue(s) found:\n`);
    issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
  }

  console.log(`\n  Total documents: ${totalDocs}`);
  console.log('');
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
