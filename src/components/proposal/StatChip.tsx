/**
 * A result as one molded shape, in CSS: the number tag and the words are a
 * single inline run, so the browser wraps them; a second, invisible copy of
 * that run paints a per-line background (`box-decoration-break: clone`) and
 * is passed through an SVG "goo" filter, which fuses the touching line boxes
 * into one blob with smooth concave joins and adds a hairline outline.
 *
 * Both copies share one grid cell and one width, so they wrap identically.
 * Nothing is measured, so the shape cannot drift when the web font lands.
 */
function GooFilter({ id, stroke }: { id: string; stroke: string }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id={id} x="-10%" y="-20%" width="120%" height="140%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11" result="goo" />
        <feMorphology in="goo" operator="dilate" radius="1" result="dilated" />
        <feFlood floodColor={stroke} result="ink" />
        <feComposite in="ink" in2="dilated" operator="in" result="outline" />
        <feMerge>
          <feMergeNode in="outline" />
          <feMergeNode in="goo" />
        </feMerge>
      </filter>
    </svg>
  );
}

export function StatChip({ number, line, lead = false }: { number: string; line?: string; lead?: boolean }) {
  const filterId = lead ? 'proposal-goo-lead' : 'proposal-goo-quiet';
  const tag = `proposal-num mr-2 inline-flex h-[22px] items-center rounded-[5px] px-1.5 align-middle text-[13px] font-semibold tracking-[-0.02em] ${
    lead ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-950'
  }`;
  const run = (
    <>
      <span className={tag}>{number}</span>
      {line}
    </>
  );
  return (
    <>
      <GooFilter id={filterId} stroke={lead ? '#c7d2fe' : '#d4d4d4'} />
    <span className="relative grid max-w-full text-[13px] leading-[2]">
      {/* the shape: same run, invisible text, per-line background, fused by the filter */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 select-none"
        style={{ filter: `url(#${filterId})` }}
      >
        <span
          className={`proposal-goo-run text-transparent ${lead ? 'bg-primary-50' : 'bg-surface-50'}`}
          style={{ boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
        >
          <span className={`${tag} invisible`}>{number}</span>
          {line}
        </span>
      </span>
      {/* the words, on top */}
      <span className={`proposal-goo-run relative z-10 col-start-1 row-start-1 ${lead ? 'font-medium text-primary-900' : 'text-surface-700'}`}>
        {run}
      </span>
    </span>
    </>
  );
}
