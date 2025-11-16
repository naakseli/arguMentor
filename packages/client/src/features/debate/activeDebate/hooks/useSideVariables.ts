import { Debate, DebateSide } from '@argumentor/shared'
import type { MantineColor } from '@mantine/core'
import { useMemo } from 'react'
import type { PerspectiveCardData } from '../components/PerspectiveCards'

const getOpponentSide = (side: DebateSide) =>
	side === DebateSide.SIDE_A ? DebateSide.SIDE_B : DebateSide.SIDE_A

interface BuildConfig {
	label: string
	color: MantineColor
	isHighlighted?: boolean
}

const useSideVariables = (debate: Debate, userSide: DebateSide | null) => {
	const buildPerspectiveCard = (side: DebateSide, config: BuildConfig): PerspectiveCardData => ({
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
		isHighlighted: config.isHighlighted,
	})

	const perspectiveCards = useMemo(() => {
		const defaultCards: PerspectiveCardData[] = [
			buildPerspectiveCard(DebateSide.SIDE_A, { color: 'blue', label: 'Puoli A' }),
			buildPerspectiveCard(DebateSide.SIDE_B, { color: 'green', label: 'Puoli B' }),
		]

		if (!userSide) {
			return defaultCards
		}

		return [
			buildPerspectiveCard(userSide, { color: 'blue', label: 'Sinä', isHighlighted: true }),
			buildPerspectiveCard(getOpponentSide(userSide), { color: 'green', label: 'Vastustaja' }),
		]
	}, [debate, userSide])

	const userPerspective = userSide
		? (perspectiveCards.find(card => card.side === userSide) ?? null)
		: null

	return { perspectiveCards, userPerspective }
}

export default useSideVariables
