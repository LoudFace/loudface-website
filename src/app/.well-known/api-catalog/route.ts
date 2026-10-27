import { apiCatalog, DISCOVERY_HEADERS } from '@/lib/agent-surface';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(apiCatalog(), null, 2), {
    headers: { ...DISCOVERY_HEADERS, 'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"' },
  });
}
