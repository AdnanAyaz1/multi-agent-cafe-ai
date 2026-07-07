import 'server-only';
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

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = globalForRedis.redis || createRedisClient()
    if (process.env.NODE_ENV !== 'production') globalForRedis.redis = _redis
  }
  return _redis
}

export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    const target = getRedis()
    const value = (target as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(target)
    }
    return value
  },
})
