/**
 * Webflow CMS Collection IDs
 * Centralized mapping to avoid duplication across files
 */
export const COLLECTION_IDS = {
  blog: "67b46d898180d5b8499f87e8",
  "case-studies": "67bcc512271a06e2e0acc70d",
  testimonials: "67bd0c6f1a9fdd9770be5469",
  clients: "67c6f017e3221db91323ff13",
  "blog-faq": "67bd3732a35ec40d3038b40a",
  "team-members": "68d819d1810ef43a5ef97da4",
  technologies: "67be3e735523f789035b6c56",
  categories: "67b46e2d70ec96bfb7787071",
  industries: "67bd0a772117f7c7227e7b4d",
  "service-categories": "67bcfb9cdb20a1832e2799c3",
  "seo-pages": "6988a63150526a37d700fae3",
} as const;

export type CollectionName = keyof typeof COLLECTION_IDS;

/**
 * Get collection ID by name with type safety
 */
export function getCollectionId(name: CollectionName): string {
  return COLLECTION_IDS[name];
}

/**
 * Check if a string is a valid collection name
 */
export function isValidCollection(name: string): name is CollectionName {
  return name in COLLECTION_IDS;
}
