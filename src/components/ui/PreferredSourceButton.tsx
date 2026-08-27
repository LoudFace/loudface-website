'use client';

import Script from 'next/script';

interface PreferredSourceOptions {
  theme?: 'light' | 'dark';
  lang?: string;
}

interface PreferredSourceApi {
  init: (options?: PreferredSourceOptions) => void;
  addPreferredSource: () => void;
}

type PreferredSourceCallback = (preferredSource: PreferredSourceApi) => void;
type PreferredSourceQueue = PreferredSourceCallback[] | {
  push: (...callbacks: PreferredSourceCallback[]) => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: PreferredSourceQueue;
  }
}

interface PreferredSourceButtonProps {
  className?: string;
}

const manualControlAttribute = {
  'preferred-sources-control': 'manual',
};

let preferredSourceApi: PreferredSourceApi | null = null;

function preparePreferredSource(api: PreferredSourceApi) {
  preferredSourceApi = api;
  api.init({ theme: 'dark' });
}

function initializePreferredSourceButton() {
  const queue = (window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || []);
  queue.push(preparePreferredSource);
}

function openPreferredSourceFlow() {
  if (preferredSourceApi) {
    preferredSourceApi.addPreferredSource();
    return;
  }

  const queue = (window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || []);
  queue.push((api) => {
    preparePreferredSource(api);
    api.addPreferredSource();
  });
}

/**
 * LoudFace's custom trigger for Google's Preferred Sources flow.
 *
 * Google owns the confirmation flow. LoudFace owns the visible button.
 */
export function PreferredSourceButton({ className = '' }: PreferredSourceButtonProps) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={openPreferredSourceFlow}
        aria-label="Add LoudFace as a preferred source in Google Search"
        className="group inline-flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl bg-white/[0.06] px-4! py-2.5! text-left text-white ring-1 ring-inset ring-white/15 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] hover:bg-white/[0.1] hover:ring-primary-300/40 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
      >
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-black/10"
        >
          {/* Google supplies this current gradient G asset. Keep its colors unchanged. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://developers.google.com/static/identity/images/g-logo.png"
            alt=""
            width="20"
            height="20"
            className="size-5 object-contain"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-5 text-white">Prefer LoudFace</span>
          <span className="block text-xs leading-4 text-primary-200/80">in Google Search</span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-4 shrink-0 text-primary-200/70 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5"
          fill="none"
        >
          <path d="m7.5 4.5 5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <Script
        {...manualControlAttribute}
        id="google-preferred-sources"
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="lazyOnload"
        onReady={initializePreferredSourceButton}
      />
    </div>
  );
}
