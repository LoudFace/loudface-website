/**
 * Content Editor API - Development Only
 *
 * Manages local JSON content files for static component text.
 * This is separate from the CMS Control Panel which handles Webflow CMS data.
 *
 * Endpoints:
 * - GET /api/dev/content - List all content files
 * - GET /api/dev/content?file=cta - Get specific content file
 * - POST /api/dev/content - Save content to a file
 */

import type { APIRoute } from 'astro';
import { writeFile, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src/data/content');

// Content file metadata for the editor UI
const CONTENT_FILES_META: Record<string, { label: string; description: string }> = {
  'cta': {
    label: 'CTA Section',
    description: 'Call-to-action section content (title, subtitle, button text)',
  },
  'hero': {
    label: 'Hero Section',
    description: 'Hero section content (headline, description, button text, AI links)',
  },
  'faq': {
    label: 'FAQ Section',
    description: 'FAQ section labels and footer content (not the actual Q&A items)',
  },
  'approach': {
    label: 'Approach Section',
    description: 'Process steps, stats heading, and statistics cards',
  },
  'marketing': {
    label: 'Marketing Section',
    description: 'Service cards with images, titles, and descriptions',
  },
  'partners': {
    label: 'Partners Section',
    description: 'Star rating text and tagline for the partners section',
  },
  'knowledge': {
    label: 'Knowledge Section',
    description: 'Blog slider section title, description, and read time label',
  },
  'results': {
    label: 'Results Section',
    description: 'Video testimonials, section title, and CTA button',
  },
  'audit': {
    label: 'Audit Section',
    description: 'Website audit challenges section with icons and descriptions',
  },
  'case-study-slider': {
    label: 'Case Study Slider',
    description: 'Section title and CTA button text',
  },
  'newsletter': {
    label: 'Newsletter Form',
    description: 'Form placeholder, button text, and status messages',
  },
};

/**
 * GET - List all content files or get a specific file
 */
export const GET: APIRoute = async ({ url }) => {
  // Only allow in development
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fileName = url.searchParams.get('file');

  try {
    if (fileName) {
      // Get specific content file
      const filePath = join(CONTENT_DIR, `${fileName}.json`);
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      return new Response(JSON.stringify({
        file: fileName,
        meta: CONTENT_FILES_META[fileName] || { label: fileName, description: '' },
        content: data,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // List all content files
      const files = await readdir(CONTENT_DIR);
      const contentFiles = files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));

      const fileList = await Promise.all(
        contentFiles.map(async (name) => {
          const filePath = join(CONTENT_DIR, `${name}.json`);
          const content = await readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          const meta = CONTENT_FILES_META[name] || { label: name, description: '' };

          return {
            name,
            label: meta.label,
            description: meta.description,
            fields: Object.keys(data),
          };
        })
      );

      return new Response(JSON.stringify({ files: fileList }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    const message = fileName
      ? `Failed to read content file: ${fileName}`
      : 'Failed to list content files';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * POST - Save content to a file
 */
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
    const { file, content } = body;

    if (!file || typeof file !== 'string') {
      return new Response(JSON.stringify({ error: 'file name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!content || typeof content !== 'object') {
      return new Response(JSON.stringify({ error: 'content object is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize file name to prevent directory traversal
    const sanitizedFile = file.replace(/[^a-zA-Z0-9-_]/g, '');
    if (sanitizedFile !== file) {
      return new Response(JSON.stringify({ error: 'Invalid file name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filePath = join(CONTENT_DIR, `${sanitizedFile}.json`);

    // Write content to file
    await writeFile(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8');

    return new Response(JSON.stringify({ success: true, file: sanitizedFile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to save content:', error);
    return new Response(JSON.stringify({ error: 'Failed to save content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
