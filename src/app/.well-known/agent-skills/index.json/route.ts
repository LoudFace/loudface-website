import { agentSkillsIndex, DISCOVERY_HEADERS } from '@/lib/agent-surface';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(agentSkillsIndex(), null, 2), {
    headers: { ...DISCOVERY_HEADERS, 'Content-Type': 'application/json' },
  });
}
