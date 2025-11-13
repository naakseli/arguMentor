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
		if (roomCode.trim()) {
			onConfirm(roomCode.trim().toUpperCase())
		}
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
					placeholder='Esim. ABC123'
					value={roomCode}
					onChange={e => setRoomCode(e.currentTarget.value.toUpperCase())}
					maxLength={6}
					error={error}
					disabled={loading}
					onKeyDown={e => {
						if (e.key === 'Enter' && roomCode.trim()) {
							handleConfirm()
						}
					}}
				/>
				<Button onClick={handleConfirm} loading={loading} disabled={!roomCode.trim()}>
					Liity
				</Button>
			</Stack>
		</Modal>
	)
}

export default JoinDebateModal
