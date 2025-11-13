import type { DebateSocket } from '../types/socket.js'

export const handleLeaveDebate = async (socket: DebateSocket): Promise<void> => {
	try {
		const roomCode = socket.data.roomCode

		if (roomCode) {
			// Leave socket room
			await socket.leave(roomCode)

			// Clear socket data
			socket.data.roomCode = undefined
			socket.data.side = undefined

			// Emit confirmation
			socket.emit('debate_left')
		}
	} catch (error) {
		console.error('Error leaving debate:', error)
		// Still clear socket data even if there's an error
		socket.data.roomCode = undefined
		socket.data.side = undefined
	}
}
