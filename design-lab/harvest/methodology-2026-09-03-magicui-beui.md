# Component harvest — MagicUI + beUI

Harvested verbatim from https://magicui.design and https://beui.dev registry JSON endpoints (`/r/<name>.json`), which mirror the docs pages' source tabs exactly. Fetched via curl, no browser rendering involved.

## MagicUI component list

Enumerated live from https://magicui.design/docs/components (all `/docs/components/<slug>` links on the page):

```
android, animated-beam, animated-circular-progress-bar, animated-gradient-text, animated-grid-pattern, animated-list, animated-shiny-text, animated-theme-toggler, aurora-text, avatar-circles, backlight, bento-grid, blur-fade, border-beam, code-comparison, comic-text, confetti, cool-mode, dia-text-reveal, dock, dot-pattern, dotted-map, file-tree, flickering-grid, glare-hover, globe, glyph-matrix, grid-pattern, hero-video-dialog, hexagon-pattern, highlighter, hyper-text, icon-cloud, interactive-grid-pattern, interactive-hover-button, iphone, kinetic-text, lens, light-rays, line-shadow-text, magic-card, marquee, meteors, morphing-text, neon-gradient-card, noise-texture, number-ticker, orbiting-circles, particles, pixel-image, pointer, progressive-blur, pulsating-button, rainbow-button, retro-grid, ripple, ripple-button, safari, scroll-based-velocity, scroll-progress, shimmer-button, shine-border, shiny-button, smooth-cursor, sparkles-text, spinning-text, striped-pattern, terminal, text-3d-flip, text-animate, text-reveal, tweet-card, typing-animation, video-text, warp-background, word-rotate
```

## beui component list

Enumerated live from https://beui.dev/components (all `/components/<category>/<slug>` links on the page), grouped by the site's own categories (Agents, Blocks, Motion):

```
Agents: agent-activity, ai-sidebar, approval-card, chat-app, citations, code-block, file-diff, image-generation, loading-states, message, message-bubble, message-scroller, prompt-input, streaming-response, todo-list, tool-approval, tool-result
Blocks: availability-scheduler, bloom-menu, command-palette, dynamic-island, expandable-action-bar, expandable-tabs, feedback-widget, file-upload, infinite-masonry, knockout-bracket, morphing-search, morphing-tabs, not-found, notification-stack, otp-input, overflow-actions, prediction-market, project-folder, signup-form, swap, swipeable-list, wallet-card
Motion: action-swap, adaptive-stepper, animated-badge, animated-sidebar, animated-toast-stack, bottom-sheet, bounce-sidebar, bouncy-accordion, button, center-morph-modal, checkbox, combobox, context-menu, cylinder-carousel, dock, drawer, expandable-control, expanding-arrow-button, file-tree, input, loader, marquee, morphing-modal, multi-select, number (-> registry slugs animated-number / number-ticker), popover, preview-rail, pull-to-refresh, radio, range-slider, scroll-animation, select, shader-background, shared-layout-bg, switch, table, tabs, text-animation, theme-toggle, tilt-card, tooltip, wheel-picker
```

## MagicUI / Bento Grid

Source page: https://magicui.design/docs/components/bento-grid

_Bento grid is a layout used to showcase the features of a product in a simple and elegant way._

### Source

`registry/magicui/bento-grid.tsx` (registry:ui)

```tsx
import { type ComponentPropsWithoutRef, type ReactNode } from "react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className: string
  background: ReactNode
  Icon: React.ElementType
  description: string
  href: string
  cta: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "dark:bg-background transform-gpu dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:[border:1px_solid_rgba(255,255,255,.1)]",
      className
    )}
    {...props}
  >
    <div>{background}</div>
    <div className="p-4">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-lg text-neutral-400">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:hidden"
        )}
      >
        <Button
          variant="link"
          asChild
          size="sm"
          className="pointer-events-auto p-0"
        >
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
      )}
    >
      <Button
        variant="link"
        asChild
        size="sm"
        className="pointer-events-auto p-0"
      >
        <a href={href}>
          {cta}
          <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
        </a>
      </Button>
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/3 group-hover:dark:bg-neutral-800/10" />
  </div>
)

export { BentoCard, BentoGrid }
```

### Dependencies

- npm: @radix-ui/react-icons
- registry: button

### Notes
bento grid / proof cards archetype

## MagicUI / Marquee

Source page: https://magicui.design/docs/components/marquee

_An infinite scrolling component that can be used to display text, images, or videos._

### Source

`registry/magicui/marquee.tsx` (registry:ui)

```tsx
import { type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  )
}
```

### Dependencies

- none declared

### Notes
marquee / logo row archetype

## MagicUI / Number Ticker

Source page: https://magicui.design/docs/components/number-ticker

_Animate numbers to count up or down to a target number_

### Source

`registry/magicui/number-ticker.tsx` (registry:ui)

```tsx
"use client"

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
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
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : startValue)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value)
      }, delay * 1000)
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer)
      }
    }
  }, [motionValue, isInView, delay, value, direction, startValue])

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)))
        }
      }),
    [springValue, decimalPlaces]
  )

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tracking-wider text-black tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {startValue}
    </span>
  )
}
```

### Dependencies

- npm: motion

### Notes
stat / number / metric display archetype

## MagicUI / Dot Pattern

Source page: https://magicui.design/docs/components/dot-pattern

_A background dot pattern made with SVGs, fully customizable using Tailwind CSS._

### Source

`registry/magicui/dot-pattern.tsx` (registry:ui)

```tsx
"use client"

import React, { useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 *  DotPattern Component Props
 *
 * @param {number} [width=16] - The horizontal spacing between dots
 * @param {number} [height=16] - The vertical spacing between dots
 * @param {number} [x=0] - The x-offset of the entire pattern
 * @param {number} [y=0] - The y-offset of the entire pattern
 * @param {number} [cx=1] - The x-offset of individual dots
 * @param {number} [cy=1] - The y-offset of individual dots
 * @param {number} [cr=1] - The radius of each dot
 * @param {string} [className] - Additional CSS classes to apply to the SVG container
 * @param {boolean} [glow=false] - Whether dots should have a glowing animation effect
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
  [key: string]: unknown
}

/**
 * DotPattern Component
 *
 * A React component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 *
 * @component
 *
 * @see DotPatternProps for the props interface.
 *
 * @example
 * // Basic usage
 * <DotPattern />
 *
 * // With glowing effect and custom spacing
 * <DotPattern
 *   width={20}
 *   height={20}
 *   glow={true}
 *   className="opacity-50"
 * />
 *
 * @notes
 * - The component is client-side only ("use client")
 * - Automatically responds to container size changes
 * - When glow is enabled, dots will animate with random delays and durations
 * - Uses Motion for animations
 * - Dots color can be controlled via the text color utility classes
 */

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const dots = Array.from(
    {
      length:
        Math.ceil(dimensions.width / width) *
        Math.ceil(dimensions.height / height),
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width)
      const row = Math.floor(i / Math.ceil(dimensions.width / width))
      return {
        x: col * width + cx + x,
        y: row * height + cy + y,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      }
    }
  )

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        className
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          initial={glow ? { opacity: 0.4, scale: 1 } : {}}
          animate={
            glow
              ? {
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.5, 1],
                }
              : {}
          }
          transition={
            glow
              ? {
                  duration: dot.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: dot.delay,
                  ease: "easeInOut",
                }
              : {}
          }
        />
      ))}
    </svg>
  )
}
```

### Dependencies

- none declared

### Notes
dotted background pattern archetype

## MagicUI / Grid Pattern

Source page: https://magicui.design/docs/components/grid-pattern

_A background grid pattern made with SVGs, fully customizable using Tailwind CSS._

### Source

`registry/magicui/grid-pattern.tsx` (registry:ui)

```tsx
import { useId } from "react"

import { cn } from "@/lib/utils"

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  squares?: Array<[x: number, y: number]>
  strokeDasharray?: string
  className?: string
  [key: string]: unknown
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  squares,
  className,
  ...props
}: GridPatternProps) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width - 1}
              height={height - 1}
              x={x * width + 1}
              y={y * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
```

### Dependencies

- none declared

### Notes
grid background pattern archetype

## MagicUI / Interactive Grid Pattern

Source page: https://magicui.design/docs/components/interactive-grid-pattern

_A interactive background grid pattern made with SVGs, fully customizable using Tailwind CSS._

### Source

`registry/magicui/interactive-grid-pattern.tsx` (registry:ui)

```tsx
"use client"

import React, { useState } from "react"

import { cn } from "@/lib/utils"

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param width - The width of each square.
 * @param height - The height of each square.
 * @param squares - The number of squares in the grid. The first element is the number of horizontal squares, and the second element is the number of vertical squares.
 * @param className - The class name of the grid.
 * @param squaresClassName - The class name of the squares.
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  squares?: [number, number] // [horizontal, vertical]
  className?: string
  squaresClassName?: string
}

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null)

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        "absolute inset-0 h-full w-full border border-gray-400/30",
        className
      )}
      {...props}
    >
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width
        const y = Math.floor(index / horizontal) * height
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              "stroke-gray-400/30 transition-all duration-100 ease-in-out not-[&:hover]:duration-1000",
              hoveredSquare === index ? "fill-gray-300/30" : "fill-transparent",
              squaresClassName
            )}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        )
      })}
    </svg>
  )
}
```

### Dependencies

- none declared

### Notes
grid background pattern archetype, interactive variant

## MagicUI / Animated Grid Pattern

Source page: https://magicui.design/docs/components/animated-grid-pattern

_A animated background grid pattern made with SVGs, fully customizable using Tailwind CSS._

### Source

`registry/magicui/animated-grid-pattern.tsx` (registry:ui)

```tsx
"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"svg"> {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: number
  numSquares?: number
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
}

type Square = {
  id: number
  pos: [number, number]
  iteration: number
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [squares, setSquares] = useState<Array<Square>>([])

  const getPos = useCallback((): [number, number] => {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ]
  }, [dimensions.height, dimensions.width, height, width])

  const generateSquares = useCallback(
    (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(),
        iteration: 0,
      }))
    },
    [getPos]
  )

  const updateSquarePosition = useCallback(
    (squareId: number) => {
      setSquares((currentSquares) => {
        const current = currentSquares[squareId]
        if (!current || current.id !== squareId) return currentSquares

        const nextSquares = currentSquares.slice()
        nextSquares[squareId] = {
          ...current,
          pos: getPos(),
          iteration: current.iteration + 1,
        }

        return nextSquares
      })
    },
    [getPos]
  )

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares))
    }
  }, [dimensions.width, dimensions.height, generateSquares, numSquares])

  useEffect(() => {
    const element = containerRef.current
    let resizeObserver: ResizeObserver | null = null

    if (element) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setDimensions((currentDimensions) => {
            const nextWidth = entry.contentRect.width
            const nextHeight = entry.contentRect.height
            if (
              currentDimensions.width === nextWidth &&
              currentDimensions.height === nextHeight
            ) {
              return currentDimensions
            }
            return { width: nextWidth, height: nextHeight }
          })
        }
      })

      resizeObserver.observe(element)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id, iteration }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: "reverse",
              repeatDelay,
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            key={`${id}-${iteration}`}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  )
}
```

### Dependencies

- npm: motion

### Notes
grid background pattern archetype, animated variant

## MagicUI / Border Beam

Source page: https://magicui.design/docs/components/border-beam

_An animated beam of light which travels along the border of its container._

### Source

`registry/magicui/border-beam.tsx` (registry:ui)

```tsx
"use client"

import { motion, type MotionStyle, type Transition } from "motion/react"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number
  /**
   * The duration of the border beam.
   */
  duration?: number
  /**
   * The delay of the border beam.
   */
  delay?: number
  /**
   * The color of the border beam from.
   */
  colorFrom?: string
  /**
   * The color of the border beam to.
   */
  colorTo?: string
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition
  /**
   * The class name of the border beam.
   */
  className?: string
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number
  /**
   * The border width of the beam.
   */
  borderWidth?: number
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={
        {
          "--border-beam-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
    >
      <motion.div
        className={cn(
          "absolute aspect-square",
          "bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  )
}
```

### Dependencies

- npm: motion

### Notes
hairline/beam divider archetype

## MagicUI / Animated List

Source page: https://magicui.design/docs/components/animated-list

_A list that animates each item in sequence with a delay. Used to showcase notifications or events on your landing page._

### Source

`registry/magicui/animated-list.tsx` (registry:ui)

```tsx
"use client"

import React, {
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
} from "react"
import { AnimatePresence, motion, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations: MotionProps = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 },
  }

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  )
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
  delay?: number
}

export const AnimatedList = React.memo(
  ({ children, className, delay = 1000, ...props }: AnimatedListProps) => {
    const [index, setIndex] = useState(0)
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children]
    )

    useEffect(() => {
      let timeout: ReturnType<typeof setTimeout> | null = null

      if (index < childrenArray.length - 1) {
        timeout = setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length)
        }, delay)
      }

      return () => {
        if (timeout !== null) {
          clearTimeout(timeout)
        }
      }
    }, [index, delay, childrenArray.length])

    const itemsToShow = useMemo(() => {
      const result = childrenArray.slice(0, index + 1).reverse()
      return result
    }, [index, childrenArray])

    return (
      <div
        className={cn(`flex flex-col items-center gap-4`, className)}
        {...props}
      >
        <AnimatePresence>
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as React.ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedList.displayName = "AnimatedList"
```

### Dependencies

- npm: motion

### Notes
sequenced list, adjacent to steps/process archetype

## MagicUI / Magic Card

Source page: https://magicui.design/docs/components/magic-card

_A spotlight effect that follows your mouse cursor and highlights borders on hover._

### Source

`registry/magicui/magic-card.tsx` (registry:ui)

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

### Dependencies

- npm: motion, next-themes

### Notes
card hover / proof card archetype

## MagicUI / Avatar Circles

Source page: https://magicui.design/docs/components/avatar-circles

_Overlapping circles of avatars._

### Source

`registry/magicui/avatar-circles.tsx` (registry:ui)

```tsx
"use client"

import { cn } from "@/lib/utils"

interface Avatar {
  imageUrl: string
  profileUrl: string
}
interface AvatarCirclesProps {
  className?: string
  numPeople?: number
  avatarUrls: Avatar[]
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            key={index}
            className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
            src={url.imageUrl}
            width={40}
            height={40}
            alt={`Avatar ${index + 1}`}
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
          href=""
        >
          +{numPeople}
        </a>
      )}
    </div>
  )
}
```

### Dependencies

- none declared

### Notes
badge/pill-adjacent, avatar stack

## MagicUI / Shine Border

Source page: https://magicui.design/docs/components/shine-border

_Shine border is an animated background border effect._

### Source

`registry/magicui/shine-border.tsx` (registry:ui)

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

### Dependencies

- none declared

### Notes
hairline border/divider archetype

## MagicUI / Neon Gradient Card

Source page: https://magicui.design/docs/components/neon-gradient-card

_A beautiful neon card effect_

### Source

`registry/magicui/neon-gradient-card.tsx` (registry:ui)

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

### Dependencies

- none declared

### Notes
card hover / proof card archetype

## MagicUI / Retro Grid

Source page: https://magicui.design/docs/components/retro-grid

_An animated scrolling retro grid effect_

### Source

`registry/magicui/retro-grid.tsx` (registry:ui)

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties, HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const ANIMATION_DURATION_SECONDS = 15
const GRID_HEIGHT_RATIO = 3
const GRID_LINE_ALIGNMENT_OFFSET_PX = 0.5
const GRID_LINE_ANTIALIAS_MULTIPLIER = 0.9
const GRID_LINE_WIDTH_PX = 0.92
const GRID_START_OFFSET_RATIO = -0.5
const GRID_WIDTH_RATIO = 6
const GRID_X_OFFSET_RATIO = -2
const MAX_ANGLE = 89
const MAX_DEVICE_PIXEL_RATIO = 2
const MIN_ANGLE = 1
const PERSPECTIVE_PX = 200
const FALLBACK_ANIMATION_NAME = "retro-grid-fallback-scroll"
const FALLBACK_STYLES = `
@keyframes ${FALLBACK_ANIMATION_NAME} {
  from {
    transform: translateY(-50%);
  }

  to {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-retro-grid-scroll="true"] {
    animation: none !important;
    transform: translateY(-50%) !important;
  }
}
`

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER_SOURCE = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 u_container_size;
uniform vec2 u_viewport_size;
uniform vec4 u_line_color;
uniform float u_angle;
uniform float u_cell_size;
uniform float u_device_pixel_ratio;
uniform float u_time;

const float animationDurationSeconds = ${ANIMATION_DURATION_SECONDS.toFixed(1)};
const float gridHeightRatio = ${GRID_HEIGHT_RATIO.toFixed(1)};
const float gridStartOffsetRatio = ${GRID_START_OFFSET_RATIO.toFixed(1)};
const float gridWidthRatio = ${GRID_WIDTH_RATIO.toFixed(1)};
const float gridXOffsetRatio = ${GRID_X_OFFSET_RATIO.toFixed(1)};
const float gridLineAlignmentOffsetPx = ${GRID_LINE_ALIGNMENT_OFFSET_PX.toFixed(1)};
const float gridLineAntialiasMultiplier = ${GRID_LINE_ANTIALIAS_MULTIPLIER.toFixed(1)};
const float horizontalLodLevelOneEndPx = 5.6;
const float horizontalLodLevelOneStartPx = 2.8;
const float horizontalLodLevelTwoEndPx = 3.0;
const float horizontalLodLevelTwoStartPx = 1.4;
const float horizontalCompressionEndPx = 2.8;
const float horizontalCompressionStartPx = 1.2;
const float lineWidthPx = ${GRID_LINE_WIDTH_PX.toFixed(2)};
const float perspectivePx = ${PERSPECTIVE_PX.toFixed(1)};
const float gridTravelRatio = 0.5;
const float verticalCompressionEndPx = 2.6;
const float verticalCompressionStartPx = 1.0;
const float verticalEdgeCompressionEnd = 0.95;
const float verticalEdgeCompressionStart = 0.45;
const float verticalLodLevelEnd = 0.64;
const float verticalLodLevelStart = 0.22;
const float verticalTopCompressionEndCells = 6.0;
const float verticalTopCompressionStartCells = 2.0;

