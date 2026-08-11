# Handoff — dove siamo

> A cosa serve: se la sessione muore, questo file basta a riprendere senza
> ricostruire niente. Si aggiorna a ogni commit. Qui c'è **dove siamo**, cosa
> gira e il prossimo comando; il *cosa fare* di un lavoro in corso sta nel suo
> piano.

**Aggiornato:** 11/08/2026 · ramo `main` · in produzione la versione `77079dc4`
su <https://roccamora.smartcores.org> (le tre correzioni dal tavolo, la
marcatura dei PDF che non si legge più a schermo, e l'audit dei testi applicato)

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

## Come si riprende

```bash
node webapp/server.js                 # l'app in locale, porta 8017
python webapp/export-data.py && node webapp/export-data.js   # dopo modifiche ai dati
python webapp/export-assets.py        # dopo carte/tessere/arte nuove; fa anche le icone
./webapp/deploy.sh                    # pubblica (da Git Bash)
```

Per gli endpoint dei salvataggi servono due `wrangler dev` (l'isolamento fra
account non si prova con un utente solo):

```bash
npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788
```

**I controlli**, tutti verdi tranne dove detto:

| | cosa guarda |
|---|---|
| `test-stile` | il tema vecchio non sopravvive (ori, pergamena fuori posto, angoli tondi) e ogni testo sta sopra 4.5:1 — 7 schermate, 232 testi |
| `test-nativa` | ogni icona dichiarata **esiste ed è della misura promessa**, e le pagine lunghe **scorrono** |
| `test-testi` | i refusi che l'audit ha già visto una volta non tornano: accenti con apostrofo, «quale è», articoli davanti a s impura, sigle d'arbitro nella finzione, statistiche inesistenti, carte mozze |
| `test-conferma` | le domande irreversibili si chiedono dentro il gioco: è l'unico che NON sostituisce `window.confirm` |
| `test-api`, `test-sync`, `test-access`, `test-account-ui` | salvataggi, coda, JWT, tavoli |
| `test-ui`, `test-digitale*`, `test-engine` | il gioco (i banchi di misura del bilanciamento) |

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
- Database D1: `ombre-salvataggi`, id `b0a85d9c-e7a6-4c3b-8940-1a50ad87fee2`.
  Access: team `smartcores`, destinazioni Worker + nome host pubblico.
