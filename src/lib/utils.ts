import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * The `cn()` helper every shadcn-flavoured component library expects.
 *
 * Added so harvested components (Aceternity, Magic UI, beUI, Bklit) can be
 * transplanted with their class strings intact instead of being rewritten —
 * rewriting them by hand is what turns a designed component into a cheap
 * imitation of one. Only the colour tokens get re-keyed to the project palette.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
