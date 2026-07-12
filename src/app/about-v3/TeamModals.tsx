'use client';

/**
 * TeamModals — tiny open/close controller for the server-rendered per-member
 * <dialog> elements. The dialogs, their content, and the /team/${slug} links
 * are all server-rendered in Team.tsx (so they exist in the SSR HTML and stay
 * crawlable); this component only wires interactivity onto them:
 *   - clicking a card ([data-team-open="id"]) → dialog.showModal() (native
 *     focus trap + Esc-to-close come for free)
 *   - clicking the ✕ ([data-team-close]) → dialog.close()
 *   - clicking the backdrop (event.target === dialog) → dialog.close()
 * Renders nothing itself.
 */
import { useEffect } from 'react';

export function TeamModals() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    document.querySelectorAll<HTMLElement>('[data-team-open]').forEach((btn) => {
      const id = btn.getAttribute('data-team-open');
      if (!id) return;
      const dlg = document.getElementById(id) as HTMLDialogElement | null;
      if (!dlg || typeof dlg.showModal !== 'function') return;

      const open = () => dlg.showModal();
      btn.addEventListener('click', open);

      // Light-dismiss: a click whose target is the dialog itself is on the ::backdrop.
      const onBackdrop = (e: MouseEvent) => {
        if (e.target === dlg) dlg.close();
      };
      dlg.addEventListener('click', onBackdrop);

      const closeFns = Array.from(
        dlg.querySelectorAll<HTMLElement>('[data-team-close]'),
      ).map((x) => {
        const close = () => dlg.close();
        x.addEventListener('click', close);
        return () => x.removeEventListener('click', close);
      });

      cleanups.push(() => {
        btn.removeEventListener('click', open);
        dlg.removeEventListener('click', onBackdrop);
        closeFns.forEach((fn) => fn());
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
