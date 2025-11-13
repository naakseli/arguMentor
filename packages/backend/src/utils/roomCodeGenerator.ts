import { debateExists } from '../services/debateService.js'

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CODE_LENGTH = 6
const MAX_RETRIES = 10

/**
 * Generoi satunnaisen 6-merkkisen huonekoodin
 * Muoto: esim. "ABC123" (isoja kirjaimia ja numeroita)
 */
const generateRandomCode = (): string => {
	let code = ''
	for (let i = 0; i < CODE_LENGTH; i++) {
		const randomIndex = Math.floor(Math.random() * CHARACTERS.length)
		code += CHARACTERS[randomIndex]
	}
	return code
}

export const generateUniqueRoomCode = async (): Promise<string> => {
	for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
		const code = generateRandomCode()
		const exists = await debateExists(code)

		if (!exists) {
			return code
		}
	}

	throw new Error(`Failed to generate unique room code after ${MAX_RETRIES} attempts`)
}
