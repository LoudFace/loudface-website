import { NextRequest, NextResponse } from 'next/server';
import { fetchCollection, isValidCollection } from '@/lib/cms-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;

  if (!collection || !isValidCollection(collection)) {
    return NextResponse.json(
      { error: 'Collection not found' },
      { status: 404 }
    );
  }

  try {
    const items = await fetchCollection(collection);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('CMS fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from CMS' },
      { status: 500 }
    );
  }
}
