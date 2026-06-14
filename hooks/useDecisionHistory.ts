'use client';

import { useState } from 'react';
import type { DecisionLog } from '@/types/decisions';

export function useDecisionHistory() {
  const [selectedLog, setSelectedLog] = useState<DecisionLog | null>(null);

  return {
    selectedLog,
    setSelectedLog,
  };
}
