export type DecisionStatus = 'auto-approved' | 'pending' | 'approved' | 'rejected';

export interface DecisionAction {
  id: string;
  actionType: string;
  item: string;
  details?: {
    reason?: string;
    priority?: number;
    discountPercent?: number;
    itemId?: string;
  };
}

export interface Decision {
  id: string;
  businessId: string;
  actionId: string;
  actionType: string;
  item: string;
  details: Record<string, unknown> | null;
  status: DecisionStatus;
  confidence: string | null;
  summary: string | null;
  decidedAt: Date | null;
  reason: string | null;
  createdAt: Date;
}

export interface DecisionLog {
  id: string;
  decisionId: string;
  action: string;
  item: string;
  discountPercent?: number;
  priority?: number;
  status: DecisionStatus;
  decidedAt: Date;
  reason?: string | null;
  confidence?: string | null;
  summary?: string | null;
}

export interface DecisionQueueProps {
  pending: Decision[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onShowDetails: (decision: Decision) => void;
  onBulkApprove: () => void;
}

export interface DecisionHistoryProps {
  logs: DecisionLog[];
}

export interface DecisionDetailsModalProps {
  decision: Decision | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export interface DecisionCardProps {
  decision: Decision;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onShowDetails?: (decision: Decision) => void;
  index?: number;
}
