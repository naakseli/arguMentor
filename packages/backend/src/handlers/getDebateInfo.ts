import type { GetDebateInfoPayload } from '@argumentor/shared'
import * as debateService from '../services/debateService.js'
import type { DebateSocket } from '../types/socket.js'
import { emitSocketError, handleSocketHandlerError } from '../utils/socketError.js'

export const handleGetDebateInfo = async (
	socket: DebateSocket,
	payload: GetDebateInfoPayload
): Promise<void> => {
	try {
		// Validate room code
		if (!payload.roomCode || typeof payload.roomCode !== 'string') {
			emitSocketError(socket, 'INVALID_ROOM_CODE', 'Room code is required')
			return
		}

		const roomCode = payload.roomCode
		const debate = await debateService.getDebate(roomCode)

		if (!debate) {
			emitSocketError(socket, 'DEBATE_NOT_FOUND', 'Debate room not found')
			return
		}

		// Emit debate info
		socket.emit('debate_info', { debate })
	} catch (error) {
		handleSocketHandlerError(
			socket,
			'GET_DEBATE_INFO_ERROR',
			'Failed to get debate info',
			error,
			'Error getting debate info'
		)
	}
}
