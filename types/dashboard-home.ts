import type { LucideIcon } from 'lucide-react';

export interface StatWidgetProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  accentColor?: 'blue' | 'green' | 'amber';
}

export interface WeatherWidgetProps {
  data: import('@/lib/types').WeatherData;
}

export interface WelcomeBannerProps {
  weather: import('@/lib/types').WeatherData | null;
  businessName?: string;
}

export interface PipelineStep {
  label: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  description?: string;
}

export interface PipelineVisualizationProps {
  runs: import('@/hooks/useAnalysis').PipelineAgentRun[];
  isRunning: boolean;
}

export interface QuickActionsProps {
  actions?: import('@/constants/quick-actions').QuickAction[];
}

export interface RecentActivityProps {
  items?: import('@/constants/activity').ActivityItem[];
}

export interface RecommendationWidgetProps {
  recommendations?: import('@/constants/recommendations').RecommendationItem[];
}

export interface CompetitorOverviewProps {
  competitors?: import('@/constants/competitor-display').CompetitorOverviewItem[];
}

export interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  color?: string;
  size?: 'sm' | 'md';
}

export interface MenuItemCardProps {
  item: import('@/lib/menu/types').MenuItem;
  isControlled: boolean;
  isUnavailable: boolean;
  onToggleControlled: () => void;
  onToggleUnavailable: () => void;
  index: number;
}

export interface ScrapeFormProps {
  businessId: string;
  disabled: boolean;
  busy: boolean;
  onSubmit: (options: { url?: string; timeoutMs?: number; maxTextLength?: number }) => void;
}
