import 'server-only';
import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
  const isTLS = url.startsWith('rediss://')

  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 1500,
    commandTimeout: 2000,
    tls: isTLS ? {} : undefined,
  })

  // Prevent unhandled error crashes if Redis is offline or not configured
  client.on('error', () => {});

  return client;
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
