// The emails a lead gets between booking an intro call and the call itself, after email 1
// (booked-call-email.ts, sent the moment they book). Drafted 2026-11-04 because a lead heard
// nothing for up to two weeks between "your call is booked" and the call: Cal.com sends no
// reminders (no workflows on the account), and the 10-weekday booking window means /apply
// leads book far out (the first Meta lead booked 11 days ahead).
//
//   2  Who you're meeting     weekday 09:00 after booking   Arnel, LoudFace, why we're talking
//   3  One client's story     midway                        the case closest to the page they applied on
//   4  What happens next      last weekday before the call  the steps after the call, client quotes, the guarantee
//   5  Tomorrow               24 hours before               what, when, why, join and reschedule links
//   6  In one hour            60 minutes before             the join link
//
// Timing lives in booked-call-sequence.ts. Every quote and number below is copied from a public
// review or a published case study (sources in the comments); never edit one by hand.
// Same look as email 1: indigo header band, white card, Helvetica, one quote-card style.

export type Vertical = 'info' | 'saas' | 'legal' | 'site';

export type SequenceLead = {
  firstName: string;
  /** "accidentaldefenders.com" or "Hai Robotics": what the lead's business is called in a sentence. */
  site: string;
  callDate: string; // "Friday, 14 Nov"
  callTime: string; // "09:30"
  callDay: string; // "Friday"
  callMonth: string; // "NOV"
  callDaynum: string; // "14"
  tzLabel: string; // "(PST, your time)"
  joinUrl: string;
  rescheduleUrl: string;
  vertical: Vertical;
};

export type RenderedEmail = { subject: string; preheader: string; html: string; text: string };

const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const INK = '#12103A';
const BODY = '#3C4344';
const MUTED = '#5C5A7C';
const FAINT = '#8B89AD';
const BRAND = '#5222FF';
const HEADER_BAND =
  'https://raw.githubusercontent.com/ArnelBukva/arnel-post-assets/main/2026/10/2026-10-21-email-header-band-indigo-c7f4a39198.png';
// Arnel's team photo on loudface.co (Sanity), cropped to his face on the brand tint.
const ARNEL_PHOTO =
  'https://cdn.sanity.io/images/xjjjqhgt/production/92dfd51e1f15a98227f6308a075c490ce52c05b4-1000x1000.png?rect=290,0,420,420&w=144&h=144&bg=F2F0FF&fm=jpg';

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- building blocks (tables only, inline styles: what Gmail and Outlook render) ----------

const p = (html: string, pad = '0 44px 14px') =>
  `<tr><td style="padding:${pad};font-family:${FONT};font-size:15px;line-height:23px;color:${BODY};">${html}</td></tr>`;

const label = (text: string) =>
  `<tr><td style="padding:22px 44px 10px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;color:${FAINT};">${esc(text)}</td></tr>`;

function hero(line1: string, line2: string): string {
  return `<tr><td style="background:#3D38CF;"><img src="${HEADER_BAND}" width="600" alt="LoudFace" style="width:100%;display:block;"></td></tr>
    <tr><td style="background:#3D38CF;padding:28px 44px 32px;font-family:${FONT};">
      <div style="font-size:28px;line-height:36px;font-weight:300;color:#FFFFFF;">${line1}</div>
      <div style="font-size:28px;line-height:36px;font-weight:300;color:#C9C6F0;">${line2}</div>
    </td></tr>
    <tr><td style="height:26px;line-height:26px;font-size:0;">&nbsp;</td></tr>`;
}

/** The calendar card beside the call moment, as in email 1, on white. */
function callCard(l: SequenceLead, extra: string): string {
  return `<tr><td style="padding:0 44px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F0FF;border-radius:16px;"><tr><td style="padding:18px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="84" valign="top" style="width:84px;min-width:84px;">
            <table role="presentation" width="84" cellpadding="0" cellspacing="0" style="width:84px;border:1px solid #ECEAF6;border-radius:13px;overflow:hidden;">
              <tr><td align="center" style="background:${BRAND};padding:5px 0;font-family:${FONT};font-size:10.5px;font-weight:700;letter-spacing:1.5px;color:#ffffff;">${esc(l.callMonth)}</td></tr>
              <tr><td align="center" style="background:#ffffff;padding:8px 0 2px;font-family:${FONT};font-size:30px;font-weight:300;color:${INK};">${esc(l.callDaynum)}</td></tr>
              <tr><td align="center" style="background:#ffffff;padding:0 0 9px;font-family:${FONT};font-size:11.5px;color:${FAINT};">${esc(l.callDay)}</td></tr>
            </table>
          </td>
          <td valign="top" style="padding-left:18px;font-family:${FONT};">
            <div style="font-size:17px;line-height:24px;font-weight:500;color:${INK};">${esc(l.callTime)} <span style="font-weight:400;color:${MUTED};font-size:14px;">${esc(l.tzLabel)}</span></div>
            <div style="font-size:14px;line-height:21px;color:${MUTED};padding-top:4px;">30 minutes &middot; Google Meet &middot; with Arnel Bukva, founder of LoudFace</div>
            ${extra}
          </td>
        </tr></table>
      </td></tr></table>
    </td></tr>`;
}

