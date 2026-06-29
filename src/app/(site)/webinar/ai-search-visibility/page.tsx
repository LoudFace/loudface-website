import type { Metadata } from 'next';
import { SectionContainer, SectionHeader, Button, Card } from '@/components/ui';
import { asset } from '@/lib/assets';

const RIVERSIDE_REGISTRATION_URL =
  'https://riverside.com/webinar/registration/eyJldmVudElkIjoiNmE0Mjk3NTkxYjZiYzMyYWRkOTZkZjg1Iiwic2x1ZyI6ImNoYW5kYW5hcy1zdHVkaW8tMXByZ1gifQ==';

export const metadata: Metadata = {
  title: 'Why Your Website Is Invisible in AI Search — Live Masterclass | LoudFace',
  description:
    'A 50-minute live breakdown of the exact content architecture, on-page changes, and platform decisions that took Toku from 0 to 86% AI visibility. Thursday, July 9 · 11:00 AM ET.',
  alternates: {
    canonical: '/webinar/ai-search-visibility',
  },
  openGraph: {
    title: 'Why Your Website Is Invisible in AI Search — Live Masterclass',
    description:
      'See the exact strategy that took Toku from 0 to 86% AI visibility on its core buyer search prompt. Live + Q&A · July 9, 11:00 AM ET.',
    type: 'website',
    url: '/webinar/ai-search-visibility',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: ['https://www.loudface.co/opengraph-image'],
  },
};

const EVENT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Why Your Website Is Invisible in AI Search — and How to Fix It',
  description:
    'A 50-minute live masterclass with LoudFace founder Arnel Bukva and Natalie Sangkagalo, Head of Marketing at Toku — covering the exact strategy that took Toku from 0 to 86% AI visibility.',
  // July 9, 2026 is EDT (UTC-4) — must match the calendar link (15:00 UTC).
  startDate: '2026-07-09T11:00:00-04:00',
  endDate: '2026-07-09T12:00:00-04:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  // Required by Google for online events.
  location: {
    '@type': 'VirtualLocation',
    url: 'https://loudface.co/webinar/ai-search-visibility',
  },
  image: ['https://www.loudface.co/images/speakers/arnel-bukva.jpg'],
  performer: [
    { '@type': 'Person', name: 'Arnel Bukva' },
    { '@type': 'Person', name: 'Natalie Sangkagalo' },
  ],
  organizer: {
    '@type': 'Organization',
    name: 'LoudFace',
    url: 'https://loudface.co',
  },
};

const SPEAKERS = [
  {
    name: 'Arnel Bukva',
    title: 'Founder, LoudFace',
    image: '/images/speakers/arnel-bukva.jpg',
    bio: 'Founder of LoudFace, a Webflow Premium Partner agency specialising in SEO, AEO, and CRO for B2B SaaS. Led the strategy that took Toku from 0 to 86% AI visibility on its core buyer search prompt.',
  },
  {
    name: 'Natalie Sangkagalo',
    title: 'Head of Marketing, Toku',
    image: '/images/speakers/natalie-sangkagalo.jpg',
    bio: "Heads marketing at Toku, the stablecoin-payroll platform at the centre of this masterclass. Natalie walks through the strategy from the client side — what changed, what didn't, and what it means for pipeline.",
  },
];

const TAKEAWAYS = [
  'The exact content structure LoudFace used to make Toku appear in ChatGPT, Perplexity, and Google AI Overviews — so you can replicate it on your own site.',
  'A simple framework to audit your AI visibility in under 20 minutes and identify the highest-impact changes.',
  'The specific on-page and technical changes made to Toku\'s site — with principles that apply to any platform, not just Webflow.',
  'How to get your brand named in AI answers for the exact search prompts your buyers are already running — with results you can track.',
];

const AGENDA = [
  { duration: '5 min', title: 'Welcome & speaker intros' },
  { duration: '10 min', title: 'Why AI search is skipping your website' },
  { duration: '10 min', title: 'The Toku case study: from 0 to 86%' },
  { duration: '10 min', title: 'The exact changes: content, structure, platform' },
  { duration: '5 min', title: 'Your AI visibility audit framework' },
  { duration: '10 min', title: 'Live Q&A' },
];

