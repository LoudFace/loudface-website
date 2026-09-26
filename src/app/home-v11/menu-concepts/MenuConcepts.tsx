import Link from 'next/link';
import { cloneElement, isValidElement, type ReactNode } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import type { HomeV11Data } from '../data';
import type { NavDropdown, NavV11Data } from '../NavV11';
import { ChatWindow } from '../Bento';
import { CLIENT_LOGOS } from '../LogoGrid';
import { LiveChart } from '../LiveChart';
import { ArrowRight, img } from '../ui';
import { Browser } from '../../service-v11/kit';
import { SHOTS } from '../../service-v3/data';
import type { ServiceExtras } from '../../service-v11/types';

/**
 * Three directions for the header menus (2026-09-26, Arnel: "the iconography and stuff in the menus look very generic
 * compared to the rest of the high-quality design"). None uses a stock icon. References: design-lab/harvest/2026-09-26/
 * menus-live (A: Stripe, Linear, Attio; B: Figma, Pitch, Airtable; C: the hover preview of Stripe and Vercel).
 *   A · Type-led rows on hairlines; the picture lives in the featured card.
 *   B · Each column opens with a real picture of what that group delivers.
 *   C · A plain list beside one large preview of the item pointed at.
 * Every word is the live menu's (nav.json) or already on the site; every picture is ours. Static, for the Paper board.
 */

type Chat = HomeV11Content['bento']['chat'];
export interface MenuConceptProps {
  services: NavDropdown;
  industries: NavDropdown;
  v11: NavV11Data;
  cta: { prompt: string; action: string };
  home: HomeV11Content;
  data: HomeV11Data | null;
  /** The buyer's AI question for each industry page, by href (industry-v11.json chat, the article question tables). */
  questions: Record<string, string>;
  /** The answer window each industry page draws (industry-v11.json chat), by href. */
  chats: Record<string, Chat>;
  /** The CRO page's own hero picture and result card (service-v11/pages/cro.tsx), for C's preview. */
  cro: Pick<ServiceExtras, 'heroArt' | 'heroCard'>;
  /** Montblanc's site capture, for B's site column. */
  siteLabel: string;
}

const FACES = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];
const PROOF_LOGOS = ['Toku', 'Dimer Health', 'Ceipal', 'Hoxhunt', 'Montblanc', 'Eraser'];

function pick<T extends { href: string }>(items: T[], hrefs: string[]): T[] {
  const byHref = new Map(items.map((i) => [i.href, i]));
  return hrefs.map((h) => byHref.get(h)).filter((i): i is T => !!i);
}

function Drop({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className="v11-nav-drop is-open mc-drop">
      <div className={`v11-nav-panel ${className}`}>{children}</div>
    </div>
  );
}

function Head({ d }: { d: NavDropdown }) {
  return <div className="v11-nav-head"><b>{d.label}</b><span>{d.description}</span></div>;
}

function Foot({ cta }: { cta: MenuConceptProps['cta'] }) {
  return (
    <div className="v11-nav-foot">
      <span className="v11-nav-faces" aria-hidden="true">
        {FACES.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={f} src={img(`avatars/${f}.png`)} alt="" width={26} height={26} />
        ))}
      </span>
      <span className="v11-nav-prompt">{cta.prompt}</span>
      <span className="v11-nav-go">{cta.action}</span>
    </div>
  );
}

/**
 * The two icon styles tried on C (2026-09-27, Arnel: "some iconography would also help … very high and modern"):
 * `iso` is the Isocons isometric set (isocons.app, CC BY 4.0) drawn in indigo; `tile` is Phosphor's fill glyphs
 * (MIT) on an indigo tile. One file per page, named after the page's slug, in public/images/home-v11/menu-icons.
 */
export type MenuIconSet = 'iso' | 'tile';

