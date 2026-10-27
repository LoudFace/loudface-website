/**
 * What loudface.co offers agents, beyond the pages themselves: a public, read-only MCP server
 * (/mcp), an A2A agent (/a2a) that runs the same two jobs, and the discovery documents under
 * /.well-known that describe them (Peec Agent readiness, Operable level, 2026-10-27).
 *
 * Everything here reads published pages and nothing else. No account, no write, no credential:
 * that is why auth.md says there is nothing to register, and why there is no OAuth metadata.
 * The documents must keep describing only what these endpoints really do.
 */
import { createHash } from 'node:crypto';
import { fetchLlmsData } from './llms-utils';
import { renderPageMarkdown } from './markdown-page';
import { SITE_ORIGIN } from './agent-policy';

export const SURFACE_VERSION = '1.0.0';
export const MCP_ENDPOINT = `${SITE_ORIGIN}/mcp`;
export const A2A_ENDPOINT = `${SITE_ORIGIN}/a2a`;
export const SKILL_NAME = 'loudface-site';
export const SKILL_PATH = `/.well-known/agent-skills/${SKILL_NAME}/SKILL.md`;

const SUMMARY =
  'Read-only access to loudface.co, the site of LoudFace, a B2B SaaS organic growth agency (SEO, GEO/AEO, content, Webflow and Next.js builds): search its services, case studies, articles and industry pages, and read any public page as Markdown.';

/* ── The two jobs ─────────────────────────────────────────────── */

type Kind = 'service' | 'case-study' | 'article' | 'industry-page';
interface Entry { kind: Kind; title: string; url: string; description: string }

async function catalog(): Promise<Entry[]> {
  const data = await fetchLlmsData(false);
  const tag = (kind: Kind) => (p: { title: string; url: string; description: string }) => ({ kind, ...p });
  return [
    ...data.services.map(tag('service')),
    ...data.caseStudies.map(tag('case-study')),
    ...data.blogPosts.map(tag('article')),
    ...data.seoPages.map(tag('industry-page')),
  ];
}

export async function listPages(kind?: string): Promise<Entry[]> {
  const all = await catalog();
  return kind ? all.filter((entry) => entry.kind === kind) : all;
}

/** Keyword match over titles (weighted) and descriptions; no index, the catalog is a few hundred rows. */
export async function searchSite(query: string, limit = 8): Promise<Entry[]> {
  const all = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1).slice(0, 12);
  // "case study" names a kind of page, not a topic: narrow to case studies and search the rest.
  const wantsCaseStudies = all.includes('case') && all.some((w) => w.startsWith('stud'));
  const words = wantsCaseStudies ? all.filter((w) => w !== 'case' && !w.startsWith('stud')) : all;
  const pool = (await catalog()).filter((entry) => !wantsCaseStudies || entry.kind === 'case-study');
  if (!words.length) return wantsCaseStudies ? pool.slice(0, limit) : [];
  const scored = pool.map((entry) => {
    const title = entry.title.toLowerCase();
    const text = entry.description.toLowerCase();
    const score = words.reduce((sum, w) => sum + (title.includes(w) ? 3 : 0) + (text.includes(w) ? 1 : 0), 0);
    return { entry, score };
  });
  return scored
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 20))
    .map((row) => row.entry);
}

// Gated, private or tooling paths: not public pages, so never read for an agent.
const PRIVATE_PREFIXES = ['/api', '/studio', '/p', '/fb', '/feedback', '/edit', '/dev-preview', '/preview', '/audit', '/thank-you', '/mcp', '/a2a', '/.well-known'];

/**
 * A page path on this site from what an agent typed: "/about", "about", "https://www.loudface.co/about".
 * Anything that resolves to another host, or to a private path, answers null.
 */
