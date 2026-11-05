// Sends the "your call is booked" email the moment someone books an intro call.
//
// Fire-and-forget, on purpose, exactly like notifySlackOfLead: a Resend outage
// must never make the Cal.com webhook fail, because Cal.com retries a non-2xx
// and PostHog + Meta would then be double-counted. Every failure is logged and
// swallowed.
//
// Only email 1 of the old three-part drip is sent. Emails 2 and 3 exist as
// templates but are deliberately switched off (Arnel, 2026-09-01).

import { BOOKED_CALL_EMAIL_HTML } from './booked-call-email-template';

export type BookedCallEmail = {
  name?: string;
  email: string;
  /** ISO start time from the Cal.com payload. */
  startTime?: string;
  /** The attendee's own zone. Everything they read is rendered in it. */
  timeZone?: string;
  /** Used as the idempotency key, so a Cal.com retry cannot send twice. */
  bookingUid?: string;
  /** The booking form's "company-name" answer, as the lead typed it. */
  company?: string;
  /** The booking came from a Meta ad (isMetaAdBooking in lib/meta-approval.ts). */
  fromAd?: boolean;
};

// Jordan Hayes's quote ends by comparing search leads with paid-ads leads. That helps a lead who found us
// through search and reads oddly to one who just came from our own ad, so an ad lead's copy stops at
// "$6,000." (Arnel approved the exact text, 2026-11-06). The test pins this sentence to the template.
export const PAID_ADS_SENTENCES =
  ' What surprised me is the quality. People who find us through search come to the call warmer than anyone we get from paid ads.';

/** Email 1's HTML before the lead's details go in: the ad version leaves out the paid-ads comparison. */
export function emailTemplate(fromAd?: boolean): string {
  return fromAd ? BOOKED_CALL_EMAIL_HTML.split(PAID_ADS_SENTENCES).join('') : BOOKED_CALL_EMAIL_HTML;
}

const FROM = 'Arnel Bukva <arnel@mail.loudface.co>';
const REPLY_TO = 'arnel@loudface.co';
const SUBJECT = "Your call is booked - here's what we'll cover";

/** Free-mail domains that never become a company name. */
const GENERIC_DOMAINS = new Set([
  'gmail', 'outlook', 'hotmail', 'yahoo', 'icloud', 'proton',
  'protonmail', 'me', 'live', 'aol',
]);

// Companies whose real spelling is not what a plain capital letter produces.
// A lead at ByteDance reading "Bytedance" sees carelessness.
// Keep in step with COMPANY_SPELLINGS in arnel-content/scripts/booked_call_drip.py.
const COMPANY_SPELLINGS: Record<string, string> = {
  bytedance: 'ByteDance', tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn',
  github: 'GitHub', gitlab: 'GitLab', paypal: 'PayPal', hubspot: 'HubSpot',
  salesforce: 'Salesforce', shopify: 'Shopify', openai: 'OpenAI', deepmind: 'DeepMind',
  airbnb: 'Airbnb', ebay: 'eBay', vmware: 'VMware', ibm: 'IBM', sap: 'SAP', aws: 'AWS',
  nvidia: 'NVIDIA', asml: 'ASML', kpmg: 'KPMG', ey: 'EY', pwc: 'PwC', bcg: 'BCG',
  mysql: 'MySQL', postgresql: 'PostgreSQL', mongodb: 'MongoDB', wordpress: 'WordPress',
  webflow: 'Webflow', posthog: 'PostHog', dataforseo: 'DataForSEO',
};

// Answers that say "no company" rather than name one.
const NO_COMPANY = /^(n\/?a|none|no|nil|null|-+|\.+|\?+)$/i;

/**
 * The company as the lead wrote it on the booking form, so Hai Robotics reads
 * "Hai Robotics", never "Hairobotics" (a 2026-10-21 check found five of seven emails
 * since 22 Sep carried the domain-built name). The email domain is only the
 * fallback: an empty answer, a "n/a", or a typed web address.
 */
export function companyName(answer: string | undefined, email: string): string {
  const typed = (answer ?? '').replace(/\s+/g, ' ').trim();
  const looksLikeAddress = /^(https?:\/\/|www\.)/i.test(typed) || /^[\w-]+(\.[\w-]+)+\/?$/.test(typed);
  if (!typed || typed.length > 60 || NO_COMPANY.test(typed) || looksLikeAddress) return companyFromEmail(email);
  return typed;
}

export function companyFromEmail(email: string): string {
  const domain = (email.split('@').pop() ?? '').split('.')[0]?.toLowerCase() ?? '';
  if (!domain || GENERIC_DOMAINS.has(domain)) return 'your business';
  return COMPANY_SPELLINGS[domain] ?? domain.charAt(0).toUpperCase() + domain.slice(1);
}

