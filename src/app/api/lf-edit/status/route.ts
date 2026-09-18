/**
 * "Is it live yet?" — the check behind the editor's status light.
 *
 * After a publish the editor asks this route whether the words it saved are
 * now on the public page. The route fetches the page the way a visitor does
 * (no cookies, no Draft Mode, through the CDN) and looks for each sentence in
 * the visible text. A CMS edit shows up once the page has revalidated; a
 * content-file edit shows up once the build has finished and deployed.
 *
 * The editor polls this every few seconds and stops at the first all-clear.
 *
 * Four questions, because a page can change in four ways:
 *   - `needles`: these words are on the page;
 *   - `absent`: those words are off it;
 *   - `markup`: this image address is in the HTML;
 *   - `links` / `linksAbsent`: this many anchors, under these words, point here
 *     now (`atLeast`), and no more than this many still point there (`atMost`).
 *
 * The last pair exists because an address on its own proves nothing. Changing
 * the nav's "Blog" link to `/case-studies` on a nav that already carries a
 * "Case studies" link turned the light green three seconds after the commit,
 * before the site had built. The anchor scan asks about the link that was
 * edited, not about the address.
 *
 * It asks in counts, not in yes or no, because the same words point at the same
 * page more than once: the footer's "Blog" link never moves, so "no Blog link
 * points at /blog any more" is false for ever and the light stayed amber for
 * the whole wait. The editor counts both pairs before it changes anything and
 * says what the sums should be; a request with no counts on it means one and
 * none, which is what an older editor asked for.
 */
import { currentEditor } from '@/lib/inline-edit/session';
import { assetFileName, markupVariants } from '@/lib/inline-edit/image-edit';
import {
  anchorsIn,
  enoughAnchors,
  fewEnoughAnchors,
  normalizeText,
  visibleText,
  type AnchorTarget,
} from '@/lib/inline-edit/link-edit';
import { editorOffResponse } from '@/lib/inline-edit/guard';

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  if (!(await currentEditor())) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | {
        path?: unknown;
        needles?: unknown;
        absent?: unknown;
        markup?: unknown;
        links?: unknown;
        linksAbsent?: unknown;
      }
    | null;
  const path = typeof body?.path === 'string' ? body.path : '';
  const strings = (value: unknown) =>
    Array.isArray(value) ? (value as unknown[]).filter((n): n is string => typeof n === 'string') : [];
  /** A count a browser sent: a whole number of anchors, or nothing at all. */
  const count = (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 500 ? value : undefined;
  /**
   * One link the editor changed: where it points now, the words it shows, and
   * how many anchors the page should end up with saying that.
   */
  const anchors = (value: unknown): AnchorTarget[] =>
    Array.isArray(value)
      ? (value as unknown[])
          .filter(
            (item): item is AnchorTarget =>
              !!item &&
              typeof item === 'object' &&
              typeof (item as AnchorTarget).href === 'string' &&
              typeof (item as AnchorTarget).text === 'string',
          )
          .map((item) => ({
            href: item.href,
            text: item.text,
            atLeast: count(item.atLeast),
            atMost: count(item.atMost),
          }))
      : [];
  const needles = strings(body?.needles);
  /**
   * Strings that must appear in the page's raw HTML rather than in its words.
   * A replaced image changes no sentence at all: what changes is an asset id or
   * a file path inside a `src`, which the visible-text check never sees.
   */
  const markup = strings(body?.markup);
  // Words that must be GONE before the change counts as live. Without this, an
  // undo of "About LoudFace" -> "About LoudFace today" looks live at once,
  // because the restored words are still inside the old ones. A short string
  // or one that is part of a needle is skipped: it could never disappear.
  const absent = strings(body?.absent);
  const links = anchors(body?.links);
  // The old destination, under the same label. A label with no words to match
  // would ask "is this address anywhere on the page", which is the question
  // that was wrong in the first place, so those are dropped.
  const linksAbsent = anchors(body?.linksAbsent).filter((link) => normalizeText(link.text).length > 0);
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    (!needles.length && !markup.length && !links.length) ||
    needles.length > 50 ||
    absent.length > 50 ||
    markup.length > 50 ||
    links.length > 50 ||
    linksAbsent.length > 50
  ) {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }

  // Production names its public address, and nothing else will do: an origin
  // built from the request's own Host header is whatever the caller sent, so
  // the check could be pointed at another site and answer about that one.
  // Development talks to itself over plain http, because the forwarded https
  // origin points at a plain port.
  const configured = process.env.LF_SITE_URL?.replace(/\/$/, '');
  if (!configured && process.env.NODE_ENV === 'production') {
    return Response.json(
      { error: 'This site has no public address configured, so the live check cannot run' },
      { status: 400 },
    );
  }
  const origin = configured ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`;
  let html: string;
  try {
    // A visitor's request: no cookies, so no Draft Mode, and whatever the CDN
    // is serving right now — which is exactly the question being asked.
    const response = await fetch(`${origin}${path}`, { cache: 'no-store', headers: { accept: 'text/html' } });
    if (!response.ok) {
      return Response.json({
        ok: false,
        status: response.status,
        found: needles.map(() => false),
        markup: markup.map(() => false),
        links: links.map(() => false),
      });
    }
    html = await response.text();
  } catch (error) {
    const detail = process.env.NODE_ENV === 'production' ? undefined : String(error);
    return Response.json({
      ok: false,
      status: 0,
      found: needles.map(() => false),
      markup: markup.map(() => false),
      links: links.map(() => false),
      origin,
      detail,
    });
  }

  const page = visibleText(html);
  const wantedAll = needles.map(normalizeText);
  const found = wantedAll.map((wanted) => wanted.length === 0 || page.includes(wanted));
  const gone = absent
    .map(normalizeText)
    .filter((old) => old.length >= 12 && !wantedAll.some((wanted) => wanted.includes(old)))
    .map((old) => !page.includes(old));
  // The raw HTML, not the visible text: an image's address is in an attribute,
  // and `/_next/image?url=…` percent-encodes it, so both forms are accepted.
  // A Sanity asset id never appears in a page as written; its served file
  // name does, so that form is what is looked for.
  const inMarkup = markup.map((wanted) => {
    const served = assetFileName(wanted) ?? wanted;
    return markupVariants(served).some((form) => html.includes(form) || html.includes(encodeURIComponent(form)));
  });
  // Every anchor on the page, read once: the address it points at and the words
  // it shows. A changed link is live when the page carries as many anchors
  // saying that as the editor said it should, and no more of the old ones than
  // it said would be left — a footer link nobody touched is counted, not
  // mistaken for the change.
  const onPage = anchorsIn(html);
  const linksLive = links.map((link) => enoughAnchors(onPage, link));
  const linksGone = linksAbsent.map((link) => fewEnoughAnchors(onPage, link));
  return Response.json({
    ok: true,
    status: 200,
    found,
    gone,
    markup: inMarkup,
    links: linksLive,
    linksGone,
    live:
      found.every(Boolean) &&
      gone.every(Boolean) &&
      inMarkup.every(Boolean) &&
      linksLive.every(Boolean) &&
      linksGone.every(Boolean),
  });
}
