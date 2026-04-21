'use client';

import type { AuditResults } from '@/lib/audit/types';
import type { EntityConfidenceSignal } from './EntityConfidenceBanner';
import { CoverSlide } from './slides/CoverSlide';
import { ScorecardSlide } from './slides/ScorecardSlide';
import { MethodologySlide } from './slides/MethodologySlide';
import { BrandBaselineSlide } from './slides/BrandBaselineSlide';
import { AccurateInfoSlide } from './slides/AccurateInfoSlide';
import { GapsSlide } from './slides/GapsSlide';
import { CompetitorContextSlide } from './slides/CompetitorContextSlide';
import { CompetitiveGapSlide } from './slides/CompetitiveGapSlide';
import { CategoryVisibilitySlide } from './slides/CategoryVisibilitySlide';
import { MarketPositionSlide } from './slides/MarketPositionSlide';
import { PlatformBreakdownSlide } from './slides/PlatformBreakdownSlide';
import { VisibilitySnapshotSlide } from './slides/VisibilitySnapshotSlide';
import { WhyItMattersSlide } from './slides/WhyItMattersSlide';
import { ActionPlanSlide } from './slides/ActionPlanSlide';
import { CTASlide } from './slides/CTASlide';

interface AuditDeckProps {
  results: AuditResults;
  companyName: string;
  domain: string;
  auditDate: string;
  entityConfidence?: EntityConfidenceSignal;
  partialDataReason?: string;
}

const TOTAL_SLIDES = 15;

export function AuditDeck({ results, companyName, domain, auditDate, entityConfidence, partialDataReason }: AuditDeckProps) {
  const signal: EntityConfidenceSignal = entityConfidence ?? {
    low: false,
    brandRecognitionScore: results.brandBaseline.brandRecognitionScore,
  };

  return (
    <div className="audit-deck">
      <CoverSlide
        companyName={companyName}
        auditDate={auditDate}
        totalSlides={TOTAL_SLIDES}
        entityConfidence={signal}
        partialDataReason={partialDataReason}
      />

      <ScorecardSlide
        scores={results.scores}
        companyName={companyName}
        totalSlides={TOTAL_SLIDES}
        entityConfidence={signal}
        partialDataReason={partialDataReason}
      />

      <MethodologySlide totalSlides={TOTAL_SLIDES} />

      <BrandBaselineSlide
        data={results.brandBaseline}
        companyName={companyName}
        totalSlides={TOTAL_SLIDES}
        entityConfidence={signal}
      />

      <AccurateInfoSlide
        data={results.brandBaseline}
        totalSlides={TOTAL_SLIDES}
      />

      <GapsSlide
        data={results.brandBaseline}
        totalSlides={TOTAL_SLIDES}
      />

      <CompetitorContextSlide
        data={results.competitorContext}
        companyName={companyName}
        totalSlides={TOTAL_SLIDES}
        entityConfidence={signal}
      />

      <CompetitiveGapSlide
        data={results.competitorContext}
        companyName={companyName}
        brandShareOfVoice={results.scores.shareOfVoice}
        totalSlides={TOTAL_SLIDES}
        entityConfidence={signal}
      />

      <CategoryVisibilitySlide
        data={results.categoryVisibility}
        companyName={companyName}
        totalSlides={TOTAL_SLIDES}
        entityConfidence={signal}
      />

      <MarketPositionSlide
        scores={results.scores}
        competitorContext={results.competitorContext}
        brandBaseline={results.brandBaseline}
        companyName={companyName}
        totalSlides={TOTAL_SLIDES}
      />

      <PlatformBreakdownSlide
        data={results.platformBreakdown}
        totalSlides={TOTAL_SLIDES}
      />

      <VisibilitySnapshotSlide
        scores={results.scores}
        brandBaseline={results.brandBaseline}
        competitorContext={results.competitorContext}
        categoryVisibility={results.categoryVisibility}
        totalSlides={TOTAL_SLIDES}
      />

      <WhyItMattersSlide
        companyName={companyName}
        totalSlides={TOTAL_SLIDES}
      />

      <ActionPlanSlide
        actionItems={results.actionItems}
        totalSlides={TOTAL_SLIDES}
      />

      <CTASlide
        companyName={companyName}
        totalSlides={TOTAL_SLIDES}
      />
    </div>
  );
}
