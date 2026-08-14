# Handoff — dove siamo

> A cosa serve: se la sessione muore, questo file basta a riprendere senza
> ricostruire niente. Si aggiorna a ogni commit. Qui c'è **dove siamo**, cosa
> gira e il prossimo comando; il *cosa fare* di un lavoro in corso sta nel suo
> piano.

**Aggiornato:** 13/08/2026 · ramo `main` · in produzione la versione `55ecc1ea`
su <https://roccamora.smartcores.org> — **i Bivi di campagna** (venti scelte che
cambiano davvero le regole degli episodi seguenti), il **Taccuino di Campagna**
e l'**epilogo per esteso**. Tabella `scelte_campagna` applicata al remoto.

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

**9. Arte degli episodi 2-7** (13-14/08). Comprate Fast hours e generati **156
artwork**: mancanti da 388 a 232. Chiusi Preludio, Ep.2, 3, 4, 5, 6 e quasi
tutto l'Ep.7. Carte, fogli di stampa, PDF e `webapp/assets` rigenerati per
tutti. **Le Fast hours sono di nuovo finite** (rinnovo 09/09/2026): dell'Ep. 7
restano fuori 11 soggetti — le 8 tessere, la copertina, `Lettera di Minaccia` e
`Fune di Servizio`. Il sintomo dell'esaurimento è sempre lo stesso: il submit
non restituisce `job_id`.