function button(href: string, text: string): string {
  return `<tr><td style="padding:4px 44px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${BRAND};border-radius:10px;">
        <a href="${esc(href)}" style="display:inline-block;padding:13px 24px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(text)}</a>
      </td></tr></table>
    </td></tr>`;
}

type Stat = { n: string; what: string; when: string };

function stats(items: Stat[]): string {
  const width = items.length === 2 ? '49%' : '32%';
  const cells = items
    .map(
      (s) => `<td width="${width}" valign="top" style="background:#F2F0FF;border-radius:13px;padding:16px 14px;">
          <div style="font-family:${FONT};font-size:26px;font-weight:300;color:${BRAND};">${esc(s.n)}</div>
          <div style="font-family:${FONT};font-size:12.5px;line-height:17px;color:${INK};padding-top:5px;">${esc(s.what)}</div>
          <div style="font-family:${FONT};font-size:11px;line-height:15px;color:${FAINT};padding-top:6px;">${esc(s.when)}</div>
        </td>`
    )
    .join('<td width="2%"></td>');
  return `<tr><td style="padding:0 40px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table></td></tr>`;
}

export type Quote = { id: string; title: string; body: string; who: string };

/** One card style for every testimonial (Arnel, 2026-08-29). */
function quoteCard(q: Quote): string {
  return `<tr><td style="padding:6px 40px 6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FCFCFE;border:1px solid #ECEAF6;border-radius:16px;"><tr><td style="padding:20px 22px;font-family:${FONT};">
        <div style="font-size:15px;font-weight:500;color:${INK};">${esc(q.title)}</div>
        <div style="font-size:13.5px;line-height:20px;color:${MUTED};padding-top:8px;">${esc(q.body)}</div>
        <div style="font-size:11.5px;color:${FAINT};padding-top:10px;"><span style="color:${BRAND};">&#9679;</span>&nbsp; ${esc(q.who)}</div>
      </td></tr></table>
    </td></tr>`;
}

function steps(items: Array<[string, string]>): string {
  const rows = items
    .map(
      ([when, what], i) => `<tr>
          <td width="26" valign="top" style="padding-bottom:12px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="26" style="background:${BRAND};border-radius:6.5px;width:26px;height:26px;text-align:center;font-family:${FONT};font-size:12px;font-weight:700;color:#ffffff;">0${i + 1}</td></tr></table></td>
          <td style="padding:0 0 12px 12px;font-family:${FONT};font-size:14px;line-height:21px;color:${INK};"><span style="font-weight:600;">${esc(when)}</span> <span style="color:${BODY};">${esc(what)}</span></td>
        </tr>`
    )
    .join('');
  return `<tr><td style="padding:0 44px 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>`;
}

function guarantee(): string {
  return `<tr><td style="padding:10px 40px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12103A;border-radius:16px;"><tr><td style="padding:22px 24px;font-family:${FONT};">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#A9A6E8;">THE GUARANTEE</div>
        <div style="font-size:20px;line-height:27px;font-weight:300;color:#ffffff;padding-top:8px;">3&times; your organic traffic, or we keep working for free until you have it.</div>
        <div style="font-size:13.5px;line-height:20px;color:#C9C6F0;padding-top:8px;">It goes into your agreement, measured in your own Search Console and analytics, with a report every month.</div>
      </td></tr></table>
    </td></tr>`;
}

