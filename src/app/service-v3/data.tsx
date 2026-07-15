/**
 * service-v3 data layer — the parameterized config for the seven /services/<slug>
 * child pages. One ServiceConfig per slug fills the same template slots (hero,
 * deliverables bento, process runway, featured exhibit, proof band, FAQ, related
 * rail, cover CTA) with copy adapted verbatim-first from each service's
 * src/data/content/services-*.json.
 *
 * Case-study SCREENSHOTS come LIVE from Sanity by slug (getServiceImages — the
 * same helper/slug set the homepage + services hub use) with hardcoded CDN
 * fallbacks, so a fetch failure or asset re-upload can never blank an image.
 *
 * CLAIMS DISCIPLINE (per the rollout brief): only the safe, attributed set rides
 * the chrome — 200+, 4+ yrs, 2h, Toku 0→86% (attributed, 30-day snapshot), 288%
 * (Dimer Health · CRO · six-month optimization — the site's pre-approved canon),
 * 7+ engines, and one optional "$5k/mo" as plain text. Dropped everywhere:
 * unlabeled 288% variants, "$200K in 30 days", the "10 Best Website Creator
 * 2024" badge, uncited zero-click / AI-Overview percentages, and time-decaying
 * claims beyond the recomputed partner years.
 */
import type { ReactNode } from 'react';

export { getHomeV3Images as getServiceImages, type HomeImages } from '../home-v3/data';

/* ---- shared artifact type: a client shot referenced by Sanity slug + CDN fallback ---- */
export interface Artifact {
  slug: string;      // Sanity caseStudy slug (keys getServiceImages)
  asset: string;     // hardcoded CDN filename fallback
  domain: string;    // browser-frame url label
  alt: string;
}

const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';

/** Resolve an artifact's src: Sanity url by slug, else CDN fallback, + crop params. */
export function artifactSrc(a: Artifact, images: Record<string, string> | undefined, crop: string): string {
  return (images?.[a.slug] ?? CDN + a.asset) + crop;
}

/* ---- the eight real client shots we draw from (slugs match getServiceImages) ---- */
const SHOTS = {
  liqid: { slug: 'liqid', asset: '5f21404454406eee90732e4e1c8655e0c8c6013b-3024x3629.webp', domain: 'liqid.de' },
  eraser: { slug: 'eraser', asset: '2a7d29fdc9302c8482d70b73041e6c58ec9229a6-1440x1845.webp', domain: 'eraser.io' },
  dimer: { slug: 'dimer-health', asset: 'a0f4750b896ced6ffca9c5869623b15614f312ba-1440x10131.webp', domain: 'dimerhealth.com' },
  toku: { slug: 'toku-ai-cited-pipeline', asset: 'bd1c09b494f7074c268f5b964d0c77dc1b1ef965-2880x1620.webp', domain: 'toku.com' },
  hoxhunt: { slug: 'hoxhunt', asset: '3ac92e2393c7a26dc96f737c27d7faf49fbe6243-1440x8455.jpg', domain: 'hoxhunt.com' },
  montblanc: { slug: 'montblanc', asset: 'a9110ec997f7a351bb9b90347bef4abf6b6b02fc-3024x1890.jpg', domain: 'montblanc.com' },
  outbound: { slug: 'outbound-specialist', asset: 'd90a9cec8351f259afd300dcbc51641ed9b40c3d-1440x1845.webp', domain: 'outboundspecialist.com' },
  radisson: { slug: 'radisson-hotels-group', asset: '7d8ef15a548457e46a262f4ef9617e3260d10722-1440x1845.jpg', domain: 'radissonhotels.com' },
} as const;

function shot(key: keyof typeof SHOTS, alt: string): Artifact {
  return { ...SHOTS[key], alt };
}

/* ---- config shapes ---- */
export interface DeliverTile {
  title: string;
  desc: string;
  span?: 'wide' | 'narrow' | 'half' | 'third'; // omit → auto-assigned from count
  chips?: string[];
  frag?: Artifact; // small screenshot fragment (wide tiles only)
}

export interface RunPillar {
  title: string;
  desc: string;
  kind: 'row' | 'card'; // row = text + blueprint figure; card = supporting icon-card
  fig?: 0 | 1 | 2;      // which blueprint figure (row only)
}

export interface FaqItem {
  q: string;
  aHtml: string; // rendered as HTML (may carry <strong>/<a>) and feeds FAQPage schema (stripped)
}

export interface ExhibitOut {
  num: string;
  label: string;
  src: string; // attribution chip
}

export interface ServiceConfig {
  slug: string;
  ariaLabel: string;
  hero: {
    eyebrow: string;
    eyebrowTag?: string;
    h1: ReactNode;
    blurb: string;
    secondary: { label: string; href: string };
    chip: { value: string; label: string };
    main: Artifact & { rpillLabel: string; rpillClient: string };
    frag: Artifact;
  };
  logosLead: string;
  deliver: { title: ReactNode; lede: string; tiles: DeliverTile[] };
  runway: { title: ReactNode; lede: string; pillars: RunPillar[] };
  exhibit: {
    art: Artifact;
    eyebrow: string;
    h2: string;
    domLine: ReactNode;
    what: string;
    annots: { em: string; span: string }[];
    out?: ExhibitOut;
    outText?: string;
    ctaLabel: string;
    ctaHref: string;
  };
  proof: {
    track: 'build' | 'grow';
    title: ReactNode;
    lede: string;
    hero: { num: string; label: string; src?: string };
    extra: { num: string; label: string }; // one track-specific supporting stat
  };
  faq: { title: ReactNode; items: FaqItem[] };
  rel: { title: ReactNode; note: string };
  cover: {
    h2: string;
    p: string;
    metaRight: string;
    creditLeft: string;
    obj: Artifact & { rpillLabel: string; rpillClient: string };
  };
}

/* ---- shared blurbs / stats used across configs ---- */
const AUDIT = { label: 'Free AI Visibility Audit', href: '/ai-audit' };
const SEE_WORK = { label: 'View our work', href: '/case-studies' };
const DIMER_SRC = 'Dimer Health · CRO · six-month optimization';
const TOKU_HREF = '/case-studies/toku-ai-cited-pipeline';

