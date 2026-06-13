function parseRedisUrl(url: string): Record<string, unknown> {
  if (url.startsWith('rediss://') || url.startsWith('redis://')) {
    return {
      url,
      tls: url.startsWith('rediss://') ? {} : undefined,
    };
  }

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };
}

export const redisConnection = parseRedisUrl(process.env.REDIS_URL ?? 'redis://localhost:6379');