function Ico({ href, set }: { href: string; set: MenuIconSet }) {
  const px = set === 'iso' ? 32 : 17;
  return (
    <span className={`mc-ico is-${set}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img(`menu-icons/${set}/${href.split('/').pop()}.svg`)} alt="" width={px} height={px} loading="lazy" />
    </span>
  );
}

/** A title and its one-liner (and, on B and C, its icon): the type does the hierarchy. `on` draws the pointed-at state. */
function Row({ title, sub, href, on, quote, ico }: { title: string; sub?: string; href: string; on?: boolean; quote?: boolean; ico?: MenuIconSet }) {
  return (
    <Link href={href} className={`mc-row ${on ? 'is-on' : ''} ${ico ? 'has-ico' : ''}`}>
      {ico && <Ico href={href} set={ico} />}
      {ico && sub ? (
        <span className="mc-row-txt">
          <b><span>{title}</span><ArrowRight /></b>
          <span className={quote ? 'is-q' : undefined}>{quote ? `“${sub}”` : sub}</span>
        </span>
      ) : (
        <>
          <b><span>{title}</span><ArrowRight /></b>
          {sub && <span className={quote ? 'is-q' : undefined}>{quote ? `“${sub}”` : sub}</span>}
        </>
      )}
    </Link>
  );
}

function ClientsCard({ v11 }: { v11: NavV11Data }) {
  const logos = CLIENT_LOGOS.filter((l) => l.logo && PROOF_LOGOS.includes(l.alt));
  return (
    <div className="v11-nav-feature is-warm">
      <div className="v11-nav-tag"><i />{v11.clientsTag}</div>
      <div className="v11-nav-big">{v11.clientsBig}</div>
      <p className="v11-nav-cap">{v11.clientsCap}</p>
      <div className="v11-nav-logos">
        {logos.map((l) => (
          // eslint-disable-next-line @next/next/no-img-element
          <span key={l.alt}><img src={img(l.logo as string)} alt={l.alt} width={l.w} height={l.h} style={{ width: l.w, height: l.h }} /></span>
        ))}
      </div>
      <Link href={v11.clientsHref} className="v11-nav-link"><span>{v11.clientsLink}</span><ArrowRight /></Link>
    </div>
  );
}

/* ============================================================ A · type-led */

export function ServicesA({ services, v11, cta, icons }: MenuConceptProps & { icons?: MenuIconSet }) {
  const f = v11.feature;
  return (
    <Drop className={`mc-a ${icons ? 'has-icons' : ''}`}>
      <div className="v11-nav-main">
        <Head d={services} />
        <div className="mc-cols is-3">
          {v11.serviceGroups.map((g) => (
            <div key={g.label} className="mc-col">
              <span className="mc-k">{g.label}</span>
              {pick(services.items, g.hrefs).map((it) => <Row key={it.href} title={it.title} sub={it.description} href={it.href} ico={icons} />)}
            </div>
          ))}
        </div>
        <Foot cta={cta} />
      </div>
      <div className="v11-nav-feature is-lav">
        <div className="v11-nav-tag"><i />{f.label}</div>
        <p className="v11-nav-feature-h">{f.heading}</p>
        <div className="v11-nav-fig"><b>{f.metric}</b><span>{f.caption}</span></div>
        <div className="v11-nav-ui"><ChatWindow c={f.chat} /></div>
      </div>
    </Drop>
  );
}

export function IndustriesA({ industries, v11, cta, questions, icons }: MenuConceptProps & { icons?: MenuIconSet }) {
  const [sector, stage] = v11.industryGroups;
  return (
    <Drop className={`mc-a ${icons ? 'has-icons' : ''}`}>
      <div className="v11-nav-main">
        <Head d={industries} />
        <div className="mc-cols is-ind">
          <div className="mc-col is-wide">
            <span className="mc-k">{sector.label}</span>
            <div className="mc-grid2">
              {pick(v11.industries, sector.hrefs).map((it) => <Row key={it.href} title={it.label} sub={questions[it.href]} href={it.href} quote ico={icons} />)}
            </div>
          </div>
          <div className="mc-col">
            <span className="mc-k">{stage.label}</span>
            {pick(v11.industries, stage.hrefs).map((it) => <Row key={it.href} title={it.label} sub={questions[it.href]} href={it.href} quote ico={icons} />)}
            <Link href={v11.allIndustriesHref} className="v11-nav-all"><span>{v11.allIndustries}</span><ArrowRight /></Link>
          </div>
        </div>
        <Foot cta={cta} />
      </div>
      <ClientsCard v11={v11} />
    </Drop>
  );
}

/* ============================================================ B · a real picture per column */

function Pic({ children, cap, className = '' }: { children: ReactNode; cap: string; className?: string }) {
  return (
    <figure className="mc-pic-fig">
      <div className={`mc-pic ${className}`}>{children}</div>
      <figcaption>{cap}</figcaption>
    </figure>
  );
}

export function ServicesB({ services, v11, cta, home, data, siteLabel, icons }: MenuConceptProps & { icons?: MenuIconSet }) {
  const f = v11.feature;
  const genie = home.hero.slides[1];
  const pics: Record<string, ReactNode> = {
    0: (
      <Pic cap={`${f.metric} ${f.caption}`} className="is-chat"><ChatWindow c={f.chat} /></Pic>
    ),
    1: (
      <Pic cap={`${genie.client}: ${genie.metric} ${genie.caption}`} className="is-chart">
        <div className="mc-chart-fig"><b>{genie.metric}</b><span>{genie.client}</span></div>
        {data && (
          <div className="mc-chart">
            <LiveChart series={data.hero.genie} height={112} margin={{ top: 10, right: 12, bottom: 6, left: 6 }} dots={false} hatch lineWidth={1.75} pin={18} end="halo" tip={genie.tip} format="index" />
          </div>
        )}
      </Pic>
    ),
    2: (
      <Pic cap={siteLabel} className="is-site">
        <Browser src={`https://cdn.sanity.io/images/xjjjqhgt/production/${SHOTS.montblanc.asset}?w=1200&h=750&fit=crop&crop=top&fm=webp&q=82`} domain={SHOTS.montblanc.domain} alt={siteLabel} />
      </Pic>
    ),
  };
  return (
    <Drop className={`mc-b ${icons ? 'has-icons' : ''}`}>
      <div className="v11-nav-main">
        <Head d={services} />
        <div className="mc-cols is-3">
          {v11.serviceGroups.map((g, gi) => (
            <div key={g.label} className="mc-col">
              {pics[gi]}
              <span className="mc-k">{g.label}</span>
              {pick(services.items, g.hrefs).map((it) => <Row key={it.href} title={it.title} sub={it.description} href={it.href} ico={icons} />)}
            </div>
          ))}
        </div>
        <Foot cta={cta} />
      </div>
    </Drop>
  );
}

