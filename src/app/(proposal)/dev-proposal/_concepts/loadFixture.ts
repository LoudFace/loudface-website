import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import type { Proposal } from '@/sanity/lib/proposalsClient';

/**
 * The dev-proposal pages render a real proposal (Faith) from a local fixture
 * that stays out of git on purpose (.git/info/exclude): it holds a client's
 * pricing. So the pages read it at request time instead of importing it, and
 * 404 in production.
 *
 * A static import of the fixture failed every Vercel build from 6af5248 on,
 * because the file is not in the repo. Committing the file instead would have
 * published the proposal, ungated, at /dev-proposal/*.
 */
export async function loadFixture(): Promise<Proposal> {
  if (process.env.NODE_ENV === 'production') notFound();
  try {
    const file = path.join(process.cwd(), 'src/app/(proposal)/dev-proposal/_fixture/faith.json');
    return JSON.parse(await readFile(file, 'utf8')) as Proposal;
  } catch {
    notFound();
  }
}
