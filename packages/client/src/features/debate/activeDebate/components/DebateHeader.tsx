import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { Alert, Badge, Box, Card, Group, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useTimer } from '../../hooks/useTimer'

interface DebateHeaderProps {
	debate: Debate
	userSide: DebateSide | null
}

const DebateHeader = ({ debate, userSide }: DebateHeaderProps) => {
	const getStatusBadge = () => {
		switch (debate.status) {
			case DebateStatus.ACTIVE:
				return <Badge color='green'>Käynnissä</Badge>
			case DebateStatus.ENDED:
				return <Badge color='orange'>Päättynyt</Badge>
			case DebateStatus.EVALUATED:
				return <Badge color='blue'>Arvioitu</Badge>
			default:
				return null
		}
	}

	const sideAVars = {
		topic: debate.topicSideA,
		argumentsRemaining: debate.argumentsRemainingA,
		side: DebateSide.SIDE_A,
		color: 'blue',
	}
	const sideBVars = {
		topic: debate.topicSideB,
		argumentsRemaining: debate.argumentsRemainingB,
		side: DebateSide.SIDE_B,
		color: 'green',
	}

	const userSideVars = userSide === DebateSide.SIDE_A ? sideAVars : sideBVars
	const opponentSideVars = userSide === DebateSide.SIDE_A ? sideBVars : sideAVars

	const isUserTurn = debate.currentTurn === userSide
	const isActiveTurn = debate.status === DebateStatus.ACTIVE && debate.currentTurn !== null
	const secondsRemaining = useTimer(debate.turnEndsAt, isActiveTurn)

	return (
		<Card withBorder radius='md' p='md'>
			<Stack gap='sm'>
				<Title order={4} mb='xs'>
					{debate.topic}
				</Title>
				{/* Turn & timer - pääroolissa */}
				{isActiveTurn && userSide && (
					<Group justify='space-between' align='center'>
						<Stack gap={2}>
							<Text size='xs' c='dimmed'>
								Nyt vuorossa
							</Text>
							<Text fw={700} size='xl' c={isUserTurn ? 'green' : 'dimmed'}>
								{isUserTurn ? 'Sinun vuorosi' : 'Vastustajan vuoro'}
							</Text>
						</Stack>
						{secondsRemaining !== null && (
							<Stack gap={2} align='flex-end'>
								<Text size='xs' c='dimmed'>
									Aikaa jäljellä
								</Text>
								<Text fw={700} size='xl' c={secondsRemaining <= 10 ? 'red' : 'dark'}>
									{Math.floor(secondsRemaining / 60)}:{`${secondsRemaining % 60}`.padStart(2, '0')}
								</Text>
							</Stack>
						)}
					</Group>
				)}

				{/* Oma kanta + aihe */}
				<Group justify='space-between' align='flex-start'>
					<Box style={{ flex: 1 }}>
						{userSide && (
							<Alert
								icon={<IconInfoCircle size={16} />}
								color={userSideVars.color}
								variant='light'
								mb='xs'
							>
								<Text size='sm' fw={700}>
									Sinun kantasi:{' '}
									<Text span c={userSideVars.color} fw={700}>
										{userSideVars.topic}
									</Text>
								</Text>
							</Alert>
						)}
					</Box>
					{getStatusBadge()}
				</Group>

				{/* Arguments remaining */}
				{userSide && (
					<Group gap='md'>
						<Badge variant='light' color={userSideVars.color} size='sm'>
							Sinulla: {userSideVars.argumentsRemaining} argumenttia jäljellä
						</Badge>
						{opponentSideVars.topic && (
							<Badge variant='light' color={opponentSideVars.color} size='sm'>
								Vastustaja: {opponentSideVars.argumentsRemaining} argumenttia jäljellä
							</Badge>
						)}
					</Group>
				)}
			</Stack>
		</Card>
	)
}

export default DebateHeader
