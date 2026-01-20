/**
 * CMS Config API - Development Only
 *
 * Saves CMS section configurations to src/data/cms-config.json
 * This endpoint is only functional during development.
 */

import type { APIRoute } from 'astro';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONFIG_PATH = join(process.cwd(), 'src/data/cms-config.json');

// Valid filter operators
const VALID_OPERATORS = ['equals', 'not_equals', 'is_set', 'is_not_set'];

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

/**
 * Validate and sanitize filter conditions
 */
function validateFilters(filters: unknown): FilterCondition[] {
  if (!Array.isArray(filters)) {
    return [];
  }

  return filters
    .filter((f): f is FilterCondition =>
      f &&
      typeof f === 'object' &&
      typeof f.field === 'string' &&
      typeof f.operator === 'string' &&
      VALID_OPERATORS.includes(f.operator)
    )
    .map(f => ({
      field: f.field,
      operator: f.operator,
      value: typeof f.value === 'string' ? f.value : '',
    }));
}

export const GET: APIRoute = async () => {
  // Only allow in development
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const content = await readFile(CONFIG_PATH, 'utf-8');
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read config' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  // Only allow in development
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { sectionId, filters, sort, limit } = body;

    if (!sectionId) {
      return new Response(JSON.stringify({ error: 'sectionId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate filters array
    const validatedFilters = validateFilters(filters);

    // Read current config
    const content = await readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(content);

    // Update section config
    if (!config.sections[sectionId]) {
      config.sections[sectionId] = { filters: [], sort: null, limit: null };
    }

    config.sections[sectionId] = {
      filters: validatedFilters,
      sort: sort || null,
      limit: limit || null,
    };

    // Write back to file
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    return new Response(JSON.stringify({ success: true, config: config.sections[sectionId] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to save CMS config:', error);
    return new Response(JSON.stringify({ error: 'Failed to save config' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  // Only allow in development
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { sectionId } = body;

    if (!sectionId) {
      return new Response(JSON.stringify({ error: 'sectionId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read current config
    const content = await readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(content);

    // Reset section config with new format
    config.sections[sectionId] = { filters: [], sort: null, limit: null };

    // Write back to file
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to reset config' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
