# MagicUI Full Harvest (remaining 65 components, beyond the 12 in magicui-beui.md)

**File 1 of 3** (`magicui-full-1.md`, `magicui-full-2.md`, `magicui-full-3.md`). This file holds the full table of contents plus Text effects and Buttons/CTA. Companion to `magicui-beui.md` (which already has the first 12: marquee, number-ticker, animated-list, bento-grid, terminal, safari, iphone, android, hero-video-dialog, file-tree, dock, code-comparison — plus beUI's number/dock/file-tree). This file covers everything else in MagicUI's 77-component catalog.

Source: `curl` against `magicui.design/r/<slug>.json`, MagicUI's public shadcn-style registry endpoint, fetched 2026-08-30. All content below is the exact, unmodified `content` field from each registry JSON — no paraphrasing, no abridging.

## Table of contents

- [Text effects](#text-effects) (18 components) — in this file
- [Buttons / CTA](#buttons--cta) (11 components) — in this file
- [Backgrounds](#backgrounds) (19 components) — in `magicui-full-2.md`
- [Lists & feeds / social proof](#lists--feeds--social-proof) (3 components) — in `magicui-full-2.md`
- [Numbers / stats](#numbers--stats) (1 component) — in `magicui-full-2.md`
- [Navigation / scroll](#navigation--scroll) (3 components) — in `magicui-full-3.md`
- [Special effects](#special-effects) (10 components) — in `magicui-full-3.md`
- [Templates / Blocks — gated, not registry-retrievable](#templates--blocks) — in `magicui-full-3.md`

---

## Text effects

### Animated Gradient Text

- **Slug:** `animated-gradient-text`
- **URL:** https://magicui.design/docs/components/animated-gradient-text
- **Registry JSON:** https://magicui.design/r/animated-gradient-text.json
- **Description:** An animated gradient background which transitions between colors for text.
- **npm dependencies:** none

**File: `registry/magicui/animated-gradient-text.tsx`**

```tsx
import { type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<"div"> {
  speed?: number
  colorFrom?: string
  colorTo?: string
}

export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      style={
        {
          "--bg-size": `${speed * 300}%`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties
      }
      className={cn(
        `animate-gradient inline bg-linear-to-r from-(--color-from) via-(--color-to) to-(--color-from) bg-size-[var(--bg-size)_100%] bg-clip-text text-transparent`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-gradient": "gradient 8s linear infinite"
    }
  },
  "css": {
    "@keyframes gradient": {
      "to": {
        "background-position": "var(--bg-size, 300%) 0"
      }
    }
  }
}
```

---

### Animated Shiny Text

- **Slug:** `animated-shiny-text`
- **URL:** https://magicui.design/docs/components/animated-shiny-text
- **Registry JSON:** https://magicui.design/r/animated-shiny-text.json
- **Description:** A light glare effect which pans across text making it appear as if it is shimmering.
- **npm dependencies:** none

**File: `registry/magicui/animated-shiny-text.tsx`**

```tsx
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FC,
} from "react"

import { cn } from "@/lib/utils"

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",

        // Shine effect
        "animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text bg-position-[0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",

        // Shine gradient
        "bg-linear-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/80",

        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-shiny-text": "shiny-text 8s infinite"
    }
  },
  "css": {
    "@keyframes shiny-text": {
      "0%, 90%, 100%": {
        "background-position": "calc(-100% - var(--shiny-width)) 0"
      },
      "30%, 60%": {
        "background-position": "calc(100% + var(--shiny-width)) 0"
      }
    }
  }
}
```

---

### Aurora Text

- **Slug:** `aurora-text`
- **URL:** https://magicui.design/docs/components/aurora-text
- **Registry JSON:** https://magicui.design/r/aurora-text.json
- **Description:** A beautiful aurora text effect
- **npm dependencies:** none

**File: `registry/magicui/aurora-text.tsx`**

```tsx
"use client"

import React, { memo } from "react"

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

export const AuroraText = memo(
  ({
    children,
    className = "",
    colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
    speed = 1,
  }: AuroraTextProps) => {
    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${
        colors[0]
      })`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${10 / speed}s`,
    }

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="animate-aurora relative bg-size-[200%_auto] bg-clip-text text-transparent"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    )
  }
)

AuroraText.displayName = "AuroraText"
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-aurora": "aurora 8s ease-in-out infinite alternate"
    }
  },
  "css": {
    "@keyframes aurora": {
      "0%": {
        "background-position": "0% 50%",
        "transform": "rotate(-5deg) scale(0.9)"
      },
      "25%": {
        "background-position": "50% 100%",
        "transform": "rotate(5deg) scale(1.1)"
      },
      "50%": {
        "background-position": "100% 50%",
        "transform": "rotate(-3deg) scale(0.95)"
      },
      "75%": {
        "background-position": "50% 0%",
        "transform": "rotate(3deg) scale(1.05)"
      },
      "100%": {
        "background-position": "0% 50%",
        "transform": "rotate(-5deg) scale(0.9)"
      }
    }
  }
}
```

---

### Comic Text

- **Slug:** `comic-text`
- **URL:** https://magicui.design/docs/components/comic-text
- **Registry JSON:** https://magicui.design/r/comic-text.json
- **Description:** Comic text animation
- **npm dependencies:** motion

**File: `registry/magicui/comic-text.tsx`**

```tsx
"use client"

import { type CSSProperties } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type ComicTextProps = {
  children: string
  className?: string
  style?: CSSProperties
  fontSize?: number
}

export function ComicText({
  children,
  className,
  style,
  fontSize = 5,
}: ComicTextProps) {
  if (typeof children !== "string") {
    throw new Error("children must be a string")
  }

  const dotColor = "#EF4444"
  const backgroundColor = "#FACC15"

  return (
    <motion.div
      className={cn("text-center select-none", className)}
      style={{
        fontSize: `${fontSize}rem`,
        fontFamily: "'Bangers', 'Comic Sans MS', 'Impact', sans-serif",
        fontWeight: "900",
        WebkitTextStroke: `${fontSize * 0.35}px #000000`, // Thick black outline
        transform: "skewX(-10deg)",
        textTransform: "uppercase",
        filter: `
          drop-shadow(5px 5px 0px #000000) 
          drop-shadow(3px 3px 0px ${dotColor})
        `,
        backgroundColor: backgroundColor,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: "8px 8px",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.175, 0.885, 0.32, 1.275],
        type: "spring",
      }}
    >
      {children}
    </motion.div>
  )
}
```

---

### Dia Text Reveal

- **Slug:** `dia-text-reveal`
- **URL:** https://magicui.design/docs/components/dia-text-reveal
- **Registry JSON:** https://magicui.design/r/dia-text-reveal.json
- **Description:** A horizontal color band sweeps across text, revealing a gradient shine before settling on the base color.
- **npm dependencies:** motion

**File: `registry/magicui/dia-text-reveal.tsx`**

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
} from "motion/react"

import { cn } from "@/lib/utils"

const DEFAULT_COLORS = ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe", "#0358f7"]
const BAND_HALF = 17
const SWEEP_START = -BAND_HALF
const SWEEP_END = 100 + BAND_HALF

const sweepEase = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2

function buildGradient(pos: number, colors: string[], textColor: string) {
  const bandStart = pos - BAND_HALF
  const bandEnd = pos + BAND_HALF

  if (bandStart >= 100) {
    return `linear-gradient(90deg, ${textColor}, ${textColor})`
  }
  const n = colors.length
  const parts: string[] = []

  if (bandStart > 0)
    parts.push(`${textColor} 0%`, `${textColor} ${bandStart.toFixed(2)}%`)

  colors.forEach((c, i) => {
    const pct = n === 1 ? pos : bandStart + (i / (n - 1)) * BAND_HALF * 2
    parts.push(`${c} ${pct.toFixed(2)}%`)
  })

  if (bandEnd < 100)
    parts.push(`transparent ${bandEnd.toFixed(2)}%`, `transparent 100%`)

  return `linear-gradient(90deg, ${parts.join(", ")})`
}

function measureWidths(el: HTMLElement, texts: string[]) {
  const ghost = el.cloneNode() as HTMLElement
  Object.assign(ghost.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    width: "auto",
    whiteSpace: "nowrap",
  })
  el.parentElement!.appendChild(ghost)
  const widths = texts.map((t) => {
    ghost.textContent = t
    return ghost.getBoundingClientRect().width
  })
  ghost.remove()
  return widths
}

/**
 * Props for {@link DiaTextReveal}.
 */
export interface DiaTextRevealProps extends Omit<
  HTMLMotionProps<"span">,
  "ref" | "children" | "style" | "animate" | "transition" | "color"
> {
  /**
   * Text to reveal. Pass multiple strings to rotate when {@link DiaTextRevealProps.repeat} is `true`.
   */
  text: string | string[]
  /**
   * Colors sampled across the moving gradient band. Defaults to a built-in palette.
   */
  colors?: string[]
  /**
   * CSS color for revealed text after the sweep and for leading/trailing regions during the animation.
   * @defaultValue `"var(--foreground)"`
   */
  textColor?: string
  /**
   * Duration of one sweep pass, in seconds.
   * @defaultValue `1.5`
   */
  duration?: number
  /**
   * Delay before the sweep starts, in seconds.
   * @defaultValue `0`
   */
  delay?: number
  /**
   * When `text` is an array, replay the sweep and advance to the next string after each completion.
   * @defaultValue `false`
   */
  repeat?: boolean
  /**
   * Pause between cycles when {@link DiaTextRevealProps.repeat} is `true`, in seconds.
   * @defaultValue `0.5`
   */
  repeatDelay?: number
  /**
   * If `true`, the animation starts only after the element enters the viewport.
   * @defaultValue `true`
   */
  startOnView?: boolean
  /**
   * Passed to `useInView`: if `true`, in-view detection fires at most once (no replay on scroll-back).
   * @defaultValue `true`
   */
  once?: boolean
  /**
   * Additional class names for the animated `span` (e.g. typography utilities).
   */
  className?: string
  /**
   * When `text` has multiple entries, use the widest string’s width for layout instead of animating width per line.
   * @defaultValue `false`
   */
  fixedWidth?: boolean
}

export function DiaTextReveal({
  text,
  colors = DEFAULT_COLORS,
  textColor = "var(--foreground)",
  duration = 1.5,
  delay = 0,
  repeat = false,
  repeatDelay = 0.5,
  startOnView = true,
  once = true,
  className,
  fixedWidth = false,
  ...props
}: DiaTextRevealProps) {
  const texts = Array.isArray(text) ? text : [text]
  const isMulti = texts.length > 1
  const prefersReducedMotion = useReducedMotion()

  const spanRef = useRef<HTMLSpanElement>(null)
  const optsRef = useRef({
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
  })
  optsRef.current = {
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
  }

  const indexRef = useRef(0)
  const hasPlayedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const playRef = useRef<() => void>(null!)
  const stopRef = useRef<(() => void) | null>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([])

  const sweepPos = useMotionValue(SWEEP_START)

  const backgroundImage = useTransform(sweepPos, (pos) =>
    buildGradient(pos, optsRef.current.colors, optsRef.current.textColor)
  )

  const isInView = useInView(spanRef, { once, amount: 0.1 })

  useEffect(() => {
    const el = spanRef.current
    if (!el || !isMulti) return
    setMeasuredWidths(measureWidths(el, texts))
  }, [Array.isArray(text) ? text.join("\0") : text])

  playRef.current = () => {
    const { duration, delay, repeat, repeatDelay, texts } = optsRef.current

    sweepPos.set(SWEEP_START)

    const controls = animate(sweepPos, SWEEP_END, {
      duration,
      delay,
      ease: sweepEase,
      onComplete() {
        if (!repeat) return
        timerRef.current = setTimeout(() => {
          const next = (indexRef.current + 1) % texts.length
          indexRef.current = next
          setActiveIndex(next)
          playRef.current()
        }, repeatDelay * 1000)
      },
    })

    stopRef.current = () => controls.stop()
  }

  useEffect(() => {
    if (prefersReducedMotion) {
      sweepPos.set(SWEEP_END)
      return
    }
    if (startOnView && !isInView) return
    if (once && hasPlayedRef.current) return
    hasPlayedRef.current = true
    playRef.current()

    return () => {
      stopRef.current?.()
      clearTimeout(timerRef.current)
    }
  }, [isInView, startOnView, once, prefersReducedMotion, sweepPos])

  const fixedW =
    isMulti && fixedWidth && measuredWidths.length > 0
      ? Math.max(...measuredWidths)
      : undefined

  const animatedW =
    isMulti && !fixedWidth && measuredWidths[activeIndex] != null
      ? measuredWidths[activeIndex]
      : undefined

  return (
    <motion.span
      ref={spanRef}
      className={cn("align-bottom leading-[100%] text-inherit", className)}
      style={{
        transform: "translateY(-2px)",
        color: "transparent",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        backgroundSize: "100% 100%",
        backgroundImage,
        ...(isMulti && {
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          verticalAlign: "text-center",
          ...(fixedW != null && { width: fixedW }),
        }),
      }}
      animate={animatedW != null ? { width: animatedW } : undefined}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {texts[activeIndex]}
    </motion.span>
  )
}
```

---

### Highlighter

- **Slug:** `highlighter`
- **URL:** https://magicui.design/docs/components/highlighter
- **Registry JSON:** https://magicui.design/r/highlighter.json
- **Description:** A text highlighter that mimics the effect of a human-drawn marker stroke.
- **npm dependencies:** motion, rough-notation

**File: `registry/magicui/highlighter.tsx`**

```tsx
"use client"

import { useLayoutEffect, useRef } from "react"
import type React from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"
import { type RoughAnnotation } from "rough-notation/lib/model"

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation: RoughAnnotation | null = null
    let resizeObserver: ResizeObserver | null = null

    if (shouldShow && element) {
      const annotationConfig = {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
      }

      const currentAnnotation = annotate(element, annotationConfig)
      annotation = currentAnnotation
      currentAnnotation.show()

      resizeObserver = new ResizeObserver(() => {
        currentAnnotation.hide()
        currentAnnotation.show()
      })

      resizeObserver.observe(element)
      resizeObserver.observe(document.body)
    }

    return () => {
      annotation?.remove()
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ])

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  )
}
```

---

### Hyper Text

- **Slug:** `hyper-text`
- **URL:** https://magicui.design/docs/components/hyper-text
- **Registry JSON:** https://magicui.design/r/hyper-text.json
- **Description:** A text animation that scrambles letters before revealing the final text.
- **npm dependencies:** motion

**File: `registry/magicui/hyper-text.tsx`**

```tsx
"use client"

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type RefAttributes,
} from "react"
import {
  AnimatePresence,
  motion,
  type DOMMotionComponents,
  type HTMLMotionProps,
  type MotionProps,
} from "motion/react"

import { cn } from "@/lib/utils"

type CharacterSet = string[] | readonly string[]

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<
  keyof DOMMotionComponents,
  keyof typeof motionElements
>
type HyperTextMotionComponent = ComponentType<
  Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<HTMLElement>
>

interface HyperTextProps extends Omit<MotionProps, "children"> {
  /** The text content to be animated */
  children: string
  /** Optional className for styling */
  className?: string
  /** Duration of the animation in milliseconds */
  duration?: number
  /** Delay before animation starts in milliseconds */
  delay?: number
  /** Component to render as - defaults to div */
  as?: MotionElementType
  /** Whether to start animation when element comes into view */
  startOnView?: boolean
  /** Whether to trigger animation on hover */
  animateOnHover?: boolean
  /** Custom character set for scramble effect. Defaults to uppercase alphabet */
  characterSet?: CharacterSet
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
) as readonly string[]

const getRandomInt = (max: number): number => Math.floor(Math.random() * max)

export function HyperText({
  children,
  className,
  duration = 800,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  animateOnHover = true,
  characterSet = DEFAULT_CHARACTER_SET,
  ...props
}: HyperTextProps) {
  const MotionComponent = motionElements[Component] as HyperTextMotionComponent

  const [displayText, setDisplayText] = useState<string[]>(() =>
    children.split("")
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const iterationCount = useRef(0)
  const elementRef = useRef<HTMLElement | null>(null)

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0
      setIsAnimating(true)
    }
  }

  // Handle animation start based on view or delay
  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setIsAnimating(true)
      }, delay)
      return () => clearTimeout(startTimeout)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsAnimating(true)
          }, delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "-30% 0px -30% 0px" }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [delay, startOnView])

  // Handle scramble animation
  useEffect(() => {
    let animationFrameId: number | null = null

    if (isAnimating) {
      const maxIterations = children.length
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        iterationCount.current = progress * maxIterations

        setDisplayText((currentText) =>
          currentText.map((letter, index) =>
            letter === " "
              ? letter
              : index <= iterationCount.current
                ? children[index]
                : characterSet[getRandomInt(characterSet.length)]
          )
        )

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [children, duration, isAnimating, characterSet])

  return (
    <MotionComponent
      ref={elementRef}
      className={cn("overflow-hidden py-2 text-4xl font-bold", className)}
      onMouseEnter={handleAnimationTrigger}
      {...props}
    >
      <AnimatePresence>
        {displayText.map((letter, index) => (
          <motion.span
            key={index}
            className={cn("font-mono", letter === " " ? "w-3" : "")}
          >
            {letter.toUpperCase()}
          </motion.span>
        ))}
      </AnimatePresence>
    </MotionComponent>
  )
}
```

---

### Kinetic Text

- **Slug:** `kinetic-text`
- **URL:** https://magicui.design/docs/components/kinetic-text
- **Registry JSON:** https://magicui.design/r/kinetic-text.json
- **Description:** A text component that animates font weight of characters on hover.
- **npm dependencies:** none

**File: `registry/magicui/kinetic-text.tsx`**

```tsx
import React from "react"

import { cn } from "@/lib/utils"

type As = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"

type KineticTextProps = React.HTMLAttributes<HTMLElement> & {
  text: string
  as?: As
}

export function KineticText({
  text,
  as: Tag = "h1",
  className = "",
  style,
  ...rest
}: KineticTextProps) {
  const mergedStyle = {
    "--hover-padding": "calc(1em / 12)",
    "--text-stroke-width": "calc(1em * 125 / 6000)",
    ...(style as React.CSSProperties | undefined),
  } as React.CSSProperties

  return (
    <Tag
      {...rest}
      className={cn("flex flex-wrap font-[300]", className)}
      style={mergedStyle}
    >
      {text.split("").map((letter, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="[will-change:font-weight,-webkit-text-stroke-width,padding] [-webkit-text-stroke-color:transparent] [-webkit-text-stroke-width:var(--text-stroke-width)] [transition:font-weight_0.4s,_-webkit-text-stroke-color_0.4s,_padding_0.4s] hover:[padding-inline:var(--hover-padding)] hover:font-[900] hover:[-webkit-text-stroke-color:currentcolor] hover:[-webkit-text-stroke-width:calc(var(--text-stroke-width)*2)] has-[+span+span:hover]:font-[400] has-[+span:hover]:[padding-inline:var(--hover-padding)] has-[+span:hover]:font-[600] [:hover+&]:[padding-inline:var(--hover-padding)] [:hover+&]:font-[600] [:hover+span+&]:font-[400]"
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </Tag>
  )
}
```

---

### Line Shadow Text

- **Slug:** `line-shadow-text`
- **URL:** https://magicui.design/docs/components/line-shadow-text
- **Registry JSON:** https://magicui.design/r/line-shadow-text.json
- **Description:** A text component with a moving line shadow.
- **npm dependencies:** motion

**File: `registry/magicui/line-shadow-text.tsx`**

```tsx
"use client"

import { type CSSProperties, type HTMLAttributes } from "react"
import {
  motion,
  type DOMMotionComponents,
  type MotionProps,
} from "motion/react"

import { cn } from "@/lib/utils"

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<
  keyof DOMMotionComponents,
  keyof typeof motionElements
>

interface LineShadowTextProps
  extends Omit<HTMLAttributes<HTMLElement>, keyof MotionProps>, MotionProps {
  children: string
  shadowColor?: string
  as?: MotionElementType
}

export function LineShadowText({
  children,
  shadowColor = "black",
  className,
  as: Component = "span",
  ...props
}: LineShadowTextProps) {
  const MotionComponent = motionElements[Component]

  return (
    <MotionComponent
      style={{ "--shadow-color": shadowColor } as CSSProperties}
      className={cn(
        "relative z-0 inline-flex",
        "after:absolute after:top-[0.04em] after:left-[0.04em] after:content-[attr(data-text)]",
        "after:bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]",
        "after:-z-10 after:bg-size-[0.06em_0.06em] after:bg-clip-text after:text-transparent",
        "after:animate-line-shadow",
        className
      )}
      data-text={children}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-line-shadow": "line-shadow 15s linear infinite"
    }
  },
  "css": {
    "@keyframes line-shadow": {
      "0%": {
        "background-position": "0 0"
      },
      "100%": {
        "background-position": "100% -100%"
      }
    }
  }
}
```

---

### Morphing Text

- **Slug:** `morphing-text`
- **URL:** https://magicui.design/docs/components/morphing-text
- **Registry JSON:** https://magicui.design/r/morphing-text.json
- **Description:** A dynamic text morphing component for Magic UI.
- **npm dependencies:** none

**File: `registry/magicui/morphing-text.tsx`**

```tsx
"use client"

import { useCallback, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const morphTime = 1.5
const cooldownTime = 0.5

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(new Date())

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current]
      if (!current1 || !current2) return

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

      const invertedFraction = 1 - fraction
      current1.style.filter = `blur(${Math.min(
        8 / invertedFraction - 8,
        100
      )}px)`
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`

      current1.textContent = texts[textIndexRef.current % texts.length]
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length]
    },
    [texts]
  )

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / morphTime

    if (fraction > 1) {
      cooldownRef.current = cooldownTime
      fraction = 1
    }

    setStyles(fraction)

    if (fraction === 1) {
      textIndexRef.current++
    }
  }, [setStyles])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const [current1, current2] = [text1Ref.current, text2Ref.current]
    if (current1 && current2) {
      current2.style.filter = "none"
      current2.style.opacity = "100%"
      current1.style.filter = "none"
      current1.style.opacity = "0%"
    }
  }, [])

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const newTime = new Date()
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000
      timeRef.current = newTime

      cooldownRef.current -= dt

      if (cooldownRef.current <= 0) doMorph()
      else doCooldown()
    }

    animate()
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [doMorph, doCooldown])

  return { text1Ref, text2Ref }
}

