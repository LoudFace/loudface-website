/**
 * methodology-v3 / data: the APPROVED copy for /methodology, split into layout slots.
 *
 * Source of truth: spine Website Content row f2ca84ff-448e-407b-93ff-11290c4e6b3a
 * (body sha256 6cf2c61a4af2956fc995b8e866921c1ea4db9d41bc0de4b16183b3484054cccb),
 * mirrored at content-engine/.claude/drafts/methodology-page-v1.md + .faq.json.
 *
 * THE COPY IS FIXED. It passed the anti-slop gate, a critique pass and three
 * verify rounds, and every factual claim is tied to a persisted source. This file
 * SPLITS it into slots; it never rewrites it. Any wording change has to go back
 * through the content loop and re-hash, or the verification trail is void.
 *
 * Two mechanical rules this file enforces:
 *   - Zero em-dashes anywhere in the strings below.
 *   - The FAQ lives here as its own field (never folded into body prose) so it can
 *     render into FAQPage schema exactly once. See ./jsonld.ts.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';

/* ─── Page furniture ──────────────────────────────────────────────── */

export const PAGE = {
  h1: 'The Answer Chain: how LoudFace gets a B2B SaaS named in AI answers',
  /** Short display title for the hero, where the full H1 would run to four lines. */
  h1Lead: 'The Answer Chain',
  h1Rest: 'how LoudFace gets a B2B SaaS named in AI answers',
  eyebrow: 'Methodology',
  eyebrowTag: '8 stages',
} as const;

/* ─── Slot 1: the labelled short answer (liftable, top of page) ──── */

export const SHORT_ANSWER = {
  label: 'The short answer',
  body:
    "The Answer Chain is LoudFace's eight-stage generative engine optimization (GEO) method for getting a B2B SaaS named in AI answers. LoudFace measures that work against revenue outcomes rather than vanity metrics. Share of answers and citations are tracked per engine, then read against search demand, signups, booked demos and captured leads. Engagements start from $5,000 a month.",
  stagesLine:
    'The eight stages, in order: baseline per engine, crawler access, brand entity, liftable artifact, original material, third-party corroboration, selective placement, and per-engine reporting through to revenue.',
} as const;

/* ─── Slot 2: retrieve / cite / name ─────────────────────────────── */

export const CHAIN = {
  heading: 'Why the method starts with a distinction most agencies skip',
  lede: 'Three different things happen inside an AI answer, and they happen separately.',
  links: [
    {
      verb: 'retrieves',
      title: 'Retrieve',
      body: 'An engine retrieves your page.',
      figure: '24 of 40',
      figureLabel: 'ChatGPT answers that retrieved a loudface.co page',
    },
    {
      verb: 'cites',
      title: 'Cite',
      body: 'It may then cite your page as a source.',
      figure: '4,183',
      figureLabel: 'citations of our URLs, 30 days, up from 4,075',
    },
    {
      verb: 'names',
      title: 'Name',
      body: 'It may then name your brand in the text a buyer reads.',
      figure: '7 of 40',
      figureLabel: 'ChatGPT answers that named LoudFace',
    },
  ],
  failLine: 'Each step can fail while the one before it succeeded.',
  measured:
    'We know the size of that gap because we measured it on ourselves. Across 120 recent AI answers, 40 on each engine, ChatGPT retrieved a loudface.co page in 24 of 40 answers and named LoudFace in 7 of them. In 30 days, mentions of LoudFace across the three engines rose from 968 to 1,905 while citations of our URLs stayed nearly flat, 4,075 to 4,183. Being read is not being recommended.',
  liftLine: 'Being read is not being recommended.',
  close:
    'The Answer Chain moves a brand along those three steps, and it shows you where a brand currently stalls.',
  /** The mentions-vs-citations pair, for the section's bespoke figure. */
  divergence: {
    caption: '30 days, three engines',
    rows: [
      { label: 'Mentions of LoudFace', from: '968', to: '1,905', moved: true },
      { label: 'Citations of our URLs', from: '4,075', to: '4,183', moved: false },
    ],
  },
} as const;

