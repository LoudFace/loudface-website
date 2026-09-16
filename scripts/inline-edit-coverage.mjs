#!/usr/bin/env node
/**
 * Inline editing coverage check.
 *
 * Answers one question: which values in the content files can a client not
 * reach on the site? A value goes missing when code splits, slices or rewrites
 * a string before it renders, which strips its marker. That failure is silent
 * in the browser, so this check makes it loud.
 *
 * Usage:  node scripts/inline-edit-coverage.mjs [--base https://host] [routes...]
 * Exit code 1 when a value that should be editable is not found on any route.
 */
import { createHmac } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'data', 'content');
const START = '\u{E0001}';
const BASE_CHAR = 0xe0000;

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base');
const base = baseIndex === -1 ? 'https://lf-inline.localhost:1355' : args[baseIndex + 1];
const routes = args.filter((a, i) => !a.startsWith('--') && !(baseIndex !== -1 && i === baseIndex + 1));

// Same rules the server uses when it decides what to mark.
const IMAGE_PATH = /^\/[^\s?]+\.(?:webp|png|jpe?g|svg|avif|gif)$/i;
const ADDRESS = /^(?:https?:|mailto:|tel:|#|\/)/i;
const MACHINE_KEY =
  /(^|[._-])(id|ids|slug|slugs|key|keys|class|className|variant|type|color|colour|width|height|order|rank|target|rel|name|icon)$/i;
const ATTRIBUTE_KEY = /(arialabel|aria|alt|placeholder|tooltip|srlabel|srtext|datatestid)$/i;

function expectedIds(file, value, trail = []) {
  const out = [];
  if (typeof value === 'string') {
    const key = trail[trail.length - 1] ?? '';
    if (MACHINE_KEY.test(key) || ATTRIBUTE_KEY.test(key)) return out;
    if (IMAGE_PATH.test(value)) return [`${file}:${trail.join('.')}`];
    if (ADDRESS.test(value)) return out;
    if (!value.trim()) return out;
    return [`${file}:${trail.join('.')}`];
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => out.push(...expectedIds(file, item, [...trail, String(i)])));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) out.push(...expectedIds(file, item, [...trail, key]));
  }
  return out;
}

function decodeAll(html) {
  const found = new Set();
  let index = html.indexOf(START);
  while (index !== -1) {
    let id = '';
    for (const char of html.slice(index + START.length)) {
      const code = char.codePointAt(0);
      if (code < BASE_CHAR + 0x20 || code > BASE_CHAR + 0x7e) break;
      id += String.fromCodePoint(code - BASE_CHAR);
    }
    if (id) found.add(id);
    index = html.indexOf(START, index + 1);
  }
  for (const match of html.matchAll(/[?&]lf=([^"'&\s]+)/g)) {
    found.add(decodeURIComponent(match[1]));
  }
  return found;
}

async function main() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // local proxy certificate

  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  const expected = new Map();
  for (const file of files) {
    const name = file.replace(/\.json$/, '');
    const json = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
    for (const id of expectedIds(name, json)) expected.set(id, name);
  }

  // Sign in the way the editor does, with a token this script mints itself.
  const env = await readFile('.env.local', 'utf8').catch(() => '');
  const secret = /^LF_EDIT_SECRET=(.+)$/m.exec(env)?.[1]?.trim();
  const editor = /^LF_EDITOR_EMAILS=([^,\n]+)/m.exec(env)?.[1]?.trim();
  if (!secret || !editor) {
    console.error('Set LF_EDIT_SECRET and LF_EDITOR_EMAILS in .env.local first.');
    process.exit(2);
  }
  const payload = `signin.${editor.toLowerCase()}.${Date.now() + 600_000}`;
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  const token = `${Buffer.from(payload).toString('base64url')}.${signature}`;

  const verify = await fetch(`${base}/api/lf-edit/verify?token=${token}`, { redirect: 'manual' });
  const cookie = (verify.headers.getSetCookie?.() ?? [])
    .map((entry) => entry.split(';')[0])
    .join('; ');
  if (!cookie.includes('lf_edit_session')) {
    console.error('Could not sign in. Is the dev server running at', base, '?');
    process.exit(2);
  }

  const seen = new Set();
  const scanned = routes.length ? routes : ['/', '/seo-for', '/pricing', '/about', '/contact'];
  for (const route of scanned) {
    const response = await fetch(`${base}${route}`, { headers: { cookie } });
    if (!response.ok) {
      console.error(`  ${route} -> HTTP ${response.status}`);
      continue;
    }
    const ids = decodeAll(await response.text());
    ids.forEach((id) => seen.add(id));
    console.log(`  ${route} -> ${ids.size} editable values`);
  }

  const missing = [...expected.keys()].filter((id) => !seen.has(id));
  const byFile = new Map();
  for (const id of missing) {
    const file = expected.get(id);
    byFile.set(file, (byFile.get(file) ?? 0) + 1);
  }

  console.log(`\n${expected.size} values in content files, ${seen.size} reachable on the scanned routes.`);
  if (!missing.length) {
    console.log('Every value is editable on the pages scanned.');
    return;
  }
  console.log('\nNot reachable (a page that renders it was not scanned, or its marker was stripped):');
  for (const [file, count] of [...byFile].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${file.padEnd(28)} ${count}`);
  }
  console.log('\nFirst 15:');
  missing.slice(0, 15).forEach((id) => console.log(`  ${id}`));
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
