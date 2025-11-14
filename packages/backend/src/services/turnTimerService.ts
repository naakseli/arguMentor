import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import * as debateService from './debateService.js'
import { io } from '../socketServer.js'

const TURN_DURATION_MS = 60_000

const timers = new Map<string, NodeJS.Timeout>()

export const clearTurnTimer = (roomCode: string): void => {
	const existing = timers.get(roomCode)

	if (existing) {
		clearTimeout(existing)
		timers.delete(roomCode)
	}
}

export const startTurnTimer = (debate: Debate): void => {
	const { roomCode, status, currentTurn, turnEndsAt } = debate

	// Always clear possible previous timer
	clearTurnTimer(roomCode)

	if (status !== DebateStatus.ACTIVE || currentTurn == null) {
		return
	}

	const now = Date.now()
	const endTime = turnEndsAt ? new Date(turnEndsAt).getTime() : now + TURN_DURATION_MS
	const delay = Math.max(0, endTime - now)

	const timeout = setTimeout(() => {
		handleTurnTimeout(roomCode).catch(error => {
			console.error('Error handling turn timeout for room', roomCode, error)
		})
	}, delay)

	timers.set(roomCode, timeout)
}

const handleTurnTimeout = async (roomCode: string): Promise<void> => {
	// Remove stored timer reference first
	timers.delete(roomCode)

	const debate = await debateService.getDebate(roomCode)

	if (!debate) {
		return
	}

	if (debate.status !== DebateStatus.ACTIVE || debate.currentTurn == null) {
		return
	}

	const isSideA = debate.currentTurn === DebateSide.SIDE_A

	// Current side loses one argument if available
	if (isSideA) {
		if (debate.argumentsRemainingA > 0) {
			debate.argumentsRemainingA -= 1
		}
	} else if (debate.argumentsRemainingB > 0) {
		debate.argumentsRemainingB -= 1
	}

	const argumentsRemainingA = debate.argumentsRemainingA
	const argumentsRemainingB = debate.argumentsRemainingB

	const bothZero = argumentsRemainingA === 0 && argumentsRemainingB === 0

	if (bothZero) {
		debate.status = DebateStatus.ENDED
		debate.currentTurn = null
		debate.turnEndsAt = undefined
	} else {
		const nextSide = isSideA ? DebateSide.SIDE_B : DebateSide.SIDE_A
		const nextHasArguments =
			(nextSide === DebateSide.SIDE_A && argumentsRemainingA > 0) ||
			(nextSide === DebateSide.SIDE_B && argumentsRemainingB > 0)

		if (nextHasArguments) {
			debate.currentTurn = nextSide
			debate.turnEndsAt = new Date(Date.now() + TURN_DURATION_MS).toISOString()
		} else {
			// Opponent has no arguments left -> debate ends
			debate.status = DebateStatus.ENDED
			debate.currentTurn = null
			debate.turnEndsAt = undefined
		}
	}

	await debateService.saveDebate(debate)

	// Broadcast updates to all clients in the room
	io.to(roomCode).emit('arguments_updated', {
		argumentsRemainingA,
		argumentsRemainingB,
	})

	io.to(roomCode).emit('turn_updated', {
		currentTurn: debate.currentTurn,
		turnEndsAt: debate.turnEndsAt,
	})

	if (debate.status === DebateStatus.ENDED) {
		io.to(roomCode).emit('debate_ended', { debate })
	} else if (debate.currentTurn != null) {
		// Start next turn timer
		startTurnTimer(debate)
	}
}


