import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/partner-apply
 *
 * Two destinations on success (both fire in parallel; failures are logged but
 * never block the user-facing response — submissions still feel instant):
 *
 *   1. Notion DB "LoudFace Partner Applications"
 *      database_id: NOTION_PARTNER_DB_ID (env)
 *      auth: NOTION_API_KEY (Bearer)
 *
 *   2. Slack incoming webhook
 *      url: SLACK_PARTNER_WEBHOOK_URL (env)
 *      Configure this in Slack to DM Chandana or post to a dedicated channel.
 *
 * Field mapping mirrors the Notion DB schema. If you add a property to the
 * Notion DB, add it here + in PartnerApplicationForm.tsx — otherwise that
 * property stays blank on every row.
 */

const NOTION_API_VERSION = '2022-06-28';
const NOTION_DB_ID = process.env.NOTION_PARTNER_DB_ID ?? '';
const NOTION_API_KEY = process.env.NOTION_API_KEY ?? '';
const SLACK_WEBHOOK_URL = process.env.SLACK_PARTNER_WEBHOOK_URL ?? '';

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

    // ─── Fire-and-log both destinations in parallel ───────────────
    // Errors are logged but never thrown — we don't want a Notion outage
    // to surface as a form error for the applicant.
    const tasks: Promise<unknown>[] = [];
    if (NOTION_API_KEY && NOTION_DB_ID) {
      tasks.push(
        sendToNotion(submission).catch((err) =>
          console.error('[partner-apply] Notion error:', err),
        ),
      );
    } else {
      console.warn('[partner-apply] Notion env not configured — skipping Notion write.');
    }

    if (SLACK_WEBHOOK_URL) {
      tasks.push(
        sendToSlack(submission).catch((err) =>
          console.error('[partner-apply] Slack error:', err),
        ),
      );
    } else {
      console.warn('[partner-apply] Slack env not configured — skipping Slack ping.');
    }

    // Don't block the user. Both calls are quick (<1s typical) so we await,
    // but errors are already swallowed above.
    await Promise.all(tasks);

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

/* ─── Slack ─────────────────────────────────────────────────────── */

async function sendToSlack(s: PartnerApplicationPayload): Promise<void> {
  const industries = s.industry.join(', ');
  const social = s.socialPromo ?? '—';
  const web = s.webinar ?? '—';
  const website = s.website || '—';

  const payload = {
    text: `🤝 New partner application: ${s.fullName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🤝 New partner application: ${s.fullName}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Email*\n${s.email}` },
          { type: 'mrkdwn', text: `*LinkedIn*\n<${s.linkedin}|View profile>` },
          { type: 'mrkdwn', text: `*Industry*\n${industries}` },
          { type: 'mrkdwn', text: `*Avg ACV*\n${s.acv}` },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Website*\n${website === '—' ? '—' : `<${website}|Link>`}`,
          },
          { type: 'mrkdwn', text: `*Social promo?*\n${social}` },
          { type: 'mrkdwn', text: `*Webinars?*\n${web}` },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_Logged to Notion → LoudFace Partner Applications._',
          },
        ],
      },
    ],
  };

  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Slack webhook ${res.status}: ${errBody.slice(0, 500)}`);
  }
}
