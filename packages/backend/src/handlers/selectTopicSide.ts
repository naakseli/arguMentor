import type { SelectTopicSidePayload, SelectTopicSideResponse } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import * as debateService from '../services/debateService.js'
import { startTurnTimer } from '../services/turnTimerService.js'
import type { DebateSocket } from '../types/socket.js'
import { emitSocketError, handleSocketHandlerError } from '../utils/socketError.js'

export const handleSelectTopicSide = async (
	socket: DebateSocket,
	payload: SelectTopicSidePayload,
	callback?: (response: SelectTopicSideResponse) => void
): Promise<void> => {
	try {
		const { roomCode, choice } = payload

		const respondError = (code: string, message: string) => {
			emitSocketError(socket, code, message)
			callback?.({ ok: false, message })
		}

		if (!roomCode) {
			respondError('INVALID_ROOM_CODE', 'Room code is required')
			return
		}

		if (choice !== 'A' && choice !== 'B') {
			respondError('INVALID_TOPIC_SIDE', 'Invalid topic side choice')
			return
		}

		const debate = await debateService.getDebate(roomCode)
		if (!debate) {
			respondError('DEBATE_NOT_FOUND', 'Debate room not found')
			return
		}

		const originalSideA = debate.topicSideA
		const originalSideB = debate.topicSideB

		if (choice === 'A') {
			debate.topicSideA = originalSideB
			debate.topicSideB = originalSideA
		} else {
			debate.topicSideA = originalSideA
			debate.topicSideB = originalSideB
		}

		debate.status = DebateStatus.ACTIVE
		const startingSide = Math.random() < 0.5 ? DebateSide.SIDE_A : DebateSide.SIDE_B
		debate.currentTurn = startingSide
		debate.turnEndsAt = new Date(Date.now() + 60_000).toISOString()

		await debateService.saveDebate(debate)

		socket.emit('debate_update', { debate })
		socket.to(roomCode).emit('debate_update', { debate })

		startTurnTimer(debate)
		callback?.({ ok: true })
	} catch (error) {
		callback?.({
			ok: false,
			message: 'Puolen valinta epäonnistui',
		})
		handleSocketHandlerError(
			socket,
			'SELECT_TOPIC_SIDE_ERROR',
			'Failed to select topic side',
			error,
			'Error selecting topic side'
		)
	}
}