/** Lead names and company names come from a booking form, so they are untrusted. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type Parts = Record<string, string>;

export function buildParts(email: string, name?: string, startTime?: string, timeZone?: string, company?: string): Parts | null {
  const start = startTime ? new Date(startTime) : null;
  if (!start || Number.isNaN(start.getTime())) return null;

  const zone = timeZone || 'UTC';
  const at = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: zone, ...opts }).format(start);

  // The zone abbreviation (PDT, CEST) reads better to a human than an offset.
  // en-GB names European zones (CET) but prints "GMT-8" for Los Angeles, where en-US says PST.
  const zoneName = (locale: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: 'short' })
      .formatToParts(start)
      .find((part) => part.type === 'timeZoneName')?.value;
  const gb = zoneName('en-GB');
  const zoneLabel = (gb && !gb.startsWith('GMT') ? gb : zoneName('en-US') ?? gb) ?? zone;

  const weekday = at({ weekday: 'long' });
  const daynum = at({ day: 'numeric' });
  // en-GB renders September as "Sept". The rest of the drip uses three letters,
  // so trim to keep the date card and the sentence consistent.
  const month = at({ month: 'short' }).slice(0, 3);

  return {
    first_name: (name || 'there').trim().split(/\s+/)[0] || 'there',
    company: companyName(company, email),
    call_date: `${weekday}, ${daynum} ${month}`,
    call_time: at({ hour: '2-digit', minute: '2-digit', hour12: false }),
    call_day: weekday,
    call_month: month.toUpperCase(),
    call_daynum: daynum,
    call_weekday: weekday,
    tz_label: `(${zoneLabel}, your time)`,
  };
}

function plainText(p: Parts): string {
  return [
    `Hi ${p.first_name}, you made a very good decision to connect with LoudFace.`,
    '',
    `Thanks for booking the call. We're on ${p.call_date} at ${p.call_time} ${p.tz_label} and the invite is in your calendar.`,
    '',
    "WHAT WE'LL COVER",
    '01 We get introduced, and I learn about your business.',
    '02 I ask questions to understand what you actually need.',
    '03 I show you where your website stands today in search and in AI answers. That report is yours either way.',
    '04 We talk about budget. Our entry price is $5,000 per month. Enterprise work usually runs $10,000 to $30,000 per month.',
    "05 If we're a fit, I send you a plan. If we're not, I'll tell you on the call.",
    '',
    'WORTH HAVING READY',
    '- Who looks after your website today, in-house or an agency.',
    "- How much of it you'd want us to take on.",
    "- What kind of help you're after.",
    '',
    'Anyone who decides on the website or the budget is welcome to join.',
    '',
    `Named results, live links, real dashboards - I'll bring them all to the call and walk you through what we'd do for ${p.company}.`,
    '',
    'If anything changes, just reply here.',
    '',
    'Arnel',
  ].join('\n');
}

export async function sendBookedCallEmail(input: BookedCallEmail): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[booked-call-email] RESEND_API_KEY not configured, skipping send');
      return;
    }

    const parts = buildParts(input.email, input.name, input.startTime, input.timeZone, input.company);
    if (!parts) {
      console.warn('[booked-call-email] no usable start time, skipping send');
      return;
    }

    let html = emailTemplate(input.fromAd);
    for (const [key, value] of Object.entries(parts)) {
      html = html.split(`{{${key}}}`).join(escapeHtml(value));
    }

    // A placeholder that survives means the template and this file drifted apart.
    // Sending it would put "{{first_name}}" in front of a lead, so stop instead.
    if (html.includes('{{')) {
      console.error('[booked-call-email] unfilled placeholder in rendered email, refusing to send');
      return;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Resend refuses a repeat of the same key, so a Cal.com retry or a
        // duplicate deploy invocation cannot send the lead a second copy.
        ...(input.bookingUid ? { 'Idempotency-Key': `booked-call-1-${input.bookingUid}` } : {}),
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.email],
        reply_to: REPLY_TO,
        subject: SUBJECT,
        html,
        text: plainText(parts),
      }),
    });

    if (!res.ok) {
      console.error(`[booked-call-email] Resend returned ${res.status}: ${await res.text()}`);
      return;
    }

    const sent = (await res.json()) as { id?: string };
    console.log(
      `[booked-call-email] sent ${sent.id} to ${input.email} for ${input.bookingUid} (${parts.company})`
    );
  } catch (error) {
    console.error('[booked-call-email] send failed', error);
  }
}
