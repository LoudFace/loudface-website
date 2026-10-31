/**
 * The Slack-approved Schedule event (lib/meta-approval.ts). Run with `npm run test:meta-approval`. Nothing here
 * reaches the network. A wrong signature check lets anyone send conversions to Meta; a wrong hash sends Meta data
 * it cannot match; a button value over Slack's 2,000 characters makes the whole card fail to post.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { approvalBlocks, isTooOld, MAX_EVENT_AGE_SECONDS, parsePrepared, prepareSchedule, verifySlackSignature } from '../meta-approval';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');

test('hashes normalised email, phone digits and both name parts', () => {
  const p = prepareSchedule({ bookingUid: 'abc', bookedAt: 1_800_000_000.9, email: ' Pat@Example.COM ', phone: '+1 (415) 555-0100', name: 'Pat Van Dyke' });
  assert.equal(p.id, 'cal_booking_abc');
  assert.equal(p.t, 1_800_000_000);
  assert.equal(p.em, sha('pat@example.com'));
  assert.equal(p.ph, sha('14155550100'));
  assert.equal(p.fn, sha('pat'));
  assert.equal(p.ln, sha('van dyke'));
});

test('leaves out what the booking did not give', () => {
  const p = prepareSchedule({ bookingUid: 'x', bookedAt: 1, email: 'a@b.co' });
  assert.deepEqual(Object.keys(p).sort(), ['em', 'id', 't']);
});

test('the button value round-trips and stays under Slack limits', () => {
  const p = prepareSchedule({ bookingUid: 'u'.repeat(30), bookedAt: 1, email: 'a@b.co', phone: '123', name: 'A B', fbp: 'fb.1.1700000000000.1234567890', fbc: 'fb.1.1700000000000.' + 'x'.repeat(200) });
  const blocks = approvalBlocks({ name: 'A B' }, p);
  const actions = blocks.find((b) => b.type === 'actions') as { elements: { value?: string }[] };
  const value = actions.elements[0].value!;
  assert.ok(value.length < 2000, `value is ${value.length} characters`);
  assert.deepEqual(parsePrepared(value), p);
});

test('refuses a value that is not a prepared booking event', () => {
  for (const v of ['', 'nope', '{}', '{"id":"other","t":1}', '{"id":"cal_booking_x","t":"soon"}']) assert.equal(parsePrepared(v), undefined, v);
});

test('a booking older than 7 days is too old for Meta', () => {
  const now = 1_800_000_000;
  assert.equal(isTooOld({ id: 'cal_booking_a', t: now - MAX_EVENT_AGE_SECONDS }, now), false);
  assert.equal(isTooOld({ id: 'cal_booking_a', t: now - MAX_EVENT_AGE_SECONDS - 1 }, now), true);
});

test('accepts only a fresh request signed with the secret', () => {
  const secret = 'test-secret';
  const body = 'payload=%7B%7D';
  const now = 1_800_000_000;
  const sign = (ts: number, b = body, s = secret) => `v0=${createHmac('sha256', s).update(`v0:${ts}:${b}`).digest('hex')}`;
  assert.equal(verifySlackSignature(body, String(now), sign(now), secret, now), true);
  assert.equal(verifySlackSignature(body, String(now), sign(now, body, 'other'), secret, now), false);
  assert.equal(verifySlackSignature(body + 'x', String(now), sign(now), secret, now), false);
  assert.equal(verifySlackSignature(body, String(now - 301), sign(now - 301), secret, now), false);
  assert.equal(verifySlackSignature(body, null, sign(now), secret, now), false);
  assert.equal(verifySlackSignature(body, String(now), null, secret, now), false);
});
