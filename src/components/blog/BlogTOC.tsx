interface BlogTOCProps {
  items: { id: string; text: string }[];
}

/**
 * Article table-of-contents. Plain ghosted links — no left-border bars.
 * Active-section highlighting is intentionally out of scope; sidebar
 * stays a pure server render.
 */
export function BlogTOC({ items }: BlogTOCProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <span className="block text-[11px] font-medium text-surface-500 uppercase tracking-[0.08em] mb-4">
        On this page
      </span>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block text-sm leading-snug text-surface-500 hover:text-surface-950 transition-colors"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
