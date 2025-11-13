import type {
	Debate,
	DebateCreatedEvent,
	DebateInfoEvent,
	DebateJoinedEvent,
	ErrorEvent,
	MessageSentEvent,
} from '@argumentor/shared'
import { useState } from 'react'
import { useSocket } from '../../../providers/SocketProvider'
import { ensureSocketConnected } from '../../../services/socketClient'

interface UseDebateResult {
	createDebate: (topic: string, topicSideA: string, topicSideB: string) => Promise<string>
	joinDebate: (roomCode: string) => Promise<string>
	getDebateInfo: (roomCode: string) => Promise<Debate>
	sendMessage: (content: string) => Promise<void>
	isCreating: boolean
	isSending: boolean
	error: string | null
	clearError: () => void
}

const FALLBACK_ERROR_MESSAGE = 'Väittelyn luonti epäonnistui. Yritä uudelleen.'

export const useDebate = (): UseDebateResult => {
	const socket = useSocket()
	const [isCreating, setIsCreating] = useState(false)
	const [isSending, setIsSending] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const createDebate = async (topic: string, topicSideA: string, topicSideB: string) => {
		setIsCreating(true)
		setError(null)

		try {
			await ensureSocketConnected(socket)

			const roomCode = await new Promise<string>((resolve, reject) => {
				socket.once('debate_created', (payload: DebateCreatedEvent) => resolve(payload.roomCode))
				socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))

				socket.emit('create_debate', {
					topic,
					topicSideA,
					topicSideB,
				})
			})

			return roomCode
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `${FALLBACK_ERROR_MESSAGE} (${caughtError.message})`
					: FALLBACK_ERROR_MESSAGE

			setError(message)
			throw caughtError instanceof Error ? caughtError : new Error(message)
		} finally {
			setIsCreating(false)
		}
	}

	const joinDebate = async (roomCode: string) => {
		setIsCreating(true)
		setError(null)

		try {
			await ensureSocketConnected(socket)

			const result = await new Promise<string>((resolve, reject) => {
				socket.once('debate_joined', (payload: DebateJoinedEvent) =>
					resolve(payload.debate.roomCode)
				)
				socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))

				socket.emit('join_debate', {
					roomCode: roomCode.trim().toUpperCase(),
				})
			})

			return result
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `Väittelyyn liittyminen epäonnistui. (${caughtError.message})`
					: 'Väittelyyn liittyminen epäonnistui. Yritä uudelleen.'

			setError(message)
			throw caughtError instanceof Error ? caughtError : new Error(message)
		} finally {
			setIsCreating(false)
		}
	}

	const getDebateInfo = async (roomCode: string) => {
		try {
			await ensureSocketConnected(socket)

			const debate = await new Promise<Debate>((resolve, reject) => {
				socket.once('debate_info', (payload: DebateInfoEvent) => resolve(payload.debate))
				socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))
				socket.emit('get_debate_info', { roomCode })
			})

			return debate
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `${FALLBACK_ERROR_MESSAGE} (${caughtError.message})`
					: FALLBACK_ERROR_MESSAGE

			setError(message)
			throw caughtError instanceof Error ? caughtError : new Error(message)
		}
	}

	const sendMessage = async (content: string) => {
		setIsSending(true)
		setError(null)

		try {
			await ensureSocketConnected(socket)

			await new Promise<void>((resolve, reject) => {
				socket.once('message_sent', (payload: MessageSentEvent) => resolve())
				socket.once('error', (payload: ErrorEvent) => reject(new Error(payload.message)))

				socket.emit('send_message', { content: content.trim() })
			})
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `Viestin lähetys epäonnistui. (${caughtError.message})`
					: 'Viestin lähetys epäonnistui. Yritä uudelleen.'

			setError(message)
			throw caughtError instanceof Error ? caughtError : new Error(message)
		} finally {
			setIsSending(false)
		}
	}

	return {
		createDebate,
		joinDebate,
		getDebateInfo,
		sendMessage,
		isCreating,
		isSending,
		error,
		clearError: () => setError(null),
	}
}
