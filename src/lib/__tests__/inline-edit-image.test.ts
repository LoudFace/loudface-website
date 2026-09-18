import { assetFileName, markupVariants } from '../inline-edit/image-edit';
/**
 * Tests for src/lib/inline-edit/image-edit.ts.
 *
 * Run with: npx tsx --test src/lib/__tests__/inline-edit-image.test.ts
 *
 * Everything here is a rule that decides whether a client can replace a picture,
 * or what happens to the file they hand over. Four of them have a cost attached:
 *
 *   - the address rules, because `next/image` rewrote every image address on the
 *     site and the old selector stopped matching anything at all;
 *   - the byte sniffing, because a name and a Content-Type are both whatever the
 *     sender typed, and an SVG called photo.png is markup we would serve back;
 *   - the path naming, because a file name with a space, a slash or a `..` in it
 *     becomes part of a commit path;
 *   - the shared-asset limit, because one logo can sit on every page, and
 *     replacing it from one of them would change all of them at once.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ASSET_DOCUMENTS,
  MAX_IMAGE_BYTES,
  TOO_BIG_MESSAGE,
  contentIdFromImageSrc,
  existingUploadPath,
  findAssetRefs,
  isSvgSource,
  parseImageEditId,
  publicPathFor,
  realImageSource,
  sanityAssetIdFromUrl,
  sharedAssetRefusal,
  slugForUpload,
  sniffImageType,
  uploadPathFor,
} from '../inline-edit/image-edit';

/** A `/_next/image` address, built the way Next builds one. */
const optimized = (url: string, extra = '&w=640&q=82') =>
  `/_next/image?url=${encodeURIComponent(url)}${extra}`;

const bytesOf = (...parts: (number[] | string)[]): Uint8Array =>
  Uint8Array.from(parts.flatMap((part) => (typeof part === 'string' ? [...part].map((c) => c.charCodeAt(0)) : part)));

describe('the address a picture really has', () => {
  it('reads through a next/image rewrite', () => {
    assert.equal(realImageSource(optimized('/images/team.webp')), '/images/team.webp');
    assert.equal(realImageSource('/images/team.webp'), '/images/team.webp');
    assert.equal(realImageSource(''), '');
  });

  it('leaves an address that is not an optimiser address alone', () => {
    const url = 'https://cdn.sanity.io/images/p/production/abc-100x100.jpg?w=200';
    assert.equal(realImageSource(url), url);
  });
});

describe('the Sanity asset id behind a CDN address', () => {
  const asset = 'image-a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-3024x1890-jpg';
  const raw =
    'https://cdn.sanity.io/images/o65g7xfo/production/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-3024x1890.jpg';

  it('rebuilds it from a raw CDN address', () => {
    assert.equal(sanityAssetIdFromUrl(raw), asset);
  });

  it('rebuilds it from a CDN address carrying transform parameters', () => {
    assert.equal(sanityAssetIdFromUrl(`${raw}?w=800&h=500&fit=crop&fm=webp&q=82`), asset);
  });

  it('rebuilds it from a /_next/image address', () => {
    assert.equal(sanityAssetIdFromUrl(optimized(raw)), asset);
    assert.equal(sanityAssetIdFromUrl(optimized(`${raw}?w=640&h=640&fit=crop&fm=webp&q=82`)), asset);
  });

  it('rebuilds it from a /_next/image address whose only extra is ?w=', () => {
    assert.equal(sanityAssetIdFromUrl(`/_next/image?url=${encodeURIComponent(raw)}&w=1200`), asset);
  });

  it('lower-cases the extension, because an asset id is always lower case', () => {
    const upper = raw.replace(/\.jpg$/, '.JPG');
    assert.equal(sanityAssetIdFromUrl(upper), asset);
  });

  it('says no to anything that is not a Sanity image', () => {
    assert.equal(sanityAssetIdFromUrl('/images/team.webp'), null);
    assert.equal(sanityAssetIdFromUrl('https://example.com/images/a-100x100.jpg'), null);
    assert.equal(sanityAssetIdFromUrl(''), null);
  });
});

