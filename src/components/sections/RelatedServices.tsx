/**
 * RelatedServices — cross-link section for service pages.
 *
 * Renders links to the other 4 services, excluding the current page.
 * Place just before the CTA component on each service page.
 */
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';

interface ServiceLink {
  href: string;
  label: string;
  description: string;
}

const ALL_SERVICES: ServiceLink[] = [
  { href: '/services/seo-aeo', label: 'SEO & AEO', description: 'Visibility across search and AI engines' },
  { href: '/services/webflow', label: 'Webflow Development', description: 'Scalable builds optimized for performance' },
  { href: '/services/cro', label: 'Conversion Rate Optimization', description: 'Data-driven optimization that converts' },
  { href: '/services/ux-ui-design', label: 'UX/UI Design', description: 'Conversion-focused design systems' },
  { href: '/services/copywriting', label: 'Copywriting', description: 'Persuasive content that connects' },
];

interface RelatedServicesProps {
  /** The href of the current service page (e.g. "/services/seo-aeo") — this service is excluded from the list */
  currentService: string;
}

export function RelatedServices({ currentService }: RelatedServicesProps) {
  const otherServices = ALL_SERVICES.filter((s) => s.href !== currentService);

  return (
    <SectionContainer>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
        Explore our other services
      </h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {otherServices.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            className="group flex items-center gap-4 p-4 rounded-xl border border-surface-200 hover:border-surface-300 hover:shadow-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
          >
            <div className="flex-1">
              <span className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                {service.label}
              </span>
              <p className="mt-1 text-sm text-surface-500">
                {service.description}
              </p>
            </div>
            <svg
              className="w-5 h-5 flex-shrink-0 text-surface-400 group-hover:text-primary-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
