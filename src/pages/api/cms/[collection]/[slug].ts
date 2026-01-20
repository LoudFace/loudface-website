import type { APIRoute } from 'astro';
import { COLLECTION_IDS, isValidCollection } from '../../../../lib/constants';
import { apiSuccess, ApiErrors } from '../../../../lib/api-utils';

export const config = {
  runtime: 'edge',
};

export const GET: APIRoute = async ({ params, locals }) => {
  const { collection, slug } = params;
  // Support both Webflow Cloud runtime and local .env
  const accessToken = (locals as any).runtime?.env?.WEBFLOW_SITE_API_TOKEN
    || import.meta.env.WEBFLOW_SITE_API_TOKEN;

  // Validate collection and get ID from shared constants
  if (!collection || !isValidCollection(collection)) {
    return ApiErrors.notFound('Collection');
  }

  const collectionId = COLLECTION_IDS[collection];

  if (!accessToken) {
    return ApiErrors.configError();
  }

  try {
    // Use Webflow API v2 - fetch all items and filter by slug
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${collectionId}/items`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return ApiErrors.externalError();
    }

    const data = await response.json();
    // v2 API: slug is in fieldData
    const rawItem = data.items?.find((i: any) => i.fieldData?.slug === slug);

    if (!rawItem) {
      return ApiErrors.notFound('Item');
    }

    // Normalize: merge item metadata with fieldData
    const item = { ...rawItem, ...rawItem.fieldData };

    return apiSuccess(item);
  } catch {
    return ApiErrors.externalError();
  }
};
