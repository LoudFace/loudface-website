/**
 * CMS Data Fetching Utilities
 *
 * Fetches data from Sanity CMS using GROQ queries.
 * GROQ projections map camelCase Sanity fields to kebab-case TypeScript interfaces.
 */

import { cache } from 'react';
import { draftMode } from 'next/headers';
import { cachedReadClient, client, getServerClient } from './sanity.client';
import type {
  CaseStudy,
  Client,
  Testimonial,
  BlogPost,
  ResearchStudy,
  Category,
  TeamMember,
  Industry,
  Technology,
  ServiceCategory,
  SeoPage,
  BlogFAQ,
} from './types';

/**
 * Error thrown when CMS data fetching fails critically.
 * Signals to the build process that the deployment should be aborted.
 */
export class CmsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CmsDataError';
  }
}

// Case study slugs that have CMS records but no real content.
// Filtered out everywhere — gallery, sitemap, slider, related, slug pages.
// Why: removing them in Sanity also breaks references on testimonials/clients,
// so we keep the records and hide them at the data layer instead.
const HIDDEN_CASE_STUDY_SLUGS: ReadonlySet<string> = new Set([
  'draw-things',
  'mycryptoguide',
]);

function isHiddenCaseStudySlug(slug: string | undefined | null): boolean {
  return !!slug && HIDDEN_CASE_STUDY_SLUGS.has(slug);
}

/**
 * Retry a Sanity read on transient failures (connection resets, timeouts, 5xx).
 *
 * Sanity's edge occasionally drops a connection mid-request — observed in the
 * browser as `QUIC_PROTOCOL_ERROR` / `ERR_CONNECTION_RESET`, and on the server
 * as a thrown fetch error. Because the entire (site) route group renders
 * dynamically (SanityLive is mounted in the layout), every request re-queries
 * Sanity live with no cached/static fallback. So a single dropped connection on
 * an *unguarded* fetch (e.g. fetchItemBySlug) surfaces to the visitor as a 500.
 *
 * One short-backoff retry absorbs that class of blip. A genuinely persistent
 * failure still throws after the final attempt — deliberately, so a real outage
 * surfaces (or 404s via notFound) rather than being silently masked.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 2, baseDelayMs = 300 }: { attempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
      }
    }
  }
  throw lastError;
}

// ── GROQ projection fragments ─────────────────────────────────────

// Maps Sanity camelCase fields back to kebab-case to match existing TypeScript interfaces.
// Images projected as { url, alt } to match CmsImage shape.

const CASE_STUDY_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  name,
  "project-title": projectTitle,
  "paragraph-summary": paragraphSummary,
  "main-body": mainBody,
  "main-project-image-thumbnail": mainProjectImageThumbnail { "url": asset->url, "alt": alt },
  "client-logo": clientLogo { "url": asset->url, "alt": alt },
  "client-logo-inversed": clientLogoInversed { "url": asset->url, "alt": alt },
  "client-color": clientColor,
  "secondary-client-color": secondaryClientColor,
  "company-size": companySize,
  country,
  "website-link": websiteLink,
  "visit-the-website": visitTheWebsite,
  "result-1---number": result1Number,
  "result-1---title": result1Title,
  "result-2---number": result2Number,
  "result-2---title": result2Title,
  "result-3---number": result3Number,
  "result-3---title": result3Title,
  featured,
  disciplines,
  "client": client._ref,
  "industry": industry._ref,
  "industries": industries[]._ref,
  "testimonial": testimonial._ref,
  "technologies": technologies[]._ref,
  "services-provided": servicesProvided[]._ref,
  "charts": charts[]{ title, chartType, legendPrimary, legendSecondary, data[]{ label, value, secondaryValue, displayValue, secondaryDisplayValue } },
  "instruments": instruments{
    aiSource,
    gscSource,
    topicClimb{ title, caption, points[]{ week, value } },
    rankOverTime{ label, from, to, caption, points[]{ week, position } },
    engineBeforeAfter{ beforeLabel, afterLabel, caption, rows[]{ engine, before, after } },
    indexedTrend{ title, baselineLabel, caption, startMonthIso, points[]{ month, impressions, clicks, partial } },
    publishedResult{ rows[]{ value, unit }, positionFrom, positionTo, caption }
  },
  "faq": faq[]{ question, answer },
  "_createdAt": _createdAt,
  "_updatedAt": _updatedAt
}`;

const CLIENT_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "showcase-logo": showcaseLogo,
  "colored-logo": coloredLogo { "url": asset->url, "alt": alt },
  "light-logo": lightLogo { "url": asset->url, "alt": alt },
  "dark-logo": darkLogo { "url": asset->url, "alt": alt }
}`;

const TESTIMONIAL_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  role,
  "testimonial-body": testimonialBody,
  "profile-image": profileImage { "url": asset->url, "alt": alt },
  "case-study": caseStudy._ref,
  "client": client._ref
}`;

const BLOG_POST_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "meta-title": metaTitle,
  "meta-description": metaDescription,
  "thumbnail": thumbnail { "url": asset->url, "alt": alt },
  excerpt,
  "direct-answer": directAnswer,
  content,
  "time-to-read": timeToRead,
  featured,
  "published-date": publishedDate,
  "last-updated": lastUpdated,
  "author": author._ref,
  "category": category._ref,
  "categories": categories[]._ref,
  "faq": faq[]{ question, answer },
  "dataset-meta": datasetMeta{
    name,
    description,
    temporalCoverage,
    variableMeasured,
    measurementTechnique,
    keywords,
    license
  },
  "visuals": visuals[]{
    _key,
    position,
    type,
    alt,
    caption,
    "asset": asset { "url": asset->url, "alt": alt },
    generation,
    chart,
    capture
  }
}`;

/**
 * Card-level blog projection - every field the LIST surfaces read, and nothing
 * they don't.
 *
 * The full BLOG_POST_PROJECTION above carries `content` (the entire article
 * HTML) plus `visuals`, `faq` and `dataset-meta`. Across the corpus that is
 * ~3 MB of JSON. Every list fetch pulled all of it: the blog index renders 12
 * cards, the blog post page pulls the corpus only to pick 3 related posts, and
 * the footer shows 5 links - none of them read a single body byte.
 *
 * Measured against production Sanity (120 posts): full projection 3061 KB /
 * 442 ms, card projection 91 KB / 73 ms.
 *
 * A field belongs here only if a list consumer reads it. Body-level fields stay
 * in BLOG_POST_PROJECTION, which fetchItemBySlug uses for the one post being
 * rendered. Adding `content` back here re-creates the regression.
 */