float renderGridLine(
  float wrappedCoord,
  float antiAliasWidth,
  float softnessBoost
) {
  return 1.0 - smoothstep(
    lineWidthPx,
    lineWidthPx + (antiAliasWidth * (1.5 + softnessBoost)),
    wrappedCoord
  );
}

void main() {
  float angle = radians(clamp(u_angle, 1.0, 89.0));
  float sinAngle = sin(angle);
  float cosAngle = cos(angle);
  vec2 screen = vec2(
    (gl_FragCoord.x / u_device_pixel_ratio) - (u_container_size.x * 0.5),
    (u_container_size.y * 0.5) - (gl_FragCoord.y / u_device_pixel_ratio)
  );

  vec3 rayOrigin = vec3(0.0, 0.0, perspectivePx);
  vec3 rayDirection = normalize(vec3(screen, -perspectivePx));
  vec3 planeXAxis = vec3(1.0, 0.0, 0.0);
  vec3 planeYAxis = vec3(0.0, cosAngle, sinAngle);
  vec3 planeNormal = normalize(cross(planeXAxis, planeYAxis));
  float denominator = dot(rayDirection, planeNormal);

  if (abs(denominator) < 0.0001) {
    discard;
  }

  float distanceToPlane = dot(-rayOrigin, planeNormal) / denominator;

  if (distanceToPlane <= 0.0) {
    discard;
  }

  vec3 hitPoint = rayOrigin + (rayDirection * distanceToPlane);
  float localX = hitPoint.x;
  float localY = dot(hitPoint, planeYAxis);
  float gridWidth = u_viewport_size.x * gridWidthRatio;
  float gridHeight = u_viewport_size.y * gridHeightRatio;
  float gridScrollSpeed = (gridHeight * gridTravelRatio) / animationDurationSeconds;
  float patternOffsetY = u_time * gridScrollSpeed;
  float gridLeft = (-0.5 * u_container_size.x) + (gridXOffsetRatio * u_container_size.x);
  float gridTop = (-0.5 * u_container_size.y) + (gridStartOffsetRatio * gridHeight);
  vec2 planePosition = vec2(localX - gridLeft, localY - gridTop);

  if (
    planePosition.x < 0.0 ||
    planePosition.y < 0.0 ||
    planePosition.x > gridWidth ||
    planePosition.y > gridHeight
  ) {
    discard;
  }

  vec2 patternPosition = vec2(planePosition.x, planePosition.y - patternOffsetY);
  vec2 wrapped = mod(
    patternPosition + vec2(gridLineAlignmentOffsetPx),
    u_cell_size
  );
  vec2 patternDerivative = max(fwidth(patternPosition), vec2(0.0001));
  vec2 antiAliasWidth = patternDerivative * gridLineAntialiasMultiplier;
  float horizontalCellSpanPx = u_cell_size / patternDerivative.y;
  float horizontalCompression = 1.0 - smoothstep(
    horizontalCompressionStartPx,
    horizontalCompressionEndPx,
    horizontalCellSpanPx
  );
  float verticalCellSpanPx = u_cell_size / patternDerivative.x;
  float sideDistance = abs((planePosition.x / gridWidth) * 2.0 - 1.0);
  float verticalEdgeCompression = smoothstep(
    verticalEdgeCompressionStart,
    verticalEdgeCompressionEnd,
    sideDistance
  );
  float verticalTopCompression = 1.0 - smoothstep(
    u_cell_size * verticalTopCompressionStartCells,
    u_cell_size * verticalTopCompressionEndCells,
    planePosition.y
  );
  float verticalCompression =
    (1.0 - smoothstep(
      verticalCompressionStartPx,
      verticalCompressionEndPx,
      verticalCellSpanPx
    )) * verticalEdgeCompression * verticalTopCompression;
  float horizontalSoftnessBoost = 1.0 + (horizontalCompression * 3.0);
  float verticalSoftnessBoost = 1.0 + (verticalCompression * 3.5);
  float verticalLod = smoothstep(
    verticalLodLevelStart,
    verticalLodLevelEnd,
    verticalCompression
  );
  float verticalLineFine = renderGridLine(
    wrapped.x,
    antiAliasWidth.x,
    verticalSoftnessBoost
  );
  float verticalWrappedLod = mod(
    patternPosition.x + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float verticalLineCoarse = renderGridLine(
    verticalWrappedLod,
    antiAliasWidth.x,
    verticalSoftnessBoost + verticalLod
  );
  float verticalLine = max(
    verticalLineFine * (1.0 - verticalLod),
    verticalLineCoarse * verticalLod
  );
  float horizontalLodLevelOne = 1.0 - smoothstep(
    horizontalLodLevelOneStartPx,
    horizontalLodLevelOneEndPx,
    horizontalCellSpanPx
  );
  float horizontalLodLevelTwo = 1.0 - smoothstep(
    horizontalLodLevelTwoStartPx,
    horizontalLodLevelTwoEndPx,
    horizontalCellSpanPx
  );
  float horizontalLineFine = renderGridLine(
    wrapped.y,
    antiAliasWidth.y,
    horizontalSoftnessBoost
  );
  float horizontalWrappedLodOne = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float horizontalWrappedLodTwo = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 4.0
  );
  float horizontalLineCoarse = renderGridLine(
    horizontalWrappedLodOne,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne
  );
  float horizontalLineExtraCoarse = renderGridLine(
    horizontalWrappedLodTwo,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne + horizontalLodLevelTwo
  );
  float horizontalLineReduced = max(
    horizontalLineFine * (1.0 - horizontalLodLevelOne),
    horizontalLineCoarse * horizontalLodLevelOne
  );
  float horizontalLine = max(
    horizontalLineReduced * (1.0 - horizontalLodLevelTwo),
    horizontalLineExtraCoarse * horizontalLodLevelTwo
  );
  float line = max(verticalLine, horizontalLine);

  if (line <= 0.001) {
    discard;
  }

  float alpha = u_line_color.a * line;
  gl_FragColor = vec4(u_line_color.rgb * alpha, alpha);
}
`

interface RetroGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes to apply to the grid container
   */
  className?: string
  /**
   * Rotation angle of the grid in degrees
   * @default 65
   */
  angle?: number
  /**
   * Grid cell size in pixels
   * @default 60
   */
  cellSize?: number
  /**
   * Grid opacity value between 0 and 1
   * @default 0.5
   */
  opacity?: number
  /**
   * Grid line color in light mode
   * @default "gray"
   */
  lightLineColor?: string
  /**
   * Grid line color in dark mode
   * @default "gray"
   */
  darkLineColor?: string
}

interface ProgramInfo {
  attributeLocation: number
  program: WebGLProgram
  uniforms: {
    angle: WebGLUniformLocation
    cellSize: WebGLUniformLocation
    containerSize: WebGLUniformLocation
    devicePixelRatio: WebGLUniformLocation
    lineColor: WebGLUniformLocation
    time: WebGLUniformLocation
    viewportSize: WebGLUniformLocation
  }
}

let colorResolveContext: CanvasRenderingContext2D | null | undefined

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)

  if (!shader) {
    return null
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }

  gl.deleteShader(shader)
  return null
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    FRAGMENT_SHADER_SOURCE
  )

  if (!vertexShader || !fragmentShader) {
    return null
  }

  const program = gl.createProgram()

  if (!program) {
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    return null
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program
  }

  gl.deleteProgram(program)
  return null
}

function getProgramInfo(
  gl: WebGLRenderingContext,
  program: WebGLProgram
): ProgramInfo | null {
  const attributeLocation = gl.getAttribLocation(program, "a_position")
  const angle = gl.getUniformLocation(program, "u_angle")
  const cellSize = gl.getUniformLocation(program, "u_cell_size")
  const containerSize = gl.getUniformLocation(program, "u_container_size")
  const devicePixelRatio = gl.getUniformLocation(
    program,
    "u_device_pixel_ratio"
  )
  const lineColor = gl.getUniformLocation(program, "u_line_color")
  const time = gl.getUniformLocation(program, "u_time")
  const viewportSize = gl.getUniformLocation(program, "u_viewport_size")

  if (
    attributeLocation < 0 ||
    !angle ||
    !cellSize ||
    !containerSize ||
    !devicePixelRatio ||
    !lineColor ||
    !time ||
    !viewportSize
  ) {
    return null
  }

  return {
    attributeLocation,
    program,
    uniforms: {
      angle,
      cellSize,
      containerSize,
      devicePixelRatio,
      lineColor,
      time,
      viewportSize,
    },
  }
}

function isDarkMode(colorScheme: MediaQueryList) {
  const root = document.documentElement

  if (root.classList.contains("dark")) {
    return true
  }

  if (root.classList.contains("light")) {
    return false
  }

  return colorScheme.matches
}

function getColorResolveContext() {
  if (colorResolveContext !== undefined) {
    return colorResolveContext
  }

  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  colorResolveContext = canvas.getContext("2d", {
    willReadFrequently: true,
  })

  return colorResolveContext
}

function resolveLineColor(color: string, element: HTMLElement) {
  const resolver = document.createElement("span")
  resolver.style.color = color
  resolver.style.opacity = "0"
  resolver.style.pointerEvents = "none"
  resolver.style.position = "absolute"
  element.appendChild(resolver)

  const resolvedColor = getComputedStyle(resolver).color
  resolver.remove()
  const context = getColorResolveContext()

  if (!context) {
    return new Float32Array([0.5, 0.5, 0.5, 1])
  }

  context.clearRect(0, 0, 1, 1)
  context.fillStyle = resolvedColor
  context.fillRect(0, 0, 1, 1)
  const pixel = context.getImageData(0, 0, 1, 1).data

  return new Float32Array([
    pixel[0] / 255,
    pixel[1] / 255,
    pixel[2] / 255,
    pixel[3] / 255,
  ])
}

function createFallbackGridStyle(
  cellSize: number,
  lineColor: string
): CSSProperties {
  return {
    animation: `${FALLBACK_ANIMATION_NAME} ${ANIMATION_DURATION_SECONDS}s linear infinite`,
    backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 0), linear-gradient(to bottom, ${lineColor} 1px, transparent 0)`,
    backgroundRepeat: "repeat",
    backgroundSize: `${cellSize}px ${cellSize}px`,
    transform: "translateY(-50%)",
  }
}

export function RetroGrid({
  className,
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
  style,
  ...props
}: RetroGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isWebGlReady, setIsWebGlReady] = useState(false)
  const angleRef = useRef(angle)
  const cellSizeRef = useRef(cellSize)
  const darkLineColorRef = useRef(darkLineColor)
  const lightLineColorRef = useRef(lightLineColor)
  const syncSceneRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    angleRef.current = angle
    cellSizeRef.current = cellSize
    darkLineColorRef.current = darkLineColor
    lightLineColorRef.current = lightLineColor
    syncSceneRef.current?.()
  }, [angle, cellSize, darkLineColor, lightLineColor])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) {
      return
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)")

    let animationFrameId: number | null = null
    let currentWidth = 0
    let currentHeight = 0
    let currentDevicePixelRatio = 1
    let gl: WebGLRenderingContext | null = null
    let isVisible = true
    let isContextLost = false
    let lineColor = resolveLineColor(lightLineColorRef.current, container)
    let positionBuffer: WebGLBuffer | null = null
    let programInfo: ProgramInfo | null = null

    const getContext = () => {
      const nextGl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      })

      if (!nextGl || !nextGl.getExtension("OES_standard_derivatives")) {
        return null
      }

      return nextGl
    }

    const releasePipeline = (shouldDeleteResources: boolean) => {
      if (shouldDeleteResources && gl) {
        if (positionBuffer) {
          gl.deleteBuffer(positionBuffer)
        }

        if (programInfo) {
          gl.deleteProgram(programInfo.program)
        }
      }

      positionBuffer = null
      programInfo = null

      if (shouldDeleteResources) {
        gl = null
      }
    }

    const initializePipeline = () => {
      const nextGl = getContext()

      if (!nextGl) {
        releasePipeline(false)
        return false
      }

      gl = nextGl
      releasePipeline(true)
      gl = nextGl

      const program = createProgram(nextGl)

      if (!program) {
        return false
      }

      const nextProgramInfo = getProgramInfo(nextGl, program)

      if (!nextProgramInfo) {
        nextGl.deleteProgram(program)
        return false
      }

      const nextPositionBuffer = nextGl.createBuffer()

      if (!nextPositionBuffer) {
        nextGl.deleteProgram(program)
        return false
      }

      nextGl.bindBuffer(nextGl.ARRAY_BUFFER, nextPositionBuffer)
      nextGl.bufferData(
        nextGl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        nextGl.STATIC_DRAW
      )

      positionBuffer = nextPositionBuffer
      programInfo = nextProgramInfo

      return true
    }

    const updateLineColor = () => {
      const activeColor = isDarkMode(colorScheme)
        ? darkLineColorRef.current
        : lightLineColorRef.current
      lineColor = resolveLineColor(activeColor, container)
    }

    const resizeCanvas = () => {
      currentWidth = Math.floor(container.clientWidth)
      currentHeight = Math.floor(container.clientHeight)

      if (currentWidth === 0 || currentHeight === 0 || !gl) {
        return
      }

      currentDevicePixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO
      )

      canvas.width = Math.floor(currentWidth * currentDevicePixelRatio)
      canvas.height = Math.floor(currentHeight * currentDevicePixelRatio)
      canvas.style.width = `${currentWidth}px`
      canvas.style.height = `${currentHeight}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const draw = (timestamp: number) => {
      if (
        currentWidth === 0 ||
        currentHeight === 0 ||
        !gl ||
        !positionBuffer ||
        !programInfo ||
        isContextLost
      ) {
        return
      }

      gl.useProgram(programInfo.program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(programInfo.attributeLocation)
      gl.vertexAttribPointer(
        programInfo.attributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      )
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(
        programInfo.uniforms.angle,
        clamp(angleRef.current, MIN_ANGLE, MAX_ANGLE)
      )
      gl.uniform1f(
        programInfo.uniforms.cellSize,
        Math.max(cellSizeRef.current, 1)
      )
      gl.uniform2f(
        programInfo.uniforms.containerSize,
        currentWidth,
        currentHeight
      )
      gl.uniform1f(
        programInfo.uniforms.devicePixelRatio,
        currentDevicePixelRatio
      )
      gl.uniform4fv(programInfo.uniforms.lineColor, lineColor)
      gl.uniform1f(
        programInfo.uniforms.time,
        reducedMotion.matches ? 0 : timestamp / 1000
      )
      gl.uniform2f(
        programInfo.uniforms.viewportSize,
        window.innerWidth,
        window.innerHeight
      )
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const stopAnimation = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }

    const frame = (timestamp: number) => {
      draw(timestamp)

      if (!reducedMotion.matches && isVisible) {
        animationFrameId = requestAnimationFrame(frame)
        return
      }

      animationFrameId = null
    }

    const syncScene = () => {
      if (isContextLost) {
        stopAnimation()
        setIsWebGlReady(false)
        return
      }

      if (!gl || !positionBuffer || !programInfo) {
        if (!initializePipeline()) {
          stopAnimation()
          setIsWebGlReady(false)
          return
        }
      }

      resizeCanvas()

      if (currentWidth === 0 || currentHeight === 0) {
        stopAnimation()
        return
      }

      updateLineColor()
      draw(performance.now())
      setIsWebGlReady(true)

      if (reducedMotion.matches || !isVisible) {
        stopAnimation()
        return
      }

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(frame)
      }
    }

    syncSceneRef.current = syncScene

    const resizeObserver = new ResizeObserver(() => {
      syncScene()
    })
    resizeObserver.observe(container)

    const handleWindowResize = () => {
      syncScene()
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false

      if (isVisible) {
        syncScene()
        return
      }

      stopAnimation()
    })
    intersectionObserver.observe(container)

    const themeObserver = new MutationObserver(() => {
      syncScene()
    })
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    })

    const handleMotionChange = () => {
      syncScene()
    }

    const handleColorSchemeChange = () => {
      syncScene()
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      isContextLost = true
      stopAnimation()
      releasePipeline(false)
      setIsWebGlReady(false)
    }

    const handleContextRestored = () => {
      isContextLost = false
      syncScene()
    }

    reducedMotion.addEventListener("change", handleMotionChange)
    colorScheme.addEventListener("change", handleColorSchemeChange)
    window.addEventListener("resize", handleWindowResize)
    canvas.addEventListener("webglcontextlost", handleContextLost)
    canvas.addEventListener("webglcontextrestored", handleContextRestored)

    syncScene()

    return () => {
      stopAnimation()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      themeObserver.disconnect()
      reducedMotion.removeEventListener("change", handleMotionChange)
      colorScheme.removeEventListener("change", handleColorSchemeChange)
      window.removeEventListener("resize", handleWindowResize)
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
      syncSceneRef.current = null
      releasePipeline(!isContextLost)
    }
  }, [])

  const gridStyles = {
    ...style,
    opacity,
  } as CSSProperties
  const normalizedAngle = clamp(angle, MIN_ANGLE, MAX_ANGLE)
  const normalizedCellSize = Math.max(cellSize, 1)
  const fallbackProjectionStyles = {
    perspective: `${PERSPECTIVE_PX}px`,
  } as CSSProperties
  const fallbackRotationStyles = {
    transform: `rotateX(${normalizedAngle}deg)`,
  } as CSSProperties
  const lightFallbackGridStyles = createFallbackGridStyle(
    normalizedCellSize,
    lightLineColor
  )
  const darkFallbackGridStyles = createFallbackGridStyle(
    normalizedCellSize,
    darkLineColor
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden",
        className
      )}
      style={gridStyles}
      {...props}
    >
      <style>{FALLBACK_STYLES}</style>
      {!isWebGlReady ? (
        <div className="absolute inset-0" style={fallbackProjectionStyles}>
          <div className="absolute inset-0" style={fallbackRotationStyles}>
            <div
              data-retro-grid-scroll="true"
              className="absolute inset-[0%_0px] ml-[-200%] h-[300vh] w-[600vw] origin-[100%_0_0] dark:hidden"
              style={lightFallbackGridStyles}
            />
            <div
              data-retro-grid-scroll="true"
              className="absolute inset-[0%_0px] ml-[-200%] hidden h-[300vh] w-[600vw] origin-[100%_0_0] dark:block"
              style={darkFallbackGridStyles}
            />
          </div>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 size-full",
          isWebGlReady ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-linear-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}
```

