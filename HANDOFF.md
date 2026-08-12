# Handoff — dove siamo

> A cosa serve: se la sessione muore, questo file basta a riprendere senza
> ricostruire niente. Si aggiorna a ogni commit. Qui c'è **dove siamo**, cosa
> gira e il prossimo comando; il *cosa fare* di un lavoro in corso sta nel suo
> piano.

**Aggiornato:** 12/08/2026 · ramo `main` · in produzione la versione `fde3b495`
su <https://roccamora.smartcores.org> — l'**audit delle classi**
(`AUDIT-CLASSI.md`) e le **tre abilità di Spedizione** che il motore digitale
stampava e non applicava.

## Cos'è successo, in ordine

Quattro lavori chiusi uno dopo l'altro. I primi tre sono online; il quarto è
arte/stampa/contenuto, non tocca il sito.

**1. Account, tavoli e salvataggi** (spec `DESIGN-ACCOUNT-E-SALVATAGGI.md`).
Il sito è chiuso da Cloudflare Access: si entra con un **codice via email**
(One-time PIN, non Google — la barriera è la lista di indirizzi, e Google
avrebbe richiesto un client OAuth). I salvataggi stanno su D1 per **tavolo**,
si gioca anche senza rete e una coda sincronizza quando torna la linea; se la
stessa partita è andata avanti in due posti l'app non sceglie, mostra le due e
decide chi gioca. Si può creare ed eliminare un tavolo dall'elenco.

**2. Il fascicolo** — lo stile (mockup in `webapp/public/mockups/stile/`, otto
schermate, sono la specifica). Tutto ardesia scura tranne ciò che nella
finzione è carta: lettera d'incarico sulla texture del manuale e scritta a
mano, reperti, carte, stampe dei ritratti, i campi dove scrive il gruppo, le
facce dei dadi. Home come schedario, ore come registro barrato, sigillo di
ceralacca sulla busta della soluzione. **La mappa della plancia è l'eccezione
dichiarata**: turchese «puoi andare», oro «rivela», rosso «nemico» restano
segnali imparati al tavolo.

**3. Si installa come un'applicazione** (piano in
`~/.claude/plans/andiamo-con-il-fascicolo-cheeky-fern.md`). Icona col sigillo,
dodici immagini di avvio, nessuna barra del browser, comportamenti al tocco da
app. **Niente service worker**: serve la rete per aprirla. Lo zoom a pizzico
resta, e lo scorrimento pure — c'è un test che lo misura.

**4. Arte, stampa e tessere** (commit `cc41ee21`, `bd42c102`, `61caecbc`).
Generazione Midjourney autonoma di `scripts/midjourney-artwork.mjs`: da 604 a
388 artwork mancanti, **poi ferma** — Fast Hours esaurite, tornano il
09/09/2026 (l'account segnala l'esaurimento con un submit che non restituisce
job_id, non un errore di rete: vedi il commento in cima allo script).
Corretto un bug reale nello script (`--raccogli` controllava solo
`0_0.png`: se quella singola variante andava 404 il job restava «in attesa»
per sempre anche se le altre 3 erano pronte da tempo). Aggiunto
`--solo-mancanti` a tutta la pipeline (`generate-batch.js`,
`generate-tiles.js`, `generate-print-sheets.js`, `generate-reperti.js`,
`build-all.sh`): build incrementale invece di rifare tutto ogni volta.
Grafia manoscritta (`La Belle Aurore`, gia' scaricata, mai usata) sul corpo
delle 21 lettere d'incarico (Preludio + Ep.1-20); la chiusa pratica resta nel
corsivo tipografico. **Tessere di Spedizione composte per Ep.10-15**
(`generate-tiles.js` sapeva fare solo Ep.1/2, dati hardcoded): arredi
personalizzati per ambientazione (letto in camera, moli sui canali, stufa al
comignolo, scrivanie negli studi...), tutti dai 12 arredi gia' disponibili —
nessuna arte nuova generata per questo. Aggiunte le chiavi `armadio`/
`toeletta` alla libreria arredi (servono a Ep.16, arte non ancora fatta).
`webapp/assets/` gia' esportato in locale con le tessere nuove, **non
deployato**: chi riprende decide se e quando pubblicare.

**5. Tre correzioni dal tavolo** (11/08/2026). L'eroe **scivola** da una casella
all'altra come i nemici, con un passo più svelto (340ms contro 600, e 1s al
tavolo: la lentezza del nemico serve a far vedere da dove arriva). Durante il
turno dei nemici **non si accendono più** le caselle turchesi dell'eroe. E la
prova «leggere la scena» **non si tira più entrando** in un luogo: si tira solo
se il gruppo vuole un Approfondimento, la tira chi può cavarlo (scelto fra gli
idonei), e fallendo **la carica non si spende** ma lì si è chiuso — si esce e si
rientra, un'altra ora. Regolamento e Aiuto Giocatore riscritti di conseguenza
(`src/gen_docs.py`, PDF rigenerati). La **Spedizione nasce a schermo pieno**: il
modo immersivo e' il default (si spegne dal ⤢ e la scelta resta scritta), e il
layout vale solo dove c'e' la plancia — ingresso ed epilogo sono testo e devono
scorrere.

