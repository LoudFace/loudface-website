# Component Harvest: Fluid Functionalism + Watermelon UI
Harvested 2026-08-29 for the LoudFace website design lab. House context: B2B agency site, deep-indigo color stages + crisp light rhythm, calm exponential-ease motion, structured layouts.
Both source repos are MIT-licensed and both are shadcn-style registries designed for verbatim copy-into-your-project use, so full source capture below is the intended workflow, not a copyright concern.

---

## 1. Fluid Functionalism (`mickadesign/fluid-functionalism`)
**Enumeration result:** the full `registry/` tree (base / default / radix, 15 primitives each, ~57 files total) was listed via the GitHub trees API. It contains **zero** hero, marketing-section, marquee/ticker, feature/process/step-section, stats, or testimonial/proof components — the whole registry is interaction primitives (accordion, button, dialog, dropdown, select, sidebar, slider, switch, tabs, tooltip, chat-message, table, nav-menu, thinking-indicator, etc.). **So: no hero/marketing/marquee/stats/testimonial match exists in this repo — that is a real, confirmed result, not a gap in the search.**

What the repo IS strong on is the requested **calm motion primitives** category: every animated component shares one spring/easing system (`lib/springs.ts`) that is deliberately non-bouncy (critically damped, `bounce: 0` on the fast/moderate tiers) with a separate, quicker, bounce-free exit tween — exactly the 'no bounce/glow' brief. The 6 components below are the best matches for that category, picked from the `base/` tier (framework-agnostic, no Radix/Base-UI dependency).

### `springs.ts`
- **Path:** `registry/default/lib/springs.ts`
- **Archetype:** motion primitive — shared spring/easing tokens
- **Dependencies:** none (plain TS)
- **Why it's here:** The foundation every other animated primitive imports. Three tiers (fast/moderate/slow), each with a matching non-bounce exit tween. This is the calm-motion contract itself.

```ts
// Motion tokens. Each tier's value is the ENTER transition — a critically
// damped spring, except the largest tier which keeps a little bounce. Its
// `.exit` is the matching EXIT transition — a plain tween, no bounce, one tier
// quicker — so a dismissal reads as crisp and final rather than replaying the
// entrance in reverse.
//
//   transition={spring.fast}                              // enter
//   exit={{ opacity: 0, transition: spring.fast.exit }}   // leave
//
// The bigger the thing that moves, the slower the spring. Never hand-write a
// duration — always reach for a tier.
export const spring = {
  fast: {
    type: "spring" as const,
    duration: 0.08,
    bounce: 0,
    exit: { duration: 0.06 },
  },
  // Critically damped: same perceived speed as a bouncier tier, but lands
  // exactly with no overshoot — for short travel and panels/sheets that must
  // settle precisely (dropdowns, tabs, drawers, merged selection backgrounds).
  moderate: {
    type: "spring" as const,
    duration: 0.16,
    bounce: 0,
    exit: { duration: 0.12 },
  },
  slow: {
    type: "spring" as const,
    duration: 0.24,
    bounce: 0.12,
    exit: { duration: 0.16 },
  },
} as const;

// Fallback delay (ms) for deferred-unmount timers that guard an exit tween:
// popups keep their portal mounted until onAnimationComplete fires, but a
// throttled/background tab can stall the animation, so a timer force-unmounts
// after the tier's exit duration plus a safety buffer. Deriving it here keeps
// the timers in step with the tokens above.
export const exitFallbackMs = (tier: { exit: { duration: number } }) =>
  Math.round(tier.exit.duration * 1000) + 100;

```

### `accordion.tsx`
- **Path:** `registry/base/accordion.tsx`
- **Archetype:** calm motion primitive — reveal/collapse
- **Dependencies:** @/lib/springs (above)
- **Why it's here:** Collapsible panel reveal using `spring.moderate`/`spring.fast` with 0-duration snaps for layout hand-offs — no overshoot.

```tsx
"use client";

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

// SSR-safe layout effect (client components still server-render in Next).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { cn } from "@/lib/utils";
import { useIcon } from "@/lib/icon-context";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { useShape } from "@/lib/shape-context";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";

// ─── Contexts ────────────────────────────────────────────────────────────────

interface ItemRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface AccordionGroupContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  registerFullItem: (index: number, element: HTMLElement | null) => void;
  activeIndex: number | null;
  grouped: true;
  remeasure: () => void;
  openValues: Set<string>;
  openItemRects: Map<number, ItemRect>;
}

const AccordionGroupContext =
  createContext<AccordionGroupContextValue | null>(null);

function useAccordionGroup() {
  return useContext(AccordionGroupContext);
}

interface AccordionItemContextValue {
  index?: number;
  value: string;
  isOpen: boolean;
  triggerRef: React.MutableRefObject<HTMLDivElement | null>;
  /** Standalone items carry the group's choice themselves. */
  highlight: "trigger" | "item";
}

const AccordionItemContext =
  createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext() {
  const ctx = useContext(AccordionItemContext);
  if (!ctx)
    throw new Error(
      "AccordionTrigger/AccordionContent must be used within an AccordionItem"
    );
  return ctx;
}

// ─── AccordionGroup ──────────────────────────────────────────────────────────

type AccordionGroupSingleProps = {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
};

type AccordionGroupMultipleProps = {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type AccordionGroupProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Pins the group's rows to one step of the size ladder (default 36px,
   *  compact 28px — see /docs/sizes). Omitted, they follow the surrounding
   *  SizeProvider. */
  size?: SizeVariant;
  /** What an open item tints. "item" paints the row and its panel as one
   *  block, and holds while it stays open. "trigger" scopes the fill to the
   *  row and shows it on hover only, leaving the panel on the page's own
   *  surface — the way a sidebar row highlights without colouring its
   *  sub-tree. @default "item" */
  highlight?: "trigger" | "item";
} & (AccordionGroupSingleProps | AccordionGroupMultipleProps);

const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  (props, ref) => {
    const {
      children,
      highlight = "item",
      type = "single",
      size,
      className,
      ...rest
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const fullItemElementsRef = useRef<Map<number, HTMLElement>>(new Map());
    const [openItemRects, setOpenItemRects] = useState<Map<number, ItemRect>>(
      new Map()
    );
    const openItemRectsRef = useRef(openItemRects);

    const {
      activeIndex,
      setActiveIndex,
      itemRects,
      sessionRef,
      handlers,
      registerItem,
      measureItems,
    } = useProximityHover(containerRef);

    const registerFullItem = useCallback(
      (index: number, element: HTMLElement | null) => {
        if (element) {
          fullItemElementsRef.current.set(index, element);
        } else {
          fullItemElementsRef.current.delete(index);
        }
      },
      []
    );

    const measureFullItems = useCallback(() => {
      if (!containerRef.current) return;
      const next = new Map<number, ItemRect>();
      fullItemElementsRef.current.forEach((el, idx) => {
        next.set(idx, {
          top: el.offsetTop,
          left: el.offsetLeft,
          width: el.offsetWidth,
          height: el.offsetHeight,
        });
      });
      // Skip the state update when nothing moved (mirrors the proximity
      // hook's measureItems guard) — this runs per animation frame via
      // onUpdate, and an unconditional set would invalidate the group
      // context and re-render every item even on no-op remeasures.
      const prev = openItemRectsRef.current;
      let changed = prev.size !== next.size;
      if (!changed) {
        for (const [idx, r] of next) {
          const p = prev.get(idx);
          if (
            !p ||
            p.top !== r.top ||
            p.left !== r.left ||
            p.width !== r.width ||
            p.height !== r.height
          ) {
            changed = true;
            break;
          }
        }
      }
      if (!changed) return;
      openItemRectsRef.current = next;
      setOpenItemRects(next);
    }, []);

    const [internalSingleValue, setInternalSingleValue] = useState<string>(
      () => {
        if (type === "single") {
          const sp = props as AccordionGroupSingleProps;
          return sp.defaultValue ?? "";
        }
        return "";
      }
    );
    const [internalMultipleValue, setInternalMultipleValue] = useState<
      string[]
    >(() => {
      if (type === "multiple") {
        const mp = props as AccordionGroupMultipleProps;
        return mp.defaultValue ?? [];
      }
      return [];
    });
    const singleOnValueChange = (props as AccordionGroupSingleProps).onValueChange;
    const multipleOnValueChange = (props as AccordionGroupMultipleProps).onValueChange;

    const openValuesList: string[] =
      type === "multiple"
        ? (props as AccordionGroupMultipleProps).value ?? internalMultipleValue
        : (() => {
            const v =
              (props as AccordionGroupSingleProps).value ?? internalSingleValue;
            return v ? [v] : [];
          })();

    // Keyed on the joined values so the Set (and the group context value
    // below) keeps a stable identity across re-renders where the open values
    // haven't actually changed.
    const openValuesKey = openValuesList.join(",");

    const openValues = useMemo(
      () => new Set(openValuesList),
      // Deliberately keyed on the joined string, not the (fresh) array.
      [openValuesKey]
    );

    const handleSingleValueChange = useCallback(
      (value: string) => {
        const sp = props as AccordionGroupSingleProps;
        if (sp.onValueChange) sp.onValueChange(value);
        else setInternalSingleValue(value);
      },
      [singleOnValueChange]
    );

    const handleMultipleValueChange = useCallback(
      (value: string[]) => {
        const mp = props as AccordionGroupMultipleProps;
        if (mp.onValueChange) mp.onValueChange(value);
        else setInternalMultipleValue(value);
      },
      [multipleOnValueChange]
    );

    useEffect(() => {
      measureItems();
      measureFullItems();
    }, [measureItems, measureFullItems, children]);

    useEffect(() => {
      measureItems();
      measureFullItems();
    }, [measureItems, measureFullItems, openValuesKey]);

    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const activeRect = activeIndex !== null ? itemRects[activeIndex] : null;
    const focusRect = focusedIndex !== null ? itemRects[focusedIndex] : null;
    // An open item tints its trigger by default; "item" restores the older
    // block treatment that spans the panel too. The trigger rects are the
    // ones proximity already tracks, so this is a choice of source.
    // "trigger" tints the open row only while you're on it: the panel below
    // already says the item is open, so the fill goes back to being a hover
    // affordance rather than a persistent state.
    const expandedRects =
      highlight === "item"
        ? openItemRects
        : new Map(
            [...openItemRects.keys()].flatMap((idx) => {
              const rect = idx === activeIndex ? itemRects[idx] : null;
              return rect ? ([[idx, rect]] as [number, ItemRect][]) : [];
            })
          );

    const isHoveringNonOpen =
      activeIndex !== null && !openItemRects.has(activeIndex);
    const shape = useShape();

    const {
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _onValueChange,
      collapsible: _collapsible,
      type: _type,
      ...htmlProps
    } = rest as Record<string, unknown>;

    // Translate FF API → Base UI Accordion API.
    // Base UI always uses `value: string[]` and a `multiple: boolean`. In
    // single mode we wrap the active value in a single-element array.
    const baseValue: string[] =
      type === "multiple"
        ? (props as AccordionGroupMultipleProps).value ??
          internalMultipleValue
        : (() => {
            const v =
              (props as AccordionGroupSingleProps).value ?? internalSingleValue;
            return v ? [v] : [];
          })();

    const baseOnValueChange = (next: string[]) => {
      if (type === "multiple") handleMultipleValueChange(next);
      else handleSingleValueChange(next[0] ?? "");
    };

    const remeasure = useCallback(() => {
      measureItems();
      measureFullItems();
    }, [measureItems, measureFullItems]);

    // Memoized: the group re-renders on every proximity-hover mousemove; a
    // fresh context object each time would re-render every item with it.
    const groupContextValue = useMemo<AccordionGroupContextValue>(
      () => ({
        registerItem,
        registerFullItem,
        activeIndex,
        grouped: true,
        remeasure,
        openValues,
        openItemRects,
      }),
      [
        registerItem,
        registerFullItem,
        activeIndex,
        remeasure,
        openValues,
        openItemRects,
      ]
    );

    const group = (
      <AccordionGroupContext.Provider value={groupContextValue}>
        <AccordionPrimitive.Root
          value={baseValue}
          onValueChange={baseOnValueChange}
          multiple={type === "multiple"}
          render={(rootProps) => {
            const {
              style: _baseStyle,
              onDrag: _onDrag,
              onDragStart: _onDragStart,
              onDragEnd: _onDragEnd,
              onAnimationStart: _onAnimationStart,
              onAnimationEnd: _onAnimationEnd,
              onAnimationIteration: _onAnimationIteration,
              ...restRoot
            } = rootProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <div
                {...restRoot}
                ref={(node) => {
                  (
                    containerRef as React.MutableRefObject<HTMLDivElement | null>
                  ).current = node;
                  if (typeof ref === "function") ref(node);
                  else if (ref)
                    (
                      ref as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node;
                }}
                onMouseEnter={handlers.onMouseEnter}
                onMouseMove={(e) => {
                  const container = containerRef.current;
                  if (container) {
                    const cRect = container.getBoundingClientRect();
                    const layoutH = container.offsetHeight;
                    const visualH = cRect.height;
                    const scale = layoutH > 0 ? visualH / layoutH : 1;
                    const localY =
                      (e.clientY - cRect.top) / scale + container.scrollTop;
                    for (const [idx, full] of openItemRects) {
                      const trigger = itemRects[idx];
                      if (!trigger) continue;
                      const contentTop = trigger.top + trigger.height;
                      const contentBottom = full.top + full.height;
                      if (localY >= contentTop && localY <= contentBottom) {
                        setActiveIndex(null);
                        return;
                      }
                    }
                  }
                  handlers.onMouseMove(e);
                }}
                onMouseLeave={handlers.onMouseLeave}
                onFocus={(e) => {
                  const indexAttr = (e.target as HTMLElement)
                    .closest("[data-proximity-index]")
                    ?.getAttribute("data-proximity-index");
                  if (indexAttr != null) {
                    const idx = Number(indexAttr);
                    setActiveIndex(idx);
                    setFocusedIndex(
                      (e.target as HTMLElement).matches(":focus-visible")
                        ? idx
                        : null
                    );
                  }
                }}
                onBlur={(e) => {
                  if (
                    containerRef.current?.contains(e.relatedTarget as Node)
                  )
                    return;
                  setFocusedIndex(null);
                  setActiveIndex(null);
                }}
                className={cn(
                  "relative flex flex-col gap-0.5 w-72 max-w-full",
                  className
                )}
                {...(htmlProps as HTMLAttributes<HTMLDivElement>)}
              >
                {/* Expanded item backgrounds */}
                <AnimatePresence>
                  {[...expandedRects.entries()].map(([idx, rect]) => (
                    <motion.div
                      key={`expanded-${idx}`}
                      className={`absolute ${shape.bg} bg-accent/20 dark:bg-accent/12 pointer-events-none`}
                      // Fade in from the item's current rect: with initial={false}
                      // a newly-opened item's background would pop in at full
                      // opacity mid-layout-shift while the previous item's bg is
                      // still fading out — reads as a glitch when switching items
                      // (especially under /demo's scaled card). Geometry still
                      // snaps (duration 0) so the bg hugs the animating item.
                      initial={{
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        opacity: 0,
                      }}
                      animate={{
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        opacity: isHoveringNonOpen ? 0.7 : 1,
                      }}
                      exit={{ opacity: 0, transition: spring.moderate.exit }}
                      transition={{
                        top: { duration: 0 },
                        left: { duration: 0 },
                        width: { duration: 0 },
                        height: { duration: 0 },
                        opacity: { duration: 0.12 },
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Hover background */}
                <AnimatePresence>
                  {activeRect && (
                    <motion.div
                      key={sessionRef.current}
                      className={`absolute ${shape.bg} bg-hover pointer-events-none`}
                      initial={{
                        opacity: 0,
                        top: activeRect.top,
                        left: activeRect.left,
                        width: activeRect.width,
                        height: activeRect.height,
                      }}
                      animate={{
                        opacity: 1,
                        top: activeRect.top,
                        left: activeRect.left,
                        width: activeRect.width,
                        height: activeRect.height,
                      }}
                      exit={{ opacity: 0, transition: spring.fast.exit }}
                      transition={{
                        ...spring.fast,
                        opacity: { duration: 0.08 },
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Focus ring */}
                <AnimatePresence>
                  {focusRect && (
                    <motion.div
                      className={`absolute ${shape.focusRing} pointer-events-none z-20 border border-[color:var(--focus-ring,#6B97FF)]`}
                      initial={false}
                      animate={{
                        left: focusRect.left - 2,
                        top: focusRect.top - 2,
                        width: focusRect.width + 4,
                        height: focusRect.height + 4,
                      }}
                      exit={{ opacity: 0, transition: spring.fast.exit }}
                      transition={{
                        ...spring.fast,
                        opacity: { duration: 0.08 },
                      }}
                    />
                  )}
                </AnimatePresence>

                {children}
              </div>
            );
          }}
        />
      </AccordionGroupContext.Provider>
    );

    // A size prop pins every row in the group to one ladder step.
    return size ? <SizeProvider size={size}>{group}</SizeProvider> : group;
  }
);

