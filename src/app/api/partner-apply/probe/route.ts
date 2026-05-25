import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/partner-apply/probe?token=loudface-probe-2026-05-25
 *
 * One-shot diagnostic for the partner-apply Notion integration.
 * Reports whether NOTION_API_KEY is set, then attempts databases.retrieve
 * against the hardcoded Partner Applications DB. Distinguishes between:
 *
 *   - missing key (env not configured in Vercel)
 *   - 401 (key invalid / wrong workspace)
 *   - 404 (integration not added as a Connection on the DB)
 *   - other (anything else)
 *
 * Delete this file once partner-apply is confirmed working in production.
 */

const NOTION_DB_ID = 'c597d4c9-817a-458a-b5b0-92dc4c9db147';
const NOTION_API_VERSION = '2022-06-28';
const PROBE_TOKEN = 'loudface-probe-2026-05-25';

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('token') !== PROBE_TOKEN) {
    return new NextResponse(null, { status: 404 });
  }

  const key = process.env.NOTION_API_KEY ?? '';

  if (!key) {
    return NextResponse.json({
      ok: false,
      stage: 'env',
      message: 'NOTION_API_KEY is not set in this environment.',
    });
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Notion-Version': NOTION_API_VERSION,
    },
  });

  const body = await res.text();

  let diagnosis = 'unknown';
  if (res.ok) diagnosis = 'success — integration has access to the DB';
  else if (res.status === 401) diagnosis = 'NOTION_API_KEY is invalid or from a different workspace';
  else if (res.status === 404)
    diagnosis = 'integration is not added as a Connection on the Partner Applications DB (Notion → DB → ••• → Connections → Add LoudFace integration)';

  return NextResponse.json({
    ok: res.ok,
    stage: res.ok ? 'success' : 'notion',
    status: res.status,
    keyLength: key.length,
    diagnosis,
    notionResponseSnippet: body.slice(0, 500),
  });
}
