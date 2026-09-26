import type { Metadata } from 'next';
import './home-v11/home-v11.css';
import './lost-v11/lost.css';
import { LostPageV11 } from './lost-v11/LostPageV11';

/**
 * The 404 page — v11 (switched 2026-09-26). The message, the way back, the live page's four links, and the two files
 * that list every URL (for a crawler that lands here). Copy in lost-v11.json. An unmatched URL gets this page as full
 * server HTML, without the site header. A notFound() inside a site route (a deleted post) is drawn by the browser: its
 * server HTML is an empty shell, as it was on the v3 site.
 */
export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <LostPageV11 kind="notFound" />;
}
