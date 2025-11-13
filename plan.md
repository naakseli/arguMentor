# Argumentor - Reaaliaikainen Väittelychatti

## Projektin Yleiskuvaus

Reaaliaikainen chat-sovellus, jossa kaksi käyttäjää väittelevät annetusta aiheesta. Molemmilla osallistujilla on 3 argumenttia käytettävissään. Kun molemmat ovat käyttäneet kaikki argumenttinsa, väittely päättyy ja AI arvioi kumpi osapuoli argumentoi paremmin ja julistaa voittajan.

## Teknologiapino

### Backend
- **Runtime**: Node.js (>=20)
- **Server**: Socket.io
- **Tietokanta**: Redis 
- **AI-integraatio**: LangGraph

### Frontend
- **Framework**: React
- **UI kirjasto**: Mantine
- **Reaaliaikainen kommunikaatio**: WebSocket client

### Shared
- Yhteiset tyypit ja utilityt frontendin ja backendin välillä

## Projektirakenne

**Huomioita rakenteesta:**
- **Handlers**: WebSocket-eventit eriytetty omiin handler-tiedostoihin selkeyden vuoksi
- **Services**: Business logic eriytetty services-kansioon
- **Shared**: Kaikki yhteiset tyypit shared-paketissa

```
argumentor/
├── packages/
│   ├── backend/                            # Node.js backend
│   │   ├── src/
│   │   │   ├── server.ts                   # Socket.io server
│   │   │   ├── services/                   # Business logic
│   │   │   │   ├── debateService.ts        # Väittelylogiikka
│   │   │   │   ├── aiEvaluationService.ts  # LangGraph-integraatio
│   │   │   │   └── redisStore.ts           # Redis-tallennus
│   │   │   ├── handlers/                   # WebSocket event handlers
│   │   │   │   ├── createDebate.ts
│   │   │   │   ├── joinDebate.ts
│   │   │   │   ├── sendMessage.ts
│   │   │   │   └── leaveDebate.ts
│   │   │   └── utils/
│   │   │       └── roomCodeGenerator.ts
│   │   └── package.json
│   │
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx          # Väittelyn luominen
│   │   │   │   └── DebatePage.tsx        # Aktiivinen väittely
│   │   │   ├── components/
│   │   │   │   ├── DebateRoom.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ArgumentCounter.tsx
│   │   │   │   ├── TopicDisplay.tsx
│   │   │   │   ├── TopicInput.tsx        # Aiheen valinta
│   │   │   │   └── EvaluationResult.tsx
│   │   │   ├── hooks/          # React hooks
│   │   │   │   └── useWebSocket.ts
│   │   │   ├── services/
│   │   │   │   └── websocketClient.ts
│   │   │   └── stores/         # State management (Context/Redux/Zustand)
│   │   │       └── debateStore.ts
│   │   └── package.json
│   │
│   └── shared/                 # Yhteiset tyypit
│       └── src/
│           ├── types/
│           │   ├── debate.ts
│           │   ├── message.ts
│           │   ├── evaluation.ts
│           │   └── events.ts   # WebSocket event-tyypit
│           └── index.ts
│
├── package.json
└── pnpm-workspace.yaml
```

## Datarakenne (Redis)

### Debate Store (Redis Keys)
```typescript
interface Debate {
  roomCode: string;        // Esim. "ABC123" - 6 merkkiä
  topic: string;
  topicSideA: string;      // Esim. "Kannattaa"
  topicSideB: string;      // Esim. "Vastustaa"
  status: DebateStatus;
  sideAJoined: boolean;
  sideBJoined: boolean;
  argumentsRemainingA: number;  // Jäljellä olevat argumentit (alkuperäinen: 3)
  argumentsRemainingB: number;  // Jäljellä olevat argumentit (alkuperäinen: 3)
  messages: Message[];
  evaluation?: Evaluation;
}

interface Message {
  id: string;
  side: DebateSide;        // Kumpi puoli lähetti viestin
  content: string;
  timestamp: Date;
}

interface Evaluation {
  id: string;
  winner?: DebateSide;
  scoreA: number;          // 0-100
  scoreB: number;          // 0-100
  reasoning: string;       // AI:n perustelut
  createdAt: Date;
}

enum DebateStatus {
  WAITING,      // Odottaa toista osallistujaa
  ACTIVE,       // Väittely käynnissä
  ENDED,        // Väittely päättynyt (kaikki argumentit käytetty)
  EVALUATED     // AI on arvioinut
}

enum DebateSide {
  SIDE_A,
  SIDE_B,
  TIE
}
```

### Redis-toteutus
- **Avainmuoto**: `debate:{roomCode}` - JSON-serialisoitu Debate-objekti
- **TTL (Time To Live)**: 
  - Oletus: 1 tunti (jos väittely jää kesken)
  - Pidennetty: 24 tuntia kun arviointi valmis (jotta tulokset pysyvät saatavilla)
- **Serialisointi**: JSON.stringify/parse (ioredis hoitaa automaattisesti)
- **Automaattinen siivous**: Redis poistaa automaattisesti TTL:n umpeuduttua

