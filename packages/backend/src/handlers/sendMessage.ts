import type { Debate, SendMessagePayload } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { randomUUID } from 'crypto'
import { evaluateAndFinalizeDebate } from '../services/aiEvaluationService.js'
import * as debateService from '../services/debateService.js'
import { clearTurnTimer } from '../services/turnTimerService.js'
import type { DebateSocket } from '../types/socket.js'
import { emitSocketError, handleSocketHandlerError } from '../utils/socketError.js'
import { sendMessageValidator } from '../validators/sendMessageValidator.js'

const TURN_DURATION_MS = 60_000
type DebateMessage = Debate['messages'][number]

export const handleSendMessage = async (
	socket: DebateSocket,
	payload: SendMessagePayload
): Promise<void> => {
	try {
		const validation = await sendMessageValidator(socket, payload)
		if (!validation.ok) {
			const { code, message } = validation.error
			emitSocketError(socket, code, message)
			return
		}

		const { debate, roomCode, side, content } = validation.data
		const { updatedDebate, message, debateEnded } = addMessageAndAdvanceTurn(debate, side, content)

		await debateService.saveDebate(updatedDebate)

		socket.emit('message_sent', {
			messageId: message.id,
		})

		broadcastDebateUpdate(socket, roomCode, updatedDebate)

		if (debateEnded) {
			clearTurnTimer(roomCode)

			// Get evaluation and broadcast final state
			const evaluatedDebate = await evaluateAndFinalizeDebate(roomCode)
			broadcastDebateUpdate(socket, roomCode, evaluatedDebate)
		}
	} catch (error) {
		handleSocketHandlerError(
			socket,
			'SEND_MESSAGE_ERROR',
			'Failed to send message',
			error,
			'Error sending message'
		)
	}
}

type MessageApplicationResult = {
	updatedDebate: Debate
	message: DebateMessage
	debateEnded: boolean
}

const addMessageAndAdvanceTurn = (
	debate: Debate,
	side: DebateSide,
	content: string
): MessageApplicationResult => {
	const message: DebateMessage = {
		id: randomUUID(),
		side,
		content,
	}

	const argumentsRemainingA =
		side === DebateSide.SIDE_A ? debate.argumentsRemainingA - 1 : debate.argumentsRemainingA
	const argumentsRemainingB =
		side === DebateSide.SIDE_B ? debate.argumentsRemainingB - 1 : debate.argumentsRemainingB

	const nextSide = side === DebateSide.SIDE_A ? DebateSide.SIDE_B : DebateSide.SIDE_A
	const nextHasArguments =
		(nextSide === DebateSide.SIDE_A && argumentsRemainingA > 0) ||
		(nextSide === DebateSide.SIDE_B && argumentsRemainingB > 0)

	const debateEnded =
		argumentsRemainingA === 0 && argumentsRemainingB === 0 ? true : !nextHasArguments
	const status = debateEnded ? DebateStatus.ENDED : DebateStatus.ACTIVE
	const currentTurn = debateEnded ? null : nextSide
	const turnEndsAt = debateEnded ? undefined : new Date(Date.now() + TURN_DURATION_MS).toISOString()

	const updatedDebate: Debate = {
		...debate,
		messages: [...debate.messages, message],
		argumentsRemainingA,
		argumentsRemainingB,
		status,
		currentTurn,
		turnEndsAt,
	}

	return { updatedDebate, message, debateEnded }
}

const broadcastDebateUpdate = (socket: DebateSocket, roomCode: string, debate: Debate): void => {
	socket.emit('debate_update', { debate })
	socket.to(roomCode).emit('debate_update', { debate })
}
