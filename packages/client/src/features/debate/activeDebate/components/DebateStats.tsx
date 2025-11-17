import type { Debate } from '@argumentor/shared'
import { DebateSide } from '@argumentor/shared'
import { Card, Group, Stack, Text } from '@mantine/core'

interface DebateStatsProps {
	debate: Debate
}

const DebateStats = ({ debate }: DebateStatsProps) => {
	const messages = debate.messages

	const sideAMessages = messages.filter(m => m.side === DebateSide.SIDE_A)
	const sideBMessages = messages.filter(m => m.side === DebateSide.SIDE_B)

	const totalCharsA = sideAMessages.reduce((sum, m) => sum + m.content.length, 0)
	const totalCharsB = sideBMessages.reduce((sum, m) => sum + m.content.length, 0)

	const avgLengthA = sideAMessages.length > 0 ? Math.round(totalCharsA / sideAMessages.length) : 0
	const avgLengthB = sideBMessages.length > 0 ? Math.round(totalCharsB / sideBMessages.length) : 0

	return (
		<Card withBorder radius='md' p='md'>
			<Stack gap='xs'>
				<Text fw={600} size='sm'>
					Väittelyn tilastot
				</Text>
				<Text size='xs' c='dimmed'>
					Keskimääräinen viestin pituus (merkkeinä)
				</Text>

				<Group justify='center' gap='xl'>
					<Stack gap={0} align='center'>
						<Text size='xs' c='dimmed'>
							Väittelijä A
						</Text>
						<Text size='sm' fw={600}>
							{avgLengthA}
						</Text>
						<Text size='xs' c='dimmed'>
							{debate.sideAName || 'Väittelijä A'}
						</Text>
					</Stack>

					<Stack gap={0} align='center'>
						<Text size='xs' c='dimmed'>
							Väittelijä B
						</Text>
						<Text size='sm' fw={600}>
							{avgLengthB}
						</Text>
						<Text size='xs' c='dimmed'>
							{debate.sideBName || 'Väittelijä B'}
						</Text>
					</Stack>
				</Group>
			</Stack>
		</Card>
	)
}

export default DebateStats
