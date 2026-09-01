// Posts a lead card to Slack. Fire-and-forget: a Slack outage must never make
// the Cal.com webhook fail, because Cal.com retries a non-2xx and PostHog +
// Meta would then be double-counted. Every failure is logged and swallowed.

type SlackBlock = Record<string, unknown>;

export type LeadNotification = {
  /** call_booked | call_rescheduled | call_cancelled */
  event: string;
  name?: string;
  email?: string;
  timeZone?: string;
  eventTitle?: string;
  startTime?: string;
  bookingUid?: string;
  /** Every booking question the attendee answered, label -> answer. */
  answers?: Record<string, string>;
  utm?: Record<string, string | undefined>;
};

const HEADLINE: Record<string, string> = {
  call_booked: ':tada: New call booked',
  call_rescheduled: ':arrows_counterclockwise: Call rescheduled',
  call_cancelled: ':x: Call cancelled',
};

// Booking answers duplicated by their own field in the card.
const SKIP_ANSWERS = new Set(['name', 'email', 'attendeephonenumber', 'title', 'notes', 'guests', 'location', 'rescheduledreason', 'smsreminembernumber']);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatWhen(startTime: string | undefined, timeZone: string | undefined): string {
  if (!startTime) return '—';
  const parsed = Date.parse(startTime);
  if (!Number.isFinite(parsed)) return startTime;
  // Slack renders <!date^…> in each reader's own timezone.
  const unix = Math.floor(parsed / 1000);
  const fallback = new Date(parsed).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const line = `<!date^${unix}^{date_short_pretty} at {time}|${fallback}>`;
  return timeZone ? `${line}\n_their time: ${timeZone}_` : line;
}

function field(label: string, value: string): SlackBlock {
  return { type: 'mrkdwn', text: `*${label}*\n${value}` };
}

function buildBlocks(lead: LeadNotification): SlackBlock[] {
  const headline = HEADLINE[lead.event] ?? ':bell: Booking update';
  const blocks: SlackBlock[] = [
    { type: 'header', text: { type: 'plain_text', text: headline, emoji: true } },
  ];

  const primary: SlackBlock[] = [
    field('Name', lead.name?.trim() || '—'),
    field('Email', lead.email ? `<mailto:${lead.email}|${lead.email}>` : '—'),
    field('When', formatWhen(lead.startTime, lead.timeZone)),
    field('Call type', lead.eventTitle?.trim() || '—'),
  ];
  blocks.push({ type: 'section', fields: primary });

  const extras: SlackBlock[] = [];
  for (const [label, value] of Object.entries(lead.answers ?? {})) {
    if (SKIP_ANSWERS.has(normalize(label))) continue;
    const trimmed = value.trim().slice(0, 500);
    if (!trimmed) continue;
    extras.push(field(label, trimmed));
    // Slack caps a section at 10 fields; two sections is plenty for a booking form.
    if (extras.length === 10) break;
  }
  if (extras.length) blocks.push({ type: 'section', fields: extras });

  const utmPairs = Object.entries(lead.utm ?? {}).filter(([, v]) => Boolean(v));
  if (utmPairs.length) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: utmPairs.map(([k, v]) => `${k}: \`${v}\``).join('  ·  ') }],
    });
  }

  if (lead.bookingUid) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Open booking', emoji: true },
          url: `https://app.cal.com/booking/${lead.bookingUid}`,
        },
      ],
    });
  }

  return blocks;
}

export async function notifySlackOfLead(lead: LeadNotification): Promise<void> {
  const url = process.env.SLACK_LEADS_WEBHOOK_URL;
  if (!url) {
    console.warn('[slack-notify] SLACK_LEADS_WEBHOOK_URL not configured, skipping');
    return;
  }

  const headline = HEADLINE[lead.event] ?? 'Booking update';
  const body = {
    // Shown in the notification preview and by clients that cannot render blocks.
    text: `${headline}: ${lead.name?.trim() || lead.email || 'unknown lead'}`,
    blocks: buildBlocks(lead),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`[slack-notify] Slack returned ${response.status}: ${await response.text()}`);
    }
  } catch (error) {
    console.error('[slack-notify] post failed', error);
  }
}
