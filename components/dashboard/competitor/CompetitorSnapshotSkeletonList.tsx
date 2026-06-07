import { Skeleton } from '@/components/ui/skeleton';
import { COMPETITOR_DEFAULT_LIMIT } from '@/constants/competitor';

export function CompetitorSnapshotSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: COMPETITOR_DEFAULT_LIMIT }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-32 w-full rounded-2xl"
          aria-label="Loading snapshot"
        />
      ))}
    </div>
  );
}
