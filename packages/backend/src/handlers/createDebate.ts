import type { CreateDebatePayload } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import * as debateService from '../services/debateService.js'
import type { DebateSocket } from '../types/socket.js'
import { generateUniqueRoomCode } from '../utils/roomCodeGenerator.js'
import { emitSocketError, handleSocketHandlerError } from '../utils/socketError.js'

export const handleCreateDebate = async (
	socket: DebateSocket,
	payload: CreateDebatePayload
): Promise<void> => {
	try {
		// Validate topic
		if (!payload.topic || typeof payload.topic !== 'string' || payload.topic.trim().length === 0) {
			emitSocketError(socket, 'INVALID_TOPIC', 'Topic is required and cannot be empty')
			return
		}

		// Generate room code
		const roomCode = await generateUniqueRoomCode()

		// Create debate object
		const debate = {
			roomCode,
			topic: payload.topic,
			topicSideA: payload.topicSideA,
			topicSideB: payload.topicSideB,
			status: DebateStatus.WAITING,
			sideAJoined: true,
			sideBJoined: false,
			argumentsRemainingA: 3,
			argumentsRemainingB: 3,
			currentTurn: null,
			messages: [],
		}

		// Save to Redis
		await debateService.saveDebate(debate)

		// Join socket room
		socket.join(roomCode)

		// Store room code in socket data
		socket.data.roomCode = roomCode
		socket.data.side = DebateSide.SIDE_A

		// Emit success event
		socket.emit('debate_created', {
			roomCode,
			debate,
		})
	} catch (error) {
		handleSocketHandlerError(
			socket,
			'CREATE_DEBATE_ERROR',
			'Failed to create debate',
			error,
			'Error creating debate'
		)
	}
}
