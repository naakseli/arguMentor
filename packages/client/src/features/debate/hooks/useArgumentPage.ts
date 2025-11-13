import type {
	ArgumentsUpdatedEvent,
	Debate,
	DebateEndedEvent,
	DebateJoinedEvent,
	DebateStartedEvent,
	ErrorEvent,
	EvaluationReadyEvent,
	NewMessageEvent,
} from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { useEffect, useState } from 'react'
import { useSocket } from '../../../providers/SocketProvider'
import { ensureSocketConnected } from '../../../services/socketClient'
import { useDebate } from './useDebate'

interface UseArgumentPageResult {
	debate: Debate | null
	userSide: DebateSide | null
	loading: boolean
	error: string | null
}

export const useArgumentPage = (roomCode: string | undefined): UseArgumentPageResult => {
	const socket = useSocket()
	const { getDebateInfo } = useDebate()
	const [debate, setDebate] = useState<Debate | null>(null)
	const [userSide, setUserSide] = useState<DebateSide | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!roomCode) {
			setLoading(false)
			setError('Huonekoodi puuttuu')
			return
		}

		let isMounted = true

		const fetchInitialDebate = async () => {
			setLoading(true)
			setError(null)

			try {
				await ensureSocketConnected(socket)
				const initialDebate = await getDebateInfo(roomCode)

				if (isMounted) {
					setDebate(initialDebate)
					// If user created the debate (sideAJoined is true and sideBJoined is false), they are SIDE_A
					// Otherwise, we'll determine from debate_joined event
					if (initialDebate.sideAJoined && !initialDebate.sideBJoined) {
						setUserSide(DebateSide.SIDE_A)
					} else setUserSide(DebateSide.SIDE_B)
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Virhe väittelyn haussa')
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		fetchInitialDebate()

		// Set up socket event listeners
		const handleDebateJoined = (payload: DebateJoinedEvent) => {
			if (isMounted && payload.debate.roomCode === roomCode) {
				console.log('debate_joined', payload)
				setUserSide(payload.side)
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...payload.debate,
					}
				})
			}
		}

		const handleDebateStarted = (payload: DebateStartedEvent) => {
			if (isMounted && payload.debate.roomCode === roomCode) {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						status: payload.debate.status,
						sideAJoined: payload.debate.sideAJoined,
						sideBJoined: payload.debate.sideBJoined,
					}
				})
			}
		}

		const handleArgumentsUpdated = (payload: ArgumentsUpdatedEvent) => {
			if (isMounted) {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						argumentsRemainingA: payload.argumentsRemainingA,
						argumentsRemainingB: payload.argumentsRemainingB,
					}
				})
			}
		}

		const handleNewMessage = (payload: NewMessageEvent) => {
			if (isMounted) {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						messages: [...prevDebate.messages, payload],
					}
				})
			}
		}

		const handleDebateEnded = (payload: DebateEndedEvent) => {
			if (isMounted && payload.debate.roomCode === roomCode) {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						status: payload.debate.status,
					}
				})
			}
		}

		const handleEvaluationReady = (payload: EvaluationReadyEvent) => {
			if (isMounted) {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						evaluation: payload.evaluation,
						status: payload.evaluation ? DebateStatus.EVALUATED : prevDebate.status,
					}
				})
			}
		}

		const handleError = (payload: ErrorEvent) => {
			if (isMounted) {
				setError(payload.message)
			}
		}

		// Register all listeners
		socket.on('debate_joined', handleDebateJoined)
		socket.on('debate_started', handleDebateStarted)
		socket.on('arguments_updated', handleArgumentsUpdated)
		socket.on('new_message', handleNewMessage)
		socket.on('debate_ended', handleDebateEnded)
		socket.on('evaluation_ready', handleEvaluationReady)
		socket.on('error', handleError)

		// Cleanup function
		return () => {
			isMounted = false
			socket.off('debate_joined', handleDebateJoined)
			socket.off('debate_started', handleDebateStarted)
			socket.off('arguments_updated', handleArgumentsUpdated)
			socket.off('new_message', handleNewMessage)
			socket.off('debate_ended', handleDebateEnded)
			socket.off('evaluation_ready', handleEvaluationReady)
			socket.off('error', handleError)
		}
	}, [roomCode])

	return {
		debate,
		userSide,
		loading,
		error,
	}
}
