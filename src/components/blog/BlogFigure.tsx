/**
 * BlogFigure — a figure the Team App drew as markup (blogVisual type "figure"). The block carries its own CSS,
 * inline SVG and real text (title, numbers, labels), so readers, search and AI engines read the numbers and
 * the Team App stays the one owner of the look. It is a role="figure" group, not a <figure>, because the block
 * holds its own <figure class="fx">. Markup that fails lib/figure-markup.ts is not drawn.
 */

import type { BlogVisual } from '@/lib/types';
import { figureMarkupRefusal } from '@/lib/figure-markup';

export function BlogFigure({ visual }: { visual: BlogVisual }) {
  const markup = visual.figure?.markup;
  const refusal = figureMarkupRefusal(markup);
  if (refusal || !markup) {
    console.error(`BlogFigure: not drawn, the figure markup ${refusal ?? 'is empty'} (visual ${visual._key ?? visual.alt.slice(0, 40)})`);
    return null;
  }

  return (
    <div role="figure" aria-label={visual.alt} className="my-10">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      {visual.caption && <p className="mt-3 text-sm text-surface-500 text-center italic">{visual.caption}</p>}
    </div>
  );
}
