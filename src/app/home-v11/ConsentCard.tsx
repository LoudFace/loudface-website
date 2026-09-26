import Link from 'next/link';
import type { Ref } from 'react';
import type { ConsentContent } from '@/lib/content-utils';
import { LfMark } from './ui';
import './chrome.css';

/**
 * The cookie notice in v11 (2026-09-26): a white card in the lower-left corner on a computer, a bar across the
 * bottom on a phone whose explanation opens from its title. Behaviour stays in ConsentManager, which renders this on
 * v11 routes; the copy is the live banner's, moved to consent.json. Mobbin has almost no consent banners (its captures
 * hide them), so the card follows the v11 parts instead: the brand mark, two pills of equal weight (accepting and
 * declining are equally easy, as consent rules ask), the soft shadow of
 * the menus (tiles 242 Dropbox and 251 Mistral in design-lab/harvest/2026-09-26/chrome for the small floating card).
 * `preview` draws it in place, for the kit and the chrome board.
 */
export function ConsentCardV11({ c, gpc = false, expanded = false, onToggle, onAccept, onDecline, detailId, cardRef, preview = false }: {
  c: ConsentContent;
  gpc?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  detailId: string;
  cardRef?: Ref<HTMLDivElement>;
  preview?: boolean;
}) {
  return (
    <div
      ref={cardRef}
      role="region"
      aria-label="Cookie consent"
      className={`v11-consent${expanded ? ' is-expanded' : ''}${preview ? ' is-static' : ''}`}
    >
      <div className="v11-consent-head"><LfMark size={20} /><span>{c.title}</span></div>
      <p id={detailId} className="v11-consent-text" data-paper-runs="">
        <span>{c.detailLead}</span> <Link href="/cookies">{c.policyLink}</Link><span>{gpc ? c.gpcNote : c.policyEnd}</span>
      </p>
      <div className="v11-consent-acts">
        <button type="button" className="v11-consent-toggle" aria-expanded={expanded} aria-controls={detailId} onClick={onToggle}>
          <span>{c.title}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        <button type="button" className="v11-consent-btn" onClick={onAccept}>{c.accept}</button>
        <button type="button" className="v11-consent-btn" onClick={onDecline}>{c.decline}</button>
      </div>
    </div>
  );
}
