/**
 * BlogContent — renders a blog post body with visuals spliced in at H2 boundaries.
 *
 * Approach:
 *   1. Split the processed HTML at each H2 opening tag.
 *   2. Between chunks, render any visuals whose `position.anchor === 'after-h2'`
 *      with `h2Index` matching that boundary.
 *   3. Hero visuals render before all content; `end` visuals render after.
 *
 * This runs at request time but the splitting is pure string work — no client JS.
 */

import type { BlogVisual as BlogVisualType } from '@/lib/types';
import { BlogVisual } from './BlogVisual';

interface BlogContentProps {
  html: string;
  visuals?: BlogVisualType[];
}

export function BlogContent({ html, visuals }: BlogContentProps) {
  const segments = splitAtH2(html);
  const list = visuals ?? [];

  const heroVisuals = list.filter((v) => v.position?.anchor === 'hero');
  const endVisuals = list.filter((v) => v.position?.anchor === 'end');
  const afterH2Visuals = (h2Index: number) =>
    list.filter(
      (v) => v.position?.anchor === 'after-h2' && v.position.h2Index === h2Index,
    );

  return (
    <>
      {heroVisuals.map((v) => (
        <BlogVisual key={keyFor(v)} visual={v} priority />
      ))}

      {segments.map((segment, i) => {
        // Segment i corresponds to "after H2 #i":
        //   - i=0 is the content before the first H2 (intro).
        //   - i>0 is the content of the ith H2 section. Visuals for H2 #i render
        //     after its content (before the next H2 opening tag).
        const visualsAfterThisSection = i > 0 ? afterH2Visuals(i) : [];

        return (
          <section key={`seg-${i}`}>
            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: segment }} />
            {visualsAfterThisSection.map((v) => (
              <BlogVisual key={keyFor(v)} visual={v} />
            ))}
          </section>
        );
      })}

      {endVisuals.map((v) => (
        <BlogVisual key={keyFor(v)} visual={v} />
      ))}
    </>
  );
}

function keyFor(v: BlogVisualType): string {
  return v._key ?? `${v.type}-${v.position.anchor}-${v.position.h2Index ?? 'x'}-${v.alt.slice(0, 20)}`;
}

/**
 * Splits HTML into segments divided at H2 opening tags.
 * Each segment except the first begins with the H2 that introduces it.
 *
 * Returns N segments for an article with N-1 H2s:
 *   - segments[0] = intro (before the first H2)
 *   - segments[i] (i>0) = the ith H2 heading + its section content
 */
function splitAtH2(html: string): string[] {
  if (!html) return [''];

  const segments: string[] = [];
  const h2Regex = /<h2\b/gi;
  const indices: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = h2Regex.exec(html)) !== null) {
    indices.push(match.index);
  }

  if (indices.length === 0) return [html];

  segments.push(html.slice(0, indices[0]));
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i];
    const end = i + 1 < indices.length ? indices[i + 1] : html.length;
    segments.push(html.slice(start, end));
  }

  return segments;
}
