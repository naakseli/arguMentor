import type { DebateSide } from '@argumentor/shared'
import { Group, Stack, Text } from '@mantine/core'

interface TurnTimerProps {
	isActiveTurn: boolean
	userSide: DebateSide | null
	isUserTurn: boolean
	secondsRemaining: number | null
}

const TurnTimer = ({ isActiveTurn, userSide, isUserTurn, secondsRemaining }: TurnTimerProps) => {
	if (!isActiveTurn || !userSide) {
		return null
	}

	return (
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
	)
}

export default TurnTimer