### Dependencies

- none declared

### Notes
grid background pattern archetype

## MagicUI / Warp Background

Source page: https://magicui.design/docs/components/warp-background

_A card with a time warping background effect._

### Source

`registry/magicui/warp-background.tsx` (registry:ui)

```tsx
"use client"

import React, { useCallback, useMemo, type HTMLAttributes } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDelayMax?: number
  beamDelayMin?: number
  beamDuration?: number
  gridColor?: string
}

const Beam = ({
  width,
  x,
  delay,
  duration,
}: {
  width: string | number
  x: string | number
  delay: number
  duration: number
}) => {
  const hue = Math.floor(Math.random() * 360)
  const ar = Math.floor(Math.random() * 10) + 1

  return (
    <motion.div
      style={
        {
          "--x": `${x}`,
          "--width": `${width}`,
          "--aspect-ratio": `${ar}`,
          "--background": `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
        } as React.CSSProperties
      }
      className={`absolute top-0 left-(--x) aspect-[1/var(--aspect-ratio)] w-(--width) [background:var(--background)]`}
      initial={{ y: "100cqmax", x: "-50%" }}
      animate={{ y: "-100%", x: "-50%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = "var(--border)",
  ...props
}) => {
  const generateBeams = useCallback(() => {
    const beams = []
    const cellsPerSide = Math.floor(100 / beamSize)
    const step = cellsPerSide / beamsPerSide

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step)
      const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin
      beams.push({ x, delay })
    }
    return beams
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin])

  const topBeams = useMemo(() => generateBeams(), [generateBeams])
  const rightBeams = useMemo(() => generateBeams(), [generateBeams])
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams])
  const leftBeams = useMemo(() => generateBeams(), [generateBeams])

  return (
    <div className={cn("relative rounded border p-20", className)} {...props}>
      <div
        style={
          {
            "--perspective": `${perspective}px`,
            "--grid-color": gridColor,
            "--beam-size": `${beamSize}%`,
          } as React.CSSProperties
        }
        className={
          "@container-[size] pointer-events-none absolute top-0 left-0 size-full overflow-hidden [clipPath:inset(0)] perspective-(--perspective) transform-3d"
        }
      >
        {/* top side */}
        <div className="@container absolute z-20 h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {topBeams.map((beam, index) => (
            <Beam
              key={`top-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>
        {/* bottom side */}
        <div className="@container absolute top-full h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {bottomBeams.map((beam, index) => (
            <Beam
              key={`bottom-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>
        {/* left side */}
        <div className="@container absolute top-0 left-0 h-[100cqmax] w-[100cqh] origin-[0%_0%] transform-[rotate(90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {leftBeams.map((beam, index) => (
            <Beam
              key={`left-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>
        {/* right side */}
        <div className="@container absolute top-0 right-0 h-[100cqmax] w-[100cqh] origin-[100%_0%] transform-[rotate(-90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {rightBeams.map((beam, index) => (
            <Beam
              key={`right-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
```

### Dependencies

- npm: motion

### Notes
background pattern archetype

## MagicUI / Code Comparison

Source page: https://magicui.design/docs/components/code-comparison

_A component which compares two code snippets._

### Source

`registry/magicui/code-comparison.tsx` (registry:ui)

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import {
  transformerNotationDiff,
  transformerNotationFocus,
} from "@shikijs/transformers"
import { FileIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

interface CodeComparisonProps {
  beforeCode: string
  afterCode: string
  language: string
  filename: string
  lightTheme: string
  darkTheme: string
  highlightColor?: string
}

export function CodeComparison({
  beforeCode,
  afterCode,
  language,
  filename,
  lightTheme,
  darkTheme,
  highlightColor = "#ff3333",
}: CodeComparisonProps) {
  const { theme, systemTheme } = useTheme()
  const [highlightedBefore, setHighlightedBefore] = useState("")
  const [highlightedAfter, setHighlightedAfter] = useState("")
  const [hasLeftFocus, setHasLeftFocus] = useState(false)
  const [hasRightFocus, setHasRightFocus] = useState(false)

  const selectedTheme = useMemo(() => {
    const currentTheme = theme === "system" ? systemTheme : theme
    return currentTheme === "dark" ? darkTheme : lightTheme
  }, [theme, systemTheme, darkTheme, lightTheme])

  useEffect(() => {
    if (highlightedBefore || highlightedAfter) {
      setHasLeftFocus(highlightedBefore.includes('class="line focused"'))
      setHasRightFocus(highlightedAfter.includes('class="line focused"'))
    }
  }, [highlightedBefore, highlightedAfter])

  useEffect(() => {
    async function highlightCode() {
      try {
        const { codeToHtml } = await import("shiki")
        const { transformerNotationHighlight } =
          await import("@shikijs/transformers")

        const before = await codeToHtml(beforeCode, {
          lang: language,
          theme: selectedTheme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
            transformerNotationDiff({ matchAlgorithm: "v3" }),
            transformerNotationFocus({ matchAlgorithm: "v3" }),
          ],
        })
        const after = await codeToHtml(afterCode, {
          lang: language,
          theme: selectedTheme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
            transformerNotationDiff({ matchAlgorithm: "v3" }),
            transformerNotationFocus({ matchAlgorithm: "v3" }),
          ],
        })
        setHighlightedBefore(before)
        setHighlightedAfter(after)
      } catch (error) {
        console.error("Error highlighting code:", error)
        setHighlightedBefore(`<pre>${beforeCode}</pre>`)
        setHighlightedAfter(`<pre>${afterCode}</pre>`)
      }
    }
    highlightCode()
  }, [beforeCode, afterCode, language, selectedTheme])

  const renderCode = (code: string, highlighted: string) => {
    if (highlighted) {
      return (
        <div
          style={{ "--highlight-color": highlightColor } as React.CSSProperties}
          className={cn(
            "bg-background h-full w-full overflow-auto font-mono text-xs",
            "[&>pre]:h-full [&>pre]:w-screen! [&>pre]:py-2",
            "[&>pre>code]:inline-block! [&>pre>code]:w-full!",
            "[&>pre>code>span]:inline-block! [&>pre>code>span]:w-full [&>pre>code>span]:px-4 [&>pre>code>span]:py-0.5",
            "[&>pre>code>.highlighted]:inline-block [&>pre>code>.highlighted]:w-full [&>pre>code>.highlighted]:bg-(--highlight-color)!",
            "group-hover/left:[&>pre>code>:not(.focused)]:opacity-100! group-hover/left:[&>pre>code>:not(.focused)]:blur-none!",
            "group-hover/right:[&>pre>code>:not(.focused)]:opacity-100! group-hover/right:[&>pre>code>:not(.focused)]:blur-none!",
            "[&>pre>code>.add]:bg-[rgba(16,185,129,.16)] [&>pre>code>.remove]:bg-[rgba(244,63,94,.16)]",
            "group-hover/left:[&>pre>code>:not(.focused)]:transition-all group-hover/left:[&>pre>code>:not(.focused)]:duration-300",
            "group-hover/right:[&>pre>code>:not(.focused)]:transition-all group-hover/right:[&>pre>code>:not(.focused)]:duration-300"
          )}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )
    } else {
      return (
        <pre className="bg-background text-foreground h-full overflow-auto p-4 font-mono text-xs break-all">
          {code}
        </pre>
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="group border-border relative w-full overflow-hidden rounded-md border">
        <div className="relative grid md:grid-cols-2">
          <div
            className={cn(
              "leftside group/left border-primary/20 md:border-r",
              hasLeftFocus &&
                "[&>div>pre>code>:not(.focused)]:opacity-50! [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!",
              "[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300"
            )}
          >
            <div className="border-primary/20 bg-accent text-foreground flex items-center border-b p-2 text-sm">
              <FileIcon className="mr-2 h-4 w-4" />
              {filename}
              <span className="ml-auto hidden md:block">before</span>
            </div>
            {renderCode(beforeCode, highlightedBefore)}
          </div>
          <div
            className={cn(
              "rightside group/right border-primary/20 border-t md:border-t-0",
              hasRightFocus &&
                "[&>div>pre>code>:not(.focused)]:opacity-50! [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!",
              "[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300"
            )}
          >
            <div className="border-primary/20 bg-accent text-foreground flex items-center border-b p-2 text-sm">
              <FileIcon className="mr-2 h-4 w-4" />
              {filename}
              <span className="ml-auto hidden md:block">after</span>
            </div>
            {renderCode(afterCode, highlightedAfter)}
          </div>
        </div>
        <div className="border-primary/20 bg-accent text-foreground absolute top-1/2 left-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border text-xs md:flex">
          VS
        </div>
      </div>
    </div>
  )
}
```

### Dependencies

- npm: shiki, next-themes

### Notes
closest MagicUI has to a two-column comparison archetype (code-vs-code, not feature-vs-feature)

## MagicUI / Shiny Button

Source page: https://magicui.design/docs/components/shiny-button

_A shiny button component with dynamic styles in the dark mode or light mode._

### Source

`registry/magicui/shiny-button.tsx` (registry:ui)

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

### Dependencies

- npm: motion

### Notes
badge/pill-adjacent CTA

## MagicUI / interactive-hover-button

Source page: https://magicui.design/docs/components/interactive-hover-button

### Source

`registry/magicui/interactive-hover-button.tsx` (registry:ui)

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

### Dependencies

- none declared

### Notes
badge/pill-adjacent CTA

## MagicUI / Hero Video Dialog

Source page: https://magicui.design/docs/components/hero-video-dialog

_A hero video dialog component._

### Source

`registry/magicui/hero-video-dialog.tsx` (registry:ui)

```tsx
"use client"

import { useState } from "react"
import { Play, XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out"

interface HeroVideoProps {
  animationStyle?: AnimationStyle
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt?: string
  className?: string
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
}

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const selectedAnimation = animationVariants[animationStyle]

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Play video"
        className="group relative cursor-pointer border-0 bg-transparent p-0"
        onClick={() => setIsVideoOpen(true)}
      >
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt}
          width={1920}
          height={1080}
          className="w-full rounded-md border shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.8]"
        />
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
          <div className="bg-primary/10 flex size-28 items-center justify-center rounded-full backdrop-blur-md">
            <div
              className={`from-primary/30 to-primary relative flex size-20 scale-100 items-center justify-center rounded-full bg-linear-to-b shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]`}
            >
              <Play
                className="size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                }}
              />
            </div>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                setIsVideoOpen(false)
              }
            }}
            onClick={() => setIsVideoOpen(false)}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
            >
              <motion.button className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black">
                <XIcon className="size-5" />
              </motion.button>
              <div className="relative isolate z-1 size-full overflow-hidden rounded-2xl border-2 border-white">
                <iframe
                  src={videoSrc}
                  title="Hero Video player"
                  className="mt-0 size-full rounded-2xl"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Dependencies

- npm: motion

### Notes
proof card / bento-adjacent media card

## MagicUI / File Tree

Source page: https://magicui.design/docs/components/file-tree

_A component used to showcase the folder and file structure of a directory._

### Source

`registry/magicui/file-tree.tsx` (registry:ui)

```tsx
"use client"

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type TreeViewElement = {
  id: string
  name: string
  type?: "file" | "folder"
  isSelectable?: boolean
  children?: TreeViewElement[]
}

type TreeSortMode =
  | "default"
  | "none"
  | ((a: TreeViewElement, b: TreeViewElement) => number)

type TreeContextProps = {
  selectedId: string | undefined
  expandedItems: string[] | undefined
  indicator: boolean
  handleExpand: (id: string) => void
  selectItem: (id: string) => void
  setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  openIcon?: React.ReactNode
  closeIcon?: React.ReactNode
  direction: "rtl" | "ltr"
}

const TreeContext = createContext<TreeContextProps | null>(null)

const useTree = () => {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider")
  }
  return context
}

type Direction = "rtl" | "ltr" | undefined

const isFolderElement = (element: TreeViewElement) => {
  if (element.type) {
    return element.type === "folder"
  }

  return Array.isArray(element.children)
}

const mergeExpandedItems = (
  currentItems: string[] | undefined,
  nextItems: string[]
) => [...new Set([...(currentItems ?? []), ...nextItems])]

const treeCollator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
})

const defaultTreeComparator = (a: TreeViewElement, b: TreeViewElement) => {
  const aIsFolder = isFolderElement(a)
  const bIsFolder = isFolderElement(b)

  if (aIsFolder !== bIsFolder) {
    return aIsFolder ? -1 : 1
  }

  return treeCollator.compare(a.name, b.name)
}

const getTreeComparator = (sort: TreeSortMode) => {
  if (sort === "none") {
    return undefined
  }

  if (sort === "default") {
    return defaultTreeComparator
  }

  return sort
}

const sortTreeElements = (
  elements: TreeViewElement[],
  sort: TreeSortMode
): TreeViewElement[] => {
  const comparator = getTreeComparator(sort)

  const nextElements = elements.map((element) => {
    if (!Array.isArray(element.children)) {
      return element
    }

    return {
      ...element,
      children: sortTreeElements(element.children, sort),
    }
  })

  if (!comparator) {
    return nextElements
  }

  return [...nextElements].sort(comparator)
}

const renderTreeElements = (
  elements: TreeViewElement[],
  sort: TreeSortMode
): React.ReactNode =>
  sortTreeElements(elements, sort).map((element) => {
    if (isFolderElement(element)) {
      return (
        <Folder
          key={element.id}
          value={element.id}
          element={element.name}
          isSelectable={element.isSelectable}
        >
          {Array.isArray(element.children)
            ? renderTreeElements(element.children, sort)
            : null}
        </Folder>
      )
    }

    return (
      <File
        key={element.id}
        value={element.id}
        isSelectable={element.isSelectable}
      >
        <span>{element.name}</span>
      </File>
    )
  })

type TreeViewProps = {
  initialSelectedId?: string
  indicator?: boolean
  elements?: TreeViewElement[]
  initialExpandedItems?: string[]
  openIcon?: React.ReactNode
  closeIcon?: React.ReactNode
  sort?: TreeSortMode
} & Omit<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  "defaultValue" | "onValueChange" | "type" | "value"
>

const Tree = forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      className,
      elements,
      initialSelectedId,
      initialExpandedItems,
      children,
      indicator = true,
      openIcon,
      closeIcon,
      sort = "default",
      dir,
      ...props
    },
    ref
  ) => {
    const [selectedId, setSelectedId] = useState<string | undefined>(
      initialSelectedId
    )
    const [expandedItems, setExpandedItems] = useState<string[] | undefined>(
      initialExpandedItems
    )

    const selectItem = useCallback((id: string) => {
      setSelectedId(id)
    }, [])

    const handleExpand = useCallback((id: string) => {
      setExpandedItems((prev) => {
        if (prev?.includes(id)) {
          return prev.filter((item) => item !== id)
        }
        return [...(prev ?? []), id]
      })
    }, [])

    const expandSpecificTargetedElements = useCallback(
      (elements?: TreeViewElement[], selectId?: string) => {
        if (!elements || !selectId) return
        const findParent = (
          currentElement: TreeViewElement,
          currentPath: string[] = []
        ) => {
          const isSelectable = currentElement.isSelectable ?? true
          const newPath = [...currentPath, currentElement.id]
          if (currentElement.id === selectId) {
            if (isSelectable) {
              setExpandedItems((prev) => mergeExpandedItems(prev, newPath))
            } else {
              if (newPath.includes(currentElement.id)) {
                newPath.pop()
                setExpandedItems((prev) => mergeExpandedItems(prev, newPath))
              }
            }
            return
          }
          if (
            Array.isArray(currentElement.children) &&
            currentElement.children.length > 0
          ) {
            currentElement.children.forEach((child) => {
              findParent(child, newPath)
            })
          }
        }
        elements.forEach((element) => {
          findParent(element)
        })
      },
      []
    )

    useEffect(() => {
      if (initialSelectedId) {
        expandSpecificTargetedElements(elements, initialSelectedId)
      }
    }, [initialSelectedId, elements, expandSpecificTargetedElements])

    const direction = dir === "rtl" ? "rtl" : "ltr"
    const treeChildren =
      children ?? (elements ? renderTreeElements(elements, sort) : null)

    return (
      <TreeContext.Provider
        value={{
          selectedId,
          expandedItems,
          handleExpand,
          selectItem,
          setExpandedItems,
          indicator,
          openIcon,
          closeIcon,
          direction,
        }}
      >
        <div className={cn("size-full", className)}>
          <ScrollArea
            ref={ref}
            className="relative h-full px-2"
            dir={dir as Direction}
          >
            <AccordionPrimitive.Root
              {...props}
              type="multiple"
              value={expandedItems}
              className="flex flex-col gap-1"
              dir={dir as Direction}
            >
              {treeChildren}
            </AccordionPrimitive.Root>
          </ScrollArea>
        </div>
      </TreeContext.Provider>
    )
  }
)

Tree.displayName = "Tree"

const TreeIndicator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { direction } = useTree()

  return (
    <div
      dir={direction}
      ref={ref}
      className={cn(
        "bg-muted absolute left-1.5 h-full w-px rounded-md py-3 duration-300 ease-in-out hover:bg-slate-300 rtl:right-1.5",
        className
      )}
      {...props}
    />
  )
})

TreeIndicator.displayName = "TreeIndicator"

type FolderProps = {
  expandedItems?: string[]
  element: string
  isSelectable?: boolean
  isSelect?: boolean
} & React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>

