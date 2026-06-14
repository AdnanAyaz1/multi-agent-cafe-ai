'use client';

import { Loader2 } from 'lucide-react';
import { useDecisionsPage } from '@/hooks/useDecisionsPage';
import { DecisionQueue } from '@/components/dashboard/decisions/DecisionQueue';
import { DecisionHistory } from '@/components/dashboard/decisions/DecisionHistory';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import { DecisionsHeader } from '@/components/dashboard/decisions/DecisionsHeader';
import { DecisionsStats } from '@/components/dashboard/decisions/DecisionsStats';
import { DecisionsTabSwitcher } from '@/components/dashboard/decisions/DecisionsTabSwitcher';
import { DecisionsPagination } from '@/components/dashboard/decisions/DecisionsPagination';

export default function DecisionsPage() {
  const {
    pending,
    loading,
    page,
    totalPages,
    total,
    setPage,
    selectedDecision,
    setSelectedDecision,
    tab,
    setTab,
    handleApprove,
    handleReject,
    handleBulkApprove,
    historyLogs,
  } = useDecisionsPage();

  return (
    <div className="space-y-8">
      <DecisionsHeader />

      <DecisionsStats
        pendingCount={pending.length}
        decidedCount={total - pending.length}
        total={total}
      />

      <DecisionsTabSwitcher
        activeTab={tab}
        onTabChange={setTab}
        pendingCount={pending.length}
      />

      {tab === 'pending' ? (
        <DecisionQueue
          pending={pending}
          onApprove={handleApprove}
          onReject={handleReject}
          onShowDetails={setSelectedDecision}
          onBulkApprove={handleBulkApprove}
        />
      ) : (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            </div>
          )}
          {!loading && <DecisionHistory logs={historyLogs} />}

          <DecisionsPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}

      <DecisionDetailsModal
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
