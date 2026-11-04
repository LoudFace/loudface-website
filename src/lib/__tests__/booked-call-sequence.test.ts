/**
 * When the pre-call emails go out (lib/booked-call-sequence.ts) and what they say
 * (lib/booked-call-sequence-emails.ts). Run with `npm run test:booked-call-sequence`. Nothing here
 * reaches the network. A wrong plan emails a lead at 3am, twice, or after their call.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { leadFor, planFor, toLeadBooking, verticalOf, type LeadBooking } from '../booked-call-sequence';
import { SEQUENCE_EMAILS, quotesFor } from '../booked-call-sequence-emails';

// The first Meta lead: booked Tue 3 Nov 15:51 Los Angeles, call Sat 14 Nov 09:30.
const josh: LeadBooking = {
  uid: 'u1', email: 'josh@example.com', name: 'Josh', startTime: '2026-11-14T17:30:00.000Z',
  timeZone: 'America/Los_Angeles', bookedAt: '2026-11-03T23:51:26.610Z',
  company: 'https://accidentaldefenders.com', src: 'https://www.loudface.co/apply/legal',
  joinUrl: 'https://meet.google.com/abc-defg-hij',
};
const la = (d: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Los_Angeles', weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);

test('an 11-day booking gets all five emails, nurture on weekday mornings', () => {
  const plan = planFor(josh, new Date(josh.bookedAt));
  assert.deepEqual(plan.map((s) => `${s.n} ${la(s.sendAt)}`), [
    '2 Wed 4, 09:00', '3 Mon 9, 09:00', '4 Thu 12, 09:00', '5 Fri 13, 09:30', '6 Sat 14, 08:30',
  ]);
});

test('a booking made before the switch-on starts its plan at the switch-on', () => {
  const plan = planFor(josh, new Date('2026-11-05T06:00:00Z'));
  assert.equal(la(plan[0].sendAt), 'Thu 5, 09:00');
});

test('a call tomorrow gets only the one-hour reminder', () => {
  const b = { ...josh, bookedAt: '2026-11-13T20:00:00Z' };
  assert.deepEqual(planFor(b, new Date(b.bookedAt)).map((s) => s.n), [6]);
});

test('a call three days out gets who-you-are-meeting and both reminders', () => {
  const b = { ...josh, bookedAt: '2026-11-11T16:00:00Z' };
  assert.deepEqual(planFor(b, new Date(b.bookedAt)).map((s) => s.n), [2, 5, 6]);
});

test('a moved call gets the reminders only', () => {
  const b = { ...josh, rescheduled: true };
  assert.deepEqual(planFor(b, new Date(b.bookedAt)).map((s) => s.n), [5, 6]);
});

test('every email window closes before the call starts', () => {
  for (const s of planFor(josh, new Date(josh.bookedAt))) assert.ok(s.until < new Date(josh.startTime));
});

test('the page decides the case study', () => {
  assert.equal(verticalOf('https://www.loudface.co/apply/legal?utm_source=facebook'), 'legal');
  assert.equal(verticalOf('https://www.loudface.co/apply/saas'), 'saas');
  assert.equal(verticalOf('https://www.loudface.co/apply'), 'info');
  assert.equal(verticalOf(undefined), 'site');
});

test('a typed website reads as its host, and every email renders with no placeholder or em dash', () => {
  const lead = leadFor(josh)!;
  assert.equal(lead.site, 'accidentaldefenders.com');
  assert.equal(lead.tzLabel, '(PST, your time)');
  for (const make of Object.values(SEQUENCE_EMAILS)) {
    const e = make(lead);
    assert.ok(!e.html.includes('{{') && !e.text.includes('{{'));
    assert.ok(!/[—–]/.test(e.html + e.text + e.subject), `dash in ${e.subject}`);
  }
});

test('no email in any vertical mentions the guarantee, and every image it uses is in public/email/precall', () => {
  const lead = leadFor(josh)!;
  for (const vertical of ['legal', 'saas', 'info', 'site'] as const) {
    for (const make of Object.values(SEQUENCE_EMAILS)) {
      const e = make({ ...lead, vertical });
      assert.ok(!/3&times;|3×|3x your|guarantee|for free/i.test(e.html + e.text + e.subject), `guarantee in ${vertical} ${e.subject}`);
      for (const [, file] of e.html.matchAll(/https:\/\/www\.loudface\.co\/email\/precall\/([\w.-]+)/g)) {
        assert.ok(existsSync(join(process.cwd(), 'public/email/precall', file)), `missing image ${file}`);
      }
    }
  }
});

test('email 4 never repeats the quote from email 3', () => {
  assert.ok(!quotesFor('saas').some((q) => q.id === 'kevin'));
  assert.ok(!quotesFor('site').some((q) => q.id === 'kenneth'));
  assert.equal(quotesFor('legal').length, 3);
});

test('only accepted intro calls from outside LoudFace come back from Cal.com as leads', () => {
  const cal = {
    uid: 'c1', status: 'accepted', start: josh.startTime, createdAt: josh.bookedAt, eventTypeId: 7718812,
    eventType: { slug: 'loudface-intro-call-apply' }, attendees: [{ name: 'Josh', email: 'Josh@Example.com', timeZone: 'America/Los_Angeles' }],
    bookingFieldsResponses: { website: 'https://accidentaldefenders.com' }, metadata: { src: 'https://www.loudface.co/apply/legal' },
    meetingUrl: 'https://meet.google.com/abc-defg-hij', rescheduledFromUid: null,
  };
  const b = toLeadBooking(cal)!;
  assert.equal(b.email, 'josh@example.com');
  assert.equal(b.company, 'https://accidentaldefenders.com');
  assert.equal(b.rescheduled, false);
  assert.equal(toLeadBooking({ ...cal, rescheduledFromUid: 'old' })!.rescheduled, true);
  assert.equal(toLeadBooking({ ...cal, eventTypeId: 1, eventType: { slug: 'quick-chat-with-arnel' } }), null);
  assert.equal(toLeadBooking({ ...cal, status: 'cancelled' }), null);
  assert.equal(toLeadBooking({ ...cal, attendees: [{ name: 'Arnel', email: 'arnel@loudface.co' }] }), null);
  assert.equal(toLeadBooking({ ...cal, attendees: [{ name: 'Test (ignore)', email: 'a@b.com' }] }), null);
});
