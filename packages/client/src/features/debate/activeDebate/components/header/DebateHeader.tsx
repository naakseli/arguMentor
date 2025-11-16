import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { Alert, Box, Card, Group, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useTimer } from '../../../hooks/useTimer'
import useSideVariables from './hooks/useSideVariables'
import PerspectiveCard from './PerspectiveCards'
import TurnTimer from './TurnTimer'

interface DebateHeaderProps {
	debate: Debate
	userSide: DebateSide | null
}

const DebateHeader = ({ debate, userSide }: DebateHeaderProps) => {
	const isUserTurn = debate.currentTurn === userSide
	const isActiveTurn = debate.status === DebateStatus.ACTIVE && debate.currentTurn !== null
	const secondsRemaining = useTimer(debate.turnEndsAt, isActiveTurn)

	const { perspectiveCards, userPerspective } = useSideVariables(debate, userSide)

	return (
		<Card withBorder radius='md' p='md'>
			<Stack gap='sm'>
				<Title order={4} mb='xs'>
					{debate.topic}
				</Title>
				<TurnTimer
					isActiveTurn={isActiveTurn}
					userSide={userSide}
					isUserTurn={isUserTurn}
					secondsRemaining={secondsRemaining}
				/>

				<Group gap='md' align='stretch' grow>
					{perspectiveCards.map(card => (
						<PerspectiveCard key={card.side} card={card} />
					))}
				</Group>

				{/* Oma kanta + aihe */}
				<Box style={{ flex: 1 }}>
					{userPerspective && (
						<Alert
							icon={<IconInfoCircle size={16} />}
							color={userPerspective.color}
							variant='light'
							mb='xs'
						>
							<Text size='sm' fw={700}>
								Sinä puolustat:{' '}
								<Text span c={userPerspective.color} fw={700}>
									{userPerspective.topic}
								</Text>
							</Text>
						</Alert>
					)}
				</Box>
			</Stack>
		</Card>
	)
}

export default DebateHeader