function signature(withPhoto: boolean): string {
  const photo = withPhoto
    ? `<td width="56" valign="middle" style="width:56px;padding-top:16px;"><img src="${ARNEL_PHOTO}" width="44" height="44" alt="Arnel Bukva" style="display:block;width:44px;height:44px;border-radius:22px;"></td>`
    : '';
  return `<tr><td style="padding:14px 44px 26px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ECEAF6;"><tr>
        ${photo}
        <td valign="middle" style="padding-top:16px;font-family:${FONT};font-size:12px;line-height:17px;color:${INK};"><span style="font-weight:700;letter-spacing:0.8px;">Arnel Bukva</span><br><span style="color:${FAINT};">Founder, LoudFace</span></td>
        <td align="right" valign="middle" style="padding-top:16px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.8px;"><a href="https://www.loudface.co" style="color:${BRAND};text-decoration:none;">loudface.co</a></td>
      </tr></table>
    </td></tr>`;
}

function page(subject: string, preheader: string, rows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F7F7F8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F7F7F8;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F8;">
<tr><td align="center" style="padding:36px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;">
${rows}
  </table>
</td></tr>
</table>
</body>
</html>`;
}

const sign = p(`<span style="color:${INK};">Arnel</span>`, '0 44px 4px');

// ---------- the case each page gets (email 3) ----------

type Case = {
  subject: string;
  preheader: string;
  heroLine1: string;
  heroLine2: string;
  story: string[];
  stats: Stat[];
  quote?: Quote;
  href: string;
};

// Quotes, verbatim. Sources: Clutch reviews (2 Sep 2026), loudface.co case studies, Trustpilot.
export const QUOTES: Record<string, Quote> = {
  kevin: {
    id: 'kevin',
    title: '"Results on Google and AI models in the first 1-2 months"',
    body: '"In a very short period of time, we managed to get more things done than we expected, which we expect would take any other agency 5x the time. But most importantly, we\'ve seen results on Google and AI models pretty much in the first 1-2 months."',
    who: 'Kevin Wong · Co-Founder & CTO, Genie Teacher · Clutch review',
  },
  kenneth: {
    id: 'kenneth',
    title: '"You guys are the experts"',
    body: '"You guys are the experts. I can rely on you to drive the plan, and I\'m probably going to say yes to almost everything."',
    who: 'Kenneth O’Friel · CEO, Toku',
  },
  jordan: {
    id: 'jordan',
    title: '"My team stays focused on our clients"',
    body: '"LoudFace owns the strategy and the content end to end, so my team stays focused on our clients."',
    who: 'Jordan Hayes · Founder, Hayes Media',
  },
  sarig: {
    id: 'sarig',
    title: '"The team exceeded expectations"',
    body: '"From start to finish, the team exceeded expectations, handling everything from branding and design to development with incredible professionalism and expertise."',
    who: 'Sarig Reichert · CPO, Dimer Health · Trustpilot review',
  },
  paul: {
    id: 'paul',
    title: '"Super responsive"',
    body: '"LoudFace met every deadline or before every deadline and was super responsive."',
    who: 'Paul Butler Simpson · Co-Founder, Transalis · Clutch review',
  },
};

// Numbers from the published case studies (read 2026-11-02), with each one's own window.
const CASES: Record<Vertical, Case> = {
  legal: {
    subject: 'How a Los Angeles law firm grew its Google clicks 16×',
    preheader: 'Delshad Legal, June to October 2026, measured in its own Search Console.',
    heroLine1: 'How a law firm grew',
    heroLine2: 'its Google clicks 16×.',
    story: [
      'Delshad Legal is an employment law firm in Los Angeles. In June, most of its Google traffic came from pages about one famous case. People read those pages and left. Very few of them needed a lawyer.',
      'We built new pages for the people who do: workers in Los Angeles who search for an employment lawyer. Then we kept publishing and improving them every week.',
    ],
    stats: [
      { n: '16×', what: 'Google clicks a week outside the famous-case pages', when: 'Week of 7 Jun to week of 18 Oct 2026' },
      { n: '2.7×', what: 'case enquiries a week through the website', when: 'Aug to late Sep, against the weeks before' },
      { n: '#1', what: 'of 12 Los Angeles employment firms in AI answers', when: '32.4% share of voice, 30 days to 27 Sep' },
    ],
    href: 'https://www.loudface.co/case-studies/delshad-legal-content-engine',
  },
  saas: {
    subject: 'Genie Teacher: 72× more Google clicks a week',
    preheader: 'An online tutoring platform, from barely visible on Google to leads every week.',
    heroLine1: 'Genie Teacher went from',
    heroLine2: 'barely visible to 72× the clicks.',
    story: [
      'Genie Teacher is an online tutoring platform in Canada. Before we started, it barely showed up on Google, and AI answers didn\'t name it at all.',
      'We redesigned and rebuilt the site, then wrote the pages that Google and AI answers now show. The first results came in within two months.',
    ],
    stats: [
      { n: '72×', what: 'Google clicks a week', when: 'Against the May average' },
      { n: '5.8×', what: 'lead requests a week', when: 'First three weeks of Sep, against before' },
      { n: '3.6×', what: 'lesson bookings a week', when: 'Same weeks' },
    ],
    quote: QUOTES.kevin,
    href: 'https://www.loudface.co/case-studies/genie-teacher-organic-growth',
  },
  info: {
    subject: '$6,000 from one search lead in the first month',
    preheader: 'Hayes Media, an eCommerce growth agency, in its first month with us.',
    heroLine1: 'One search lead,',
    heroLine2: '$6,000 closed in month one.',
    story: [
      'Hayes Media is an eCommerce growth agency in the US. In September we started running its SEO and AI search.',
      'The first lead from search closed inside a month, for $6,000. A few weeks later, a brand doing $50M a year booked a sales call the same way.',
    ],
    stats: [
      { n: '$6,000', what: 'closed from one search lead', when: 'In the first month' },
      { n: '5.4×', what: 'non-branded Google searches that show Hayes Media', when: '2-8 Sep to week of 20 Oct 2026' },
      { n: '7.5×', what: 'non-branded searches where it ranks on page one', when: 'Same weeks' },
    ],
    quote: QUOTES.jordan,
    href: 'https://www.loudface.co/case-studies/hayes-media-organic-leads',
  },
  site: {
    subject: 'How Toku became the name AI gives for stablecoin payroll',
    preheader: 'Named in 97.8% of AI answers on its category’s top question.',
    heroLine1: 'How Toku became the name',
    heroLine2: 'AI gives for its category.',
    story: [
      'Toku pays teams in stablecoins. When a buyer asks ChatGPT or Perplexity how to do that, Toku is the name in the answer.',
      'We\'ve been Toku\'s growth partner for 18 months. This year we ran its AI search program, and most of its B2B pipeline now comes from Google and the AI engines.',
    ],
    stats: [
      { n: '97.8%', what: 'AI visibility on its category’s top question', when: 'Peec AI, August 2026' },
      { n: '+800%', what: 'Google clicks to one of its guides', when: 'Feb to Apr 2026' },
    ],
    quote: QUOTES.kenneth,
    href: 'https://www.loudface.co/case-studies/toku-ai-cited-pipeline',
  },
};

// ---------- the five emails ----------

export function email2(l: SequenceLead): RenderedEmail {
  const subject = `Who you're meeting on ${l.callDay}`;
  const preheader = `A short intro before our call on ${l.callDate}.`;
  const rows = [
    hero(`Hi ${esc(l.firstName)}, here's who`, `you're meeting on ${esc(l.callDay)}.`),
    p(`Before our call, a short intro so you know who's on the other side.`),
    `<tr><td style="padding:4px 44px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FCFCFE;border:1px solid #ECEAF6;border-radius:16px;"><tr>
        <td width="96" valign="top" style="width:96px;padding:20px 0 20px 20px;"><img src="${ARNEL_PHOTO}" width="72" height="72" alt="Arnel Bukva" style="display:block;width:72px;height:72px;border-radius:36px;"></td>
        <td valign="top" style="padding:20px 22px 20px 4px;font-family:${FONT};">
          <div style="font-size:17px;font-weight:500;color:${INK};">Arnel Bukva</div>
          <div style="font-size:13px;color:${FAINT};padding-top:2px;">Founder, LoudFace &middot; started it in 2019</div>
          <div style="font-size:14px;line-height:21px;color:${BODY};padding-top:10px;">I run every first call myself, and I set the strategy for every client we take on.</div>
        </td>
      </tr></table>
    </td></tr>`,
    label('WHAT WE DO'),
    p(`We design, write and build the pages that Google ranks and that AI answers like ChatGPT cite. One team does the strategy, the writing, the design and the build, so nothing gets lost between agencies.`),
    p(`Our clients include Radisson Hotels Group, Montblanc, Hoxhunt and Toku. We have offices in Dubai and the US.`),
    label('WHY WE\'RE TALKING'),
    p(`You booked this call to find out if we can grow the traffic ${esc(l.site)} gets from Google and AI answers. That's the whole agenda.`),
    guarantee(),
    p(`Before the call I look at your site, so we spend the 30 minutes on your numbers, not on introductions.`, '14px 44px 14px'),
    p(`If there's one question you want answered on the call, reply with it. I'll come prepared.`),
    callCard(l, ''),
    sign,
    signature(false),
  ].join('\n');
  const text = [
    `Hi ${l.firstName}, here's who you're meeting on ${l.callDay}.`,
    '',
    "Before our call, a short intro so you know who's on the other side.",
    '',
    "I'm Arnel Bukva. I started LoudFace in 2019. I run every first call myself, and I set the strategy for every client we take on.",
    '',
    'WHAT WE DO',
    'We design, write and build the pages that Google ranks and that AI answers like ChatGPT cite. One team does the strategy, the writing, the design and the build, so nothing gets lost between agencies.',
    'Our clients include Radisson Hotels Group, Montblanc, Hoxhunt and Toku. We have offices in Dubai and the US.',
    '',
    "WHY WE'RE TALKING",
    `You booked this call to find out if we can grow the traffic ${l.site} gets from Google and AI answers. That's the whole agenda.`,
    '',
    'THE GUARANTEE: 3x your organic traffic, or we keep working for free until you have it. It goes into your agreement, measured in your own Search Console and analytics, with a report every month.',
    '',
    'Before the call I look at your site, so we spend the 30 minutes on your numbers, not on introductions.',
    '',
    "If there's one question you want answered on the call, reply with it. I'll come prepared.",
    '',
    `Our call: ${l.callDate} at ${l.callTime} ${l.tzLabel}, 30 minutes on Google Meet.`,
    '',
    'Arnel',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text };
}

