/**
 * CMS Data Fetching Utilities
 *
 * Fetches data from Sanity CMS using GROQ queries.
 * GROQ projections map camelCase Sanity fields to kebab-case TypeScript interfaces.
 */

import { cache } from 'react';
import { client, getServerClient } from './sanity.client';
import type {
  CaseStudy,
  Client,
  Testimonial,
  BlogPost,
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
  skills
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
  "cta-subtitle": ctaSubtitle
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

const fetchCaseStudies = cache((): Promise<CaseStudy[]> =>
  withRetry(() => client.fetch<CaseStudy[]>(`*[_type == "caseStudy"] ${CASE_STUDY_PROJECTION}`)),
);
const fetchClients = cache((): Promise<Client[]> =>
  withRetry(() => client.fetch<Client[]>(`*[_type == "client"] ${CLIENT_PROJECTION}`)),
);
const fetchTestimonials = cache((): Promise<Testimonial[]> =>
  withRetry(() => client.fetch<Testimonial[]>(`*[_type == "testimonial"] ${TESTIMONIAL_PROJECTION}`)),
);
const fetchBlogPosts = cache((): Promise<BlogPost[]> =>
  withRetry(() =>
    client.fetch<BlogPost[]>(`*[_type == "blogPost"] | order(publishedDate desc) ${BLOG_POST_PROJECTION}`),
  ),
);
const fetchCategories = cache((): Promise<Category[]> =>
  withRetry(() => client.fetch<Category[]>(`*[_type == "category"] ${CATEGORY_PROJECTION}`)),
);
const fetchTeamMembers = cache((): Promise<TeamMember[]> =>
  withRetry(() => client.fetch<TeamMember[]>(`*[_type == "teamMember"] ${TEAM_MEMBER_PROJECTION}`)),
);
const fetchIndustries = cache((): Promise<Industry[]> =>
  withRetry(() => client.fetch<Industry[]>(`*[_type == "industry"] ${INDUSTRY_PROJECTION}`)),
);
const fetchTechnologies = cache((): Promise<Technology[]> =>
  withRetry(() => client.fetch<Technology[]>(`*[_type == "technology"] ${TECHNOLOGY_PROJECTION}`)),
);
const fetchServiceCategories = cache((): Promise<ServiceCategory[]> =>
  withRetry(() => client.fetch<ServiceCategory[]>(`*[_type == "serviceCategory"] ${SERVICE_CATEGORY_PROJECTION}`)),
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

    // Draft-aware: when Next.js draft mode is on, returns the draft document
    // with stega encoding so VisualEditing can map text → field in Studio.
    // When off, returns the public published document.
    const fetchClient = await getServerClient();
    const result = await withRetry(() =>
      fetchClient.fetch<T | null>(
        `*[_type == $type && slug.current == $slug][0] ${projection}`,
        { type: sanityType, slug }
      )
    );

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
    client.fetch<T[]>(
      `*[_type == $type] ${projection}`,
      { type: sanityType }
    )
  );

  if (sanityType === 'caseStudy' && Array.isArray(items)) {
    return items.filter(
      (item) => !isHiddenCaseStudySlug((item as { slug?: string }).slug),
    );
  }

  return items;
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
