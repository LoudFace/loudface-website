/**
 * CMS Data Fetching Utilities
 *
 * Consolidates all CMS data fetching logic for the homepage and other pages.
 * Handles caching, normalization, and reference lookups.
 */

import { COLLECTION_IDS } from './constants';
import { getCached, setCache } from './cms-cache';
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
} from './types';

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
 * Fetch a single collection from Webflow CMS with caching
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

  // Fetch from API
  const res = await fetch(
    `https://api.webflow.com/v2/collections/${collectionId}/items`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  // Cache the response (only works in dev)
  setCache(collectionId, data);
  return data;
}

/**
 * Normalize a CMS item by merging fieldData into the root object
 */
function normalizeItem<T>(item: any): T {
  return { id: item.id, ...item.fieldData } as T;
}

/**
 * Filter out draft and archived items
 */
function isPublished(item: any): boolean {
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
      fetchCollection<any>('case-studies', accessToken),
      fetchCollection<any>('clients', accessToken),
      fetchCollection<any>('testimonials', accessToken),
      fetchCollection<any>('blog', accessToken),
      fetchCollection<any>('categories', accessToken),
      fetchCollection<any>('team-members', accessToken),
      fetchCollection<any>('industries', accessToken),
      fetchCollection<any>('technologies', accessToken),
      fetchCollection<any>('service-categories', accessToken),
    ]);

    // Build clients lookup map and array
    if (clientsData?.items) {
      clientsData.items.forEach((item: any) => {
        if (isPublished(item)) {
          const client = normalizeItem<Client>(item);
          data.clients.set(item.id, client);
          data.allClients.push(client);
        }
      });
    }

    // Normalize case studies and filter published only
    if (caseStudiesData?.items) {
      data.caseStudies = caseStudiesData.items
        .filter(isPublished)
        .map((item: any) => normalizeItem<CaseStudy>(item));
    }

    // Build testimonials lookup map and array
    if (testimonialsData?.items) {
      testimonialsData.items.forEach((item: any) => {
        if (isPublished(item)) {
          const testimonial = normalizeItem<Testimonial>(item);
          data.allTestimonials.push(testimonial);
          // Also index by case-study ID for case study cards
          if (item.fieldData['case-study']) {
            data.testimonials.set(item.fieldData['case-study'], testimonial);
          }
        }
      });
    }

    // Build categories lookup map
    if (categoriesData?.items) {
      categoriesData.items.forEach((item: any) => {
        if (isPublished(item)) {
          const category = normalizeItem<Category>(item);
          data.categories.set(item.id, category);
        }
      });
    }

    // Build team members lookup map
    if (teamMembersData?.items) {
      teamMembersData.items.forEach((item: any) => {
        if (isPublished(item)) {
          const member = normalizeItem<TeamMember>(item);
          data.teamMembers.set(item.id, member);
        }
      });
    }

    // Build industries lookup map
    if (industriesData?.items) {
      industriesData.items.forEach((item: any) => {
        if (isPublished(item)) {
          const industry = normalizeItem<Industry>(item);
          data.industries.set(item.id, industry);
        }
      });
    }

    // Build technologies lookup map
    if (technologiesData?.items) {
      technologiesData.items.forEach((item: any) => {
        if (isPublished(item)) {
          const technology = normalizeItem<Technology>(item);
          data.technologies.set(item.id, technology);
        }
      });
    }

    // Build service categories lookup map
    if (serviceCategoriesData?.items) {
      serviceCategoriesData.items.forEach((item: any) => {
        if (isPublished(item)) {
          const serviceCategory = normalizeItem<ServiceCategory>(item);
          data.serviceCategories.set(item.id, serviceCategory);
        }
      });
    }

    // Build blog posts array (sorted by published date, newest first)
    if (blogData?.items) {
      data.blogPosts = blogData.items
        .filter(isPublished)
        .map((item: any) => normalizeItem<BlogPost>(item))
        .sort((a: BlogPost, b: BlogPost) => {
          const dateA = new Date(a['published-date'] || 0).getTime();
          const dateB = new Date(b['published-date'] || 0).getTime();
          return dateB - dateA;
        });
    }
  } catch (error) {
    console.error('[CMS] Homepage data fetch failed:', error);
    // Return empty data - page will render with fallback content
  }

  return data;
}

/**
 * Get access token from Astro locals or environment
 */
export function getAccessToken(locals: any): string | undefined {
  return (
    locals?.runtime?.env?.WEBFLOW_SITE_API_TOKEN ||
    import.meta.env.WEBFLOW_SITE_API_TOKEN
  );
}
