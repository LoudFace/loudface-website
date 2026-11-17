/**
 * Tests for what the careers form files in the hiring app.
 *
 * Run with: npx tsx --test src/app/api/careers-apply/route.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCandidateRecord,
  buildRepeatApplicationUpdate,
  type CareersApplicationPayload,
  type ExistingCandidate,
} from './route';

const APPLIED_AT = new Date('2026-11-17T10:00:00.000Z');

function submission(overrides: Partial<CareersApplicationPayload> = {}): CareersApplicationPayload {
  return {
    name: 'Test Candidate',
    email: 'candidate@example.com',
    role: 'Designer',
    openingTitle: 'Landing Page Designer',
    linkedin: '',
    portfolio: 'example.com/work',
    loom: 'not a url',
    location: 'Sarajevo, Bosnia and Herzegovina',
    aboutYou: 'I design landing pages.',
    proofOfWork: '',
    workLinks: '',
    builtWithAI: '',
    heard: ['Our website', 'LinkedIn'],
    source: 'Behance',
    ...overrides,
  };
}

function existing(overrides: Partial<ExistingCandidate> = {}): ExistingCandidate {
  return { id: 'abc', stage: 'TALENT_POOL', timesApplied: 2, applicationAnswers: 'OLD ANSWERS', ...overrides };
}

describe('buildCandidateRecord', () => {
  it('files a new application as New, waiting on the screening agent', () => {
    const record = buildCandidateRecord(submission(), APPLIED_AT);

    assert.equal(record.stage, 'NEW');
    assert.equal(record.waitingOn, 'AGENT');
    assert.equal(record.timesApplied, 1);
  });

  it('turns the form labels into the hiring app option values', () => {
    const record = buildCandidateRecord(submission({ role: 'Project Manager' }), APPLIED_AT);

    assert.equal(record.hiringRole, 'PROJECT_MANAGER');
    assert.equal(record.source, 'BEHANCE');
    assert.equal(record.howHeard, 'Our website, LinkedIn');
  });

  it('names the opening they applied to, or says the role was their own choice', () => {
    assert.equal(
      buildCandidateRecord(submission(), APPLIED_AT).roleTagNote,
      'Applied to the opening "Landing Page Designer"',
    );
    assert.equal(
      buildCandidateRecord(submission({ openingTitle: null }), APPLIED_AT).roleTagNote,
      'Chose this role on the careers form',
    );
  });

  it('adds https to a bare link and leaves out a link that is not one', () => {
    const record = buildCandidateRecord(submission(), APPLIED_AT);

    assert.deepEqual(record.portfolio, { primaryLinkUrl: 'https://example.com/work', primaryLinkLabel: 'Portfolio' });
    assert.equal('applicationVideo' in record, false);
    assert.equal('linkedin' in record, false);
  });

  it('keeps the written answers under a dated heading', () => {
    const record = buildCandidateRecord(submission(), APPLIED_AT);

    assert.equal(
      record.applicationAnswers,
      '=== Application 2026-11-17 · Landing Page Designer ===\n\nAbout you:\nI design landing pages.',
    );
  });
});

describe('buildRepeatApplicationUpdate', () => {
  it('treats a record with no stage as reopened', () => {
    const update = buildRepeatApplicationUpdate(existing({ stage: null, timesApplied: null }), submission(), APPLIED_AT);

    assert.equal(update.stage, 'NEW');
    assert.equal(update.timesApplied, 2);
  });

  it('brings a past applicant back to New and counts the application', () => {
    const update = buildRepeatApplicationUpdate(existing(), submission(), APPLIED_AT);

    assert.equal(update.stage, 'NEW');
    assert.equal(update.waitingOn, 'AGENT');
    assert.equal(update.timesApplied, 3);
  });

  it('does not move someone who is already mid-process', () => {
    const update = buildRepeatApplicationUpdate(existing({ stage: 'CALL_BOOKED' }), submission(), APPLIED_AT);

    assert.equal('stage' in update, false);
    assert.equal('waitingOn' in update, false);
  });

  it('puts the new answers above the old ones and never rewrites name or email', () => {
    const update = buildRepeatApplicationUpdate(existing(), submission(), APPLIED_AT);

    assert.equal(
      update.applicationAnswers,
      '=== Application 2026-11-17 · Landing Page Designer ===\n\nAbout you:\nI design landing pages.\n\nOLD ANSWERS',
    );
    assert.equal('name' in update, false);
    assert.equal('email' in update, false);
  });
});
