import type { Metadata } from 'next';
import { asset } from '@/lib/assets';
import { AuditForm } from './_components/AuditForm';

export const metadata: Metadata = {
  title: 'Free AI Visibility Audit',
};

export default function AuditPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img
            src={asset('/images/loudface-inversed.svg')}
            alt="LoudFace"
            width={140}
            height={32}
            className="h-8 w-auto opacity-60"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-medium text-white mb-3">
            AI Visibility Audit
          </h1>
          <p className="text-surface-400 text-base leading-relaxed">
            Discover how ChatGPT, Claude, Gemini &amp; Perplexity see your brand.
            Get a free audit with actionable insights in minutes.
          </p>
        </div>

        {/* What you get */}
        <div className="mb-8 space-y-3">
          {[
            'Brand recognition across 4 major AI platforms',
            'Competitive positioning & share of voice',
            'Category visibility in unbranded searches',
            'Actionable recommendations to improve AI visibility',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-surface-300">{item}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-surface-800 bg-surface-900/50 p-6">
          <AuditForm />
        </div>
      </div>
    </div>
  );
}
