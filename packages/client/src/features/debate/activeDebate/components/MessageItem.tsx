import type { Debate, Message } from '@argumentor/shared'
import { DebateSide } from '@argumentor/shared'
import { Badge, Box, Card, Group, Stack, Text } from '@mantine/core'

interface MessageItemProps {
	message: Message
	debate: Debate
}

const MessageItem = ({ message, debate }: MessageItemProps) => {
	const getSideLabel = (side: DebateSide) => {
		return side === DebateSide.SIDE_A ? debate.topicSideA : debate.topicSideB
	}

	const getMessageColor = (side: DebateSide) => {
		return side === DebateSide.SIDE_A ? 'blue' : 'green'
	}

	return (
		<Box
			style={{
				display: 'flex',
				justifyContent: message.side === DebateSide.SIDE_A ? 'flex-start' : 'flex-end',
			}}
		>
			<Card withBorder radius='md' p='sm' maw='70%' bg={getMessageColor(message.side)}>
				<Stack gap={4}>
					<Group gap='xs' justify='space-between'>
						<Badge size='sm' color={getMessageColor(message.side)} variant='light'>
							{getSideLabel(message.side)}
						</Badge>
						<Text size='xs' c='dimmed'>
							{new Date(message.timestamp).toLocaleTimeString('fi-FI', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</Text>
					</Group>
					<Text size='sm'>{message.content}</Text>
				</Stack>
			</Card>
		</Box>
	)
}

export default MessageItem
