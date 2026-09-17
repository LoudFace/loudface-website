import { currentEditor } from '@/lib/inline-edit/session';
import { mode, undo } from '@/lib/inline-edit/content-store';
import { editorOffResponse } from '@/lib/inline-edit/guard';

export async function POST(request: Request) {
  const off = editorOffResponse();
  if (off) return off;

  const editor = await currentEditor();
  if (!editor) return Response.json({ error: 'Sign in first' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (typeof body.hash !== 'string') return Response.json({ error: 'Which change?' }, { status: 400 });

  try {
    const { hash, restored, removed } = await undo(body.hash, editor);
    return Response.json({ ok: true, hash, restored, removed, mode: mode() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Undo failed' },
      { status: 400 },
    );
  }
}
