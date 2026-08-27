/**
 * Careers Application Page — /careers/apply
 *
 * The single front door for every job application. Deliberately NOINDEX: it is
 * linked from job postings we place (Behance, Contra, Dribbble, LinkedIn), not
 * discovered through search. There is no careers index page yet — if one is
 * added later, that page is the indexable one and this stays hidden.
 *
 * Self-tagging links — each job posting gets its own URL, and the submission
 * lands in Notion already tagged, so nobody sorts applications by hand:
 *   /careers/apply?role=designer&src=behance
 *   /careers/apply?role=developer&src=dribbble
 *   /careers/apply?role=seo&src=linkedin
 * role: designer | developer | copywriter | project-manager | seo
 * src:  contra | upwork | linkedin | dribbble | behance | referral | other
 *
 * Submissions post to /api/careers-apply, which writes the Notion "Candidates"
 * DB. The screening agent picks them up from there (see the hiring-ops skill).
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SectionContainer } from '@/components/ui';
import { CareersApplicationForm } from './_components/CareersApplicationForm';

export const metadata: Metadata = {
  title: 'Apply to LoudFace',
  description:
    'Apply to work with LoudFace. Tell us what you have shipped, and we will read it.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/careers/apply',
  },
};

export default function CareersApplyPage() {
  return (
    <SectionContainer padding="sm">
      <div className="mx-auto max-w-2xl pt-8 md:pt-12">
        <header className="text-center">
          <h1 className="text-2xl font-medium text-surface-900 sm:text-3xl md:text-4xl">
            Come build with us.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-surface-600">
            We&apos;re a small remote team doing work for brands like Montblanc and
            Radisson. We care about what you&apos;ve actually shipped — not where you
            went to school, and not how long your CV is.
          </p>
          <p className="mt-4 text-sm text-surface-500">
            One form, a few minutes. A person reads every one.
          </p>
        </header>

        <div className="mt-10 rounded-xl border border-surface-200 bg-white p-6 md:p-8">
          <Suspense
            fallback={
              <p className="py-8 text-center text-sm text-surface-500">Loading the form…</p>
            }
          >
            <CareersApplicationForm />
          </Suspense>
        </div>
      </div>
    </SectionContainer>
  );
}
