# La vista eroe: i giocatori collegati al tavolo

> Spec approvata il 12/08/2026. Sta qui e non in `docs/`, come gli altri
> documenti di progetto del repo (`DESIGN-EPISODIO-*.md`, `AUDIT-*.md`).
>
> Supera il «fuori scopo» di `DESIGN-ACCOUNT-E-SALVATAGGI.md:215-220`. Quella
> spec chiudeva promettendo che «il formato dei salvataggi è scelto perché
> domani non vada rifatto» (`:29-30`): domani è adesso, e la promessa regge solo
> a metà — il formato resta, il modello a scrittore unico no.

## Il problema

L'app è **arbitro su un dispositivo solo**. Non per caso: è scritto nel
`README.md:159`, nel testo del selettore di modalità (`main.js:136-138`), e
dichiarato fuori scopo nella spec degli account. Da lì discendono i limiti che
vogliamo togliere:

1. **Il giocatore non ha niente in mano.** La sua scheda, la sua salute, le sue
   cariche vivono su uno schermo in mezzo al tavolo, che opera qualcun altro.
2. **Non si gioca a distanza.** Il gruppo deve stare nella stessa stanza attorno
   allo stesso dispositivo.
3. **Il tavolo è di una persona sola.** `tavoli(id, proprietario, nome)`: un
   `proprietario`, nessuna tabella dei giocatori, nessun posto, nessun eroe
   assegnato.
4. **La soluzione è a portata di devtools.** Il client scarica l'episodio intero
   (`store.js:121-128`), `soluzione` compresa. Finché lo schermo è uno solo e lo
   tiene l'arbitro la cosa è teorica; con quattro telefoni collegati smette di
   esserlo.

## La forma della soluzione

Ogni giocatore entra nel tavolo dal proprio dispositivo e **gioca il turno
intero del suo eroe**: mini-plancia toccabile, scheda, azioni. Questo vuol dire
più scrittori sulla stessa partita, e il blob JSON con last-writer-wins ogni tre
secondi non lo regge.

Quindi: **il motore di gioco diventa autoritativo dentro un Durable Object**, e
arbitro, plancia fisica e telefoni diventano tutti viste sopra lo stesso motore.

### Le decisioni prese

