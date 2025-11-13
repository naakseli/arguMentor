import type { ClientToServerEvents, ServerToClientEvents } from '@argumentor/shared'
import { io, type Socket } from 'socket.io-client'

export type DebateClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socketInstance: DebateClientSocket | null = null

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000'

const createSocketInstance = (): DebateClientSocket =>
	io(SOCKET_URL, {
		autoConnect: false,
		transports: ['websocket'],
		withCredentials: true,
	})

export const getSocket = (): DebateClientSocket => {
	if (!socketInstance) {
		socketInstance = createSocketInstance()
	}

	return socketInstance
}

export const destroySocket = (): void => {
	if (socketInstance) {
		socketInstance.removeAllListeners()
		socketInstance.disconnect()
		socketInstance = null
	}
}

export const ensureSocketConnected = (socket: DebateClientSocket): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		if (socket.connected) {
			resolve()
			return
		}
		socket.once('connect', () => resolve())
		socket.once('connect_error', (err: Error) => reject(err))
		socket.connect()
	})
}
