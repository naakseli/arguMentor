import type {
	Debate,
	DebateCreatedEvent,
	DebateInfoEvent,
	DebateJoinedEvent,
	DebateUpdateEvent,
	ErrorEvent,
} from '@argumentor/shared'
import type { DebateClientSocket } from './socketClient'
import { ensureSocketConnected } from './socketClient'

/**
 * Callbacks for debate events
 */
export interface DebateEventCallbacks {
	onDebateJoined?: (payload: DebateJoinedEvent) => void
	onDebateUpdate?: (payload: DebateUpdateEvent) => void
	onError?: (payload: ErrorEvent) => void
}

/**
 * Centralized service for all debate-related socket communication
 */
export const debateSocketService = {
	/**
	 * Create a new debate
	 */
	async createDebate(
		socket: DebateClientSocket,
		topic: string,
		topicSideA: string,
		topicSideB: string
	): Promise<string> {
		await ensureSocketConnected(socket)

		return new Promise<string>((resolve, reject) => {
			socket.once('debate_created', (payload: DebateCreatedEvent) => resolve(payload.roomCode))
			socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))

			socket.emit('create_debate', {
				topic,
				topicSideA,
				topicSideB,
			})
		})
	},

	/**
	 * Join an existing debate
	 */
	async joinDebate(socket: DebateClientSocket, roomCode: string): Promise<string> {
		await ensureSocketConnected(socket)

		return new Promise<string>((resolve, reject) => {
			socket.once('debate_joined', (payload: DebateJoinedEvent) => resolve(payload.debate.roomCode))
			socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))

			socket.emit('join_debate', { roomCode })
		})
	},

	/**
	 * Get debate information
	 */
	async getDebateInfo(socket: DebateClientSocket, roomCode: string): Promise<Debate> {
		await ensureSocketConnected(socket)

		return new Promise<Debate>((resolve, reject) => {
			socket.once('debate_info', (payload: DebateInfoEvent) => resolve(payload.debate))
			socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))
			socket.emit('get_debate_info', { roomCode })
		})
	},

	/**
	 * Send a message in the debate
	 */
	async sendMessage(socket: DebateClientSocket, content: string): Promise<void> {
		await ensureSocketConnected(socket)

		return new Promise<void>((resolve, reject) => {
			socket.once('message_sent', () => resolve())
			socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))

			socket.emit('send_message', { content })
		})
	},

	/**
	 * Subscribe to debate events for a specific room
	 * Returns an unsubscribe function
	 */
	subscribeToDebateEvents(
		socket: DebateClientSocket,
		roomCode: string,
		callbacks: DebateEventCallbacks
	): () => void {
		const handleDebateJoined = (payload: DebateJoinedEvent) => {
			if (payload.debate.roomCode === roomCode) {
				callbacks.onDebateJoined?.(payload)
			}
		}

		const handleDebateUpdate = (payload: DebateUpdateEvent) => {
			if (payload.debate.roomCode === roomCode) {
				callbacks.onDebateUpdate?.(payload)
			}
		}

		const handleError = (payload: ErrorEvent) => {
			callbacks.onError?.(payload)
		}

		// Register listeners
		socket.on('debate_joined', handleDebateJoined)
		socket.on('debate_update', handleDebateUpdate)
		socket.on('error', handleError)

		// Return unsubscribe function
		return () => {
			socket.off('debate_joined', handleDebateJoined)
			socket.off('debate_update', handleDebateUpdate)
			socket.off('error', handleError)
		}
	},
}
