/**
 * Reading a list of commits as a list of publishes.
 *
 * Both sides of the editor need the same three answers and must not disagree
 * about them: which commits belong in History, which of them have been undone
 * already, and which of them are themselves an undo.
 *
 * The last one is what the History panel got wrong. Undo makes a revert commit,
 * and a revert commit is a commit, so it appeared at the top of the list with an
 * "Undo" button beside it. Pressing that button undid the undo — a second
 * revert, the change back on the live site — and nothing on the row said so.
 *
 * Pure string work: no git, no request, no `server-only`, so the panel, the
 * store and a test all read a commit message by the same rules.
 */

/** What git writes in the body of a revert commit, naming what it undid. */
const REVERTS = /This reverts commit ([0-9a-f]{40})/g;

/** How a revert commit's first line quotes the commit it undid. */
const REVERT_SUMMARY = /^Revert "([\s\S]*)"$/;

/**
 * Commits this editor made, and only those.
 *
 * A publish and the undo of a publish. A revert of a revert is deliberately not
 * here: once a change has been put back, the row that offers to take it away
 * again is the original publish, not a third row saying the same thing twice.
 */
export function isPublishSummary(summary: string): boolean {
  return summary.startsWith('Content:') || summary.startsWith('Revert "Content:');
}

/**
 * Every commit that some later commit has undone.
 *
 * Read from the messages of all the commits handed in, whatever they are: a
 * revert names its target the same way whether the target was a publish or was
 * itself a revert, which is what makes a redone change show as redone.
 */
export function revertedShas(messages: string[]): Set<string> {
  return new Set(messages.flatMap((message) => [...message.matchAll(REVERTS)].map((match) => match[1])));
}

/**
 * The summary this commit undid, or null when it undid nothing.
 *
 * `Revert "Content: nav:links.1.href"` answers `Content: nav:links.1.href`, so
 * a client reads "undo of" and then the change in their own words.
 */
export function undoneSummary(summary: string): string | null {
  return REVERT_SUMMARY.exec(summary)?.[1] ?? null;
}
