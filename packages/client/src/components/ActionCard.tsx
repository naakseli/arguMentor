import { Button, Card, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import type { IconProps } from '@tabler/icons-react'

interface ActionCardProps {
	title: string
	description: string
	buttonText: string
	buttonColor?: string
	icon: React.ComponentType<IconProps>
	onAction: () => void
	loading?: boolean
}

const ActionCard = ({
	title,
	description,
	buttonText,
	buttonColor = 'blue',
	icon: Icon,
	onAction,
	loading,
}: ActionCardProps) => {
	return (
		<Card withBorder radius='md' p='xl' h='100%'>
			<Stack align='center' gap='lg' h='100%' justify='space-between'>
				<Stack align='center' gap='lg'>
					<ThemeIcon variant='light' color={buttonColor} size={64} radius='md'>
						<Icon size={36} />
					</ThemeIcon>
					<Stack align='center' gap='xs'>
						<Title order={3}>{title}</Title>
						<Text c='dimmed' ta='center' size='sm'>
							{description}
						</Text>
					</Stack>
				</Stack>
				<Button size='lg' onClick={onAction} color={buttonColor} fullWidth loading={loading}>
					{buttonText}
				</Button>
			</Stack>
		</Card>
	)
}

export default ActionCard