const Folder = forwardRef<
  HTMLDivElement,
  FolderProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,
      element,
      value,
      isSelectable = true,
      isSelect,
      children,
      ...props
    },
    ref
  ) => {
    const {
      direction,
      handleExpand,
      expandedItems,
      indicator,
      selectedId,
      selectItem,
      openIcon,
      closeIcon,
    } = useTree()
    const isSelected = isSelect ?? selectedId === value

    return (
      <AccordionPrimitive.Item
        ref={ref}
        {...props}
        value={value}
        className="relative h-full overflow-hidden"
      >
        <AccordionPrimitive.Trigger
          className={cn(
            `flex items-center gap-1 rounded-md text-sm`,
            className,
            {
              "bg-muted rounded-md": isSelected && isSelectable,
              "cursor-pointer": isSelectable,
              "cursor-not-allowed opacity-50": !isSelectable,
            }
          )}
          disabled={!isSelectable}
          onClick={() => {
            selectItem(value)
            handleExpand(value)
          }}
        >
          {expandedItems?.includes(value)
            ? (openIcon ?? <FolderOpenIcon className="size-4" />)
            : (closeIcon ?? <FolderIcon className="size-4" />)}
          <span>{element}</span>
        </AccordionPrimitive.Trigger>
        <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down relative h-full overflow-hidden text-sm">
          {element && indicator && <TreeIndicator aria-hidden="true" />}
          <AccordionPrimitive.Root
            dir={direction}
            type="multiple"
            className="ml-5 flex flex-col gap-1 py-1 rtl:mr-5"
            value={expandedItems}
          >
            {children}
          </AccordionPrimitive.Root>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    )
  }
)

Folder.displayName = "Folder"

const File = forwardRef<
  HTMLButtonElement,
  {
    value: string
    handleSelect?: (id: string) => void
    isSelectable?: boolean
    isSelect?: boolean
    fileIcon?: React.ReactNode
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  (
    {
      value,
      className,
      handleSelect,
      onClick,
      isSelectable = true,
      isSelect,
      fileIcon,
      children,
      ...props
    },
    ref
  ) => {
    const { direction, selectedId, selectItem } = useTree()
    const isSelected = isSelect ?? selectedId === value
    return (
      <button
        ref={ref}
        type="button"
        disabled={!isSelectable}
        className={cn(
          "flex w-fit items-center gap-1 rounded-md pr-1 text-sm duration-200 ease-in-out rtl:pr-0 rtl:pl-1",
          {
            "bg-muted": isSelected && isSelectable,
          },
          isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
          direction === "rtl" ? "rtl" : "ltr",
          className
        )}
        onClick={(event) => {
          selectItem(value)
          handleSelect?.(value)
          onClick?.(event)
        }}
        {...props}
      >
        {fileIcon ?? <FileIcon className="size-4" />}
        {children}
      </button>
    )
  }
)

File.displayName = "File"

const CollapseButton = forwardRef<
  HTMLButtonElement,
  {
    elements: TreeViewElement[]
    expandAll?: boolean
  } & React.HTMLAttributes<HTMLButtonElement>
>(({ className, elements, expandAll = false, children, ...props }, ref) => {
  const { expandedItems, setExpandedItems } = useTree()

  const expendAllTree = useCallback((elements: TreeViewElement[]) => {
    const expandedElementIds: string[] = []

    const expandTree = (element: TreeViewElement) => {
      const isSelectable = element.isSelectable ?? true
      if (isSelectable && element.children && element.children.length > 0) {
        expandedElementIds.push(element.id)
        for (const child of element.children) {
          expandTree(child)
        }
      }
    }

    for (const element of elements) {
      expandTree(element)
    }

    return [...new Set(expandedElementIds)]
  }, [])

  const closeAll = useCallback(() => {
    setExpandedItems?.([])
  }, [setExpandedItems])

  useEffect(() => {
    if (expandAll) {
      setExpandedItems?.(expendAllTree(elements))
    }
  }, [expandAll, elements, expendAllTree, setExpandedItems])

  return (
    <Button
      variant={"ghost"}
      className={cn("absolute right-2 bottom-1 h-8 w-fit p-1", className)}
      onClick={
        expandedItems && expandedItems.length > 0
          ? closeAll
          : () => setExpandedItems?.(expendAllTree(elements))
      }
      ref={ref}
      {...props}
    >
      {children}
      <span className="sr-only">Toggle</span>
    </Button>
  )
})

CollapseButton.displayName = "CollapseButton"

export { CollapseButton, File, Folder, Tree, type TreeViewElement }
export type { TreeSortMode }
```

### Dependencies

- none declared

### Notes
expandable list archetype (tree, not accordion/FAQ)

## beUI / Adaptive Stepper

Source page: https://beui.dev/components/motion/adaptive-stepper

_Composable numeric stepper whose fixed footprint adapts at its minimum and maximum while the value rolls between steps._

### Source

`components/motion/adaptive-stepper.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/motion/adaptive-stepper

import { Minus, Plus } from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EASE_OUT,
  SPRING_PRESS,
} from "@/lib/ease";
import {
  Liquid,
  LiquidItem,
  type LiquidTransition,
} from "@/components/motion/liquid";
import { cn } from "@/lib/utils";

// The deliberately elastic separation curve from the liquid email reference.
const STEPPER_LIQUID_TRANSITION = {
  duration: 600,
  ease: [0.22, 1.3, 0.71, 1],
} as const satisfies LiquidTransition;

type StepDirection = -1 | 0 | 1;

type AdaptiveStepperContextValue = {
  value: number;
  valueText: string;
  direction: StepDirection;
  atMin: boolean;
  atMax: boolean;
  disabled: boolean;
  reduce: boolean;
  decrement: (restoreFocus: boolean) => void;
  increment: (restoreFocus: boolean) => void;
  decrementRef: React.MutableRefObject<HTMLButtonElement | null>;
  incrementRef: React.MutableRefObject<HTMLButtonElement | null>;
};

const AdaptiveStepperContext = createContext<AdaptiveStepperContextValue | null>(
  null,
);

function useAdaptiveStepperContext(component: string) {
  const context = useContext(AdaptiveStepperContext);
  if (!context) {
    throw new Error(`${component} must be used within <AdaptiveStepper>`);
  }
  return context;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cleanNumber(value: number) {
  return Number(value.toFixed(10));
}

function nextStep(
  value: number,
  direction: -1 | 1,
  min: number,
  max: number,
  step: number,
) {
  if (direction === 1) {
    const nextIndex = Math.floor((value - min) / step + 1e-10) + 1;
    return cleanNumber(Math.min(max, min + nextIndex * step));
  }

  const previousIndex = Math.ceil((value - min) / step - 1e-10) - 1;
  return cleanNumber(Math.max(min, min + previousIndex * step));
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

export interface AdaptiveStepperProps {
  children: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
  formatValueText?: (value: number) => string;
  className?: string;
  "aria-label"?: string;
}

export function AdaptiveStepper({
  children,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  disabled = false,
  name,
  formatValueText,
  className,
  "aria-label": ariaLabel = "Quantity",
}: AdaptiveStepperProps) {
  const reduce = useReducedMotion() ?? false;
  const labelId = useId();
  const decrementRef = useRef<HTMLButtonElement>(null);
  const incrementRef = useRef<HTMLButtonElement>(null);
  const lower = Number.isFinite(min) ? min : 0;
  const suppliedMax = Number.isFinite(max) ? max : lower;
  const upper = suppliedMax > lower ? suppliedMax : lower;
  const stride = Number.isFinite(step) && step > 0 ? step : 1;
  const [internalValue, setInternalValue] = useState(() =>
    clamp(Number.isFinite(defaultValue) ? defaultValue : lower, lower, upper),
  );
  const controlled = controlledValue !== undefined;
  const suppliedValue = controlled ? controlledValue : internalValue;
  const currentValue = clamp(
    Number.isFinite(suppliedValue) ? suppliedValue : lower,
    lower,
    upper,
  );
  const previousValueRef = useRef(currentValue);
  const currentValueRef = useRef(currentValue);
  const direction: StepDirection =
    currentValue === previousValueRef.current
      ? 0
      : currentValue > previousValueRef.current
        ? 1
        : -1;

  useLayoutEffect(() => {
    previousValueRef.current = currentValue;
    currentValueRef.current = currentValue;
  }, [currentValue]);

  const commit = useCallback(
    (nextValue: number, restoreFocus: boolean) => {
      const next = clamp(cleanNumber(nextValue), lower, upper);
      if (next === currentValue) return;
      if (!controlled) setInternalValue(next);
      onValueChange?.(next);

      if (!restoreFocus) return;
      requestAnimationFrame(() => {
        if (next === upper && currentValueRef.current === upper) {
          decrementRef.current?.focus();
        } else if (next === lower && currentValueRef.current === lower) {
          incrementRef.current?.focus();
        }
      });
    },
    [controlled, currentValue, lower, onValueChange, upper],
  );

  const decrement = useCallback(
    (restoreFocus: boolean) => {
      if (disabled || currentValue <= lower) return;
      commit(nextStep(currentValue, -1, lower, upper, stride), restoreFocus);
    },
    [commit, currentValue, disabled, lower, stride, upper],
  );

  const increment = useCallback(
    (restoreFocus: boolean) => {
      if (disabled || currentValue >= upper) return;
      commit(nextStep(currentValue, 1, lower, upper, stride), restoreFocus);
    },
    [commit, currentValue, disabled, lower, stride, upper],
  );

  const valueText = formatValueText?.(currentValue) ?? String(currentValue);
  const context = useMemo<AdaptiveStepperContextValue>(
    () => ({
      value: currentValue,
      valueText,
      direction,
      atMin: currentValue <= lower,
      atMax: currentValue >= upper,
      disabled,
      reduce,
      decrement,
      increment,
      decrementRef,
      incrementRef,
    }),
    [
      currentValue,
      decrement,
      direction,
      disabled,
      increment,
      lower,
      reduce,
      upper,
      valueText,
    ],
  );

  return (
    <AdaptiveStepperContext.Provider value={context}>
      <fieldset
        disabled={disabled}
        className={cn(
          "relative isolate m-0 inline-block h-12 w-[13.5rem] border-0 p-0",
          className,
        )}
      >
        <legend id={labelId} className="sr-only">
          {ariaLabel}. Current value: {valueText}
        </legend>
        <Liquid
          blur={8}
          contrast={22}
          fill="var(--background)"
          className="size-full"
        >
          {children}
        </Liquid>
        {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      </fieldset>
    </AdaptiveStepperContext.Provider>
  );
}

export interface AdaptiveStepperActionProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onClick"> {
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLButtonElement>;
}

function StepperAction({
  direction,
  children,
  className,
  onClick,
  ref,
  style,
  tabIndex,
  "aria-label": ariaLabel,
  ...props
}: AdaptiveStepperActionProps & { direction: -1 | 1 }) {
  const context = useAdaptiveStepperContext("AdaptiveStepper action");
  const hidden = direction === -1 ? context.atMin : context.atMax;
  const actionRef =
    direction === -1 ? context.decrementRef : context.incrementRef;
  const label =
    ariaLabel ?? (direction === -1 ? "Decrease value" : "Increase value");
  const action = direction === -1 ? context.decrement : context.increment;
  const x =
    direction === -1
      ? hidden
        ? 32
        : 0
      : hidden
        ? 136
        : 168;

  return (
    <LiquidItem
      x={x}
      y={0}
      width={48}
      height={48}
      radius={24}
      transition={STEPPER_LIQUID_TRANSITION}
    >
      <motion.button
        {...props}
        ref={mergeRefs(ref, actionRef)}
        type="button"
        aria-label={label}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : tabIndex}
        disabled={context.disabled || hidden}
        whileTap={
          context.reduce || context.disabled || hidden
            ? undefined
            : { scale: 0.94 }
        }
        transition={context.reduce ? { duration: 0 } : SPRING_PRESS}
        style={style}
        className={cn(
          "grid size-full place-items-center rounded-full border border-transparent bg-transparent bg-clip-padding text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none",
          hidden && "hover:bg-transparent",
          context.disabled && "opacity-50",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) action(event.detail === 0);
        }}
      >
        <motion.span
          aria-hidden="true"
          initial={{
            opacity: hidden ? 0 : 1,
            filter: hidden ? "blur(2px)" : "blur(0px)",
          }}
          animate={{
            opacity: hidden ? 0 : 1,
            filter: hidden ? "blur(2px)" : "blur(0px)",
          }}
          transition={{ duration: context.reduce ? 0 : 0.15, ease: EASE_OUT }}
        >
          {children ??
            (direction === -1 ? (
              <Minus className="size-5" strokeWidth={2.5} />
            ) : (
              <Plus className="size-5" strokeWidth={2.5} />
            ))}
        </motion.span>
      </motion.button>
    </LiquidItem>
  );
}

export function AdaptiveStepperDecrement(props: AdaptiveStepperActionProps) {
  return <StepperAction {...props} direction={-1} />;
}

export interface AdaptiveStepperValueProps
  extends Omit<HTMLMotionProps<"output">, "children"> {
  children?: ReactNode | ((value: number) => ReactNode);
}

export function AdaptiveStepperValue({
  children,
  className,
  style,
  ...props
}: AdaptiveStepperValueProps) {
  const context = useAdaptiveStepperContext("AdaptiveStepperValue");
  const geometry =
    context.atMin && context.atMax
      ? { x: 0, width: 216 }
      : context.atMin
        ? { x: 0, width: 152 }
        : context.atMax
          ? { x: 64, width: 152 }
          : { x: 64, width: 88 };
  const displayValue =
    typeof children === "function" ? children(context.value) : children;
  const renderedValue = displayValue ?? context.value;
  const canRoll =
    typeof renderedValue === "number" || typeof renderedValue === "string";
  const distance = context.reduce || !canRoll ? 0 : context.direction * 32;
  const enterFrom = `translateY(${distance}%)`;
  const exitTo = `translateY(${-distance}%)`;

  return (
    <LiquidItem
      x={geometry.x}
      y={0}
      width={geometry.width}
      height={48}
      radius={24}
      transition={STEPPER_LIQUID_TRANSITION}
    >
      <motion.output
        {...props}
        aria-live="polite"
        aria-atomic="true"
        style={style}
        className={cn(
          "flex size-full min-w-0 items-center justify-center overflow-hidden rounded-full border border-transparent bg-transparent bg-clip-padding px-4 text-lg font-semibold tabular-nums text-foreground",
          className,
        )}
      >
        <span className="sr-only">{context.valueText}</span>
        <span
          aria-hidden="true"
          className="relative grid min-h-[1.1em] min-w-[1ch] place-items-center overflow-hidden leading-none"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={context.value}
              initial={{
                opacity: context.reduce ? 1 : 0.35,
                filter: context.reduce ? "blur(0px)" : "blur(2px)",
                transform: enterFrom,
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                transform: "translateY(0%)",
              }}
              exit={{
                opacity: context.reduce ? 1 : 0,
                filter: context.reduce ? "blur(0px)" : "blur(2px)",
                transform: exitTo,
                transition: {
                  duration: context.reduce ? 0 : 0.12,
                  ease: EASE_OUT,
                },
              }}
              transition={{
                duration: context.reduce ? 0 : 0.18,
                ease: EASE_OUT,
              }}
              className="col-start-1 row-start-1 will-change-[transform,filter,opacity]"
            >
              {renderedValue}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.output>
    </LiquidItem>
  );
}

export function AdaptiveStepperIncrement(props: AdaptiveStepperActionProps) {
  return <StepperAction {...props} direction={1} />;
}
```

`components/motion/liquid.tsx` (registry:component)

```tsx
"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type LiquidContextValue = {
  getRoot: () => HTMLDivElement | null;
  getPortal: () => SVGGElement | null;
};

const LiquidContext = createContext<LiquidContextValue | null>(null);

function useLiquidContext() {
  const context = useContext(LiquidContext);
  if (!context) throw new Error("LiquidItem must be used within <Liquid>");
  return context;
}

export type LiquidEase = readonly [number, number, number, number];

export type LiquidTransition = {
  duration?: number;
  ease?: LiquidEase;
};

export interface LiquidProps extends HTMLAttributes<HTMLDivElement> {
  blur?: number;
  contrast?: number;
  fill?: string;
  edgeColor?: string;
  edgeOpacity?: number;
  edgeWidth?: number;
  filterPadding?: number;
}

export const Liquid = forwardRef<HTMLDivElement, LiquidProps>(function Liquid(
  {
    blur = 6,
    contrast = 18,
    fill = "var(--background)",
    edgeColor = "var(--foreground)",
    edgeOpacity = 0.08,
    edgeWidth = 1,
    filterPadding = 24,
    className,
    style,
    children,
    ...props
  },
  forwardedRef: Ref<HTMLDivElement>,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const filterId = `liquid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const intercept = Math.round((0.5 - contrast * (5 / 12)) * 100) / 100;
  const padding = Math.ceil(blur * 3 + filterPadding);

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const next = {
        width: root.offsetWidth,
        height: root.offsetHeight,
      };
      setSize((current) =>
        current.width === next.width && current.height === next.height
          ? current
          : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const context = useMemo<LiquidContextValue>(
    () => ({
      getRoot: () => rootRef.current,
      getPortal: () => portalRef.current,
    }),
    [],
  );

  return (
    <div
      {...props}
      ref={setRootRef}
      className={cn("relative isolate", className)}
      style={style}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible"
      >
        <defs>
          <filter
            id={filterId}
            x={-padding}
            y={-padding}
            width={size.width + padding * 2}
            height={size.height + padding * 2}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blur}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${intercept}`}
              result="goo"
            />
            <feComposite
              in="SourceGraphic"
              in2="goo"
              operator="atop"
              result="shape"
            />
            {edgeWidth > 0 ? (
              <>
                <feColorMatrix
                  in="shape"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -29.5"
                  result="solid-shape"
                />
                <feMorphology
                  in="solid-shape"
                  operator="erode"
                  radius={edgeWidth}
                  result="inset-shape"
                />
                <feComposite
                  in="solid-shape"
                  in2="inset-shape"
                  operator="out"
                  result="edge-mask"
                />
                <feFlood
                  floodColor={edgeColor}
                  floodOpacity={edgeOpacity}
                  result="edge-color"
                />
                <feComposite
                  in="edge-color"
                  in2="edge-mask"
                  operator="in"
                  result="edge"
                />
                <feMerge>
                  <feMergeNode in="shape" />
                  <feMergeNode in="edge" />
                </feMerge>
              </>
            ) : null}
          </filter>
        </defs>
        <g ref={portalRef} fill={fill} filter={`url(#${filterId})`} />
      </svg>
      <LiquidContext.Provider value={context}>
        {children}
      </LiquidContext.Provider>
    </div>
  );
});

type LiquidBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

export interface LiquidItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  transition?: LiquidTransition;
}

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function cubicBezier([x1, y1, x2, y2]: LiquidEase) {
  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    let lower = 0;
    let upper = 1;
    for (let index = 0; index < 20; index++) {
      const time = (lower + upper) / 2;
      const inverse = 1 - time;
      const x =
        3 * inverse * inverse * time * x1 +
        3 * inverse * time * time * x2 +
        time ** 3;
      if (x < progress) lower = time;
      else upper = time;
    }

    const time = (lower + upper) / 2;
    const inverse = 1 - time;
    return (
      3 * inverse * inverse * time * y1 +
      3 * inverse * time * time * y2 +
      time ** 3
    );
  };
}

export function LiquidItem({
  children,
  x,
  y,
  width,
  height,
  radius = Math.min(width, height) / 2,
  transition,
  className,
  style,
  ...props
}: LiquidItemProps) {
  const context = useLiquidContext();
  const reduce = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [blob, setBlob] = useState<SVGRectElement | null>(null);
  const currentRef = useRef<LiquidBox | null>(null);
  const duration = reduce ? 0 : (transition?.duration ?? 280);
  const ease = transition?.ease ?? EASE_OUT;
  const [x1, y1, x2, y2] = ease;

  useLayoutEffect(() => {
    const portal = context.getPortal();
    if (!portal) return;

    const blob = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    blob.setAttribute("x", "0");
    blob.setAttribute("y", "0");
    blob.style.transformBox = "fill-box";
    blob.style.transformOrigin = "center";
    blob.style.willChange = "transform";
    portal.append(blob);
    setBlob(blob);

    return () => {
      blob.remove();
    };
  }, [context]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !blob || !context.getRoot()) return;

    const target = { x, y, width, height, radius };
    const write = (box: LiquidBox) => {
      // Keep the interactive surface and its filtered silhouette on the same
      // frame so neither can visually outrun the other during a morph.
      const transform = `translate(${box.x}px, ${box.y}px)`;
      wrapper.style.transform = transform;
      wrapper.style.width = `${box.width}px`;
      wrapper.style.height = `${box.height}px`;
      blob.style.transform = transform;
      blob.setAttribute("width", String(box.width));
      blob.setAttribute("height", String(box.height));
      blob.setAttribute("rx", String(box.radius));
    };

    const from = currentRef.current;
    if (!from || duration === 0) {
      currentRef.current = target;
      write(target);
      return;
    }

    const easing = cubicBezier([x1, y1, x2, y2]);
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easing(progress);
      const current = {
        x: mix(from.x, target.x, eased),
        y: mix(from.y, target.y, eased),
        width: mix(from.width, target.width, eased),
        height: mix(from.height, target.height, eased),
        radius: mix(from.radius, target.radius, eased),
      };
      currentRef.current = current;
      write(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [blob, context, duration, height, radius, width, x, x1, x2, y, y1, y2]);

  return (
    <div
      {...props}
      ref={wrapperRef}
      className={cn("absolute left-0 top-0 z-10", className)}
      style={{ ...style, willChange: "transform, width, height" }}
    >
      {children}
    </div>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: clsx, lucide-react, motion, tailwind-merge

### Notes
NOT a process/timeline component despite the name — this is a numeric increment/decrement quantity stepper (+/- buttons). Included only because it was the closest name-match on beUI; it does not solve the 8-stage process/timeline archetype.

## beUI / Bouncy Accordion

Source page: https://beui.dev/components/motion/bouncy-accordion

_Single-open accordion with weighted spring layout, icon rows and reduced-motion-safe content reveals._

### Source

`components/motion/bouncy-accordion.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/motion/bouncy-accordion

import {
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type BouncyAccordionItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type BouncyAccordionClassNames = {
  root?: string;
  item?: string;
  trigger?: string;
  icon?: string;
  title?: string;
  chevron?: string;
  content?: string;
  description?: string;
};

export interface BouncyAccordionProps {
  items: BouncyAccordionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  collapsible?: boolean;
  className?: string;
  classNames?: BouncyAccordionClassNames;
}

// Local springs keep the accordion's connected groups moving together while
// avoiding scale projection on text-heavy row contents.
// Gap spring: must not overshoot y — positive y overshoot drifts items below
// their mt-3 resting point and briefly overlaps the next item.
const ROW_TRANSITION: Transition = {
  type: "spring",
  duration: 0.55,
  bounce: 0.38,
};

const CONTENT_OPEN_TRANSITION: Transition = {
  type: "spring",
  duration: 0.58,
  bounce: 0.32,
};

const CONTENT_CLOSE_TRANSITION: Transition = {
  type: "spring",
  duration: 0.46,
  bounce: 0.26,
};

const DESCRIPTION_TRANSITION: Transition = {
  duration: 0.18,
  ease: EASE_OUT,
};

const CHEVRON_TRANSITION: Transition = {
  type: "spring",
  duration: 0.42,
  bounce: 0.28,
};


function useControllableAccordionValue({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null);
  const isControlled = value !== undefined;
  const currentValue = value ?? internalValue;

  const setValue = useCallback(
    (next: string | null) => {
      if (!isControlled) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue] as const;
}

function BouncyAccordionRow({
  item,
  open,
  startsGroup,
  endsGroup,
  separatedFromPrevious,
  contentId,
  triggerId,
  reduce,
  classNames,
  onToggle,
}: {
  item: BouncyAccordionItem;
  open: boolean;
  startsGroup: boolean;
  endsGroup: boolean;
  separatedFromPrevious: boolean;
  contentId: string;
  triggerId: string;
  reduce: boolean | null;
  classNames?: BouncyAccordionClassNames;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const updateHeight = () => {
      setContentHeight(node.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      layout="position"
      initial={false}
      style={{ marginTop: separatedFromPrevious ? 12 : 0 }}
      transition={reduce ? { duration: 0 } : ROW_TRANSITION}
    >
      <motion.div
        data-state={open ? "open" : "closed"}
        initial={false}
        animate={{
          borderTopLeftRadius: startsGroup ? 28 : 0,
          borderTopRightRadius: startsGroup ? 28 : 0,
          borderBottomLeftRadius: endsGroup ? 28 : 0,
          borderBottomRightRadius: endsGroup ? 28 : 0,
        }}
        transition={reduce ? { duration: 0 } : ROW_TRANSITION}
        className={cn(
          "overflow-hidden bg-card text-card-foreground",
          item.disabled && "opacity-50",
          classNames?.item,
        )}
      >
        <button
          id={triggerId}
          type="button"
          disabled={item.disabled}
          aria-expanded={open}
          aria-controls={contentId}
          onClick={onToggle}
          className={cn(
            "flex min-h-[54px] w-full items-center gap-4 px-5 text-left outline-none transition-colors",
            "focus-visible:bg-muted/25",
            "disabled:pointer-events-none",
            classNames?.trigger,
          )}
        >
          {item.icon ? (
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center text-muted-foreground",
                classNames?.icon,
              )}
            >
              {item.icon}
            </span>
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[15px] font-medium text-foreground",
              classNames?.title,
            )}
          >
            {item.title}
          </span>
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : CHEVRON_TRANSITION}
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center text-muted-foreground",
              classNames?.chevron,
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <motion.div
          layout="size"
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          aria-hidden={!open}
          inert={!open}
          initial={false}
          style={{ height: open && item.description ? contentHeight : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : open
                ? CONTENT_OPEN_TRANSITION
                : CONTENT_CLOSE_TRANSITION
          }
          className={cn("overflow-hidden", classNames?.content)}
        >
          <motion.div
            ref={contentRef}
            animate={{
              opacity: open ? 1 : 0,
            }}
            transition={reduce ? { duration: 0 } : DESCRIPTION_TRANSITION}
            className="px-5 pb-5"
          >
            <div
              className={cn(
                "text-[15px] leading-6 text-muted-foreground",
                classNames?.description,
              )}
            >
              {item.description}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function BouncyAccordion({
  items,
  value,
  defaultValue = null,
  onValueChange,
  collapsible = true,
  className,
  classNames,
}: BouncyAccordionProps) {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [activeValue, setActiveValue] = useControllableAccordionValue({
    value,
    defaultValue,
    onValueChange,
  });
  const activeIndex = items.findIndex((item) => item.id === activeValue);

  const toggleItem = useCallback(
    (id: string) => {
      if (activeValue === id) {
        if (collapsible) {
          setActiveValue(null);
        }
        return;
      }

      setActiveValue(id);
    },
    [activeValue, collapsible, setActiveValue],
  );

  return (
    <div className={cn("w-full", className, classNames?.root)}>
      {items.map((item, index) => {
        const open = activeValue === item.id;
        const previousIsOpen = activeIndex === index - 1;
        const nextIsOpen = activeIndex === index + 1;
        const startsGroup = open || index === 0 || previousIsOpen;
        const endsGroup = open || index === items.length - 1 || nextIsOpen;
        const separatedFromPrevious = index > 0 && (open || previousIsOpen);
        const contentId = `${baseId}-${item.id}-content`;
        const triggerId = `${baseId}-${item.id}-trigger`;

        return (
          <BouncyAccordionRow
            key={item.id}
            item={item}
            open={open}
            startsGroup={startsGroup}
            endsGroup={endsGroup}
            separatedFromPrevious={separatedFromPrevious}
            contentId={contentId}
            triggerId={triggerId}
            reduce={reduce}
            classNames={classNames}
            onToggle={() => toggleItem(item.id)}
          />
        );
      })}
    </div>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: clsx, lucide-react, motion, tailwind-merge

### Notes
accordion / FAQ / expandable list archetype

## beUI / Table Data Table

Source page: https://beui.dev/components/motion/table

_10k virtualized rows with sortable headers, row selection, column resize and reorder._

### Source

`components/motion/table/index.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/motion/table

import { useVirtualizer } from "@tanstack/react-virtual";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/motion/checkbox";
import { cn } from "@/lib/utils";
import { EditableCell } from "./editable-cell";
import { RowHandle } from "./row-handle";
import { SkeletonRows } from "./skeleton-rows";
import { TableHeader } from "./table-header";
import type { HeaderCellRefs, TableProps } from "./types";
import { useColumnReorder } from "./use-column-reorder";
import { useColumnResize } from "./use-column-resize";
import { useColumnSort } from "./use-column-sort";
import { useRowSelection } from "./use-row-selection";
import { alignText, CHECKBOX_PX, CHECKBOX_WIDTH, readCell } from "./utils";

export type {
  SortDirection,
  SortState,
  TableColumn,
  TableProps,
} from "./types";

/**
 * Narrowest a column of bare inputs may be floored to and still show a value:
 * the cell's own `px-4` eats 32 of it.
 */
const INPUT_COLUMN_WIDTH = 120;

/** The root font size Tailwind's rem scale assumes, and the pre-measure guess. */
const DEFAULT_ROOT_FONT_SIZE = 16;

/**
 * What one `rem` is worth here, in px. The default until the first client
 * layout, so the server and the hydrating client emit the same floor; measured
 * once after that, because a document that sets its own `html { font-size }`
 * lays a rem column out against that size and a floor computed from 16 would
 * fall short by the same factor.
 */
function useRootFontSize() {
  const [size, setSize] = useState(DEFAULT_ROOT_FONT_SIZE);
  useEffect(() => {
    const measured = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    if (measured > 0) setSize(measured);
  }, []);
  return size;
}

/**
 * The absolute width a column declared, in px, or null when it declared a share
 * of the remainder instead (`fr`, `%`, `auto`, `calc()`, nothing at all) — those
 * are worth whatever is left over, which is not a width this can add up.
 */
function resolveColumnWidth(
  width: string | undefined,
  rootFontSize: number,
): number | null {
  if (!width) return null;
  const value = Number.parseFloat(width);
  if (!Number.isFinite(value)) return null;
  if (width.endsWith("px")) return value;
  // rem is the other absolute length the repo writes.
  if (width.endsWith("rem")) return value * rootFontSize;
  return null;
}

export function Table<T>({
  data,
  columns,
  getRowId,
  selectable = false,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  resizable = false,
  minColumnWidth = 64,
  onColumnResize,
  reorderable = false,
  onColumnOrderChange,
  onCellEdit,
  onColumnRename,
  onInsertRow,
  onDeleteRow,
  onInsertColumn,
  onDeleteColumn,
  rowHeight = 48,
  height = 440,
  overscan = 10,
  onEndReached,
  loading = false,
  skeletonRows = 3,
  emptyState = "No data",
  className,
}: TableProps<T>) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thRefs: HeaderCellRefs = useRef<
    Record<string, HTMLTableCellElement | null>
  >({});

  const rows = useMemo(
    () =>
      data.map((row, index) => ({
        row,
        id: getRowId ? getRowId(row, index) : String(index),
      })),
    [data, getRowId],
  );

  const {
    orderedColumns,
    dragKey,
    dropIndex,
    startReorder,
    moveReorder,
    endReorder,
  } = useColumnReorder({ columns, thRefs, onColumnOrderChange });

  const { sort, sortedRows, toggleSort } = useColumnSort({
    rows,
    columns,
    sort: sortProp,
    defaultSort,
    onSortChange,
  });

  const { widths, startResize, moveResize, endResize } = useColumnResize({
    orderedColumns,
    thRefs,
    minColumnWidth,
    onColumnResize,
  });

  const { selected, allSelected, someSelected, toggleAll, toggleRow } =
    useRowSelection({
      sortedRows,
      selectedRowIds,
      defaultSelectedRowIds,
      onSelectionChange,
    });

  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  const hasRowMenu = !!(onInsertRow || onDeleteRow);
  const hasColumnMenu = !!(onInsertColumn || onDeleteColumn);
  // Only shrink-wrap (w-max) once every column has an explicit resized width;
  // otherwise stay fill-width so a flexible column can't size to cell content.
  const sized =
    orderedColumns.length > 0 &&
    orderedColumns.every((c) => widths[c.key] != null);

  const rootFontSize = useRootFontSize();
  // In a container narrower than the columns, `table-layout: fixed` shrinks
  // every column toward zero instead of scrolling. Floor the table at what the
  // columns actually asked for — an absolute declared width where there is one,
  // and for the ones sharing the remainder whatever content they can fall back
  // on — then let the viewport scroll past it.
  const minTableWidth = useMemo(() => {
    // A column whose cells render bare inputs has no content for the fallback
    // to measure, which is exactly the column that collapses; a renamable
    // header is an input too, and in a fixed layout the header row is what
    // sizes the column.
    const inputOnly = (column: (typeof orderedColumns)[number]) =>
      Boolean(onColumnRename) || (!column.cell && Boolean(column.editable));
    const total = orderedColumns.reduce((sum, column) => {
      const resized = widths[column.key];
      if (resized != null) return sum + resized;
      const declared = resolveColumnWidth(column.width, rootFontSize);
      if (declared != null) return sum + declared;
      return (
        sum +
        (inputOnly(column)
          ? Math.max(minColumnWidth, INPUT_COLUMN_WIDTH)
          : minColumnWidth)
      );
    }, selectable ? CHECKBOX_PX : 0);
    return Math.round(total);
  }, [
    minColumnWidth,
    onColumnRename,
    orderedColumns,
    rootFontSize,
    selectable,
    widths,
  ]);

  // Infinite scroll: fire onEndReached once per near-bottom dwell, paused while
  // loading; the guard resets when the load completes.
  const endReachedRef = useRef(false);
  useEffect(() => {
    if (!loading) endReachedRef.current = false;
  }, [loading]);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !onEndReached || loading || endReachedRef.current) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < rowHeight * 4) {
      endReachedRef.current = true;
      onEndReached();
    }
  }, [onEndReached, loading, rowHeight]);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  // Small delay on leave so the pointer can cross the gap from the header cell
  // to the portal handle without the column deactivating.
  const deactivateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activateColumn = useCallback((key: string) => {
    if (deactivateTimer.current) clearTimeout(deactivateTimer.current);
    deactivateTimer.current = null;
    setActiveColumn(key);
  }, []);
  const deactivateColumn = useCallback(() => {
    if (deactivateTimer.current) clearTimeout(deactivateTimer.current);
    deactivateTimer.current = setTimeout(() => setActiveColumn(null), 100);
  }, []);

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [activeRow, setActiveRow] = useState<{ id: string; index: number } | null>(
    null,
  );
  const rowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activateRow = useCallback((id: string, index: number) => {
    if (rowTimer.current) clearTimeout(rowTimer.current);
    rowTimer.current = null;
    setActiveRow({ id, index });
  }, []);
  const deactivateRow = useCallback(() => {
    if (rowTimer.current) clearTimeout(rowTimer.current);
    rowTimer.current = setTimeout(() => setActiveRow(null), 100);
  }, []);
  const activeRowEl = activeRow ? rowRefs.current[activeRow.id] : null;
  // Real columns + checkbox; the trailing spacer adds one more in colSpans.
  const leadColumns = columns.length + (selectable ? 1 : 0);

  return (
    <div
      className={cn(
        "w-full overflow-hidden border border-border bg-background text-sm",
        className,
      )}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-auto"
        style={{ height }}
      >
        <table
          className={cn("border-collapse", sized ? "w-max" : undefined)}
          style={{
            tableLayout: "fixed",
            minWidth: `max(100%, ${minTableWidth}px)`,
          }}
        >
          <colgroup>
            {selectable ? <col style={{ width: CHECKBOX_WIDTH }} /> : null}
            {orderedColumns.map((column) => {
              const override = widths[column.key];
              const width = override ? `${override}px` : column.width;
              return (
                <col key={column.key} style={width ? { width } : undefined} />
              );
            })}
            {/* Empty filler owns the leftover space — no gap, content unpinned. */}
            <col />
          </colgroup>

          <TableHeader
            columns={orderedColumns}
            rowHeight={rowHeight}
            reduce={!!reduce}
            thRefs={thRefs}
            selectable={selectable}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={toggleAll}
            sort={sort}
            onToggleSort={toggleSort}
            resizable={resizable}
            onResizeStart={startResize}
            onResizeMove={moveResize}
            onResizeEnd={endResize}
            reorderable={reorderable}
            dragKey={dragKey}
            dropIndex={dropIndex}
            onReorderStart={startReorder}
            onReorderMove={moveReorder}
            onReorderEnd={endReorder}
            onInsertColumn={onInsertColumn}
            onDeleteColumn={onDeleteColumn}
            onColumnRename={onColumnRename}
            activeColumn={hasColumnMenu ? activeColumn : null}
            onColumnActivate={hasColumnMenu ? activateColumn : undefined}
            onColumnDeactivate={hasColumnMenu ? deactivateColumn : undefined}
          />

          <tbody>
            {sortedRows.length === 0 ? (
              loading ? (
                <SkeletonRows
                  count={Math.max(1, Math.ceil(height / rowHeight))}
                  columns={orderedColumns}
                  selectable={selectable}
                  rowHeight={rowHeight}
                />
              ) : (
                <tr>
                  <td
                    colSpan={leadColumns + 1}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {emptyState}
                  </td>
                </tr>
              )
            ) : (
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden style={{ height: paddingTop }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {virtualItems.map((vItem) => {
                  const entry = sortedRows[vItem.index];
                  const isSelected = selected.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      ref={(el) => {
                        rowRefs.current[entry.id] = el;
                      }}
                      data-selected={isSelected}
                      style={{ height: rowHeight }}
                      onPointerEnter={
                        hasRowMenu
                          ? () => activateRow(entry.id, vItem.index)
                          : undefined
                      }
                      onPointerLeave={hasRowMenu ? deactivateRow : undefined}
                      className={cn(
                        "border-border/60 border-b transition-colors",
                        "data-[selected=true]:bg-primary/5",
                        "hover:bg-muted/50",
                      )}
                    >
                      {selectable ? (
                        <td className="text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(entry.id)}
                              aria-label={`Select row ${vItem.index + 1}`}
                            />
                          </div>
                        </td>
                      ) : null}
                      {orderedColumns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            "truncate px-4 text-foreground",
                            alignText(column.align),
                          )}
                        >
                          {!column.cell && column.editable ? (
                            <EditableCell
                              value={String(readCell(entry.row, column) ?? "")}
                              label={`${column.key} for row ${vItem.index + 1}`}
                              onChange={(next) =>
                                onCellEdit?.(entry.id, column.key, next)
                              }
                            />
                          ) : (
                            readCell(entry.row, column)
                          )}
                        </td>
                      ))}
                      <td aria-hidden />
                    </tr>
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden style={{ height: paddingBottom }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {loading ? (
                  <SkeletonRows
                    count={skeletonRows}
                    columns={orderedColumns}
                    selectable={selectable}
                    rowHeight={rowHeight}
                  />
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>
      {hasRowMenu && activeRow ? (
        <RowHandle
          rowEl={activeRowEl}
          id={activeRow.id}
          index={activeRow.index}
          onInsertRow={onInsertRow}
          onDeleteRow={onDeleteRow}
          onEnter={() => activateRow(activeRow.id, activeRow.index)}
          onLeave={deactivateRow}
        />
      ) : null}
    </div>
  );
}
```

`components/motion/table/editable-cell.tsx` (registry:component)

```tsx
"use client";

export function EditableCell({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      value={value}
      aria-label={label}
      size={1}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Empty"
      className="-mx-2 w-full min-w-0 appearance-none rounded-md border-0 bg-transparent px-2 py-1 text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:bg-muted focus:ring-1 focus:ring-ring"
    />
  );
}
```

`components/motion/table/row-handle.tsx` (registry:component)

```tsx
"use client";

import { ArrowDownToLine, ArrowUpToLine, MoreVertical, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { TableMenu } from "./table-menu";

/** The row handle, portaled so it can sit on the row's left border without the
 * scroll container clipping it. Straddles the border to bridge hover. */
export function RowHandle({
  rowEl,
  id,
  index,
  onInsertRow,
  onDeleteRow,
  onEnter,
  onLeave,
}: {
  rowEl: HTMLTableRowElement | null;
  id: string;
  index: number;
  onInsertRow?: (index: number, position: "before" | "after") => void;
  onDeleteRow?: (rowId: string, index: number) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  useEffect(() => {
    window.addEventListener("scroll", onLeave, true);
    return () => window.removeEventListener("scroll", onLeave, true);
  }, [onLeave]);

  if (!rowEl || typeof document === "undefined") return null;
  const rect = rowEl.getBoundingClientRect();

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: rect.top + rect.height / 2,
        left: rect.left,
        transform: "translate(-50%, -50%)",
        zIndex: 40,
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <TableMenu
        ariaLabel={`Row ${index + 1} options`}
        triggerClassName="flex h-6 w-2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        trigger={<MoreVertical className="h-3 w-3" />}
        items={[
          ...(onInsertRow
            ? [
                {
                  label: "Insert before",
                  icon: <ArrowUpToLine />,
                  onSelect: () => onInsertRow(index, "before"),
                },
                {
                  label: "Insert after",
                  icon: <ArrowDownToLine />,
                  onSelect: () => onInsertRow(index, "after"),
                },
              ]
            : []),
          ...(onDeleteRow
            ? [
                {
                  label: "Delete row",
                  icon: <Trash2 />,
                  destructive: true,
                  onSelect: () => onDeleteRow(id, index),
                },
              ]
            : []),
        ]}
      />
    </div>,
    document.body,
  );
}
```

`components/motion/table/skeleton-rows.tsx` (registry:component)

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { TableColumn } from "./types";
import { alignText } from "./utils";

export function SkeletonRows<T>({
  count,
  columns,
  selectable,
  rowHeight,
}: {
  count: number;
  columns: TableColumn<T>[];
  selectable: boolean;
  rowHeight: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, r) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
        <tr key={r} style={{ height: rowHeight }} className="border-border/60 border-b">
          {selectable ? <td /> : null}
          {columns.map((column) => (
            <td key={column.key} className={cn("px-4", alignText(column.align))}>
              <div
                className={cn(
                  "h-3 animate-pulse rounded-full bg-muted",
                  column.align === "right" ? "ml-auto w-10" : "w-2/3",
                )}
              />
            </td>
          ))}
          <td aria-hidden />
        </tr>
      ))}
    </>
  );
}
```

`components/motion/table/table-header.tsx` (registry:component)

```tsx
"use client";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { type PointerEvent as ReactPointerEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { Checkbox } from "@/components/motion/checkbox";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";
import { TableMenu } from "./table-menu";
import type {
  HeaderCellRefs,
  InsertPosition,
  SortState,
  TableColumn,
} from "./types";
import { alignFlex, alignText, COLUMN_ACTIVE_SHADOW } from "./utils";

export interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  rowHeight: number;
  reduce: boolean;
  thRefs: HeaderCellRefs;
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  sort: SortState | null;
  onToggleSort: (key: string) => void;
  resizable: boolean;
  onResizeStart: (key: string, e: ReactPointerEvent) => void;
  onResizeMove: (e: ReactPointerEvent) => void;
  onResizeEnd: (e: ReactPointerEvent) => void;
  reorderable: boolean;
  dragKey: string | null;
  dropIndex: number | null;
  onReorderStart: (key: string, e: ReactPointerEvent) => void;
  onReorderMove: (e: ReactPointerEvent) => void;
  onReorderEnd: (e: ReactPointerEvent) => void;
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  onDeleteColumn?: (columnKey: string, index: number) => void;
  onColumnRename?: (columnKey: string, value: string) => void;
  activeColumn: string | null;
  onColumnActivate?: (key: string) => void;
  onColumnDeactivate?: () => void;
}

/** Column insert / delete menu items shared by the header cell and the portal handle. */
function columnMenuItems<T>(
  column: TableColumn<T>,
  index: number,
  onInsertColumn?: (index: number, position: InsertPosition) => void,
  onDeleteColumn?: (columnKey: string, index: number) => void,
) {
  return [
    ...(onInsertColumn
      ? [
          {
            label: "Insert before",
            icon: <ArrowLeftToLine />,
            onSelect: () => onInsertColumn(index, "before"),
          },
          {
            label: "Insert after",
            icon: <ArrowRightToLine />,
            onSelect: () => onInsertColumn(index, "after"),
          },
        ]
      : []),
    ...(onDeleteColumn
      ? [
          {
            label: "Delete column",
            icon: <Trash2 />,
            destructive: true,
            onSelect: () => onDeleteColumn(column.key, index),
          },
        ]
      : []),
  ];
}

/** The ellipse handle, portaled so it can sit on the column's top border without
 * the scroll container clipping it. Straddles the border to bridge hover. */
function ColumnHandle<T>({
  column,
  index,
  thRefs,
  onInsertColumn,
  onDeleteColumn,
  onEnter,
  onLeave,
}: {
  column: TableColumn<T>;
  index: number;
  thRefs: HeaderCellRefs;
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  onDeleteColumn?: (columnKey: string, index: number) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  useEffect(() => {
    window.addEventListener("scroll", onLeave, true);
    return () => window.removeEventListener("scroll", onLeave, true);
  }, [onLeave]);

  const el = thRefs.current[column.key];
  if (!el || typeof document === "undefined") return null;
  const rect = el.getBoundingClientRect();

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -50%)",
        zIndex: 40,
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <TableMenu
        ariaLabel={`${column.key} column options`}
        triggerClassName="flex h-2 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        trigger={<MoreHorizontal className="h-3 w-3" />}
        items={columnMenuItems(column, index, onInsertColumn, onDeleteColumn)}
      />
    </div>,
    document.body,
  );
}

export function TableHeader<T>({
  columns,
  rowHeight,
  reduce,
  thRefs,
  selectable,
  allSelected,
  someSelected,
  onToggleAll,
  sort,
  onToggleSort,
  resizable,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  reorderable,
  dragKey,
  dropIndex,
  onReorderStart,
  onReorderMove,
  onReorderEnd,
  onInsertColumn,
  onDeleteColumn,
  onColumnRename,
  activeColumn,
  onColumnActivate,
  onColumnDeactivate,
}: TableHeaderProps<T>) {
  const hasColumnMenu = !!(onInsertColumn || onDeleteColumn);
  const activeIndex = columns.findIndex((c) => c.key === activeColumn);
  return (
    <>
      {hasColumnMenu && activeColumn && activeIndex >= 0 ? (
        <ColumnHandle
          column={columns[activeIndex]}
          index={activeIndex}
          thRefs={thRefs}
          onInsertColumn={onInsertColumn}
          onDeleteColumn={onDeleteColumn}
          onEnter={() => onColumnActivate?.(activeColumn)}
          onLeave={() => onColumnDeactivate?.()}
        />
      ) : null}
      <thead>
      <tr style={{ height: rowHeight }}>
        {selectable ? (
          <th className="sticky top-0 z-10 border-border border-b bg-muted">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onCheckedChange={onToggleAll}
                aria-label="Select all rows"
                className="size-6"
              />
            </div>
          </th>
        ) : null}
        {columns.map((column, index) => {
          const active = sort?.key === column.key;
          const isDragging = dragKey === column.key;
          const isActive = activeColumn === column.key;
          return (
            <th
              key={column.key}
              ref={(el) => {
                thRefs.current[column.key] = el;
              }}
              onPointerEnter={() => onColumnActivate?.(column.key)}
              onPointerLeave={() => onColumnDeactivate?.()}
              style={isActive ? { boxShadow: COLUMN_ACTIVE_SHADOW } : undefined}
              aria-sort={
                active
                  ? sort?.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined
              }
              data-drop={dragKey ? dropIndex === index : undefined}
              data-dropend={
                dragKey
                  ? dropIndex === columns.length && index === columns.length - 1
                  : undefined
              }
              className={cn(
                "group sticky top-0 z-10 border-border border-b bg-muted p-0 font-medium text-muted-foreground",
                "data-[drop=true]:before:absolute data-[drop=true]:before:inset-y-0 data-[drop=true]:before:left-0 data-[drop=true]:before:w-0.5 data-[drop=true]:before:bg-primary",
                "data-[dropend=true]:after:absolute data-[dropend=true]:after:inset-y-0 data-[dropend=true]:after:right-0 data-[dropend=true]:after:w-0.5 data-[dropend=true]:after:bg-primary",
              )}
            >
              <motion.div
                className={cn(
                  "flex h-full items-center",
                  alignFlex(column.align),
                )}
                style={{ height: rowHeight }}
                animate={
                  reduce
                    ? { opacity: isDragging ? 0.5 : 1 }
                    : {
                        scale: isDragging ? 1.04 : 1,
                        opacity: isDragging ? 0.5 : 1,
                      }
                }
                transition={SPRING_PRESS}
              >
                {reorderable ? (
                  <button
                    type="button"
                    aria-label={`Reorder ${column.key} column`}
                    onPointerDown={(e) => onReorderStart(column.key, e)}
                    onPointerMove={onReorderMove}
                    onPointerUp={onReorderEnd}
                    className={cn(
                      "flex h-full w-6 cursor-grab touch-none items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing",
                      // The grip owns the whole press, so iOS must not open its
                      // callout out of the same one and cancel the drag.
                      TOUCH_GESTURE_CLASS,
                    )}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onToggleSort(column.key)}
                    className={cn(
                      "flex h-full min-w-0 flex-1 select-none items-center gap-1 px-4 transition-colors hover:text-foreground",
                      alignFlex(column.align),
                      active && "text-foreground",
                    )}
                  >
                    <span className="truncate">{column.header}</span>
                    <motion.span
                      aria-hidden
                      className="inline-flex shrink-0"
                      animate={{
                        rotate: active && sort?.direction === "desc" ? 180 : 0,
                        opacity: active ? 1 : 0.35,
                      }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.18, ease: EASE_OUT }
                      }
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </motion.span>
                  </button>
                ) : onColumnRename ? (
                  <input
                    value={
                      typeof column.header === "string" ? column.header : ""
                    }
                    aria-label={`Rename ${column.key} column`}
                    size={1}
                    onChange={(e) =>
                      onColumnRename(column.key, e.target.value)
                    }
                    className={cn(
                      "min-w-0 flex-1 truncate appearance-none rounded-md border-0 bg-transparent px-4 font-medium text-muted-foreground outline-none transition-colors focus:bg-muted focus:text-foreground",
                      alignText(column.align),
                    )}
                  />
                ) : (
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate px-4",
                      alignText(column.align),
                    )}
                  >
                    {column.header}
                  </span>
                )}
              </motion.div>
              {resizable ? (
                <button
                  type="button"
                  aria-label={`Resize ${column.key} column`}
                  tabIndex={-1}
                  onPointerDown={(e) => onResizeStart(column.key, e)}
                  onPointerMove={onResizeMove}
                  onPointerUp={onResizeEnd}
                  className={cn(
                    "absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-primary/40",
                    // Same for the resize drag: the handle drives it end to end.
                    TOUCH_GESTURE_CLASS,
                  )}
                />
              ) : null}
            </th>
          );
        })}
        <th
          aria-hidden
          className="sticky top-0 z-10 border-border border-b bg-muted"
        />
      </tr>
    </thead>
    </>
  );
}
```

`components/motion/table/types.ts` (registry:component)

```tsx
import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  direction: SortDirection;
};

export type TableColumn<T> = {
  /** Stable key; also the default object property read for the cell + sort value. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** Allow clicking the header to sort by this column. */
  sortable?: boolean;
  /** Cell text alignment. */
  align?: "left" | "center" | "right";
  /** Column width as a CSS length, e.g. "160px" or "20%". Omit to share remaining space equally. */
  width?: string;
  /** Custom cell renderer. Falls back to `row[key]`. */
  cell?: (row: T) => ReactNode;
  /** Render an inline text input for this column's cells (ignored when `cell` is set). */
  editable?: boolean;
  /** Value used for sorting. Falls back to `row[key]`. */
  sortValue?: (row: T) => string | number;
};

export type InsertPosition = "before" | "after";

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  /** Stable id per row, required for correct selection across sorts. Defaults to row index. */
  getRowId?: (row: T, index: number) => string;
  /** Render a leading checkbox column with select-all in the header. */
  selectable?: boolean;
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Allow dragging the right edge of a header to resize that column. */
  resizable?: boolean;
  /** Minimum column width in px when resizing. */
  minColumnWidth?: number;
  onColumnResize?: (key: string, width: number) => void;
  /** Allow dragging a header grip to reorder columns. */
  reorderable?: boolean;
  onColumnOrderChange?: (keys: string[]) => void;
  /** Called when an `editable` cell changes. */
  onCellEdit?: (rowId: string, columnKey: string, value: string) => void;
  /** When set, non-sortable headers become editable inputs for the column name. */
  onColumnRename?: (columnKey: string, value: string) => void;
  /** Enables the row menu (Insert before / after). Receives the target index. */
  onInsertRow?: (index: number, position: InsertPosition) => void;
  /** Enables Delete in the row menu. */
  onDeleteRow?: (rowId: string, index: number) => void;
  /** Enables the column menu (Insert before / after). Receives the target column index. */
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  /** Enables Delete in the column menu. */
  onDeleteColumn?: (columnKey: string, index: number) => void;
  /** Fixed row height in px — required for virtualization. */
  rowHeight?: number;
  /** Scroll viewport height in px. */
  height?: number;
  /** Rows rendered above/below the viewport. */
  overscan?: number;
  /** Fires when the viewport scrolls near the bottom — load the next page. */
  onEndReached?: () => void;
  /** Currently fetching — shows skeleton rows and pauses `onEndReached`. */
  loading?: boolean;
  /** How many skeleton rows to show while loading more (default 3). */
  skeletonRows?: number;
  emptyState?: ReactNode;
  className?: string;
}

/** A data row paired with its stable id. */
export type TableRow<T> = { row: T; id: string };

/** Ref map from column key to its header cell, shared across the resize/reorder hooks. */
export type HeaderCellRefs = {
  current: Record<string, HTMLTableCellElement | null>;
};
```

`components/motion/table/use-column-reorder.ts` (registry:component)

```tsx
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { capturePointer, releasePointer } from "@/lib/touch";
import type { HeaderCellRefs, TableColumn } from "./types";

export function useColumnReorder<T>({
  columns,
  thRefs,
  onColumnOrderChange,
}: {
  columns: TableColumn<T>[];
  thRefs: HeaderCellRefs;
  onColumnOrderChange?: (keys: string[]) => void;
}) {
  const [order, setOrder] = useState<string[]>(() =>
    columns.map((c) => c.key),
  );
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Apply the current order, tolerating columns added/removed at runtime. New
  // columns are placed at their position in `columns` (after their left
  // neighbor), not appended — so an inserted column lands where it was added.
  const orderedColumns = useMemo(() => {
    const byKey = new Map(columns.map((c) => [c.key, c]));
    const resultKeys = order.filter((k) => byKey.has(k));
    const present = new Set(resultKeys);
    columns.forEach((column, i) => {
      if (present.has(column.key)) return;
      let at = resultKeys.length;
      if (i === 0) {
        at = 0;
      } else {
        const idx = resultKeys.indexOf(columns[i - 1].key);
        at = idx === -1 ? i : idx + 1;
      }
      resultKeys.splice(at, 0, column.key);
      present.add(column.key);
    });
    return resultKeys
      .map((k) => byKey.get(k))
      .filter((c): c is TableColumn<T> => c !== undefined);
  }, [order, columns]);

  const dropIndexFor = useCallback(
    (clientX: number) => {
      for (let i = 0; i < orderedColumns.length; i++) {
        const rect =
          thRefs.current[orderedColumns[i].key]?.getBoundingClientRect();
        if (rect && clientX < rect.left + rect.width / 2) return i;
      }
      return orderedColumns.length;
    },
    [orderedColumns, thRefs],
  );

  const startReorder = useCallback((key: string, e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragKey(key);
    capturePointer(e.currentTarget, e.pointerId);
  }, []);

  const moveReorder = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragKey) return;
      setDropIndex(dropIndexFor(e.clientX));
    },
    [dragKey, dropIndexFor],
  );

  const endReorder = useCallback(
    (e: ReactPointerEvent) => {
      releasePointer(e.currentTarget, e.pointerId);
      if (dragKey && dropIndex !== null) {
        const keys = orderedColumns.map((c) => c.key);
        const from = keys.indexOf(dragKey);
        if (from !== -1) {
          const without = keys.filter((_, i) => i !== from);
          let to = dropIndex;
          if (from < to) to--;
          without.splice(to, 0, dragKey);
          setOrder(without);
          onColumnOrderChange?.(without);
        }
      }
      setDragKey(null);
      setDropIndex(null);
    },
    [dragKey, dropIndex, orderedColumns, onColumnOrderChange],
  );

  return {
    orderedColumns,
    dragKey,
    dropIndex,
    startReorder,
    moveReorder,
    endReorder,
  };
}
```

`components/motion/table/use-column-resize.ts` (registry:component)

```tsx
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { capturePointer, releasePointer } from "@/lib/touch";
import type { HeaderCellRefs, TableColumn } from "./types";

export function useColumnResize<T>({
  orderedColumns,
  thRefs,
  minColumnWidth,
  onColumnResize,
}: {
  orderedColumns: TableColumn<T>[];
  thRefs: HeaderCellRefs;
  minColumnWidth: number;
  onColumnResize?: (key: string, width: number) => void;
}) {
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});

  const startResize = useCallback(
    (key: string, e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Freeze every column to its current pixel width so resizing one only
      // moves the trailing spacer, never the other columns.
      const snapshot = { ...widths };
      for (const column of orderedColumns) {
        if (snapshot[column.key] == null) {
          const measured = thRefs.current[column.key]?.getBoundingClientRect()
            .width;
          snapshot[column.key] = measured
            ? Math.round(measured)
            : minColumnWidth;
        }
      }
      resizeRef.current = {
        key,
        startX: e.clientX,
        startWidth: snapshot[key],
      };
      setWidths(snapshot);
      capturePointer(e.currentTarget, e.pointerId);
    },
    [minColumnWidth, orderedColumns, thRefs, widths],
  );

  const moveResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      if (!state) return;
      const width = Math.max(
        minColumnWidth,
        state.startWidth + (e.clientX - state.startX),
      );
      setWidths((prev) => ({ ...prev, [state.key]: width }));
    },
    [minColumnWidth],
  );

  const endResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      resizeRef.current = null;
      releasePointer(e.currentTarget, e.pointerId);
      if (state) {
        onColumnResize?.(state.key, widths[state.key] ?? state.startWidth);
      }
    },
    [onColumnResize, widths],
  );

  return { widths, startResize, moveResize, endResize };
}
```

`components/motion/table/use-column-sort.ts` (registry:component)

```tsx
import { useCallback, useMemo, useState } from "react";
import type { SortState, TableColumn, TableRow } from "./types";
import { readSortValue } from "./utils";

export function useColumnSort<T>({
  rows,
  columns,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
}: {
  rows: TableRow<T>[];
  columns: TableColumn<T>[];
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
}) {
  const [internalSort, setInternalSort] = useState<SortState | null>(
    defaultSort,
  );
  const sort = sortProp !== undefined ? sortProp : internalSort;

  const commit = useCallback(
    (next: SortState | null) => {
      if (sortProp === undefined) setInternalSort(next);
      onSortChange?.(next);
    },
    [sortProp, onSortChange],
  );

  const toggleSort = useCallback(
    (key: string) => {
      if (!sort || sort.key !== key) {
        commit({ key, direction: "asc" });
      } else if (sort.direction === "asc") {
        commit({ key, direction: "desc" });
      } else {
        commit(null);
      }
    },
    [sort, commit],
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = readSortValue(a.row, column);
      const bv = readSortValue(b.row, column);
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  return { sort, sortedRows, toggleSort };
}
```

`components/motion/table/use-row-selection.ts` (registry:component)

```tsx
import { useCallback, useMemo, useState } from "react";
import type { TableRow } from "./types";

export function useRowSelection<T>({
  sortedRows,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
}: {
  sortedRows: TableRow<T>[];
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}) {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedRowIds),
  );
  const selected = useMemo(
    () =>
      selectedRowIds !== undefined
        ? new Set(selectedRowIds)
        : internalSelected,
    [selectedRowIds, internalSelected],
  );

  const commit = useCallback(
    (next: Set<string>) => {
      if (selectedRowIds === undefined) setInternalSelected(next);
      onSelectionChange?.([...next]);
    },
    [selectedRowIds, onSelectionChange],
  );

  const allSelected =
    sortedRows.length > 0 && sortedRows.every((r) => selected.has(r.id));
  const someSelected = sortedRows.some((r) => selected.has(r.id));

  const toggleAll = useCallback(() => {
    const next = new Set(selected);
    if (allSelected) {
      for (const r of sortedRows) next.delete(r.id);
    } else {
      for (const r of sortedRows) next.add(r.id);
    }
    commit(next);
  }, [allSelected, sortedRows, selected, commit]);

  const toggleRow = useCallback(
    (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commit(next);
    },
    [selected, commit],
  );

  return { selected, allSelected, someSelected, toggleAll, toggleRow };
}
```

`components/motion/table/utils.ts` (registry:component)

```tsx
import type { ReactNode } from "react";
import type { TableColumn } from "./types";

export const CHECKBOX_PX = 48;
export const CHECKBOX_WIDTH = `${CHECKBOX_PX}px`;

/** Highlights the top edge of the active column's header cell. */
export const COLUMN_ACTIVE_SHADOW = "inset 0 1px 0 var(--color-primary)";

export function alignFlex(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "justify-end";
  if (align === "center") return "justify-center";
  return "justify-start";
}

export function alignText(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function readCell<T>(row: T, column: TableColumn<T>): ReactNode {
  if (column.cell) return column.cell(row);
  return (row as Record<string, ReactNode>)[column.key];
}

export function readSortValue<T>(
  row: T,
  column: TableColumn<T>,
): string | number {
  if (column.sortValue) return column.sortValue(row);
  return (row as Record<string, string | number>)[column.key];
}
```

`components/motion/checkbox.tsx` (registry:component)

```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

const CHECK_PATH = "M5 13l4 4L19 7";
const INDETERMINATE_PATH = "M6 12h12";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  /** Associates an external message (e.g. a form error) with the control. */
  "aria-describedby"?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  indeterminate,
  label,
  className,
  id: idProp,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: CheckboxProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const reduce = useReducedMotion();
  const showMark = checked || indeterminate;
  const path = indeterminate ? INDETERMINATE_PATH : CHECK_PATH;

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <motion.button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        whileTap={reduce || disabled ? undefined : { scale: 0.92 }}
        transition={SPRING_PRESS}
        data-state={
          checked ? "checked" : indeterminate ? "indeterminate" : "unchecked"
        }
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 outline-none transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          showMark
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50 bg-background hover:border-muted-foreground",
        )}
      >
        <AnimatePresence initial={false}>
          {showMark ? (
            <motion.svg
              key={indeterminate ? "indeterminate" : "checked"}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.5, filter: "blur(4px)" }
              }
              transition={
                reduce ? { duration: 0 } : { duration: 0.16, ease: EASE_OUT }
              }
              aria-hidden
            >
              <title>{indeterminate ? "Partially selected" : "Selected"}</title>
              <motion.path
                d={path}
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        duration: indeterminate ? 0.2 : 0.3,
                        ease: EASE_OUT,
                        delay: 0.04,
                      }
                }
              />
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </motion.button>
      {label ? (
        <span className={cn("select-none text-sm text-foreground", disabled && "opacity-60")}>
          {label}
        </span>
      ) : null}
    </label>
  );
}
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`components/motion/table/table-menu.tsx` (registry:component)

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type TableMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
};

const MENU_WIDTH = 188;

export function TableMenu({
  items,
  ariaLabel,
  trigger,
  triggerClassName,
}: {
  items: TableMenuItem[];
  ariaLabel: string;
  trigger: ReactNode;
  triggerClassName?: string;
}) {
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const open = coords !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setCoords(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // Close on any scroll (the trigger moves) or resize; fixed coords go stale.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setCoords(null);
      return;
    }
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.bottom + 4,
      left: Math.max(8, r.right - MENU_WIDTH),
    });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-40"
                onPointerDown={() => setCoords(null)}
              />
              <motion.div
                role="menu"
                className="fixed z-50 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-xl"
                style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
                initial={
                  reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }
                }
                animate={
                  reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
                }
                transition={reduce ? { duration: 0 } : SPRING_PANEL}
              >
                {items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setCoords(null);
                      item.onSelect();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors [&_svg]:h-4 [&_svg]:w-4",
                      item.destructive
                        ? "text-rose-500 hover:bg-rose-500/10"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/touch.ts` (registry:lib)

```tsx
// Shared touch primitives. iOS and iPadOS run their own gestures on top of the
// page — the long-press selection callout and the selection it drags in with
// it — and they win: once the platform claims a touch it cancels ours
// mid-gesture, so a press-and-hold or a drag simply dies. Surfaces that own
// their gesture have to opt out.
//
// What the two classes below cover, precisely:
// - `-webkit-touch-callout: none` stops iOS's long-press callout. WebKit-only:
//   it is not a property other engines have, so it is inert everywhere else.
// - `user-select: none` stops the long-press selection on every engine,
//   Android included, and stops a drag from painting a selection under the
//   cursor. It is inherited, so it reaches every descendant — which is why the
//   two classes differ only in whether they apply it unconditionally.
// What neither covers:
// - Chrome for Android's long-press menu on a link or an image. No CSS
//   suppresses it; a gesture surface that wraps one needs its own
//   `onContextMenu` with `preventDefault()`.
// - The native drag of an `<img>` or `<a>` descendant. `-webkit-user-drag` is
//   not inherited and plain divs and buttons are not drag sources, so setting
//   it on the surface does nothing — the child itself needs `draggable={false}`.

/**
 * Classes for a surface that *is* the control: a thumb, a drum, a stage, a
 * handle, a hold button. Selection is suppressed on every input, because a
 * drag that highlights the control's own label is wrong on a mouse too.
 * Compose with `touch-none` when the surface also owns the scroll axis — leave
 * it off when the page must still scroll from there.
 */
export const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

/**
 * The same opt-out for a gesture surface that wraps content the consumer owns:
 * a scroller, a context-menu trigger, a sheet header, a list row. Selection is
 * suppressed only where the platform runs its own press gestures — a coarse
 * pointer — so a mouse user can still select and copy that content. If the
 * gesture itself would paint a selection under the cursor, add `select-none`
 * for the duration of the gesture rather than reaching for
 * `TOUCH_GESTURE_CLASS`.
 *
 * `pointer: coarse` describes the *primary* pointer and nothing else, so a
 * hybrid machine reads it wrong in both directions: a tablet with a mouse
 * plugged in keeps touch as primary and loses mouse selection, and a laptop
 * with a touchscreen keeps the mouse as primary and leaves selection live
 * under a finger. No media query can answer per interaction — the query is
 * about the device, and the question is about the gesture in progress. The
 * default stays here because it is right on the machines that are one thing or
 * the other, and losing a selection is a nuisance; where the miss costs a
 * *gesture* instead, the surface pairs it with `holdSelection` on the press.
 */
export const TOUCH_GESTURE_CONTENT_CLASS =
  "[-webkit-touch-callout:none] pointer-coarse:select-none";

/**
 * Suppress selection on `element` for as long as a gesture is running on it,
 * whatever the primary pointer of the machine happens to be. Returns the
 * release. Inline, so it wins over the class above and is gone again the
 * moment the gesture ends.
 *
 * For the press gestures a native selection would otherwise steal — a
 * long-press that opens a menu. Elsewhere prefer the classes: a surface that
 * takes selection away for the whole session is a surface whose text nobody
 * can copy.
 */
export function holdSelection(element: HTMLElement) {
  element.style.setProperty("user-select", "none");
  element.style.setProperty("-webkit-user-select", "none");
  return () => {
    element.style.removeProperty("user-select");
    element.style.removeProperty("-webkit-user-select");
  };
}

/**
 * Pointer capture, best effort. WebKit throws `NotFoundError` when the pointer
 * is already gone by the time the handler runs — routine on iOS, where the
 * system can claim the touch first — and an uncaught throw takes the rest of
 * the handler, the gesture included, down with it. Touch pointers carry
 * implicit capture anyway, so losing it is never fatal.
 */
export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer is no longer active — implicit capture still applies on touch.
  }
}

/** Release a capture taken with `capturePointer`, ignoring a stale pointer. */
export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Capture was already dropped by the browser.
  }
}

/**
 * Whether this event came from a pointer that is *hovering*: not a touch, and
 * not currently pressed. Which input the user is holding right now is not
 * something a device capability can answer — a touchscreen laptop hovers and
 * taps, and iPadOS reports a fine hovering pointer for a finger — so both
 * paths stay live and each handler branches on the event it was given.
 *
 * A pen resting on the glass is making contact, not hovering: `buttons` is the
 * tell, and it sends a pen tap down the same route a finger takes.
 *
 * This answers what an *enter* asks. A leave is the other half of a pair and
 * has to be read against the enter that started it — `useHoverGesture` in
 * `lib/hooks/use-hover-gesture` does that, and hover surfaces should use it
 * rather than asking this question twice.
 */
export const isHoveringPointer = (event: {
  pointerType: string;
  buttons: number;
}) => event.pointerType !== "touch" && event.buttons === 0;
```

### Dependencies

- npm: @tanstack/react-virtual, clsx, lucide-react, motion, tailwind-merge

### Notes
data / comparison table archetype

## beUI / Number Animation Animated Number

Source page: https://beui.dev/components/motion/number

_Spring-driven count-up triggered when in view._

### Source

`components/motion/animated-number.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/motion/number

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  startOnView?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  format = (n) => Math.round(n).toLocaleString(),
  className,
  startOnView = true,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (startOnView && !inView) return;
    if (reduce) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(fromRef.current, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(v),
    });
    fromRef.current = value;
    return () => controls.stop();
  }, [value, duration, inView, startOnView, reduce]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {format(display)}
    </span>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: clsx, motion, tailwind-merge

### Notes
stat / number / ticker / metric display archetype

## beUI / Number Animation Number Ticker

Source page: https://beui.dev/components/motion/number

_Slot-machine rolling digits with staggered entry._

### Source

`components/motion/number-ticker.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/motion/number

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface NumberTickerProps {
  value: number;
  /** Digits to pad to (left). */
  pad?: number;
  /** Per-digit roll duration in seconds. */
  duration?: number;
  /** Stagger between digits. */
  stagger?: number;
  /** Render only after the element enters the viewport. */
  startOnView?: boolean;
  prefix?: string;
  suffix?: string;
  /** Add a small blur during digit rolls. */
  blur?: boolean;
  className?: string;
  digitClassName?: string;
  /** Insert locale group separators (commas). Server-component safe. */
  locale?: boolean;
  /** Custom formatter. Client-only — server components must use `locale` instead. */
  format?: (value: number) => string;
}

const DIGIT_HEIGHT_EM = 1.1;
const DIGITS = Array.from({ length: 10 }, (_, n) => n);

export function NumberTicker({
  value,
  pad,
  duration = 0.9,
  stagger = 0.04,
  startOnView = true,
  prefix,
  suffix,
  blur = false,
  className,
  digitClassName,
  locale,
  format,
}: NumberTickerProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.6 });
  const [armed, setArmed] = useState(!startOnView);

  useEffect(() => {
    if (startOnView && inView) setArmed(true);
  }, [startOnView, inView]);

  const text = useMemo(() => {
    const rounded = Math.round(value);
    const formatted = format
      ? format(rounded)
      : locale
        ? rounded.toLocaleString()
        : rounded.toString();
    return pad ? formatted.padStart(pad, "0") : formatted;
  }, [value, pad, format, locale]);
  const glyphs = useMemo(() => {
    const chars = text.split("");
    // Key by place value (position from the right): a changing digit keeps its
    // identity and rolls to the new value instead of remounting and replaying
    // from 0. Growing numbers add glyphs on the left without re-keying the
    // ones, tens, hundreds already on screen.
    return chars.map((char, i) => ({ char, id: `g-${chars.length - 1 - i}` }));
  }, [text]);
  const readableText = `${prefix ?? ""}${text}${suffix ?? ""}`;

  // Stagger is an entrance flourish. Once the reveal has played, value
  // changes roll every digit immediately — a per-digit delay on live updates
  // reads as lag.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!armed || entered) return;
    const total = (duration + glyphs.length * stagger) * 1000;
    const t = window.setTimeout(() => setEntered(true), total);
    return () => window.clearTimeout(t);
  }, [armed, entered, duration, stagger, glyphs.length]);

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex items-center tabular-nums", className)}
    >
      <span className="sr-only">{readableText}</span>
      <span aria-hidden="true" className="inline-flex items-center">
        {prefix ? <span>{prefix}</span> : null}
        {glyphs.map(({ char, id }, i) => {
          const isDigit = /\d/.test(char);
          if (!isDigit) {
            return (
              <span key={id} className="inline-block">
                {char}
              </span>
            );
          }
          const digit = Number(char);
          return (
            <Digit
              key={id}
              digit={armed ? digit : 0}
              delay={entered ? 0 : i * stagger}
              duration={duration}
              blur={blur}
              className={digitClassName}
            />
          );
        })}
        {suffix ? <span>{suffix}</span> : null}
      </span>
    </span>
  );
}

