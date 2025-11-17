import { DebateSide, DebateStatus, type Debate } from '@argumentor/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TURN_DURATION_MS, applyTurnTimeoutToDebate } from './turnTimerService.js'

const createBaseDebate = (overrides: Partial<Debate> = {}): Debate => ({
	roomCode: 'ROOM1',
	status: DebateStatus.ACTIVE,
	currentTurn: DebateSide.SIDE_A,
	turnEndsAt: new Date().toISOString(),
	argumentsRemainingA: 2,
	argumentsRemainingB: 2,
	sideAJoined: true,
	sideBJoined: true,
	sideAName: 'A',
	sideBName: 'B',
	topic: 'Test topic',
	topicSideA: 'For',
	topicSideB: 'Against',
	messages: [],
	...overrides,
})

describe('applyTurnTimeoutToDebate', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('returns the original debate when status is not ACTIVE', () => {
		const debate = createBaseDebate({ status: DebateStatus.WAITING })

		const result = applyTurnTimeoutToDebate(debate)

		// Same reference means nothing was changed
		expect(result).toBe(debate)
	})

	it('ends the debate when currentTurn is null', () => {
		const debate = createBaseDebate({ currentTurn: null })

		const result = applyTurnTimeoutToDebate(debate)

		expect(result.status).toBe(DebateStatus.ENDED)
		expect(result.currentTurn).toBeNull()
		expect(result.turnEndsAt).toBeUndefined()
	})

	it('decrements current side arguments and switches the turn', () => {
		const debate = createBaseDebate({
			currentTurn: DebateSide.SIDE_A,
			argumentsRemainingA: 2,
			argumentsRemainingB: 2,
		})

		const before = { ...debate }
		const now = Date.now()
		vi.setSystemTime(now)

		const result = applyTurnTimeoutToDebate(debate)

		// Decrements one argument from side A
		expect(result.argumentsRemainingA).toBe(before.argumentsRemainingA - 1)
		expect(result.argumentsRemainingB).toBe(before.argumentsRemainingB)

		// Turn switches to side B
		expect(result.currentTurn).toBe(DebateSide.SIDE_B)

		// turnEndsAt is set TURN_DURATION_MS into the future
		expect(result.turnEndsAt).toBeDefined()
		if (result.turnEndsAt) {
			const endTime = new Date(result.turnEndsAt).getTime()
			expect(endTime).toBe(now + TURN_DURATION_MS)
		}
	})

	it('ends the debate when the next side has no arguments left', () => {
		const debate = createBaseDebate({
			currentTurn: DebateSide.SIDE_A,
			argumentsRemainingA: 1, // A will lose its last argument
			argumentsRemainingB: 0, // B has no arguments left
		})

		const result = applyTurnTimeoutToDebate(debate)

		expect(result.status).toBe(DebateStatus.ENDED)
		expect(result.currentTurn).toBeNull()
		expect(result.turnEndsAt).toBeUndefined()
	})
})
