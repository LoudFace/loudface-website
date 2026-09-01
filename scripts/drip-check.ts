// Renders the booked-call email with sample values and asserts nothing is missing.
// Run with: npx tsx scripts/drip-check.ts
import { BOOKED_CALL_EMAIL_HTML } from '../src/lib/booked-call-email-template';

const parts: Record<string, string> = {
  first_name: 'Jamie', company: 'ByteDance', call_date: 'Thursday, 10 Sep',
  call_time: '09:00', call_day: 'Thursday', call_month: 'SEP',
  call_daynum: '10', call_weekday: 'Thursday', tz_label: '(EDT, your time)',
};
let html = BOOKED_CALL_EMAIL_HTML;
for (const [k, v] of Object.entries(parts)) html = html.split(`{{${k}}}`).join(v);

const checks: [string, boolean][] = [
  ['no leftover placeholders', !html.includes('{{')],
  ['AI chart row present', html.includes('AND IN AI ANSWERS')],
  ['3 AI chart images', (html.match(/email-aeo-/g) || []).length === 3],
  ['3 Google chart images', (html.match(/email-chart-/g) || []).length === 3],
  ['agenda present', html.includes("WHAT WE'LL COVER")],
  ['prep list present', html.includes('WORTH HAVING READY')],
  ['name filled', html.includes('Hi Jamie, you made a very good')],
  ['company filled', html.includes('for ByteDance')],
];
let ok = true;
for (const [label, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);
