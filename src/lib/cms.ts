/**
 * CMS Helper - Automatic section management for CMS-powered components
 *
 * Automatically generates stable section IDs and provides a clean API
 * for rendering CMS items with control panel support.
 *
 * @example
 * ```astro
 * ---
 * import { createCMS } from '../../lib/cms';
 * const cms = createCMS('Results');
 *
 * // For multiple items (sliders, grids)
 * const slider = cms.section(caseStudies, 'case-studies', 'Featured Work');
 *
 * // For single items (slots)
 * const hero = cms.slot(caseStudies, 'case-studies', 'Hero Case Study');
 * ---
 *
 * <div {...slider.attrs}>
 *   {slider.items.map(item => (
 *     <div {...cms.item(item, 'case-studies', lookups)}>
 *       ...
 *     </div>
 *   ))}
 * </div>
 * ```
 */

import { applyCMSConfig } from './cms-utils';
import { generateCMSAttributes } from './cms-attributes';

type CMSItem = Record<string, unknown> & { id: string };
type ReferenceLookup = Map<string, { id: string; name: string; [key: string]: unknown }>;
type ReferenceLookups = Record<string, ReferenceLookup>;

interface SectionResult<T> {
  /** Filtered/sorted items */
  items: T[];
  /** Auto-generated section ID */
  sectionId: string;
  /** Attributes to spread on section container */
  attrs: Record<string, string>;
}

interface SlotResult<T> {
  /** Single item (first after filtering) */
  item: T | undefined;
  /** Auto-generated section ID */
  sectionId: string;
  /** Attributes to spread on section container */
  attrs: Record<string, string>;
}

/**
 * Create a CMS helper for a component
 *
 * @param componentName - Unique name for this component (used in section ID generation)
 * @returns CMS helper with section/slot/item methods
 */
export function createCMS(componentName: string) {
  // Track section indices per collection for unique IDs
  const collectionIndices: Record<string, number> = {};

  /**
   * Generate a stable, unique section ID
   * Format: component-collection-index (e.g., "results-case-studies-0")
   */
  function generateSectionId(collection: string): string {
    const index = collectionIndices[collection] ?? 0;
    collectionIndices[collection] = index + 1;

    // Normalize component name to kebab-case
    const normalizedComponent = componentName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

    return `${normalizedComponent}-${collection}-${index}`;
  }

  return {
    /**
     * Create a multi-item section (for sliders, grids, lists)
     *
     * @param items - Array of CMS items
     * @param collection - Collection name (e.g., 'case-studies', 'blog')
     * @param label - Human-readable label for the control panel
     * @returns Object with filtered items and section attributes
     */
    section<T extends CMSItem>(
      items: T[],
      collection: string,
      label?: string
    ): SectionResult<T> {
      const sectionId = generateSectionId(collection);
      const filtered = applyCMSConfig(items, sectionId, collection);

      return {
        items: filtered,
        sectionId,
        attrs: {
          'data-cms-section': sectionId,
          ...(label ? { 'data-cms-label': label } : {}),
        },
      };
    },

    /**
     * Create a single-item slot (for featured items, hero sections)
     *
     * @param items - Array of CMS items to select from
     * @param collection - Collection name
     * @param label - Human-readable label for the control panel
     * @returns Object with single item and section attributes
     */
    slot<T extends CMSItem>(
      items: T[],
      collection: string,
      label?: string
    ): SlotResult<T> {
      const sectionId = generateSectionId(collection);
      const filtered = applyCMSConfig(items, sectionId, collection);

      return {
        item: filtered[0],
        sectionId,
        attrs: {
          'data-cms-section': sectionId,
          ...(label ? { 'data-cms-label': label } : {}),
        },
      };
    },

    /**
     * Generate CMS attributes for an individual item
     * Spread these on the item element for control panel support
     *
     * @param item - The CMS item
     * @param collection - Collection name
     * @param lookups - Optional reference lookups for displaying names
     * @returns Data attributes to spread on the element
     */
    item(
      item: CMSItem,
      collection: string,
      lookups: ReferenceLookups = {}
    ): Record<string, string> {
      return generateCMSAttributes(item, collection, lookups);
    },
  };
}

/**
 * Re-export for convenience - direct access when not using createCMS
 */
export { generateCMSAttributes, applyCMSConfig };
