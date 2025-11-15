import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { useEffect, useState } from 'react'
import { useSocket } from '../../../providers/SocketProvider'
import { debateSocketService } from '../../../services/debateSocketService'
import { useDebate } from './useDebate'

interface UseArgumentPageResult {
	debate: Debate | null
	userSide: DebateSide | null
	isLoading: boolean
	error: string | null
}

export const useArgumentPage = (roomCode: string | undefined): UseArgumentPageResult => {
	const socket = useSocket()
	const { getDebateInfo, isLoading } = useDebate()
	const [debate, setDebate] = useState<Debate | null>(null)
	const [userSide, setUserSide] = useState<DebateSide | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!roomCode) return setError('Huonekoodi puuttuu')

		const fetchInitialDebate = async () => {
			setError(null)

			try {
				const initialDebate = await getDebateInfo(roomCode)

				setDebate(initialDebate)
				// If user created the debate (sideAJoined is true and sideBJoined is false), they are SIDE_A
				// Otherwise, we'll determine from debate_joined event
				if (initialDebate.sideAJoined && !initialDebate.sideBJoined) {
					setUserSide(DebateSide.SIDE_A)
				} else setUserSide(DebateSide.SIDE_B)
			} catch (err) {
				setError('Virhe väittelyn haussa')
			}
		}

		fetchInitialDebate()

		// Set up socket event listeners using the service
		const unsubscribe = debateSocketService.subscribeToDebateEvents(socket, roomCode, {
			onDebateJoined: payload => {
				console.log('debate_joined', payload)
				setUserSide(payload.side)
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...payload.debate,
					}
				})
			},
			onDebateStarted: payload => {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						status: payload.debate.status,
						sideAJoined: payload.debate.sideAJoined,
						sideBJoined: payload.debate.sideBJoined,
						currentTurn: payload.debate.currentTurn,
						turnEndsAt: payload.debate.turnEndsAt,
					}
				})
			},
			onArgumentsUpdated: payload => {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						argumentsRemainingA: payload.argumentsRemainingA,
						argumentsRemainingB: payload.argumentsRemainingB,
					}
				})
			},
			onNewMessage: payload => {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						messages: [...prevDebate.messages, payload],
					}
				})
			},
			onDebateEnded: payload => {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						status: payload.debate.status,
					}
				})
			},
			onTurnUpdated: payload => {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						currentTurn: payload.currentTurn,
						turnEndsAt: payload.turnEndsAt,
					}
				})
			},
			onEvaluationReady: payload => {
				setDebate(prevDebate => {
					if (!prevDebate || prevDebate.roomCode !== roomCode) return prevDebate
					return {
						...prevDebate,
						evaluation: payload.evaluation,
						status: payload.evaluation ? DebateStatus.EVALUATED : prevDebate.status,
					}
				})
			},
			onError: payload => {
				setError(payload.message)
			},
		})

		return () => {
			unsubscribe()
		}
	}, [roomCode])

	return {
		debate,
		userSide,
		isLoading,
		error,
	}
}
