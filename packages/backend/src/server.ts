import { setupSocketHandlers } from './handlers/socketHandlers.js'
import redis from './services/redis.js'
import { io } from './socketServer.js'

redis.connect()

io.on('connection', setupSocketHandlers)

const port = Number(process.env.SOCKET_PORT) || 3000
io.listen(port)
console.log(`Socket server listening on port ${port}`)