| | |
|---|---|
| Accesso | Cloudflare Access per tutti; l'autorizzazione al tavolo sta in D1 |
| Poteri dell'eroe | turno intero dal telefono |
| Sincronia | Durable Object **come motore**, WebSocket |
| Plancia | mini-plancia toccabile sul telefono — il gioco a distanza funziona |
| Indagine | sola lettura sui telefoni (l'ultima fase) |
| Offline | non esiste più: sempre dal DO |
| Plancia fisica | anche `spedizione.js` passa dal DO |

## Quanto costa, misurato

`digitale.js` **non è un motore con una vista sopra: è una vista con le regole
dentro i gestori di evento.** Righe di codice da spostare server-side: ~700 pure
in `digitale.js`, 211 in `engine.js` (già puro e già headless), **~450 miste**
(regole intrecciate col DOM), ~400 duplicate fra `spedizione.js` e
`indagine.js`. Totale ≈ **1300 righe**.

Gli ostacoli veri non sono l'HTML:

1. **Diciannove regole si fermano ad aspettare l'utente dentro la transazione** —
   `await tiraProva` / `await scegli` / `await messaggio*` a `digitale.js` 731,
   737, 742, 752, 818, 846, 876, 1637, 1665, 1683, 1700, 1727, 1779, 1802, 1845,
   1854, 2051, 2218, 2230.
2. **La RNG è client-side e senza seme** in tre file (`digitale.js:2057, 2301,
   2328, 2348`; `engine.js:64, 138, 157`; `dadi.js:126, 152`). Le partite non si
   rigiocano, quindi il bilanciamento è statistica su rumore.
3. **Il danno è scritto tre volte**: `digitale.js:2360` (schermo), `:2234`
   (tavolo, dentro l'animazione), `:2190` (salta-animazione).
4. **`ctx` è un globale di modulo** (`digitale.js:22`) letto da ogni funzione —
   ma la cucitura esiste già: `_motore._setup()` (`:2486-2494`) e
   `test-digitale.mjs` girano headless in node oggi.
5. **Trentotto `salvaP()` sparsi dentro le regole**, alcuni a metà transazione
   (1342, 1529, 1668, 1673, 2050, 2267, 2432).
6. **`interazioneDisponibile` (`:888-913`) restituisce le etichette dei bottoni**
   insieme alla legalità: la regola e la sua didascalia sono lo stesso oggetto.

Una cosa gioca a favore, ed è la più importante: **le regole non rileggono mai il
DOM**. Il flusso è a senso unico, stato → schermo. Non c'è stato di gioco
nascosto nell'HTML: `boardHtml` è già una proiezione pura di `SP()`.

## Architettura

### Il comando completo — come muoiono diciannove sospensioni

Oggi la regola si ferma a metà per chiedere. Domani **il client chiede prima e
manda un comando già completo**, e il DO lo esegue fino in fondo:

```
client        calcola le opzioni legali col motore puro (raggEroe, interazioni…)
giocatore     sceglie tutto: bersaglio, abilità, oggetto
client → DO   { tipo:'attacca', eroe:'ELENA FOSCO', bersaglio:'nem-3' }
DO            applica la regola, tira col PRNG seminato, produce eventi
DO → tutti    { stato: <proiettato per quel posto>, eventi:[…] }
client        riproduce gli eventi come animazioni
```

**`eventi[]` è la novità che regge tutto**: è il copione dell'animazione. Oggi
l'animazione *è* la regola — `eseguiTurnoNemici` (`:2198-2270`) risolve il
combattimento mentre lo disegna. Separandoli, i tre percorsi del danno diventano
**un risolutore e un riproduttore**.

**I dadi fisici restano.** In `modo:'tavolo'` il comando porta il tiro
(`tiro:[4,3]`) e il DO lo usa al posto del proprio. Accettato solo dall'arbitro
e solo in quella modalità.

**Le scelte davvero reattive non spariscono, si collassano in una.** Quelle che
richiedono di vedere il risultato prima di scegliere — la concatenazione di
Ottone (`:1660-1670`), il bersaglio dell'insidia (`:813-820`), la prova
d'ingresso su tessera (`:1571-1580`), la carta della fase minaccia (`:2051`) —
passano tutte da un solo meccanismo:

```js
stato.pendenza = { a:'ELENA FOSCO', tipo:'concatena', opzioni:[…], contesto:{…} }
```

Finché è valorizzata il DO accetta **solo** `{tipo:'rispondi', scelta}` da quel
posto, e rifiuta tutto il resto. Il guadagno non è solo la semplicità: la domanda
sta *dentro lo stato*, quindi chi ricarica la pagina se la ritrova. Oggi una
promise interrotta perde il turno.

### La proiezione: i segreti restano sul server

`proiezione.vista(stato, posto)` filtra prima di spedire.

- **Arbitro** → tutto.
- **Giocatore** → solo le tessere in `rivelate` coi loro arredi, i nemici
  visibili, salute e azioni e abilità di tutti (al tavolo sono pubbliche). Mai:
  l'ordine del mazzo (solo il conteggio), le insidie non ancora scattate, il
  testo dei luoghi non visitati, `ep.soluzione`.

Il client eroe **non chiederà mai `/data/epN.json`**: riceve tutto dalla
proiezione. Il filtro è server-side, i devtools non lo aggirano. Questo chiude il
quarto problema dell'elenco in cima.

### Il determinismo

`stato.rng = { seme, passo }`, xorshift, `passo++` a ogni tiro. Gli eventi
portano i tiri, quindi la partita si rigioca identica. Il pilota fissa il seme e
le misure di bilanciamento diventano riproducibili.

### La persistenza

Lo storage del DO è la verità viva. **D1 `salvataggi` resta il backup durevole**
e la sorgente della lista partite, scritto ai checkpoint — fine round, fine fase,
fine episodio, `alarm()` ogni ~60s se c'è roba sporca — **nello stesso formato
blob di oggi**. Così `store.js`, `sync.js` e la schermata «continua»
(`main.js:212-259`) continuano a funzionare per tutto ciò che non è in corso.
`sync.decidi()` non si tocca: serve ancora ai salvataggi vecchi.

## I file

### Il motore puro — nuovo, isomorfo

`webapp/motore/`, importato **sia** dal Worker (bundle wrangler) **sia** dal
browser (ESM nativo, nessun build step). Nessun DOM, nessuna API di browser né di
node. Va aggiunto a `webapp/build-dist.sh:14-22`.

| file | da dove viene |
|---|---|
| `rng.js` | nuovo: seme e passo |
| `griglia.js` | `digitale.js:63-202`, `:420-445`, `:598-608` — BFS, cammino, raggiungibilità |
| `stat.js` | `digitale.js:204-264` — `eroe`, `nemStat`, `fascia`, `saluteMax`, `movimento` |
| `regole.js` | `engine.js` ripulito delle ~50 righe di stringhe e URL asset (`:278-315`) |
| `obiettivi.js` | `digitale.js:1197-1533` — compiti, orologio, rogo, cancellazione, ritmo, pressione, filo |
| `vittoria.js` | `digitale.js:1535-1552`, `:1587-1616`, `:1618-1628`, `:2155-2196` |
| `minaccia.js` | `digitale.js:1875-2054` — spawn, risveglio del boss, pesca |
| `nemici.js` | `digitale.js:2272-2433` — piano e risoluzione |
| `comandi.js` | `applica(stato, comando, dati) → {stato, eventi, pendenza}`: assorbe le ~450 righe miste |
| `proiezione.js` | nuovo |
| `dati.js` | caricamento episodi lato server, stesso JSON di `webapp/data/` |

Il browser importa lo stesso motore anche se non è lui a decidere: gli serve per
illuminare le tessere raggiungibili senza un giro di rete. Il DO rivalida sempre.

### Il Worker

- `webapp/worker/partita-do.js` — **nuovo**. Il Durable Object: WebSocket con
  l'API di hibernation, una sessione per posto, `applica`, broadcast proiettato,
  checkpoint su D1.
- `webapp/worker/api.js` — `mioTavolo()` (`:8-12`) esteso a *proprietario oppure
  membro*; nuovi `/api/membri` (GET/POST/DELETE) e
  `/api/partita/:tavolo/ws` (upgrade verso il DO).
- `webapp/schema.sql` — la tabella che oggi manca:

```sql
CREATE TABLE membri (
  tavolo   TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  email    TEXT NOT NULL,
  eroe     TEXT,                    -- NULL finché non sceglie
  ruolo    TEXT NOT NULL,           -- 'arbitro' | 'giocatore'
  invitato INTEGER NOT NULL,
  PRIMARY KEY (tavolo, email)
);
CREATE INDEX idx_membri_email ON membri(email);
```

- `wrangler.jsonc` — binding `durable_objects` e migrazione `new_sqlite_classes`.

### Il client

| file | cosa diventa |
|---|---|
| `webapp/public/js/canale.js` | **nuovo**: WebSocket, riconnessione, invio comandi |
| `webapp/public/js/replay.js` | **nuovo**: esegue `eventi[]` — da `digitale.js:2062-2095`, `:2144-2153` |
| `webapp/public/js/eroe.js` | **nuovo**: la vista del giocatore |
| `webapp/public/js/digitale.js` | solo vista: `boardHtml`, `render`, `aggancia`, zoom e pan (~900 righe) |
| `webapp/public/js/spedizione.js` | solo vista, regole rimosse (~615 righe) |
| `webapp/public/js/tavoli.js` | più l'invito dei membri; chi è membro-non-proprietario va alla vista eroe |

**La mini-plancia non è codice nuovo.** `boardHtml` (`digitale.js:452-539`) è già
una proiezione pura dello stato: funziona sullo stato filtrato così com'è. Idem
`scheda-eroe.js` e `dadi.js`. Non riscrivere, riusare.

**Niente routing nuovo.** Non esiste oggi (nessun hash, nessun `pushState`) e non
serve: `/api/stato` restituisce anche i tavoli dove sono membro, e `vistaTavoli`
(`tavoli.js:10`) instrada.

## Le fasi

Ognuna ha un cancello che deve essere verde prima della successiva.

### 1. Il motore puro, il seme, i comandi completi

La più grossa e la più rischiosa. Estrarre `webapp/motore/`, seminare la RNG,
convertire le diciannove sospensioni in comandi completi più `pendenza`,
introdurre `eventi[]` e `replay.js`. Il motore **gira ancora nel client**: a
schermo non cambia niente.

**Cancello — corretto il 12/08/2026, dopo aver letto il pilota.** Qui c'era
scritto «gli esiti devono coincidere esattamente, a seme fissato». **Non è
realizzabile**: il pilota è un bot che clicca, e la sua sequenza di
`Math.random()` dipende dal timing dell'animazione, quindi «stessa sequenza di
random» non è una condizione riproducibile. Al suo posto, tre reti:

1. **Test differenziale** sulle ~700 righe pure: ogni funzione estratta viene
   confrontata con l'originale (preso da git a SHA fisso) su migliaia di stati
   generati. Deterministico e automatico — è la rete forte.
2. **Test di regressione esistenti** verdi a ogni task.
3. **Mappa pilota dentro la banda di rumore**, N=20 prima e dopo, ogni corsa
   VALIDA. È l'unica rete per le ~450 righe miste, che oracolo automatico non
   hanno.

Il dettaglio sta in `PIANO-MOTORE-PURO.md`.

Vale da sola anche senza il resto: un motore solo, misure riproducibili.

### 2. `spedizione.js` sullo stesso motore

Rimuovere le ~350 righe duplicate; la plancia fisica diventa una vista.
Riconciliare le divergenze già in essere: `saluteMax` (`spedizione.js:67` contro
`digitale.js:230`), `SPAWN_REGEX` (`:95-104`, lista fissa di otto nomi, contro
`:1880` derivata dai dati), `spawnDaTesto`, `CARICHE_SPED` (`:531` contro
`:674`). `provaConRitiro` (`:438-462`) e `provaConFiato`
(`indagine.js:365-380`) sono due varianti della stessa regola: unificarle.

**Cancello:** test tavolo verdi, più una partita vera a tessere su un episodio.

### 3. I membri e gli inviti

Tabella `membri`, API, interfaccia d'invito, `mioTavolo()` esteso. Allargare la
policy Access a «qualunque email verificata via OTP», così l'autorizzazione sta
tutta in D1 e invitare un giocatore non richiede di toccare la dashboard
Cloudflare a ogni serata.

**Cancello:** `test-membri.mjs` — un non-membro riceve 403 su ogni percorso.

### 4. Il Durable Object

Ospitare il motore nel DO, WebSocket, proiezione per posto, checkpoint su D1.
L'arbitro smette di eseguire le regole e parla al DO.

**Cancello:** pilota riscritto contro il DO in miniflare, verde 21/21, **più
veloce di oggi**.

### 5. La vista eroe

`eroe.js`: mini-plancia toccabile, scheda, salute, abilità, e i bottoni delle due
azioni attivi solo quando è il mio turno.

**Cancello:** Playwright multi-contesto — un arbitro e tre eroi, un episodio
intero dall'inizio alla fine.

### 6. Le rifiniture

Riconnessione e presenza; l'eroe non reclamato giocato dall'arbitro; l'Indagine
in sola lettura sui telefoni (scheda, oggetti, ore rimaste).

## Come si verifica

- `webapp/test-motore.mjs` — ventuno episodi headless a seme fisso, esiti uguali
  a quelli del codice attuale (fase 1). Poi diventa il pilota di bilanciamento.
- `webapp/test-membri.mjs` — l'ACL: un non-membro prende 403 ovunque, un membro
  vede solo il suo tavolo.
- `webapp/test-proiezione.mjs` — assert **negativi**: la vista di un giocatore non
  contiene mai `soluzione`, né il testo di un luogo non visitato, né l'ordine del
  mazzo. È la barriera gemella di `src/test_oggetto_righe.py`, e come quella va
  estesa a ogni episodio nuovo.
- `webapp/test-eroe.mjs` — Playwright multi-contesto, partita intera a quattro
  posti.
- `test-digitale*.mjs`, `test-partite.mjs`, `test-ui.mjs`, `test-sync.mjs`,
  `test-api.mjs` — verdi a ogni fase, non solo alla fine.
- **A mano, con due dispositivi veri, un episodio completo.** I difetti gravi di
  questa roba — riconnessione, comando doppio, turno perso — non si vedono nel
  diff.

## Quello che si accetta di pagare

- **Il pilota Playwright va riscritto.** Oggi guida l'interfaccia, domani guiderà
  il motore. Non è una perdita — senza browser è più veloce, e col seme diventa
  deterministico — ma finché non è verde il bilanciamento non è misurabile.
- **La modalità tavolo viene toccata**, contro la regola tenuta finora. Scelta
  deliberata: elimina ~350 righe di regole duplicate che **stanno già
  divergendo**.
- **Serve la rete anche per giocare da soli.** Conseguenza diretta di «sempre dal
  DO»: un motore solo, nessun percorso che possa divergere.

## Da verificare prima di cominciare

- Che l'account regga i Durable Objects con backend SQLite.
- Che allargare la policy Access all'OTP libero vada bene: sposta il confine
  dell'autorizzazione da Cloudflare a D1, e da lì in poi `membri` è l'unica cosa
  che tiene fuori gli estranei.