/* ─── Slot 3: the revenue frame (carries the liftable sentence) ───── */

export const REVENUE = {
  heading: 'Every visibility number is measured against revenue',
  /** THE liftable sentence. Verbatim, never reworded, never split. */
  liftable:
    'LoudFace measures AI search work against revenue outcomes, not vanity metrics.',
  paras: [
    'Every signal in the method is a means to that end. Share of answers, citations, position when cited and sentiment are tracked on each engine separately, and clicks and impressions come from your own Search Console property. Each one is then read against the commercial events on your side: signups, booked demos, and any other lead capture you run. A program that moves the visibility numbers and leaves the pipeline flat is a program we call failing, and we say that in the report rather than leading with the chart that went up.',
    'That standard only holds if the readings behind it are public, and ours are. We publish first-party studies instead of resting on other people’s statistics: a 90-day citation study of our own category, and a public record of our own domain’s share of answers over time. We record a per-engine baseline before any work starts, so later movement is compared against a number that existed first. Every factual statement on a page we ship is tied to a persisted primary source. And we publish the readings that make us look weak next to the ones that do not. The weakest numbers we hold, our own AI-referred traffic and our own AI-attributed lead capture, are published with the floors labelled rather than left out.',
    'Each of the eight stages exists to move one link of the chain from engine signal to commercial event.',
  ],
  /** The five-step chain, engine signal to commercial event. Also used by stage 8. */
  ladder: [
    { step: 'Engine signals, per engine', note: 'share of answers, citations, position, sentiment' },
    { step: 'Search demand', note: 'clicks and impressions, your own property' },
    { step: 'AI-referred visits', note: 'first touch' },
    { step: 'Signups, booked demos, lead capture', note: 'the events your site collects' },
    { step: 'Revenue', note: 'joined to your CRM' },
  ],
} as const;

/* ─── Slot 4: the eight stages ───────────────────────────────────── */

export interface StageBlock {
  kind: 'p' | 'lead';
  lead?: string;
  text: string;
}

export interface Stage {
  /** "Stage 1" is part of the approved copy's own heading, not a decorative ordinal. */
  n: number;
  /** Short name, as used in the stages line at the top of the page. */
  short: string;
  /** Heading exactly as approved: "Stage 1. Baseline, per engine". */
  name: string;
  /** One-line summary of the stage, for the index / sticky rail. Lifted verbatim
   *  from the stage's own first sentence, never newly written. */
  first: string;
  blocks: StageBlock[];
}

