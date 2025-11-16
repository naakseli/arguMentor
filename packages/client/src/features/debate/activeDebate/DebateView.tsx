import type { Debate, TopicSideChoice } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { Alert, Stack } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useState } from 'react'
import DebateEndedAlert from '../components/DebateEndedAlert'
import { useDebate } from '../hooks/useDebate'
import EvaluationDisplay from './components/EvaluationDisplay'
import DebateHeader from './components/header/DebateHeader'
import MessageInput from './components/Messages/MessageInput'
import MessageList from './components/Messages/MessageList'
import SideSelectionPrompt from './components/SideSelectionPrompt'

interface DebateViewProps {
	debate: Debate
	userSide: DebateSide
}

const DebateView = ({ debate, userSide }: DebateViewProps) => {
	const [scrollTrigger, setScrollTrigger] = useState(0)
	const [isSelectingSide, setIsSelectingSide] = useState(false)
	const [selectionError, setSelectionError] = useState<string | null>(null)
	const { selectTopicSide } = useDebate()

	const isDebateEnded =
		debate.status === DebateStatus.ENDED || debate.status === DebateStatus.EVALUATED
	const isDebateActive = debate.status === DebateStatus.ACTIVE
	const requiresSideSelection =
		debate.status === DebateStatus.WAITING && debate.sideBJoined && debate.currentTurn === null

	const handleMessageSent = () => setScrollTrigger(prev => prev + 1)

	const argumentsRemaining =
		userSide === DebateSide.SIDE_A ? debate.argumentsRemainingA : debate.argumentsRemainingB

	const isUserTurn = debate.currentTurn === userSide

	const handleSideSelection = async (choice: TopicSideChoice) => {
		if (!debate.roomCode || isSelectingSide) return

		setSelectionError(null)
		setIsSelectingSide(true)

		try {
			await selectTopicSide(debate.roomCode, choice)
		} catch (error) {
			console.error('Failed to select topic side', error)
			setSelectionError('Puolen valinta epäonnistui. Yritä uudelleen.')
		} finally {
			setIsSelectingSide(false)
		}
	}

	return (
		<Stack gap='md'>
			{!requiresSideSelection && <DebateHeader debate={debate} userSide={userSide} />}
			{requiresSideSelection && userSide === DebateSide.SIDE_B && (
				<SideSelectionPrompt
					topic={debate.topic}
					topicSideA={debate.topicSideA}
					topicSideB={debate.topicSideB}
					isSubmitting={isSelectingSide}
					error={selectionError}
					onSelect={handleSideSelection}
				/>
			)}
			{requiresSideSelection && userSide === DebateSide.SIDE_A && (
				<Alert
					icon={<IconInfoCircle size={16} />}
					color='blue'
					variant='light'
					title='Odotetaan valintaa'
				>
					Vastustaja valitsee parhaillaan puoltaan. Väittely alkaa heti, kun valinta on tehty.
				</Alert>
			)}
			{!requiresSideSelection && (
				<MessageList debate={debate} userSide={userSide} scrollTrigger={scrollTrigger} />
			)}
			{!isDebateEnded && isDebateActive && (
				<MessageInput
					onMessageSent={handleMessageSent}
					argumentsRemaining={argumentsRemaining}
					isUserTurn={isUserTurn}
				/>
			)}
			{isDebateEnded && !debate.evaluation && <DebateEndedAlert />}
			{debate.evaluation && (
				<EvaluationDisplay
					evaluation={debate.evaluation}
					sideAName={debate.sideAName}
					sideBName={debate.sideBName ?? undefined}
				/>
			)}
		</Stack>
	)
}

export default DebateView