AccordionGroup.displayName = "AccordionGroup";

// ─── Accordion (Standalone) ──────────────────────────────────────────────────

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: ((value: string) => void) | ((value: string[]) => void);
  /** Pins the accordion's rows to one step of the size ladder (default 36px,
   *  compact 28px — see /docs/sizes). Omitted, they follow the surrounding
   *  SizeProvider. */
  size?: SizeVariant;
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      children,
      type = "single",
      collapsible = true,
      defaultValue,
      value,
      onValueChange,
      size,
      className,
      ...props
    },
    ref
  ) => {
    void collapsible; // Base UI's single-mode is always collapsible.

    const [internalSingleValue, setInternalSingleValue] = useState<string>(
      () => {
        if (type === "single") {
          return (defaultValue as string) ?? "";
        }
        return "";
      }
    );
    const [internalMultipleValue, setInternalMultipleValue] = useState<
      string[]
    >(() => {
      if (type === "multiple") {
        return (defaultValue as string[]) ?? [];
      }
      return [];
    });

    const openValues = new Set<string>(
      type === "multiple"
        ? (value as string[] | undefined) ?? internalMultipleValue
        : (() => {
            const v = (value as string | undefined) ?? internalSingleValue;
            return v ? [v] : [];
          })()
    );

    const handleSingleChange = useCallback(
      (v: string) => {
        if (onValueChange) (onValueChange as (v: string) => void)(v);
        else setInternalSingleValue(v);
      },
      [onValueChange]
    );

    const handleMultipleChange = useCallback(
      (v: string[]) => {
        if (onValueChange) (onValueChange as (v: string[]) => void)(v);
        else setInternalMultipleValue(v);
      },
      [onValueChange]
    );

    const baseValue: string[] =
      type === "multiple"
        ? (value as string[] | undefined) ?? internalMultipleValue
        : (() => {
            const v = (value as string | undefined) ?? internalSingleValue;
            return v ? [v] : [];
          })();

    const baseOnValueChange = (next: string[]) => {
      if (type === "multiple") handleMultipleChange(next);
      else handleSingleChange(next[0] ?? "");
    };

    const root = (
      <AccordionPrimitive.Root
        value={baseValue}
        onValueChange={baseOnValueChange}
        multiple={type === "multiple"}
        render={(rootProps) => {
          const { style: _s, ...restRoot } = rootProps as React.HTMLAttributes<HTMLDivElement>;
          return (
            <div
              {...restRoot}
              ref={ref}
              className={cn(
                "w-72 max-w-full flex flex-col gap-0.5",
                className
              )}
              {...props}
            >
              <StandaloneOpenContext.Provider value={openValues}>
                {children}
              </StandaloneOpenContext.Provider>
            </div>
          );
        }}
      />
    );

    // A size prop pins every row to one ladder step.
    return size ? <SizeProvider size={size}>{root}</SizeProvider> : root;
  }
);

Accordion.displayName = "Accordion";

const StandaloneOpenContext = createContext<Set<string>>(new Set());

// ─── AccordionItem ───────────────────────────────────────────────────────────

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  index?: number;
  disabled?: boolean;
  /** Standalone equivalent of AccordionGroup's prop: what an open item
   *  tints. Ignored inside a group, which decides for all its rows.
   *  @default "item" */
  highlight?: "trigger" | "item";
  children: ReactNode;
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, index, disabled, highlight = "item", children, className, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const groupCtx = useAccordionGroup();
    const standaloneOpen = useContext(StandaloneOpenContext);
    const shape = useShape();

    const isOpen = groupCtx?.grouped
      ? groupCtx.openValues.has(value)
      : standaloneOpen.has(value);

    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (groupCtx?.grouped && index !== undefined) {
        groupCtx.registerItem(index, triggerRef.current);
        return () => groupCtx.registerItem(index, null);
      }
    }, [index, groupCtx]);

    useEffect(() => {
      if (groupCtx?.grouped && index !== undefined) {
        if (isOpen) {
          groupCtx.registerFullItem(index, internalRef.current);
        } else {
          groupCtx.registerFullItem(index, null);
        }
        return () => groupCtx.registerFullItem(index, null);
      }
    }, [index, groupCtx, isOpen]);

    return (
      <AccordionItemContext.Provider value={{ index, value, isOpen, triggerRef, highlight }}>
        <AccordionPrimitive.Item
          value={value}
          disabled={disabled}
          render={(itemProps) => {
            const { style: _s, ...restItem } = itemProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <div
                {...restItem}
                ref={(node) => {
                  (
                    internalRef as React.MutableRefObject<HTMLDivElement | null>
                  ).current = node;
                  if (typeof ref === "function") ref(node);
                  else if (ref)
                    (
                      ref as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node;
                }}
                data-proximity-index={index}
                className={cn(!groupCtx?.grouped && "relative", className)}
                {...props}
              >
                {/* Standalone expanded background. Under the default
                    "trigger" choice the tint lives inside AccordionTrigger,
                    where it covers the row and not the panel below it. */}
                {!groupCtx?.grouped && highlight === "item" && (
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className={`absolute inset-0 ${shape.bg} bg-accent/20 dark:bg-accent/12 pointer-events-none`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: spring.moderate.exit }}
                        transition={{ duration: 0.12 }}
                      />
                    )}
                  </AnimatePresence>
                )}
                {children}
              </div>
            );
          }}
        />
      </AccordionItemContext.Provider>
    );
  }
);

AccordionItem.displayName = "AccordionItem";

// ─── AccordionTrigger ────────────────────────────────────────────────────────

