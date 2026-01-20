/**
 * Generate CMS Schemas from Webflow API
 *
 * This script fetches collection schemas from the Webflow API and generates
 * a cms-schemas.json file that enables automatic filter/sort discovery in
 * the CMS Control Panel.
 *
 * Usage: npx tsx scripts/generate-cms-schemas.ts
 *
 * Requires: WEBFLOW_SITE_API_TOKEN environment variable
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
function loadEnv(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env');
  const env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  }

  return env;
}

const localEnv = loadEnv();
const WEBFLOW_API_TOKEN = process.env.WEBFLOW_SITE_API_TOKEN || localEnv.WEBFLOW_SITE_API_TOKEN;

if (!WEBFLOW_API_TOKEN) {
  console.error('Error: WEBFLOW_SITE_API_TOKEN environment variable is required');
  process.exit(1);
}

// Collection IDs from constants.ts
const COLLECTION_IDS: Record<string, string> = {
  'blog': '67b46d898180d5b8499f87e8',
  'case-studies': '67bcc512271a06e2e0acc70d',
  'testimonials': '67bd0c6f1a9fdd9770be5469',
  'clients': '67c6f017e3221db91323ff13',
  'blog-faq': '67bd3732a35ec40d3038b40a',
  'team-members': '68d819d1810ef43a5ef97da4',
  'technologies': '67be3e735523f789035b6c56',
  'categories': '67b46e2d70ec96bfb7787071',
  'industries': '67bd0a772117f7c7227e7b4d',
  'service-categories': '67bcfb9cdb20a1832e2799c3',
};

// Webflow field type to our FieldType mapping
type FieldType = 'text' | 'reference' | 'image' | 'boolean' | 'date' | 'number' | 'richtext' | 'color' | 'video' | 'link' | 'file' | 'option';

interface WebflowField {
  id: string;
  slug: string;
  displayName: string;
  type: string;
  isRequired: boolean;
  validations?: {
    collectionId?: string;
    options?: Array<{ id: string; name: string }>;
  };
}

interface WebflowCollectionResponse {
  id: string;
  displayName: string;
  singularName: string;
  slug: string;
  fields: WebflowField[];
}

interface SchemaField {
  slug: string;
  label: string;
  type: FieldType;
  referenceCollection?: string;
  options?: Array<{ id: string; name: string }>;
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

/**
 * Map Webflow field types to our internal FieldType
 * Note: Webflow API v2 may return different type names
 */
function mapFieldType(webflowType: string, hasValidationCollectionId: boolean): FieldType {
  // If there's a collection reference, it's a reference field
  if (hasValidationCollectionId) {
    return 'reference';
  }

  const typeMap: Record<string, FieldType> = {
    // Text types (v2 API uses these)
    'PlainText': 'text',
    'RichText': 'richtext',
    'Email': 'text',
    'Phone': 'text',
    'Link': 'link',

    // Reference types (v2 API names)
    'ItemRef': 'reference',
    'ItemRefSet': 'reference',
    'MultiReference': 'reference',
    'Reference': 'reference',
    'FileRef': 'file',

    // Media types (v2 API uses 'Image' not 'ImageRef')
    'ImageRef': 'image',
    'Image': 'image',
    'VideoLink': 'video',
    'Video': 'video',

    // Boolean
    'Bool': 'boolean',
    'Switch': 'boolean',

    // Date/Time
    'Date': 'date',
    'DateTime': 'date',

    // Numbers
    'Number': 'number',

    // Color
    'Color': 'color',

    // Options/Select
    'Option': 'option',
    'Set': 'option',
  };

  return typeMap[webflowType] || 'text';
}

/**
 * Determine if a field should be filterable
 */
function isFilterable(field: WebflowField, fieldType: FieldType): boolean {
  // Skip system fields
  const systemFields = ['_archived', '_draft', 'created-on', 'updated-on', 'published-on'];
  if (systemFields.includes(field.slug)) return false;

  // Skip rich text (too complex for filtering)
  if (fieldType === 'richtext') return false;

  // Skip video and file (not useful for filtering)
  if (fieldType === 'video' || fieldType === 'file') return false;

  // Skip link (not useful for filtering)
  if (fieldType === 'link') return false;

  return true;
}

/**
 * Determine if a field should be sortable
 */
function isSortable(fieldType: FieldType): boolean {
  // Only text, date, and number fields are sortable
  return ['text', 'date', 'number'].includes(fieldType);
}

/**
 * Get the reference collection name from collection ID
 */
function getCollectionNameById(collectionId: string): string | undefined {
  for (const [name, id] of Object.entries(COLLECTION_IDS)) {
    if (id === collectionId) return name;
  }
  return undefined;
}

/**
 * Fetch collection schema from Webflow API
 */
async function fetchCollectionSchema(collectionId: string): Promise<WebflowCollectionResponse | null> {
  try {
    const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}`, {
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'accept-version': '2.0.0',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch collection ${collectionId}: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching collection ${collectionId}:`, error);
    return null;
  }
}

/**
 * Process a collection schema into our format
 */
function processCollectionSchema(webflowCollection: WebflowCollectionResponse): CollectionSchema {
  const fields: SchemaField[] = [];

  for (const field of webflowCollection.fields) {
    const hasRefCollection = !!field.validations?.collectionId;
    const fieldType = mapFieldType(field.type, hasRefCollection);
    const filterable = isFilterable(field, fieldType);
    const sortable = isSortable(fieldType);

    // Skip non-filterable and non-sortable fields
    if (!filterable && !sortable) continue;

    const schemaField: SchemaField = {
      slug: field.slug,
      label: field.displayName,
      type: fieldType,
      filterable,
      sortable,
    };

    // Add reference collection for reference fields
    if (fieldType === 'reference' && field.validations?.collectionId) {
      const refCollectionName = getCollectionNameById(field.validations.collectionId);
      if (refCollectionName) {
        schemaField.referenceCollection = refCollectionName;
      }
    }

    // Add options for option fields
    if (fieldType === 'option' && field.validations?.options) {
      schemaField.options = field.validations.options;
    }

    fields.push(schemaField);
  }

  return {
    id: webflowCollection.id,
    name: webflowCollection.displayName,
    singularName: webflowCollection.singularName,
    slug: webflowCollection.slug,
    fields,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('Fetching CMS collection schemas from Webflow...\n');

  const schemas: CMSSchemas = {
    generatedAt: new Date().toISOString(),
    collections: {},
  };

  for (const [collectionName, collectionId] of Object.entries(COLLECTION_IDS)) {
    console.log(`Fetching ${collectionName} (${collectionId})...`);

    const webflowSchema = await fetchCollectionSchema(collectionId);
    if (!webflowSchema) {
      console.log(`  ⚠ Skipped (fetch failed)`);
      continue;
    }

    const processedSchema = processCollectionSchema(webflowSchema);
    schemas.collections[collectionName] = processedSchema;

    console.log(`  ✓ ${processedSchema.fields.length} fields`);
    console.log(`    Filterable: ${processedSchema.fields.filter(f => f.filterable).map(f => f.slug).join(', ') || 'none'}`);
    console.log(`    Sortable: ${processedSchema.fields.filter(f => f.sortable).map(f => f.slug).join(', ') || 'none'}`);
  }

  // Write to file
  const outputPath = path.join(process.cwd(), 'src', 'data', 'cms-schemas.json');
  fs.writeFileSync(outputPath, JSON.stringify(schemas, null, 2));

  console.log(`\n✓ Schema file generated: ${outputPath}`);
  console.log(`  ${Object.keys(schemas.collections).length} collections processed`);
}

main().catch(console.error);
