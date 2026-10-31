import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { checkApplication, isValidEventId } from '@/lib/apply-qualify';
import { sendMetaLeadEvent } from '@/lib/meta-capi';
import { getPostHogServer } from '@/lib/posthog-server';
import { CONSENT_COOKIE, isTrackingAllowedServer, POSTHOG_DISTINCT_ID_COOKIE } from '@/lib/consent';
import { cleanReferralTag, REFERRAL_TAG_COOKIE } from '@/lib/referral-tag';

/**
 * POST /api/apply: the /apply card's last step (2026-10-31). Checks the five answers again on the server (an
 * unqualified or malformed application gets no Lead), sends Meta the Lead through the Conversions API, and records
 * one PostHog event that carries the revenue band and attribution only, never a name, email, phone or website
 * (the same line api/webhooks/cal/route.ts holds for booking answers). The answers themselves are not stored here:
 * the visitor's Cal.com booking carries them, and that booking reaches Slack for approval as every intro call does.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const COOKIE_LIMIT = 500;

function clean(value: unknown, max = 100): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid json' }, { status: 400 });
  }

  const checked = checkApplication(body);
  if (!checked.ok) {
    // The browser shows the not-fit state itself; a not_qualified post means someone called the API directly.
    return NextResponse.json({ ok: false, reason: checked.reason }, { status: 400 });
  }
  if (!isValidEventId(body.eventId)) {
    return NextResponse.json({ ok: false, reason: 'event id' }, { status: 400 });
  }
  const eventId = body.eventId;
  const { answers } = checked;

  const [jar, hdrs] = await Promise.all([cookies(), headers()]);
  const fbp = clean(jar.get('_fbp')?.value, COOKIE_LIMIT);
  // The browser sends fbc built from ?fbclid when Meta's own cookie is not there yet (the Pixel had no consent).
  const fbc = clean(jar.get('_fbc')?.value, COOKIE_LIMIT) ?? (typeof body.fbc === 'string' && /^fb\.1\.\d+\.[\w-]+$/.test(body.fbc) ? body.fbc.slice(0, COOKIE_LIMIT) : undefined);
  const clientIp = clean(hdrs.get('cf-connecting-ip') ?? hdrs.get('x-forwarded-for')?.split(',')[0], 64);
  const userAgent = clean(hdrs.get('user-agent'), 400);

  const meta = await sendMetaLeadEvent({
    eventId,
    eventTime: Date.now() / 1000,
    email: answers.email,
    phone: answers.phone,
    name: answers.name,
    fbp,
    fbc,
    clientIp,
    userAgent,
  });

  const country = hdrs.get('cf-ipcountry') ?? hdrs.get('x-vercel-ip-country');
  const posthog = isTrackingAllowedServer(jar.get(CONSENT_COOKIE)?.value, country) ? getPostHogServer() : null;
  if (posthog) {
    const utm = Object.fromEntries(UTM_KEYS.map((k) => [k, clean((body.utm as Record<string, unknown> | undefined)?.[k])]).filter(([, v]) => v));
    posthog.capture({
      distinctId: clean(jar.get(POSTHOG_DISTINCT_ID_COOKIE)?.value, 200) ?? eventId,
      event: 'apply_submitted',
      properties: {
        revenue_band: answers.revenue,
        event_id: eventId,
        meta_lead_received: meta.ok,
        lf_tag: cleanReferralTag(jar.get(REFERRAL_TAG_COOKIE)?.value),
        ...utm,
      },
    });
    await posthog.shutdown();
  }

  return NextResponse.json({ ok: true, eventId, website: answers.website, phone: answers.phone });
}
