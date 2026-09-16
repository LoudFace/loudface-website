/**
 * Inline editing markers — prototype, 2026-09-16.
 *
 * A server helper that tags a rendered value with the content path it came
 * from, but only while Draft Mode is on. Anonymous visitors get the same HTML
 * they always did: no attributes, no editor, no cost.
 *
 * Usage in a server component:
 *   const edit = await editor('seo-for-hub');
 *   <p {...edit('hero.description')}>{content.hero.description}</p>
 */
import { draftMode } from 'next/headers';

export type EditMark = Record<string, string>;

export async function editor(file: string) {
  const { isEnabled } = await draftMode();
  return (path: string, type: 'text' | 'html' | 'image' | 'link' = 'text'): EditMark =>
    isEnabled ? { 'data-lf-id': `${file}:${path}`, 'data-lf-type': type } : {};
}

export async function isEditing(): Promise<boolean> {
  const { isEnabled } = await draftMode();
  return isEnabled;
}