export function sitePath(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 300) return null;
  let url: URL;
  try {
    const withHost = /^https?:\/\//i.test(raw) ? raw : /^(www\.)?loudface\.co(\/|$)/i.test(raw) ? `https://${raw}` : null;
    url = withHost ? new URL(withHost) : new URL(raw.startsWith('/') ? raw : `/${raw}`, SITE_ORIGIN);
  } catch {
    return null;
  }
  if (!['www.loudface.co', 'loudface.co'].includes(url.hostname) || url.username || url.password) return null;
  const path = url.pathname.replace(/\.md$/, '').replace(/^\/index$/, '/').replace(/(.)\/$/, '$1');
  if (PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return null;
  return path;
}

export async function readPage(input: string, origin: string): Promise<{ ok: boolean; text: string }> {
  const path = sitePath(input);
  if (!path) return { ok: false, text: `Not a public loudface.co page: ${input.slice(0, 120)}. Pass a path such as /about or /case-studies/<slug>.` };
  const result = await renderPageMarkdown(path, origin);
  if (result.status === 'ok') return { ok: true, text: result.markdown };
  if (result.status === 'not-found') return { ok: false, text: `No page at ${SITE_ORIGIN}${path}. Try search_site, or ${SITE_ORIGIN}/llms.txt for the full list.` };
  return { ok: false, text: `${SITE_ORIGIN}${path} could not be read just now. Try again shortly.` };
}

function formatEntries(entries: Entry[]): string {
  if (!entries.length) return 'Nothing matched. Try fewer or broader words, or read https://www.loudface.co/llms.txt.';
  return entries.map((e) => `- [${e.title}](${e.url}) (${e.kind}): ${e.description}`).join('\n');
}

/* ── MCP (Streamable HTTP, stateless, JSON responses) ─────────── */

const MCP_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