export function email3(l: SequenceLead): RenderedEmail {
  const c = CASES[l.vertical];
  const rows = [
    hero(c.heroLine1, c.heroLine2),
    p(`Hi ${esc(l.firstName)}, before ${esc(l.callDay)}, here's one client's story from start to finish.`),
    ...c.story.map((s) => p(esc(s))),
    label('THE RESULTS'),
    stats(c.stats),
    ...(c.quote ? [quoteCard(c.quote)] : []),
    p(`<a href="${c.href}" style="color:${BRAND};text-decoration:none;font-weight:600;">Read the full case study &rarr;</a>`, '14px 44px 14px'),
    p(`On the call I'll show you the same view for ${esc(l.site)}: where it stands today and what I'd do first.`),
    sign,
    signature(true),
  ].join('\n');
  const text = [
    `Hi ${l.firstName}, before ${l.callDay}, here's one client's story from start to finish.`,
    '',
    ...c.story.flatMap((s) => [s, '']),
    'THE RESULTS',
    ...c.stats.map((s) => `${s.n} ${s.what} (${s.when})`),
    '',
    ...(c.quote ? [`${c.quote.body} - ${c.quote.who}`, ''] : []),
    `The full case study: ${c.href}`,
    '',
    `On the call I'll show you the same view for ${l.site}: where it stands today and what I'd do first.`,
    '',
    'Arnel',
  ].join('\n');
  return { subject: c.subject, preheader: c.preheader, html: page(c.subject, c.preheader, rows), text };
}

