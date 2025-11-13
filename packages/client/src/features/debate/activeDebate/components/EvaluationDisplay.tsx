import type { Evaluation } from '@argumentor/shared'
import { DebateSide } from '@argumentor/shared'
import { Alert, Badge, Group, Stack, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

interface EvaluationDisplayProps {
	evaluation: Evaluation
}

const EvaluationDisplay = ({ evaluation }: EvaluationDisplayProps) => {
	return (
		<Alert icon={<IconInfoCircle size={16} />} title='Arviointi' color='blue' variant='light'>
			<Stack gap='sm'>
				<Group gap='md'>
					<Text size='sm'>
						<Text span fw={600}>
							Puoli A:
						</Text>
						{evaluation.scoreA}/100
					</Text>
					<Text size='sm'>
						<Text span fw={600}>
							Puoli B:
						</Text>
						{evaluation.scoreB}/100
					</Text>
					{evaluation.winner && (
						<Badge color={evaluation.winner === DebateSide.SIDE_A ? 'blue' : 'green'}>
							Voittaja: {evaluation.winner}
						</Badge>
					)}
				</Group>
				<Text size='sm'>{evaluation.reasoning}</Text>
			</Stack>
		</Alert>
	)
}

export default EvaluationDisplay
