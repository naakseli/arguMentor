import { useEffect, useState } from 'react'

export const useTimer = (endTimeIso?: string, isActive?: boolean): number | null => {
	const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)

	useEffect(() => {
		if (!endTimeIso || !isActive) return setSecondsRemaining(null)

		const updateRemaining = () => {
			const endTime = new Date(endTimeIso).getTime()
			const now = Date.now()
			const diffSeconds = Math.max(0, Math.floor((endTime - now) / 1000))

			setSecondsRemaining(diffSeconds)
		}

		updateRemaining()

		const intervalId = window.setInterval(updateRemaining, 1000)

		return () => {
			window.clearInterval(intervalId)
		}
	}, [endTimeIso, isActive])

	return secondsRemaining
}