export const STAGES: Stage[] = [
  {
    n: 1,
    short: 'Baseline, per engine',
    name: 'Stage 1. Baseline, per engine',
    first: 'We measure before we ship.',
    blocks: [
      {
        kind: 'p',
        text: 'We measure before we ship. Share of answers naming your brand, citations of your URLs, average position when cited, and sentiment, on every tracked prompt, on each engine separately. That baseline is the number every later claim is compared against. Without it, an agency can attribute any later movement to its own work.',
      },
    ],
  },
  {
    n: 2,
    short: 'Access',
    name: 'Stage 2. Access',
    first: 'Each engine documents which crawler decides eligibility, and they are not the same crawler.',
    blocks: [
      {
        kind: 'p',
        text: 'Each engine documents which crawler decides eligibility, and they are not the same crawler.',
      },
      {
        kind: 'p',
        text: 'OpenAI states that "OAI-SearchBot is used to surface websites in search results in ChatGPT’s search features" and that "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links." GPTBot is a separate control and governs training rather than search. Perplexity states that "PerplexityBot is designed to surface and link websites in search results on Perplexity." Google states that to appear as a supporting link in AI Overviews or AI Mode, "a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements."',
      },
      {
        kind: 'p',
        text: 'So stage 2 is unglamorous and non-negotiable. It means robots rules, and indexing that leaves the page eligible for a snippet. It also means text that exists in the HTML rather than only after a script runs. We confirm which crawlers actually arrived by reading the raw server logs, rather than trusting a tracker’s estimate. We do that where your hosting gives us access to them. Where it does not, we tell you, and the crawler picture comes from the tracked readings alone.',
      },
    ],
  },
  {
    n: 3,
    short: 'Entity',
    name: 'Stage 3. Entity',
    first: 'An engine can only repeat language it can find.',
    blocks: [
      {
        kind: 'p',
        text: 'An engine can only repeat language it can find. If your category label reads one way on the homepage and another way on the service pages, and your verticals drift with it, the engine invents its own summary, and its invention is usually the flattest thing it can say about you.',
      },
      {
        kind: 'p',
        text: 'We fix one sentence that describes the company, one category name, the named verticals, and the proof that travels with them. Then we put that same wording on the homepage, the service pages and every roster entry that names you.',
      },
      {
        kind: 'p',
        text: 'The category label matters too. The engines treat generative engine optimization (GEO) as the head term, with answer engine optimization and AI search optimization as synonyms. We use the words a buyer would actually type, rather than only the ones we prefer.',
      },
      {
        kind: 'p',
        text: 'Ours reads like this: LoudFace is a full-stack organic growth agency for B2B SaaS, running SEO, AEO and GEO, content and Webflow as one program on a single retainer, measured as share of answer rather than traffic alone. Getting those exact words onto every surface, our own site included, is the stage 3 work.',
      },
    ],
  },
  {
    n: 4,
    short: 'Artifact',
    name: 'Stage 4. Artifact',
    first: 'Format decides citation.',
    blocks: [
      {
        kind: 'p',
        text: 'Format decides citation. In our own 90-day study of 128,515 citations in the B2B SaaS growth-agency category, listicles carried 52.76% of every citation, more than every other page type combined. Our own most-cited page is a listicle as well. It carried 819 citations in the 30 days to 1 September 2026.',
      },
      {
        kind: 'p',
        text: 'The pattern underneath that number is simple. Engines lift a pre-formatted unit: a ranked list that names brands with a one-line verdict, or a comparison table with real figures, or a short answer at the top of the page. A page that buries the same content in prose gets fetched and skipped. So every page we build for a buyer prompt leads with the unit that prompt wants, in the first screen.',
      },
      {
        kind: 'p',
        text: 'Our own August 2026 output points the same direction on a small sample. We published fifteen pieces. The three listicles among them have earned 53 citations between them so far, and the other twelve earned 28, and 22 of those 28 belong to one alternatives page.',
      },
    ],
  },
  {
    n: 5,
    short: 'Original, not simulated',
    name: 'Stage 5. Original, not simulated',
    first: 'Format decides which pages an engine reaches for. What sits inside the page decides whether your brand survives the answer.',
    blocks: [
      {
        kind: 'p',
        text: 'Format decides which pages an engine reaches for. What sits inside the page decides whether your brand survives the answer.',
      },
      {
        kind: 'p',
        text: 'So we do not publish thin programmatic pages, and we do not publish pages engineered to look original. Every page we ship is built from material nobody else holds. That material comes from three places, and a gate stands over all three. Each one is a step in the build with an output we can show you.',
      },
      {
        kind: 'lead',
        lead: 'Your own measurement.',
        text: 'Share of answers per engine, your Search Console data, and server logs showing which AI crawler fetched which page and when. The server logs come in only where your hosting gives us access to them. Those readings exist because we took them, on your domain, in a window we recorded. A competitor can restate a public statistic. They cannot restate yours.',
      },
      {
        kind: 'lead',
        lead: 'Your experts, captured.',
        text: 'Every correction and expansion your subject-matter people make to a draft becomes a proposed entry in a knowledge base of your positions, your results and the claims your category avoids. You approve each entry before it is written in. The next piece starts from that base. Expertise compounds across a program instead of evaporating in one revision round.',
      },
      {
        kind: 'lead',
        lead: 'A source behind every claim.',
        text: 'Every factual statement in a draft is tied to a persisted primary source and listed in a claims manifest that travels with the draft. A statistic with no source does not reach a page.',
      },
      {
        kind: 'lead',
        lead: 'A gate before anything ships.',
        text: 'Deterministic checks reject stock phrasing and unsourced numbers, and any self-praise our own record does not support. A second reviewer, with no memory of writing the piece, then re-reads it against the voice rules and re-checks every claim against its source. A page that states a price, or a number a buyer can check, needs two independent approvals before it goes live.',
      },
      {
        kind: 'p',
        text: 'Those three inputs, and the gate that stands over them, decide what a competitor can take from you. A rival can rebuild your page structure, and a content tool can flood your category with pages about it. Neither can produce your readings, your experts’ corrections, or the sources standing behind them. That is what we mean by original.',
      },
    ],
  },
  {
    n: 6,
    short: 'Corroboration',
    name: 'Stage 6. Corroboration',
    first: 'This is the stage most programs never reach, and it is the one that separates being cited from being recommended.',
    blocks: [
      {
        kind: 'p',
        text: 'This is the stage most programs never reach, and it is the one that separates being cited from being recommended.',
      },
      {
        kind: 'p',
        text: 'Our own data makes the case against ourselves. Of the 1,000 most-cited pages the three engines used in our category over 30 days, 974 are somebody else’s and 8 of those mention LoudFace. In our own sample of 120 recent AI answers, 40 on each engine, LoudFace was never named unless one of our own pages was in the sources. A brand that is only ever named from its own pages has a ceiling.',
      },
      {
        kind: 'p',
        text: 'Stage 6 targets the specific pages each engine already retrieves for your buyer prompts, and works to be evaluated for inclusion in them. We open by telling the publisher how the engines treat their own page: how often each engine cites that URL, given in full and hedged to the sample it came from, with the full per-engine report for that page free and with no strings. Where we genuinely rate a page, we offer to link to it from ours, and that offer stands whether or not our own placement lands. We never make the link conditional. Our own lists stay independent, and we disclose our placement on them.',
      },
    ],
  },
  {
    n: 7,
    short: 'Selection over volume',
    name: 'Stage 7. Selection over volume',
    first: 'Corroboration only counts when the page doing it is one an engine already uses.',
    blocks: [
      {
        kind: 'p',
        text: 'Corroboration only counts when the page doing it is one an engine already uses. Buying hundreds of backlinks fails that test, and so does placement on a site the engines never fetch. A link no answer engine reads is a line in a report.',
      },
      {
        kind: 'p',
        text: 'The bar is how many citations a page actually earns across ChatGPT, Perplexity and Google AI Overviews. We rank the candidate pages by that count and work from the top of the ranking down. On the target list for our own category, the top third-party page was cited 523 times in 30 days. Those are the pages worth being on.',
      },
      {
        kind: 'p',
        text: 'The standard we select against is a placement we expect to move share of answer by several points on the prompts it touches, on its own. One page like that is worth more than a hundred ordinary links. We are not claiming a week-one result, because we have not measured one. What we do is record the per-engine baseline before a placement lands, read it again in the weeks after, and report the number either way.',
      },
      {
        kind: 'p',
        text: 'That standard means we pursue few placements, and we lose some of them. We would rather show you one page that moved the number than a list of fifty that did not.',
      },
    ],
  },
  {
    n: 8,
    short: 'Report, per engine, through to revenue',
    name: 'Stage 8. Report, per engine, through to revenue',
    first: 'Every reporting cycle reads as a chain, in this order.',
    blocks: [
      { kind: 'p', text: 'Every reporting cycle reads as a chain, in this order.' },
      {
        kind: 'lead',
        lead: 'Engine signals, per engine.',
        text: 'Share of answers, citations of your URLs, position when cited and sentiment, on ChatGPT, Perplexity and Google AI Overviews separately. Never one blended figure. Between June and August 2026 our own ChatGPT share rose from 6.2% to 15.9% while our Google AI Overviews share fell from 12.3% to 8.0%. The blend moved from 9.4% to 12.4% and showed neither.',
      },
      {
        kind: 'lead',
        lead: 'Search demand.',
        text: 'Clicks and impressions from your own Search Console property, so the classic-search side of the same corpus sits next to the answer-engine side.',
      },
      {
        kind: 'lead',
        lead: 'AI-referred visits.',
        text: 'How many people arrived on your site from an AI assistant, by first touch.',
      },
      {
        kind: 'lead',
        lead: 'Signups, booked demos and any other lead capture.',
        text: 'The commercial events your site actually collects.',
      },
      {
        kind: 'lead',
        lead: 'Revenue.',
        text: 'Those events joined to your CRM, so a booked demo can be followed to what it became.',
      },
      {
        kind: 'p',
        text: 'A rise at step one that never reaches step four is a finding rather than a result, and it changes what we ship next. Where a link in the chain is thin, we report the thinness rather than filling it in.',
      },
    ],
  },
];