/** Three quotes the lead has not read in email 1 (Maksim, Jordan, Slack) or in their email 3. */
export function quotesFor(vertical: Vertical): Quote[] {
  const used = CASES[vertical].quote?.id ?? (vertical === 'info' ? 'jordan' : '');
  return ['kevin', 'kenneth', 'sarig', 'paul'].filter((id) => id !== used).slice(0, 3).map((id) => QUOTES[id]);
}

export function email4(l: SequenceLead): RenderedEmail {
  const subject = `What happens after our call on ${l.callDay}`;
  const preheader = 'The steps from our first call to the first results, and what clients say.';
  const plan: Array<[string, string]> = [
    ['Our call.', '30 minutes on where your site stands and what good looks like for you.'],
    ['Within 48 hours.', 'If we\'re a fit, you get a written scope and price.'],
    ['Weeks 1 to 4.', 'We write your growth plan: what to fix, what to publish, and in what order.'],
    ['Weeks 4 to 6.', 'The first work goes live, and we set your starting numbers.'],
    ['Every month after.', 'New pages, updates and tests, and one report on what moved.'],
  ];
  const quotes = quotesFor(l.vertical);
  const rows = [
    hero(`Hi ${esc(l.firstName)}, here's what`, 'happens after our call.'),
    p(`Most people want to know what working with us looks like before they decide anything. Here it is, from our call to the first results.`),
    label('FROM CALL TO RESULTS'),
    steps(plan),
    label('WHAT CLIENTS SAY'),
    ...quotes.map(quoteCard),
    guarantee(),
    p(`See you on ${esc(l.callDate)} at ${esc(l.callTime)} ${esc(l.tzLabel)}.`, '16px 44px 14px'),
    sign,
    signature(true),
  ].join('\n');
  const text = [
    `Hi ${l.firstName}, here's what happens after our call.`,
    '',
    'Most people want to know what working with us looks like before they decide anything. Here it is, from our call to the first results.',
    '',
    'FROM CALL TO RESULTS',
    ...plan.map(([a, b], i) => `0${i + 1} ${a} ${b}`),
    '',
    'WHAT CLIENTS SAY',
    ...quotes.flatMap((q) => [`${q.body} - ${q.who}`, '']),
    'THE GUARANTEE: 3x your organic traffic, or we keep working for free until you have it. It goes into your agreement, measured in your own Search Console and analytics, with a report every month.',
    '',
    `See you on ${l.callDate} at ${l.callTime} ${l.tzLabel}.`,
    '',
    'Arnel',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text };
}

