import type { DebateSocket } from '../types/socket.js'
import { handleCreateDebate } from './createDebate.js'
import { handleGetDebateInfo } from './getDebateInfo.js'
import { handleJoinDebate } from './joinDebate.js'
import { handleLeaveDebate } from './leaveDebate.js'
import { handleSendMessage } from './sendMessage.js'

export const setupSocketHandlers = (socket: DebateSocket): void => {
	console.log('Socket connected', socket.id)

	socket.on('create_debate', payload => handleCreateDebate(socket, payload))

	socket.on('join_debate', payload => handleJoinDebate(socket, payload))

	socket.on('get_debate_info', payload => handleGetDebateInfo(socket, payload))

	socket.on('send_message', payload => handleSendMessage(socket, payload))

	socket.on('leave_debate', () => handleLeaveDebate(socket))

	socket.on('disconnect', () => {
		// Clean up on disconnect
		handleLeaveDebate(socket)
	})
}
