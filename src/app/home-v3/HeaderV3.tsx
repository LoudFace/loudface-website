const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#tracks' },
  { label: 'Pricing', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Blog', href: '#' },
];

/**
 * HeaderV3 — the homepage-v3 header (transparent-white over the indigo hero,
 * flips to white-glass on scroll via the .at-top class toggled in HomepageV3Scripts).
 * Bespoke to the v3 dark hero; unifying with the shared site Header (which is
 * light-only) is a later, deliberate step before the / swap.
 */
export function HeaderV3() {
  return (
    <header className="hd at-top">
      <div className="container hd-in">
        <a href="#" className="wordmark" aria-label="LoudFace home">
          <img className="lm-dark" src="/homepage-v3/assets/loudface.svg" alt="LoudFace" width={133} height={28} />
          <img className="lm-light" src="/homepage-v3/assets/loudface-inversed.svg" alt="LoudFace" width={133} height={27} />
        </a>
        <nav className="hd-nav" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.label} href={n.href}>{n.label}</a>
          ))}
        </nav>
        <a href="#book" className="btn btn-ink btn-pill btn-hd">Book a call</a>
      </div>
    </header>
  );
}