Trovato e scritto ciò che nessun `.md` aveva: **Ansaldo**, il PNG scortato del
Preludio, dichiarato in `webapp/data/preludio.json` e senza prompt da nessuna
parte (per questo il conteggio via prompt dava il Preludio completo). Stessa
situazione per **Nina** (Ep. 16) e disallineamento di nome per **Fava** (Ep. 7:
i dati chiedevano `Fava.png`, prompt e miniatura producono `Ernesto Fava.png`).
Sistemati entrambi: il prompt di Nina è scritto, `webapp/export-data.py` punta
al nome giusto e il foglio token dell'Ep. 7 ora stampa la pedina di Fava (prima
la saltava in silenzio). Nella coda di generazione sono entrati anche i due
arredi mancanti, `armadio` e `toeletta` (servono alle tessere dell'Ep. 16):
avevano la descrizione ma non il nome file, quindi restavano «orfani».

Tre difetti veri nei generatori, tutti dello stesso tipo — *artefatto prodotto
senza la sua arte, e `--solo-mancanti` che poi lo dà per fatto per sempre*:
`generate-batch.js` faceva carte col buco al posto del ritratto,
`generate-tiles.js` tessere vuote con solo la griglia (e riquadri vuoti per gli
arredi senza arte), `generate-print-sheets.js` lasciava caselle vuote nei
fogli. Ora saltano e lo dicono. E **i fogli di stampa non esistevano per gli
episodi 3-20**: i mazzi erano elencati a mano fino a `EP2_*`, quindi il bucket
risultava vuoto e il PDF veniva «saltato» senza che nulla sembrasse rotto.

Il Preludio in app mostrava la mini-spedizione **senza tessere**: riusa T1/T2/T4
dell'Ep. 1 (scelta di `gen_preludio.py`), ma `/assets/Preludio/board/` non
esisteva. `webapp/export-assets.py` ora le copia.

**Tessere per tutti e 20 gli episodi.** `generate-tiles.js` conosceva solo
ep1/ep2/ep10-15 (dati scritti a mano) e sugli altri usciva con «set
sconosciuto»: dodici episodi non hanno mai avuto le tessere di Spedizione. Ora
chi non ha una voce a mano legge id, nomi, uscite e arredi da
`webapp/data/ep<N>.json`, che li esporta già da `src/gen_ep<N>.py` — nessun
dato duplicato da tenere allineato. Ep.1/Ep.2 restano scritti a mano (nomi e
nomi-file d'arte propri, cambiarli vorrebbe dire rigenerare tessere già
stampate). **Fatte le 26 tessere di Ep.3, 4, 5 e 6**; Ep.7-9 e 16-20 aspettano
solo lo sfondo d'arte e lo dicono tessera per tessera. `build-all.sh` ora gira
su tutti e 20.

Aggiunta una sezione `[luoghi]` in `scripts/midjourney-coda.txt` (niente
`--sref`): sui soggetti che vietano le figure l'ancora — che è una scena
abitata — riempiva tutte e 4 le varianti di gente con la lanterna.

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

**`test-tavolo-do` vuole un server solo**, non due: due `wrangler dev` hanno
**due Durable Object separati** — condividono il D1 locale, non i DO — quindi
la partita viva sarebbe due partite diverse. Chi sia chi lo dice l'header
`X-Osr-Dev-Email`, che vale solo dove `OSR_DEV_EMAIL` è già impostata, cioè
solo in `wrangler dev`.

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
| `test-motore-proiezione` | **cosa NON arriva al giocatore**, su tutti i 21 episodi: la busta, i luoghi non visitati, le tessere coperte, l'ordine del mazzo. Assert negativi |
| `test-tavolo-do` | **la partita viva**: il giocatore muove solo il suo eroe, la notte è di chi conduce, a ognuno la sua proiezione. Vuole UN SOLO `wrangler dev` (vedi sotto) |
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

## I Bivi di campagna: dalla carta al motore

Fino a ieri la campagna era scritta con **i Bivi** — a fine episodio il gruppo
decide, sigilla sul retro del Frammento, e quella scelta cambia le REGOLE di uno
o più episodi successivi — e l'app non ne sapeva niente. Chi giocava a schermo
prendeva una decisione che il gioco dimenticava.

**Venti Bivi, 77 effetti, 102 punti di applicazione.** Non è una catena: è un
grafo con archi lunghi fino a nove episodi. Il Bivio dell'Ep.8 si applica in
Ep.9-12 *e* in Ep.13/14/16; quello dell'Ep.11 arriva all'Ep.20; l'Ep.18 raccoglie
i conti di sei Bivi diversi.

- **`src/bivi.py`** — la fonte, tipizzata. Scelto invece di ritoccare venti
  generatori (invasivo) o di leggere la prosa a espressioni regolari (fragile).
  `webapp/export-data.py` la inietta nei JSON in due forme: `bivio` (il proprio,
  da proporre a fine serata) e **`bivi_qui`** (l'indice inverso — gli effetti che
  cadono su quell'episodio, da qualunque Bivio arrivino). L'indice si costruisce
  all'export, una volta, invece di farlo cercare al motore a ogni avvio.
- **`webapp/public/motore/bivi.js`** — puro. `biviDi(ep, scelte)` raccoglie gli
  aggiustamenti; `applicaAllaPartita` li mette nello stato iniziale;
  `episodioColBivio` restituisce **una copia** dell'episodio (i dati di `dati()`
  sono in cache e condivisi: sporcarli farebbe cadere la scelta di un tavolo
  addosso alla partita successiva aperta nella stessa scheda).
- **`scelte_campagna(tavolo, bivio, opzione)`** su D1, non nel blob della
  partita: quello è per episodio, e una scelta dell'Ep.8 deve pesare sull'Ep.20.
  `/api/scelte` la legge chiunque sieda al tavolo e la scrive solo chi arbitra.
  `store.js` ne tiene una copia in localStorage perché **preparare una partita è
  sincrono** e non può aspettare la rete.

**Due famiglie di effetto, e la differenza è dichiarata.** Quelli che l'app SA
FARE si applicano da soli: Canto iniziale, soglia del Canto, ore d'Indagine,
mazzo Minaccia (aggiungere/togliere per nome, per famiglia o «una qualunque»),
cariche delle abilità, pool nemici, testimoni tolti dagli Approfondimenti,
Testimonianze che partono rivelate, luoghi aperti o chiusi. Quelli che l'app PUÒ
SOLO DIRE — «un incrocio in più alla deduzione d'atto», «l'Ep.18 sarà un
processo», «la Vedova vi ha segnati» — escono come **righe da leggere**, perché
fingere di applicarli sarebbe peggio che dirli. **Le righe si dicono comunque,
anche per gli effetti applicati**: una regola che cambia in silenzio è
indistinguibile da un guasto.

**Dove si vede.** Schermata d'apertura prima della serata (le righe, da leggere
ad alta voce) → le stesse righe in testa al **diario**, che è l'unico posto che
guardano anche i telefoni → **il Bivio nell'epilogo**, con le due strade e i loro
prezzi: si decide insieme, la sigilla chi arbitra (dal telefono si legge e non si
tocca, come per la carta Minaccia e la notte) → **il Taccuino di Campagna**, dal
menu: i Frammenti e la scelta scritta sul retro di ognuno.

