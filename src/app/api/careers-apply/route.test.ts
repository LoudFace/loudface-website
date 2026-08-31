/**
 * Tests for the candidate property payload.
 *
 * Run with: npx tsx --test src/app/api/careers-apply/route.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCandidateProperties,
  type CareersApplicationPayload,
} from './route';

const OPENING_ID = '10fb6339-4d10-8061-b0ce-f0594b2b8d6b';

function submission(openingId: string | null): CareersApplicationPayload {
  return {
    name: 'Test Candidate',
    email: 'candidate@example.com',
    role: 'Designer',
    openingId,
    linkedin: '',
    portfolio: 'https://example.com',
    loom: '',
    location: 'Sarajevo, Bosnia and Herzegovina',
    aboutYou: '',
    proofOfWork: '',
    workLinks: '',
    builtWithAI: '',
    heard: ['Our website'],
    source: 'Inbound form',
  };
}

describe('buildCandidateProperties', () => {
  it('stores the exact opening relation and broad role', () => {
    const properties = buildCandidateProperties(submission(OPENING_ID));

    assert.deepEqual(properties.Opening, { relation: [{ id: OPENING_ID }] });
    assert.deepEqual(properties.Role, { select: { name: 'Designer' } });
  });

  it('marks every new application as waiting on the screening agent', () => {
    const properties = buildCandidateProperties(submission(OPENING_ID));

    assert.deepEqual(properties['Waiting on'], { select: { name: 'Agent' } });
    assert.deepEqual(properties.Stage, { select: { name: 'New' } });
  });

  it('keeps generic applications valid without an Opening relation', () => {
    const properties = buildCandidateProperties(submission(null));

    assert.equal('Opening' in properties, false);
    assert.deepEqual(properties.Role, { select: { name: 'Designer' } });
  });
});
