'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

const STEPS = [
  {
    id: 'strategy',
    gate: 'Week 0',
    title: 'Strategy call',
    body: 'We talk for 30 minutes. You tell us what’s broken, what you’ve tried, and what good looks like. We tell you honestly whether we’re the right fit. If we are, we send a scope and timeline within 48 hours.',
    facts: ['30-minute call', 'Honest fit check', 'Scope and timeline within 48 hours'],
  },
  {
    id: 'build',
    gate: 'Weeks 1–4',
    title: 'Design and build',
    body: 'We handle positioning, copy, design, and Webflow development in parallel. You see working pages, not static mockups. Your team reviews in weekly syncs and has CMS access from week two.',
    facts: ['Working pages', 'Weekly review syncs', 'CMS access from week two'],
  },
  {
    id: 'launch',
    gate: 'Weeks 4–6 · Live',
    title: 'Launch and measure',
    body: 'We launch, set up analytics, and establish baseline metrics. We track the numbers that connect to pipeline: organic traffic, conversion rates, form submissions, and qualified lead volume.',
    facts: ['Analytics baseline', 'Pipeline-linked metrics', 'No vanity dashboards'],
  },
  {
    id: 'grow',
    gate: 'Month 3+',
    title: 'Grow and optimize',
    body: 'SEO, AEO, and CRO start. We publish content, optimize pages, and run conversion experiments. You get a monthly report with what we did, what moved, and what we will do next.',
    facts: ['SEO, AEO, and CRO', 'Monthly evidence report', 'Clear next actions'],
  },
] as const;

/**
 * Engagement navigator composed from beUI, shadcn/ui, Transitions.dev,
 * Aceternity, Mobbin, Canvas UI, and 60fps references.
 */
export function ProcessTabs() {
  const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
  const activeIndex = Math.max(0, STEPS.findIndex((step) => step.id === activeStep));

  return (
    <section className="lego-process" aria-labelledby="lego-process-title">
      <div className="container">
        <div className="lego-process-head">
          <div>
            <span className="lego-kicker dark">The engagement</span>
            <h2 id="lego-process-title" className="sec">
              How an engagement works
            </h2>
          </div>
          <p>No 47-slide proposals. No three-month discovery phases. Here is what actually happens.</p>
        </div>

        <Tabs
          value={activeStep}
          onValueChange={setActiveStep}
          variant="segment"
          tone="dark"
          className="process-tabs"
        >
          <TabsList
            orientation="vertical"
            ariaLabel="Engagement stages"
            className="process-tabs-list"
          >
            {STEPS.map((step) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className="process-tab"
                indicatorClassName="process-tab-indicator"
              >
                <span className="process-tab-gate">{step.gate}</span>
                <span className="process-tab-title">{step.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="process-stage">
            <div className="process-progress" aria-hidden="true">
              <span className="process-progress-fill" style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }} />
              {STEPS.map((step, index) => (
                <i key={step.id} className={index <= activeIndex ? 'reached' : ''}></i>
              ))}
            </div>

            {STEPS.map((step) => (
              <TabsContent key={step.id} value={step.id} className="process-panel">
                <span className="process-panel-gate">{step.gate}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <ul>
                  {step.facts.map((fact) => (
                    <li key={fact}>
                      <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="m4 9 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {fact}
                    </li>
                  ))}
                </ul>
                <a href="#book-modal" data-cal-trigger className="process-cta">
                  Book a strategy call
                  <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M1.5 6.5h10M8 2.5l4 4-4 4" />
                  </svg>
                </a>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
