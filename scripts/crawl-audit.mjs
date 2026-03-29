#!/usr/bin/env node
/**
 * Crawl Audit Script
 *
 * Crawls the site starting from the sitemap, follows internal links,
 * and reports on technical SEO issues — the same things Ahrefs, Screaming
 * Frog, or DataForSEO's OnPage API would catch.
 *
 * Usage:
 *   node scripts/crawl-audit.mjs                         # crawl production
 *   node scripts/crawl-audit.mjs https://www.loudface.co  # explicit URL
 *   node scripts/crawl-audit.mjs http://localhost:3005     # crawl dev server
 *
 * Output:
 *   - Human-readable summary to stdout
 *   - Detailed JSON report to crawl-audit-report.json
 */

// ============================================================
// CONFIGURATION
// ============================================================

const BASE_URL = (process.argv[2] || 'https://www.loudface.co').replace(/\/$/, '');
const CONCURRENCY = 5;
const TIMEOUT_MS = 15_000;
const MAX_PAGES = 500;
const MAX_REDIRECTS = 10;
const DELAY_MS = 100; // polite delay between batches
const USER_AGENT = 'LoudFace-CrawlAudit/1.0';

const META_TITLE_MIN = 30;
const META_TITLE_MAX = 60;
const META_DESC_MIN = 120;
const META_DESC_MAX = 160;

// ============================================================
// DATA STRUCTURES
// ============================================================

/** @type {Map<string, CrawlResult>} */
const crawledPages = new Map();

/** @type {Map<string, Set<string>>} incomingLinks: targetUrl -> Set<sourceUrl> */
const incomingLinks = new Map();

/** @type {Map<string, LinkCheck>} link check cache */
const linkCheckCache = new Map();

/** @type {Set<string>} URLs in the sitemap */
const sitemapUrls = new Set();

/** @type {Array<Issue>} */
const errors = [];
const warnings = [];
const notices = [];

// ============================================================
// UTILITIES
// ============================================================

