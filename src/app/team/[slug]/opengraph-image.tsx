/**
 * Dynamic Open Graph Image for Team Member Pages
 *
 * Generates a unique 1200×630 OG image per team member, featuring:
 * - Member name and job title
 * - Initial avatar circle
 * - Number of published articles
 * - LoudFace branding
 */
import { ImageResponse } from 'next/og';
import { fetchHomepageData } from '@/lib/cms-data';

export const runtime = 'edge';
export const alt = 'LoudFace Team Member';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const cmsData = await fetchHomepageData();
  const { teamMembers, blogPosts } = cmsData;

  const member = Array.from(teamMembers.values()).find(m => m.slug === slug);

  if (!member) {
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
          LoudFace Team
        </div>
      ),
      { ...size },
    );
  }

  const articleCount = blogPosts.filter(p => p.author === member.id).length;

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
        {/* Top: Label */}
        <div
          style={{
            fontSize: 18,
            color: '#94a3b8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
          }}
        >
          LOUDFACE TEAM
        </div>

        {/* Middle: Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e2e8f0',
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            {member.name.charAt(0)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              {member.name}
            </span>
            {member['job-title'] && (
              <span style={{ fontSize: 24, color: '#94a3b8', marginTop: 8 }}>
                {member['job-title']}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: Stats + URL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {articleCount > 0 && (
              <div
                style={{
                  fontSize: 16,
                  color: '#e2e8f0',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '8px 20px',
                  borderRadius: 20,
                }}
              >
                {articleCount} published article{articleCount !== 1 ? 's' : ''}
              </div>
            )}
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