const BLOG_POST_CARD_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "thumbnail": thumbnail { "url": asset->url, "alt": alt },
  excerpt,
  "time-to-read": timeToRead,
  featured,
  "published-date": publishedDate,
  "last-updated": lastUpdated,
  "author": author._ref,
  "category": category._ref,
  "categories": categories[]._ref
}`;

const RESEARCH_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "meta-title": metaTitle,
  "meta-description": metaDescription,
  "thumbnail": thumbnail { "url": asset->url, "alt": alt },
  excerpt,
  "headline-finding": headlineFinding,
  "key-takeaways": keyTakeaways,
  content,
  "sample-summary": sampleSummary,
  methodology,
  limitations,
  appendix,
  "data-files": dataFiles[]{ label, url, note },
  "time-to-read": timeToRead,
  featured,
  "published-date": publishedDate,
  "last-updated": lastUpdated,
  "authors": authors[]._ref,
  "supersedes": supersedes->slug.current,
  "superseded": superseded->slug.current,
  "faq": faq[]{ question, answer },
  "dataset-meta": datasetMeta{
    name,
    description,
    temporalCoverage,
    variableMeasured,
    measurementTechnique,
    keywords,
    license
  },
  "visuals": visuals[]{
    _key,
    position,
    type,
    alt,
    caption,
    "asset": asset { "url": asset->url, "alt": alt },
    generation,
    chart,
    capture
  }
}`;

/**
 * Card-level research projection — the same discipline BLOG_POST_CARD_PROJECTION
 * exists for. A study body plus its appendix and methodology is the largest
 * document type on the site; the index renders cards and reads none of it.
 * If a list consumer does not read a field, it does not belong here.
 */
const RESEARCH_CARD_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "thumbnail": thumbnail { "url": asset->url, "alt": alt },
  excerpt,
  "headline-finding": headlineFinding,
  "sample-summary": sampleSummary,
  "time-to-read": timeToRead,
  featured,
  "published-date": publishedDate,
  "last-updated": lastUpdated,
  "authors": authors[]._ref,
  "superseded": superseded->slug.current
}`;

const CATEGORY_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  color
}`;

const TEAM_MEMBER_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "profile-picture": profilePicture { "url": asset->url, "alt": alt },
  "bio-summary": bioSummary,
  "job-title": jobTitle,
  "linkedin-url": linkedinUrl,
  "twitter-url": twitterUrl,
  skills,
  "_updatedAt": _updatedAt
}`;

const INDUSTRY_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "radio-filter---checked-attribute": radioFilterCheckedAttribute
}`;

