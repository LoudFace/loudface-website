/**
 * Lead — the compact electric band that opens a blog post (HERO LAW). Carries
 * `.hero` so the shared dark-hero Header keys its transparent→glass scroll flip
 * off it. Renders the 5-part article-header budget (DESIGN.md §7): breadcrumb,
 * category tag-row, H1 (post.name verbatim), excerpt, byline/meta. Every slot
 * downgrades: no category → no eyebrow; author with no photo → monogram; no
 * `last-updated` (or equal to published) → no "Updated" chip.
 */
import Image from 'next/image';
import Link from 'next/link';
import { avatarImage } from '@/lib/image-utils';
import { formatShortDate, initials } from './helpers';

export interface LeadAuthor {
  name: string;
  slug?: string;
  jobTitle?: string;
  avatarUrl?: string;
}

interface LeadProps {
  title: string;
  categoryName?: string;
  excerpt?: string;
  author?: LeadAuthor | null;
  publishedDate?: string;
  lastUpdated?: string;
  readTime?: string;
}

export function Lead({ title, categoryName, excerpt, author, publishedDate, lastUpdated, readTime }: LeadProps) {
  const published = formatShortDate(publishedDate);
  const updated = lastUpdated && lastUpdated !== publishedDate ? formatShortDate(lastUpdated) : null;

  const avatar = author ? (
    author.avatarUrl ? (
      <span className="by-av">
        <Image src={avatarImage(author.avatarUrl) ?? author.avatarUrl} alt={author.name} width={80} height={80} quality={82} loading="lazy" />
      </span>
    ) : (
      <span className="by-av" aria-hidden="true">{initials(author.name)}</span>
    )
  ) : null;

  const who = author ? (
    <span className="by-who">
      {author.slug ? (
        <Link href={`/team/${author.slug}`}>
          {avatar}
          <span>
            <span className="by-name">{author.name}</span>
            {author.jobTitle && <span className="by-role">{author.jobTitle}</span>}
          </span>
        </Link>
      ) : (
        <>
          {avatar}
          <span>
            <span className="by-name">{author.name}</span>
            {author.jobTitle && <span className="by-role">{author.jobTitle}</span>}
          </span>
        </>
      )}
    </span>
  ) : null;

  return (
    <section className="lead hero" aria-label="Article header">
      <div className="container lead-in">
        <nav className="crumb rv" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          <Link href="/blog">Blog</Link>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          <span className="here">{title}</span>
        </nav>

        {categoryName && (
          <div className="lead-cat rv" style={{ ['--d' as string]: '.04s' }}>
            <span className="eyebrow glass"><i></i>{categoryName}</span>
          </div>
        )}

        <h1 className={`rv${title.length > 40 ? ' wide' : ''}`} style={{ ['--d' as string]: '.08s' }}>
          {title}
        </h1>

        {excerpt && (
          <p className="lead-sub rv" style={{ ['--d' as string]: '.12s' }}>{excerpt}</p>
        )}

        {(who || published || updated || readTime) && (
          <div className="byline rv" style={{ ['--d' as string]: '.16s' }}>
            {who}
            <span className="by-meta">
              {published && (
                <>
                  {who && <span className="bdot" aria-hidden="true"></span>}
                  <time dateTime={publishedDate} className="tnum">{published}</time>
                </>
              )}
              {updated && (
                <span className="by-upd"><i></i>Updated <time dateTime={lastUpdated}>{updated}</time></span>
              )}
              {readTime && (
                <>
                  <span className="bdot" aria-hidden="true"></span>
                  <span>{readTime}</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