interface AccordionTriggerProps
  extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const ChevronRight = useIcon("chevron-right");
    const groupCtx = useAccordionGroup();
    const { index, isOpen, triggerRef, highlight } = useAccordionItemContext();
    const shape = useShape();
    const sizeClasses = useSize();
    const [isHovered, setIsHovered] = useState(false);

    const isActive = groupCtx?.grouped
      ? groupCtx.activeIndex === index
      : isHovered;

    const triggerContent = (
      // Render Header as a <div>. Base UI's Header defaults to <h3>, which
      // would be more semantic but breaks the ancestor selectors the styles
      // rely on.
      <AccordionPrimitive.Header render={<div />}>
        <AccordionPrimitive.Trigger
          ref={ref as React.Ref<HTMLElement>}
          className={cn(
            `relative z-10 flex items-center ${sizeClasses.gap} ${shape.item} ${sizeClasses.px} ${sizeClasses.variant === "compact" ? "py-1" : "py-2"} w-full cursor-pointer outline-none select-none`,
            !groupCtx?.grouped &&
              "focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)] focus-visible:ring-offset-0",
            className
          )}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {/* Label with dual-layer text */}
          <span className={cn("inline-grid flex-1 text-left", sizeClasses.text)}>
            <span
              className="col-start-1 row-start-1 invisible"
              style={{ fontVariationSettings: fontWeights.semibold }}
              aria-hidden="true"
            >
              {children}
            </span>
            <span
              className={cn(
                "col-start-1 row-start-1 transition-[color,font-variation-settings] duration-80",
                isOpen || isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              style={{
                fontVariationSettings:
                  isOpen ? fontWeights.semibold : fontWeights.normal,
              }}
            >
              {children}
            </span>
          </span>

          {/* Chevron */}
          <motion.span
            className="shrink-0 inline-flex items-center justify-center"
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={spring.fast}
          >
            <ChevronRight
              size={sizeClasses.icon}
              strokeWidth={isOpen || isActive ? 2 : 1.5}
              className={cn(
                "transition-[color,stroke-width] duration-80",
                isOpen || isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            />
          </motion.span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );

    if (groupCtx?.grouped) {
      return <div ref={triggerRef}>{triggerContent}</div>;
    }

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Open tint, scoped to this row: the panel below keeps the page's
            own surface, the way a sidebar row highlights without colouring
            its sub-tree. */}
        <AnimatePresence>
          {isOpen && highlight === "trigger" && isHovered && (
            <motion.div
              className={`absolute inset-0 ${shape.bg} bg-accent/20 dark:bg-accent/12 pointer-events-none`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // The expanded tint rides the moderate tier, like the grouped
              // one — it marks a state, where the hover fill below tracks the
              // pointer and stays fast.
              exit={{ opacity: 0, transition: spring.moderate.exit }}
              transition={{ duration: 0.12 }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className={`absolute inset-0 ${shape.bg} bg-hover pointer-events-none`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: spring.fast.exit }}
              transition={{ duration: 0.08 }}
            />
          )}
        </AnimatePresence>
        {triggerContent}
      </div>
    );
  }
);

AccordionTrigger.displayName = "AccordionTrigger";

// ─── AccordionContent ────────────────────────────────────────────────────────

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, ref) => {
    const groupCtx = useAccordionGroup();
    const { isOpen } = useAccordionItemContext();
    const sizeClasses = useSize();
    // Read here rather than relying on a MotionConfig the consumer may not
    // have: height is a positional value, so framer would otherwise animate
    // it for a reduced-motion user in any app that installs this component.
    const reduceMotion = useReducedMotion() ?? false;

    // The open height is animated to a self-measured LAYOUT pixel value, not
    // `height: "auto"`: framer resolves an "auto" target by measuring the
    // element's *visual* (transformed) size, so under a scaled ancestor
    // (e.g. /demo's 1.7x card) the animation overshoots to scale× the real
    // height and snaps back when the final "auto" lands — a visible height
    // reduction at the end of every open. offsetHeight and ResizeObserver
    // are transform-immune.
    const innerRef = useRef<HTMLDivElement | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    // Items open at mount render `initial: "auto"` and receive their first
    // pixel target a commit later; that hand-off must SNAP (duration 0), not
    // spring — framer would measure the spring's numeric start visually
    // (scaled) and play a shrink. Items that open later spring normally.
    const needsSnap = useRef(isOpen);
    // Height springs only when THIS panel toggles. When contentHeight
    // changes underneath it instead — anything collapsible nested inside
    // the panel, another accordion included — it must snap: a spring
    // re-targeted every frame chases the child's own animation, lands
    // after it, and drags everything below the item along late. Same rule
    // as SidebarGroup / SidebarMenuSub; see motion-guidelines.md.
    const prevOpenRef = useRef(isOpen);
    const togglingRef = useRef(false);
    if (prevOpenRef.current !== isOpen) {
      prevOpenRef.current = isOpen;
      togglingRef.current = true;
    }

    const measureRef = useCallback((el: HTMLDivElement | null) => {
      roRef.current?.disconnect();
      roRef.current = null;
      innerRef.current = el;
      if (!el) return;
      if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
      const ro = new ResizeObserver(() => {
        // Ignore the 0 that fires while the panel is display:none.
        if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
      });
      ro.observe(el);
      roRef.current = ro;
    }, []);

    // Re-measure synchronously (pre-paint) when opening, so the spring's
    // target is the fresh layout height from its first frame.
    useIsoLayoutEffect(() => {
      if (isOpen && innerRef.current && innerRef.current.offsetHeight > 0) {
        setContentHeight(innerRef.current.offsetHeight);
      }
    }, [isOpen]);

    useEffect(() => {
      if (contentHeight !== null) needsSnap.current = false;
    }, [contentHeight]);

    // Whether the framer-motion height exit animation has fully finished.
    // Base UI's Panel would apply `hidden` the moment a controlled item
    // closes (useCollapsibleRoot sets `mounted = false` in a layout effect
    // when no CSS transition/animation is detected on the panel element, and
    // useCollapsiblePanel derives `hidden = !open && !mounted`) — which is
    // `display: none` and would freeze the exit animation mid-flight. So we
    // take over the `hidden` attribute below and only apply it once the exit
    // has actually completed.
    const [exitComplete, setExitComplete] = useState(!isOpen);
    if (isOpen && exitComplete) {
      // Reset during render so the panel is un-hidden before the opening
      // animation's first paint.
      setExitComplete(false);
    }

    // Render through `<AccordionPrimitive.Panel keepMounted>` so the panel
    // element persists through the exit animation and the trigger ↔ panel
    // ARIA contract stays intact: the panel carries `role="region"`,
    // `aria-labelledby` and the id that the Trigger's `aria-controls` points
    // to. The framer-motion height animation lives one level down inside the
    // persistent panel element and flips its target with `isOpen` (content
    // stays mounted so it can be measured).
    return (
      <AccordionPrimitive.Panel
        keepMounted
        render={(panelProps) => {
          const {
            // Applied too early for our exit animation (see above); we
            // control the attribute ourselves.
            hidden: _baseHidden,
            // Only carries the --accordion-panel-height/width vars, which
            // stay 'auto' since Base UI never measures JS-driven animations;
            // dropped for parity with the Root/Item render props above.
            style: _baseStyle,
            ...restPanel
          } = panelProps as React.HTMLAttributes<HTMLDivElement> & {
            hidden?: boolean;
          };
          return (
            <div {...restPanel} hidden={!isOpen && exitComplete}>
              <motion.div
                ref={ref}
                className={cn("overflow-hidden", className)}
                initial={{ height: isOpen ? "auto" : 0 }}
                animate={{ height: isOpen ? contentHeight ?? 0 : 0, opacity: isOpen ? 1 : 0 }}
                // spring.fast lands with the trigger's chevron, and its
                // bounce: 0 keeps pure height from overshooting its content.
                // A close is a decision already made, so it takes the quicker
                // exit tier — the target flip has no `exit` prop to carry it.
                // Opacity runs ahead of the height on its own timing: the
                // body dissolves rather than being sliced by the clip edge,
                // which is what stops the rows below reading as shoved.
                transition={
                  needsSnap.current || reduceMotion || !togglingRef.current
                    ? { duration: 0 }
                    : isOpen
                      ? { ...spring.fast, opacity: { duration: 0.06 } }
                      : { ...spring.fast.exit, opacity: { duration: 0.04 } }
                }
                onUpdate={() => {
                  groupCtx?.remeasure();
                }}
                onAnimationComplete={() => {
                  togglingRef.current = false;
                  groupCtx?.remeasure();
                  if (!isOpen) setExitComplete(true);
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(props as any)}
              >
                <div
                  ref={measureRef}
                  className={cn(
                    "pt-1 text-muted-foreground",
                    sizeClasses.px,
                    sizeClasses.text,
                    sizeClasses.variant === "compact" ? "pb-2.5" : "pb-3"
                  )}
                >
                  {children}
                </div>
              </motion.div>
            </div>
          );
        }}
      />
    );
  }
);

AccordionContent.displayName = "AccordionContent";

export {
  Accordion,
  AccordionGroup,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
export default Accordion;

```

### `dialog.tsx`
- **Path:** `registry/base/dialog.tsx`
- **Archetype:** calm motion primitive — modal transition
- **Dependencies:** @/lib/springs (above)
- **Why it's here:** Modal enter/exit on `spring.slow`, the only tier with a touch of bounce (0.12) reserved for the largest on-screen movement; exit is a plain bounce-free tween.

```tsx
"use client";

import {
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIcon } from "@/lib/icon-context";
import { spring } from "@/lib/springs";
import { useShape } from "@/lib/shape-context";
import { useSize, useSizeVariant } from "@/lib/size-context";
import { SurfaceProvider, useSurface } from "@/lib/surface-context";
import { surfaceClasses } from "@/lib/surface-classes";
import { Button } from "@/components/ui/button";

const DIALOG_OFFSET = 4;

interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: ReactNode;
}

function Dialog({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal,
}: DialogProps) {
  // Base UI's Root handles controlled/uncontrolled state internally. We only
  // narrow the (open, eventDetails) callback to (open) for our public prop.
  return (
    <DialogPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
      modal={modal}
    >
      {children}
    </DialogPrimitive.Root>
  );
}

const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "lg";
  /** Portal target. When set, the overlay and panel render inside this element
   *  (positioned `absolute`) instead of covering the viewport (`fixed`). Pair
   *  with a `position: relative; overflow: hidden` container — and usually
   *  `<Dialog modal={false}>` — to scope a dialog to a bounded region, e.g. a
   *  docs preview. Defaults to the document body / full-viewport behaviour. */
  container?: HTMLElement | null;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, size = "sm", container, ...props }, ref) => {
    const XIcon = useIcon("x");
    const shape = useShape();
    const substrate = useSurface();
    const dialogLevel = Math.min(substrate + DIALOG_OFFSET, 8);
    // The size ladder narrows the dialog one notch in compact regions —
    // width only, the padding stays put (see /docs/sizes).
    const compact = useSize().variant === "compact";

    // No `if (!open) return null` here — Base UI's `<DialogPrimitive.Popup>`
    // handles mount/unmount itself, and waits for the framer-motion opacity
    // tween below to finish (via `element.getAnimations()`) before unmounting.
    // Returning null early would short-circuit the closing animation.
    return (
      <DialogPrimitive.Portal container={container ?? undefined}>
        <DialogPrimitive.Backdrop
          render={(backdropProps, state) => {
            const exiting = state.transitionStatus === "ending";
            const {
              style: _style,
              onDrag: _onDrag,
              onDragStart: _onDragStart,
              onDragEnd: _onDragEnd,
              onAnimationStart: _onAnimationStart,
              onAnimationEnd: _onAnimationEnd,
              onAnimationIteration: _onAnimationIteration,
              ...rest
            } = backdropProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <motion.div
                {...rest}
                className={cn(
                  container ? "absolute" : "fixed",
                  "inset-0 z-50 bg-black/40 dark:bg-black/80"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: exiting ? 0 : 1 }}
                transition={exiting ? spring.slow.exit : spring.slow}
              />
            );
          }}
        />
        <DialogPrimitive.Popup
          ref={ref}
          render={(popupProps, state) => {
            const exiting = state.transitionStatus === "ending";
            const {
              style: baseStyle,
              onDrag: _onDrag,
              onDragStart: _onDragStart,
              onDragEnd: _onDragEnd,
              onAnimationStart: _onAnimationStart,
              onAnimationEnd: _onAnimationEnd,
              onAnimationIteration: _onAnimationIteration,
              ...rest
            } = popupProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <motion.div
                // Base UI's props first (data attrs, refs, role, etc.)…
                {...rest}
                // …then the consumer's `<DialogContent>` props (className,
                // event handlers, data-*, etc.) land on the visible motion.div.
                {...(props as Omit<
                  React.HTMLAttributes<HTMLDivElement>,
                  | "onDrag"
                  | "onDragStart"
                  | "onDragEnd"
                  | "onAnimationStart"
                  | "onAnimationEnd"
                  | "onAnimationIteration"
                >)}
                className={cn(
                  container ? "absolute" : "fixed",
                  "left-1/2 top-1/2 z-50 w-[calc(100%-2rem)]",
                  surfaceClasses(dialogLevel),
                  "p-6 focus:outline-none",
                  size === "sm" && (compact ? "max-w-[360px]" : "max-w-[400px]"),
                  size === "lg" && (compact ? "max-w-[480px]" : "max-w-[540px]"),
                  shape.container,
                  className
                )}
                style={{
                  ...(baseStyle as React.CSSProperties | undefined),
                  ...(props.style as React.CSSProperties | undefined),
                }}
                initial={{ opacity: 0, scale: 0.97, x: "-50%", y: "-50%" }}
                animate={{
                  opacity: exiting ? 0 : 1,
                  scale: exiting ? 0.97 : 1,
                  x: "-50%",
                  y: "-50%",
                }}
                transition={exiting ? spring.slow.exit : spring.slow}
              >
                <SurfaceProvider value={dialogLevel}>
                  {children}
                  <DialogPrimitive.Close
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-3 top-3"
                      >
                        <XIcon />
                        <span className="sr-only">Close</span>
                      </Button>
                    }
                  />
                </SurfaceProvider>
              </motion.div>
            );
          }}
        />
      </DialogPrimitive.Portal>
    );
  }
);
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 mb-4", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex justify-end gap-2 mt-6", className)}
      {...props}
    />
  );
}

const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  // The title role of the type scale — see /docs/sizes.
  const compact = useSizeVariant() === "compact";
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        compact ? "text-[15px]" : "text-[16px]",
        "text-foreground leading-tight",
        className
      )}
      style={{ fontVariationSettings: "'wght' 700" }}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const compact = useSizeVariant() === "compact";
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        compact ? "text-[12px]" : "text-[13px]",
        "text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};

```

### `mobile-drawer.tsx`
- **Path:** `registry/base/mobile-drawer.tsx`
- **Archetype:** calm motion primitive — drawer/sheet slide
- **Dependencies:** @/lib/springs (above)
- **Why it's here:** Panel slides in on `spring.moderate` — comment in the source notes a bounce was tried and rejected ('briefly exposed the seam'). Direct evidence of the calm-motion discipline.

```tsx
"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion } from "framer-motion";
import { spring, exitFallbackMs } from "@/lib/springs";
import { useSurface, SurfaceProvider } from "@/lib/surface-context";
import { surfaceClasses } from "@/lib/surface-classes";

// Built on Base UI Dialog rather than Base UI Drawer: Drawer's
// swipe-to-dismiss writes inline `transform` + `--drawer-swipe-movement-*`
// CSS vars onto its Popup and expects CSS-transition choreography (plus a
// mandatory <Drawer.Viewport>), which fights framer-motion's transform
// management on the same element. Dialog provides everything we actually
// need — scroll lock (scrollbar-gap safe, blocks iOS touch scrolling),
// focus trap, focus restore timed after close, Esc + outside-click
// dismissal — while leaving the slide animation to framer-motion.

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  triggerRef?: RefObject<HTMLElement | null>;
}