**6. Audit dei testi** (referto in `AUDIT-TESTI.md`, commit `e592766c`). Lette
tutte le 972 carte e tutta la prosa dei 21 episodi. Corretto: **DESTREZZA** e
**FORZA**, che caratteristiche non sono (10 carte, più la nota che il
Regolamento doveva fare per smentirle); «verso Nord» in cinque episodi che il
Nord non lo dichiarano; 67 accenti scritti con l'apostrofo in **tutte e 11 le
biografie degli eroi**, che l'app stampa nel riquadro «chi sei»; la sigla
d'arbitro «PNG» in dieci testi dei giocatori; il corsivo rovesciato su sei
carte nemico dell'Ep. 1, con tre regole finite nel blocco della finzione. E la
frase segnalata dall'autore — «un freddo d'acqua nera risale i condotti» — che
aveva perso il sostantivo: il testo d'origine dice «una **corrente** più fredda
delle altre», ed è anche il titolo della carta. **153 fascicoli rigenerati.**
Barriera: `webapp/test-testi.mjs`, 13 sonde. Restano all'autore due cose (§7 del
referto): i due oggetti omonimi e le 99 divergenze fra fascicoli e carte.

**7. Audit del bilanciamento fra le classi** (referto `AUDIT-CLASSI.md`,
12/08). *Il gioco è giocabile con ogni combinazione di eroi?* In **Indagine
sì**: nessuna delle 330 squadre è chiusa fuori da un contenuto — le 4 Domande
hanno tutte una fonte core, verificata episodio per episodio — ma la ricchezza
va da 1,9 a 4,8 Approfondimenti a episodio (×2,6). In **Spedizione no**: 1200
partite misurate dicono 54% per la squadra di ferro contro 33% per quella di
vetro, monotòno nel VIGORE e senza inversioni, con quattro episodi (9, 11, 15,
19) di fatto chiusi a chi non picchia. Trovato e corretto un difetto del
pilota: l'ordine del party contava (il motore piazza gli eroi in quell'ordine),
e ora si rimescola a ogni partita. Due strumenti nuovi:
`webapp/misura-classi.mjs` e `webapp/misura-indagine-classi.py`.

**8. Le tre abilità accese** (stessa giornata, referto `AUDIT-CLASSI.md` §7).
Voce ferma di Serra, Esca preziosa di Carbone e Colpo da macello di Ottone
ora il motore digitale le **applica**: prima spendevano carica e azione e non
facevano niente. Riaperte agli indizi core anche le due parole dell'Ep. 9 che
stavano dietro un Approfondimento. Rimisurato: **il divario fra la squadra
senza VIGORE e quella tutta VIGORE scende da 21 punti a 7**, e l'Ep. 19 esce
dalla lista degli episodi chiusi. Barriera: `webapp/test-abilita.mjs`.
Corretto anche `webapp/server.js`, che sotto i banchi moriva per `EMFILE` e
faceva risultare 0% gli ultimi episodi di una corsa lunga.

## Come si riprende

