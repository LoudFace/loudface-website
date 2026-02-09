/**
 * EditorialProse — Renders CMS RichText as numbered insight cards.
 *
 * Parses HTML at H2 boundaries, extracts the first paragraph as a
 * visible summary, and puts remaining content inside a native
 * <details>/<summary> element. Matches the numbered card pattern
 * used across the rest of the site (pain points, strategy, etc.).
 *
 * Server Component — zero client JS.
 */
import { splitProseByH2 } from '@/lib/html-utils';
import { BulletLabel, Card, SectionContainer, SectionHeader } from '@/components/ui';

interface EditorialProseProps {
  html: string;
  industryName?: string;
}

export function EditorialProse({ html, industryName }: EditorialProseProps) {
  const sections = splitProseByH2(html);

  // Fallback: if 0-1 sections, render as a single prose block
  if (sections.length <= 1) {
    return (
      <SectionContainer>
        <div className="max-w-3xl">
          <div
            className="prose-surface"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </SectionContainer>
    );
  }

  // Separate preamble from H2 sections
  const preamble = sections.find((s) => !s.heading);
  const h2Sections = sections.filter((s) => s.heading);

  return (
    <SectionContainer>
      <BulletLabel>Deep Dive</BulletLabel>
      <div className="mt-4">
        <SectionHeader
          title="Industry Intelligence"
          highlightWord="Intelligence"
        />
      </div>

      {/* Preamble — lead text above the cards */}
      {preamble && preamble.summary && (
        <p className="mt-6 text-lg leading-relaxed text-surface-600 max-w-3xl">
          {preamble.summary}
        </p>
      )}

      {/* Insight Cards Grid */}
      <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {h2Sections.map((section, i) => {
          const paddedIndex = String(i + 1).padStart(2, '0');
          // Last card spans full width if odd count
          const isLastOdd = h2Sections.length % 2 !== 0 && i === h2Sections.length - 1;

          return (
            <Card
              key={section.id}
              padding="lg"
              hover={false}
              className={isLastOdd ? 'md:col-span-2' : ''}
            >
              <span className="block text-7xl font-mono font-bold text-surface-100 leading-none select-none">
                {paddedIndex}
              </span>
              <h2 className="text-xl font-medium text-surface-900 -mt-4">
                {section.heading}
              </h2>
              {section.summary && (
                <p className="mt-3 text-surface-600">{section.summary}</p>
              )}
              {section.body && (
                <details className="mt-4">
                  <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    Read the full analysis
                  </summary>
                  <div className="mt-4 pt-4 border-t border-surface-100">
                    <div
                      className="prose-surface"
                      dangerouslySetInnerHTML={{ __html: section.body }}
                    />
                  </div>
                </details>
              )}
            </Card>
          );
        })}
      </div>
    </SectionContainer>
  );
}
