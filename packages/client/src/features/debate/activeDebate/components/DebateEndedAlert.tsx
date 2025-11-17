import { Alert, Loader, Text } from '@mantine/core'

const DebateEndedAlert = () => {
	return (
		<Alert
			icon={<Loader size='sm' color='orange' />}
			title='Väittely päättynyt'
			color='orange'
			variant='light'
		>
			<Text size='sm'>Kaikki argumentit on käytetty. Odotetaan AI-arviointia...</Text>
		</Alert>
	)
}

export default DebateEndedAlert
