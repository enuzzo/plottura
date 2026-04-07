# Netmilk Studio — Guida alla Brand Voice

> Come scrive Netmilk. Per README, documentazione, microcopy UI e qualsiasi cosa esca con il nostro nome sopra.

> Nota: nello storico raggiungibile di questo repository non esiste una versione italiana committata di questo documento. Questa copia italiana e stata ricostruita partendo dalla guida inglese e ricollegando gli esempi alle frasi sorgente presenti nei README reali di `scrybar`, `Synthalia` e `minimuvi`, cosi da non perdere quel copy.

---

## La Voce Netmilk in Una Frase

**Tecnicamente precisa, culturalmente irriverente, mai verbosa, sempre consapevole di se.**

Scriviamo come qualcuno che sa esattamente come funziona la cosa, trova leggermente assurdo che esista, e te la racconta lo stesso perche e davvero buona e dovresti usarla.

---

## Spettro del Tono

| Asse | Dove stiamo | Cosa significa in pratica |
|---|---|---|
| **Formale ↔ Casual** | 70% casual | Prima persona plurale, parentesi come inciso, tono colloquiale controllato. Niente slang buttato li senza motivo. |
| **Serio ↔ Giocoso** | 60% giocoso | Le parti tecniche sono precise. Intro e descrizioni si guadagnano le battute. |
| **Umile ↔ Sicuro** | 75% sicuro | Sappiamo cosa abbiamo costruito. Sappiamo anche che e una lampada da tavolo che gira simulazioni fisiche in YAML. Le due cose sono entrambe vere. |
| **Secco ↔ Caldo** | Oscilla | Ironia asciutta in superficie, calore vero sotto. Mai freddo. Mai melenso. |

### I Quattro Ingredienti

1. **Irriverente ma nerd-competente** — prendiamo in giro l'assurdita, ma le specifiche sono impeccabili.
2. **Sarcastica ma calda** — il sarcasmo punta su di noi, non su chi legge.
3. **Cinica ma affettuosa** — conosciamo i limiti. L'abbiamo spedita lo stesso. Ne siamo fieri.
4. **Sottile e affilata** — ogni riga si deve meritare il posto. Niente riempitivo. Niente nebbia corporate.

---

## Struttura README

Ogni README Netmilk segue questo scheletro. Non vagamente: esattamente.

### 1. Riga Badge (obbligatoria)

Badge colorati, stile `for-the-badge`, in cima a tutto. Nessuna alternativa in plain text.

```markdown
[![Arduino](https://img.shields.io/badge/Arduino-Firmware-00979D?style=for-the-badge&logo=arduino&logoColor=white)](https://arduino.cc/)
[![ESP32-S3](https://img.shields.io/badge/ESP32--S3-Waveshare_3.49"-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
```

**Regole:**
- Sempre `style=for-the-badge` — mai flat, mai plastic
- I colori seguono lo stack tecnico o la palette del progetto
- Quando possibile usa il logo ufficiale (`&logo=...`)
- Il badge licenza c'e sempre ed e sempre l'ultimo della riga
- Ogni badge linka alla sua URL rilevante

### 2. Blockquote di Apertura (obbligatorio)

Una one-liner sardonica e autoconsapevole che imposta il tono prima di qualsiasi descrizione.

> "E se prendessi il feed live della camera e lo facessi passare in uno shader che rende tutto simile a un delirio di vector art anni Settanta?"
> *Qualcuno che chiaramente aveva guardato troppi video sul Rutt-Etra alle 2 di notte e possedeva un numero discutibile di Raspberry Pi inutilizzati*

> Una CLI che converte video.
> Avvolta in piu cromature BBS ANSI di quante un convertitore video abbia il diritto di avere.

**Regole:**
- Imposta il tono emotivo dell'intero progetto
- Puo essere una citazione (attribuita a una versione fittizia o anonima di noi stessi)
- Puo essere composta da due righe brevi che mettono in contrasto cos'e vs come appare
- Mai earnest, sempre leggermente autoironica

### 3. Pitch in Una Riga, in Grassetto (obbligatorio)

Un paragrafo, nome progetto in grassetto, descrizione pulita di cosa fa davvero. Subito dopo il blockquote.

> **Synthalia** e uno strumento luminoso interattivo travestito da lampada. Cinque metri di WS2812B avvolti in un'elica da 18 spire, sigillati dentro una campana di vetro satinato, controllati con gesture della mano e manopole in ottone, pilotati da un ESP32-S3 con ESPHome.