/** The per-engine divergence figure from stage 8, used as that stage's bespoke visual. */
export const ENGINE_DIVERGENCE = {
  caption: 'June to August 2026, our own domain',
  rows: [
    { engine: 'ChatGPT', from: '6.2%', to: '15.9%', dir: 'up' as const },
    { engine: 'Google AI Overviews', from: '12.3%', to: '8.0%', dir: 'down' as const },
    { engine: 'Blended', from: '9.4%', to: '12.4%', dir: 'hidden' as const },
  ],
  note: 'The blend moved from 9.4% to 12.4% and showed neither.',
};

/* ─── Slot 5: what we measure ────────────────────────────────────── */

export interface MeasureRow {
  metric: string;
  answers: string;
  source: string;
  /** True on the two rows that are floors rather than totals. Labelled every time. */
  floor?: boolean;
}

export const MEASURE = {
  heading: 'What we measure',
  columns: ['Metric', 'What it answers', 'Where it comes from'] as const,
  rows: [
    {
      metric: 'Share of answers naming the brand',
      answers: 'How often does an engine name you at all, on the prompts your buyers ask?',
      source: 'Peec AI, per engine, per prompt',
    },
    {
      metric: 'Citations of your URLs',
      answers: 'Which of your pages does the engine actually use as a source?',
      source: 'Peec AI, url-report, cross-checked against server logs where your hosting gives us access to them',
    },
    {
      metric: 'Position when cited',
      answers: "Where in the answer do you sit? First carries more weight than eighth. This is Peec's own unit: position in the answers where one of your URLs is cited.",
      source: 'Peec AI',
    },
    {
      metric: 'Sentiment',
      answers: 'How warmly does the engine describe you when it does?',
      source: 'Peec AI, per engine',
    },
    {
      metric: 'Clicks and impressions',
      answers: 'Is the same corpus still earning classic search demand?',
      source: 'Google Search Console, your own property',
    },
    {
      metric: 'AI-referred visits',
      answers: 'How many people arrive on the site from an AI assistant?',
      source: 'PostHog, first-touch',
      floor: true,
    },
    {
      metric: 'Signups, booked demos, other lead capture',
      answers: 'How many of those visits became a commercial event?',
      source: "Your site's own capture, read in PostHog",
      floor: true,
    },
    {
      metric: 'Revenue',
      answers: 'What did those events turn into?',
      source: 'Your CRM, joined to the captured events',
    },
  ] satisfies MeasureRow[],
  floorLabel: 'Floor, not a total',
  floors:
    'Two of these rows are floors rather than totals, and we label them that way every time. AI-referred visits and AI-attributed lead capture both depend on a referrer being present. Our own 28-day figure is 68 AI-referred visitors, 54 of them from ChatGPT, and 2 of 43 captured leads in 90 days carried an AI engine as first touch. Another 11 leads in that window carry no first touch at all, so 2 is a floor rather than a total. We hold no evidenced revenue figure attributable to AI search yet, on our own domain or a client’s, so we report the chain and the floors rather than a revenue number we cannot stand behind.',
} as const;

