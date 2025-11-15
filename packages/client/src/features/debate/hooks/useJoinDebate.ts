import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDebate } from './useDebate'

interface UseJoinDebateParams {
	onSuccess?: (roomCode: string) => void
}

interface UseJoinDebateResult {
	handleJoinDebate: (roomCode: string) => Promise<void>
	error: string | null
	resetError: () => void
	isJoining: boolean
}

export const useJoinDebate = ({ onSuccess }: UseJoinDebateParams = {}): UseJoinDebateResult => {
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const [isJoining, setIsJoining] = useState(false)

	const { joinDebate } = useDebate()

	const handleJoinDebate = async (roomCode: string) => {
		setError(null)
		setIsJoining(true)

		try {
			const joinedRoomCode = await joinDebate(roomCode)
			navigate(`/argument/${joinedRoomCode}`)
			onSuccess?.(joinedRoomCode)
		} catch (error) {
			setError('Väittelyyn liittyminen epäonnistui')
			console.error('Failed to join debate', error)
		} finally {
			setIsJoining(false)
		}
	}

	const resetError = () => setError(null)

	return { handleJoinDebate, error, resetError, isJoining }
}
