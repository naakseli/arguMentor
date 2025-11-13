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

	return (
		<Card withBorder radius='md' p='md'>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Box style={{ flex: 1 }}>
						<Title order={3} mb='xs'>
							{userSideVars.topic}
						</Title>
						{userSide && (
							<Alert
								icon={<IconInfoCircle size={16} />}
								color={userSideVars.color}
								variant='light'
								mb='xs'
							>
								<Text size='sm' fw={600}>
									Sinun tehtäväsi: Puolusta{' '}
									<Text span c={userSideVars.color}>
										{userSideVars.topic}
									</Text>
								</Text>
							</Alert>
						)}
						{opponentSideVars.topic && (
							<Text size='sm' c='dimmed'>
								Vastustajasi puolustaa:{' '}
								<Text span fw={600}>
									{opponentSideVars.topic}
								</Text>
							</Text>
						)}
					</Box>
					{getStatusBadge()}
				</Group>

				{/* Arguments remaining */}
				{userSide && (
					<Group gap='md'>
						<Badge variant='light' color={userSideVars.color} size='lg'>
							Sinulla: {userSideVars.argumentsRemaining} argumenttia jäljellä
						</Badge>
						{opponentSideVars.topic && (
							<Badge variant='light' color={opponentSideVars.color} size='lg'>
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
