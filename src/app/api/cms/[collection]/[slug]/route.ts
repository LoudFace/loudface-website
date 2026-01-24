import { NextRequest, NextResponse } from 'next/server';
import { COLLECTION_IDS, isValidCollection } from '@/lib/constants';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; slug: string }> }
) {
  const { collection, slug } = await params;

  // Validate collection and get ID from shared constants
  if (!collection || !isValidCollection(collection)) {
    return NextResponse.json(
      { error: 'Collection not found' },
      { status: 404 }
    );
  }

  const collectionId = COLLECTION_IDS[collection];
  const accessToken = process.env.WEBFLOW_SITE_API_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'CMS not configured' },
      { status: 500 }
    );
  }

  try {
    // Use Webflow API v2 - fetch all items and filter by slug
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${collectionId}/items`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from CMS' },
        { status: response.status }
      );
    }

    const data = await response.json();
    // v2 API: slug is in fieldData
    interface WebflowItem {
      id: string;
      fieldData?: { slug?: string; [key: string]: unknown };
      [key: string]: unknown;
    }
    const rawItem = data.items?.find((i: WebflowItem) => i.fieldData?.slug === slug);

    if (!rawItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Normalize: merge item metadata with fieldData
    const item = { ...rawItem, ...rawItem.fieldData };

    return NextResponse.json(item);
  } catch (error) {
    console.error('CMS fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from CMS' },
      { status: 500 }
    );
  }
}
