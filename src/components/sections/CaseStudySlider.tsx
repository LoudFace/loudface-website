'use client';

import Link from 'next/link';
import { getCaseStudySliderContent } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { cardImage, optimizeImage } from '@/lib/image-utils';
import { BulletLabel, Button, CarouselNav } from '@/components/ui';
import { useCarousel } from '@/hooks/useCarousel';
import type { CaseStudy, Client, Industry, Testimonial } from '@/lib/types';

interface CaseStudySliderProps {
  title?: string;
  caseStudies: CaseStudy[];
  clients?: Map<string, Client>;
  industries?: Map<string, Industry>;
  testimonials?: Map<string, Testimonial>;
  ctaText?: string;
}

// Color parsing utilities
function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  if (!color || typeof color !== 'string') return null;

  const trimmed = color.trim();

  // Try hex format
  if (trimmed.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    const hex = trimmed.replace('#', '');

    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    } else if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // Try rgb/rgba format
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  return null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function getContrastRatio(bgLuminance: number, fgLuminance: number): number {
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function getContrastColors(hexColor: string | undefined): {
  textColor: string;
  mode: 'light' | 'dark';
  overlayColor: string;
} {
  if (!hexColor) {
    return {
      textColor: 'hsl(0, 0%, 95%)',
      mode: 'dark',
      overlayColor: 'rgba(255, 255, 255, 0.1)',
    };
  }

  const rgb = parseColorToRgb(hexColor);
  if (!rgb) {
    return {
      textColor: 'hsl(0, 0%, 95%)',
      mode: 'dark',
      overlayColor: 'rgba(255, 255, 255, 0.1)',
    };
  }

  const { r, g, b } = rgb;
  const hsl = rgbToHsl(r, g, b);
  const bgLuminance = getLuminance(r, g, b);
  const isLightBg = bgLuminance > 0.4;
  const MIN_CONTRAST = 4.5;

  let saturation = Math.min(hsl.s * 0.7, 60);
  let lightness = isLightBg ? 15 : 90;

  let textRgb = hslToRgb(hsl.h, saturation, lightness);
  let textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);
  let contrast = getContrastRatio(bgLuminance, textLuminance);

  let iterations = 0;
  const maxIterations = 10;

  while (contrast < MIN_CONTRAST && iterations < maxIterations) {
    iterations++;
    saturation = Math.max(saturation - 10, 0);

    if (isLightBg) {
      lightness = Math.max(lightness - 3, 5);
    } else {
      lightness = Math.min(lightness + 2, 98);
    }

    textRgb = hslToRgb(hsl.h, saturation, lightness);
    textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);
    contrast = getContrastRatio(bgLuminance, textLuminance);
  }

  if (contrast < MIN_CONTRAST) {
    return {
      textColor: isLightBg ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 98%)',
      mode: isLightBg ? 'light' : 'dark',
      overlayColor: isLightBg ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
    };
  }

  const textColor = `hsl(${Math.round(hsl.h)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  const overlayColor = isLightBg
    ? `hsla(${Math.round(hsl.h)}, ${Math.round(saturation)}%, 10%, 0.15)`
    : `hsla(${Math.round(hsl.h)}, ${Math.round(saturation)}%, 95%, 0.15)`;

  return {
    textColor,
    mode: isLightBg ? 'light' : 'dark',
    overlayColor,
  };
}

export function CaseStudySlider({
  title,
  caseStudies,
  clients = new Map(),
  testimonials = new Map(),
  ctaText,
}: CaseStudySliderProps) {
  const content = getCaseStudySliderContent();

  const finalTitle = title ?? content.title;
  const finalCtaText = ctaText ?? content.ctaText;

  const { emblaRef, scrollPrev, scrollNext } = useCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  function getClient(clientId: string | undefined): Client | undefined {
    if (!clientId) return undefined;
    return clients.get(clientId);
  }

  function getTestimonial(caseStudyId: string): Testimonial | undefined {
    for (const testimonial of testimonials.values()) {
      if (testimonial['case-study'] === caseStudyId) {
        return testimonial;
      }
    }
    return undefined;
  }

  // Arrow icon
  const arrowIcon = `<path d="M2.91854 1.85641H8.14011L1.06819 8.92834C1.01486 8.98166 0.972567 9.04496 0.94371 9.11463C0.914853 9.1843 0.9 9.25897 0.9 9.33437C0.9 9.40978 0.914853 9.48445 0.94371 9.55412C0.972567 9.62379 1.01486 9.68709 1.06818 9.74041C1.12151 9.79373 1.18481 9.83603 1.25448 9.86488C1.32414 9.89374 1.39881 9.90859 1.47422 9.90859C1.54963 9.90859 1.6243 9.89374 1.69396 9.86488C1.76363 9.83603 1.82693 9.79373 1.88025 9.74041L8.95193 2.66873V7.91349C8.95193 8.06562 9.01236 8.21153 9.11994 8.3191C9.22752 8.42668 9.37342 8.48711 9.52555 8.48711C9.67769 8.48711 9.82359 8.42668 9.93116 8.3191C10.0387 8.21153 10.0992 8.06562 10.0992 7.91349V1.31361C10.0997 1.30337 10.1 1.29311 10.1 1.28281C10.1 1.13052 10.0395 0.984466 9.93182 0.876779C9.82413 0.769092 9.67807 0.708594 9.52578 0.708594C9.51717 0.708594 9.50858 0.708787 9.50001 0.709172H2.91854C2.7664 0.709172 2.6205 0.769607 2.51292 0.877182C2.40535 0.984757 2.34491 1.13066 2.34491 1.28279C2.34491 1.43493 2.40535 1.58083 2.51292 1.6884C2.6205 1.79598 2.7664 1.85641 2.91854 1.85641Z" fill="currentColor" stroke-width="0.2"/>`;

  return (
    <section className="pb-16 md:pb-20 overflow-hidden">
      <div className="pt-16 md:pt-20 lg:pt-24">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 xs:gap-10 max-w-full">
              {/* Header with nav */}
              <div className="flex justify-between items-center">
                <BulletLabel as="h2">{finalTitle}</BulletLabel>
                <div className="hidden md:block">
                  <CarouselNav
                    variant="light"
                    onPrevClick={scrollPrev}
                    onNextClick={scrollNext}
                  />
                </div>
              </div>

              {/* Embla Carousel */}
              <div className="embla w-full max-w-full overflow-hidden">
                {caseStudies.length > 0 ? (
                  <div className="embla__viewport overflow-hidden" ref={emblaRef}>
                    <div className="embla__container flex items-start gap-4 md:gap-10 touch-pan-y">
                      {caseStudies.map((study) => {
                        const client = getClient(study.client);
                        const testimonial = getTestimonial(study.id);
                        const { textColor, overlayColor } = getContrastColors(study['client-color']);
                        const cardStyle = study['client-color']
                          ? {
                              backgroundColor: study['client-color'],
                              color: textColor,
                              '--card-text': textColor,
                              '--card-overlay': overlayColor,
                            } as React.CSSProperties
                          : undefined;

                        return (
                          <div
                            key={study.id}
                            className="embla__slide flex-[0_0_100%] md:flex-[0_0_auto] min-w-0 max-w-full md:max-w-[46.25rem]"
                          >
                            <div
                              className="case-card flex flex-col md:flex-row gap-6 rounded-lg p-6 relative transition-opacity duration-200 hover:opacity-85"
                              style={cardStyle}
                            >
                              <Link
                                href={`/work/${study.slug}`}
                                className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:rounded-lg"
                                aria-label={`View ${study['project-title']} case study`}
                              />

                              {/* Thumbnail */}
                              <div className="flex-none w-full md:w-[280px] max-h-[300px] md:max-h-[400px] rounded-md overflow-hidden">
                                <img
                                  src={
                                    cardImage(study['main-project-image-thumbnail']?.url) ||
                                    asset('/images/placeholder.webp')
                                  }
                                  alt={
                                    study['main-project-image-thumbnail']?.alt ||
                                    study['project-title']
                                  }
                                  width="600"
                                  height="841"
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 flex flex-col">
                                <div className="flex flex-col justify-between h-full gap-4">
                                  {/* Title & Summary */}
                                  <div>
                                    <h3 className="text-xl font-medium">
                                      {study['project-title']}
                                    </h3>
                                    <div className="h-2" />
                                    <p className="text-sm opacity-90">
                                      {study['paragraph-summary']}
                                    </p>
                                  </div>

                                  {/* Stats & Testimonial */}
                                  <div>
                                    {study['result-1---number'] && (
                                      <div className="flex items-center gap-2.5 mb-2">
                                        <div
                                          className="rounded-lg px-4 py-2"
                                          style={{
                                            backgroundColor:
                                              'var(--card-overlay, rgba(255, 255, 255, 0.1))',
                                          }}
                                        >
                                          <span className="text-lg font-medium">
                                            {study['result-1---number']}
                                          </span>
                                        </div>
                                        <div className="max-w-[150px]">
                                          <span className="text-sm font-medium">
                                            {study['result-1---title']}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {testimonial && (
                                      <>
                                        <div className="h-4" />
                                        <div className="rounded-lg p-4 bg-black/50">
                                          <div
                                            className="text-sm line-clamp-2"
                                            dangerouslySetInnerHTML={{
                                              __html: testimonial['testimonial-body'] || '',
                                            }}
                                          />
                                          <div className="h-3" />
                                          <div className="text-sm font-bold">{testimonial.name}</div>
                                          <div className="text-xs opacity-75">
                                            {testimonial.role}
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    <div className="h-4" />
                                    <div
                                      className="h-px"
                                      style={{
                                        backgroundColor:
                                          'var(--card-overlay, rgba(255, 255, 255, 0.2))',
                                      }}
                                    />
                                    <div className="h-4" />

                                    {/* Footer */}
                                    <div className="flex justify-between items-center">
                                      <div className="[&>img]:max-h-5 [&>img]:w-auto">
                                        {client?.['colored-logo']?.url ? (
                                          <img
                                            src={optimizeImage(client['colored-logo'].url, 100)}
                                            alt={client.name || 'Client logo'}
                                            width="94"
                                            height="20"
                                            loading="lazy"
                                          />
                                        ) : (
                                          <span className="font-medium">{client?.name || ''}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Read case study</span>
                                        <svg
                                          width="14"
                                          height="14"
                                          viewBox="0 0 11 10"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                          dangerouslySetInnerHTML={{ __html: arrowIcon }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-surface-500">
                    <p>No case studies found.</p>
                  </div>
                )}
              </div>

              {/* Mobile nav buttons */}
              <div className="block md:hidden">
                <div className="flex justify-center items-center">
                  <CarouselNav
                    variant="light"
                    onPrevClick={scrollPrev}
                    onNextClick={scrollNext}
                  />
                </div>
              </div>
            </div>

            <div className="h-8 md:h-12" />

            {/* CTA Button */}
            <div className="text-center">
              <Button variant="primary" size="lg" calTrigger>
                {finalCtaText}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .case-card {
          background-color: var(--color-surface-900);
          color: var(--card-text, inherit);
          max-width: 46.25rem;
        }
      `}</style>
    </section>
  );
}
