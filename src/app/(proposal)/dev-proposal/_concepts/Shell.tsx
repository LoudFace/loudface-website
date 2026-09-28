import type { ReactNode } from 'react';
import type { PortableTextBlock } from '@portabletext/types';
import type { Proposal, ProposalSection } from '@/sanity/lib/proposalsClient';
import { ProofRail } from '@/components/proposal/ProposalSocialProof';
import { ProposalCaseProof } from '@/components/proposal/ProposalCaseProof';
import { PlateDefs } from '@/components/proposal/ProposalFigures';
import { ProposalLogoStrip } from '@/components/proposal/ProposalLogoStrip';
import { HowWeWorkRing } from '@/components/proposal/HowWeWorkRing';

/**
 * Concept shell. The header, the proof rail, the case charts and the footer
 * are the live components, untouched, so a concept only differs where it is
 * meant to: the body sections and the dark close. Layout mirrors
 * ProposalDocument (rail beside the light sections, close full width below).
 */

export type Render = (section: ProposalSection, index: number) => ReactNode | null;

export function plain(blocks?: PortableTextBlock[] | null): string[] {
  return (blocks ?? []).map((b) =>
    ((b as { children?: { text?: string }[] }).children ?? []).map((c) => c.text ?? '').join('')
  );
}

export const WORK = [
  { src: '/dev-proposal/work/eve-roque.jpg', name: 'Eve & Roque', kind: 'Venues' },
  { src: '/dev-proposal/work/brandfirm.jpg', name: 'Brandfirm', kind: 'Agency' },
  { src: '/dev-proposal/work/ground-up.jpg', name: 'Ground Up', kind: 'Coffee & tea' },
  { src: '/dev-proposal/work/urban-umbrella.jpg', name: 'Urban Umbrella', kind: 'Construction' },
  { src: '/dev-proposal/work/reiterate.jpg', name: 'Reiterate', kind: 'Finance software' },
  { src: '/dev-proposal/work/scandinavian.jpg', name: 'Scandinavian', kind: 'Brand studio' },
];
export const FIGMA_URL =
  'https://www.figma.com/design/F9eiT6aTU3ntbWc51Jkhu5/LoudFace--Design-Samples?node-id=0-1&t=cFnr6sMy2HCOiYGT-1';

export function ConceptShell({
  proposal,
  concept,
  renderLight,
  renderDark,
  bodyClass = '',
  hero,
}: {
  proposal: Proposal;
  concept: string;
  renderLight: Render;
  renderDark: Render;
  bodyClass?: string;
  hero?: ReactNode;
}) {
  const sections = proposal.sections ?? [];
  const firstDark = sections.findIndex((s) => (s as { band?: string }).band === 'dark');
  const railEnd = firstDark === -1 ? sections.length : firstDark;
  const clips = (proposal.clipStrip?.clips ?? []).filter((c) => c.videoUrl || c.posterUrl || c.name);
  const page = 'mx-auto max-w-[1180px] px-5 sm:px-8';

  const light = sections.slice(0, railEnd).map((section, i) => {
    if (section._type === 'caseProofSection') {
      return (
        <ProposalCaseProof
          key={section._key}
          heading={section.heading}
          intro={section.intro}
          slugs={section.slugs}
          chartsPerCase={section.chartsPerCase}
          index={i}
        />
      );
    }
    return <div key={section._key}>{renderLight(section, i)}</div>;
  });

  return (
    <main className={`proposal-surface bg-surface-50 ${bodyClass}`} data-concept={concept}>
      <PlateDefs />
      {hero ?? (
      <header className="bg-night text-white">
        <div className={`${page} pt-12 pb-14 sm:pt-16`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lf-logo.svg" alt="LoudFace" className="h-6 w-auto opacity-90" />
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-12">
            <div className="min-w-0 max-w-[62ch]">
              <h1 className="mt-9 max-w-[20ch] text-[30px] font-medium leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
                {proposal.title}
              </h1>
              {proposal.priceLine && (
                <p className="proposal-num mt-5 text-[16.5px] font-medium leading-relaxed text-white">{proposal.priceLine}</p>
              )}
            </div>
            <div className="mt-10 max-w-[460px] lg:mt-0 lg:max-w-none">
              <HowWeWorkRing />
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">
                Design and development are part of the retainer, never billed by the hour. Need a landing page? It is
                live the same day you ask.
              </p>
            </div>
          </div>
          <ProposalLogoStrip />
          <p className="mt-7 text-[13px] text-white/55">
            Prepared for <span className="font-medium text-white">{proposal.preparedFor?.join(', ')}</span>
          </p>
        </div>
      </header>
      )}

      <div className={page}>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_328px] lg:gap-14">
          <div className="min-w-0">{light}</div>
          <aside className="hidden lg:block">
            <div className="sticky top-8 mt-10">
              <ProofRail rail={proposal.proofRail} clips={clips} />
            </div>
          </aside>
        </div>
      </div>

      {railEnd < sections.length && (
        <div className="bg-night text-white">
          <div className={`${page} py-4`}>
            {sections.slice(railEnd).map((section, i) => (
              <div key={section._key}>{renderDark(section, railEnd + i)}</div>
            ))}
          </div>
        </div>
      )}

      <div className={`${page} border-t border-surface-200 py-9 lg:hidden`}>
        <ProofRail rail={proposal.proofRail} clips={clips} />
      </div>

      <footer className="border-t border-white/10 bg-night px-5 py-10 text-white/60 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-baseline justify-between gap-3 text-[13px]">
          <p>Prepared by LoudFace for {proposal.clientName}. Confidential — please do not circulate outside your team.</p>
          <a href={`mailto:${proposal.contactEmail}`} className="font-medium text-white">
            {proposal.contactEmail}
          </a>
        </div>
      </footer>
    </main>
  );
}
