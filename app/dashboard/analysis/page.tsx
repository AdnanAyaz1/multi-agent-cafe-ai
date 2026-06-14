'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAnalysisPage } from '@/hooks/useAnalysisPage';
import { AgentShowcase } from '@/components/dashboard/home/AgentShowcase';
import { PipelineVisualization } from '@/components/dashboard/home/PipelineVisualization';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import { AnalysisHeader } from '@/components/dashboard/analysis/AnalysisHeader';
import { AnalysisSearchForm } from '@/components/dashboard/analysis/AnalysisSearchForm';
import { RecommendationSummary } from '@/components/dashboard/analysis/RecommendationSummary';
import { RecommendationActions } from '@/components/dashboard/analysis/RecommendationActions';

export default function AnalysisPage() {
  const {
    form,
    isRunning,
    loading,
    error,
    status,
    cancel,
    recommendation,
    selectedDecision,
    setSelectedDecision,
    handleRun,
    handleApprove,
    handleReject,
    getDecisionForAction,
  } = useAnalysisPage();

  return (
    <div className="space-y-8">
      <AnalysisHeader />

      <AnalysisSearchForm
        form={form}
        isRunning={isRunning}
        loading={loading}
        error={error}
        onSubmit={handleRun}
        onCancel={cancel}
      />

      <AnimatePresence mode="wait">
        {status ? (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="space-y-8">
            <PipelineVisualization runs={status.agentRuns} isRunning={isRunning} />

            {recommendation && (
              <>
                <RecommendationSummary recommendation={recommendation} />

                <RecommendationActions
                  recommendation={recommendation}
                  getDecisionForAction={getDecisionForAction}
                  onSelectDecision={setSelectedDecision}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </>
            )}
          </motion.div>
        ) : (
          <AgentShowcase key="showcase" />
        )}
      </AnimatePresence>

      <DecisionDetailsModal
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
        onApprove={(id) => handleApprove(id, selectedDecision?.item ?? 'action')}
        onReject={(id) => handleReject(id, selectedDecision?.item ?? 'action')}
      />
    </div>
  );
}
