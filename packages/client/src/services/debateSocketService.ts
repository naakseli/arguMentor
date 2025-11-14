import type {
	ArgumentsUpdatedEvent,
	Debate,
	DebateCreatedEvent,
	DebateEndedEvent,
	DebateInfoEvent,
	DebateJoinedEvent,
	DebateStartedEvent,
	ErrorEvent,
	EvaluationReadyEvent,
	NewMessageEvent,
	TurnUpdatedEvent,
} from '@argumentor/shared'
import type { DebateClientSocket } from './socketClient'
import { ensureSocketConnected } from './socketClient'

/**
 * Callbacks for debate events
 */
export interface DebateEventCallbacks {
	onDebateJoined?: (payload: DebateJoinedEvent) => void
	onDebateStarted?: (payload: DebateStartedEvent) => void
	onArgumentsUpdated?: (payload: ArgumentsUpdatedEvent) => void
	onTurnUpdated?: (payload: TurnUpdatedEvent) => void
	onNewMessage?: (payload: NewMessageEvent) => void
	onDebateEnded?: (payload: DebateEndedEvent) => void
	onEvaluationReady?: (payload: EvaluationReadyEvent) => void
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

			socket.emit('send_message', { content: content.trim() })
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

		const handleDebateStarted = (payload: DebateStartedEvent) => {
			if (payload.debate.roomCode === roomCode) {
				callbacks.onDebateStarted?.(payload)
			}
		}

		const handleArgumentsUpdated = (payload: ArgumentsUpdatedEvent) => {
			callbacks.onArgumentsUpdated?.(payload)
		}

		const handleTurnUpdated = (payload: TurnUpdatedEvent) => {
			callbacks.onTurnUpdated?.(payload)
		}

		const handleNewMessage = (payload: NewMessageEvent) => {
			callbacks.onNewMessage?.(payload)
		}

		const handleDebateEnded = (payload: DebateEndedEvent) => {
			if (payload.debate.roomCode === roomCode) {
				callbacks.onDebateEnded?.(payload)
			}
		}

		const handleEvaluationReady = (payload: EvaluationReadyEvent) => {
			callbacks.onEvaluationReady?.(payload)
		}

		const handleError = (payload: ErrorEvent) => {
			callbacks.onError?.(payload)
		}

		// Register all listeners
		socket.on('debate_joined', handleDebateJoined)
		socket.on('debate_started', handleDebateStarted)
		socket.on('arguments_updated', handleArgumentsUpdated)
		socket.on('turn_updated', handleTurnUpdated)
		socket.on('new_message', handleNewMessage)
		socket.on('debate_ended', handleDebateEnded)
		socket.on('evaluation_ready', handleEvaluationReady)
		socket.on('error', handleError)

		// Return unsubscribe function
		return () => {
			socket.off('debate_joined', handleDebateJoined)
			socket.off('debate_started', handleDebateStarted)
			socket.off('arguments_updated', handleArgumentsUpdated)
			socket.off('turn_updated', handleTurnUpdated)
			socket.off('new_message', handleNewMessage)
			socket.off('debate_ended', handleDebateEnded)
			socket.off('evaluation_ready', handleEvaluationReady)
			socket.off('error', handleError)
		}
	},
}
