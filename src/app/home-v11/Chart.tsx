/** The LoudFace annotation pin and date helpers shared by the page. Charts themselves live in LiveChart.tsx. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const dayMonth = (iso: string) => { const d = new Date(`${iso}T00:00:00Z`); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
export const dayMonthYear = (iso: string) => `${dayMonth(iso)} ${iso.slice(0, 4)}`;

/** The proposal annotation pin: the LoudFace mark in a #5222FF disc. */
export function Pin({ x, y, size = 26, ring = 'lg' }: { x: number; y: number; size?: number; ring?: 'lg' | 'sm' }) {
  const inner = Math.round(size * (ring === 'lg' ? 18 / 26 : 0.7));
  return (
    <span
      className="v11-pin"
      style={{
        left: x - size / 2, top: y - size / 2, width: size, height: size,
        boxShadow: ring === 'lg' ? '0 0 0 1.5px #d8d5ea, 0 3px 8px rgba(40,20,120,0.22)' : '0 0 0 1.5px #ffffff, 0 2px 6px rgba(40,20,120,0.25)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/lf-logo.svg" alt="" width={inner} height={inner} style={{ left: (size - inner) / 2, top: (size - inner) / 2 }} />
    </span>
  );
}
