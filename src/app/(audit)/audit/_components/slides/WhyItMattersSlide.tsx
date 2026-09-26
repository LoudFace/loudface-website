import { SlideShell } from './SlideShell';

interface WhyItMattersSlideProps {
  companyName: string;
  totalSlides: number;
}

/* The four industry figures that sat here (65%, 40%, 3.5x, 78%) were cut on 2026-09-26: none had a source. */
export function WhyItMattersSlide({ companyName, totalSlides }: WhyItMattersSlideProps) {
  return (
    <SlideShell index={12} totalSlides={totalSlides} variant="darker">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm text-primary-400 font-medium tracking-wider uppercase mb-2">
          Why This Matters
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-2">
          AI Is Becoming the New Search
        </h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xl">
          Millions of users now rely on AI assistants to discover and evaluate products.
          Your brand&apos;s presence in these conversations directly impacts buying decisions.
        </p>

        <div className="rounded-lg bg-error/5 border border-error/10 p-4">
          <p className="text-sm text-surface-300">
            If {companyName} is not showing up in AI responses, you&apos;re losing deals
            to competitors who are &mdash; and the worst part is you don&apos;t even know it.
          </p>
        </div>
      </div>
    </SlideShell>
  );
}
