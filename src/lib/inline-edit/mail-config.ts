/**
 * The key the sign-in mail is sent with, in one place: the mail sender and the
 * health route must read the same expression, or health reports a key the mail
 * does not use.
 *
 * The editor's own key first (2026-10-29): a client site may already hold a
 * RESEND_API_KEY for its contact form, on another Resend account that cannot
 * send from our sender. Eight Strands did.
 */
export const resendKey = (): string | undefined => process.env.LF_EDIT_RESEND_KEY || process.env.RESEND_API_KEY;
