import Link from 'next/link';
import type { BlogV11Content, HomeV11Content } from '@/lib/content-utils';
import { formatShortDate } from '../blog-v3/helpers';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, SectionHeadNode } from '../home-v11/ui';
import { PostCard } from './PostCard';
import { PostCover } from './PostCover';
import type { PostCardData } from './view';
import { strip } from '@/lib/inline-edit/mark';
import { cachedCmsImage, cachedCmsSrcSet } from '@/lib/image-utils';

/**
 * The /blog index in v11 (DESIGN.md §6, §7). Copy in src/data/content/blog-v11.json; posts are live Sanity posts,
 * newest first, twelve a page as the live index paginates. The hero is its own picture: the newest article as a
 * magazine cover, beside the title, on a pale sky ground no other page uses.
 */
export function BlogIndexV11({ c, home, posts, total, page, pages }: { c: BlogV11Content; home: HomeV11Content; posts: PostCardData[]; total: number; page: number; pages: number }) {
  const [lead, ...rest] = posts;
  const x = c.index;
  return (
    <div className="v11 bl">
      <section className="bl-hero" data-hero="light">
        <div className="v11-wrap bl-hero-grid">
          <div className="bl-hero-copy">
            <div className="bl-eyebrow"><span>{x.eyebrow}</span><span className="is-sub">{total} {x.countLabel}</span></div>
            <h1>{x.headline} <span className="ghost">{x.headlineHighlight}</span></h1>
            <p>{x.description}</p>
          </div>
          {lead && page === 1 && (
            <Link href={lead.href} className="bl-cover">
              <div className="bl-cover-pic">
                {lead.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cachedCmsImage(`${lead.thumbnailUrl}?w=1400&h=860&fit=crop&fm=webp&q=82`, 1920)} srcSet={cachedCmsSrcSet(`${lead.thumbnailUrl}?w=1400&h=860&fit=crop&fm=webp&q=82`, [828, 1920])} sizes="(max-width: 767px) 92vw, 720px" alt="" width={1400} height={860} />
                ) : <PostCover title={lead.title} categoryName={lead.categoryName} />}
                <span className="bl-cover-tag">{x.latestLabel}</span>
              </div>
              <div className="bl-cover-body">
                {lead.categoryName && <span className="bl-cat">{lead.categoryName}</span>}
                <h2>{lead.title}</h2>
                <div className="bl-cover-foot">
                  <span>{formatShortDate(lead.date)} · {lead.readTime}</span>
                  <span className="is-go">{x.readLabel}<ArrowRight /></span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="v11-sec v11-white" id="articles">
        <div className="v11-wrap">
          <SectionHeadNode title={<>{x.gridHeadline} <span className="ghost">{x.gridHeadlineHighlight}</span></>} body={x.gridBody} bodyWidth={420} />
          <div className="bl-grid">
            {(page === 1 ? rest : posts).map((p, i) => <PostCard key={p.href} p={p} big={page === 1 && i < 2} />)}
          </div>
          {pages > 1 && (
            <nav className="bl-pages" aria-label={strip(x.pageLabel)}>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={n === 1 ? '/blog' : `/blog?page=${n}`} className={n === page ? 'is-on' : ''} aria-current={n === page ? 'page' : undefined}>{n}</Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <Closing c={home.closing} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
