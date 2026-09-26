'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import { ChatWindow } from './Bento';
import { CLIENT_LOGOS } from './LogoGrid';
import { ArrowRight, img } from './ui';
import './chrome.css';

/**
 * The v11 site menus (2026-09-26): the Services and Industries panels under the header, and the phone menu. Tiles
 * from design-lab/harvest/2026-09-26/chrome: 37 Intercom Solutions (icon rows beside a featured card with real UI),
 * 35 Intercom Resources (a footer with people), 44 Intercom Platform (the product picture inside the menu). Every
 * featured card carries a picture that explains the menu: the answer window for Services, client proof for
 * Industries. Industry rows name only the industry (2026-09-26, Arnel: a client name under each industry read as a
 * case study link); the clients stay in the featured card. Copy: nav.json (the live dropdown items plus the `v11` block) and the homepage's AI-answers tile.
 * 2026-09-27 (Arnel picked menu A with isometric icons on the Paper page "Menus · pick one"): type-led rows on hairline
 * columns, each led by an Isocons isometric line drawing in indigo (public/images/home-v11/menu-icons/iso, one per page,
 * CC BY 4.0, credited in the footer); each industry shows the buyer question its page answers.
 */

export interface NavItem { title: string; description: string; href: string }
export interface NavDropdown { label: string; description: string; items: NavItem[] }
export interface NavIndustry { label: string; href: string }
export interface NavCta { prompt: string; action: string }
export interface NavGroup { label: string; hrefs: string[] }
export interface NavV11Data {
  /** The services in three labelled columns, by page; every service in the live dropdown appears once. */
  serviceGroups: NavGroup[];
  /** The industries in two labelled groups, by page. */
  industryGroups: NavGroup[];
  industries: NavIndustry[];
  allIndustries: string;
  allIndustriesHref: string;
  clientsTag: string;
  clientsBig: string;
  clientsCap: string;
  clientsLink: string;
  clientsHref: string;
  /** The homepage's AI-answers tile (home-v11.json bento.tiles[0]) and its answer window (bento.chat). */
  feature: HomeV11Content['bento']['tiles'][number] & { chat: HomeV11Content['bento']['chat'] };
  /** The buyer question each industry page answers, by page (nav-data.ts reads them from the pages' own content). */
  questions?: Record<string, string>;
}

/** The page's isometric line drawing (Isocons, recoloured to our indigo), named after the page's slug. */
function MenuIcon({ href, size = 32 }: { href: string; size?: number }) {
  return (
    <span className="v11-nav-ico" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img loading="lazy" src={img(`menu-icons/iso/${href.split('/').pop()}.svg`)} alt="" width={size} height={size} />
    </span>
  );
}

/** The entries a group names, in the group's order. */
function pick<T extends { href: string }>(items: T[], hrefs: string[]): T[] {
  const byHref = new Map(items.map((i) => [i.href, i]));
  return hrefs.map((h) => byHref.get(h)).filter((i): i is T => !!i);
}

/** The people a visitor would talk to, the same four as the homepage's team section. */
const FACES = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];
/** Six clients from the homepage logo grid, at the grid's own sizes. */
const PROOF_LOGOS = ['Toku', 'Dimer Health', 'Ceipal', 'Hoxhunt', 'Montblanc', 'Eraser'];

function Foot({ cta, onPick }: { cta: NavCta; onPick?: () => void }) {
  return (
    <div className="v11-nav-foot">
      <span className="v11-nav-faces" aria-hidden="true">
        {FACES.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" key={f} src={img(`avatars/${f}.png`)} alt="" width={26} height={26} />
        ))}
      </span>
      <span className="v11-nav-prompt">{cta.prompt}</span>
      <button type="button" data-cal-trigger="" className="v11-nav-go" onClick={onPick}>{cta.action}</button>
    </div>
  );
}

export function ServicesPanelV11({ dropdown, v11, cta, onPick }: { dropdown: NavDropdown; v11: NavV11Data; cta: NavCta; onPick?: () => void }) {
  const f = v11.feature;
  return (
    <div className="v11-nav-panel">
      <div className="v11-nav-main">
        <div className="v11-nav-head"><b>{dropdown.label}</b><span>{dropdown.description}</span></div>
        <div className="v11-nav-groups">
          {v11.serviceGroups.map((g) => (
            <div key={g.label} className="v11-nav-group">
              <span className="v11-nav-group-k">{g.label}</span>
              {pick(dropdown.items, g.hrefs).map((item) => (
                <Link key={item.href} href={item.href} className="v11-nav-item" role="menuitem" onClick={onPick}>
                  <MenuIcon href={item.href} />
                  <span className="v11-nav-text"><b><span>{item.title}</span><ArrowRight /></b><span className="v11-nav-sub">{item.description}</span></span>
                </Link>
              ))}
            </div>
          ))}
        </div>
        <Foot cta={cta} onPick={onPick} />
      </div>
      <div className="v11-nav-feature is-lav">
        <div className="v11-nav-tag"><i />{f.label}</div>
        <p className="v11-nav-feature-h">{f.heading}</p>
        <div className="v11-nav-fig"><b>{f.metric}</b><span>{f.caption}</span></div>
        <div className="v11-nav-ui"><ChatWindow c={f.chat} /></div>
      </div>
    </div>
  );
}

