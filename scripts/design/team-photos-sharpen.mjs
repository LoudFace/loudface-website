// Sharpen a team headshot with GPT Image 2.5 Sunburst (the precise-edit variant) through the Vercel AI Gateway,
// keeping the person, pose, framing, light and background as shot (2026-09-28: the Slack photos were soft).
//   vercel env pull <tmp>/vercel.env --environment=development --yes   (gives VERCEL_OIDC_TOKEN, valid 12 h)
//   node --env-file=<tmp>/vercel.env scripts/design/team-photos-sharpen.mjs <slug> [<slug> ...]
// Reads design-lab/v11-image-originals/team/<slug>-slack.png, writes <slug>.jpg beside it (2048x2048). Compare the
// two at 1:1 before using the result: the prompt forbids retouching, but check the face is still the same person.
// Then run team-photos.py. About $0.11 an image (September 2026).
// Never ask the model to re-pose a person or redraw their face: on 2026-09-28 three re-posed versions of Andrea were
// rejected ("none of them look like her", the chin came out too strong). Sharpen only; a different pose needs a real
// photo from the shoot.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateImage } from 'ai';
import sharp from 'sharp';

const DIR = join(process.cwd(), 'design-lab/v11-image-originals/team');
const PROMPT = `Restore this studio portrait photograph to full sharpness and detail.
Keep everything exactly as it is: the same person and identity, face shape, every facial feature, skin tone, expression,
gaze direction, head pose, hairstyle and hair colour, clothing, the dark studio background, the lighting, the framing and
the colours. Change nothing about the composition.
Only recover fine detail and clarity, as if shot on a sharp lens: crisp eyes, irises, eyelashes and eyebrows, natural
skin texture and pores, individual hair strands, beard hair, and fabric texture. Remove blur, softness and JPEG
compression artefacts.
Do not retouch, beautify, smooth skin, slim, change age, whiten teeth, or add or remove anything.`;

await Promise.all(process.argv.slice(2).map(async (slug) => {
  const { images } = await generateImage({
    model: 'openai/gpt-image-2.5-sunburst',
    prompt: { text: PROMPT, images: [readFileSync(join(DIR, `${slug}-slack.png`))] },
    size: '2048x2048',
    providerOptions: { openai: { quality: 'high', input_fidelity: 'high' } },
  });
  await sharp(images[0].uint8Array).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(join(DIR, `${slug}.jpg`));
  console.log(`${slug}: ${slug}.jpg`);
}));
