import { handleA2a } from '@/lib/agent-surface';

// The public A2A agent (JSON-RPC). Same read-only jobs as /mcp: search the site, or read one page.
// Card: /.well-known/agent-card.json. Logic in src/lib/agent-surface.ts.
export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, A2A-Version',
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { headers: CORS });
  }
  const reply = await handleA2a(body, new URL(request.url).origin);
  return Response.json(reply, { headers: { ...CORS, 'Cache-Control': 'no-store' } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
