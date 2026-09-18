/**
 * The one link a client gets.
 *
 * They type the email address we allow-listed for their site and receive a
 * link that signs them in and turns editing on. No password, no account with
 * us, nothing to install.
 */
import type { Metadata } from 'next';
import { currentEditor } from '@/lib/inline-edit/session';

export const metadata: Metadata = { title: 'Edit the site', robots: { index: false, follow: false } };

export default async function EditSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; expired?: string; link?: string }>;
}) {
  const { sent, expired, link } = await searchParams;
  const editor = await currentEditor();

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#f4f7f9',
        font: '16px/1.5 ui-sans-serif, system-ui, sans-serif',
        color: '#14212b',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 18px 50px rgba(13,27,42,.10)' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, letterSpacing: '-0.02em' }}>Edit the site</h1>

        {editor ? (
          <>
            <p style={{ margin: '0 0 18px', color: '#52616d' }}>
              Signed in as {editor}. Open any page and click the text you want to change.
            </p>
            {/* Through resume, not straight to "/": Draft Mode's own cookie ends
                with the browser window, so a client coming back later has a good
                session but no editing bar until this route switches it on again. */}
            <a href="/api/lf-edit/resume?next=%2F" style={primary}>
              Go to the site
            </a>
            <a href="/api/lf-edit/signout" style={{ ...ghost, marginTop: 10 }}>
              Sign out
            </a>
          </>
        ) : sent ? (
          <>
            <p style={{ margin: 0, color: '#52616d' }}>
              If that address can edit this site, a sign-in link is on its way. It expires in
              12 hours.
            </p>
            {link && process.env.NODE_ENV !== 'production' && (
              <a href={link} style={{ ...primary, marginTop: 16 }}>
                Open the link (development only)
              </a>
            )}
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 18px', color: '#52616d' }}>
              {expired
                ? 'That link has expired. Here is a fresh one.'
                : 'Enter your email and we will send you a sign-in link.'}
            </p>
            <form action="/api/lf-edit/signin" method="post">
              <input
                type="email"
                name="email"
                required
                autoFocus
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 10,
                  border: '1px solid #cfd9e2',
                  font: 'inherit',
                  marginBottom: 12,
                }}
              />
              <button type="submit" style={{ ...primary, width: '100%', border: 0, cursor: 'pointer' }}>
                Send me the link
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

const primary: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  padding: '11px 16px',
  borderRadius: 10,
  background: '#0d1b2a',
  color: '#fff',
  font: '600 15px ui-sans-serif, system-ui, sans-serif',
  textDecoration: 'none',
};

const ghost: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #cfd9e2',
  color: '#14212b',
  font: '15px ui-sans-serif, system-ui, sans-serif',
  textDecoration: 'none',
};