**I Frammenti non sono un dato nuovo.** Sono come è finita la serata:
`vittoria` → Frammento, `parziale` → Frammento **incrinato** (si conserva, non
conta nel finale), `sconfitta` → niente. Tenerne una tabella a parte avrebbe
voluto dire due conti della stessa cosa, e due conti divergono. Nel farlo è
saltato fuori che l'epilogo trattava la **vittoria parziale come una sconfitta**
(«la notte ha vinto»): ora la dice, e dice anche che il Frammento è incrinato.

**Il Durable Object applica i Bivi come il client** (`dati(episodio, bivi)`): la
Fase Minaccia legge `ep.pool` per sapere quanti Sgherri esistono, e un Bivio quel
numero lo sposta. Applicarli da una parte sola è il modo in cui questa partita si
è già rotta tre volte.

**Le prove.** `test-bivi.mjs` (copertura: venti Bivi tradotti, nessun effetto
perso, gli archi lunghi ci sono ancora), `test-bivi-motore.mjs` (le due strade
portano davvero in due posti diversi — e senza scelte la partita nasce com'era),
`test-bivi-ui.mjs` (il Bivio si legge, si sigilla una volta sola, resta scritto,
e dal telefono non si tocca). Tutti e tre provati **al contrario**, rompendo il
codice apposta: 5, 5 e 4 rossi.

**L'epilogo si legge sullo schermo.** «Leggete l'epilogo nel fascicolo
Soluzione» era un rimando a un foglio che chi gioca a schermo non ha in mano —
e l'epilogo è la ricompensa della serata. Ora c'è per esteso, col **Frammento**
sotto. La prosa resta una sola, dentro i generatori dei fascicoli:
`export-data.py` la estrae con **`ast`** e non a espressioni regolari — Python
unisce già i letterali spezzati su più righe, che è esattamente come questi
testi sono scritti. 21 epiloghi su 21, 20 Frammenti su 21 (quello n. 0 del
Preludio è scritto dentro il suo epilogo, e il test lo dichiara). L'Ep.20 ha
anche l'epilogo della **sconfitta**: il Dormiente che si desta è un finale.

**I Frammenti arrivano al finale.** `obiettivi.js` diceva *«la webapp gioca un
episodio per volta e non ha lo stato di campagna: il valore si dichiara sulla
partita»* — da ieri non è più vero. `store.frammentiConservati()` li conta dai
salvataggi (vittoria → intero, parziale → incrinato) e `comincia()` li scrive
sulla partita, così il ritmo del controcanto dell'Ep.20 dipende dalle serate
vere. **`serate` distingue «zero» da «non lo sappiamo»**: chi apre l'Ep.20 per
provarlo, e i banchi di misura che giocano un episodio alla volta, non hanno
venti serate alle spalle — lì il numero non si scrive e vale il `default` dei
dati (12). Senza quella distinzione il finale sarebbe diventato ingiocabile in
prova e la taratura avrebbe misurato un episodio che nessun tavolo incontra.

**Riprendere non richiede di rispondere due volte.** Con una partita salvata la
schermata dell'episodio non mostra più «come giocate stasera» e «da dove
cominciate»: sono decisioni già prese, e la seconda risposta non contava niente.
«Ricomincia da capo» / «rigiocate l'episodio» cancella il salvataggio, e le
domande tornano.

**L'epilogo era scritto nero su nero**, la prima volta che e' andato online:
riusava `.lettera-testo`, che e' inchiostro su *carta* e vive dentro
`.lettera-panel`. Ora ci sono `.epilogo-testo` (la grafia resta — l'epilogo e'
una voce che si legge ad alta voce — cambia l'inchiostro) e `.frammento-testo`
(niente grafia: il Frammento e' un oggetto che si rilegge per venti serate).
`test-stile` misurava il contrasto da mesi e non aveva visto niente per un
motivo solo: **non visitava l'epilogo**. Ora lo visita, e col vecchio codice lo
trova a 1.14:1.

**Il test della proiezione ha morso.** Aggiungere `epilogo` ai dati d'episodio
li mandava ai telefoni **a partita aperta** — l'epilogo nomina il colpevole, è
la soluzione in prosa. Ora epilogo, Frammento e Bivio passano solo a `esito`
scritto: a metà serata no, a serata finita sì, perché lì sono la ricompensa e la
ricompensa è di tutti. Il cancello è l'esito, lo stesso che apre l'epilogo:
nessun secondo stato da tenere allineato.

## L'Indagine dentro il motore (a metà)

Dopo la notte dei quattro difetti — tutti con lo stesso sintomo, «premo e non
accade niente», e la stessa radice: **il motore era una finestra aperta su un
PC** — l'Indagine si sposta nel motore, come la Spedizione. Piano in
`~/.claude/plans/synchronous-hopping-hartmanis.md`.

**Prima, una potatura**: resta **una modalità sola** — al tavolo, con la plancia
a schermo. Via `spedizione.js` (1131 righe), via `modo` e `plancia`, via la
domanda «come giocate stasera». La sola scelta è **da dove si comincia**.

**Fatto (tappe 1-2).** `motore/indagine.js` è puro; `applica` smista per fase.
Sono comandi: dichiarare, bussare, il grimaldello, entrare e uscire, oggetti e
reperti, la lettera, gli appunti, le risposte, **guardare meglio**, l'**aiuto
profano**, il **Secondo Fiato**. Il tiro viaggia **dentro il comando**, e con
questo si è cancellata la macchina della pendenza: `richiesta`, `pendenza`,
`chiediAlTavolo`, `eseguiRichiesta`, `chiHaLEroe`, `attesaDelTiro`, i due
comandi del Durable Object e la spia «il tavolo sta guardando».

**Resta (tappe 3-4)**: le una-tantum (Discernimento, Fonti riservate, Ombra,
Esame di Carbone) e la chiusura della busta mutano ancora dalla vista. Si gioca
— passano dal salvataggio come prima — ma non sono comandi.

**Due lezioni che valgono oltre questo lavoro.**

*Una scena non è un errore.* Due volte ho trasformato «hanno chiuso alle 20» o
«il dilettante ha già avuto la sua occasione» in un rifiuto rosso. Dichiarare
era una mossa **legale**: la risposta è «non se ne fa niente, e l'ora resta».
Sono eventi, e la prosa la compone la vista.

*Un ramo vacuo dentro la rete più grande.* La condizione degli Approfondimenti
in `test-partite` guardava `scena_<n>`, una chiave che il gioco non scrive più:
sempre falsa. **42 giocate che dicevano tutte «0 approfondimenti»**, e il verde
c'era lo stesso. Sistemata, ha trovato subito tre difetti veri.

## L'Indagine sui telefoni

La Fase 5 aveva portato **la Spedizione** su più dispositivi; l'Indagine era
rimasta indietro, e la conseguenza non era piccola: `main.js` chiamava
`vistaIndagine` **senza il posto**, quindi chi entrava al tavolo dal proprio
telefono a serata in corso si trovava davanti la **scrivania di chi arbitra** —
le chiavi delle porte, gli indizi dei luoghi mai battuti, il testo degli
Approfondimenti non letti, la busta. E `mettiSulTavolo`/`collegaAlTavolo`
vivevano dentro `digitale.js`: durante l'Indagine il tavolo non era **mai** vivo,
e ogni dispositivo scriveva sul proprio salvataggio.

**Due decisioni, prese col committente.** Nell'Indagine **agisce solo chi
arbitra** — al tavolo è conversazione, si decide insieme e una mano sola scrive.
Ma **i dadi li tira chi ha quell'eroe**, scegliendo *a ogni tiro* se far tirare
l'app o dichiarare due dadi veri.

- **`vistaIndagine(app, partita, vaiA, posto)`** e la potatura di
  `proiezione.js` — che l'Indagine la potava già, e non è stata estesa: è stata
  *usata*. Senza posto `eArbitro(null)` è vero e non cambia niente.
- **`vistaDiChiGioca()`**: non è la stessa schermata con meno bottoni. Chi
  conduce guida la notte; chi gioca ha tre domande — che ora è, dove siamo
  stati, cosa abbiamo in mano — e sono quelle, in quell'ordine.
- **`js/tavolo-vivo.js`**: `mettiSulTavolo` esce da `digitale.js` perché ora
  serve a tutt'e due le metà della serata. Il filo resta da ciascuna parte: le
  due viste hanno da fare due mestieri diversi con quel che arriva.
- **`apri` nel Durable Object ora SPARGE**: prima scriveva e taceva, e chi era
  collegato non vedeva muoversi niente. È la via con cui la serata avanza —
  `salvaP()` è il punto unico da cui passa ogni cambiamento dell'Indagine, ed è
  lì che si è agganciata la spinta.
- **La pendenza della prova**: chi arbitra la apre e aspetta, il telefono di
  quell'eroe la tira, l'esito torna come comando `prova-indagine`. **Due
  ripieghi obbligatori**: se l'eroe non è di nessuno tira chi arbitra (è il caso
  normale, non l'eccezione), e se il telefono non risponde chi arbitra ha sempre
  un «tiro io». Una scelta che può bloccare la serata e non ha via d'uscita è un
  difetto, non una regola.
- **`dadi.js`**: i due pezzi c'erano già entrambi, uno era `display:none`.

**Un difetto latente trovato strada facendo**: `salva()` timbrava
`aggiornato = Date.now()`, e il Durable Object rifiuta uno stato non più recente
di quello che ha. Due `salvaP()` nello stesso millisecondo — nell'Indagine
capita — avevano lo stesso timbro e il secondo veniva **scartato in silenzio**.
Ora il timbro è strettamente crescente.

**Il refresh portava sempre nello stesso posto.** Dal telefono ogni ricarica
finiva nell'epilogo del Preludio, ovunque fosse chi arbitra. Due cose che si
sommavano: «la serata aperta è **il salvataggio più recente**», e il telefono
che **salvando** una serata per guardarla la faceva diventare la più recente —
`salva()` timbra `aggiornato`, e il timbro dice «qui è successo qualcosa,
adesso». Bastava aprire il Preludio una volta perché restasse in cima per
sempre: un errore che si autoalimentava, più lo si guardava più restava.

Due correzioni, e sono di natura diversa:

- **il criterio**: qual è la serata aperta lo decide chi arbitra, e da quando
  esiste la partita viva c'è un posto dove lo dice. `entraNelTavolo` chiede al
  **Durable Object**; il salvataggio più recente resta solo come ripiego per
  quando non c'è partita viva.
- **il timbro**: `salva(p, { timbra: false })` per tutto ciò che arriva da
  fuori — il download, lo stato dal filo, l'`incassa()` col tavolo vivo. Una
  copia non è una mossa: non si timbra e non si rimanda indietro.

**E la serata ricominciata non arrivava.** Chi arbitra riapriva il Preludio ed
era fermo **alla lettera** — dove non si è ancora salvato niente — mentre il
Durable Object aveva ancora la serata finita della volta prima: i telefoni
entravano lì e ci restavano finché qualcuno non spendeva un'ora. La Spedizione
si mette sul tavolo appena si apre (`vistaDigitale`); l'Indagine no. Ora sì.

Nello stesso punto un secondo buco: `apri` confrontava i timbri **senza
guardare quale episodio**. Chi arbitra che riprende una serata vecchia — col
suo timbro di settimane fa — sarebbe stato rifiutato, e il tavolo sarebbe
rimasto sulla serata di prima con tutti i telefoni appresso. Il confronto vale
solo **fra lo stesso episodio**: cambiare serata è una decisione, non un
salvataggio in ritardo.

**Il timbro non viene da un orologio solo**, e questa è la trappola che il
locale non mostra mai: `aggiornato` lo scrive il Durable Object quando applica
un comando (clock del server) *e* il browser di chi arbitra quando salva (clock
del PC). Sulla stessa macchina i due coincidono; in produzione bastano pochi
secondi di scarto, e una serata **ricominciata** veniva rifiutata da un tavolo
che aveva il timbro più avanti — senza un errore da nessuna parte. Il confronto
ora è fra la stessa **partita** (`episodio` + `creata`, che non cambia mai), non
fra timbri: ricominciare fa una serata nuova, e quella vince comunque.

**Nella vista del telefono** ci sono anche il **contatore delle cariche**
d'Indagine del proprio eroe (stessi pallini di chi arbitra e del Taccuino
stampato) e la **lettera d'incarico** da rileggere — senza la coda in corsivo,
che è regia e direbbe quali porte esistono.

**Un difetto silenzioso nella proiezione**, trovato guardando lo schermo:
`approfondimentiLetti` è una lista di **oggetti** `{n, tipo, soggetto}`, e
`String(x)` li rendeva tutti «[object Object]». Nessuna carta Approfondimento
arrivava mai al telefono — nemmeno quelle lette ad alta voce davanti a tutti. Non
un errore: una sezione perennemente vuota. Rimettendo il difetto, 21 rossi.

**Approfondire è dell'eroe.** Il tiro era già suo; l'azione che lo innesca no,
e la distanza fra le due cose si sentiva al tavolo — chi conduce premeva per te
un bottone col nome della *tua* abilità. Ora i bottoni stanno dove sta
l'abilità: dentro un luogo, sul telefono di chi ha quell'eroe, uno per tipo di
Approfondimento che sa leggere, più l'**aiuto profano** (l'occasione una del
luogo, e la tenta chi vuole — il bottone è su tutti i telefoni presenti).

Il telefono **chiede** e basta: `chiedi-indagine` scrive `indagine.richiesta`,
chi arbitra la raccoglie e la esegue **col motore che ha già** — stessa carica,
stessa prova, stesso testo. Le regole restano in un posto solo. La richiesta si
toglie dallo stato *prima* di eseguire, e l'id servito si ricorda: servita due
volte sarebbero due cariche.

**L'esito è del tavolo.** `pannelloMsg(…, { atutti: true })` scrive
`indagine.carta` nello stato: la schermata si apre su **ogni** schermo — quel
che si è colto e anche il «niente, per ora» — e la chiude chi conduce, così
nessuno va avanti mentre gli altri leggono. Chi guarda non ha un «continuate».
Agganciarlo a `pannelloMsg` invece che a mano copre tutti e sette gli esiti
dell'Approfondimento in una volta; inventario e Taccuino restano scrivania di
chi arbitra e non si spingono a nessuno.

**Il tavolo non timbra le scritture d'Indagine**, ed è la correzione che ha
sbloccato l'aiuto profano al tavolo. Scrivendo la richiesta (o l'esito di un
tiro) il Durable Object metteva `aggiornato` **col clock del server**: la spinta
successiva di chi arbitra — col clock del suo PC, anche solo qualche secondo
indietro — veniva rifiutata da `apri` **in silenzio**. Sintomo: il telefono
manda, il tavolo riceve, e non esegue nessuno. Nell'Indagine l'autore è il
browser di chi conduce e `aggiornato` è la sua lineage: il Durable Object scrive
e sparge, ma non timbra. Nella Spedizione resta com'era — lì l'autore è lui.

