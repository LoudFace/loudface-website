import { currentEditor } from '@/lib/inline-edit/session';
import { history } from '@/lib/inline-edit/content-store';
import { editorOffResponse } from '@/lib/inline-edit/guard';

export async function GET() {
  const off = editorOffResponse();
  if (off) return off;

  if (!(await currentEditor())) return Response.json({ error: 'Sign in first' }, { status: 401 });

  // A site with no way to publish has no history to read either; say which of
  // the two it is rather than failing with a stack trace.
  try {
    return Response.json({ publishes: await history() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'History is unavailable' },
      { status: 400 },
    );
  }
}
