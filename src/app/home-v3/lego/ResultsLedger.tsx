import Image from 'next/image';
import Link from 'next/link';
import { AnimatedNumber } from '@/components/ui';
import type { HomeImages } from '../data';

const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

const RECEIPTS = [
  {
    slug: 'dimer-health',
    domain: 'dimerhealth.com',
    fallback: `${CDN}467a77e9756e7890f1c62874d3388937727c4c6e-2880x1800.png`,
    crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82',
    alt: 'Dimer Health website work by LoudFace',
    prefix: '',
    value: 288,
    decimals: 0,
    suffix: '%',
    label: 'Increase in conversions',
    description: 'Measured over six months of CRO work on the Dimer Health site.',
    discipline: 'CRO',
    href: '/case-studies/dimer-health',
    evidence: [
      ['Evidence', 'Case study'],
      ['Window', 'Six months'],
      ['Status', 'Verified'],
    ],
  },
  {
    slug: 'toku-ai-cited-pipeline',
    domain: 'toku.com',
    fallback: `${CDN}cafcfa6fadc9ea6d1d38391eda626fd12ff5e5a0-2880x1800.png`,
    crop: '?w=1600&h=1000&fit=crop&crop=top&fm=webp&q=82',
    alt: 'Toku website work by LoudFace',
    prefix: '0 → ',
    value: 97.8,
    decimals: 1,
    suffix: '%',
    label: 'AI visibility on the core prompt',
    description: 'From absent to cited on the answer that matters in Toku’s category.',
    discipline: 'AEO',
    href: '/case-studies/toku-ai-cited-pipeline',
    evidence: [
      ['Evidence', 'Case study'],
      ['Baseline', '0%'],
      ['Status', 'Tracked'],
    ],
  },
] as const;

/**
 * Proof-led result rows composed from Shadcnblocks, Beautiful UI, AI Elements,
 * Magic UI, Rare UI, Collect UI, and Recent Design references.
 */
export function ResultsLedger({ images = {} }: { images?: HomeImages }) {
  return (
    <section className="lego-results" aria-labelledby="lego-results-title">
      <div className="container">
        <div className="lego-section-head">
          <span className="lego-kicker">Verified outcomes</span>
          <div>
            <h2 id="lego-results-title" className="sec">
              Numbers, not adjectives
            </h2>
            <p>
              The proof is easier to trust when the result, the work, and the client sit in one place.
            </p>
          </div>
        </div>

        <div className="receipt-list">
          {RECEIPTS.map((receipt, index) => (
            <article className="receipt-row" key={receipt.slug}>
              <div className="receipt-work">
                <div className="receipt-dossier">
                  <span className="receipt-dossier-tab" aria-hidden="true">
                    Case file {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="receipt-browser" aria-hidden="true">
                    <div className="receipt-bar">
                      <span className="receipt-dots"><i></i><i></i><i></i></span>
                      <span>{receipt.domain}</span>
                    </div>
                    <Image
                      src={(images[receipt.slug] ?? receipt.fallback) + receipt.crop}
                      alt={receipt.alt}
                      width={1600}
                      height={1000}
                      sizes="(max-width: 900px) 92vw, 650px"
                      quality={82}
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>

              <div className="receipt-proof">
                <span className="receipt-client">
                  <i aria-hidden="true"></i>
                  {receipt.slug === 'dimer-health' ? 'Dimer Health' : 'Toku'}
                  <b>{receipt.discipline}</b>
                </span>
                <p className="receipt-value">
                  {receipt.prefix}
                  <AnimatedNumber
                    value={receipt.value}
                    decimalPlaces={receipt.decimals}
                    delay={index * 0.1}
                  />
                  {receipt.suffix}
                </p>
                <h3>{receipt.label}</h3>
                <p className="receipt-description">{receipt.description}</p>
                <dl className="receipt-evidence" aria-label={`${receipt.label} evidence`}>
                  {receipt.evidence.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        <i aria-hidden="true"></i>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link className="receipt-link" href={receipt.href}>
                  Read the case study
                  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M1.5 6.5h10M8 2.5l4 4-4 4" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