interface MorphingTextProps {
  className?: string
  texts: string[]
}

const Texts: React.FC<Pick<MorphingTextProps, "texts">> = ({ texts }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts)
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
    </>
  )
}

const SvgFilters: React.FC = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
)

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
}) => (
  <div
    className={cn(
      "relative mx-auto h-16 w-full max-w-3xl text-center font-sans text-[40pt] leading-none font-bold filter-[url(#threshold)_blur(0.6px)] md:h-24 lg:text-[6rem]",
      className
    )}
  >
    <Texts texts={texts} />
    <SvgFilters />
  </div>
)
```

---

### Sparkles Text

- **Slug:** `sparkles-text`
- **URL:** https://magicui.design/docs/components/sparkles-text
- **Registry JSON:** https://magicui.design/r/sparkles-text.json
- **Description:** A dynamic text that generates continuous sparkles with smooth transitions, perfect for highlighting text with animated stars.
- **npm dependencies:** motion

**File: `registry/magicui/sparkles-text.tsx`**

```tsx
"use client"

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface Sparkle {
  id: string
  x: string
  y: string
  color: string
  delay: number
  scale: number
  lifespan: number
}

const Sparkle: React.FC<Sparkle> = ({ id, x, y, color, delay, scale }) => {
  return (
    <motion.svg
      key={id}
      className="pointer-events-none absolute z-20"
      initial={{ opacity: 0, left: x, top: y }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, scale, 0],
        rotate: [75, 120, 150],
      }}
      transition={{ duration: 0.8, repeat: Infinity, delay }}
      width="21"
      height="21"
      viewBox="0 0 21 21"
    >
      <path
        d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
        fill={color}
      />
    </motion.svg>
  )
}

