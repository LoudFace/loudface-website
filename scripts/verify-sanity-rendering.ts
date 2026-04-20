/**
 * Verify that LoudFace website pages render correctly with Sanity CMS data.
 * Run: npx tsx scripts/verify-sanity-rendering.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from 'next-sanity';

// Load env vars
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local'), override: true });

const BASE_URL = 'http://localhost:3005';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: '2025-03-29',
  useCdn: false,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

interface TestResult {
  test: string;
  passed: boolean;
  detail?: string;
}

const results: TestResult[] = [];

function pass(test: string, detail?: string) {
  results.push({ test, passed: true, detail });
}

function fail(test: string, detail?: string) {
  results.push({ test, passed: false, detail });
}

async function fetchPage(path: string): Promise<{ status: number; html: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Accept': 'text/html' },
      redirect: 'follow',
    });
    const html = await res.text();
    return { status: res.status, html };
  } catch (e: any) {
    return null;
  }
}

const WEBFLOW_CDN_PATTERNS = [
  'cdn.prod.website-files.com',
  'uploads-ssl.webflow.com',
  'assets-global.website-files.com',
];

function hasWebflowCdnUrls(html: string): string[] {
  return WEBFLOW_CDN_PATTERNS.filter(p => html.includes(p));
}

function hasWeservUrls(html: string): boolean {
  return html.includes('images.weserv.nl');
}

function hasSanityCdnUrls(html: string): boolean {
  return html.includes('cdn.sanity.io');
}

// ── Tests ────────────────────────────────────────────────────────────────────

async function testHomepage() {
  console.log('\n── Homepage (/) ──');

  const page = await fetchPage('/');
  if (!page) {
    fail('Homepage: fetch', 'Could not connect to localhost:3005');
    return;
  }

  // HTTP 200
  if (page.status === 200) {
    pass('Homepage: HTTP 200');
  } else {
    fail('Homepage: HTTP 200', `Got ${page.status}`);
  }

  // Fetch case study names from Sanity
  const caseStudies: { title: string; slug: string }[] = await sanity.fetch(
    `*[_type == "caseStudy" && !(_id in path("drafts.**"))][0..10]{ title, "slug": slug.current }`
  );
  if (caseStudies.length > 0) {
    const found = caseStudies.filter(cs => page.html.includes(cs.title));
    if (found.length > 0) {
      pass('Homepage: case study names', `Found ${found.length}/${caseStudies.length}: ${found.map(c => c.title).join(', ')}`);
    } else {
      fail('Homepage: case study names', `None of ${caseStudies.length} case study names found in HTML`);
    }
  } else {
    fail('Homepage: case study names', 'No case studies in Sanity');
  }

  // Client logo images from cdn.sanity.io
  if (hasSanityCdnUrls(page.html)) {
    pass('Homepage: Sanity CDN images', 'Found cdn.sanity.io URLs');
  } else {
    fail('Homepage: Sanity CDN images', 'No cdn.sanity.io URLs found');
  }

  // Blog post titles
  const blogPosts: { title: string }[] = await sanity.fetch(
    `*[_type == "blogPost" && !(_id in path("drafts.**"))][0..5]{ title }`
  );
  if (blogPosts.length > 0) {
    const found = blogPosts.filter(bp => page.html.includes(bp.title));
    if (found.length > 0) {
      pass('Homepage: blog post titles', `Found ${found.length}/${blogPosts.length}`);
    } else {
      fail('Homepage: blog post titles', `None of ${blogPosts.length} blog titles found in HTML`);
    }
  } else {
    fail('Homepage: blog post titles', 'No blog posts in Sanity');
  }

  // No getAccessToken leak
  if (!page.html.includes('getAccessToken')) {
    pass('Homepage: no getAccessToken leak');
  } else {
    fail('Homepage: no getAccessToken leak', 'Found "getAccessToken" text in HTML');
  }
}

async function testBlogPosts() {
  console.log('\n── Blog Posts ──');

  const allPosts: { title: string; slug: string }[] = await sanity.fetch(
    `*[_type == "blogPost" && !(_id in path("drafts.**")) && defined(slug.current)]{ title, "slug": slug.current }`
  );

  if (allPosts.length === 0) {
    fail('Blog: fetch slugs', 'No blog posts found in Sanity');
    return;
  }

  // Pick 5 random
  const shuffled = allPosts.sort(() => Math.random() - 0.5);
  const sample = shuffled.slice(0, Math.min(5, shuffled.length));

  for (const post of sample) {
    const path = `/blog/${post.slug}`;
    const page = await fetchPage(path);
    const label = `Blog "${post.title}" (${path})`;

    if (!page) {
      fail(`${label}: fetch`, 'Connection failed');
      continue;
    }

    if (page.status === 200) {
      pass(`${label}: HTTP 200`);
    } else {
      fail(`${label}: HTTP 200`, `Got ${page.status}`);
      continue;
    }

    // Contains title
    if (page.html.includes(post.title)) {
      pass(`${label}: contains title`);
    } else {
      fail(`${label}: contains title`, 'Title not found in HTML');
    }

    // No Webflow CDN URLs
    const webflowHits = hasWebflowCdnUrls(page.html);
    if (webflowHits.length === 0) {
      pass(`${label}: no Webflow CDN`);
    } else {
      fail(`${label}: no Webflow CDN`, `Found: ${webflowHits.join(', ')}`);
    }

    // Sanity CDN or no images
    if (hasSanityCdnUrls(page.html)) {
      pass(`${label}: Sanity CDN images`);
    } else {
      // Check if there are any img tags at all (excluding static assets)
      const hasExternalImages = page.html.match(/<img[^>]+src=["']https?:\/\/[^"']*["']/gi);
      if (!hasExternalImages || hasExternalImages.length === 0) {
        pass(`${label}: no external images (OK)`);
      } else {
        fail(`${label}: Sanity CDN images`, 'Has external images but none from cdn.sanity.io');
      }
    }

    // No weserv.nl proxy
    if (!hasWeservUrls(page.html)) {
      pass(`${label}: no weserv.nl proxy`);
    } else {
      fail(`${label}: no weserv.nl proxy`, 'Found images.weserv.nl URLs');
    }
  }
}

async function testCaseStudies() {
  console.log('\n── Case Studies ──');

  const allCS: { title: string; slug: string }[] = await sanity.fetch(
    `*[_type == "caseStudy" && !(_id in path("drafts.**")) && defined(slug.current)]{ title, "slug": slug.current }`
  );

  if (allCS.length === 0) {
    fail('Case Studies: fetch slugs', 'No case studies found in Sanity');
    return;
  }

  const shuffled = allCS.sort(() => Math.random() - 0.5);
  const sample = shuffled.slice(0, Math.min(3, shuffled.length));

  for (const cs of sample) {
    const path = `/case-studies/${cs.slug}`;
    const page = await fetchPage(path);
    const label = `Case Study "${cs.title}" (${path})`;

    if (!page) {
      fail(`${label}: fetch`, 'Connection failed');
      continue;
    }

    if (page.status === 200) {
      pass(`${label}: HTTP 200`);
    } else {
      fail(`${label}: HTTP 200`, `Got ${page.status}`);
      continue;
    }

    if (page.html.includes(cs.title)) {
      pass(`${label}: contains title`);
    } else {
      fail(`${label}: contains title`, 'Title not found in HTML');
    }

    const webflowHits = hasWebflowCdnUrls(page.html);
    if (webflowHits.length === 0) {
      pass(`${label}: no Webflow CDN`);
    } else {
      fail(`${label}: no Webflow CDN`, `Found: ${webflowHits.join(', ')}`);
    }

    if (hasSanityCdnUrls(page.html)) {
      pass(`${label}: Sanity CDN images`);
    } else {
      const hasExternalImages = page.html.match(/<img[^>]+src=["']https?:\/\/[^"']*["']/gi);
      if (!hasExternalImages || hasExternalImages.length === 0) {
        pass(`${label}: no external images (OK)`);
      } else {
        fail(`${label}: Sanity CDN images`, 'Has external images but none from cdn.sanity.io');
      }
    }

    if (!hasWeservUrls(page.html)) {
      pass(`${label}: no weserv.nl proxy`);
    } else {
      fail(`${label}: no weserv.nl proxy`, 'Found images.weserv.nl URLs');
    }
  }
}

async function testStaticPages() {
  console.log('\n── Static Pages ──');

  const pages = [
    { path: '/case-studies', name: 'Case Studies index' },
    { path: '/about', name: 'About' },
    { path: '/studio', name: 'Sanity Studio' },
  ];

  // Check if seo-for pages exist
  const seoPages: { slug: string }[] = await sanity.fetch(
    `*[_type == "seoPage" && !(_id in path("drafts.**")) && defined(slug.current)][0..1]{ "slug": slug.current }`
  );
  if (seoPages.length > 0) {
    pages.push({ path: `/seo-for/${seoPages[0].slug}`, name: `SEO Page (${seoPages[0].slug})` });
  } else {
    // Try the index
    pages.push({ path: '/seo-for', name: 'SEO For index' });
  }

  for (const { path, name } of pages) {
    const page = await fetchPage(path);
    if (!page) {
      fail(`${name}: fetch`, 'Connection failed');
      continue;
    }

    if (page.status === 200) {
      pass(`${name}: HTTP 200`);
    } else {
      fail(`${name}: HTTP 200`, `Got ${page.status}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== LoudFace Sanity CMS Rendering Verification ===');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Sanity Project: ${projectId} / ${dataset}`);

  // Quick connectivity check
  try {
    await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error('\nERROR: Cannot connect to dev server at localhost:3005. Is it running?');
    process.exit(1);
  }

  await testHomepage();
  await testBlogPosts();
  await testCaseStudies();
  await testStaticPages();

  // ── Report ──
  console.log('\n\n════════════════════════════════════════════════════');
  console.log('                    TEST REPORT');
  console.log('════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  for (const r of results) {
    const icon = r.passed ? '✅ PASS' : '❌ FAIL';
    const detail = r.detail ? ` — ${r.detail}` : '';
    console.log(`${icon}  ${r.test}${detail}`);
  }

  console.log(`\n────────────────────────────────────────────────────`);
  console.log(`Total: ${results.length}  |  Passed: ${passed.length}  |  Failed: ${failed.length}`);
  console.log(`────────────────────────────────────────────────────\n`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
