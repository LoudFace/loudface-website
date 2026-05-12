/**
 * Dynamic Open Graph Image for Case Studies
 *
 * Generates a unique 1200×630 OG image per case study, featuring:
 * - Project title (primary visual element)
 * - Client brand color accent
 * - Key results (if available)
 * - LoudFace branding
 *
 * This improves social sharing CTR vs a generic site-wide OG image.
 */
import { ImageResponse } from 'next/og';
import { fetchItemBySlug } from '@/lib/cms-data';
import type { CaseStudy } from '@/lib/types';

export const runtime = 'edge';
export const alt = 'LoudFace Case Study';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const study = await fetchItemBySlug<CaseStudy>('case-studies', slug);

  if (!study) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          LoudFace Case Studies
        </div>
      ),
      { ...size },
    );
  }

  const title = study['project-title'] || study.name;
  const displayTitle = title.length > 70 ? title.slice(0, 67) + '…' : title;
  const clientColor = study['client-color'] || '#6366f1';

  // Build results array
  const results = [
    { number: study['result-1---number'], title: study['result-1---title'] },
    { number: study['result-2---number'], title: study['result-2---title'] },
    { number: study['result-3---number'], title: study['result-3---title'] },
  ].filter(r => r.number);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
        }}
      >
        {/* Top: Brand accent bar + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 6,
              height: 32,
              borderRadius: 3,
              background: clientColor,
            }}
          />
          <div
            style={{
              fontSize: 18,
              color: '#94a3b8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
            }}
          >
            CASE STUDY
          </div>
        </div>

        {/* Middle: Title */}
        <div
          style={{
            fontSize: displayTitle.length > 45 ? 42 : 52,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            maxWidth: '90%',
          }}
        >
          {displayTitle}
        </div>

        {/* Bottom: Results + URL */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {/* Key results */}
          <div style={{ display: 'flex', gap: 32 }}>
            {results.slice(0, 3).map((result, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: clientColor }}>
                  {result.number}
                </span>
                <span style={{ fontSize: 14, color: '#94a3b8', maxWidth: 160 }}>
                  {result.title}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 16, color: '#64748b' }}>
            www.loudface.co
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
