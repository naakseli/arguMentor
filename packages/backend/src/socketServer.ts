import type {
	ClientToServerEvents,
	DebateSocketData,
	ServerToClientEvents,
} from '@argumentor/shared'
import { Server } from 'socket.io'

export const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, DebateSocketData>({
	cors: { origin: '*' },
})