### Il tavolo vivo: quattro difetti di una specie sola

Tutti e quattro nascono dalla stessa cosa — **due orologi e un solo motore** — e
tutti e quattro si presentavano come «premo e non accade niente».

1. **Il timbro del server contro quello del PC.** Il Durable Object scriveva
   `aggiornato` col proprio clock: la spinta successiva di chi arbitra, col
   clock del suo PC, veniva rifiutata da `apri` **in silenzio**. Nell'Indagine
   l'autore è il browser di chi conduce: il tavolo scrive e sparge, non timbra.
2. **Due copie identiche = «due versioni di questa partita».** La colonna
   `aggiornato` su D1 portava l'ora del server, il blob quella del PC:
   `sync.decidi` confrontava due orologi. Ora la colonna porta il timbro dello
   stato, e **stesso contenuto non è un conflitto** qualunque cosa dicano i
   timbri. Sceglierne una a caso poteva mettere arbitro e telefono su due
   partite diverse.
3. **Ogni spinta riportava chi gioca alla home.** Aprivi il taccuino e tornavi
   indietro; premevi un bottone, l'eco tornava, e la pagina si ridisegnava come
   se non avessi premuto. Ora si ridisegna la schermata dove si è
   (`ctx.schermata`).
4. **La mano alzata che cade nel vuoto.** Nell'Indagine chi arbitra è il
   motore: se non è sull'episodio — o ha la pagina aperta da prima di un
   aggiornamento — nessuno raccoglie. Il Durable Object ora dichiara
   `arbitroCollegato`, e il telefono distingue «non è collegato» da «è
   collegato ma non l'ha raccolta».

