import { currentEditor } from '@/lib/inline-edit/session';
import { history } from '@/lib/inline-edit/content-store';

export async function GET() {
  if (!(await currentEditor())) return Response.json({ error: 'Sign in first' }, { status: 401 });
  return Response.json({ publishes: await history() });
}
