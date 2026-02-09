/**
 * DeliverablesGrid — Parses CMS RichText <ul><li> content and renders
 * each deliverable in a dual-column vertical marquee.
 *
 * Split layout: header text on the left, two columns of items scrolling
 * in opposite directions on the right. Items are duplicated in the DOM
 * for seamless CSS-only looping. Fade masks at top/bottom edges.
 *
 * Uses existing scroll-down/scroll-up keyframes from globals.css.
 * Respects prefers-reduced-motion (animation: none fallback).
 *
 * Server Component — zero client JS.
 */
import { parseDeliverableItems, type DeliverableItem } from '@/lib/html-utils';
import { SectionContainer, SectionHeader } from '@/components/ui';

interface DeliverablesGridProps {
  html: string;
  industryName?: string;
}

const fadeMask = {
  maskImage:
    'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
  WebkitMaskImage:
    'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
};

function DeliverableCard({ item }: { item: DeliverableItem }) {
  return (
    <div className="rounded-lg border border-surface-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <svg
          className="flex-shrink-0 w-5 h-5 mt-0.5 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-surface-900">{item.title}</h3>
          {item.description && (
            <p className="mt-1 text-xs text-surface-500 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeliverablesGrid({ html, industryName }: DeliverablesGridProps) {
  const items = parseDeliverableItems(html);

  // Fallback: if parsing fails, render as plain prose
  if (items.length === 0) {
    return (
      <SectionContainer>
        <SectionHeader
          title="What's Included"
          highlightWord="Included"
          subtitle={`Everything we deliver as part of your ${industryName || ''} SEO program.`}
        />
        <div className="mt-8 lg:mt-12 max-w-3xl">
          <div
            className="prose-surface"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </SectionContainer>
    );
  }

  // Split items into two columns for opposite-direction scrolling
  const midpoint = Math.ceil(items.length / 2);
  const colA = items.slice(0, midpoint);
  const colB = items.slice(midpoint);

  return (
    <SectionContainer>
      <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16">
        {/* Left: Section header */}
        <div className="lg:w-2/5 shrink-0">
          <SectionHeader
            title="What's Included"
            highlightWord="Included"
            subtitle={`Everything we deliver as part of your ${industryName || ''} SEO program.`}
          />
        </div>

        {/* Right: Dual-column vertical marquee */}
        <div
          className="lg:w-3/5 relative h-80 lg:h-[28rem] overflow-hidden"
          style={fadeMask}
        >
          <div className="flex gap-4">
            {/* Column A — items scroll upward */}
            <div className="flex-1">
              <div className="animate-scroll-down flex flex-col gap-4">
                {[...colA, ...colA].map((item, i) => (
                  <DeliverableCard key={`a-${i}`} item={item} />
                ))}
              </div>
            </div>

            {/* Column B — items scroll downward */}
            <div className="flex-1">
              <div className="animate-scroll-up flex flex-col gap-4">
                {[...colB, ...colB].map((item, i) => (
                  <DeliverableCard key={`b-${i}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
