import type { DebateSide } from './debate.js'

export interface Evaluation {
	id: string
	winner?: DebateSide
	scoreA: number // 0-100
	scoreB: number // 0-100
	reasoning: string // AI:n perustelut
	createdAt: Date
}
