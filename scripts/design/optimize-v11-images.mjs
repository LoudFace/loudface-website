// Re-encode the heavy v11 images at the size they are shown (2026-09-26, before the v11 launch: the switched homepage
// weighed 6.7 MB against the live site's 0.7 MB). Photos are read from their originals in
// design-lab/v11-image-originals/ (kept out of public/ so they are never deployed) and written to public/images/home-v11
// under NEW names, so no cache can serve an old picture at a changed URL; responsive photos get 1280/1920/2560 widths
// for srcset. Avatars, logos and icons had never been deployed, so they are resized in place.
//   node scripts/design/optimize-v11-images.mjs [--photos-only]
import { createRequire } from 'node:module';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const SRC = join(process.cwd(), 'design-lab/v11-image-originals');
const OUT = join(process.cwd(), 'public/images/home-v11');

const jobs = [
  // faces shown at 32-40px
  ...['people/kenneth-o-friel.png', 'people/daan-smit.png'].map((f) => ({ src: f, out: f.replace(/\.png$/, '.webp'), width: 160, q: 82 })),
  // the About cutouts, shown at up to 290px wide (580 is 2x), transparency kept
  ...['abhay-tyagi', 'andrea-van-wyk', 'tamara-pavlovic', 'arnel-bukva'].map((n) => ({ src: `about/cut-${n}.png`, out: `about/cut-${n}.webp`, width: 580, q: 82 })),
  // the homepage bento photos, shown at up to ~636px wide
  ...['ai', 'design', 'search', 'build'].map((k) => ({ src: `bento-${k}.jpg`, out: `bento-${k}.webp`, width: 1272, q: 78 })),
  // full-bleed photos: three widths each for srcset
  ...[1280, 1920, 2560].flatMap((w) => [
    // smooth indigo gradients band at WebP's usual quality; 86 with smart chroma subsampling keeps them clean
    { src: 'hero-phone-wide.jpg', out: `hero-phone-wide-${w}.webp`, width: w, q: 86, smart: true },
    { src: 'cases/stage-backdrop.jpg', out: `cases/stage-backdrop-${w}.webp`, width: w, q: 86, smart: true },
    { src: 'closing-terrain.png', out: `closing-terrain-${w}.webp`, width: w, q: 86, smart: true },
  ]),
];

// In place, by width: team avatars shown at 20-44px, client icons at 16-30px, and the logos below.
const AVATARS = ['abhay-tyagi', 'andrea-van-wyk', 'arnel-bukva', 'chandana-pitta', 'david-dobrijevic', 'rezwan-nahid', 'tamara-pavlovic'];
const ICONS = ['fav-ceipal', 'fav-claude', 'fav-dimer', 'trademomentum-icon', 'genie-icon', 'fav-gemini'];
const inPlace = [
  ...AVATARS.map((n) => ({ src: `avatars/${n}.png`, width: 96, photo: true })),
  ...ICONS.map((n) => ({ src: `logos/${n}.png`, width: 64 })),
  { src: 'logos/dimer-health.png', width: 400 },
  { src: 'logos/outbound-specialist-ink.png', width: 400 },
  { src: 'logos/ceipal.png', width: 400 },
  { src: 'logos/toku.png', width: 400 },
];
// In place, by height: wordmarks are shown at most 30px tall, so 80px covers a 2x screen with room to spare.
const WORDMARKS = ['dimer-health-ink', 'brandfirm', 'ceipal-ink', 'color-outbound', 'radisson-hotels-group-ink', 'toku-ink', 'toku-white', 'liqid-ink', 'color-ceipal', 'color-dimer', 'eraser-ink', 'color-montblanc', 'hoxhunt-ink', 'montblanc-ink', 'reiterate-ink'];
inPlace.push(...WORDMARKS.map((n) => ({ src: `logos/${n}.png`, height: 80 })));

const kb = (p) => Math.round(statSync(p).size / 1024);
const photosOnly = process.argv.includes('--photos-only');
for (const j of photosOnly ? jobs.filter((x) => x.smart) : jobs) {
  const src = join(SRC, j.src), out = join(OUT, j.out);
  await sharp(src).resize({ width: j.width, withoutEnlargement: true }).webp({ quality: j.q, effort: 6, smartSubsample: !!j.smart }).toFile(out);
  console.log(`${j.src} ${kb(src)}KB -> ${j.out} ${kb(out)}KB`);
}
for (const j of photosOnly ? [] : inPlace) {
  const src = join(OUT, j.src);
  const before = kb(src);
  const size = j.height ? { height: j.height } : { width: j.width };
  // photos keep full colour; flat logos and icons compress well to a 256-colour palette
  const png = j.photo ? { compressionLevel: 9 } : { compressionLevel: 9, palette: true };
  const buf = await sharp(src).resize({ ...size, withoutEnlargement: true }).png(png).toBuffer();
  await sharp(buf).toFile(src);
  console.log(`${j.src} ${before}KB -> ${kb(src)}KB (in place)`);
}