### Viestien tallennus
- **Mekanismi**: Viestit tallennetaan osana Debate-objektia `messages`-arrayna
- **Prosessi**:
  1. Uusi viesti saapuu → luodaan Message-objekti (id, side, content, timestamp)
  2. Haetaan Debate Redisiin: `GET debate:{roomCode}`
  3. Parsitaan JSON → Debate-objekti
  4. Lisätään uusi viesti `messages`-arrayhin: `debate.messages.push(newMessage)`
  5. Vähennetään argumenttilaskuria: `debate.argumentsRemaining{side}--`
  6. Tallennetaan takaisin Redisiin: `SET debate:{roomCode} JSON.stringify(debate)`
  7. Päivitetään TTL jos tarpeen
- **Huom**: Koko Debate-objekti korvataan jokaisella viestillä (ei append-operaatiota)
- **Optimointi**: Voidaan käyttää Redis-pipelinea jos tarvitaan useita operaatioita
- **Concurrency**: Redis on single-threaded, joten kilpailutilanteet eivät ole ongelma

## WebSocket Events (Ainoa rajapinta)

### Client → Server
- `create_debate` - Luo uusi väittely
  - Payload: `{ topic: string }` (pakollinen - käyttäjä valitsee aiheen)
  - Vastaus: `debate_created` event tai `error` jos topic puuttuu
  
- `join_debate` - Liity väittelyhuoneeseen
  - Payload: `{ roomCode: string }`
  - Vastaus: `debate_joined` tai `error`
  
- `get_debate_info` - Hae väittelyn tiedot (vapaaehtoinen)
  - Payload: `{ roomCode: string }`
  - Vastaus: `debate_info` tai `error`
  
- `send_message` - Lähetä viesti (argumentti)
  - Payload: `{ content: string }`
  - Vastaus: `message_sent` (vahvistus) + `new_message` (kaikille osallistujille) + `arguments_updated` (jos argumentti käytetty)
  - Huom: Jokainen viesti vähentää lähettäjän argumenttilaskuria yhdellä
  
- `leave_debate` - Poistu väittelyhuoneesta
  - Payload: `{}`
  - Vastaus: `debate_left`

### Server → Client
- `debate_created` - Väittely luotu
  - Payload: `{ roomCode: string, debate: Debate }`
  
- `debate_joined` - Liittyminen onnistui
  - Payload: `{ side: DebateSide, debate: Debate }`
  
- `debate_info` - Väittelyn tiedot (jos pyydetty)
  - Payload: `{ debate: Debate }`
  
- `debate_started` - Väittely alkoi
  - Payload: `{ debate: Debate }`
  
- `arguments_updated` - Argumenttilaskuri päivittyi
  - Payload: `{ argumentsRemainingA: number, argumentsRemainingB: number }`
  
- `message_sent` - Viestin lähetys vahvistettu
  - Payload: `{ messageId: string, timestamp: Date }`
  
- `new_message` - Uusi viesti (lähetetään kaikille osallistujille)
  - Payload: `{ id: string, side: DebateSide, content: string, timestamp: Date }`
  
- `debate_ended` - Väittely päättyi
  - Payload: `{ debate: Debate }`
  
- `evaluation_ready` - AI-arviointi valmis
  - Payload: `{ evaluation: Evaluation }`
  
- `error` - Virhetilanne
  - Payload: `{ code: string, message: string }`

## Toiminnallisuudet

### 1. Väittelyn Luominen
- Käyttäjä avaa WebSocket-yhteyden
- Käyttäjä valitsee aiheen (topic) väittelyä varten
- Lähettää `create_debate` -eventin pakollisella topic-kentällä
- Server validoi topicin (ei saa olla tyhjä)
- Server generoi yksilöllisen room coden (esim. 6 merkkiä: "ABC123")
  - Luojan puoli: SIDE_A (automaattisesti)
  - sideAJoined = true
  - argumentsRemainingA = 3
  - topic = käyttäjän valitsema aihe
- Server lähettää `debate_created` -eventin room coden kanssa
- Näytetään room code, jota toinen käyttäjä tarvitsee liittyäkseen
- Odottaa toista osallistujaa (status: WAITING)
- Kun toinen liittyy koodilla (`join_debate`), väittely alkaa välittömästi

### 2. Aktiivinen Väittely
- Kun molemmat osallistujat ovat paikalla (sideAJoined && sideBJoined), väittely alkaa välittömästi
- Näytetään aihe ja kumpi puoli kukin edustaa (SIDE_A tai SIDE_B)
- Molemmilla osallistujilla on 3 argumenttia käytettävissään
- Reaaliaikainen chat-keskustelu
- Jokainen lähetetty viesti vähentää lähettäjän argumenttilaskuria yhdellä
- Argumenttilaskuri näytetään molemmille osallistujille
- Viestit näytetään reaaliaikaisesti molemmille
- Markdown-tuki viesteille (vapaaehtoinen)

