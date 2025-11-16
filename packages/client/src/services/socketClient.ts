import type { ClientToServerEvents, ServerToClientEvents } from '@argumentor/shared'
import { io, type Socket } from 'socket.io-client'

export type DebateClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socketInstance: DebateClientSocket | null = null
let socketUsername: string | null = null

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000'

const createSocketInstance = (username: string): DebateClientSocket =>
	io(SOCKET_URL, {
		autoConnect: false,
		transports: ['websocket'],
		withCredentials: true,
		auth: { username },
	})

const cleanupSocketInstance = (): void => {
	if (socketInstance) {
		socketInstance.removeAllListeners()
		socketInstance.disconnect()
		socketInstance = null
	}
	socketUsername = null
}

export const getSocket = (username: string): DebateClientSocket => {
	const trimmed = username.trim()
	if (!trimmed) throw new Error('Username is required to initialize the socket connection')

	if (!socketInstance || socketUsername !== trimmed) {
		cleanupSocketInstance()
		socketInstance = createSocketInstance(trimmed)
		socketUsername = trimmed
	} else {
		socketInstance.auth = { username: trimmed }
	}

	return socketInstance
}

export const destroySocket = (): void => cleanupSocketInstance()

export const ensureSocketConnected = (socket: DebateClientSocket): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		if (socket.connected) return resolve()

		const authUsername = (socket.auth as { username?: string } | undefined)?.username?.trim()
		if (!authUsername) return reject(new Error('AUTH_REQUIRED'))

		socket.once('connect', () => resolve())
		socket.once('connect_error', (err: Error) => reject(err))
		socket.connect()
	})
}
