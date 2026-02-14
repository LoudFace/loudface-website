/**
 * Thank You Page
 *
 * Post-conversion confirmation page for leads who booked a call.
 * Shows confirmation message, client logo social proof strip, and next steps.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { SectionContainer } from '@/components/ui';
import { Partners } from '@/components/sections';

export const metadata: Metadata = {
  title: 'You\'re In',
  description: 'Your call with LoudFace is booked. We\'ll be in touch shortly to discuss how we can accelerate your growth.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/thank-you',
  },
};

export default async function ThankYouPage() {
  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  return (
    <>
      {/* Hero confirmation */}
      <SectionContainer padding="sm">
        <div className="max-w-2xl mx-auto text-center pt-8 md:pt-12">
          {/* Checkmark */}
          <div className="mx-auto mb-8 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900">
            Smart move. <span className="text-primary-600">Talk soon.</span>
          </h1>

          <p className="mt-6 text-lg text-surface-600 leading-relaxed">
            On our call, we'll dig into what you need help with, whether
            that's a strategic partnership or a defined scope you need us
            to execute.
          </p>
        </div>
      </SectionContainer>

      {/* Social proof */}
      <Partners
        testimonials={cmsData.allTestimonials}
        clients={cmsData.allClients}
      />

      {/* What to expect */}
      <SectionContainer>
        <div className="max-w-xl mx-auto">
          <h2 className="text-lg font-medium text-surface-900 mb-6">
            While you wait
          </h2>
          <div className="space-y-4">
            <Link
              href="/case-studies"
              className="group flex items-center gap-4 p-4 rounded-xl border border-surface-200 transition-all duration-200 hover:border-surface-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center transition-colors group-hover:bg-primary-50">
                <svg className="w-5 h-5 text-surface-600 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-surface-900">Browse our case studies</span>
                <p className="text-sm text-surface-500">See the results we've driven for teams like yours</p>
              </div>
              <svg className="w-5 h-5 text-surface-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>

            <Link
              href="/blog"
              className="group flex items-center gap-4 p-4 rounded-xl border border-surface-200 transition-all duration-200 hover:border-surface-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center transition-colors group-hover:bg-primary-50">
                <svg className="w-5 h-5 text-surface-600 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-surface-900">Read our latest insights</span>
                <p className="text-sm text-surface-500">Growth tactics and web strategy for B2B SaaS</p>
              </div>
              <svg className="w-5 h-5 text-surface-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
