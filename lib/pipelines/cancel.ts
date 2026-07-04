import 'server-only';
/**
 * Redis-backed pipeline cancellation.
 *
 * Instead of in-memory AbortControllers (which don't survive Vercel serverless
 * isolation), we store a cancellation flag in Redis. Every serverless invocation
 * shares the same Redis instance, so the flag is visible to the running pipeline
 * regardless of which container it executes in.
 *
 * Key pattern:  pipeline:cancel:{pipelineId}  →  "1"  (TTL 10 minutes)
 */

import { redis } from '@/lib/redis';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const log = logger.child('pipelines:cancel');

const CANCEL_KEY_PREFIX = 'pipeline:cancel:';
const CANCEL_TTL_SECONDS = 10 * 60; // 10 minutes — enough for any pipeline

/**
 * Mark a pipeline as cancelled in Redis.
 * Called by the DELETE handler when the user clicks "Stop Pipeline".
 */
export async function cancelPipeline(pipelineId: string): Promise<boolean> {
  const key = `${CANCEL_KEY_PREFIX}${pipelineId}`;

  // Set the flag in Redis with a TTL
  await redis.set(key, '1', 'EX', CANCEL_TTL_SECONDS);

  // Mark any running/pending agent runs as failed in the DB
  const result = await prisma.agentRun.updateMany({
    where: {
      pipelineId,
      status: { in: ['pending', 'running'] },
    },
    data: {
      status: 'failed',
      error: 'Pipeline cancelled by user',
      completedAt: new Date(),
    },
  });

  log.info('pipeline cancelled', {
    pipelineId,
    agentRunsAffected: result.count,
  });

  return true;
}

/**
 * Check if a pipeline has been cancelled.
 * Called by withAgentRun() and pipeline functions before each step.
 */
export async function isPipelineCancelled(pipelineId: string): Promise<boolean> {
  const key = `${CANCEL_KEY_PREFIX}${pipelineId}`;
  const value = await redis.get(key);
  return value === '1';
}

/**
 * Remove the cancellation flag from Redis.
 * Called when a pipeline completes or fails naturally (cleanup).
 */
export async function clearCancellationFlag(pipelineId: string): Promise<void> {
  const key = `${CANCEL_KEY_PREFIX}${pipelineId}`;
  await redis.del(key);
}
