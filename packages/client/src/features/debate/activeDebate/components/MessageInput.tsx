import { Alert, Button, Card, Group, Stack, Text, Textarea } from '@mantine/core'
import { IconInfoCircle, IconSend } from '@tabler/icons-react'
import { useState } from 'react'
import { useDebate } from '../../hooks/useDebate'

interface MessageInputProps {
	onMessageSent?: () => void
	argumentsRemaining: number
}

const MessageInput = ({ onMessageSent, argumentsRemaining }: MessageInputProps) => {
	const { sendMessage, isSending } = useDebate()
	const [messageInput, setMessageInput] = useState('')
	const [error, setError] = useState<string | null>(null)

	const handleSendMessage = async () => {
		setError(null)
		try {
			await sendMessage(messageInput)
			setMessageInput('')
			// Trigger scroll after message is sent
			setTimeout(() => {
				onMessageSent?.()
			}, 100)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Viestin lähetys epäonnistui'
			setError(message)
			console.error('Failed to send message', err)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSendMessage()
		}
	}

	if (argumentsRemaining <= 0) {
		return (
			<Alert
				icon={<IconInfoCircle size={16} />}
				title='Kaikki argumentit käytetty'
				color='orange'
				variant='light'
			>
				<Text size='sm'>
					Olet käyttänyt kaikki argumenttisi. Odota vastustajasi viimeistä argumenttia.
				</Text>
			</Alert>
		)
	}

	return (
		<Card withBorder radius='md' p='md'>
			<Stack gap='sm'>
				<Textarea
					autoFocus
					placeholder='Kirjoita argumenttisi tähän...'
					value={messageInput}
					onChange={e => setMessageInput(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
					minRows={3}
					maxRows={6}
				/>
				<Group justify='space-between'>
					{error && (
						<Text size='sm' c='red'>
							{error}
						</Text>
					)}
					<Button
						leftSection={<IconSend size={16} />}
						onClick={handleSendMessage}
						loading={isSending}
					>
						Lähetä
					</Button>
				</Group>
			</Stack>
		</Card>
	)
}

export default MessageInput
