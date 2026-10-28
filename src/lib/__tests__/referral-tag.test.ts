/**
 * The first-touch tracking tag every Cal.com booking carries (lib/referral-tag.ts). Run with
 * `npm run test:referral`. Nothing here reaches the network. The Team App's Social reviewer approves a discovery
 * call only when the booking's lf_tag equals the player's tag, so a tag that is mangled here is a call nobody can
 * claim, and one that lets a page path through is a call anybody can.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cleanReferralTag } from '../referral-tag';

test('keeps a team tag, lowercased and trimmed', () => {
  assert.equal(cleanReferralTag('andrea'), 'andrea');
  assert.equal(cleanReferralTag(' Rezwan '), 'rezwan');
  assert.equal(cleanReferralTag('lf-test_2'), 'lf-test_2');
});

test('drops what is not a tag', () => {
  for (const value of [null, undefined, '', '/', '/pricing', 'a b', '<script>', 'x'.repeat(41), '-andrea', 'andrea@x.co']) {
    assert.equal(cleanReferralTag(value), undefined, String(value));
  }
});

test('the proxy keeps the first tag only, and both bookers send it', () => {
  const proxy = readFileSync(new URL('../../proxy.ts', import.meta.url), 'utf8');
  assert.match(proxy, /request\.cookies\.has\(REFERRAL_TAG_COOKIE\)/);
  for (const file of ['../../components/CalHandler.tsx', '../../app/home-v11/CalEmbed.tsx']) {
    assert.match(readFileSync(new URL(file, import.meta.url), 'utf8'), /'metadata\[lf_tag\]'|"metadata\[lf_tag\]"/, file);
  }
});
