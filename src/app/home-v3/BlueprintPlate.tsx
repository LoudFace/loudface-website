import type { Plate } from './_plates';
import type { HomeV3Plate } from '@/lib/content-utils';

/**
 * BlueprintPlate — one engineering-manual figure plate (the LoudFace
 * blueprint-figures house style). The SVG is a client-approved artifact, kept
 * verbatim via dangerouslySetInnerHTML rather than hand-converted to JSX
 * (camelCasing 250+ lines of SVG would only add risk). Plate furniture
 * (FIG number, object meta, year) rides inside the injected markup; the
 * caption text comes from content (src/data/content/homepage-v3.json,
 * problem.plates), kept as HTML strings to preserve the &mdash;/&rsquo;
 * entities verbatim. Five plates → this one component + a data array.
 */
export function BlueprintPlate({ p, content }: { p: Plate; content: HomeV3Plate }) {
  return (
    <figure className={`fig rv${p.wide ? ' wide' : ''}`} style={{ transitionDelay: p.delay }}>
      <div className="plate" dangerouslySetInnerHTML={{ __html: p.plate }} />
      <figcaption>
        <h3 dangerouslySetInnerHTML={{ __html: content.heading }} />
        <p dangerouslySetInnerHTML={{ __html: content.body }} />
      </figcaption>
    </figure>
  );
}
