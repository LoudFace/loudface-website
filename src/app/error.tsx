'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { SectionContainer, Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SectionContainer padding="lg">
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-8xl font-medium text-surface-200 select-none">500</p>

        <h1 className="mt-6 text-2xl sm:text-3xl font-medium text-surface-900">
          Something went wrong
        </h1>

        <p className="mt-4 text-lg text-surface-600">
          An unexpected error occurred. Please try again.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" size="lg" href="/">
            Back to home
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-200">
          <p className="text-sm text-surface-500 mb-4">Or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/blog" className="text-sm text-surface-600 hover:text-primary-600 transition-colors">Blog</Link>
            <Link href="/case-studies" className="text-sm text-surface-600 hover:text-primary-600 transition-colors">Case Studies</Link>
            <Link href="/about" className="text-sm text-surface-600 hover:text-primary-600 transition-colors">About us</Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
