/**
 * CMS Data Attributes Generator
 *
 * Automatically generates data attributes for CMS items based on the schema.
 * This enables the CMS Control Panel to filter and sort any CMS item without
 * manual attribute configuration in each component.
 *
 * Usage:
 * ```astro
 * <a {...generateCMSAttributes(item, 'case-studies', { clients, industries })}>
 * ```
 */

import cmsSchemas from '../data/cms-schemas.json';

// Type definitions
interface SchemaField {
  slug: string;
  label: string;
  type: 'text' | 'reference' | 'image' | 'boolean' | 'date' | 'number' | 'color';
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

type CMSItem = Record<string, unknown> & { id: string };
type ReferenceLookup = Map<string, { id: string; name: string; [key: string]: unknown }>;
type ReferenceLookups = Record<string, ReferenceLookup>;

/**
 * Get a field value from an item, handling nested paths
 */
function getFieldValue(item: CMSItem, fieldSlug: string): unknown {
  // Try direct access first
  if (fieldSlug in item) {
    return item[fieldSlug];
  }

  // Try with hyphens converted to camelCase
  const camelCase = fieldSlug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  if (camelCase in item) {
    return item[camelCase];
  }

  return undefined;
}

/**
 * Convert a value to a string suitable for a data attribute
 */
function valueToAttribute(value: unknown, fieldType: SchemaField['type']): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (fieldType) {
    case 'boolean':
      return value ? 'true' : 'false';

    case 'image':
      // For images, check if URL exists to indicate "is set"
      if (typeof value === 'object' && value !== null && 'url' in value) {
        return (value as { url: string }).url ? 'set' : '';
      }
      return value ? 'set' : '';

    case 'reference':
      // Return the reference ID
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value)) {
        // Multi-reference: return first ID or comma-separated
        return value.join(',');
      }
      return '';

    case 'date':
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);

    case 'color':
      return String(value);

    case 'number':
      return String(value);

    case 'text':
    default:
      return String(value);
  }
}

/**
 * Get a human-readable label for a reference value
 */
function getReferencelabel(
  value: unknown,
  referenceCollection: string | undefined,
  lookups: ReferenceLookups
): string {
  if (!referenceCollection || !value) {
    return '';
  }

  const lookup = lookups[referenceCollection];
  if (!lookup) {
    return '';
  }

  if (typeof value === 'string') {
    const ref = lookup.get(value);
    return ref?.name || '';
  }

  if (Array.isArray(value)) {
    return value
      .map(id => lookup.get(id)?.name || '')
      .filter(Boolean)
      .join(', ');
  }

  return '';
}

/**
 * Generate data attributes for a CMS item
 *
 * @param item - The CMS item to generate attributes for
 * @param collection - The collection name (e.g., 'case-studies', 'blog')
 * @param lookups - Optional map of reference lookups for resolving reference labels
 * @returns Object with data-* attributes to spread onto an element
 *
 * @example
 * ```astro
 * ---
 * import { generateCMSAttributes } from '../lib/cms-attributes';
 *
 * const caseStudies = [...]; // Fetched from Webflow
 * const clients = new Map([...]); // Client lookup map
 * const industries = new Map([...]); // Industry lookup map
 * ---
 *
 * {caseStudies.map(study => (
 *   <a
 *     href={`/work/${study.slug}`}
 *     class="case-study-card"
 *     {...generateCMSAttributes(study, 'case-studies', { clients, industries })}
 *   >
 *     ...
 *   </a>
 * ))}
 * ```
 */
export function generateCMSAttributes(
  item: CMSItem,
  collection: string,
  lookups: ReferenceLookups = {}
): Record<string, string> {
  const schemas = cmsSchemas as CMSSchemas;
  const schema = schemas.collections[collection];

  if (!schema) {
    console.warn(`[CMS Attributes] No schema found for collection: ${collection}`);
    return { 'data-cms-item': item.id };
  }

  const attributes: Record<string, string> = {
    'data-cms-item': item.id,
    'data-cms-collection': collection,
  };

  for (const field of schema.fields) {
    const value = getFieldValue(item, field.slug);
    const attrName = `data-cms-${field.slug}`;

    // Set the raw value
    attributes[attrName] = valueToAttribute(value, field.type);

    // For reference fields, also set a label attribute
    if (field.type === 'reference' && field.referenceCollection) {
      const label = getReferencelabel(value, field.referenceCollection, lookups);
      if (label) {
        attributes[`${attrName}-label`] = label;
      }
    }
  }

  return attributes;
}

/**
 * Get the schema for a collection
 * Useful for components that need to know available fields
 */
export function getCollectionSchema(collection: string): CollectionSchema | undefined {
  const schemas = cmsSchemas as CMSSchemas;
  return schemas.collections[collection];
}

/**
 * Get all filterable fields for a collection
 */
export function getFilterableFields(collection: string): SchemaField[] {
  const schema = getCollectionSchema(collection);
  if (!schema) return [];
  return schema.fields.filter(f => f.filterable);
}

/**
 * Get all sortable fields for a collection
 */
export function getSortableFields(collection: string): SchemaField[] {
  const schema = getCollectionSchema(collection);
  if (!schema) return [];
  return schema.fields.filter(f => f.sortable);
}

/**
 * Check if schemas have been generated
 */
export function schemasExist(): boolean {
  const schemas = cmsSchemas as CMSSchemas;
  return Object.keys(schemas.collections).length > 0;
}

/**
 * Get all collection names in the schema
 */
export function getCollectionNames(): string[] {
  const schemas = cmsSchemas as CMSSchemas;
  return Object.keys(schemas.collections);
}