interface SparklesTextProps {
  /**
   * @default <div />
   * @type ReactElement
   * @description
   * The component to be rendered as the text
   * */
  as?: ReactElement

  /**
   * @default ""
   * @type string
   * @description
   * The className of the text
   */
  className?: string

  /**
   * @required
   * @type ReactNode
   * @description
   * The content to be displayed
   * */
  children: React.ReactNode

  /**
   * @default 10
   * @type number
   * @description
   * The count of sparkles
   * */
  sparklesCount?: number

  /**
   * @default "{first: '#9E7AFF', second: '#FE8BBB'}"
   * @type string
   * @description
   * The colors of the sparkles
   * */
  colors?: {
    first: string
    second: string
  }
}

export const SparklesText: React.FC<SparklesTextProps> = ({
  children,
  colors = { first: "#9E7AFF", second: "#FE8BBB" },
  className,
  sparklesCount = 10,
  ...props
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const generateStar = (): Sparkle => {
      const starX = `${Math.random() * 100}%`
      const starY = `${Math.random() * 100}%`
      const color = Math.random() > 0.5 ? colors.first : colors.second
      const delay = Math.random() * 2
      const scale = Math.random() * 1 + 0.3
      const lifespan = Math.random() * 10 + 5
      const id = `${starX}-${starY}-${Date.now()}`
      return { id, x: starX, y: starY, color, delay, scale, lifespan }
    }

    const initializeStars = () => {
      const newSparkles = Array.from({ length: sparklesCount }, generateStar)
      setSparkles(newSparkles)
    }

    const updateStars = () => {
      setSparkles((currentSparkles) =>
        currentSparkles.map((star) => {
          if (star.lifespan <= 0) {
            return generateStar()
          } else {
            return { ...star, lifespan: star.lifespan - 0.1 }
          }
        })
      )
    }

    initializeStars()
    const interval = setInterval(updateStars, 100)

    return () => clearInterval(interval)
  }, [colors.first, colors.second, sparklesCount])

  return (
    <div
      className={cn("text-6xl font-bold", className)}
      {...props}
      style={
        {
          "--sparkles-first-color": `${colors.first}`,
          "--sparkles-second-color": `${colors.second}`,
        } as CSSProperties
      }
    >
      <span className="relative inline-block">
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} {...sparkle} />
        ))}
        <strong>{children}</strong>
      </span>
    </div>
  )
}
```

---

### Spinning Text

- **Slug:** `spinning-text`
- **URL:** https://magicui.design/docs/components/spinning-text
- **Registry JSON:** https://magicui.design/r/spinning-text.json
- **Description:** The Spinning Text component animates text in a circular motion with customizable speed, direction, color, and transitions for dynamic and engaging effects.
- **npm dependencies:** motion

**File: `registry/magicui/spinning-text.tsx`**

```tsx
"use client"

import React, { type ComponentPropsWithoutRef } from "react"
import { motion, type Transition, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

interface SpinningTextProps extends ComponentPropsWithoutRef<"div"> {
  children: string | string[]
  duration?: number
  reverse?: boolean
  radius?: number
  transition?: Transition
  variants?: {
    container?: Variants
    item?: Variants
  }
}

const BASE_TRANSITION: Transition = {
  repeat: Infinity,
  ease: "linear",
}

const BASE_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
  },
}

export function SpinningText({
  children,
  duration = 10,
  reverse = false,
  radius = 5,
  transition,
  variants,
  className,
  style,
}: SpinningTextProps) {
  if (typeof children !== "string" && !Array.isArray(children)) {
    throw new Error("children must be a string or an array of strings")
  }

  if (Array.isArray(children)) {
    // Validate all elements are strings
    if (!children.every((child) => typeof child === "string")) {
      throw new Error("all elements in children array must be strings")
    }
    children = children.join("")
  }

  const letters = children.split("")
  letters.push(" ")

  const finalTransition: Transition = {
    ...BASE_TRANSITION,
    ...transition,
    duration: (transition as { duration?: number })?.duration ?? duration,
  }

  const containerVariants: Variants = {
    visible: { rotate: reverse ? -360 : 360 },
    ...variants?.container,
  }

  const itemVariants: Variants = {
    ...BASE_ITEM_VARIANTS,
    ...variants?.item,
  }

  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        ...style,
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={finalTransition}
    >
      {letters.map((letter, index) => (
        <motion.span
          aria-hidden="true"
          key={`${index}-${letter}`}
          variants={itemVariants}
          className="absolute top-1/2 left-1/2 inline-block"
          style={
            {
              "--index": index,
              "--total": letters.length,
              "--radius": radius,
              transform: `
                  translate(-50%, -50%)
                  rotate(calc(360deg / var(--total) * var(--index)))
                  translateY(calc(var(--radius, 5) * -1ch))
                `,
              transformOrigin: "center",
            } as React.CSSProperties
          }
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{children}</span>
    </motion.div>
  )
}
```

---

### Text 3D Flip

- **Slug:** `text-3d-flip`
- **URL:** https://magicui.design/docs/components/text-3d-flip
- **Registry JSON:** https://magicui.design/r/text-3d-flip.json
- **Description:** A text effect that flips each letter in 3D with a staggered animation on hover.
- **npm dependencies:** motion

**File: `registry/magicui/text-3d-flip.tsx`**

```tsx
"use client"

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ElementType,
} from "react"
import {
  useAnimate,
  type AnimationOptions,
  type ValueAnimationTransition,
} from "motion/react"

import { cn } from "@/lib/utils"

const HAS_SEGMENTER = typeof Intl !== "undefined" && "Segmenter" in Intl

const splitIntoCharacters = (text: string): string[] => {
  if (HAS_SEGMENTER) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

const extractTextFromChildren = (children: React.ReactNode): string => {
  if (children == null) return ""
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("")
  }

  if (React.isValidElement(children)) {
    const props = children.props as Record<string, unknown>
    const childText = props.children as React.ReactNode
    if (childText != null) {
      return extractTextFromChildren(childText)
    }
  }

  return ""
}

const ROTATION_MAP = {
  top: "rotateX(90deg)",
  right: "rotateY(90deg)",
  bottom: "rotateX(-90deg)",
  left: "rotateY(-90deg)",
} as const

const DEFAULT_TRANSITION: ValueAnimationTransition = {
  type: "spring",
  damping: 30,
  stiffness: 300,
}

interface Text3DFlipProps {
  children: React.ReactNode
  as?: ElementType
  className?: string
  textClassName?: string
  flipTextClassName?: string
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | number | "random"
  transition?: ValueAnimationTransition | AnimationOptions
  rotateDirection?: "top" | "right" | "bottom" | "left"
}

const Text3DFlip = ({
  children,
  as: ElementTag = "p",
  className,
  textClassName,
  flipTextClassName,
  staggerDuration = 0.05,
  staggerFrom = "first",
  transition = DEFAULT_TRANSITION,
  rotateDirection = "right",
  ...props
}: Text3DFlipProps) => {
  const isAnimatingRef = useRef(false)
  const isMountedRef = useRef(false)
  const [scope, animate] = useAnimate()

  const rotationTransform = ROTATION_MAP[rotateDirection]

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      isAnimatingRef.current = false
    }
  }, [])

  const text = useMemo(() => {
    try {
      return extractTextFromChildren(children)
    } catch {
      return ""
    }
  }, [children])

  const characters = useMemo(() => {
    const words = text.split(" ")
    return words.map((word, i) => ({
      characters: splitIntoCharacters(word),
      needsSpace: i !== words.length - 1,
    }))
  }, [text])

  const charOffsets = useMemo(() => {
    const offsets = [0]
    for (const word of characters) {
      offsets.push(offsets.at(-1)! + word.characters.length)
    }
    return offsets
  }, [characters])

  const getStaggerDelay = useCallback(
    (index: number, totalChars: number) => {
      if (staggerFrom === "first") return index * staggerDuration
      if (staggerFrom === "last")
        return (totalChars - 1 - index) * staggerDuration
      if (staggerFrom === "center") {
        const center = Math.floor(totalChars / 2)
        return Math.abs(center - index) * staggerDuration
      }
      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * totalChars)
        return Math.abs(randomIndex - index) * staggerDuration
      }
      return Math.abs(staggerFrom - index) * staggerDuration
    },
    [staggerFrom, staggerDuration]
  )

  const handleHoverStart = useCallback(async () => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    try {
      const totalChars = characters.reduce(
        (sum, word) => sum + word.characters.length,
        0
      )

      const delays = Array.from({ length: totalChars }, (_, i) =>
        getStaggerDelay(i, totalChars)
      )

      await animate(
        ".text-3d-flip-char",
        { transform: rotationTransform },
        {
          ...transition,
          delay: (i: number) => delays[i],
        }
      )

      if (!isMountedRef.current) return

      await animate(
        ".text-3d-flip-char",
        { transform: "rotateX(0deg) rotateY(0deg)" },
        { duration: 0 }
      )
    } finally {
      if (isMountedRef.current) {
        isAnimatingRef.current = false
      }
    }
  }, [characters, transition, getStaggerDelay, rotationTransform, animate])

  return (
    <ElementTag
      className={cn("relative flex flex-wrap", className)}
      onMouseEnter={handleHoverStart}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{text}</span>

      {characters.map((wordObj, wordIndex) => (
        <span key={wordIndex} className="inline-flex">
          {wordObj.characters.map((char, charIndex) => (
            <CharBox
              key={charOffsets[wordIndex] + charIndex}
              char={char}
              textClassName={textClassName}
              flipTextClassName={flipTextClassName}
              rotateDirection={rotateDirection}
            />
          ))}
          {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
        </span>
      ))}
    </ElementTag>
  )
}