**Regole:**
- Un paragrafo, massimo 2-3 frasi
- Il nome del progetto va in grassetto
- Spiega cos'e, cosa usa, cosa fa
- Niente linguaggio marketing: solo fatti, detti bene

### 4. Il Kicker (facoltativo ma consigliato)

Una riga di follow-up che riframma il pitch con personalita.

> Non e una smart lamp. Le smart lamp hanno un'app.
> Questa ha *simulazioni fisiche e una pipeline di smoothing delle gesture.*

> Non e un'app di filtri camera. Le app di filtri camera hanno slider e un pulsante share.
> Questa ha una pipeline GLSL, un renderer bare-metal DRM/KMS e un thread tastiera che intercetta Ctrl+C prima ancora che il sistema operativo capisca cosa sta succedendo.

**Regole:**
- Mette a contrasto "quello che fanno le persone normali" con "quello che abbiamo fatto noi"
- Il punchline va in corsivo
- Due righe, struttura parallela

### 5. Sezione "Perche Esiste" (obbligatoria per progetti sostanziosi)

La storia d'origine. Sempre onesta, sempre divertente, sempre consapevole dell'assurdo.

**Schema:** parti da una situazione universalmente riconoscibile → scala attraverso decisioni via via piu specifiche → arriva al progetto attuale come conclusione inevitabile.

> Ogni workflow di conversione video inizia allo stesso modo. Trascini un file in qualche app. L'app ti chiede quindici decisioni sui codec su cui non hai alcuna opinione...

> Ogni progetto LED inizia allo stesso modo: *"Gli faccio solo fare luce."* Poi aggiungi un encoder rotativo perche i pulsanti sono per chi compra le lampade da IKEA...

**Regole:**
- Usa la seconda persona ("tu") per portare dentro chi legge
- Il monologo interiore va in corsivo: *"Gli faccio solo fare luce."*
- L'escalation e il motore comico: ogni passo deve essere piu assurdo del precedente
- Chiudi con accettazione: "Le due cose sono contemporaneamente vere e noi siamo in pace con questo."

### 6. Tabella Hardware / Tech (quando serve)

| Componente | Specifica | Ruolo |
|---|---|---|
| **MCU** | ESP32-S3, 240 MHz, dual-core | Il cervello. 16 MB di flash, OPI PSRAM in modalita octal, perche LVGL ha bisogno di spazio per pensare. |

**Regole:**
- Il nome del componente va in grassetto
- La colonna "Ruolo" e il punto dove vive la personalita: parti con una metafora ("Il cervello."), poi dai la ragione tecnica
- Le specifiche devono essere precise (valori esatti, model number)
- I commenti tra parentesi nella colonna ruolo sono incoraggiati

### 7. Layout con Immagini

Tabella affiancata: immagine da una parte, descrizione dall'altra.

```markdown
<table><tr>
<td width="55%"><img src="..." alt="..." width="100%"></td>
<td>

**Titolo in grassetto.** Paragrafo descrittivo con personalita.

</td>
</tr></table>
```

**Regole:**
- Le immagini spiegano piu del testo: usale senza timidezza
- Ogni immagine deve avere un alt text descrittivo
- La descrizione accanto all'immagine deve reggersi da sola

### 8. Elementi di Chiusura (obbligatori)

**Blocco licenza:** sempre MIT. Sempre con una chiusura sardonica.

> MIT — Usalo, forkalo, modificalo, mettilo su una scrivania e racconta in giro che e arte (lo e).

**Riga finale in corsivo:** poetica, assurda, centrata. L'ultima cosa che la gente legge.

> *Costruito con ESPHome, troppe costanti di smoothing e la convinzione incrollabile*
> *che `alpha = 0.16` sia oggettivamente migliore di `alpha = 0.15`.*

**Schema:** "Costruito con [tecnologia reale], [dettaglio assurdo] e la convinzione incrollabile che [opinione iperspecifica]."

---

## Regole di Scrittura

### Da fare

- **Apri con la parte interessante.** Se la feature fa girare DOOM su una desk bar, dillo per primo.
- **Usa tabelle per i dati strutturati.** Specifiche, controlli, comandi, effetti: se ha colonne, vuole una tabella.
- **Usa le parentesi come inciso** per commenti che da soli spezzerebbero il flusso. *(perche quando stai schivando imp sul desk bar, la sottigliezza non e una virtu)*
- **Usa il corsivo per il monologo interiore** — la voce nella tua testa mentre costruisci: *"Gli faccio solo fare luce."*
- **Sii tecnicamente preciso.** Model number, pin number, valori esatti. L'imprecisione e mancanza di rispetto verso chi legge.
- **Riconosci l'assurdita.** Se il progetto e overkill, dillo. Poi spiega perche resta una gran cosa.
- **Usa blocchi di codice senza avarizia** per comandi, config e path. `code` inline per valori e nomi.
- **Scrivi alt text che descrivono, non decorano.** "Vista HOME, tema Toxic Candy" — non "screenshot".

