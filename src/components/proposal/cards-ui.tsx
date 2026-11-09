import type { ReactNode } from 'react';

/* The cards layout's shared pieces: the page column, the tinted panel that holds
   a section's white cards, the card itself, the section heading and the tick. */
export const page = 'mx-auto max-w-[1180px] px-5 sm:px-8';
export const panel = 'mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4';
/* The light lift on a small white chip that sits inside a tinted card. */
export const softShadow = 'shadow-[0_1px_2px_rgba(10,10,10,0.06)]';
export const card = 'rounded-2xl bg-white shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)]';

export function H({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <h2 className={`text-[22px] font-medium leading-tight tracking-[-0.03em] sm:text-[26px] ${dark ? 'text-white' : 'text-surface-950'}`}>
      {children}
    </h2>
  );
}

export function Tick() {
  return (
    <span className="mt-[2px] flex h-4 w-4 flex-none items-center justify-center rounded-full bg-primary-100 text-primary-700">
      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    </span>
  );
}
