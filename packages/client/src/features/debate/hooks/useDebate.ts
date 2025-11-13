import type { Debate } from '@argumentor/shared'
import { useState } from 'react'
import { useSocket } from '../../../providers/SocketProvider'
import { debateSocketService } from '../../../services/debateSocketService'

interface UseDebateResult {
	createDebate: (topic: string, topicSideA: string, topicSideB: string) => Promise<string>
	joinDebate: (roomCode: string) => Promise<string>
	getDebateInfo: (roomCode: string) => Promise<Debate>
	sendMessage: (content: string) => Promise<void>
	isCreating: boolean
	isSending: boolean
}

const FALLBACK_ERROR_MESSAGE = 'Väittelyn luonti epäonnistui. Yritä uudelleen.'

export const useDebate = (): UseDebateResult => {
	const socket = useSocket()
	const [isCreating, setIsCreating] = useState(false)
	const [isSending, setIsSending] = useState(false)

	const createDebate = async (topic: string, topicSideA: string, topicSideB: string) => {
		setIsCreating(true)

		try {
			const roomCode = await debateSocketService.createDebate(socket, topic, topicSideA, topicSideB)
			return roomCode
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `${FALLBACK_ERROR_MESSAGE} (${caughtError.message})`
					: FALLBACK_ERROR_MESSAGE

			throw caughtError instanceof Error ? caughtError : new Error(message)
		} finally {
			setIsCreating(false)
		}
	}

	const joinDebate = async (roomCode: string) => {
		setIsCreating(true)

		try {
			const result = await debateSocketService.joinDebate(socket, roomCode)
			return result
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `Väittelyyn liittyminen epäonnistui. (${caughtError.message})`
					: 'Väittelyyn liittyminen epäonnistui. Yritä uudelleen.'

			throw caughtError instanceof Error ? caughtError : new Error(message)
		} finally {
			setIsCreating(false)
		}
	}

	const getDebateInfo = async (roomCode: string) => {
		try {
			const debate = await debateSocketService.getDebateInfo(socket, roomCode)
			return debate
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `${FALLBACK_ERROR_MESSAGE} (${caughtError.message})`
					: FALLBACK_ERROR_MESSAGE

			throw caughtError instanceof Error ? caughtError : new Error(message)
		}
	}

	const sendMessage = async (content: string) => {
		setIsSending(true)

		try {
			await debateSocketService.sendMessage(socket, content)
		} catch (caughtError) {
			const message =
				caughtError instanceof Error && caughtError.message
					? `Viestin lähetys epäonnistui. (${caughtError.message})`
					: 'Viestin lähetys epäonnistui. Yritä uudelleen.'

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
	}
}
