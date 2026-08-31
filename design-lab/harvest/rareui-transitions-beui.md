# Harvest: rareui.com, transitions.dev, beui.dev

Date: 2026-08-27. Fetched with WebFetch (HTML→markdown conversion, then summarized by a small model — not a raw curl). Category A = process/steps/timeline/stepper/scroll-progress/how-it-works. Category B = stats/metrics/counter/testimonial-grid.

---

## Site 1: rareui.com

**What it is:** A free, open-source collection of animated React components ("rare and unique"), installed via the shadcn CLI (`npx shadcn@latest add swamimalode07/rare-ui/<name>`). 14 components total, browsable at `/components`.

**Relevant components found: 2** (both category A). No stats/counter/testimonial-grid components exist on this site.

### A1. Step Player
URL: https://rareui.com/components/stepplayer

Description: "An iOS-style stepped progress track with a play, pause and replay control." The active step morphs into a fill bar during playback. Category A — process/stepper.

**Code: NOT available verbatim.** The page only exposes an install command and a minimal usage snippet — the actual component source is gated behind a "click the code icon in the top-right corner to view the source code" UI control that a static/WebFetch pass cannot trigger (client-rendered toggle). Only this was extracted:

```jsx
import { StepPlayer } from "@/components/ui/step-player"

export function Demo() {
  return <StepPlayer steps={5} duration={3000} />
}
```

Install:
```bash
npx shadcn@latest add swamimalode07/rare-ui/step-player
```

Props documented on the page: `steps`, `value`/`defaultValue`, `playing`/`defaultPlaying`, `duration`, `loop`, `size`, `seekable`, `controlPosition`, `showControl`.

**Dependencies:** `motion`, `flubber` (SVG morph tweening library).

---

### A2. Scroll Progress (rareui)
URL: https://rareui.com/components/scrollprogressindicator

Description: scroll-position progress indicator that highlights labeled sections. Category A.

**Code: NOT available verbatim** — same code-icon gate as above. Only the usage example came through:

```tsx
"use client"

import { useRef } from "react"
import ScrollProgress from "@/components/ui/scroll-progress"

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "usage", label: "Usage" },
  { id: "faq", label: "FAQ" },
]

export function Demo() {
  const scrollRef = useRef<HTMLElement>(null)
  return (
    <main ref={scrollRef} className="relative h-full overflow-auto">
      <ScrollProgress containerRef={scrollRef} sections={sections} />
      <section id="intro">{/* ... */}</section>
      <section id="usage">{/* ... */}</section>
      <section id="faq">{/* ... */}</section>
    </main>
  )
}
```

Install:
```bash
npx shadcn@latest add swamimalode07/rare-ui/scroll-progress
```

**Dependencies:** `motion`, React `useRef`.

### Full rareui.com component list (for reference — 14 total, none of the rest are A or B)
Notification Bell, Step Player, Grid Reveal, Folder Component, Code Block, Gravity Letters, GitHub Activity, Fluid Orb, Bounce Sidebar, Proximity Sidebar, Scroll Progress, Duration Picker, OTP Input, Emoji Reaction.

---

## Site 2: transitions.dev

**What it is:** A curated collection of ~40+ CSS/JS UI transitions ("UI transitions for AI agents") — small motion effects (modal open/close, accordion, toast, tabs, etc.), not full components. Distributed via `npx transitions-pro add`, a Claude Code/Cursor skill (`npx skills add Jakubantalik/transitions.dev`), or copy-paste from a code panel in the browser.

**Result: could not extract any per-item source code.** transitions.dev is a client-rendered single-page app — every detail URL tried (`detail.html?t=card-resize`, `detail.html?t=spinning-counter`) returned the SAME generic landing-page description via WebFetch, not the item-specific page. The actual code lives in a "Preview / CSS / React" tab that only renders after JS executes in a real browser; a fetch-and-convert-to-markdown pass never sees it. This is a genuine tool limitation, not a missing component — the site does say code is available via the tabs and via `npx transitions-pro add`.

**Relevant item names found (title only, no code):**
- Category A (process/reveal-adjacent): Panel reveal, Texts reveal, Accordion, Tabs sliding
- Category B (stats/counters): Number pop-in, Spinning counter
- General-purpose transitions usable for either category: Card resize, Card stack hover, Shimmer text, Organic shimmer, Skeleton loader, Banner stacking

Full list of ~40 items enumerated on the homepage (titles only): Card resize, Number pop-in, Notification badge, Text states swap, Menu dropdown, Confetti burst, Modal open/close, Panel reveal, Gooey plus menu, Page side-by-side, Icon swap, Success check, Avatar group hover, Card stack hover, Error state shake, Input clear, Skeleton loader, Texts reveal, Tabs sliding, Drag & drop physics, Shimmer text, Organic shimmer, Tooltip open/close, 3D tilt, Dropdown menu morph, Accordion, Toast open/close, Like button, Image open tilt, Learn more hover, Checkbox check, Spinner to check morph, Spinning counter, Toggle thumb, Pro gradient text, Delete with smoky dissolve, Thinking states, Reasoning stream, Streaming text, Matrix dot loader, Banner stacking, Image generation placeholder.

