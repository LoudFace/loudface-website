import { defineType, defineField } from 'sanity';

// One outside page (an agency list, comparison or ranking) that names LoudFace.
// Written weekly by the content engine's recognition sync
// (content-engine: scripts/recognition-sync.mjs), which finds the page through
// Peec and reads it to confirm LoudFace is an entry. Every field except
// `hidden` belongs to the sync and is overwritten on each run, so it is
// read-only here. `hidden` belongs to people: the sync never changes it.
// The dataset is public, so nothing typed here is private.

const synced = { readOnly: true } as const;

export const recognition = defineType({
  name: 'recognition',
  title: 'Recognition',
  type: 'document',
  fields: [
    defineField({
      name: 'hidden',
      title: 'Hide from the Recognition page',
      type: 'boolean',
      initialValue: false,
      description: 'The weekly sync never changes this.',
    }),
    defineField({ name: 'publisher', title: 'Publisher', type: 'string', ...synced }),
    defineField({ name: 'title', title: 'Page title', type: 'string', ...synced }),
    defineField({ name: 'url', title: 'URL', type: 'url', ...synced }),
    defineField({ name: 'domain', title: 'Domain', type: 'string', ...synced }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'listed: LoudFace is an entry. Only listed pages are shown.',
      options: { list: ['listed', 'mentioned', 'about', 'not_found', 'unreadable', 'merged'] },
      ...synced,
    }),
    defineField({ name: 'statusReason', title: 'Why', type: 'string', ...synced }),
    defineField({ name: 'kind', title: 'Kind (Peec class)', type: 'string', ...synced }),
    defineField({ name: 'entryHeading', title: 'Our entry', type: 'string', ...synced }),
    defineField({ name: 'rank', title: 'Our position', type: 'number', ...synced }),
    defineField({ name: 'listSize', title: 'Entries on the list', type: 'number', ...synced }),
    defineField({ name: 'linksToUs', title: 'Links to loudface.co', type: 'boolean', ...synced }),
    defineField({ name: 'linkFollowed', title: 'Link is followed', type: 'boolean', ...synced }),
    defineField({
      name: 'aiCitations',
      title: 'AI citations',
      type: 'number',
      description: 'Times AI engines cited this page in our tracked Peec prompts, over the window below.',
      ...synced,
    }),
    defineField({ name: 'aiCitationsWindow', title: 'Citation window', type: 'string', ...synced }),
    defineField({ name: 'firstSeen', title: 'First seen', type: 'datetime', ...synced }),
    defineField({ name: 'lastListed', title: 'Last seen listing us', type: 'datetime', ...synced }),
    defineField({ name: 'lastChecked', title: 'Last checked', type: 'datetime', ...synced }),
  ],
  orderings: [
    { title: 'AI citations', name: 'aiCitationsDesc', by: [{ field: 'aiCitations', direction: 'desc' }] },
    { title: 'Last checked', name: 'lastCheckedDesc', by: [{ field: 'lastChecked', direction: 'desc' }] },
  ],
  preview: {
    select: { publisher: 'publisher', title: 'title', rank: 'rank', size: 'listSize', status: 'status', hidden: 'hidden' },
    prepare({ publisher, title, rank, size, status, hidden }) {
      const place = rank ? `#${rank}${size ? ` of ${size}` : ''} · ` : '';
      return {
        title: `${hidden ? '(hidden) ' : ''}${publisher ?? 'Unknown'}`,
        subtitle: `${status === 'listed' ? place : `${status} · `}${title ?? ''}`,
      };
    },
  },
});