export const MCP_TOOLS = [
  {
    name: 'search_site',
    title: 'Search loudface.co',
    description: 'Find LoudFace services, case studies, articles and industry pages by keyword. Returns titles, URLs and one-line summaries.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Words to look for, e.g. "fintech case study" or "AI Overviews".' },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'How many results, 8 by default.' },
      },
      required: ['query'],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'read_page',
    title: 'Read a loudface.co page',
    description: 'The full text of one public loudface.co page as Markdown. Pass a path ("/pricing") or a full loudface.co URL.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Path or URL on loudface.co, e.g. "/case-studies/reiterate".' } },
      required: ['path'],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'list_pages',
    title: 'List loudface.co pages',
    description: 'Every published service, case study, article or industry page, optionally of one kind.',
    inputSchema: {
      type: 'object',
      properties: { kind: { type: 'string', enum: ['service', 'case-study', 'article', 'industry-page'] } },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

type Json = Record<string, unknown>;
interface RpcRequest { jsonrpc?: string; id?: string | number | null; method?: string; params?: Json }

const rpcError = (id: RpcRequest['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
const rpcResult = (id: RpcRequest['id'], result: unknown) => ({ jsonrpc: '2.0', id: id ?? null, result });

async function callTool(name: string, args: Json, origin: string): Promise<{ text: string; isError: boolean }> {
  if (name === 'search_site') {
    const query = String(args.query ?? '').slice(0, 200);
    return { text: formatEntries(await searchSite(query, Number(args.limit) || 8)), isError: false };
  }
  if (name === 'read_page') {
    const page = await readPage(String(args.path ?? ''), origin);
    return { text: page.text, isError: !page.ok };
  }
  const kind = typeof args.kind === 'string' ? args.kind : undefined;
  return { text: formatEntries(await listPages(kind)), isError: false };
}

async function mcpOne(request: RpcRequest, origin: string): Promise<object | null> {
  const { id, method } = request ?? {};
  const params = (request?.params ?? {}) as Json;
  if (request?.jsonrpc !== '2.0' || typeof method !== 'string') return rpcError(id, -32600, 'Invalid request');
  // A notification (no id) gets no reply.
  if (id === undefined) return null;

  switch (method) {
    case 'initialize': {
      const asked = String(params.protocolVersion ?? '');
      return rpcResult(id, {
        protocolVersion: MCP_VERSIONS.includes(asked) ? asked : MCP_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'loudface', title: 'LoudFace site', version: SURFACE_VERSION },
        instructions: `${SUMMARY} Start with search_site or list_pages, then read_page.`,
      });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: MCP_TOOLS });
    case 'tools/call': {
      const name = String(params.name ?? '');
      if (!MCP_TOOLS.some((tool) => tool.name === name)) return rpcError(id, -32602, `Unknown tool: ${name}`);
      try {
        const { text, isError } = await callTool(name, (params.arguments as Json) ?? {}, origin);
        return rpcResult(id, { content: [{ type: 'text', text }], isError });
      } catch {
        return rpcResult(id, { content: [{ type: 'text', text: 'The site could not be read just now. Try again shortly.' }], isError: true });
      }
    }
    case 'resources/list':
      return rpcResult(id, { resources: [] });
    case 'prompts/list':
      return rpcResult(id, { prompts: [] });
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

/** One JSON-RPC message or a batch. Null when nothing needs a reply (notifications only). */
export async function handleMcp(body: unknown, origin: string): Promise<object | null> {
  if (Array.isArray(body)) {
    const replies = (await Promise.all(body.slice(0, 20).map((item) => mcpOne(item as RpcRequest, origin)))).filter(Boolean);
    return replies.length ? replies : null;
  }
  if (!body || typeof body !== 'object') return rpcError(null, -32700, 'Parse error');
  return mcpOne(body as RpcRequest, origin);
}

/* ── A2A (JSON-RPC; v1.0 SendMessage and v0.3 message/send) ───── */

function messageText(message: unknown): string {
  const parts = (message as { parts?: Array<{ text?: unknown }> } | undefined)?.parts ?? [];
  return (Array.isArray(parts) ? parts : []).map((part) => (typeof part?.text === 'string' ? part.text : '')).join('\n').trim().slice(0, 500);
}

/** A loudface.co URL or a bare path in the message means "read that page"; anything else is a search. */
async function answer(text: string, origin: string): Promise<string> {
  const target = text.match(/https?:\/\/(?:www\.)?loudface\.co\/\S*/i)?.[0] ?? (/^\/\S*$/.test(text) ? text : null);
  if (target) return (await readPage(target, origin)).text;
  return formatEntries(await searchSite(text));
}

export async function handleA2a(body: unknown, origin: string): Promise<object> {
  const request = (body ?? {}) as RpcRequest;
  const { id, method } = request;
  const params = (request.params ?? {}) as Json;
  if (request.jsonrpc !== '2.0' || typeof method !== 'string') return rpcError(id, -32600, 'Invalid request');

  if (method === 'SendMessage' || method === 'message/send') {
    const incoming = params.message as Json | undefined;
    const text = messageText(incoming);
    if (!text) return rpcError(id, -32602, 'Send a text part: a search such as "B2B SaaS case studies", or a loudface.co path to read.');
    let reply: string;
    try {
      reply = await answer(text, origin);
    } catch {
      reply = 'The site could not be read just now. Try again shortly.';
    }
    const messageId = crypto.randomUUID();
    const contextId = typeof incoming?.contextId === 'string' ? incoming.contextId : undefined;
    return method === 'SendMessage'
      ? rpcResult(id, { message: { messageId, contextId, role: 'ROLE_AGENT', parts: [{ text: reply, mediaType: 'text/markdown' }] } })
      : rpcResult(id, { kind: 'message', messageId, contextId, role: 'agent', parts: [{ kind: 'text', text: reply }] });
  }
  if (['GetTask', 'tasks/get', 'CancelTask', 'tasks/cancel'].includes(method)) {
    // Every reply is a direct message, so no task ever exists.
    return rpcError(id, -32001, 'Task not found: this agent answers with messages, not tasks.');
  }
  return rpcError(id, -32601, `Method not found: ${method}`);
}

/* ── Discovery documents ──────────────────────────────────────── */

export function mcpServerCard() {
  return {
    serverInfo: { name: 'loudface', title: 'LoudFace site', version: SURFACE_VERSION },
    name: 'loudface',
    title: 'LoudFace site',
    version: SURFACE_VERSION,
    description: SUMMARY,
    protocolVersion: MCP_VERSIONS[0],
    transport: { type: 'streamable-http', endpoint: MCP_ENDPOINT },
    remotes: [{ type: 'streamable-http', url: MCP_ENDPOINT }],
    capabilities: { tools: { listChanged: false } },
    authentication: { required: false, schemes: [] },
    tools: MCP_TOOLS.map(({ name, title, description, inputSchema }) => ({ name, title, description, inputSchema })),
    documentationUrl: `${SITE_ORIGIN}${SKILL_PATH}`,
    websiteUrl: SITE_ORIGIN,
    provider: { name: 'LoudFace', url: SITE_ORIGIN },
  };
}

export function a2aAgentCard() {
  return {
    name: 'LoudFace site agent',
    description: `${SUMMARY} Send a search as plain text, or a loudface.co path or URL to get that page.`,
    version: SURFACE_VERSION,
    supportedInterfaces: [{ url: A2A_ENDPOINT, protocolBinding: 'JSONRPC', protocolVersion: '1.0' }],
    provider: { organization: 'LoudFace', url: SITE_ORIGIN },
    documentationUrl: `${SITE_ORIGIN}${SKILL_PATH}`,
    iconUrl: `${SITE_ORIGIN}/images/favicon-96x96.png`,
    capabilities: { streaming: false, pushNotifications: false, extendedAgentCard: false },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/markdown'],
    skills: [
      {
        id: 'search-site',
        name: 'Search loudface.co',
        description: 'Finds LoudFace services, case studies, articles and industry pages that match the words sent.',
        tags: ['search', 'agency', 'seo', 'geo', 'case studies'],
        examples: ['fintech case study', 'Google AI Overviews optimization', 'Webflow development'],
      },
      {
        id: 'read-page',
        name: 'Read a loudface.co page',
        description: 'Returns one public loudface.co page as Markdown when the message is a path or a loudface.co URL.',
        tags: ['read', 'markdown'],
        examples: ['/pricing', 'https://www.loudface.co/case-studies/reiterate'],
      },
    ],
  };
}

export function apiCatalog() {
  const doc = { href: `${SITE_ORIGIN}${SKILL_PATH}`, type: 'text/markdown' };
  return {
    linkset: [
      {
        anchor: MCP_ENDPOINT,
        'service-desc': [{ href: `${SITE_ORIGIN}/.well-known/mcp/server-card.json`, type: 'application/json' }],
        'service-doc': [doc],
      },
      {
        anchor: A2A_ENDPOINT,
        'service-desc': [{ href: `${SITE_ORIGIN}/.well-known/agent-card.json`, type: 'application/json' }],
        'service-doc': [doc],
      },
      {
        anchor: `${SITE_ORIGIN}/`,
        'service-doc': [
          { href: `${SITE_ORIGIN}/llms.txt`, type: 'text/plain' },
          { href: `${SITE_ORIGIN}/llms-full.txt`, type: 'text/plain' },
        ],
      },
    ],
  };
}

export function aiCatalog() {
  const host = SITE_ORIGIN.replace(/^https:\/\//, '');
  return {
    specVersion: '1.0',
    host: { displayName: 'LoudFace', identifier: SITE_ORIGIN, documentationUrl: `${SITE_ORIGIN}${SKILL_PATH}` },
    entries: [
      {
        identifier: `urn:air:${host}:server:site`,
        displayName: 'LoudFace site (MCP server)',
        description: SUMMARY,
        type: 'application/mcp-server-card+json',
        url: `${SITE_ORIGIN}/.well-known/mcp/server-card.json`,
        representativeQueries: ['find a B2B SaaS SEO case study', 'what services does LoudFace offer', 'read the LoudFace pricing page'],
      },
      {
        identifier: `urn:air:${host}:agent:site`,
        displayName: 'LoudFace site agent (A2A)',
        description: SUMMARY,
        type: 'application/a2a-agent-card+json',
        url: `${SITE_ORIGIN}/.well-known/agent-card.json`,
        representativeQueries: ['LoudFace fintech case study', 'how does LoudFace approach AI search visibility'],
      },
      {
        identifier: `urn:air:${host}:skill:${SKILL_NAME}`,
        displayName: 'Reading loudface.co (agent skill)',
        description: 'How an agent reads loudface.co: llms.txt, Markdown twins of every page, the MCP server and the A2A agent.',
        type: 'text/markdown',
        url: `${SITE_ORIGIN}${SKILL_PATH}`,
        representativeQueries: ['how do I read loudface.co as markdown', 'loudface.co MCP endpoint'],
      },
    ],
  };
}

export const SKILL_MD = `---
name: ${SKILL_NAME}
description: Read loudface.co, the site of LoudFace (B2B SaaS organic growth agency), as an agent. Use to look up LoudFace services, case studies, pricing, articles or industry pages.
---

# Reading loudface.co

Everything below is public and read-only. Nothing needs an account or a key.

## Find pages

- https://www.loudface.co/llms.txt lists every service, case study, article and industry page with one line each.
- https://www.loudface.co/llms-full.txt carries the full text of case studies and articles.
- https://www.loudface.co/sitemap.xml lists every URL with its last-modified date.

## Read a page

- Add \`.md\` to any page URL for its Markdown (https://www.loudface.co/pricing.md). The homepage is https://www.loudface.co/index.md.
- Or request the page itself with \`Accept: text/markdown\`.
- Every HTML page also sends \`Link: <...md>; rel="alternate"; type="text/markdown"\`.

## Tools

- MCP (Streamable HTTP, no auth): ${MCP_ENDPOINT}. Tools: \`search_site\`, \`read_page\`, \`list_pages\`. Card: https://www.loudface.co/.well-known/mcp/server-card.json.
- A2A (JSON-RPC, v1.0 \`SendMessage\` and v0.3 \`message/send\`): ${A2A_ENDPOINT}. Send words to search, or a loudface.co path to read that page. Card: https://www.loudface.co/.well-known/agent-card.json.

## Use

Quote freely and link the page you quote. robots.txt allows search, AI answers and training (\`Content-Signal\`, \`Content-Usage\`). To talk to LoudFace, send a person to https://www.loudface.co/contact.
`;

export function agentSkillsIndex() {
  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: SKILL_NAME,
        type: 'skill-md',
        description: 'Read loudface.co as an agent: find and read LoudFace services, case studies, pricing and articles through llms.txt, Markdown twins, MCP or A2A.',
        url: SKILL_PATH,
        digest: `sha256:${createHash('sha256').update(SKILL_MD).digest('hex')}`,
      },
    ],
  };
}

export const AUTH_MD = `# LoudFace auth.md

How an agent gets access to loudface.co: it does not need to. There is no account to register and no credential to hold.

## Audience

Any agent or crawler acting for anyone. Nothing is gated by identity.

## Registration

None. There is no registration endpoint, because nothing on loudface.co acts on an account.

## Methods

Anonymous, read-only access to public pages and to two tools:

- MCP server: ${MCP_ENDPOINT} (no auth)
- A2A agent: ${A2A_ENDPOINT} (no auth)

## Credentials

None are issued or accepted. Send no Authorization header.

## Revocation

Nothing to revoke. Use is governed by robots.txt (\`Content-Signal\`, \`Content-Usage\`).

## Contact

To work with LoudFace, a person books a call at https://www.loudface.co/contact.
`;

/** Shared headers for the discovery documents: readable from any origin, cached an hour. */
export const DISCOVERY_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
};
