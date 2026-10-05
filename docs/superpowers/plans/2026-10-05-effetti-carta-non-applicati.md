# Effetti delle carte Minaccia non applicati — piano riavviabile

> **Per chi riprende da zero (nuova sessione Claude):** leggi questo file per intero, poi `HANDOFF.md`
> (sezione in cima), poi `git log --oneline -15`. Le caselle `- [x]` sono il registro: il primo task
> senza spunta e' dove riprendere. Aggiorna il "Registro avanzamento" in fondo **a ogni commit**.
> Lingua del progetto: italiano (testi di gioco, commit, commenti). Repo: `C:\Users\pubul\WebstormProjects\ombre-su-roccamora`,
> branch unico `main`, niente worktree. L'utente gioca dal vivo (roccamora.smartcores.org) dall'iPhone e segnala bug.

**Goal:** ogni carta Minaccia della webapp deve FARE quello che il suo testo dice. Oggi molte carte mostrano un
effetto che il motore ignora (l'utente ha scoperto che «Ostacolo — Le Impalcature» non faceva nulla; da li' l'audit).

**Stato di partenza (05/10/2026):** famiglia Ostacolo FATTA e deployata (commit `de2ce1912`, deploy `50d1fd93`).
Restano le famiglie sotto.

## Contesto tecnico (tutto quel che serve per non riaprire il codice a vuoto)

- Motore puro in `webapp/public/motore/` (`comandi.js`, `azioni.js`, `minaccia.js`, `stat.js`, `griglia.js`,
  `regole.js`, `proiezione.js`, `nemici.js`, `obiettivi.js`, `interazioni.js`, `abilita.js`). UI in `webapp/public/js/digitale.js`.
- Ordine del round: fase eroi → comando `fase-minaccia` (`comandi.js` ~129-170: `sp.fase='nemici'`, `sp.eroiAttivo=null`,
  poi `pescaUna`) → `fase-nemici` → `regole.js fineRound` (`sp.round += 1`). **Le carte Minaccia si pescano DOPO che gli
  eroi hanno agito**: un effetto "immediato" colpisce lo stato com'e' a fine fase eroi; un effetto "sul movimento" deve
  valere dal round dopo (vedi Ostacolo: `sp.ostacoli = {round: R+1, ...}`, letto da `stat.ostacolo(g)`).
- `pescaUna(g)` (`comandi.js` ~203): pesca con `pesca(rng, mazzo, carte, episodio, ep)`; ramo crescendo (Canto) / ramo
  else (spawn via `minaccia.spawnDaTesto`, ostacolo via `minaccia.ostacoloDaTesto`). Lascia la carta aperta in
  `sp.carta = {titolo:'minaccia i di n', carta, annunci}`; `carta-vista` (`comandi.js` ~174) la chiude e pesca la prossima.
  **Punto d'innesto degli effetti nuovi: il ramo else di `pescaUna`**, accanto a `ostacoloDaTesto`. L'effetto si calcola
  nel motore (puro, testabile con `applica(stato, comando, dati)`), il testo dell'esito va in `annunci` (la UI li mostra).
- Il testo effetto di una carta e' `carta.rules.split('{divider}').pop()` (prima del divider c'e' la fiction in corsivo).
- `webapp/data/carte.json` e' GENERATO e git-ignored: `minacce` e' un oggetto per episodio `ep1…ep20`, ogni carta ha
  `title` (prefisso = tipo: Malavita, Insidia, Crescendo, Posseduto, Ostacolo, Quiete, Favore, Danno, Bivio), `file`, `art`, `rules`.
  Rigenerare con `node webapp/export-data.js`.
- Funzioni utili: `azioni.js`: `muovi` (~165-205: logica di rivelazione tessera = `sp.rivelate.push`, `log`, evento
  `{tipo:'rivelata'}`, `sp.carta = {tessera, testo}` per il testo letto ad alta voce, `spawnDaTesto` se «quando rivelate»),
  `applicaConseguenza` (~44: toglie 1 vita, stordimento `sp.storditi[nm] = sp.round + 1`), `provaRichiesta` (~36),
  `provaDi` (~75-117), `prova()` (~121). `digitale.js`: `schermataCarta` (~1205: mostra la carta; con prova mostra
  `#ins-risolvi` e nasconde `#ok-msg` finche' non si tira), `bersagliInsidia` (~1181), `applicaConseguenza` locale (~1169),
  `eroePiuAvanzato` (~1179, delega a `vittoria.eroePiuAvanzato(G(), vivi)`), `salvaP`.
- Stato vita: `sp.vite[nm]` (undefined = salute piena, vedi `saluteMax(g, e)`); eroe a 0 = a terra. `sp.eroiPos[nm] = {t, ...}`
  (t = id tessera). `sp.rivelate` = ids tessere svelate. Griglia/uscite tessere in `griglia.js` (`viciniGlob`, `rivelate`).
- Modalita' TAVOLO (arbitro-come-master, carte fisiche): il comportamento al tavolo deve restare intatto (memoria utente
  «Modalita' tavolo intatta»): il motore e' unico, quindi l'effetto va applicato dal motore anche li' senza rompere i flussi.

## Come si prova (regole dell'utente)

- **Test di regressione NON vacui**: ogni test nuovo va sabotato (rimuovi l'implementazione, deve diventare rosso) prima di fidarsi.
  Modello da copiare: `webapp/test-ostacolo.mjs` (costruisce lo stato con `nuova`, mazzo precaricato
  `sp.mazzo = {pool:[titolo], ordine:[0], indice:0}`, applica `fase-minaccia`, controlla lo stato).
- Test motore: dalla radice del repo `node webapp/test-<nome>.mjs` (leggono `webapp/data/...` relativi: serve `node webapp/export-data.js` prima).
- Test UI: `node webapp/server.js` (porta 8017) + Playwright; **chiudere il server a fine misura** (PowerShell:
  `Get-CimInstance Win32_Process | ? CommandLine -match 'webapp.server.js' | % { Stop-Process -Id $_.ProcessId -Force }`).
  Piu' server sulla stessa porta = nessuno risponde. Lanciare le misure in parallelo quando sono molte.
- Fallimenti **gia' presenti, non toccare**: `test-digitale.mjs` (`addEventListener is not defined`, serve browser),
  `test-abilita.mjs` (2 KO: «il primo tiro d'attacco…», «in dodici tentativi…»), `test-digitale-regressioni.mjs`.
- Provare la cosa scritta (memoria utente): non fidarsi del diff verde; eseguire con stato seminato e leve all'estremo
  (es. 1 solo eroe vivo; zero tessere coperte adiacenti; eroe gia' a 1 vita; eroi tutti a terra).
- Se cambi il TESTO di una carta: sorgente = `scripts/cardconjurer/cards-data.js` (Minacce ep2+) e `src/gen_cards.py`
  (Minacce ep1) → `node webapp/export-data.js` → rigenera il JPG `node scripts/cardconjurer/generate-batch.js all '<frammento titolo>'`
  (apre Chromium visibile, ~30s a carta, **al massimo 3-4 carte per `--vai`/lancio**: la coda Midjourney/generatore sforata
  fallisce in silenzio) → **guarda il render** (Read sul JPG in `Episodio N/cards/Minacce/`) → `python webapp/export-assets.py`.
  I JPG sono tracciati in git.
- Idea guida di design (memoria utente): **prima il precedente di genere** (D&D/HeroQuest: trappole, danno da caduta,
  porte segrete) poi eventuale novita'. KPI core da non peggiorare: giocabilita', ansia, coinvolgimento, immersione.

## Commit e deploy

- Commit solo dei file toccati (mai `git add -A`), messaggio in italiano `fix: ...`, con i trailer:
  ```
  Co-Authored-By: Claude Code <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01E3wCErKnfp5djVLEH6umwX
  ```
- Push su `main` solo se l'utente l'ha gia' autorizzato nella sessione (finora si': «fix, test, commit, push, deploy»).
- Deploy: `node webapp/export-data.js && python webapp/export-assets.py && bash deploy/deploy.sh` (build-dist, schema, wrangler).
  Mai `git worktree`. Dopo il deploy: chiudere server locali.

---

## Audit: carte il cui effetto e' ignorato dal motore (conteggi su `carte.json`)

Tipi per prefisso titolo: Malavita 132, Insidia 101, Crescendo 69, Posseduto 47, Ostacolo 21, Quiete 20, Favore 20, Danno 12, Bivio 7.
Gia' a posto: Malavita/Posseduto (spawn), Crescendo (Canto), Ostacolo (FATTO), Insidia con prova (UI risolve la prova).
Prima di ogni Task rifai il grep sul testo esatto: **l'audit puo' contenere errori** (un agente ha segnalato «verso Nord» che invece era gia' corretto).

| Famiglia | Carte | Testo effetto | Stato motore |
|---|---|---|---|
| Danno | 12 (Ep7 «Il Piombo dal Buio», Ep10-20) | Ep7: «L'eroe piu' avanzato subisce 1 danno (nessuna prova)»; Ep10-20: «Un eroe a caso (chi arbitra tira) subisce 1 danno.» | ignorato |
| Favore | 20 (Ep1-19) | «Rivelate una tessera coperta adiacente a quella di un eroe (la scelgono i giocatori).» (Ep1 aggiunge «Ruggero e' vivo.») | ignorato |
| Favore Ep20 | 1 («La Citta' Suona a Favore») | «Il controcanto avanza di 1 riga in piu' questo round. Serve la Mappa Acustica.» | ignorato |
| «Con [oggetto]» | da contare | bonus/alternative se un eroe ha un oggetto | da verificare |
| Bonus passivi di oggetti | da contare | testo oggetti con effetti che il motore non legge | da verificare |
| «perde il movimento extra» | da contare | regola non definita | da verificare |
| «non puo' aiutare / documentare» | da contare | divieti di azione | da verificare |
| «perde il turno», morale, difficolta' del vento, ESPOSTA, narrazioni nemico, FUGA in Insidia | da contare | vari | da verificare |

---

## Task 1 — Danno (12 carte)

**Decisioni di design (rulings gia' presi, cambiali solo con motivo):**
- Effetto IMMEDIATO nella fase Minaccia (gli eroi hanno gia' agito, quindi nessun problema di timing). Precedente: trappola
  / danno da caduta di D&D e HeroQuest, 1 danno senza tiro salvezza.
- «A caso (chi arbitra tira)»: lo sceglie il motore con `g.partita.rng` fra gli eroi VIVI (vita > 0). Cosi' e' riproducibile
  nei test e in digitale non serve un dado vero; al tavolo l'arbitro vede nell'annuncio chi e' stato colpito (non serve altro).
- «L'eroe piu' avanzato» (Ep7): `vittoria.eroePiuAvanzato(g, vivi)` esiste gia' (usato da `bersagliInsidia`): riusare, non riscrivere.
- Eroe a 0 vite dopo il danno = a terra, come ogni altro danno (riusare la stessa funzione di `applicaConseguenza`,
  non duplicare la sottrazione). Se nessun eroe e' vivo: nessun effetto (annuncio vuoto).
- Annuncio in `annunci`: «<Nome> subisce 1 danno.» (e «cade» se arriva a 0, se `applicaConseguenza` non lo dice gia').
- Chi legge: il danno e' gia' avvenuto quando la carta e' mostrata; la UI mostra l'annuncio sotto la carta. Controllare che
  l'HUD vite si aggiorni (la `fase-minaccia` e' un comando motore: lo stato viaggia gia' a tutti gli schermi).

**Files:** `webapp/public/motore/minaccia.js` (nuovo `dannoDaTesto(testo)` → `{bersaglio:'caso'|'avanzato'} | null`, accanto a
`ostacoloDaTesto`), `webapp/public/motore/comandi.js` (`pescaUna`, ramo else), `webapp/test-danno.mjs` (nuovo).

- [ ] 1.1 Rigrep dei 12 testi in `carte.json` con `node -e 'const c=JSON.parse(require("fs").readFileSync("webapp/data/carte.json"));for(const [ep,l] of Object.entries(c.minacce))for(const k of l)if(/^Danno/.test(k.title))console.log(ep,k.title,k.rules.split("{divider}").pop())'`; confermare le due formule.
- [ ] 1.2 Test rosso `webapp/test-danno.mjs` (copia lo scheletro di `test-ostacolo.mjs`): (a) tutte e 12 le carte sono riconosciute
      da `dannoDaTesto`; (b) `fase-minaccia` con una carta Danno toglie 1 vita a UN eroe vivo e a nessun altro;
      (c) con un solo eroe vivo colpisce lui; (d) un eroe gia' a 1 vita va a 0; (e) tutti a terra: nessuna eccezione, nessun cambio;
      (f) Ep7 colpisce l'eroe `eroePiuAvanzato`; (g) `annunci` contiene il nome del colpito; (h) 200 pesche con seed diversi
      colpiscono almeno 2 eroi diversi (il «caso» non e' fisso).
- [ ] 1.3 Implementa `dannoDaTesto` + gancio in `pescaUna` (riuso della sottrazione vita di `azioni.js applicaConseguenza`;
      se non e' esportabile cosi', estrai UNA piccola funzione condivisa, non una seconda copia).
- [ ] 1.4 Sabotaggio: togli il gancio, il test deve fallire in (b),(d),(f),(g); ripristina.
- [ ] 1.5 Prova UI: server locale, Spedizione con carta Danno forzata nel mazzo; vedere vite scendere e annuncio; chiudi il server.
- [ ] 1.6 Esegui `test-ostacolo.mjs` e gli altri `test-*.mjs` di motore: nessuna regressione rispetto alla baseline.
- [ ] 1.7 Il testo delle carte NON cambia → niente JPG. Commit `fix: le carte Danno fanno davvero danno`. Aggiorna registro.

## Task 2 — Favore (20 carte + variante Ep20)

**Decisioni di design:**
- Precedente di genere: porta segreta / scorciatoia in HeroQuest e D&D = nuova stanza che si apre.
- Candidati = tessere COPERTE (non in `sp.rivelate`) collegate da un'uscita a una tessera dove sta almeno un eroe vivo
  (stesso criterio con cui `muovi` rivela una tessera: usare le funzioni di `griglia.js` / `interazioni.js` che calcolano le
  uscite, mai una regola nuova). **Prima di scrivere codice leggi come `esploraMosse`/`raggEroe` decidono `reveal`** e riusa lo stesso predicato.
- «La scelgono i giocatori»: la scelta e' dei giocatori, non del motore. Il motore, in `pescaUna`, calcola i candidati e li mette in
  `sp.carta.favore = {candidati:[tileId,…]}`; la UI (arbitro/conduttore) mostra un pulsante per candidato in `schermataCarta` e
  manda un comando nuovo `favore {tessera}`; il motore valida (la tessera e' fra i candidati, non gia' rivelata) e rivela con la
  STESSA logica di `muovi` (estrarre da `muovi` la parte «rivela tessera» in una funzione `rivelaTessera(g, id, chi)` e farla
  usare a entrambi — niente copia: testo letto ad alta voce `sp.carta.tessera/testo`, `spawnDaTesto` per «quando rivelate»,
  evento `rivelata`). Problema: `sp.carta` e' gia' la carta Favore aperta; il testo della tessera rivelata va mostrato DOPO
  (come seconda carta) — decidere guardando come `carta-vista` e il flusso `tessera` (digitale.js ~1825) si comportano; il minimo
  accettabile e' mostrare il testo della tessera nello stesso schermo sotto la carta.
- Nessun candidato (tutto gia' rivelato / niente adiacente): annuncio «Nessuna tessera coperta e' adiacente: il favore non porta a nulla.»,
  la carta si chiude normalmente.
- Un solo candidato: comunque la conferma passa dai giocatori (un tap), per coerenza e perche' e' una scoperta narrativa.
- Se «Rivelate» consuma anche il testo «Ruggero e' vivo» (Ep1): e' fiction, nessun effetto meccanico.
- Modalita' tavolo: la scelta e' dell'arbitro/giocatori comunque; il comando e' lo stesso.
- Ep20 «La Citta' Suona a Favore» e' diverso: «il controcanto avanza di 1 riga in piu'». Guardare in `obiettivi.js` come avanza
  il controcanto (cercare `controcanto`) e la condizione «Serve la Mappa Acustica» (oggetto/indizio); se manca la possibilita' di
  controllare la Mappa Acustica, tenere l'effetto condizionato come da testo e annunciare quando non si applica.

**Files:** `minaccia.js` (`favoreDaTesto`, `candidatiFavore(g)`), `azioni.js` (estrazione `rivelaTessera`), `comandi.js`
(`pescaUna` + nuovo comando `favore`, registrarlo dove vanno registrati i comandi — vedi `DOPO_LA_BUSTA` / `FUORI_DAL_REGISTRO`
~271/315 per capire se va nel registro/undo), `digitale.js` (`schermataCarta`), `proiezione.js` (la carta con `favore` deve
arrivare ai telefoni: verificare che la proiezione non la pota), `webapp/test-favore.mjs`.

- [ ] 2.1 Rigrep testi Favore; leggi `muovi`, `esploraMosse` (reveal), `proiezione.js` per il campo `carta`.
- [ ] 2.2 Test rosso `test-favore.mjs`: (a) 19 carte riconosciute da `favoreDaTesto`; (b) `candidatiFavore` dà le coperte adiacenti agli eroi
      e solo quelle (stato seminato con 2 eroi in tessere diverse); (c) `fase-minaccia` con Favore → `sp.carta.favore.candidati` non vuoto;
      (d) comando `favore {tessera}` valido rivela la tessera (entra in `rivelate`, evento `rivelata`, testo della tessera disponibile);
      (e) tessera NON fra i candidati → rifiuto, stato invariato; (f) zero candidati → annuncio, nessuna eccezione;
      (g) `spawnDaTesto` scatta se la tessera ha «quando rivelate»; (h) i candidati arrivano nella proiezione di un telefono.
- [ ] 2.3 Estrai `rivelaTessera` da `muovi` (test esistenti di movimento restano verdi), implementa `favoreDaTesto`, `candidatiFavore`, gancio, comando.
- [ ] 2.4 UI in `schermataCarta`: se `aperta.carta.favore` e c'e' scelta aperta, mostra i candidati (nome tessera leggibile) per chi conduce, nascondi
      `#ok-msg` finche' non si sceglie (come per le prove), chi gioca vede «i giocatori scelgono». Verifica con Playwright su porta 8017.
- [ ] 2.5 Sabotaggio del gancio e di `candidatiFavore` (devono rompere (b),(c),(d)); ripristina.
- [ ] 2.6 Ep20: `controcanto` +1 riga con condizione Mappa Acustica, test dedicato; oppure ruling registrato se il dato manca.
- [ ] 2.7 Test completi di motore + UI senza regressioni rispetto alla baseline. Commit `fix: le carte Favore rivelano davvero una tessera`. Registro.

## Task 3 — «Con [oggetto]» e bonus passivi degli oggetti

- [ ] 3.1 Grep nelle carte e negli oggetti (`webapp/data/` oggetti, `abilita.js`, `interazioni.js`) di tutte le occorrenze «Con <oggetto>…»,
      «se un eroe ha…» e dei bonus passivi: tabella (testo, dove viene letto oggi, letto si'/no). Fare questa tabella PRIMA di scrivere codice.
- [ ] 3.2 Per ogni voce non letta: ruling di design (precedente di genere, KPI) + test rosso + implementazione + sabotaggio, un commit per famiglia coerente.

## Task 4 — Divieti e perdite di azione

- [ ] 4.1 Tabella: «perde il movimento extra» (regola da definire con l'utente: chiedere UNA volta cosa significa), «non puo' aiutare», «non puo'
      documentare», «perde il turno» (rispetto a `sp.storditi`), morale, difficolta' del vento, ESPOSTA, narrazioni nemico, FUGA in Insidia.
- [ ] 4.2 Per ciascuno: leggi dove il testo viene mostrato, verifica se il motore lo applica; applica con test non vacuo come sopra.

## Task 5 — Chiusura

- [ ] 5.1 Rifare l'audit con grep: nessun tipo di carta con effetto ignorato, oppure elenco residuo motivato nel registro.
- [ ] 5.2 `AUDIT-TESTI.md`: aggiungere una riga «effetti carta» con lo stato; HANDOFF.md aggiornato.
- [ ] 5.3 Deploy (comandi sopra), verifica su roccamora.smartcores.org, chiudi server locali. Report all'utente (2 righe).

---

## Registro avanzamento (aggiorna a ogni commit)

| Data | Task | Commit | Note |
|---|---|---|---|
| 2026-10-05 | Ostacolo (fuori dal piano) | `de2ce1912` | deployato 50d1fd93; test-ostacolo.mjs |
| 2026-10-05 | Piano scritto | (questo commit) | nessun codice ancora |
