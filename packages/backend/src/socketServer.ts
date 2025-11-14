import type {
	ClientToServerEvents,
	DebateSocketData,
	InterServerEvents,
	ServerToClientEvents,
} from '@argumentor/shared'
import { Server } from 'socket.io'

export const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	DebateSocketData
>({
	cors: { origin: '*' },
})


