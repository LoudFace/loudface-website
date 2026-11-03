import type { HomeV11Content } from '@/lib/content-utils';
import type { ResearchStudy, TeamMember } from '@/lib/types';
import { personPhoto } from '../home-v11/ui';
import type { Researcher } from './ResearchIndexV11';
import { personOf, toCard } from './view';

/** The homepage's four leads, in the order of home-v11.json `team.people` (home-v11/Team.tsx uses the same order). */
const TEAM = ['arnel-bukva', 'tamara-pavlovic', 'andrea-van-wyk', 'abhay-tyagi'];

/**
 * The hub's researchers: every paper author (from the papers' `authors`), most papers first, each with their papers
 * newest first; then the leads who run the accounts the data comes from, with their homepage line. Photos are the
 * studio portraits the homepage uses, or the CMS picture for anyone else.
 */
export function researchers(studies: ResearchStudy[], members: Map<string, TeamMember>, team: HomeV11Content['team']): Researcher[] {
  const cards = studies.map(toCard);
  const byAuthor = new Map<string, ReturnType<typeof toCard>[]>();
  for (const p of cards) for (const id of p.authors) byAuthor.set(id, [...(byAuthor.get(id) ?? []), p]);
  const authors: Researcher[] = [...byAuthor.entries()]
    .map(([id, papers]) => ({ m: members.get(id), papers }))
    .filter((a): a is { m: TeamMember; papers: typeof cards } => !!a.m)
    .sort((a, b) => b.papers.length - a.papers.length)
    .map(({ m, papers }) => ({ person: personOf(m), papers }));
  const named = new Set(authors.map((a) => a.person.slug));
  const leads: Researcher[] = TEAM.map((slug, i) => ({ slug, p: team.people[i] }))
    .filter(({ slug, p }) => p && !named.has(slug))
    .map(({ slug, p }) => ({ person: { slug, name: p.person, title: p.jobTitle, photo: personPhoto(slug) }, papers: [], does: p.does }));
  return [...authors, ...leads].slice(0, 4);
}

/** A paper's authors, as bylines. */
export function authorsOf(study: ResearchStudy, members: Map<string, TeamMember>) {
  return (study.authors ?? []).map((id) => members.get(id)).filter((m): m is TeamMember => !!m).map(personOf);
}
