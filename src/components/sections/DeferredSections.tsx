'use client';

import dynamic from 'next/dynamic';
import type { CaseStudy, Testimonial, BlogPost, Category, TeamMember } from '@/lib/types';

// Dynamic import with ssr:false — removes HTML + RSC payload (~100KB)
// from the initial document. These sections are 5+ screens below the fold
// on mobile. Googlebot executes JS so content is still indexed.
const CaseStudySlider = dynamic(
  () => import('@/components/sections/CaseStudySlider').then(m => ({ default: m.CaseStudySlider })),
  { ssr: false },
);

const Knowledge = dynamic(
  () => import('@/components/sections/Knowledge').then(m => ({ default: m.Knowledge })),
  { ssr: false },
);

interface DeferredCaseStudySliderProps {
  title: string;
  caseStudies: CaseStudy[];
  testimonials: Map<string, Testimonial>;
}

export function DeferredCaseStudySlider(props: DeferredCaseStudySliderProps) {
  return <CaseStudySlider {...props} />;
}

interface DeferredKnowledgeProps {
  title: string;
  highlightWord: string;
  description: string;
  posts: BlogPost[];
  categories: Category[];
  authors: Pick<TeamMember, 'id' | 'name'>[];
}

export function DeferredKnowledge(props: DeferredKnowledgeProps) {
  return <Knowledge {...props} authors={props.authors as TeamMember[]} />;
}
