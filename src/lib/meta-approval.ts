import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Booked calls reach Meta only after a person approves them in Slack (2026-10-31, from Hayes Media's flow).
 * The Cal.com webhook prepares the Schedule event and puts it inside the card's ✅ button; the Slack
 * interactivity route sends it when someone clicks ✅. ❌ sends nothing. There is no store: the prepared event
 * travels in the button value, so a pending booking lives only in Slack.
 *
 * Switched on by META_SCHEDULE_MODE=approval. Until then the webhook keeps sending Schedule on every booking.
 */

const META_GRAPH_API_VERSION = 'v25.0';
/** Required by Meta whenever action_source is 'website'. Bookings start from the Cal modal. */
const EVENT_SOURCE_URL = 'https://www.loudface.co/contact';
/** Meta refuses website events older than 7 days, so an approval later than this is not sent. */
export const MAX_EVENT_AGE_SECONDS = 7 * 24 * 60 * 60;
/** Slack refuses request timestamps older than 5 minutes as replays. */
const SLACK_MAX_SKEW_SECONDS = 5 * 60;

export const APPROVE_ACTION = 'meta_schedule_approve';
export const REJECT_ACTION = 'meta_schedule_reject';

/** The hashed Schedule event as it rides in the ✅ button. Short keys keep it far under Slack's 2,000 characters. */
export type PreparedSchedule = {
  id: string;
  t: number;
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  fbp?: string;
  fbc?: string;
};

function sha256(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash('sha256').update(normalized).digest('hex');
}

/** Meta wants phone numbers as digits only, country code included. */
function hashPhone(phone: string | undefined): string | undefined {
  const digits = phone?.replace(/\D/g, '');
  return digits ? sha256(digits) : undefined;
}

export function prepareSchedule(input: {
  bookingUid: string;
  bookedAt: number;
  email?: string;
  phone?: string;
  name?: string;
  fbp?: string;
  fbc?: string;
}): PreparedSchedule {
  const [first, ...rest] = (input.name ?? '').trim().toLowerCase().split(/\s+/);
  const prepared: PreparedSchedule = { id: `cal_booking_${input.bookingUid}`, t: Math.floor(input.bookedAt) };
  const em = sha256(input.email);
  const ph = hashPhone(input.phone);
  const fn = sha256(first);
  const ln = sha256(rest.join(' '));
  if (em) prepared.em = em;
  if (ph) prepared.ph = ph;
  if (fn) prepared.fn = fn;
  if (ln) prepared.ln = ln;
  if (input.fbp) prepared.fbp = input.fbp;
  if (input.fbc) prepared.fbc = input.fbc;
  return prepared;
}

export function parsePrepared(value: string): PreparedSchedule | undefined {
  try {
    const parsed = JSON.parse(value) as PreparedSchedule;
    if (typeof parsed?.id !== 'string' || !parsed.id.startsWith('cal_booking_')) return undefined;
    if (typeof parsed.t !== 'number' || !Number.isFinite(parsed.t)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function isTooOld(prepared: PreparedSchedule, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  return nowSeconds - prepared.t > MAX_EVENT_AGE_SECONDS;
}

export type MetaSendResult = { ok: true; received: number } | { ok: false; reason: string };

/** Sends one approved Schedule event. event_time is when the call was booked, not when it was approved. */
export async function sendApprovedSchedule(prepared: PreparedSchedule): Promise<MetaSendResult> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return { ok: false, reason: 'META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is not set' };
  if (isTooOld(prepared)) return { ok: false, reason: 'booked more than 7 days ago; Meta refuses events that old' };

  const { id, t, fbp, fbc, ...hashed } = prepared;
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  try {
    const response = await fetch(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Schedule',
            event_time: t,
            event_id: id,
            action_source: 'website',
            event_source_url: EVENT_SOURCE_URL,
            user_data: { ...hashed, ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}) },
          },
        ],
        ...(testCode ? { test_event_code: testCode } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });
    const text = await response.text();
    if (!response.ok) {
      console.error(`[meta-approval] Meta refused: status=${response.status} body=${text}`);
      return { ok: false, reason: `Meta answered ${response.status}` };
    }
    const received = Number((JSON.parse(text) as { events_received?: number }).events_received ?? 0);
    console.log(`[meta-approval] sent ${id}: events_received=${received}${testCode ? ' (test event code)' : ''}`);
    return received > 0 ? { ok: true, received } : { ok: false, reason: 'Meta received 0 events' };
  } catch (error) {
    console.error('[meta-approval] request failed', error);
    return { ok: false, reason: 'the request to Meta failed' };
  }
}

