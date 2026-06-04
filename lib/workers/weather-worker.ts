import { Worker, Job } from 'bullmq'
import { prisma } from '@/lib/db'

interface WeatherJobData {
  businessId: string
  city: string
  latitude?: number
  longitude?: number
}

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
}

export const weatherWorker = new Worker<WeatherJobData>(
  'data-collect',
  async (job: Job<WeatherJobData>) => {
    const { businessId, city } = job.data

    // TODO: Import and use fetchWeather from weather service
    // For now, this is a placeholder that will be implemented in Phase 2
    job.log(`Fetching weather for ${city}...`)

    // Store snapshot (placeholder - real implementation in Phase 2)
    await prisma.dataSnapshot.create({
      data: {
        businessId,
        source: 'weather',
        data: { city, status: 'pending' },
        collectedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
      },
    })

    return { success: true, city }
  },
  {
    connection,
    limiter: {
      max: 10,
      duration: 60_000,
    },
  }
)

weatherWorker.on('completed', (job) => {
  console.log(`Weather job ${job.id} completed for ${job.data.city}`)
})

weatherWorker.on('failed', (job, err) => {
  console.error(`Weather job ${job?.id} failed:`, err.message)
})
