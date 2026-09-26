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
/**
 * Apply — v11 (switched 2026-09-26). ApplyV11 wraps the live CareersApplicationForm (its submission, its opening
 * lookup and its tracking are unchanged) in the v11 page: the intro and the named readers, then how we hire. Copy in
 * careers-v11.json `apply`. Noindex, as before.
 */
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../careers-v11/careers.css';
import { fetchApplicationOpening } from '@/lib/careers-data';
import { getCareersV11Content, getHomeV11Content } from '@/lib/content-utils';
import { ApplyV11 } from '../../../careers-v11/ApplyV11';

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
  const [openingResult, c, home] = await Promise.all([fetchApplicationOpening(openingId), getCareersV11Content(), getHomeV11Content()]);

  return <ApplyV11 c={c} home={home} openingResult={openingResult} />;
}
