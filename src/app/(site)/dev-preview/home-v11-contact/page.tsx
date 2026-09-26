import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../contact-v11/contact.css';
import { getContactContent, getHomeV11Content, getPricingV11Content } from '@/lib/content-utils';
import { ContactV11 } from '../../../contact-v11/ContactV11';

export const metadata: Metadata = { title: 'Contact v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 contact page before /contact switches over. */
export default async function ContactV11Preview() {
  const [c, home, x] = await Promise.all([getContactContent(), getHomeV11Content(), getPricingV11Content()]);
  return <ContactV11 c={c} home={home} steps={x.steps} />;
}
