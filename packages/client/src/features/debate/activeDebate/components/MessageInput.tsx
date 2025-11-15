import { Alert, Button, Card, Group, Stack, Text, Textarea } from '@mantine/core'
import { IconInfoCircle, IconSend } from '@tabler/icons-react'
import { useState } from 'react'
import { useDebate } from '../../hooks/useDebate'

interface MessageInputProps {
	onMessageSent?: () => void
	argumentsRemaining: number
	isUserTurn: boolean
}

const MessageInput = ({ onMessageSent, argumentsRemaining, isUserTurn }: MessageInputProps) => {
	const { sendMessage, isSending } = useDebate()
	const [messageInput, setMessageInput] = useState('')
	const [error, setError] = useState<string | null>(null)

	const handleSendMessage = async () => {
		if (!isUserTurn) return setError('Et voi lähettää viestiä, koska ei ole sinun vuorosi.')
		if (!messageInput) return

		setError(null)
		try {
			await sendMessage(messageInput)
			setMessageInput('')
			// Trigger scroll after message is sent
			onMessageSent?.()
		} catch (err) {
			setError('Viestin lähetys epäonnistui. Yritä uudelleen.')
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
					disabled={!isUserTurn}
				/>
				{!isUserTurn && (
					<Alert
						icon={<IconInfoCircle size={16} />}
						color='blue'
						variant='light'
						title='Ei ole sinun vuorosi'
					>
						<Text size='sm'>
							Odota vastustajasi argumenttia. Vuoro vaihtuu automaattisesti, kun vastustajan vuoro
							on ohi.
						</Text>
					</Alert>
				)}
				<Group justify='space-between' align='center'>
					<Stack gap={4}>
						{error && (
							<Text size='sm' c='red'>
								{error}
							</Text>
						)}
					</Stack>
					<Button
						leftSection={<IconSend size={16} />}
						onClick={handleSendMessage}
						loading={isSending}
						disabled={!isUserTurn || !messageInput}
					>
						Lähetä
					</Button>
				</Group>
			</Stack>
		</Card>
	)
}

export default MessageInput
