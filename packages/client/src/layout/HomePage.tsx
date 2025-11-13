import { Container, Grid, Stack, Text, Title } from '@mantine/core'
import { IconLogin, IconMessageCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import ActionCard from '../components/ActionCard'
import CreateDebateModal from '../features/debate/components/CreateDebateModal'
import JoinDebateModal from '../features/debate/components/JoinDebateModal'
import { useDebate } from '../features/debate/hooks/useDebate'

const HomePage = () => {
	const navigate = useNavigate()
	const { createDebate, joinDebate, isCreating, error } = useDebate()
	const [createModalOpened, setCreateModalOpened] = useState(false)
	const [joinModalOpened, setJoinModalOpened] = useState(false)

	const handleConfirmCreate = async (topic: string, topicSideA: string, topicSideB: string) => {
		try {
			const roomCode = await createDebate(topic, topicSideA, topicSideB)
			navigate(`/argument/${roomCode}`)
			setCreateModalOpened(false)
		} catch (error) {
			console.error('Failed to create debate', error)
		}
	}

	const handleConfirmJoin = async (roomCode: string) => {
		try {
			const joinedRoomCode = await joinDebate(roomCode)
			navigate(`/argument/${joinedRoomCode}`)
			setJoinModalOpened(false)
		} catch (error) {
			console.error('Failed to join debate', error)
		}
	}

	return (
		<Container size='md' py='xl'>
			<Stack align='center' gap='xl' mt='xl'>
				<Stack align='center' gap='sm'>
					<Title order={1} size='3rem' ta='center'>
						Argumentor
					</Title>
					<Text c='dimmed' ta='center' size='lg' maw={600}>
						Reaaliaikainen väittelychatti, jossa kaksi käyttäjää väittelevät annetusta aiheesta. AI
						arvioi lopussa kumpi argumentoi paremmin.
					</Text>
				</Stack>

				<Grid gutter='lg' style={{ width: '100%', maxWidth: 900 }}>
					<Grid.Col span={{ base: 12, sm: 6 }}>
						<ActionCard
							title='Luo uusi väittely'
							description='Aloita uusi väittely ja jaa huonekoodi toiselle osallistujalle'
							buttonText='Luo uusi chat'
							buttonColor='blue'
							icon={IconMessageCircle}
							onAction={() => setCreateModalOpened(true)}
							loading={isCreating}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 6 }}>
						<ActionCard
							title='Liity väittelyyn'
							description='Syötä huonekoodi ja liity väittelyyn'
							buttonText='Liity väittelyyn'
							buttonColor='green'
							icon={IconLogin}
							onAction={() => setJoinModalOpened(true)}
							loading={isCreating}
						/>
					</Grid.Col>
				</Grid>

				{error && (
					<Text c='red' ta='center' size='sm'>
						{error}
					</Text>
				)}
			</Stack>

			<CreateDebateModal
				opened={createModalOpened}
				onClose={() => setCreateModalOpened(false)}
				onConfirm={handleConfirmCreate}
				loading={isCreating}
				error={error}
			/>

			<JoinDebateModal
				opened={joinModalOpened}
				onClose={() => setJoinModalOpened(false)}
				onConfirm={handleConfirmJoin}
				loading={isCreating}
				error={error}
			/>
		</Container>
	)
}

export default HomePage
