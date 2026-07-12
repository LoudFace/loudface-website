import type { Plate } from './_plates';

/**
 * BlueprintPlate — one engineering-manual figure plate (the LoudFace
 * blueprint-figures house style). The SVG is a client-approved artifact, kept
 * verbatim via dangerouslySetInnerHTML rather than hand-converted to JSX
 * (camelCasing 250+ lines of SVG would only add risk). Plate furniture
 * (FIG number, object meta, year) rides inside the injected markup; the
 * caption is structured JSX. Five plates → this one component + a data array.
 */
export function BlueprintPlate({ p }: { p: Plate }) {
  return (
    <figure className={`fig rv${p.wide ? ' wide' : ''}`} style={{ transitionDelay: p.delay }}>
      <div className="plate" dangerouslySetInnerHTML={{ __html: p.plate }} />
      <figcaption>
        <h3 dangerouslySetInnerHTML={{ __html: p.h3 }} />
        <p dangerouslySetInnerHTML={{ __html: p.p }} />
      </figcaption>
    </figure>
  );
}
