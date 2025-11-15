import { Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'

interface JoinDebateModalProps {
	opened: boolean
	onClose: () => void
	onConfirm: (roomCode: string) => void
	loading?: boolean
	error?: string | null
}

const JoinDebateModal = ({ opened, onClose, onConfirm, loading, error }: JoinDebateModalProps) => {
	const [roomCode, setRoomCode] = useState('')

	const handleConfirm = () => {
		if (!roomCode) return

		onConfirm(roomCode)
	}

	const handleClose = () => {
		setRoomCode('')
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
					onChange={e => setRoomCode(e.currentTarget.value)}
					maxLength={6}
					error={error}
					disabled={loading}
					onKeyDown={e => {
						if (e.key === 'Enter' && roomCode) {
							handleConfirm()
						}
					}}
				/>
				<Button onClick={handleConfirm} loading={loading} disabled={!roomCode}>
					Liity
				</Button>
			</Stack>
		</Modal>
	)
}

export default JoinDebateModal
