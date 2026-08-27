/**
 * Careers data — open roles, read live from Notion.
 *
 * SOURCE OF TRUTH IS NOTION, NOT THIS REPO. The database is "Hiring Openings"
 * (a child of the Notion "Hiring" page). Arnel and the `hiring-ops` skill open
 * and close roles there; the website only reads. Do NOT mirror roles into
 * Sanity or into a JSON file here — two lists always drift, and the one on the
 * website is the one candidates see.
 *
 * Env vars required:
 *   - NOTION_API_KEY — the same integration key /api/careers-apply uses. The
 *     integration must ALSO be connected to the Hiring Openings database in
 *     Notion, or every read 404s. Connecting it to Candidates is not enough.
 *
 * Contract agreed with the session that owns the hiring pipeline (2026-08-27):
 *   - Display `Name` (the human job title, e.g. "Landing Page Designer").
 *   - `Role` is the MACHINE KEY that joins Openings to the Candidates database.
 *     Its five option names must stay identical across both databases or the
 *     screening agent's join silently breaks. Never display it as a job title.
 *   - Show a role publicly ONLY when `Opening status` is exactly "Open".
 *     "Paused" and "Closed" must never render — a paused row today is a
 *     suspected duplicate that nobody has adjudicated yet.
 *   - Link `Application form` VERBATIM. Those URLs carry ?role= params that
 *     auto-tag the applicant in Notion; rebuilding the URL by hand drops the
 *     tag and the application lands untagged.
 *   - `Priority` and `Hiring owner` are empty on every row. Do not render them.
 */

const NOTION_API_VERSION = '2022-06-28';
// Notion DB "Hiring Openings" — an identifier, not a secret.
const NOTION_OPENINGS_DB_ID = '2abb6339-4d10-80a3-8b88-d1f1cad2b02e';
const NOTION_API_KEY = process.env.NOTION_API_KEY ?? '';

/** Only this status is public. See the contract above. */
const PUBLIC_STATUS = 'Open';

/**
 * Display order. Notion's own sort is by last-edited time, which reshuffles the
 * page every time someone opens a role in the database — so the order is fixed
 * here instead. A role whose key is not listed sorts to the end rather than
 * disappearing, so adding a sixth Role option in Notion cannot drop it silently.
 */
const ROLE_ORDER = [
  'Designer',
  'Developer',
  'Project Manager',
  'Organic Search Strategist',
  'Copywriter',
] as const;

export interface OpenRole {
  /** Notion page id — used only as a React key. */
  id: string;
  /** The human job title, e.g. "Landing Page Designer". This is what we show. */
  title: string;
  /** Machine key joining to the Candidates database. Never shown to a visitor. */
  roleKey: string;
  /** One public line about the role. Empty until someone fills it in Notion. */
  summary: string;
  /** e.g. "Full-time". Empty until set. */
  commitment: string;
  /** e.g. "Remote". Empty until set. */
  location: string;
  /** The apply URL exactly as Notion holds it, ?role= param included. */
  applyUrl: string;
}

/* ── Notion response shapes (only the parts we read) ─────────────── */

interface NotionText {
  plain_text?: string;
}

interface NotionProperties {
  Name?: { title?: NotionText[] };
  Role?: { select?: { name?: string } | null };
  'Opening status'?: { status?: { name?: string } | null };
  'Public summary'?: { rich_text?: NotionText[] };
  Commitment?: { select?: { name?: string } | null };
  Location?: { rich_text?: NotionText[] };
  'Application form'?: { url?: string | null };
}

interface NotionPage {
  id?: string;
  properties?: NotionProperties;
}

function plain(parts?: NotionText[]): string {
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => p.plain_text ?? '')
    .join('')
    .trim();
}

/**
 * Accept only an absolute http(s) URL we actually control the shape of. A
 * malformed or relative value in Notion would otherwise render as a broken
 * apply button — worse than the role not appearing at all.
 */
function applyUrl(raw?: string | null): string {
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return raw;
  } catch {
    return '';
  }
}

