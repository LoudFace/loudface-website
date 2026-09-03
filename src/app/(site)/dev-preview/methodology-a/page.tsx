/**
 * Concept A preview. The live /methodology route currently composes concept A,
 * so this exists purely so all three concepts can be screenshotted and compared
 * from the same kind of URL during the design gate.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../methodology-v3/methodology-base.css';
import '../../../methodology-v3/concept-a.css';
import { MethodologyConceptA } from '../../../methodology-v3/concepts/ConceptA';
import { MethodologyScripts } from '../../../methodology-v3/Scripts';

export const metadata: Metadata = {
  title: 'Methodology concept A',
  robots: { index: false, follow: false },
};

export default function MethodologyConceptAPreview() {
  return (
    <div className="mth mth-a">
      <MethodologyConceptA />
      <MethodologyScripts />
    </div>
  );
}