/* ---- the seven configs, in Build-track then Grow-track order ---- */
export const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  /* ========================= WEBFLOW (exemplar) ========================= */
  webflow: {
    slug: 'webflow',
    ariaLabel: 'Webflow development services',
    hero: {
      eyebrow: 'Webflow Development',
      eyebrowTag: 'Enterprise Partner',
      h1: (
        <>
          Webflow sites built to scale — <span className="soft">not just to launch.</span>
        </>
      ),
      blurb:
        'We build component-first Webflow websites your team can actually build on. Spin up landing pages in hours, split test everything, and watch your conversion rates climb.',
      secondary: SEE_WORK,
      chip: { value: '200+', label: 'B2B SaaS sites shipped' },
      main: { ...shot('liqid', 'LIQID website built by LoudFace on Webflow'), rpillLabel: 'Webflow build', rpillClient: 'LIQID' },
      frag: shot('eraser', ''),
    },
    logosLead: 'Built and grown for B2B SaaS teams shipping real products',
    deliver: {
      title: (
        <>
          Everything <span className="ghost">under the hood.</span>
        </>
      ),
      lede:
        'Not a template you outgrow in a quarter — a system your marketing team drives. Every build ships with the machinery underneath it wired up from day one.',
      tiles: [
        {
          title: 'Trackable analytics',
          desc: 'Every click, scroll, and conversion event wired up and reporting from day one. You know exactly what’s working — and what to cut.',
          span: 'wide',
          chips: ['Events', 'Funnels', 'Attribution'],
          frag: shot('toku', ''),
        },
        {
          title: 'Third-party integrations',
          desc: 'HubSpot, Segment, Google Tag Manager, Zapier, Cal.com — we’ve integrated them all. Your site plays nice with your stack.',
          span: 'narrow',
          chips: ['HubSpot', 'Segment', 'GTM', 'Zapier'],
        },
        {
          title: 'SEO-ready structure',
          desc: 'Clean semantic markup, proper heading hierarchy, meta tags, schema, and page speed optimized. Built to rank, not just to look good.',
          span: 'narrow',
          chips: ['Semantic HTML', 'Schema', 'Core Web Vitals'],
        },
        {
          title: 'CMS that makes sense',
          desc: 'Content collections structured so your team publishes without guesswork. No training manual required — we design the CMS around how your team actually works.',
          span: 'wide',
          chips: ['Collections', 'No-code editing'],
          frag: shot('dimer', ''),
        },
        {
          title: 'Responsive down to the pixel',
          desc: 'Not just “it works on mobile.” We design every breakpoint intentionally so your site feels native on every screen size — phone, tablet, ultrawide.',
          span: 'half',
        },
        {
          title: 'Scalable for growth',
          desc: 'Whether you’re running 5 landing pages or 50, the system holds up. Add pages, sections, and campaigns without technical debt piling up behind you.',
          span: 'half',
        },
      ],
    },
    runway: {
      title: (
        <>
          Scale-first Webflow <span className="ghost">development.</span>
        </>
      ),
      lede:
        'We don’t just build Webflow sites — we build systems. Every project starts with a component library designed for your team to move fast without breaking things. The result: a site that gets better over time, not harder to manage.',
      pillars: [
        {
          kind: 'row',
          fig: 0,
          title: 'Component-first architecture',
          desc: 'Every element is a reusable building block. Your marketing team assembles new pages from proven components — without touching code or waiting on developers.',
        },
        {
          kind: 'card',
          title: 'Landing pages at speed',
          desc: 'Need a campaign page by Friday? When your site runs on a solid component system, high-quality landing pages go from concept to live in hours — not sprints.',
        },
        {
          kind: 'row',
          fig: 1,
          title: 'Built for split testing',
          desc: 'We structure your site so spinning up A/B variants takes minutes, not sprints. Test headlines, layouts, CTAs, and whole page structures — then let the data decide.',
        },
        {
          kind: 'card',
          title: 'Performance baked in',
          desc: 'Fast load times aren’t an afterthought — clean code, optimized assets, zero bloat. Your visitors get a fast experience, and Google rewards you for it.',
        },
      ],
    },
    exhibit: {
      art: shot('dimer', 'Dimer Health website built by LoudFace on Webflow'),
      eyebrow: 'Featured build',
      h2: 'The build behind a 288% conversion lift.',
      domLine: (
        <>
          <b>Dimer Health</b> · dimerhealth.com · Digital health
        </>
      ),
      what:
        'A component-first Webflow rebuild for a regulated health brand — then a six-month conversion program on top of it. Same team built the site and optimized it, so nothing got re-briefed between the people who ship and the people who grow.',
      annots: [
        { em: 'Component-first', span: 'Every page from reusable blocks' },
        { em: 'Split-test ready', span: 'Variants in minutes, not sprints' },
        { em: 'Performance baked in', span: 'Clean code, optimized assets' },
      ],
      out: { num: '288%', label: 'Best conversion increase', src: DIMER_SRC },
      ctaLabel: 'See the full case study',
      ctaHref: SEE_WORK.href,
    },
    proof: {
      track: 'build',
      title: (
        <>
          Enterprise-grade Webflow <span className="ghost">expertise.</span>
        </>
      ),
      lede:
        'We’re not generalists who happen to use Webflow. It’s our primary platform — we’ve built our entire practice around mastering it, from funded startups to established enterprises.',
      hero: { num: '288%', label: 'Best conversion increase from a LoudFace build', src: DIMER_SRC },
      extra: { num: '2h', label: 'Typical response time in working hours' },
    },
    faq: {
      title: (
        <>
          Common questions about our <span className="ghost">Webflow work.</span>
        </>
      ),
      items: [
        { q: 'How long does a typical Webflow project take?', aHtml: 'Most projects go from kickoff to launch in <strong>4–8 weeks</strong> depending on complexity — scope, page count, integrations, and how much content is ready. We scope the timeline with you on the intro call so there are no surprises.' },
        { q: 'Can my team update the site after launch?', aHtml: 'Absolutely — that’s the whole point. We build component-first, so your marketing team assembles new pages and edits content without touching code or waiting on a developer.' },
        { q: 'Do you offer ongoing support after launch?', aHtml: 'Yes. We offer retainer arrangements for teams that want us to keep building, testing, and optimizing after launch — the same team that shipped the site keeps it moving.' },
        { q: 'Why Webflow over WordPress or a custom build?', aHtml: 'No plugins to maintain, no security patches, no server management. You get a fast, visually-editable site your team controls — with the performance and clean markup a custom build gives you, without the maintenance overhead.' },
        { q: 'Can you migrate our existing site to Webflow?', aHtml: 'We do this regularly. We’ll audit your current site, preserve your SEO equity with proper redirects and structure, and rebuild it component-first so it’s easier to run going forward.' },
      ],
    },
    rel: {
      title: (
        <>
          Webflow rarely ships <span className="ghost">alone.</span>
        </>
      ),
      note: 'Run the build on its own, or pair it with growth. Either way it’s the same team — nothing gets re-briefed between the people who ship your site and the people who grow it.',
    },
    cover: {
      h2: 'Ready to build a Webflow site that scales with you?',
      p: 'Let’s talk about your goals and show you how a component-first approach changes the game — 30 minutes, no pitch deck.',
      metaRight: 'B2B SaaS only',
      creditLeft: 'Cover — LIQID, built by LoudFace',
      obj: { ...shot('liqid', ''), rpillLabel: 'Webflow build', rpillClient: 'LIQID' },
    },
  },

  /* ========================= UX / UI DESIGN ========================= */
  'ux-ui-design': {
    slug: 'ux-ui-design',
    ariaLabel: 'UX/UI design services',
    hero: {
      eyebrow: 'UX/UI Design',
      h1: (
        <>
          Every layout is a revenue decision. <span className="soft block">Design it like one.</span>
        </>
      ),
      blurb:
        'Most agencies make layout decisions on aesthetics. We make them on what converts — messaging shapes the hierarchy, data informs every interaction, and you get a design system your team can build on without us.',
      secondary: SEE_WORK,
      chip: { value: '200+', label: 'Projects designed' },
      main: { ...shot('eraser', 'Eraser website designed by LoudFace'), rpillLabel: 'UX/UI design', rpillClient: 'Eraser' },
      frag: shot('liqid', ''),
    },
    logosLead: 'Design systems built and grown for B2B SaaS teams',
    deliver: {
      title: (
        <>
          What we actually <span className="ghost">build.</span>
        </>
      ),
      lede:
        'Not mockups you hand to a developer and hope for the best — a working system: components, tokens, documentation, and layouts engineered to convert.',
      tiles: [
        { title: 'Conversion-focused UX', desc: 'Every layout maps to a user action. Message hierarchy designed so visitors understand the value and know what to do next within seconds. CTA placement, scroll flow, and confidence-building elements are deliberate decisions tested against real behavior.' },
        { title: 'Component-first design systems', desc: 'Reusable components in Figma that translate directly to Webflow. Your team assembles landing pages from pre-built blocks without a developer. Design tokens manage colors, type, and spacing site-wide — one update propagates everywhere.' },
        { title: 'Performance as a design constraint', desc: 'Sub-2-second load times and 90+ PageSpeed scores are design requirements, not dev tasks. Compressed assets, purposeful motion, lean layouts. We design with that math visible.' },
        { title: 'Search and AI-ready structure', desc: 'Semantic heading hierarchies, schema-ready layouts, and information architecture built for hub-and-spoke content. Pages discoverable by Google and parseable by AI engines from the first wireframe.' },
        { title: 'Brand execution with substance', desc: 'We translate complex products into interfaces an unfamiliar buyer understands in seconds. Design that communicates credibility for B2B and enterprise, where trust is the primary conversion barrier.' },
      ],
    },
    runway: {
      title: (
        <>
          Systems, <span className="ghost">not pages.</span>
        </>
      ),
      lede:
        'We don’t design pages — we design the system that produces them. Start with the component library, typography scale, and spacing tokens. Then build every layout from those constraints. New pages ship fast and stay consistent.',
      pillars: [
        { kind: 'row', fig: 0, title: 'Discovery & messaging alignment', desc: 'We don’t open Figma until the copy is done. Discovery surfaces your goals, audience, and competitive landscape. Messaging gives us the hierarchy every layout needs. No wireframes from vibes.' },
        { kind: 'card', title: 'Design system setup', desc: 'Colors, typography, spacing, grid systems, and a reusable component library in Figma. Everything built after this point inherits from the system, so consistency is automatic, not something you maintain.' },
        { kind: 'row', fig: 1, title: 'Conversion-focused UI', desc: 'Every page layout mapped to a user action. Message hierarchy that communicates value in seconds. CTA placement, scroll flow, form design, social proof — tested against conversion data, not committee opinion.' },
        { kind: 'card', title: 'Build, train, iterate', desc: 'Pixel-perfect translation to Webflow, QA across every breakpoint, and hands-on training for your team. Under the Growth track, design keeps shipping on a weekly cadence.' },
      ],
    },
    exhibit: {
      art: shot('dimer', 'Dimer Health website designed by LoudFace'),
      eyebrow: 'Featured design',
      h2: 'Design that earned a 288% lift.',
      domLine: (
        <>
          <b>Dimer Health</b> · dimerhealth.com · Digital health
        </>
      ),
      what:
        'A positioning-led redesign for a regulated health brand: trust architecture, message hierarchy, and a component system rebuilt so every layout points at one action. Same team designed it and optimized it against real conversion data.',
      annots: [
        { em: 'System-first', span: 'Every page from shared tokens' },
        { em: 'Conversion-mapped', span: 'Each layout points at one action' },
        { em: 'Sub-2s performance', span: 'Speed is a design requirement' },
      ],
      out: { num: '288%', label: 'Best conversion increase', src: DIMER_SRC },
      ctaLabel: 'See the full case study',
      ctaHref: SEE_WORK.href,
    },
    proof: {
      track: 'build',
      title: (
        <>
          Design that earns <span className="ghost">its keep.</span>
        </>
      ),
      lede:
        'A beautiful page that doesn’t convert is expensive decoration. We design for three audiences from the first wireframe — human visitors, search crawlers, and AI systems.',
      hero: { num: '288%', label: 'Best conversion increase from a LoudFace design', src: DIMER_SRC },
      extra: { num: '90+', label: 'Target PageSpeed score on every build' },
    },
    faq: {
      title: (
        <>
          Common questions about our <span className="ghost">design work.</span>
        </>
      ),
      items: [
        { q: 'Why does copy need to be done before design?', aHtml: 'Because copy determines the layout. What visitors need to see first, second, third is a messaging decision that shapes every wireframe. When design comes first, you get layouts filled with placeholder text and headlines that describe features instead of solving problems.' },
        { q: 'What exactly is a “design system”?', aHtml: 'A reusable set of components, color tokens, typography rules, and spacing conventions that every page inherits. Think of it as a kit of parts your team can assemble into new pages — consistency and speed without maintaining either manually.' },
        { q: 'Do I need a full redesign, or can you improve what I have?', aHtml: 'Depends on the foundation. If your current site has a solid component structure and decent performance, we optimize within it. If the codebase is brittle or no design system exists, a strategic rebuild usually pays for itself faster than patching problems individually.' },
        { q: 'How does design connect to SEO and CRO?', aHtml: 'Directly. Page structure affects how Google indexes content and how AI engines parse it. Layout decisions affect where visitors look, what they understand, and whether they act. We design for all three from the first wireframe.' },
        { q: 'Can our team create new pages after launch?', aHtml: 'That’s the point of a component system. We train your team to assemble pages from the library we build. Landing pages that used to take weeks ship in hours — consistent and on-brand, without waiting on a designer.' },
        { q: 'How is this different from hiring a design agency?', aHtml: 'Most design agencies deliver mockups. We deliver a working system: components, tokens, documentation, and a site that converts. Design at LoudFace is inseparable from copy, CRO, and SEO — the layer where your growth strategy becomes visible.' },
      ],
    },
    rel: {
      title: (
        <>
          Design rarely ships <span className="ghost">alone.</span>
        </>
      ),
      note: 'The system we design gets built, written, and optimized by the same team — so nothing gets re-briefed between the people who design your site and the people who grow it.',
    },
    cover: {
      h2: 'Ready for design that earns its keep?',
      p: 'Let’s look at your current site and figure out what’s costing you conversions — then build a design system that does the job.',
      metaRight: 'B2B SaaS only',
      creditLeft: 'Cover — Eraser, designed by LoudFace',
      obj: { ...shot('eraser', ''), rpillLabel: 'UX/UI design', rpillClient: 'Eraser' },
    },
  },

  /* ========================= CRO ========================= */
  cro: {
    slug: 'cro',
    ariaLabel: 'Conversion rate optimization services',
    hero: {
      eyebrow: 'Conversion Rate Optimization',
      h1: (
        <>
          Your traffic is worth more <span className="soft">than your conversion rate suggests.</span>
        </>
      ),
      blurb:
        'The visitors who land on your site are fewer, but they’re ready to act — if your site lets them. We run CRO programs that treat every page as a revenue conversation, not a brochure.',
      secondary: SEE_WORK,
      chip: { value: '288%', label: 'Conversion lift, Dimer Health' },
      main: { ...shot('dimer', 'Dimer Health conversion program by LoudFace'), rpillLabel: 'CRO program', rpillClient: 'Dimer Health' },
      frag: shot('outbound', ''),
    },
    logosLead: 'Conversion programs run for B2B SaaS teams shipping real products',
    deliver: {
      title: (
        <>
          What the program <span className="ghost">covers.</span>
        </>
      ),
      lede:
        'Every page, layout decision, and line of copy gets evaluated through one filter: does this build confidence, reduce friction, and move the visitor toward a decision?',
      tiles: [
        { title: 'Conversion clarity', desc: 'Message hierarchy, information architecture, and UX designed for comprehension and decision-making. We structure pages so visitors understand your value in seconds, not minutes.' },
        { title: 'Confidence-building design', desc: 'Layout, copy, and social proof positioned to reduce buyer hesitation at every stage. Trust indicators, case study placement, and pricing transparency — engineered to move prospects past “I’ll think about it.”' },
        { title: 'Copy that converts', desc: 'Positioning-first copywriting where every word earns its place. Headlines that qualify visitors. CTAs that name the next step. Body copy that builds the case for action instead of filling space.' },
        { title: 'Technical performance', desc: 'Core Web Vitals, page speed, and mobile responsiveness directly affect conversion. A page that loads in 4 seconds loses 25% of visitors before they see your headline. We treat performance as a conversion lever.' },
        { title: 'Data-driven iteration', desc: 'Systematic testing tied to a shared Scoreboard. We model conservative forecasts — incremental CRO improvement alongside traffic growth — so you can see exactly when the program pays for itself.' },
      ],
    },
    runway: {
      title: (
        <>
          CRO as a <span className="ghost">system.</span>
        </>
      ),
      lede:
        'We don’t run isolated A/B tests and call it optimization. Every page, layout decision, and line of copy gets evaluated through one filter: does this build confidence, reduce friction, and move the visitor toward a decision?',
      pillars: [
        { kind: 'row', fig: 0, title: 'Conversion audit', desc: 'We map your current funnel: where visitors land, where they drop off, where friction kills momentum. Every finding scored against revenue impact, not statistical curiosity.' },
        { kind: 'card', title: '90-day roadmap', desc: '3–5 measurable goals tied to pipeline outcomes. A shared Scoreboard tracking conversion rate, demo starts, form submissions, and scroll depth. Clear priorities so nothing gets tested at random.' },
        { kind: 'row', fig: 1, title: 'Continuous testing', desc: 'Headlines, CTAs, page structure, forms, social proof — tested systematically alongside your SEO/AEO program. As traffic scales, conversion rates improve in parallel. The compound effect is where the ROI lives.' },
        { kind: 'card', title: 'Weekly showcase', desc: 'A live walkthrough of what shipped, how conversion metrics moved, and what’s next. Every test tied to business outcomes your exec team cares about — not statistical noise.' },
      ],
    },
    exhibit: {
      art: shot('dimer', 'Dimer Health conversion program by LoudFace'),
      eyebrow: 'Featured program',
      h2: 'A 288% conversion lift, systematically.',
      domLine: (
        <>
          <b>Dimer Health</b> · dimerhealth.com · Digital health
        </>
      ),
      what:
        'A six-month conversion program on a regulated health brand: positioning overhaul, trust architecture, and copy restructuring across the pages that matter. Nearly 3× the conversion rate from the same traffic.',
      annots: [
        { em: 'Hypothesis-driven', span: 'Every test scored on revenue impact' },
        { em: '90-day cycles', span: 'Compound gains, not one-off wins' },
        { em: 'Weekly showcase', span: 'Metrics tied to pipeline, not noise' },
      ],
      out: { num: '288%', label: 'Best conversion increase', src: DIMER_SRC },
      ctaLabel: 'See the full case study',
      ctaHref: SEE_WORK.href,
    },
    proof: {
      track: 'build',
      title: (
        <>
          Traffic into <span className="ghost">revenue.</span>
        </>
      ),
      lede:
        'Traffic without conversion is a vanity metric. We run CRO as a system — a prioritization framework, systematic testing, and wins that compound alongside your traffic.',
      hero: { num: '288%', label: 'Best conversion increase from a LoudFace program', src: DIMER_SRC },
      extra: { num: '90-day', label: 'Optimization cycles with a shared Scoreboard' },
    },
    faq: {
      title: (
        <>
          Common questions about our <span className="ghost">CRO program.</span>
        </>
      ),
      items: [
        { q: 'How is this different from running A/B tests?', aHtml: 'A/B testing is a tactic. CRO is the system that decides what to test, why, and how to measure whether it mattered. We build a prioritization framework around your business goals, run tests systematically, and compound the wins — not cherry-pick one-off experiments.' },
        { q: 'Do I need a certain amount of traffic for CRO to work?', aHtml: 'Statistical significance matters, so very low-traffic sites need a different approach. For most B2B sites with 5,000+ monthly visitors, there’s enough data to run meaningful tests. Below that, we focus on conversion-oriented design and copy — which doesn’t require test data to improve.' },
        { q: 'Can CRO work alongside our existing SEO program?', aHtml: 'That’s how it should work. We run CRO and SEO/AEO as integrated tracks — as traffic grows from search, conversion rates improve in parallel. If you’re already working with us on SEO/AEO, CRO plugs directly into the same Scoreboard and showcase cadence.' },
        { q: 'What metrics do you track?', aHtml: 'Conversion rate by page and traffic source, demo starts, form submissions, scroll depth on priority pages, time to first meaningful action, and qualified leads from organic. Every metric tied to revenue, not vanity.' },
        { q: 'How long before I see results?', aHtml: 'Quick wins — headline, CTA, and above-the-fold improvements — can move numbers within the first 30 days. Compound gains build over 90-day cycles. We set clear goals at the start and report against them weekly.' },
        { q: 'Do I need to manage the testing?', aHtml: 'No. We own the roadmap, prioritization, execution, and reporting. You get a single point of contact, weekly showcases, and a shared Scoreboard. Zero task management on your end.' },
      ],
    },
    rel: {
      title: (
        <>
          Conversion rarely moves <span className="ghost">alone.</span>
        </>
      ),
      note: 'CRO compounds when the same team owns the copy, design, and traffic feeding it — so nothing gets re-briefed between the people who test your pages and the people who build them.',
    },
    cover: {
      h2: 'Ready to turn your traffic into revenue?',
      p: 'Let’s audit your current conversion funnel and build a program that compounds results alongside your traffic growth.',
      metaRight: 'B2B SaaS only',
      creditLeft: 'Cover — Dimer Health, optimized by LoudFace',
      obj: { ...shot('dimer', ''), rpillLabel: 'CRO program', rpillClient: 'Dimer Health' },
    },
  },

  /* ========================= COPYWRITING ========================= */
  copywriting: {
    slug: 'copywriting',
    ariaLabel: 'Messaging and copywriting services',
    hero: {
      eyebrow: 'Messaging & Copywriting',
      h1: (
        <>
          Copy first. <span className="soft">Everything else follows.</span>
        </>
      ),
      blurb:
        'Most agencies design the page, then fill in the words. We do it backwards, on purpose. Messaging is the first deliverable at LoudFace — it determines page structure, visual hierarchy, conversion flow, and how AI engines parse your content. Copy → Design → Dev.',
      secondary: SEE_WORK,
      chip: { value: '1st', label: 'Deliverable in every build' },
      main: { ...shot('eraser', 'Eraser marketing pages written by LoudFace'), rpillLabel: 'Conversion copy', rpillClient: 'Eraser' },
      frag: shot('hoxhunt', ''),
    },
    logosLead: 'Messaging written for B2B SaaS teams shipping real products',
    deliver: {
      title: (
        <>
          What the work <span className="ghost">looks like.</span>
        </>
      ),
      lede:
        'Not words that fill a wireframe — the messaging foundation everything else builds on. Written for human readers, search engines, and AI citations in one pass.',
      tiles: [
        { title: 'Positioning-first copywriting', desc: 'Before we write a word, we understand your buyer and what your product actually does better. Copy built to position and persuade — clarity over cleverness, substance over style.' },
        { title: 'Founder voice extraction', desc: 'We translate founder visions into messaging an unsophisticated buyer instantly understands. Technical depth without jargon. We take complex products and make them feel obvious.' },
        { title: 'SEO & AEO-native writing', desc: 'Question-based headings, direct answers in the first 50 words, entity-first structure, scannable paragraphs. Every piece written for Google rankings and AI engine citations simultaneously.' },
        { title: 'Programmatic content systems', desc: 'Templated approaches for TOFU and MOFU content: same topic addressed across different use cases, end users, and ICPs. Weekly production cadence managed from research to publish.' },
        { title: 'Thought leadership that takes a stance', desc: 'Not generic how-to posts. Opinionated, data-informed writing on industry shifts your competitors haven’t covered yet. The kind of content that gets cited because it actually says something.' },
      ],
    },
    runway: {
      title: (
        <>
          Copy → Design → <span className="ghost">Dev.</span>
        </>
      ),
      lede:
        'We don’t fill wireframes with words. When copy leads, design has a clear brief and dev has a clear spec. No rework cycles, no last-minute rewrites, no layouts fighting the message. The page ships faster and converts better because the hard thinking happened first.',
      pillars: [
        { kind: 'row', fig: 0, title: 'Positioning & voice extraction', desc: 'We study your buyer, their decision journey, and what separates you from every alternative they’re considering. Founder interviews, competitor audits, the language your market actually uses. That research becomes the positioning foundation.' },
        { kind: 'card', title: 'Messaging architecture', desc: 'Before writing a single headline, we design the information hierarchy. What does a visitor need to understand first? What builds confidence? What triggers action? Every page gets a conversion blueprint before copy is written.' },
        { kind: 'row', fig: 1, title: 'Conversion copy', desc: 'Every headline, subhead, and CTA runs through one filter: does it build confidence, reduce friction, and move someone toward a decision? Written for human readers, search engines, and AI citations in one pass.' },
        { kind: 'card', title: 'Content systems', desc: 'For Growth-track clients, we run end-to-end content production: research, calendar, writing, publishing. Topical clusters, comparison pages, programmatic content — managed weekly and built to compound authority over time.' },
      ],
    },
    exhibit: {
      art: shot('eraser', 'Eraser marketing pages written by LoudFace'),
      eyebrow: 'Featured work',
      h2: 'Copy that reads like the product built it.',
      domLine: (
        <>
          <b>Eraser</b> · eraser.io · Developer tooling
        </>
      ),
      what:
        'Marketing pages for a design-and-diagram tool whose audience notices craft. Copy, layout, and build had to hold the product’s own visual standard — so we ran all three together, copy leading.',
      annots: [
        { em: 'Copy → Design → Dev', span: 'Messaging drives the layout' },
        { em: 'Positioning-first', span: 'Every word earns its place' },
        { em: 'Human-written', span: 'AI accelerates research, humans write' },
      ],
      outText: 'Launch pages that read like the product built them.',
      ctaLabel: 'See our work',
      ctaHref: SEE_WORK.href,
    },
    proof: {
      track: 'build',
      title: (
        <>
          Messaging that <span className="ghost">converts.</span>
        </>
      ),
      lede:
        'Copy isn’t a silo here — it’s the foundation everything else is built on. The same positioning that sharpens your pages feeds every campaign and AI answer where buyers research you.',
      hero: { num: '288%', label: 'Best conversion increase from a LoudFace build', src: DIMER_SRC },
      extra: { num: '100%', label: 'Human-written content — AI accelerates, humans write' },
    },
    faq: {
      title: (
        <>
          Common questions about our <span className="ghost">copywriting.</span>
        </>
      ),
      items: [
        { q: 'Why does copy need to come before design?', aHtml: 'Because copy determines page structure. The messaging hierarchy — what visitors need to understand first, second, third — dictates the layout, not the other way around. When design comes first, you get pretty pages with placeholder messaging that doesn’t convert. Copy → Design → Dev eliminates that problem.' },
        { q: 'Can you write for technical or complex products?', aHtml: 'That’s our focus. We work with B2B and SaaS companies where the product is genuinely complex. The process starts with founder interviews and product deep-dives so we can extract the core value, then translate it into language buyers understand without dumbing down the substance.' },
        { q: 'Do you use AI to write content?', aHtml: 'We use AI to accelerate research, spot gaps, and pressure-test drafts. But humans write and review everything. AI-generated content has a ceiling — it can’t extract founder voice, take a genuine stance, or write with the specificity that builds trust with real buyers.' },
        { q: 'What does the content production cadence look like?', aHtml: 'For Growth-track clients, we typically run 5 new articles plus 5 refreshed articles per week, managed end-to-end. We handle research, content calendars, writing, and publishing. You approve the calendar. We handle the rest.' },
        { q: 'Can you work with our existing brand guidelines?', aHtml: 'Yes. We adapt to existing voice and tone guidelines when they exist. When they don’t, we create them as part of the positioning work. Either way, every piece sounds like your brand, not like an agency wrote it.' },
        { q: 'How is this different from hiring a freelance copywriter?', aHtml: 'A freelancer writes words. We design how information lives on your site — what goes where, why, and how it connects to search, conversion, and your broader growth program. Copy isn’t a silo here. It’s the foundation everything else is built on.' },
      ],
    },
    rel: {
      title: (
        <>
          Copy rarely ships <span className="ghost">alone.</span>
        </>
      ),
      note: 'Messaging sets the positioning; design and build carry it. It’s the same team, so nothing gets re-briefed between the people who write your site and the people who ship it.',
    },
    cover: {
      h2: 'Ready to lead with messaging that converts?',
      p: 'Let’s start with your positioning and build the copy that drives every page, campaign, and conversion on your site.',
      metaRight: 'B2B SaaS only',
      creditLeft: 'Cover — Eraser, written by LoudFace',
      obj: { ...shot('eraser', ''), rpillLabel: 'Conversion copy', rpillClient: 'Eraser' },
    },
  },

  /* ========================= SEO / AEO ========================= */
  'seo-aeo': {
    slug: 'seo-aeo',
    ariaLabel: 'SEO and AEO services for B2B SaaS',
    hero: {
      eyebrow: 'SEO + AEO + GEO for B2B SaaS',
      h1: (
        <>
          SEO &amp; AEO agency for B2B SaaS. <span className="soft">Get cited, not just ranked.</span>
        </>
      ),
      blurb:
        'We run SEO, AEO, and GEO as one program, so you rank on Google and get cited inside ChatGPT, Perplexity, and Google AI Overviews when buyers ask which vendor to pick.',
      secondary: AUDIT,
      chip: { value: '0 → 86%', label: 'Toku AI visibility' },
      main: { ...shot('toku', 'Toku website grown by LoudFace for AI visibility'), rpillLabel: 'SEO & AEO', rpillClient: 'Toku' },
      frag: shot('hoxhunt', ''),
    },
    logosLead: 'Organic and AI-search growth for B2B SaaS teams',
    deliver: {
      title: (
        <>
          What’s included in our <span className="ghost">SEO &amp; AEO services.</span>
        </>
      ),
      lede:
        'The infrastructure that makes everything compound — built for Google, the AI engines, and Discover feeds at once, structured so models can parse it and humans can act on it.',
      tiles: [
        { title: 'Technical foundation', desc: 'Site health, Core Web Vitals, crawl optimization, structured data, internal linking. The infrastructure that makes everything else compound.' },
        { title: 'Content systems', desc: 'Topical clusters, comparison pages, FAQ compilations, programmatic SEO, and Google Discover optimization. Built for Google, the AI engines, and Discover feeds at once — structured so models can parse it and humans can act on it.' },
        { title: 'Off-page + distribution', desc: 'Guest posts on high-authority publications, G2 and Capterra presence, Reddit and Quora strategy, community engagement. Plus the LinkedIn entity signals and cross-platform framing that make AI systems encounter the same brand story wherever they retrieve it.' },
        { title: 'E-E-A-T + authority signals', desc: 'Author credentials, expert quotes, thought leadership placement. The trust signals Google and AI engines weigh when deciding who to cite and who to skip when they assemble an answer.' },
        { title: 'LLM visibility monitoring', desc: 'We track how your brand shows up across ChatGPT, Perplexity, Gemini, Claude, Google AI Mode, Copilot, and Grok. Citation frequency, mention quality, and competitive position, reported weekly instead of quarterly.' },
      ],
    },
    runway: {
      title: (
        <>
          How our SEO, AEO and GEO <span className="ghost">program works.</span>
        </>
      ),
      lede:
        'We don’t wait for tickets or mail you a monthly deck of recommendations. We own the roadmap, ship the work, and show up every week with progress tied to your business goals.',
      pillars: [
        { kind: 'row', fig: 0, title: 'Foundation audit', desc: 'We map technical health, content gaps, entity coverage, and where you stand inside AI answers across ChatGPT, Perplexity, and Google AI Overviews. Every opportunity scored against pipeline impact, not keyword difficulty or vanity domain-authority scores.' },
        { kind: 'card', title: '90-day roadmap', desc: 'Three to five measurable goals tied straight to pipeline, split across the SEO, AEO, and GEO tracks. A shared scoreboard you can check any time, with clear ownership so nothing stalls waiting on a decision.' },
        { kind: 'row', fig: 2, title: 'Continuous execution', desc: 'The AEO program ships weekly: entity-first content, technical fixes, structured data, link building, and the cross-platform GEO signals that keep your brand story consistent. One point of contact. Zero task management on your side.' },
        { kind: 'card', title: 'Weekly check-in', desc: 'A live walkthrough of what shipped, how AI visibility and rankings moved, and what’s next. Every number tied to outcomes your leadership actually tracks, not a vanity dashboard.' },
      ],
    },
    exhibit: {
      art: shot('toku', 'Toku website grown by LoudFace for AI visibility'),
      eyebrow: 'Featured program',
      h2: 'From invisible to the answer AI names.',
      domLine: (
        <>
          <b>Toku</b> · toku.com · Payroll &amp; compliance
        </>
      ),
      what:
        'An answer-engine program aimed at the buying question — when someone asks an AI which vendor to use, Toku had to be in the answer. We built the pages and signals that get a brand cited by name.',
      annots: [
        { em: 'Entity-first content', span: 'Pages engines can parse and quote' },
        { em: 'Cited, not just ranked', span: 'In the answer, not scrolled past' },
        { em: '7+ engines tracked', span: 'Reported weekly, not quarterly' },
      ],
      out: { num: '0 → 86%', label: 'Toku AI visibility on its core prompt', src: 'Toku · SEO/AEO · from a standing start' },
      ctaLabel: 'See the full case study',
      ctaHref: TOKU_HREF,
    },
    proof: {
      track: 'grow',
      title: (
        <>
          Found on Google. <span className="ghost">Cited by AI.</span>
        </>
      ),
      lede:
        'The authority that ranks you on Google is what teaches an AI engine to trust you. We build SEO, AEO, and GEO into one program instead of three invoices.',
      hero: { num: '0 → 86%', label: 'Toku’s AI visibility on its core stablecoin-payroll prompt, from a standing start', src: 'Toku · SEO/AEO' },
      extra: { num: '7+', label: 'AI engines monitored — ChatGPT, Perplexity, Gemini, Claude, and more' },
    },
    faq: {
      title: (
        <>
          Common questions about our <span className="ghost">SEO/AEO program.</span>
        </>
      ),
      items: [
        { q: 'What is the difference between an AEO agency and a traditional SEO agency?', aHtml: 'A traditional SEO agency optimizes for Google rankings. An AEO agency also optimizes for being cited inside AI answers on ChatGPT, Perplexity, and Google AI Overviews. We do both, scoring every content decision, technical fix, and link target against pipeline impact rather than keyword difficulty, and layering AEO from day one so you’re not invisible in AI search while Google catches up.' },
        { q: 'What AI engines do you optimize for?', aHtml: 'ChatGPT, Perplexity, Google AI Mode and AI Overviews, Gemini, Claude, Copilot, and Grok. We monitor citation frequency, mention quality, and competitive position across all of them and report it weekly, not once a quarter.' },
        { q: 'What is GEO (generative engine optimization)?', aHtml: 'Generative engine optimization (GEO) is the work of keeping your brand described the same way across every generative AI surface. SEO earns the ranking and AEO earns the citation. GEO makes sure the entity behind both stays coherent everywhere a model encounters it.' },
        { q: 'Is AEO replacing SEO?', aHtml: 'No. AEO sits on top of SEO. The domain authority and content quality that rank you on Google are the same signals that teach an AI engine to trust and cite you. Drop SEO and your AEO loses its foundation.' },
        { q: 'How do you measure AI visibility?', aHtml: 'We track a set of buyer prompts across the major AI engines and measure how often your brand is cited, at what position, and against which competitors. The core metrics are visibility, share of voice, and average position inside the answer — reported weekly and tied back to branded search and pipeline.' },
        { q: 'How much does an AEO agency cost?', aHtml: 'Most B2B SaaS SEO and AEO programs at LoudFace start <strong>from $5k per month</strong> on a three-month minimum. No setup fee, no long lock-in past the first quarter. After the foundation audit you get a fixed monthly proposal scoped to the goals in your 90-day roadmap. <a href="/pricing">See full pricing and tiers.</a>' },
        { q: 'How long before I see results?', aHtml: 'Technical fixes and early AEO wins often move inside the first 30 to 60 days. Content authority and organic rankings compound over 90 to 180 days. We set 90-day goals and report against them honestly, with no inflated projections.' },
      ],
    },
    rel: {
      title: (
        <>
          Search rarely wins <span className="ghost">alone.</span>
        </>
      ),
      note: 'SEO, AEO, and GEO feed each other — and the same team builds and converts the pages they earn. Nothing gets re-briefed between the people who rank you and the people who ship your site.',
    },
    cover: {
      h2: 'Find out if your brand shows up where your buyers are looking.',
      p: 'We’ll check your AI search presence across ChatGPT, Perplexity, Gemini, Google AI Mode, and Copilot, and show you exactly where the gaps are.',
      metaRight: 'B2B SaaS only',
      creditLeft: 'Cover — Toku, grown by LoudFace',
      obj: { ...shot('toku', ''), rpillLabel: 'SEO & AEO', rpillClient: 'Toku' },
    },
  },

  /* ========================= GEO AGENCY ========================= */
  'geo-agency': {
    slug: 'geo-agency',
    ariaLabel: 'Generative engine optimization agency for B2B SaaS',
    hero: {
      eyebrow: 'Generative Engine Optimization · AEO · AI search',
      h1: (
        <>
          Generative Engine Optimization (GEO) agency for B2B SaaS. <span className="soft">Become the answer AI gives.</span>
        </>
      ),
      blurb:
        'We engineer your content, entity signals, and third-party presence so ChatGPT, Perplexity, and Google AI Overviews name you when a buyer asks which vendor to pick — measured as share of answer, not just traffic.',
      secondary: AUDIT,
      chip: { value: '86%', label: 'Toku share of answer, core prompt' },
      main: { ...shot('toku', 'Toku, cited by AI engines after LoudFace’s GEO program'), rpillLabel: 'GEO program', rpillClient: 'Toku' },
      frag: shot('montblanc', ''),
    },
    logosLead: 'AI-answer visibility built for B2B SaaS teams',
    deliver: {
      title: (
        <>
          What a real GEO program <span className="ghost">delivers.</span>
        </>
      ),
      lede:
        'Being cited by an AI engine is a chain: the page has to be reachable, extractable, and trusted — and present in the corpus the engine retrieves from. We own every link in it.',
      tiles: [
        { title: 'AI citation tracking', desc: 'A live Peec panel across ChatGPT, Perplexity, and Google AI Overviews, reported per engine every week. It’s the panel behind Toku’s share-of-answer snapshot on its core prompt.' },
        { title: 'Content built for extraction', desc: 'Answer-first pages that hand the engine a liftable unit — a ranked roster, a hard-number table, a tight TL;DR — in the first screen. Engines quote pre-formatted units; prose-only pages get retrieved and passed over.' },
        { title: 'Entity and schema structuring', desc: 'Consistent entity language plus Service, FAQPage, and ItemList schema, so engines resolve who you are and what you sell. We map your brand to knowledge-graph entities and mark up every liftable unit.' },
        { title: 'Third-party corpus presence', desc: 'Placement in the rosters, reviews, and communities each engine retrieves from. An engine can only cite a page that reaches its retrieved set — so we get you into the vendor lists and community threads the models pull.' },
        { title: 'AI-crawler access', desc: 'The citation crawlers (OAI-SearchBot, PerplexityBot, ClaudeBot) must reach your pages. We audit crawler access first, separate the search crawlers you want from the training crawlers you may not, and clear the blocks keeping you out of the retrieved set.' },
        { title: 'Reporting and attribution', desc: 'One scoreboard: visibility, position when cited, sentiment, and competitor split, weekly and per engine — the number your board tracks quarter to quarter, tied to branded search and pipeline.' },
      ],
    },
    runway: {
      title: (
        <>
          One program across every <span className="ghost">engine.</span>
        </>
      ),
      lede:
        'We own the roadmap and ship from week one. One retainer, one senior team, one scoreboard. Every move is scored against a single metric: your share of answer on the prompts your buyers actually ask.',
      pillars: [
        { kind: 'row', fig: 0, title: 'Generative visibility audit', desc: 'We map how every major engine answers your buyers’ prompts today: who gets named, who gets cited, at what position, and which pages the models pull from. You get your starting share of answer, engine by engine, plus the crawler-access check most audits skip.' },
        { kind: 'card', title: 'Citation-surface foundation', desc: 'Entity language, structured data, and answer blocks engineered so models can parse and quote you. Every priority page gets a liftable artifact in the first screen — a TL;DR, a hard-number table, or a ranked roster. Deployment starts in week one.' },
        { kind: 'row', fig: 2, title: 'Citable asset engine', desc: 'New rosters, comparisons, and decision pages matched to the tracked buyer prompts you’re losing, plus placement in the third-party lists and communities each engine reads from. On-page format and off-page corpus run together, because engines only cite what they retrieve.' },
        { kind: 'card', title: 'Per-engine measurement', desc: 'Weekly share-of-answer reporting split by engine, never blended. ChatGPT, Perplexity, and Google AI Overviews reward different things and move independently — so we track and tune each one separately.' },
      ],
    },
    exhibit: {
      art: shot('toku', 'Toku, cited by AI engines after LoudFace’s GEO program'),
      eyebrow: 'Featured program',
      h2: 'Cited in 86% of AI answers on the core prompt.',
      domLine: (
        <>
          <b>Toku</b> · toku.com · Payroll &amp; compliance
        </>
      ),
      what:
        'On Toku’s core crypto-payroll prompt, the brand appears in 86% of AI answers at average position 2.4 — a 30-day visibility snapshot, eighteen months into the program. Share of answer, tracked per engine, not a one-run ranking.',
      annots: [
        { em: 'Answer-first artifacts', span: 'A liftable unit in the first screen' },
        { em: 'Per-engine tracking', span: 'ChatGPT, Perplexity, AI Overviews' },
        { em: 'Corpus placement', span: 'In the lists the models retrieve' },
      ],
      out: { num: '86%', label: 'Of AI answers on Toku’s core prompt', src: 'Toku · GEO · 30-day snapshot, avg position 2.4' },
      ctaLabel: 'See the full case study',
      ctaHref: TOKU_HREF,
    },
    proof: {
      track: 'grow',
      title: (
        <>
          Share of answer, <span className="ghost">not just traffic.</span>
        </>
      ),
      lede:
        'What separates GEO programs isn’t whether they claim the label — it’s whether they can show a per-engine share-of-answer number and the pages that earned it. Ours is public.',
      hero: { num: '86%', label: 'Toku’s share of answer on its core prompt — a 30-day snapshot, avg position 2.4', src: 'Toku · GEO' },
      extra: { num: '7+', label: 'AI engines monitored — ChatGPT, Perplexity, Gemini, and more' },
    },
    faq: {
      title: (
        <>
          Common questions about our <span className="ghost">GEO program.</span>
        </>
      ),
      items: [
        { q: 'What does a GEO agency do?', aHtml: 'It gets your brand retrieved, cited, and recommended by AI engines like ChatGPT, Perplexity, and Google AI Overviews. The work spans a visibility audit, content formatted so engines can quote it, entity and schema signals, placement in the third-party sources engines read, and per-engine measurement. The outcome metric is share of answer: how often the engines name you when buyers ask.' },
        { q: 'Is AEO the same as GEO?', aHtml: 'In practice, yes. GEO (generative engine optimization), AEO (answer engine optimization), LLM SEO, and AI search optimization describe one discipline, and the models treat GEO as the head term. The soft nuance: AEO emphasizes direct answers, GEO emphasizes generative synthesis.' },
        { q: 'How much does GEO cost?', aHtml: 'LoudFace GEO programs start <strong>from $5,000 per month</strong> on a three-month initial engagement, with no setup fee. Across the market, 2026 pricing guides put most serious GEO and AEO retainers at $3,000 to $15,000 per month.' },
        { q: 'How long until AI engines cite my brand?', aHtml: 'Three speeds. First pickup on an open prompt can land within hours in Google AI Overviews and within a day in Perplexity, if your brand already has modest authority. A consistent slot in the cited set takes weeks. Dominant share of answer on a competitive prompt cluster takes months. We set 90-day goals and report against them.' },
        { q: 'Can you guarantee citations in ChatGPT?', aHtml: 'No, and walk away from anyone who does. The strongest public study found AI answers return a different brand list more than 99% of the time on repeat runs, so tomorrow’s exact citation is never guaranteed. What we control and grow is your consideration-set membership and your visibility rate over many samples. We measure it. We don’t promise it.' },
        { q: 'How is GEO different from SEO?', aHtml: 'SEO competes to rank a link you click. GEO competes to be the answer the engine synthesizes and cites. The citation sets barely overlap — ranking first on Google does not hand you the AI answer. That gap is the entire reason GEO is a distinct program and not a rename of your SEO retainer.' },
        { q: 'Do I still need SEO if I invest in GEO?', aHtml: 'Yes. Google’s AI Overviews run on the same core ranking systems as organic Search, and every generative engine retrieves before it cites, so the technical health and authority that rank you keep feeding the retrieval pools. Dropping SEO cuts the ground out from under GEO, which is why we run them as one program.' },
        { q: 'Seven questions to ask any GEO agency (including us)', aHtml: '<strong>1.</strong> Ask for your share of answer today — a real agency shows a per-engine baseline on the first call. <strong>2.</strong> Ask whether they report per engine or blended; a blended number hides the engine you’re losing. <strong>3.</strong> Ask what liftable artifact each page ships. <strong>4.</strong> Ask how they handle off-page — engines cite third-party lists heavily. <strong>5.</strong> Ask for named, numbered outcomes (ours: Toku, cited in 86% of AI answers on its core prompt, a 30-day snapshot, position 2.4). <strong>6.</strong> Ask for the honest timeline. <strong>7.</strong> Ask for the pricing floor in writing — ours is public: from $5,000 per month.' },
      ],
    },
    rel: {
      title: (
        <>
          GEO rarely wins <span className="ghost">alone.</span>
        </>
      ),
      note: 'GEO rides on SEO fundamentals and answer-first pages the same team writes and builds. Nothing gets re-briefed between the people who earn your citations and the people who ship your site.',
    },
    cover: {
      h2: 'Find out what AI engines say about your brand right now.',
      p: 'We’ll run your buyer prompts across ChatGPT, Perplexity, and Google AI Overviews and show you your share of answer, who’s beating you to the citation, and the format and corpus gaps keeping you out.',
      metaRight: 'B2B SaaS only',
      creditLeft: 'Cover — Toku, grown by LoudFace',
      obj: { ...shot('toku', ''), rpillLabel: 'GEO program', rpillClient: 'Toku' },
    },
  },

  /* ========================= GROWTH AUTOPILOT ========================= */
  'growth-autopilot': {
    slug: 'growth-autopilot',
    ariaLabel: 'Growth Autopilot — SEO, AEO and CRO as one system',
    hero: {
      eyebrow: 'Growth Autopilot System',
      h1: (
        <>
          Turn your website into <span className="soft">a revenue channel.</span>
        </>
      ),
      blurb:
        'We run SEO, AEO, and CRO as one integrated system — so your website stops being a brochure and starts generating qualified pipeline.',
      secondary: AUDIT,
      chip: { value: '200+', label: 'B2B brands grown' },
      main: { ...shot('toku', 'Toku grown by LoudFace’s integrated growth system'), rpillLabel: 'Growth system', rpillClient: 'Toku' },
      frag: shot('dimer', ''),
    },
    logosLead: 'One integrated growth system for B2B SaaS teams',
    deliver: {
      title: (
        <>
          Three disciplines. <span className="ghost">One system.</span>
        </>
      ),
      lede:
        'Not deliverables — an integrated growth engine where SEO feeds AEO visibility, and AEO-optimized content feeds CRO. Each layer compounds the one before it.',
      tiles: [
        { title: 'SEO', desc: 'Technical foundation, content architecture, and keyword strategy built for pipeline — not vanity metrics. Technical audit and remediation, buyer-intent content, category authority, and programmatic page infrastructure.', chips: ['Technical SEO', 'Content strategy', 'Category authority'] },
        { title: 'AEO', desc: 'AI Engine Optimization — making your brand the answer when buyers ask ChatGPT, Perplexity, or Google AI Overviews who solves their problem. Mention audit, schema, competitive gap analysis, and an answer-optimized content layer.', chips: ['AI mention audit', 'Schema', 'Answer layer'] },
        { title: 'CRO', desc: 'Conversion rate optimization on every page that matters — turning qualified traffic into booked demos and pipeline. Conversion audit and copy overhaul, landing-page experimentation, positioning clarity, and a monthly iteration cadence.', chips: ['Conversion audit', 'Experimentation', 'Positioning'] },
      ],
    },
    runway: {
      title: (
        <>
          A system, <span className="ghost">not a service package.</span>
        </>
      ),
      lede:
        'Most agencies sell you deliverables: blog posts, backlinks, a redesign. We build an integrated growth engine where SEO feeds AEO visibility, and AEO-optimized content feeds CRO. Each layer compounds the one before it.',
      pillars: [
        { kind: 'row', fig: 0, title: 'SEO — the foundation', desc: 'Technical foundation, content architecture, and keyword strategy built for pipeline, not vanity metrics. This is the layer everything else compounds on.' },
        { kind: 'card', title: 'AEO — the visibility layer', desc: 'Making your brand the answer when buyers ask ChatGPT, Perplexity, or Google AI Overviews who solves their problem. SEO authority feeds the citations; the citations feed the pipeline.' },
        { kind: 'row', fig: 1, title: 'CRO — where it converts', desc: 'Conversion rate optimization on every page that matters — turning the qualified traffic SEO and AEO earn into booked demos and pipeline. The compound effect is where the ROI lives.' },
      ],
    },
    exhibit: {
      art: shot('toku', 'Toku grown by LoudFace’s integrated growth system'),
      eyebrow: 'Featured system',
      h2: 'One system took Toku to 86% AI visibility.',
      domLine: (
        <>
          <b>Toku</b> · toku.com · Payroll &amp; compliance
        </>
      ),
      what:
        'SEO, AEO, and CRO run as one program by one team — the authority that ranks the pages is the authority that gets them cited by AI, and the same pages are built to convert the traffic they earn.',
      annots: [
        { em: 'SEO feeds AEO', span: 'Authority earns the citation' },
        { em: 'AEO feeds CRO', span: 'Cited pages convert the traffic' },
        { em: 'One team, one scoreboard', span: 'No vendor fragmentation' },
      ],
      out: { num: '0 → 86%', label: 'Toku AI visibility on its core prompt', src: 'Toku · integrated growth · from a standing start' },
      ctaLabel: 'See the full case study',
      ctaHref: TOKU_HREF,
    },
    proof: {
      track: 'grow',
      title: (
        <>
          Pipeline that <span className="ghost">compounds.</span>
        </>
      ),
      lede:
        'Three vendors running three separate playbooks means nothing connects and nothing compounds. Growth Autopilot integrates SEO, AEO, and CRO into a single system, run by one team.',
      hero: { num: '0 → 86%', label: 'Toku’s AI visibility on its core prompt, from a standing start', src: 'Toku · integrated growth' },
      extra: { num: '1 team', label: 'For SEO, AEO, and CRO — no vendor fragmentation' },
    },
    faq: {
      title: (
        <>
          Common questions about <span className="ghost">Growth Autopilot.</span>
        </>
      ),
      items: [
        { q: 'How is this different from hiring separate SEO, AEO, and CRO agencies?', aHtml: 'Most companies run three separate vendors with three separate playbooks. Nothing connects. Nothing compounds. Growth Autopilot integrates all three into a single system where SEO feeds AEO visibility, and AEO-optimized content feeds CRO. One team, one strategy, one Scoreboard.' },
        { q: 'What kind of companies is this for?', aHtml: 'B2B SaaS and tech companies, typically $1M–$50M ARR, who have a website that should be generating pipeline but isn’t. If your growth metrics and your pipeline don’t match, Growth Autopilot is built for you.' },
        { q: 'What does the free AI Visibility Audit include?', aHtml: 'We manually check whether your brand is being cited in ChatGPT, Perplexity, and Google AI Overviews when buyers search your category. You get a detailed Loom walkthrough covering your current AI visibility, competitive gaps, schema issues, and 3 actionable fixes — done personally by our founder.' },
        { q: 'How long before I see results?', aHtml: 'Quick wins — headline, CTA, and above-the-fold improvements — can move numbers within the first 30 days. SEO and AEO gains compound over 90-day cycles. We set clear goals at the start and report against them weekly.' },
        { q: 'Do I need to manage anything?', aHtml: 'No. We own the roadmap, prioritization, execution, and reporting. You get a single point of contact, regular syncs, and a shared Scoreboard. Zero task management on your end.' },
        { q: 'Can I start with one track and expand later?', aHtml: 'Yes. The Solo Autopilot tier gives you one focused track — either Webflow Build or SEO/AEO Growth. You can upgrade to Dual Autopilot or Scale Autopilot at any time as your needs grow. <a href="/pricing">See packages and pricing.</a>' },
      ],
    },
    rel: {
      title: (
        <>
          The whole system, <span className="ghost">one team.</span>
        </>
      ),
      note: 'Growth Autopilot is the seven services run as one program. Start on a single track and add the rest whenever it makes sense — it’s the same team either way, so nothing gets re-briefed.',
    },
    cover: {
      h2: 'Pipeline that compounds.',
      p: 'If your growth metrics and your pipeline don’t match, the system is broken. Let’s fix the system — starting with a free AI Visibility Audit.',
      metaRight: 'B2B SaaS only',
      creditLeft: 'Cover — Toku, grown by LoudFace',
      obj: { ...shot('toku', ''), rpillLabel: 'Growth system', rpillClient: 'Toku' },
    },
  },
};

export function getServiceConfig(slug: string): ServiceConfig | undefined {
  return SERVICE_CONFIGS[slug];
}
