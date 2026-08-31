/**
 * Careers Application Page: /careers/apply
 *
 * The single front door for every job application. Deliberately NOINDEX: it is
 * linked from job postings we place (Behance, Contra, Dribbble, LinkedIn), not
 * discovered through search. The /careers index page is the indexable page,
 * while this application page stays hidden.
 *
 * Self-tagging links: each job posting gets its own URL, and the submission
 * lands in Notion already tagged, so nobody sorts applications by hand:
 *   /careers/apply?opening=<notion-page-id>&role=designer&src=behance
 *   /careers/apply?opening=<notion-page-id>&role=developer&src=dribbble
 *   /careers/apply?opening=<notion-page-id>&role=seo&src=linkedin
 * opening: exact Hiring Openings row; verified server-side and stored as a relation
 * role: designer | developer | copywriter | project-manager | seo
 * src:  contra | upwork | linkedin | dribbble | behance | referral | other
 *
 * Submissions post to /api/careers-apply, which writes the Notion "Candidates"
 * DB. The screening agent picks them up from there (see the hiring-ops skill).
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SectionContainer } from '@/components/ui';
import { fetchApplicationOpening } from '@/lib/careers-data';
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

export default async function CareersApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ opening?: string | string[] }>;
}) {
  const rawOpening = (await searchParams).opening;
  const openingId = Array.isArray(rawOpening) ? rawOpening[0] : rawOpening;
  const openingResult = await fetchApplicationOpening(openingId);
  const openingTitle = openingResult.status === 'open' ? openingResult.opening.title : null;

  return (
    <SectionContainer padding="sm">
      <div className="mx-auto max-w-2xl pt-8 md:pt-12">
        <header className="text-center">
          <h1 className="text-2xl font-medium text-surface-900 sm:text-3xl md:text-4xl">
            {openingTitle ? `Apply for ${openingTitle}` : 'Come build with us.'}
          </h1>
          <div className="mx-auto mt-6 max-w-xl text-left text-lg leading-relaxed text-surface-600">
            <p>
              We&apos;re a small remote team headquartered in Dubai, with an office in
              the United States. We work with leading companies such as Toku, Eraser,
              Montblanc, and Radisson Hotels.
            </p>
            <p className="mt-4">
              We do not hire based on your CV or the number of courses you have taken.
              We hire based on:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>how well you fit our culture</li>
              <li>the results you achieved in previous roles</li>
              <li>your grit</li>
            </ul>
          </div>
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
            <CareersApplicationForm openingResult={openingResult} />
          </Suspense>
        </div>
      </div>
    </SectionContainer>
  );
}