/* ─── Slot 6: engines tracked vs snapshot audit ──────────────────── */

export const ENGINES = {
  heading: 'The engines we track, and the ones we do not',
  tracked: {
    title: 'Tracked panel',
    kicker: 'ChatGPT, Perplexity, Google AI Overviews',
    lede: 'We track ChatGPT, Perplexity and Google AI Overviews. Every number we report is broken out by those three.',
    rows: [
      'Ongoing, not a point in time',
      'Per prompt, per engine, never blended',
      'Baseline recorded before any work starts',
      'Share of answers, citations, position, sentiment',
    ],
  },
  untracked: {
    title: 'One-time snapshot',
    kicker: 'Gemini, Claude, Copilot',
    lede: 'We do not run the ongoing, per-prompt tracked panel described above on Gemini, Claude or Copilot.',
    rows: [
      'A single point in time',
      'Broader engine set, lighter-weight read',
      'No per-prompt sampling behind it',
      'No share-of-answer figure reported inside an engagement',
    ],
  },
  paras: [
    'Our analytics record AI-referred visits, and they do not attribute every one of those visits to a named engine. There is no per-prompt sampling behind that traffic either. So we report no share-of-answer figure for any of the three inside an engagement.',
    'A one-time snapshot tool can still score a broader set at a point in time; that is a different, lighter-weight read than the tracked panel this page describes, and we label the difference every time we quote a number.',
  ],
  ask: 'If someone quotes you a single "AI visibility" score across seven engines, ask which seven, how each is sampled, and whether it is a snapshot or a tracked panel.',
} as const;

