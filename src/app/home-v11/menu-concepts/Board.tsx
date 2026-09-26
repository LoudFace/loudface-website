import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import {
  getAboutV11Content, getHomeV11Content, getIndustryV11Content, getNavContent, getSeoForArticleContent,
  SEO_FOR_ARTICLE_SLUGS,
} from '@/lib/content-utils';
import { getHomeV11Data } from '../data';
import { getNavV11Data } from '../nav-data';
import { img } from '../ui';
import type { MenuConceptProps } from './MenuConcepts';
import { getServiceImages } from '../../service-v3/data';
import { EXTRAS } from '../../service-v11/pages';
import { getServiceConfigV11 } from '../../service-v11/configs';

/**
 * What the menu boards share (/dev-preview/menu-concepts and /dev-preview/menu-icons): the props every concept reads,
 * and one frame that draws a concept open under the real header.
 */
export async function getMenuConceptBoard() {
  const [nav, home, data, industry, about, images] = await Promise.all([
    getNavContent(), getHomeV11Content(), getHomeV11Data(), getIndustryV11Content(), getAboutV11Content(), getServiceImages(),
  ]);
  const navV11 = await getNavV11Data();

  // the buyer question each industry page is built around: the page's answer window, or its question table
  const questions: Record<string, string> = {};
  const chats: MenuConceptProps['chats'] = {};
  for (const [slug, chat] of Object.entries(industry.chat)) {
    questions[`/seo-for/${slug}`] = chat.question;
    chats[`/seo-for/${slug}`] = chat;
  }
  for (const slug of SEO_FOR_ARTICLE_SLUGS) {
    const a = await getSeoForArticleContent<{ questions: { rows: string[][] } }>(slug);
    questions[`/seo-for/${slug}`] = a.questions.rows[0][0];
  }

  const cro = EXTRAS.cro({ config: getServiceConfigV11('cro')!, home, data, images });
  const props: MenuConceptProps = {
    services: nav.dropdowns.services, industries: nav.dropdowns.industries, v11: navV11,
    cta: nav.dropdownCta, home, data, questions, chats, cro: { heroArt: cro.heroArt, heroCard: cro.heroCard },
    siteLabel: about.values.build.siteLabel,
  };
  return { nav, navV11, props };
}

type Board = Awaited<ReturnType<typeof getMenuConceptBoard>>;

/** One concept drawn open: Services over the homepage hero's photograph, Industries over a light page. */
export function MenuFrame({ board, kind, label, children }: { board: Board; kind: 'services' | 'industries'; label: string; children: ReactNode }) {
  return (
    <>
      <p className="mc-frame-k">{label}</p>
      <section className={`cb-frame mc-frame ${kind === 'services' ? 'is-stage' : 'is-light'}`} aria-label={label}>
        {kind === 'services' && (
          // the homepage hero's photograph only: the whole hero would add thousands of nodes to the Paper file
          <div className="mc-backdrop" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img('hero-phone-wide-1920.webp')} alt="" width={1920} height={800} />
            <div className="v11-hero-veil" />
          </div>
        )}
        <div className="cb-bar">
          <Header heroTheme="dark" content={board.nav} v11={board.navV11} initialOpen={kind} />
          {children}
        </div>
      </section>
    </>
  );
}
