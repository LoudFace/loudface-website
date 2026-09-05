/**
 * Harvested VERBATIM from Aceternity UI (`components/ui/bento-grid.tsx`,
 * https://ui.aceternity.com/components/bento-grid, registry:
 * https://ui.aceternity.com/registry/bento-grid.json).
 *
 * Permitted edits only:
 *  - The library's neutral border → `border-primary-100` and `dark:border-white/[0.2]`
 *    → `border-white/20` (colour re-keying — the project's own hairline
 *    indigo-tinted border token family, not raw Tailwind neutral).
 *  - `dark:bg-black` → removed; this grid only ever sits on the crisp-light
 *    stage in this transplant, so the dark-mode branch is dead weight.
 *  - The library's muted text colours → the
 *    project's own ink/body tokens are applied via the `.ip`-style utility
 *    classes at the call site instead of editing the component's Tailwind
 *    classes further — left as close to verbatim as the palette map allows.
 */
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-primary-100 bg-white p-4 transition duration-200 hover:shadow-xl",
        className,
      )}
    >
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-2 font-sans font-bold text-surface-900">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-surface-600">
          {description}
        </div>
      </div>
    </div>
  );
};