export function IndustriesB({ industries, v11, cta, home, data, questions, icons }: MenuConceptProps & { icons?: MenuIconSet }) {
  const [sector, stage] = v11.industryGroups;
  const logos = CLIENT_LOGOS.filter((l) => l.logo && PROOF_LOGOS.includes(l.alt));
  const genie = home.hero.slides[5];
  return (
    <Drop className={`mc-b ${icons ? 'has-icons' : ''}`}>
      <div className="v11-nav-main">
        <Head d={industries} />
        <div className="mc-cols is-ind">
          <div className="mc-col is-wide">
            <Pic cap={`${v11.clientsBig} ${v11.clientsCap}`} className="is-logos">
              <div className="mc-logo-wall">
                {logos.map((l) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <span key={l.alt}><img src={img(l.logo as string)} alt={l.alt} width={l.w} height={l.h} style={{ width: l.w, height: l.h }} /></span>
                ))}
              </div>
            </Pic>
            <span className="mc-k">{sector.label}</span>
            <div className="mc-grid2">
              {pick(v11.industries, sector.hrefs).map((it) => <Row key={it.href} title={it.label} sub={questions[it.href]} href={it.href} quote ico={icons} />)}
            </div>
          </div>
          <div className="mc-col">
            <Pic cap={`${genie.client}: ${genie.metric} ${genie.caption}`} className="is-chart">
              <div className="mc-chart-fig"><b>{genie.metric}</b><span>{genie.client}</span></div>
              {data && (
                <div className="mc-chart">
                  <LiveChart series={data.hero.genieLeads} height={112} margin={{ top: 10, right: 12, bottom: 6, left: 6 }} dots={false} hatch lineWidth={1.75} pin={18} end="halo" tip={genie.tip} format="index" />
                </div>
              )}
            </Pic>
            <span className="mc-k">{stage.label}</span>
            {pick(v11.industries, stage.hrefs).map((it) => <Row key={it.href} title={it.label} sub={questions[it.href]} href={it.href} quote ico={icons} />)}
            <Link href={v11.allIndustriesHref} className="v11-nav-all"><span>{v11.allIndustries}</span><ArrowRight /></Link>
          </div>
        </div>
        <Foot cta={cta} />
      </div>
    </Drop>
  );
}

