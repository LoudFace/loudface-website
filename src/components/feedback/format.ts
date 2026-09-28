const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const DAY_TIME = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** "28 Sept 2026". A bare YYYY-MM-DD is read as that calendar day, not UTC midnight. */
export function formatDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? value : DAY.format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DAY_TIME.format(date);
}

/** "/" reads as "Homepage"; no page at all is a general request. */
export function pageLabel(path: string | undefined | null): string {
  if (!path) return 'General request';
  return path === '/' ? 'Homepage' : path;
}
