'use client';

import { useActionState } from 'react';
import { unlockProposal, type UnlockState } from './actions';

/**
 * The locked screen. It knows the token (already in the URL) and nothing else —
 * no client name, no title, no price. Everything a stranger could learn here,
 * they already had.
 */
export function AccessGate({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<UnlockState, FormData>(
    unlockProposal,
    {}
  );

  return (
    <main
      data-proposal-gate
      className="min-h-screen bg-night text-white flex items-center justify-center px-5 py-16"
    >
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lf-logo.svg" alt="LoudFace" className="h-7 w-auto mb-10 opacity-90" />

        <h1 className="text-2xl font-medium tracking-[-0.02em] leading-tight">
          This proposal is private
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">
          Enter the access code we sent you. It is in the same email as this link.
        </p>

        <form action={formAction} className="mt-8">
          <input type="hidden" name="token" value={token} />

          <label htmlFor="proposal-code" className="block text-xs uppercase tracking-[0.08em] text-white/50">
            Access code
          </label>
          <input
            id="proposal-code"
            name="code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            aria-describedby={state.error ? 'proposal-code-error' : undefined}
            aria-invalid={state.error ? true : undefined}
            className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base tracking-[0.12em] uppercase text-white placeholder:text-white/30 outline-none focus-visible:border-white/60 focus-visible:ring-2 focus-visible:ring-white/30"
            placeholder="XXXX-XXXX"
          />

          {state.error && (
            <p id="proposal-code-error" role="alert" className="mt-3 text-sm text-white/85">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-lg bg-white px-4 py-3 text-[15px] font-medium text-surface-950 transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {pending ? 'Checking…' : 'Open the proposal'}
          </button>
        </form>

        <p className="mt-8 text-[13px] leading-relaxed text-white/45">
          Lost the code? Reply to the email that brought you here and we will resend it.
        </p>
      </div>
    </main>
  );
}
