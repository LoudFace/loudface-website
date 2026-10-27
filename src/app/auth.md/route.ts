import { AUTH_MD, DISCOVERY_HEADERS } from '@/lib/agent-surface';

export const dynamic = 'force-static';

export function GET() {
  return new Response(AUTH_MD, {
    headers: { ...DISCOVERY_HEADERS, 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
