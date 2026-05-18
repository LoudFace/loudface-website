'use client';

import { useState } from 'react';
import { SOCIAL_ICONS } from '@/lib/icons';

interface BlogShareRowProps {
  articleUrl: string;
  articleTitle: string;
}

/**
 * Sidebar share strip — X, copy-link, LinkedIn. The copy-link button uses
 * the Clipboard API and shows a check-icon confirmation for 1.8s.
 */
export function BlogShareRow({ articleUrl, articleTitle }: BlogShareRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard write blocked (rare) — degrade silently
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;

  return (
    <div>
      <span className="block text-[11px] font-medium text-surface-500 uppercase tracking-[0.08em] mb-3">
        Share this article
      </span>
      <div className="flex gap-1">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X"
          aria-label="Share on X"
          className="w-9 h-9 rounded-md text-surface-500 flex items-center justify-center hover:text-surface-950 hover:bg-surface-100 transition-colors [&_svg]:w-[15px] [&_svg]:h-[15px]"
          dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS.Twitter }}
        />
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy link'}
          aria-label="Copy article link to clipboard"
          className="w-9 h-9 rounded-md text-surface-500 flex items-center justify-center hover:text-surface-950 hover:bg-surface-100 transition-colors"
        >
          {copied ? (
            <svg
              className="w-4 h-4 text-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
        </button>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
          className="w-9 h-9 rounded-md text-surface-500 flex items-center justify-center hover:text-surface-950 hover:bg-surface-100 transition-colors [&_svg]:w-[15px] [&_svg]:h-[15px]"
          dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS.LinkedIn }}
        />
      </div>
    </div>
  );
}
