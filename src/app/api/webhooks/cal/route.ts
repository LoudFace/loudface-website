import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { sendMetaScheduleEvent } from '@/lib/meta-capi';
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

// Allowlist: exactly ONE booking question crosses to PostHog — the attribution
// question, whose live label is "How did you hear about us?" (verified against
// the 2026-08-19 booking notification email). Every other answer (notes, phone
// numbers, budget, free text) stays in Cal.com — analytics never needs it and
// must not leak it. Matched after normalization against the field name AND the
// visible label, because Cal.com auto-generates field names from labels and we
// hold no Cal.com API key to pin the generated name.
const ATTRIBUTION_QUESTION_NORMALIZED = 'howdidyouhearaboutus';
// The field's internal name in Cal.com is plain "source" — confirmed against
// the live booking API (bookingFieldsResponses.source) on 2026-08-19.
const ATTRIBUTION_FIELD_NAMES = new Set(['source', ATTRIBUTION_QUESTION_NORMALIZED]);
const MAX_ANSWER_LENGTH = 200;

function normalizeQuestion(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// The visible label is authoritative: Cal.com keeps a field's internal name
// when its label is edited, so a repurposed question could keep a matching
// name while asking something else entirely. The name is trusted only when
// the payload carries no label at all.
function matchesAttributionQuestion(key: string, label: string | undefined): boolean {
  if (typeof label === 'string' && label.trim()) {
    return normalizeQuestion(label) === ATTRIBUTION_QUESTION_NORMALIZED;
  }
  return ATTRIBUTION_FIELD_NAMES.has(normalizeQuestion(key));
}

function extractLeadSource(payload: CalWebhookPayload['payload']): string | undefined {
  for (const [key, resp] of Object.entries(payload?.responses ?? {})) {
    if (!matchesAttributionQuestion(key, resp?.label)) continue;
    const value = resp?.value;
    const asString =
      typeof value === 'string'
        ? value
        : Array.isArray(value)
          ? value
              .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
              .join(', ')
          : '';
    const trimmed = asString.trim().slice(0, MAX_ANSWER_LENGTH);
    if (trimmed) return trimmed;
  }
  return undefined;
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

function toEventTime(timestamp: string | undefined): number {
  const parsed = timestamp ? Date.parse(timestamp) : Number.NaN;
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : Math.floor(Date.now() / 1000);
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
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

  // Direct cal.com bookings do not carry embed metadata, so browser match IDs are optional.
  const fbp = nonEmptyString(body.payload?.metadata?.fbp);
  const fbc = nonEmptyString(body.payload?.metadata?.fbc);

  const sendMetaSchedule = async () => {
    const bookingUid = body.payload?.uid;
    if (event !== 'call_booked' || !bookingUid) {
      const skipReasons: string[] = [];
      if (event !== 'call_booked') {
        skipReasons.push(`mapped event is ${JSON.stringify(event)}, expected "call_booked"`);
      }
      if (!bookingUid) skipReasons.push('body.payload.uid is absent');

      console.warn(
        `[meta-capi] skipped: ${skipReasons.join('; ')}; mapped_event=${JSON.stringify(event)} ` +
          `payload_uid_present=${Boolean(bookingUid)} raw_trigger_event=${JSON.stringify(body.triggerEvent)} ` +
          `fbp_present=${Boolean(fbp)} fbc_present=${Boolean(fbc)}`
      );
      return;
    }

    await sendMetaScheduleEvent({
      bookingUid,
      email,
      name: attendee?.name,
      eventTime: toEventTime(body.createdAt),
      fbp,
      fbc,
    });
  };

  const posthog = getPostHogServer();
  if (!posthog) {
    console.warn('[cal-webhook] PostHog not configured, skipping capture');
    await sendMetaSchedule();
    return NextResponse.json({ received: true });
  }

  const utm = extractUtm(body.payload);
  const leadSource = extractLeadSource(body.payload);

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
    lead_source: leadSource,
    ...utm,
  };

  // lead_source also lives on the person so person-level breakdowns work —
  // same shape the 2026-08-19 backfill wrote for historical bookings.
  posthog.identify({
    distinctId: email,
    properties: {
      email,
      name: attendee?.name,
      ...(leadSource ? { lead_source: leadSource } : {}),
    },
  });

  posthog.capture({
    distinctId: email,
    event,
    properties,
  });

  await posthog.shutdown();

  await sendMetaSchedule();

  return NextResponse.json({ received: true, event });
}
