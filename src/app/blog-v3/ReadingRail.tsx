/**
 * ReadingRail — the desktop-only sticky rail beside the reading column:
 *   1. TOC (scroll-spy active state wired by BlogV3Scripts)
 *   2. Explore-with-AI (5 per-article deep links — passive AEO surface)
 *   3. Share row (X · copy-link · LinkedIn); copy is wired by BlogV3Scripts
 *      via data-copy-url, so this stays a server component.
 *   4. Audit CTA card (dark) — Cal trigger, "2h response time".
 */
import { aiExploreLinks } from './helpers';
import { AI_PLATFORM_ICONS, SOCIAL_ICONS } from '@/lib/icons';

interface ReadingRailProps {
  toc: { id: string; text: string }[];
  articleUrl: string;
  articleTitle: string;
}

export function ReadingRail({ toc, articleUrl, articleTitle }: ReadingRailProps) {
  const aiLinks = aiExploreLinks(articleUrl);
  const shareX = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;

  return (
    <aside className="rail" aria-label="Article tools">
      <div className="rail-sticky">
        {toc.length > 0 && (
          <nav className="toc" aria-label="Table of contents">
            <div className="toc-h"><i></i>On this page</div>
            <ol>
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={i === 0 ? 'active' : undefined}>{item.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="rail-card">
          <div className="rail-h"><i></i>Explore with AI</div>
          <div className="ai-grid">
            {aiLinks.map((l) => {
              const icon = AI_PLATFORM_ICONS[l.name];
              return (
                <a
                  key={l.name}
                  target="_blank"
                  rel="noopener"
                  href={l.href}
                  aria-label={`Explore this article in ${l.name}`}
                >
                  <span className="ic">
                    {icon && (
                      <svg viewBox={icon.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon.path }} />
                    )}
                  </span>
                  <span className="nm">{l.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="rail-card">
          <div className="rail-h"><i></i>Share</div>
          <div className="share-row">
            <a href={shareX} target="_blank" rel="noopener" aria-label="Share on X" dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS.Twitter }} />
            <button type="button" aria-label="Copy link" data-copy-url={articleUrl}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" /><path d="M14 10a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" /></svg>
            </button>
            <a href={shareLinkedIn} target="_blank" rel="noopener" aria-label="Share on LinkedIn" dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS.LinkedIn }} />
            <span className="share-lab">Cite this article</span>
          </div>
        </div>

        <div className="rail-cta">
          <span className="q"><i></i>2h response time</span>
          <p className="cta-h">Book a free SEO/AEO audit</p>
          <p>15 minutes. We review your site the way a YC partner would. No pitch, no follow-up sequence.</p>
          <a href="#book-modal" data-cal-trigger className="btn btn-white btn-pill">Schedule a call</a>
        </div>
      </div>
    </aside>
  );
}
