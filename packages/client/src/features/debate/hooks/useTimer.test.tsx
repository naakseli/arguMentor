import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTimer } from './useTimer'

describe('useTimer', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('returns null when endTimeIso is not provided', () => {
		const { result } = renderHook(() => useTimer(undefined, true))

		expect(result.current).toBeNull()
	})

	it('returns null when timer is not active', () => {
		const future = new Date(Date.now() + 30_000).toISOString()

		const { result, rerender } = renderHook(
			({ endTimeIso, isActive }: { endTimeIso?: string; isActive?: boolean }) =>
				useTimer(endTimeIso, isActive),
			{
				initialProps: { endTimeIso: future, isActive: false },
			}
		)

		expect(result.current).toBeNull()

		// even if we advance timers, inactive timer should stay null
		act(() => {
			vi.advanceTimersByTime(5_000)
		})

		expect(result.current).toBeNull()

		// when we activate it, it should start counting
		rerender({ endTimeIso: future, isActive: true })

		expect(result.current).not.toBeNull()
	})

	it('computes remaining seconds for a future time and updates every second', () => {
		const now = Date.now()
		vi.setSystemTime(now)

		const endTimeIso = new Date(now + 10_000).toISOString() // 10 seconds in the future

		const { result } = renderHook(() => useTimer(endTimeIso, true))

		// initial value should be ~10 seconds
		expect(result.current).toBe(10)

		act(() => {
			vi.advanceTimersByTime(3_000)
		})

		// after 3 seconds, should be ~7 seconds remaining
		expect(result.current).toBe(7)
	})

	it('never returns negative values and eventually reaches zero', () => {
		const now = Date.now()
		vi.setSystemTime(now)

		const endTimeIso = new Date(now + 2_000).toISOString()

		const { result } = renderHook(() => useTimer(endTimeIso, true))

		expect(result.current).toBe(2)

		act(() => {
			vi.advanceTimersByTime(5_000)
		})

		// timer should not go below zero
		expect(result.current).toBe(0)
	})
})
