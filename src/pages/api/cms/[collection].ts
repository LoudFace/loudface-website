import type { APIRoute } from 'astro';
import { COLLECTION_IDS, isValidCollection } from '../../../lib/constants';

export const config = {
  runtime: 'edge',
};

export const GET: APIRoute = async ({ params, locals }) => {
  const { collection } = params;
  // Support both Webflow Cloud runtime and local .env
  const accessToken = (locals as any).runtime?.env?.WEBFLOW_SITE_API_TOKEN
    || import.meta.env.WEBFLOW_SITE_API_TOKEN;

  // Validate collection and get ID from shared constants
  if (!collection || !isValidCollection(collection)) {
    return new Response(JSON.stringify({ error: 'Collection not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const collectionId = COLLECTION_IDS[collection];

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'API token not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Use Webflow API v2
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${collectionId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Webflow API error', status: response.status }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from Webflow' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
