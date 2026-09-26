import Link from 'next/link';
import type { IndustryV11Content } from '@/lib/content-utils';
import { ArrowUpRight } from '../home-v11/ui';
import type { IndustryPost } from './types';
import type { HubCard } from './views';
import { cachedCmsImage } from '@/lib/image-utils';

/**
 * The end of an industry page: four other markets as cards with their lead client's site (the hub's cards, without
 * the figure), then related reading as hairline links when the page has any. The caller picks the four so none repeats
 * a cover already on the page (`relatedCards`).
 */
export function RelatedIndustries({ c, cards, posts = [] }: { c: IndustryV11Content; cards: HubCard[]; posts?: IndustryPost[] }) {
  const L = c.labels;
  return (
    <div className="v11-wrap">
      <div className="sv-head">
        <div><h2 className="v11-h2">{L.otherTitle}</h2></div>
        <p>{L.otherLede}</p>
      </div>
      <div className="hb-grid is-4">
        {cards.map((k) => (
          <Link key={k.href} href={k.href} className="hb-card">
            <div className="in-card-shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {k.imageUrl && <img src={cachedCmsImage(`${k.imageUrl}?w=900&fm=webp&q=80`, 828)} alt={k.client ? `${k.client}, a LoudFace case study` : ''} width={900} height={562} loading="lazy" />}
            </div>
            <div className="hb-card-copy">
              <span className="is-label">{k.label}</span>
              <span className="is-head">{k.headline}</span>
              <span className="is-go" aria-hidden="true"><ArrowUpRight /></span>
            </div>
          </Link>
        ))}
      </div>
      {posts.length > 0 && (
        <div className="in-links in-posts">
          <h3 className="in-links-title">{L.postsTitle}</h3>
          <ul>
            {posts.map((p) => (
              <li key={p.href}><Link href={p.href}><span className="is-t">{p.title}</span>{p.meta && <span className="is-m">{p.meta}</span>}<ArrowUpRight /></Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Four other markets for a page: never itself, never a lead study whose cover the page already shows. */
export function relatedCards(all: HubCard[], self: string, onPage: string[]): HubCard[] {
  return all.filter((k) => k.href !== `/seo-for/${self}` && !(k.study && onPage.includes(k.study))).slice(0, 4);
}
