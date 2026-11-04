// When each pre-call email goes out, and the send itself.
// The emails are in booked-call-sequence-emails.ts; email 1 stays in booked-call-email.ts.
//
// How it runs: the cron at /api/cron/booked-call-sequence wakes every 15 minutes, reads the
// upcoming intro-call bookings from Cal.com (CAL_API_KEY), works out each one's plan and sends
// what is due. Cal.com is the only record: a cancelled call is no longer upcoming, and a moved call
// comes back as a new booking marked as rescheduled. Nothing is stored here. Each email has a send
// window shorter than a day, and Resend refuses a repeat of the same Idempotency-Key for 24 hours,
// so the four or more ticks inside one window send it once.
//
// BOOKED_CALL_SEQUENCE decides what the cron does: "live" sends, anything else only reports what it
// would send. BOOKED_CALL_SEQUENCE_SINCE (ISO time of the switch-on) starts the plan of a call
// booked before then at the switch-on, so nothing counts as overdue.

import { buildParts, companyName } from './booked-call-email';
import { SEQUENCE_EMAILS, type SequenceEmailNumber, type SequenceLead, type Vertical } from './booked-call-sequence-emails';

export type LeadBooking = {
  uid: string;
  email: string;
  name?: string;
  startTime: string;
  timeZone?: string;
  bookedAt: string;
  /** The company-name answer (intro call) or the website answer (/apply). */
  company?: string;
  /** The page the booking was made on (/apply bookings only). */
  src?: string;
  joinUrl?: string;
  /** A moved call: its nurture emails went out for the first booking already. */
  rescheduled?: boolean;
};

export type PlannedEmail = { n: SequenceEmailNumber; sendAt: Date; until: Date };

const HOUR = 3_600_000;
const NURTURE_HOUR = 9; // 09:00 in the lead's own zone, weekdays only

// ---------- time in the lead's zone ----------

function zoneParts(at: Date, zone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    weekday: 'short', hourCycle: 'h23',
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { y: +get('year'), m: +get('month'), d: +get('day'), h: +get('hour'), min: +get('minute'), weekday: get('weekday') };
}

/** The instant that reads y-m-d hh:00 on a clock in `zone`. */
function atZoneTime(y: number, m: number, d: number, hour: number, zone: string): Date {
  let guess = Date.UTC(y, m - 1, d, hour);
  for (let i = 0; i < 2; i++) {
    const p = zoneParts(new Date(guess), zone);
    const shown = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
    guess += Date.UTC(y, m - 1, d, hour) - shown;
  }
  return new Date(guess);
}

/** Weekday 09:00 slots in the lead's zone, from `from` to `to`. */
function morningSlots(from: Date, to: Date, zone: string): Date[] {
  const slots: Date[] = [];
  const start = zoneParts(from, zone);
  for (let day = 0; day < 31; day++) {
    const noon = new Date(Date.UTC(start.y, start.m - 1, start.d + day, 12));
    const slot = atZoneTime(noon.getUTCFullYear(), noon.getUTCMonth() + 1, noon.getUTCDate(), NURTURE_HOUR, zone);
    if (slot > to) break;
    const weekday = zoneParts(slot, zone).weekday;
    if (slot >= from && weekday !== 'Sat' && weekday !== 'Sun') slots.push(slot);
  }
  return slots;
}

// ---------- the plan ----------

/**
 * Which emails a booking gets and when. `armedAt` is when the sequence started for it: the booking
 * time, or the switch-on time for a call booked before the sequence existed.
 *
 * - 5 (tomorrow): 24 hours before, when the call was booked at least 30 hours ahead.
 * - 6 (one hour): 60 minutes before, always.
 * - 2, 3, 4: weekday 09:00 slots between 10 hours after booking and 36 hours before the call.
 *   Three slots or more: 2 first, 4 last, 3 in the middle. Two: 2 and 3. One: 2. A rebooked call
 *   skips them; the lead had them for the first booking.
 */
