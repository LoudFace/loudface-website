import { NextRequest, NextResponse } from 'next/server';
import { COLLECTION_IDS, isValidCollection } from '@/lib/constants';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;

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
    // Use Webflow API v2
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('CMS fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from CMS' },
      { status: 500 }
    );
  }
}
