import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/partner-apply
 *
 * Writes applications to the Notion DB "LoudFace Partner Applications"
 * (database_id hardcoded below — it's a stable identifier, not a secret).
 *
 * Env vars required:
 *   - NOTION_API_KEY (Bearer auth for the Notion integration)
 *
 * Defensive: if NOTION_API_KEY is missing we log a warning and still return
 * success to the applicant. A Notion outage will not surface as a form error.
 *
 * If you add a property to the Notion DB, add it here AND in
 * PartnerApplicationForm.tsx — otherwise that property stays blank on every row.
 */

const NOTION_API_VERSION = '2022-06-28';
// Notion DB "LoudFace Partner Applications" — not a secret, fine to hardcode.
const NOTION_DB_ID = 'c597d4c9-817a-458a-b5b0-92dc4c9db147';
const NOTION_API_KEY = process.env.NOTION_API_KEY ?? '';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDUSTRY_VALUES = new Set(['B2B SaaS', 'B2B Product', 'D2C']);
const ACV_VALUES = new Set([
  '$100 - $1K',
  '$1K - $5K',
  '$5K - $10K',
  '$10K - $50K',
  '$50K+',
]);
const YES_NO_MAYBE = new Set(['Yes', 'No', 'Maybe']);

interface PartnerApplicationPayload {
  fullName: string;
  email: string;
  linkedin: string;
  website: string;
  industry: string[];
  acv: string;
  socialPromo: string | null;
  webinar: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      linkedin,
      website,
      industry,
      acv,
      socialPromo,
      webinar,
    } = body ?? {};

    // ─── Validation ───────────────────────────────────────────────
    if (
      typeof fullName !== 'string' ||
      typeof email !== 'string' ||
      typeof linkedin !== 'string' ||
      typeof acv !== 'string' ||
      !Array.isArray(industry)
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 },
      );
    }

    if (!fullName.trim() || !linkedin.trim()) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    if (industry.length === 0 || !industry.every((i) => INDUSTRY_VALUES.has(i))) {
      return NextResponse.json(
        { success: false, message: 'Invalid industry selection.' },
        { status: 400 },
      );
    }

    if (!ACV_VALUES.has(acv)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ACV selection.' },
        { status: 400 },
      );
    }

    if (socialPromo && !YES_NO_MAYBE.has(socialPromo)) {
      return NextResponse.json(
        { success: false, message: 'Invalid social promo selection.' },
        { status: 400 },
      );
    }
    if (webinar && !YES_NO_MAYBE.has(webinar)) {
      return NextResponse.json(
        { success: false, message: 'Invalid webinar selection.' },
        { status: 400 },
      );
    }

    const submission: PartnerApplicationPayload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      linkedin: linkedin.trim(),
      website: typeof website === 'string' ? website.trim() : '',
      industry,
      acv,
      socialPromo: socialPromo ?? null,
      webinar: webinar ?? null,
    };

    // ─── Write to Notion ─────────────────────────────────────────
    // Errors are logged but never surfaced to the applicant — a Notion outage
    // should not look like a form failure. Submissions feel instant.
    if (NOTION_API_KEY) {
      try {
        await sendToNotion(submission);
      } catch (err) {
        console.error('[partner-apply] Notion error:', err);
      }
    } else {
      console.warn('[partner-apply] NOTION_API_KEY not set — skipping Notion write.');
    }

    return NextResponse.json(
      { success: true, message: 'Application received.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[partner-apply] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 },
    );
  }
}

/* ─── Notion ────────────────────────────────────────────────────── */

async function sendToNotion(s: PartnerApplicationPayload): Promise<void> {
  const properties: Record<string, unknown> = {
    'Full Name': {
      title: [{ type: 'text', text: { content: s.fullName } }],
    },
    Email: { email: s.email },
    'LinkedIn Profile': { url: s.linkedin },
    Industry: {
      multi_select: s.industry.map((name) => ({ name })),
    },
    'Avg ACV of Clients': { select: { name: s.acv } },
    'Application Status': { select: { name: 'Pending Review' } },
  };

  if (s.website) {
    properties['Website / Portfolio'] = { url: s.website };
  }
  if (s.socialPromo) {
    properties['Open to Social Media Promotion?'] = {
      select: { name: s.socialPromo },
    };
  }
  if (s.webinar) {
    properties['Open to Speaking at Webinars?'] = {
      select: { name: s.webinar },
    };
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Notion API ${res.status}: ${errBody.slice(0, 500)}`);
  }
}
