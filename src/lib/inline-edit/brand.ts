/** The editor's brand colour and its tinted ground, shared by the shell and the mails. */
export const BRAND = '#4f46e5';
export const BRAND_TINT = '#eef2ff';

/** "arnel@loudface.co" → "Arnel", which is what a person calls themselves. */
export function firstName(email: string): string {
  const name = (email.split('@')[0] ?? '').split(/[._-]+/)[0] ?? '';
  return name ? name[0].toUpperCase() + name.slice(1) : 'you';
}
