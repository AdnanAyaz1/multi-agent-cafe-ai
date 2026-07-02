import type { PipelineRecommendation } from '@/hooks/useAnalysis';
import type { Decision } from '@/types/decisions';
import type { UseFormReturn } from 'react-hook-form';
import type { AnalysisFormInput } from '@/lib/validators/analysis';
import type { MenuCategory } from '@/constants/menu';
import type { WeatherData } from '@/lib/types';

export interface MenuHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export interface MenuStatsProps {
  totalItems: number;
  controlledCount: number;
  unavailableCount: number;
}

export interface MenuSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onControlAll: () => void;
  onReleaseAll: () => void;
}

export interface MenuCategoryTabsProps {
  activeCategory: MenuCategory | 'all';
  onCategoryChange: (category: MenuCategory | 'all') => void;
  itemCounts: Record<string, number>;
  totalItems: number;
}

export interface WeatherHeroProps {
  weather: WeatherData;
}

export interface WeatherImpactSidebarProps {
  impact: 'low' | 'medium' | 'high';
}

export interface WeatherSearchFormProps {
  city: string;
  onCityChange: (city: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSearch: () => void;
  loading: boolean;
  error: string | null;
}

export interface DecisionsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface DecisionsTabSwitcherProps {
  activeTab: 'pending' | 'history';
  onTabChange: (tab: 'pending' | 'history') => void;
  pendingCount: number;
}

export interface DecisionsStatsProps {
  pendingCount: number;
  decidedCount: number;
  total: number;
}

export interface RecommendationActionsProps {
  recommendation: PipelineRecommendation;
  getDecisionForAction: (actionId: string) => Decision | undefined;
  onSelectDecision: (decision: Decision | null) => void;
  onApprove: (decisionId: string, actionItem?: string) => void;
  onReject: (decisionId: string, actionItem?: string) => void;
}

export interface RecommendationSummaryProps {
  recommendation: PipelineRecommendation;
}

export interface AnalysisSearchFormProps {
  form: UseFormReturn<AnalysisFormInput>;
  isRunning: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onCancel: () => void;
}
