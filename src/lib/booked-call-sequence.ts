// When each pre-call email goes out, where the bookings wait, and the send itself.
// The emails are in booked-call-sequence-emails.ts; email 1 stays in booked-call-email.ts.
//
// How it runs: the Cal.com webhook saves every intro-call booking here (Redis, REDIS_URL) and
// removes it on a cancellation or reschedule, so Cal.com stays the source of truth for whether a
// call is still on. The cron at /api/cron/booked-call-sequence wakes every 15 minutes, works out
// each saved booking's plan and sends what is due. A Redis claim per booking and email (plus
// Resend's idempotency key) means one email never goes out twice.
//
// BOOKED_CALL_SEQUENCE decides what the cron does: "live" sends, anything else only logs what it
// would send. Bookings are saved either way, so switching it on picks up calls already booked.

import { createClient, type RedisClientType } from 'redis';
import { buildParts, companyName } from './booked-call-email';
import { SEQUENCE_EMAILS, type SequenceEmailNumber, type SequenceLead, type Vertical } from './booked-call-sequence-emails';

export type StoredBooking = {
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
  /** A rebooked call: its nurture emails went out for the first booking already. */
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
export function planFor(b: StoredBooking, armedAt: Date): PlannedEmail[] {
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
function siteLabel(b: StoredBooking): string {
  const typed = (b.company ?? '').trim();
  const host = typed.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[/?#]/)[0];
  if (/^[\w-]+(\.[\w-]+)+$/.test(host)) return host.toLowerCase();
  const name = companyName(typed, b.email);
  return name === 'your business' ? 'your business' : name;
}

export function leadFor(b: StoredBooking): SequenceLead | null {
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

// ---------- storage ----------

let client: RedisClientType | null = null;

async function redis(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_URL) return null;
  if (client?.isOpen) return client;
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('[booked-call-sequence:redis]', err));
  await client.connect();
  return client;
}

const UPCOMING = 'bcs:upcoming';
const bookingKey = (uid: string) => `bcs:booking:${uid}`;
const sentKey = (uid: string, n: number) => `bcs:sent:${uid}:${n}`;

/** Never throws: a Redis fault must not fail the Cal.com webhook (Cal.com would retry it). */
export async function saveBooking(b: StoredBooking): Promise<void> {
  try {
    const r = await redis();
    if (!r) return;
    const start = new Date(b.startTime).getTime();
    if (!Number.isFinite(start)) return;
    await r.set(bookingKey(b.uid), JSON.stringify(b), { PX: Math.max(start + 2 * 24 * HOUR - Date.now(), HOUR) });
    await r.zAdd(UPCOMING, { score: start, value: b.uid });
    console.log(`[booked-call-sequence] saved ${b.uid} (${verticalOf(b.src)}, call ${b.startTime})`);
  } catch (error) {
    console.error('[booked-call-sequence] save failed', error);
  }
}

export async function removeBooking(uid: string, why: string): Promise<void> {
  try {
    const r = await redis();
    if (!r) return;
    const gone = await r.zRem(UPCOMING, uid);
    await r.del(bookingKey(uid));
    if (gone) console.log(`[booked-call-sequence] removed ${uid} (${why})`);
  } catch (error) {
    console.error('[booked-call-sequence] remove failed', error);
  }
}

// ---------- the send ----------

const FROM = 'Arnel Bukva <arnel@mail.loudface.co>';
const REPLY_TO = 'arnel@loudface.co';

async function send(b: StoredBooking, n: SequenceEmailNumber, lead: SequenceLead): Promise<boolean> {
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
  const r = await redis();
  if (!r) return report;

  await r.zRemRangeByScore(UPCOMING, 0, now.getTime() - HOUR);
  const uids = await r.zRangeByScore(UPCOMING, now.getTime(), '+inf');
  // Bookings made before the switch-on start their plan at the switch-on, so nothing is "overdue".
  const since = process.env.BOOKED_CALL_SEQUENCE_SINCE ? new Date(process.env.BOOKED_CALL_SEQUENCE_SINCE) : null;

  for (const uid of uids) {
    const raw = await r.get(bookingKey(uid));
    if (!raw) continue;
    const b = JSON.parse(raw) as StoredBooking;
    report.bookings++;
    const lead = leadFor(b);
    if (!lead) continue;
    const bookedAt = new Date(b.bookedAt);
    const armedAt = since && since > bookedAt ? since : bookedAt;
    for (const step of planFor(b, armedAt)) {
      if (now < step.sendAt || now > step.until) continue;
      const tag = `${uid}#${step.n}`;
      report.due.push(tag);
      if (!live) continue;
      const claimed = await r.set(sentKey(uid, step.n), now.toISOString(), { NX: true, PX: 40 * 24 * HOUR });
      if (!claimed) continue;
      const ok = await send(b, step.n, lead).catch((error) => {
        console.error(`[booked-call-sequence] send failed for ${tag}`, error);
        return false;
      });
      if (ok) report.sent.push(tag);
      else {
        report.failed.push(tag);
        await r.del(sentKey(uid, step.n)); // the next tick tries again while the window is open
      }
    }
  }
  if (!live && report.due.length) console.log(`[booked-call-sequence] switched off; would send ${report.due.join(', ')}`);
  return report;
}