export function IndustriesPanelV11({ dropdown, v11, cta, onPick }: { dropdown: NavDropdown; v11: NavV11Data; cta: NavCta; onPick?: () => void }) {
  const logos = CLIENT_LOGOS.filter((l) => l.logo && PROOF_LOGOS.includes(l.alt));
  return (
    <div className="v11-nav-panel">
      <div className="v11-nav-main">
        <div className="v11-nav-head"><b>{dropdown.label}</b><span>{dropdown.description}</span></div>
        <div className="v11-nav-groups is-ind">
          {v11.industryGroups.map((g, gi) => (
            <div key={g.label} className={`v11-nav-group ${gi === 0 ? 'is-wide' : ''}`}>
              <span className="v11-nav-group-k">{g.label}</span>
              <div className="v11-nav-rows">
                {pick(v11.industries, g.hrefs).map((it) => (
                  <Link key={it.href} href={it.href} className="v11-nav-item" role="menuitem" onClick={onPick}>
                    <MenuIcon href={it.href} />
                    <span className="v11-nav-text">
                      <b><span>{it.label}</span><ArrowRight /></b>
                      {v11.questions?.[it.href] && <span className="v11-nav-sub is-q">{v11.questions[it.href]}</span>}
                    </span>
                  </Link>
                ))}
                {gi === v11.industryGroups.length - 1 && (
                  <Link href={v11.allIndustriesHref} className="v11-nav-all" role="menuitem" onClick={onPick}>
                    <span>{v11.allIndustries}</span><ArrowRight />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        <Foot cta={cta} onPick={onPick} />
      </div>
      <div className="v11-nav-feature is-warm">
        <div className="v11-nav-tag"><i />{v11.clientsTag}</div>
        <div className="v11-nav-big">{v11.clientsBig}</div>
        <p className="v11-nav-cap">{v11.clientsCap}</p>
        <div className="v11-nav-logos">
          {logos.map((l) => (
            // eslint-disable-next-line @next/next/no-img-element
            <span key={l.alt}><img loading="lazy" src={img(l.logo as string)} alt={l.alt} width={l.w} height={l.h} style={{ width: l.w, height: l.h }} /></span>
          ))}
        </div>
        <Link href={v11.clientsHref} className="v11-nav-link" onClick={onPick}><span>{v11.clientsLink}</span><ArrowRight /></Link>
      </div>
    </div>
  );
}

/** The phone menu's open/closed chevron. Declared here, not inside the menu, so a toggle turns it instead of re-creating it. */
function Chevron({ on }: { on: boolean }) {
  return (
    <svg className={on ? 'is-on' : ''} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The phone menu body: the page links, then Services and Industries as sections that open in place, then the call.
 * `open` sets which section starts open (a preview shows one open).
 */

export function PhoneMenuV11({ links, services, industries, v11, ctaText, onPick, open: initial = null }: {
  links: { label: string; href: string }[];
  services: NavDropdown;
  industries: NavDropdown;
  v11: NavV11Data;
  ctaText: string;
  onPick?: () => void;
  open?: 'services' | 'industries' | null;
}) {
  const [open, setOpen] = useState<'services' | 'industries' | null>(initial);
  const toggle = (k: 'services' | 'industries') => setOpen(open === k ? null : k);
  return (
    <div className="v11-nav-phone">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="v11-nav-phone-link" onClick={onPick}>{l.label}</Link>
      ))}
      <div className="v11-nav-phone-group">
        <button type="button" className="v11-nav-phone-link" aria-expanded={open === 'services'} onClick={() => toggle('services')}>
          <span>{services.label}</span><Chevron on={open === 'services'} />
        </button>
        {open === 'services' && (
          <div className="v11-nav-phone-list">
            {v11.serviceGroups.map((g) => (
              <div key={g.label} className="v11-nav-phone-sub">
                <span className="v11-nav-group-k">{g.label}</span>
                {pick(services.items, g.hrefs).map((item) => (
                  <Link key={item.href} href={item.href} className="v11-nav-phone-item" onClick={onPick}>
                    <MenuIcon href={item.href} size={28} />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="v11-nav-phone-group">
        <button type="button" className="v11-nav-phone-link" aria-expanded={open === 'industries'} onClick={() => toggle('industries')}>
          <span>{industries.label}</span><Chevron on={open === 'industries'} />
        </button>
        {open === 'industries' && (
          <div className="v11-nav-phone-list">
            {v11.industryGroups.map((g) => (
              <div key={g.label} className="v11-nav-phone-sub">
                <span className="v11-nav-group-k">{g.label}</span>
                {pick(v11.industries, g.hrefs).map((it) => (
                  <Link key={it.href} href={it.href} className="v11-nav-phone-item" onClick={onPick}>
                    <MenuIcon href={it.href} size={28} />
                    <span>{it.label}</span>
                  </Link>
                ))}
              </div>
            ))}
            <Link href={v11.allIndustriesHref} className="v11-nav-phone-item is-all" onClick={onPick}>
              <span>{v11.allIndustries}</span><ArrowRight />
            </Link>
          </div>
        )}
      </div>
      <button type="button" data-cal-trigger="" className="v11-nav-phone-cta" onClick={onPick}>{ctaText}</button>
    </div>
  );
}
