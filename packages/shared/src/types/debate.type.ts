import type { Evaluation } from './evaluation.type.js'
import type { Message } from './message.type.js'

export enum DebateStatus {
	WAITING = 'WAITING', // Odottaa toista osallistujaa
	SIDE_SELECTION = 'SIDE_SELECTION', // Molemmat paikalla, valitaan puolet
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
	sideAName: string
	sideBName?: string | null
	status: DebateStatus
	sideAJoined: boolean
	sideBJoined: boolean
	argumentsRemainingA: number // Jäljellä olevat argumentit (alkuperäinen: 3)
	argumentsRemainingB: number // Jäljellä olevat argumentit (alkuperäinen: 3)
	currentTurn: DebateSide | null // Kumman vuoro on tällä hetkellä argumentoida
	turnEndsAt?: string // ISO-aikaleima, mihin asti nykyinen vuoro kestää
	messages: Message[]
	evaluation?: Evaluation
}

export type TopicSideChoice = 'A' | 'B'
