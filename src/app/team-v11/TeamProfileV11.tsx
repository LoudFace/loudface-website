import Link from 'next/link';
import type { HomeV11Content, TeamV11Content } from '@/lib/content-utils';
import { PostCard } from '../blog-v11/PostCard';
import type { PostCardData } from '../blog-v11/view';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import type { HomeV11Data } from '../home-v11/data';
import { ArrowRight, ArrowUpRight, Eyebrow, img } from '../home-v11/ui';
import { ServiceResults } from '../service-v11/proof';
import { strip } from '@/lib/inline-edit/mark';

/**
 * TeamProfileV11: /team/<slug> in v11 (2026-09-26), the author page every blog post links to. The person first
 * (their portrait at size beside their name, title and bio: 01-A Intercom author page, 01-C Airtable leadership),
 * then everything they have written (01-G Vercel blog authors), a few of the people they work with (01-E Intercom
 * "Meet the builders") and the team's published results. Bios and links come from the Sanity teamMember; the
 * operator-model titles and every label come from team-v11.json.
 */

export interface TeamProfileView {
  slug: string;
  name: string;
  jobTitle?: string;
  bio?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  skills: string[];
  posts: PostCardData[];
  /** Everyone else on the team, for the "people you would work with" row. */
  others: { slug: string; name: string; jobTitle?: string }[];
}

const SHOW = 5;
/** Rows listed before the rest fold away (every article stays in the page for the author's E-E-A-T links). */
const LIST = 12;
/** The leads a visitor would work with (the operator model: a sample of the team, never a headcount). */
const LEADS = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TeamProfileV11({ v, c, home, data }: { v: TeamProfileView; c: TeamV11Content; home: HomeV11Content; data: HomeV11Data | null }) {
  const L = c.labels;
  // titles are keyed by the person's slug in camelCase (content keys must be [A-Za-z0-9_]: the inline editor's rule)
  const titles = c.titles as Record<string, string>;
  const titleOf = (slug: string) => titles[slug.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase())];
  const title = titleOf(v.slug) ?? v.jobTitle;
  const first = v.posts.slice(0, SHOW);
  const rest = v.posts.slice(SHOW);
  const hasPosts = v.posts.length > 0;
  const row = (p: PostCardData) => (
    <li key={p.href}>
      <Link href={p.href}>
        <span className="is-t">{p.title}</span>
        {p.categoryName && <span className="is-c">{p.categoryName}</span>}
        <time dateTime={p.date}>{formatDate(p.date)}</time>
      </Link>
    </li>
  );
  const team = LEADS.filter((s) => s !== v.slug).map((s) => v.others.find((o) => o.slug === s)).filter((o): o is TeamProfileView['others'][number] => Boolean(o));
  const g = (i: number) => (i % 2 === 0 ? 'v11-warm' : 'v11-white');
  let n = 0;

  return (
    <div className="v11 tp">
      {/* 1 · the person: portrait at size beside who they are */}
      <section className="tp-hero" data-hero="light">
        <div className="v11-wrap tp-hero-grid">
          <figure className="tp-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(`team/${v.slug}.jpg`)} alt={strip(`${v.name}, ${title ?? 'LoudFace'}`)} width={580} height={704} fetchPriority="high" />
          </figure>
          <div className="tp-hero-copy">
            <nav className="tp-crumb" aria-label="Breadcrumb">
              <Link href="/about">{L.crumbAbout}</Link>
              <span aria-hidden="true">/</span>
              <span>{v.name}</span>
            </nav>
            <Eyebrow>{L.eyebrow}</Eyebrow>
            <h1 data-speakable="">{v.name}</h1>
            {title && <p className="tp-role">{title}</p>}
            {v.bio && <p className="tp-bio">{v.bio}</p>}
            <div className="tp-ctas">
              <a href="#book-modal" data-cal-trigger="" className="v11-btn is-ink"><span>{L.bookCta}</span></a>
              {v.linkedinUrl && (
                <a className="v11-link tp-li" href={v.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={strip(`${v.name} on ${L.linkedin}`)}>
                  <span>{L.linkedin}</span><ArrowUpRight />
                </a>
              )}
            </div>
            {v.skills.length > 0 && (
              <div className="tp-skills">
                <h2>{L.worksOn}</h2>
                <ul>{v.skills.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2 · what they have written: the latest as covers, then every article on hairlines */}
      {hasPosts && (
        <section className={`v11-sec ${g(n++)}`} id="articles">
          <div className="v11-wrap">
            <div className="sv-head">
              <div>
                <Eyebrow>{L.writingEyebrow}</Eyebrow>
                <h2 className="v11-h2">{L.writingTitle} <span className="ghost">{v.name}</span></h2>
              </div>
              <p>{v.posts.length} {L.writingLedeSuffix}</p>
            </div>
            <div className="bl-grid tp-grid">{first.map((p, i) => <PostCard key={p.href} p={p} big={i === 0} />)}</div>
            {rest.length > 0 && (
              <div className="tp-more">
                <h3>{L.moreTitle}</h3>
                <ul>{rest.slice(0, LIST).map(row)}</ul>
                {rest.length > LIST && (
                  <details className="tp-fold">
                    <summary>{L.showAll} <span>({v.posts.length})</span></summary>
                    <ul>{rest.slice(LIST).map(row)}</ul>
                  </details>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3 · the people they work with, a sample of the team (never a headcount) */}
      <section className={`v11-sec ${g(n++)}`}>
        <div className="v11-wrap">
          <div className="sv-head">
            <div>
              <Eyebrow>{L.teamEyebrow}</Eyebrow>
              <h2 className="v11-h2">{L.teamTitle} <span className="ghost">{L.teamTitleGhost}</span></h2>
            </div>
            <p>{L.teamLede}</p>
          </div>
          <div className={`tp-team is-${team.length}`}>
            {team.map((o) => (
              <Link key={o.slug} href={`/team/${o.slug}`} className="tp-face">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(`team/${o.slug}.jpg`)} alt="" width={580} height={704} loading="lazy" />
                <span className="is-name">{o.name}<ArrowRight /></span>
                <span className="is-title">{titleOf(o.slug) ?? o.jobTitle}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · the team's published results (the homepage's results section) */}
      <section className={`v11-sec ${g(n++)}`}>
        <div className="v11-wrap">
          <div className="sv-head">
            <div>
              <Eyebrow>{L.resultsEyebrow}</Eyebrow>
              <h2 className="v11-h2" dangerouslySetInnerHTML={{ __html: home.results.heading }} />
            </div>
            <p>{home.results.body}</p>
          </div>
          <ServiceResults slug="case-studies" home={home} data={data} />
        </div>
      </section>

      <Closing c={home.closing} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
