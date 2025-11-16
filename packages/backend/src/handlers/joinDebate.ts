import type { JoinDebatePayload } from '@argumentor/shared'
import { DebateSide } from '@argumentor/shared'
import * as debateService from '../services/debateService.js'
import type { DebateSocket } from '../types/socket.js'
import { emitSocketError, handleSocketHandlerError } from '../utils/socketError.js'

export const handleJoinDebate = async (
	socket: DebateSocket,
	payload: JoinDebatePayload
): Promise<void> => {
	try {
		// Validate room code
		if (!payload.roomCode || typeof payload.roomCode !== 'string') {
			emitSocketError(socket, 'INVALID_ROOM_CODE', 'Room code is required')
			return
		}

		const roomCode = payload.roomCode

		// Check if debate exists
		const debate = await debateService.getDebate(roomCode)
		if (!debate) {
			emitSocketError(socket, 'DEBATE_NOT_FOUND', 'Debate room not found')
			return
		}

		// Ensure side B slot is available
		if (debate.sideBJoined) {
			emitSocketError(socket, 'DEBATE_FULL', 'Debate room is already full')
			return
		}

		if (!debate.sideAName) {
			debate.sideAName = 'Väittelijä A'
		}

		debate.sideBJoined = true
		debate.sideBName = socket.data.username

		const side = DebateSide.SIDE_B

		// Save updated debate
		await debateService.saveDebate(debate)

		// Join socket room
		socket.join(roomCode)

		// Store room code and side in socket data
		socket.data.roomCode = roomCode
		socket.data.side = side

		// Emit join success
		socket.emit('debate_joined', {
			side,
			debate,
		})

		// Notify creator that opponent joined
		socket.emit('debate_update', { debate })
		socket.to(roomCode).emit('debate_update', { debate })
	} catch (error) {
		handleSocketHandlerError(
			socket,
			'JOIN_DEBATE_ERROR',
			'Failed to join debate',
			error,
			'Error joining debate'
		)
	}
}