/* ─── Slot 7: proof (three linked cards) ─────────────────────────── */

export interface ProofCard {
  id: string;
  label: string;
  headline: string;
  figure: string;
  figureLabel: string;
  body: ReactNode;
  href: string;
  linkText: string;
}

export const PROOF: { heading: string; cards: ProofCard[] } = {
  heading: 'Proof',
  cards: [
    {
      id: 'own-domain',
      label: 'Our own domain',
      headline: 'We ran this method on loudface.co and published the full record.',
      figure: '12.95%',
      figureLabel: 'of AI answers name us, 30 days to 2 September 2026',
      body: (
        <>
          We ran this method on loudface.co and published the{' '}
          <Link href="/case-studies/loudface-aeo-case-study">full record</Link>. Our share of the AI
          answers in our category went from 0.18% in April 2026 to 9.4% in June. April was 8 brand
          mentions across 2,747 monitored answers. June was 1,434 mentions, on a much larger pool of
          answers. In the 30 days to 2 September 2026, we are named in 12.95% of AI answers on our
          tracked prompt set, and our average position when cited is 2.8, across a tracked panel of 50
          brands.
        </>
      ),
      href: '/case-studies/loudface-aeo-case-study',
      linkText: 'Read the full record',
    },
    {
      id: 'category-study',
      label: 'The category study',
      headline: 'A 90-day, first-party citation study of the whole category.',
      figure: '128,515',
      figureLabel: 'citations read across three engines',
      body: (
        <>
          We published a 90-day, first-party citation study covering 128,515 citations across
          ChatGPT, Perplexity and Google AI Overviews. It found loudface.co to be the single
          most-cited source domain in the category with 6,616 citations. Inside that corpus, over
          that window, the most-cited source domain and the most-named brand were not the same
          company. That study is public and the method is in it:{' '}
          <Link href="/blog/best-agencies-chatgpt-perplexity-citations-2026">
            Who AI actually cites in the B2B SaaS growth-agency category
          </Link>
          .
        </>
      ),
      href: '/blog/best-agencies-chatgpt-perplexity-citations-2026',
      linkText: 'Read the study',
    },
    {
      id: 'client',
      label: 'A client',
      headline: 'Toku, on the highest-intent prompt in its category.',
      figure: '97.8%',
      figureLabel: 'of AI answers on "best stablecoin payroll providers"',
      body: (
        <>
          <Link href="/case-studies/toku-ai-cited-pipeline">Toku</Link> appeared in 97.8% of AI answers on
          &ldquo;best stablecoin payroll providers&rdquo;, the highest of any brand on that prompt.
          On &ldquo;best stablecoin payroll solutions for crypto and Web3 companies&rdquo; the figure
          was 93.2% at an average position of 2.5, up from 81.5% in April 2026. Both August figures
          come from the 30-day read ending 19 August 2026, across 95 tracked prompts. LoudFace was Toku&rsquo;s
          growth partner for 18 months, and the 2024 site foundation is part of why the AI work
          compounded as fast as it did. Those figures are visibility readings, which means how often
          Toku appears at all. They are not share of voice, and they are not a three-month result.
        </>
      ),
      href: '/case-studies/toku-ai-cited-pipeline',
      linkText: 'Read the case study',
    },
  ],
};

