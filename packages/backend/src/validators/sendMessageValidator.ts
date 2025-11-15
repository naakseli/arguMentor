import type { Debate, SendMessagePayload } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import * as debateService from '../services/debateService.js'
import type { DebateSocket } from '../types/socket.js'

const VALID_SIDES = new Set<DebateSide>([DebateSide.SIDE_A, DebateSide.SIDE_B])

type ValidationSuccess = {
	ok: true
	data: {
		debate: Debate
		roomCode: string
		side: DebateSide
		content: string
	}
}

type ValidationFailure = {
	ok: false
	error: { code: string; message: string }
}

export type SendMessageValidationResult = ValidationSuccess | ValidationFailure

export const sendMessageValidator = async (
	socket: DebateSocket,
	payload: SendMessagePayload
): Promise<SendMessageValidationResult> => {
	const roomCode = socket.data.roomCode
	const side = socket.data.side

	if (!roomCode || !side) {
		return invalid('NOT_IN_DEBATE', 'You must join a debate before sending messages')
	}

	const content = payload?.content?.trim()
	if (!content) {
		return invalid('INVALID_MESSAGE', 'Message content is required and cannot be empty')
	}

	if (!VALID_SIDES.has(side)) {
		return invalid('INVALID_SIDE', 'Invalid debate side')
	}

	const debate = await debateService.getDebate(roomCode)
	if (!debate) {
		return invalid('DEBATE_NOT_FOUND', 'Debate room not found')
	}

	const debateValidationError = validateDebateState(debate, side)
	if (debateValidationError) {
		return invalid(debateValidationError.code, debateValidationError.message)
	}

	return {
		ok: true,
		data: {
			debate,
			roomCode,
			side,
			content,
		},
	}
}

type DebateValidationError = { code: string; message: string }

const validateDebateState = (debate: Debate, side: DebateSide): DebateValidationError | null => {
	if (debate.status !== DebateStatus.ACTIVE) {
		return { code: 'DEBATE_NOT_ACTIVE', message: 'Debate is not active' }
	}

	if (debate.currentTurn !== side) {
		return { code: 'NOT_YOUR_TURN', message: 'You cannot send a message when it is not your turn' }
	}

	const argumentsRemaining =
		side === DebateSide.SIDE_A ? debate.argumentsRemainingA : debate.argumentsRemainingB

	if (argumentsRemaining <= 0) {
		return { code: 'NO_ARGUMENTS_LEFT', message: 'You have no arguments remaining' }
	}

	return null
}

const invalid = (code: string, message: string): ValidationFailure => ({
	ok: false,
	error: { code, message },
})
