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

const getDebaterName = (name: string | null | undefined, fallback: string): string => {
	const trimmed = name?.trim()
	return trimmed && trimmed.length > 0 ? trimmed : fallback
}

const formatDebateForPrompt = (debate: Debate): string => {
	const sideADisplayName = getDebaterName(debate.sideAName, 'Väittelijä A')
	const sideBDisplayName = getDebaterName(debate.sideBName, 'Väittelijä B')
	const sideALabel = `${sideADisplayName}`
	const sideBLabel = `${sideBDisplayName}`

	const headerLines = [
		`Aihe: ${debate.topic}`,
		`Puoli A (${sideADisplayName}): ${debate.topicSideA}`,
		`Puoli B (${sideBDisplayName}): ${debate.topicSideB}`,
		'',
		'Viestit kronologisessa järjestyksessä:',
	]

	const messageLines = debate.messages.map((message, index) => {
		const speakerLabel = message.side === DebateSide.SIDE_A ? sideALabel : sideBLabel
		return `${index + 1}. ${speakerLabel}: ${message.content}`
	})

	return [...headerLines, ...messageLines].join('\n')
}

export const evaluateDebate = async (debate: Debate): Promise<Evaluation> => {
	const debateText = formatDebateForPrompt(debate)
	const sideADisplayName = getDebaterName(debate.sideAName, 'Väittelijä A')
	const sideBDisplayName = getDebaterName(debate.sideBName, 'Väittelijä B')

	const systemPrompt =
		'Olet puolueeton väittelytuomari. Arvioi kumpi osapuoli (SIDE_A vai SIDE_B) argumentoi paremmin ' +
		'alla olevan väittelyn perusteella. Käytä seuraavia arviointikriteerejä: ' +
		'1) logiikka ja perusteltavuus, 2) vastaukset vastapuolen argumentteihin, 3) tiedon ja faktojen käyttö, ' +
		'4) yhtenäisyys ja rakenne. ' +
		'Käytä väittelijöiden nimiä aina kun mahdollista viitatessasi heidän argumentteihinsa. ' +
		'Pisteytä molemmat osapuolet väliltä 0–100 ja kirjoita lyhyt, hyvin jäsennelty perustelu suomeksi. Vastauksen tulee olla suomenkielinen.'

	const userPrompt =
		debateText +
		`\n\nMuista: SIDE_A on ${sideADisplayName} ja SIDE_B on ${sideBDisplayName}. ` +
		'Hyödynnä näitä nimiä arvioinnissasi.' +
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

export const evaluateAndFinalizeDebate = async (roomCode: string): Promise<Debate> => {
	const latestDebate = await debateService.getDebate(roomCode)

	if (!latestDebate) throw new Error('Debate not found')

	const evaluation = await evaluateDebate(latestDebate)

	const updatedDebate = {
		...latestDebate,
		evaluation,
		status: DebateStatus.EVALUATED,
	}

	await debateService.saveDebate(updatedDebate)

	return updatedDebate
}
