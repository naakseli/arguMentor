import type { JSX, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import type { DebateClientSocket } from '../services/socketClient.js'
import { destroySocket, getSocket } from '../services/socketClient.js'

interface SocketContextValue {
	socket: DebateClientSocket
}

const SocketContext = createContext<SocketContextValue | null>(null)

export const SocketProvider = ({ children }: { children: ReactNode }): JSX.Element => {
	const socket = useMemo(() => getSocket(), [])

	useEffect(() => {
		const handleConnectError = (error: Error) => {
			console.error('Socket connection error:', error)
		}

		if (!socket.connected) {
			socket.connect()
		}

		socket.on('connect_error', handleConnectError)

		return () => {
			socket.off('connect_error', handleConnectError)
			destroySocket()
		}
	}, [socket])

	return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}

export const useSocket = (): DebateClientSocket => {
	const context = useContext(SocketContext)
	if (!context) {
		throw new Error('useSocket must be used within a SocketProvider')
	}

	return context.socket
}
