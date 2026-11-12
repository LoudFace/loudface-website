import type { StrategyTopic } from '@/sanity/lib/proposalsClient';

/**
 * The house method for the deck's strategy section (3 Nov 2026), in a
 * buyer's words. A proposal fills only what we would do first for that
 * client; the "how we decide" line and the proof come from here unless the
 * proposal overrides them. About 30 words each: at 45 the section ran
 * 1,900px beside the proof rail.
 *
 * Source: the Team App's strategy playbook (loudface-spine,
 * app/src/lib/playbook.ts, Library › Playbook), written from Slack, client
 * calls, the team's sessions and the Spine's records. Change the two
 * together.
 *
 * Every proof line is the headline of a live case-study page on
 * loudface.co, read on 3 Nov 2026. When a case page changes what it leads
 * with, change the line here in the same commit.
 */
export const STRATEGY_HOUSE: Record<StrategyTopic, { label: string; how: string; proof: string }> = {
  keywords: {
    label: 'Keywords',
    how: 'Google searches with a buyer behind them that nobody defends yet: low difficulty, real volume, or pages already on page two. One page each, with a written reason. Contested terms come later.',
    proof: 'Genie Teacher: Google clicks per week up 72× since May.',
  },
  questions: {
    label: 'AI questions',
    how: 'Those searches become the questions buyers ask ChatGPT, Perplexity and Google’s AI, about 100 tracked every day on each engine. You correct the list. We measure how often the answer names you.',
    proof: 'Transalis: AI visibility from 5.2% to 16.5% on the same 73 questions, the fastest climb of ten EDI providers.',
  },
  competitors: {
    label: 'Competitors',
    how: 'Who you lose deals to, from you, and who AI names instead of you, from the answers. We read what AI cites for them and what they rank for that you don’t.',
    proof: 'Pond: its Applause and Testlio alternatives page was cited by ChatGPT one day after it went live.',
  },
  content: {
    label: 'Content',
    how: 'Three pieces written with you set the voice. Then your package’s pace from those lists: comparisons, ranked lists, guides and case studies. Each is fact-checked twice and read by a person.',
    proof: 'Delshad Legal: Google clicks per week 16× the June level, outside its famous-case pages.',
  },
  offsite: {
    label: 'Off your site',
    how: 'We rank the pages AI cites for your buyers’ questions and go after the ones that name competitors but not you: lists, directories, review sites. Short pitches, never bought links.',
    proof: 'Our own site: AI visibility on non-branded buyer questions from 0.13% in April to 21.5% in September 2026.',
  },
};
