import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * The v11 share images (the card Slack, LinkedIn and X show for a link), 1200×630. The site default carries the
 * homepage's own photograph (the phone showing an AI answer on the indigo backdrop) with the line beside it; the
 * partner program shows its offer over a drawn payout run. Fonts and the photo are read from /public, so the images
 * need no network. Neue Montreal ships as .woff only in Regular and Bold (satori reads woff, not woff2).
 */

// Every file is read through a literal path, so the deployment traces exactly these four files into the function
// (a variable path makes the tracer include all of /public).
const HEADING_FONT = join(process.cwd(), 'public/fonts/NeueMontreal-Regular.woff');
const BODY_FONT = join(process.cwd(), 'public/fonts/Satoshi-Medium.woff');
const HOME_PHOTO = join(process.cwd(), 'public/images/home-v11/og-home.jpg');
const WORDMARK = join(process.cwd(), 'public/images/home-v11/wordmark-white.svg');

async function fonts() {
  const [heading, body] = await Promise.all([readFile(HEADING_FONT), readFile(BODY_FONT)]);
  return [
    { name: 'Neue Montreal', data: heading, weight: 400 as const, style: 'normal' as const },
    { name: 'Satoshi', data: body, weight: 500 as const, style: 'normal' as const },
  ];
}

async function dataUri(file: string, type: string) {
  return `data:${type};base64,${(await readFile(file)).toString('base64')}`;
}

const size = { width: 1200, height: 630 };

export async function homeShare(t: { line: string; sub: string; url: string }) {
  const [photo, mark] = await Promise.all([dataUri(HOME_PHOTO, 'image/jpeg'), dataUri(WORDMARK, 'image/svg+xml')]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#3d38cf' }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={photo} width={1200} height={630} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', left: 72, top: 64, bottom: 64, width: 620, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={mark} width={162} height={34} style={{ width: 162, height: 34 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Neue Montreal', fontSize: 68, lineHeight: 1.02, letterSpacing: '-0.04em', color: '#ffffff' }}>{t.line}</div>
            <div style={{ fontFamily: 'Satoshi', fontSize: 26, lineHeight: 1.4, color: '#dcd9fe', marginTop: 22, maxWidth: 560 }}>{t.sub}</div>
          </div>
          <div style={{ fontFamily: 'Satoshi', fontSize: 20, color: '#c9c5fb' }}>{t.url}</div>
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}

export async function partnersShare(t: { line: string; sub: string; url: string }) {
  const mark = await dataUri(WORDMARK, 'image/svg+xml');
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: 'radial-gradient(ellipse 90% 90% at 90% 100%, #7068f0 0%, #4f46e5 45%, #2c26a3 100%)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={mark} width={162} height={34} style={{ width: 162, height: 34 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 600 }}>
            <div style={{ fontFamily: 'Neue Montreal', fontSize: 84, lineHeight: 1, letterSpacing: '-0.045em', color: '#ffffff' }}>{t.line}</div>
            <div style={{ fontFamily: 'Satoshi', fontSize: 28, lineHeight: 1.4, color: '#dcd9fe', marginTop: 24 }}>{t.sub}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 260 }}>
            {months.map((m) => (
              <div key={m} style={{ width: 26, height: `${(m / 12) * 100}%`, borderRadius: '6px 6px 3px 3px', background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.85)' }} />
            ))}
          </div>
        </div>
        <div style={{ fontFamily: 'Satoshi', fontSize: 20, color: '#c9c5fb' }}>{t.url}</div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
