/**
 * Concept B preview for the /methodology design gate. Lives under
 * (site)/dev-preview so it renders with the real site chrome, real tokens and
 * real fonts, exactly like the other concept previews in this folder. Not
 * indexed, not linked from anywhere, and it never touches the live route.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../methodology-v3/methodology-base.css';
import '../../../methodology-v3/concept-b.css';
import { MethodologyConceptB } from '../../../methodology-v3/concepts/ConceptB';
import { MethodologyScripts } from '../../../methodology-v3/Scripts';

export const metadata: Metadata = {
  title: 'Methodology concept B',
  robots: { index: false, follow: false },
};

export default function MethodologyConceptBPreview() {
  return (
    <div className="mth mth-b">
      <MethodologyConceptB />
      <MethodologyScripts />
    </div>
  );
}