const TECHNOLOGY_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "logo": logo { "url": asset->url, "alt": alt }
}`;

const SERVICE_CATEGORY_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current
}`;

const SEO_PAGE_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "meta-title": metaTitle,
  "meta-description": metaDescription,
  "industry": industry._ref,
  "display-order": displayOrder,
  "hero-headline": heroHeadline,
  "hero-subtitle": heroSubtitle,
  "hero-description": heroDescription,
  "hero-image": heroImage { "url": asset->url, "alt": alt },
  "pain-points-title": painPointsTitle,
  "pain-point-1-title": painPoint1Title,
  "pain-point-1-desc": painPoint1Desc,
  "pain-point-2-title": painPoint2Title,
  "pain-point-2-desc": painPoint2Desc,
  "pain-point-3-title": painPoint3Title,
  "pain-point-3-desc": painPoint3Desc,
  "strategy-title": strategyTitle,
  "strategy-intro": strategyIntro,
  "strategy-step-1-title": strategyStep1Title,
  "strategy-step-1-desc": strategyStep1Desc,
  "strategy-step-2-title": strategyStep2Title,
  "strategy-step-2-desc": strategyStep2Desc,
  "strategy-step-3-title": strategyStep3Title,
  "strategy-step-3-desc": strategyStep3Desc,
  "strategy-step-4-title": strategyStep4Title,
  "strategy-step-4-desc": strategyStep4Desc,
  "results-title": resultsTitle,
  "stat-1-value": stat1Value,
  "stat-1-label": stat1Label,
  "stat-2-value": stat2Value,
  "stat-2-label": stat2Label,
  "stat-3-value": stat3Value,
  "stat-3-label": stat3Label,
  "faq-1-question": faq1Question,
  "faq-1-answer": faq1Answer,
  "faq-2-question": faq2Question,
  "faq-2-answer": faq2Answer,
  "faq-3-question": faq3Question,
  "faq-3-answer": faq3Answer,
  "faq-4-question": faq4Question,
  "faq-4-answer": faq4Answer,
  "faq-5-question": faq5Question,
  "faq-5-answer": faq5Answer,
  "main-body": mainBody,
  "deliverables": deliverables,
  "cta-title": ctaTitle,
  "cta-subtitle": ctaSubtitle,
  "_updatedAt": _updatedAt
}`;

const BLOG_FAQ_PROJECTION = `{
  "id": _id,
  name,
  "slug": slug.current,
  "blog-post": blogPost._ref
}`;

// ── Homepage data structure ──────────────────────────────────────────

export interface HomepageData {
  caseStudies: CaseStudy[];
  clients: Map<string, Client>;
  allClients: Client[];
  testimonials: Map<string, Testimonial>;
  allTestimonials: Testimonial[];
  blogPosts: BlogPost[];
  categories: Map<string, Category>;
  teamMembers: Map<string, TeamMember>;
  industries: Map<string, Industry>;
  technologies: Map<string, Technology>;
  serviceCategories: Map<string, ServiceCategory>;
}

export interface FooterData {
  caseStudies: CaseStudy[];
  blogPosts: BlogPost[];
}

export function getEmptyHomepageData(): HomepageData {
  return {
    caseStudies: [],
    clients: new Map(),
    allClients: [],
    testimonials: new Map(),
    allTestimonials: [],
    blogPosts: [],
    categories: new Map(),
    teamMembers: new Map(),
    industries: new Map(),
    technologies: new Map(),
    serviceCategories: new Map(),
  };
}

// ── Per-collection fetchers (request-deduped) ────────────────────────
//
// Each collection is fetched by exactly ONE cached function, so a single
// page render issues at most one GROQ query per collection no matter how
// many composers ask for it. React `cache()` memoizes per request: when
// (site)/layout.tsx's footer and the page body both need case studies /
// blog posts, they share one underlying query instead of two.
//
// withRetry lives INSIDE each cached fetcher (not around a batch), so the
// retry survives the cache — a cached rejected promise would otherwise make
// an outer withRetry a no-op. Net contract vs. the old single
// withRetry(Promise.all): a transient blip now retries per-collection
// instead of re-running the whole batch; persistent failure still rejects,
// which the resilient composers below turn into empty data.
//
// React `cache()` only deduplicates within one server render. The (site) route
// group is dynamic because its layout calls `headers()`, so route-level
// revalidation cannot persist these results between requests. Sanity's `next`
// fetch options use Next's Data Cache, which remains available to dynamic routes.
// These reads deliberately bypass Sanity's CDN so a webhook-triggered refill
// cannot pin a stale CDN response in Next's cache for the revalidation window.

// 86400 (24h), not the 60 it was until 2026-08-18. This constant is the ONLY
// lever on Sanity read volume here: it is passed as an explicit `next.revalidate`
// on every CMS fetch, and an explicit per-fetch value overrides the segment's
// `export const revalidate` — which is inert anyway, per the note above.
//
// The reason is Sanity's Free-plan API-request quota, and it is a hard cap
// rather than an overage: at 100% the Content Lake returns 402
// plan_limit_reached and the site can no longer load content at all. These
// reads go through `cachedReadClient` (useCdn: false, deliberately), so they
// land on the smaller 250k/month API-request allowance, not the 1m/month CDN
// one. At 60s each cached query could be refilled 1440 times a day; at 86400
// it is refilled once. Toku hit 80% of this same quota on a 1h timer — 24x
// gentler than this was (toku-website 45d62ba, 2026-08-18).
//
// Freshness does not suffer. /api/revalidate calls revalidateTag on these exact
// tags the moment Sanity publishes, so an edit still reaches the site in
// seconds. This timer only governs how long a value can stay stale when a
// webhook delivery is *dropped*; the manual remedy is republishing the document.
const CMS_REVALIDATE_SECONDS = 86400;
export const cmsTypeTag = (sanityType: string) => `sanity:${sanityType}`;
export const cmsDocTag = (sanityType: string, slug: string) => `sanity:${sanityType}:${slug}`;
const cacheForSeconds = (revalidate: number, ...tags: string[]) => ({
  next: { revalidate, tags },
});

const cacheFor = (...tags: string[]) => cacheForSeconds(CMS_REVALIDATE_SECONDS, ...tags);

// The sitemap has a separate, small projection and a shorter cache than page
// content. Page content can stay cached for 24 hours because the Sanity
// webhook purges its tags. A missed webhook must not hide a newly published
// URL from the sitemap for the same 24 hours.
const SITEMAP_REVALIDATE_SECONDS = 3600;
const sitemapCacheFor = (...tags: string[]) => cacheForSeconds(SITEMAP_REVALIDATE_SECONDS, ...tags);

const fetchCaseStudies = cache((): Promise<CaseStudy[]> =>
  withRetry(() =>
    cachedReadClient.fetch<CaseStudy[]>(
      `*[_type == "caseStudy"] ${CASE_STUDY_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('caseStudy')),
    ),
  ),
);
const fetchClients = cache((): Promise<Client[]> =>
  withRetry(() =>
    cachedReadClient.fetch<Client[]>(
      `*[_type == "client"] ${CLIENT_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('client')),
    ),
  ),
);
const fetchTestimonials = cache((): Promise<Testimonial[]> =>
  withRetry(() =>
    cachedReadClient.fetch<Testimonial[]>(
      `*[_type == "testimonial"] ${TESTIMONIAL_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('testimonial')),
    ),
  ),
);
// Card projection only. Every consumer of this fetcher renders a list (index
// grid, related posts, footer links, author archive, sitemap), so the article
// bodies it used to carry were pure waste on every request. A page that needs
// one full post calls fetchItemBySlug, which still uses BLOG_POST_PROJECTION.
const fetchBlogPosts = cache((): Promise<BlogPost[]> =>
  withRetry(() =>
    cachedReadClient.fetch<BlogPost[]>(
      `*[_type == "blogPost"] | order(publishedDate desc) ${BLOG_POST_CARD_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('blogPost')),
    ),
  ),
);
const fetchResearchStudies = cache((): Promise<ResearchStudy[]> =>
  withRetry(() =>
    cachedReadClient.fetch<ResearchStudy[]>(
      `*[_type == "research"] | order(publishedDate desc) ${RESEARCH_CARD_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('research')),
    ),
  ),
);
const fetchCategories = cache((): Promise<Category[]> =>
  withRetry(() =>
    cachedReadClient.fetch<Category[]>(
      `*[_type == "category"] ${CATEGORY_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('category')),
    ),
  ),
);
const fetchTeamMembers = cache((): Promise<TeamMember[]> =>
  withRetry(() =>
    cachedReadClient.fetch<TeamMember[]>(
      `*[_type == "teamMember"] ${TEAM_MEMBER_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('teamMember')),
    ),
  ),
);
const fetchIndustries = cache((): Promise<Industry[]> =>
  withRetry(() =>
    cachedReadClient.fetch<Industry[]>(
      `*[_type == "industry"] ${INDUSTRY_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('industry')),
    ),
  ),
);
const fetchTechnologies = cache((): Promise<Technology[]> =>
  withRetry(() =>
    cachedReadClient.fetch<Technology[]>(
      `*[_type == "technology"] ${TECHNOLOGY_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('technology')),
    ),
  ),
);
const fetchServiceCategories = cache((): Promise<ServiceCategory[]> =>
  withRetry(() =>
    cachedReadClient.fetch<ServiceCategory[]>(
      `*[_type == "serviceCategory"] ${SERVICE_CATEGORY_PROJECTION}`,
      {},
      cacheFor(cmsTypeTag('serviceCategory')),
    ),
  ),
);

