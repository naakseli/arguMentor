import type { Debate, TopicSideChoice } from '@argumentor/shared'
import { useState } from 'react'
import { useSocket } from '../../../providers/SocketProvider'
import { debateSocketService } from '../../../services/debateSocketService'

interface UseDebateResult {
	createDebate: (topic: string, topicSideA: string, topicSideB: string) => Promise<string>
	joinDebate: (roomCode: string) => Promise<string>
	selectTopicSide: (roomCode: string, choice: TopicSideChoice) => Promise<void>
	getDebateInfo: (roomCode: string) => Promise<Debate>
	sendMessage: (content: string) => Promise<void>
	isLoading: boolean
	isSending: boolean
}

export const useDebate = (): UseDebateResult => {
	const socket = useSocket()
	const [isLoading, setIsLoading] = useState(false)
	const [isSending, setIsSending] = useState(false)

	const createDebate = async (topic: string, topicSideA: string, topicSideB: string) => {
		setIsLoading(true)

		const roomCode = await debateSocketService.createDebate(socket, topic, topicSideA, topicSideB)
		setIsLoading(false)
		return roomCode
	}

	const joinDebate = async (roomCode: string) => {
		setIsLoading(true)

		const result = await debateSocketService.joinDebate(socket, roomCode)
		setIsLoading(false)
		return result
	}

	const selectTopicSide = async (roomCode: string, choice: TopicSideChoice) =>
		debateSocketService.selectTopicSide(socket, roomCode, choice)

	const getDebateInfo = async (roomCode: string) => {
		const debate = await debateSocketService.getDebateInfo(socket, roomCode)
		return debate
	}

	const sendMessage = async (content: string) => {
		setIsSending(true)

		await debateSocketService.sendMessage(socket, content)
		setIsSending(false)
	}

	return {
		createDebate,
		joinDebate,
		selectTopicSide,
		getDebateInfo,
		sendMessage,
		isLoading,
		isSending,
	}
}