**Il limite resta, ed è del modello scelto**: agisce solo chi arbitra, quindi il
suo browser è l'unico motore. Portare l'Indagine dentro il motore come la
Spedizione è la cura vera, ed è il lavoro grosso.

**Le prove.** `test-indagine-eroe.mjs` (un solo `wrangler dev`): i segreti non
arrivano né allo schermo né al dispositivo, l'orologio di chi arbitra si muove
da solo sul telefono, il tiro si apre **solo** su chi ha quell'eroe e l'esito
torna al tavolo. `test-motore-proiezione` ha un caso nuovo — **l'Indagine in
corso**, che è quella che si gioca davvero. `test-stile` visita ora anche la
schermata di chi gioca (9 schermate). E il refresh e' provato per davvero:
si semina un Preludio finito e toccato DOPO, si ricarica la pagina, e si deve
finire dove sta chi arbitra.

**Tre trappole d'ambiente, e sono costate più del codice.** `wrangler dev` serve
`dist/`, che è una **copia**: senza `./deploy/build-dist.sh` si prova il codice
di prima. I moduli importati dal **Worker** (`proiezione.js`, `partita-do.js`)
non si ricaricano affatto: va **riavviato**. E più `wrangler dev` sulla stessa
porta restano in ascolto tutti, e allora non risponde nessuno — `taskkill` su
`workerd.exe` non basta, il padre lo rigenera: si uccide l'albero.

