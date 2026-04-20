import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getPostHogServer } from '@/lib/posthog-server';

type CalAttendee = {
  email?: string;
  name?: string;
  timeZone?: string;
};

type CalTracking = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

type CalWebhookPayload = {
  triggerEvent: string;
  createdAt?: string;
  payload?: {
    uid?: string;
    bookingId?: number;
    eventTypeId?: number;
    type?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    attendees?: CalAttendee[];
    organizer?: { email?: string; name?: string };
    responses?: Record<string, { label?: string; value?: unknown }>;
    metadata?: Record<string, unknown>;
    tracking?: CalTracking;
  };
};

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

// Cal.com does NOT forward UTM query params from embed URLs to webhooks by default.
// This extractor works only if the event type has hidden custom questions named
// utm_source/utm_medium/etc. that the embed config prefills. Kept defensive in case
// someone adds those later; will be empty otherwise.
function extractUtm(payload: CalWebhookPayload['payload']): CalTracking {
  const out: CalTracking = {};
  const tracking = payload?.tracking;
  const responses = payload?.responses;
  for (const key of UTM_KEYS) {
    const fromTracking = tracking?.[key];
    if (typeof fromTracking === 'string' && fromTracking) {
      out[key] = fromTracking;
      continue;
    }
    const resp = responses?.[key]?.value;
    if (typeof resp === 'string' && resp) out[key] = resp;
  }
  return out;
}

const EVENT_MAP: Record<string, string> = {
  BOOKING_CREATED: 'call_booked',
  BOOKING_RESCHEDULED: 'call_rescheduled',
  BOOKING_CANCELLED: 'call_cancelled',
};

function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = header.replace(/^sha256=/, '');
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[cal-webhook] CAL_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-cal-signature-256');

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn('[cal-webhook] invalid signature');
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let body: CalWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const event = EVENT_MAP[body.triggerEvent];
  if (!event) {
    return NextResponse.json({ received: true, ignored: body.triggerEvent });
  }

  const attendee = body.payload?.attendees?.[0];
  const email = attendee?.email?.toLowerCase().trim();
  if (!email) {
    console.warn('[cal-webhook] no attendee email in payload');
    return NextResponse.json({ received: true, warning: 'no email' });
  }

  const posthog = getPostHogServer();
  if (!posthog) {
    console.warn('[cal-webhook] PostHog not configured, skipping capture');
    return NextResponse.json({ received: true });
  }

  const utm = extractUtm(body.payload);

  const properties = {
    booking_uid: body.payload?.uid,
    booking_id: body.payload?.bookingId,
    event_type_id: body.payload?.eventTypeId,
    event_type: body.payload?.type,
    title: body.payload?.title,
    start_time: body.payload?.startTime,
    end_time: body.payload?.endTime,
    status: body.payload?.status,
    attendee_name: attendee?.name,
    attendee_timezone: attendee?.timeZone,
    organizer_email: body.payload?.organizer?.email,
    ...utm,
  };

  posthog.identify({
    distinctId: email,
    properties: {
      email,
      name: attendee?.name,
    },
  });

  posthog.capture({
    distinctId: email,
    event,
    properties,
  });

  await posthog.shutdown();

  return NextResponse.json({ received: true, event });
}