function normalizeUrl(href, pageUrl) {
  if (!href) return null;
  // Skip non-http links
  if (/^(mailto:|tel:|javascript:|data:|#$)/.test(href)) return null;
  if (href.startsWith('#')) return null;

  try {
    const resolved = new URL(href, pageUrl);
    // Only keep URLs on the same origin
    const base = new URL(BASE_URL);
    if (resolved.origin !== base.origin) return null;
    // Strip hash, keep path + query
    resolved.hash = '';
    // Normalize trailing slash: strip it (except for root)
    let path = resolved.pathname;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return `${resolved.origin}${path}${resolved.search}`;
  } catch {
    return null;
  }
}

function isInternalUrl(url) {
  try {
    const u = new URL(url);
    const b = new URL(BASE_URL);
    return u.origin === b.origin;
  } catch {
    return false;
  }
}

function getPath(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Run an array of async fns with limited concurrency */
async function pool(tasks, concurrency) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

// ============================================================
// HTML PARSER (regex-based, no dependencies)
// ============================================================

function parseHtml(html, url) {
  const result = {
    url,
    title: null,
    titleLength: 0,
    metaDescription: null,
    metaDescriptionLength: 0,
    h1Count: 0,
    h1Texts: [],
    internalLinks: [],
    externalLinks: [],
    images: [],
    imagesWithoutAlt: 0,
    httpLinksOnHttps: [],
    canonical: null,
    robotsMeta: null,
    wordCount: 0,
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    result.title = stripHtml(titleMatch[1]).replace(/\s+/g, ' ').trim();
    result.titleLength = result.title.length;
  }

  // Meta description (handle both attribute orders)
  const descPatterns = [
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i,
    /<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']/i,
  ];
  for (const pattern of descPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.metaDescription = match[1].trim();
      result.metaDescriptionLength = result.metaDescription.length;
      break;
    }
  }

  // Robots meta
  const robotsPatterns = [
    /<meta\s+name=["']robots["']\s+content=["']([\s\S]*?)["']/i,
    /<meta\s+content=["']([\s\S]*?)["']\s+name=["']robots["']/i,
  ];
  for (const pattern of robotsPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.robotsMeta = match[1].trim();
      break;
    }
  }

  // Canonical
  const canonMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (canonMatch) {
    result.canonical = canonMatch[1];
  }

  // H1 tags
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let h1Match;
  while ((h1Match = h1Regex.exec(html)) !== null) {
    result.h1Count++;
    result.h1Texts.push(stripHtml(h1Match[1]));
  }

  // Links
  const linkRegex = /<a\s+([^>]*?)>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const attrs = linkMatch[1];
    const hrefMatch = attrs.match(/href=["']([^"']*?)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];

    // Get anchor text (find the closing tag)
    const afterTag = html.slice(linkRegex.lastIndex);
    const closeIdx = afterTag.indexOf('</a>');
    const anchorText = closeIdx >= 0 ? stripHtml(afterTag.slice(0, closeIdx)) : '';

    const resolved = normalizeUrl(href, url);
    if (resolved && isInternalUrl(resolved)) {
      result.internalLinks.push({ href: resolved, text: anchorText, rawHref: href });

      // Detect HTTP link on HTTPS page
      if (url.startsWith('https://') && href.startsWith('http://') && !href.startsWith('https://')) {
        result.httpLinksOnHttps.push(href);
      }
    } else if (href.startsWith('http://') || href.startsWith('https://')) {
      result.externalLinks.push({ href, text: anchorText });

      // Also check for HTTP links to own domain
      if (url.startsWith('https://')) {
        try {
          const linkUrl = new URL(href);
          const baseHostname = new URL(BASE_URL).hostname;
          if (linkUrl.hostname === baseHostname && linkUrl.protocol === 'http:') {
            result.httpLinksOnHttps.push(href);
          }
        } catch { /* skip */ }
      }
    }
  }

  // Images
  const imgRegex = /<img\s+([^>]*?)\/?>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const attrs = imgMatch[1];
    const srcMatch = attrs.match(/src=["']([^"']*?)["']/i);
    const altMatch = attrs.match(/alt=["']([\s\S]*?)["']/i);
    const hasAlt = /\balt=/.test(attrs);

    const img = {
      src: srcMatch ? srcMatch[1] : '',
      alt: altMatch ? altMatch[1] : null,
      hasAlt,
    };
    result.images.push(img);

    // Missing alt = no alt attribute at all
    if (!hasAlt) {
      result.imagesWithoutAlt++;
    }
  }

  // Word count (rough — strip HTML, count words)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    const text = stripHtml(bodyMatch[1]).replace(/\s+/g, ' ').trim();
    result.wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  }

  return result;
}

// ============================================================
// FETCH WITH REDIRECT TRACKING
// ============================================================

async function fetchWithRedirectChain(url) {
  const chain = [];
  let current = url;
  let status = 0;
  let html = '';

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeout);

      status = response.status;
      chain.push({ url: current, status });

      if (status >= 300 && status < 400) {
        const location = response.headers.get('location');
        if (!location) break;
        current = new URL(location, current).href;
        continue;
      }

      // Success or error — read body
      if (status === 200) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
          html = await response.text();
        }
      }
      break;
    } catch (err) {
      clearTimeout(timeout);
      chain.push({ url: current, status: 0, error: err.name === 'AbortError' ? 'timeout' : err.message });
      break;
    }
  }

  return {
    originalUrl: url,
    finalUrl: current,
    finalStatus: status,
    chain,
    html,
    isRedirect: chain.length > 1,
    isRedirectChain: chain.length > 2,
  };
}

// ============================================================
// CRAWL LOGIC
// ============================================================

async function fetchSitemap() {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  process.stdout.write(`  Fetching sitemap from ${sitemapUrl}...\n`);

  try {
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!response.ok) {
      process.stdout.write(`  WARNING: Sitemap returned ${response.status}\n`);
      return [];
    }
    const xml = await response.text();
    const urls = [];
    const locRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
      urls.push(match[1].trim());
    }
    process.stdout.write(`  Found ${urls.length} URLs in sitemap\n`);
    return urls;
  } catch (err) {
    process.stdout.write(`  ERROR: Could not fetch sitemap: ${err.message}\n`);
    return [];
  }
}

