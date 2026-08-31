"use client";
/**
 * Harvested VERBATIM from Aceternity UI
 * (`components/ui/sticky-scroll-reveal.tsx`,
 * https://ui.aceternity.com/components/sticky-scroll-reveal, registry:
 * https://ui.aceternity.com/registry/sticky-scroll-reveal.json). The
 * scroll-linked active-card logic, the sticky visual pane, and the
 * word-level markup are all untouched.
 *
 * Permitted edits only:
 *  - `backgroundColors` and `linearGradients` are the ONE place the spec
 *    tells us to replace values outright (its cyan/pink/orange demo palette
 *    → the LoudFace night-indigo stages + indigo ramp). Everything else in
 *    the array-driven logic (index math, useEffect wiring) is untouched.
 *  - `text-slate-100` / `text-slate-300` → recoloured to the project's own
 *    light-on-dark tokens (`text-white` / `text-white/70`) since the panel
 *    sits on the night-indigo stage, not Tailwind's literal slate scale.
 */
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
    // target: ref
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#171445", // LoudFace night-indigo stage
    "#241f66", // its raised tonal corner
    "#1e1b4b", // deepest ramp stop (indigo-950-equivalent)
  ];
  const linearGradients = [
    "linear-gradient(to bottom right, #4f46e5, #818cf8)", // primary-600 to primary-400
    "linear-gradient(to bottom right, #4338ca, #6366f1)", // primary-700 to primary-500
    "linear-gradient(to bottom right, #312e81, #4f46e5)", // deep ramp to primary-600
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0],
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-md p-10"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-2xl font-bold text-white"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-kg mt-10 max-w-sm text-white/70"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md bg-white lg:block",
          contentClassName,
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
