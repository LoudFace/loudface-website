// Copies the live email out of arnel-content into src/lib/booked-call-email-template.ts.
// The arnel-content file stays the source of truth; this repo carries a snapshot.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SRC = join(
  homedir(),
  'Library/Mobile Documents/com~apple~CloudDocs/Companies/Arnel’s Projects'.replace('’', "'"),
  'arnel-content/email-sequences/drip/templates/email-1.html'
);

const html = readFileSync(SRC, 'utf8');
if (!html.includes('AND IN AI ANSWERS')) {
  throw new Error('Refusing to sync: the AI-answer chart row is missing from the template.');
}
writeFileSync(
  'src/lib/booked-call-email-template.ts',
  `// GENERATED FILE - do not edit by hand.\n// Source: arnel-content/email-sequences/drip/templates/email-1.html\n// Regenerate with: npm run sync-drip-template\nexport const BOOKED_CALL_EMAIL_HTML = ${JSON.stringify(html)};\n`
);
console.log(`synced ${html.length} bytes`);
