import type { TopicSideChoice } from '@argumentor/shared'
import { Alert, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

interface SideSelectionPromptProps {
	topic: string
	topicSideA: string
	topicSideB: string
	isSubmitting: boolean
	error: string | null
	onSelect: (choice: TopicSideChoice) => void
}

const SideSelectionPrompt = ({
	topic,
	topicSideA,
	topicSideB,
	isSubmitting,
	error,
	onSelect,
}: SideSelectionPromptProps) => {
	const optionTexts: Record<TopicSideChoice, string> = {
		A: topicSideA,
		B: topicSideB,
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
							onClick={() => onSelect(choice)}
							loading={isSubmitting}
							disabled={isSubmitting}
						>
							{optionTexts[choice]}
						</Button>
					))}
				</Group>
				{error && (
					<Alert icon={<IconInfoCircle size={16} />} color='red' variant='light'>
						{error}
					</Alert>
				)}
			</Stack>
		</Card>
	)
}

export default SideSelectionPrompt
