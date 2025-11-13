// Connect to Redis
import type {
	ClientToServerEvents,
	DebateSocketData,
	InterServerEvents,
	ServerToClientEvents,
} from '@argumentor/shared'
import { Server } from 'socket.io'
import { setupSocketHandlers } from './handlers/socketHandlers.js'
import redis from './services/redis.js'

redis.connect()

const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	DebateSocketData
>({
	cors: { origin: '*' },
})

io.on('connection', setupSocketHandlers)

const port = Number(process.env.SOCKET_PORT) || 3000
io.listen(port)
console.log(`Socket server listening on port ${port}`)