describe('the content id tagged onto a content image', () => {
  it('reads a plain ?lf= address', () => {
    assert.equal(contentIdFromImageSrc('/images/hero.webp?lf=home:hero.image'), 'home:hero.image');
  });

  it('reads it through a next/image rewrite, where the = is %3D', () => {
    const src = optimized('/images/hero.webp?lf=home:hero.image');
    assert.ok(src.includes('lf%3D'), 'the rewrite should have encoded the marker');
    assert.equal(contentIdFromImageSrc(src), 'home:hero.image');
  });

  it('reads it from a once-encoded address that was never decoded', () => {
    assert.equal(
      contentIdFromImageSrc('/images/hero.webp%3Flf%3Dabout-v3%3Astory.portrait'),
      'about-v3:story.portrait',
    );
  });

  it('reads it when other query parameters follow', () => {
    assert.equal(
      contentIdFromImageSrc('/images/hero.webp?w=640&lf=home:hero.image&q=82'),
      'home:hero.image',
    );
  });

  it('says no when there is no marker, or the marker is not a content id', () => {
    assert.equal(contentIdFromImageSrc('/images/hero.webp'), null);
    assert.equal(contentIdFromImageSrc('/images/hero.webp?lf=../../etc/passwd'), null);
    assert.equal(contentIdFromImageSrc('/images/hero.webp?lf='), null);
  });
});

describe('which ids the image route accepts', () => {
  it('takes a Sanity asset id and one of our content ids', () => {
    assert.deepEqual(parseImageEditId('sanity-image:image-abc123-100x100-png'), {
      kind: 'sanity',
      assetId: 'image-abc123-100x100-png',
    });
    assert.deepEqual(parseImageEditId('home:hero.image'), { kind: 'content', id: 'home:hero.image' });
  });

  it('refuses anything else', () => {
    assert.equal(parseImageEditId('sanity-image:not-an-asset'), null);
    assert.equal(parseImageEditId('sanity:doc:field'), null);
    assert.equal(parseImageEditId('../../secrets'), null);
    assert.equal(parseImageEditId(''), null);
  });
});

describe('an SVG is never replaceable', () => {
  it('spots one through every address form', () => {
    assert.equal(isSvgSource('/images/logo.svg'), true);
    assert.equal(isSvgSource('/images/logo.svg?lf=home:logo'), true);
    assert.equal(isSvgSource(optimized('/images/logo.svg')), true);
    assert.equal(isSvgSource('/images/logo.webp'), false);
  });
});

describe('what is really in the file', () => {
  it('accepts a PNG', () => {
    const kind = sniffImageType(bytesOf([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], [0, 0, 0, 13]));
    assert.deepEqual(kind, { ext: 'png', contentType: 'image/png' });
  });

  it('accepts a JPEG', () => {
    assert.deepEqual(sniffImageType(bytesOf([0xff, 0xd8, 0xff, 0xe0], 'JFIF')), {
      ext: 'jpg',
      contentType: 'image/jpeg',
    });
  });

  it('accepts a GIF, both versions', () => {
    for (const header of ['GIF87a', 'GIF89a']) {
      assert.deepEqual(sniffImageType(bytesOf(header, [0, 0])), {
        ext: 'gif',
        contentType: 'image/gif',
      });
    }
  });

  it('accepts a WebP, which is a RIFF container', () => {
    assert.deepEqual(sniffImageType(bytesOf('RIFF', [0x24, 0x00, 0x00, 0x00], 'WEBP', 'VP8 ')), {
      ext: 'webp',
      contentType: 'image/webp',
    });
  });

  it('refuses an SVG renamed .png', () => {
    assert.equal(sniffImageType(bytesOf('<svg xmlns="http://www.w3.org/2000/svg"><script/>')), null);
    assert.equal(sniffImageType(bytesOf('<?xml version="1.0"?><svg>')), null);
  });

  it('refuses HTML renamed .png', () => {
    assert.equal(sniffImageType(bytesOf('<!DOCTYPE html><html><body>')), null);
  });

  it('refuses a PDF renamed .png', () => {
    assert.equal(sniffImageType(bytesOf('%PDF-1.7')), null);
  });

  it('refuses a RIFF container that is not WebP, and an empty file', () => {
    assert.equal(sniffImageType(bytesOf('RIFF', [0x24, 0, 0, 0], 'WAVE')), null);
    assert.equal(sniffImageType(new Uint8Array()), null);
  });
});

