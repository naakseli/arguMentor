import type { DebateSide } from '@argumentor/shared'
import type { MantineColor } from '@mantine/core'
import { Stack, Text } from '@mantine/core'
import classes from './PerspectiveCards.module.css'

export interface PerspectiveCardData {
	side: DebateSide
	name: string
	topic: string | null
	argumentsRemaining?: number | null
	color: MantineColor
	label: string
	isHighlighted?: boolean
}

const formatRemainingMessages = (count?: number | null) => {
	const safeCount = typeof count === 'number' ? count : 0
	return safeCount === 1 ? '1 viesti jäljellä' : `${safeCount} viestiä jäljellä`
}

interface PerspectiveCardProps {
	card: PerspectiveCardData
}

const PerspectiveCard = ({ card }: PerspectiveCardProps) => (
	<Stack
		gap={0}
		className={classes.card}
		data-color={card.color}
		data-highlighted={card.isHighlighted ? 'true' : 'false'}
	>
		<Text size='xs' tt='uppercase' className={classes.cardHeader} ta='center'>
			{card.label}
		</Text>
		<Stack gap={4} p='sm'>
			<Text fw={700} c={card.color}>
				{card.name}
			</Text>
			<Text size='sm' c='dimmed'>
				Kanta: {card.topic}
			</Text>
			<Text size='sm' c='dimmed'>
				{formatRemainingMessages(card.argumentsRemaining)}
			</Text>
		</Stack>
	</Stack>
)

export default PerspectiveCard
