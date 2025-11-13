import type { Debate } from '@argumentor/shared'
import { DebateSide, DebateStatus } from '@argumentor/shared'
import { Alert, Badge, Box, Card, Group, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

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

	const getUserSideLabel = () => {
		if (!userSide) return null
		return userSide === DebateSide.SIDE_A ? debate.topicSideA : debate.topicSideB
	}

	const getUserArgumentsRemaining = () => {
		if (!userSide) return null
		return userSide === DebateSide.SIDE_A ? debate.argumentsRemainingA : debate.argumentsRemainingB
	}

	const getOpponentSide = () => {
		if (!userSide) return null
		return userSide === DebateSide.SIDE_A ? DebateSide.SIDE_B : DebateSide.SIDE_A
	}

	const getOpponentSideLabel = () => {
		const opponentSide = getOpponentSide()
		if (!opponentSide) return null
		return opponentSide === DebateSide.SIDE_A ? debate.topicSideA : debate.topicSideB
	}

	return (
		<Card withBorder radius='md' p='md'>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Box style={{ flex: 1 }}>
						<Title order={3} mb='xs'>
							{debate.topic}
						</Title>
						{userSide && (
							<Alert
								icon={<IconInfoCircle size={16} />}
								color={userSide === DebateSide.SIDE_A ? 'blue' : 'green'}
								variant='light'
								mb='xs'
							>
								<Text size='sm' fw={600}>
									Sinun tehtäväsi: Puolusta{' '}
									<Text span c={userSide === DebateSide.SIDE_A ? 'blue' : 'green'}>
										{getUserSideLabel()}
									</Text>
								</Text>
							</Alert>
						)}
						{getOpponentSideLabel() && (
							<Text size='sm' c='dimmed'>
								Vastustajasi puolustaa:{' '}
								<Text span fw={600}>
									{getOpponentSideLabel()}
								</Text>
							</Text>
						)}
					</Box>
					{getStatusBadge()}
				</Group>

				{/* Arguments remaining */}
				{userSide && (
					<Group gap='md'>
						<Badge
							variant='light'
							color={userSide === DebateSide.SIDE_A ? 'blue' : 'green'}
							size='lg'
						>
							Sinulla: {getUserArgumentsRemaining()} argumenttia jäljellä
						</Badge>
						{getOpponentSide() && (
							<Badge
								variant='light'
								color={getOpponentSide() === DebateSide.SIDE_A ? 'blue' : 'green'}
								size='lg'
							>
								Vastustaja:{' '}
								{getOpponentSide() === DebateSide.SIDE_A
									? debate.argumentsRemainingA
									: debate.argumentsRemainingB}{' '}
								argumenttia jäljellä
							</Badge>
						)}
					</Group>
				)}
			</Stack>
		</Card>
	)
}

export default DebateHeader
