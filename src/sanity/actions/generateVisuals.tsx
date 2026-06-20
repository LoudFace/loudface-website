import type { DocumentActionComponent, DocumentActionProps } from 'sanity';

/**
 * Sanity Studio "Generate visuals" action.
 *
 * Appears next to Publish on `blogPost` and `caseStudy` documents. When the
 * editor clicks it, opens the loudface-visuals trigger page in a new tab —
 * pre-filled with the document's `_type` and `_id`. The visuals tool handles
 * everything else (auth gate, workspace lookup, pipeline run, draft write).
 *
 * The visuals tool URL comes from `NEXT_PUBLIC_VISUALS_STUDIO_URL`. Defaults
 * to `http://localhost:3010` so the action works as soon as you spin up
 * loudface-visuals locally — no env needed. Override in production to the
 * deployed instance (e.g. `https://visuals.loudface.co`).
 */

const VISUALS_STUDIO_URL =
  process.env.NEXT_PUBLIC_VISUALS_STUDIO_URL || 'http://localhost:3010';

export const generateVisualsAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  // Only show on docs that have actually been saved (need an _id to trigger).
  // The published doc id is in `published`, the draft id has the `drafts.`
  // prefix — we strip it because the trigger page resolves drafts via Sanity's
  // perspective='raw' anyway. Always pass the published-style _id so it round-trips
  // through URLs without escaping the `.`.
  const docId = props.published?._id ?? props.draft?._id ?? props.id;
  const cleanId = String(docId ?? '').replace(/^drafts\./, '');

  const disabled = !cleanId;

  const handle = () => {
    const url = new URL('/trigger', VISUALS_STUDIO_URL);
    url.searchParams.set('cms', 'sanity');
    url.searchParams.set('type', props.type);
    url.searchParams.set('id', cleanId);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  return {
    label: 'Generate visuals',
    icon: () => '✨',
    onHandle: handle,
    disabled,
    tone: 'primary',
    shortcut: undefined,
  };
};
