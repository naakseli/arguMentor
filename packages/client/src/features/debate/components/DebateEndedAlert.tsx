import { Alert, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

const DebateEndedAlert = () => {
	return (
		<Alert
			icon={<IconInfoCircle size={16} />}
			title='Väittely päättynyt'
			color='orange'
			variant='light'
		>
			<Text size='sm'>Kaikki argumentit on käytetty. Odotetaan AI-arviointia...</Text>
		</Alert>
	)
}

export default DebateEndedAlert
