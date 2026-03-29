import { NextRequest, NextResponse } from 'next/server';
import { fetchItemBySlug, isValidCollection } from '@/lib/cms-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; slug: string }> }
) {
  const { collection, slug } = await params;

  if (!collection || !isValidCollection(collection)) {
    return NextResponse.json(
      { error: 'Collection not found' },
      { status: 404 }
    );
  }

  try {
    const item = await fetchItemBySlug(collection, slug);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('CMS fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from CMS' },
      { status: 500 }
    );
  }
}
