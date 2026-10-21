// Renders the booked-call email with sample values and asserts nothing is missing.
// Run with: npx tsx scripts/drip-check.ts
import { BOOKED_CALL_EMAIL_HTML } from '../src/lib/booked-call-email-template';
import { companyName } from '../src/lib/booked-call-email';

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
  // Google charts redrawn from the website's case studies (arnels-content scripts/drip_charts.py, 2026-10-21)
  ['3 Google chart images', ['email-trademomentum-', 'email-genie-', 'email-delshad-'].every((n) => html.includes(n))],
  ['no August chart left', !html.includes('2026-08-30-email-chart') && !html.includes('2026-09-01-email-aeo')],
  ['indigo hero', html.includes('email-header-band-indigo') && (html.match(/background:#3D38CF/g) || []).length === 3],
  ['agenda present', html.includes("WHAT WE'LL COVER")],
  ['prep list present', html.includes('WORTH HAVING READY')],
  ['name filled', html.includes('Hi Jamie, you made a very good')],
  ['company filled', html.includes('for ByteDance')],
  ['title is the current subject', html.includes("<title>Your call is booked - here's what we'll cover</title>")],
  // Real booking-form answers from 22 Sep to 19 Oct 2026; the email used to print the domain instead.
  ['form answer wins: Hai Robotics', companyName('Hai Robotics', 'juliet.zhang@hairobotics.com') === 'Hai Robotics'],
  ['form answer wins: SAVVI Financial', companyName('SAVVI Financial', 'kbrazill@savvifi.com') === 'SAVVI Financial'],
  ['form answer wins: Bamboo Health', companyName('  Bamboo   Health ', 'lblubaugh@bamboohealth.com') === 'Bamboo Health'],
  ['no answer falls back to the domain', companyName(undefined, 'riley@founderled.io') === 'Founderled'],
  ['"n/a" falls back to the domain', companyName('n/a', 'harshul@arctan.ai') === 'Arctan'],
  ['a typed web address falls back', companyName('www.moontiger.com', 'edelapena@moontiger.com') === 'Moontiger'],
  ['free mail with no answer reads "your business"', companyName('', 'someone@gmail.com') === 'your business'],
];
let ok = true;
for (const [label, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);
