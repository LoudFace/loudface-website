import { NextResponse } from 'next/server';
import { FEEDBACK_COOKIE, FEEDBACK_FLAG_COOKIE } from '@/lib/feedback/access';

export const dynamic = 'force-dynamic';

/** "Leave feedback mode": forget this browser. The private link signs it in again. */
export async function POST() {
  const response = NextResponse.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
  response.cookies.delete(FEEDBACK_COOKIE);
  response.cookies.delete(FEEDBACK_FLAG_COOKIE);
  return response;
}
