/**
 * CMS Control Panel Configuration
 *
 * Schema-driven CMS control panel for filtering and sorting CMS items.
 * Filters and sorts are automatically loaded from cms-schemas.json.
 */

import cmsSchemas from '../../data/cms-schemas.json';

// ============================================
// FIELD TYPES & OPERATORS
// ============================================

/**
 * Supported field types for filtering
 */
export type FieldType = 'text' | 'reference' | 'image' | 'boolean' | 'date' | 'number' | 'color';

/**
 * Filter operators
 */
export type FilterOperator = 'equals' | 'not_equals' | 'is_set' | 'is_not_set';

/**
 * Mapping of field types to available operators
 */
export const OPERATORS_BY_FIELD_TYPE: Record<FieldType, FilterOperator[]> = {
  text: ['equals', 'not_equals'],
  reference: ['equals', 'not_equals', 'is_set', 'is_not_set'],
  image: ['is_set', 'is_not_set'],
  boolean: ['equals'],
  date: ['equals', 'not_equals', 'is_set', 'is_not_set'],
  number: ['equals', 'not_equals'],
  color: ['is_set', 'is_not_set'],
};

/**
 * Human-readable operator labels
 */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  is_set: 'is set',
  is_not_set: 'is not set',
};

/**
 * Sort field types
 */
export type SortFieldType = 'text' | 'date' | 'number';

/**
 * Sort direction labels by field type
 */
export const SORT_DIRECTION_LABELS: Record<SortFieldType, { asc: string; desc: string }> = {
  text: { asc: 'Alphabetically (A-Z)', desc: 'Reverse Alphabetically (Z-A)' },
  date: { asc: 'Oldest to Newest', desc: 'Newest to Oldest' },
  number: { asc: 'Low to High', desc: 'High to Low' },
};

// ============================================
// SCHEMA TYPES
// ============================================

interface SchemaField {
  slug: string;
  label: string;
  type: FieldType;
  referenceCollection?: string;
  filterable: boolean;
  sortable: boolean;
}

interface CollectionSchema {
  id: string;
  name: string;
  singularName: string;
  slug: string;
  fields: SchemaField[];
}

interface CMSSchemas {
  generatedAt: string;
  collections: Record<string, CollectionSchema>;
}

// ============================================
// FILTER & SORT INTERFACES
// ============================================

/**
 * Enhanced filter option with field type metadata
 */
export interface FilterOption {
  field: string;
  label: string;
  type: FieldType;
  /**
   * For reference fields: helps identify the source collection
   */
  referenceCollection?: string;
}

/**
 * A single filter condition (used in state and config)
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string; // Empty string for is_set/is_not_set operators
}

/**
 * Enhanced sort option with field type for smart labels
 */
export interface SortOption {
  field: string;
  label: string;
  type: SortFieldType;
}

/**
 * CMS Section configuration (simplified - filters/sorts loaded from schema)
 */
export interface CMSSection {
  id: string;
  label: string;
  collection: string;
  itemSelector: string;
  containerSelector?: string;
  /** Auto-populated from schema */
  filters: FilterOption[];
  /** Auto-populated from schema */
  sorts: SortOption[];
}

// ============================================
// SCHEMA HELPERS
// ============================================

const schemas = cmsSchemas as CMSSchemas;

/**
 * Get filter options from schema for a collection
 */
export function getFiltersForCollection(collectionName: string): FilterOption[] {
  const schema = schemas.collections[collectionName];
  if (!schema) return [];

  return schema.fields
    .filter(f => f.filterable)
    .map(f => ({
      field: f.slug,
      label: f.label,
      type: f.type,
      referenceCollection: f.referenceCollection,
    }));
}

/**
 * Get sort options from schema for a collection
 */
export function getSortsForCollection(collectionName: string): SortOption[] {
  const schema = schemas.collections[collectionName];
  if (!schema) return [];

  return schema.fields
    .filter(f => f.sortable)
    .map(f => ({
      field: f.slug,
      label: f.label,
      type: mapToSortFieldType(f.type),
    }));
}

/**
 * Map schema field type to sort field type
 */
function mapToSortFieldType(type: FieldType): SortFieldType {
  if (type === 'date') return 'date';
  if (type === 'number') return 'number';
  return 'text';
}

/**
 * Get collection name from schema
 */
export function getCollectionDisplayName(collectionName: string): string {
  const schema = schemas.collections[collectionName];
  return schema?.name || collectionName;
}

// ============================================
// AUTO-DISCOVERY FROM DOM
// ============================================

/**
 * Auto-discover a CMS section from a DOM element.
 * Reads collection from child items' data-cms-collection attribute.
 * No manual configuration needed!
 *
 * @param element - The section element with data-cms-section attribute
 * @returns CMSSection config or null if no CMS items found
 */
