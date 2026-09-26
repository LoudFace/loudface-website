'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

/**
 * The real Cal.com booker for the strategy call, inline in the closing section. Same event as the site-wide
 * booking modal (CalHandler); its own namespace so its UI settings do not leak into the modal.
 *
 * It mounts only when the closing section comes within 800px of the viewport: the booker pulls about 700 KB of
 * Cal.com documents, fonts and scripts, and every page with a closing stage would otherwise pay that on first load
 * (2026-09-26, found by Lighthouse before the v11 launch). utm_content carries the page the booking came from.
 */
const Cal = dynamic(() => import('@calcom/embed-react').then((m) => m.default || m), { ssr: false });

const NAMESPACE = 'home-v11-closing';
const CAL_LINK = 'arnelbukva/loudface-intro-call';

export function CalEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    (async () => {
      const { getCalApi } = await import('@calcom/embed-react');
      const cal = await getCalApi({ namespace: NAMESPACE });
      cal('ui', {
        hideEventTypeDetails: true,
        layout: 'month_view',
        theme: 'light',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#4f46e5', 'cal-border-booker': 'transparent', 'cal-border-booker-width': '0px' },
          dark: { 'cal-brand': '#4f46e5', 'cal-border-booker': 'transparent', 'cal-border-booker-width': '0px' },
        },
      });
    })();
  }, [near]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {near && (
        <Cal
          namespace={NAMESPACE}
          calLink={CAL_LINK}
          style={{ width: '100%', height: '100%', overflow: 'auto' }}
          config={{
            layout: 'month_view',
            theme: 'light',
            utm_source: 'website',
            utm_medium: 'embed',
            utm_campaign: 'intro_call',
            utm_content: pathname || '/',
          }}
        />
      )}
    </div>
  );
}
