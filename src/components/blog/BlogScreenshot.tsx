import { heroImage } from '@/lib/image-utils';
import type { BlogVisual } from '@/lib/types';

interface BlogScreenshotProps {
  visual: BlogVisual;
  priority?: boolean;
}

/**
 * Extracts `perplexity.ai` from `https://www.perplexity.ai/search?q=foo` for a
 * readable source label. Strips `www.` for compactness. Returns the raw URL
 * if parsing fails so we never break a link.
 */
function formatSourceHost(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.startsWith('www.') ? host.slice(4) : host;
  } catch {
    return url;
  }
}

/**
 * Renders a captured webpage screenshot with a "Source:" link under the image
 * so readers can verify the capture against the live page. Uses a thin border
 * + slight shadow to visually distinguish it from editorial illustrations,
 * which sit flush with no chrome.
 */
export function BlogScreenshot({ visual, priority }: BlogScreenshotProps) {
  const src = visual.asset?.url;
  if (!src) return null;

  const img = heroImage(src);
  const sourceUrl = visual.capture?.sourceUrl;

  return (
    <figure className={priority ? 'my-6' : 'my-10'} aria-label={visual.alt}>
      <img
        src={img.src}
        srcSet={img.srcset}
        sizes="(min-width: 1024px) 720px, (min-width: 768px) 90vw, 100vw"
        alt={visual.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className="w-full rounded-xl border border-surface-200 shadow-sm"
      />
      {(visual.caption || sourceUrl) && (
        <figcaption className="mt-3 text-sm text-surface-500 text-center">
          {visual.caption && <span className="italic">{visual.caption}</span>}
          {visual.caption && sourceUrl && <span className="mx-2">·</span>}
          {sourceUrl && (
            <>
              <span className="not-italic">Source: </span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="not-italic text-surface-700 underline decoration-surface-300 underline-offset-2 hover:text-surface-900 hover:decoration-surface-500"
              >
                {formatSourceHost(sourceUrl)}
              </a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
