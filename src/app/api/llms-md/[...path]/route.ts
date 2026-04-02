import { generatePageMarkdown } from '@/lib/llms-utils';

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pagePath = '/' + path.join('/');

  const markdown = await generatePageMarkdown(pagePath);

  if (!markdown) {
    return new Response('Page not found', { status: 404 });
  }

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
