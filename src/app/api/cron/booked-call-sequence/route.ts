import { NextResponse } from 'next/server';
import { runSequence } from '@/lib/booked-call-sequence';

/**
 * Sends the pre-call emails (2 to 6) that are due. Every 15 minutes (vercel.json).
 * What goes out when, and the BOOKED_CALL_SEQUENCE switch: lib/booked-call-sequence.ts.
 * Authentication: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json(await runSequence());
  } catch (error) {
    console.error('[booked-call-sequence] run failed', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
