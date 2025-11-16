import { Button, Center, Paper, Stack, Text, TextInput, Title } from '@mantine/core'
import type { JSX } from 'react'
import { useState } from 'react'

interface NamePromptProps {
	onSubmit: (value: string) => void
}

const NamePrompt = ({ onSubmit }: NamePromptProps): JSX.Element => {
	const [value, setValue] = useState('')
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = () => {
		const trimmed = value.trim()

		if (!trimmed) {
			setError('Anna nimi ennen jatkamista')
			return
		}

		setError(null)
		onSubmit(trimmed)
	}

	return (
		<Center h='100vh' bg='gray.0' px='lg'>
			<Paper withBorder p='xl' radius='lg' w={{ base: '100%', sm: 420 }} shadow='md'>
				<Stack gap='md'>
					<Title order={3}>Tervetuloa Argumentoriin!</Title>
					<Text c='dimmed'>Millä nimellä haluat osallistua väittelyyn?</Text>
					<TextInput
						label='Näyttönimi'
						placeholder='Esim. Väittelijä Virtanen'
						value={value}
						autoFocus
						withAsterisk
						error={error}
						onChange={event => setValue(event.currentTarget.value)}
						onKeyDown={event => {
							if (event.key === 'Enter') {
								event.preventDefault()
								handleSubmit()
							}
						}}
					/>
					<Button size='md' onClick={handleSubmit}>
						Jatka väittelyyn
					</Button>
				</Stack>
			</Paper>
		</Center>
	)
}

export default NamePrompt
