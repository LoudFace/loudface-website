/**
 * A result as a molded chip, in CSS alone: the number is a tab, the words
 * are a shrink-wrapped box beneath it, and the shape's one concave corner
 * sits where the tab's right edge meets the box. Every part is fit-content,
 * so it adapts to any number and any label and wraps at any width — and
 * nothing is measured, so nothing can drift when the font swaps in.
 */
export function StatChip({ number, line, lead = false }: { number: string; line?: string; lead?: boolean }) {
  const border = lead ? 'border-primary-200' : 'border-surface-300';
  const bodyBg = lead ? 'bg-primary-50' : 'bg-surface-50';
  const fillet = lead ? 'var(--color-primary-50)' : 'var(--color-surface-50)';
  const filletStroke = lead ? 'var(--color-primary-200)' : 'var(--color-surface-300)';
  return (
    <span className="inline-grid max-w-full justify-items-start">
      <span
        className={`proposal-num relative z-10 -mb-px inline-flex h-[26px] items-center rounded-t-lg border border-b-0 px-2.5 text-[13.5px] font-semibold tracking-[-0.02em] ${border} ${
          lead ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-950'
        }`}
      >
        {number}
        {/* the concave corner: fills the notch to the right of the tab */}
        <svg aria-hidden="true" className="absolute bottom-0 left-full" width="9" height="9" viewBox="0 0 9 9">
          <path d="M0 0V9H9A9 9 0 0 0 0 0Z" fill={fillet} />
          <path d="M9 9A9 9 0 0 0 0 0" fill="none" stroke={filletStroke} strokeWidth="1" />
        </svg>
      </span>
      {line && (
        <span
          className={`inline-block max-w-full rounded-lg rounded-tl-none border px-3 py-1.5 text-[13px] leading-[1.45] ${border} ${bodyBg} ${
            lead ? 'font-medium text-primary-900' : 'text-surface-700'
          }`}
        >
          {line}
        </span>
      )}
    </span>
  );
}
