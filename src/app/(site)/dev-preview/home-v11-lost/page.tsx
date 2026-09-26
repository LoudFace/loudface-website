import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../lost-v11/lost.css';
import { LostPageV11 } from '../../../lost-v11/LostPageV11';

export const metadata: Metadata = { title: '404 v11 preview', robots: { index: false, follow: false } };

/** Preview of the v11 404 page (?kind=error shows the error page's words). */
export default async function LostV11Preview({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  return <LostPageV11 kind={kind === 'error' ? 'error' : 'notFound'} />;
}
