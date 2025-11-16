import { Anchor, Container, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { Link, useParams } from 'react-router'
import DebateView from '../activeDebate/DebateView'
import WaitingForOpponent from '../components/WaitingForOpponent'
import { useArgumentPage } from '../hooks/useArgumentPage'

const ArgumentPage = () => {
	const { argumentCode } = useParams()
	const { debate, userSide, isLoading, error } = useArgumentPage(argumentCode)

	if (isLoading) {
		return (
			<Group justify='center' py='xl'>
				<Loader />
			</Group>
		)
	}

	if (!userSide) {
		return <Text c='red'>Virhe: Puoli ei ole määritelty</Text>
	}

	return (
		<Container size='lg' py='xl'>
			<Stack gap='md'>
				<Group justify='space-between'>
					<Title order={2}>Väittely</Title>
					<Anchor component={Link} to='/' underline='hover'>
						Etusivulle
					</Anchor>
				</Group>
				{isLoading && (
					<Group justify='center' py='xl'>
						<Loader />
					</Group>
				)}
				{!isLoading && error && <Text c='red'>Virhe: {error}</Text>}
				{!isLoading && !error && debate && (
					<>
						<Text c='dimmed'>Huonekoodi: {debate.roomCode}</Text>
						{!debate.sideBJoined ? (
							<WaitingForOpponent
								roomCode={debate.roomCode}
								topic={debate.topic}
								topicSideA={debate.topicSideA}
								topicSideB={debate.topicSideB}
								sideAName={debate.sideAName}
							/>
						) : (
							<DebateView debate={debate} userSide={userSide} />
						)}
					</>
				)}
			</Stack>
		</Container>
	)
}

export default ArgumentPage
