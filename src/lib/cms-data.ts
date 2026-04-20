/**
 * CMS Data Fetching Utilities
 *
 * Fetches data from Sanity CMS using GROQ queries.
 * GROQ projections map camelCase Sanity fields to kebab-case TypeScript interfaces.
 */

import { cache } from 'react';
import { client } from './sanity.client';
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
    chart
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

// ── Data fetching ────────────────────────────────────────────────────

/**
 * Fetch all homepage CMS data in parallel via GROQ
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
      client.fetch<CaseStudy[]>(`*[_type == "caseStudy"] ${CASE_STUDY_PROJECTION}`),
      client.fetch<Client[]>(`*[_type == "client"] ${CLIENT_PROJECTION}`),
      client.fetch<Testimonial[]>(`*[_type == "testimonial"] ${TESTIMONIAL_PROJECTION}`),
      client.fetch<BlogPost[]>(`*[_type == "blogPost"] ${BLOG_POST_PROJECTION}`),
      client.fetch<Category[]>(`*[_type == "category"] ${CATEGORY_PROJECTION}`),
      client.fetch<TeamMember[]>(`*[_type == "teamMember"] ${TEAM_MEMBER_PROJECTION}`),
      client.fetch<Industry[]>(`*[_type == "industry"] ${INDUSTRY_PROJECTION}`),
      client.fetch<Technology[]>(`*[_type == "technology"] ${TECHNOLOGY_PROJECTION}`),
      client.fetch<ServiceCategory[]>(`*[_type == "serviceCategory"] ${SERVICE_CATEGORY_PROJECTION}`),
    ]);

    data.caseStudies = caseStudies || [];

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

    // Sort blog posts by published date, newest first
    data.blogPosts = (blogPosts || []).sort((a, b) => {
      const dateA = new Date(a['published-date'] || 0).getTime();
      const dateB = new Date(b['published-date'] || 0).getTime();
      return dateB - dateA;
    });
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
    const projection = TYPE_PROJECTIONS[sanityType] || `{ "id": _id, ... }`;

    const result = await client.fetch<T | null>(
      `*[_type == $type && slug.current == $slug][0] ${projection}`,
      { type: sanityType, slug }
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

  return client.fetch<T[]>(
    `*[_type == $type] ${projection}`,
    { type: sanityType }
  );
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
 * Fetch footer data (case studies + blog posts)
 */
export async function fetchFooterData(): Promise<FooterData> {
  try {
    const [caseStudies, blogPosts] = await Promise.all([
      client.fetch<CaseStudy[]>(`*[_type == "caseStudy"] ${CASE_STUDY_PROJECTION}`),
      client.fetch<BlogPost[]>(
        `*[_type == "blogPost"] | order(publishedDate desc) ${BLOG_POST_PROJECTION}`
      ),
    ]);

    return {
      caseStudies: caseStudies || [],
      blogPosts: blogPosts || [],
    };
  } catch (error) {
    console.error('[CMS] Footer data fetch failed:', error);
    return { caseStudies: [], blogPosts: [] };
  }
}

/**
 * Check if a collection key is valid
 */
export function isValidCollection(name: string): boolean {
  return name in COLLECTION_TO_TYPE;
}
