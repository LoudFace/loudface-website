/**
 * NightCharts — the "night act" centerpiece (server component). Only rendered
 * when the study carries ≥1 chart (~19% of studies today).
 *
 * Reuses the shared, zero-client-JS CaseStudyCharts renderer verbatim — which
 * keeps the growthCurve DELIBERATELY axis-free (the shape is public, the exact
 * rate stays private). When a growth curve is present we surface that privacy
 * choice explicitly with a note, so the missing y-axis reads as intentional.
 */
import { CaseStudyCharts } from '@/components/ui';
import type { CaseStudyChart } from '@/lib/types';

interface NightChartsProps {
  charts: CaseStudyChart[];
  accentColor: string;
  hasGrowthCurve: boolean;
}

export function NightCharts({ charts, accentColor, hasGrowthCurve }: NightChartsProps) {
  if (!charts || charts.length === 0) return null;

  return (
    <section className="night" aria-label="Results in detail">
      <div className="container-wide">
        <div className="night-head">
          <span className="eyebrow on-dark">The trend</span>
          <h2 className="h-sec">By the numbers</h2>
        </div>
        <div className="night-charts">
          <CaseStudyCharts charts={charts} accentColor={accentColor} />
          {hasGrowthCurve && (
            <p className="privacy-note">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="2.5" y="6" width="9" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4.3 6V4.3a2.7 2.7 0 015.4 0V6" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Axis values withheld by design: the shape of the trend is public, the exact rate stays the client&rsquo;s.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
