import type {
	ClientToServerEvents,
	DebateSocketData,
	ServerToClientEvents,
} from '@argumentor/shared'
import { Server } from 'socket.io'

export const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, DebateSocketData>({
	cors: { origin: '*' },
})

io.use((socket, next) => {
	const rawUsername = socket.handshake.auth?.username
	const username = typeof rawUsername === 'string' ? rawUsername.trim() : ''

	if (!username) {
		const error = new Error('AUTH_REQUIRED') as Error & {
			data?: { code: string; message: string }
		}
		error.data = {
			code: 'AUTH_REQUIRED',
			message: 'Display name is required before connecting to Argumentor',
		}
		next(error)
		return
	}

	socket.data.username = username
	next()
})
