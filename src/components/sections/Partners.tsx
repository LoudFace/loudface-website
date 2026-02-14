import { asset } from '@/lib/assets';
import { avatarImage, logoImage } from '@/lib/image-utils';
import { getPartnersContent } from '@/lib/content-utils';
import type { Testimonial, Client } from '@/lib/types';

interface PartnersProps {
  testimonials: Testimonial[];
  clients: Client[];
  starCount?: number;
  starRatingPrefix?: string;
  starRatingSuffix?: string;
  tagline?: string;
}

export function Partners({
  testimonials,
  clients,
  starCount = 5,
  starRatingPrefix,
  starRatingSuffix,
  tagline,
}: PartnersProps) {
  const content = getPartnersContent();

  const finalStarRatingPrefix = starRatingPrefix ?? content.starRatingPrefix;
  const finalStarRatingSuffix = starRatingSuffix ?? content.starRatingSuffix;
  const finalTagline = tagline ?? content.tagline;

  // Filter clients that should be showcased
  const showcaseClients = clients.filter((c) => c['showcase-logo']);

  return (
    <section className="overflow-visible relative z-10">
      <div className="pt-12 md:pt-16 lg:pt-20">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2">
              <span className="font-bold text-surface-900">{finalStarRatingPrefix}</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: starCount }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6.748.669a.275.275 0 0 1 .504 0l1.716 3.903a.275.275 0 0 0 .219.167l4.069.506a.275.275 0 0 1 .155.498l-3.008 2.919a.275.275 0 0 0-.084.27l.798 4.217a.275.275 0 0 1-.407.31L7.135 11.363a.275.275 0 0 0-.27 0l-3.575 2.1a.275.275 0 0 1-.407-.311l.798-4.216a.275.275 0 0 0-.083-.27L.59 5.742a.275.275 0 0 1 .155-.498l4.069-.506a.275.275 0 0 0 .218-.167L6.748.67Z" fill="currentColor" className="text-primary-600" />
                  </svg>
                ))}
              </div>
              <span className="font-bold text-surface-900">{finalStarRatingSuffix}</span>
            </div>

            <div className="h-4" />

            {/* Testimonial Headshots — only show those with real profile images */}
            {testimonials.filter((t) => t['profile-image']?.url).length > 0 && (
              <div className="flex flex-wrap justify-center relative z-20">
                {testimonials.filter((t) => t['profile-image']?.url).map((testimonial) => (
                  <div key={testimonial.id} className="relative z-20 -ml-2 first:ml-0">
                    <div className="testimonial-headshot relative cursor-pointer z-20 group">
                      <img
                        src={avatarImage(testimonial['profile-image']!.url)}
                        loading="lazy"
                        width="40"
                        height="40"
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      />
                      <div className="testimonial-tooltip">
                        <div
                          className="text-sm leading-relaxed text-surface-700 [&>p]:m-0"
                          dangerouslySetInnerHTML={{
                            __html: testimonial['testimonial-body'] || '',
                          }}
                        />
                        <div className="h-px bg-surface-200 my-3" />
                        <div className="flex flex-col gap-0.5">
                          <div className="font-bold text-sm text-surface-900">
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-surface-500">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tagline */}
            <div className="h-4" />
            <p className="text-center text-surface-600 text-lg">{finalTagline}</p>

            <div className="h-8" />

            {/* Client Logos */}
            {showcaseClients.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-x-12 md:gap-y-8">
                {showcaseClients.map((client) => (
                  <div key={client.id} className="logo-item w-24 h-10 flex items-center justify-center">
                    <img
                      src={
                        logoImage(client['colored-logo']?.url) ||
                        asset('/images/placeholder-logo.svg')
                      }
                      loading="lazy"
                      alt={client.name}
                      className="max-w-full max-h-full object-contain grayscale opacity-60 transition-all duration-200 hover:grayscale-0 hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
