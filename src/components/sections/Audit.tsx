import { getAuditContent, type Challenge } from '@/lib/content-utils';
import { asset } from '@/lib/assets';

interface AuditProps {
  title?: string;
  highlightText?: string;
  description?: string;
  challenges?: Challenge[];
}

export function Audit({ title, highlightText, description, challenges }: AuditProps) {
  const content = getAuditContent();

  const finalTitle = title ?? content.title;
  const finalHighlightText = highlightText ?? content.highlightText;
  const finalDescription = description ?? content.description;
  const finalChallenges = challenges ?? content.challenges;

  return (
    <section className="overflow-hidden">
      <div className="py-16 md:py-24 lg:py-32 pb-0">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="max-w-xs md:max-w-none mx-auto md:mx-0 md:text-left text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
                {finalTitle} <span className="text-surface-400">{finalHighlightText}</span>
              </h2>
            </div>

            <div className="h-4" />

            {/* Description */}
            <div className="max-w-xl mx-auto md:mx-0 md:text-left text-center">
              <p className="text-surface-600 text-lg">{finalDescription}</p>
            </div>

            <div className="h-12 md:h-16" />

            {/* Feature Cards Grid with full-width overflow */}
            <div className="audit-overflow-wrapper border-y border-surface-200">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-px bg-surface-200">
                {finalChallenges.map((challenge, index) => (
                  <div key={index} className="bg-white py-12 md:py-20 px-6 md:px-8 text-center">
                    <div className="flex justify-center">
                      <img
                        src={asset(challenge.icon)}
                        loading="lazy"
                        width="64"
                        height="64"
                        alt={challenge.iconAlt}
                        className="w-16 h-16"
                      />
                    </div>
                    <div className="h-4" />
                    <h3 className="text-xl font-bold text-surface-900">{challenge.title}</h3>
                    <div className="h-2" />
                    <p className="text-surface-600 leading-relaxed">{challenge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