export function discoverSectionFromDOM(element: HTMLElement): CMSSection | null {
  const sectionId = element.dataset.cmsSection;
  if (!sectionId) return null;

  // Find first CMS item to get collection info
  const firstItem = element.querySelector<HTMLElement>('[data-cms-item]');
  if (!firstItem) return null;

  const collection = firstItem.dataset.cmsCollection;
  if (!collection) return null;

  // Auto-generate label from section ID (convert kebab-case to Title Case)
  const label = element.dataset.cmsLabel ||
    sectionId.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

  // Item selector is always [data-cms-item] within this section
  const itemSelector = '[data-cms-item]';

  return {
    id: sectionId,
    label,
    collection,
    itemSelector,
    filters: getFiltersForCollection(collection),
    sorts: getSortsForCollection(collection),
  };
}

/**
 * Legacy: Static section definitions for backwards compatibility.
 * New sections should just use data-cms-section + data-cms-collection attributes.
 */
export const CMS_SECTIONS: CMSSection[] = [];

// ============================================
// URL PARAMETER HELPERS
// ============================================

/**
 * Parse URL parameters into section state
 * Format: cms.section.filter.0.field=value&cms.section.filter.0.op=equals&cms.section.filter.0.val=xxx
 */
export function parseUrlParams(): Map<string, { filters: FilterCondition[]; sort?: { field: string; dir: 'asc' | 'desc' } }> {
  const params = new URLSearchParams(window.location.search);
  const result = new Map<string, { filters: FilterCondition[]; sort?: { field: string; dir: 'asc' | 'desc' } }>();

  // Collect filter conditions by section and index
  const filtersBySection = new Map<string, Map<number, Partial<FilterCondition>>>();

  params.forEach((value, key) => {
    if (!key.startsWith('cms.')) return;

    const parts = key.split('.');
    if (parts.length < 3) return;

    const sectionId = parts[1];
    const type = parts[2];

    if (!result.has(sectionId)) {
      result.set(sectionId, { filters: [] });
    }

    const section = result.get(sectionId)!;

    if (type === 'filter' && parts.length >= 5) {
      // New format: cms.section.filter.0.field, cms.section.filter.0.op, cms.section.filter.0.val
      const index = parseInt(parts[3], 10);
      const prop = parts[4]; // field, op, val

      if (!filtersBySection.has(sectionId)) {
        filtersBySection.set(sectionId, new Map());
      }
      const filters = filtersBySection.get(sectionId)!;

      if (!filters.has(index)) {
        filters.set(index, {});
      }
      const condition = filters.get(index)!;

      if (prop === 'field') condition.field = value;
      if (prop === 'op') condition.operator = value as FilterOperator;
      if (prop === 'val') condition.value = value;

    } else if (type === 'sort') {
      const [field, dir] = value.split(':');
      section.sort = { field, dir: (dir as 'asc' | 'desc') || 'asc' };
    }
  });

  // Convert collected filters to arrays
  filtersBySection.forEach((filters, sectionId) => {
    const section = result.get(sectionId);
    if (section) {
      section.filters = Array.from(filters.entries())
        .sort(([a], [b]) => a - b)
        .map(([_, cond]) => ({
          field: cond.field || '',
          operator: cond.operator || 'equals',
          value: cond.value || '',
        }))
        .filter(c => c.field); // Remove empty conditions
    }
  });

  return result;
}

/**
 * Update URL parameters with current filter/sort state
 */
export function updateUrlParams(
  sectionId: string,
  filters: FilterCondition[],
  sort?: { field: string; dir: 'asc' | 'desc' }
) {
  const url = new URL(window.location.href);

  // Remove existing params for this section
  Array.from(url.searchParams.keys())
    .filter(k => k.startsWith(`cms.${sectionId}.`))
    .forEach(k => url.searchParams.delete(k));

  // Add filter params
  filters.forEach((condition, index) => {
    if (condition.field) {
      url.searchParams.set(`cms.${sectionId}.filter.${index}.field`, condition.field);
      url.searchParams.set(`cms.${sectionId}.filter.${index}.op`, condition.operator);
      if (condition.value) {
        url.searchParams.set(`cms.${sectionId}.filter.${index}.val`, condition.value);
      }
    }
  });

  // Add sort param
  if (sort) {
    url.searchParams.set(`cms.${sectionId}.sort`, `${sort.field}:${sort.dir}`);
  }

  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
}

// ============================================
// LOCALSTORAGE HELPERS
// ============================================

const STORAGE_KEY = 'cms-control-panel';

export interface StoredPreferences {
  defaults: Record<string, { filters?: FilterCondition[]; sort?: { field: string; dir: 'asc' | 'desc' } }>;
  panelPosition?: { x: number; y: number };
  panelVisible?: boolean;
}

export function loadPreferences(): StoredPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { defaults: {} };
  } catch {
    return { defaults: {} };
  }
}

export function savePreferences(prefs: StoredPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage might be full or disabled
  }
}