### Da non fare

- **Mai essere verbosi.** Se una frase non si guadagna il posto, si taglia.
- **Mai essere generici.** "Questo progetto mira a fornire una soluzione per..." e il modo in cui scrivono gli altri. Non noi.
- **Mai essere gratuitamente cattivi.** Il sarcasmo prende di mira noi, le nostre decisioni, l'assurdita del contesto. Mai chi legge. Mai altri progetti.
- **Mai usare linguaggio marketing.** Niente "rivoluzionario", "next-generation", "seamless", "robust". Sono parole che non dicono niente.
- **Mai spiegare cio che il lettore vede gia.** Se c'e uno screenshot, non raccontare quello che si vede. Racconta quello che conta.
- **Mai chiedere scusa del fatto che il progetto esiste.** Esiste. E buono. Andiamo avanti.
- **Mai saltare i badge.** Un README senza badge e un README senza rispetto per il formato.

---

## Pattern Ricorrenti

### L'Escalation

Parti normale, scala nell'assurdo, atterra nell'accettazione.

> Poi aggiungi un sensore Time-of-Flight perche mai *toccare* un pulsante quando puoi agitare la mano davanti ai mobili come uno Jedi con problemi di confini personali. Poi passi un weekend a decidere se `alpha = 0.16` o `alpha = 0.18` faccia sentire la gesture piu "burrosa" e meno "ubriaca".

### Il Contrast Kicker

Di' cos'e la versione normale. Di' cos'e la nostra. Lo scarto e la battuta.

> Non e una smart lamp. Le smart lamp hanno un'app.
> Questa ha *simulazioni fisiche e una pipeline di smoothing delle gesture.*

### L'Aside Onesto

Entra in parentesi e di' la parte che normalmente si pensa soltanto.

> (perche quando stai schivando imp su una desk bar, la sottigliezza non e una virtu)
> (nessun gatto)
> (lo guardera due volte)

### La Conclusione che Accetta

Riconosci la contraddizione. Accettala. Vai avanti.

> E overkill per un convertitore video? Si. C'e anche `slowmovie` (un preset reale per display e-ink, 1 fps, niente audio)? Sempre si. Le due cose sono contemporaneamente vere e noi siamo in pace con questo.

### La Precisione Assurda

Sii estremamente specifico su qualcosa di intrinsecamente ridicolo.

> Una strip 640×172 che dice l'ora in Klingon, recupera il meteo da un'API che potresti aprire da solo, fa scroll di headline che hai gia letto sul telefono, tira fuori fatti casuali da Wikipedia che nessuno ha chiesto e apre un portale per l'Inferno.

### Il Reframe

Prendi un fatto tecnico asciutto e dagli una personalita.

