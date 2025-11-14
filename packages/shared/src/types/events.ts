import type { Debate, DebateSide } from './debate.js'
import type { Evaluation } from './evaluation.js'

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

export interface LeaveDebatePayload {}

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

export interface DebateStartedEvent {
	debate: Debate
}

export interface ArgumentsUpdatedEvent {
	argumentsRemainingA: number
	argumentsRemainingB: number
}

export interface TurnUpdatedEvent {
	currentTurn: DebateSide | null
	turnEndsAt?: string
}

export interface MessageSentEvent {
	messageId: string
	timestamp: string
}

export interface NewMessageEvent {
	id: string
	side: DebateSide
	content: string
	timestamp: string
}

export interface DebateEndedEvent {
	debate: Debate
}

export interface EvaluationReadyEvent {
	evaluation: Evaluation
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
	debate_started: (payload: DebateStartedEvent) => void
	arguments_updated: (payload: ArgumentsUpdatedEvent) => void
	turn_updated: (payload: TurnUpdatedEvent) => void
	message_sent: (payload: MessageSentEvent) => void
	new_message: (payload: NewMessageEvent) => void
	debate_ended: (payload: DebateEndedEvent) => void
	evaluation_ready: (payload: EvaluationReadyEvent) => void
	debate_left: () => void
	error: (payload: ErrorEvent) => void
}

export interface InterServerEvents {}

export interface DebateSocketData {
	roomCode?: string
	side?: DebateSide
}
