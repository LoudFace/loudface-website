import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/lego/lego.css';
import { getHomeV3Images } from '../../../home-v3/data';
import { ProcessTabs } from '../../../home-v3/lego/ProcessTabs';
import { ResultsLedger } from '../../../home-v3/lego/ResultsLedger';

const SOURCE_INPUTS = [
  { name: 'Beautiful UI', href: 'https://beautifului.dev', contribution: 'Records and status rows' },
  { name: 'beUI', href: 'https://beui.dev', contribution: 'Shared-layout tabs' },
  { name: 'Rare UI', href: 'https://rareui.com', contribution: 'Case-file folder motif' },
  { name: 'Transitions.dev', href: 'https://transitions.dev', contribution: 'Blur swaps and number entry' },
  { name: 'shadcn/ui', href: 'https://ui.shadcn.com', contribution: 'Accessible primitive structure' },
  { name: 'Shadcnblocks', href: 'https://www.shadcnblocks.com', contribution: 'Case-study row composition' },
  { name: 'Magic UI', href: 'https://magicui.design', contribution: 'Number ticker behavior' },
  { name: 'Aceternity UI', href: 'https://ui.aceternity.com', contribution: 'Timeline progress rail' },
  { name: 'AI Elements', href: 'https://elements.ai-sdk.dev', contribution: 'Task-like evidence states' },
  { name: 'Collect UI', href: 'https://collectui.com', contribution: 'Compact gallery metadata' },
  { name: 'Recent Design', href: 'https://recent.design', contribution: 'Editorial spacing and scale' },
  { name: 'Mobbin MCP', href: 'https://mobbin.com/mcp', contribution: 'Progressive disclosure' },
  { name: 'Canvas UI', href: 'https://canvasui.dev', contribution: 'Grid atmosphere with fallback' },
  { name: '60fps MCP', href: 'https://60fps.design/mcp', contribution: 'Trigger-to-settle timing' },
] as const;

export const metadata: Metadata = {
  title: 'Component library section test',
  robots: { index: false, follow: false },
};

export default async function LegoSectionsPreviewPage() {
  const images = await getHomeV3Images();

  return (
    <main className="hpv3 lego-preview">
      <section className="lego-sourcebar">
        <div className="container">
          <div className="lego-sourcebar-grid">
            <div>
              <span className="lego-source-count">14 required sources</span>
              <h1>Fourteen inputs. Two LoudFace sections.</h1>
            </div>
            <p>
              Every link in the two posts informed the selection. LoudFace still supplies the tokens,
              copy, work, accessibility, performance limits, and responsive rules.
            </p>
          </div>
          <div className="lego-source-register" aria-label="Required source register">
            {SOURCE_INPUTS.map((source, index) => (
              <a key={source.name} href={source.href} target="_blank" rel="noreferrer">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{source.name}</strong>
                <small>{source.contribution}</small>
              </a>
            ))}
          </div>
          <p className="lego-source-note">
            Mobbin and 60fps contributed their public pattern guidance. Their live MCP searches require
            paid credentials and are not connected in this workspace.
          </p>
        </div>
      </section>
      <ResultsLedger images={images} />
      <ProcessTabs />
    </main>
  );
}
