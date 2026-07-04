import 'server-only';
/**
 * Redis-backed pipeline cancellation.
 *
 * Instead of in-memory AbortControllers (which don't survive Vercel serverless
 * isolation), we store a cancellation flag in Redis. Every serverless invocation
 * shares the same Redis instance, so the flag is visible to the running pipeline
 * regardless of which container it executes in.
 *
 * Key pattern:  pipeline:cancel:{pipelineId}  →  <reason>  (TTL 10 minutes)
 *
 * The value is now the abort reason (e.g. "user_cancelled", "rate_limit")
 * instead of just "1", so pipelines can distinguish cancellation types.
 */

import { redis } from '@/lib/redis';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { PipelineAbortReason } from './errors';

const log = logger.child('pipelines:cancel');

const CANCEL_KEY_PREFIX = 'pipeline:cancel:';
const CANCEL_TTL_SECONDS = 10 * 60; // 10 minutes — enough for any pipeline

/**
 * Mark a pipeline as cancelled in Redis.
 * Called by the DELETE handler when the user clicks "Stop Pipeline".
 */
export async function cancelPipeline(
  pipelineId: string,
  reason: PipelineAbortReason = 'user_cancelled'
): Promise<boolean> {
  const key = `${CANCEL_KEY_PREFIX}${pipelineId}`;

  // Set the reason in Redis with a TTL
  await redis.set(key, reason, 'EX', CANCEL_TTL_SECONDS);

  // Mark any running/pending agent runs as failed in the DB
  const result = await prisma.agentRun.updateMany({
    where: {
      pipelineId,
      status: { in: ['pending', 'running'] },
    },
    data: {
      status: 'failed',
      error: `Pipeline cancelled: ${reason}`,
      completedAt: new Date(),
    },
  });

  log.info('pipeline cancelled', {
    pipelineId,
    reason,
    agentRunsAffected: result.count,
  });

  return true;
}

/**
 * Check if a pipeline has been cancelled.
 * Returns the abort reason if cancelled, null otherwise.
 * Called by withAgentRun() and pipeline functions before each step.
 */
export async function getPipelineCancelReason(
  pipelineId: string
): Promise<PipelineAbortReason | null> {
  const key = `${CANCEL_KEY_PREFIX}${pipelineId}`;
  const value = await redis.get(key);
  if (!value) return null;
  return (value as PipelineAbortReason) || 'user_cancelled';
}

/**
 * Check if a pipeline has been cancelled (boolean convenience wrapper).
 */
export async function isPipelineCancelled(pipelineId: string): Promise<boolean> {
  return (await getPipelineCancelReason(pipelineId)) !== null;
}

/**
 * Remove the cancellation flag from Redis.
 * Called when a pipeline completes or fails naturally (cleanup).
 */
export async function clearCancellationFlag(pipelineId: string): Promise<void> {
  const key = `${CANCEL_KEY_PREFIX}${pipelineId}`;
  await redis.del(key);
}
