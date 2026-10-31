/**
 * The /apply qualification rule and the Lead sent to Meta (lib/apply-qualify.ts, lib/meta-capi.ts). Run with
 * `npm run test:apply`. Nothing here reaches the network. A wrong rule books calls Arnel turned away or turns away
 * companies he wants; a wrong hash sends Meta a Lead it cannot match to anyone.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  REVENUE_BANDS, checkApplication, isValidEmail, isValidEventId, isValidName, normalizePhone, normalizeWebsite, qualifies,
} from '../apply-qualify';
import { buildLeadEvent } from '../meta-capi';
import applyContent from '../../data/content/apply.json';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');
const good = { revenue: '250k_500k', website: 'yourcompany.com', name: 'Sam Lee', email: 'Sam@YourCompany.com', phone: '+1 (415) 555-0134' };

test('under $100K a month is turned away; $100K and up qualifies', () => {
  assert.equal(qualifies('under_50k'), false);
  assert.equal(qualifies('50k_100k'), false);
  for (const id of ['100k_250k', '250k_500k', '500k_1m', '1m_plus']) assert.equal(qualifies(id), true, id);
  assert.equal(qualifies('anything else'), false);
  assert.equal(qualifies(undefined), false);
});

test('every band has its label in apply.json, in the same order', () => {
  assert.equal(applyContent.card.revenue.options.length, REVENUE_BANDS.length);
  assert.deepEqual(applyContent.card.revenue.options.map((o) => o.label), ['Under $50K', '$50K-$100K', '$100K-$250K', '$250K-$500K', '$500K-$1M', '$1M+']);
});

test('the server refuses an unqualified band before reading anything else', () => {
  assert.deepEqual(checkApplication({ ...good, revenue: '50k_100k' }), { ok: false, reason: 'not_qualified' });
  assert.deepEqual(checkApplication({ ...good, revenue: 'nope' }), { ok: false, reason: 'revenue' });
});

test('a full application comes back normalised', () => {
  const r = checkApplication(good);
  assert.ok(r.ok);
  assert.deepEqual(r.answers, { revenue: '250k_500k', website: 'https://yourcompany.com', name: 'Sam Lee', email: 'sam@yourcompany.com', phone: '+14155550134' });
});

test('websites: bare domains, www and paths are fine; junk is not', () => {
  assert.equal(normalizeWebsite('https://www.YourCompany.com/about/'), 'https://yourcompany.com/about');
  assert.equal(normalizeWebsite('sub.example.co.uk'), 'https://sub.example.co.uk');
  for (const bad of ['', 'not a site', 'localhost', 'ftp://x.com', 'https://user:pw@x.com', 'javascript:alert(1)', 'x']) assert.equal(normalizeWebsite(bad), null, bad);
});

test('names, emails and phones', () => {
  assert.ok(isValidName('Sam Lee'));
  assert.ok(!isValidName(' '));
  assert.ok(!isValidName('12'));
  assert.ok(isValidEmail('sam@yourcompany.com'));
  for (const bad of ['sam', 'sam@', 'sam@company', 'a b@c.com']) assert.ok(!isValidEmail(bad), bad);
  assert.equal(normalizePhone('+44 20 7946 0958'), '+442079460958');
  assert.equal(normalizePhone('415 555 0134'), null, 'a country code is required');
  assert.equal(normalizePhone('+1 555'), null, 'too short');
  assert.equal(normalizePhone('+1 415 555 0134 ext 2'), null, 'letters are refused');
});

test('event ids', () => {
  assert.ok(isValidEventId('apply_0f8c1f2e-6a3b-4f61-9b7e-2d1c5a9e8b10'));
  assert.ok(!isValidEventId('cal_booking_x'));
  assert.ok(!isValidEventId('apply_<script>'));
});

test('the Lead carries hashes only, the shared event id, and the test code when set', () => {
  const body = buildLeadEvent({
    eventId: 'apply_abc12345', eventTime: 1_800_000_000.7, email: ' Sam@YourCompany.com ', phone: '+1 (415) 555-0134', name: 'Sam Van Lee',
    fbp: 'fb.1.1.2', fbc: 'fb.1.1.abc', clientIp: '203.0.113.9', userAgent: 'UA',
  }, 'TEST123');
  const e = body.data[0];
  assert.equal(e.event_name, 'Lead');
  assert.equal(e.event_id, 'apply_abc12345');
  assert.equal(e.event_time, 1_800_000_000);
  assert.equal(e.action_source, 'website');
  assert.equal(e.event_source_url, 'https://www.loudface.co/apply');
  assert.equal(e.user_data.em, sha('sam@yourcompany.com'));
  assert.equal(e.user_data.ph, sha('14155550134'));
  assert.equal(e.user_data.fn, sha('sam'));
  assert.equal(e.user_data.ln, sha('van lee'));
  assert.equal(e.user_data.fbp, 'fb.1.1.2');
  assert.equal(e.user_data.fbc, 'fb.1.1.abc');
  assert.equal(body.test_event_code, 'TEST123');
  const raw = JSON.stringify(body);
  for (const plain of ['sam@yourcompany.com', 'Sam', '4155550134']) assert.ok(!raw.includes(plain), `no plain ${plain}`);
});

test('no test code, no test_event_code; no cookies, no fbp/fbc keys', () => {
  const body = buildLeadEvent({ eventId: 'apply_abc12345', eventTime: 1, email: 'a@b.co', phone: '+14155550134', name: 'A' });
  assert.equal('test_event_code' in body, false);
  assert.deepEqual(Object.keys(body.data[0].user_data).sort(), ['em', 'fn', 'ph']);
});
