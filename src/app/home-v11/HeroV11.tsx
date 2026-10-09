import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import type { HomeV11Data } from './data';
import type { ValueFormat } from './LiveChart';
import { StageChart } from './StageChart';
import { HeroSlider } from './HeroSlider';
import { Eyebrow, LfMark, img } from './ui';
import { HERO_SLIDES, periodOf, proofValue } from './hero-slides';

export function HeroV11({ c, data }: { c: HomeV11Content['hero']; data: HomeV11Data | null }) {
  return (
    <section className="v11-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img('hero-phone-wide-1920.webp')} srcSet={`${img('hero-phone-wide-1280.webp')} 1280w, ${img('hero-phone-wide-1920.webp')} 1920w, ${img('hero-phone-wide-2560.webp')} 2560w`} sizes="(max-width: 767px) 820px, 100vw" alt={c.imageAlt} className="v11-hero-photo" fetchPriority="high" />
      <div className="v11-hero-veil" aria-hidden="true" />
      <div className="v11-wrap v11-hero-copy">
        <h1 dangerouslySetInnerHTML={{ __html: c.headline }} />
        <p data-speakable="">{c.body}</p>
        <div className="v11-hero-ctas">
          <a href="#book-modal" data-cal-trigger="" className="v11-btn is-white"><span>{c.ctaPrimary}</span></a>
          <Link href="/case-studies" className="v11-btn is-ghost"><span>{c.ctaSecondary}</span></Link>
        </div>
      </div>
      <HeroRail c={c} data={data} />
    </section>
  );
}

/** The results rail: one card per case, each a live chart from the day LoudFace started. Shared with inner pages. */
export function HeroRail({ c, data }: { c: HomeV11Content['hero']; data: HomeV11Data | null }) {
  return (
    <HeroSlider
      prevLabel={c.prevAriaLabel}
      nextLabel={c.nextAriaLabel}
      label={<Eyebrow dot="#ffffff" color="#e4e2fe">{c.bandLabel}</Eyebrow>}
      controls={
        <>
          <div className="v11-band-note"><LfMark size={16} /><span>{c.pinNote}</span></div>
        </>
      }
    >
      {c.slides.map((s, i) => {
        const cfg = HERO_SLIDES[i];
        const series = data?.hero[cfg.series];
        const period = periodOf(series);
        return (
          <StageChart
            key={i}
            href={cfg.href}
            tag={s.tag}
            client={s.client}
            metric={proofValue(data, cfg.proof ?? cfg.series)}
            compact={cfg.compact}
            series={series}
            format={cfg.format}
            tip={s.tip}
            periodStart={period.start}
            periodEnd={period.end}
            caption={s.caption}
          />
        );
      })}
    </HeroSlider>
  );
}