/** Slack's request signature: v0=HMAC-SHA256(signing secret, `v0:${timestamp}:${body}`). */
export function verifySlackSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > SLACK_MAX_SKEW_SECONDS) return false;
  const expected = `v0=${createHmac('sha256', secret).update(`v0:${timestamp}:${rawBody}`).digest('hex')}`;
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

type SlackBlock = Record<string, unknown>;

export type ApprovalCard = {
  name?: string;
  email?: string;
  phone?: string;
  startTime?: string;
  timeZone?: string;
  bookingUid?: string;
  answers?: Record<string, string>;
};

function when(startTime: string | undefined, timeZone: string | undefined): string {
  const parsed = startTime ? Date.parse(startTime) : Number.NaN;
  if (!Number.isFinite(parsed)) return startTime || '—';
  const unix = Math.floor(parsed / 1000);
  const fallback = new Date(parsed).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  return `<!date^${unix}^{date_short_pretty} at {time}|${fallback}>${timeZone ? `\n_their time: ${timeZone}_` : ''}`;
}

export function approvalBlocks(card: ApprovalCard, prepared: PreparedSchedule): SlackBlock[] {
  const fields: SlackBlock[] = [
    { type: 'mrkdwn', text: `*Name*\n${card.name?.trim() || '—'}` },
    { type: 'mrkdwn', text: `*Email*\n${card.email ? `<mailto:${card.email}|${card.email}>` : '—'}` },
    { type: 'mrkdwn', text: `*Phone*\n${card.phone?.trim() || '—'}` },
    { type: 'mrkdwn', text: `*Call*\n${when(card.startTime, card.timeZone)}` },
  ];
  const answers = Object.entries(card.answers ?? {})
    // Name, email and phone already sit at the top; Cal.com also sends them as "Your Name" and "email_address".
    // /apply's event type labels them "Your name", "Work email" and "Phone" (2026-10-31).
    .filter(([label]) => !/^(your|work)?(name|email|emailaddress|attendeephonenumber|phone|guests|location|notes|rescheduledreason)$/i.test(label.replace(/[^a-z]/gi, '')))
    .slice(0, 10)
    .map(([label, value]) => ({ type: 'mrkdwn', text: `*${label}*\n${value.slice(0, 300)}` }));
  const value = JSON.stringify(prepared);
  return [
    { type: 'header', text: { type: 'plain_text', text: ':telephone_receiver: Booked call: send to Meta?', emoji: true } },
    { type: 'section', fields },
    ...(answers.length ? [{ type: 'section', fields: answers }] : []),
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: 'After the call: ✅ tells Meta this was a qualified call (Schedule). ❌ sends nothing. Mark within 7 days of booking.' }],
    },
    {
      type: 'actions',
      block_id: 'meta_schedule',
      elements: [
        { type: 'button', style: 'primary', action_id: APPROVE_ACTION, text: { type: 'plain_text', text: '✅ Qualified', emoji: true }, value },
        { type: 'button', style: 'danger', action_id: REJECT_ACTION, text: { type: 'plain_text', text: '❌ Not qualified', emoji: true }, value: prepared.id },
        ...(card.bookingUid
          ? [{ type: 'button', action_id: 'open_booking', text: { type: 'plain_text', text: 'Open booking' }, url: `https://app.cal.com/booking/${card.bookingUid}` }]
          : []),
      ],
    },
  ];
}

/** Posts the approval card as the house bot. Never throws: a Slack outage must not fail the Cal.com webhook. */
export async function postApprovalCard(card: ApprovalCard, prepared: PreparedSchedule): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_META_APPROVAL_CHANNEL;
  if (!token || !channel) {
    console.error('[meta-approval] SLACK_BOT_TOKEN or SLACK_META_APPROVAL_CHANNEL not set; booking not sent for approval');
    return false;
  }
  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        channel,
        username: 'Meta call approvals',
        icon_emoji: ':telephone_receiver:',
        text: `Booked call: ${card.name?.trim() || card.email || 'unknown'}. Qualified? ✅ sends it to Meta.`,
        blocks: approvalBlocks(card, prepared),
      }),
      signal: AbortSignal.timeout(5000),
    });
    const body = (await response.json()) as { ok?: boolean; error?: string };
    if (!body.ok) console.error(`[meta-approval] Slack refused the card: ${body.error}`);
    return Boolean(body.ok);
  } catch (error) {
    console.error('[meta-approval] Slack post failed', error);
    return false;
  }
}
