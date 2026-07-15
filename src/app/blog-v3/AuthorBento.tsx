/**
 * AuthorBento — the "proof bento" author section (light): an indigo author card
 * (monogram or photo, name, role, bio, "More from" + "Book a call") beside an
 * "On the record" provenance panel (published / last-updated / category / read
 * time — all from real fields, no fabricated stats). Rendered by the caller only
 * when an author is resolved; every sub-field degrades independently.
 */
import Image from 'next/image';
import Link from 'next/link';
import { avatarImage } from '@/lib/image-utils';
import { formatShortDate, initials } from './helpers';
import type { LeadAuthor } from './Lead';

interface AuthorBentoProps {
  author: LeadAuthor & { bio?: string; linkedinUrl?: string };
  publishedDate?: string;
  lastUpdated?: string;
  categoryName?: string;
  readTime?: string;
}

export function AuthorBento({ author, publishedDate, lastUpdated, categoryName, readTime }: AuthorBentoProps) {
  const published = formatShortDate(publishedDate);
  const updated = formatShortDate(lastUpdated);
  const isFresh = lastUpdated && lastUpdated !== publishedDate;

  return (
    <section className="author" aria-label="About the author">
      <div className="container author-grid">
        <div className="au-main rv">
          <span className="au-kicker">Written by</span>
          <div className="au-top">
            {author.avatarUrl ? (
              <span className="au-av"><Image src={avatarImage(author.avatarUrl) ?? author.avatarUrl} alt={author.name} width={80} height={80} quality={82} loading="lazy" /></span>
            ) : (
              <span className="au-av" aria-hidden="true">{initials(author.name)}</span>
            )}
            <div>
              <div className="au-name">{author.name}</div>
              {author.jobTitle && <div className="au-role">{author.jobTitle}</div>}
            </div>
          </div>
          {author.bio && <p className="au-bio">{author.bio}</p>}
          <div className="au-links">
            {author.slug && (
              <Link className="prim" href={`/team/${author.slug}`}>
                More from {author.name.split(' ')[0]}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            )}
            <a className="ghost" href="#book-modal" data-cal-trigger>Book a call</a>
          </div>
        </div>

        <div className="au-side">
          <div className="au-prov rv" style={{ ['--d' as string]: '.08s' }}>
            <span className="label">On the record</span>
            <dl>
              {published && (
                <div className="prow"><dt>Published</dt><dd className="tnum">{published}</dd></div>
              )}
              {updated && isFresh && (
                <div className="prow"><dt>Last updated</dt><dd className="fresh"><i></i><span className="tnum">{updated}</span></dd></div>
              )}
              {categoryName && (
                <div className="prow"><dt>Category</dt><dd>{categoryName}</dd></div>
              )}
              {readTime && (
                <div className="prow"><dt>Reading time</dt><dd>{readTime}</dd></div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
