/**
 * The wording a proposal uses for what the client counts. Leads is the house
 * default (the exact strings the deck always had); a proposal sets
 * `outcomeNoun` (plural, e.g. "downloads") when its client counts something
 * else. Components read one of these two sets instead of branching inline.
 */
export type OutcomeCopy = {
  /** Hero diagram core: a heading and its sub-lines. */
  core: string;
  coreSub: string[];
  /** Hero diagram alt text, last sentence. */
  streamsEnd: string;
  /** Capitalised plural, used as a short label ("Leads", "Downloads"). */
  plural: string;
  /** Capitalised singular, used on row badges ("Lead", "Download"). */
  singular: string;
  /** LoudFace tab, "What you can expect". */
  tracedRest: string;
  tracedTitle: string;
  reportRest: string;
  /** "Who does it" section. */
  reportHeadline: string;
  reportName: string;
  tagButtons: string;
  crmName: string;
  crmWhat: string;
  trackingHeadline: string;
  trackingShort: string;
  trackingBody: string;
  thisWeek: string;
  intro: string;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const LEADS: OutcomeCopy = {
  core: 'Leads',
  coreSub: ['calls, quotes', 'and bookings'],
  streamsEnd: 'Both end in leads: calls, quote requests and bookings.',
  plural: 'Leads',
  singular: 'Lead',
  tracedRest: 'so every lead is traced back to the page, search or AI answer that sent it.',
  tracedTitle: 'New leads, traced to source',
  reportRest: "leads from search and AI. Then what we shipped and what's next.",
  reportHeadline: 'One number on top: leads from search and AI',
  reportName: 'Pipeline report',
  tagButtons: 'Forms and demo buttons',
  crmName: 'Your CRM',
  crmWhat: 'Each lead with its source',
  trackingHeadline: 'Every lead traced back to where it came from',
  trackingShort: 'Every lead, sourced',
  trackingBody:
    'We wire analytics, your forms and your CRM in the first week. Each demo request carries the page and the search or AI assistant that sent it.',
  thisWeek: 'Leads this week',
  intro: 'Getting found brings buyers in. Getting chosen turns them into leads. We do both, so nobody on your team has to manage the website.',
};

export function outcomeCopy(noun?: string): OutcomeCopy {
  const plural = noun?.trim().toLowerCase();
  if (!plural) return LEADS;
  const one = plural.endsWith('s') ? plural.slice(0, -1) : plural;
  return {
    core: cap(plural),
    coreSub: ['by source, AI included'],
    streamsEnd: `Both end in ${plural}, counted by source, AI included.`,
    plural: cap(plural),
    singular: cap(one),
    tracedRest: `so every ${one} is traced to the page, search or AI answer behind it.`,
    tracedTitle: `New ${plural}, traced to source`,
    reportRest: `${plural} from search and AI. Then what we shipped and what's next.`,
    reportHeadline: `One number on top: ${plural} from search and AI`,
    reportName: 'Weekly report',
    tagButtons: `${cap(one)} buttons`,
    crmName: 'Your analytics',
    crmWhat: `Each ${one} with its source`,
    trackingHeadline: `Every ${one} traced back to where it came from`,
    trackingShort: `Every ${one}, sourced`,
    trackingBody: `We wire analytics and your ${one} events in the first week. Each ${one} carries the page and the search or AI assistant behind it.`,
    thisWeek: `${cap(plural)} this week`,
    intro: `Getting found brings people in. Getting chosen turns them into ${plural}. We do both, with your team or for it.`,
  };
}