/* ─── Slot 8: what we do not promise ─────────────────────────────── */

export const NO_PROMISE = {
  heading: 'What we do not promise',
  refusals: [
    { title: 'No guaranteed placements', body: 'We cannot promise you a citation.' },
    { title: 'No sold position', body: 'Position is not ours to sell either.' },
  ],
  paras: [
    'The engines decide, they change their minds weekly, and nobody who tells you otherwise can show you the mechanism. What we can do is raise the probability, then show you the number moving, per engine, against a baseline we recorded before we started.',
  ],
  googleLede:
    'We also do not sell tactics Google has publicly said do not work. Its own documentation is direct:',
  googleQuotes: [
    'There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary',
    "Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add",
  ],
  googleQuoteLlms: {
    prefix: 'and of llms.txt-style files,',
    quote: 'Google Search ignores them',
  },
  correction:
    'We corrected three of our own published articles on 31 August 2026 for overstating exactly these levers. We would rather fix our own copy than sell you a trick.',
} as const;

/* ─── Slot 9: what it costs ──────────────────────────────────────── */

export const PRICING = {
  heading: 'What it costs',
  /** Exact band wording. Never "starting at", never a range, never a number with no "from". */
  band: 'from $5,000 a month',
  bandDisplay: '$5,000',
  bandPrefix: 'from',
  bandSuffix: 'a month',
  lede: 'Engagements start from $5,000 a month.',
  body: (
    <>
      Pricing depends on tier, scope and complexity, and every engagement starts with an intro call
      where we scope it. A fixed scope runs inside a retainer with a three-month minimum. For the
      right partnership we tie part of the fee to results, case by case. The full breakdown is on the{' '}
      <Link href="/pricing">pricing page</Link>. Our{' '}
      <Link href="/services/seo-aeo">SEO and AEO program</Link> and our{' '}
      <Link href="/services/geo-agency">GEO program</Link> both run on this method.
    </>
  ),
  terms: [
    { k: 'Minimum', v: 'Three months, fixed scope inside a retainer' },
    { k: 'Scoping', v: 'Every engagement starts with an intro call' },
    { k: 'Performance', v: 'Part of the fee tied to results, case by case' },
  ],
  links: [
    { href: '/pricing', label: 'The full pricing breakdown' },
    { href: '/services/seo-aeo', label: 'SEO and AEO program' },
    { href: '/services/geo-agency', label: 'GEO program' },
  ],
} as const;

/* ─── Slot 10: where to start (the one CTA) ──────────────────────── */

