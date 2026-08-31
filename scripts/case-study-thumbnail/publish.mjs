/**
 * Upload a rendered thumbnail and set it as the case study's
 * mainProjectImageThumbnail. Needs SANITY_API_TOKEN (run via with-secrets.sh).
 *
 * Usage: node publish.mjs <slug> [--variant b] [--dry]
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = 'xjjjqhgt';
const DATASET = 'production';

const argv = parseArgs(process.argv.slice(2), {
  booleans: ['dry'],
  values: ['variant', 'alt'],
  usage: 'publish.mjs <slug> [--variant b] [--alt "..."] [--dry]',
});
const slug = argv._[0];
const variant = argv.variant ?? null;
const dry = argv.dry === true;
const newAlt = argv.alt ?? null;
const token = process.env.SANITY_API_TOKEN;

if (!slug) { console.error('usage: publish.mjs <slug> [--variant b] [--alt "..."] [--dry]'); process.exit(1); }
if (!token) { console.error('SANITY_API_TOKEN missing — run through scripts/with-secrets.sh'); process.exit(1); }

const file = path.join(HERE, 'out', `${slug}${variant ? `-${variant}` : ''}.png`);
const png = await readFile(file);

const q = async (query) => {
  const r = await fetch(
    `https://${PROJECT}.api.sanity.io/v2023-05-03/data/query/${DATASET}?query=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!r.ok) throw new Error(`query ${r.status}: ${await r.text()}`);
  return (await r.json()).result;
};

// Read the real _id from the CMS — never derive it.
const doc = await q(`*[_type=="caseStudy" && slug.current=="${slug}"][0]{_id,name,"img":mainProjectImageThumbnail.asset->url,"alt":mainProjectImageThumbnail.alt}`);
if (!doc?._id) throw new Error(`no caseStudy with slug "${slug}"`);
console.log(`doc     ${doc._id}  (${doc.name})`);
console.log(`current ${doc.img}`);
console.log(`new     ${file}  ${(png.length / 1024 / 1024).toFixed(2)} MB`);

console.log(`alt     ${doc.alt}`);
if (newAlt) console.log(`alt new ${newAlt}`);

if (dry) { console.log('\n--dry: nothing written'); process.exit(0); }

const up = await fetch(
  `https://${PROJECT}.api.sanity.io/v2023-05-03/assets/images/${DATASET}?filename=${slug}-thumbnail.png`,
  { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/png' }, body: png }
);
if (!up.ok) throw new Error(`upload ${up.status}: ${await up.text()}`);
const assetId = (await up.json()).document._id;
console.log(`asset   ${assetId}`);

const patch = await fetch(`https://${PROJECT}.api.sanity.io/v2023-05-03/data/mutate/${DATASET}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mutations: [{
      patch: {
        id: doc._id,
        set: {
          'mainProjectImageThumbnail.asset._ref': assetId,
          'mainProjectImageThumbnail.alt': newAlt ?? doc.alt,
        },
      },
    }],
  }),
});
if (!patch.ok) throw new Error(`mutate ${patch.status}: ${await patch.text()}`);
console.log('patched');

const after = await q(`*[_id=="${doc._id}"][0]{"img":mainProjectImageThumbnail.asset->url,"alt":mainProjectImageThumbnail.alt}`);
console.log(`verify  ${after.img}\nalt     ${after.alt}`);
if (!after.img?.includes(assetId.replace('image-', '').split('-')[0])) {
  console.error('WARNING: read-back does not reference the new asset');
  process.exit(1);
}
