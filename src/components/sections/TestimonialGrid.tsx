import { avatarImage } from '@/lib/image-utils';
import { SectionContainer, SectionHeader } from '@/components/ui';
import type { Testimonial } from '@/lib/types';

interface TestimonialGridProps {
  testimonials: Testimonial[];
  title?: string;
  highlightWord?: string;
  subtitle?: string;
  variant?: 'light' | 'gray';
  limit?: number;
}

export function TestimonialGrid({
  testimonials,
  title,
  highlightWord,
  subtitle,
  variant = 'gray',
  limit = 3,
}: TestimonialGridProps) {
  const displayTestimonials = testimonials.filter(
    (t) => t['profile-image']?.url && t['testimonial-body'],
  );

  if (displayTestimonials.length === 0) return null;

  const sectionBg = variant === 'gray' ? 'bg-surface-50' : 'bg-white';
  const cardBg = variant === 'gray' ? 'bg-white' : 'bg-surface-50';

  return (
    <SectionContainer className={sectionBg}>
      {title && (
        <SectionHeader
          title={title}
          highlightWord={highlightWord}
          subtitle={subtitle}
        />
      )}
      <div
        className={`${title ? 'mt-8 lg:mt-12' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}
      >
        {displayTestimonials.slice(0, limit).map((t) => (
          <div
            key={t.id}
            className={`rounded-2xl ${cardBg} border border-surface-200 p-6 md:p-8`}
          >
            <div
              className="text-sm text-surface-600 leading-relaxed [&>p]:m-0 line-clamp-5"
              dangerouslySetInnerHTML={{ __html: t['testimonial-body'] || '' }}
            />
            <div className="mt-6 flex items-center gap-3">
              <img
                src={avatarImage(t['profile-image']!.url)}
                alt={t.name}
                width="40"
                height="40"
                loading="lazy"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-medium text-surface-900">
                  {t.name}
                </div>
                <div className="text-2xs text-surface-500">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
