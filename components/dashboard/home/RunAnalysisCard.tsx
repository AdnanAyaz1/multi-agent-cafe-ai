import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import { InputLabel } from '../ui/InputLabel';
import { FormInput } from '../ui/FormInput';
import { SubmitButton } from '../ui/SubmitButton';
import { ErrorAlert } from '../ui/ErrorAlert';
import type { RunAnalysisCardProps } from '@/types/dashboard';

export function RunAnalysisCard({
  businessId,
  onBusinessIdChange,
  onRun,
  onCancel,
  loading,
  running,
  error,
}: RunAnalysisCardProps) {
  return (
    <Card>
      <CardHeading className="mb-4">Run Analysis</CardHeading>
      <div className="space-y-4">
        <div>
          <InputLabel>Business ID</InputLabel>
          <FormInput
            placeholder="e.g. cafe-001"
            value={businessId}
            onChange={(e) => onBusinessIdChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !running && onRun()}
          />
        </div>
        {running ? (
          <SubmitButton onClick={onCancel} className="bg-destructive hover:bg-destructive/90">
            Stop Pipeline
          </SubmitButton>
        ) : (
          <SubmitButton onClick={onRun} loading={loading} disabled={!businessId.trim()}>
            Run Analysis
          </SubmitButton>
        )}
        {error && <ErrorAlert message={error} />}
      </div>
    </Card>
  );
}
