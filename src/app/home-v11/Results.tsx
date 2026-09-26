import type { HomeV11Content } from '@/lib/content-utils';
import type { HomeV11Data, Series } from './data';
import { ResultCase } from './ResultCase';
import { SectionHead } from './ui';

/** Series, link and icon per case, in the content file's order. The first case is the feature. */
const CASES: { series: (d: HomeV11Data) => Series; href: string; icon: string; square?: boolean; pin: boolean; format: 'index' | 'indexWeek' | 'pct' }[] = [
  { series: (d) => d.results.delshad, href: '/case-studies/delshad-legal-content-engine', icon: 'logos/delshad-icon.jpeg', pin: true, format: 'index' },
  { series: (d) => d.results.genie, href: '/case-studies/genie-teacher-organic-growth', icon: 'logos/genie-icon.png', pin: true, format: 'index' },
  { series: (d) => d.hero.tm, href: '/case-studies/trademomentum-niche-aeo-organic-growth', icon: 'logos/trademomentum-icon.png', square: true, pin: true, format: 'indexWeek' },
  { series: (d) => d.results.lf, href: '/case-studies/loudface-aeo-case-study', icon: '', pin: false, format: 'pct' },
];

/** One feature case and three smaller ones: a claim in one line, one quiet chart each (ResultCase). */
export function Results({ c, data }: { c: HomeV11Content['results']; data: HomeV11Data | null }) {
  return (
    <section className="v11-sec v11-white">
      <div className="v11-wrap">
        <SectionHead eyebrow={c.eyebrow} heading={c.heading} body={c.body} bodyWidth={420} />
        <div className="v11-rgrid">
          {c.cases.map((k, i) => {
            const cfg = CASES[i];
            return (
              <ResultCase
                key={i}
                feature={i === 0}
                icon={cfg.icon || undefined}
                square={cfg.square}
                href={cfg.href}
                linkLabel={c.caseLink}
                client={k.client}
                claim={k.claim}
                metric={i === 0 ? k.metric : undefined}
                metricLabel={i === 0 ? k.metricLabel : undefined}
                chartLabel={k.chartLabel}
                source={k.source}
                series={data ? cfg.series(data) : null}
                format={cfg.format}
                tip={k.tip}
                pin={cfg.pin}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