export function email5(l: SequenceLead): RenderedEmail {
  const subject = `Tomorrow at ${l.callTime}: your call with Arnel`;
  const preheader = `${l.callDate}, ${l.callTime} ${l.tzLabel}. Join link inside.`;
  const rows = [
    hero(`Hi ${esc(l.firstName)}, we talk tomorrow.`, `${esc(l.callDay)} at ${esc(l.callTime)}, your time.`),
    callCard(l, ''),
    label('WHAT IT\'S ABOUT'),
    p(`How ${esc(l.site)} can get 3&times; the traffic from Google and AI answers. I'll show you where your site stands today and what I'd do first. The report is yours either way.`),
    button(l.joinUrl, 'Join the call on Google Meet'),
    p(`Can you still make it? Reply "yes" and you're all set.`),
    p(`If the time no longer works, <a href="${esc(l.rescheduleUrl)}" style="color:${BRAND};text-decoration:none;font-weight:600;">pick a new time here</a>. It takes a minute.`),
    sign,
    signature(true),
  ].join('\n');
  const text = [
    `Hi ${l.firstName}, we talk tomorrow.`,
    '',
    `${l.callDate} at ${l.callTime} ${l.tzLabel}. 30 minutes on Google Meet, with Arnel Bukva, founder of LoudFace.`,
    '',
    "WHAT IT'S ABOUT",
    `How ${l.site} can get 3x the traffic from Google and AI answers. I'll show you where your site stands today and what I'd do first. The report is yours either way.`,
    '',
    `Join the call: ${l.joinUrl}`,
    '',
    'Can you still make it? Reply "yes" and you\'re all set.',
    '',
    `If the time no longer works, pick a new time here: ${l.rescheduleUrl}`,
    '',
    'Arnel',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text };
}

export function email6(l: SequenceLead): RenderedEmail {
  const subject = 'We start in 1 hour';
  const preheader = `${l.callTime} ${l.tzLabel}. Here's the link.`;
  const rows = [
    hero(`Hi ${esc(l.firstName)}, we start in one hour.`, `${esc(l.callTime)}, your time.`),
    p(`Here's the link for our call at ${esc(l.callTime)} ${esc(l.tzLabel)}.`),
    button(l.joinUrl, 'Join the call on Google Meet'),
    p(`If you can, have your website and Google Search Console open. See you soon.`),
    sign,
    signature(true),
  ].join('\n');
  const text = [
    `Hi ${l.firstName}, we start in one hour.`,
    '',
    `Here's the link for our call at ${l.callTime} ${l.tzLabel}: ${l.joinUrl}`,
    '',
    'If you can, have your website and Google Search Console open. See you soon.',
    '',
    'Arnel',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text };
}

export const SEQUENCE_EMAILS = { 2: email2, 3: email3, 4: email4, 5: email5, 6: email6 } as const;
export type SequenceEmailNumber = keyof typeof SEQUENCE_EMAILS;
