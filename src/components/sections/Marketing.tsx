import { getMarketingContent, type MarketingCard } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { Button } from '@/components/ui/Button';

interface MarketingProps {
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  description?: string;
  cards?: MarketingCard[];
  ctaText?: string;
}

export function Marketing({
  title,
  titleHighlight,
  subtitle,
  description,
  cards,
  ctaText,
}: MarketingProps) {
  const content = getMarketingContent();

  const finalTitle = title ?? content.title;
  const finalTitleHighlight = titleHighlight ?? content.titleHighlight;
  const finalSubtitle = subtitle ?? content.subtitle;
  const finalDescription = description ?? content.description;
  const finalCards = cards ?? content.cards;
  const finalCtaText = ctaText ?? content.ctaText;

  return (
    <SectionContainer className="bg-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          {finalTitle} <span className="text-surface-400">{finalTitleHighlight}</span>{' '}
          {finalSubtitle} <span className="text-surface-400">profit</span>
        </h2>
        <div className="h-3" />
        <p className="text-surface-600 text-lg">{finalDescription}</p>
      </div>

      <div className="h-12 md:h-16" />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
        {finalCards.map((card, index) => (
          <div key={index} className="group flex flex-col">
            <div className="rounded-xl overflow-hidden bg-surface-100">
              <img
                src={asset(card.image)}
                loading="lazy"
                width="823"
                height="461"
                alt={card.imageAlt}
                className="w-full h-auto aspect-[823/461] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="h-4 md:h-6" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-surface-900">{card.title}</h3>
              <div className="h-2" />
              <p className="text-surface-600">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="h-12 md:h-16" />

      {/* CTA Button */}
      <div className="text-center">
        <Button variant="primary" size="lg" calTrigger>
          {finalCtaText}
        </Button>
      </div>
    </SectionContainer>
  );
}
