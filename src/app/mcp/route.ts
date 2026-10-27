import { handleMcp } from '@/lib/agent-surface';

// The public MCP server (Streamable HTTP, stateless, JSON replies). Read-only tools over the
// published site; src/lib/agent-surface.ts holds the tools and the protocol handling.
export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version',
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const reply = await handleMcp(body, new URL(request.url).origin);
  // Notifications only: accepted, nothing to say back.
  if (reply === null) return new Response(null, { status: 202, headers: CORS });
  return Response.json(reply, { headers: { ...CORS, 'Cache-Control': 'no-store' } });
}

// No server-to-client stream: the spec's answer to GET is 405.
export function GET() {
  return Response.json(
    { error: 'This MCP endpoint takes JSON-RPC over POST. Card: https://www.loudface.co/.well-known/mcp/server-card.json' },
    { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } }
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
