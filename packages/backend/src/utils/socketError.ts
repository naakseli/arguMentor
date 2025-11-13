import type { ErrorEvent } from '@argumentor/shared'
import type { Socket } from 'socket.io'

export const emitSocketError = (socket: Socket, code: string, message: string): void => {
	const payload: ErrorEvent = { code, message }
	socket.emit('error', payload)
}

export const handleSocketHandlerError = (
	socket: Socket,
	code: string,
	message: string,
	error: unknown,
	context?: string
): void => {
	const prefix = context ?? `Socket handler "${code}"`
	console.error(`${prefix}:`, error)
	emitSocketError(socket, code, message)
}
