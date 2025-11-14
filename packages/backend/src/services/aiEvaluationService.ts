import { Debate, DebateSide, DebateStatus, Evaluation } from '@argumentor/shared'
import { randomUUID } from 'crypto'
import OpenAI from 'openai'
import * as debateService from './debateService.js'

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL,
	defaultQuery: {
		'api-version': process.env.AZURE_OPENAI_API_VERSION,
	},
})

const formatDebateForPrompt = (debate: Debate): string => {
	const headerLines = [
		`Aihe: ${debate.topic}`,
		`Puoli A: ${debate.topicSideA} (SIDE_A)`,
		`Puoli B: ${debate.topicSideB} (SIDE_B)`,
		'',
		'Viestit kronologisessa järjestyksessä:',
	]

	const messageLines = debate.messages.map((message, index) => {
		const sideLabel = message.side === DebateSide.SIDE_A ? 'SIDE_A' : 'SIDE_B'
		return `${index + 1}. ${sideLabel}: ${message.content}`
	})

	return [...headerLines, ...messageLines].join('\n')
}

export const evaluateDebate = async (debate: Debate): Promise<Evaluation> => {
	const debateText = formatDebateForPrompt(debate)

	const systemPrompt =
		'Olet puolueeton väittelytuomari. Arvioi kumpi osapuoli (SIDE_A vai SIDE_B) argumentoi paremmin ' +
		'alla olevan väittelyn perusteella. Käytä seuraavia arviointikriteerejä: ' +
		'1) logiikka ja perusteltavuus, 2) vastaukset vastapuolen argumentteihin, 3) tiedon ja faktojen käyttö, ' +
		'4) yhtenäisyys ja rakenne ' +
		'Pisteytä molemmat osapuolet väliltä 0–100 ja kirjoita lyhyt, hyvin jäsennelty perustelu suomeksi. Vastauksen tulee olla suomenkielinen.'

	const userPrompt =
		debateText +
		'\n\nPalauta vastauksesi tiukkana JSON-objektina ilman muuta tekstiä muodossa:\n' +
		'{\n' +
		'  "winner": "SIDE_A" | "SIDE_B" | "TIE",\n' +
		'  "scoreA": number, // 0-100\n' +
		'  "scoreB": number, // 0-100\n' +
		'  "reasoning": string // selkeä suomenkielinen perustelu\n' +
		'}'

	const response = await openai.chat.completions.create({
		model: MODEL,
		response_format: { type: 'json_object' },
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt },
		],
	})

	const rawContent = response.choices[0]?.message?.content

	if (!rawContent) {
		throw new Error('Tyhjä vastaus OpenAI:lta')
	}

	let parsed: any
	try {
		parsed = JSON.parse(rawContent)
	} catch (error) {
		throw new Error('OpenAI:n JSON-vastauksen jäsentäminen epäonnistui')
	}

	const winnerRaw = parsed.winner as DebateSide | undefined
	const scoreARaw = Number(parsed.scoreA)
	const scoreBRaw = Number(parsed.scoreB)
	const reasoningRaw = typeof parsed.reasoning === 'string' ? parsed.reasoning : ''

	const validWinners = new Set<DebateSide | undefined>([
		DebateSide.SIDE_A,
		DebateSide.SIDE_B,
		DebateSide.TIE,
		undefined,
	])

	const winner = validWinners.has(winnerRaw) ? winnerRaw : undefined

	const clampScore = (value: number): number => {
		if (Number.isNaN(value)) return 0
		return Math.min(100, Math.max(0, value))
	}

	const evaluation: Evaluation = {
		id: randomUUID(),
		winner,
		scoreA: clampScore(scoreARaw),
		scoreB: clampScore(scoreBRaw),
		reasoning:
			reasoningRaw ||
			'Arviointi epäonnistui: AI ei palauttanut selkeää perustelua. Kokeile tarvittaessa uudelleen myöhemmin.',
	}

	return evaluation
}

export const evaluateAndFinalizeDebate = async (roomCode: string): Promise<Debate | null> => {
	const latestDebate = await debateService.getDebate(roomCode)

	if (!latestDebate) return null

	const evaluation = await evaluateDebate(latestDebate)

	const updatedDebate = {
		...latestDebate,
		evaluation,
		status: DebateStatus.EVALUATED,
	}

	await debateService.saveDebate(updatedDebate)

	return updatedDebate
}
