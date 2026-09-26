import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../home-v11-chrome/chrome-board.css';
import '../../../home-v11/menu-concepts/menu-concepts.css';
import { getMenuConceptBoard, MenuFrame } from '../../../home-v11/menu-concepts/Board';
import {
  IndustriesA, IndustriesB, IndustriesC, ServicesA, ServicesB, ServicesC,
} from '../../../home-v11/menu-concepts/MenuConcepts';

export const metadata: Metadata = { title: 'Menu directions', robots: { index: false, follow: false } };
export const revalidate = 3600;

/**
 * The three menu directions drawn open, for their Paper board (2026-09-26): each direction's Services menu over the
 * homepage hero and its Industries menu over a light page, under the real header. MenuConcepts.tsx holds the parts.
 * Arnel picked C on 2026-09-27; its icon styles are on /dev-preview/menu-icons.
 */
export default async function MenuConceptsPreview() {
  const board = await getMenuConceptBoard();
  const p = board.props;
  return (
    <div className="v11 v11-chrome-board mc-board">
      <section className="cb-label">
        <div className="v11-wrap">
          <b>Menus · three directions</b>
          <span>No stock icons in any of them. A: type-led rows, the picture in the featured card (Stripe, Linear, Attio). B: a real picture of what each column delivers (Figma, Pitch, Airtable). C: a plain list beside one large preview of what you point at (Stripe, Vercel). Words and pictures are the site&rsquo;s own.</span>
        </div>
      </section>
      <MenuFrame board={board} kind="services" label="A · Type-led rows · Services"><ServicesA {...p} /></MenuFrame>
      <MenuFrame board={board} kind="industries" label="A · Type-led rows · Industries"><IndustriesA {...p} /></MenuFrame>
      <MenuFrame board={board} kind="services" label="B · A picture per column · Services"><ServicesB {...p} /></MenuFrame>
      <MenuFrame board={board} kind="industries" label="B · A picture per column · Industries"><IndustriesB {...p} /></MenuFrame>
      <MenuFrame board={board} kind="services" label="C · List and live preview · Services (pointing at CRO)"><ServicesC {...p} /></MenuFrame>
      <MenuFrame board={board} kind="industries" label="C · List and live preview · Industries (pointing at Fintech)"><IndustriesC {...p} /></MenuFrame>
    </div>
  );
}
