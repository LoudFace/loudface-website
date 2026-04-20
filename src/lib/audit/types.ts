// ─── Audit Input & Record ───────────────────────────────────────────

export interface AuditInput {
  url: string;
  email: string;
  /** Extracted server-side from URL metadata (JSON-LD → og:site_name → title → domain). */
  companyName: string;
  /** Source of the extracted brand name, for diagnostics. */
  brandSource?: 'json-ld' | 'og-site-name' | 'title' | 'domain-fallback';
  /** Deprecated — no longer user-provided; may exist on legacy records. */
  industry?: string;
}

export type AuditStatus = 'processing' | 'complete' | 'failed';

export interface AuditRecord {
  id: string;
  input: AuditInput;
  status: AuditStatus;
  progress: number; // 0-100
  currentPhase: string;
  createdAt: string; // ISO
  completedAt?: string;
  results?: AuditResults;
  error?: string;
  diagnostics?: AuditDiagnostics;
}

// ─── Diagnostics / Error Tracing ──────────────────────────────────

export interface ApiCallTrace {
  platform: AIPlatform;
  prompt: string;
  phase: 'brand-baseline' | 'competitor-context' | 'category-visibility' | 'competitor-discovery';
  status: 'success' | 'error' | 'empty';
  responseTokens?: number;
  costUsd?: number;
  errorMessage?: string;
  durationMs?: number;
}

export interface AuditDiagnostics {
  totalApiCalls: number;
  successfulCalls: number;
  failedCalls: number;
  emptyCalls: number;
  totalCostUsd: number;
  totalDurationMs: number;
  traces: ApiCallTrace[];
  competitorSource: 'dataforseo-labs' | 'ai-extracted' | 'hardcoded';
  inferredCategory: string;
  inferredEntityType: string;
  /** Confidence in the inferred category (based on keyword density across Phase 1) */
  categoryConfidence?: 'high' | 'medium' | 'low';
  /** Brand recognition was very low AND category could not be inferred — downstream
   *  Phase 2/3 results may be about unrelated entities with the same name. */
  lowEntityConfidence?: boolean;
  /** Per-slide data quality: maps slide name to its data status */
  slideData: Record<string, SlideDataQuality>;
}

export interface SlideDataQuality {
  /** Whether this slide has enough data to render meaningfully */
  hasData: boolean;
  /** Human-readable explanation of the data state */
  status: string;
  /** Data source for this slide */
  source: string;
  /** Key metrics for quick inspection */
  metrics?: Record<string, string | number>;
}

// ─── Results ────────────────────────────────────────────────────────

export interface AuditResults {
  scores: AuditScores;
  brandBaseline: BrandBaselineData;
  competitorContext: CompetitorContextData;
  categoryVisibility: CategoryVisibilityData;
  platformBreakdown: PlatformBreakdown;
  actionItems: ActionItem[];
}

export type TrafficLight = 'green' | 'amber' | 'red';
export type OverallGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface AuditScores {
  discoveryVisibility: number; // 0-100
  shareOfVoice: number; // 0-100
  competitiveStanding: number; // rank (1 = best)
  competitorsTracked: number;
  platformCoverage: number; // 0-4
  overallGrade: OverallGrade;
}

// ─── Phase 1: Brand Baseline ────────────────────────────────────────

export interface BrandBaselineData {
  queries: BrandQuery[];
  brandRecognitionScore: number; // 0-100
  accurateInfo: string[];
  inaccuracies: string[];
  gaps: string[];
}

export interface BrandQuery {
  prompt: string;
  results: PlatformResult[];
}

// ─── Phase 2: Competitor Context ────────────────────────────────────

export interface CompetitorContextData {
  competitors: CompetitorInfo[];
  queries: CompetitorQuery[];
  competitiveRecommendationRate: number; // 0-100
  shareOfVoiceByCompetitor: Record<string, number>;
}

export interface CompetitorInfo {
  domain: string;
  name: string;
  keywordIntersection: number;
}

export interface CompetitorQuery {
  prompt: string;
  targetCompetitor: string;
  results: PlatformResult[];
}

// ─── Phase 3: Category Visibility ───────────────────────────────────

export interface CategoryVisibilityData {
  queries: CategoryQuery[];
  categoryDiscoveryRate: number; // 0-100
  inferredCategory: string;
  inferredIndustry: string;
}

export interface CategoryQuery {
  prompt: string;
  results: PlatformResult[];
}

// ─── Shared: Platform Results ───────────────────────────────────────

export type AIPlatform = 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface PlatformResult {
  platform: AIPlatform;
  mentioned: boolean;
  cited: boolean;
  sentiment: Sentiment;
  snippet: string;
  sources: SourceCitation[];
  rawResponse?: string;
}

export interface SourceCitation {
  url: string;
  title?: string;
}

// ─── Platform Breakdown ─────────────────────────────────────────────

export interface PlatformBreakdown {
  chatgpt: PlatformScore;
  claude: PlatformScore;
  gemini: PlatformScore;
  perplexity: PlatformScore;
}

export interface PlatformScore {
  mentionRate: number; // 0-100
  citationRate: number; // 0-100
  sentiment: Sentiment;
  topMentions: string[];
}

// ─── Action Items ───────────────────────────────────────────────────

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  linkedService?: string; // e.g. "/services/seo-aeo"
}

// ─── DataForSEO API Types ───────────────────────────────────────────

export interface DFSLLMResponseTask {
  user_prompt: string;
  model_name?: string;
  max_output_tokens?: number;
  web_search?: boolean;
  force_web_search?: boolean;
  tag?: string;
}

export interface DFSLLMResponseResult {
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  money_spent: number;
  cost: number;
  items: DFSResponseItem[];
  extra?: {
    annotations?: DFSAnnotation[];
  };
}

export interface DFSResponseSection {
  type: 'text' | 'code' | string;
  text: string;
  annotations?: DFSAnnotation[];
}

export interface DFSResponseItem {
  type: 'reasoning' | 'message';
  // Some API versions return text at item level, others nest it in sections
  text?: string;
  sections?: DFSResponseSection[];
  annotations?: DFSAnnotation[];
}

export interface DFSAnnotation {
  type: string;
  url?: string;
  title?: string;
  snippet?: string;
}

export interface DFSCompetitorResult {
  domain: string;
  avg_position: number;
  sum_position: number;
  intersections: number;
  full_domain_metrics?: Record<string, unknown>;
}