function Digit({
  digit,
  delay,
  duration,
  blur,
  className,
}: {
  digit: number;
  delay: number;
  duration: number;
  blur: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const columnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce || !blur || !columnRef.current || !Number.isFinite(digit)) {
      return;
    }

    const node = columnRef.current;
    const controls = animate(
      node,
      { filter: ["blur(10px)", "blur(0px)"] },
      {
        duration: Math.min(duration * 0.75, 0.32),
        delay,
        ease: EASE_OUT,
      },
    );

    return () => {
      controls.stop();
      node.style.filter = "blur(0px)";
    };
  }, [blur, delay, digit, duration, reduce]);

  return (
    <span
      className={cn("relative inline-block overflow-hidden", className)}
      style={{ height: `${DIGIT_HEIGHT_EM}em`, width: "1ch" }}
    >
      <motion.span
        ref={columnRef}
        initial={{ y: 0 }}
        animate={{ y: `-${digit * DIGIT_HEIGHT_EM}em` }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration, delay, ease: EASE_OUT }
        }
        className="absolute inset-x-0 top-0 flex flex-col items-center will-change-[transform,filter]"
      >
        {DIGITS.map((n) => (
          <span
            key={n}
            className="flex h-[1.1em] items-center justify-center leading-none"
          >
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: clsx, motion, tailwind-merge

### Notes
stat / number / ticker / metric display archetype (second beUI implementation)

## beUI / Marquee

Source page: https://beui.dev/components/motion/marquee

_Infinite horizontal or vertical scroll with pause-on-hover._

### Source

`components/motion/marquee.tsx` (registry:component)

```tsx
// beui.dev/components/motion/marquee
import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  speed?: number;
  pauseOnHover?: boolean;
  gap?: string;
  className?: string;
  fade?: boolean;
}

export function Marquee({
  children,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  gap = "1rem",
  className,
  fade = true,
}: MarqueeProps) {
  const vertical = direction === "up" || direction === "down";
  const reverse = direction === "right" || direction === "down";
  const items = Children.toArray(children);

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        fade && !vertical && "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        fade && vertical && "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
      // gap on the wrapper too, so the seam between the two tracks matches the
      // spacing between items and the loop stays even.
      style={{ "--gap": gap, gap } as React.CSSProperties}
    >
      {[0, 1].map((dup) => (
        <div
          key={dup}
          aria-hidden={dup === 1}
          inert={dup === 1}
          style={{
            animationDuration: `${speed}s`,
            animationDirection: reverse ? "reverse" : "normal",
            gap,
          }}
          className={cn(
            "flex shrink-0 items-center",
            vertical ? "flex-col animate-marquee-vertical" : "flex-row animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
        >
          {items.map((child, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Marquee duplicates static child slots; item order is not mutated.
            <div key={i} className="shrink-0">
              {child}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: clsx, tailwind-merge

### Notes
marquee / logo row archetype

## beUI / Infinite Masonry

Source page: https://beui.dev/components/blocks/infinite-masonry

_Responsive virtualized masonry that measures variable-height cards and loads more data as the user nears the end._

### Source

`components/motion/infinite-masonry.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/blocks/infinite-masonry

import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Inbox } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type InfiniteMasonryKey = string | number | bigint;

export interface InfiniteMasonryProps<T> {
  items: readonly T[];
  getItemKey: (item: T, index: number) => InfiniteMasonryKey;
  renderItem: (item: T, index: number) => ReactNode;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  estimateSize?: (item: T, index: number) => number;
  renderLoadingItem?: (index: number) => ReactNode;
  emptyState?: ReactNode;
  endState?: ReactNode;
  minColumnWidth?: number;
  maxColumns?: number;
  gap?: number;
  overscan?: number;
  prefetch?: number;
  animateItems?: boolean;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
}

type MasonryMetrics = {
  columns: number;
  width: number;
};

function useMasonryMetrics({
  elementRef,
  gap,
  maxColumns,
  minColumnWidth,
}: {
  elementRef: React.RefObject<HTMLDivElement | null>;
  gap: number;
  maxColumns: number;
  minColumnWidth: number;
}) {
  const [metrics, setMetrics] = useState<MasonryMetrics>({
    columns: 1,
    width: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const update = (width: number) => {
      const columns = Math.min(
        maxColumns,
        Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap))),
      );

      setMetrics((current) =>
        current.columns === columns && current.width === width
          ? current
          : { columns, width },
      );
    };

    update(element.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      update(entry.contentRect.width);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, gap, maxColumns, minColumnWidth]);

  return metrics;
}

