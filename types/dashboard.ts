import type { LucideIcon } from 'lucide-react';
import type { PipelineRunStatus } from '@/constants/pipeline';
import type { PipelineAgentRun, PipelineRecommendation, PipelineStatus } from '@/hooks/useAnalysis';
import type { RefreshOptions } from '@/hooks/useCompetitorSnapshots';
import type { CompetitorData, CompetitorMenuItem, CompetitorPromo } from '@/lib/types';
import type { WeatherData } from '@/lib/types';

// Card
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  overflow?: boolean;
}

// CardHeading
export interface CardHeadingProps {
  children: React.ReactNode;
  className?: string;
}

// PageHeader
export interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

// InputLabel
export interface InputLabelProps {
  children: React.ReactNode;
  className?: string;
}

// ErrorAlert
export interface ErrorAlertProps {
  message: string;
  className?: string;
}

// EmptyState
export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

// SubmitButton
export interface SubmitButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

// StatCardGrid
export interface StatCardData {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export interface StatCardGridProps {
  cards: StatCardData[];
  className?: string;
}

// Timeline
export type TimelineStepStatus = 'complete' | 'active' | 'failed' | 'pending';

export interface TimelineStepData {
  label: string;
  description: string;
  status: TimelineStepStatus;
}

export interface TimelineStepProps {
  step: TimelineStepData;
}

export interface TimelineProps {
  title: string;
  steps: TimelineStepData[];
  className?: string;
}

// DashboardLayout
export interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Home components
export interface RecommendationPanelProps {
  summary: string;
  confidence: number;
  actions: string[];
}

export interface PriorityActionsProps {
  actions: string[];
}

export interface RunAnalysisCardProps {
  businessId: string;
  onBusinessIdChange: (id: string) => void;
  onRun: () => void;
  onCancel: () => void;
  loading: boolean;
  running: boolean;
  error: string | null;
}

export interface WeatherSearchCardProps {
  city: string;
  onCityChange: (city: string) => void;
  onSearch: () => void;
  loading: boolean;
  error: string | null;
}

export interface WeatherDisplayCardProps {
  data: WeatherData;
}

export interface WeatherDetailCardProps {
  data: WeatherData;
}

export interface WeatherStatsOverviewProps {
  city: string;
  country: string;
  temperature: number;
  condition: string;
}

export interface AnalysisStatsProps {
  status: PipelineStatus;
}

export interface AnalysisRecommendationProps {
  recommendation: PipelineRecommendation;
}

export interface PipelineTimelineProps {
  runs: PipelineAgentRun[];
}

export interface AgentTimelineProps {
  runs: PipelineAgentRun[];
}

export interface HomeAgentTimelineProps {
  steps?: TimelineStepData[];
  title?: string;
}

export interface RecentRun {
  id: string;
  businessId: string;
  status: string;
  completedAt: string;
}

export interface RecentRunsProps {
  runs: RecentRun[];
}

export interface OverviewCardsProps {
  cards: StatCardData[];
}

export interface CategorizationInsight {
  name: string;
  trend: string;
  color: string;
}

export interface CategorizationInsightsProps {
  insights: CategorizationInsight[];
}

// ConfidenceBadge
export type ConfidenceLevel = 'low' | 'medium' | 'high';

// PipelineStatusBadge
export interface PipelineStatusBadgeProps {
  status: PipelineRunStatus;
}

// Competitor components
export interface CompetitorSnapshotCardProps {
  data: CompetitorData;
  collectedAt: string;
  expiresAt: string;
}

export interface CompetitorScrapeFormProps {
  businessId: string;
  disabled: boolean;
  busy: boolean;
  onSubmit: (options: RefreshOptions) => void;
}

export interface CompetitorEmptyHintProps {
  message: string;
}

export interface CompetitorNotesListProps {
  notes: string[];
}

export interface CompetitorPromoListProps {
  promos: CompetitorPromo[];
}

export interface CompetitorItemTableProps {
  items: CompetitorMenuItem[];
}

// Analysis markdown
export interface RecommendationMarkdownProps {
  content: string;
}

// Analysis action item
export interface RecommendationActionItemProps {
  actionType: string;
  item: string;
  details: RecommendationActionDetails | null;
}

export interface RecommendationActionDetails {
  reason?: string;
  priority?: number;
  discountPercent?: number;
}

// Analysis view
export interface RecommendationViewProps {
  recommendation: NonNullable<PipelineRecommendation>;
}

// Analysis action list
export interface RecommendationActionListProps {
  actions: NonNullable<PipelineRecommendation>['actions'];
}

// Agent timeline meta
export interface AgentTimelineMeta {
  label: string;
  description: string;
  Icon: LucideIcon;
}

// FeatureCard
export interface FeatureCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}

// Home dashboard data
export interface HomeDashboardData {
  weather: WeatherData | null;
  recommendation: {
    summary: string;
    confidence: number;
    actions: string[];
  };
  priorityActions: string[];
  recentRuns: RecentRun[];
  categorizationInsights: CategorizationInsight[];
}

// Competitor history
export interface CompetitorHistoryItem {
  name: string;
  time: string;
}

export interface CompetitorTableRow {
  name: string;
  price: string;
  category: string;
  promo: string | null;
  score: number;
}
