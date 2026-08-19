/**
 * One-off: populate the opt-in `rankedList` field on the four visibility-index
 * posts so they emit ItemList JSON-LD (see PR #28 / August content audit #2).
 *
 * Data was extracted verbatim from the live pages on 2026-08-19.
 * `ordered: true`  = a true rank leaderboard (a rank/# column on the page).
 * `ordered: false` = an unordered roster (no ranking column).
 *
 * SAFE BY DEFAULT: dry-run unless you pass --commit. Reads (the _id lookup)
 * need no token; the write needs SANITY_API_TOKEN in .env.local.
 *
 *   node scripts/set-ranked-lists-2026-08.mjs            # dry-run, prints mutations
 *   node scripts/set-ranked-lists-2026-08.mjs --commit   # writes to Sanity
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';

const env = (() => {
  try {
    return readFileSync('.env.local', 'utf8').split('\n').reduce((a, l) => {
      const m = l.match(/^([^=]+)=(.*)$/);
      if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
      return a;
    }, {});
  } catch {
    return {};
  }
})();

const COMMIT = process.argv.includes('--commit');

const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

/** slug -> { ordered, items } */
const LISTS = {
  'hr-tech-ai-visibility-index-2026': {
    ordered: true,
    items: [
      'Rippling', 'Deel', 'Gusto', 'BambooHR', 'ADP', 'HiBob',
      'Workday', 'Remote', 'UKG', 'Paylocity', 'Papaya Global',
    ],
  },
  'cybersecurity-saas-ai-visibility-index-2026': {
    ordered: true,
    items: [
      'SentinelOne', 'Palo Alto Networks', 'Microsoft Defender', 'Wiz', 'Rapid7',
      'CrowdStrike', 'Cisco', 'Check Point', 'Proofpoint', 'Orca Security',
      'Trend Micro', 'Qualys', 'Cloudflare', 'Fortinet', 'KnowBe4',
    ],
  },
  'embedded-finance-companies': {
    ordered: false,
    items: [
      'Stripe', 'Adyen', 'Unit', 'Marqeta', 'Plaid',
      'Parafin', 'Klarna', 'Airwallex', 'Toku',
    ],
  },
  'devtools-ai-visibility-index-2026': {
    ordered: false,
    items: [
      'Postman', 'Insomnia', 'Hoppscotch', 'Apidog', 'Bruno',
      'GitHub Actions', 'GitLab CI', 'CircleCI', 'Jenkins', 'Azure DevOps',
      'Datadog', 'Grafana', 'New Relic', 'Honeycomb', 'Dynatrace',
      'LaunchDarkly', 'Split', 'Statsig', 'Flagsmith', 'Unleash',
      'ReadMe', 'Mintlify', 'Redocly', 'Stoplight', 'GitBook',
      'Sentry', 'Bugsnag', 'Rollbar',
      'Backstage', 'Humanitec', 'Cortex', 'OpsLevel', 'Qovery',
      'CodeRabbit', 'GitHub Copilot', 'Graphite', 'SonarQube', 'Codacy',
      'Supabase', 'PlanetScale', 'Neon', 'MongoDB Atlas', 'Northflank',
      'Auth0', 'Clerk', 'Stytch', 'WorkOS',
      'Terraform', 'Pulumi', 'Ansible', 'OpenTofu', 'Crossplane',
      'PostHog', 'Amplitude', 'Mixpanel', 'Heap', 'Pendo',
    ],
  },
};

console.log(COMMIT ? '=== COMMIT MODE — writing to Sanity ===\n' : '=== DRY RUN — no writes (pass --commit to write) ===\n');
if (COMMIT && !env.SANITY_API_TOKEN) {
  console.error('SANITY_API_TOKEN missing from .env.local — cannot write. Aborting.');
  process.exit(1);
}

let failed = 0;
for (const [slug, rankedList] of Object.entries(LISTS)) {
  // Read the real _id from the CMS — migrated posts are `imported-blogPost-<hash>`,
  // so a derived `blogPost-<slug>` id would address nothing (agent-corrections 2026-07-30).
  const doc = await client.fetch(
    '*[_type == "blogPost" && slug.current == $slug][0]{_id, name}',
    { slug },
  );
  if (!doc?._id) {
    console.error(`✗ ${slug}: no published doc found`);
    failed++;
    continue;
  }
  console.log(`• ${slug}`);
  console.log(`  _id: ${doc._id}`);
  console.log(`  ordered: ${rankedList.ordered} | ${rankedList.items.length} items`);
  console.log(`  items: ${rankedList.items.join(', ')}`);

  if (COMMIT) {
    const res = await client.patch(doc._id).set({ rankedList }).commit();
    console.log(`  ✓ patched, _rev: ${res._rev}`);
  }
  console.log('');
}

if (failed) {
  console.error(`${failed} doc(s) not found — fix the slug(s) before committing.`);
  process.exit(1);
}
console.log(COMMIT
  ? 'Done. Allow 60–90s for ISR, then check the pages in Google Rich Results Test.'
  : 'Dry run OK. Re-run with --commit (needs SANITY_API_TOKEN) to write.');