### 3. Väittelyn Päättyminen
- Kun molemmat osallistujat ovat käyttäneet kaikki 3 argumenttinsa (argumentsRemainingA === 0 && argumentsRemainingB === 0), väittely päättyy
- Viestejä ei enää lähetetä
- Näytetään "Odotetaan arviointia..." -viesti

### 4. AI-arviointi
- Backend lähettää koko keskustelun AI:lle
- Arviointikriteerit:
  - Argumenttien logiikka ja perusteltavuus
  - Vastaukset vastapuolen argumentteihin
  - Tiedon käyttö ja faktat
  - Yhtenäisyys ja rakenteellisuus
  - Persuasio ja retoriikka
- AI palauttaa:
  - Voittajan (tai tasapelin)
  - Pisteet molemmille (0-100)
  - Perustelut

### 5. Tulosten Näyttäminen
- Näytetään voittaja
- Pisteet molemmille osapuolille
- AI:n perustelut
- Mahdollisuus jakaa tulokset

## Kehitysvaiheet

### Vaihe 1: Perusrakenne
- [x] Projektirakenteen viimeistely
- [x] Redis-yhteys ja store-toteutus
- [x] Socket.io server -setup
- [x] Perus React-frontend
- [x] Room code -generointi
- [x] Shared-tyyppien määrittely

### Vaihe 2: WebSocket-perustoiminnot
- [ ] WebSocket-yhteyden muodostus
- [x] `create_debate` -eventin käsittely
- [x] `join_debate` -eventin käsittely
- [x] `get_debate_info` -eventin käsittely (vapaaehtoinen)
- [x] Perus virheenkäsittely

### Vaihe 3: Reaaliaikainen Chat
- [ ] `send_message` -eventin käsittely
- [ ] Argumenttilaskurin vähentäminen viestin lähetyksellä
- [ ] Viestien tallennus Redisiin
- [ ] Reaaliaikainen viestien synkronointi (broadcast)
- [ ] `arguments_updated` -eventin lähetys
- [ ] Rate limiting viestien lähetykselle

### Vaihe 4: Väittelylogiikka
- [ ] Väittelyn tilojen hallinta
- [ ] Argumenttilaskurin seuranta
- [ ] Automaattinen väittelyn päättyminen kun molemmat ovat käyttäneet argumenttinsa
- [ ] Estä viestien lähetys kun argumentit loppuneet

### Vaihe 5: AI-arviointi
- [ ] LangGraph-integraatio
- [ ] Keskustelun formatointi AI:lle
- [ ] Arviointipromptin suunnittelu
- [ ] Tulosten tallennus Redisiin
- [ ] `evaluation_ready` -eventin lähetys

### Vaihe 6: UI/UX
- [ ] Moderni ja responsiivinen design
- [ ] Aiheen valinta -komponentti (väittelyn luomisessa)
- [ ] Room code -näyttö ja syöttö
- [ ] ArgumentCounter-komponentti (näyttää jäljellä olevat argumentit)
- [ ] Chat-ikkuna
- [ ] Arviointitulosten näyttö
- [ ] Perus virheenkäsittely

## Tekniset Detaljit

### Redis
- Käytetään `ioredis` -kirjastoa
- Yhteys pool: yksi yhteys riittää
- JSON-serialisointi: Debate-objektit JSON-muodossa
- TTL-asetukset:
  - Uusi väittely: 3600 sekuntia (1h) - jos jää kesken
  - Arvioinnin jälkeen: 86400 sekuntia (24h) - tulokset saatavilla
- Fallback: Jos Redis ei ole saatavilla, voidaan käyttää Map-pohjaista fallbackia (dev)

### WebSocket-yhteys
- Käytetään Socket.io tai native WebSocket
- Yhteys pidetään elossa ping/pong -mekanismilla
- Automaattinen uudelleenyhteys, jos yhteys katkeaa
- Yksi WebSocket-yhteys koko session ajan (ei tarvita REST-APIa)
- Event-pohjainen kommunikaatio: kaikki toiminnot WebSocket-eventeinä
- Yhteyshallinta: serveri pitää kirjaa aktiivisista yhteyksistä ja niiden liitetyistä väittelyistä

### AI-arviointi
- Käytetään LangGraph-työkalua
- Arviointiprosessi sisältää:
  - Väittelyn aiheen
  - Molempien osapuolien viestit
  - Arviointikriteerit
  - Pyyntö strukturoidulle vastaukselle (JSON)

### Turvallisuus
- Input-validoinnit (viestien pituus, room code -muoto)
- XSS-suojaus frontendissä (sanitize viestit)
- Room code -validointi (oikea muoto, olemassa oleva)
- Rate limiting viestien lähetykselle (estää spämmiä)

## Ympäristömuuttujat

### Backend (.env)
```
REDIS_URL="redis://localhost:6379"
# LangGraph vaatii API-avaimen (OpenAI, Anthropic, jne.)
LANGGRAPH_API_KEY="..."
PORT=3000
NODE_ENV="development"
```

### Frontend (.env)
```
VITE_WS_URL="ws://localhost:3000"
```