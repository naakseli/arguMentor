import type { Debate, Message } from '@argumentor/shared'
import { DebateSide } from '@argumentor/shared'
import { Badge, Box, Card, Group, Stack, Text } from '@mantine/core'

interface MessageItemProps {
	message: Message
	debate: Debate
	userSide: DebateSide
}

const MessageItem = ({ message, debate, userSide }: MessageItemProps) => {
	const getParticipantInfo = (side: DebateSide) => {
		const name = side === DebateSide.SIDE_A ? debate.sideAName : debate.sideBName
		const topicSide = side === DebateSide.SIDE_A ? debate.topicSideA : debate.topicSideB
		const fallbackName = side === DebateSide.SIDE_A ? 'Väittelijä A' : 'Väittelijä B'
		return {
			name: name ?? fallbackName,
			claim: topicSide,
		}
	}

	const isUserMessage = message.side === userSide
	const messageColor = isUserMessage ? 'blue' : 'green'
	const messageBackground = `${messageColor}.0`

	const participant = getParticipantInfo(message.side)

	return (
		<Box
			style={{
				display: 'flex',
				justifyContent: isUserMessage ? 'flex-start' : 'flex-end',
			}}
		>
			<Card withBorder shadow='xs' radius='md' p='sm' maw='70%' bg={messageBackground}>
				<Stack gap={4}>
					<Group gap='xs' justify='space-between'>
						<Badge size='sm' color={messageColor} variant='light'>
							{isUserMessage ? 'Sinä' : participant.name}
						</Badge>
					</Group>
					<Text size='xs' c='dimmed'>
						Kanta: {participant.claim}
					</Text>
					<Text size='sm'>{message.content}</Text>
				</Stack>
			</Card>
		</Box>
	)
}

export default MessageItem
