import type { JSX, ReactNode } from 'react'
import { createContext, useContext } from 'react'
import NamePrompt from '../features/identity/NamePrompt.js'
import { useSessionUsername } from '../hooks/useSessionUsername.js'

interface IdentityContextValue {
	username: string | null
	setUsername: (value: string) => void
	clearUsername: () => void
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

export const IdentityProvider = ({ children }: { children: ReactNode }): JSX.Element => {
	const { username, saveUsername, clearUsername } = useSessionUsername()

	const contextValue = {
		username,
		setUsername: saveUsername,
		clearUsername,
	}

	if (!username) {
		return (
			<IdentityContext.Provider value={contextValue}>
				<NamePrompt onSubmit={saveUsername} />
			</IdentityContext.Provider>
		)
	}

	return <IdentityContext.Provider value={contextValue}>{children}</IdentityContext.Provider>
}

export const useIdentity = (): IdentityContextValue => {
	const context = useContext(IdentityContext)

	if (!context) {
		throw new Error('useIdentity must be used within an IdentityProvider')
	}

	return context
}
