/**
 * Concept A preview, the losing concept, kept so the three comparison links
 * stay live after the pick. The live /methodology route now composes concept B
 * (with concept A's short-answer block inside it). This preview and the two
 * beside it come out in a later commit.
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
