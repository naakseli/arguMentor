import { Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { useJoinDebate } from '../hooks/useJoinDebate'

interface JoinDebateModalProps {
	opened: boolean
	onClose: () => void
}

const JoinDebateModal = ({ opened, onClose }: JoinDebateModalProps) => {
	const [roomCode, setRoomCode] = useState('')

	const resetForm = () => {
		setRoomCode('')
	}

	const { handleJoinDebate, error, resetError, isJoining } = useJoinDebate({
		onSuccess: () => {
			resetForm()
			onClose()
		},
	})

	const handleConfirm = async () => {
		if (!roomCode) return

		await handleJoinDebate(roomCode)
	}

	const handleClose = () => {
		resetForm()
		resetError()
		onClose()
	}

	return (
		<Modal opened={opened} onClose={handleClose} title='Liity väittelyyn' centered>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					Syötä väittelyn huonekoodi liittyäksesi keskusteluun
				</Text>
				<TextInput
					label='Huonekoodi'
					value={roomCode}
					onChange={e => {
						setRoomCode(e.currentTarget.value)
						if (error) resetError()
					}}
					maxLength={6}
					error={error}
					disabled={isJoining}
					onKeyDown={e => {
						if (e.key === 'Enter' && roomCode) {
							handleConfirm()
						}
					}}
				/>
				<Button onClick={handleConfirm} loading={isJoining} disabled={!roomCode}>
					Liity
				</Button>
			</Stack>
		</Modal>
	)
}

export default JoinDebateModal
