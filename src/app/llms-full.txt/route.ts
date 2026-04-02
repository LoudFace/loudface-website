import { generateLlmsFullTxt } from '@/lib/llms-utils';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const content = await generateLlmsFullTxt();
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
