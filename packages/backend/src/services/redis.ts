import Redis from 'ioredis'

let redis: Redis | null = null

const getClient = (): Redis => {
	if (!redis) throw new Error('Redis not connected')
	return redis
}

const connect = async (): Promise<void> => {
	if (redis) return

	const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

	try {
		redis = new Redis(redisUrl)
		await redis.ping()
		console.log('Redis connected')
	} catch (error) {
		throw new Error('Redis connection failed')
	}
}

const disconnect = async (): Promise<void> => {
	if (redis) {
		await redis.quit()
		redis = null
	}
}

export default { connect, disconnect, getClient }
