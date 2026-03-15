/**
 * CMS Data Fetching Utilities
 *
 * Consolidates all CMS data fetching logic for the homepage and other pages.
 * Handles caching, normalization, and reference lookups.
 */

import { COLLECTION_IDS } from "./constants";
import { getCached, setCache } from "./cms-cache";
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
} from "./types";

/**
 * Error thrown when CMS data fetching fails critically.
 * Signals to the build process that the deployment should be aborted.
 */
export class CmsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CmsDataError";
  }
}

/**
 * Homepage data structure containing all CMS collections
 */
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

/**
 * Empty data structure for when CMS fetch fails or no token
 */
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

/**
 * Fetch a single collection from Webflow CMS with caching and retry.
 * Retries up to 3 times with exponential backoff on failure.
 * Uses longer backoff for 429 (rate limit) vs 5xx (server error).
 */
export async function fetchCollection<T>(
  collectionKey: keyof typeof COLLECTION_IDS,
  accessToken: string
): Promise<{ items: T[] } | null> {
  const collectionId = COLLECTION_IDS[collectionKey];
  if (!collectionId) return null;

  // Check cache first (only works in dev)
  const cached = getCached<{ items: T[] }>(collectionId);
  if (cached) {
    return cached;
  }

  const MAX_RETRIES = 3;
  const url = `https://api.webflow.com/v2/collections/${collectionId}/items`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const data = await res.json();
        setCache(collectionId, data);
        return data;
      }

      console.warn(
        `[CMS] ${collectionKey} returned ${res.status} (attempt ${attempt}/${MAX_RETRIES})`
      );

      if (res.status < 500 && res.status !== 429) {
        // Client error (4xx except rate limit) — don't retry
        return null;
      }

      // For 429 (rate limit): respect Retry-After header, fallback to longer backoff
      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = res.headers.get("Retry-After");
        const waitMs = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, 30000) // Cap at 30s
          : 5000 * Math.pow(2, attempt - 1); // 5s, 10s
        console.warn(`[CMS] ${collectionKey} rate limited, waiting ${waitMs}ms`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
    } catch (error) {
      console.warn(
        `[CMS] ${collectionKey} fetch error (attempt ${attempt}/${MAX_RETRIES}):`,
        error instanceof Error ? error.message : error
      );
    }

    // Exponential backoff for 5xx / network errors: 1s, 2s, 4s
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  console.error(`[CMS] ${collectionKey} failed after ${MAX_RETRIES} attempts`);
  return null;
}

/**
 * Normalize a CMS item by merging fieldData into the root object
 */
function normalizeItem<T>(item: Record<string, unknown>): T {
  return {
    id: item.id,
    ...(item.fieldData as Record<string, unknown>),
  } as T;
}

/**
 * Filter out draft and archived items
 */
function isPublished(item: Record<string, unknown>): boolean {
  return !item.isDraft && !item.isArchived;
}

/**
 * Fetch all homepage CMS data in parallel
 *
 * @param accessToken - Webflow API token
 * @returns HomepageData with all collections normalized
 */