// ── Shared shaping helpers ───────────────────────────────────────────

function toMapById<T extends { id: string }>(items: T[] | null | undefined): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items || []) map.set(item.id, item);
  return map;
}

const filterHiddenCaseStudies = (items: CaseStudy[] | null | undefined): CaseStudy[] =>
  (items || []).filter((s) => !isHiddenCaseStudySlug(s.slug));

const byPublishedDateDesc = (a: BlogPost, b: BlogPost): number =>
  new Date(b['published-date'] || 0).getTime() - new Date(a['published-date'] || 0).getTime();

// ── Data fetching ────────────────────────────────────────────────────

/**
 * Fetch all homepage CMS data in parallel via GROQ.
 * Composed from the request-deduped per-collection fetchers above.
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  const data = getEmptyHomepageData();

  try {
    const [
      caseStudies,
      clients,
      testimonials,
      blogPosts,
      categories,
      teamMembers,
      industries,
      technologies,
      serviceCategories,
    ] = await Promise.all([
      fetchCaseStudies(),
      fetchClients(),
      fetchTestimonials(),
      fetchBlogPosts(),
      fetchCategories(),
      fetchTeamMembers(),
      fetchIndustries(),
      fetchTechnologies(),
      fetchServiceCategories(),
    ]);

    data.caseStudies = filterHiddenCaseStudies(caseStudies);

    if (clients) {
      for (const c of clients) {
        data.clients.set(c.id, c);
        data.allClients.push(c);
      }
    }

    if (testimonials) {
      for (const t of testimonials) {
        data.allTestimonials.push(t);
        if (t['case-study']) {
          data.testimonials.set(t['case-study'], t);
        }
      }
    }

    if (categories) {
      for (const c of categories) {
        data.categories.set(c.id, c);
      }
    }

    if (teamMembers) {
      for (const m of teamMembers) {
        data.teamMembers.set(m.id, m);
      }
    }

    if (industries) {
      for (const i of industries) {
        data.industries.set(i.id, i);
      }
    }

    if (technologies) {
      for (const t of technologies) {
        data.technologies.set(t.id, t);
      }
    }

    if (serviceCategories) {
      for (const s of serviceCategories) {
        data.serviceCategories.set(s.id, s);
      }
    }

    // Sort blog posts by published date, newest first (fetcher already orders
    // by publishedDate desc; this JS pass keeps the ordering explicit + stable).
    data.blogPosts = (blogPosts || []).slice().sort(byPublishedDateDesc);
  } catch (error) {
    console.error('[CMS] Homepage data fetch failed:', error);
  }

  return data;
}

/**
 * Validate that critical CMS data was fetched successfully.
 */
