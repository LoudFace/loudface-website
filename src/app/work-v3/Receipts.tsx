/**
 * Receipts — crisp-light "how to read these studies" band. The counts are
 * derived from the live archive (total studies + how many credit a named
 * client) so they can never drift from what's actually on the page.
 */
export function Receipts({ total, namedClients }: { total: number; namedClients: number }) {
  return (
    <section className="rcpt" aria-label="How to read these studies">
      <div className="container">
        <div className="rcpt-grid">
          <div className="rcpt-main rv">
            <h2>
              Every screenshot is the live site.
              <br />
              <span className="ghost">Every number is the engagement.</span>
            </h2>
            <p>
              No stock mockups, no borrowed logos, no rounded-up wins. If a study names a client, we
              worked with that client. If it shows a number, it came from that project — and where
              it&rsquo;s a headline outcome, we say who and over what period.
            </p>
            <div className="rcpt-tags">
              <span className="rcpt-tag">
                <i></i>
                {total} studies on file
              </span>
              <span className="rcpt-tag">
                <i></i>
                {namedClients} named clients
              </span>
              <span className="rcpt-tag">
                <i></i>0 stock mockups
              </span>
            </div>
          </div>
          <div className="rcpt-side">
            <div className="rs rv" style={{ ['--d' as string]: '.06s' }}>
              <span className="rs-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <b>Named clients, real domains</b>
              <p>
                {namedClients} of {total} studies credit the client by name and link to the site we
                shipped — open it in a new tab.
              </p>
            </div>
            <div className="rs rv" style={{ ['--d' as string]: '.12s' }}>
              <span className="rs-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16 16l5 5" />
                </svg>
              </span>
              <b>Outcomes you can trace</b>
              <p>
                Each stat maps to the shipped work — not a pitch-deck projection or a stat we
                couldn&rsquo;t stand behind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