```bash
node webapp/server.js                 # l'app in locale, porta 8017
python webapp/export-data.py && node webapp/export-data.js   # dopo modifiche ai dati
python webapp/export-assets.py        # dopo carte/tessere/arte nuove; fa anche le icone
./webapp/deploy.sh                    # pubblica (da Git Bash)
```

Per gli endpoint dei salvataggi e per i **membri** servono due `wrangler dev`
(l'isolamento fra account non si prova con un utente solo):

```bash
./webapp/build-dist.sh
npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788
node webapp/test-api.mjs && node webapp/test-membri.mjs
```

**Due cose che costano un'ora se non si sanno.** `build-dist.sh` svuotava
`dist` cancellandola: il primo `wrangler dev` la tiene aperta e il secondo
moriva sul proprio build — la procedura qui sopra non poteva funzionare, ed è
stata corretta. E **`wrangler dev` non ricarica il Worker** quando cambia
`webapp/worker/*.js`: per provare una modifica all'API va riavviato, altrimenti
si misura il codice di prima e si crede di aver verificato qualcosa.

**I controlli**, tutti verdi tranne dove detto:

| | cosa guarda |
|---|---|
| `test-stile` | il tema vecchio non sopravvive (ori, pergamena fuori posto, angoli tondi) e ogni testo sta sopra 4.5:1 — 7 schermate, 232 testi |
| `test-nativa` | ogni icona dichiarata **esiste ed è della misura promessa**, e le pagine lunghe **scorrono** |
| `test-testi` | i refusi che l'audit ha già visto una volta non tornano: accenti con apostrofo, «quale è», articoli davanti a s impura, sigle d'arbitro nella finzione, statistiche inesistenti, carte mozze |
| `test-zoom` | la carta si apre a tutto schermo e si richiude: misura che l'immagine sia DAVVERO più grande, non che l'overlay esista |
| `test-conferma` | le domande irreversibili si chiedono dentro il gioco: è l'unico che NON sostituisce `window.confirm` |
| `test-abilita` | le abilità di Spedizione **agiscono** invece di essere narrate (esca, colpo da macello); vuole il server acceso |
| `test-api`, `test-sync`, `test-access`, `test-account-ui` | salvataggi, coda, JWT, tavoli |
| `test-membri` | **l'ACL dei membri**: chi entra al tavolo di un altro, chi cancella cosa. Provato non vacuo: aprendo il buco su `DELETE /api/tavolo` il test lo dice |
| `test-partite` | 42 giocate intere in modalità **tavolo**, dall'ingresso alla vittoria — l'unico che copre `spedizione.js` end-to-end |
| `test-ui`, `test-digitale*`, `test-engine` | il gioco (i banchi di misura del bilanciamento) |

**Gli strumenti di misura** (non sono test: non danno OK/KO, danno numeri):

| | cosa misura |
|---|---|
| `misura-episodio.mjs epN N` | un episodio giocato davvero. `PARTY=` fissa la squadra; l'**ordine** si rimescola comunque a ogni partita, ed è voluto (vedi BILANCIAMENTO 12/08) |
| `mappa-pilota.mjs` | tutti i 21 episodi, in parallelo — quando si tocca il MOTORE |
| `misura-classi.mjs` | 5 squadre estreme × N episodi: **quanto pesa la composizione** |
| `misura-indagine-classi.py` | l'Indagine su tutte e 330 le squadre — il pilota l'Indagine non la gioca |

## Fase 1 chiusa: il motore puro

**Il cancello è passato.** `webapp/MAPPA-DOPO-MOTORE.md`: bias medio −3.3 punti
su 21 episodi (0.9 σ, non significativo), 14 episodi su 21 entro 10 punti. I
tre che si muovevano di oltre 25 in giù sono stati rimisurati sul commit della
baseline con una lettura fresca, e lo scarto vero è −5, −10, −10: il salto era
della baseline, non del motore.

**`webapp/test-motore-partita.mjs` è la prova che tutto questo serviva a
ottenere:** una spedizione intera che comincia, avanza e finisce **senza un
browser, senza un DOM, senza `digitale.js`** — solo `applica()`. Gira su tutti e
ventuno gli episodi. È lo stesso ambiente di un Durable Object, quindi la Fase 4
è possibile. E due partite con lo stesso seme sono identiche fino all'ultimo
byte, compreso il diario riga per riga.



Spec `DESIGN-VISTA-EROE.md`, piano `PIANO-MOTORE-PURO.md`. Si estraggono le
regole di Spedizione da `digitale.js` in `webapp/public/motore/`, pure e
isomorfe, perché le stesse girino nel browser dell'arbitro, sul telefono di un
giocatore e domani in un Durable Object. **A schermo non cambia niente.**

**`digitale.js`: da 2495 a 1674 righe, e non contiene più nessuna regola di
Spedizione.** Otto moduli fuori, tutti collegati, tutti verdi.

| modulo | rete |
|---|---|
| `motore/rng.js` | comportamento; 4 sabotaggi catturati |
| `motore/griglia.js` | differenziale, 30000 confronti |
| `motore/stat.js` | differenziale, 26400 confronti |
| `motore/regole.js` | comportamento sui dati veri dei 21 episodi |
| `motore/obiettivi.js` | differenziale, 15600 confronti — ritorno **e** stato |
| `motore/vittoria.js` | comportamento; 5 sabotaggi catturati |
| `motore/minaccia.js` | differenziale, 5040 confronti sui 21 episodi |
| `motore/nemici.js` | differenziale, 525 turni; esca 113, flash 241, PNG 103 |

`engine.js` è passato da 315 a 92 righe: tiene solo l'html-lite, le frasi delle
piste fredde e i percorsi dei jpg, e ri-esporta il resto, così `indagine.js`,
`spedizione.js` e `digitale.js` non cambiano una riga.

**Il danno era scritto tre volte** — nel piano quando tira l'app, dentro
l'animazione quando tira il tavolo, e una terza copia per chi salta
l'animazione. Ora è uno solo, in `nemici.js`.

**Il caso arriva da fuori**, come `caso.scegli(n)` e `caso.tira2d6()`. Oggi
`digitale.js` passa `Math.random` (il `CASO` in cima al file), cioè esattamente
com'era; col contratto `applica()` basterà passarne un altro perché una serata
si rigiochi identica.

### Il contratto c'è, ma non è ancora collegato

`motore/comandi.js` — `applica(stato, comando, dati) → { stato, eventi,
pendenza, rifiuto }` — con `motore/azioni.js` sotto. Fa già `muovi`, `cerca`,
`rianima`, `attacca`, `finisci-eroe`, `rispondi`. Tre garanzie provate:
`applica()` non muta l'ingresso, un comando illegale ha la ragione in chiaro
(niente `flash`), ogni evento sopravvive a un giro di JSON perché dovrà passare
da un WebSocket. **La pendenza** — oggi il solo Colpo da macello di Ottone —
vive in `stato.pendenza`: chi ricarica la ritrova, mentre una promise
interrotta perdeva il turno.

`dadi.js` accetta `facce: [d1, d2]`: l'overlay mette in scena un tiro già
deciso invece di deciderlo.

**Il nodo del tavolo, sciolto.** A schermo il motore tira col seme e l'overlay
anima le facce. Al tavolo i dadi sono di legno: il tiro deve arrivare *prima*
del comando, ma l'overlay vuole mostrare soglia e bonus, che il motore decide
mentre esegue. `provaDi(g, comando)` li dichiara **senza tirare** — e perché non
diventi una seconda copia delle regole, **la usano anche i risolutori**:
`cercare` e `attacca` non ricalcolano soglia e bonus, li chiedono a lei. Chi
dichiara e chi risolve leggono la stessa riga.

**Collegati:** muovere, cercare, rianimare, attaccare, finire il turno. La vista
manda un comando e mette in scena gli eventi; la pendenza di Ottone si scioglie
con un overlay e un `rispondi`. Misurato A/B al tavolo (N=10): 30% prima, 30%
dopo, con metà degli stalli.

**Una trappola da ricordare:** `applica()` restituisce uno stato *nuovo*, ma
`aggancia()` cattura `const sp = SP()` e lo usa nei gestori. Sostituire gli
oggetti farebbe scrivere quei gestori su uno stato scartato, e il click
andrebbe perso **senza errore**. Perciò `esegui()` *travasa* con `Object.assign`
invece di sostituire. Chi collegherà le prossime azioni deve fare lo stesso.

**Tutte le azioni dell'eroe sono dentro il contratto.** Muovere, cercare,
rianimare, attaccare, finire il turno, usare un'abilità, interagire, usare un
oggetto. `digitale.js` è a **1453 righe** (2495 all'inizio della fase) e non
contiene più nessuna regola di Spedizione.

Due cose sono cadute per strada, ed erano fra gli ostacoli elencati nel piano:

- **`escaModo` non è più un mezzo turno salvato.** L'Esca era a due tempi: «usa»
  accendeva le caselle e la carica si spendeva toccandone una, con lo stato
  intermedio *dentro il salvataggio* — chi chiudeva la pagina lì riapriva una
  partita a metà gesto. Ora la casella si sceglie prima e il comando è uno solo.
- **Legalità e didascalia si sono separate.** `interazioneDisponibile`
  restituiva anche la `label` del bottone: la regola sapeva come si scrive in
  italiano quel che permette. Ora torna il solo fatto, e la frase la compone
  `etichettaInterazione` nella vista.

## Fase 2 fatta: il tavolo smette di divergere

**`test-partite.mjs` è tornato a funzionare.** Falliva su tutti e 42 gli
scenari, e da prima della Fase 1: aspettava `window.confirm` per aprire la
busta, mentre le domande irreversibili sono passate dentro la finzione
(`chiedi.js`, il sì è su `[data-si]`). Si piantava lì, prima ancora di entrare
in Spedizione — cioè **la modalità tavolo era senza copertura end-to-end**, ed
è l'unico test che gioca `spedizione.js` dal primo click all'ultimo. Adesso è a
9 falliti su 42, e la Fase 2 ha una rete.

**I 9 restanti sono un difetto del test**, non del gioco: conta tutti i
`.ko-txt` della pagina per sapere quante risposte sono state bocciate, e il
riepilogo del vantaggio ne aggiunge uno oltre alle quattro delle Domande.
Vanno contati quelli dentro il riquadro delle risposte.

**La Fase 2 non era quello che il piano diceva.** `spedizione.js` tiene i nemici
come **registro senza coordinate** (`{nome, num, ferite, max}`): il motore
posizionale — griglia, pathfinding, `nemici.js` — non ci si applica. Si
unificano le regole non-posizionali, ed è fatto.

**Corretto un difetto vero del tavolo:** non piazzava **cinque famiglie di
nemici**. La lista dei nomi era scritta a mano e si fermava a otto; gli episodi
3, 4, 5, 6 e 8 usano anche Voce Cava, Claque, Confratello, Corista, Mastino, e
**24 punti** fra carte Minaccia e testi di tessera dicevano «Piazzate 1 Voce
Cava», «Piazzate 1 Mastino» senza effetto. Ora la lista si deriva da `ep.pool`
come nel digitale: riconoscimenti da 185 a 209, contati sui dati veri. Insieme
se n'è andato un secondo difetto — «due mastini» piazzava **zero**, perché la
vecchia espressione catturava solo cifre e `Number('due')` è `NaN`.

Unificate anche `fascia`, `feriteMax` (identiche) e `saluteMax` (che dal motore
prende `ep.salute_extra`: inerte oggi, nessun episodio lo dichiara).

**Tre cose NON unificate, e ognuna con la sua ragione:**

- **`tettoCanto`** — il tavolo usa `marea.soglia`, il motore `canto_max`. Tocca
  un episodio solo, il **preludio**, dove il tavolo ferma il Canto a 3 e il
  motore lo porterebbe a 8. È una scelta di design, non una duplicazione: va
  decisa, non dedotta.
- **`CARICHE_SPED`** — struttura diversa (`effetto` invece di `eff`, niente
  `nota`). Unificarla significa toccare `abilitaHtml`: rischio sulla vista in
  cambio di niente.
- **`primo`** — quella del tavolo fa `esc()`, quella del motore no. Unificarla
  senza aggiungere l'escape ai chiamanti aprirebbe un buco.

**Ancora da fare:** i 9 falliti di `test-partite` (difetto del test, vedi
sopra), e la decisione sul `tettoCanto` del preludio. `riproduci()` in
`replay.js` resta sconsigliato: userebbe sei dipendenze della vista per muovere
venticinque righe.

### Come è stata provata (e come provare la Fase 2)

I differenziali contro l'oracolo hanno fatto il loro lavoro e sono stati
**rimossi a fase chiusa** — erano impalcatura, non una suite. Il metodo però
serve identico per la Fase 2, e vale la pena averlo scritto:

1. **Differenziale contro l'oracolo**: si estrae il file *com'era* da git in
   `webapp/public/js/_oracolo.js` (accanto agli originali, o i suoi import non
   risolvono) e gli si appende un export con le funzioni interne da confrontare
   — senza quello metà dei confronti passa a vuoto. Poi si confrontano le due
   versioni su migliaia di stati generati.
2. **Dove le funzioni mutano, si confronta il ritorno *e* lo stato che
   lasciano.** Una che torna gli annunci giusti sporcando `compiti` o `canto`
   in modo diverso passerebbe un confronto sul solo ritorno, e sposterebbe il
   bilanciamento in silenzio.
3. **Dove il caso decide** — il turno nemici — si fa consumare a vecchio e nuovo
   **la stessa lista di numeri**: `Math.random` dirottato da una parte, il `caso`
   iniettato dall'altra. Funziona perché l'ordine dei consumi è identico.
4. **Il test va poi rotto apposta.** È il passo che ha reso di più. Ogni volta
   ha pescato qualcosa: due test che passavano a vuoto (il tick del Canto
   provato al 4° round quando l'Ep.1 batte ogni 6; il filtro delle carte Bivio
   provato sull'unico episodio che Bivi non ne ha), un ramo morto vero
   (`spawnRegex` costruisce un'espressione per il boss ma itera su `ep.pool`,
   dove il boss non c'è in nessuno dei 21 episodi), e due difetti introdotti da
   me che nessun test verde avrebbe mostrato.

### Quanta varianza ha il pilota

Molta più di quanto la mappa lasci credere. Misurato facendo girare **lo stesso
identico commit** (`3aac1e51`) due volte:

| episodio | prima lettura | seconda lettura |
|---|---|---|
| Ep.1 | 55% | 50% |
| **Ep.19** | **15%** | **35%** |
| **Ep.4** | **30%** | **17%** |

Venti punti di scarto a N=20, senza che una riga sia cambiata. L'Ep.1 oscilla
fra 0% e 55% su campioni piccoli, e l'Ep.12 ha dato 63% a N=8 e 90% a N=20.

Tre volte in questa fase un numero basso ha fatto sospettare una regressione —
Ep.12 al 63%, Ep.19 al 55%, Ep.4 a 0/6 — e tutte e tre le volte l'A/B ha
mostrato che era rumore. **Nessun allarme di questa fase si è rivelato vero.**
Il che non vuol dire ignorarli: vuol dire misurarli prima di crederci.

**Conseguenze pratiche.** Un allarme a N<20 non è un dato. Un singolo episodio
che si muove di 20 punti non è una regressione. Per stabilire se qualcosa è
davvero cambiato serve un A/B a N=20 **sullo stesso momento**, in un
`git worktree` col server su un'altra porta (`node webapp/server.js 8018`) —
ricordando che il worktree non ha `webapp/data` né `node_modules`: vanno
copiati o linkati. E il cancello di fine fase non può essere «nessun episodio
si muove di 20 punti»: quella soglia la sfonda il rumore da solo. Va letta la
**media degli scarti su tutti e ventuno**, che il rumore per episodio tende a
compensare.

**Il motore sta sotto `public/`** e non accanto a `webapp/`: l'import relativo
deve risolvere sia per node (filesystem) sia per il browser (HTTP, root del
server su `public`). Con la cartella fuori i test node passano e la pagina
muore in silenzio. Effetto gradito: `build-dist.sh` non va toccato.

**La barriera:** `test-motore-purezza.mjs` scandaglia tutta la cartella e
rifiuta DOM, timer, storage, rete e `Math.random`. Vale anche per i moduli che
verranno, senza doverselo ricordare.

**L'oracolo dei differenziali:** `bash webapp/rigenera-oracolo.sh` — copia
`digitale.js` com'era prima dell'estrazione e gli appende l'export `_diff` con
le 65 funzioni interne da confrontare. Gitignorato, impalcatura: si cancella a
fine Fase 1.

**Due avvertenze pagate care, il 12/08:**

1. **Una misura lunga non gira mentre si tocca il codice che misura.** Due
   baseline da 420 partite buttate; la seconda aveva l'import rotto a metà
   corsa e ha prodotto 17 corse NON VALIDE su 21 con scarti fino a −85 punti.
   Sembravano crolli del bilanciamento, erano una pagina che non caricava.
   Prima di `mappa-pilota.mjs`: `git status` pulito, e nulla si tocca finché
   non finisce.
2. **Gli stalli del pilota sono preesistenti.** Misurato su commit anteriori a
   questo lavoro: l'Ep.1 dà già 3 partite in stallo su 8, quindi la corsa
   risulta NON VALIDA. Lo stallo è il pilota che non trova come proseguire, non
   il gioco che si rompe. Il cancello della fase non è «zero stalli» ma «non più
   stalli della baseline».

## Quello che resta

1. **Durata sessione Access a 1 month**, sull'applicazione **e sul criterio**
   (quella del criterio prevale). È ancora a 24 ore: ogni browser richiede il
   codice ogni giorno. È l'unica cosa che pesa davvero, e si fa in un minuto.
2. **`test-engine`: 536 controlli falliti**, e non è una regressione — sono
   **buchi di contenuto** che erano nascosti. Il test salta un episodio quando
   la sua cartella esportata non esiste: creandola, l'export ha smesso di
   saltare. Mancano ~52 arti di luogo e le carte che le usano.
3. **Tessere di Spedizione**: ci sono per Ep. 1, 2 e 10-15. Mancano a
   **Preludio, Ep. 3-9 ed Ep. 16-20** — sulla plancia a schermo quelle caselle
   restano vuote. L'arte di sfondo (T1-T6 per episodio) manca ancora, non lo
   script: appena l'arte c'è, basta lanciare
   `node scripts/tiles/generate-tiles.js epN` (serve prima aggiungere
   `TILES_EP<N>` in `scripts/tiles/generate-tiles.js`, stesso schema di
   Ep.10-15 se la disposizione e' una catena lineare T1..T6).
4. **Generazione Midjourney**: riprende da sola il 09/09/2026 (Fast Hours) con
   `node scripts/midjourney-artwork.mjs --vai --limite 6`, poi si scelgono le
   varianti a occhio con `--scegli`. 388 artwork ancora mancanti.
5. **Arredo `armadio`/`toeletta`**: chiavi gia' in `ARREDO_KEYS` e nel prompt
   condiviso, arte non generata — senza, le tessere di Ep.16 (quando arriverà
   la loro arte) avranno un'icona mancante su quei due arredi.
6. Da provare quando capita: una **serata vera**, e la partita **ripresa da un
   altro dispositivo**.
7. **I nove oggetti personali degli eroi** (la lente di Elena, i sali di Marn,
   i gessetti di Sibilla, il rampino di Nino, il fiasco di Ottone, la macchina
   fotografica di Carla, il laudano di Serra, la stola di Marani, la toga di
   Brera) sono mostrati nella scheda e **mai applicati** in modalità digitale.
   Le tre *abilità* morte sono state accese il 12/08 (`AUDIT-CLASSI.md` §7);
   gli oggetti no, perché quattro dei nove sono **reazioni** — vanno offerte
   nel mezzo di un tiro altrui, e come chiederle senza spezzare la scena è una
   scelta di regia da prendere col committente. La modalità tavolo non c'entra:
   lì li applica chi gioca, ed è dichiarato nel codice.
8. **Ep. 9, 11 e 15 restano chiusi a chi non picchia** (0-5% con VIGORE 4,
   25-35% con VIGORE 10). Chiedono tutti la stessa cosa — fermare qualcuno in
   fretta — e nessuno offre una strada che non sia la mischia. È una leva di
   struttura, non di taratura: `AUDIT-CLASSI.md` §6.4.

## Cose sapute che il codice non dice

- **`test-engine` misura l'EXPORT, non il repo**, ma scrive «jpg mancante».
  Sono due cose diverse — «non è stata fatta» contro «non è stata copiata nel
  web» — e la confusione mi ha fatto proporre un lavoro già fatto: di 16 carte
  «mancanti» solo 4 lo erano davvero, le altre 12 volevano solo l'export.
- **Le icone dell'app sono derivate e gitignorate**: chi pubblica senza aver
  lanciato `export-assets.py` manda online un manifest che punta a file
  inesistenti. `test-nativa` lo prende.
- **`OSR_DEV_EMAIL` non deve mai entrare in `wrangler.jsonc`**: salta la
  verifica del token. Esiste solo come `--var` di `wrangler dev`, e c'è un test
  che controlla che non sia finito in configurazione.
- **`chiedi.js` obbedisce a un `window.confirm` sostituito.** Serve ai banchi
  headless, che altrimenti resterebbero appesi a un bottone che non sanno di
  dover premere — ed è il motivo per cui `test-conferma` esiste: senza, la
  finestra del gioco potrebbe non comparire a nessuno e i banchi resterebbero
  tutti verdi.
- **`compatibility_date` sta a `2026-08-08`**: il workerd di wrangler 4.120.0
  non conosce date più recenti e `wrangler dev` non parte.
- **Il ricaricamento a caldo di `wrangler dev` non è istantaneo**: provando un
  guasto deliberato, il test parte contro il codice vecchio e sembra vacuo un
  test buono. Aspettare che il comportamento cambi, non che il server risponda.
- **Il deploy può fallire con `ECONNRESET` a metà upload** senza che nulla sia
  rotto: è la rete (sospetto la VPN). Si rilancia e basta. Con molti file nuovi
  l'upload arriva a dieci minuti.
- **I sorgenti scrivono per ReportLab, la webapp legge HTML.** `rendi()` in
  `engine.js` accetta solo `b|i|br` e il resto lo mostra scritto: quando le
  lettere sono passate a `<font name="OldStd-Italic">`, il tag è finito a
  schermo sull'iPad. La traduzione sta in `dump()` di `export-data.py`, unico
  punto da cui passano tutti i JSON; `test-engine` controlla che nei dati non
  resti nessun tag fuori dalla lista.
- **`webapp/dist` e' una copia, e una copia si scorda.** Pubblicando con
  `wrangler deploy` a mano invece di `deploy.sh` e' andata online la dist
  vecchia: correzione committata, banchi verdi, e sull'iPad il difetto ancora
  li'. Ora `wrangler.jsonc` ha `build.command`, quindi la cartella si
  riassembla da sola a ogni deploy, anche saltando lo script.
- **Il riquadro della carta non taglia: rimpicciolisce.** Per questo un testo
  troppo lungo non si vede mai come testo mancante — si vede al tavolo, di
  sera, come testo che non si legge. Misure sul render (riquadro 392 px su
  2010 px per 68 mm): 6 righe/~450 caratteri = 6,2 pt · 7 righe/~530 = 5,4 pt
  (il limite comodo) · 8 righe/~600 = 4,7 pt · 15 righe/~1550 = 2,5 pt. Il
  tetto sta in `STA_SULLA_CARTA` (sync-cards-data.py) e in test-testi.
- **Il fascicolo e la carta non devono coincidere.** `sync-cards-data.py`
  riporta sulla carta le correzioni del fascicolo, ma sopra il tetto le
  dichiara e non le scrive: la carta è per costruzione la versione condensata.
  Dodici divergenze restano aperte per questo, ed è lo stato giusto.
- Database D1: `ombre-salvataggi`, id `b0a85d9c-e7a6-4c3b-8940-1a50ad87fee2`.
  Access: team `smartcores`, destinazioni Worker + nome host pubblico.
