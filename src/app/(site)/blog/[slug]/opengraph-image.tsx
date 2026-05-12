/**
 * Dynamic Open Graph Image for Blog Posts
 *
 * Generates a unique 1200×630 OG image per blog post, featuring:
 * - Post title (primary visual element)
 * - Category badge
 * - Author name
 * - LoudFace branding
 *
 * This improves social sharing CTR vs a generic site-wide OG image.
 */
import { ImageResponse } from 'next/og';
import { fetchItemBySlug, fetchHomepageData } from '@/lib/cms-data';
import type { BlogPost, Category, TeamMember } from '@/lib/types';

export const runtime = 'edge';
export const alt = 'LoudFace Blog Post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [post, cmsData] = await Promise.all([
    fetchItemBySlug<BlogPost>('blog', slug),
    fetchHomepageData(),
  ]);

  if (!post) {
    // Fallback — shouldn't happen since Next.js only generates for valid slugs
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
          LoudFace Blog
        </div>
      ),
      { ...size },
    );
  }

  const { categories, teamMembers } = cmsData;
  const category: Category | undefined = post.category ? categories.get(post.category) : undefined;
  const author: TeamMember | undefined = post.author ? teamMembers.get(post.author) : undefined;

  // Truncate title for visual balance
  const title = post.name.length > 80 ? post.name.slice(0, 77) + '…' : post.name;

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
        {/* Top: Category + Blog label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              fontSize: 18,
              color: '#94a3b8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
            }}
          >
            LOUDFACE BLOG
          </div>
          {category && (
            <div
              style={{
                fontSize: 16,
                color: '#e2e8f0',
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 16px',
                borderRadius: 20,
              }}
            >
              {category.name}
            </div>
          )}
        </div>

        {/* Middle: Title */}
        <div
          style={{
            fontSize: title.length > 50 ? 42 : 52,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            maxWidth: '90%',
          }}
        >
          {title}
        </div>

        {/* Bottom: Author + URL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {author && (
              <>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#e2e8f0',
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {author.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 18, color: '#e2e8f0', fontWeight: 500 }}>
                    {author.name}
                  </span>
                  {author['job-title'] && (
                    <span style={{ fontSize: 14, color: '#94a3b8' }}>
                      {author['job-title']}
                    </span>
                  )}
                </div>
              </>
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
