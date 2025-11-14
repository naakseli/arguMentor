import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { io } from '../socketServer.js'
import * as debateService from './debateService.js'

const TURN_DURATION_MS = 60_000

const timers = new Map<string, NodeJS.Timeout>()

const getNextSide = (side: DebateSide): DebateSide =>
	side === DebateSide.SIDE_A ? DebateSide.SIDE_B : DebateSide.SIDE_A

const endDebate = (debate: Debate): Debate => ({
	...debate,
	status: DebateStatus.ENDED,
	currentTurn: null,
	turnEndsAt: undefined,
})

const decrementArgument = (debate: Debate, side: DebateSide): void => {
	if (side === DebateSide.SIDE_A && debate.argumentsRemainingA > 0) {
		debate.argumentsRemainingA -= 1
	} else if (side === DebateSide.SIDE_B && debate.argumentsRemainingB > 0) {
		debate.argumentsRemainingB -= 1
	}
}

const hasNoArguments = (debate: Debate, side: DebateSide): boolean => {
	return side === DebateSide.SIDE_A
		? debate.argumentsRemainingA === 0
		: debate.argumentsRemainingB === 0
}

const applyTurnTimeoutToDebate = (debate: Debate): Debate => {
	// Only process active debates with current turn
	if (debate.status !== DebateStatus.ACTIVE || debate.currentTurn == null) return debate

	const updatedDebate = { ...debate }
	const currentSide = updatedDebate.currentTurn as DebateSide

	// 1. Current side loses one argument
	decrementArgument(updatedDebate, currentSide)

	// 2. Check if debate should end due to no arguments
	if (
		hasNoArguments(updatedDebate, DebateSide.SIDE_A) &&
		hasNoArguments(updatedDebate, DebateSide.SIDE_B)
	) {
		return endDebate(updatedDebate)
	}

	// 3. Switch to next side if they have arguments
	const nextSide = getNextSide(currentSide)
	if (hasNoArguments(updatedDebate, nextSide)) return endDebate(updatedDebate)

	// 4. Continue debate with new turn
	return {
		...updatedDebate,
		currentTurn: nextSide,
		turnEndsAt: new Date(Date.now() + TURN_DURATION_MS).toISOString(),
	}
}

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

	if (status !== DebateStatus.ACTIVE || currentTurn == null) return

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

	if (!debate) return

	const updatedDebate = applyTurnTimeoutToDebate(debate)

	// If nothing changed (e.g. debate no longer active), do not broadcast or reschedule
	if (updatedDebate === debate) return

	await debateService.saveDebate(updatedDebate)

	// Broadcast updates to all clients in the room
	io.to(roomCode).emit('arguments_updated', {
		argumentsRemainingA: updatedDebate.argumentsRemainingA,
		argumentsRemainingB: updatedDebate.argumentsRemainingB,
	})

	io.to(roomCode).emit('turn_updated', {
		currentTurn: updatedDebate.currentTurn,
		turnEndsAt: updatedDebate.turnEndsAt,
	})

	if (updatedDebate.status !== DebateStatus.ACTIVE) {
		io.to(roomCode).emit('debate_ended', { debate: updatedDebate })
	} else if (updatedDebate.currentTurn != null) {
		// Start next turn timer
		startTurnTimer(updatedDebate)
	}
}
