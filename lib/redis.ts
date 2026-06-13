import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
  const isTLS = url.startsWith('rediss://')

  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: isTLS ? {} : undefined,
  })
}

export const redis = globalForRedis.redis || createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
