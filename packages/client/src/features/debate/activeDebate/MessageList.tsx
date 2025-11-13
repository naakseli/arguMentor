import type { Debate } from '@argumentor/shared'
import { Card, ScrollArea, Stack, Text } from '@mantine/core'
import { useEffect, useRef } from 'react'
import MessageItem from './components/MessageItem'

interface MessageListProps {
	debate: Debate
	scrollTrigger?: number // Trigger scroll when this changes
}

const MessageList = ({ debate, scrollTrigger }: MessageListProps) => {
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [debate.messages, scrollTrigger])

	return (
		<Card
			withBorder
			radius='md'
			p='md'
			style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
		>
			<ScrollArea style={{ flex: 1 }} offsetScrollbars>
				<Stack gap='sm' p='xs'>
					{debate.messages.length === 0 ? (
						<Text c='dimmed' ta='center' py='xl'>
							Ei viestejä vielä. Aloita väittely lähettämällä ensimmäinen argumentti.
						</Text>
					) : (
						debate.messages.map(message => (
							<MessageItem key={message.id} message={message} debate={debate} />
						))
					)}
					<div ref={messagesEndRef} />
				</Stack>
			</ScrollArea>
		</Card>
	)
}

export default MessageList
