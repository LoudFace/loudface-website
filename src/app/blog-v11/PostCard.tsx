import Link from 'next/link';
import { formatShortDate } from '../blog-v3/helpers';
import { PostCover } from './PostCover';
import type { PostCardData } from './view';
import { cachedCmsImage } from '@/lib/image-utils';

const THUMB = '?w=900&h=560&fit=crop&fm=webp&q=78';

/** One article in a grid: its thumbnail (or a lettered plate when it has none), category, title, date and length. */
export function PostCard({ p, big = false }: { p: PostCardData; big?: boolean }) {
  const date = formatShortDate(p.date);
  return (
    <Link href={p.href} className={`bl-card ${big ? 'is-big' : ''}`}>
      <div className="bl-card-pic">
        {p.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cachedCmsImage(`${p.thumbnailUrl}${THUMB}`, 828)} alt="" loading="lazy" width={900} height={560} />
        ) : (
          <PostCover title={p.title} categoryName={p.categoryName} />
        )}
      </div>
      <div className="bl-card-body">
        {p.categoryName && <span className="bl-cat">{p.categoryName}</span>}
        <h3>{p.title}</h3>
        <div className="bl-card-meta">{date && <span>{date}</span>}<span>{p.readTime}</span></div>
      </div>
    </Link>
  );
}
