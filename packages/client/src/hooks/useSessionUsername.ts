import { useCallback, useState } from 'react'

const STORAGE_KEY = 'argumentor_username'

const getInitialUsername = (): string | null => {
	if (typeof window === 'undefined') return null

	return window.sessionStorage.getItem(STORAGE_KEY)
}

export const useSessionUsername = () => {
	const [username, setUsernameState] = useState<string | null>(getInitialUsername)

	const saveUsername = useCallback((value: string) => {
		const trimmed = value.trim()

		if (!trimmed) {
			window.sessionStorage.removeItem(STORAGE_KEY)
			return setUsernameState(null)
		}

		window.sessionStorage.setItem(STORAGE_KEY, trimmed)
		setUsernameState(trimmed)
	}, [])

	const clearUsername = useCallback(() => {
		window.sessionStorage.removeItem(STORAGE_KEY)
		setUsernameState(null)
	}, [])

	return {
		username,
		saveUsername,
		clearUsername,
	}
}
