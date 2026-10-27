import { a2aAgentCard, DISCOVERY_HEADERS } from '@/lib/agent-surface';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(a2aAgentCard(), null, 2), {
    headers: { ...DISCOVERY_HEADERS, 'Content-Type': 'application/json' },
  });
}