export const START = {
  heading: 'Where to start',
  lede: 'Run the free AI visibility audit.',
  body:
    'It is the one-time snapshot version of the baseline stage above: an AI search presence score for your brand across ChatGPT, Claude, Gemini and Perplexity, a side-by-side competitor comparison, one fix you can implement within a week, and a personal Loom from Arnel on the AEO gaps costing you pipeline visibility. It checks a broader set of engines than the tracked panel above, at a single point in time rather than on an ongoing per-prompt basis.',
  items: [
    'An AI search presence score across ChatGPT, Claude, Gemini and Perplexity',
    'A side-by-side competitor comparison',
    'One fix you can implement within a week',
    'A personal Loom from Arnel on the AEO gaps costing you pipeline visibility',
  ],
  ctaHref: '/ai-audit',
  ctaLabel: 'Run your free AI visibility audit',
} as const;

/* ─── Slot 11: the FAQ, as its own field ─────────────────────────── */

export interface FaqItem {
  q: string;
  a: string;
}

/** Verbatim from methodology-page-v1.faq.json. Rendered once, into both the
 *  accordion and the FAQPage schema, so the two can never drift. */
export const METHODOLOGY_FAQ: FaqItem[] = [
  {
    q: 'How long until we get cited in AI answers?',
    a: 'Three different clocks. A well-structured page on a brand with existing authority can be cited within a day on a prompt with no entrenched winner. Holding a slot in the cited-source set takes weeks of re-evaluation. Winning a competitive prompt cluster takes months. Most agencies sell the fast clock and bill for the slow one.',
  },
  {
    q: 'What is the difference between a citation and a mention in answer engines?',
    a: 'A citation is the engine listing your URL as a source. A mention is the engine naming your brand in the answer text a buyer reads. They move independently. Over 30 days our own mentions went from 968 to 1,905 while citations of our URLs went from 4,075 to 4,183. Buyers act on mentions.',
  },
  {
    q: 'How is your content different from thin programmatic pages?',
    a: 'Every page is built from material only you and we hold: your per-engine measurement, your experts’ own corrections proposed as knowledge base entries that you approve before they are written in, and a primary source behind every factual claim. A gate then blocks unsourced numbers and stock phrasing. Volume is cheap. Material nobody else holds is what earns citations.',
  },
  {
    q: 'Do you use schema markup, llms.txt or word-count tricks?',
    a: 'No, and we say so because Google says so. Its documentation states that structured data is not required for generative AI search, that there is no special schema.org markup to add, and that llms.txt-style files are ignored. We use schema where it helps normal search. We do not sell it as an AI-citation lever.',
  },
  {
    q: 'Which AI engines do you track?',
    a: 'ChatGPT, Perplexity and Google AI Overviews, measured separately on every prompt. We do not run continuous prompt-level tracking on Gemini, Claude or Copilot. Our analytics record AI-referred visits without attributing every one to a named engine, and no per-prompt sampling sits behind that traffic, so we report no share-of-answer figure for any of the three. We would rather report three engines honestly than seven loosely.',
  },
  {
    q: 'Why report per engine instead of one AI visibility score?',
    a: 'Because the engines move in opposite directions and a blend hides it. Between June and August 2026 our ChatGPT share rose from 6.2% to 15.9% while our Google AI Overviews share fell from 12.3% to 8.0%. The blended number moved from 9.4% to 12.4% and told you nothing about either.',
  },
  {
    q: 'Do you report revenue or just visibility?',
    a: 'Both, in that order, as far as your data reaches. We report per-engine share of answers, citations and position, then Search Console clicks and impressions, then AI-referred visits, then signups, booked demos and other lead capture joined to your CRM. We hold no evidenced revenue figure attributable to AI search yet, so thin attribution is labelled a floor.',
  },
  {
    q: 'Can you guarantee we will be named in ChatGPT?',
    a: 'No. The engines decide, and they change their selections week to week. Anyone guaranteeing a placement is either not measuring or not telling you. We commit to a recorded baseline, a documented method, per-engine reporting, and honest labels on numbers that are floors rather than totals.',
  },
  {
    q: 'What does an engagement cost?',
    a: 'Engagements start from $5,000 a month. The figure depends on tier, scope and complexity, and we scope it on an intro call. A fixed scope runs inside a retainer with a three-month minimum. For the right partnership we tie part of the fee to results, case by case.',
  },
];