function toOpenRole(page: NotionPage): OpenRole | null {
  const props = page.properties;
  if (!props || !page.id) return null;

  // Belt and braces: the query already filters on status, but a filter that
  // silently stops matching (a renamed option, an API change) would publish
  // paused roles. Check it again on the way out.
  if (props['Opening status']?.status?.name !== PUBLIC_STATUS) return null;

  const title = plain(props.Name?.title);
  const url = applyUrl(props['Application form']?.url);

  // A role with no title or no working apply link is not publishable. Dropping
  // it is correct: a listing nobody can apply to wastes the candidate's time.
  if (!title || !url) return null;

  return {
    id: page.id,
    title,
    roleKey: props.Role?.select?.name ?? '',
    summary: plain(props['Public summary']?.rich_text),
    commitment: props.Commitment?.select?.name ?? '',
    location: plain(props.Location?.rich_text),
    applyUrl: url,
  };
}

function byRoleOrder(a: OpenRole, b: OpenRole): number {
  const rank = (role: string) => {
    const i = ROLE_ORDER.indexOf(role as (typeof ROLE_ORDER)[number]);
    return i === -1 ? ROLE_ORDER.length : i;
  };
  const diff = rank(a.roleKey) - rank(b.roleKey);
  return diff !== 0 ? diff : a.title.localeCompare(b.title);
}

/**
 * The result of asking Notion for the open roles.
 *
 * "Notion said zero" and "Notion did not answer" are DIFFERENT ANSWERS and the
 * page must not conflate them. Returning [] on a failed fetch renders an
 * authoritative "No open roles right now." — which looks completely normal
 * while silently hiding real vacancies. That is the worst failure this page
 * has, because nothing about it looks broken.
 *
 * This is not hypothetical: on 2026-08-27 the hiring agents were rate-limited
 * twice in two hours querying this exact data source (HTTP 429,
 * collection_router_upstream_429, retry_after 30). Notion appears to rate-limit
 * per WORKSPACE, not per caller, so this page can be throttled by traffic that
 * has nothing to do with its own visitors.
 *
 * Do NOT "simplify" this back to Promise<OpenRole[]>.
 */
export type OpenRolesResult =
  | { status: 'ok'; roles: OpenRole[] }
  | { status: 'unavailable' };

/** Retryable: transient. Anything else is a config/schema mistake a retry repeats. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Every open role, ready to render.
 *
 * NEVER THROWS. The (site) tree renders dynamically (SanityLive lives in the
 * layout), so an uncaught throw here is a 500 on the whole page rather than a
 * stale-but-good render — ISR's serve-the-last-good-page behaviour does not
 * apply to a route that is server-rendered on demand. So instead of throwing,
 * this reports `unavailable` and lets the page say something true about not
 * being able to load the list.
 *
 * Retries once on 429/5xx, honouring Retry-After when Notion sends it.
 */
export async function fetchOpenRoles(): Promise<OpenRolesResult> {
  if (!NOTION_API_KEY) {
    console.error('[careers] NOTION_API_KEY not set — cannot list open roles.');
    return { status: 'unavailable' };
  }

  const attempts = 2;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${NOTION_OPENINGS_DB_ID}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': NOTION_API_VERSION,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: {
              property: 'Opening status',
              status: { equals: PUBLIC_STATUS },
            },
            page_size: 50,
          }),
          // Roles change a few times a month, not a few times an hour. An hour
          // of staleness is fine; hammering a workspace-rate-limited API on
          // every request is not.
          next: { revalidate: 3600 },
        },
      );

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error(
          '[careers] Notion query failed (attempt %d): %d %s %s',
          attempt,
          response.status,
          response.statusText,
          body.slice(0, 400),
        );

        if (isRetryableStatus(response.status) && attempt < attempts) {
          // Notion sends Retry-After in seconds on a 429. Cap it: the page is
          // rendering a request, and nobody waits 30s for a careers page.
          const retryAfter = Number(response.headers.get('retry-after'));
          const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 2000)
            : 400 * attempt;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        return { status: 'unavailable' };
      }

      const data = (await response.json()) as { results?: NotionPage[] };
      const results = Array.isArray(data.results) ? data.results : [];

      return {
        status: 'ok',
        roles: results
          .map(toOpenRole)
          .filter((role): role is OpenRole => role !== null)
          .sort(byRoleOrder),
      };
    } catch (error) {
      console.error('[careers] Notion query threw (attempt %d):', attempt, error);
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
        continue;
      }
      return { status: 'unavailable' };
    }
  }

  return { status: 'unavailable' };
}