describe('where an uploaded file lands', () => {
  const sha1 = 'ab12cd34ef567890ab12cd34ef567890ab12cd34';
  const day = new Date(Date.UTC(2026, 8, 18));

  it('is the same path for the same file, every time', () => {
    const first = uploadPathFor('Team Photo.JPG', sha1, 'jpg', day);
    const second = uploadPathFor('Team Photo.JPG', sha1, 'jpg', day);
    assert.equal(first, second);
    assert.equal(first, 'public/images/uploads/2026-09/team-photo-ab12cd34.jpg');
  });

  it('has no spaces, no upper case and nothing that climbs out of the folder', () => {
    const nasty = uploadPathFor('../../etc/Passwd Copy (1).png', sha1, 'png', day);
    assert.equal(nasty, 'public/images/uploads/2026-09/etc-passwd-copy-1-ab12cd34.png');
    assert.ok(!nasty.includes('..'), 'a path must never climb out of the uploads folder');
    assert.ok(!/\s/.test(nasty), 'a path must have no whitespace');
    assert.equal(nasty, nasty.toLowerCase());
    assert.ok(nasty.startsWith('public/images/uploads/'));
  });

  it('still produces a name when there is nothing usable in the original', () => {
    assert.equal(slugForUpload('   '), 'image');
    assert.equal(slugForUpload('...png'), 'image');
    assert.equal(uploadPathFor('画像.png', sha1, 'png', day), 'public/images/uploads/2026-09/image-ab12cd34.png');
  });

  it('turns a repository path into the address a page uses', () => {
    assert.equal(
      publicPathFor('public/images/uploads/2026-09/team-photo-ab12cd34.jpg'),
      '/images/uploads/2026-09/team-photo-ab12cd34.jpg',
    );
  });
});

describe('finding a picture inside a Sanity document', () => {
  const assetId = 'image-abc123-800x600-jpg';
  const other = 'image-zzz999-100x100-png';
  const ref = (id: string) => ({ _type: 'image', asset: { _type: 'reference', _ref: id } });

  it('finds one at the top level', () => {
    const doc = { _id: 'person-1', _type: 'teamMember', profilePicture: ref(assetId) };
    assert.deepEqual(findAssetRefs(doc, assetId), ['profilePicture.asset._ref']);
  });

  it('finds one nested inside an object', () => {
    const doc = { _id: 'page-1', _type: 'seoPage', hero: { heroImage: ref(assetId) } };
    assert.deepEqual(findAssetRefs(doc, assetId), ['hero.heroImage.asset._ref']);
  });

  it('finds one inside an array, addressed by its _key', () => {
    const doc = {
      _id: 'case-1',
      _type: 'caseStudy',
      sections: [
        { _key: 'aaa', _type: 'block', art: ref(other) },
        { _key: 'bbb', _type: 'block', art: ref(assetId) },
      ],
    };
    assert.deepEqual(findAssetRefs(doc, assetId), ['sections[_key=="bbb"].art.asset._ref']);
  });

  it('falls back to the position when an array item carries no _key', () => {
    const doc = { _id: 'x', _type: 'y', gallery: [ref(other), ref(assetId)] };
    assert.deepEqual(findAssetRefs(doc, assetId), ['gallery[1].asset._ref']);
  });

  it('finds every place at once, however deep', () => {
    const doc = {
      _id: 'client-1',
      _type: 'client',
      coloredLogo: ref(assetId),
      lightLogo: ref(other),
      darkLogo: ref(assetId),
      blocks: [{ _key: 'k1', inner: { logo: ref(assetId) } }],
    };
    assert.deepEqual(findAssetRefs(doc, assetId).sort(), [
      'blocks[_key=="k1"].inner.logo.asset._ref',
      'coloredLogo.asset._ref',
      'darkLogo.asset._ref',
    ]);
  });

  it('finds nothing when the document uses a different picture', () => {
    assert.deepEqual(findAssetRefs({ _id: 'a', _type: 'b', thumbnail: ref(other) }, assetId), []);
    assert.deepEqual(findAssetRefs(null, assetId), []);
  });
});

