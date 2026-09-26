import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../contact-v11/contact.css';
import '../../../seo-for-v11/industry.css';
import '../../../thanks-v11/thanks.css';
import { fetchBlogIndexData } from '@/lib/cms-data';
import { getContactContent, getHomeV11Content, getPricingV11Content, getThankYouContent } from '@/lib/content-utils';
import { ThankYouV11 } from '../../../thanks-v11/ThankYouV11';

export const metadata: Metadata = { title: 'Thank you v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 /thank-you page before the live route switches over. */
export default async function ThankYouV11Preview() {
  const [t, contact, pricing, home, blog] = await Promise.all([getThankYouContent(), getContactContent(), getPricingV11Content(), getHomeV11Content(), fetchBlogIndexData()]);
  const latest = blog.blogPosts.find((p) => p.thumbnail?.url);
  return <ThankYouV11 t={t} contact={contact} steps={pricing.steps} home={home} blogCover={latest?.thumbnail?.url} />;
}
