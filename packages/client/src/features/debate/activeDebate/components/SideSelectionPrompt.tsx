import type { Debate, TopicSideChoice } from '@argumentor/shared'
import { Alert, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { useDebate } from '../../hooks/useDebate'

interface SideSelectionPromptProps {
	topic: string
	topicSideA: string
	topicSideB: string
	debate: Debate
}

const SideSelectionPrompt = ({
	topic,
	topicSideA,
	topicSideB,
	debate,
}: SideSelectionPromptProps) => {
	const optionTexts: Record<TopicSideChoice, string> = {
		A: topicSideA,
		B: topicSideB,
	}
	const { selectTopicSide } = useDebate()
	const [isSelectingSide, setIsSelectingSide] = useState(false)
	const [selectionError, setSelectionError] = useState<string | null>(null)

	const handleSideSelection = async (choice: TopicSideChoice) => {
		if (!debate.roomCode || isSelectingSide) return

		setSelectionError(null)
		setIsSelectingSide(true)

		try {
			await selectTopicSide(debate.roomCode, choice)
		} catch (error) {
			console.error('Failed to select topic side', error)
			setSelectionError('Puolen valinta epäonnistui. Yritä uudelleen.')
		} finally {
			setIsSelectingSide(false)
		}
	}

	return (
		<Card withBorder radius='md' p='lg'>
			<Stack gap='md'>
				<Title order={4}>Valitse puolesi</Title>
				<Text c='dimmed'>
					Valitse näistä kahdesta näkökulmasta se, jota haluat puolustaa. Vastapuoli saa
					automaattisesti toisen puolen.
				</Text>
				<Title ta='center' order={5}>
					{topic}
				</Title>
				<Group gap='md'>
					{(['A', 'B'] as TopicSideChoice[]).map(choice => (
						<Button
							key={choice}
							variant='light'
							color={choice === 'A' ? 'blue' : 'green'}
							fullWidth
							onClick={() => handleSideSelection(choice)}
							loading={isSelectingSide}
							disabled={isSelectingSide}
						>
							{optionTexts[choice]}
						</Button>
					))}
				</Group>
				{selectionError && (
					<Alert icon={<IconInfoCircle size={16} />} color='red' variant='light'>
						{selectionError}
					</Alert>
				)}
			</Stack>
		</Card>
	)
}

export default SideSelectionPrompt
