import type { DebateSide } from '@argumentor/shared'
import type { MantineColor } from '@mantine/core'
import { Stack, Text } from '@mantine/core'
import classes from './PerspectiveCards.module.css'

export interface PerspectiveCardProps {
	side: DebateSide
	name: string
	topic: string | null
	argumentsRemaining?: number | null
	color: MantineColor
	label: string
	isHighlighted?: boolean
}

const PerspectiveCard = ({
	side,
	name,
	topic,
	argumentsRemaining,
	color,
	label,
	isHighlighted,
}: PerspectiveCardProps) => (
	<Stack
		gap={0}
		className={classes.card}
		data-color={color}
		data-highlighted={isHighlighted ? 'true' : 'false'}
	>
		<Text size='xs' tt='uppercase' className={classes.cardHeader} ta='center'>
			{label}
		</Text>
		<Stack gap={4} p='sm'>
			<Text fw={700} c={color}>
				{name}
			</Text>
			<Text size='sm' c='dimmed'>
				Kanta: {topic}
			</Text>
			<Text size='sm' c='dimmed'>
				{argumentsRemaining} argumentti(a) jäljellä
			</Text>
		</Stack>
	</Stack>
)

export default PerspectiveCard
