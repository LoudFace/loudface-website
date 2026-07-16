/**
 * PostCard — one night exhibit card, shared by the related-posts gallery and the
 * blog index grid (the concept's related-card language). Posts WITH a thumbnail
 * get a cropped media plate; the 13% WITHOUT one get an indigo gradient plate
 * with a faint LoudFace monogram — never a gray box. The whole card is a single
 * overlay link (.rel-link) for a large hit target; the visible arrow is a hover
 * affordance only.
 */
import Image from 'next/image';
import Link from 'next/link';
import { thumbnailImage } from '@/lib/image-utils';

interface PostCardProps {
  href: string;
  title: string;
  categoryName?: string;
  thumbnailUrl?: string;
  readTime?: string;
  /** reveal-stagger delay, e.g. ".08s" */
  delay?: string;
}

export function PostCard({ href, title, categoryName, thumbnailUrl, readTime, delay }: PostCardProps) {
  const thumb = thumbnailUrl ? thumbnailImage(thumbnailUrl) : null;
  return (
    <article className="rel-card rv" style={delay ? { ['--d' as string]: delay } : undefined}>
      {thumb ? (
        <div className="rel-media">
          {/* The local monogram fallback below stays a plain <img>: it's an SVG served
              from our own origin, it isn't Sanity bandwidth, and next/image refuses
              SVG unless dangerouslyAllowSVG is enabled. */}
          <Image src={thumb} alt={title} width={800} height={726} quality={82} loading="lazy" />
        </div>
      ) : (
        <div className="rel-plate">
          <img className="mk" src="/images/loudface-inversed.svg" alt="" aria-hidden="true" width={126} height={26} />
        </div>
      )}
      {categoryName && <span className="rel-tag"><i></i>{categoryName}</span>}
      <div className="rel-body">
        <h3>{title}</h3>
        <div className="rel-foot">
          {readTime && <span className="rel-read">{readTime}</span>}
          <span className="rel-go" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
      </div>
      <Link className="rel-link" href={href} aria-label={title}></Link>
    </article>
  );
}
