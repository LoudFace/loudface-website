import { SlideShell } from './SlideShell';

interface MethodologySlideProps {
  totalSlides: number;
}

const PHASES = [
  {
    number: '01',
    title: 'Brand Baseline',
    description: 'Direct brand queries — testing how AI platforms respond when users explicitly ask about your brand.',
    queries: '10 queries',
    detail: 'Name recognition, features, pricing, reviews',
  },
  {
    number: '02',
    title: 'Competitor Context',
    description: 'Alternative-to searches — when users look for alternatives to competitors, does your brand appear?',
    queries: '6 queries',
    detail: 'Top competitors auto-detected, recommendation rate',
  },
  {
    number: '03',
    title: 'Category Visibility',
    description: 'Unbranded discovery — when users search for solutions in your category, do AI platforms surface your brand?',
    queries: '8 queries',
    detail: 'Shortlisting + buyer-journey intent prompts',
  },
];

export function MethodologySlide({ totalSlides }: MethodologySlideProps) {
  return (
    <SlideShell index={2} totalSlides={totalSlides}>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          The Audit Process
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-3">
          Three-Phase Testing Protocol
        </h2>
        <p className="text-surface-400 text-sm mb-8 sm:mb-10 max-w-xl">
          A rigorous protocol evaluating how ChatGPT, Claude, Gemini &amp; Perplexity
          perceive, rank, and recommend your brand.
        </p>

        <div className="grid gap-4 sm:gap-6">
          {PHASES.map((phase) => (
            <div key={phase.number} className="flex gap-4 sm:gap-6 rounded-xl bg-white/5 p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl font-heading font-medium text-primary-600/40 shrink-0 w-12">
                {phase.number}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">{phase.title}</h3>
                <p className="text-sm text-surface-400 mb-2">{phase.description}</p>
                <div className="flex items-center gap-3 text-2xs text-surface-500">
                  <span className="px-2 py-0.5 rounded bg-surface-800">{phase.queries}</span>
                  <span>{phase.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform-coverage note — pre-empts the "why is my Gemini score 0?" question */}
        <div className="mt-6 sm:mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
          <p className="text-2xs tracking-wider uppercase text-surface-500 mb-1.5">
            A note on platform coverage
          </p>
          <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
            ChatGPT&apos;s scraped responses sometimes omit source URLs, so its citation
            rate can appear lower than its actual on-screen behavior. Gemini has
            limited recall on emerging brands and may return empty responses for some
            queries. Claude and Perplexity reliably return both full text and
            citations across all 4 phases.
          </p>
        </div>
      </div>
    </SlideShell>
  );
}