/* ============================================================ C · list and a live preview */

export function ServicesC({ services, v11, cta, cro, icons }: MenuConceptProps & { icons?: MenuIconSet }) {
  const on = '/services/cro';
  const item = services.items.find((i) => i.href === on)!;
  return (
    <Drop className={`mc-c ${icons ? 'has-icons' : ''}`}>
      <div className="mc-c-head"><Head d={services} /></div>
      <div className="mc-c-list">
        {v11.serviceGroups.map((g) => (
          <div key={g.label} className="mc-col">
            <span className="mc-k">{g.label}</span>
            {pick(services.items, g.hrefs).map((it) => <Row key={it.href} title={it.title} href={it.href} on={it.href === on} ico={icons} />)}
          </div>
        ))}
      </div>
      <div className="mc-preview">
        <div className="mc-stage sv-tint is-peach">
          <div className="mc-art">{cro.heroArt}</div>
          {/* a fresh copy per frame: React draws one element object once, so two frames would share its SVG pattern id */}
          <div className="mc-card">{isValidElement(cro.heroCard) ? cloneElement(cro.heroCard) : cro.heroCard}</div>
        </div>
        <div className="mc-preview-copy">
          <b>{item.title}</b>
          <span>{item.description}</span>
        </div>
      </div>
      <div className="mc-c-foot"><Foot cta={cta} /></div>
    </Drop>
  );
}

export function IndustriesC({ industries, v11, cta, questions, chats, icons }: MenuConceptProps & { icons?: MenuIconSet }) {
  const on = '/seo-for/fintech';
  const item = v11.industries.find((i) => i.href === on)!;
  return (
    <Drop className={`mc-c ${icons ? 'has-icons' : ''}`}>
      <div className="mc-c-head"><Head d={industries} /></div>
      <div className="mc-c-list">
        {v11.industryGroups.map((g) => (
          <div key={g.label} className="mc-col">
            <span className="mc-k">{g.label}</span>
            {pick(v11.industries, g.hrefs).map((it) => <Row key={it.href} title={it.label} href={it.href} on={it.href === on} ico={icons} />)}
          </div>
        ))}
        <Link href={v11.allIndustriesHref} className="v11-nav-all"><span>{v11.allIndustries}</span><ArrowRight /></Link>
      </div>
      <div className="mc-preview">
        <div className="mc-stage is-chat sv-tint is-lav">
          <ChatWindow c={chats[on]} sourceIcon={null} />
        </div>
        <div className="mc-preview-copy">
          <b>{item.label}</b>
          <span>{`“${questions[on]}”`}</span>
        </div>
      </div>
      <div className="mc-c-foot"><Foot cta={cta} /></div>
    </Drop>
  );
}
