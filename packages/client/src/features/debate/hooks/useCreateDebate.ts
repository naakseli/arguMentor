import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDebate } from './useDebate'

interface UseCreateDebateParams {
	onSuccess?: (roomCode: string) => void
}

interface UseCreateDebateResult {
	handleCreateDebate: (topic: string, topicSideA: string, topicSideB: string) => Promise<void>
	error: string | null
	resetError: () => void
	isCreating: boolean
}

export const useCreateDebate = ({ onSuccess }: UseCreateDebateParams): UseCreateDebateResult => {
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)

	const { createDebate } = useDebate()

	const handleCreateDebate = async (topic: string, topicSideA: string, topicSideB: string) => {
		setError(null)
		setIsCreating(true)

		try {
			const roomCode = await createDebate(topic, topicSideA, topicSideB)
			navigate(`/argument/${roomCode}`)
			onSuccess?.(roomCode)
		} catch (error) {
			setError('Väittelyn luonti epäonnistui')
			console.error('Failed to create debate', error)
		} finally {
			setIsCreating(false)
		}
	}

	const resetError = () => setError(null)

	return { handleCreateDebate, error, resetError, isCreating }
}
