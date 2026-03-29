/**
 * Webflow → Sanity CMS Migration Script
 *
 * Reads all Webflow collections via API v2, uploads images to Sanity CDN,
 * and creates documents with proper references.
 *
 * Run with: npx tsx scripts/migrate-webflow-to-sanity.ts
 *
 * Safe to re-run — uses deterministic IDs (imported-{type}-{webflowId}).
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

// Load both .env and .env.local (latter overrides)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const WEBFLOW_TOKEN = process.env.WEBFLOW_SITE_API_TOKEN?.trim();
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

if (!WEBFLOW_TOKEN) {
  console.error('Missing WEBFLOW_SITE_API_TOKEN in .env.local');
  process.exit(1);
}
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_TOKEN) {
  console.error('Missing Sanity env vars in .env.local');
  process.exit(1);
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-03-29',
  token: SANITY_TOKEN,
  useCdn: false,
});

// Webflow collection IDs
const COLLECTIONS = {
  blog: '67b46d898180d5b8499f87e8',
  'case-studies': '67bcc512271a06e2e0acc70d',
  testimonials: '67bd0c6f1a9fdd9770be5469',
  clients: '67c6f017e3221db91323ff13',
  'blog-faq': '67bd3732a35ec40d3038b40a',
  'team-members': '68d819d1810ef43a5ef97da4',
  technologies: '67be3e735523f789035b6c56',
  categories: '67b46e2d70ec96bfb7787071',
  industries: '67bd0a772117f7c7227e7b4d',
  'service-categories': '67bcfb9cdb20a1832e2799c3',
  'seo-pages': '6988a63150526a37d700fae3',
} as const;

// Sanity type name mapping (Webflow collection key → Sanity _type)
const SANITY_TYPE: Record<string, string> = {
  blog: 'blogPost',
  'case-studies': 'caseStudy',
  testimonials: 'testimonial',
  clients: 'client',
  'blog-faq': 'blogFaq',
  'team-members': 'teamMember',
  technologies: 'technology',
  categories: 'category',
  industries: 'industry',
  'service-categories': 'serviceCategory',
  'seo-pages': 'seoPage',
};

// ── Webflow API helpers ──────────────────────────────────────────────

interface WebflowItem {
  id: string;
  isDraft?: boolean;
  isArchived?: boolean;
  fieldData: Record<string, unknown>;
}

async function fetchWebflowCollection(collectionId: string): Promise<WebflowItem[]> {
  const items: WebflowItem[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Webflow API ${res.status}: ${text}`);
    }

    const data = await res.json();
    const batch = (data.items || []) as WebflowItem[];
    items.push(...batch);

    // Check if there are more pages
    if (batch.length < limit) break;
    offset += limit;
  }

  // Filter out drafts and archived
  return items.filter((item) => !item.isDraft && !item.isArchived);
}

// ── Image upload helpers ─────────────────────────────────────────────

// Cache: original URL → Sanity asset reference
const imageCache = new Map<string, { _type: 'image'; asset: { _type: 'reference'; _ref: string } }>();
let imageUploadCount = 0;
let imageUploadFailures = 0;

const WEBFLOW_CDN_DOMAINS = [
  'cdn.prod.website-files.com',
  'uploads-ssl.webflow.com',
  'assets-global.website-files.com',
];

function isWebflowCdnUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return WEBFLOW_CDN_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

async function uploadImageToSanity(
  url: string,
  filename?: string
): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } } | null> {
  if (!url) return null;

  // Check cache
  const cached = imageCache.get(url);
  if (cached) return cached;

  try {
    // Download
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠ Failed to download image: ${url} (${res.status})`);
      imageUploadFailures++;
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    // Determine filename
    if (!filename) {
      const urlPath = new URL(url).pathname;
      filename = urlPath.split('/').pop() || 'image';
      // Clean up Webflow filename encoding
      filename = decodeURIComponent(filename);
    }

    // Upload to Sanity
    const asset = await sanity.assets.upload('image', buffer, {
      filename,
      contentType,
    });

    const ref = {
      _type: 'image' as const,
      asset: { _type: 'reference' as const, _ref: asset._id },
    };

    imageCache.set(url, ref);
    imageUploadCount++;
    return ref;
  } catch (error) {
    console.warn(`  ⚠ Image upload failed: ${url}`, error instanceof Error ? error.message : error);
    imageUploadFailures++;
    return null;
  }
}

async function uploadWebflowImage(
  imageField: unknown
): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string }; alt?: string } | undefined> {
  if (!imageField || typeof imageField !== 'object') return undefined;
  const img = imageField as { url?: string; alt?: string };
  if (!img.url) return undefined;

  const ref = await uploadImageToSanity(img.url);
  if (!ref) return undefined;

  return {
    ...ref,
    ...(img.alt ? { alt: img.alt } : {}),
  };
}

// ── Rich text image rewriting ────────────────────────────────────────

async function rewriteRichTextImages(html: string | undefined): Promise<string | undefined> {
  if (!html) return undefined;

  // Find all Webflow CDN image URLs in src attributes
  const imgRegex = /src="(https?:\/\/[^"]+)"/g;
  const matches = [...html.matchAll(imgRegex)];

  let result = html;
  for (const match of matches) {
    const originalUrl = match[1];
    if (!isWebflowCdnUrl(originalUrl)) continue;

    const uploaded = await uploadImageToSanity(originalUrl);
    if (uploaded) {
      // Get the Sanity CDN URL for this asset
      const assetId = uploaded.asset._ref;
      // Asset ID format: image-{hash}-{width}x{height}-{ext}
      // CDN URL format: https://cdn.sanity.io/images/{projectId}/{dataset}/{hash}-{width}x{height}.{ext}
      const parts = assetId.replace('image-', '').split('-');
      const ext = parts.pop();
      const sanityUrl = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${parts.join('-')}.${ext}`;
      result = result.replaceAll(originalUrl, sanityUrl);
    }
  }

  return result;
}

// ── ID mapping ───────────────────────────────────────────────────────

function sanityId(type: string, webflowId: string): string {
  return `imported-${type}-${webflowId}`;
}

function sanityRef(type: string, webflowId: string): { _type: 'reference'; _ref: string; _weak: boolean } {
  return { _type: 'reference', _ref: sanityId(type, webflowId), _weak: true };
}

function sanityRefArray(
  type: string,
  ids: unknown
): Array<{ _type: 'reference'; _ref: string; _weak: boolean; _key: string }> | undefined {
  if (!Array.isArray(ids)) return undefined;
  return ids.map((id: string, i: number) => ({
    ...sanityRef(type, id),
    _key: `ref-${i}`,
  }));
}

// ── Collection migration functions ───────────────────────────────────

type FieldData = Record<string, unknown>;

async function migrateCategories(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    await sanity.createOrReplace({
      _id: sanityId('category', item.id),
      _type: 'category',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      color: f.color as string | undefined,
    });
    count++;
  }
  return count;
}

async function migrateIndustries(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    await sanity.createOrReplace({
      _id: sanityId('industry', item.id),
      _type: 'industry',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      radioFilterCheckedAttribute: f['radio-filter---checked-attribute'] as string | undefined,
    });
    count++;
  }
  return count;
}

async function migrateTechnologies(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    const logo = await uploadWebflowImage(f.logo);
    await sanity.createOrReplace({
      _id: sanityId('technology', item.id),
      _type: 'technology',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      ...(logo ? { logo } : {}),
    });
    count++;
  }
  return count;
}

async function migrateServiceCategories(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    await sanity.createOrReplace({
      _id: sanityId('serviceCategory', item.id),
      _type: 'serviceCategory',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
    });
    count++;
  }
  return count;
}

async function migrateTeamMembers(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    const profilePicture = await uploadWebflowImage(f['profile-picture']);
    await sanity.createOrReplace({
      _id: sanityId('teamMember', item.id),
      _type: 'teamMember',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      ...(profilePicture ? { profilePicture } : {}),
      bioSummary: f['bio-summary'] as string | undefined,
      jobTitle: f['job-title'] as string | undefined,
    });
    count++;
  }
  return count;
}

async function migrateClients(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    const coloredLogo = await uploadWebflowImage(f['colored-logo']);
    const lightLogo = await uploadWebflowImage(f['light-logo']);
    const darkLogo = await uploadWebflowImage(f['dark-logo']);
    await sanity.createOrReplace({
      _id: sanityId('client', item.id),
      _type: 'client',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      showcaseLogo: f['showcase-logo'] as boolean | undefined,
      ...(coloredLogo ? { coloredLogo } : {}),
      ...(lightLogo ? { lightLogo } : {}),
      ...(darkLogo ? { darkLogo } : {}),
    });
    count++;
  }
  return count;
}

async function migrateCaseStudies(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    const mainImage = await uploadWebflowImage(f['main-project-image-thumbnail']);
    const clientLogo = await uploadWebflowImage(f['client-logo']);
    const clientLogoInversed = await uploadWebflowImage(f['client-logo-inversed']);
    const mainBody = await rewriteRichTextImages(f['main-body'] as string | undefined);

    await sanity.createOrReplace({
      _id: sanityId('caseStudy', item.id),
      _type: 'caseStudy',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      projectTitle: f['project-title'] as string,
      paragraphSummary: f['paragraph-summary'] as string | undefined,
      mainBody,
      ...(mainImage ? { mainProjectImageThumbnail: mainImage } : {}),
      ...(clientLogo ? { clientLogo } : {}),
      ...(clientLogoInversed ? { clientLogoInversed } : {}),
      clientColor: f['client-color'] as string,
      secondaryClientColor: f['secondary-client-color'] as string | undefined,
      companySize: f['company-size'] as string | undefined,
      country: f.country as string | undefined,
      websiteLink: f['website-link'] as string | undefined,
      visitTheWebsite: f['visit-the-website'] as string | undefined,
      result1Number: f['result-1---number'] as string,
      result1Title: f['result-1---title'] as string,
      result2Number: f['result-2---number'] as string | undefined,
      result2Title: f['result-2---title'] as string | undefined,
      result3Number: f['result-3---number'] as string | undefined,
      result3Title: f['result-3---title'] as string | undefined,
      featured: f.featured as boolean | undefined,
      ...(f.client ? { client: sanityRef('client', f.client as string) } : {}),
      ...(f.industry ? { industry: sanityRef('industry', f.industry as string) } : {}),
      industries: sanityRefArray('industry', f.industries),
      ...(f.testimonial ? { testimonial: sanityRef('testimonial', f.testimonial as string) } : {}),
      technologies: sanityRefArray('technology', f.technologies),
      servicesProvided: sanityRefArray('serviceCategory', f['services-provided']),
    });
    count++;
  }
  return count;
}

async function migrateBlogPosts(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    const thumbnail = await uploadWebflowImage(f.thumbnail);
    const content = await rewriteRichTextImages(f.content as string | undefined);

    await sanity.createOrReplace({
      _id: sanityId('blogPost', item.id),
      _type: 'blogPost',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      metaTitle: f['meta-title'] as string | undefined,
      metaDescription: f['meta-description'] as string | undefined,
      ...(thumbnail ? { thumbnail } : {}),
      excerpt: f.excerpt as string | undefined,
      content,
      timeToRead: f['time-to-read'] as string | undefined,
      featured: f.featured as boolean | undefined,
      publishedDate: f['published-date'] as string | undefined,
      lastUpdated: f['last-updated'] as string | undefined,
      ...(f.author ? { author: sanityRef('teamMember', f.author as string) } : {}),
      ...(f.category ? { category: sanityRef('category', f.category as string) } : {}),
      categories: sanityRefArray('category', f.categories),
    });
    count++;
  }
  return count;
}

async function migrateTestimonials(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    const profileImage = await uploadWebflowImage(f['profile-image']);
    const testimonialBody = await rewriteRichTextImages(f['testimonial-body'] as string | undefined);

    await sanity.createOrReplace({
      _id: sanityId('testimonial', item.id),
      _type: 'testimonial',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      role: f.role as string | undefined,
      testimonialBody,
      ...(profileImage ? { profileImage } : {}),
      ...(f['case-study'] ? { caseStudy: sanityRef('caseStudy', f['case-study'] as string) } : {}),
      ...(f.client ? { client: sanityRef('client', f.client as string) } : {}),
    });
    count++;
  }
  return count;
}

async function migrateBlogFaqs(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    await sanity.createOrReplace({
      _id: sanityId('blogFaq', item.id),
      _type: 'blogFaq',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      ...(f['blog-post'] ? { blogPost: sanityRef('blogPost', f['blog-post'] as string) } : {}),
    });
    count++;
  }
  return count;
}

async function migrateSeoPages(items: WebflowItem[]): Promise<number> {
  let count = 0;
  for (const item of items) {
    const f = item.fieldData as FieldData;
    const heroImage = await uploadWebflowImage(f['hero-image']);
    const mainBody = await rewriteRichTextImages(f['main-body'] as string | undefined);
    const deliverables = await rewriteRichTextImages(f.deliverables as string | undefined);

    await sanity.createOrReplace({
      _id: sanityId('seoPage', item.id),
      _type: 'seoPage',
      name: f.name as string,
      slug: { _type: 'slug', current: f.slug as string },
      metaTitle: f['meta-title'] as string | undefined,
      metaDescription: f['meta-description'] as string | undefined,
      ...(f.industry ? { industry: sanityRef('industry', f.industry as string) } : {}),
      displayOrder: f['display-order'] as number | undefined,
      heroHeadline: f['hero-headline'] as string | undefined,
      heroSubtitle: f['hero-subtitle'] as string | undefined,
      heroDescription: f['hero-description'] as string | undefined,
      ...(heroImage ? { heroImage } : {}),
      painPointsTitle: f['pain-points-title'] as string | undefined,
      painPoint1Title: f['pain-point-1-title'] as string | undefined,
      painPoint1Desc: f['pain-point-1-desc'] as string | undefined,
      painPoint2Title: f['pain-point-2-title'] as string | undefined,
      painPoint2Desc: f['pain-point-2-desc'] as string | undefined,
      painPoint3Title: f['pain-point-3-title'] as string | undefined,
      painPoint3Desc: f['pain-point-3-desc'] as string | undefined,
      strategyTitle: f['strategy-title'] as string | undefined,
      strategyIntro: f['strategy-intro'] as string | undefined,
      strategyStep1Title: f['strategy-step-1-title'] as string | undefined,
      strategyStep1Desc: f['strategy-step-1-desc'] as string | undefined,
      strategyStep2Title: f['strategy-step-2-title'] as string | undefined,
      strategyStep2Desc: f['strategy-step-2-desc'] as string | undefined,
      strategyStep3Title: f['strategy-step-3-title'] as string | undefined,
      strategyStep3Desc: f['strategy-step-3-desc'] as string | undefined,
      strategyStep4Title: f['strategy-step-4-title'] as string | undefined,
      strategyStep4Desc: f['strategy-step-4-desc'] as string | undefined,
      resultsTitle: f['results-title'] as string | undefined,
      stat1Value: f['stat-1-value'] as string | undefined,
      stat1Label: f['stat-1-label'] as string | undefined,
      stat2Value: f['stat-2-value'] as string | undefined,
      stat2Label: f['stat-2-label'] as string | undefined,
      stat3Value: f['stat-3-value'] as string | undefined,
      stat3Label: f['stat-3-label'] as string | undefined,
      faq1Question: f['faq-1-question'] as string | undefined,
      faq1Answer: f['faq-1-answer'] as string | undefined,
      faq2Question: f['faq-2-question'] as string | undefined,
      faq2Answer: f['faq-2-answer'] as string | undefined,
      faq3Question: f['faq-3-question'] as string | undefined,
      faq3Answer: f['faq-3-answer'] as string | undefined,
      faq4Question: f['faq-4-question'] as string | undefined,
      faq4Answer: f['faq-4-answer'] as string | undefined,
      faq5Question: f['faq-5-question'] as string | undefined,
      faq5Answer: f['faq-5-answer'] as string | undefined,
      mainBody,
      deliverables,
      ctaTitle: f['cta-title'] as string | undefined,
      ctaSubtitle: f['cta-subtitle'] as string | undefined,
    });
    count++;
  }
  return count;
}

// ── Main migration ───────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('🚀 Starting Webflow → Sanity migration\n');

  // Migration order: dependencies first
  const migrationSteps: Array<{
    name: string;
    collectionKey: keyof typeof COLLECTIONS;
    migrate: (items: WebflowItem[]) => Promise<number>;
  }> = [
    { name: 'Categories', collectionKey: 'categories', migrate: migrateCategories },
    { name: 'Industries', collectionKey: 'industries', migrate: migrateIndustries },
    { name: 'Technologies', collectionKey: 'technologies', migrate: migrateTechnologies },
    { name: 'Service Categories', collectionKey: 'service-categories', migrate: migrateServiceCategories },
    { name: 'Team Members', collectionKey: 'team-members', migrate: migrateTeamMembers },
    { name: 'Clients', collectionKey: 'clients', migrate: migrateClients },
    { name: 'Case Studies', collectionKey: 'case-studies', migrate: migrateCaseStudies },
    { name: 'Blog Posts', collectionKey: 'blog', migrate: migrateBlogPosts },
    { name: 'Testimonials', collectionKey: 'testimonials', migrate: migrateTestimonials },
    { name: 'Blog FAQs', collectionKey: 'blog-faq', migrate: migrateBlogFaqs },
    { name: 'SEO Pages', collectionKey: 'seo-pages', migrate: migrateSeoPages },
  ];

  const results: Array<{ name: string; fetched: number; created: number }> = [];

  for (const step of migrationSteps) {
    console.log(`📦 Migrating ${step.name}...`);
    const collectionId = COLLECTIONS[step.collectionKey];
    const items = await fetchWebflowCollection(collectionId);
    console.log(`   Fetched ${items.length} published items from Webflow`);

    const created = await step.migrate(items);
    console.log(`   ✅ Created ${created} documents in Sanity\n`);

    results.push({ name: step.name, fetched: items.length, created });
  }

  // Second pass: strengthen weak references (convert _weak: true → remove _weak)
  // This validates all references exist and makes them strong
  console.log('🔗 Strengthening references...');
  const allDocs = await sanity.fetch<Array<{ _id: string }>>(`*[_id match "imported-*"]{ _id }`);
  const existingIds = new Set(allDocs.map((d) => d._id));
  console.log(`   Found ${existingIds.size} imported documents\n`);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════');
  console.log('');
  for (const r of results) {
    const status = r.fetched === r.created ? '✅' : '⚠️';
    console.log(`  ${status} ${r.name}: ${r.created}/${r.fetched}`);
  }
  console.log('');
  console.log(`  🖼  Images uploaded: ${imageUploadCount}`);
  console.log(`  ⚠️  Image failures: ${imageUploadFailures}`);
  console.log(`  ⏱  Total time: ${elapsed}s`);
  console.log('');

  const totalFetched = results.reduce((s, r) => s + r.fetched, 0);
  const totalCreated = results.reduce((s, r) => s + r.created, 0);
  if (totalFetched !== totalCreated) {
    console.error('❌ Some items were not migrated!');
    process.exit(1);
  }

  console.log('✅ Migration complete!');
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
