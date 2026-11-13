// The emails a lead gets between booking an intro call and the call itself, after email 1
// (booked-call-email.ts, sent the moment they book). Drafted 2026-11-04 because a lead heard
// nothing for up to two weeks between "your call is booked" and the call: Cal.com sends no
// reminders (no workflows on the account), and the 10-weekday booking window means /apply
// leads book far out (the first Meta lead booked 11 days ahead).
//
//   2  Who you're meeting     weekday 09:00 after booking   Arnel, LoudFace, a client's chart
//   3  One client's story     midway                        the case closest to the page they applied on
//   4  What clients say       last weekday before the call  three client quotes, no timelines
//   5  Tomorrow               24 hours before               when, what we'll cover, join and reschedule links
//   6  In one hour            60 minutes before             the join link
//
// Timing lives in booked-call-sequence.ts. Every quote and number below is copied from a public
// review or a published case study (sources in the comments); never edit one by hand.
//
// The look is "Letter plus" (Arnel picked it 2026-11-04, Paper file "LoudFace Website · v11", page
// "Emails · pre-call"): a signed letter on a white card, one dark panel for proof, the calendar card,
// and a ratings-and-logos strip at the foot. No guarantee anywhere: the 3× promise stays on the ad and
// the /apply page (Arnel, 2026-11-04). Tables and inline styles only; the <style> block adds the phone
// layout and the brand fonts, which Apple Mail loads and Gmail replaces with Helvetica.
// Images are served from public/email/precall/.

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

