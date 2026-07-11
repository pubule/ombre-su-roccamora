# PROMPT DI ESPANSIONE — Ombre su Roccamora

Copia tutto questo documento in una nuova conversazione e in fondo scrivi cosa vuoi
(es. «Genera l'Episodio 2 completo in PDF»). Contiene tutto ciò che serve per
mantenere coerenza narrativa, meccanica e grafica con il materiale esistente.

---

Agisci come game designer e grafico del gioco da tavolo **"Ombre su Roccamora"**, un
investigativo cooperativo a puntate per 2–5 giocatori che ho già in versione stampata.
Devi produrre nuovo materiale (episodi, personaggi, varianti) perfettamente coerente
con le tre "bibbie" qui sotto. Non cambiare regole, numeri o stile salvo mia richiesta
esplicita.

## 1. BIBBIA NARRATIVA

- **Ambientazione:** Roccamora, città immaginaria di canali, campanili e nebbia, anno 1889.
  Tono: mistero gotico ottocentesco, inquietante ma mai splatter; l'orrore è suggerito.
- **I giocatori** sono la **Società del Lume**, circolo privato d'investigatori. Eroi:
  Elena Fosco (Investigatrice), Dott. Attilio Marn (Medico), Sibilla Reve (Occultista),
  Nino "Grimaldello" Cauto (Ladro), Carla Dosti (Giornalista), Ottone "Mezzena" Massari
  (Macellaio, il combattente del gruppo: Vigore 3, Salute 8). Roster di sei, massimo
  cinque in tavola. Presidente: il misterioso "M.".
- **L'antagonista di campagna** è il **Coro Sommerso**, confraternita bandita nel 1741 e
  rifondata dal liutaio **Bastiano Ferri** (fuggito alla fine dell'Episodio 1, ricorrente).
  Sigillo: un'onda. Il culto non evoca: **"accorda"** i luoghi della città con suoni
  (campane, voci, organi, acqua) per svegliare **il Dormiente**, entità sotto Roccamora.
- **Stato campagna dopo l'Ep. 1:** il campanaro Ruggero Alvise è stato salvato dal
  Magazzino delle Cere; la Cattedrale è già "accordata"; i giocatori hanno il
  Frammento di Campagna n. 1.
- **Arco previsto (adattabile):** Ep. 2 *Le voci del pozzo* (il pozzo dei Frati),
  Ep. 3 *Il teatro dell'eco*, Ep. 4 *La fonderia dei rintocchi*, Ep. 5 *L'organo di ossa*,
  Ep. 6 finale *Il Terzo Movimento* (discesa sotto la città, resa dei conti con Ferri e
  il Dormiente; qui i Frammenti raccolti devono servire a una deduzione finale).
- Ogni episodio si chiude con un **Frammento di Campagna** numerato, un aggancio al successivo
  e un **Bivio morale sigillato**: due scelte sensate, conseguenze concrete (una meccanica,
  una narrativa) rivelate all'inizio dell'episodio dopo. Bivio dell'Ep. 1: lo spartito del
  rituale. Se BRUCIATO → l'Ep. 2 inizia senza segnalini timer e con 1 carta Presagio in più
  nel mazzo, ma una delle 4 Domande perde un incrocio (il culto ha cambiato i suoi codici).
  Se CONSERVATO → i giocatori ottengono il Frammento 1-bis (mezzo pentagramma, utile al
  finale), ma il mazzo Minaccia dell'Ep. 2 aggiunge 2 carte "Segugi del Coro" (2 Adepti che
  entrano dall'ingresso e puntano chi porta lo spartito).

## 2. BIBBIA MECCANICA (non modificare i numeri)

**Sistema base:** prove = 2d6 + caratteristica (ACUME / VIGORE / NERVI) contro
Facile 7 · Media 9 · Difficile 11. Ogni eroe ha 1 "Secondo fiato" (ritenta) a episodio.

**Il Preludio (tutorial, esiste già — non rifarlo, usalo come riferimento):**
"La Prova del Lume" (`src/gen_preludio.py`, `pdf/Preludio/`) è il mini-episodio
introduttivo giocato prima dell'Ep. 1: racconta come i sei si incontrano ed
entrano nella Società, e insegna le regole con i box "Scuola del Lume" dentro i
fascicoli. Deroga deliberatamente dalla struttura fissa (2 Domande invece di 4,
1 falsa pista, 1 reperto, niente Eco condivisa, niente boss, 3 tessere e mazzo
Minaccia riusati dall'Ep. 1, orologio "Marea" solo automatico): quelle deroghe
valgono SOLO per il tutorial, gli episodi veri seguono la struttura sotto. Se un
nuovo episodio vuole richiamare il Preludio: Ansaldo (il custode-archivista) e
il nipote sono PNG riusabili; il Frammento 0 è la mezza onda; il committente mai
visto («un signore ben vestito, mani da artigiano») è Ferri, non nominarlo mai
prima che l'Ep. 1 lo riveli.

**Struttura fissa di un episodio (una serata):**
1. *Fase Indagine* — 8 carte Luogo (circa 5 aperte dall'inizio, 2–3 sbloccabili tramite
   PAROLE CHIAVE in maiuscolo o oggetti trovati). Budget: 8 ore/visite (il tempo non deve bastare per tutto: i luoghi utili superano le ore). Sempre almeno un vincolo d'orologio (un luogo che chiude o un testimone che sparisce a un'ora precisa). Almeno
   2 false piste che scagionino innocenti e almeno 1 oggetto-esca plausibile ma inutile (come l'acqua benedetta dell'Ep. 1), così la domanda sull'oggetto è una scelta vera. Gli indizi risolutivi non devono mai nominare la risposta per esteso: usare sigle, soprannomi o riferimenti parziali da incrociare (il "C.B." del registro dell'Ep. 1). Chiusura: **4 Domande** scritte (dove / chi / codice o
   passaggio segreto / oggetto indispensabile), ognuna deducibile incrociando 2–3 indizi
   distribuiti su luoghi diversi. Mai un indizio singolo che risolva tutto.
1-bis. *Approfondimenti* — sistema di indizi gated per abilità eroe, **non bonus
   decorativo**: almeno un dettaglio decisivo per **una o due** delle 4 Domande (mai tutte
   e 4, o il gruppo può restare bloccato) deve emergere **solo** tramite un Approfondimento
   qualsiasi. Ogni eroe ha un verbo fisso (non cambiarli tra episodi): **Elena** =
   Osservazione (sempre, senza limite) · **Attilio** = Referto (1/episodio) · **Ottone e
   Carla** = Testimonianza (1/episodio a testa) · **Sibilla** = jolly, un Approfondimento
   qualsiasi del luogo presente, o intuisce dove cercarne uno (1/episodio) · **Nino** =
   Accesso, entra in un luogo bloccato senza requisiti (1/episodio — non produce una
   carta, unico eroe così). Le carte (Indizio Nascosto / Testimone / Referto) stanno in un
   **unico mazzo coperto**: il dorso mostra **solo il tipo** (mai il numero del luogo, né
   qualunque altro riferimento a un luogo/tessera specifico — sulle carte stesse, fronte
   o retro, non deve mai comparire), così i giocatori non sanno in anticipo dove si
   nasconde qualcosa né possono dedurlo sfogliando il mazzo, e le carte restano riusabili
   tra episodi. Il legame carta↔luogo/tessera (quale carta prendere quando un eroe sblocca
   quel tipo in quel luogo) vive **solo** in `pdf/Episodio N/Luoghi.pdf` (vedi Bibbia
   Visiva), mai su una carta. Tecnica
   dell'**Eco condivisa**: **non un frammento unico e identico** (nell'Ep. 1 lo era e
   suonava ripetitivo, sistemato dopo) ma una **famiglia di 3-4 varianti** a rotazione
   (es. per numero di luogo), appese in coda a ogni carta Approfondimento dell'episodio.
   Ogni variante porta comunque lo **stesso nucleo garantito** (il/i dettaglio/i decisivo/i
   per 1-2 Domande, sempre uguale su ogni variante) — così non conta QUALE carta si peschi,
   basta averne pescata almeno una in tutto l'episodio — ma **ciascuna aggiunge anche un
   accenno diverso** che tocca un'altra Domanda (corroborazione, non nuova informazione: le
   altre Domande restano risolvibili dal solo core). Risultato: il meccanismo tocca **tutte
   e 4** le Domande invece di 1-2, e non legge sempre uguale carta dopo carta. Verifica
   sempre che qualunque coppia di eroi (il minimo per 2 giocatori) possa sbloccare almeno
   una variante: nell'Ep. 1, 5 eroi su 6 producono carte (solo Nino no), quindi ogni
   composizione plausibile ha un percorso.
