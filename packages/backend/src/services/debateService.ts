import { Debate } from '@argumentor/shared'
import redis from './redis.js'

const TTL = 1800 // 30 minuuttia

const getKey = (roomCode: string): string => `debate:${roomCode}`

const deserializeDebate = (data: string): Debate | null => {
	try {
		const debate = JSON.parse(data) as Debate
		return debate
	} catch (error) {
		console.error('Error parsing debate:', error)
		return null
	}
}

export const getDebate = async (roomCode: string): Promise<Debate | null> => {
	const data = await redis.getClient().get(getKey(roomCode))
	return data ? deserializeDebate(data) : null
}

export const saveDebate = (debate: Debate) =>
	redis.getClient().setex(getKey(debate.roomCode), TTL, JSON.stringify(debate))

export const deleteDebate = (roomCode: string) => redis.getClient().del(getKey(roomCode))

export const debateExists = async (roomCode: string): Promise<boolean> => {
	const result = await redis.getClient().exists(getKey(roomCode))
	return result === 1
}
