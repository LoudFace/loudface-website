import { heroImage } from '@/lib/image-utils';
import type { BlogVisual } from '@/lib/types';

interface BlogIllustrationProps {
  visual: BlogVisual;
  priority?: boolean;
}

export function BlogIllustration({ visual, priority }: BlogIllustrationProps) {
  const src = visual.asset?.url;
  if (!src) return null;

  const img = heroImage(src);

  return (
    <figure className={priority ? 'my-6' : 'my-10'} aria-label={visual.alt}>
      <img
        src={img.src}
        srcSet={img.srcset}
        sizes="(min-width: 1024px) 720px, (min-width: 768px) 90vw, 100vw"
        alt={visual.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className="w-full rounded-xl"
      />
      {visual.caption && (
        <figcaption className="mt-3 text-sm text-surface-500 text-center italic">
          {visual.caption}
        </figcaption>
      )}
    </figure>
  );
}