export async function fetchHomepageData(
  accessToken: string
): Promise<HomepageData> {
  const data = getEmptyHomepageData();

  try {
    // Fetch all CMS collections in parallel
    const [
      caseStudiesData,
      clientsData,
      testimonialsData,
      blogData,
      categoriesData,
      teamMembersData,
      industriesData,
      technologiesData,
      serviceCategoriesData,
    ] = await Promise.all([
      fetchCollection<Record<string, unknown>>("case-studies", accessToken),
      fetchCollection<Record<string, unknown>>("clients", accessToken),
      fetchCollection<Record<string, unknown>>("testimonials", accessToken),
      fetchCollection<Record<string, unknown>>("blog", accessToken),
      fetchCollection<Record<string, unknown>>("categories", accessToken),
      fetchCollection<Record<string, unknown>>("team-members", accessToken),
      fetchCollection<Record<string, unknown>>("industries", accessToken),
      fetchCollection<Record<string, unknown>>("technologies", accessToken),
      fetchCollection<Record<string, unknown>>(
        "service-categories",
        accessToken
      ),
    ]);

    // Build clients lookup map and array
    if (clientsData?.items) {
      clientsData.items.forEach((item) => {
        if (isPublished(item)) {
          const client = normalizeItem<Client>(item);
          data.clients.set(item.id as string, client);
          data.allClients.push(client);
        }
      });
    }

    // Normalize case studies and filter published only
    if (caseStudiesData?.items) {
      data.caseStudies = caseStudiesData.items
        .filter(isPublished)
        .map((item) => normalizeItem<CaseStudy>(item));
    }

    // Build testimonials lookup map and array
    if (testimonialsData?.items) {
      testimonialsData.items.forEach((item) => {
        if (isPublished(item)) {
          const testimonial = normalizeItem<Testimonial>(item);
          data.allTestimonials.push(testimonial);
          // Also index by case-study ID for case study cards
          const fieldData = item.fieldData as Record<string, unknown>;
          if (fieldData["case-study"]) {
            data.testimonials.set(
              fieldData["case-study"] as string,
              testimonial
            );
          }
        }
      });
    }

    // Build categories lookup map
    if (categoriesData?.items) {
      categoriesData.items.forEach((item) => {
        if (isPublished(item)) {
          const category = normalizeItem<Category>(item);
          data.categories.set(item.id as string, category);
        }
      });
    }

    // Build team members lookup map
    if (teamMembersData?.items) {
      teamMembersData.items.forEach((item) => {
        if (isPublished(item)) {
          const member = normalizeItem<TeamMember>(item);
          data.teamMembers.set(item.id as string, member);
        }
      });
    }

    // Build industries lookup map
    if (industriesData?.items) {
      industriesData.items.forEach((item) => {
        if (isPublished(item)) {
          const industry = normalizeItem<Industry>(item);
          data.industries.set(item.id as string, industry);
        }
      });
    }

    // Build technologies lookup map
    if (technologiesData?.items) {
      technologiesData.items.forEach((item) => {
        if (isPublished(item)) {
          const technology = normalizeItem<Technology>(item);
          data.technologies.set(item.id as string, technology);
        }
      });
    }

    // Build service categories lookup map
    if (serviceCategoriesData?.items) {
      serviceCategoriesData.items.forEach((item) => {
        if (isPublished(item)) {
          const serviceCategory = normalizeItem<ServiceCategory>(item);
          data.serviceCategories.set(item.id as string, serviceCategory);
        }
      });
    }

    // Build blog posts array (sorted by published date, newest first)
    if (blogData?.items) {
      data.blogPosts = blogData.items
        .filter(isPublished)
        .map((item) => normalizeItem<BlogPost>(item))
        .sort((a: BlogPost, b: BlogPost) => {
          const dateA = new Date(a["published-date"] || 0).getTime();
          const dateB = new Date(b["published-date"] || 0).getTime();
          return dateB - dateA;
        });
    }
  } catch (error) {
    console.error("[CMS] Homepage data fetch failed:", error);
    // Return partial data — individual collections may have succeeded.
    // Callers that require complete data should use assertCmsData().
  }

  return data;
}

/**
 * Validate that critical CMS data was fetched successfully.
 * Call this in pages where empty CMS data means a broken page (e.g., homepage).
 * Throws CmsDataError to fail the build — Vercel keeps the previous working deployment.
 *
 * Pages like blog/[slug] or services/* should NOT call this — they degrade gracefully
 * with partial data rather than crashing the entire build.
 */
export function assertCmsData(data: HomepageData): void {
  if (data.caseStudies.length === 0 && data.blogPosts.length === 0) {
    throw new CmsDataError(
      "Build aborted: CMS returned 0 case studies and 0 blog posts. " +
        "This usually means the Webflow API was temporarily unavailable. " +
        "The previous working deployment will continue serving."
    );
  }
}

/**
 * Fetch SEO pages collection (programmatic SEO hub)
 * Separate from fetchHomepageData to avoid burdening all pages with an extra API call.
 */
export async function fetchSeoPages(
  accessToken: string
): Promise<SeoPage[]> {
  const data = await fetchCollection<Record<string, unknown>>(
    "seo-pages",
    accessToken
  );
  if (!data?.items) return [];
  return data.items
    .filter(isPublished)
    .map((item) => normalizeItem<SeoPage>(item))
    .sort(
      (a, b) => (a["display-order"] || 999) - (b["display-order"] || 999)
    );
}

/**
 * Get access token from environment
 */
export function getAccessToken(): string | undefined {
  return process.env.WEBFLOW_SITE_API_TOKEN;
}