interface CharBoxProps {
  char: string
  textClassName?: string
  flipTextClassName?: string
  rotateDirection: "top" | "right" | "bottom" | "left"
}

const SECOND_FACE_TRANSFORMS = {
  top: "rotateX(-90deg) translateZ(0.5lh)",
  right:
    "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)",
  bottom: "rotateX(90deg) translateZ(0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(50%) rotateY(-90deg) translateX(50%)",
} as const

const FRONT_FACE_TRANSFORMS = {
  top: "translateZ(0.5lh)",
  bottom: "translateZ(0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
  right: "rotateY(-90deg) translateX(50%) rotateY(90deg)",
} as const

const CONTAINER_TRANSFORMS = {
  top: "translateZ(-0.5lh)",
  bottom: "translateZ(-0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
  right: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
} as const

const CharBox = memo(
  ({
    char,
    textClassName,
    flipTextClassName,
    rotateDirection,
  }: CharBoxProps) => (
    <span
      className="text-3d-flip-char inline transform-3d"
      style={{ transform: CONTAINER_TRANSFORMS[rotateDirection] }}
    >
      <span
        className={cn("relative h-[1lh] backface-hidden", textClassName)}
        style={{ transform: FRONT_FACE_TRANSFORMS[rotateDirection] }}
      >
        {char}
      </span>
      <span
        className={cn(
          "absolute top-0 left-0 h-[1lh] backface-hidden",
          flipTextClassName
        )}
        style={{ transform: SECOND_FACE_TRANSFORMS[rotateDirection] }}
      >
        {char}
      </span>
    </span>
  )
)

CharBox.displayName = "CharBox"
Text3DFlip.displayName = "Text3DFlip"

export default Text3DFlip
```

---

### Text Animate

- **Slug:** `text-animate`
- **URL:** https://magicui.design/docs/components/text-animate
- **Registry JSON:** https://magicui.design/r/text-animate.json
- **Description:** A text animation component that animates text using a variety of different animations.
- **npm dependencies:** motion

**File: `registry/magicui/text-animate.tsx`**

```tsx
"use client"

import { memo } from "react"
import {
  AnimatePresence,
  motion,
  type DOMMotionComponents,
  type MotionProps,
  type Variants,
} from "motion/react"

import { cn } from "@/lib/utils"

type AnimationType = "text" | "word" | "character" | "line"
type AnimationVariant =
  | "fadeIn"
  | "blurIn"
  | "blurInUp"
  | "blurInDown"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown"

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<
  keyof DOMMotionComponents,
  keyof typeof motionElements
>

interface TextAnimateProps extends Omit<MotionProps, "children"> {
  /**
   * The text content to animate
   */
  children: string
  /**
   * The class name to be applied to the component
   */
  className?: string
  /**
   * The class name to be applied to each segment
   */
  segmentClassName?: string
  /**
   * The delay before the animation starts
   */
  delay?: number
  /**
   * The duration of the animation
   */
  duration?: number
  /**
   * Custom motion variants for the animation
   */
  variants?: Variants
  /**
   * The element type to render
   */
  as?: MotionElementType
  /**
   * How to split the text ("text", "word", "character")
   */
  by?: AnimationType
  /**
   * Whether to start animation when component enters viewport
   */
  startOnView?: boolean
  /**
   * Whether to animate only once
   */
  once?: boolean
  /**
   * The animation preset to use
   */
  animation?: AnimationVariant
  /**
   * Whether to enable accessibility features (default: true)
   */
  accessible?: boolean
}

const staggerTimings: Record<AnimationType, number> = {
  text: 0.06,
  word: 0.05,
  character: 0.03,
  line: 0.06,
}

const defaultContainerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
}

const defaultItemAnimationVariants: Record<
  AnimationVariant,
  { container: Variants; item: Variants }
> = {
  fadeIn: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
        },
      },
      exit: {
        opacity: 0,
        y: 20,
        transition: { duration: 0.3 },
      },
    },
  },
  blurIn: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(10px)" },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          duration: 0.3,
        },
      },
      exit: {
        opacity: 0,
        filter: "blur(10px)",
        transition: { duration: 0.3 },
      },
    },
  },
  blurInUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          y: { duration: 0.3 },
          opacity: { duration: 0.4 },
          filter: { duration: 0.3 },
        },
      },
      exit: {
        opacity: 0,
        filter: "blur(10px)",
        y: 20,
        transition: {
          y: { duration: 0.3 },
          opacity: { duration: 0.4 },
          filter: { duration: 0.3 },
        },
      },
    },
  },
  blurInDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(10px)", y: -20 },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          y: { duration: 0.3 },
          opacity: { duration: 0.4 },
          filter: { duration: 0.3 },
        },
      },
    },
  },
  slideUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { y: 20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.3,
        },
      },
      exit: {
        y: -20,
        opacity: 0,
        transition: {
          duration: 0.3,
        },
      },
    },
  },
  slideDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { y: -20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      },
      exit: {
        y: 20,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  slideLeft: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: 20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      },
      exit: {
        x: -20,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  slideRight: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: -20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      },
      exit: {
        x: 20,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  scaleUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { scale: 0.5, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.3,
          scale: {
            type: "spring",
            damping: 15,
            stiffness: 300,
          },
        },
      },
      exit: {
        scale: 0.5,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  scaleDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { scale: 1.5, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.3,
          scale: {
            type: "spring",
            damping: 15,
            stiffness: 300,
          },
        },
      },
      exit: {
        scale: 1.5,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
}

const TextAnimateBase = ({
  children,
  delay = 0,
  duration = 0.3,
  variants,
  className,
  segmentClassName,
  as: Component = "p",
  startOnView = true,
  once = false,
  by = "word",
  animation = "fadeIn",
  accessible = true,
  ...props
}: TextAnimateProps) => {
  const MotionComponent = motionElements[Component]

  let segments: string[] = []
  switch (by) {
    case "word":
      segments = children.split(/(\s+)/)
      break
    case "character":
      segments = children.split("")
      break
    case "line":
      segments = children.split("\n")
      break
    case "text":
    default:
      segments = [children]
      break
  }

  const finalVariants = variants
    ? {
        container: {
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              opacity: { duration: 0.01, delay },
              delayChildren: delay,
              staggerChildren: duration / segments.length,
            },
          },
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: duration / segments.length,
              staggerDirection: -1,
            },
          },
        },
        item: variants,
      }
    : animation
      ? {
          container: {
            ...defaultItemAnimationVariants[animation].container,
            show: {
              ...defaultItemAnimationVariants[animation].container.show,
              transition: {
                delayChildren: delay,
                staggerChildren: duration / segments.length,
              },
            },
            exit: {
              ...defaultItemAnimationVariants[animation].container.exit,
              transition: {
                staggerChildren: duration / segments.length,
                staggerDirection: -1,
              },
            },
          },
          item: defaultItemAnimationVariants[animation].item,
        }
      : { container: defaultContainerVariants, item: defaultItemVariants }

  return (
    <AnimatePresence mode="popLayout">
      <MotionComponent
        variants={finalVariants.container as Variants}
        initial="hidden"
        whileInView={startOnView ? "show" : undefined}
        animate={startOnView ? undefined : "show"}
        exit="exit"
        className={cn("whitespace-pre-wrap", className)}
        viewport={{ once }}
        aria-label={accessible ? children : undefined}
        {...props}
      >
        {accessible && <span className="sr-only">{children}</span>}
        {segments.map((segment, i) => (
          <motion.span
            key={`${by}-${segment}-${i}`}
            variants={finalVariants.item}
            custom={i * staggerTimings[by]}
            className={cn(
              by === "line" ? "block" : "inline-block whitespace-pre",
              by === "character" && "",
              segmentClassName
            )}
            aria-hidden={accessible ? true : undefined}
          >
            {segment}
          </motion.span>
        ))}
      </MotionComponent>
    </AnimatePresence>
  )
}

// Export the memoized version
export const TextAnimate = memo(TextAnimateBase)
```

---

### Text Reveal

- **Slug:** `text-reveal`
- **URL:** https://magicui.design/docs/components/text-reveal
- **Registry JSON:** https://magicui.design/r/text-reveal.json
- **Description:** Fade in text as you scroll down the page.
- **npm dependencies:** motion

**File: `registry/magicui/text-reveal.tsx`**

```tsx
"use client"

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react"
import { motion, MotionValue, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
  })

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const words = children.split(" ")

  return (
    <div ref={sectionRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-4 py-20"
        }
      >
        <span
          className={
            "flex flex-wrap p-5 text-2xl font-bold text-black/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl dark:text-white/20"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length
            const end = start + 1 / words.length
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            )
          })}
        </span>
      </div>
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-1.5">
      <span className="absolute opacity-30">{children}</span>
      <motion.span
        style={{ opacity: opacity }}
        className={"text-black dark:text-white"}
      >
        {children}
      </motion.span>
    </span>
  )
}
```

---

### Typing Animation

- **Slug:** `typing-animation`
- **URL:** https://magicui.design/docs/components/typing-animation
- **Registry JSON:** https://magicui.design/r/typing-animation.json
- **Description:** Characters appearing in typed animation
- **npm dependencies:** motion

**File: `registry/magicui/typing-animation.tsx`**

```tsx
"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type RefAttributes,
  type RefObject,
} from "react"
import {
  motion,
  useInView,
  type DOMMotionComponents,
  type HTMLMotionProps,
  type MotionProps,
} from "motion/react"

import { cn } from "@/lib/utils"

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

type MotionElementType = Extract<
  keyof DOMMotionComponents,
  keyof typeof motionElements
>
type TypingAnimationMotionComponent = ComponentType<
  Omit<HTMLMotionProps<"span">, "ref"> & RefAttributes<HTMLElement>
>

interface TypingAnimationProps extends Omit<MotionProps, "children"> {
  children?: string
  words?: string[]
  className?: string
  duration?: number
  typeSpeed?: number
  deleteSpeed?: number
  delay?: number
  pauseDelay?: number
  loop?: boolean
  as?: MotionElementType
  startOnView?: boolean
  showCursor?: boolean
  blinkCursor?: boolean
  cursorStyle?: "line" | "block" | "underscore"
}

