/**
 * Replacing one image, from the file an editor picked on the page.
 *
 * One request per image, as form data, because an image is bytes and the
 * publish route speaks JSON. Two very different things happen depending on
 * where the picture came from:
 *
 *   - a Sanity image: the file is uploaded as a new asset and every field that
 *     pointed at the old one is re-pointed, on the published document and its
 *     draft. Live in under a minute, no rebuild;
 *   - a content image: the file is committed into the repository next to the
 *     JSON value naming it, in one commit, so history and undo keep working
 *     exactly as they do for a sentence.
 *
 * Nothing here trusts the browser about what it sent. The size is measured
 * after reading, the format is read out of the file's first bytes, and the name
 * is reduced to letters, digits and dashes before it can become a path.
 */
import { createHash } from 'node:crypto';
import { currentEditor, sealImageUndo } from '@/lib/inline-edit/session';
import { editorOffResponse } from '@/lib/inline-edit/guard';
import { publish, uploadedFiles } from '@/lib/inline-edit/content-store';
import { replaceImageAsset } from '@/lib/inline-edit/sanity-store';
import {
  MAX_IMAGE_BYTES,
  NOT_AN_IMAGE_MESSAGE,
  TOO_BIG_MESSAGE,
  existingUploadPath,
  parseImageEditId,
  publicPathFor,
  sniffImageType,
  uploadPathFor,
} from '@/lib/inline-edit/image-edit';

/**
 * Reading the file, uploading it to Sanity or committing it over the GitHub
 * API is several seconds of work. The default ten would cut a slow upload off
 * halfway. Vercel's own limit on the request itself is 4.5 MB, which is why
 * `MAX_IMAGE_BYTES` is three: a bigger file never reaches this code at all, and
 * the error would come from the platform rather than from a sentence we wrote.
 */
export const maxDuration = 60;

const bad = (message: string, status = 400) => Response.json({ error: message }, { status });

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const editor = await currentEditor();
  if (!editor) return bad('Sign in to publish', 401);

  const form = await request.formData().catch(() => null);
  if (!form) return bad('Send the image as form data');

  const id = form.get('id');
  const file = form.get('file');
  if (typeof id !== 'string' || !id) return bad('Which image?');
  if (!file || typeof file === 'string') return bad('No file was attached');

  const target = parseImageEditId(id);
  if (!target) return bad('That is not an image this editor can replace');

  // The declared size first, so a huge file is refused before it is read into
  // memory; then the real length, because the declared one is the sender's word.
  if (file.size > MAX_IMAGE_BYTES) return bad(TOO_BIG_MESSAGE);
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) return bad(TOO_BIG_MESSAGE);
  if (!bytes.length) return bad('That file is empty');

  const kind = sniffImageType(bytes);
  if (!kind) return bad(NOT_AN_IMAGE_MESSAGE);

  const name = typeof file.name === 'string' && file.name ? file.name : `image.${kind.ext}`;

  if (target.kind === 'sanity') {
    try {
      const result = await replaceImageAsset(target.assetId, bytes, name, kind.contentType);
      return Response.json({
        ok: true,
        mode: 'sanity',
        replaced: result.replaced,
        newAssetId: result.newAssetId,
        url: result.url,
        undo: sealImageUndo(result.previous),
      });
    } catch (error) {
      return bad(error instanceof Error ? error.message : 'That image could not be replaced');
    }
  }

  // A content image. The file is named after itself: the hash makes the path
  // unique, so the same picture uploaded twice reuses one file and a different
  // picture can never overwrite one a live page still points at.
  const sha1 = createHash('sha1').update(bytes).digest('hex');
  // The same picture may already be in the repository under an earlier month.
  // Point at that file rather than committing a second copy of the same bytes:
  // a git history keeps every blob for ever, and nothing else changes for the
  // page, which gets the same address either way.
  const already = existingUploadPath(await uploadedFiles(), sha1, kind.ext);
  const repositoryPath = already ?? uploadPathFor(name, sha1, kind.ext);
  const publicPath = publicPathFor(repositoryPath);

  try {
    // No `exact` flag: a path is plain text, so it costs nothing to send it
    // through the same cleaner every other published value goes through.
    const result = await publish(
      [{ id: target.id, value: publicPath }],
      editor,
      already ? [] : [{ path: repositoryPath, base64: bytes.toString('base64') }],
    );
    return Response.json({ ok: true, mode: result.mode, path: publicPath, hash: result.hash });
  } catch (error) {
    return bad(error instanceof Error ? error.message : 'That image could not be published');
  }
}