**Recommendation:** if the "Spinning counter" or "Panel reveal" code is actually needed verbatim, someone needs to open the site in a real browser (or use `npx transitions-pro add <name>`) — WebFetch cannot reach it.

---

## Site 3: beui.dev

**What it is:** A real, active component library — animated React/Next.js components built with Framer Motion (`motion/react`) + Tailwind CSS, distributed via shadcn CLI (`bunx --bun shadcn add @beui/<name>`). Organized into three sections: Motion (40 components), Blocks (22), AI Agents (17). Has a paid "beUI Pro" tier too.

**Relevant components found: 4** (2 in category A/scroll, 2 in category B/numbers). No dedicated "stepper/how-it-works" or "testimonial-grid" block exists on the site as of this fetch.

### B1. NumberTicker
Part of: https://beui.dev/components/motion/number
File: `components/motion/number-ticker.tsx`

"Slot-machine style digit roller with staggered entry animation." Category B — stats/counter.

**Code: NOT captured verbatim.** WebFetch's summarizer described features (per-digit roll ~0.9s, stagger ~0.04s, viewport-triggered, locale formatting, custom formatter, optional blur, server-component compatible) but did not reproduce the literal TSX on this pass — a second explicit request still returned a prose description instead of code. Needs a live-browser or curl-with-JS-render pass to get the literal file.

### B2. AnimatedNumber
Part of: https://beui.dev/components/motion/number
File: `components/motion/animated-number.tsx`

"Spring-driven count-up animation triggered on viewport entry," ~1.2s duration, custom formatting, respects reduced motion, uses `EASE_OUT`. Category B — stats/counter.

**Code: NOT captured verbatim** — same as above.

**Shared install for both:**
```bash
npm i clsx motion tailwind-merge
bunx --bun shadcn add @beui/number-ticker
bunx --bun shadcn add @beui/animated-number
```
Both also require `lib/ease.ts` and `lib/utils.ts` (full text of both captured below under A2/A3).

---

### A2. ScrollProgress (beui)
Part of: https://beui.dev/components/motion/scroll-animation
File: `components/motion/scroll-progress.tsx`

Progress indicator (bar or circle variant) driven by scroll position with spring smoothing. Category A.

**Code — full verbatim capture:**

```tsx
"use client";
// beui.dev/components/motion/scroll-animation

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { cn } from "@/lib/utils";

// Soft follow so the indicator trails the scroll smoothly instead of snapping;
// looser than the UI springs in lib/ease.ts on purpose.
const PROGRESS_SPRING = { stiffness: 120, damping: 30, mass: 0.6 };

type CommonProps = {
  /** Override the scroll source. Defaults to the page via useSmoothScroll. */
  progress?: MotionValue<number>;
  /** Spring-smooth the value. Disabled automatically under reduced motion. */
  spring?: boolean;
  className?: string;
};

export interface ScrollProgressBarProps extends CommonProps {
  variant?: "bar";
  position?: "top" | "bottom";
  /** Bar thickness in px. */
  height?: number;
  /** Position the bar with `fixed` (page) or `absolute` (embedded). */
  fixed?: boolean;
}

export interface ScrollProgressCircleProps extends CommonProps {
  variant: "circle";
  /** Diameter in px. */
  size?: number;
  /** Stroke width in px. */
  thickness?: number;
}

export type ScrollProgressProps =
  | ScrollProgressBarProps
  | ScrollProgressCircleProps;

function useProgressValue(source: MotionValue<number> | undefined, spring: boolean) {
  const reduce = useReducedMotion();
  const fallback = useSmoothScroll().progress;
  const raw = source ?? fallback;
  const smoothed = useSpring(raw, PROGRESS_SPRING);
  return spring && !reduce ? smoothed : raw;
}

export function ScrollProgress(props: ScrollProgressProps) {
  if (props.variant === "circle") return <ScrollProgressCircle {...props} />;
  return <ScrollProgressBar {...props} />;
}

function ScrollProgressBar({
  progress,
  spring = true,
  position = "top",
  height = 2,
  fixed = true,
  className,
}: ScrollProgressBarProps) {
  const value = useProgressValue(progress, spring);
  return (
    <motion.div
      aria-hidden
      style={{ height, scaleX: value }}
      className={cn(
        "left-0 right-0 z-50 origin-left bg-foreground",
        fixed ? "fixed" : "absolute",
        position === "top" ? "top-0" : "bottom-0",
        className,
      )}
    />
  );
}

function ScrollProgressCircle({
  progress,
  spring = true,
  size = 40,
  thickness = 3,
  className,
}: ScrollProgressCircleProps) {
  const value = useProgressValue(progress, spring);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = useTransform(value, (v) => circumference * (1 - v));

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="presentation"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("text-foreground", className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        className="stroke-current opacity-15"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        strokeLinecap="round"
        className="stroke-current"
        strokeDasharray={circumference}
        style={{ strokeDashoffset: offset }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
```

