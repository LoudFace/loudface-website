/**
 * Inline editing write endpoint — prototype, 2026-09-16.
 *
 * Takes one edited value and writes it back into the JSON file it came from.
 * In this prototype the write goes straight to the working copy on disk, which
 * is what makes the loop visible in development. In production the same handler
 * would commit the file through a GitHub App installation token instead.
 *
 * It refuses everything it has not been told to accept: not in Draft Mode, not
 * a known content file, not an existing string path, not a plain string value.
 */
import { draftMode } from 'next/headers';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'data', 'content');
const FILE_NAME = /^[a-z0-9-]+$/;
const PATH_SEGMENT = /^[A-Za-z0-9_]+$/;
const BR = '@@LF_BR@@';

/** Only <br> survives; every other tag is stripped rather than escaped. */
function clean(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, BR)
    .replace(/<[^>]*>/g, '')
    .replace(new RegExp(BR, 'g'), '<br>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function walk(
  root: unknown,
  segments: string[],
): { parent: Record<string, unknown>; key: string } | null {
  let node: unknown = root;
  for (let i = 0; i < segments.length - 1; i++) {
    if (typeof node !== 'object' || node === null) return null;
    node = (node as Record<string, unknown>)[segments[i]];
  }
  const key = segments[segments.length - 1];
  if (typeof node !== 'object' || node === null) return null;
  const parent = node as Record<string, unknown>;
  return key in parent ? { parent, key } : null;
}

export async function POST(request: Request) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return Response.json({ error: 'Draft Mode is off' }, { status: 403 });
  if (process.env.NODE_ENV === 'production') {
    return Response.json(
      { error: 'Prototype writes to disk; not available in production' },
      { status: 404 },
    );
  }

  let body: { id?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body is not JSON' }, { status: 400 });
  }
  if (typeof body.id !== 'string' || typeof body.value !== 'string') {
    return Response.json({ error: 'id and value must be strings' }, { status: 400 });
  }
  if (body.value.length > 4000) {
    return Response.json({ error: 'Value too long' }, { status: 400 });
  }

  const [file, fieldPath] = body.id.split(':');
  if (!file || !fieldPath || !FILE_NAME.test(file)) {
    return Response.json({ error: 'Bad id' }, { status: 400 });
  }
  const segments = fieldPath.split('.');
  if (!segments.length || !segments.every((s) => PATH_SEGMENT.test(s))) {
    return Response.json({ error: 'Bad field path' }, { status: 400 });
  }

  const filePath = path.join(CONTENT_DIR, `${file}.json`);
  if (!filePath.startsWith(CONTENT_DIR + path.sep)) {
    return Response.json({ error: 'Outside the content directory' }, { status: 400 });
  }

  let raw: string;
  let json: unknown;
  try {
    raw = await readFile(filePath, 'utf8');
    json = JSON.parse(raw);
  } catch {
    return Response.json({ error: `No content file ${file}.json` }, { status: 404 });
  }

  const target = walk(json, segments);
  if (!target) return Response.json({ error: 'That field does not exist' }, { status: 400 });
  if (typeof target.parent[target.key] !== 'string') {
    return Response.json({ error: 'Only string fields are editable' }, { status: 400 });
  }

  const before = target.parent[target.key] as string;
  const after = clean(body.value);
  if (!after) return Response.json({ error: 'Value is empty' }, { status: 400 });
  if (after === before) return Response.json({ ok: true, unchanged: true });

  // Replace the one value in the file's own text. Re-serialising the whole
  // document would reformat every compact line in it and turn a one-word copy
  // change into a 20-line diff nobody can review.
  const needle = `${JSON.stringify(target.key)}: ${JSON.stringify(before)}`;
  const replacement = `${JSON.stringify(target.key)}: ${JSON.stringify(after)}`;
  const first = raw.indexOf(needle);
  const unique = first !== -1 && raw.indexOf(needle, first + 1) === -1;

  let next: string;
  if (unique) {
    next = raw.slice(0, first) + replacement + raw.slice(first + needle.length);
    JSON.parse(next); // never write a file we cannot read back
  } else {
    target.parent[target.key] = after;
    next = JSON.stringify(json, null, 2) + '\n';
  }
  await writeFile(filePath, next, 'utf8');

  return Response.json({
    ok: true,
    file: `${file}.json`,
    path: fieldPath,
    before,
    after,
    surgical: unique,
  });
}
