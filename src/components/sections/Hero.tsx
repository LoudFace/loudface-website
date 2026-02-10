import Link from 'next/link';
import { getHeroContent } from '@/lib/content-utils';
import { AI_PLATFORM_ICONS } from '@/lib/icons';
import { asset } from '@/lib/assets';
import { caseStudyThumbnail, logoImage } from '@/lib/image-utils';
import { Button } from '@/components/ui';
import type { CaseStudy, Client, Industry } from '@/lib/types';

interface HeroProps {
  headline?: string;
  description?: string;
  ctaText?: string;
  scarcityText?: string;
  aiLinksLabel?: string;
  caseStudies: CaseStudy[];
  clients?: Map<string, Client>;
  industries?: Map<string, Industry>;
}

export function Hero({
  headline,
  description,
  ctaText,
  scarcityText,
  aiLinksLabel,
  caseStudies,
  clients = new Map(),
}: HeroProps) {
  // Load content from JSON file
  const content = getHeroContent();

  // Use props or fall back to content defaults
  const finalHeadline = headline ?? content.headline;
  const finalDescription = description ?? content.description;
  const finalCtaText = ctaText ?? content.ctaText;
  const finalAiLinksLabel = aiLinksLabel ?? content.aiLinksLabel;

  function getClient(clientId: string | undefined): Client | undefined {
    if (!clientId) return undefined;
    return clients.get(clientId);
  }

  // Only show featured case studies in the hero slider
  const featuredStudies = caseStudies.filter((s) => s.featured);

  // Build aiLinks array from JSON content + shared icons
  const aiLinks = content.aiLinks.map((link) => ({
    name: link.name,
    url: link.url,
    icon: AI_PLATFORM_ICONS[link.name]?.path || '',
  }));

  // Arrow icon SVG path for case study links
  const arrowIcon = `<path d="M2.91854 1.85641H8.14011L1.06819 8.92834C1.01486 8.98166 0.972567 9.04496 0.94371 9.11463C0.914853 9.1843 0.9 9.25897 0.9 9.33437C0.9 9.40978 0.914853 9.48445 0.94371 9.55412C0.972567 9.62379 1.01486 9.68709 1.06818 9.74041C1.12151 9.79373 1.18481 9.83603 1.25448 9.86488C1.32414 9.89374 1.39881 9.90859 1.47422 9.90859C1.54963 9.90859 1.6243 9.89374 1.69396 9.86488C1.76363 9.83603 1.82693 9.79373 1.88025 9.74041L8.95193 2.66873V7.91349C8.95193 8.06562 9.01236 8.21153 9.11994 8.3191C9.22752 8.42668 9.37342 8.48711 9.52555 8.48711C9.67769 8.48711 9.82359 8.42668 9.93116 8.3191C10.0387 8.21153 10.0992 8.06562 10.0992 7.91349V1.31361C10.0997 1.30337 10.1 1.29311 10.1 1.28281C10.1 1.13052 10.0395 0.984466 9.93182 0.876779C9.82413 0.769092 9.67807 0.708594 9.52578 0.708594C9.51717 0.708594 9.50858 0.708787 9.50001 0.709172H2.91854C2.7664 0.709172 2.6205 0.769607 2.51292 0.877182C2.40535 0.984757 2.34491 1.13066 2.34491 1.28279C2.34491 1.43493 2.40535 1.58083 2.51292 1.6884C2.6205 1.79598 2.7664 1.85641 2.91854 1.85641Z" fill="currentColor" stroke="white" stroke-width="0.2"/>`;

  // Case study card component (used multiple times)
  const CaseStudyCard = ({
    study,
    isHidden = false,
  }: {
    study: CaseStudy;
    isHidden?: boolean;
  }) => {
    const client = getClient(study.client);

    return (
      <Link
        href={`/case-studies/${study.slug}`}
        className="flex-shrink-0 flex flex-col bg-white rounded-xl overflow-hidden border border-surface-200 hover:opacity-85 transition-opacity focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
        tabIndex={isHidden ? -1 : undefined}
        aria-hidden={isHidden || undefined}
      >
        <div className="flex justify-between items-center p-4 gap-2">
          <div className="flex-1 min-w-0">
            {client?.['colored-logo']?.url ? (
              <img
                src={logoImage(client['colored-logo'].url)}
                alt={isHidden ? '' : client.name || 'Client logo'}
                loading="lazy"
                className="h-5 w-24 object-contain object-left"
              />
            ) : (
              <span className="font-medium text-surface-700">
                {client?.name || study.name}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-surface-700 whitespace-nowrap">
            Read case study
            <svg
              className="w-3 h-3"
              viewBox="0 0 11 10"
              fill="none"
              dangerouslySetInnerHTML={{ __html: arrowIcon }}
            />
          </span>
        </div>
        <div className="aspect-[388/250] overflow-hidden">
          <img
            src={
              caseStudyThumbnail(study['main-project-image-thumbnail']?.url)?.src ||
              asset('/images/placeholder.webp')
            }
            srcSet={caseStudyThumbnail(study['main-project-image-thumbnail']?.url)?.srcset}
            sizes="388px"
            alt={
              isHidden
                ? ''
                : study['main-project-image-thumbnail']?.alt || study['project-title']
            }
            width="388"
            height="250"
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="p-4">
          <p className="text-2xl font-medium text-surface-900">
            {study['result-1---number'] || ''}
          </p>
          <p className="text-sm text-surface-600 mt-1">{study['result-1---title'] || ''}</p>
        </div>
      </Link>
    );
  };

  return (
    <section className="pt-4">
      <div className="px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Container - Min height allows growth when content overflows */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-0 lg:min-h-144 xl:min-h-160 border border-surface-200 bg-surface-50 rounded-2xl overflow-hidden">
            {/* Left: Content */}
            <div className="flex flex-col justify-center items-center lg:items-start p-6 sm:p-8 md:p-10 lg:p-12 text-center lg:text-left min-w-0">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900 leading-tight"
                dangerouslySetInnerHTML={{ __html: finalHeadline }}
              />
              <p
                className="mt-4 sm:mt-5 text-sm sm:text-base text-surface-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: finalDescription }}
              />

              {/* AI Platform Links */}
              {finalAiLinksLabel && (
                <p className="mt-5 mb-0 text-sm text-surface-500">
                  {finalAiLinksLabel}
                </p>
              )}
              <div className={`flex gap-2 flex-wrap ${finalAiLinksLabel ? 'mt-2.5' : 'mt-5'} justify-center lg:justify-start`}>
                {aiLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-surface-200 bg-white text-surface-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-all focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
                    aria-label={`Ask ${link.name} about LoudFace`}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 128 128"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      dangerouslySetInnerHTML={{ __html: link.icon }}
                    />
                  </a>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                variant="primary"
                size="lg"
                calTrigger
                className="mt-5"
              >
                {finalCtaText}
              </Button>
              {scarcityText && (
                <p className="mt-2.5 text-sm text-surface-500 italic">
                  {scarcityText}
                </p>
              )}
            </div>

            {/* Right: Scrolling Case Studies - Hidden on mobile */}
            <div className="hidden md:block relative h-96 lg:h-full">
              {/* Inner wrapper with overflow hidden */}
              <div className="absolute inset-0 overflow-hidden lg:rounded-r-2xl">
                {/* Scrolling Columns Container */}
                <div className="absolute inset-0 flex gap-4 p-4">
                  {/* Column 1: Scroll Down */}
                  <div className="flex-1 flex flex-col gap-4 animate-scroll-down hover:[animation-play-state:paused]">
                    {featuredStudies.map((study) => (
                      <CaseStudyCard key={study.id} study={study} />
                    ))}
                    {/* Duplicate for seamless loop */}
                    {featuredStudies.map((study) => (
                      <CaseStudyCard key={`dup-${study.id}`} study={study} isHidden />
                    ))}
                  </div>

                  {/* Column 2: Scroll Up (hidden below xl) */}
                  <div className="hidden xl:flex flex-1 flex-col gap-4 animate-scroll-up hover:[animation-play-state:paused]">
                    {[...featuredStudies].reverse().map((study) => (
                      <CaseStudyCard key={study.id} study={study} />
                    ))}
                    {/* Duplicate for seamless loop */}
                    {[...featuredStudies].reverse().map((study) => (
                      <CaseStudyCard key={`dup-${study.id}`} study={study} isHidden />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
