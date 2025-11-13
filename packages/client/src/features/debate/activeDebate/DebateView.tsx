import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { Stack } from '@mantine/core'
import { useState } from 'react'
import DebateEndedAlert from '../components/DebateEndedAlert'
import DebateHeader from './components/DebateHeader'
import EvaluationDisplay from './components/EvaluationDisplay'
import MessageInput from './components/MessageInput'
import MessageList from './components/MessageList'

interface DebateViewProps {
	debate: Debate
	userSide: DebateSide
}

const DebateView = ({ debate, userSide }: DebateViewProps) => {
	const [scrollTrigger, setScrollTrigger] = useState(0)

	const isDebateEnded =
		debate.status === DebateStatus.ENDED || debate.status === DebateStatus.EVALUATED

	const handleMessageSent = () => setScrollTrigger(prev => prev + 1)

	return (
		<Stack gap='md'>
			<DebateHeader debate={debate} userSide={userSide} />
			<MessageList debate={debate} scrollTrigger={scrollTrigger} />
			{!isDebateEnded && <MessageInput onMessageSent={handleMessageSent} />}
			{isDebateEnded && !debate.evaluation && <DebateEndedAlert />}
			{debate.evaluation && <EvaluationDisplay evaluation={debate.evaluation} />}
		</Stack>
	)
}

export default DebateView
