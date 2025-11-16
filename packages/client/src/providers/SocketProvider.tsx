import type { JSX, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import type { DebateClientSocket } from '../services/socketClient.js'
import { destroySocket, getSocket } from '../services/socketClient.js'
import { useIdentity } from './IdentityProvider.js'

interface SocketContextValue {
	socket: DebateClientSocket
}

const SocketContext = createContext<SocketContextValue | null>(null)

type ConnectError = Error & { data?: { code?: string; message?: string } }

export const SocketProvider = ({ children }: { children: ReactNode }): JSX.Element => {
	const { username, clearUsername } = useIdentity()

	const socket = useMemo(() => {
		if (!username) {
			throw new Error('Username is required before initializing the socket connection')
		}

		return getSocket(username)
	}, [username])

	useEffect(() => {
		const handleConnectError = (error: ConnectError) => {
			console.error('Socket connection error:', error)

			if (error?.data?.code === 'AUTH_REQUIRED') clearUsername()
		}

		if (!socket.connected) socket.connect()

		socket.on('connect_error', handleConnectError)

		return () => {
			socket.off('connect_error', handleConnectError)
			destroySocket()
		}
	}, [socket, clearUsername])

	return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}

export const useSocket = (): DebateClientSocket => {
	const context = useContext(SocketContext)
	if (!context) {
		throw new Error('useSocket must be used within a SocketProvider')
	}

	return context.socket
}
