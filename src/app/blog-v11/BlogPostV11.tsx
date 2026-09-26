import Link from 'next/link';
import type { BlogV11Content, HomeV11Content } from '@/lib/content-utils';
import { AI_PLATFORM_ICONS } from '@/lib/icons';
import { aiExploreLinks, formatShortDate, initials } from '../blog-v3/helpers';
import { BlogBodyV3 } from '../blog-v3/BlogBodyV3';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';
import { ArrowRight, LfMark, SectionHeadNode, img } from '../home-v11/ui';
import { PostCard } from './PostCard';
import { PostCover } from './PostCover';
import type { BlogPostView } from './view';
import { strip } from '@/lib/inline-edit/mark';
import { cachedCmsImage, cachedCmsSrcSet } from '@/lib/image-utils';

/**
 * A blog post in v11 (DESIGN.md §6, §7). The article is the product: an editorial title column on white, the
 * post's own picture on a wide plate, the short answer card straddling its lower edge (the live template's
 * signature, kept), then the reading column with its contents and tools in a sticky rail. Labels are
 * src/data/content/blog-v11.json; the data is prepared as the live page prepares it (./view.ts).
 */

const TEAM = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];

export function BlogPostV11({ c, home, v, nextStep = false }: { c: BlogV11Content; home: HomeV11Content; v: BlogPostView; nextStep?: boolean }) {
  const t = c.post;
  const published = formatShortDate(v.publishedDate);
  const updated = v.lastUpdated && v.lastUpdated !== v.publishedDate ? formatShortDate(v.lastUpdated) : null;
  const ai = aiExploreLinks(v.url);
  return (
    <div className="v11 bp">
      <article>
        {/* 1 · the title column, then the picture with the short answer on its edge */}
        <header className="bp-hero" data-hero="light">
          <div className="v11-wrap">
            <nav className="bp-crumbs" aria-label="Breadcrumb"><Link href="/">{t.home}</Link><span aria-hidden="true">/</span><Link href="/blog">{t.blog}</Link>{v.categoryName && <><span aria-hidden="true">/</span><span>{v.categoryName}</span></>}</nav>
            <div className="bp-head">
              {v.categoryName && <span className="bl-cat">{v.categoryName}</span>}
              <h1>{v.title}</h1>
              {v.excerpt && <p className="bp-excerpt">{v.excerpt}</p>}
              <div className="bp-byline">
                {v.author?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cachedCmsImage(v.author.avatarUrl, 128)} alt="" width={40} height={40} />
                ) : <span className="bp-mono">{initials(v.author?.name)}</span>}
                <div>
                  <b>{v.author ? v.author.name : 'LoudFace'}</b>
                  <span>{published}{updated && <> · {t.updated} {updated}</>} · {v.readTime}</span>
                </div>
              </div>
            </div>
            <div className={`bp-plate ${v.directAnswer ? 'has-answer' : ''}`}>
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cachedCmsImage(`${v.thumbnailUrl}?w=1800&h=900&fit=crop&fm=webp&q=82`, 1920)} srcSet={cachedCmsSrcSet(`${v.thumbnailUrl}?w=1800&h=900&fit=crop&fm=webp&q=82`, [828, 1920])} sizes="(max-width: 767px) 92vw, 1296px" alt="" width={1800} height={900} />
              ) : <PostCover title={v.title} categoryName={v.categoryName} />}
            </div>
            {v.directAnswer && (
              <aside className="bp-answer" aria-label={strip(t.answerLabel)}>
                <div className="bp-answer-tag"><LfMark size={18} /><span>{t.answerLabel}</span></div>
                <p data-speakable="">{v.directAnswer}</p>
              </aside>
            )}
          </div>
        </header>

        {/* 2 · the reading column, with contents, AI tools and the call beside it */}
        <section className="bp-read">
          <div className="v11-wrap bp-read-grid">
            <div className="v11-prose sv-article-body cs-body bp-body">
              <BlogBodyV3 html={v.html} visuals={v.visuals} />
            </div>
            <aside className="bp-rail">
              {v.toc.length > 0 && (
                <nav className="sv-toc" aria-label={strip(t.tocLabel)}>
                  <div className="sv-toc-k">{t.tocLabel}</div>
                  {v.toc.map((h) => <a key={h.id} href={`#${h.id}`}>{h.text}</a>)}
                </nav>
              )}
              <div className="bp-ai">
                {ai.map((l) => {
                  const icon = AI_PLATFORM_ICONS[l.name];
                  return (
                    <a key={l.name} href={l.href} target="_blank" rel="noopener" aria-label={`Explore this article in ${l.name}`}>
                      {icon && <svg viewBox={icon.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon.path }} />}
                      <span>{l.name}</span>
                    </a>
                  );
                })}
              </div>
              <div className="cs-cta">
                <div className="v11-stack is-34">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {TEAM.map((w) => <img loading="lazy" key={w} src={img(`avatars/${w}.png`)} alt="" width={30} height={30} className="v11-av" />)}
                </div>
                <div className="cs-cta-h">{t.ctaHeading}</div>
                <p>{t.ctaBody}</p>
                <a href="#book-modal" data-cal-trigger="" className="v11-btn is-white"><span>{t.ctaText}</span></a>
              </div>
            </aside>
          </div>
        </section>

        {nextStep && (
          <section className="v11-sec v11-white bp-next">
            <div className="v11-wrap"><div className="bp-next-card">
              <div><h2>{t.nextHeading}</h2><p>{t.nextBody}</p></div>
              <Link href="/ai-audit" className="v11-btn is-white"><span>{t.nextCta}</span></Link>
            </div></div>
          </section>
        )}

        {/* 3 · questions, then who wrote it and when */}
        {v.faq.length > 0 && (
          <section className="v11-sec v11-warm" id="faq">
            <div className="v11-wrap v11-faq bp-faq">
              <div className="v11-faq-head">
                <h2 className="v11-h2">{t.faqHeadline} <span className="ghost">{t.faqHeadlineHighlight}</span></h2>
                <p className="bp-faq-sub">{t.faqBody}</p>
              </div>
              <div className="v11-faq-list">
                {v.faq.map((f, i) => (
                  <details key={f.question} className="v11-faq-item" open={i === 0}>
                    <summary><span>{f.question}</span><span className="v11-faq-plus" aria-hidden="true" /></summary>
                    {/* CMS answers carry links and inline markup (106 of 874 did on 2026-09-26); the v3 FAQ rendered them as HTML */}
                    <div className="v11-faq-a" dangerouslySetInnerHTML={{ __html: f.answer }} />
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {v.author && (
          <section className="v11-sec v11-white bp-author-sec">
            <div className="v11-wrap bp-author">
              <div className="bp-author-main">
                <span className="bp-kicker">{t.authorLabel}</span>
                <div className="bp-author-who">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {v.author.avatarUrl ? <img loading="lazy" src={cachedCmsImage(v.author.avatarUrl, 128)} alt="" width={64} height={64} /> : <span className="bp-mono is-big">{initials(v.author.name)}</span>}
                  <div>
                    {v.author.slug ? <Link href={`/team/${v.author.slug}`}><b>{v.author.name}</b></Link> : <b>{v.author.name}</b>}
                    {v.author.jobTitle && <span>{v.author.jobTitle}</span>}
                  </div>
                </div>
                {v.author.bio && <p>{v.author.bio}</p>}
              </div>
              <div className="bp-record">
                <span className="bp-kicker">{t.recordLabel}</span>
                <dl>
                  {published && <div><dt>{t.published}</dt><dd>{published}</dd></div>}
                  {updated && <div><dt>{t.lastUpdated}</dt><dd className="is-fresh"><i />{updated}</dd></div>}
                  {v.categoryName && <div><dt>{t.category}</dt><dd>{v.categoryName}</dd></div>}
                  <div><dt>{t.readingTime}</dt><dd>{v.readTime}</dd></div>
                </dl>
              </div>
            </div>
          </section>
        )}
      </article>

      {v.related.length > 0 && (
        <section className="v11-sec v11-warm">
          <div className="v11-wrap">
            <SectionHeadNode title={<>{t.relatedHeadline} <span className="ghost">{t.relatedHeadlineHighlight}</span></>} right={<Link href="/blog" className="v11-link"><span>{t.blog}</span><ArrowRight /></Link>} />
            <div className="bl-grid">{v.related.map((p) => <PostCard key={p.href} p={p} />)}</div>
          </div>
        </section>
      )}

      <Closing c={{ ...home.closing, heading: t.closingHeading }} />
      <FooterV11 c={home.footer} ratings={home.testimonials.ratings} />
      <Reveal />
    </div>
  );
}
