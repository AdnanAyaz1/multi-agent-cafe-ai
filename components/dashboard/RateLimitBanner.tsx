'use client';

import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isRetryableRateLimit, getRateLimitMessage } from '@/lib/rate-limit-utils';

interface RateLimitBannerProps {
  error: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const RateLimitBanner = ({ error, onRetry, isRetrying }: RateLimitBannerProps) => {
  const { title, description } = getRateLimitMessage(error);
  const canRetry = isRetryableRateLimit(error) && onRetry;

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-amber-300">{title}</h4>
          <p className="mt-1 text-xs text-amber-200/80">{description}</p>
          {canRetry && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={isRetrying}
                className={cn(
                  'h-7 border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 hover:bg-amber-500/20',
                  isRetrying && 'cursor-not-allowed opacity-70'
                )}
              >
                {isRetrying ? (
                  <>
                    <Clock className="mr-1.5 h-3 w-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1.5 h-3 w-3" />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
