import 'server-only';
import { NextResponse } from 'next/server';

/**
 * Every feedback API answer is private and never cached. A caller without a
 * valid session gets the same 404 as a path that does not exist, so the API
 * does not confirm the tool is there.
 */
const PRIVATE = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE });
}

export const notFound = () => json({ error: 'Not found' }, 404);
export const badRequest = (message: string) => json({ error: message }, 400);
