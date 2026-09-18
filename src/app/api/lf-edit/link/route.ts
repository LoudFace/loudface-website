/**
 * "Where does this link's address live?"
 *
 * The editor can see a link's words on the page, because those words are a
 * content value and carry their id. It cannot see which field holds the
 * address: that value is never marked, so it arrives on the page as a plain
 * `href` with nothing attached to it.
 *
 * So the browser asks. It sends the id of the words and the address the anchor
 * is showing; this route opens that content file, looks at the fields sitting
 * next to the words, and answers with the id of the one that holds this
 * address. From there a link change is an ordinary content change: the editor
 * stages `{ id, value }` and publishes it through the normal route, so History,
 * Undo and the one-line diff all work without knowing links exist.
 *
 * A read, and only of content this site already ships, so the answer is either
 * a field id or a plain sentence about why there is none.
 */
import { currentEditor } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { parseId } from '@/lib/inline-edit/content-text';
import { findSiblingAddressId } from '@/lib/inline-edit/link-edit';
import { rawContent } from '@/lib/content-utils';

export async function GET(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  if (!(await currentEditor())) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id') ?? '';
  const href = url.searchParams.get('href') ?? '';
  if (!id || !href) return Response.json({ id: null, reason: 'Which link?' }, { status: 400 });

  let file: string;
  try {
    ({ file } = parseId(id));
  } catch {
    return Response.json({ id: null, reason: 'That is not a content value this editor knows' });
  }

  // The bundled content, which is the same copy the page rendered the link
  // from, so the address the browser sent and the address in the file are two
  // views of one deployment rather than of two different moments.
  const content = rawContent(file);
  if (!content) return Response.json({ id: null, reason: `There is no content file named ${file}` });

  // The site's own address, so a link written out in full
  // (https://www.loudface.co/pricing) still matches a stored `/pricing`.
  const origin = process.env.LF_SITE_URL?.replace(/\/$/, '') ?? url.origin;
  return Response.json(findSiblingAddressId(content, id, href, origin));
}