**Dependencies:** `motion/react`, `clsx`, `tailwind-merge`, plus sibling component `smooth-scroll.tsx` (for `useSmoothScroll`) and `lib/utils.ts` (`cn` helper, below).

---

### A3. ScrollReveal (beui)
Part of: https://beui.dev/components/motion/scroll-animation
File: `components/motion/scroll-reveal.tsx`

Reveals children with a spring slide + blur as they enter the viewport. This is the general-purpose reveal/transition effect applicable to both category A (steps appearing on scroll) and category B (stat blocks appearing on scroll).

**Code — full verbatim capture:**

```tsx
"use client";
// beui.dev/components/motion/scroll-animation

import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, type RefObject, useRef } from "react";

import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps {
  children: ReactNode;
  /** Slide distance in px before reveal. */
  y?: number;
  /** Enter blur in px (kept ≤ 10 per motion conventions). */
  blur?: number;
  /** Reveal duration in seconds. */
  duration?: number;
  delay?: number;
  /** Reveal only once (default) or every time it enters view. */
  once?: boolean;
  /** Portion of the element that must be visible to trigger. */
  amount?: "some" | "all" | number;
  /** Scroll root for contained scroll areas. Defaults to the viewport. */
  root?: RefObject<Element | null>;
  className?: string;
}

export function ScrollReveal({
  children,
  y = 16,
  blur = 8,
  duration = 0.6,
  delay = 0,
  once = true,
  amount = 0.3,
  root,
  className,
}: ScrollRevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { root, once, amount });

  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, y, filter: `blur(${blur}px)` };
  const shown = reduce
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={inView ? shown : hidden}
      transition={{ duration, ease: EASE_OUT, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
```

**Dependencies:** `motion/react`, `lib/ease.ts` (`EASE_OUT`), `lib/utils.ts` (`cn`).

---

### Shared utility files (verbatim, required by the above beUI components)

`lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`lib/ease.ts`:
```typescript
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;
```

### Other beUI components in the same "scroll-animation" family (titles only, not A/B-specific but adjacent)
`SmoothScroll` (Lenis-based scroll provider + `useSmoothScroll()` hook), `Parallax` (drift wrapper), `ScrollTo` (smooth-scroll-to button).

### Full beUI Motion/Blocks/AI-Agents listing (for reference — confirms no dedicated stepper/how-it-works/testimonial-grid block exists)
**Motion (40):** Button, Expandable Control, File Tree, Tilt Card, Animated CTA Buttons, Marquee, Tabs, Switch, Input, Select, Combobox, Checkbox, Radio Group, Bottom Sheet, Pull to Refresh, Shared Layout Background, Bounce Sidebar, Animated Sidebar, Preview Rail, Dock, Tooltip, Animated Context Menu, Popover, Morphing Modal, Center Morph Modal, Text Animation, Number Animation (Ticker + AnimatedNumber), Animated Badge, Action Swap, Animated Toast Stack, Theme Toggle, Bouncy Accordion, Drawer, Scroll Animation (SmoothScroll/ScrollProgress/Parallax/ScrollTo/ScrollReveal), Range Slider, Wheel Picker, Table, Shader Background, Cylinder Carousel, Loader.

**Blocks (22):** Infinite Masonry, Notification Stack, Project Folder, Fixtures (knockout-bracket), Availability Scheduler, Multi-chain Swap, Dynamic Island, Command Palette, Morphing Search, Expandable Action Bar, Overflow Actions, Expandable Tabs, Morphing Tabs, Swipeable List, File Upload, Prediction Market, Wallet Card, OTP Input, Sign Up Form, Bloom Menu, Feedback Widget, 404/Not Found.

**AI Agents (17):** Message Bubble, Message, Message Scroller, Prompt Input, Todo List, Code Block, Approval Card, File Diff, Tool Result, Streaming Response, Image Generation, Tool Approval, Citations, Agent Activity, Agent Loading States, AI Sidebar, Chat App.

---

## Summary of what's actually usable right now

- **Real, literal, copy-pasteable code obtained:** beUI's `ScrollProgress` (bar + circle variant) and `ScrollReveal`, plus their two required utility files. Both are category A / general-transition, both use Framer Motion + Tailwind, which matches this project's stack directly.
- **Component confirmed to exist with clear intent but code NOT obtained:** rareui's `Step Player` (category A, iOS-style stepper) and rareui's `Scroll Progress` (category A); beUI's `NumberTicker` and `AnimatedNumber` (category B, stat counters) — all four are gated behind a browser-only code toggle that WebFetch cannot trigger.
- **Nothing obtained at all:** transitions.dev — the whole site is a client-rendered SPA; every detail URL returned the same generic homepage text. Item titles (Number pop-in, Spinning counter, Panel reveal, etc.) are real and listed above, but no code.
- **No stats/testimonial-grid block exists on any of the three sites as a single packaged component** — the closest fits are the two beUI number-counter components (raw numbers, not full stat-card layouts) and rareui's scroll-progress/step-player for category A.
