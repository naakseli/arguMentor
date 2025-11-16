import {
	ActionIcon,
	Alert,
	Card,
	CopyButton,
	Group,
	Stack,
	Text,
	Title,
	Tooltip,
} from '@mantine/core'
import { IconCheck, IconCopy, IconInfoCircle } from '@tabler/icons-react'

interface WaitingForOpponentProps {
	roomCode: string
	topic: string
	topicSideA: string
	topicSideB: string
	sideAName: string
}

const WaitingForOpponent = ({
	roomCode,
	topic,
	topicSideA,
	topicSideB,
	sideAName,
}: WaitingForOpponentProps) => {
	return (
		<Card withBorder radius='md' p='xl'>
			<Stack gap='md' align='center'>
				<Title order={2} ta='center'>
					Odotetaan toista väittelijää
				</Title>
				<Text c='dimmed' ta='center' maw={640}>
					Jaa alla oleva huonekoodi toiselle osallistujalle. Kun toinen liittyy, väittely alkaa.
				</Text>

				<Stack gap={4} align='center'>
					<Text size='sm' c='dimmed'>
						Huonekoodi
					</Text>
					<Group gap='xs' align='center'>
						<Text fw={700} fz='xl' ff='monospace'>
							{roomCode}
						</Text>
						<CopyButton value={roomCode} timeout={1200}>
							{({ copied, copy }) => (
								<Tooltip label={copied ? 'Kopioitu!' : 'Kopioi'}>
									<ActionIcon
										variant='light'
										color={copied ? 'teal' : 'blue'}
										onClick={copy}
										aria-label='Copy room code'
									>
										{copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
									</ActionIcon>
								</Tooltip>
							)}
						</CopyButton>
					</Group>
				</Stack>

				<Alert
					variant='light'
					color='blue'
					icon={<IconInfoCircle size={16} />}
					title='Aihe'
					w='100%'
				>
					<Stack gap={2}>
						<Text fw={600}>{topic}</Text>
						<Text size='sm' c='dimmed'>
							Puoli A: {topicSideA} • Puoli B: {topicSideB}
						</Text>
						<Text size='sm'>
							Sinun näyttönimesi:{' '}
							<Text span fw={600}>
								{sideAName}
							</Text>
						</Text>
					</Stack>
				</Alert>
			</Stack>
		</Card>
	)
}

export default WaitingForOpponent
