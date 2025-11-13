import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { useEffect, useState } from 'react'
import { useSocket } from '../../../providers/SocketProvider'
import { debateSocketService } from '../../../services/debateSocketService'
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

		// Set up socket event listeners using the service
		const unsubscribe = debateSocketService.subscribeToDebateEvents(socket, roomCode, {
			onDebateJoined: payload => {
				if (isMounted) {
					console.log('debate_joined', payload)
					setUserSide(payload.side)
					setDebate(prevDebate => {
						if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
						return {
							...payload.debate,
						}
					})
				}
			},
			onDebateStarted: payload => {
				if (isMounted) {
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
			},
			onArgumentsUpdated: payload => {
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
			},
			onNewMessage: payload => {
				if (isMounted) {
					setDebate(prevDebate => {
						if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
						return {
							...prevDebate,
							messages: [...prevDebate.messages, payload],
						}
					})
				}
			},
			onDebateEnded: payload => {
				if (isMounted) {
					setDebate(prevDebate => {
						if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
						return {
							...prevDebate,
							status: payload.debate.status,
						}
					})
				}
			},
			onEvaluationReady: payload => {
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
			},
			onError: payload => {
				if (isMounted) {
					setError(payload.message)
				}
			},
		})

		// Cleanup function
		return () => {
			isMounted = false
			unsubscribe()
		}
	}, [roomCode, socket, getDebateInfo])

	return {
		debate,
		userSide,
		loading,
		error,
	}
}