export default function WebinarPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSON_LD) }}
      />

      {/* Hero */}
      <SectionContainer padding="lg" className="text-center">
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
            LoudFace × Webflow · Live Masterclass
          </span>
        </div>

        {/* Proof stat */}
        <div className="mb-6">
          <p className="font-heading text-7xl font-medium tracking-tight text-primary-600 md:text-8xl">
            0 → 86%
          </p>
          <p className="mt-2 text-base text-surface-500">
            AI visibility on Toku&apos;s core buyer search prompt
          </p>
        </div>

        <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-medium leading-tight tracking-tight text-surface-900 sm:text-5xl">
          Why your website is{' '}
          <span className="text-primary-600">invisible in AI search</span>{' '}
          — and how to fix it
        </h1>

        <p className="mx-auto mb-6 max-w-xl text-lg text-surface-600">
          A 50-minute live breakdown of the exact content architecture, on-page changes, and
          platform decisions that took Toku from invisible to dominant in AI search. Every step,
          no theory.
        </p>

        <p className="mb-8 text-lg font-medium text-surface-700">
          Thursday, July 9, 2026 &nbsp;·&nbsp; 11:00 AM ET &nbsp;·&nbsp; Live + Q&amp;A
        </p>

        <Button variant="secondary" size="lg" href={RIVERSIDE_REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
          Save my seat
        </Button>

        {/* Proof bar */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-6 rounded-2xl border border-surface-200 bg-white px-8 py-5">
          <div className="flex items-center gap-3">
            <img
              src={asset('/images/toku-logo.png')}
              alt="Toku"
              width={52}
              height={20}
              loading="lazy"
              className="h-5 w-auto"
            />
            <span className="text-sm text-surface-600">
              went from <strong className="text-surface-900">0 → 86%</strong> AI visibility on its core search prompt
            </span>
          </div>
          <div className="hidden h-6 w-px bg-surface-200 sm:block" />
          <span className="rounded-md border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-600">
            Webflow Premium Partner
          </span>
        </div>
      </SectionContainer>

      {/* Takeaways */}
      <SectionContainer padding="default" className="bg-surface-50">
        <SectionHeader
          eyebrow="What you'll learn"
          title="What you'll leave with"
          align="center"
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {TAKEAWAYS.map((item, i) => (
            <Card key={i} padding="lg" hover={false}>
              <p className="mb-3 font-mono text-xs font-bold text-primary-600">
                {String(i + 1).padStart(2, '0')}
              </p>
              <p className="text-sm leading-relaxed text-surface-600">{item}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* Speakers */}
      <SectionContainer padding="default">
        <SectionHeader
          eyebrow="Speakers"
          title="Who's in the room"
          align="center"
          className="mb-10"
        />
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {SPEAKERS.map((speaker) => (
            <Card key={speaker.name} padding="lg" hover={false}>
              <img
                src={asset(speaker.image)}
                alt={speaker.name}
                width={72}
                height={72}
                loading="lazy"
                className="mb-5 h-18 w-18 rounded-full object-cover"
              />
              <p className="text-lg font-medium text-surface-900">{speaker.name}</p>
              <p className="mb-4 text-sm font-semibold text-primary-600">{speaker.title}</p>
              <p className="text-sm leading-relaxed text-surface-600">{speaker.bio}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* Agenda */}
      <SectionContainer padding="default" className="bg-surface-50">
        <SectionHeader
          eyebrow="Agenda"
          title="50 minutes, structured"
          align="center"
          className="mb-10"
        />
        <Card
          padding="none"
          hover={false}
          className="mx-auto max-w-lg divide-y divide-surface-200"
        >
          {AGENDA.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <span className="w-14 text-right font-mono text-xs text-surface-400">
                {item.duration}
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                {i + 1}
              </span>
              <span className="text-sm text-surface-800">{item.title}</span>
            </div>
          ))}
        </Card>
      </SectionContainer>

      {/* Registration */}
      <SectionContainer
        id="register"
        padding="lg"
        className="bg-primary-50 text-center"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-600">
          Register
        </p>
        <h2 className="mb-3 text-2xl font-medium text-surface-900 sm:text-3xl">
          Save your seat
        </h2>
        <p className="mx-auto mb-8 max-w-sm text-base text-surface-600">
          Thursday, July 9, 2026 &middot; 11:00 AM ET &middot; Live + Q&amp;A
        </p>
        <Button
          variant="secondary"
          size="lg"
          href={RIVERSIDE_REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Save my seat
        </Button>
        <p className="mt-4 text-xs text-surface-400">
          You&apos;ll receive a calendar invite and join link from Riverside.
        </p>
      </SectionContainer>

      {/* AI Audit CTA */}
      <SectionContainer padding="default" className="bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 sm:flex-row sm:gap-12">
          <div className="flex-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-600">
              Before the masterclass
            </p>
            <h2 className="mb-3 text-2xl font-medium leading-snug text-surface-900">
              Your competitors are winning deals on ChatGPT searches.
              How far behind are you?
            </h2>
            <p className="text-sm leading-relaxed text-surface-600">
              Run a free AI Visibility Audit and find out exactly where your site stands before
              you join the masterclass — so you know what to focus on when you&apos;re in the room.
            </p>
          </div>
          <div className="shrink-0 text-center">
            <Button variant="secondary" size="lg" href="/ai-audit">
              Run my free audit →
            </Button>
            <p className="mt-2 text-xs text-surface-400">Takes 2 minutes. No signup needed.</p>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
