/**
 * CMS Configuration Utilities
 *
 * Server-side utilities for applying CMS filter/sort configurations.
 * These settings persist in cms-config.json and affect production builds.
 * Field mappings are now auto-generated from cms-schemas.json.
 */

import cmsConfig from '../data/cms-config.json';
import cmsSchemas from '../data/cms-schemas.json';

// ============================================
// TYPES
// ============================================

export type FilterOperator = 'equals' | 'not_equals' | 'is_set' | 'is_not_set';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string;
}

export interface CMSSectionConfig {
  filters: FilterCondition[];
  sort: { field: string; dir: 'asc' | 'desc' } | null;
  limit: number | null;
}

export interface CMSConfig {
  sections: Record<string, CMSSectionConfig>;
}

interface CollectionSchema {
  id: string;
  name: string;
  fields: Array<{ slug: string; type: string }>;
}

interface CMSSchemas {
  collections: Record<string, CollectionSchema>;
}

// ============================================
// CONFIGURATION ACCESS
// ============================================

const schemas = cmsSchemas as CMSSchemas;

/**
 * Get the configuration for a specific CMS section
 */
export function getSectionConfig(sectionId: string): CMSSectionConfig {
  const config = (cmsConfig as CMSConfig).sections[sectionId];
  return config || { filters: [], sort: null, limit: null };
}

/**
 * Auto-generate field mapping from schema
 * This creates a generic getter for each field in the collection schema
 */
function generateFieldMapping<T extends Record<string, unknown>>(
  collectionName: string
): Record<string, (item: T) => FieldValue> {
  const schema = schemas.collections[collectionName];
  if (!schema) return {};

  const mapping: Record<string, (item: T) => FieldValue> = {};

  for (const field of schema.fields) {
    const slug = field.slug;
    // Create a getter that tries both exact slug and camelCase
    mapping[slug] = (item: T) => {
      // Try exact match first
      if (slug in item) {
        return item[slug] as FieldValue;
      }
      // Try camelCase version
      const camelCase = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (camelCase in item) {
        return item[camelCase] as FieldValue;
      }
      return undefined;
    };
  }

  return mapping;
}

// ============================================
// FILTER MATCHING
// ============================================

// Type for field values that can be checked
type FieldValue = string | number | boolean | undefined | null | object;

/**
 * Check if a value is "set" (exists and is not empty)
 * Handles various data types including objects (images), strings, booleans
 */
function isValueSet(value: FieldValue): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'boolean') return true; // booleans are always "set"
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'object') {
    // For image/file objects, check for url property
    if ('url' in value) {
      return typeof (value as { url: unknown }).url === 'string' &&
             (value as { url: string }).url.trim() !== '';
    }
    // For other objects, check if not empty
    return Object.keys(value).length > 0;
  }
  return false;
}

/**
 * Check equality for various value types
 */
function matchesEquals(itemValue: FieldValue, filterValue: string): boolean {
  if (itemValue === null || itemValue === undefined) {
    return filterValue === '';
  }

  // Boolean comparison
  if (typeof itemValue === 'boolean') {
    return String(itemValue) === filterValue;
  }

  // Number comparison
  if (typeof itemValue === 'number') {
    return String(itemValue) === filterValue || itemValue === Number(filterValue);
  }

  // String comparison (case-sensitive for IDs)
  if (typeof itemValue === 'string') {
    return itemValue === filterValue;
  }

  // Object comparison (for reference IDs)
  if (typeof itemValue === 'object' && 'id' in itemValue) {
    return (itemValue as { id: string }).id === filterValue;
  }

  return String(itemValue) === filterValue;
}

/**
 * Check if a single filter condition matches an item
 */
function matchesCondition<T>(
  item: T,
  condition: FilterCondition,
  fieldMapping: Record<string, (item: T) => FieldValue>
): boolean {
  const { field, operator, value } = condition;
  const getter = fieldMapping[field];

  if (!getter) {
    // Field not mapped, skip this condition (treat as matching)
    return true;
  }

  const itemValue = getter(item);

  switch (operator) {
    case 'is_set':
      return isValueSet(itemValue);

    case 'is_not_set':
      return !isValueSet(itemValue);

    case 'equals':
      return matchesEquals(itemValue, value);

    case 'not_equals':
      return !matchesEquals(itemValue, value);

    default:
      return true;
  }
}

// ============================================
// MAIN FILTER/SORT APPLICATION
// ============================================

/**
 * Apply CMS configuration to an array of items
 *
 * Field mappings are auto-generated from the collection schema.
 *
 * @param items - Array of CMS items to filter/sort
 * @param sectionId - The section ID to get config for (matches data-cms-section)
 * @param collection - The collection name for schema lookup (e.g., 'case-studies', 'blog')
 *
 * @example
 * ```ts
 * // The component passes the collection it's rendering
 * const filtered = applyCMSConfig(caseStudies, 'hero-slider', 'case-studies');
 * const blogPosts = applyCMSConfig(posts, 'knowledge-slider', 'blog');
 * ```
 */
export function applyCMSConfig<T extends Record<string, unknown>>(
  items: T[],
  sectionId: string,
  collection: string
): T[] {
  // Auto-generate field mapping from collection schema
  const mapping = generateFieldMapping<T>(collection);
  const config = getSectionConfig(sectionId);
  let result = [...items];

  // Apply all filter conditions (AND logic)
  if (config.filters && config.filters.length > 0) {
    for (const condition of config.filters) {
      // Skip empty conditions
      if (!condition.field) continue;

      // For equals/not_equals with empty value on non-set operators, skip
      if (['equals', 'not_equals'].includes(condition.operator) && !condition.value) {
        continue;
      }

      result = result.filter(item => matchesCondition(item, condition, mapping));
    }
  }

  // Apply sort
  if (config.sort && mapping[config.sort.field]) {
    const sortField = config.sort.field;
    const sortDir = config.sort.dir;

    result.sort((a, b) => {
      const aVal = mapping[sortField](a);
      const bVal = mapping[sortField](b);

      // Handle undefined values
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      // Convert to strings for comparison
      const aStr = String(aVal);
      const bStr = String(bVal);

      // Check if values are dates
      const aDate = Date.parse(aStr);
      const bDate = Date.parse(bStr);

      let comparison: number;
      if (!isNaN(aDate) && !isNaN(bDate)) {
        comparison = aDate - bDate;
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = aStr.localeCompare(bStr);
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }

  // Apply limit
  if (config.limit && config.limit > 0) {
    result = result.slice(0, config.limit);
  }

  return result;
}

/**
 * Check if a section has any active configuration
 */
export function hasActiveConfig(sectionId: string): boolean {
  const config = getSectionConfig(sectionId);
  return (
    (config.filters && config.filters.length > 0 && config.filters.some(f => f.field)) ||
    config.sort !== null ||
    config.limit !== null
  );
}
