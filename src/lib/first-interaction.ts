/**
 * Run a callback once: on the visitor's first interaction, or, when they never
 * interact, a few seconds after the page has loaded and the browser is idle.
 *
 * Trackers wait for this so their script evaluation stays out of the initial
 * hydration window. The idle route exists because a visit with no scroll, tap,
 * mouse move or key press was otherwise never counted at all.
 */
const INTERACTION_EVENTS = ['scroll', 'touchstart', 'mousemove', 'keydown'] as const;
/** Long enough after `load` to stay clear of hydration; short enough to count a quick read-and-leave visit. */
const IDLE_FALLBACK_MS = 4000;

/** Returns a function that cancels the wait. */
export function onFirstInteractionOrIdle(callback: () => void): () => void {
  let done = false;
  let timer: number | undefined;

  const cancel = () => {
    INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, run));
    window.removeEventListener('load', armTimer);
    window.clearTimeout(timer);
  };
  function run() {
    if (done) return;
    done = true;
    cancel();
    callback();
  }
  function armTimer() {
    timer = window.setTimeout(() => {
      // Safari has no requestIdleCallback; the timer alone is the fallback there.
      if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2000 });
      else run();
    }, IDLE_FALLBACK_MS);
  }

  INTERACTION_EVENTS.forEach((e) => window.addEventListener(e, run, { once: true, passive: true }));
  if (document.readyState === 'complete') armTimer();
  else window.addEventListener('load', armTimer, { once: true });

  return cancel;
}
