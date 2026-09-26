import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../home-v11-chrome/chrome-board.css';
import '../../../home-v11/menu-concepts/menu-concepts.css';
import { getMenuConceptBoard, MenuFrame } from '../../../home-v11/menu-concepts/Board';
import { IndustriesA, IndustriesB, ServicesA, IndustriesC, ServicesB, ServicesC } from '../../../home-v11/menu-concepts/MenuConcepts';

export const metadata: Metadata = { title: 'Menu icons', robots: { index: false, follow: false } };
export const revalidate = 3600;

/**
 * Menu C (Arnel's pick, 2026-09-27) with the two icon styles that held up at menu size, for their Paper board.
 * Arnel picked A with the isometric icons on 2026-09-27; the app-tile set (Phosphor) lost and was deleted.
 * Tried and dropped earlier: Rune Icons' glass set (grey and faint on a white panel), Phosphor duotone and Lucide (the plain
 * line look Arnel called generic). Icon files: public/images/home-v11/menu-icons/{iso,tile}.
 */
export default async function MenuIconsPreview() {
  const board = await getMenuConceptBoard();
  const p = board.props;
  return (
    <div className="v11 v11-chrome-board mc-board">
      <section className="cb-label">
        <div className="v11-wrap">
          <b>Menu icons · A, B and C</b>
          <span>Top: menus A and B with the isometric icons (Arnel, 2026-09-27). Below, C with both styles. 1: isometric line drawings from Isocons, recoloured to our indigo; free to use with a credit line. 2: solid glyphs from Phosphor on an indigo tile, like app icons. Both cover all 20 pages with one drawing each. The list, the preview and the words are C as picked.</span>
        </div>
      </section>
      <MenuFrame board={board} kind="services" label="A · Type-led rows, with isometric icons · Services"><ServicesA {...p} icons="iso" /></MenuFrame>
      <MenuFrame board={board} kind="industries" label="A · Type-led rows, with isometric icons · Industries"><IndustriesA {...p} icons="iso" /></MenuFrame>
      <MenuFrame board={board} kind="services" label="B · A picture per column, with isometric icons · Services"><ServicesB {...p} icons="iso" /></MenuFrame>
      <MenuFrame board={board} kind="industries" label="B · A picture per column, with isometric icons · Industries"><IndustriesB {...p} icons="iso" /></MenuFrame>
      <MenuFrame board={board} kind="services" label="1 · Isometric line icons · Services (pointing at CRO)"><ServicesC {...p} icons="iso" /></MenuFrame>
      <MenuFrame board={board} kind="industries" label="1 · Isometric line icons · Industries (pointing at Fintech)"><IndustriesC {...p} icons="iso" /></MenuFrame>
    </div>
  );
}