export function planFor(b: LeadBooking, armedAt: Date): PlannedEmail[] {
  const start = new Date(b.startTime);
  const zone = b.timeZone || 'UTC';
  const plan: PlannedEmail[] = [];

  if (!b.rescheduled) {
    const slots = morningSlots(new Date(armedAt.getTime() + 10 * HOUR), new Date(start.getTime() - 36 * HOUR), zone);
    const until = (at: Date) => new Date(at.getTime() + 6 * HOUR);
    if (slots.length >= 1) plan.push({ n: 2, sendAt: slots[0], until: until(slots[0]) });
    if (slots.length >= 2) {
      const mid = slots.length >= 3 ? slots[Math.round((slots.length - 1) / 2)] : slots[1];
      plan.push({ n: 3, sendAt: mid, until: until(mid) });
    }
    if (slots.length >= 3) {
      const last = slots[slots.length - 1];
      plan.push({ n: 4, sendAt: last, until: until(last) });
    }
  }

  if (start.getTime() - new Date(b.bookedAt).getTime() >= 30 * HOUR) {
    const at = new Date(start.getTime() - 24 * HOUR);
    plan.push({ n: 5, sendAt: at, until: new Date(start.getTime() - 4 * HOUR) });
  }
  plan.push({ n: 6, sendAt: new Date(start.getTime() - HOUR), until: new Date(start.getTime() - 10 * 60_000) });
  return plan;
}

export function verticalOf(src?: string): Vertical {
  const path = (src ?? '').replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0];
  if (path.startsWith('/apply/legal')) return 'legal';
  if (path.startsWith('/apply/saas')) return 'saas';
  if (path.startsWith('/apply')) return 'info';
  return 'site';
}

/** A typed company name as written; a typed web address as its bare host; else "your business". */
function siteLabel(b: LeadBooking): string {
  const typed = (b.company ?? '').trim();
  const host = typed.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0];
  if (/^[\w-]+(\.[\w-]+)+$/.test(host)) return host.toLowerCase();
  const name = companyName(typed, b.email);
  return name === 'your business' ? 'your business' : name;
}

export function leadFor(b: LeadBooking): SequenceLead | null {
  const parts = buildParts(b.email, b.name, b.startTime, b.timeZone, b.company);
  if (!parts) return null;
  return {
    firstName: parts.first_name,
    site: siteLabel(b),
    callDate: parts.call_date,
    callTime: parts.call_time,
    callDay: parts.call_day,
    callMonth: parts.call_month,
    callDaynum: parts.call_daynum,
    tzLabel: parts.tz_label,
    joinUrl: b.joinUrl || `https://app.cal.com/booking/${b.uid}`,
    rescheduleUrl: `https://app.cal.com/reschedule/${b.uid}`,
    vertical: verticalOf(b.src),
  };
}

// ---------- the bookings, from Cal.com ----------

// Same two event types the webhook treats as leads (api/webhooks/cal/route.ts).
const LEAD_EVENT_TYPE_IDS = new Set([529903, 7718812]);
const LEAD_EVENT_TYPE_SLUGS = new Set(['loudface-intro-call', 'loudface-intro-call-apply']);

