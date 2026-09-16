/**
 * Dev-only Draft Mode switch for the inline editing prototype.
 * The production draft route is Sanity's, which requires its token; this one
 * exists so the prototype can be tried on content that never touches Sanity.
 */
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not available', { status: 404 });
  }
  const slug = new URL(request.url).searchParams.get('slug') ?? '/';
  const draft = await draftMode();
  draft.enable();
  redirect(slug.startsWith('/') ? slug : '/');
}