async function crawlPage(url) {
  if (crawledPages.has(url)) return crawledPages.get(url);
  if (crawledPages.size >= MAX_PAGES) return null;

  const fetchResult = await fetchWithRedirectChain(url);

  const result = {
    url,
    finalUrl: fetchResult.finalUrl,
    finalStatus: fetchResult.finalStatus,
    chain: fetchResult.chain,
    isRedirect: fetchResult.isRedirect,
    isRedirectChain: fetchResult.isRedirectChain,
    parsed: null,
  };

  if (fetchResult.html) {
    result.parsed = parseHtml(fetchResult.html, fetchResult.finalUrl);
  }

  crawledPages.set(url, result);
  return result;
}

async function checkLinkTarget(url) {
  if (linkCheckCache.has(url)) return linkCheckCache.get(url);
  if (crawledPages.has(url)) {
    const page = crawledPages.get(url);
    const check = {
      url,
      finalStatus: page.finalStatus,
      finalUrl: page.finalUrl,
      isRedirect: page.isRedirect,
      isRedirectChain: page.isRedirectChain,
    };
    linkCheckCache.set(url, check);
    return check;
  }

  // HEAD request first, fall back to GET
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const result = await fetchWithRedirectChain(url);
    clearTimeout(timeout);

    const check = {
      url,
      finalStatus: result.finalStatus,
      finalUrl: result.finalUrl,
      isRedirect: result.isRedirect,
      isRedirectChain: result.isRedirectChain,
      chain: result.chain,
    };
    linkCheckCache.set(url, check);
    return check;
  } catch (err) {
    clearTimeout(timeout);
    const check = { url, finalStatus: 0, finalUrl: url, isRedirect: false, error: err.message };
    linkCheckCache.set(url, check);
    return check;
  }
}

// ============================================================
// MAIN CRAWL ORCHESTRATOR
// ============================================================