describe('a picture too many pages share', () => {
  it('goes ahead up to the limit', () => {
    for (let count = 1; count <= MAX_ASSET_DOCUMENTS; count++) {
      assert.equal(sharedAssetRefusal(count), null, `${count} documents should be allowed`);
    }
  });

  it('refuses above it, and says where to do it instead', () => {
    assert.equal(
      sharedAssetRefusal(MAX_ASSET_DOCUMENTS + 1),
      'This image is used in 4 places; change it in Studio',
    );
    assert.equal(sharedAssetRefusal(17), 'This image is used in 17 places; change it in Studio');
  });
});

describe('assetFileName', () => {
  it('turns an asset id into the file name the page serves', () => {
    assert.equal(assetFileName('image-6dc35a9a32be283462bcb3c6d9a0cca5c1063f1f-512x512-png'), '6dc35a9a32be283462bcb3c6d9a0cca5c1063f1f-512x512.png');
  });
  it('leaves anything else alone', () => {
    assert.equal(assetFileName('/images/uploads/2026-09/photo-abcdef12.png'), null);
    assert.equal(assetFileName('image-not-an-id'), null);
  });
});

describe('markupVariants', () => {
  it('accepts an address with or without its trailing slash', () => {
    assert.deepEqual(markupVariants('href="/blog/"'), ['href="/blog/"', 'href="/blog"']);
    assert.deepEqual(markupVariants('href="/blog"'), ['href="/blog"', 'href="/blog/"']);
  });
  it('leaves the root and non-attribute strings alone', () => {
    assert.deepEqual(markupVariants('href="/"'), ['href="/"']);
    assert.deepEqual(markupVariants('6dc35a9a-512x512.png'), ['6dc35a9a-512x512.png']);
  });
});

/**
 * The cap, and the sentence that goes with it.
 *
 * Vercel refuses a request body over 4.5 MB before any of our code runs, and
 * form-data encoding adds to the file's own size, so a 4 MB cap could be
 * refused by the platform with a message nobody here wrote.
 */
describe('the size cap', () => {
  it('sits under the platform ceiling', () => {
    assert.equal(MAX_IMAGE_BYTES, 3 * 1024 * 1024);
    assert.ok(MAX_IMAGE_BYTES < 4.5 * 1024 * 1024);
  });

  it('says the same number the panel says', () => {
    assert.match(TOO_BIG_MESSAGE, /over 3 MB/);
  });
});

/**
 * The same picture, uploaded again.
 *
 * The name carries eight characters of the file's own sha1, but under the month
 * it was uploaded in — so re-uploading a picture in October wrote a second copy
 * of the same bytes. A git history keeps every copy for ever.
 */
describe('existingUploadPath', () => {
  const HASH = 'ab12cd34ef567890';
  const paths = [
    'public/images/uploads/2026-08/team-photo-ab12cd34.jpg',
    'public/images/uploads/2026-09/office-99887766.png',
  ];

  it('finds the file already holding these bytes, whatever month it is in', () => {
    assert.equal(existingUploadPath(paths, HASH, 'jpg'), 'public/images/uploads/2026-08/team-photo-ab12cd34.jpg');
  });

  it('answers null for a picture nobody has uploaded', () => {
    assert.equal(existingUploadPath(paths, 'ffffffffffff', 'jpg'), null);
  });

  it('does not confuse two formats of the same bytes', () => {
    assert.equal(existingUploadPath(paths, HASH, 'png'), null);
  });

  it('reads an upper-case hash the same way the path writes it', () => {
    assert.equal(existingUploadPath(paths, 'AB12CD34EF567890', 'jpg'), paths[0]);
  });

  it('never reaches outside the uploads folder', () => {
    // A file somewhere else in the repository is code or design, not an upload,
    // and pointing a page at it would be a path this editor never wrote.
    assert.equal(existingUploadPath(['public/images/team-ab12cd34.jpg'], HASH, 'jpg'), null);
  });

  it('answers null for an empty repository', () => {
    assert.equal(existingUploadPath([], HASH, 'jpg'), null);
  });
});