export function assertCmsData(data: HomepageData): void {
  if (data.caseStudies.length === 0 && data.blogPosts.length === 0) {
    throw new CmsDataError(
      'Build aborted: CMS returned 0 case studies and 0 blog posts. ' +
        'This usually means Sanity was temporarily unavailable. ' +
        'The previous working deployment will continue serving.'
    );
  }
}

// ── Sanity type → GROQ projection map ────────────────────────────────

const TYPE_PROJECTIONS: Record<string, string> = {
  caseStudy: CASE_STUDY_PROJECTION,
  client: CLIENT_PROJECTION,
  testimonial: TESTIMONIAL_PROJECTION,
  blogPost: BLOG_POST_PROJECTION,
  research: RESEARCH_PROJECTION,
  category: CATEGORY_PROJECTION,
  teamMember: TEAM_MEMBER_PROJECTION,
  industry: INDUSTRY_PROJECTION,
  technology: TECHNOLOGY_PROJECTION,
  serviceCategory: SERVICE_CATEGORY_PROJECTION,
  seoPage: SEO_PAGE_PROJECTION,
  blogFaq: BLOG_FAQ_PROJECTION,
};

// Collection key → Sanity type (for API route compatibility)
const COLLECTION_TO_TYPE: Record<string, string> = {
  blog: 'blogPost',
  research: 'research',
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

/**
 * Fetch a single item by slug
 */
export const fetchItemBySlug = cache(
  async <T>(collectionKey: string, slug: string): Promise<T | null> => {
    if (!slug) return null;

    const sanityType = COLLECTION_TO_TYPE[collectionKey] || collectionKey;
    if (sanityType === 'caseStudy' && isHiddenCaseStudySlug(slug)) {
      return null;
    }

    const projection = TYPE_PROJECTIONS[sanityType] || `{ "id": _id, ... }`;

    // Draft-aware: when Next.js draft mode is on, getServerClient returns the
    // draft document with stega encoding so VisualEditing can map text → field
    // in Studio, and no cache options are attached. When off, the published
    // document comes from the source-of-truth client and is cached by Next.
    const isDraft = (await draftMode()).isEnabled;
    const query = `*[_type == $type && slug.current == $slug][0] ${projection}`;
    const params = { type: sanityType, slug };
    const result = await withRetry(async () => {
      if (isDraft) {
        const draftClient = await getServerClient();
        return draftClient.fetch<T | null>(query, params);
      }

      return cachedReadClient.fetch<T | null>(
        query,
        params,
        cacheFor(cmsTypeTag(sanityType), cmsDocTag(sanityType, slug)),
      );
    });

    return result;
  }
);

/**
 * Fetch all items from a collection (used by API routes)
 */
export async function fetchCollection<T>(collectionKey: string): Promise<T[]> {
  const sanityType = COLLECTION_TO_TYPE[collectionKey] || collectionKey;
  const projection = TYPE_PROJECTIONS[sanityType] || `{ "id": _id, ... }`;

  const items = await withRetry(() =>
    cachedReadClient.fetch<T[]>(
      `*[_type == $type] ${projection}`,
      { type: sanityType },
      cacheFor(cmsTypeTag(sanityType)),
    )
  );

  if (sanityType === 'caseStudy' && Array.isArray(items)) {
    return items.filter(
      (item) => !isHiddenCaseStudySlug((item as { slug?: string }).slug),
    );
  }

  return items;
}

export interface SitemapData {
  caseStudies: Array<{ slug?: string; _updatedAt?: string }>;
  blogPosts: Array<{ slug?: string; 'published-date'?: string; 'last-updated'?: string }>;
  seoPages: Array<{ slug?: string; _updatedAt?: string }>;
  teamMembers: Array<{ slug?: string; _updatedAt?: string }>;
}

/**
 * Fetch only the URL and date fields needed by the sitemap.
 *
 * This must not use the 24-hour page-list cache. The sitemap route itself is
 * revalidated hourly, but a nested 24-hour CMS fetch would still serve the old
 * URL list during that regeneration window. A dedicated one-hour projection
 * keeps the Sanity request small while bounding the stale sitemap window when
 * a publish webhook is missed.
 */
export async function fetchSitemapData(): Promise<SitemapData> {
  const [caseStudies, blogPosts, seoPages, teamMembers] = await Promise.all([
    withRetry(() =>
      cachedReadClient.fetch<SitemapData['caseStudies']>(
        `*[_type == "caseStudy" && defined(slug.current)] { "slug": slug.current, "_updatedAt": _updatedAt }`,
        {},
        sitemapCacheFor(cmsTypeTag('caseStudy')),
      ),
    ),
    withRetry(() =>
      cachedReadClient.fetch<SitemapData['blogPosts']>(
        `*[_type == "blogPost" && defined(slug.current)] | order(publishedDate desc) { "slug": slug.current, "published-date": publishedDate, "last-updated": lastUpdated }`,
        {},
        sitemapCacheFor(cmsTypeTag('blogPost')),
      ),
    ),
    withRetry(() =>
      cachedReadClient.fetch<SitemapData['seoPages']>(
        `*[_type == "seoPage" && defined(slug.current)] { "slug": slug.current, "_updatedAt": _updatedAt }`,
        {},
        sitemapCacheFor(cmsTypeTag('seoPage')),
      ),
    ),
    withRetry(() =>
      cachedReadClient.fetch<SitemapData['teamMembers']>(
        `*[_type == "teamMember" && defined(slug.current)] { "slug": slug.current, "_updatedAt": _updatedAt }`,
        {},
        sitemapCacheFor(cmsTypeTag('teamMember')),
      ),
    ),
  ]);

  return {
    caseStudies: caseStudies.filter((study) => !isHiddenCaseStudySlug(study.slug)),
    blogPosts,
    seoPages,
    teamMembers,
  };
}

/**
 * Fetch just the slugs of a collection.
 *
 * generateStaticParams only ever needs slugs, but fetchCollection returns the
 * full projection - for blog posts that meant pulling every article body to
 * build a list of URL segments. This asks Sanity for the one field it uses.
 */
export async function fetchSlugs(collectionKey: string): Promise<string[]> {
  const sanityType = COLLECTION_TO_TYPE[collectionKey] || collectionKey;

  const rows = await withRetry(() =>
    cachedReadClient.fetch<Array<{ slug?: string }>>(
      `*[_type == $type && defined(slug.current)] { "slug": slug.current }`,
      { type: sanityType },
      cacheFor(cmsTypeTag(sanityType)),
    ),
  );

  const slugs = (rows || [])
    .map((row) => row.slug)
    .filter((slug): slug is string => !!slug);

  if (sanityType === 'caseStudy') {
    return slugs.filter((slug) => !isHiddenCaseStudySlug(slug));
  }

  return slugs;
}

/**
 * Fetch SEO pages collection (programmatic SEO hub)
 */
export async function fetchSeoPages(): Promise<SeoPage[]> {
  return client.fetch<SeoPage[]>(
    `*[_type == "seoPage"] | order(displayOrder asc) ${SEO_PAGE_PROJECTION}`
  );
}

/**
 * Fetch footer data (case studies + blog posts).
 *
 * Composed from the request-deduped fetchers, so when the page body also
 * pulls case studies / blog posts (homepage, blog, case-studies), the footer
 * shares those queries instead of issuing its own duplicates. allSettled is
 * kept so one malformed collection doesn't blow away the other.
 */
export async function fetchFooterData(): Promise<FooterData> {
  const [caseStudiesRes, blogPostsRes] = await Promise.allSettled([
    fetchCaseStudies(),
    fetchBlogPosts(),
  ]);

  if (caseStudiesRes.status === 'rejected') {
    console.error('[CMS] Footer case studies fetch failed:', caseStudiesRes.reason);
  }
  if (blogPostsRes.status === 'rejected') {
    console.error('[CMS] Footer blog posts fetch failed:', blogPostsRes.reason);
  }

  const caseStudies = caseStudiesRes.status === 'fulfilled' ? caseStudiesRes.value : [];
  const blogPosts = blogPostsRes.status === 'fulfilled' ? blogPostsRes.value : [];

  return {
    caseStudies: filterHiddenCaseStudies(caseStudies),
    blogPosts: blogPosts || [],
  };
}

// ── Narrow, per-page composers ───────────────────────────────────────
// Each pulls only the collections its page actually reads. Because they
// share the request-deduped fetchers, the footer's case-study/blog-post
// queries fold into these for free (no extra round-trips).

export interface BlogIndexData {
  blogPosts: BlogPost[];
  categories: Map<string, Category>;
}

/**
 * Blog index (/blog) — reads blog posts + categories only.
 */
export async function fetchBlogIndexData(): Promise<BlogIndexData> {
  const result: BlogIndexData = { blogPosts: [], categories: new Map() };
  try {
    const [blogPosts, categories] = await Promise.all([fetchBlogPosts(), fetchCategories()]);
    result.blogPosts = (blogPosts || []).slice().sort(byPublishedDateDesc);
    result.categories = toMapById(categories);
  } catch (error) {
    console.error('[CMS] Blog index data fetch failed:', error);
  }
  return result;
}


export interface ResearchIndexData {
  studies: ResearchStudy[];
  teamMembers: Map<string, TeamMember>;
}

/**
 * Research index (/research). Reads card-level studies plus team members, so
 * the index can name the researchers without a second round trip.
 */
export async function fetchResearchIndexData(): Promise<ResearchIndexData> {
  const result: ResearchIndexData = { studies: [], teamMembers: new Map() };
  try {
    const [studies, teamMembers] = await Promise.all([fetchResearchStudies(), fetchTeamMembers()]);
    result.studies = (studies || []).slice().sort(byPublishedDateDesc);
    result.teamMembers = toMapById(teamMembers);
  } catch (error) {
    console.error('[CMS] Research index data fetch failed:', error);
  }
  return result;
}

export interface ResearchDetailData {
  studies: ResearchStudy[];
  teamMembers: Map<string, TeamMember>;
}

/**
 * Research detail (/research/[slug]) — card-level studies for the related
 * strip and the superseded notice, plus team members for the bylines. The
 * study itself comes from fetchItemBySlug with the full projection.
 */
export async function fetchResearchDetailData(): Promise<ResearchDetailData> {
  const result: ResearchDetailData = { studies: [], teamMembers: new Map() };
  try {
    const [studies, teamMembers] = await Promise.all([fetchResearchStudies(), fetchTeamMembers()]);
    result.studies = (studies || []).slice().sort(byPublishedDateDesc);
    result.teamMembers = toMapById(teamMembers);
  } catch (error) {
    console.error('[CMS] Research detail data fetch failed:', error);
  }
  return result;
}

export interface BlogPostData {
  blogPosts: BlogPost[];
  categories: Map<string, Category>;
  teamMembers: Map<string, TeamMember>;
}

/**
 * Blog post (/blog/[slug]) — reads blog posts (for related selection),
 * categories, and team members (author). The post itself is fetched
 * separately via fetchItemBySlug.
 */
export async function fetchBlogPostData(): Promise<BlogPostData> {
  const result: BlogPostData = { blogPosts: [], categories: new Map(), teamMembers: new Map() };
  try {
    const [blogPosts, categories, teamMembers] = await Promise.all([
      fetchBlogPosts(),
      fetchCategories(),
      fetchTeamMembers(),
    ]);
    result.blogPosts = (blogPosts || []).slice().sort(byPublishedDateDesc);
    result.categories = toMapById(categories);
    result.teamMembers = toMapById(teamMembers);
  } catch (error) {
    console.error('[CMS] Blog post data fetch failed:', error);
  }
  return result;
}

export interface CaseStudyIndexData {
  caseStudies: CaseStudy[];
  clients: Map<string, Client>;
  industries: Map<string, Industry>;
  technologies: Map<string, Technology>;
}

/**
 * Case-studies gallery (/case-studies) — reads case studies + clients +
 * industries + technologies (the archive grid + discipline filters).
 */
export async function fetchCaseStudyIndexData(): Promise<CaseStudyIndexData> {
  const result: CaseStudyIndexData = {
    caseStudies: [],
    clients: new Map(),
    industries: new Map(),
    technologies: new Map(),
  };
  try {
    const [caseStudies, clients, industries, technologies] = await Promise.all([
      fetchCaseStudies(),
      fetchClients(),
      fetchIndustries(),
      fetchTechnologies(),
    ]);
    result.caseStudies = filterHiddenCaseStudies(caseStudies);
    result.clients = toMapById(clients);
    result.industries = toMapById(industries);
    result.technologies = toMapById(technologies);
  } catch (error) {
    console.error('[CMS] Case study index data fetch failed:', error);
  }
  return result;
}

export interface CaseStudyDetailData {
  caseStudies: CaseStudy[];
  clients: Map<string, Client>;
  testimonials: Map<string, Testimonial>;
  allTestimonials: Testimonial[];
  industries: Map<string, Industry>;
  technologies: Map<string, Technology>;
  serviceCategories: Map<string, ServiceCategory>;
}

/**
 * Case-study detail (/case-studies/[slug]) — reads everything the template
 * resolves: sibling case studies (related scorer), clients, testimonials
 * (indexed + full list), industries, technologies, service categories.
 * Skips blog posts / categories / team members, which the template never
 * touches. The study itself is fetched separately via fetchItemBySlug.
 */
export async function fetchCaseStudyDetailData(): Promise<CaseStudyDetailData> {
  const result: CaseStudyDetailData = {
    caseStudies: [],
    clients: new Map(),
    testimonials: new Map(),
    allTestimonials: [],
    industries: new Map(),
    technologies: new Map(),
    serviceCategories: new Map(),
  };
  try {
    const [caseStudies, clients, testimonials, industries, technologies, serviceCategories] =
      await Promise.all([
        fetchCaseStudies(),
        fetchClients(),
        fetchTestimonials(),
        fetchIndustries(),
        fetchTechnologies(),
        fetchServiceCategories(),
      ]);
    result.caseStudies = filterHiddenCaseStudies(caseStudies);
    result.clients = toMapById(clients);
    if (testimonials) {
      for (const t of testimonials) {
        result.allTestimonials.push(t);
        if (t['case-study']) {
          result.testimonials.set(t['case-study'], t);
        }
      }
    }
    result.industries = toMapById(industries);
    result.technologies = toMapById(technologies);
    result.serviceCategories = toMapById(serviceCategories);
  } catch (error) {
    console.error('[CMS] Case study detail data fetch failed:', error);
  }
  return result;
}

/**
 * Check if a collection key is valid
 */
export function isValidCollection(name: string): boolean {
  return name in COLLECTION_TO_TYPE;
}
