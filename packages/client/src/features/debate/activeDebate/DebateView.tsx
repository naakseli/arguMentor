import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { Alert, Button, Stack } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import DebateEndedAlert from './components/DebateEndedAlert'
import DebateStats from './components/DebateStats'
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
	const navigate = useNavigate()

	const isDebateEnded =
		debate.status === DebateStatus.ENDED || debate.status === DebateStatus.EVALUATED
	const isDebateActive = debate.status === DebateStatus.ACTIVE
	const isSelectingSides = debate.status === DebateStatus.SIDE_SELECTION
	const isWaitingForOpponent = debate.status === DebateStatus.WAITING

	const handleMessageSent = () => setScrollTrigger(prev => prev + 1)

	return (
		<Stack gap='md'>
			{isSelectingSides && userSide === DebateSide.SIDE_B && (
				<SideSelectionPrompt
					topic={debate.topic}
					topicSideA={debate.topicSideA}
					topicSideB={debate.topicSideB}
					debate={debate}
				/>
			)}
			{isSelectingSides && userSide === DebateSide.SIDE_A && (
				<Alert
					icon={<IconInfoCircle size={16} />}
					color='blue'
					variant='light'
					title='Odotetaan valintaa'
				>
					Vastustaja valitsee parhaillaan puoltaan. Väittely alkaa heti, kun valinta on tehty.
				</Alert>
			)}
			{isWaitingForOpponent && userSide === DebateSide.SIDE_A && (
				<Alert
					icon={<IconInfoCircle size={16} />}
					color='blue'
					variant='light'
					title='Odotetaan vastustajaa'
				>
					Vastustaja ei ole vielä liittynyt väittelyyn. Jaamme puolen valinnan heti, kun hän on
					paikalla.
				</Alert>
			)}

			{isDebateActive && <DebateHeader debate={debate} userSide={userSide} />}

			{!isSelectingSides && (
				<MessageList debate={debate} userSide={userSide} scrollTrigger={scrollTrigger} />
			)}

			{!isDebateEnded && isDebateActive && (
				<MessageInput onMessageSent={handleMessageSent} debate={debate} userSide={userSide} />
			)}

			{isDebateEnded && !debate.evaluation && <DebateEndedAlert />}

			{debate.evaluation && (
				<>
					<DebateStats debate={debate} />

					<EvaluationDisplay
						evaluation={debate.evaluation}
						sideAName={debate.sideAName}
						sideBName={debate.sideBName ?? undefined}
					/>

					<Button onClick={() => navigate('/')}>Takaisin alkuun</Button>
				</>
			)}
		</Stack>
	)
}

export default DebateView
