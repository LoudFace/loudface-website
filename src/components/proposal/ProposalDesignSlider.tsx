import { fetchDesignWork } from '@/sanity/lib/designWork';
import { DesignSliderTrack } from './DesignSliderTrack';

/**
 * Our design case studies as a slider, read live from the public case studies.
 * One card per case: the case's own cover image, name, industry and headline
 * result, linking to the case page on loudface.co.
 */
export async function ProposalDesignSlider({
  heading,
  intro,
  slugs,
  index,
}: {
  heading?: string;
  intro?: string;
  slugs: string[];
  index: number;
}) {
  const items = await fetchDesignWork(slugs);
  if (items.length === 0) return null;

  return (
    <section
      id={`section-${index + 1}`}
      data-proposal-section={heading || 'designSliderSection'}
      data-proposal-type="designSliderSection"
      className="py-12 sm:py-14"
    >
      <DesignSliderTrack heading={heading} intro={intro} items={items} />
    </section>
  );
}
