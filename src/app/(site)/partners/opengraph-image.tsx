import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '10% lifetime commission — LoudFace Partner Program';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 80,
            fontSize: 24,
            color: '#888',
            letterSpacing: '0.1em',
          }}
        >
          LOUDFACE
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.05,
            maxWidth: '88%',
            letterSpacing: '-0.02em',
          }}
        >
          10% lifetime commission
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#c4b5fd',
            marginTop: 28,
            maxWidth: '85%',
            lineHeight: 1.4,
          }}
        >
          Refer one B2B SaaS client. Earn for as long as they stay.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 20,
            color: '#666',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: '#a78bfa',
            }}
          />
          loudface.co/partners
        </div>
      </div>
    ),
    { ...size },
  );
}
