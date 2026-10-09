/**
 * Weekly sums of the daily Search Console points the case studies publish (indexed, never raw), shared by the homepage
 * tiles and the case pages so both draw the same weekly series.
 */

export function isoWeekKey(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - first.getTime()) / 86400000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
}

/** Weekly sums of a daily series (ISO weeks, Monday start); a week with fewer than seven days is dropped. */
export function weekly(points: { date?: string; clicks: number }[], from: string, to: string) {
  const byWeek = new Map<string, { date: string; total: number; days: number }>();
  for (const p of points) {
    if (!p.date || p.date < from || p.date > to) continue;
    const k = isoWeekKey(p.date);
    const row = byWeek.get(k) ?? { date: p.date, total: 0, days: 0 };
    row.total += p.clicks;
    row.days += 1;
    byWeek.set(k, row);
  }
  const rows = [...byWeek.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([, r]) => r).filter((r) => r.days === 7);
  return { dates: rows.map((r) => r.date), values: rows.map((r) => r.total) };
}

/**
 * Google clicks a week, indexed to the week the engagement began (its Monday-start ISO week = 100), with the index of
 * the highest week: the series behind a "clicks per week, week the work began → its best week" headline.
 */
export function clicksPerWeek(points: { date?: string; clicks: number }[], engagementStart: string) {
  const days = points.filter((p) => p.date);
  const raw = weekly(days, days[0]?.date ?? '', days.at(-1)?.date ?? '');
  const base = raw.values[raw.dates.findIndex((d) => isoWeekKey(d) === isoWeekKey(engagementStart))];
  if (!base) return null;
  const values = raw.values.map((v) => (v / base) * 100);
  return { dates: raw.dates, values, peak: values.indexOf(Math.max(...values)) };
}
