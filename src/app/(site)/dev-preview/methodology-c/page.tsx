/**
 * Concept C preview for the /methodology design gate. Same arrangement as
 * concept B's preview: real chrome, real tokens, noindex, never touches the
 * live route.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../methodology-v3/methodology-base.css';
import '../../../methodology-v3/concept-c.css';
import { MethodologyConceptC } from '../../../methodology-v3/concepts/ConceptC';
import { MethodologyScripts } from '../../../methodology-v3/Scripts';

export const metadata: Metadata = {
  title: 'Methodology concept C',
  robots: { index: false, follow: false },
};

export default function MethodologyConceptCPreview() {
  return (
    <div className="mth mth-c">
      <MethodologyConceptC />
      <MethodologyScripts />
    </div>
  );
}
