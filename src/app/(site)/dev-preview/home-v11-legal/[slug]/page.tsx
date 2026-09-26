import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../../../../home-v11/home-v11.css';
import '../../../../service-v11/service-v11.css';
import '../../../../service-v11/svc.css';
import '../../../../legal-v11/legal.css';
import { getHomeV11Content, getLegalV11Content } from '@/lib/content-utils';
import { COOKIES_VIEW } from '../../../../legal-v11/cookies';
import { LegalPageV11 } from '../../../../legal-v11/LegalPageV11';
import { PRIVACY_VIEW } from '../../../../legal-v11/privacy';
import { TERMS_VIEW } from '../../../../legal-v11/terms';

export const metadata: Metadata = { title: 'Legal v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

const VIEWS = { privacy: PRIVACY_VIEW, terms: TERMS_VIEW, cookies: COOKIES_VIEW } as const;

/** Preview of the v11 legal template on /privacy, /terms and /cookies. */
export default async function LegalV11Preview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = VIEWS[slug as keyof typeof VIEWS];
  if (!view) notFound();
  const [home, c] = await Promise.all([getHomeV11Content(), getLegalV11Content()]);
  return <LegalPageV11 view={view} home={home} labels={c.labels} />;
}
