/**
 * "Is this site set up to publish?" — one page of yes or no.
 *
 * Every question here has cost someone a debugging session: a missing branch, a
 * misspelled credential, a sender that was never set. The answer is booleans
 * and names only. No token, no key and no secret is ever in the response, and a
 * signed-in editor is required, so this is not a way to fingerprint the site.
 */
import { allowedEditors, currentEditor } from '@/lib/inline-edit/session';
import { editorOffResponse, inlineEditingEnabled } from '@/lib/inline-edit/guard';
import { mode } from '@/lib/inline-edit/content-store';
import { hasGitHubCredentials, repoFromEnv } from '@/lib/inline-edit/github';

export async function GET() {
  const off = editorOffResponse();
  if (off) return off;

  if (!(await currentEditor())) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const repo = repoFromEnv();
  return Response.json({
    inlineEditingEnabled: inlineEditingEnabled(),
    store: mode(),
    github: {
      credentials: hasGitHubCredentials(),
      token: Boolean(process.env.LF_GITHUB_TOKEN),
      app: Boolean(
        process.env.LF_GITHUB_APP_ID &&
          process.env.LF_GITHUB_APP_PRIVATE_KEY &&
          process.env.LF_GITHUB_INSTALLATION_ID,
      ),
      repo: repo ? `${repo.owner}/${repo.name}` : null,
      branch: repo?.branch ?? null,
    },
    editors: allowedEditors().length,
    email: { sender: Boolean(process.env.LF_EDIT_FROM), resendKey: Boolean(process.env.RESEND_API_KEY) },
    siteUrl: Boolean(process.env.LF_SITE_URL),
    sanityWriteToken: Boolean(process.env.LF_SANITY_WRITE_TOKEN),
  });
}