// Props framer-motion redefines with incompatible signatures; they must not
// be forwarded from Base UI's render-prop payload onto a motion.div.
type MotionSafeDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

export function MobileDrawer({
  open,
  onClose,
  children,
  triggerRef,
}: MobileDrawerProps) {
  const substrate = useSurface();
  const level = Math.min(substrate + 2, 8);

  // With `actionsRef` set, Base UI defers unmounting the portal on close
  // until `actionsRef.current.unmount()` is called, letting the
  // framer-motion exit tween below play out first.
  const actionsRef = useRef<DialogPrimitive.Root.Actions | null>(null);

  // Fallback release for the deferred unmount: onAnimationComplete on the
  // panel is the primary signal, but rAF-driven animation callbacks can
  // stall in throttled/background tabs. The longest exit tween is
  // spring.moderate.exit (backdrop), so the fallback tracks that tier's exit
  // duration plus a safety buffer.
  useEffect(() => {
    if (open) return;
    const id = setTimeout(
      () => actionsRef.current?.unmount(),
      exitFallbackMs(spring.moderate)
    );
    return () => clearTimeout(id);
  }, [open]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      actionsRef={actionsRef}
    >
      <DialogPrimitive.Portal>
        {/* Overlay — same scrim as the library's dialogs: an always-on
            bg-black/40 base that stays visible for system-dark users (the
            `dark:` variant only matches the explicit .dark class), boosted
            to /80 in explicit dark mode. */}
        <DialogPrimitive.Backdrop
          render={(backdropProps) => {
            const {
              style: _style,
              ...rest
            } = backdropProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <motion.div
                {...(rest as MotionSafeDivProps)}
                className="fixed inset-0 bg-black/40 dark:bg-black/80 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
                transition={open ? { duration: 0.16 } : spring.moderate.exit}
              />
            );
          }}
        />

        {/* Panel */}
        <DialogPrimitive.Popup
          aria-label="Navigation"
          finalFocus={triggerRef}
          render={(popupProps) => {
            const {
              style: baseStyle,
              ...rest
            } = popupProps as React.HTMLAttributes<HTMLDivElement>;
            return (
              <motion.div
                {...(rest as MotionSafeDivProps)}
                className={`fixed top-0 left-0 bottom-0 w-64 ${surfaceClasses(level, 3)} z-50 overflow-y-auto p-4`}
                style={baseStyle as React.CSSProperties | undefined}
                initial={{ x: "-100%" }}
                animate={{ x: open ? 0 : "-100%" }}
                // spring.moderate: critically damped, so the panel decelerates
                // into x: 0 without overshooting (a bounce briefly exposed the
                // page background through the gap on the left edge).
                transition={open ? spring.moderate : spring.moderate.exit}
                // Release Base UI's deferred unmount once the exit tween has
                // finished so the close animation fully plays.
                onAnimationComplete={() => {
                  if (!open) actionsRef.current?.unmount();
                }}
              >
                <SurfaceProvider value={level}>{children}</SurfaceProvider>
              </motion.div>
            );
          }}
        />
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default MobileDrawer;

```

### `tabs-subtle.tsx`
- **Path:** `registry/base/tabs-subtle.tsx`
- **Archetype:** calm motion primitive — tab indicator transition
- **Dependencies:** @/lib/springs (above)
- **Why it's here:** Animated underline/indicator on `spring.moderate` with a faster, separately-tuned opacity fade — a good reference for section-nav or pricing-toggle motion.

```tsx
"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { Tabs } from "@base-ui/react/tabs";
import { motion, AnimatePresence } from "framer-motion";
import type { IconComponent } from "@/lib/icon-context";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";
import { useProximityHover } from "@/hooks/use-proximity-hover";

interface TabsSubtleContextValue {
  registerTab: (index: number, element: HTMLElement | null) => void;
  hoveredIndex: number | null;
  selectedIndex: number;
  idPrefix: string | undefined;
  activeLabel: boolean;
}

const TabsSubtleContext = createContext<TabsSubtleContextValue | null>(null);

function useTabsSubtle() {
  const ctx = useContext(TabsSubtleContext);
  if (!ctx) throw new Error("useTabsSubtle must be used within a TabsSubtle");
  return ctx;
}

interface TabsSubtleProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  children: ReactNode;
  selectedIndex: number;
  onSelect: (index: number) => void;
  idPrefix?: string;
  /** When true, only the selected tab shows its text label. Requires icons on tabs. */
  activeLabel?: boolean;
  /** Pins the tabs to one step of the size ladder (default 36px, compact
   *  28px — see /docs/sizes). Omitted, they follow the surrounding
   *  SizeProvider. */
  size?: SizeVariant;
}

const TabsSubtle = forwardRef<HTMLDivElement, TabsSubtleProps>(
  ({ children, selectedIndex, onSelect, idPrefix, activeLabel = false, size, className, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMouseInside = useRef(false);
    const shape = useShape();

    const {
      activeIndex: hoveredIndex,
      setActiveIndex: setHoveredIndex,
      itemRects: tabRects,
      handlers,
      registerItem,
      measureItems: measureTabs,
    } = useProximityHover(containerRef, { axis: "x" });

    // Track tab elements locally so we can observe their individual resizes
    const tabElementsRef = useRef(new Map<number, HTMLElement>());
    const registerTab = useCallback(
      (index: number, element: HTMLElement | null) => {
        registerItem(index, element);
        if (element) {
          tabElementsRef.current.set(index, element);
        } else {
          tabElementsRef.current.delete(index);
        }
      },
      [registerItem]
    );

    useEffect(() => {
      measureTabs();
    }, [measureTabs, children]);

    // Observe individual tab buttons for resize (label expand/collapse in activeLabel mode)
    useEffect(() => {
      const elements = tabElementsRef.current;
      if (elements.size === 0) return;
      const ro = new ResizeObserver(() => measureTabs());
      elements.forEach((el) => ro.observe(el));
      return () => ro.disconnect();
    }, [measureTabs, children]);

    // Wrap handlers to track isMouseInside
    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        isMouseInside.current = true;
        handlers.onMouseMove(e);
      },
      [handlers]
    );

    const handleMouseLeave = useCallback(() => {
      isMouseInside.current = false;
      handlers.onMouseLeave();
    }, [handlers]);

    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const selectedRect = tabRects[selectedIndex];
    const hoverRect =
      hoveredIndex !== null ? tabRects[hoveredIndex] : null;
    const focusRect = focusedIndex !== null ? tabRects[focusedIndex] : null;
    const isHoveringSelected = hoveredIndex === selectedIndex;
    const isHovering = hoveredIndex !== null && !isHoveringSelected;

    const root = (
      <TabsSubtleContext.Provider
        value={{ registerTab, hoveredIndex, selectedIndex, idPrefix, activeLabel }}
      >
        {/* Root is merged into List via `render` so a single <div> is emitted,
            matching the previous DOM structure. Base UI owns role="tablist",
            roving tabindex, and Arrow/Home/End keyboard navigation.
            `activateOnFocus={false}` keeps manual activation: arrows move
            focus, Enter/Space selects. */}
        <Tabs.Root
          value={selectedIndex}
          onValueChange={(value) => {
            if (typeof value === "number") onSelect(value);
          }}
          render={
            <Tabs.List
              activateOnFocus={false}
              ref={(node: HTMLDivElement | null) => {
                containerRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
                const indexAttr = (e.target as HTMLElement)
                  .closest("[data-proximity-index]")
                  ?.getAttribute("data-proximity-index");
                if (indexAttr != null) {
                  const idx = Number(indexAttr);
                  setHoveredIndex(idx);
                  setFocusedIndex(
                    (e.target as HTMLElement).matches(":focus-visible") ? idx : null
                  );
                }
              }}
              onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
                if (containerRef.current?.contains(e.relatedTarget as Node)) return;
                setFocusedIndex(null);
                if (isMouseInside.current) return;
                setHoveredIndex(null);
              }}
              className={cn(
                // -mx-1 px-1 / -my-1 py-1 give the 2px-outset focus ring room
                // to draw without being clipped by overflow-x-auto. The
                // max-width allows for the negative margins: fit-content
                // parents size against the margin box (8px narrower than the
                // border box), so a plain max-w-full would clamp the list 8px
                // too small and clip the first/last tab's ring.
                "relative flex items-center gap-0.5 select-none overflow-x-auto max-w-[calc(100%_+_8px)] scrollbar-hide -mx-1 px-1 -my-1 py-1",
                className
              )}
              {...props}
            >
              {/* Selected pill */}
              {selectedRect && (
                <motion.div
                  className={cn("absolute bg-active pointer-events-none", shape.bg)}
                  initial={false}
                  animate={{
                    left: selectedRect.left,
                    width: selectedRect.width,
                    top: selectedRect.top,
                    height: selectedRect.height,
                    opacity: isHovering ? 0.8 : 1,
                  }}
                  transition={{
                    ...spring.moderate,
                    opacity: { duration: 0.08 },
                  }}
                />
              )}

              {/* Hover pill */}
              <AnimatePresence>
                {hoverRect && !isHoveringSelected && selectedRect && (
                  <motion.div
                    className={cn("absolute bg-active pointer-events-none", shape.bg)}
                    initial={{
                      left: selectedRect.left,
                      width: selectedRect.width,
                      top: selectedRect.top,
                      height: selectedRect.height,
                      opacity: 0,
                    }}
                    animate={{
                      left: hoverRect.left,
                      width: hoverRect.width,
                      top: hoverRect.top,
                      height: hoverRect.height,
                      opacity: 0.4,
                    }}
                    exit={
                      !isMouseInside.current && selectedRect
                        ? {
                            left: selectedRect.left,
                            width: selectedRect.width,
                            top: selectedRect.top,
                            height: selectedRect.height,
                            opacity: 0,
                            transition: { ...spring.moderate, opacity: { duration: 0.06 } },
                          }
                        : { opacity: 0, transition: spring.fast.exit }
                    }
                    transition={{
                      ...spring.fast,
                      opacity: { duration: 0.08 },
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Focus ring */}
              <AnimatePresence>
                {focusRect && (
                  <motion.div
                    className={cn("absolute pointer-events-none z-20 border border-[color:var(--focus-ring,#6B97FF)]", shape.focusRing)}
                    initial={false}
                    animate={{
                      left: focusRect.left - 2,
                      top: focusRect.top - 2,
                      width: focusRect.width + 4,
                      height: focusRect.height + 4,
                    }}
                    exit={{ opacity: 0, transition: spring.fast.exit }}
                    transition={{
                      ...spring.fast,
                      opacity: { duration: 0.08 },
                    }}
                  />
                )}
              </AnimatePresence>

              {children}
            </Tabs.List>
          }
        />
      </TabsSubtleContext.Provider>
    );

    // A size prop pins every tab to one ladder step.
    return size ? <SizeProvider size={size}>{root}</SizeProvider> : root;
  }
);

TabsSubtle.displayName = "TabsSubtle";

interface TabsSubtleItemProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: IconComponent;
  label: string;
  index: number;
}