export function TypingAnimation({
  children,
  words,
  className,
  duration = 100,
  typeSpeed,
  deleteSpeed,
  delay = 0,
  pauseDelay = 1000,
  loop = false,
  as: Component = "span",
  startOnView = true,
  showCursor = true,
  blinkCursor = true,
  cursorStyle = "line",
  ...props
}: TypingAnimationProps) {
  const MotionComponent = motionElements[
    Component
  ] as TypingAnimationMotionComponent

  const [displayedText, setDisplayedText] = useState<string>("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing")
  const elementRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(elementRef as RefObject<Element>, {
    amount: 0.3,
    once: true,
  })

  const wordsToAnimate = useMemo(
    () => words ?? (children ? [children] : []),
    [words, children]
  )
  const hasMultipleWords = wordsToAnimate.length > 1

  const typingSpeed = typeSpeed ?? duration
  const deletingSpeed = deleteSpeed ?? typingSpeed / 2

  const shouldStart = startOnView ? isInView : true
  const animationSourceKey = useMemo(
    () => (words ? words.join("\u0000") : (children ?? "")),
    [words, children]
  )

  useEffect(() => {
    setDisplayedText("")
    setCurrentWordIndex(0)
    setCurrentCharIndex(0)
    setPhase("typing")
  }, [animationSourceKey])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null

    if (shouldStart && wordsToAnimate.length > 0) {
      const timeoutDelay =
        delay > 0 && displayedText === ""
          ? delay
          : phase === "typing"
            ? typingSpeed
            : phase === "deleting"
              ? deletingSpeed
              : pauseDelay

      timeout = setTimeout(() => {
        const currentWord = wordsToAnimate[currentWordIndex] || ""
        const graphemes = Array.from(currentWord)

        switch (phase) {
          case "typing":
            if (currentCharIndex < graphemes.length) {
              setDisplayedText(
                graphemes.slice(0, currentCharIndex + 1).join("")
              )
              setCurrentCharIndex(currentCharIndex + 1)
            } else {
              if (hasMultipleWords || loop) {
                const isLastWord =
                  currentWordIndex === wordsToAnimate.length - 1
                if (!isLastWord || loop) {
                  setPhase("pause")
                }
              }
            }
            break

          case "pause":
            setPhase("deleting")
            break

          case "deleting":
            if (currentCharIndex > 0) {
              setDisplayedText(
                graphemes.slice(0, currentCharIndex - 1).join("")
              )
              setCurrentCharIndex(currentCharIndex - 1)
            } else {
              const nextIndex = (currentWordIndex + 1) % wordsToAnimate.length
              setCurrentWordIndex(nextIndex)
              setPhase("typing")
            }
            break
        }
      }, timeoutDelay)
    }

    return () => {
      if (timeout !== null) {
        clearTimeout(timeout)
      }
    }
  }, [
    shouldStart,
    phase,
    currentCharIndex,
    currentWordIndex,
    displayedText,
    wordsToAnimate,
    hasMultipleWords,
    loop,
    typingSpeed,
    deletingSpeed,
    pauseDelay,
    delay,
  ])

  const currentWordGraphemes = Array.from(
    wordsToAnimate[currentWordIndex] || ""
  )
  const isComplete =
    !loop &&
    currentWordIndex === wordsToAnimate.length - 1 &&
    currentCharIndex >= currentWordGraphemes.length &&
    phase !== "deleting"

  const shouldShowCursor =
    showCursor &&
    !isComplete &&
    (hasMultipleWords || loop || currentCharIndex < currentWordGraphemes.length)

  const getCursorChar = () => {
    switch (cursorStyle) {
      case "block":
        return "▌"
      case "underscore":
        return "_"
      case "line":
      default:
        return "|"
    }
  }

  return (
    <MotionComponent
      ref={elementRef}
      className={cn(
        "leading-20 tracking-[-0.02em]",
        Component === "span" && "inline-block",
        className
      )}
      {...props}
    >
      {displayedText}
      {shouldShowCursor && (
        <span
          className={cn("inline-block", blinkCursor && "animate-blink-cursor")}
        >
          {getCursorChar()}
        </span>
      )}
    </MotionComponent>
  )
}
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-blink-cursor": "blink-cursor 1.2s step-end infinite"
    }
  },
  "css": {
    "@keyframes blink-cursor": {
      "0%, 49%": {
        "opacity": "1"
      },
      "50%, 100%": {
        "opacity": "0"
      }
    }
  }
}
```

---

### Video Text

- **Slug:** `video-text`
- **URL:** https://magicui.design/docs/components/video-text
- **Registry JSON:** https://magicui.design/r/video-text.json
- **Description:** A component that displays text with a video playing in the background.
- **npm dependencies:** none

**File: `registry/magicui/video-text.tsx`**

```tsx
"use client"

import React, {
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

export interface VideoTextProps {
  /**
   * The video source URL
   */
  src: string
  /**
   * Additional className for the container
   */
  className?: string
  /**
   * Whether to autoplay the video
   */
  autoPlay?: boolean
  /**
   * Whether to mute the video
   */
  muted?: boolean
  /**
   * Whether to loop the video
   */
  loop?: boolean
  /**
   * Whether to preload the video
   */
  preload?: "auto" | "metadata" | "none"
  /**
   * The content to display (will have the video "inside" it)
   */
  children: ReactNode
  /**
   * Font size for the text mask (in viewport width units)
   * @default 10
   */
  fontSize?: string | number
  /**
   * Font weight for the text mask
   * @default "bold"
   */
  fontWeight?: string | number
  /**
   * Text anchor for the text mask
   * @default "middle"
   */
  textAnchor?: string
  /**
   * Dominant baseline for the text mask
   * @default "middle"
   */
  dominantBaseline?: string
  /**
   * Font family for the text mask
   * @default "sans-serif"
   */
  fontFamily?: string
  /**
   * The element type to render for the text
   * @default "div"
   */
  as?: ElementType
}

export function VideoText({
  src,
  children,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  preload = "auto",
  fontSize = 20,
  fontWeight = "bold",
  textAnchor = "middle",
  dominantBaseline = "middle",
  fontFamily = "sans-serif",
  as: Component = "div",
}: VideoTextProps) {
  const [svgMask, setSvgMask] = useState("")
  const content = React.Children.toArray(children).join("")

  useEffect(() => {
    const updateSvgMask = () => {
      const responsiveFontSize =
        typeof fontSize === "number" ? `${fontSize}vw` : fontSize
      const newSvgMask = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' font-size='${responsiveFontSize}' font-weight='${fontWeight}' text-anchor='${textAnchor}' dominant-baseline='${dominantBaseline}' font-family='${fontFamily}'>${content}</text></svg>`
      setSvgMask(newSvgMask)
    }

    updateSvgMask()
    window.addEventListener("resize", updateSvgMask)
    return () => window.removeEventListener("resize", updateSvgMask)
  }, [content, fontSize, fontWeight, textAnchor, dominantBaseline, fontFamily])

  const dataUrlMask = `url("data:image/svg+xml,${encodeURIComponent(svgMask)}")`

  return (
    <Component className={cn(`relative size-full`, className)}>
      {/* Create a container that masks the video to only show within text */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          maskImage: dataUrlMask,
          WebkitMaskImage: dataUrlMask,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      >
        <video
          className="h-full w-full object-cover"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload={preload}
          playsInline
        >
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Add a backup text element for SEO/accessibility */}
      <span className="sr-only">{content}</span>
    </Component>
  )
}
```

---

### Word Rotate

- **Slug:** `word-rotate`
- **URL:** https://magicui.design/docs/components/word-rotate
- **Registry JSON:** https://magicui.design/r/word-rotate.json
- **Description:** A vertical rotation of words
- **npm dependencies:** motion

**File: `registry/magicui/word-rotate.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

interface WordRotateProps {
  words: string[]
  duration?: number
  motionProps?: MotionProps
  className?: string
}

export function WordRotate({
  words,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: WordRotateProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, duration)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [words, duration])

  return (
    <div className="overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.h1
          key={words[index]}
          className={cn(className)}
          {...motionProps}
        >
          {words[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  )
}
```

---

## Buttons / CTA

### Theme Toggler

- **Slug:** `animated-theme-toggler`
- **URL:** https://magicui.design/docs/components/animated-theme-toggler
- **Registry JSON:** https://magicui.design/r/animated-theme-toggler.json
- **Description:** Theme toggle with View Transitions and animated clip-path masks (circle, polygons, star), optional viewport-centered origin.
- **npm dependencies:** lucide-react

**File: `registry/magicui/animated-theme-toggler.tsx`**

```tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

export type TransitionVariant =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "rectangle"
  | "star"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  variant?: TransitionVariant
  /** When true, the transition expands from the viewport center instead of the button center. */
  fromCenter?: boolean
  /**
   * Controlled theme value. When provided, the parent owns persistence
   * (e.g. `next-themes`) and this component will not write to localStorage.
   */
  theme?: "light" | "dark"
  /** Called on toggle. Pair with `theme` for controlled usage. */
  onThemeChange?: (theme: "light" | "dark") => void
}

function polygonCollapsed(point: string, vertexCount: number): string {
  const pairs = Array.from({ length: vertexCount }, () => point).join(", ")
  return `polygon(${pairs})`
}

// All coordinates are percentages of the snapshot reference box: Chrome 150
// renders absolute px clip-path coordinates on ::view-transition-new(root)
// unscaled on fractional display scales (e.g. Windows 150%) for the first
// transition after load, so px values land at the wrong position (#989).
function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`
  // circle() percentage radii resolve against hypot(w, h) / sqrt(2) of the reference box.
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`

  switch (variant) {
    case "circle":
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ]
    case "square": {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const halfSide = Math.max(halfW, halfH) * 1.05
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(", ")
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case "triangle": {
      const scale = maxRadius * 2.2
      const dx = (Math.sqrt(3) / 2) * scale
      const verts = [
        point(cx, cy - scale),
        point(cx + dx, cy + 0.5 * scale),
        point(cx - dx, cy + 0.5 * scale),
      ].join(", ")
      return [polygonCollapsed(point(cx, cy), 3), `polygon(${verts})`]
    }
    case "diamond": {
      // Slightly larger than the view-transition circle radius so axis-aligned coverage matches the circle reveal.
      const R = maxRadius * Math.SQRT2
      const end = [
        point(cx, cy - R),
        point(cx + R, cy),
        point(cx, cy + R),
        point(cx - R, cy),
      ].join(", ")
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case "hexagon": {
      const R = maxRadius * Math.SQRT2
      const verts: string[] = []
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a)))
      }
      return [
        polygonCollapsed(point(cx, cy), 6),
        `polygon(${verts.join(", ")})`,
      ]
    }
    case "rectangle": {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const end = [
        point(cx - halfW, cy - halfH),
        point(cx + halfW, cy - halfH),
        point(cx + halfW, cy + halfH),
        point(cx - halfW, cy + halfH),
      ].join(", ")
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case "star": {
      // Small overscan so the last frames never leave a 1px seam before the transition group ends.
      const R = maxRadius * Math.SQRT2 * 1.03
      const innerRatio = 0.42
      const starPolygon = (radius: number) => {
        const verts: string[] = []
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          verts.push(
            point(
              cx + radius * Math.cos(outerA),
              cy + radius * Math.sin(outerA)
            )
          )
          const innerA = outerA + Math.PI / 5
          verts.push(
            point(
              cx + radius * innerRatio * Math.cos(innerA),
              cy + radius * innerRatio * Math.sin(innerA)
            )
          )
        }
        return `polygon(${verts.join(", ")})`
      }
      const startR = Math.max(2, R * 0.025)
      return [starPolygon(startR), starPolygon(R)]
    }
    default:
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ]
  }
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  variant,
  fromCenter = false,
  theme,
  onThemeChange,
  ...props
}: AnimatedThemeTogglerProps) => {
  const shape = variant ?? "circle"
  const isControlled = theme !== undefined
  const [internalIsDark, setInternalIsDark] = useState(false)
  const isDark = isControlled ? theme === "dark" : internalIsDark
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isTransitioningRef = useRef(false)
  const activeAnimRef = useRef<Animation | null>(null)

  const cancelAnim = useCallback(() => {
    activeAnimRef.current?.cancel()
    activeAnimRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      cancelAnim()
      const root = document.documentElement
      if (root.dataset.magicuiThemeVt !== "active") return
      delete root.dataset.magicuiThemeVt
      root.style.removeProperty("--magicui-theme-toggle-vt-duration")
      root.style.removeProperty("--magicui-theme-vt-clip-from")
    }
  }, [cancelAnim])

  useEffect(() => {
    if (isControlled) return

    const updateTheme = () => {
      setInternalIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [isControlled])

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current
    if (
      !button ||
      isTransitioningRef.current ||
      document.documentElement.dataset.magicuiThemeVt === "active"
    )
      return

    // innerWidth/innerHeight (not visualViewport): percentages must resolve
    // against the snapshot reference box, which includes classic scrollbars.
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x: number
    let y: number
    if (fromCenter) {
      x = viewportWidth / 2
      y = viewportHeight / 2
    } else {
      const { top, left, width, height } = button.getBoundingClientRect()
      x = left + width / 2
      y = top + height / 2
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    )

    const applyTheme = () => {
      const newTheme = !isDark
      // Always toggle the class synchronously so the View Transitions API
      // snapshots the new theme inside the startViewTransition callback.
      document.documentElement.classList.toggle("dark")
      if (isControlled) {
        onThemeChange?.(newTheme ? "dark" : "light")
      } else {
        setInternalIsDark(newTheme)
        localStorage.setItem("theme", newTheme ? "dark" : "light")
      }
    }

    if (typeof document.startViewTransition !== "function") {
      applyTheme()
      return
    }

    const clipPath = getThemeTransitionClipPaths(
      shape,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight
    )

    const root = document.documentElement
    root.dataset.magicuiThemeVt = "active"
    root.style.setProperty(
      "--magicui-theme-toggle-vt-duration",
      `${duration}ms`
    )
    // Pin the collapsed clip-path via CSS so Firefox does not paint the new
    // theme unclipped between snapshot and the ready.then() JS animation.
    root.style.setProperty("--magicui-theme-vt-clip-from", clipPath[0])
    const cleanup = () => {
      isTransitioningRef.current = false
      delete root.dataset.magicuiThemeVt
      root.style.removeProperty("--magicui-theme-toggle-vt-duration")
      root.style.removeProperty("--magicui-theme-vt-clip-from")
      cancelAnim()
    }

    isTransitioningRef.current = true
    const transition = document.startViewTransition(() => {
      flushSync(applyTheme)
    })
    if (typeof transition?.finished?.finally === "function") {
      transition.finished.finally(cleanup).catch(() => {})
    } else {
      cleanup()
    }

    const ready = transition?.ready
    if (ready && typeof ready.then === "function") {
      ready
        .then(() => {
          const anim = document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration,
              // Star: linear avoids easing overshoot that fights polygon interpolation at t→1; VT group duration is synced above.
              easing: shape === "star" ? "linear" : "ease-in-out",
              fill: "forwards",
              pseudoElement: "::view-transition-new(root)",
            }
          )
          activeAnimRef.current = anim
        })
        .catch(() => {})
    }
  }, [
    shape,
    fromCenter,
    duration,
    isDark,
    isControlled,
    onThemeChange,
    cancelAnim,
  ])

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "css": {
    "::view-transition-old(root), ::view-transition-new(root)": {
      "animation": "none",
      "mix-blend-mode": "normal"
    }
  }
}
```

---

### Cool Mode

- **Slug:** `cool-mode`
- **URL:** https://magicui.design/docs/components/cool-mode
- **Registry JSON:** https://magicui.design/r/cool-mode.json
- **Description:** Cool mode effect for buttons, links, and other DOMs
- **npm dependencies:** none

**File: `registry/magicui/cool-mode.tsx`**

```tsx
"use client"