2. *Busta Soluzione* — risposte, per ogni domanda un Vantaggio se esatta e (per 2 domande
   su 4) una complicazione se errata; schema di montaggio della mappa; epilogo da leggere
   a voce; Frammento; elenco migliorie; **nota per chi arbitra** su cosa fa l'Eco condivisa
   e come giudicare risposte "vicine" se il gruppo non ha consultato nessun Approfondimento.
2-bis. *Reperti* — ogni episodio include 2–3 **documenti-reperto** stampabili (pagine di
   diario a grafia manoscritta, registri, atti d'archivio) consegnati quando si trova
   l'indizio corrispondente. Contengono esattamente le informazioni delle carte Luogo più
   dettagli d'atmosfera: mai indizi esclusivi. Stile: vedi
   `scripts/reperti/generate-reperti.js` (testo composto su un'unica foto di
   pergamena, font La Belle Aurore per le grafie, blend mode Multiply).
2-ter. *Oggetti trovabili* — una **carta fisica per ogni oggetto** (dagli indizi dei
   Luoghi o dal `cerca` delle tessere), mazzo a parte con arte dedicata (nature morte,
   non riusata da altre carte). Titolo, un flavor breve nuovo (evocativo, mai un dato di
   gioco), poi l'effetto meccanico **copiato 1:1** dalla fonte — la carta non introduce
   mai una regola nuova, è solo un supporto fisico invece di una riga da ricordare.
   Includi sempre almeno un oggetto-esca con effetto "nessuno finora scoperto" tra quelli
   con carta (coerenza con l'oggetto-esca del punto 1). Dati: `OGGETTI` in
   `src/gen_cards.py`, mazzo `oggetti` in `scripts/cardconjurer/cards-data.js`.

3. *Fase Spedizione* — 6 tessere (griglia 4×4, tessere 200 mm, caselle 50 mm — il minimo
   per muovere comodo le miniature), percorso con 1–2 rami
   opzionali che premiano l'esplorazione. Round, ciclo fisso e ripetuto: **Turno degli
   eroi** (ogni eroe 2 azioni: Muovi 4 · Attacca · Cerca ACUME Media su una tessera già
   rivelata, solo se nasconde un oggetto — non tutte le tessere ne hanno uno, e non serve
   per liberare prigionieri, quello è Interagire · Interagisci · Usa oggetto, come indicato
   sulla sua carta · Rianima a 2 Salute) → **Fase Minaccia** (pesca 1 carta ogni 2 eroi,
   arrotondando per eccesso, applicane il testo) → **Turno dei nemici** (ognuno si muove
   verso l'eroe più vicino, attacca se adiacente: 2d6+Attacco ≥ Difesa eroe). Nota: rivelare
   una tessera (vedere che stanza è, quando un eroe ci entra) è automatico e diverso da
   Cercare (trovare cosa nasconde, un'azione a parte). Obiettivo di salvataggio/recupero +
   ritorno all'ingresso.
3-bis. *Ferite nemici* — nessun gettone o dado per nemico sul tabellone: si traccia su un
   **Registro delle Ferite** riusabile (una pagina in fondo al fascicolo Spedizione, vedi
   `registro_ferite()` in `src/gen_gothic.py`), righe generiche "nemico attivo" (mai per
   tipo: si cancellano e riusano a fine combattimento) con **10 caselle a goccia** a riga,
   fisse indipendentemente dalle Ferite dell'episodio corrente (oggi il massimo è 3, ma il
   Registro regge già eventuali boss futuri più duri senza bisogno di rifare il PDF — vedi
   scala di difficoltà sotto). Tenuto da chi pesca il mazzo Minaccia quel round — stesso
   principio di D&D/HeroQuest (il master tiene le ferite dei mostri su un proprio foglio,
   non su un componente fisico per mostro), qui senza master: il foglio è pubblico, non un
   segreto. Se mai un nemico superasse 10 Ferite, allora sì va alzato `N_PIP` in
   `registro_ferite()` — non prima.

**Il Canto (o equivalente orologio a tema per l'episodio):** non un nemico, un
**contatore di segnalini che non torna mai indietro**, alimentato da **due fonti
indipendenti**: (a) alcune carte Minaccia-timer aggiungono 1 segnalino quando pescate;
(b) **in più**, a prescindere dalle carte, +1 segnalino automatico alla fine di ogni
**4° round** (4°, 8°, 12°...) — garantisce che il pericolo massimo arrivi comunque, anche
evitando ogni carta-timer. Al raggiungimento della **soglia** (nell'Ep. 1: 3 segnalini) il
boss si desta immediatamente e **da quel momento ogni Fase Minaccia pesca 1 carta in più**,
permanentemente, per il resto della spedizione. Spiega questo meccanismo per intero nel
**Regolamento** (fascicolo 01, letto prima di giocare): nell'Ep. 1 mancava e ha confuso i
giocatori — la Soluzione (sigillata) aggiunge solo i dettagli specifici dell'episodio
(quale nemico, dove compare), non il meccanismo generale.


**Scala di difficoltà (progressione tra episodi):** ogni episodio deve essere un
gradino sopra il precedente, mai un salto. Manopole da girare una o due alla volta:

- **Ep. 2** — 9 luoghi con 8 ore (una rinuncia in più); un secondo vincolo d'orologio;
  boss con debolezza che richiede DUE oggetti dell'indagine usati in combinazione.
- **Ep. 3** — una delle 4 Domande richiede l'incrocio di 3 indizi; 2 oggetti-esca;
  una trappola di tessera passa a prova Difficile.
- **Ep. 4** — il timer parte con 1 segnalino già in gioco; il boss ha 5 ferite o una
  seconda fase (a metà ferite cambia comportamento).
- **Ep. 5** — una domanda "aperta" (la risposta va scritta, non scelta); un luogo
  contiene un indizio falso piantato dal culto, smontabile solo incrociando due fonti.
- **Ep. 6 (finale)** — la deduzione finale usa i Frammenti di Campagna raccolti;
  spedizione su due livelli di tessere; niente nuove meccaniche, solo tutte insieme.

Target di taratura invariato: un gruppo attento risponde bene a 3 domande su 4 al
primo tentativo, e la spedizione si vince con 1–2 eroi a terra nei momenti peggiori.

**Mazzo Minaccia: 20–23 carte, tutte con titolo e flavor unici.** Le copie di uno
stesso effetto sono "carte sorelle": stessa matematica, titolo diverso, flavor diverso,
al più varia il punto di apparizione del nemico (mai danno, difesa o ferite). Le carte
timer formano un crescendo narrativo (nell'Ep. 1: Il canto sale → Il coro risponde →
Il canto cresce). **Composizione di riferimento (Ep. 1, 23 carte):** 12 spawn (4
famiglia-Adepto con apparizioni diverse, 2 Cani, 2 Fonditori, 1 Ronda, **3 Malavita** —
Sgherro/Sicario, vedi sotto), 3 prove/NERVI (2 trappole + 1 evento di gruppo), 3
carte-timer Canto a crescendo narrativo, e il resto in eventi vari (1 presagio innocuo, 1
evento favorevole tipo "Eco Amica", 1–2 effetti di movimento, 1 danno diretto tipo
"Sussurri") fino al totale. Non è vietato scendere a 20 se l'episodio è più snello — ma
mai sotto, si perde varietà.

**Nemici di riferimento (bilanciamento):** tre archetipi di truppa legati al culto, da
riusare e variare — tuttofare = Adepto (Att +1, Dif 7, Fer 1, Mov 4, Danno 1);
veloce-fragile = Cane dei Moli (Att +2, Dif 6, Fer 1, Mov 6, Danno 1, appare VICINO agli
eroi); lento-pesante = Fonditore (Att +1, Dif 8, Fer 2, Mov 2, Danno 2, appare
all'ingresso, chi è ferito ha −1 movimento al turno dopo). Ogni episodio introduce UN
nemico di truppa nuovo legato al culto (un archetipo variato o un quarto archetipo, es.
"a distanza" o "esplosivo") e ne ripropone almeno uno vecchio; boss = livello del Custode
della Cera (Att +3, Dif 9, Fer 3, Mov 3, Danno 2), sempre con una **debolezza legata a un
oggetto trovato nell'indagine** (come il diapason che porta la Difesa a 5). I nuovi boss
possono variare di ±1 le statistiche.

**Malavita di Roccamora (nemici secolari, cross-episodio — riusa, non reinventare):**
**Sgherro** (Att +2, Dif 8, Fer 2, Mov 4, Danno 1, tattica del branco: +1 Attacco se
adiacente a un altro Sgherro) e **Sicario** (Att +3, Dif 7, Fer 1, Mov 5, Danno 2, colpo a
tradimento: +2 Attacco contro un eroe isolato o già ferito). Non hanno cera, maschere né
legami col culto: sono i bravacci/sicari che QUALSIASI antagonista umano di Roccamora può
assoldare a pagamento. Riusali quando serve un pericolo "umano e ordinario" invece che
cultista — specialmente in episodi dove il culto non è (ancora) l'antagonista diretto, o
per rompere la monotonia visiva/tattica se un episodio ha già molti nemici a tema.
Data: `NEMICI` in `src/gen_cards.py` (già presenti, non ridefinirli).

**Eroi (invariati salvo campagne):** roster di sei, statistiche 1–3 (max 4 con migliorie), Salute 6–7,
Difesa 8–9, armi +1 all'attacco. Migliorie standard: +1 caratteristica, +1 Salute,
Revolver, Lanterna schermata, Borsa di garze. Cicatrici: alla terza, −1 permanente.

## 3. BIBBIA VISIVA (per PDF identici ai miei — stile "gotico")

Lo stile attuale è **dark fantasy gotico** (riferimento: card template di Vladimir
Tyrlov) per le carte e **mappa a china su pergamena** per le tessere.

- **Palette pergamena:** inchiostro #33291f · rosso #7a1f2b (scuro #571420) ·
  verde-acqua #1f5f6b (scuro #123c44) · pergamena #f0e6cc (scura #e2d3ac) ·
  oro #a8833a · seppia #8a7150.
- **Palette carte gotiche:** notte #17141a (rosso-notte #1d1014, abisso #0e1519) ·
  oro chiaro #d8b25e / oro #b68d3c / oro scuro #6e5522 · osso #e8dcc0 ·
  sangue #6e1420 · china mappe #3a2f22.
- **Font:** corpo **Old Standard TT** (Regular/Bold/Italic); titoli e maiuscoletti
  **IM Fell English SC** (i titoli si scrivono in minuscolo per ottenere lo small-caps).
- **Carte (Minaccia 60×84 mm in griglia 3×3; Luogo mezza A4, 2 per pagina):**
  fondo scuro con vignettatura, cornice a doppio filetto oro con **filigrane a
  ricciolo negli angoli** e **gemme a losanga** (rubino sopra/sotto, acquamarina ai
  lati), **targa a nastro** con code a rondine per il titolo, **medaglione a
  raggiera** centrale con icona tematica in linea dorata: ogni FAMIGLIA di carte ha la
  sua icona (cappuccio, zampa, mestolo, tagliola, fumi, nota, occhio, campana, goccia,
  spirale, àncora). Le carte Luogo hanno un
  pannello pergamena interno per il testo; i loro dorsi sono rosso-notte con numero
  nel medaglione, i dorsi Minaccia verde-abisso con tripla onda. Le pagine dei dorsi
  seguono i fronti, specchiate in colonna, per la stampa fronte/retro sul lato lungo.
- **Tessere (200 mm, griglia 4×4, casella 50 mm — minimo per muovere comodo le
  miniature, nessuna PDF le forza a dimensione: vanno stampate a quella taglia):**
  stile mappa disegnata a china su pergamena: muri spessi a **doppia linea
  tremolante con tratteggio a 45°**, varchi porta nei muri, ombre a
  **puntinato**, acqua stipplata con onde, arredi a china con ombra,
  **rosa dei venti**, targa a nastro col nome, riquadro testo con bordo a china.
- **Miniature quadrate (50 mm, la taglia di una casella tessera):** al posto di
  gettoni tondi astratti, eroi e nemici di truppa/boss usano il proprio ritratto
  (stessa arte delle carte) ritagliato a quadrato — `token_sheet()` in
  `src/gen_gothic.py`, stessa tecnica cover-fit di `deluxe_style._cover_image`
  usata per lo strappo delle schede eroe, ma clippata invece che velata da un
  bordo di pergamena. Solo le unità senza ritratto dedicato (l'NPC da salvare,
  i segnalini Canto) restano gettoni tondi piccoli. Se un episodio introduce un
  nuovo nemico con arte dedicata, aggiungilo a `token_sheet()`; se il crop
  taglia male testa/soggetto, taralo in `MINI_CROP` (stesso principio di
  `top_margin`/`overscan` delle schede — verifica sempre a video prima di
  fissare i parametri, non tutti i ritratti si comportano uguale).
- **Documenti (regolamento, soluzione, lettera, taccuino, schede, aiuto):** sfondo
  pergamena **reale** (`artworks/background manuale.png`, non più procedurale — un
  overlay procedurale di vignettatura ai bordi resta sopra per uniformità), cornice
  sottile inchiostro/seppia, titoli di sezione H1 come **banner rosso** (Table con
  sfondo `RED_DK`, righe oro sopra/sotto, testo small-caps color crema — vedi `h1_bar()`
  in `src/gen_docs.py`, non semplice testo colorato), **drop-cap** sulla prima lettera dei
  paragrafi d'apertura (stesso trucco della lettera d'incarico: `<font size=X
  color=RED>Prima</font>lettera`), sigillo di ceralacca **arte reale**
  (`artworks/Sigillo.png`, non più disegnato: vedi sotto), piè di pagina "ombre su
  roccamora · società del lume" in oro/seppia. Box di nota con sfondo pergamena e
  bordo seppia (non oro: l'oro resta per i filetti/rifiniture, il seppia per i bordi
  "a inchiostro").
- **Schede Personaggio:** ogni scheda fonde il **ritratto dell'eroe** (stessa arte delle
  carte Eroi) attraverso lo **strappo trasparente reale** di
  `artworks/background scheda personaggio 2.png` (canale alpha vero, non un placeholder:
  vedi `torn_portrait()`/`_cover_image()` in `src/deluxe_style.py`). Usa **solo** la
  variante con strappo in basso a destra: quella in alto invaderebbe nome/statistiche/
  abilità, zona troppo densa. Il ritratto è cover-fit sulla sola finestra dello strappo
  (mai sull'intera pagina, altrimenti zooma a caso) con `top_margin`/`overscan` tarati per
  vedere la figura quasi intera senza tagliare la testa sul bordo frastagliato — se
  aggiungi un settimo eroe, genera prima un ritratto di prova e verifica a video prima di
  fissare i parametri.
- **Sigillo di cera:** l'arte sorgente (`artworks/Sigillo.jpg`) ha spesso una scacchiera
  grigia cablata nei pixel al posto della trasparenza vera (jpg, niente alpha): va isolata
  con una soglia di saturazione (la scacchiera è grigia desaturata, cera e oro no) + crop
  al bounding box, salvata come .png con alpha reale prima di poterla usare in `seal()`.
- **Glifi mancanti nei font (verificato due volte, controlla sempre prima di usarli):**
  **IM Fell English SC** (font small-caps dei titoli, `F['sc']`) non ha il segno meno
  tipografico **−** (U+2212) né la nota musicale **♪** (U+266A) — escono come quadratino
  vuoto. Usa il trattino ASCII **-** (U+002D) al posto di − ovunque in quel font; per
  simboli decorativi usa glifi verificati presenti (es. **†**, bullet, asterisco). Se in
  dubbio, verifica col cmap del font (`fontTools`) prima di generare, non dopo.
- **File di output:** `pdf/01-Regolamento`, `pdf/02-Schede-Personaggio`,
  `pdf/06-Aiuto-Giocatore` (riepilogo regole da tavolo, **una sola pagina**, stesso
  sfondo/stile ma senza banner H1 pesanti — è un cheat-sheet, deve restare
  scannerizzabile a colpo d'occhio) sono comuni a tutta la campagna. Ogni episodio
  ha una sua sottocartella `pdf/Episodio N/`: `Indagine` (lettera d'incarico +
  taccuino), `Spedizione` (note tessera + segnalini), `Luoghi` (riferimenti per
  chi arbitra), `Soluzione (non aprire)` (sigillata, con avvertimento iniziale).
  Le carte stesse (dorso Approfondimenti, titolo Oggetti) non mostrano MAI il
  luogo/tessera d'origine, solo `Luoghi.pdf` lo dice.
- **`Luoghi.pdf` (`src/gen_narrator.py`):** una pagina per luogo più le tessere
  che nascondono un oggetto da Cercare. Stile scheda personaggio: arte del
  luogo/tessera fusa nello strappo trasparente reale di
  `artworks/background scheda personaggio.png` (la variante con lo strappo **in
  alto**, per opporsi visivamente alle schede eroe che usano quella in basso —
  vedi `torn_portrait(..., window=WINDOW_TOP)`), con numero/nome in alto a
  sinistra dell'arte e sotto, nella stessa colonna, una **descrizione densa e
  coinvolgente** della scena — non il testo terso della carta Luogo/Tessera, ma
  una versione più estesa e sensoriale (suoni, odori, temperatura, un dettaglio
  che stona), pensata per essere letta o improvvisata a voce da chi arbitra:
  stessi fatti e stesse battute di dialogo della carta, mai nuove informazioni
  o contraddizioni. Per le tessere con una regola in chiaro (prove NERVI,
  apparizioni) la frase meccanica va mantenuta **verbatim** dentro il testo
  arricchito, non riscritta. La colonna si auto-adatta in altezza (riduce il
  font finché non entra, vedi `fit_desc()`) così si può scrivere quanto serve
  senza contare le righe a mano. Sotto la riga separatrice, a piena larghezza,
  l'elenco essenziale — solo `Tipo — carta "Titolo"` per ogni Approfondimento/
  Oggetto di quel luogo/tessera, mai il loro contenuto: quello lo dice la carta
  stessa una volta trovata.
- **Tipi di carta completi:** Eroi, Nemici, Minacce, Luoghi, Indizi Nascosti,
  Testimoni, Referti, **Oggetti**. Luoghi e Indizi Nascosti riusano la stessa
  arte (stesso soggetto, due carte); Testimoni/Referti riusano l'arte del loro
  Luogo; **Oggetti hanno arte dedicata**, mai riusata (sono nature morte a sé,
  non scene). **Eroi** sono solo ritratto+ruolo+bio (zero meccanica, quella
  sta sulla Scheda Personaggio): servono a stendersi sul tavolo per la scelta
  del personaggio a inizio serata (vedi Regolamento, sezione "I PERSONAGGI")
  — non sono decorative, hanno uno scopo d'uso definito, non vanno trattate
  come orfane. Genera i nuovi mazzi con
  `node scripts/cardconjurer/generate-batch.js <gruppo>` (vedi `README.md`
  per la lista gruppi aggiornata).
- **Dove finiscono i file (`cards/`, `board/`, `reperti/`): stesso schema di
  `pdf/`.** Quello riusabile tra episodi (Eroi, Malavita) sta al livello
  comune (`cards/Eroi/`, `cards/Nemici/` — solo Sgherro/Sicario); tutto il
  resto del nuovo episodio va sotto una sua sottocartella, mai al livello
  comune: `cards/Episodio N/<Tipo>/`, `board/Episodio N/`,
  `reperti/Episodio N/`. In `cards-data.js` questo si imposta nel campo
  `file` di ogni carta (es. `` `Episodio ${N}/Luoghi/${...}` ``) — vedi come
  già fatto per l'Episodio 1 e per `NEMICI.forEach()`, che smista i nemici
  del culto in `Episodio 1/Nemici/` e lascia la Malavita in `Nemici/` in base
  al campo `type`.
- Tecnica: Python + reportlab, grafica vettoriale (sorgenti di riferimento nel repo:
  `src/deluxe_style.py`, `src/ornaments.py`, `src/gen_gothic.py`, `src/gen_docs.py`,
  `src/gen_deluxe.py`, `src/gen_narrator.py`).
  Illustrazioni raster generate con AI (vedi `PROMPT-MIDJOURNEY.md`) vanno inserite come
  arte di sfondo delle carte (cardconjurer) o come quadro/ritratto nei documenti,
  mantenendo cornici e testo vettoriali sopra.

## 3-bis. BIBBIA DI SCRITTURA (stile immersivo — obbligatoria)

Ogni testo deve far *vedere* la scena, non riassumerla. Regole:

- **Carte Luogo:** il testo d'apertura è un quadro di 3–4 frasi con dettagli
  sensoriali (odori, suoni, temperatura) e un dettaglio umano che stona o inquieta
  (la cena intatta sotto il panno, le mani nascoste dietro la schiena, lo sguardo
  che evita il vostro). I PNG parlano in discorso diretto tra virgolette basse «».
  Gli indizi restano fattuali e asciutti: l'atmosfera sta nel testo, la deduzione
  negli indizi.
- **Carte Minaccia:** sempre una riga di *flavor in corsivo* prima dell'effetto,
  massimo 12 parole, in seconda persona plurale, che colpisce un senso o insinua
  un dubbio (es. «Qualcuno pronuncia il vostro nome. Con la vostra voce.»).
  L'effetto meccanico segue, separato, senza aggettivi.
- **Tessere:** 2–3 frasi sensoriali sul luogo, poi l'eventuale regola in chiaro
  (prove, apparizioni) scritta in tono da regolamento. Non superare ~15 righe
  misurate a 8.3pt su 116mm di larghezza.
- **`Luoghi.pdf` (chi arbitra, non i giocatori):** stessi fatti e battute della
  carta Luogo/Tessera, ma **molto più estesi e sensoriali** — qui lo spazio non
  è tirato, la colonna si auto-adatta, quindi si scrive un quadro pieno: non solo
  odore/suono/temperatura ma anche un piccolo dettaglio che si muove o cambia
  durante la scena (un'ombra, un rumore che si ferma quando ci si ferma, una
  mano che trema), utile a chi arbitra per improvvisare risposte alle domande
  dei giocatori. Mai una nuova informazione o un indizio che non sia già sulla
  carta: solo più aria attorno agli stessi fatti. Le eventuali regole in chiaro
  (prove NERVI, danni, apparizioni) restano **testo verbatim**, mai
  parafrasate: sono meccanica, non atmosfera.
- **Schede eroe:** sezione «Chi sei» di 3 frasi: origine, ferita o svolta che li
  ha portati alla Società, un tratto o una battuta che li definisce. Niente
  elenchi: prosa in corsivo, seconda o terza persona coerente con le esistenti.
- **Nemici:** 2–3 frasi che li rendono persone o cose sbagliate, non mostri
  generici (gli Adepti sono «gente comune che alle 3 di notte smette di essere
  gente comune»). La debolezza del boss va integrata nel testo, tra parentesi
  le meccaniche. La Malavita (Sgherro/Sicario) è deliberatamente **senza** soprannaturale:
  niente cera, maschere o rituale — sono criminali comuni, il testo li tratta come tali.
- **Carte Approfondimento (Osservazione/Referto/Testimonianza/Presagio):** una riga o
  poche, tono coerente col verbo — Osservazione è un dettaglio fisico notato da Elena
  ("le mani tremano su un solo scaffale"), Referto è clinico/forense (voce di Attilio),
  Testimonianza è discorso diretto o riportato di chi parla, Presagio è sensoriale/
  occulto (voce di Sibilla, mai spiegato razionalmente). L'**Eco condivisa** è l'unica
  eccezione allo stile "fattuale": può essere più onirica/soprannaturale (un sussurro
  condiviso, una visione), perché è deliberatamente la stessa su ogni carta e serve a
  segnalarsi come "diversa" dal resto del testo della carta.
- **Carte Oggetto:** una riga di flavor (mai un dato di gioco, solo atmosfera —
  "freddo, pesante, già piegato da altre porte"), poi l'effetto meccanico copiato 1:1
  dalla fonte, senza aggettivi, come le Minacce.
- **Lettera d'incarico:** voce di M., tono trattenuto, un dettaglio concreto e
  vivido sulla vittima e una frase di non-detto (es. «C'è dell'altro, e non lo
  scrivo»). Chiude sempre con il budget di ore e l'elenco dei luoghi iniziali.
- **Epiloghi:** in discorso diretto del salvato/testimone, devono dare una
  risposta e aprire due domande.
- **Tono generale:** gotico ottocentesco, mai splatter; l'orrore è acustico e
  suggerito (suoni, vibrazioni, voci). Lessico d'epoca (palandrana, chiatta,
  sego, brigadiere). Vietati anglicismi e ironia fuori dai dialoghi.
- **Vincolo tecnico:** ogni testo va verificato contro lo spazio del suo riquadro
  (vedi il controllo con `Paragraph.wrap` usato in sviluppo); i testi estesi si
  tengono separati dai dati di gioco in un modulo dedicato come `src/story.py`.

## 4. CHECKLIST DI COERENZA (verifica prima di consegnare)

- [ ] Le 4 Domande sono tutte deducibili dai soli indizi **core** (senza Approfondimenti) e
      ogni risposta incrocia più luoghi?
- [ ] Almeno un dettaglio decisivo per 1-2 Domande (mai tutte e 4) emerge **solo** tramite
      Approfondimento, con la tecnica dell'Eco condivisa (stesso frammento su ogni carta)?
- [ ] Ogni eroe ha il suo verbo in Indagine (Elena/Attilio/Ottone+Carla/Sibilla/Nino) e
      qualunque coppia plausibile di eroi può sbloccare almeno un Approfondimento?
- [ ] Il mazzo Approfondimenti ha dorsi con SOLO il tipo (mai il numero del luogo né il
      contenuto)? Le carte Oggetto hanno solo il nome (mai il luogo/tessera d'origine)?
- [ ] Ogni oggetto trovabile (Indagine o Cercare) ha una carta Oggetto con arte dedicata,
      flavor breve ed effetto copiato 1:1 dalla fonte? C'è almeno un oggetto-esca?
- [ ] Ci sono false piste che reggono ma vengono smontate da un indizio trovabile?
- [ ] Il boss ha una debolezza scoperta durante l'indagine?
- [ ] Il Canto (o equivalente) ha due fonti di avanzamento (carte + automatico ogni 4°
      round) ed è spiegato per intero nel **Regolamento**, non solo nella Soluzione sigillata?
- [ ] Il tempo d'indagine è scarso e c'è un vincolo d'orologio? C'è l'oggetto-esca?
- [ ] La difficoltà segue la scala dell'episodio corrispondente (una-due manopole, non tutte)?
- [ ] Parole chiave in MAIUSCOLO e requisiti di sblocco stampati sulle carte?
- [ ] Le 20-23 carte Minaccia hanno tutte titolo unico, flavor proprio e icona di famiglia?
      Hai riusato Sgherro/Sicario (Malavita) invece di inventare nemici umani nuovi?
- [ ] I prompt Midjourney dei nuovi soggetti (inclusi eventuali nuovi Oggetti) sono stati
      aggiunti a `PROMPT-MIDJOURNEY.md`?
- [ ] Epilogo + Frammento numerato + aggancio + Bivio sigillato con conseguenze definite?
- [ ] Le conseguenze del Bivio dell'episodio precedente sono applicate all'inizio?
- [ ] Ci sono 2–3 reperti stampabili coerenti con gli indizi?
- [ ] Palette, font, sigilli, formati e dorsi identici alla bibbia visiva? Hai controllato
      che i caratteri usati coi font small-caps esistano davvero nel cmap (niente − o ♪)?
- [ ] Tutti i testi rispettano la bibbia di scrittura (flavor sulle Minacce,
      quadri sensoriali sui Luoghi, «Chi sei» sugli eroi) e stanno nei riquadri?
- [ ] Il file PDF 06 (Aiuto-Giocatore) è aggiornato e sta ancora su una sola pagina?
- [ ] `Luoghi.pdf` esiste per il nuovo episodio, con una pagina per luogo (più le
      tessere che nascondono un oggetto) e descrizioni dense e coinvolgenti (non il
      testo terso della carta) per ognuno, elenco Approfondimenti/Oggetto corretto?

---

**La mia richiesta:** _(scrivi qui, es.: «Genera l'Episodio 2, "Le voci del pozzo",
completo di tutti i PDF» oppure «Crea un sesto eroe» o «Progetta il finale di campagna»)_
