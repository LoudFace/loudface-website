/**
 * Careers Page — /careers
 *
 * The public, INDEXABLE front door for hiring. Its sibling `/careers/apply` is
 * deliberately noindex (it is reached from job postings we place, not from
 * search) — this page is the one search engines and AI assistants should find,
 * and the one that belongs in the sitemap. Do not make /careers/apply
 * indexable to "fix" the link between them.
 *
 * The open-role list is read live from the Notion database "Hiring Openings"
 * via fetchOpenRoles(). Notion is the source of truth: Arnel and the
 * `hiring-ops` skill open and close roles there, and this page follows with no
 * code change. Only rows whose `Opening status` is exactly "Open" are shown.
 *
 * A failed Notion read renders "we could not load our openings", NEVER
 * "no open roles" — see OpenRolesResult in careers-data.ts for why that
 * distinction is load-bearing.
 *
 * AS OF 2026-08-27 THERE ARE NO OPEN ROLES. Every row in Hiring Openings is
 * Paused, so the empty state is what this page actually renders today — it is
 * the default state, not an edge case. A Notion outage renders a DIFFERENT
 * state (see above) — it must never borrow this one's wording.
 *
 * NO JobPosting STRUCTURED DATA. Google's JobPosting schema puts listings into
 * Google Jobs; emitting it for roles that are not really open would publish
 * vacancies that do not exist. If real roles come back and we want them in
 * Google Jobs, that schema gets added THEN, generated from the live rows, with
 * validThrough set — never hardcoded.
 */
export const revalidate = 3600;

import type { Metadata } from 'next';
import '../../service-v3/service-v3.css';
import '../../careers-v3/careers-v3.css';
import { CareersPageV3 } from '../../careers-v3/CareersPageV3';
import { FooterV3 } from '../../home-v3/FooterV3';
import { ServiceV3Scripts } from '../../service-v3/Scripts';
import { fetchOpenRoles } from '@/lib/careers-data';

const SITE_URL = 'https://www.loudface.co';
const PAGE_URL = `${SITE_URL}/careers`;

export const metadata: Metadata = {
  title: 'Careers — Remote Design, Webflow & SEO Roles',
  // 120-160 chars (MIN_META_DESCRIPTION is 120; Ahrefs flags both ends).
  description:
    'Careers at LoudFace. A small remote team building and growing B2B SaaS websites for brands like Montblanc and Radisson. See what we hire for.',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Careers at LoudFace',
    description:
      'A small remote team building and growing B2B SaaS websites. See what we hire for, and how hiring here actually works.',
    type: 'website',
    url: '/careers',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Careers at LoudFace' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@meetloudface',
    title: 'Careers at LoudFace',
    description:
      'A small remote team building and growing B2B SaaS websites. See what we hire for, and how hiring here actually works.',
    images: ['/opengraph-image'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Careers', item: PAGE_URL },
  ],
};

export default async function CareersPage() {
  const result = await fetchOpenRoles();

  return (
    <div className="svcv3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CareersPageV3 result={result} />
      <FooterV3 />
      <ServiceV3Scripts />
    </div>
  );
}