async function runCrawl() {
  const startTime = Date.now();

  // Phase 1: Fetch sitemap
  console.log('\n\u2500\u2500 Phase 1: Fetching sitemap');
  const sitemapEntries = await fetchSitemap();
  sitemapEntries.forEach(u => sitemapUrls.add(u));

  // Phase 2: Crawl all sitemap URLs
  console.log('\n\u2500\u2500 Phase 2: Crawling sitemap URLs');
  const sitemapTasks = sitemapEntries.map(url => async () => {
    const result = await crawlPage(url);
    process.stdout.write(`  [${crawledPages.size}/${sitemapEntries.length}] ${getPath(url)} -> ${result?.finalStatus || '?'}\n`);
    await sleep(DELAY_MS);
    return result;
  });
  await pool(sitemapTasks, CONCURRENCY);

  // Phase 3: Discover and crawl linked pages not yet visited
  console.log('\n\u2500\u2500 Phase 3: Crawling discovered internal links');
  const discoveredUrls = new Set();
  for (const [, page] of crawledPages) {
    if (page.parsed) {
      for (const link of page.parsed.internalLinks) {
        if (!crawledPages.has(link.href) && !discoveredUrls.has(link.href)) {
          discoveredUrls.add(link.href);
        }
      }
    }
  }

  if (discoveredUrls.size > 0) {
    process.stdout.write(`  Found ${discoveredUrls.size} additional internal URLs to check\n`);
    const discoveredTasks = [...discoveredUrls].map(url => async () => {
      const result = await crawlPage(url);
      process.stdout.write(`  [+] ${getPath(url)} -> ${result?.finalStatus || '?'}\n`);
      await sleep(DELAY_MS);
      return result;
    });
    await pool(discoveredTasks, CONCURRENCY);
  }

  // Phase 4: Check all internal link targets
  console.log('\n\u2500\u2500 Phase 4: Checking all internal link targets');
  const allInternalLinks = new Set();
  for (const [, page] of crawledPages) {
    if (page.parsed) {
      for (const link of page.parsed.internalLinks) {
        allInternalLinks.add(link.href);
        // Track incoming links
        if (!incomingLinks.has(link.href)) {
          incomingLinks.set(link.href, new Set());
        }
        incomingLinks.get(link.href).add(page.url);
      }
    }
  }

  const uncheckedLinks = [...allInternalLinks].filter(url => !crawledPages.has(url) && !linkCheckCache.has(url));
  if (uncheckedLinks.length > 0) {
    process.stdout.write(`  Checking ${uncheckedLinks.length} uncrawled link targets\n`);
    const checkTasks = uncheckedLinks.map(url => async () => {
      await checkLinkTarget(url);
      await sleep(DELAY_MS);
    });
    await pool(checkTasks, CONCURRENCY);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\u2500\u2500 Crawl complete: ${crawledPages.size} pages in ${duration}s`);

  return { duration, pagesScanned: crawledPages.size, linksChecked: allInternalLinks.size };
}

// ============================================================
// ANALYSIS
// ============================================================

function analyzeIssues(stats) {
  // --- ERRORS ---

  // E1: 404 pages
  for (const [url, page] of crawledPages) {
    if (page.finalStatus === 404 || page.finalStatus === 410) {
      const linkedFrom = incomingLinks.get(url);
      errors.push({
        type: '404_page',
        severity: 'error',
        url: getPath(url),
        detail: `Returns ${page.finalStatus}`,
        linkedFrom: linkedFrom ? [...linkedFrom].map(getPath) : [],
        fix: `Add a redirect in next.config.ts from "${getPath(url)}" to the correct page`,
      });
    }
  }

  // E1b: 4XX pages from link checks
  for (const [url, check] of linkCheckCache) {
    if (check.finalStatus >= 400 && check.finalStatus < 500 && !crawledPages.has(url)) {
      const linkedFrom = incomingLinks.get(url);
      errors.push({
        type: '4xx_page',
        severity: 'error',
        url: getPath(url),
        detail: `Returns ${check.finalStatus}`,
        linkedFrom: linkedFrom ? [...linkedFrom].map(getPath) : [],
        fix: `Add a redirect in next.config.ts or fix the linking pages`,
      });
    }
  }

  // E2: Broken redirect chains (redirect that ends on 4XX)
  for (const [url, page] of crawledPages) {
    if (page.isRedirect && page.finalStatus >= 400) {
      errors.push({
        type: 'broken_redirect',
        severity: 'error',
        url: getPath(url),
        detail: `Redirects to ${getPath(page.finalUrl)} which returns ${page.finalStatus}`,
        chain: page.chain.map(c => `${getPath(c.url)} [${c.status}]`),
        fix: `Update the redirect target in next.config.ts to point to a valid page`,
      });
    }
  }

  // E3: HTTPS pages linking to HTTP
  for (const [, page] of crawledPages) {
    if (page.parsed && page.parsed.httpLinksOnHttps.length > 0) {
      errors.push({
        type: 'https_links_to_http',
        severity: 'error',
        url: getPath(page.url),
        detail: `${page.parsed.httpLinksOnHttps.length} HTTP link(s) on HTTPS page`,
        httpLinks: page.parsed.httpLinksOnHttps,
        fix: `Update HTTP links to HTTPS in the page content or CMS`,
      });
    }
  }

  // E4: Orphan pages (in sitemap but no incoming internal links)
  for (const sitemapUrl of sitemapUrls) {
    const inlinks = incomingLinks.get(sitemapUrl);
    const hasInlinks = inlinks && inlinks.size > 0;
    if (!hasInlinks) {
      // Check if root — root won't have inlinks pointing to itself
      const path = getPath(sitemapUrl);
      if (path === '/' || path === '') continue;
      errors.push({
        type: 'orphan_page',
        severity: 'error',
        url: path,
        detail: 'Indexable page in sitemap but has no incoming internal links',
        fix: 'Add internal links to this page from relevant pages, or remove from sitemap if not needed',
      });
    }
  }

  // --- WARNINGS ---

  // W1: Pages linking to redirects
  const pagesLinkingToRedirects = new Map();
  for (const [, page] of crawledPages) {
    if (!page.parsed) continue;
    for (const link of page.parsed.internalLinks) {
      const target = crawledPages.get(link.href) || linkCheckCache.get(link.href);
      if (target && target.isRedirect && target.finalStatus === 200) {
        if (!pagesLinkingToRedirects.has(page.url)) {
          pagesLinkingToRedirects.set(page.url, []);
        }
        pagesLinkingToRedirects.get(page.url).push({
          linkUrl: getPath(link.href),
          finalUrl: getPath(target.finalUrl),
        });
      }
    }
  }
  for (const [sourceUrl, redirectLinks] of pagesLinkingToRedirects) {
    warnings.push({
      type: 'links_to_redirect',
      severity: 'warning',
      url: getPath(sourceUrl),
      detail: `${redirectLinks.length} internal link(s) point to URLs that redirect`,
      redirectLinks,
      fix: 'Update links to point directly to the final destination URL',
    });
  }

  // W2: Pages linking to broken pages
  const pagesLinkingToBroken = new Map();
  for (const [, page] of crawledPages) {
    if (!page.parsed) continue;
    for (const link of page.parsed.internalLinks) {
      const target = crawledPages.get(link.href) || linkCheckCache.get(link.href);
      if (target && target.finalStatus >= 400) {
        if (!pagesLinkingToBroken.has(page.url)) {
          pagesLinkingToBroken.set(page.url, []);
        }
        pagesLinkingToBroken.get(page.url).push({
          linkUrl: getPath(link.href),
          status: target.finalStatus,
        });
      }
    }
  }
  for (const [sourceUrl, brokenLinks] of pagesLinkingToBroken) {
    warnings.push({
      type: 'links_to_broken',
      severity: 'warning',
      url: getPath(sourceUrl),
      detail: `${brokenLinks.length} internal link(s) to broken pages`,
      brokenLinks,
      fix: 'Fix or remove links to broken pages',
    });
  }

  // W3: Meta description too long
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (page.parsed.metaDescriptionLength > META_DESC_MAX) {
      warnings.push({
        type: 'meta_description_too_long',
        severity: 'warning',
        url: getPath(page.url),
        detail: `Meta description is ${page.parsed.metaDescriptionLength} chars (max ${META_DESC_MAX})`,
        value: page.parsed.metaDescription,
        fix: `Truncate to ${META_DESC_MAX} characters`,
      });
    }
  }

  // W4: Meta description too short
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (page.parsed.metaDescription && page.parsed.metaDescriptionLength < META_DESC_MIN) {
      warnings.push({
        type: 'meta_description_too_short',
        severity: 'warning',
        url: getPath(page.url),
        detail: `Meta description is ${page.parsed.metaDescriptionLength} chars (min ${META_DESC_MIN})`,
        value: page.parsed.metaDescription,
        fix: `Expand to at least ${META_DESC_MIN} characters with keywords and CTA`,
      });
    }
  }

  // W5: Title too long
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (page.parsed.titleLength > META_TITLE_MAX) {
      warnings.push({
        type: 'title_too_long',
        severity: 'warning',
        url: getPath(page.url),
        detail: `Title is ${page.parsed.titleLength} chars (max ${META_TITLE_MAX})`,
        value: page.parsed.title,
        fix: `Shorten to ${META_TITLE_MAX} characters`,
      });
    }
  }

  // W6: Title too short
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (page.parsed.title && page.parsed.titleLength < META_TITLE_MIN && page.parsed.titleLength > 0) {
      warnings.push({
        type: 'title_too_short',
        severity: 'warning',
        url: getPath(page.url),
        detail: `Title is ${page.parsed.titleLength} chars (min ${META_TITLE_MAX})`,
        value: page.parsed.title,
        fix: `Expand to at least ${META_TITLE_MIN} characters`,
      });
    }
  }

  // W7: Missing alt text
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (page.parsed.imagesWithoutAlt > 0) {
      warnings.push({
        type: 'missing_alt_text',
        severity: 'warning',
        url: getPath(page.url),
        detail: `${page.parsed.imagesWithoutAlt} of ${page.parsed.images.length} images missing alt attribute`,
        images: page.parsed.images.filter(i => !i.hasAlt).map(i => i.src).slice(0, 10),
        fix: 'Add descriptive alt text to all informative images, or alt="" for decorative',
      });
    }
  }

  // W8: 3XX redirects (pages that are redirects themselves)
  for (const [url, page] of crawledPages) {
    if (page.isRedirect && page.finalStatus === 200 && sitemapUrls.has(url)) {
      warnings.push({
        type: '3xx_redirect_in_sitemap',
        severity: 'warning',
        url: getPath(url),
        detail: `Sitemap URL redirects to ${getPath(page.finalUrl)}`,
        fix: 'Update sitemap to use the final destination URL, or remove the redirect',
      });
    }
  }

  // W9: Missing meta description
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (!page.parsed.metaDescription) {
      warnings.push({
        type: 'missing_meta_description',
        severity: 'warning',
        url: getPath(page.url),
        detail: 'No meta description found',
        fix: 'Add a meta description (150-160 characters) with primary keyword and CTA',
      });
    }
  }

  // W10: Missing title
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (!page.parsed.title) {
      warnings.push({
        type: 'missing_title',
        severity: 'warning',
        url: getPath(page.url),
        detail: 'No title tag found',
        fix: 'Add a title tag (50-60 characters) with primary keyword',
      });
    }
  }

  // W11: Missing canonical
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    const isNoIndex = page.parsed.robotsMeta && page.parsed.robotsMeta.includes('noindex');
    if (!isNoIndex && !page.parsed.canonical) {
      warnings.push({
        type: 'missing_canonical',
        severity: 'warning',
        url: getPath(page.url),
        detail: 'Indexable page without canonical URL',
        fix: 'Add alternates.canonical to metadata',
      });
    }
  }

  // --- NOTICES ---

  // N1: Multiple H1 tags
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (page.parsed.h1Count > 1) {
      notices.push({
        type: 'multiple_h1',
        severity: 'notice',
        url: getPath(page.url),
        detail: `${page.parsed.h1Count} H1 tags found (should be exactly 1)`,
        h1Texts: page.parsed.h1Texts,
        fix: 'Keep one H1 for the page title, change others to H2',
      });
    }
  }

  // N2: Missing H1
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    if (page.parsed.h1Count === 0) {
      notices.push({
        type: 'missing_h1',
        severity: 'notice',
        url: getPath(page.url),
        detail: 'No H1 tag found',
        fix: 'Add exactly one H1 tag with the primary page keyword',
      });
    }
  }

  // N3: Pages not in sitemap (indexable, status 200, discovered via crawl)
  for (const [url, page] of crawledPages) {
    if (page.finalStatus !== 200) continue;
    const isNoIndex = page.parsed?.robotsMeta?.includes('noindex');
    if (isNoIndex) continue;
    if (!sitemapUrls.has(url) && !page.isRedirect) {
      // Skip query param pages (pagination, filters)
      if (new URL(url).search) continue;
      notices.push({
        type: 'not_in_sitemap',
        severity: 'notice',
        url: getPath(url),
        detail: 'Indexable page not in sitemap',
        fix: 'Add this page to sitemap.ts or add noindex if it should not be indexed',
      });
    }
  }

  // N4: Pages with only 1 incoming internal link
  for (const [, page] of crawledPages) {
    if (page.finalStatus !== 200 || !page.parsed) continue;
    const isNoIndex = page.parsed.robotsMeta?.includes('noindex');
    if (isNoIndex) continue;
    const path = getPath(page.url);
    if (path === '/' || path === '') continue;
    const linkCount = incomingLinks.get(page.url)?.size || 0;
    if (linkCount === 1) {
      notices.push({
        type: 'thin_internal_linking',
        severity: 'notice',
        url: path,
        detail: 'Only 1 internal page links to this page',
        linkedFrom: [...(incomingLinks.get(page.url) || [])].map(getPath),
        fix: 'Add internal links from 2-3 more relevant pages to improve link equity',
      });
    }
  }

  // N5: Redirect chains (A -> B -> C, more than one hop)
  for (const [url, page] of crawledPages) {
    if (page.isRedirectChain) {
      notices.push({
        type: 'redirect_chain',
        severity: 'notice',
        url: getPath(url),
        detail: `Redirect chain with ${page.chain.length} hops`,
        chain: page.chain.map(c => `${getPath(c.url)} [${c.status}]`),
        fix: 'Simplify to a single redirect from source to final destination',
      });
    }
  }
  for (const [url, check] of linkCheckCache) {
    if (check.isRedirectChain) {
      notices.push({
        type: 'redirect_chain',
        severity: 'notice',
        url: getPath(url),
        detail: `Redirect chain with ${check.chain?.length || '?'} hops`,
        chain: check.chain?.map(c => `${getPath(c.url)} [${c.status}]`) || [],
        fix: 'Simplify to a single redirect from source to final destination',
      });
    }
  }

  // N6: Low word count pages
  for (const [, page] of crawledPages) {
    if (!page.parsed || page.finalStatus !== 200) continue;
    const isNoIndex = page.parsed.robotsMeta?.includes('noindex');
    if (isNoIndex) continue;
    // Skip pages that are expected to be short (legal, etc)
    const path = getPath(page.url);
    if (['/privacy', '/terms', '/cookies'].includes(path)) continue;
    if (page.parsed.wordCount > 0 && page.parsed.wordCount < 300) {
      notices.push({
        type: 'thin_content',
        severity: 'notice',
        url: path,
        detail: `Only ${page.parsed.wordCount} words (min recommended: 300)`,
        fix: 'Expand content or noindex if page should not be in search results',
      });
    }
  }
}

// ============================================================
// HEALTH SCORE CALCULATION
// ============================================================

function calculateHealthScore() {
  // Start at 100, deduct points per issue
  let score = 100;

  // Errors: -3 each (capped at -30)
  score -= Math.min(errors.length * 3, 30);

  // Warnings: -1 each (capped at -30)
  score -= Math.min(warnings.length * 1, 30);

  // Notices: -0.25 each (capped at -10)
  score -= Math.min(Math.ceil(notices.length * 0.25), 10);

  return Math.max(0, Math.round(score));
}

// ============================================================
// REPORT GENERATION
// ============================================================

function generateReport(stats) {
  const healthScore = calculateHealthScore();

  // Dedup issues by url+type
  const dedup = (arr) => {
    const seen = new Set();
    return arr.filter(issue => {
      const key = `${issue.type}:${issue.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const dedupErrors = dedup(errors);
  const dedupWarnings = dedup(warnings);
  const dedupNotices = dedup(notices);

  // Console output
  console.log('\n');
  console.log('\u2550'.repeat(55));
  console.log(`  CRAWL AUDIT REPORT \u2014 ${new URL(BASE_URL).hostname}`);
  console.log(`  ${new Date().toISOString().split('T')[0]} | Pages: ${stats.pagesScanned} | Links checked: ${stats.linksChecked}`);
  console.log('\u2550'.repeat(55));
  console.log();

  // Health score with color
  const scoreColor = healthScore >= 80 ? '\x1b[32m' : healthScore >= 60 ? '\x1b[33m' : '\x1b[31m';
  console.log(`  HEALTH SCORE: ${scoreColor}${healthScore}/100\x1b[0m`);
  console.log();

  // Errors
  if (dedupErrors.length > 0) {
    console.log(`  \x1b[31mERRORS (${dedupErrors.length})\x1b[0m`);
    console.log('  ' + '\u2500'.repeat(45));
    const grouped = groupBy(dedupErrors, 'type');
    for (const [type, issues] of Object.entries(grouped)) {
      const label = typeLabels[type] || type;
      console.log(`  \u2717 ${issues.length} ${label}`);
      for (const issue of issues.slice(0, 5)) {
        console.log(`    \u2514 ${issue.url} ${issue.detail ? `\u2014 ${issue.detail}` : ''}`);
      }
      if (issues.length > 5) console.log(`    \u2514 ... and ${issues.length - 5} more`);
    }
    console.log();
  }

  // Warnings
  if (dedupWarnings.length > 0) {
    console.log(`  \x1b[33mWARNINGS (${dedupWarnings.length})\x1b[0m`);
    console.log('  ' + '\u2500'.repeat(45));
    const grouped = groupBy(dedupWarnings, 'type');
    for (const [type, issues] of Object.entries(grouped)) {
      const label = typeLabels[type] || type;
      console.log(`  \u26a0 ${issues.length} ${label}`);
      for (const issue of issues.slice(0, 3)) {
        console.log(`    \u2514 ${issue.url} \u2014 ${issue.detail}`);
      }
      if (issues.length > 3) console.log(`    \u2514 ... and ${issues.length - 3} more`);
    }
    console.log();
  }

  // Notices
  if (dedupNotices.length > 0) {
    console.log(`  \x1b[36mNOTICES (${dedupNotices.length})\x1b[0m`);
    console.log('  ' + '\u2500'.repeat(45));
    const grouped = groupBy(dedupNotices, 'type');
    for (const [type, issues] of Object.entries(grouped)) {
      const label = typeLabels[type] || type;
      console.log(`  \u2139 ${issues.length} ${label}`);
    }
    console.log();
  }

  // All clear
  if (dedupErrors.length === 0 && dedupWarnings.length === 0 && dedupNotices.length === 0) {
    console.log('  \x1b[32m\u2713 No issues found!\x1b[0m');
    console.log();
  }

  // Write detailed JSON report
  const report = {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    healthScore,
    summary: {
      pagesScanned: stats.pagesScanned,
      linksChecked: stats.linksChecked,
      duration: stats.duration,
      errors: dedupErrors.length,
      warnings: dedupWarnings.length,
      notices: dedupNotices.length,
    },
    errors: dedupErrors,
    warnings: dedupWarnings,
    notices: dedupNotices,
    pages: [...crawledPages.entries()].map(([url, page]) => ({
      url: getPath(url),
      status: page.finalStatus,
      title: page.parsed?.title || null,
      titleLength: page.parsed?.titleLength || 0,
      metaDescriptionLength: page.parsed?.metaDescriptionLength || 0,
      h1Count: page.parsed?.h1Count || 0,
      imagesTotal: page.parsed?.images.length || 0,
      imagesWithoutAlt: page.parsed?.imagesWithoutAlt || 0,
      internalLinksCount: page.parsed?.internalLinks.length || 0,
      incomingLinksCount: incomingLinks.get(url)?.size || 0,
      wordCount: page.parsed?.wordCount || 0,
      isRedirect: page.isRedirect,
    })),
  };

  return report;
}

const typeLabels = {
  '404_page': 'pages return 404',
  '4xx_page': 'pages return 4XX error',
  'broken_redirect': 'broken redirect chain(s)',
  'https_links_to_http': 'HTTPS pages linking to HTTP',
  'orphan_page': 'orphan page(s) (no incoming internal links)',
  'links_to_redirect': 'pages have links to redirecting URLs',
  'links_to_broken': 'pages have links to broken pages',
  'meta_description_too_long': 'pages have meta description too long (>160 chars)',
  'meta_description_too_short': 'pages have meta description too short (<80 chars)',
  'title_too_long': 'pages have title too long (>60 chars)',
  'title_too_short': 'pages have title too short (<30 chars)',
  'missing_alt_text': 'pages have images missing alt text',
  'missing_meta_description': 'pages missing meta description',
  'missing_title': 'pages missing title tag',
  'missing_canonical': 'pages missing canonical URL',
  '3xx_redirect_in_sitemap': 'sitemap URLs that redirect',
  'multiple_h1': 'pages have multiple H1 tags',
  'missing_h1': 'pages missing H1 tag',
  'not_in_sitemap': 'indexable pages not in sitemap',
  'thin_internal_linking': 'pages have only 1 incoming internal link',
  'redirect_chain': 'redirect chain(s) (>1 hop)',
  'thin_content': 'pages have thin content (<300 words)',
};

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log(`\n\u2550\u2550 Crawl Audit \u2014 ${BASE_URL}`);
  console.log(`  Concurrency: ${CONCURRENCY} | Timeout: ${TIMEOUT_MS}ms | Max pages: ${MAX_PAGES}`);

  try {
    // Quick connectivity check
    const healthCheck = await fetch(BASE_URL, {
      headers: { 'User-Agent': USER_AGENT },
    }).catch(() => null);

    if (!healthCheck || !healthCheck.ok) {
      console.error(`\n\x1b[31mERROR: Cannot reach ${BASE_URL}\x1b[0m`);
      console.error('Make sure the site is accessible. For local dev, run: npm run dev');
      process.exit(1);
    }
  } catch {
    console.error(`\n\x1b[31mERROR: Cannot reach ${BASE_URL}\x1b[0m`);
    process.exit(1);
  }

  const stats = await runCrawl();
  analyzeIssues(stats);
  const report = generateReport(stats);

  // Write JSON report
  const { writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const reportPath = join(process.cwd(), 'crawl-audit-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`  Detailed report saved to: ${reportPath}`);
  console.log();

  // Exit with error code if there are errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
