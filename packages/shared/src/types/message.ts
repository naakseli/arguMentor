import type { DebateSide } from './debate.js'

export interface Message {
	id: string
	side: DebateSide // Kumpi puoli lähetti viestin
	content: string
}
