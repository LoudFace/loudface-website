"use client";
/**
 * Harvested VERBATIM from Magic UI (`registry/magicui/number-ticker.tsx`,
 * https://magicui.design/docs/components/number-ticker, registry:
 * https://magicui.design/r/number-ticker.json). The spring-driven count
 * logic and the `useInView`-gated delayed start are untouched.
 *
 * Permitted edits only:
 *  - `text-black dark:text-white` → `text-inherit` (colour re-keying — the
 *    stat tile that hosts this component sets its own text colour).
 *  - House-rule correctness exception (per the transplant brief): the
 *    library's stock component server-renders `{startValue}` (0 by
 *    default) and only writes the real number into `ref.current.textContent`
 *    after hydration + the in-view spring fires — meaning a crawler or a
 *    reader with JS off sees "0" forever. Changed the initial children to
 *    the formatted FINAL value so the true number is in the server HTML;
 *    the spring still animates from `startValue` and overwrites the same
 *    node's textContent once it's in view, so the visual count-up is
 *    unchanged for a JS reader.
 */
import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value);
      }, delay * 1000);
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [motionValue, isInView, delay, value, direction, startValue]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces],
  );

  return (
    <span
      ref={ref}
      className={cn("inline-block tracking-wider text-inherit tabular-nums", className)}
      {...props}
    >
      {Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(value.toFixed(decimalPlaces)))}
    </span>
  );
}
