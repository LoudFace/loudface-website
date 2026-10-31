import { createHash } from 'node:crypto';

const META_GRAPH_API_VERSION = 'v25.0';
/** Required by Meta whenever action_source is 'website'. Bookings start from the Cal modal. */
const EVENT_SOURCE_URL = 'https://www.loudface.co/contact';

type MetaScheduleEvent = {
  bookingUid: string;
  email: string;
  name?: string;
  eventTime: number;
  fbp?: string;
  fbc?: string;
};

function hashUserData(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;

  return createHash('sha256').update(normalized).digest('hex');
}

function hashName(name: string | undefined): { fn?: string; ln?: string } {
  const normalized = name?.trim().toLowerCase();
  if (!normalized) return {};

  const [firstName, ...lastName] = normalized.split(/\s+/);
  return {
    fn: hashUserData(firstName),
    ln: hashUserData(lastName.join(' ')),
  };
}

/** Sends the server-side Schedule event for a confirmed Cal.com booking. */
export async function sendMetaScheduleEvent({
  bookingUid,
  email,
  name,
  eventTime,
  fbp,
  fbc,
}: MetaScheduleEvent): Promise<void> {
  const matchDataPresence = `fbp_present=${Boolean(fbp)} fbc_present=${Boolean(fbc)}`;

  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (!pixelId || !accessToken) {
      const missingVariables: string[] = [];
      if (!pixelId) missingVariables.push('META_PIXEL_ID');
      if (!accessToken) missingVariables.push('META_CAPI_ACCESS_TOKEN');

      console.warn(
        `[meta-capi] skipped: missing ${missingVariables.join(', ')}; ` +
          `access_token_present=${Boolean(accessToken)} access_token_length=${accessToken?.length ?? 0} ` +
          matchDataPresence
      );
      return;
    }

    const endpoint = new URL(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events`
    );
    endpoint.searchParams.set('access_token', accessToken);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Schedule',
            event_time: Math.floor(eventTime),
            event_id: `cal_booking_${bookingUid}`,
            action_source: 'website',
            event_source_url: EVENT_SOURCE_URL,
            user_data: {
              em: hashUserData(email),
              ...hashName(name),
              ...(fbp ? { fbp } : {}),
              ...(fbc ? { fbc } : {}),
            },
          },
        ],
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error(
        `[meta-capi] failed: status=${response.status} statusText=${JSON.stringify(response.statusText)} ` +
          `body=${responseText} ${matchDataPresence}`
      );
      return;
    }

    let responseBody: unknown;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    console.log(
      `[meta-capi] sent: status=${response.status} body=${JSON.stringify(responseBody)} ` +
        matchDataPresence
    );
  } catch {
    console.error(
      `[meta-capi] failed: request threw before a response was received ${matchDataPresence}`
    );
  }
}

/**
 * The /apply Lead (2026-10-31). Sent the moment a qualified visitor finishes the application (POST /api/apply),
 * before they pick a time; never held for approval (only Schedule is, lib/meta-approval.ts). The browser fires the
 * Pixel Lead with the same event_id when the visitor's consent allows the Pixel, so Meta counts one Lead.
 * Personal data leaves here only as SHA-256 hashes; the logs carry counts and presence flags, never values.
 */
const APPLY_SOURCE_URL = 'https://www.loudface.co/apply';

export type MetaLeadInput = {
  eventId: string;
  eventTime: number;
  email: string;
  phone: string;
  name: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
};

/** Meta wants phone numbers as digits only, country code included. */
function hashPhoneDigits(phone: string | undefined): string | undefined {
  const digits = phone?.replace(/\D/g, '');
  return digits ? createHash('sha256').update(digits).digest('hex') : undefined;
}

/** The request body for one Lead. Pure, so the hashing and the shape are tested without the network. */
export function buildLeadEvent(input: MetaLeadInput, testEventCode?: string) {
  const user_data: Record<string, string> = {};
  const em = hashUserData(input.email);
  const ph = hashPhoneDigits(input.phone);
  const { fn, ln } = hashName(input.name);
  if (em) user_data.em = em;
  if (ph) user_data.ph = ph;
  if (fn) user_data.fn = fn;
  if (ln) user_data.ln = ln;
  if (input.fbp) user_data.fbp = input.fbp;
  if (input.fbc) user_data.fbc = input.fbc;
  if (input.clientIp) user_data.client_ip_address = input.clientIp;
  if (input.userAgent) user_data.client_user_agent = input.userAgent;
  return {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(input.eventTime),
        event_id: input.eventId,
        action_source: 'website',
        event_source_url: APPLY_SOURCE_URL,
        user_data,
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };
}

export type MetaLeadResult = { ok: true; received: number } | { ok: false; reason: string };

export async function sendMetaLeadEvent(input: MetaLeadInput): Promise<MetaLeadResult> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const presence = `fbp_present=${Boolean(input.fbp)} fbc_present=${Boolean(input.fbc)}`;
  if (!pixelId || !accessToken) {
    console.warn(`[meta-capi] lead skipped: META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is not set ${presence}`);
    return { ok: false, reason: 'not configured' };
  }
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  try {
    const response = await fetch(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(buildLeadEvent(input, testCode)),
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();
    if (!response.ok) {
      console.error(`[meta-capi] lead refused: status=${response.status} body=${text} ${presence}`);
      return { ok: false, reason: `Meta answered ${response.status}` };
    }
    const received = Number((JSON.parse(text) as { events_received?: number }).events_received ?? 0);
    console.log(`[meta-capi] lead sent ${input.eventId}: events_received=${received}${testCode ? ' (test event code)' : ''} ${presence}`);
    return received > 0 ? { ok: true, received } : { ok: false, reason: 'Meta received 0 events' };
  } catch {
    console.error(`[meta-capi] lead failed: request threw before a response was received ${presence}`);
    return { ok: false, reason: 'the request to Meta failed' };
  }
}