const TabsSubtleItem = forwardRef<HTMLButtonElement, TabsSubtleItemProps>(
  ({ icon: Icon, label, index, className, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement | null>(null);
    // The collapsing label animates to a MEASURED layout width, not "auto":
    // framer resolves an "auto" target from the element's *visual*
    // (transformed) size, so under a scaled ancestor (e.g. /demo's card) the
    // spring overshoots to scale-x the real width and snaps when "auto"
    // lands. offsetWidth and ResizeObserver are transform-immune — same
    // setup as the accordions' height animation.
    const [labelWidth, setLabelWidth] = useState<number | null>(null);
    const labelRoRef = useRef<ResizeObserver | null>(null);
    const measureLabel = useCallback((el: HTMLSpanElement | null) => {
      labelRoRef.current?.disconnect();
      labelRoRef.current = null;
      if (!el) return;
      const update = () => setLabelWidth(el.offsetWidth);
      update();
      labelRoRef.current = new ResizeObserver(update);
      labelRoRef.current.observe(el);
    }, []);
    const shape = useShape();
    const sizeClasses = useSize();
    const { registerTab, hoveredIndex, selectedIndex, idPrefix, activeLabel } =
      useTabsSubtle();

    useEffect(() => {
      registerTab(index, internalRef.current);
      return () => registerTab(index, null);
    }, [index, registerTab]);

    const isSelected = selectedIndex === index;
    const isActive = hoveredIndex === index || isSelected;
    const collapseLabel = activeLabel && !!Icon;
    const showLabel = !collapseLabel || isSelected;

    const labelContent = (
      // Both stacked spans carry the text-box trim so the invisible bold
      // sizer and the visible label keep identical boxes.
      <span
        ref={measureLabel}
        className={cn("inline-grid whitespace-nowrap", sizeClasses.text)}
      >
        <span
          className="col-start-1 row-start-1 invisible [text-box:trim-both_cap_alphabetic]"
          style={{ fontVariationSettings: fontWeights.semibold }}
          aria-hidden="true"
        >
          {label}
        </span>
        <span
          className={cn(
            "col-start-1 row-start-1 transition-[color,font-variation-settings] duration-80 [text-box:trim-both_cap_alphabetic]",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
          style={{
            fontVariationSettings: isSelected
              ? fontWeights.semibold
              : fontWeights.normal,
          }}
        >
          {label}
        </span>
      </span>
    );

    return (
      // Base UI Tab renders a native <button type="button"> and wires
      // role="tab", aria-selected, roving tabindex, and activation for us.
      // id/aria-controls are only overridden when an idPrefix is supplied so
      // externally rendered TabsSubtlePanel elements stay linked.
      <Tabs.Tab
        ref={(node: HTMLElement | null) => {
          const button = node as HTMLButtonElement | null;
          internalRef.current = button;
          if (typeof ref === "function") ref(button);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = button;
        }}
        value={index}
        data-proximity-index={index}
        id={idPrefix ? `${idPrefix}-tab-${index}` : undefined}
        aria-controls={idPrefix ? `${idPrefix}-panel-${index}` : undefined}
        aria-label={collapseLabel && !showLabel ? label : undefined}
        className={cn(
          // Fixed heights (was py-2 around a 19.5px line box ≈ 35.5px) so the
          // text-box trim on the label doesn't shrink the tab. Standalone
          // pills sit directly on the ladder's control height.
          "relative z-10 flex items-center cursor-pointer bg-transparent border-none outline-none",
          sizeClasses.control,
          sizeClasses.px,
          !collapseLabel && sizeClasses.gap,
          shape.bg,
          className
        )}
        {...props}
      >
        {Icon && (
          <Icon
            size={sizeClasses.icon}
            strokeWidth={isActive ? 2 : 1.5}
            className={cn(
              "shrink-0 transition-[color,stroke-width] duration-80",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          />
        )}
        {collapseLabel ? (
          <AnimatePresence initial={false}>
            {showLabel && (
              <motion.span
                key="label"
                className="overflow-hidden"
                // Until the measurement lands, let CSS resolve the width
                // instead of handing framer "auto": framer resolves an "auto"
                // target from the element's *visual* size, so under a scaled
                // ancestor (the /demo card, ~1.76x) it writes back a layout
                // width that much too wide, then springs back down when the
                // measured value arrives — the selected tab visibly pulses on
                // arrival. Plain CSS auto is the true layout width, and the
                // measured number that follows matches it exactly.
                style={labelWidth == null ? { width: "auto" } : undefined}
                initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                animate={{
                  ...(labelWidth != null ? { width: labelWidth } : null),
                  opacity: 1,
                  // Matches the ladder's icon-to-label gap (gap-2 / gap-1.5).
                  marginLeft: sizeClasses.variant === "compact" ? 6 : 8,
                }}
                exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                transition={{
                  ...spring.fast,
                  opacity: { duration: 0.06 },
                }}
              >
                {labelContent}
              </motion.span>
            )}
          </AnimatePresence>
        ) : (
          labelContent
        )}
      </Tabs.Tab>
    );
  }
);

TabsSubtleItem.displayName = "TabsSubtleItem";

interface TabsSubtlePanelProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
  selectedIndex: number;
  idPrefix: string;
  children: ReactNode;
}

// Rendered outside <TabsSubtle> at every call site, so it cannot use Base UI's
// Tabs.Panel (which requires the Tabs.Root context). It stays a plain tabpanel
// linked to its tab through the shared idPrefix.
const TabsSubtlePanel = forwardRef<HTMLDivElement, TabsSubtlePanelProps>(
  ({ index, selectedIndex, idPrefix, children, className, ...props }, ref) => {
    const isSelected = selectedIndex === index;

    return (
      <div
        ref={ref}
        id={`${idPrefix}-panel-${index}`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${index}`}
        hidden={!isSelected}
        tabIndex={-1}
        className={cn("outline-none", className)}
        {...props}
      >
        {isSelected && children}
      </div>
    );
  }
);

TabsSubtlePanel.displayName = "TabsSubtlePanel";

export { TabsSubtle, TabsSubtleItem, TabsSubtlePanel };
export default TabsSubtle;

```

### `thinking-steps.tsx`
- **Path:** `registry/base/thinking-steps.tsx`
- **Archetype:** calm motion primitive — subtle status/loading reveal
- **Dependencies:** @/lib/springs (above)
- **Why it's here:** Step-by-step status list with height+spring reveal on `spring.fast`; useful as a reference for a subtle 'process' status indicator even though it isn't a marketing section.

```tsx
"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useContext,
  createContext,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible } from "@base-ui/react/collapsible";

// SSR-safe layout effect (client components still server-render in Next).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { cn } from "@/lib/utils";
import { useIcon } from "@/lib/icon-context";
import type { IconName } from "@/lib/icon-context";
import { spring } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { SizeProvider, useSize, type SizeVariant } from "@/lib/size-context";
import { Badge } from "@/registry/default/badge";
import type { BadgeColor } from "@/registry/default/badge";

// ─── Shared collapsible parts ───────────────────────────────────────────────
//
// ThinkingSteps and ThinkingStepDetails are both single collapsible sections,
// built directly on Base UI's Collapsible (Root/Trigger/Panel) with the
// library's framer-motion springs layered on top.

/** Open state of the nearest ThinkingSteps root, for the header trigger/panel. */
const ThinkingStepsOpenContext = createContext(false);

interface TriggerRowProps extends HTMLAttributes<HTMLButtonElement> {
  open: boolean;
  children: ReactNode;
}

/**
 * Trigger row: hover background, dual-layer variable-weight label, and a
 * chevron that rotates from right (closed) to down (open). Mirrors the
 * library's accordion trigger styling.
 */
const TriggerRow = forwardRef<HTMLButtonElement, TriggerRowProps>(
  ({ open, children, className, ...props }, ref) => {
    const ChevronRight = useIcon("chevron-right");
    const shape = useShape();
    const sizeClasses = useSize();
    const [isHovered, setIsHovered] = useState(false);
    const highlighted = open || isHovered;

    return (
      <div
        className="relative w-fit"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className={`absolute inset-0 ${shape.bg} bg-hover pointer-events-none`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: spring.fast.exit }}
              transition={{ duration: 0.08 }}
            />
          )}
        </AnimatePresence>
        <Collapsible.Trigger
          ref={ref}
          className={cn(
            `relative z-10 flex items-center gap-2.5 ${shape.item} ${sizeClasses.px} ${
              sizeClasses.variant === "compact" ? "py-1.5" : "py-2"
            } cursor-pointer outline-none select-none`,
            "focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)] focus-visible:ring-offset-0",
            className
          )}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {/* Label with dual-layer text (invisible bold layer reserves width) */}
          <span className={cn("inline-grid text-left", sizeClasses.text)}>
            <span
              className="col-start-1 row-start-1 invisible"
              style={{ fontVariationSettings: fontWeights.semibold }}
              aria-hidden="true"
            >
              {children}
            </span>
            <span
              className={cn(
                "col-start-1 row-start-1 transition-[color,font-variation-settings] duration-80",
                highlighted ? "text-foreground" : "text-muted-foreground"
              )}
              style={{
                fontVariationSettings: open
                  ? fontWeights.semibold
                  : fontWeights.normal,
              }}
            >
              {children}
            </span>
          </span>

          {/* Chevron — right when collapsed, rotates 90° down when expanded */}
          <motion.span
            className="shrink-0 inline-flex items-center justify-center"
            animate={{ rotate: open ? 90 : 0 }}
            transition={spring.fast}
          >
            <ChevronRight
              size={sizeClasses.icon}
              strokeWidth={highlighted ? 2 : 1.5}
              className={cn(
                "transition-[color,stroke-width] duration-80",
                highlighted ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </motion.span>
        </Collapsible.Trigger>
      </div>
    );
  }
);
TriggerRow.displayName = "ThinkingStepsTriggerRow";

interface CollapsePanelProps {
  open: boolean;
  children: ReactNode;
}

/**
 * Collapsible panel with a framer-motion height + spring animation.
 *
 * Base UI's Panel would apply `hidden` the moment a controlled collapsible
 * closes (it can't observe the JS-driven exit animation), which is
 * `display: none` and would freeze the exit mid-flight. So we render through
 * `keepMounted` + `render`, strip Base UI's premature `hidden`, and only
 * apply the attribute ourselves once the framer exit has actually completed.
 * The persistent panel element keeps the trigger ↔ panel ARIA contract
 * intact (the trigger's `aria-controls` id lives on it).
 */
function CollapsePanel({ open, children }: CollapsePanelProps) {
  const compactStep = useSize().variant === "compact";
  // The open height is animated to a self-measured LAYOUT pixel value, not
  // `height: "auto"`: framer resolves an "auto" target by measuring the
  // element's *visual* (transformed) size, so under a scaled ancestor
  // (e.g. /demo's 1.7x card) the animation overshoots to scale× the real
  // height and snaps back when the final "auto" lands. offsetHeight and
  // ResizeObserver are transform-immune. Same setup as the accordions.
  const innerRef = useRef<HTMLDivElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  // Panels open at mount render `initial: "auto"` and receive their first
  // pixel target a commit later; that hand-off must SNAP (duration 0), not
  // spring. Panels that open later spring normally.
  const needsSnap = useRef(open);

  const measureRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    innerRef.current = el;
    if (!el) return;
    if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
    const ro = new ResizeObserver(() => {
      // Ignore the 0 that fires while the panel is display:none.
      if (el.offsetHeight > 0) setContentHeight(el.offsetHeight);
    });
    ro.observe(el);
    roRef.current = ro;
  }, []);

  // Re-measure synchronously (pre-paint) when opening, so the spring's
  // target is the fresh layout height from its first frame.
  useIsoLayoutEffect(() => {
    if (open && innerRef.current && innerRef.current.offsetHeight > 0) {
      setContentHeight(innerRef.current.offsetHeight);
    }
  }, [open]);

  useEffect(() => {
    if (contentHeight !== null) needsSnap.current = false;
  }, [contentHeight]);

  const [exitComplete, setExitComplete] = useState(!open);
  if (open && exitComplete) {
    // Reset during render so the panel is un-hidden before the opening
    // animation's first paint.
    setExitComplete(false);
  }

  return (
    <Collapsible.Panel
      keepMounted
      render={(panelProps) => {
        const {
          // Applied too early for our exit animation (see above); we
          // control the attribute ourselves.
          hidden: _baseHidden,
          // Only carries the --collapsible-panel-height/width vars, which
          // stay 'auto' since Base UI never measures JS-driven animations.
          style: _baseStyle,
          ...restPanel
        } = panelProps as React.HTMLAttributes<HTMLDivElement> & {
          hidden?: boolean;
        };
        return (
          <div {...restPanel} hidden={!open && exitComplete}>
            <motion.div
              className="overflow-hidden"
              initial={{ height: open ? "auto" : 0 }}
              animate={{ height: open ? contentHeight ?? 0 : 0 }}
              // bounce: 0 — pure height looks better without overshoot.
              transition={
                needsSnap.current
                  ? { duration: 0 }
                  : { ...spring.moderate, bounce: 0 }
              }
              onAnimationComplete={() => {
                if (!open) setExitComplete(true);
              }}
            >
              <div
                ref={measureRef}
                className={cn(
                  "px-3 pb-3 pt-1 text-muted-foreground",
                  compactStep ? "text-[12px]" : "text-[13px]"
                )}
              >
                {children}
              </div>
            </motion.div>
          </div>
        );
      }}
    />
  );
}

// ─── ThinkingSteps (root) ───────────────────────────────────────────────────

interface ThinkingStepsProps extends HTMLAttributes<HTMLDivElement> {
  /** Step on the size ladder. Wins over the surrounding SizeProvider and
   *  propagates to every row inside. */
  size?: SizeVariant;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

const ThinkingSteps = forwardRef<HTMLDivElement, ThinkingStepsProps>(
  ({ size, defaultOpen = true, open, onOpenChange, children, className, ...props }, ref) => {
    // Always drive Base UI as controlled so the header/panel can read the
    // open state (chevron rotation, framer enter/exit) from context.
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = open ?? internalOpen;

    const root = (
      <Collapsible.Root
        ref={ref}
        open={isOpen}
        onOpenChange={(next: boolean) => {
          if (open === undefined) setInternalOpen(next);
          onOpenChange?.(next);
        }}
        className={cn("w-80 max-w-full", className)}
        {...props}
      >
        <ThinkingStepsOpenContext.Provider value={isOpen}>
          {children}
        </ThinkingStepsOpenContext.Provider>
      </Collapsible.Root>
    );

    // A size prop pins every row inside to one ladder step.
    return size ? <SizeProvider size={size}>{root}</SizeProvider> : root;
  }
);
ThinkingSteps.displayName = "ThinkingSteps";

// ─── ThinkingStepsHeader ────────────────────────────────────────────────────

interface ThinkingStepsHeaderProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

const ThinkingStepsHeader = forwardRef<
  HTMLButtonElement,
  ThinkingStepsHeaderProps
>(({ children = "Thinking", className, ...props }, ref) => {
  const isOpen = useContext(ThinkingStepsOpenContext);
  return (
    <TriggerRow ref={ref} open={isOpen} className={className} {...props}>
      {children}
    </TriggerRow>
  );
});
ThinkingStepsHeader.displayName = "ThinkingStepsHeader";

// ─── ThinkingStepsContent ───────────────────────────────────────────────────

interface ThinkingStepsContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ThinkingStepsContent = forwardRef<
  HTMLDivElement,
  ThinkingStepsContentProps
>(({ children, className, ...props }, ref) => {
  const isOpen = useContext(ThinkingStepsOpenContext);
  return (
    <CollapsePanel open={isOpen}>
      <div
        ref={ref}
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </CollapsePanel>
  );
});
ThinkingStepsContent.displayName = "ThinkingStepsContent";

// ─── ThinkingStep ───────────────────────────────────────────────────────────

type StepStatus = "complete" | "active" | "pending";

interface ThinkingStepProps {
  icon?: IconName;
  showIcon?: boolean;
  label: string;
  description?: string;
  status?: StepStatus;
  delay?: number;
  isLast?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Measured layout height for a step's opening animation. `height: "auto"`
 *  is resolved by framer from the element's *visual* (transformed) size, so
 *  under a scaled ancestor (the /demo card) every step springs out to scale x
 *  its real height and snaps back when "auto" lands — the whole list visibly
 *  overshoots as it builds. offsetHeight and ResizeObserver are
 *  transform-immune. Same setup as CollapsePanel above. */
function useStepHeight() {
  const roRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const ref = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    if (!el) return;
    const sync = () => {
      if (el.offsetHeight > 0) setHeight(el.offsetHeight);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    roRef.current = ro;
  }, []);
  return [ref, height] as const;
}

function ThinkingStep({
  icon = "dot",
  showIcon = true,
  label,
  description,
  status = "complete",
  delay = 0.08,
  isLast = false,
  children,
  className,
}: ThinkingStepProps) {
    const Icon = useIcon(icon);
    const shape = useShape();
    const sizeClasses = useSize();
    const [stepRef, stepHeight] = useStepHeight();

    if (status === "pending") return null;

    const isActive = status === "active";

    return (
      /* Outer: animates height to create space smoothly */
      <motion.div
        className={cn("relative z-10 overflow-hidden", className)}
        initial={{ height: 0 }}
        animate={{ height: stepHeight ?? 0 }}
        transition={spring.slow}
      >
        {/* Inner: fades content in after space starts opening — and is the
            element measured for the height above. */}
        <motion.div
          ref={stepRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, delay, ease: "easeOut" }}
        >
          {/* Content row — this is the proximity hover target */}
          <div className={cn("flex gap-2.5 px-2 py-1.5", shape.item)}>
            {/* Icon column with continuous connector line */}
            <div className="flex flex-col items-center shrink-0 w-[14px]">
              <div className="pt-0.5">
                {showIcon ? (
                  <Icon
                    size={sizeClasses.variant === "compact" ? 12 : 14}
                    strokeWidth={1.5}
                    className="text-muted-foreground"
                  />
                ) : (
                  <div className="w-[14px] h-[14px] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                  </div>
                )}
              </div>
              {/* Line stretches from icon to bottom of this step */}
              {!isLast && (
                <div className="flex-1 w-px bg-border/60 mt-1" />
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <span
                className={cn(
                  sizeClasses.text,
                  "leading-tight text-foreground",
                  isActive && "shimmer-text"
                )}
                style={{ fontVariationSettings: fontWeights.medium }}
              >
                {label}
                {isActive && "…"}
              </span>
              {description && (
                <span className={cn(sizeClasses.text, "text-muted-foreground leading-snug")}>
                  {description}
                </span>
              )}
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
}

// ─── ThinkingStepDetails (nested collapsible) ───────────────────────────────

interface ThinkingStepDetailsProps {
  summary: string;
  details?: string[];
  defaultOpen?: boolean;
  children?: ReactNode;
  className?: string;
}

function ThinkingStepDetails({
  summary,
  details,
  defaultOpen = false,
  children,
  className,
}: ThinkingStepDetailsProps) {
  const compactStep = useSize().variant === "compact";
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className={cn("mt-1 -ml-3", className)}
    >
      <TriggerRow open={open} className="py-1 px-3 gap-1.5">
        {summary}
      </TriggerRow>
      <CollapsePanel open={open}>
        <div className="flex flex-col gap-0.5 pt-0.5">
          {details?.map((item, i) => (
            <span
              key={i}
              className={cn(
                "text-muted-foreground leading-snug",
                compactStep ? "text-[11px]" : "text-[12px]"
              )}
            >
              {item}
            </span>
          ))}
          {children}
        </div>
      </CollapsePanel>
    </Collapsible.Root>
  );
}

// ─── ThinkingStepSources ────────────────────────────────────────────────────

interface ThinkingStepSourcesProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ThinkingStepSources = forwardRef<HTMLDivElement, ThinkingStepSourcesProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-1.5 mt-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ThinkingStepSources.displayName = "ThinkingStepSources";

// ─── ThinkingStepSource ─────────────────────────────────────────────────────

interface ThinkingStepSourceProps {
  color?: BadgeColor;
  delay?: number;
  children: ReactNode;
  className?: string;
}

function ThinkingStepSource({ color = "gray", delay = 0, children, className }: ThinkingStepSourceProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        ...spring.moderate,
        delay,
        filter: { duration: 0.12, delay },
      }}
    >
      <Badge variant="solid" size="sm" color={color} className={className}>
        {children}
      </Badge>
    </motion.span>
  );
}
ThinkingStepSource.displayName = "ThinkingStepSource";

// ─── ThinkingStepImage ──────────────────────────────────────────────────────

interface ThinkingStepImageProps {
  src: string;
  alt?: string;
  caption?: string;
  delay?: number;
  className?: string;
}

function ThinkingStepImage({ src, alt = "", caption, delay = 0, className }: ThinkingStepImageProps) {
  const shape = useShape();
  // The caption role of the type scale — see /docs/sizes.
  const compact = useSize().variant === "compact";
  return (
    <motion.div
      className={cn("mt-1.5", className)}
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{
        opacity: { duration: 0.2, delay, ease: "easeOut" },
        filter: { duration: 0.15, delay },
      }}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full max-w-[200px] object-cover",
          shape.container
        )}
      />
      {caption && (
        <span
          className={cn(
            compact ? "text-[11px]" : "text-[12px]",
            "text-muted-foreground mt-1 block"
          )}
        >
          {caption}
        </span>
      )}
    </motion.div>
  );
}
ThinkingStepImage.displayName = "ThinkingStepImage";

// ─── Exports ────────────────────────────────────────────────────────────────

export {
  ThinkingSteps,
  ThinkingStepsHeader,
  ThinkingStepsContent,
  ThinkingStep,
  ThinkingStepDetails,
  ThinkingStepSources,
  ThinkingStepSource,
  ThinkingStepImage,
};

export type {
  ThinkingStepsProps,
  ThinkingStepsHeaderProps,
  ThinkingStepsContentProps,
  ThinkingStepProps,
  ThinkingStepDetailsProps,
  ThinkingStepSourcesProps,
  ThinkingStepSourceProps,
  ThinkingStepImageProps,
  StepStatus,
};

```

---

## 2. Watermelon UI (`WatermelonCorp/watermellon-registry`)
**Enumeration result:** `registry.json` was fetched and parsed in full — 1,074 items. Filtered by name for hero/marquee/feature/process/step/stats/testimonial/reveal/scroll/transition, which surfaced 43 hero variants, a dedicated `marquee`, 6 `feature-*` blocks plus `feature-tour`, 4 `stats-*`, 4 `testimonials-*`, `reveal-copy`, `revealing-cards`, and `scroll-fade`. This repo has real matches in every requested category. The 6 below were picked for structure over flourish, matching the house brief (deep-indigo, crisp, exponential-ease, no bounce/glow).

### `hero-1.tsx`
- **Path:** `src/components/watermelon-ui/hero-1.tsx`
- **Archetype:** hero / marketing section
- **Dependencies:** lucide-react, motion (registryDependency: button)
- **Why it's here:** Full nav + headline + CTA + social-links hero — the most structured, agency-site-shaped hero of the 43 variants (vs. the more experimental/illustrative ones).

```tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";


export interface NavLink {
    label: string;
    href: string;
    active?: boolean;
}

export interface SocialLink {
    label: string;
    href: string;
}

export interface Hero1Props {
    /** Brand / logo name shown top-left */
    brand?: React.ReactNode;
    /** Navigation links rendered in the center of the navbar */
    navLinks?: NavLink[];
    /** Main headline — can be a string or JSX (e.g. with <br />) */
    headline?: React.ReactNode;
    /** CTA button label */
    ctaLabel?: string;
    /** CTA button href */
    ctaHref?: string;
    /** Small description text at the bottom-left */
    description?: string;
    /** Social links rendered at the bottom-right */
    socialLinks?: SocialLink[];
    /** Sign-in / auth button label */
    signInLabel?: string;
    /** Sign-in href */
    signInHref?: string;
    /** Callback for when a nav link is clicked */
    onNavLinkClick?: (link: NavLink) => void;
    /** Additional wrapper CSS classes */
    className?: string;
}

const DEFAULT_NAV: NavLink[] = [
    { label: "Products", href: "#", active: true },
    { label: "About", href: "#" },
    { label: "Features", href: "#" },
    { label: "Support", href: "#" },
];

const DEFAULT_SOCIAL: SocialLink[] = [
    { label: "Linkedin", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "Behance", href: "#" },
];

export default function Hero1({
    brand = "Watermelon",
    navLinks = DEFAULT_NAV,
    headline = (
        <>
            The goal&apos;s the focus,
            <br />
            time&apos;s the marker.
        </>
    ),
    ctaLabel = "Let's Move Forward Today",
    ctaHref = "#",
    description = "Advanced wind turbines that take energy\n production to new heights.",
    socialLinks = DEFAULT_SOCIAL,
    signInLabel = "Sign in",
    signInHref = "#",
    onNavLinkClick,
    className,
}: Hero1Props) {
    const [links, setLinks] = useState<NavLink[]>(navLinks);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavLinkClick = (clickedLink: NavLink, e: React.MouseEvent) => {
        // Avoid default navigation behavior for smooth demo purposes if needed
        if (onNavLinkClick) {
            e.preventDefault();
            onNavLinkClick(clickedLink);
        }
        setLinks(
            links.map((link) => ({
                ...link,
                active: link.label === clickedLink.label,
            }))
        );
        setIsMobileMenuOpen(false);
    };


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
        },
    };

    const backgroundVariants = {
        hidden: { opacity: 0, scale: 1.05 },
        visible: {
            opacity: 0.9,
            scale: 1,
            transition: { duration: 1.2, ease: "easeOut" as const },
        },
    };

    return (
        <section
            className={cn(
                "relative w-full min-h-screen flex flex-col justify-between overflow-hidden text-white selection:bg-white selection:text-black",
                className
            )}
            style={{ backgroundColor: "#06060c" }}
        >
        
            <motion.div
                initial="hidden"
                animate="visible"
                variants={backgroundVariants}
                className="absolute bottom-0 left-0 w-full sm:w-[85%] md:w-[65%] h-[80%] md:h-[75%] pointer-events-none select-none z-0 overflow-hidden"
            >
                <img
                    src={"https://assets.watermelon.sh/hero-1.avif"}
                    alt="Purple grid structure background"
                    className="absolute inset-0 h-full w-full object-cover object-bottom-left opacity-90"
                />
              
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 70% at 20% 80%, transparent 40%, #06060c 85%)",
                    }}
                />
            </motion.div>

   
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 lg:px-20"
            >
                {/* Brand Logo */}
                <a href="/" className="flex items-center gap-1 group">
                    {typeof brand === "string" ? (
                        <span className="relative text-white font-semibold text-lg tracking-tight select-none">
                            {brand}
                            <span className="absolute -top-1 -right-2 text-xs text-white select-none">
                                •
                            </span>
                        </span>
                    ) : (
                        brand
                    )}
                </a>

      
                <nav className="hidden md:block">
                    <ul className="flex items-center gap-12 lg:gap-16">
                        {links.map((link) => (
                            <li key={link.label} className="relative py-1">
                                <a
                                    href={link.href}
                                    onClick={(e) => handleNavLinkClick(link, e)}
                                    className={cn(
                                        "text-base font-medium transition-colors duration-300 relative px-0.5 tracking-wide",
                                        link.active
                                            ? "text-white"
                                            : "text-white/60 hover:text-white"
                                    )}
                                >
                                    {link.label}
                                    {link.active && (
                                        <motion.span
                                            layoutId="activeUnderline"
                                            className="absolute left-0 right-0 bottom-[-4px] h-[1.5px] bg-white"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="hidden md:block ml-4">
                    <a
                        href={signInHref}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-white text-white text-base font-medium bg-transparent hover:border-white/50 hover:bg-white/5 transition-all duration-300"
                    >
                        {signInLabel}
                    </a>
                </div>

         
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors z-50 relative"
                    aria-label="Toggle navigation menu"
                >
                    <div className="w-4 h-4 flex flex-col justify-between items-center relative">
                        <span
                            className={cn(
                                "w-full h-[1.5px] bg-white transition-all duration-300 absolute left-0",
                                isMobileMenuOpen ? "rotate-45 top-[7px]" : "top-[2px]"
                            )}
                        />
                        <span
                            className={cn(
                                "w-full h-[1.5px] bg-white transition-all duration-300 absolute left-0 top-[7px]",
                                isMobileMenuOpen && "opacity-0"
                            )}
                        />
                        <span
                            className={cn(
                                "w-full h-[1.5px] bg-white transition-all duration-300 absolute left-0",
                                isMobileMenuOpen ? "-rotate-45 top-[7px]" : "top-[12px]"
                            )}
                        />
                    </div>
                </button>
            </motion.header>

      
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 bg-[#06060c]/98 backdrop-blur-md z-40 flex flex-col justify-between px-6 py-24 md:hidden"
                    >
                        {/* Nav links stack */}
                        <nav className="flex flex-col gap-6 mt-8">
                            {links.map((link, idx) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <a
                                        href={link.href}
                                        onClick={(e) => handleNavLinkClick(link, e)}
                                        className={cn(
                                            "text-3xl font-semibold transition-colors duration-200 block",
                                            link.active ? "text-white" : "text-white/50"
                                        )}
                                    >
                                        {link.label}
                                    </a>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Bottom buttons & info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex flex-col gap-6"
                        >
                            <a
                                href={signInHref}
                                className="w-full py-3.5 rounded-full border border-white/20 text-white text-center text-base font-medium bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                {signInLabel}
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main Hero Content Area ── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-12 pb-10 md:px-12 lg:px-20 md:pt-16 md:pb-12"
            >
                {/* Top Section: Headline & CTA Button */}
                <div className="flex flex-col gap-8 md:gap-10 max-w-[850px] mt-[5vh]">
                    {/* Main Headline */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.08] tracking-[-0.04em] text-white"
                    >
                        {headline}
                    </motion.h1>

                    {/* CTA Pill Button with Hover Micro-animations */}
                    <motion.div variants={itemVariants} className="w-fit">
                        <a
                            href={ctaHref}
                            className="inline-flex w-fit items-center gap-4 bg-white text-black font-medium text-sm p-1 pl-4 rounded-lg hover:bg-white/90 transition-all duration-300 shadow-[0_4px_16px_rgba(255,255,255,0.06)] group"
                        >
                            <span>{ctaLabel}</span>
                            <span className="w-8 h-8 rounded-md bg-black flex items-center justify-center shrink-0 overflow-hidden relative">
                                {/* Arrow up-right with custom sliding movement on hover */}
                                <ArrowUpRight className="w-4 h-4 text-white transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:translate-y-[-2px]" />
                            </span>
                        </a>
                    </motion.div>
                </div>

                {/* Bottom Section: Description & Controls */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 lg:gap-10 mt-auto pt-16 w-full relative"
                >
                    {/* Top Row / Left Column: Muted Description paragraph */}
                    <div className="md:max-w-3xl">
                        <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed font-normal whitespace-pre-line">
                            {description}
                        </p>
                    </div>

                    {/* Bottom Row / Center & Right Columns */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between lg:justify-end gap-10 pb-1 w-full lg:w-auto">
                        {/* Premium Social Links (Left on tablet, Right on Desktop) */}
                        <div className="flex items-center gap-6 lg:gap-12 order-1 lg:order-2">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="text-white text-base lg:text-lg hover:text-white/80 transition-colors duration-250 tracking-wide"
                                >
                                    {social.label}
                                </a>
                            ))}
                        </div>

                        {/* Floating scroll indicator (Right on tablet, Center on Desktop) */}
                        <div className="hidden md:flex items-center gap-3 text-white text-sm lg:text-base tracking-wide order-2 lg:order-1 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:bottom-1">
                            <span>Scroll to Discover</span>
                            <motion.span
                                animate={{ y: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                            >
                                <ArrowDown className="w-4 h-4 text-white" strokeWidth={1.5} />
                            </motion.span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
```

### `marquee.tsx`
- **Path:** `src/components/watermelon-ui/marquee.tsx`
- **Archetype:** marquee / logo ticker
- **Dependencies:** none
- **Why it's here:** The one dedicated marquee in the registry — no motion-library dependency, smallest and most reusable of the set (87 lines).

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
  /**
   * Animation speed variant
   * @default "normal"
   */
  speed?: "slow" | "normal" | "fast"
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 5,
  speed = "normal",
  ...props
}: MarqueeProps) {
  const speedVariants = {
    slow: "[--duration:120s]",
    normal: "[--duration:40s]",
    fast: "[--duration:10s]",
  }

  return (
    <div
      {...props}
      className={cn(
        "group flex [gap:var(--gap)] overflow-hidden p-1 [--gap:6px]",
        speedVariants[speed],
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
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
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

### `feature-tour.tsx`
- **Path:** `src/components/watermelon-ui/feature-tour.tsx`
- **Archetype:** feature / process section
- **Dependencies:** lucide-react, motion
- **Why it's here:** A guided step-through feature section (closer to a 'process' narrative than the plainer numbered `feature-1..5` grid blocks).

```tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    motion,
    AnimatePresence,
    useReducedMotion,
    type Transition,
} from "motion/react";
import { X } from "lucide-react";

export interface TourStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface FeatureTourProps {
    steps: TourStep[];
    onClose: () => void;
    onLearnMore?: (step: TourStep) => void;
    className?: string;
    loop?: boolean;
    closeOnBackdrop?: boolean;
}

/* ─────────────────────────
   Typed Motion Curves
───────────────────────── */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const FAST_OUT = [0.22, 1, 0.36, 1] as const;

const SPRING_ICON: Transition = {
    type: "spring",
    stiffness: 420,
    damping: 34,
    mass: 0.7,
};

const SPRING_BG: Transition = {
    type: "spring",
    stiffness: 340,
    damping: 30,
    mass: 0.8,
};

export const FeatureTour: React.FC<FeatureTourProps> = ({
    steps,
    onClose,
    onLearnMore,
    className = "",
    loop = false,
    closeOnBackdrop = true,
}) => {
    const shouldReduceMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToStep = (index: number) => {
        if (index === currentIndex) return;
        setCurrentIndex(index);
    };

    const goNext = useCallback(() => {
        setCurrentIndex((prev) =>
            prev === steps.length - 1 ? (loop ? 0 : prev) : prev + 1
        );
    }, [steps.length, loop]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) =>
            prev === 0 ? (loop ? steps.length - 1 : prev) : prev - 1
        );
    }, [steps.length, loop]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [steps?.length, loop, onClose, goNext, goPrev]);

    useEffect(() => {
        const btn = containerRef.current?.querySelector("button");
        btn?.focus();
    }, []);

    if (!steps || steps.length === 0) return null;

    const currentStep = steps[currentIndex];

    return (
        <div
            className="flex items-center justify-center"
            onClick={closeOnBackdrop ? onClose : undefined}
            role="dialog"
            aria-modal="true"
        >
            <motion.div
                ref={containerRef}
                onClick={(e) => e.stopPropagation()}
                initial={{
                    opacity: 0,
                    scale: 0.96,
                    y: 16,
                    filter: "blur(4px)",
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: "blur(0px)",
                }}
                exit={{
                    opacity: 0,
                    scale: 0.98,
                    y: 12,
                }}
                transition={{
                    duration: 0.18,
                    ease: EASE_OUT,
                }}
                className={`relative w-full max-w-[400px] sm:aspect-[1/1.3] min-h-[520px] sm:min-h-0 rounded-[34px] border shadow-sm p-6 sm:p-8 flex flex-col items-center overflow-hidden transition-colors duration-300 bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 ${className}`}
            >
                <button
                    onClick={onClose}
                    aria-label="Close tour"
                    className="absolute top-6 right-6 p-2 rounded-full transition-colors z-50 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                >
                    <X
                        size={20}
                        strokeWidth={3}
                        className="text-white dark:text-neutral-200"
                    />
                </button>

                <div className="flex-1 w-full flex flex-col items-center justify-center relative">

                    {/* Icon Morph */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{
                                opacity: 0,
                                scale: 0.92,
                                y: 8,
                                filter: "blur(3px)",
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                filter: "blur(0px)",
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.92,
                                y: -6,
                                filter: "blur(3px)",
                            }}
                            transition={{
                                duration: 0.16,
                                ease: FAST_OUT,
                            }}
                            className="relative flex items-center justify-center min-h-[120px]"
                        >
                            <motion.div
                                layoutId="tour-icon-bg"
                                transition={SPRING_BG}
                                className="absolute w-24 h-24 rounded-3xl
                           bg-neutral-100 dark:bg-neutral-800
                           shadow-inner dark:shadow-black/40"
                            />

                            <motion.div
                                layoutId="tour-icon"
                                transition={SPRING_ICON}
                                className="relative text-neutral-700 dark:text-neutral-200
                           drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]
                           dark:drop-shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
                            >
                                {currentStep.icon}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Content Slide */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${currentStep.id}`}
                            initial={{
                                opacity: 0,
                                y: shouldReduceMotion ? 0 : 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: shouldReduceMotion ? 0 : -14,
                            }}
                            transition={{
                                duration: 0.16,
                                ease: EASE_OUT,
                            }}
                            className="space-y-2 px-4 mt-8 sm:mt-12 text-center"
                        >
                            <h2 className="text-[26px] font-bold text-neutral-900 dark:text-white">
                                {currentStep.title}
                            </h2>

                            <p className="text-[20px] font-medium leading-tight text-neutral-500 dark:text-neutral-400">
                                {currentStep.description}
                            </p>

                            {onLearnMore && (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                    onClick={() => onLearnMore(currentStep)}
                                    className="mt-6 sm:mt-10 px-10 py-3 rounded-full font-semibold text-lg transition-colors bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                                >
                                    Learn More
                                </motion.button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dots */}
                <div className="mt-6 sm:mt-8 flex items-center gap-3" role="tablist">
                    {steps.map((step, index) => (
                        <button
                            key={step.id}
                            role="tab"
                            aria-selected={index === currentIndex}
                            aria-label={`Go to ${step.title}`}
                            onClick={() => goToStep(index)}
                            className="relative h-2 focus:outline-none"
                        >
                            <motion.div
                                animate={{
                                    scale: index === currentIndex ? 1.2 : 1,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                className={`h-[12px] w-[12px] rounded-full ${index === currentIndex
                                    ? "bg-neutral-500 dark:bg-neutral-200"
                                    : "bg-neutral-200 dark:bg-neutral-700"
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                <div className="absolute inset-0 pointer-events-none rounded-[40px] bg-linear-to-br from-white/20 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-black/40" />
            </motion.div>
        </div>
    );
};
```

### `stats-1.tsx`
- **Path:** `src/components/watermelon-ui/stats-1.tsx`
- **Archetype:** stats section
- **Dependencies:** lucide-react (registryDependency: stats, button)
- **Why it's here:** Baseline stats-row layout — first and plainest of the 4 stats variants, easiest to restyle into house tokens.

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FaStar } from "react-icons/fa";
import { SiImdb, SiRottentomatoes, SiMetacritic } from "react-icons/si";

const stats = [
  {
    icon: SiImdb,
    iconColor: "#F5C518",
    label: "IMDb",
    sublabel: "User Rating",
    badgeBg: "rgba(245,197,24,0.1)",
    badgeBorder: "rgba(245,197,24,0.3)",
    badgeText: "#b8960e",
    metric: "8.7",
    metricSuffix: "/10",
    subtext: "Audience favorite score",
    description:
      "Rated by millions of moviegoers worldwide — one of the highest user-reviewed scores this year.",
    starColor: "text-yellow-400",
    ratingCount: 5,
    gradient:
      "repeating-linear-gradient(135deg, rgba(245,197,24,0.08) 0px, rgba(245,197,24,0.08) 1px, transparent 1px, transparent 6px, rgba(245,197,24,0.04) 6px, rgba(245,197,24,0.04) 7px, transparent 7px, transparent 12px)",
  },
  {
    icon: SiRottentomatoes,
    iconColor: "#FA320A",
    label: "Rotten Tomatoes",
    sublabel: "Tomatometer",
    badgeBg: "rgba(250,50,10,0.08)",
    badgeBorder: "rgba(250,50,10,0.25)",
    badgeText: "#c42a0a",
    metric: "94",
    metricSuffix: "%",
    subtext: "Certified Fresh",
    description:
      "Critics agree — a must-watch experience with near-universal acclaim from top-tier reviewers.",
    starColor: "text-red-500",
    ratingCount: 5,
    gradient:
      "repeating-linear-gradient(135deg, rgba(250,50,10,0.08) 0px, rgba(250,50,10,0.08) 1px, transparent 1px, transparent 6px, rgba(250,50,10,0.04) 6px, rgba(250,50,10,0.04) 7px, transparent 7px, transparent 12px)",
  },
  {
    icon: SiMetacritic,
    iconColor: "#FFCC34",
    label: "Metacritic",
    sublabel: "Metascore",
    badgeBg: "rgba(102,195,75,0.08)",
    badgeBorder: "rgba(102,195,75,0.3)",
    badgeText: "#4a8a36",
    metric: "87",
    metricSuffix: "/100",
    subtext: "Universal acclaim",
    description:
      "Aggregated from leading publications — a Metascore that places it among the year's best.",
    starColor: "text-emerald-500",
    ratingCount: 5,
    gradient:
      "repeating-linear-gradient(135deg, rgba(102,195,75,0.08) 0px, rgba(102,195,75,0.08) 1px, transparent 1px, transparent 6px, rgba(255,204,52,0.05) 6px, rgba(255,204,52,0.05) 7px, transparent 7px, transparent 12px)",
  },
];

export default function Stats1() {
  return (
    <section className="theme-injected w-full px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-foreground mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
          Critic scores, audience approved
        </h2>

        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
          See how top review platforms rate the experience — trusted by millions
          of viewers and leading critics.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="group relative overflow-hidden rounded-4xl p-0 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.06)] ring-0 transition-all duration-300 hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_4px_4px_0px_rgba(0,0,0,0.1)]"
              style={{ backgroundImage: stat.gradient }}
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex items-center">
                  <div
                    className="inline-flex items-center gap-3 rounded-xl px-3.5 py-2"
                    style={{
                      backgroundColor: stat.badgeBg,
                      border: `1px solid ${stat.badgeBorder}`,
                    }}
                  >
                    <stat.icon
                      className="size-5 shrink-0"
                      style={{ color: stat.iconColor }}
                    />
                    <div className="flex flex-col items-start leading-none">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: stat.badgeText }}
                      >
                        {stat.label}
                      </span>
                      <span className="text-muted-foreground mt-0.5 text-[10px] tracking-widest uppercase">
                        {stat.sublabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-baseline gap-0.5 text-left">
                  <span className="text-foreground text-6xl font-bold tracking-tighter">
                    {stat.metric}
                  </span>
                  <span className="text-muted-foreground text-2xl font-medium">
                    {stat.metricSuffix}
                  </span>
                </div>

                <p className="text-foreground mt-5 text-left text-sm font-semibold">
                  {stat.subtext}
                </p>

                <p className="text-muted-foreground mt-2 text-left text-sm leading-relaxed">
                  {stat.description}
                </p>

                <div className="mt-auto flex gap-1 pt-6">
                  {Array.from({ length: stat.ratingCount }).map((_, i) => (
                    <FaStar key={i} className={`size-4 ${stat.starColor}`} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

```

### `testimonials-1.tsx`
- **Path:** `src/components/watermelon-ui/testimonials-1.tsx`
- **Archetype:** testimonial / proof section
- **Dependencies:** lucide-react (registryDependency: testimonials, button)
- **Why it's here:** Baseline testimonial layout, same reasoning as stats-1 — structure first, easy to re-skin.

```tsx
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    heading: '"Ship faster without chaos"',
    quote:
      "We went from scattered financial ops to a clean, structured workflow. The visibility alone helped us move faster without breaking things.",
    author: "Guillermo Rauch",
    role: "CEO",
    company: "@vercel",
    companyColor: "text-orange-400",
    avatarUrl: "https://github.com/rauchg.png",
  },
  {
    id: 2,
    heading: '"Built for real teams"',
    quote:
      "The onboarding was seamless, and the product just clicks. It fits naturally into how modern teams actually work.",
    author: "Lee Robinson",
    role: "VP of Developer Experience",
    company: "@vercel",
    companyColor: "text-orange-500",
    avatarUrl: "https://github.com/leerob.png",
  },
  {
    id: 3,
    heading: '"Clarity at scale"',
    quote:
      "As systems grow, things get messy. This gave us clarity across teams without adding complexity.",
    author: "Dan Abramov",
    role: "Software Engineer",
    company: "@meta",
    companyColor: "text-blue-500",
    avatarUrl: "https://github.com/gaearon.png",
  },
  {
    id: 4,
    heading: '"Actually enjoyable to use"',
    quote:
      "Most tools feel like a chore. This one doesn’t. It’s fast, predictable, and genuinely pleasant to work with.",
    author: "Kent C. Dodds",
    role: "Educator",
    company: "@kentcdodds",
    companyColor: "text-indigo-500",
    avatarUrl: "https://github.com/kentcdodds.png",
  },
  {
    id: 5,
    heading: '"Clean, thoughtful design"',
    quote:
      "The attention to detail is obvious. Everything feels intentional, from interactions to layout.",
    author: "Evan You",
    role: "Creator of Vue",
    company: "@vuejs",
    companyColor: "text-pink-500",
    avatarUrl: "https://github.com/yyx990803.png",
  },
  {
    id: 6,
    heading: '"Zero friction setup"',
    quote:
      "We integrated everything in minutes. No weird edge cases, no hacks — just worked out of the box.",
    author: "Theo Browne",
    role: "Founder",
    company: "@t3code",
    companyColor: "text-emerald-500",
    avatarUrl: "https://github.com/t3dotgg.png",
  },
  {
    id: 7,
    heading: '"Insights that matter"',
    quote:
      "The analytics aren’t just numbers — they actually help you make better decisions, faster.",
    author: "Addy Osmani",
    role: "Engineering Manager",
    company: "@google",
    companyColor: "text-purple-500",
    avatarUrl: "https://github.com/addyosmani.png",
  },
  {
    id: 8,
    heading: '"Reliable and simple"',
    quote:
      "No unnecessary complexity. It does what it promises, and it does it really well.",
    author: "Sindre Sorhus",
    role: "Open Source Developer",
    company: "@sindresorhus",
    companyColor: "text-rose-500",
    avatarUrl: "https://github.com/sindresorhus.png",
  },
];

export default function Testimonials1() {
  return (
    <section className=" bg-background w-full py-16 h-full items-center justify-center">
      <div className="container mx-auto px-4 md:px-6 my-auto">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
            Trusted by teams who lead people
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            Save hours every week, reduce complexity, and let your HR team focus
            on people — not processes.
          </p>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="px-2 py-2">
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="bg-muted/50 flex h-full min-h-[320px] flex-col justify-between rounded-4xl p-6 ring-0 select-none">
                    <div>
                      <h3 className="text-foreground mb-2 text-2xl leading-tight font-medium md:text-2xl">
                        {testimonial.heading}
                      </h3>
                      <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed md:text-base">
                        {testimonial.quote}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Avatar className="border-border h-12 w-12 border">
                        <AvatarImage
                          src={testimonial.avatarUrl}
                          alt={testimonial.author}
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {testimonial.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-foreground font-medium">
                          {testimonial.author}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          {testimonial.role}{" "}
                          <span className={testimonial.companyColor}>
                            {testimonial.company}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-10 flex w-full justify-center gap-2">
              <CarouselPrevious className="bg-muted hover:bg-muted/50 relative inset-0 size-10 rounded-xl border transition-colors" />
              <CarouselNext className="bg-muted hover:bg-muted/50 relative inset-0 size-10 rounded-xl transition-colors" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}

```

### `reveal-copy.tsx`
- **Path:** `src/components/watermelon-ui/reveal-copy.tsx`
- **Archetype:** calm motion primitive — text reveal
- **Dependencies:** lucide-react, motion
- **Why it's here:** Scroll-triggered copy reveal — the calm-motion pick from this repo, complements Fluid Functionalism's interaction-level springs with a content-level reveal pattern.

```tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaCopy } from 'react-icons/fa';
import { BsEyeFill } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';

type RevealAndCopyProps = {
  cardNumber: string;
  hiddenIndexes?: number[];
  revealDuration?: number;
  copiedDuration?: number;
};

export const RevealAndCopy = ({
  cardNumber,
  hiddenIndexes = [1, 2],
  revealDuration = 3000,
  copiedDuration = 1200,
}: RevealAndCopyProps) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  const parts = cardNumber.split(' ');

  const resetAll = useCallback(() => {
    setRevealed(false);
    setCopied(false);
    setTimerActive(false);
  }, []);

  useEffect(() => {
    if (!revealed) return;

    setTimerActive(true);

    const timer = setTimeout(() => {
      if (!copied) resetAll();
    }, revealDuration);

    return () => clearTimeout(timer);
  }, [revealed, copied, revealDuration, resetAll]);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      resetAll();
    }, copiedDuration);

    return () => clearTimeout(timer);
  }, [copied, copiedDuration, resetAll]);

  const handleCopy = async () => {
    if (copied) return;

    await navigator.clipboard.writeText(cardNumber);

    setCopied(true);
    setTimerActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-white transition-colors duration-500 dark:bg-zinc-950">
      <div className="flex h-[70px] w-full max-w-[420px] items-center rounded-[20px] border-2 border-[#E5E4ED] bg-white px-3 shadow-sm transition-colors duration-500 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative flex flex-1 items-center justify-between overflow-hidden text-[16px] tracking-[0.08em] sm:text-[22px] sm:tracking-[0.18em]">
          <AnimatePresence>
            {revealed && (
              <motion.div
                key="shine"
                initial={{ left: '-60%' }}
                animate={{ left: '160%' }}
                transition={{
                  delay: 0.35,
                  duration: 1,
                  ease: 'linear',
                }}
                className="pointer-events-none absolute inset-y-0 z-30 w-[60%] mix-blend-overlay dark:mix-blend-screen"
                style={{
                  transform: 'skewX(-20deg)',
                  background: `
                    linear-gradient(
                      90deg,
                      transparent 0%,
                      rgba(255,255,255,0.15) 20%,
                      rgba(255,255,255,0.9) 50%,
                      rgba(255,255,255,0.15) 80%,
                      transparent 100%
                    )
                  `,
                  filter: 'blur(6px)',
                }}
              />
            )}
          </AnimatePresence>

          {parts.map((part, idx) => {
            const isMasked = !revealed && hiddenIndexes.includes(idx);
            const display = isMasked ? 'xxxx' : part;

            return (
              <div
                key={idx}
                className="relative flex flex-1 min-w-0 justify-center overflow-hidden font-bold"
              >
                <div className="relative flex items-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {display.split('').map((char, i) => (
                      <motion.span
                        key={`${display}-${i}`}
                        initial={{
                          opacity: 0,
                          y: 12,
                          scale: 0.5,
                          filter: 'blur(4px)',
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          filter: 'blur(0px)',
                          transition: {
                            type: 'spring',
                            stiffness: 200,
                            damping: 14,
                            delay: i * 0.06,
                          },
                        }}
                        exit={{
                          opacity: 0,
                          y: -12,
                          scale: 0.5,
                          filter: 'blur(4px)',
                          transition: {
                            delay: i * 0.06,
                            duration: 0.18,
                          },
                        }}
                        className="text-[#282828] tabular-nums dark:text-zinc-100"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative ml-2 shrink-0 sm:ml-4 h-12 w-12">
          <AnimatePresence mode="popLayout" initial={false}>
            {!revealed && (
              <motion.button
                key="eye"
                onClick={() => setRevealed(true)}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="flex h-full w-full items-center justify-center rounded-2xl bg-[#E4E4FF] text-[#4E53CA] dark:bg-indigo-900/30 dark:text-indigo-400"
              >
                <BsEyeFill size={22} />
              </motion.button>
            )}

            {revealed && (
              <motion.button
                key="copy"
                onClick={handleCopy}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className={`relative flex h-full w-full items-center justify-center rounded-2xl transition-colors duration-300 ${copied
                  ? 'bg-[#2DBE50] text-white'
                  : 'bg-[#CAF9D5] text-[#2DBE50] dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}
              >
                {timerActive && !copied && (
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 48 48"
                  >
                    <motion.rect
                      x="1.5"
                      y="1.5"
                      width="45"
                      height="45"
                      rx="14"
                      ry="14"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="180"
                      initial={{ strokeDashoffset: 180 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{
                        duration: revealDuration / 1000,
                        ease: 'linear',
                      }}
                    />
                  </svg>
                )}

                {copied ? <FaCheck size={22} /> : <FaCopy size={22} />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

```