type CalBooking = {
  uid: string;
  status?: string;
  start: string;
  createdAt: string;
  eventTypeId?: number;
  eventType?: { slug?: string };
  attendees?: Array<{ name?: string; email?: string; timeZone?: string }>;
  bookingFieldsResponses?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  meetingUrl?: string;
  location?: string;
  rescheduledFromUid?: string | null;
  fromReschedule?: string | null;
};

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export function toLeadBooking(c: CalBooking): LeadBooking | null {
  const isLead = LEAD_EVENT_TYPE_SLUGS.has(c.eventType?.slug ?? '') || LEAD_EVENT_TYPE_IDS.has(c.eventTypeId ?? -1);
  const guest = c.attendees?.[0];
  const email = guest?.email?.toLowerCase().trim();
  if (!isLead || c.status !== 'accepted' || !email) return null;
  // LoudFace team tests and bookings marked "(ignore)" are never leads.
  if (email.endsWith('@loudface.co') || /\(ignore\)/i.test(guest?.name ?? '')) return null;
  const f = c.bookingFieldsResponses ?? {};
  return {
    uid: c.uid,
    email,
    name: guest?.name,
    startTime: c.start,
    timeZone: guest?.timeZone,
    bookedAt: c.createdAt,
    company: str(f['company-name']) ?? str(f.website),
    src: str(c.metadata?.src),
    joinUrl: [c.meetingUrl, c.location].find((v): v is string => typeof v === 'string' && v.startsWith('https://')),
    rescheduled: Boolean(c.rescheduledFromUid || c.fromReschedule),
  };
}

async function upcomingBookings(): Promise<LeadBooking[]> {
  const key = process.env.CAL_API_KEY;
  if (!key) throw new Error('CAL_API_KEY is not set');
  const res = await fetch('https://api.cal.com/v2/bookings?status=upcoming&take=100&sortStart=asc', {
    headers: { Authorization: `Bearer ${key}`, 'cal-api-version': '2024-08-13' },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Cal.com returned ${res.status}`);
  const body = (await res.json()) as { data?: CalBooking[] };
  return (body.data ?? []).map(toLeadBooking).filter((b): b is LeadBooking => b !== null);
}

// ---------- the send ----------

const FROM = 'Arnel Bukva <arnel@mail.loudface.co>';
const REPLY_TO = 'arnel@loudface.co';

async function send(b: LeadBooking, n: SequenceEmailNumber, lead: SequenceLead): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const email = SEQUENCE_EMAILS[n](lead);
  if (email.html.includes('{{')) {
    console.error(`[booked-call-sequence] unfilled placeholder in email ${n}, refusing to send`);
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `booked-call-${n}-${b.uid}` },
    body: JSON.stringify({ from: FROM, to: [b.email], reply_to: REPLY_TO, subject: email.subject, html: email.html, text: email.text }),
  });
  if (!res.ok) {
    console.error(`[booked-call-sequence] Resend returned ${res.status} for email ${n} to ${b.uid}: ${await res.text()}`);
    return false;
  }
  const sent = (await res.json()) as { id?: string };
  console.log(`[booked-call-sequence] sent email ${n} (${sent.id}) to ${b.email} for ${b.uid}`);
  return true;
}

export type RunReport = { live: boolean; bookings: number; sent: string[]; due: string[]; failed: string[] };

/** One cron tick. Sends each email whose moment has come and whose window has not closed. */
export async function runSequence(now = new Date()): Promise<RunReport> {
  const live = process.env.BOOKED_CALL_SEQUENCE === 'live';
  const report: RunReport = { live, bookings: 0, sent: [], due: [], failed: [] };
  const since = process.env.BOOKED_CALL_SEQUENCE_SINCE ? new Date(process.env.BOOKED_CALL_SEQUENCE_SINCE) : null;

  for (const b of await upcomingBookings()) {
    report.bookings++;
    const lead = leadFor(b);
    if (!lead) continue;
    const bookedAt = new Date(b.bookedAt);
    const armedAt = since && since > bookedAt ? since : bookedAt;
    for (const step of planFor(b, armedAt)) {
      if (now < step.sendAt || now > step.until) continue;
      const tag = `${b.uid}#${step.n}`;
      report.due.push(tag);
      if (!live) continue;
      const ok = await send(b, step.n, lead).catch((error) => {
        console.error(`[booked-call-sequence] send failed for ${tag}`, error);
        return false;
      });
      (ok ? report.sent : report.failed).push(tag);
    }
  }
  console.log(`[booked-call-sequence] ${live ? 'live' : 'switched off'}: ${report.bookings} upcoming, due ${report.due.join(', ') || 'none'}`);
  return report;
}
