import type { Evaluation } from './evaluation.js'
import type { Message } from './message.js'

export enum DebateStatus {
	WAITING = 'WAITING', // Odottaa toista osallistujaa
	ACTIVE = 'ACTIVE', // Väittely käynnissä
	ENDED = 'ENDED', // Väittely päättynyt (kaikki argumentit käytetty)
	EVALUATED = 'EVALUATED', // AI on arvioinut
}

export enum DebateSide {
	SIDE_A = 'SIDE_A',
	SIDE_B = 'SIDE_B',
	TIE = 'TIE',
}

export interface Debate {
	roomCode: string // Esim. "ABC123" - 6 merkkiä
	topic: string
	topicSideA: string // Esim. "Kannattaa"
	topicSideB: string // Esim. "Vastustaa"
	status: DebateStatus
	sideAJoined: boolean
	sideBJoined: boolean
	argumentsRemainingA: number // Jäljellä olevat argumentit (alkuperäinen: 3)
	argumentsRemainingB: number // Jäljellä olevat argumentit (alkuperäinen: 3)
	messages: Message[]
	evaluation?: Evaluation
}
