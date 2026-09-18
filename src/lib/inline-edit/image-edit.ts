/**
 * Replacing an image from the page: the parts that are pure string and byte work.
 *
 * Everything here runs on both sides. The editor in the browser uses it to work
 * out which images on a page can be replaced; the `/api/lf-edit/image` route
 * uses the same functions to decide what it was handed. So this file must stay
 * free of `server-only`, of `node:` imports and of anything with a request
 * behind it — a test can then run every rule without the Next runtime, and the
 * client bundle stays small.
 *
 * Two kinds of image are editable, and they are told apart by their address:
 *
 *   - a content image, whose path came out of `src/data/content/*.json` and was
 *     tagged by `mark-tree.ts` with `?lf=<content id>`;
 *   - a Sanity image, served from `cdn.sanity.io`, whose asset document id can
 *     be rebuilt from the URL because Sanity's file names are content-addressed.
 *
 * Both arrive through `next/image`, which rewrites the address to
 * `/_next/image?url=<percent-encoded original>&w=640&q=82`. That rewrite is why
 * the old `img[src*="lf="]` selector matched nothing: the `=` in `lf=` is
 * encoded as `%3D` inside the `url` parameter. `realImageSource` undoes it.
 */

/**
 * The largest file an editor may put on a page.
 *
 * Under Vercel's own ceiling: a serverless function refuses a request body over
 * 4.5 MB before our code runs, and form-data encoding adds to the file's size,
 * so a 4 MB cap could be refused by the platform with an error nobody here
 * wrote. Three leaves room for the envelope and is still a large photograph.
 */
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/** The plain message for a file over the cap. Identical in the browser and on the server. */
export const TOO_BIG_MESSAGE = 'That image is over 3 MB; export it smaller and try again';

/** The plain message for anything whose first bytes are not one of the four formats we accept. */
export const NOT_AN_IMAGE_MESSAGE =
  'That file is not a PNG, JPEG, WebP or GIF image; save it as one and try again';

/**
 * How many documents may share one asset before we refuse.
 *
 * A logo or a placeholder can sit on dozens of pages. Replacing it from one
 * page would silently change every one of them, which is not what someone
 * clicking a single picture means to do. Above this count we say where to do it
 * instead rather than doing it everywhere.
 */
export const MAX_ASSET_DOCUMENTS = 3;

/** Where uploaded files live in the repository. */
export const UPLOAD_DIR = 'public/images/uploads';

/** The prefix an id carries when it names a Sanity asset rather than a content field. */
export const SANITY_IMAGE_PREFIX = 'sanity-image:';

/** `image-<hash>-<width>x<height>-<ext>`: the shape of a Sanity image asset document id. */
export const SANITY_ASSET_ID = /^image-[A-Za-z0-9]+-\d+x\d+-[a-z0-9]+$/;

