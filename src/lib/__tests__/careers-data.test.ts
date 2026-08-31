/**
 * Tests for the exact-opening trust boundary.
 *
 * Run with: npx tsx --test src/lib/__tests__/careers-data.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fetchApplicationOpening } from '../careers-data';

const OPENING_ID = '10fb6339-4d10-8061-b0ce-f0594b2b8d6b';
const OPENINGS_DATABASE_ID = '2abb6339-4d10-80a3-8b88-d1f1cad2b02e';

function notionPage({
  status = 'Open',
  role = 'Designer',
  databaseId = OPENINGS_DATABASE_ID,
}: {
  status?: string;
  role?: string;
  databaseId?: string;
} = {}) {
  return {
    id: OPENING_ID,
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ plain_text: 'Landing Page Designer' }] },
      Role: { select: { name: role } },
      'Opening status': { status: { name: status } },
    },
  };
}

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('fetchApplicationOpening', () => {
  it('returns generic without calling Notion when no opening is supplied', async () => {
    let calls = 0;
    const result = await fetchApplicationOpening(null, {
      apiKey: 'test',
      fetchImpl: async () => {
        calls++;
        return jsonResponse({});
      },
    });

    assert.deepEqual(result, { status: 'generic' });
    assert.equal(calls, 0);
  });

  it('derives the exact title and broad role from an open Notion row', async () => {
    const result = await fetchApplicationOpening(OPENING_ID.replaceAll('-', ''), {
      apiKey: 'test',
      fetchImpl: async () => jsonResponse(notionPage()),
    });

    assert.deepEqual(result, {
      status: 'open',
      opening: {
        id: OPENING_ID,
        title: 'Landing Page Designer',
        roleKey: 'Designer',
      },
    });
  });

  it('rejects a paused opening', async () => {
    const result = await fetchApplicationOpening(OPENING_ID, {
      apiKey: 'test',
      fetchImpl: async () => jsonResponse(notionPage({ status: 'Paused' })),
    });

    assert.deepEqual(result, { status: 'closed' });
  });

  it('rejects a page from another database', async () => {
    const result = await fetchApplicationOpening(OPENING_ID, {
      apiKey: 'test',
      fetchImpl: async () => jsonResponse(notionPage({ databaseId: '11111111-1111-1111-1111-111111111111' })),
    });

    assert.deepEqual(result, { status: 'closed' });
  });

  it('rejects a malformed id without calling Notion', async () => {
    let calls = 0;
    const result = await fetchApplicationOpening('designer', {
      apiKey: 'test',
      fetchImpl: async () => {
        calls++;
        return jsonResponse({});
      },
    });

    assert.deepEqual(result, { status: 'closed' });
    assert.equal(calls, 0);
  });

  it('retries one rate limit and then resolves the opening', async () => {
    let calls = 0;
    const result = await fetchApplicationOpening(OPENING_ID, {
      apiKey: 'test',
      fetchImpl: async () => {
        calls++;
        return calls === 1
          ? jsonResponse({ message: 'rate limited' }, 429, { 'retry-after': '0' })
          : jsonResponse(notionPage());
      },
    });

    assert.equal(calls, 2);
    assert.equal(result.status, 'open');
  });
});
