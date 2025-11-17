import { Debate, DebateSide } from '@argumentor/shared'
import type { MantineColor } from '@mantine/core'
import { useMemo } from 'react'
import type { PerspectiveCardProps } from '../PerspectiveCards'

const getOpponentSide = (side: DebateSide) =>
	side === DebateSide.SIDE_A ? DebateSide.SIDE_B : DebateSide.SIDE_A

interface BuildConfig {
	label: string
	color: MantineColor
}

const useSideVariables = (debate: Debate, userSide: DebateSide | null) => {
	const buildPerspectiveCard = (side: DebateSide, config: BuildConfig): PerspectiveCardProps => ({
		side,
		topic: side === DebateSide.SIDE_A ? debate.topicSideA : debate.topicSideB,
		name:
			side === DebateSide.SIDE_A
				? (debate.sideAName ?? 'Väittelijä A')
				: (debate.sideBName ?? 'Väittelijä B'),
		argumentsRemaining:
			side === DebateSide.SIDE_A ? debate.argumentsRemainingA : debate.argumentsRemainingB,
		color: config.color,
		label: config.label,
		isHighlighted: debate.currentTurn === side,
	})

	const perspectiveCards = useMemo(() => {
		const defaultCards: PerspectiveCardProps[] = [
			buildPerspectiveCard(DebateSide.SIDE_A, { color: 'blue', label: 'Puoli A' }),
			buildPerspectiveCard(DebateSide.SIDE_B, { color: 'green', label: 'Puoli B' }),
		]

		if (!userSide) {
			return defaultCards
		}

		return [
			buildPerspectiveCard(userSide, { color: 'blue', label: 'Sinä' }),
			buildPerspectiveCard(getOpponentSide(userSide), { color: 'green', label: 'Vastustaja' }),
		]
	}, [debate, userSide])

	const userPerspective = userSide
		? (perspectiveCards.find(card => card.side === userSide) ?? null)
		: null

	return { perspectiveCards, userPerspective }
}

export default useSideVariables
