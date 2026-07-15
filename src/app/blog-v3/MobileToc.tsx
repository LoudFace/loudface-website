/** MobileToc — static (never-sticky) "On this page" disclosure shown under the
 *  lead on <=1024px, where the sticky rail is hidden. Native <details>, no JS. */
interface MobileTocProps {
  items: { id: string; text: string }[];
}

export function MobileToc({ items }: MobileTocProps) {
  if (items.length === 0) return null;
  return (
    <details className="toc-m">
      <summary>
        On this page
        <svg className="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </summary>
      <ol>
        {items.map((item) => (
          <li key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>
        ))}
      </ol>
    </details>
  );
}
