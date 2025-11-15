import type { Debate } from '@argumentor/shared'
import { DebateSide } from '@argumentor/shared'
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
				setDebate(payload.debate)
			},
			onDebateUpdate: payload => {
				setDebate(payload.debate)
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
