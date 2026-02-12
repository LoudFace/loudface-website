import Link from 'next/link';
import { NewsletterForm } from './NewsletterForm';
import { FooterLocations } from './FooterLocations';
import { asset } from '@/lib/assets';
import { getAIPlatformsWithIcons, getSocialLinksWithIcons } from '@/lib/icons';
import type { CaseStudy, BlogPost } from '@/lib/types';

interface FooterProps {
  caseStudies?: CaseStudy[];
  blogPosts?: BlogPost[];
}

export function Footer({ caseStudies = [], blogPosts = [] }: FooterProps) {
  // Navigation data
  const companyLinks = [
    { label: 'About us', href: '/about' },
  ];

  const serviceLinks = [
    { label: 'Webflow Development', href: '/services/webflow' },
    { label: 'UX/UI Design', href: '/services/ux-ui-design' },
    { label: 'Copywriting', href: '/services/copywriting' },
    { label: 'SEO/AEO', href: '/services/seo-aeo' },
    { label: 'CRO', href: '/services/cro' },
  ];

  const industryLinks = [
    { label: 'SaaS', href: '/seo-for/saas' },
    { label: 'E-commerce', href: '/seo-for/ecommerce' },
    { label: 'B2B', href: '/seo-for/b2b' },
    { label: 'Healthcare', href: '/seo-for/healthcare' },
  ];

  const resourceLinks = [
    { label: 'Blog', href: '/blog' },
    { label: 'Case Studies', href: '/case-studies' },
  ];

  // AI Platform links - from shared icons module
  const aiPlatforms = getAIPlatformsWithIcons();

  // Social links - from shared icons module
  const socialLinks = getSocialLinksWithIcons();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      <div className="bg-surface-900 text-white">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="py-12 md:py-16 lg:py-20">
              {/* Main Grid: Newsletter + Nav */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 sm:gap-10 md:gap-12 lg:gap-16">
                {/* Newsletter Column */}
                <div className="max-w-xs lg:max-w-none">
                  <Link href="/" className="inline-block">
                    <img
                      src={asset('/images/loudface-inversed.svg')}
                      loading="lazy"
                      width="133"
                      height="26"
                      alt="LoudFace"
                      className="h-6.5 w-auto"
                    />
                  </Link>
                  <div className="h-6" />
                  <p className="text-surface-400 text-sm">
                    Join our newsletter to stay up to date on industry news and strategies
                  </p>
                  <div className="h-6" />
                  <NewsletterForm />
                </div>

                {/* Navigation Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
                  {/* Company */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-white mb-1">Company</h3>
                    <nav aria-label="Company links">
                      <ul className="flex flex-col gap-2 list-none m-0 p-0">
                        {companyLinks.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-sm text-surface-400 hover:text-white transition-colors"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>

                  {/* Services */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-white mb-1">Services</h3>
                    <nav aria-label="Services links">
                      <ul className="flex flex-col gap-2 list-none m-0 p-0">
                        {serviceLinks.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-sm text-surface-400 hover:text-white transition-colors"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-white mb-1">Industries</h3>
                    <nav aria-label="Industries links">
                      <ul className="flex flex-col gap-2 list-none m-0 p-0">
                        {industryLinks.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-sm text-surface-400 hover:text-white transition-colors"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href="/seo-for"
                            className="text-sm text-primary-400 hover:text-white transition-colors"
                          >
                            View all industries →
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </div>

                  {/* Resources */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-white mb-1">Resources</h3>
                    <nav aria-label="Resources links">
                      <ul className="flex flex-col gap-2 list-none m-0 p-0">
                        {resourceLinks.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="text-sm text-surface-400 hover:text-white transition-colors"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>

                  {/* Case Studies */}
                  {caseStudies.length > 0 && (
                    <div className="flex flex-col gap-3 lg:col-span-2">
                      <h3 className="text-sm font-semibold text-white mb-1">Case Studies</h3>
                      <nav aria-label="Case studies links">
                        <ul className="flex flex-col gap-2 list-none m-0 p-0">
                          {caseStudies.slice(0, 5).map((study) => (
                            <li key={study.id}>
                              <Link
                                href={`/case-studies/${study.slug}`}
                                className="block text-sm text-surface-400 hover:text-white transition-colors truncate"
                                title={study['project-title'] || study.name}
                              >
                                {study['project-title'] || study.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  )}

                  {/* Articles */}
                  {blogPosts.length > 0 && (
                    <div className="flex flex-col gap-3 lg:col-span-2">
                      <h3 className="text-sm font-semibold text-white mb-1">Articles</h3>
                      <nav aria-label="Blog articles links">
                        <ul className="flex flex-col gap-2 list-none m-0 p-0">
                          {blogPosts.slice(0, 5).map((post) => (
                            <li key={post.id}>
                              <Link
                                href={`/blog/${post.slug}`}
                                className="block text-sm text-surface-400 hover:text-white transition-colors truncate"
                                title={post.name}
                              >
                                {post.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-12 md:h-16" />
              <div className="h-px bg-surface-700" />
              <div className="h-8 md:h-12" />

              {/* Bottom Section: AI + Social */}
              <div className="flex flex-wrap justify-between items-start gap-8">
                {/* AI Summary */}
                <div>
                  <h3 className="text-sm font-medium text-surface-400 mb-3">Explore AI Summary</h3>
                  <div className="flex gap-3">
                    {aiPlatforms.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-surface-800 rounded-lg text-surface-400 hover:bg-surface-700 hover:text-white transition-colors"
                        title={platform.name}
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox={platform.icon.viewBox}
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          dangerouslySetInnerHTML={{ __html: platform.icon.path }}
                        />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
                      title={social.name}
                    >
                      <span
                        className="w-[1.125rem] h-[1.125rem] [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: social.icon }}
                      />
                      <span className="hidden md:inline">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 md:h-12" />
              <div className="h-px bg-surface-700" />
              <div className="h-8 md:h-10" />

              {/* Locations */}
              <FooterLocations />

              {/* Divider */}
              <div className="h-8 md:h-10" />
              <div className="h-px bg-surface-700" />
              <div className="h-6" />

              {/* Copyright */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-surface-400 text-sm">
                  &copy; {currentYear} LoudFace. All rights reserved.
                </p>
                <div className="flex gap-6">
                  <Link
                    href="/privacy"
                    className="text-sm text-surface-400 hover:text-surface-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-sm text-surface-400 hover:text-surface-300 transition-colors"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="/cookies"
                    className="text-sm text-surface-400 hover:text-surface-300 transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
