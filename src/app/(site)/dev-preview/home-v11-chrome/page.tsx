import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import './chrome-board.css';
import { Header } from '@/components/Header';
import { asset } from '@/lib/assets';
import { getConsentContent, getHomeV11Content, getNavContent } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { HeroV11 } from '../../../home-v11/HeroV11';
import { LogoGrid } from '../../../home-v11/LogoGrid';
import { ConsentCardV11 } from '../../../home-v11/ConsentCard';
import { PhoneMenuV11 } from '../../../home-v11/NavV11';
import { getNavV11Data } from '../../../home-v11/nav-data';

export const metadata: Metadata = { title: 'v11 site chrome', robots: { index: false, follow: false } };
export const revalidate = 3600;

/**
 * The v11 site chrome drawn open, for its Paper boards (2026-09-26): the Services menu over the homepage hero, the
 * Industries menu over a light page, the cookie card, and (at ?view=phone, imported at 390 wide) the phone menu and
 * the phone cookie bar. Every part is the real component the header renders on v11 routes.
 */
export default async function ChromePreview({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const [{ view }, nav, home, consent, data] = await Promise.all([searchParams, getNavContent(), getHomeV11Content(), getConsentContent(), getHomeV11Data()]);
  const navV11 = await getNavV11Data();

  if (view === 'phone') {
    const Bar = () => (
      <div className="cb-phone-bar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset('/images/loudface.svg')} alt="LoudFace" width={110} height={22} />
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="#1a1040" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </div>
    );
    return (
      <div className="v11 v11-chrome-board is-phone">
        <p className="cb-phone-k">Phone menu · Services open</p>
        <div className="cb-phone"><Bar /><PhoneMenuV11 links={nav.links} services={nav.dropdowns.services} industries={nav.dropdowns.industries} v11={navV11} ctaText={nav.ctaText} open="services" /></div>
        <p className="cb-phone-k">Phone menu · Industries open</p>
        <div className="cb-phone"><Bar /><PhoneMenuV11 links={nav.links} services={nav.dropdowns.services} industries={nav.dropdowns.industries} v11={navV11} ctaText={nav.ctaText} open="industries" /></div>
        <p className="cb-phone-k">Cookie bar · closed, then opened</p>
        <div className="cb-phone-consent">
          <ConsentCardV11 c={consent} detailId="cb-consent-phone-1" preview />
          <ConsentCardV11 c={consent} detailId="cb-consent-phone-2" preview expanded />
        </div>
      </div>
    );
  }

  return (
    <div className="v11 v11-chrome-board">
      <section className="cb-label">
        <div className="v11-wrap">
          <b>Site chrome</b>
          <span>The header&rsquo;s menus and the cookie card, drawn open. Source: src/app/home-v11/NavV11.tsx, ConsentCard.tsx, chrome.css. Live only on v11 routes until go-live (src/lib/v11-routes.ts).</span>
        </div>
      </section>

      {/* 1 · Services, over the homepage hero */}
      <section className="cb-frame is-stage" aria-label="Services menu, open">
        <HeroV11 c={home.hero} data={data} />
        <div className="cb-bar"><Header heroTheme="dark" content={nav} v11={navV11} initialOpen="services" /></div>
      </section>

      {/* 2 · Industries, over a light page */}
      <section className="cb-frame is-light" aria-label="Industries menu, open">
        <div className="cb-bar"><Header heroTheme="dark" content={nav} v11={navV11} initialOpen="industries" /></div>
      </section>

      {/* 3 · the cookie card, lower left, over a page */}
      <section className="cb-frame is-page" aria-label="Cookie card">
        <LogoGrid c={home.logos} />
        <div className="cb-consent"><ConsentCardV11 c={consent} detailId="cb-consent-desk" preview /></div>
      </section>
    </div>
  );
}