/** `<file>:<path.to.field>`: the shape of one of our own content ids. */
const CONTENT_ID = /^[a-z0-9-]+:[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*$/;

/** decodeURIComponent, but a malformed escape gives the text back instead of throwing. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * The address the browser would have loaded without `next/image` in the way.
 *
 * `/_next/image?url=%2Fimages%2Fteam.webp%3Flf%3Dabout%3Ahero&w=640&q=82`
 * becomes `/images/team.webp?lf=about:hero`. Anything that is not an optimiser
 * address is returned unchanged.
 */
export function realImageSource(src: string): string {
  if (!src) return '';
  const query = src.indexOf('?');
  const path = query === -1 ? src : src.slice(0, query);
  if (!/(?:^|\/)_next\/image\/?$/.test(path)) return src;
  const inner = new URLSearchParams(query === -1 ? '' : src.slice(query + 1)).get('url');
  return inner || src;
}

/**
 * The content id tagged onto a content image path, or null.
 *
 * Two forms have to work: the plain `?lf=<id>` a page renders, and the
 * `%3Flf%3D<id>` that survives inside an optimiser address whose `url`
 * parameter was encoded twice (a `srcset` entry, a hand-written `<img>`).
 */
export function contentIdFromImageSrc(src: string): string | null {
  const real = realImageSource(src);
  for (const candidate of [real, safeDecode(real)]) {
    const match = /[?&]lf=([^&#"'\s]*)/.exec(candidate);
    if (match?.[1]) {
      const id = safeDecode(match[1]);
      if (CONTENT_ID.test(id)) return id;
    }
  }
  return null;
}

/**
 * The Sanity asset document id behind a CDN address, or null.
 *
 * `https://cdn.sanity.io/images/<project>/<dataset>/<hash>-1200x800.jpg?w=640`
 * is served from the asset document `image-<hash>-1200x800-jpg`. Sanity builds
 * the file name out of the asset id, so this is a rename, not a lookup — which
 * is the whole reason an image on the page can be traced back to a document
 * without asking the API first.
 */
export function sanityAssetIdFromUrl(src: string): string | null {
  const real = realImageSource(src);
  const match = /cdn\.sanity\.io\/images\/[^/]+\/[^/]+\/([A-Za-z0-9]+)-(\d+x\d+)\.([A-Za-z0-9]+)/.exec(real);
  if (!match) return null;
  return `image-${match[1]}-${match[2]}-${match[3].toLowerCase()}`;
}

/** An SVG cannot be swapped for a photo safely: it is markup, and it is often an icon. */
export function isSvgSource(src: string): boolean {
  const real = realImageSource(src);
  return /\.svg(?:[?#]|$)/i.test(real) || real.startsWith('data:image/svg');
}

export type ImageEditTarget =
  | { kind: 'sanity'; assetId: string }
  | { kind: 'content'; id: string };

/** Which of the two things an id sent to the image route names, or null for neither. */
export function parseImageEditId(id: string): ImageEditTarget | null {
  if (id.startsWith(SANITY_IMAGE_PREFIX)) {
    const assetId = id.slice(SANITY_IMAGE_PREFIX.length);
    return SANITY_ASSET_ID.test(assetId) ? { kind: 'sanity', assetId } : null;
  }
  return CONTENT_ID.test(id) ? { kind: 'content', id } : null;
}

// ---------------------------------------------------------------------------
// What is actually in the file
// ---------------------------------------------------------------------------

export type ImageKind = { ext: 'png' | 'jpg' | 'webp' | 'gif'; contentType: string };

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0): boolean => {
  if (bytes.length < offset + signature.length) return false;
  for (let i = 0; i < signature.length; i++) if (bytes[offset + i] !== signature[i]) return false;
  return true;
};

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

/**
 * The format of a file, read from its first bytes.
 *
 * Never from its name and never from the `Content-Type` the browser attached:
 * both are whatever the sender chose. An SVG renamed `photo.png` is markup with
 * a `<script>` in it, and a site that stores it and serves it back has handed a
 * signed-in client a way to run code on its own pages. Returns null for
 * everything that is not one of the four formats a browser draws as a picture.
 */
export function sniffImageType(bytes: Uint8Array): ImageKind | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { ext: 'png', contentType: 'image/png' };
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { ext: 'jpg', contentType: 'image/jpeg' };
  if (startsWith(bytes, ascii('GIF87a')) || startsWith(bytes, ascii('GIF89a'))) {
    return { ext: 'gif', contentType: 'image/gif' };
  }
  // WebP is a RIFF container: "RIFF", four bytes of length, then "WEBP".
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Where an uploaded file goes in the repository
// ---------------------------------------------------------------------------

/**
 * A file name turned into something safe to put in a path and in a URL.
 *
 * Lower case, ASCII letters and digits only, dashes between the rest. That
 * removes spaces (which break a bare `src`), removes `..` and `/` (which would
 * aim the commit at another folder), and removes the case differences that make
 * a file work on a Mac and 404 on the server.
 */
export function slugForUpload(name: string): string {
  const base = name.replace(/\.[^./\\]*$/, '');
  const slug = base
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return slug || 'image';
}

/**
 * The repository path an uploaded file takes:
 * `public/images/uploads/<yyyy-mm>/<name>-<8 characters of sha1>.<ext>`.
 *
 * The month keeps the folder browsable; the hash makes the name unique, so
 * uploading the same picture twice reuses one path and uploading a different
 * one under the same name never overwrites what a live page already points at.
 */
export function uploadPathFor(name: string, sha1: string, ext: string, now = new Date()): string {
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${UPLOAD_DIR}/${month}/${slugForUpload(name)}-${sha1.slice(0, 8).toLowerCase()}.${ext}`;
}

/**
 * The file already in the repository holding these exact bytes, or null.
 *
 * The name carries eight characters of the file's own sha1, so the same picture
 * uploaded again lands on the same name — but under the month it was uploaded
 * in, so re-uploading it in October used to add a second copy of the same bytes
 * under `2026-10/`. The repository is a git history: every copy is kept for
 * ever. This looks for the hash in what is already there and reuses that path.
 */
export function existingUploadPath(paths: string[], sha1: string, ext: string): string | null {
  const tail = `-${sha1.slice(0, 8).toLowerCase()}.${ext}`;
  return paths.find((path) => path.startsWith(`${UPLOAD_DIR}/`) && path.endsWith(tail)) ?? null;
}

/** The address a page uses for a file committed at that repository path. */
export function publicPathFor(repositoryPath: string): string {
  return repositoryPath.replace(/^public/, '');
}

// ---------------------------------------------------------------------------
// Finding an asset inside a Sanity document
// ---------------------------------------------------------------------------

const META_KEYS = new Set(['_id', '_type', '_rev', '_key', '_createdAt', '_updatedAt', '_system']);

/**
 * Every path in a document whose `asset._ref` is this asset.
 *
 * A picture can sit anywhere: a top-level field (`profilePicture`), a nested
 * object (`hero.image`), or an item in an array of blocks. An array item is
 * addressed by its `_key` rather than its position, because Sanity reorders
 * arrays and a position would then patch the wrong block. The returned strings
 * are ready to hand to `client.patch(id).set({ [path]: newRef })`.
 */
export function findAssetRefs(value: unknown, assetId: string, base = ''): string[] {
  const out: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key = (item as { _key?: unknown } | null)?._key;
      const segment = typeof key === 'string' && key ? `[_key=="${key}"]` : `[${index}]`;
      out.push(...findAssetRefs(item, assetId, `${base}${segment}`));
    });
    return out;
  }
  if (!value || typeof value !== 'object') return out;

  const object = value as Record<string, unknown>;
  const asset = object.asset as { _ref?: unknown } | undefined;
  if (asset && typeof asset === 'object' && asset._ref === assetId) {
    out.push(base ? `${base}.asset._ref` : 'asset._ref');
  }
  for (const [key, item] of Object.entries(object)) {
    if (META_KEYS.has(key) || !item || typeof item !== 'object') continue;
    out.push(...findAssetRefs(item, assetId, base ? `${base}.${key}` : key));
  }
  return out;
}

/**
 * The refusal for an asset too many documents share, or null when it is fine to
 * go ahead. One message, so the route and a test cannot drift apart.
 */
export function sharedAssetRefusal(documents: number): string | null {
  if (documents <= MAX_ASSET_DOCUMENTS) return null;
  return `This image is used in ${documents} places; change it in Studio`;
}

/**
 * A Sanity asset id as it appears in a page: `image-<hash>-<w>x<h>-<ext>` is
 * served as `<hash>-<w>x<h>.<ext>` inside the CDN address. The status light
 * looks for the served form, because the id form never occurs in the HTML.
 */
export function assetFileName(assetId: string): string | null {
  const match = /^image-([a-f0-9]+)-(\d+x\d+)-([a-z0-9]+)$/i.exec(assetId.trim());
  return match ? `${match[1]}-${match[2]}.${match[3]}` : null;
}

/**
 * The forms an address attribute can take on the page. Next.js writes
 * `href="/blog/"` as `href="/blog"` (trailingSlash is off), so a change that is
 * live can be absent from the HTML as typed. Both spellings count.
 */
export function markupVariants(wanted: string): string[] {
  const out = new Set([wanted]);
  const attr = /^(href|src)="([^"]*)"$/.exec(wanted);
  if (attr) {
    const [, name, value] = attr;
    if (value.length > 1 && value.endsWith('/')) out.add(`${name}="${value.slice(0, -1)}"`);
    else if ((value.startsWith('/') && value.length > 1) || /^https?:\/\/[^/]+$/.test(value)) out.add(`${name}="${value}/"`);
  }
  return [...out];
}