import React, { useEffect, useRef, type ReactNode } from "react"

export interface BaseParticle {
  element: HTMLElement | SVGSVGElement
  left: number
  size: number
  top: number
}

export interface BaseParticleOptions {
  particle?: string
  size?: number
}

export interface CoolParticle extends BaseParticle {
  direction: number
  speedHorz: number
  speedUp: number
  spinSpeed: number
  spinVal: number
}

export interface CoolParticleOptions extends BaseParticleOptions {
  particleCount?: number
  speedHorz?: number
  speedUp?: number
}

const SVG_NS = "http://www.w3.org/2000/svg"

const getContainer = () => {
  const id = "_coolMode_effect"
  const existingContainer = document.getElementById(id)

  if (existingContainer) {
    return existingContainer
  }

  const container = document.createElement("div")
  container.setAttribute("id", id)
  container.setAttribute(
    "style",
    "overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:2147483647"
  )

  document.body.appendChild(container)

  return container
}

let instanceCounter = 0

const applyParticleEffect = (
  element: HTMLElement,
  options?: CoolParticleOptions
): (() => void) => {
  instanceCounter++

  const defaultParticle = "circle"
  const particleType = options?.particle || defaultParticle
  const sizes = [15, 20, 25, 35, 45]
  const limit = 45

  let particles: CoolParticle[] = []
  let autoAddParticle = false
  let mouseX = 0
  let mouseY = 0

  const container = getContainer()

  const appendCircleParticle = (particle: HTMLDivElement, size: number) => {
    const circleSVG = document.createElementNS(SVG_NS, "svg")
    const circle = document.createElementNS(SVG_NS, "circle")

    circle.setAttributeNS(null, "cx", (size / 2).toString())
    circle.setAttributeNS(null, "cy", (size / 2).toString())
    circle.setAttributeNS(null, "r", (size / 2).toString())
    circle.setAttributeNS(null, "fill", `hsl(${Math.random() * 360}, 70%, 50%)`)

    circleSVG.appendChild(circle)
    circleSVG.setAttribute("width", size.toString())
    circleSVG.setAttribute("height", size.toString())

    particle.appendChild(circleSVG)
  }

  const appendImageParticle = (
    particle: HTMLDivElement,
    imageSrc: string,
    size: number
  ) => {
    const image = document.createElement("img")
    image.src = imageSrc
    image.width = size
    image.height = size
    image.alt = ""
    image.style.borderRadius = "50%"

    particle.appendChild(image)
  }

  const appendTextParticle = (
    particle: HTMLDivElement,
    particleContent: string,
    size: number
  ) => {
    const fontSizeMultiplier = 3
    const emojiSize = size * fontSizeMultiplier
    const content = document.createElement("div")

    content.textContent = particleContent
    content.style.fontSize = `${emojiSize}px`
    content.style.lineHeight = "1"
    content.style.textAlign = "center"
    content.style.width = `${size}px`
    content.style.height = `${size}px`
    content.style.display = "flex"
    content.style.alignItems = "center"
    content.style.justifyContent = "center"
    content.style.transform = `scale(${fontSizeMultiplier})`
    content.style.transformOrigin = "center"

    particle.appendChild(content)
  }

  function generateParticle() {
    const size =
      options?.size || sizes[Math.floor(Math.random() * sizes.length)]
    const speedHorz = options?.speedHorz || Math.random() * 10
    const speedUp = options?.speedUp || Math.random() * 25
    const spinVal = Math.random() * 360
    const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1)
    const top = mouseY - size / 2
    const left = mouseX - size / 2
    const direction = Math.random() <= 0.5 ? -1 : 1

    const particle = document.createElement("div")

    if (particleType === "circle") {
      appendCircleParticle(particle, size)
    } else if (
      particleType.startsWith("http") ||
      particleType.startsWith("/")
    ) {
      appendImageParticle(particle, particleType, size)
    } else {
      appendTextParticle(particle, particleType, size)
    }

    particle.style.position = "absolute"
    particle.style.transform = `translate3d(${left}px, ${top}px, 0px) rotate(${spinVal}deg)`

    container.appendChild(particle)

    particles.push({
      direction,
      element: particle,
      left,
      size,
      speedHorz,
      speedUp,
      spinSpeed,
      spinVal,
      top,
    })
  }

  function refreshParticles() {
    particles.forEach((p) => {
      p.left = p.left - p.speedHorz * p.direction
      p.top = p.top - p.speedUp
      p.speedUp = Math.min(p.size, p.speedUp - 1)
      p.spinVal = p.spinVal + p.spinSpeed

      if (
        p.top >=
        Math.max(window.innerHeight, document.body.clientHeight) + p.size
      ) {
        particles = particles.filter((o) => o !== p)
        p.element.remove()
      }

      p.element.setAttribute(
        "style",
        [
          "position:absolute",
          "will-change:transform",
          `top:${p.top}px`,
          `left:${p.left}px`,
          `transform:rotate(${p.spinVal}deg)`,
        ].join(";")
      )
    })
  }

  let animationFrame: number | undefined

  let lastParticleTimestamp = 0
  const particleGenerationDelay = 30

  function loop() {
    const currentTime = performance.now()
    if (
      autoAddParticle &&
      particles.length < limit &&
      currentTime - lastParticleTimestamp > particleGenerationDelay
    ) {
      generateParticle()
      lastParticleTimestamp = currentTime
    }

    refreshParticles()
    animationFrame = requestAnimationFrame(loop)
  }

  loop()

  const isTouchInteraction = "ontouchstart" in window

  const tap = isTouchInteraction ? "touchstart" : "mousedown"
  const tapEnd = isTouchInteraction ? "touchend" : "mouseup"
  const move = isTouchInteraction ? "touchmove" : "mousemove"

  const updateMousePosition = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      mouseX = e.touches?.[0].clientX
      mouseY = e.touches?.[0].clientY
    } else {
      mouseX = e.clientX
      mouseY = e.clientY
    }
  }

  const tapHandler = (e: MouseEvent | TouchEvent) => {
    updateMousePosition(e)
    autoAddParticle = true
  }

  const disableAutoAddParticle = () => {
    autoAddParticle = false
  }

  element.addEventListener(move, updateMousePosition, { passive: true })
  element.addEventListener(tap, tapHandler, { passive: true })
  element.addEventListener(tapEnd, disableAutoAddParticle, { passive: true })
  element.addEventListener("mouseleave", disableAutoAddParticle, {
    passive: true,
  })

  return () => {
    element.removeEventListener(move, updateMousePosition)
    element.removeEventListener(tap, tapHandler)
    element.removeEventListener(tapEnd, disableAutoAddParticle)
    element.removeEventListener("mouseleave", disableAutoAddParticle)

    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame)
        clearInterval(interval)

        if (--instanceCounter === 0) {
          container.remove()
        }
      }
    }, 500)
  }
}