> La barra sa quando sei arrabbiato. *(riferito allo shake detection dell'IMU)*
> Aggiungere una lingua significa scrivere 4 funzioni... Se sai coniugare i verbi, puoi aggiungere una lingua.

---

## Linee Guida per il Copy UI

Per pulsanti, label, tooltip, messaggi d'errore e testo in-app:

| Contesto | Stile | Esempio |
|---|---|---|
| **Label dei pulsanti** | Brevi, verbo-first | "Copia come JSON", "Cambia tema", "Vedi sorgente" |
| **Empty state** | Utili, non apologetici | "Nessun token corrisponde al filtro." — non "Scusa, non abbiamo trovato nulla!" |
| **Messaggi d'errore** | Di' cosa e successo e cosa fare | "File di configurazione mancante. Copia `secrets.h.example` e inserisci le credenziali." |
| **Tooltip** | Una riga, fattuale | "Clicca per copiare il valore negli appunti" |
| **Titoli di sezione** | Sostantivo o sintagma nominale | "Design Tokens", "Catalogo Live", "Galleria Temi" |
| **Descrizioni** | Una frase, senza punto se e un frammento | "Token-driven, theme-ready, AI-friendly" |

### Personalita In-App (con parsimonia)

La personalita vive nei README e nella documentazione. Nell'interfaccia conta prima di tutto la chiarezza. Ma in momenti specifici — empty state, easter egg, schermate about, loading message — un tocco di voce e benvenuto:

> "Nessun tema caricato. E tecnicamente impressionante in un modo piuttosto deprimente."
> "Creato da Netmilk Studio. Si, quelli delle lampade."

---

## Esempi Prima / Dopo

### Scrittura Tech Generica (da non fare)

> "ScryBar e un dispositivo versatile basato su ESP32-S3 che offre varie funzionalita, tra cui word clock, lettore RSS, visualizzatore Wikipedia e gaming. Supporta piu lingue e temi e puo essere configurato tramite interfaccia web."

### Voce Netmilk (da fare)

> **ScryBar** e un desk companion open-source basato su ESP32-S3. Un touchscreen da 3.49", cinque viste navigabili a swipe, un word clock che compone frasi vere in tredici lingue (dall'italiano e il latino fino al Klingon, al 1337 Speak e al Bellazio), grammatica vera, non tessere uppercase, piu feed RSS, viewer Wikipedia, un port completo di DOOM con controlli gyro e una web UI LAN per la configurazione.

### Sezione Sicurezza Generica (da non fare)

> "Assicurati che le credenziali sensibili non vengano committate nel repository. Usa variabili d'ambiente o un file di configurazione locale escluso dal version control."

### Voce Netmilk (da fare)

> `secrets.h` e ignorato da git e non viene mai committato. `secrets.h.example` invece e presente nel repo solo con placeholder.
> - **Mai** committare `secrets.h`. Il `.gitignore` ti copre le spalle, ma la paranoia e una feature.

---

## Checklist per Qualsiasi README Netmilk

- [ ] Riga badge con stile `for-the-badge` e colori/loghi coerenti
- [ ] Blockquote d'apertura che imposta il tono
- [ ] Pitch in una riga con nome progetto in grassetto
- [ ] Indice per qualsiasi README con piu di 3 sezioni
- [ ] Tabella hardware/tech con personalita nella colonna "Ruolo"
- [ ] Almeno un'immagine o screenshot con layout descrittivo
- [ ] Narrazione "Perche Esiste" (per progetti non banali)
- [ ] Sezione sicurezza (se ci sono credenziali o chiavi)
- [ ] Blocco licenza MIT con chiusura sardonica
- [ ] Riga finale in corsivo: "Costruito con [tech], [assurdita] e [convinzione]"
- [ ] Nessun linguaggio marketing in nessun punto
- [ ] Nessuna frase che non si guadagni il posto

---

## Frasi Sorgente da Non Perdere

Queste righe sono riportate in originale perche sono copy gia esistente nei README reali da cui la guida e stata derivata.

### Da `../Synthalia/README.md`

> It is not a smart lamp. Smart lamps have apps.
> This has *physics simulations and a gesture smoothing pipeline.*

> Then you add a rotary encoder because buttons are for people who buy lamps at IKEA. Then a Time-of-Flight sensor because why *tap* a button when you can wave at your furniture like a Jedi with boundary issues. Then you spend a weekend deciding if `alpha = 0.16` or `alpha = 0.18` makes the gesture feel more "buttery" and less "drunk".

> *that `alpha = 0.16` is objectively better than `alpha = 0.15`.*

> - **Never** commit `secrets.yaml`. The `.gitignore` has your back, but paranoia is a feature.

### Da `../scrybar/README.md`

> **ScryBar** is an open-source ESP32-S3 desk companion. One 3.49" touchscreen, five swipeable views, a word clock that composes real sentences in thirteen languages (from Italian and Latin to Klingon, 1337 Speak, and Bellazio), actual grammar, not uppercase tiles, plus RSS feeds, a Wikipedia viewer, a full DOOM port with gyro controls, and a LAN web config UI.

> A 640×172 strip that tells time in Klingon, fetches weather from an API you could just open yourself, scrolls headlines you already read on your phone, pulls random Wikipedia facts nobody asked for, and opens a portal to Hell.

> The bar knows when you're angry.

> - **Never** commit `secrets.h`. The `.gitignore` has your back, but paranoia is a feature.

### Da `../minimuvi/README.md`

> Wrapped in more BBS ANSI chrome than any video converter has any business having.

> Every video conversion workflow starts the same way.

> Is it overkill for a video converter? Yes. Is `slowmovie` (a real preset for e-ink displays, 1fps, no audio) also in here? Also yes. Both things are simultaneously true and we are at peace with it.

---

*Ricostruita a partire dalla guida inglese e dai README di ScryBar, Synthalia e minimuvi —*
*tre progetti con un tratto in comune: rifiutarsi ostinatamente di essere noiosi.*
