/**
 * Thank you (after booking a call) — v11 (switched 2026-09-26).
 *
 * Composed from src/app/thanks-v11 inside the (site) group: the confirmation beside the booked call card (no time on
 * it: the visitor's slot is in their invite), what happens next (NextSteps, shared with /contact), and two picture
 * cards to the case studies and the blog. Copy in thank-you.json, contact.json and pricing-v11.json. Noindex, as
 * before.
 */
import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../contact-v11/contact.css';
import '../../seo-for-v11/industry.css';
import '../../thanks-v11/thanks.css';
import { fetchBlogIndexData } from '@/lib/cms-data';
import { getContactContent, getHomeV11Content, getPricingV11Content, getThankYouContent } from '@/lib/content-utils';
import { ThankYouV11 } from '../../thanks-v11/ThankYouV11';

export const metadata: Metadata = {
  title: 'You\'re In',
  description: 'Your call with LoudFace is booked. We\'ll be in touch shortly to discuss how we can accelerate your growth.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/thank-you',
  },
};

export default async function ThankYouPage() {
  const [t, contact, pricing, home, blog] = await Promise.all([getThankYouContent(), getContactContent(), getPricingV11Content(), getHomeV11Content(), fetchBlogIndexData()]);
  const latest = blog.blogPosts.find((p) => p.thumbnail?.url);
  return <ThankYouV11 t={t} contact={contact} steps={pricing.steps} home={home} blogCover={latest?.thumbnail?.url} />;
}
