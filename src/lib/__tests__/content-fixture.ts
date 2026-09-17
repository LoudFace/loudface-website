/**
 * The real content files, read off disk for the inline-edit tests.
 *
 * Not a test itself. It walks `src/data/content/*.json` exactly the way
 * `markValue` does, so the tests can ask "what id would the site put on this
 * value?" and check it against the code that has to accept it again.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ADDRESS, IMAGE_PATH, idFor, isSkippedKey } from '../inline-edit/mark-tree';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'data', 'content');

export type ContentFile = { file: string; name: string; raw: string; data: unknown };

/** Why a value carries no id a client can click. */
export type SkipReason = 'key' | 'address' | 'empty';

export type MarkableValue = { file: string; id: string; path: string[]; value: string; image: boolean };
export type SkippedValue = { file: string; path: string[]; value: string; reason: SkipReason };

export function contentFiles(): ContentFile[] {
  return readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const raw = readFileSync(path.join(CONTENT_DIR, name), 'utf8');
      return { file: name.replace(/\.json$/, ''), name, raw, data: JSON.parse(raw) };
    });
}

/** Every string in one file, split into the ones the site marks and the ones it leaves alone. */
export function collect(file: ContentFile): { markable: MarkableValue[]; skipped: SkippedValue[] } {
  const markable: MarkableValue[] = [];
  const skipped: SkippedValue[] = [];

  const walk = (value: unknown, trail: string[]): void => {
    if (typeof value === 'string') {
      const key = trail[trail.length - 1] ?? '';
      if (isSkippedKey(key)) {
        skipped.push({ file: file.file, path: trail, value, reason: 'key' });
        return;
      }
      if (IMAGE_PATH.test(value)) {
        markable.push({ file: file.file, id: idFor(file.file, trail), path: trail, value, image: true });
        return;
      }
      if (ADDRESS.test(value)) {
        skipped.push({ file: file.file, path: trail, value, reason: 'address' });
        return;
      }
      if (!value.trim()) {
        skipped.push({ file: file.file, path: trail, value, reason: 'empty' });
        return;
      }
      markable.push({ file: file.file, id: idFor(file.file, trail), path: trail, value, image: false });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, [...trail, String(i)]));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) walk(item, [...trail, key]);
    }
  };

  walk(file.data, []);
  return { markable, skipped };
}
