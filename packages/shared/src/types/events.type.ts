import type { Debate, DebateSide } from './debate.type.js'

// Client → Server Events
export interface CreateDebatePayload {
	topic: string
	topicSideA: string
	topicSideB: string
}

export interface JoinDebatePayload {
	roomCode: string
}

export interface GetDebateInfoPayload {
	roomCode: string
}

export interface SendMessagePayload {
	content: string
}

// Server → Client Events
export interface DebateCreatedEvent {
	roomCode: string
	debate: Debate
}

export interface DebateJoinedEvent {
	side: DebateSide
	debate: Debate
}

export interface DebateInfoEvent {
	debate: Debate
}

export interface DebateUpdateEvent {
	debate: Debate
}

export interface MessageSentEvent {
	messageId: string
}

export interface ErrorEvent {
	code: string
	message: string
}

// Socket.IO typed interfaces
export interface ClientToServerEvents {
	create_debate: (payload: CreateDebatePayload) => void
	join_debate: (payload: JoinDebatePayload) => void
	get_debate_info: (payload: GetDebateInfoPayload) => void
	send_message: (payload: SendMessagePayload) => void
	leave_debate: () => void
}

export interface ServerToClientEvents {
	debate_created: (payload: DebateCreatedEvent) => void
	debate_joined: (payload: DebateJoinedEvent) => void
	debate_info: (payload: DebateInfoEvent) => void
	debate_update: (payload: DebateUpdateEvent) => void
	message_sent: (payload: MessageSentEvent) => void
	debate_left: () => void
	error: (payload: ErrorEvent) => void
}

export interface DebateSocketData {
	username: string
	roomCode?: string
	side?: DebateSide
}