function DefaultLoadingItem({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-2xl border border-border bg-card p-3"
      style={{ minHeight: 144 + (index % 3) * 36 }}
    >
      <div className="h-3 w-2/3 rounded-full bg-muted" />
      <div className="mt-3 h-2 w-full rounded-full bg-muted" />
      <div className="mt-2 h-2 w-4/5 rounded-full bg-muted" />
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center px-6 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-foreground">No items yet</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        New items will appear here when they become available.
      </p>
    </div>
  );
}

function MasonryItemReveal({
  itemKey,
  lane,
  revealedKeys,
  animate,
  children,
}: {
  itemKey: InfiniteMasonryKey;
  lane: number;
  revealedKeys: MutableRefObject<Set<InfiniteMasonryKey>>;
  animate: boolean;
  children: ReactNode;
}) {
  const [shouldReveal] = useState(
    () => animate && !revealedKeys.current.has(itemKey),
  );

  useEffect(() => {
    revealedKeys.current.add(itemKey);
  }, [itemKey, revealedKeys]);

  const delay = Math.min(lane, 3) * 0.04;

  return (
    <motion.div
      initial={shouldReveal ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        y: { ...SPRING_PANEL, delay },
        opacity: { duration: 0.2, ease: EASE_OUT, delay },
      }}
    >
      {children}
    </motion.div>
  );
}

