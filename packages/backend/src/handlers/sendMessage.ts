import type { SendMessagePayload, ServerToClientEvents } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { randomUUID } from 'crypto'
import { evaluateDebate } from '../services/aiEvaluationService.js'
import * as debateService from '../services/debateService.js'
import { clearTurnTimer, startTurnTimer } from '../services/turnTimerService.js'
import type { DebateSocket } from '../types/socket.js'
import { emitSocketError, handleSocketHandlerError } from '../utils/socketError.js'

const VALID_SIDES = new Set<DebateSide>([DebateSide.SIDE_A, DebateSide.SIDE_B])

const EVALUATED_TTL_SECONDS = 86_400 // 24 tuntia

const triggerAiEvaluation = (socket: DebateSocket, roomCode: string): void => {
	// Suoritetaan AI-arviointi taustalla, jotta viestin lähetys ei blokkaudu
	;(async () => {
		try {
			const latestDebate = await debateService.getDebate(roomCode)

			if (!latestDebate) {
				return
			}

			// Arvioidaan vain jos väittely on päättynyt eikä arviointia ole vielä tehty
			if (latestDebate.status !== DebateStatus.ENDED || latestDebate.evaluation) {
				return
			}

			const evaluation = await evaluateDebate(latestDebate)

			latestDebate.evaluation = evaluation
			latestDebate.status = DebateStatus.EVALUATED

			await debateService.saveDebate(latestDebate, EVALUATED_TTL_SECONDS)

			const payload: Parameters<ServerToClientEvents['evaluation_ready']>[0] = {
				evaluation,
			}

			socket.emit('evaluation_ready', payload)
			socket.to(roomCode).emit('evaluation_ready', payload)
		} catch (error) {
			console.error('Väittelyn AI-arviointi epäonnistui', { roomCode, error })
		}
	})()
}

export const handleSendMessage = async (
	socket: DebateSocket,
	payload: SendMessagePayload
): Promise<void> => {
	const roomCode = socket.data.roomCode
	const side = socket.data.side

	if (!roomCode || !side) {
		emitSocketError(socket, 'NOT_IN_DEBATE', 'You must join a debate before sending messages')
		return
	}

	const content = payload?.content?.trim()
	if (!content) {
		emitSocketError(socket, 'INVALID_MESSAGE', 'Message content is required and cannot be empty')
		return
	}

	try {
		const debate = await debateService.getDebate(roomCode)

		if (!debate) {
			emitSocketError(socket, 'DEBATE_NOT_FOUND', 'Debate room not found')
			return
		}

		if (debate.status !== DebateStatus.ACTIVE) {
			emitSocketError(socket, 'DEBATE_NOT_ACTIVE', 'Debate is not active')
			return
		}

		if (!VALID_SIDES.has(side)) {
			emitSocketError(socket, 'INVALID_SIDE', 'Invalid debate side')
			return
		}

		// Messages can only be sent on the sender's turn
		if (debate.currentTurn !== side) {
			emitSocketError(socket, 'NOT_YOUR_TURN', 'You cannot send a message when it is not your turn')
			return
		}

		const isSideA = side === DebateSide.SIDE_A
		const argumentsRemaining = isSideA ? debate.argumentsRemainingA : debate.argumentsRemainingB

		if (argumentsRemaining <= 0) {
			emitSocketError(socket, 'NO_ARGUMENTS_LEFT', 'You have no arguments remaining')
			return
		}

		const timestamp = new Date().toISOString()

		const message = {
			id: randomUUID(),
			side,
			content,
			timestamp,
		}

		debate.messages.push(message)

		if (isSideA) {
			debate.argumentsRemainingA -= 1
		} else {
			debate.argumentsRemainingB -= 1
		}

		const argumentsRemainingA = debate.argumentsRemainingA
		const argumentsRemainingB = debate.argumentsRemainingB

		const debateJustEnded = argumentsRemainingA === 0 && argumentsRemainingB === 0

		if (debateJustEnded) {
			debate.status = DebateStatus.ENDED
			debate.currentTurn = null
			debate.turnEndsAt = undefined
		} else {
			// Switch turn to the opponent if they still have arguments left
			const nextSide = isSideA ? DebateSide.SIDE_B : DebateSide.SIDE_A
			const nextHasArguments =
				(nextSide === DebateSide.SIDE_A && argumentsRemainingA > 0) ||
				(nextSide === DebateSide.SIDE_B && argumentsRemainingB > 0)

			if (nextHasArguments) {
				debate.currentTurn = nextSide
				debate.turnEndsAt = new Date(Date.now() + 60_000).toISOString()
			} else {
				// Opponent has no arguments left -> debate ends
				debate.status = DebateStatus.ENDED
				debate.currentTurn = null
				debate.turnEndsAt = undefined
			}
		}

		await debateService.saveDebate(debate)

		socket.emit('message_sent', {
			messageId: message.id,
			timestamp,
		})

		const broadcast = <E extends keyof ServerToClientEvents>(
			event: E,
			...args: Parameters<ServerToClientEvents[E]>
		): void => {
			socket.emit(event, ...args)
			socket.to(roomCode).emit(event, ...args)
		}

		broadcast('new_message', {
			id: message.id,
			side: message.side,
			content: message.content,
			timestamp: message.timestamp,
		})

		broadcast('arguments_updated', {
			argumentsRemainingA,
			argumentsRemainingB,
		})

		broadcast('turn_updated', {
			currentTurn: debate.currentTurn,
			turnEndsAt: debate.turnEndsAt,
		})

		if (debateJustEnded || debate.status === DebateStatus.ENDED) {
			// Debate ended due to this message -> clear possible timer and notify clients
			clearTurnTimer(roomCode)
			broadcast('debate_ended', { debate })
			// Käynnistetään AI-arviointi taustalla
			triggerAiEvaluation(socket, roomCode)
		} else if (debate.currentTurn != null) {
			// Start timer for the next turn
			startTurnTimer(debate)
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