**Il setaccio dei segreti va passato a porte chiuse.** Entrare in un luogo **è**
il modo in cui si impara una risposta: col luogo aperto `cercaSegreti` suona sul
funzionamento del gioco (visto sull'Ep.20, dove «La via delle tre acque» è
insieme la risposta e l'indizio del rifugio).

## Fase 5: la vista eroe, e il filo collegato

Due dispositivi sulla stessa serata funzionano. Chi entra dal proprio telefono
vede la **stessa plancia** dell'arbitro — non una copia: duplicare `boardHtml`
avrebbe ricreato la divergenza fra due versioni della stessa regola che le Fasi
1 e 2 hanno appena finito di togliere. Cambia **chi può toccare cosa**.

- `canale.js` — il WebSocket verso il Durable Object: si ricollega da solo (un
  telefono che entra in tasca chiude il socket) e tiene in coda i comandi
  mandati mentre era giù.
- `digitale.js` — `esegui()` è il punto unico da cui passa ogni mossa, ed è lì
  che si dirama: **tavolo vivo** → il comando ci va e lo stato torna di là;
  **niente tavolo** → il motore resta nel browser e non cambia nulla. Nessun
  server, tavolo mai aperto, filo caduto: si gioca da soli, com'era. È una
  degradazione voluta.
- `incassa()` — il travaso dello stato, estratto perché ora lo stato arriva da
  due parti mentre la cosa delicata è una sola (travasare **senza sostituire**,
  o i gestori di `aggancia()` scrivono su un oggetto scartato, e il click si
  perde senza errore).

**Il `rif`, e perché esiste.** Chi manda una mossa riceve la risposta **due
volte** — una come risposta HTTP e una come spinta sul filo. Senza
contrassegno, gli stessi dadi verrebbero messi in scena due volte. Si
contrassegna il **comando** e non la sessione perché la stessa persona può
avere due schede aperte: filtrando per email, l'altra scheda non si
aggiornerebbe.

### Come si prova

`webapp/test-eroe.mjs` è il cancello. Vuole **un solo** `wrangler dev`: due
processi hanno due Durable Object separati (condividono il D1, non i DO) e la
partita sarebbe due partite. Chi è chi lo decide da che parte si bussa — il
browser non manda header, quindi è `OSR_DEV_EMAIL`, cioè il giocatore; l'arbitro
bussa da node con `X-Osr-Dev-Email`.

```
./webapp/build-dist.sh
npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
node webapp/test-eroe.mjs           # oppure OSR_BASE=http://127.0.0.1:8791 …
```

`webapp/test-posto-eroe.mjs` prova invece la sola **vista** (server non
necessario): le caselle si accendono solo per il proprio eroe, il bottone di
fine turno solo nel proprio turno, «gli eroi cadono» resta a chi conduce.
Entrambi sono stati provati **sabotandoli**, e cadono.

**Trappola d'ambiente, costata mezz'ora.** Più `wrangler dev` avviati e non
chiusi restano in ascolto sulla *stessa* porta, e allora **nessuno** risponde
più: `curl` va in timeout mentre il log dice `Ready`. Si vede con
`netstat -ano | grep :8787`; se ci sono più righe `LISTENING`, si uccidono
tutte o si cambia porta. E `wrangler` **non ricarica** gli asset aggiunti dopo
l'avvio: un file nuovo in `public/js/` dà 404 finché non si riavvia.

### Due difetti che il tavolo ha fatto uscire, e che il diff non conteneva

Portare la pesca nel motore ne ha scoperti due che erano già lì, e vale la pena
ricordarli perché sono di due specie che tornano.

1. **I nemici agivano due volte per round.** `esegui()` finisce con `render()`,
   e `render()` con la fase a «nemici» fa già partire la notte da solo:
   chiamando anche `faseNemiciAI()` esplicitamente, il turno si ripeteva. Non
   c'era nessun errore — solo eroi che cadevano il doppio. Il test delle
   regressioni l'ha visto come *un eroe già a terra all'inizio dell'animazione*,
   che è il modo in cui un doppio turno si manifesta a schermo. **Lezione:
   `render()` non è solo disegno, ha un effetto; chi lo chiama deve saperlo.**
2. **`obiettivoFatto()` chiedeva `every` su `scortati`**, e su una lista vuota
   `every` risponde di sì. Finché il motore girava solo nel browser non
   capitava, perché `migraScortati()` popola la lista all'apertura — ma nel
   Durable Object arrivano stati che quella funzione non ha mai toccato, e il
   difetto sarebbe stato **silenzioso**: nessun errore, solo il mazzo Minaccia
   che non pesca più per il resto della partita, cioè una serata molto più
   facile senza che nessuno capisca perché. **Lezione: quel che il client
   normalizzava all'apertura, il server lo riceve grezzo.**

### La vista eroe: cosa è stato deciso guardando i mockup

I mockup stanno sotto `/mockups/eroe/` e usano i dati veri dell'Ep.1. Il look non
era in discussione (`comune.css` replica `app.css`): si sceglieva **cosa sta a
schermo insieme** su 390 px. Deciso il **13/08/2026**:

- **Direzione 1, «pollice»** — la plancia domina, le azioni in fondo dove il
  pollice arriva senza cambiare presa, la scheda ridotta a una riga, il tavolo
  sotto. Scartate: «il mio eroe» (ritratto grande, plancia troppo piccola per
  seguire la notte) e «schede» (una per volta: mentre guardi «io» la plancia si
  muove, e il pallino avvisa ma avvisare non è vedere).
- **Fase Minaccia: la carta a tutta pagina.** Il telefono si ferma insieme al
  tavolo — mentre chi arbitra legge, tutti guardano la stessa cosa, e la pesca
  resta un momento di scena invece che una notifica.
- **Il campo scorre, non rimpicciolisce**: a larghezza doppia dello schermo la
  cella resta sui 100 px, colpibile col pollice. E si apre **centrato sul proprio
  eroe**; durante la notte si porta **su quel che è cambiato**, come fa già
  `centraSuNodo()`.
- **Il colpo che arriva a te** deve fermare lo schermo: bordo che lampeggia,
  numero che sale dal proprio segnalino, scheda cerchiata, e salute che scende
  nello stesso istante (`ctx.viteVista`). Su un tabellone il colpo lo vedono
  tutti; su un telefono si guarda altrove, e senza segnale si scopre di essere a
  terra due turni dopo.

**La regola che ha retto tutte le correzioni:** i mockup copiano `app.css` parola
per parola (`.cella-b`, `.cella-mossa`, `.tok-board`) e prendono la geometria dal
motore (`griglia.layout()`, `stat.raggEroe()`, tessera **4×4**, riga a video
`3 - y`). Ogni volta che ho reinterpretato invece di copiare — celle 5×5, caselle
oro invece che turchesi, tessere impilate invece che affiancate, caselle accese
durante la notte — il mockup mostrava un layout che non esiste, e si sceglieva su
una cosa falsa.

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