interface CoolModeProps {
  children: ReactNode
  options?: CoolParticleOptions
}

export const CoolMode: React.FC<CoolModeProps> = ({ children, options }) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    let cleanup: (() => void) | null = null

    if (element) {
      cleanup = applyParticleEffect(element, options)
    }

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [options])

  return <span ref={ref}>{children}</span>
}
```

---

### interactive-hover-button

- **Slug:** `interactive-hover-button`
- **URL:** https://magicui.design/docs/components/interactive-hover-button
- **Registry JSON:** https://magicui.design/r/interactive-hover-button.json
- **Description:** 
- **npm dependencies:** none

**File: `registry/magicui/interactive-hover-button.tsx`**

```tsx
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group bg-background relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="bg-primary h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]"></div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="text-primary-foreground absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight />
      </div>
    </button>
  )
}
```

---

### Magic Card

- **Slug:** `magic-card`
- **URL:** https://magicui.design/docs/components/magic-card
- **Registry JSON:** https://magicui.design/r/magic-card.json
- **Description:** A spotlight effect that follows your mouse cursor and highlights borders on hover.
- **npm dependencies:** motion, next-themes

**File: `registry/magicui/magic-card.tsx`**

```tsx
"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

interface MagicCardBaseProps {
  children?: React.ReactNode
  className?: string
  gradientSize?: number
  gradientFrom?: string
  gradientTo?: string
}

interface MagicCardGradientProps extends MagicCardBaseProps {
  mode?: "gradient"

  gradientColor?: string
  gradientOpacity?: number

  glowFrom?: never
  glowTo?: never
  glowAngle?: never
  glowSize?: never
  glowBlur?: never
  glowOpacity?: never
}

interface MagicCardOrbProps extends MagicCardBaseProps {
  mode: "orb"

  glowFrom?: string
  glowTo?: string
  glowAngle?: number
  glowSize?: number
  glowBlur?: number
  glowOpacity?: number

  gradientColor?: never
  gradientOpacity?: never
}

type MagicCardProps = MagicCardGradientProps | MagicCardOrbProps
type ResetReason = "enter" | "leave" | "global" | "init"

function isOrbMode(props: MagicCardProps): props is MagicCardOrbProps {
  return props.mode === "orb"
}