const IMG = 'https://www.loudface.co/email/precall/';
const BODY_F = "'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif";
const HEAD_F = "'Neue Montreal','Helvetica Neue',Helvetica,Arial,sans-serif";
const INK = '#1A1040';
const BODY = '#4A4466';
const MUTED = '#6B6788';
const GHOST = '#8A86A6';
const LINE = '#E4E4EA';
const INDIGO = '#4F46E5';
const TINT = '#EEF0FF';
const STAGE = '#1F1658'; // matches the chart images' own ground
const LAV = '#B7AAF2';
const STAGE_TXT = '#DCD9FE';
const STAR = '#F2A93B';

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** "(PST, your time)" -> "PST". */
function zone(l: SequenceLead): string {
  return l.tzLabel.replace(/^\(/, '').split(',')[0].trim();
}

// ---------- building blocks ----------

const HEAD = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>%TITLE%</title>
<style>
@font-face{font-family:'Satoshi';font-weight:400;src:url(https://www.loudface.co/fonts/Satoshi-Regular.woff2) format('woff2');}
@font-face{font-family:'Satoshi';font-weight:500;src:url(https://www.loudface.co/fonts/Satoshi-Medium.woff2) format('woff2');}
@font-face{font-family:'Neue Montreal';font-weight:500;src:url(https://www.loudface.co/fonts/NeueMontreal-Medium.woff2) format('woff2');}
body{margin:0;padding:0;background:#F6F6F6;}
@media (max-width:620px){
  .outer{padding:12px 10px 24px !important;}
  .card{width:100% !important;border-radius:16px !important;}
  .px{padding-left:24px !important;padding-right:24px !important;}
  .stage{padding-left:12px !important;padding-right:12px !important;}
  .stage-txt{padding-left:12px !important;padding-right:12px !important;}
  .h1{font-size:32px !important;line-height:35px !important;}
  .h2{font-size:24px !important;line-height:28px !important;}
  .stack{display:block !important;width:100% !important;border-right:0 !important;padding:0 0 14px 0 !important;}
  .stack-last{display:block !important;width:100% !important;padding:0 !important;}
  .logo{height:14px !important;width:auto !important;}
  .logo-mb{height:10px !important;}
  .hide-sm{display:none !important;}
  .rname{display:none !important;}
  .rcell{padding-right:14px !important;}
  .lcell{padding-right:14px !important;}
  .btn-row td{display:block !important;}
  .btn-link{padding:14px 0 0 0 !important;}
}
</style></head>
<body style="margin:0;padding:0;background:#F6F6F6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F6F6F6;">%PREHEADER%</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F6F6;"><tr><td class="outer" align="center" style="padding:40px 16px;">
<table role="presentation" class="card" width="600" cellpadding="0" cellspacing="0" style="width:600px;background:#FFFFFF;border-radius:20px;overflow:hidden;">
`;

function page(subject: string, preheader: string, rows: string): string {
  return HEAD.replace('%TITLE%', esc(subject)).replace('%PREHEADER%', esc(preheader)) + rows + '</table></td></tr></table></body></html>';
}

const row = (inner: string, pad = '0 52px') => `<tr><td class="px" style="padding:${pad};">${inner}</td></tr>`;

function text(t: string, size = 17, lh = 27, color = BODY, weight = 400, font = BODY_F, extra = '', cls = ''): string {
  return `<div${cls ? ` class="${cls}"` : ''} style="font-family:${font};font-size:${size}px;line-height:${lh}px;color:${color};font-weight:${weight};${extra}">${t}</div>`;
}

const para = (t: string, pad = '0 52px 16px') => row(text(t), pad);

const topbar = () =>
  row(`<img src="${IMG}wordmark.png" width="104" height="22" alt="loudface" style="display:block;border:0;">`, '48px 52px 36px');

const author = () =>
  row(`<table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle"><img src="${IMG}arnel.jpg" width="44" height="44" alt="" style="display:block;border:0;border-radius:22px;"></td>
      <td valign="middle" style="padding-left:14px;">${text('Arnel Bukva, founder of LoudFace', 15, 20)}</td></tr></table>`);

const h1 = (t: string, size = 40, lh = 42, pad = '24px 52px 0') =>
  row(text(t, size, lh, INK, 500, HEAD_F, `letter-spacing:-${(size * 0.03).toFixed(1)}px;`, 'h1'), pad);

function callCard(l: SequenceLead, line1: string, line2: string): string {
  return row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TINT};border-radius:16px;"><tr><td style="padding:16px 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td valign="middle" width="64" style="width:64px;">
          <table role="presentation" width="64" cellpadding="0" cellspacing="0" style="width:64px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
            <tr><td align="center" style="background:${INDIGO};padding:4px 0;font-family:${BODY_F};font-size:11px;line-height:14px;font-weight:700;letter-spacing:1.3px;color:#FFFFFF;">${esc(l.callMonth)}</td></tr>
            <tr><td align="center" style="padding:4px 0 6px;font-family:${HEAD_F};font-size:28px;line-height:30px;font-weight:500;color:${INK};">${esc(l.callDaynum)}</td></tr>
          </table></td>
        <td valign="middle" style="padding-left:18px;">${text(line1, 17, 24, INK, 500)}${text(line2, 14, 20, BODY, 400, BODY_F, 'padding-top:3px;')}</td>
      </tr></table>
    </td></tr></table>`, '8px 52px 24px');
}

function joinButton(l: SequenceLead, withReschedule: boolean): string {
  const link = withReschedule
    ? `<td class="btn-link" style="padding-left:20px;"><a href="${esc(l.rescheduleUrl)}" style="font-family:${BODY_F};font-size:15px;line-height:18px;font-weight:500;color:${INDIGO};text-decoration:none;">Pick a new time</a></td>`
    : '';
  return row(`<table role="presentation" class="btn-row" cellpadding="0" cellspacing="0"><tr>
      <td style="background:${INK};border-radius:999px;"><a href="${esc(l.joinUrl)}" style="display:inline-block;padding:15px 26px;font-family:${BODY_F};font-size:16px;line-height:20px;font-weight:500;color:#FFFFFF;text-decoration:none;">Join on Google Meet</a></td>${link}</tr></table>`);
}

function signature(line?: string): string {
  return (
    row(`<img src="${IMG}signature.png" width="81" height="44" alt="Arnel" style="display:block;border:0;">`, '14px 52px 0') +
    (line ? row(text(line, 14, 20, MUTED), '6px 52px 0') : '')
  );
}

/** The thin trust strip at the foot of every email: three ratings, one row of client logos (Arnel, 2026-11-04).
 *  Scores read off the live profiles on 2026-11-04: Clutch 4.8, Google 5.0, Trustpilot 4.3 (9 reviews, all 5 stars). */
function proofStrip(): string {
  const rating = (icon: string, name: string, score: string, w = 16) => `<td class="rcell" valign="middle" style="padding-right:18px;white-space:nowrap;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td valign="middle"><img src="${IMG}icon-${icon}.png" width="${w}" height="16" alt="" style="display:block;border:0;"></td>
        <td valign="middle" style="padding-left:6px;font-family:${BODY_F};font-size:13px;line-height:16px;color:${MUTED};white-space:nowrap;"><span class="rname">${name} </span><span style="color:${STAR};">&#9733;</span> <span style="color:${INK};font-weight:500;">${score}</span></td>
      </tr></table></td>`;
  const logos: Array<[string, number, number, string, string]> = [
    ['radisson', 74, 18, 'Radisson Hotels Group', ''],
    ['montblanc', 93, 13, 'Montblanc', 'logo-mb'],
    ['hoxhunt', 88, 18, 'Hoxhunt', ''],
    ['toku', 64, 18, 'Toku', ''],
    ['ceipal', 55, 18, 'Ceipal', 'hide-sm'],
  ];
  const cells = logos
    .map(([name, w, h, alt, cls]) => `<td class="lcell${cls === 'hide-sm' ? ' hide-sm' : ''}" valign="middle" style="padding-right:22px;"><img class="logo${cls === 'logo-mb' ? ' logo-mb' : ''}" src="${IMG}logo-${name}.png" width="${w}" height="${h}" alt="${alt}" style="display:block;border:0;height:${h}px;"></td>`)
    .join('');
  return row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};"><tr><td style="padding-top:22px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>${rating('clutch', 'Clutch', '4.8', 14)}${rating('google', 'Google', '5.0')}${rating('trustpilot', 'Trustpilot', '4.3')}</tr></table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;"><tr>${cells}</tr></table>
    </td></tr></table>`, '32px 52px 40px');
}

type Stat = [big: string, what: string, when?: string];

function statCells(items: Stat[], onDark = false): string {
  const tds = items.map(([big, what, when], i) => {
    const last = i === items.length - 1;
    const border = last ? '' : `border-right:1px solid ${onDark ? 'rgba(220,217,254,0.18)' : LINE};`;
    const pad = `0 ${last ? 0 : 16}px 0 ${i === 0 ? 0 : 16}px`;
    return `<td class="${last ? 'stack-last' : 'stack'}" valign="top" width="${Math.floor(100 / items.length)}%" style="${border}padding:${pad};">
        ${text(big, 30, 32, onDark ? '#FFFFFF' : INDIGO, 500, HEAD_F, 'letter-spacing:-1px;')}
        ${text(what, 13, 18, onDark ? LAV : BODY, 400, BODY_F, 'padding-top:5px;')}${when ? text(when, 12, 16, onDark ? '#8F88C4' : GHOST, 400, BODY_F, 'padding-top:6px;') : ''}</td>`;
  });
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${tds.join('')}</tr></table>`;
}

/** The dark panel, edge to edge across the card. */
const stage = (inner: string, pad = '36px 52px 34px') =>
  `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${STAGE};"><tr><td class="px" style="padding:${pad};">${inner}</td></tr></table></td></tr>`;

// ---------- quotes ----------

export type Quote = {
  id: 'kevin' | 'kenneth' | 'jordan' | 'sarig';
  body: string;
  name: string;
  role: string;
  /** The image beside the name; no photo means initials. */
  photo?: string;
  initials: string;
  /** The result shown under the quote when it leads email 4. */
  result?: [string, string];
};

// Quotes, verbatim. Sources: Clutch reviews (2 Sep 2026), loudface.co case studies, Trustpilot.
export const QUOTES: Record<Quote['id'], Quote> = {
  kevin: {
    id: 'kevin',
    body: '"In a very short period of time, we managed to get more things done than we expected, which we expect would take any other agency 5x the time. But most importantly, we\'ve seen results on Google and AI models pretty much in the first 1-2 months."',
    name: 'Kevin Wong',
    role: 'Co-Founder and CTO, Genie Teacher &middot; Clutch review',
    photo: 'genie.png',
    initials: 'KW',
    result: ['106&times;', "Genie Teacher's Google clicks a week, since the work began"],
  },
  kenneth: {
    id: 'kenneth',
    body: '"You guys are the experts. I can rely on you to drive the plan, and I\'m probably going to say yes to almost everything."',
    name: 'Kenneth O&rsquo;Friel',
    role: 'CEO, Toku',
    photo: 'kenneth.jpg',
    initials: 'KO',
    result: ['97.8%', "Toku's AI visibility on its category's top question"],
  },
  jordan: {
    id: 'jordan',
    body: '"LoudFace owns the strategy and the content end to end, so my team stays focused on our clients."',
    name: 'Jordan Hayes',
    role: 'Founder, Hayes Media',
    photo: 'jordan.jpg',
    initials: 'JH',
    result: ['$6,000', 'Hayes Media, from one search lead'],
  },
  sarig: {
    id: 'sarig',
    body: '"From start to finish, the team exceeded expectations, handling everything from branding and design to development with incredible professionalism and expertise."',
    name: 'Sarig Reichert',
    role: 'CPO, Dimer Health &middot; Trustpilot review',
    initials: 'SR',
  },
};

function face(q: Quote, size: number): string {
  if (q.photo) return `<img src="${IMG}${q.photo}" width="${size}" height="${size}" alt="" style="display:block;border:0;border-radius:${size / 2}px;">`;
  return `<table role="presentation" width="${size}" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:${size / 2}px;background:${TINT};font-family:${BODY_F};font-size:${Math.round(size * 0.36)}px;font-weight:500;color:${INDIGO};">${q.initials}</td></tr></table>`;
}

/** One testimonial card style for every quote (Arnel, 2026-08-29). */
function quoteCard(q: Quote): string {
  return row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:16px;"><tr><td style="padding:22px 24px;">
      ${text(q.body, 16, 25, INK)}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;"><tr>
        <td valign="middle" width="36" style="width:36px;">${face(q, 36)}</td>
        <td valign="middle" style="padding-left:12px;">${text(q.name, 14, 18, INK, 500)}${text(q.role, 13, 18, MUTED)}</td></tr></table>
    </td></tr></table>`, '0 52px 14px');
}

// ---------- the chart in email 2 ----------

type Chart = { img: string; client: string; metric: string; from: string; to: string; caption: string; alt: string; intro: string; others: Stat[] };

// Snapshots of the live /apply charts on 2026-11-04, with the 3x bar left out.
const CHARTS: Record<'delshad' | 'genie', Chart> = {
  delshad: {
    img: 'chart-delshad.png',
    client: 'Delshad Legal',
    metric: '16&times;',
    from: 'Jun 2026',
    to: 'Oct 2026',
    caption: 'Google clicks a week outside the celebrity-case pages &middot; Search Console',
    alt: "Delshad Legal's Google clicks a week, June to October 2026: flat, then rising to 16 times the start",
    intro: "Here's what that looked like for a Los Angeles law firm, in its own Search Console.",
    others: [['106&times;', 'Genie Teacher, Google clicks a week'], ['$6,000', 'Hayes Media, from one search lead']],
  },
  genie: {
    img: 'chart-genie.png',
    client: 'Genie Teacher',
    metric: '106&times;',
    from: 'Apr 2026',
    to: 'Oct 2026',
    caption: 'Google clicks a week, against the week the work began &middot; Search Console',
    alt: "Genie Teacher's Google clicks a week, April to October 2026: flat until the work began in July, then rising steeply",
    intro: "Here's what that looked like for an online tutoring platform, in its own Search Console.",
    others: [['16&times;', 'Delshad Legal, Google clicks a week'], ['$6,000', 'Hayes Media, from one search lead']],
  },
};

// The same chart the lead saw on the page they applied on (apply-v11/ApplyV11.tsx).
const chartFor = (v: Vertical) => CHARTS[v === 'saas' ? 'genie' : 'delshad'];

// ---------- the case each page gets (email 3) ----------

type Case = {
  subject: string;
  preheader: string;
  headline: string;
  chip: { icon: string; name: string; what: string };
  story: string[];
  panel: string;
  stats: Stat[];
  note: string;
  quote?: Quote['id'];
  href: string;
};

// Numbers from the published case studies (read 2026-11-02), with each one's own window.
const CASES: Record<Vertical, Case> = {
  legal: {
    subject: 'How a Los Angeles law firm grew its Google clicks 16×',
    preheader: 'Delshad Legal, June to October 2026, measured in its own Search Console.',
    headline: 'How a law firm grew<br>its Google clicks 16&times;.',
    chip: { icon: 'delshad.jpg', name: 'Delshad Legal', what: 'employment law, Los Angeles' },
    story: [
      'In June, most of its Google traffic came from pages about one famous case. People read those pages and left. Very few of them needed a lawyer.',
      'We built new pages for the people who do: workers in Los Angeles who search for an employment lawyer. Then we kept publishing and improving them every week.',
    ],
    panel: 'What changed in four months',
    stats: [
      ['16&times;', 'Google clicks a week outside the famous-case pages', 'Jun to Oct 2026'],
      ['2.7&times;', 'case enquiries a week through the website', 'Aug to late Sep'],
      ['#1', 'of 12 Los Angeles employment firms in AI answers', '30 days to 27 Sep'],
    ],
    note: 'Measured in its own Search Console, Google Analytics and Peec AI.',
    href: 'https://www.loudface.co/case-studies/delshad-legal-content-engine',
  },
  saas: {
    subject: 'Genie Teacher: 106× the Google clicks a week',
    preheader: 'An online tutoring platform, from barely visible on Google to leads every week.',
    headline: 'Genie Teacher went from<br>barely visible to 106&times; the clicks.',
    chip: { icon: 'genie.png', name: 'Genie Teacher', what: 'online tutoring, Canada' },
    story: [
      "Before we started, it barely showed up on Google, and AI answers didn't name it at all.",
      'We redesigned and rebuilt the site, then wrote the pages that Google and AI answers now show. The first results came in within two months.',
    ],
    panel: 'What changed since we started',
    stats: [
      ['106&times;', 'Google clicks a week', 'Against the week we started'],
      ['5.8&times;', 'lead requests a week', 'First three weeks of Sep'],
      ['3.6&times;', 'lesson bookings a week', 'Same weeks'],
    ],
    note: 'Numbers from the published case study.',
    quote: 'kevin',
    href: 'https://www.loudface.co/case-studies/genie-teacher-organic-growth',
  },
  info: {
    subject: '$6,000 from one search lead in the first month',
    preheader: 'Hayes Media, an eCommerce growth agency, in its first month with us.',
    headline: 'One search lead,<br>$6,000 closed in month one.',
    chip: { icon: 'hayes.png', name: 'Hayes Media', what: 'eCommerce growth agency, US' },
    story: [
      'In September we started running its SEO and AI search.',
      'The first lead from search closed inside a month, for $6,000. A few weeks later, a brand doing $50M a year booked a sales call the same way.',
    ],
    panel: 'What changed in the first weeks',
    stats: [
      ['$6,000', 'closed from one search lead', 'In the first month'],
      ['5.4&times;', 'non-branded Google searches that show Hayes Media', '2-8 Sep to week of 20 Oct'],
      ['7.5&times;', 'non-branded searches where it ranks on page one', 'Same weeks'],
    ],
    note: 'Numbers from the published case study.',
    quote: 'jordan',
    href: 'https://www.loudface.co/case-studies/hayes-media-organic-leads',
  },
  site: {
    subject: 'How Toku became the name AI gives for stablecoin payroll',
    preheader: 'Named in 97.8% of AI answers on its category’s top question.',
    headline: 'How Toku became the name<br>AI gives for its category.',
    chip: { icon: 'toku.png', name: 'Toku', what: 'stablecoin payroll' },
    story: [
      'When a buyer asks ChatGPT or Perplexity how to pay a team in stablecoins, Toku is the name in the answer.',
      "We've been Toku's growth partner for 18 months. This year we ran its AI search program, and most of its B2B pipeline now comes from Google and the AI engines.",
    ],
    panel: 'Where Toku stands now',
    stats: [
      ['97.8%', 'AI visibility on its category’s top question', 'Peec AI, August 2026'],
      ['+800%', 'Google clicks to one of its guides', 'Feb to Apr 2026'],
    ],
    note: 'Numbers from the published case study.',
    quote: 'kenneth',
    href: 'https://www.loudface.co/case-studies/toku-ai-cited-pipeline',
  },
};

/** The three quotes in email 4: never the one the lead read in email 3. The first one leads. */
export function quotesFor(vertical: Vertical): Quote[] {
  const used = CASES[vertical].quote;
  return (['kevin', 'kenneth', 'jordan', 'sarig'] as const).filter((id) => id !== used).slice(0, 3).map((id) => QUOTES[id]);
}

const plain = (html: string) =>
  html.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/&times;/g, 'x').replace(/&middot;/g, '·').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&');

// ---------- the five emails ----------

export function email2(l: SequenceLead): RenderedEmail {
  const subject = `Who you're meeting on ${l.callDay}`;
  const preheader = `Arnel Bukva, founder of LoudFace, runs your call on ${l.callDay}.`;
  const c = chartFor(l.vertical);
  const day = esc(l.callDay);
  const p1 = `I started LoudFace in 2019, and I still run every first call myself. Before ${day} I'll look at ${esc(l.site)}, so our 30 minutes go to your numbers, not to introductions.`;
  const p2 = 'We design, write and build the pages Google ranks and AI answers like ChatGPT cite. One team does the strategy, the writing, the design and the build. Radisson Hotels Group, Montblanc, Hoxhunt and Toku work with us.';
  const p3 = "You booked the call to find out if we can grow the traffic your site gets from search. That's the whole agenda.";
  const close = `If there's one question you want answered on ${day}, reply with it. I'll come prepared.`;
  const panel = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${STAGE};"><tr><td class="stage" style="padding:36px 26px 30px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td class="stage-txt" style="padding:0 14px;">${text('We grow the traffic your site gets from Google and AI answers.', 30, 33, '#FFFFFF', 500, HEAD_F, 'letter-spacing:-0.9px;', 'h2')}</td></tr>
        <tr><td class="stage-txt" style="padding:12px 14px 0;">${text(c.intro, 15, 23, STAGE_TXT)}</td></tr>
        <tr><td class="stage-txt" style="padding:28px 14px 0;">${text(`Clicks <span style="color:${LAV};">&middot; ${c.client}</span>`, 13, 16, '#FFFFFF', 500)}</td></tr>
        <tr><td class="stage-txt" style="padding:6px 14px 10px;">${text(c.metric, 56, 56, '#FFFFFF', 500, HEAD_F, 'letter-spacing:-2.5px;')}</td></tr>
        <tr><td><img src="${IMG}${c.img}" width="548" alt="${esc(c.alt)}" style="display:block;border:0;width:100%;height:auto;"></td></tr>
        <tr><td class="stage-txt" style="padding:8px 14px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-family:${BODY_F};font-size:12px;line-height:16px;color:${LAV};">${c.from}</td>
          <td align="right" style="font-family:${BODY_F};font-size:12px;line-height:16px;color:${LAV};">${c.to}</td></tr></table></td></tr>
        <tr><td class="stage-txt" style="padding:10px 14px 0;">${text(c.caption, 12, 17, LAV)}</td></tr>
        <tr><td style="padding-top:22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;"><tr><td style="padding:20px 22px;">${statCells(c.others)}</td></tr></table></td></tr>
      </table></td></tr></table>`;
  const rows = [
    topbar(),
    row(`<img src="${IMG}arnel.jpg" width="72" height="72" alt="Arnel Bukva" style="display:block;border:0;border-radius:36px;">`),
    h1(`Hi ${esc(l.firstName)}, I'm Arnel.<br>We meet on ${day}.`),
    para(p1, '24px 52px 16px'),
    callCard(l, `${day} at ${esc(l.callTime)} ${esc(zone(l))}`, '30 minutes on Google Meet &middot; the invite is in your calendar'),
    para(p2),
    para(p3, '0 52px 36px'),
    `<tr><td>${panel}</td></tr>`,
    para(close, '32px 52px 0'),
    signature('Arnel Bukva &middot; Founder, LoudFace &middot; Dubai and US'),
    proofStrip(),
  ].join('\n');
  const text_ = [
    `Hi ${l.firstName}, I'm Arnel. We meet on ${l.callDay}.`,
    '',
    plain(p1),
    '',
    `Our call: ${l.callDay}, ${l.callDaynum} ${l.callMonth} at ${l.callTime} ${zone(l)}. 30 minutes on Google Meet, the invite is in your calendar.`,
    '',
    p2,
    '',
    p3,
    '',
    'We grow the traffic your site gets from Google and AI answers.',
    `${plain(c.intro)} ${c.client}: ${plain(c.metric)} the Google clicks a week, ${c.from} to ${c.to}.`,
    ...c.others.map(([n, what]) => `${plain(n)} ${what}`),
    '',
    plain(close),
    '',
    'Arnel',
    'Arnel Bukva · Founder, LoudFace · Dubai and US',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text: text_ };
}

export function email3(l: SequenceLead): RenderedEmail {
  const c = CASES[l.vertical];
  const day = esc(l.callDay);
  const intro = `Hi ${esc(l.firstName)}, before ${day}, here's one client's story from start to finish.`;
  const close = `On ${day} I'll show you the same view for ${esc(l.site)}: where it stands today and what I'd do first.`;
  const chip = row(`<table role="presentation" cellpadding="0" cellspacing="0" style="background:${TINT};border-radius:20px;"><tr>
      <td valign="middle" style="padding:6px 0 6px 6px;"><img src="${IMG}${c.chip.icon}" width="28" height="28" alt="" style="display:block;border:0;border-radius:14px;"></td>
      <td valign="middle" style="padding:6px 16px 6px 10px;font-family:${BODY_F};font-size:14px;line-height:18px;color:${INK};font-weight:500;">${c.chip.name} <span style="color:${MUTED};font-weight:400;">&middot; ${c.chip.what}</span></td></tr></table>`, '0 52px 20px');
  const rows = [
    topbar(),
    author(),
    h1(c.headline),
    para(intro, '20px 52px 20px'),
    chip,
    ...c.story.map((s, i) => para(s, i === c.story.length - 1 ? '0 52px 36px' : '0 52px 16px')),
    stage(`${text(c.panel, 24, 28, '#FFFFFF', 500, HEAD_F, 'letter-spacing:-0.5px;padding-bottom:22px;', 'h2')}
        ${statCells(c.stats, true)}
        ${text(c.note, 12, 17, LAV, 400, BODY_F, 'padding-top:22px;')}`),
    ...(c.quote ? [row('', '32px 52px 0'), quoteCard(QUOTES[c.quote])] : []),
    row(`<a href="${c.href}" style="font-family:${BODY_F};font-size:16px;line-height:22px;font-weight:500;color:${INDIGO};text-decoration:none;">Read the full case study &rarr;</a>`, c.quote ? '18px 52px 0' : '32px 52px 0'),
    para(close, '20px 52px 0'),
    signature(),
    proofStrip(),
  ].join('\n');
  const text_ = [
    plain(c.headline),
    '',
    plain(intro),
    '',
    `${c.chip.name}, ${c.chip.what}.`,
    '',
    ...c.story.flatMap((s) => [s, '']),
    c.panel.toUpperCase(),
    ...c.stats.map(([n, what, when]) => `${plain(n)} ${what}${when ? ` (${when})` : ''}`),
    c.note,
    '',
    ...(c.quote ? [`${plain(QUOTES[c.quote].body)} - ${plain(QUOTES[c.quote].name)}, ${plain(QUOTES[c.quote].role)}`, ''] : []),
    `The full case study: ${c.href}`,
    '',
    plain(close),
    '',
    'Arnel',
  ].join('\n');
  return { subject: c.subject, preheader: c.preheader, html: page(c.subject, c.preheader, rows), text: text_ };
}

export function email4(l: SequenceLead): RenderedEmail {
  const subject = 'What clients say about working with LoudFace';
  const preheader = 'Three clients on what it is like to work with us.';
  const [lead, ...rest] = quotesFor(l.vertical);
  const intro = `Hi ${esc(l.firstName)}, before we meet, here's what three clients said about working with us. Their words, not mine.`;
  const close = `See you on ${esc(l.callDay)} at ${esc(l.callTime)} ${esc(zone(l))}.`;
  const result = lead.result
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#2D2568;border-radius:12px;"><tr><td style="padding:12px 16px;">
        ${text(`<span style="font-family:${HEAD_F};font-size:22px;color:#FFFFFF;letter-spacing:-0.5px;">${lead.result[0]}</span>&nbsp;&nbsp;${lead.result[1]}`, 13, 22, STAGE_TXT)}</td></tr></table>`
    : '';
  const rows = [
    topbar(),
    author(),
    h1('What clients say about<br>working with us.'),
    para(intro, '20px 52px 36px'),
    stage(`${text(lead.body, 24, 32, '#FFFFFF', 500, HEAD_F, 'letter-spacing:-0.4px;', 'h2')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr>
          <td valign="middle" width="44" style="width:44px;">${face(lead, 44)}</td>
          <td valign="middle" style="padding-left:14px;">${text(lead.name, 15, 20, '#FFFFFF', 500)}${text(lead.role, 13, 18, LAV)}</td></tr></table>
        ${result}`, '40px 52px 36px'),
    row('', '32px 52px 0'),
    ...rest.map(quoteCard),
    para(close, '18px 52px 0'),
    signature(),
    proofStrip(),
  ].join('\n');
  const text_ = [
    'What clients say about working with us.',
    '',
    plain(intro),
    '',
    ...[lead, ...rest].flatMap((q) => [`${plain(q.body)} - ${plain(q.name)}, ${plain(q.role)}`, '']),
    plain(close),
    '',
    'Arnel',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text: text_ };
}

export function email5(l: SequenceLead): RenderedEmail {
  const subject = `Tomorrow at ${l.callTime}: your call with Arnel`;
  const preheader = `${l.callDate}, ${l.callTime} ${zone(l)}. Join link inside.`;
  const items = [
    `Where ${esc(l.site)} stands in Google and AI answers today`,
    "What I'd do first to grow your traffic",
    "Whether we're a fit. The report is yours either way.",
  ];
  const list = items
    .map((t, i) => `<tr><td style="border-top:1px solid ${LINE};${i === items.length - 1 ? `border-bottom:1px solid ${LINE};` : ''}padding:12px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td valign="top" width="8" style="width:8px;padding-top:8px;"><div style="width:8px;height:8px;border-radius:4px;background:${INDIGO};font-size:0;line-height:0;">&nbsp;</div></td>
          <td style="padding-left:14px;">${text(t, 16, 24)}</td></tr></table></td></tr>`)
    .join('');
  const intro = `Hi ${esc(l.firstName)}, a quick reminder. Here's when we meet, and what I'll go through with you.`;
  const rows = [
    topbar(),
    author(),
    h1(`We talk tomorrow<br>at ${esc(l.callTime)}.`, 44, 46),
    para(intro, '16px 52px 20px'),
    callCard(l, `${esc(l.callDay)} at ${esc(l.callTime)} ${esc(zone(l))}`, '30 minutes on Google Meet &middot; with Arnel Bukva'),
    joinButton(l, true),
    row(`${text("What we'll cover", 15, 18, INK, 500, BODY_F, 'padding-bottom:14px;')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${list}</table>`, '32px 52px 0'),
    row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${STAGE};border-radius:16px;"><tr><td style="padding:24px 24px 22px;">
        ${text("What we've done for clients like you", 22, 26, '#FFFFFF', 500, HEAD_F, 'letter-spacing:-0.4px;padding-bottom:18px;')}
        ${statCells([['16&times;', 'Delshad Legal, Google clicks a week'], ['106&times;', 'Genie Teacher, Google clicks a week'], ['$6,000', 'Hayes Media, from one search lead']], true)}
      </td></tr></table>`, '32px 52px 0'),
    para('Can you still make it? Reply "yes" and you\'re all set.', '28px 52px 0'),
    signature(),
    proofStrip(),
  ].join('\n');
  const text_ = [
    `We talk tomorrow at ${l.callTime}.`,
    '',
    plain(intro),
    '',
    `${l.callDate} at ${l.callTime} ${zone(l)}. 30 minutes on Google Meet, with Arnel Bukva.`,
    `Join the call: ${l.joinUrl}`,
    `Pick a new time: ${l.rescheduleUrl}`,
    '',
    "WHAT WE'LL COVER",
    ...items.map((t) => `- ${plain(t)}`),
    '',
    'Can you still make it? Reply "yes" and you\'re all set.',
    '',
    'Arnel',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text: text_ };
}

export function email6(l: SequenceLead): RenderedEmail {
  const subject = 'We start in 1 hour';
  const preheader = `${l.callTime} ${zone(l)}. Here's the link.`;
  const intro = `Hi ${esc(l.firstName)}, here's the link for our call. If you can, have your website and Google Search Console open.`;
  const rows = [
    topbar(),
    author(),
    h1('We start in<br>one hour.', 44, 46),
    para(intro, '16px 52px 20px'),
    callCard(l, `Today at ${esc(l.callTime)} ${esc(zone(l))}`, '30 minutes on Google Meet &middot; with Arnel Bukva'),
    joinButton(l, false),
    para('See you soon.', '28px 52px 0'),
    signature(),
    proofStrip(),
  ].join('\n');
  const text_ = [
    'We start in one hour.',
    '',
    plain(intro),
    '',
    `Join the call at ${l.callTime} ${zone(l)}: ${l.joinUrl}`,
    '',
    'See you soon.',
    '',
    'Arnel',
  ].join('\n');
  return { subject, preheader, html: page(subject, preheader, rows), text: text_ };
}

export const SEQUENCE_EMAILS = { 2: email2, 3: email3, 4: email4, 5: email5, 6: email6 } as const;
export type SequenceEmailNumber = keyof typeof SEQUENCE_EMAILS;
