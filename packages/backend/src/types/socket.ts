import type {
	ClientToServerEvents,
	DebateSocketData,
	ServerToClientEvents,
} from '@argumentor/shared'
import type { Socket } from 'socket.io'

export type DebateSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, DebateSocketData>
