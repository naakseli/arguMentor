import type {
	ClientToServerEvents,
	DebateSocketData,
	InterServerEvents,
	ServerToClientEvents,
} from '@argumentor/shared'
import type { Socket } from 'socket.io'

export type DebateSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	DebateSocketData
>
