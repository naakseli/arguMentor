import { Button, Card, Group, Modal, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { defaultTopicOptions } from '../defaultTopicOptions'
import { useCreateDebate } from '../hooks/useCreateDebate'

interface CreateDebateModalProps {
	opened: boolean
	onClose: () => void
}

const CUSTOM_VALUE = 'custom'

const CreateDebateModal = ({ opened, onClose }: CreateDebateModalProps) => {
	const [topic, setTopic] = useState('')
	const [topicError, setTopicError] = useState<string | null>(null)
	const [topicSideA, setTopicSideA] = useState('')
	const [topicSideB, setTopicSideB] = useState('')
	const [presetIndex, setPresetIndex] = useState<string | null>(null)

	const { handleCreateDebate, error, resetError, isCreating } = useCreateDebate({
		onSuccess: () => {
			resetForm()
			onClose()
		},
	})

	const resetForm = () => {
		setTopic('')
		setTopicError(null)
		setTopicSideA('')
		setTopicSideB('')
		setPresetIndex(null)
	}

	const handleClose = () => {
		resetForm()
		resetError()
		onClose()
	}

	const handleSubmit = async () => {
		if (presetIndex === null) return setTopicError('Valitse valmis aihe tai syötä oma aihe')
		if (presetIndex === CUSTOM_VALUE && !topic) return setTopicError('Anna väittelyn aihe')

		await handleCreateDebate(topic, topicSideA, topicSideB)
	}

	return (
		<Modal opened={opened} onClose={handleClose} title='Luo uusi väittely' size='lg' centered>
			<Stack gap='md'>
				<SimpleGrid cols={1} spacing='sm'>
					{defaultTopicOptions.map((opt, idx) => {
						const value = String(idx)
						const selected = presetIndex === value
						return (
							<Card
								key={value}
								withBorder
								radius='md'
								p='md'
								onClick={() => {
									setPresetIndex(value)
									setTopic(opt.topic)
									setTopicSideA(opt.topicSideA)
									setTopicSideB(opt.topicSideB)
									if (topicError) setTopicError(null)
								}}
								style={{
									cursor: 'pointer',
									borderColor: selected ? 'var(--mantine-color-blue-outline)' : undefined,
								}}
							>
								<Text fw={600}>{opt.topic}</Text>
							</Card>
						)
					})}
					<Card
						withBorder
						radius='md'
						p='md'
						onClick={() => {
							setPresetIndex(CUSTOM_VALUE)
							if (topicError) setTopicError(null)
						}}
						style={{
							cursor: 'pointer',
							borderColor:
								presetIndex === CUSTOM_VALUE ? 'var(--mantine-color-blue-outline)' : undefined,
						}}
					>
						<Stack gap={4}>
							<Text fw={600}>Mukautettu</Text>
							<Text c='dimmed' size='sm'>
								Syötä oma aihe ja puolen nimet
							</Text>
						</Stack>
					</Card>
				</SimpleGrid>
				{presetIndex === CUSTOM_VALUE && (
					<>
						<TextInput
							label='Aihe'
							placeholder='Esim. Pitäisikö kouluissa olla pidemmät lomat?'
							value={topic}
							onChange={e => {
								setTopic(e.currentTarget.value)
								if (topicError) setTopicError(null)
							}}
							error={topicError || undefined}
							withAsterisk
						/>
						<TextInput
							label='Puoli A (aloittaja)'
							placeholder='Esim. Kannattaa'
							value={topicSideA}
							onChange={e => setTopicSideA(e.currentTarget.value)}
						/>
						<TextInput
							label='Puoli B'
							placeholder='Esim. Vastustaa'
							value={topicSideB}
							onChange={e => setTopicSideB(e.currentTarget.value)}
						/>
					</>
				)}
				{error && (
					<Text c='red' size='sm'>
						{error}
					</Text>
				)}
				<Group justify='flex-end'>
					<Button variant='default' onClick={handleClose}>
						Peruuta
					</Button>
					<Button onClick={handleSubmit} loading={isCreating}>
						Luo väittely
					</Button>
				</Group>
			</Stack>
		</Modal>
	)
}

export default CreateDebateModal
