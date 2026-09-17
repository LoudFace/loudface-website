/**
 * "Is it live yet?" — the check behind the editor's status light.
 *
 * After a publish the editor asks this route whether the words it saved are
 * now on the public page. The route fetches the page the way a visitor does
 * (no cookies, no Draft Mode, through the CDN) and looks for each sentence in
 * the visible text. A CMS edit shows up once the page has revalidated; a
 * content-file edit shows up once the build has finished and deployed.
 *
 * The editor polls this every few seconds and stops at the first all-clear.
 */
import { currentEditor } from '@/lib/inline-edit/session';

const MARKS = /[\u{E0000}-\u{E007F}​‌‍﻿]/gu;

function visibleText(html: string): string {
  return html
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCodePoint(Number(code)))
    .replace(MARKS, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ');
}

const normalize = (text: string) =>
  text
    .replace(/<[^>]+>/g, ' ')
    .replace(MARKS, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

export async function POST(request: Request) {
  if (!(await currentEditor())) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { path?: unknown; needles?: unknown } | null;
  const path = typeof body?.path === 'string' ? body.path : '';
  const needles = Array.isArray(body?.needles) ? (body!.needles as unknown[]).filter((n): n is string => typeof n === 'string') : [];
  if (!path.startsWith('/') || path.startsWith('//') || !needles.length || needles.length > 50) {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }

  // Production names its public address; development talks to itself over
  // plain http, because the forwarded https origin points at a plain port.
  const origin =
    process.env.LF_SITE_URL?.replace(/\/$/, '') ??
    (process.env.NODE_ENV !== 'production' ? `http://127.0.0.1:${process.env.PORT ?? 3000}` : new URL(request.url).origin);
  let html: string;
  try {
    // A visitor's request: no cookies, so no Draft Mode, and whatever the CDN
    // is serving right now — which is exactly the question being asked.
    const response = await fetch(`${origin}${path}`, { cache: 'no-store', headers: { accept: 'text/html' } });
    if (!response.ok) return Response.json({ ok: false, status: response.status, found: needles.map(() => false) });
    html = await response.text();
  } catch (error) {
    const detail = process.env.NODE_ENV === 'production' ? undefined : String(error);
    return Response.json({ ok: false, status: 0, found: needles.map(() => false), origin, detail });
  }

  const page = visibleText(html);
  const found = needles.map((needle) => {
    const wanted = normalize(needle);
    return wanted.length === 0 || page.includes(wanted);
  });
  return Response.json({ ok: true, status: 200, found, live: found.every(Boolean) });
}
