// Renders a booking's pre-call emails and their send times as JSON, for a review page. Never sends.
//   SINCE=<switch-on ISO> npx tsx scripts/booked-call-sequence-preview.ts <out.json> [bookingJson]
// bookingJson: a LeadBooking. Without one, a sample /apply/legal booking.
import { writeFileSync } from 'node:fs';
import { leadFor, planFor, verticalOf, type LeadBooking } from '../src/lib/booked-call-sequence';
import { SEQUENCE_EMAILS, email3 } from '../src/lib/booked-call-sequence-emails';

const out = process.argv[2] ?? 'booked-call-sequence-preview.json';
const b: LeadBooking = process.argv[3]
  ? JSON.parse(process.argv[3])
  : { uid: 'sample', email: 'sam@example.com', name: 'Sam Lee', startTime: '2026-11-14T17:30:00Z', timeZone: 'America/Los_Angeles', bookedAt: '2026-11-03T23:51:26Z', company: 'https://example.com', src: 'https://www.loudface.co/apply/legal', joinUrl: 'https://meet.google.com/abc-defg-hij' };
const since = process.env.SINCE ? new Date(process.env.SINCE) : new Date(b.bookedAt);
const lead = leadFor(b)!;
const zone = b.timeZone || 'UTC';
const when = (d: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);

const plan = planFor(b, since);
const rows = plan.map((s) => {
  const e = SEQUENCE_EMAILS[s.n](lead);
  return { n: s.n, at: when(s.sendAt), subject: e.subject, preheader: e.preheader, html: e.html };
});
const variants = (['info', 'saas', 'site'] as const).filter((v) => v !== verticalOf(b.src)).map((v) => ({ v, e: email3({ ...lead, vertical: v }) }));
writeFileSync(out, JSON.stringify({ lead, booked: when(new Date(b.bookedAt)), call: when(new Date(b.startTime)), zone, rows, variants: variants.map(({ v, e }) => ({ v, subject: e.subject, preheader: e.preheader, html: e.html })) }, null, 1));
console.log(`wrote ${out}: ${rows.map((r) => `#${r.n} ${r.at}`).join(' | ')}`);
