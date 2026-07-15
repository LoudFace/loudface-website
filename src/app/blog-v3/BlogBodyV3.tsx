/**
 * BlogBodyV3 — renders the raw Sanity body HTML into the v3 `.prose` reading
 * system (70ch measure / 1.75 leading), preserving the visuals[] splice pipeline
 * (illustration / chart / screenshot at hero / after-h2 / end anchors — 4% of
 * posts). We render into a FRESH `.prose` class (never `.blog-prose`) so the old
 * template's global `.blog-prose` rules can't bleed in.
 *
 * Common case (no visuals, 96%): a single `.prose` node — every element is a
 * direct child, so `.prose > * + *` spacing chains cleanly. Visuals case: the
 * body is split at H2 boundaries; each segment is a `.pblock` (its own internal
 * spacing rule) so spacing survives the splice, and visuals sit between segments.
 */
import { Fragment } from 'react';
import type { BlogVisual as BlogVisualType } from '@/lib/types';
import { BlogVisual } from '@/components/blog';

interface BlogBodyV3Props {
  html: string;
  visuals?: BlogVisualType[];
}

export function BlogBodyV3({ html, visuals }: BlogBodyV3Props) {
  const list = visuals ?? [];

  if (list.length === 0) {
    return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const segments = splitAtH2(html);
  const heroVisuals = list.filter((v) => v.position?.anchor === 'hero');
  const endVisuals = list.filter((v) => v.position?.anchor === 'end');
  const afterH2 = (h2Index: number) =>
    list.filter((v) => v.position?.anchor === 'after-h2' && v.position.h2Index === h2Index);

  return (
    <div className="prose">
      {segments.map((segment, i) => (
        <Fragment key={`seg-${i}`}>
          <div className="pblock" dangerouslySetInnerHTML={{ __html: segment }} />
          {i === 0 && heroVisuals.map((v) => <Figure key={keyFor(v)} visual={v} />)}
          {i > 0 && afterH2(i).map((v) => <Figure key={keyFor(v)} visual={v} />)}
        </Fragment>
      ))}
      {endVisuals.map((v) => <Figure key={keyFor(v)} visual={v} />)}
    </div>
  );
}

function Figure({ visual }: { visual: BlogVisualType }) {
  return (
    <div className="figure">
      <BlogVisual visual={visual} />
    </div>
  );
}

function keyFor(v: BlogVisualType): string {
  return v._key ?? `${v.type}-${v.position?.anchor}-${v.position?.h2Index ?? 'x'}-${v.alt.slice(0, 20)}`;
}

/** Split HTML into segments at each <h2>: segments[0] = intro, segments[i>0] = ith H2 section. */
function splitAtH2(html: string): string[] {
  if (!html) return [''];
  const indices: number[] = [];
  const re = /<h2\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) indices.push(m.index);
  if (indices.length === 0) return [html];
  const out = [html.slice(0, indices[0])];
  for (let i = 0; i < indices.length; i++) {
    out.push(html.slice(indices[i], i + 1 < indices.length ? indices[i + 1] : html.length));
  }
  return out;
}
