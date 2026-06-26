import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webinar-register
 *
 * Writes registrations to the Notion DB "Webinar Registrations"
 * (database_id hardcoded below — a stable identifier, not a secret).
 *
 * Env: NOTION_API_KEY — the same Notion integration used by /api/partner-apply.
 * That integration must be shared with the Webinar Registrations DB in Notion.
 *
 * Failure philosophy (matches /api/partner-apply): a Notion outage or misconfig
 * is logged but never surfaced to the registrant — the seat still feels saved.
 * Only genuine input errors (missing fields, bad email) return 4xx so the form
 * can show inline validation.
 *
 * If you add a property to the Notion DB, add it here AND in
 * WebinarRegistrationForm.tsx — otherwise it stays blank on every row.
 */

const NOTION_DB_ID = '65e632aafc4f4907814037903beba8a7';
const NOTION_VERSION = '2022-06-28';
const NOTION_API_KEY = process.env.NOTION_API_KEY ?? process.env.NOTION_TOKEN ?? '';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegistrationPayload {
  name?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  linkedin?: string;
  consent?: boolean;
}

export async function POST(request: NextRequest) {
  let body: RegistrationPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const { name, email, company, jobTitle } = body;

  // ─── Validation (real user errors → 4xx so the form shows them) ─────
  if (!name?.trim() || !email?.trim() || !company?.trim() || !jobTitle?.trim()) {
    return NextResponse.json({ success: false, message: 'Required fields missing.' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  // ─── Write to Notion (best-effort; never blocks the registrant) ─────
  if (NOTION_API_KEY) {
    try {
      await writeToNotion(body);
    } catch (err) {
      console.error('[webinar-register] Notion write failed:', err);
    }
  } else {
    console.warn('[webinar-register] NOTION_API_KEY not set — skipping Notion write.');
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

async function writeToNotion(d: RegistrationPayload): Promise<void> {
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: d.name!.trim() } }] },
    Email: { email: d.email!.trim().toLowerCase() },
    Company: { rich_text: [{ text: { content: d.company!.trim() } }] },
    'Job Title': { rich_text: [{ text: { content: d.jobTitle!.trim() } }] },
    Consent: { checkbox: Boolean(d.consent) },
    Webinar: { select: { name: 'AI Search Visibility — July 9 2026' } },
  };

  if (d.linkedin?.trim()) {
    properties.LinkedIn = { url: d.linkedin.trim() };
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body: JSON.stringify({ parent: { database_id: NOTION_DB_ID }, properties }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Notion API ${res.status}: ${errBody.slice(0, 500)}`);
  }
}
