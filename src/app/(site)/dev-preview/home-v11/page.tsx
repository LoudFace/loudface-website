import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import { getHomeV11Content } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { HeroV11 } from '../../../home-v11/HeroV11';
import { LogoGrid } from '../../../home-v11/LogoGrid';
import { Bento } from '../../../home-v11/Bento';
import { Results } from '../../../home-v11/Results';
import { Route } from '../../../home-v11/Route';
import { GrowthPlan } from '../../../home-v11/GrowthPlan';
import { Testimonials } from '../../../home-v11/Testimonials';
import { Team } from '../../../home-v11/Team';
import { Closing } from '../../../home-v11/Closing';
import { FooterV11 } from '../../../home-v11/FooterV11';
import { Reveal } from '../../../home-v11/Reveal';

export const metadata: Metadata = {
  title: 'Homepage v11 — chapters, with the numbers',
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

/**
 * Homepage v11 — M v5 from the 2026-09-23 Paper round ("Chapters, with the numbers", no generic white cards).
 *
 * Asset plan (section : non-DOM asset : reference):
 *   hero          · phone photograph + six live case charts with the start pin · proposal case charts
 *   trusted by    · client logos on the crosshair grid, hover opens the case     · Mobbin logo grids
 *   what we do    · ChatGPT answer UI at true size + three photographs          · round-4 N bento
 *   results       · four Search Console / Peec AI charts with pins            · proposal case charts
 *   how it runs   · drawn route map with four UI fragments                      · round-4 N route
 *   plan + report · the monthly report with its plan strip, on a colour plate   · Linear roadmap
 *   clients say   · three video stills + client-colour result cards            · round-4 M
 *   team          · seven portraits                                             · —
 *   closing       · 3D terrain render + booking UI                              · round-4 K terrain
 *   footer        · the wordmark as the graphic, SVG flags                      · Slush
 */
export default async function HomeV11Preview() {
  const [c, data] = await Promise.all([getHomeV11Content(), getHomeV11Data()]);
  return (
    <div className="v11">
      <HeroV11 c={c.hero} data={data} />
      <LogoGrid c={c.logos} />
      <Bento c={c.bento} />
      <Results c={c.results} data={data} />
      <Route c={c.route} spark={data?.results.delshad ?? null} />
      <GrowthPlan c={c.plan} />
      <Testimonials c={c.testimonials} />
      <Team c={c.team} />
      <Closing c={c.closing} />
      <FooterV11 c={c.footer} ratings={c.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