export function MagicCard(props: MagicCardProps) {
  const {
    children,
    className,
    gradientSize = 200,
    gradientColor = "#262626",
    gradientOpacity = 0.8,
    gradientFrom = "#9E7AFF",
    gradientTo = "#FE8BBB",
    mode = "gradient",
  } = props

  const glowFrom = isOrbMode(props) ? (props.glowFrom ?? "#ee4f27") : "#ee4f27"
  const glowTo = isOrbMode(props) ? (props.glowTo ?? "#6b21ef") : "#6b21ef"
  const glowAngle = isOrbMode(props) ? (props.glowAngle ?? 90) : 90
  const glowSize = isOrbMode(props) ? (props.glowSize ?? 420) : 420
  const glowBlur = isOrbMode(props) ? (props.glowBlur ?? 60) : 60
  const glowOpacity = isOrbMode(props) ? (props.glowOpacity ?? 0.9) : 0.9
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDarkTheme = useMemo(() => {
    if (!mounted) return true
    const currentTheme = theme === "system" ? systemTheme : theme
    return currentTheme === "dark"
  }, [theme, systemTheme, mounted])

  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)

  const orbX = useSpring(mouseX, { stiffness: 250, damping: 30, mass: 0.6 })
  const orbY = useSpring(mouseY, { stiffness: 250, damping: 30, mass: 0.6 })
  const orbVisible = useSpring(0, { stiffness: 300, damping: 35 })

  const modeRef = useRef(mode)
  const glowOpacityRef = useRef(glowOpacity)
  const gradientSizeRef = useRef(gradientSize)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    glowOpacityRef.current = glowOpacity
  }, [glowOpacity])

  useEffect(() => {
    gradientSizeRef.current = gradientSize
  }, [gradientSize])

  const reset = useCallback(
    (reason: ResetReason = "leave") => {
      const currentMode = modeRef.current

      if (currentMode === "orb") {
        if (reason === "enter") orbVisible.set(glowOpacityRef.current)
        else orbVisible.set(0)
        return
      }

      const off = -gradientSizeRef.current
      mouseX.set(off)
      mouseY.set(off)
    },
    [mouseX, mouseY, orbVisible]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY]
  )

  useEffect(() => {
    reset("init")
  }, [reset])

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) reset("global")
    }
    const handleBlur = () => reset("global")
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") reset("global")
    }

    window.addEventListener("pointerout", handleGlobalPointerOut)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.removeEventListener("pointerout", handleGlobalPointerOut)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [reset])

  return (
    <motion.div
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit] border border-transparent",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => reset("leave")}
      onPointerEnter={() => reset("enter")}
      style={{
        background: useMotionTemplate`
          linear-gradient(var(--color-background) 0 0) padding-box,
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
            ${gradientFrom},
            ${gradientTo},
            var(--color-border) 100%
          ) border-box
        `,
      }}
    >
      <div className="bg-background absolute inset-px z-20 rounded-[inherit]" />

      {mode === "gradient" && (
        <motion.div
          suppressHydrationWarning
          className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
                ${gradientColor},
                transparent 100%
              )
            `,
            opacity: gradientOpacity,
          }}
        />
      )}

      {mode === "orb" && (
        <motion.div
          suppressHydrationWarning
          aria-hidden="true"
          className="pointer-events-none absolute z-30"
          style={{
            width: glowSize,
            height: glowSize,
            x: orbX,
            y: orbY,
            translateX: "-50%",
            translateY: "-50%",
            borderRadius: 9999,
            filter: `blur(${glowBlur}px)`,
            opacity: orbVisible,
            background: `linear-gradient(${glowAngle}deg, ${glowFrom}, ${glowTo})`,

            mixBlendMode: isDarkTheme ? "screen" : "multiply",
            willChange: "transform, opacity",
          }}
        />
      )}
      <div className="relative z-40">{children}</div>
    </motion.div>
  )
}
```

---

### Neon Gradient Card

- **Slug:** `neon-gradient-card`
- **URL:** https://magicui.design/docs/components/neon-gradient-card
- **Registry JSON:** https://magicui.design/r/neon-gradient-card.json
- **Description:** A beautiful neon card effect
- **npm dependencies:** none

**File: `registry/magicui/neon-gradient-card.tsx`**

```tsx
"use client"

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

interface NeonColorsProps {
  firstColor: string
  secondColor: string
}

interface NeonGradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * @default <div />
   * @type ReactElement
   * @description
   * The component to be rendered as the card
   * */
  as?: ReactElement
  /**
   * @default ""
   * @type string
   * @description
   * The className of the card
   */
  className?: string

  /**
   * @default ""
   * @type ReactNode
   * @description
   * The children of the card
   * */
  children?: ReactNode

  /**
   * @default 5
   * @type number
   * @description
   * The size of the border in pixels
   * */
  borderSize?: number

  /**
   * @default 20
   * @type number
   * @description
   * The size of the radius in pixels
   * */
  borderRadius?: number

  /**
   * @default "{ firstColor: '#ff00aa', secondColor: '#00FFF1' }"
   * @type string
   * @description
   * The colors of the neon gradient
   * */
  neonColors?: NeonColorsProps
}

export const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  className,
  children,
  borderSize = 2,
  borderRadius = 20,
  neonColors = {
    firstColor: "#ff00aa",
    secondColor: "#00FFF1",
  },
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        setDimensions({ width: offsetWidth, height: offsetHeight })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current
      setDimensions({ width: offsetWidth, height: offsetHeight })
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      style={
        {
          "--border-size": `${borderSize}px`,
          "--border-radius": `${borderRadius}px`,
          "--neon-first-color": neonColors.firstColor,
          "--neon-second-color": neonColors.secondColor,
          "--card-width": `${dimensions.width}px`,
          "--card-height": `${dimensions.height}px`,
          "--card-content-radius": `${borderRadius - borderSize}px`,
          "--pseudo-element-background-image": `linear-gradient(0deg, ${neonColors.firstColor}, ${neonColors.secondColor})`,
          "--pseudo-element-width": `${dimensions.width + borderSize * 2}px`,
          "--pseudo-element-height": `${dimensions.height + borderSize * 2}px`,
          "--after-blur": `${dimensions.width / 3}px`,
        } as CSSProperties
      }
      className={cn(
        "relative z-10 size-full rounded-(--border-radius)",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative size-full min-h-[inherit] rounded-(--card-content-radius) bg-gray-100 p-6",
          "before:absolute before:-top-(--border-size) before:-left-(--border-size) before:-z-10 before:block",
          "before:h-(--pseudo-element-height) before:w-(--pseudo-element-width) before:rounded-(--border-radius) before:content-['']",
          "before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] before:bg-size-[100%_200%]",
          "before:animate-background-position-spin",
          "after:absolute after:-top-(--border-size) after:-left-(--border-size) after:-z-10 after:block",
          "after:h-(--pseudo-element-height) after:w-(--pseudo-element-width) after:rounded-(--border-radius) after:blur-(--after-blur) after:content-['']",
          "after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] after:bg-size-[100%_200%] after:opacity-80",
          "after:animate-background-position-spin",
          "dark:bg-neutral-900",
          "wrap-break-word"
        )}
      >
        {children}
      </div>
    </div>
  )
}
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-background-position-spin": "background-position-spin 3000ms infinite alternate"
    }
  },
  "css": {
    "@keyframes background-position-spin": {
      "0%": {
        "background-position": "top center"
      },
      "100%": {
        "background-position": "bottom center"
      }
    }
  }
}
```

---

### Pulsating Button

- **Slug:** `pulsating-button`
- **URL:** https://magicui.design/docs/components/pulsating-button
- **Registry JSON:** https://magicui.design/r/pulsating-button.json
- **Description:** An animated pulsating button useful for capturing attention of users.
- **npm dependencies:** none

**File: `registry/magicui/pulsating-button.tsx`**

```tsx
"use client"

import React, { useImperativeHandle, useLayoutEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface PulsatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string
  duration?: string
  distance?: string
  variant?: "pulse" | "ripple"
}

export const PulsatingButton = React.forwardRef<
  HTMLButtonElement,
  PulsatingButtonProps
>(
  (
    {
      className,
      children,
      pulseColor,
      duration = "1.5s",
      distance = "8px",
      variant = "pulse",
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLButtonElement>(null)
    useImperativeHandle(ref, () => innerRef.current!)

    useLayoutEffect(() => {
      const button = innerRef.current
      if (!button) return

      if (pulseColor) {
        button.style.removeProperty("--bg")
        return
      }

      let animationFrameId = 0
      let currentBg = ""

      const updateBg = () => {
        animationFrameId = 0

        const nextBg = getComputedStyle(button).backgroundColor
        if (nextBg === currentBg) return

        currentBg = nextBg
        button.style.setProperty("--bg", nextBg)
      }

      const scheduleBgUpdate = () => {
        if (animationFrameId) return
        animationFrameId = window.requestAnimationFrame(updateBg)
      }

      updateBg()

      const themeObserver = new MutationObserver(scheduleBgUpdate)
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      })

      const buttonObserver = new MutationObserver(scheduleBgUpdate)
      buttonObserver.observe(button, {
        attributes: true,
      })

      const syncEvents = [
        "blur",
        "focus",
        "pointerenter",
        "pointerleave",
      ] as const

      for (const eventName of syncEvents) {
        button.addEventListener(eventName, scheduleBgUpdate)
      }

      return () => {
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId)
        }

        themeObserver.disconnect()
        buttonObserver.disconnect()

        for (const eventName of syncEvents) {
          button.removeEventListener(eventName, scheduleBgUpdate)
        }
      }
    }, [pulseColor])

    return (
      <button
        ref={innerRef}
        className={cn(
          "bg-primary text-primary-foreground relative flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-center",
          className
        )}
        style={
          {
            ...(pulseColor && { "--pulse-color": pulseColor }),
            "--duration": duration,
            "--distance": distance,
          } as React.CSSProperties
        }
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-inherit",
            variant === "pulse" ? "animate-pulse" : "animate-pulse-ripple"
          )}
        />
      </button>
    )
  }
)

PulsatingButton.displayName = "PulsatingButton"
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-pulse": "pulse var(--duration) ease-out infinite",
      "animate-pulse-ripple": "pulse-ripple var(--duration) cubic-bezier(0.16, 1, 0.3, 1) infinite"
    }
  },
  "css": {
    "@keyframes pulse": {
      "0%, 100%": {
        "boxShadow": "0 0 0 0 var(--pulse-color, oklch(from var(--bg) l c h / 0.5))"
      },
      "50%": {
        "boxShadow": "0 0 0 var(--distance) var(--pulse-color, oklch(from var(--bg) l c h / 0.5))"
      }
    },
    "@keyframes pulse-ripple": {
      "0%": {
        "boxShadow": "0 0 0 0 oklch(from var(--pulse-color, var(--bg)) l c h / 1)"
      },
      "100%": {
        "boxShadow": "0 0 0 var(--distance) oklch(from var(--pulse-color, var(--bg)) l c h / 0)"
      }
    }
  }
}
```

---

### Rainbow Button

- **Slug:** `rainbow-button`
- **URL:** https://magicui.design/docs/components/rainbow-button
- **Registry JSON:** https://magicui.design/r/rainbow-button.json
- **Description:** An animated button with a rainbow effect.
- **npm dependencies:** none

**File: `registry/magicui/rainbow-button.tsx`**

```tsx
import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const rainbowButtonVariants = cva(
  cn(
    "relative cursor-pointer group transition-all animate-rainbow",
    "inline-flex items-center justify-center gap-2 shrink-0",
    "rounded-sm outline-none focus-visible:ring-[3px] aria-invalid:border-destructive",
    "text-sm font-medium whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default:
          "border-0 bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-primary-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.125rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] before:bg-[length:200%] before:[filter:blur(0.75rem)] dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
        outline:
          "border border-input border-b-transparent bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] bg-[length:200%] text-accent-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] before:bg-[length:200%] before:[filter:blur(0.75rem)] dark:bg-[linear-gradient(#0a0a0a,#0a0a0a),linear-gradient(#0a0a0a_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-xl px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface RainbowButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rainbowButtonVariants> {
  asChild?: boolean
}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        data-slot="button"
        className={cn(rainbowButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

RainbowButton.displayName = "RainbowButton"

export { RainbowButton, rainbowButtonVariants, type RainbowButtonProps }
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-rainbow": "rainbow var(--speed, 2s) infinite linear"
    },
    "light": {
      "color-1": "oklch(66.2% 0.225 25.9)",
      "color-2": "oklch(60.4% 0.26 302)",
      "color-3": "oklch(69.6% 0.165 251)",
      "color-4": "oklch(80.2% 0.134 225)",
      "color-5": "oklch(90.7% 0.231 133)"
    },
    "dark": {
      "color-1": "oklch(66.2% 0.225 25.9)",
      "color-2": "oklch(60.4% 0.26 302)",
      "color-3": "oklch(69.6% 0.165 251)",
      "color-4": "oklch(80.2% 0.134 225)",
      "color-5": "oklch(90.7% 0.231 133)"
    }
  },
  "css": {
    "@keyframes rainbow": {
      "0%": {
        "background-position": "0%"
      },
      "100%": {
        "background-position": "200%"
      }
    }
  }
}
```

---

### Ripple Button

- **Slug:** `ripple-button`
- **URL:** https://magicui.design/docs/components/ripple-button
- **Registry JSON:** https://magicui.design/r/ripple-button.json
- **Description:** An animated button with ripple useful for user engagement.
- **npm dependencies:** none

**File: `registry/magicui/ripple-button.tsx`**

```tsx
"use client"

import React, { useEffect, useState, type MouseEvent } from "react"

import { cn } from "@/lib/utils"

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string
  duration?: string
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(
  (
    {
      className,
      children,
      rippleColor = "#ffffff",
      duration = "600ms",
      onClick,
      ...props
    },
    ref
  ) => {
    const [buttonRipples, setButtonRipples] = useState<
      Array<{ x: number; y: number; size: number; key: number }>
    >([])

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      createRipple(event)
      onClick?.(event)
    }

    const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const newRipple = { x, y, size, key: Date.now() }
      setButtonRipples((prevRipples) => [...prevRipples, newRipple])
    }

    useEffect(() => {
      let timeout: ReturnType<typeof setTimeout> | null = null

      if (buttonRipples.length > 0) {
        const lastRipple = buttonRipples[buttonRipples.length - 1]
        timeout = setTimeout(() => {
          setButtonRipples((prevRipples) =>
            prevRipples.filter((ripple) => ripple.key !== lastRipple.key)
          )
        }, parseInt(duration))
      }

      return () => {
        if (timeout !== null) {
          clearTimeout(timeout)
        }
      }
    }, [buttonRipples, duration])

    return (
      <button
        className={cn(
          "bg-background text-primary relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 px-4 py-2 text-center",
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <span className="pointer-events-none absolute inset-0">
          {buttonRipples.map((ripple) => (
            <span
              className="animate-rippling bg-background absolute rounded-full opacity-30"
              key={ripple.key}
              style={
                {
                  width: `${ripple.size}px`,
                  height: `${ripple.size}px`,
                  top: `${ripple.y}px`,
                  left: `${ripple.x}px`,
                  backgroundColor: rippleColor,
                  transform: `scale(0)`,
                  "--duration": duration,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      </button>
    )
  }
)

RippleButton.displayName = "RippleButton"
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-rippling": "rippling var(--duration) ease-out"
    }
  },
  "css": {
    "@keyframes rippling": {
      "0%": {
        "opacity": "1"
      },
      "100%": {
        "transform": "scale(2)",
        "opacity": "0"
      }
    }
  }
}
```

---

### Shimmer Button

- **Slug:** `shimmer-button`
- **URL:** https://magicui.design/docs/components/shimmer-button
- **Registry JSON:** https://magicui.design/r/shimmer-button.json
- **Description:** A button with a shimmering light which travels around the perimeter.
- **npm dependencies:** none

**File: `registry/magicui/shimmer-button.tsx`**

```tsx
import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/10 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "@container-[size] absolute inset-0 overflow-visible"
          )}
        >
          {/* spark */}
          <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
        {children}

        {/* Highlight */}
        <div
          className={cn(
            "absolute inset-0 size-full",

            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",

            // transition
            "transform-gpu transition-all duration-300 ease-in-out",

            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",

            // on click
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
          )}
        />
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
      "animate-spin-around": "spin-around calc(var(--speed) * 2) infinite linear"
    }
  },
  "css": {
    "@keyframes shimmer-slide": {
      "to": {
        "transform": "translate(calc(100cqw - 100%), 0)"
      }
    },
    "@keyframes spin-around": {
      "0%": {
        "transform": "translateZ(0) rotate(0)"
      },
      "15%, 35%": {
        "transform": "translateZ(0) rotate(90deg)"
      },
      "65%, 85%": {
        "transform": "translateZ(0) rotate(270deg)"
      },
      "100%": {
        "transform": "translateZ(0) rotate(360deg)"
      }
    }
  }
}
```

---

### Shine Border

- **Slug:** `shine-border`
- **URL:** https://magicui.design/docs/components/shine-border
- **Registry JSON:** https://magicui.design/r/shine-border.json
- **Description:** Shine border is an animated background border effect.
- **npm dependencies:** none

**File: `registry/magicui/shine-border.tsx`**

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[]
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className,
  style,
  ...props
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "motion-safe:animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]",
        className
      )}
      {...props}
    />
  )
}
```

**Tailwind theme / keyframes additions (from registry JSON, verbatim):**

```json
{
  "cssVars": {
    "theme": {
      "animate-shine": "shine var(--duration) infinite linear"
    }
  },
  "css": {
    "@keyframes shine": {
      "0%": {
        "background-position": "0% 0%"
      },
      "50%": {
        "background-position": "100% 100%"
      },
      "to": {
        "background-position": "0% 0%"
      }
    }
  }
}
```

---

### Shiny Button

- **Slug:** `shiny-button`
- **URL:** https://magicui.design/docs/components/shiny-button
- **Registry JSON:** https://magicui.design/r/shiny-button.json
- **Description:** A shiny button component with dynamic styles in the dark mode or light mode.
- **npm dependencies:** motion

**File: `registry/magicui/shiny-button.tsx`**

```tsx
"use client"

import React from "react"
import { motion, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

const animationProps: MotionProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
}

interface ShinyButtonProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  children: React.ReactNode
  className?: string
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative cursor-pointer rounded-lg border px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,var(--primary)/10%_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_var(--primary)/10%]",
        className
      )}
      {...animationProps}
      {...props}
    >
      <span
        className="relative block size-full text-sm tracking-wide text-[rgb(0,0,0,65%)] uppercase dark:font-light dark:text-[rgb(255,255,255,90%)]"
        style={{
          maskImage:
            "linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          WebkitMask:
            "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          backgroundImage:
            "linear-gradient(-75deg,var(--primary)/10% calc(var(--x)+20%),var(--primary)/50% calc(var(--x)+25%),var(--primary)/10% calc(var(--x)+100%))",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] p-px"
      />
    </motion.button>
  )
})

ShinyButton.displayName = "ShinyButton"
```

---