export function InfiniteMasonry<T>({
  items,
  getItemKey,
  renderItem,
  onLoadMore,
  hasMore,
  loading = false,
  error,
  onRetry,
  estimateSize = () => 240,
  renderLoadingItem = (index) => <DefaultLoadingItem index={index} />,
  emptyState = <DefaultEmptyState />,
  endState,
  minColumnWidth = 208,
  maxColumns = 4,
  gap = 12,
  overscan = 4,
  prefetch = 3,
  animateItems = true,
  ariaLabel = "Infinite masonry feed",
  className,
  contentClassName,
  itemClassName,
}: InfiniteMasonryProps<T>) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  const loadPendingRef = useRef(false);
  const initialItemCountRef = useRef(items.length);
  const revealedKeysRef = useRef(new Set<InfiniteMasonryKey>());
  const { columns, width } = useMasonryMetrics({
    elementRef: contentRef,
    gap,
    maxColumns,
    minColumnWidth,
  });

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!loading) loadPendingRef.current = false;
  }, [loading]);

  const hasError = error !== undefined && error !== null;
  const tailCount = hasError ? 1 : loading ? columns : 0;
  const virtualizer = useVirtualizer({
    count: items.length + tailCount,
    getScrollElement: () => scrollRef.current,
    getItemKey: (index) =>
      index < items.length
        ? getItemKey(items[index], index)
        : `masonry-tail-${index - items.length}`,
    estimateSize: (index) =>
      index < items.length
        ? estimateSize(items[index], index)
        : 144 + ((index - items.length) % 3) * 36,
    gap,
    lanes: columns,
    overscan: overscan * columns,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const viewportEnd =
    (virtualizer.scrollOffset ?? 0) + (virtualizer.scrollRect?.height ?? 0);
  const lastVisibleIndex = virtualItems.reduce(
    (lastIndex, item) =>
      item.start < viewportEnd ? Math.max(lastIndex, item.index) : lastIndex,
    -1,
  );

  useEffect(() => {
    if (
      hasError ||
      loading ||
      !hasMore ||
      loadPendingRef.current ||
      lastVisibleIndex < Math.max(0, items.length - prefetch)
    ) {
      return;
    }

    loadPendingRef.current = true;
    void Promise.resolve(loadMoreRef.current()).finally(() => {
      loadPendingRef.current = false;
    });
  }, [hasError, hasMore, items.length, lastVisibleIndex, loading, prefetch]);

  if (items.length === 0 && !hasMore && !loading && !hasError) {
    return (
      <section
        aria-label={ariaLabel}
        className={cn(
          "w-full overflow-hidden rounded-3xl border border-border bg-background",
          className,
        )}
      >
        {emptyState}
      </section>
    );
  }

  const columnWidth =
    columns > 0 ? Math.max(0, (width - gap * (columns - 1)) / columns) : 0;

  return (
    <section
      ref={scrollRef}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={cn(
        "w-full contain-[layout_paint] overflow-y-auto overscroll-none rounded-3xl border border-border bg-background p-3 [overflow-anchor:none] [scrollbar-gutter:stable]",
        className,
      )}
    >
      <div
        ref={contentRef}
        className={cn("relative w-full", contentClassName)}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((virtualItem) => {
          const isTail = virtualItem.index >= items.length;
          const tailIndex = virtualItem.index - items.length;

          return (
            <div
              key={virtualItem.key}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className={cn(
                "absolute left-0 top-0 will-change-transform",
                !isTail && itemClassName,
              )}
              style={{
                width: columnWidth,
                transform: `translate3d(${virtualItem.lane * (columnWidth + gap)}px, ${virtualItem.start}px, 0)`,
              }}
            >
              {isTail ? (
                hasError ? (
                  <div className="flex min-h-36 flex-col items-start justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="size-4" aria-hidden="true" />
                      <p className="text-sm font-medium">Couldn&apos;t load more</p>
                    </div>
                    <div className="mt-2 text-xs leading-5 text-muted-foreground">
                      {error}
                    </div>
                    {onRetry ? (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 min-h-10 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Try again
                      </button>
                    ) : null}
                  </div>
                ) : (
                  renderLoadingItem(tailIndex)
                )
              ) : (
                <MasonryItemReveal
                  itemKey={virtualItem.key}
                  lane={virtualItem.lane}
                  revealedKeys={revealedKeysRef}
                  animate={
                    animateItems &&
                    !reduceMotion &&
                    virtualItem.index >= initialItemCountRef.current
                  }
                >
                  {renderItem(items[virtualItem.index], virtualItem.index)}
                </MasonryItemReveal>
              )}
            </div>
          );
        })}
      </div>

      {!hasMore && items.length > 0 && endState ? (
        <div className="py-4 text-center text-xs text-muted-foreground">
          {endState}
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {loading ? "Loading more items" : null}
      </span>
    </section>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: @tanstack/react-virtual, clsx, lucide-react, motion, tailwind-merge

### Notes
bento grid / proof cards archetype (masonry variant)

## beUI / Tilt Card

Source page: https://beui.dev/components/motion/tilt-card

_3D perspective tilt on hover with cursor-tracked glare._

### Source

`components/motion/tilt-card.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/motion/tilt-card

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { SPRING_MOUSE } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface TiltCardProps {
  children: ReactNode;
  max?: number;
  glare?: boolean;
  className?: string;
}

export function TiltCard({ children, max = 12, glare = true, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  // Decorative cursor-follow: skip on touch (phantom hover) and reduced motion.
  const enabled = !reduce && canHover;
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const srx = useSpring(rx, SPRING_MOUSE);
  const sry = useSpring(ry, SPRING_MOUSE);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * max);
    rx.set((0.5 - py) * max);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const transform = useMotionTemplate`perspective(1000px) rotateX(${srx}deg) rotateY(${sry}deg)`;
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, var(--foreground), transparent 50%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transformStyle: "preserve-3d" }}
      className={cn("relative overflow-hidden rounded-2xl will-change-transform", className)}
    >
      {children}
      {glare && enabled ? (
        <motion.div
          aria-hidden
          style={{ background: glareBg }}
          className="pointer-events-none absolute inset-0 opacity-15"
        />
      ) : null}
    </motion.div>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/hooks/use-hover-capable.ts` (registry:hook)

```tsx
"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only on devices that have a true hover (mouse / trackpad).
 * Touch devices fire phantom `:hover` on tap that sticks until tap-elsewhere
 * — gate hover-only effects (scale lifts, magnetic pulls) behind this.
 */
export function useHoverCapable() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return canHover;
}
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: clsx, motion, tailwind-merge

### Notes
card hover archetype

## beUI / Animated Badge

Source page: https://beui.dev/components/motion/animated-badge

_Status badge with animated state icons, pulse feedback and compact size variants._

### Source

`components/motion/animated-badge.tsx` (registry:component)

```tsx
"use client";
// beui.dev/components/motion/animated-badge

import {
  AlertTriangle,
  Check,
  Circle,
  Info,
  LoaderCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type AnimatedBadgeStatus =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "loading";

export type AnimatedBadgeSize = "sm" | "md";

export interface AnimatedBadgeProps extends Omit<
  HTMLMotionProps<"span">,
  "children"
> {
  status?: AnimatedBadgeStatus;
  size?: AnimatedBadgeSize;
  children?: ReactNode;
  icon?: ReactNode;
  showIcon?: boolean;
  pulse?: boolean;
  contentKey?: string | number;
}

const STATUS_CLASS: Record<AnimatedBadgeStatus, string> = {
  neutral: "border-border bg-card text-muted-foreground",
  info: "border-primary/30 bg-primary/10 text-primary",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  loading: "border-primary/30 bg-primary/10 text-primary",
};

const SIZE_CLASS: Record<AnimatedBadgeSize, string> = {
  sm: "h-6 gap-1.5 px-2 text-[11px]",
  md: "h-8 gap-2 px-3 text-xs",
};

const ICON_CLASS: Record<AnimatedBadgeSize, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
};

const ICONS: Record<AnimatedBadgeStatus, LucideIcon> = {
  neutral: Circle,
  info: Info,
  success: Check,
  warning: AlertTriangle,
  danger: X,
  loading: LoaderCircle,
};

const ICON_ROLL_VARIANTS: Variants = {
  initial: {
    opacity: 0.72,
    y: "80%",
    scale: 0.92,
    rotate: -8,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: "0%",
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
    transition: {
      y: { type: "spring", stiffness: 210, damping: 24, mass: 0.85 },
      scale: { type: "spring", stiffness: 250, damping: 24, mass: 0.75 },
      rotate: { duration: 0.28, ease: EASE_OUT },
      opacity: { duration: 0.28, ease: EASE_OUT },
      filter: { duration: 0.42, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0.5,
    y: "-80%",
    scale: 0.96,
    rotate: 8,
    filter: "blur(6px)",
    transition: { duration: 0.22, ease: EASE_OUT },
  },
};

const TEXT_ROLL_VARIANTS: Variants = {
  initial: { opacity: 0.76, y: "85%", filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: {
      y: { type: "spring", stiffness: 210, damping: 24, mass: 0.85 },
      opacity: { duration: 0.3, ease: EASE_OUT },
      filter: { duration: 0.42, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0.5,
    y: "-85%",
    filter: "blur(6px)",
    transition: { duration: 0.2, ease: EASE_OUT },
  },
};

export function AnimatedBadge({
  status = "neutral",
  size = "md",
  children,
  icon,
  showIcon = true,
  pulse = status === "loading",
  contentKey,
  className,
  ...rest
}: AnimatedBadgeProps) {
  const reduce = useReducedMotion();
  const Icon = ICONS[status];
  const resolvedContentKey =
    contentKey ??
    (typeof children === "string" || typeof children === "number"
      ? children
      : status);

  return (
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.7 }}
      className={cn(
        "relative inline-flex shrink-0 items-center overflow-hidden whitespace-nowrap rounded-full border font-medium tabular-nums",
        "transition-colors duration-300",
        STATUS_CLASS[status],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {pulse && !reduce ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-current opacity-10"
          animate={{ scale: [0.94, 1.08, 0.94], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {showIcon ? (
        <span className="relative z-10 inline-flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              aria-hidden
              data-badge-icon
              variants={ICON_ROLL_VARIANTS}
              initial={reduce ? false : "initial"}
              animate={reduce ? { opacity: 1 } : "animate"}
              exit={reduce ? undefined : "exit"}
              className="inline-flex will-change-transform"
            >
              {status === "loading" && !reduce && !icon ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-flex"
                >
                  <Icon className={ICON_CLASS[size]} />
                </motion.span>
              ) : (
                (icon ?? <Icon className={ICON_CLASS[size]} />)
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      ) : null}
      {children != null ? (
        <span className="relative z-10 inline-flex overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={resolvedContentKey}
              data-badge-label
              variants={TEXT_ROLL_VARIANTS}
              initial={reduce ? false : "initial"}
              animate={reduce ? { opacity: 1 } : "animate"}
              exit={reduce ? undefined : "exit"}
              className="inline-block will-change-transform"
            >
              {children}
            </motion.span>
          </AnimatePresence>
        </span>
      ) : null}
    </motion.span>
  );
}
```

`lib/ease.ts` (registry:lib)

```tsx
// Shared motion tokens. Easing curves mirror the CSS custom properties in
// globals.css; springs are the canonical physics used across components.
// Strong custom variants — defaults like `ease-in`/`ease-out` feel weak.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
```

`lib/utils.ts` (registry:lib)

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Dependencies

- npm: clsx, lucide-react, motion, tailwind-merge

### Notes
badge/pill archetype
