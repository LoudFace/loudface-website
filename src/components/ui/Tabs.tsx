'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { motion, MotionConfig, useReducedMotion, type Transition } from 'motion/react';

type TabsVariant = 'pill' | 'segment' | 'underline';
type TabsTone = 'light' | 'dark';
type TabsOrientation = 'horizontal' | 'vertical';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  layoutId: string;
  baseId: string;
  variant: TabsVariant;
  tone: TabsTone;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used inside <Tabs>.');
  return context;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function idPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

const indicatorTransition: Transition = {
  type: 'spring',
  stiffness: 210,
  damping: 28,
  mass: 0.9,
};

/**
 * Accessible animated tabs adapted from beUI's Tabs component and the
 * text-state swap pattern from Transitions.dev.
 *
 * This version uses LoudFace tokens and adds linked tab/panel IDs, roving focus,
 * Home/End keys, and orientation-aware arrow-key navigation.
 */
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'pill',
  tone = 'light',
  className = '',
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  tone?: TabsTone;
  className?: string;
  children: ReactNode;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const generatedId = useId();
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!controlled) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [controlled, onValueChange]
  );

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      setValue,
      layoutId: `tabs-indicator-${generatedId}`,
      baseId: `tabs-${generatedId}`,
      variant,
      tone,
    }),
    [currentValue, generatedId, setValue, tone, variant]
  );

  return (
    <MotionConfig reducedMotion="user" transition={indicatorTransition}>
      <TabsContext.Provider value={contextValue}>
        <motion.div layoutRoot className={className}>
          {children}
        </motion.div>
      </TabsContext.Provider>
    </MotionConfig>
  );
}

const listClasses: Record<TabsVariant, string> = {
  pill: 'inline-flex items-center gap-1 rounded-full p-1',
  segment: 'inline-flex items-center gap-1 rounded-xl p-1',
  underline: 'inline-flex items-center gap-1 border-b',
};

export function TabsList({
  children,
  orientation = 'horizontal',
  className = '',
  ariaLabel,
}: {
  children: ReactNode;
  orientation?: TabsOrientation;
  className?: string;
  ariaLabel?: string;
}) {
  const { variant, tone } = useTabsContext();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]:not(:disabled)')
    );
    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex < 0 || tabs.length === 0) return;

    const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    let nextIndex: number | null = null;

    if (event.key === previousKey) nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === nextKey) nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={cx(
        listClasses[variant],
        tone === 'dark'
          ? variant === 'underline'
            ? 'border-white/20'
            : 'bg-white/8 ring-1 ring-white/15'
          : variant === 'underline'
            ? 'border-surface-200'
            : 'bg-surface-100 ring-1 ring-surface-200',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className = '',
  indicatorClassName = '',
  children,
}: {
  value: string;
  className?: string;
  indicatorClassName?: string;
  children: ReactNode;
}) {
  const { value: currentValue, setValue, layoutId, baseId, variant, tone } = useTabsContext();
  const active = currentValue === value;
  const triggerId = `${baseId}-tab-${idPart(value)}`;
  const panelId = `${baseId}-panel-${idPart(value)}`;
  const indicatorColor = tone === 'dark' ? 'bg-white' : 'bg-primary-600';

  return (
    <div className={cx('relative', variant === 'underline' && '-mb-px')}>
      {active ? (
        <motion.span
          layoutId={layoutId}
          layout="position"
          aria-hidden="true"
          className={cx(
            'absolute',
            variant === 'underline'
              ? '-bottom-px left-0 right-0 h-0.5'
              : variant === 'pill'
                ? 'inset-0 rounded-full'
                : 'inset-0 rounded-lg',
            indicatorColor,
            indicatorClassName
          )}
        />
      ) : null}
      <button
        id={triggerId}
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={panelId}
        tabIndex={active ? 0 : -1}
        onClick={() => setValue(value)}
        className={cx(
          'relative z-10 inline-flex min-h-11 items-center justify-center whitespace-nowrap bg-transparent px-4 py-2 text-sm font-medium outline-none transition-colors',
          variant === 'pill' && 'rounded-full',
          variant === 'segment' && 'rounded-lg',
          active
            ? tone === 'dark'
              ? 'text-primary-950'
              : 'text-white'
            : tone === 'dark'
              ? 'text-primary-200 hover:text-white'
              : 'text-surface-600 hover:text-surface-950',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          className
        )}
      >
        {children}
      </button>
    </div>
  );
}

export function TabsContent({
  value,
  className = '',
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const { value: currentValue, baseId } = useTabsContext();
  const reduceMotion = useReducedMotion();
  const active = currentValue === value;
  const triggerId = `${baseId}-tab-${idPart(value)}`;
  const panelId = `${baseId}-panel-${idPart(value)}`;

  if (!active) {
    return (
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={triggerId}
        hidden
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={panelId}
      role="tabpanel"
      aria-labelledby={triggerId}
      tabIndex={0}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 6, filter: reduceMotion ? 'none' : 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
