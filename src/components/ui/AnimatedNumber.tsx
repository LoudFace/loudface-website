'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface AnimatedNumberProps extends ComponentPropsWithoutRef<'span'> {
  /** Final value. This is also the server-rendered and accessible value. */
  value: number;
  /** Value shown at the start of the client-side count. */
  startValue?: number;
  /** Delay in seconds after the number enters the viewport. */
  delay?: number;
  /** Fixed number of decimal places. */
  decimalPlaces?: number;
}

function formatNumber(value: number, decimalPlaces: number) {
  return Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Viewport-triggered number count adapted from Magic UI's NumberTicker.
 *
 * The source component renders its start value in the initial HTML. This version
 * renders the final value first, so crawlers, no-JS visitors, and assistive tech
 * always receive the real result. The visual count only starts after hydration.
 */
export function AnimatedNumber({
  value,
  startValue = 0,
  delay = 0,
  decimalPlaces = 0,
  className = '',
  ...props
}: AnimatedNumberProps) {
  const visualRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(visualRef, { once: true, margin: '0px' });
  const reduceMotion = useReducedMotion();
  const finalValue = formatNumber(value, decimalPlaces);

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (visualRef.current) {
          visualRef.current.textContent = formatNumber(
            Number(latest.toFixed(decimalPlaces)),
            decimalPlaces
          );
        }
      }),
    [decimalPlaces, springValue]
  );

  useEffect(() => {
    if (!isInView || reduceMotion) return;

    motionValue.jump(startValue);
    springValue.jump(startValue);

    let timer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => motionValue.set(value), delay * 1000);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [delay, isInView, motionValue, reduceMotion, springValue, startValue, value]);

  return (
    <span className={`inline-block tabular-nums ${className}`} {...props}>
      <span ref={visualRef} aria-hidden="true">
        {finalValue}
      </span>
      <span className="sr-only">{finalValue}</span>
    </span>
  );
}
