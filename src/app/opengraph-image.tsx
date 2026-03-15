import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'LoudFace - B2B SaaS Websites That Convert';
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
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#888',
            marginBottom: 20,
            letterSpacing: '0.1em',
          }}
        >
          LOUDFACE
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            maxWidth: '80%',
          }}
        >
          B2B SaaS Websites That Convert
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#aaa',
            marginTop: 24,
            maxWidth: '70%',
            lineHeight: 1.5,
          }}
        >
          Webflow Development, SEO/AEO & CRO for Series A+ SaaS Companies
        </div>
        <div
          style={{
            fontSize: 18,
            color: '#666',
            marginTop: 40,
          }}
        >
          www.loudface.co
        </div>
      </div>
    ),
    { ...size }
  );
}
