import { SlideShell } from './SlideShell';

interface WhyItMattersSlideProps {
  companyName: string;
  totalSlides: number;
}

const STATS = [
  { value: '65%', label: 'of consumers use AI assistants for product research' },
  { value: '40%', label: 'of AI-influenced purchases happen without a Google search' },
  { value: '3.5x', label: 'more likely to convert when recommended by AI' },
  { value: '78%', label: 'of B2B buyers consult AI before contacting sales' },
];

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
        <p className="text-surface-400 text-sm mb-8 sm:mb-10 max-w-xl">
          Millions of users now rely on AI assistants to discover and evaluate products.
          Your brand&apos;s presence in these conversations directly impacts buying decisions.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/5 p-4 sm:p-5">
              <p className="text-2xl sm:text-3xl font-heading font-medium text-primary-400 mb-2">
                {stat.value}
              </p>
              <p className="text-2xs sm:text-sm text-surface-400">{stat.label}</p>
            </div>
          ))}
        </div>

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
