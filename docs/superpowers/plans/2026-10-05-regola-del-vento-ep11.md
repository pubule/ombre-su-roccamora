# La regola del vento dell'Ep.11 — piano riavviabile

> **Per chi riprende da zero (nuova sessione Claude):** leggi questo file per intero, poi `HANDOFF.md` (sezione in cima),
> poi `git log --oneline -15`. Le caselle `- [x]` sono il registro: il primo task senza spunta e' dove riprendere.
> Aggiorna il "Registro avanzamento" in fondo **a ogni commit**. Lingua del progetto: italiano (testi, commit, commenti).
> Repo `C:\Users\pubul\WebstormProjects\ombre-su-roccamora`, branch unico `main`, niente worktree. L'utente gioca dall'iPhone
> su roccamora.smartcores.org e segnala bug.
> **Prima di scrivere codice leggi anche** `docs/superpowers/plans/2026-10-05-effetti-carta-non-applicati.md` sezioni
> «Contesto tecnico», «Come si prova», «Commit e deploy»: valgono identiche qui (non le ripeto).

**Goal:** la REGOLA DEL VENTO dell'Ep.11 («La Torre dei Campanari») deve esistere nel motore: a inizio round ogni eroe su
tessera ESPOSTA tira NERVI o perde lo scatto (e, a 1 Ferita, prende 1 danno da vertigine), con la difficolta' che sale con
i Crescendo del vento e con le tessere piu' esposte, e con i bonus/malus degli oggetti che il testo gia' promette.

**Stato di partenza (05/10/2026, dopo `cb4ada878`, deploy `1f1914f9`):** nel motore NON c'e' niente: `grep -i "esposta\|vento"`
in `webapp/public/motore/` trova solo un commento di `ambiente.js`. Le carte Minaccia dell'Ep.11 con «su tessera ESPOSTA»
funzionano gia' (commit «ESPOSTA»), ma sono un'altra cosa (Insidie, difficolta' scritta sulla carta).

## Il testo stampato (fonte di verita', `webapp/data/ep11.json` + `carte.json`)

- **T1** (abbaino, non esposta): «Da qui in su vale la REGOLA DEL VENTO: sulle tessere ESPOSTE, a inizio turno, ogni eroe
  prova NERVI o perde lo scatto (e, se a 1 Ferita, subisce 1 danno da vertigine).»
- **T2** (esposta): «prova NERVI a inizio turno (vedi regola)». **T4** (esposta): «il vento qui e' FORTE (+1 alla difficolta'
  della prova NERVI)». **T5, T6** esposte. **T3** loggia RIPARATA: «nessuna prova di vento». Flag dati: `tessere[i].esposta`
  (T2,T4,T5,T6 = true; T1,T3 = false).
- **Crescendo** (Il Primo Refolo, Il Vento Gira, La Bora dal Mare, La Raffica sulla Guglia): «alzate di 1 la difficolta' delle
  prove di vento, per sempre (**i Crescendo si sommano**)». (L'`AUDIT-TESTI.md` §2.2 dice che non e' chiaro: **e' chiaro**, lo dice la carta.)
- **T5 arbitro** (testo ~riga 712 di ep11.json): «Vento al massimo (+1 alla difficolta' NERVI, oltre alle raffiche)».
- **Oggetti**: *Il Taccuino Ordinato* «+1 a tutte le prove NERVI del vento»; *La Lanterna da Guglia* «annulla il −1 alle prove di
  vento dovuto al buio sulle tessere ESPOSTE»; *La Corda del Campanaro* «assicurati: le trappole di caduta (T2, T4) non vi
  feriscono» (+ cattura automatica: gia' fatta, `compito`); la Domanda D3 esatta: «+1 a tutte le prove NERVI del vento» (`esatta`,
  ep11.json ~riga 441).
- **Caposquadra** «ignora il vento» (nemico: non tira, nessun codice da scrivere).
- **Raffica**: «se il Caposquadra e' a 1 Ferita su tessera ESPOSTA, CADE (filo perso)»: verificare in Task 4 che `controllaFiloPerso`
  (`obiettivi.js` ~391) e il ramo Canto coprano anche questo caso; se no, aggiungerlo.

## Rulings gia' presi (l'esecutore NON li rimette in discussione; li registra e basta)

1. **Base Facile (soglia 7)** per «prova NERVI» senza difficolta' scritta. Scala `Facile 7 < Media 9 < Difficile 11` (`comune.regole.diff`).
   Ogni «+1 alla difficolta'» = un gradino della scala, **tetto Difficile**. Motivo: con base Media il primo Crescendo porterebbe
   gia' a Difficile e gli altri tre non conterebbero; con base Facile i gradini T4/Crescendo restano tutti significativi.
2. **Gradini** = (numero di Crescendo del vento pescati, `sp.vento`) + (1 se la tessera e' T4 «FORTE») + (1 se T5 «Vento al massimo»).
   T5/T4 si riconoscono dal testo della tessera, non dall'id (regex `FORTE` / dal campo `arbitro`): niente id cablati.
3. **Il buio e' −1 al tiro** (non alla soglia) su ogni tessera ESPOSTA, **annullato** da chi ha *La Lanterna da Guglia*.
   «Chi ha l'oggetto» = `ha`-oggetto sull'inventario di gruppo `g.partita.indagine.oggetti` (come gli altri «Con [oggetto]»:
   `norm(o).includes(norm(nome))`), non per-eroe.
4. **Bonus +1**: Taccuino Ordinato e Domanda D3 esatta (gia' letta da `domande.js`? verificarlo in Task 2: se manca un campo,
   leggere `partita.vantaggi.risposte`). `bonusMano` (MANO FERMA, `stat.js` ~212) e `bonusVoce` (Serra) valgono gia' perche'
   la prova passa da `prova()` di `azioni.js`: **non duplicarli**.
5. **Fallimento** = `applicaConseguenza(g, nm, 'perde il movimento extra')` (−1 Movimento nel round dopo, gia' esistente), **piu'**
   1 danno se l'eroe e' a 1 Ferita (`sp.vite[nm] === 1`), ma **non** se ha *La Corda del Campanaro* (la corda protegge dal danno,
   non dalla prova). Un eroe a 1 vita che cade a 0 e' «a terra» come per ogni danno.
6. **Quando**: all'**inizio della fase Eroi di ogni round**, per ogni eroe vivo la cui tessera e' ESPOSTA, a regola attiva
   (= la tessera T1 e' tra le `sp.rivelate`; per l'Ep.11 e' sempre, ma si scrive il controllo sul dato `regola_vento` dell'episodio, vedi Task 1).
   Nel round 1 gli eroi sono in T1 (riparata): coda vuota.
7. **Bloccante**: finche' ci sono prove del vento in coda, le azioni degli eroi sono rifiutate («prima le prove del vento»). Le tira
   chi conduce (come le Insidie), una per volta, con la stessa UI `tiraProva`.
8. Le Insidie «su tessera ESPOSTA» NON prendono i modificatori del vento (hanno la difficolta' stampata sulla carta).
9. **Salvataggi vecchi**: `sp.vento` assente = 0, `sp.provaVento` assente = nessuna coda. Mai assumere i campi esistenti.
10. **La taratura si rimisura, non si indovina** (memoria «Il tavolo giudica»): se dopo il Task 5 l'Ep.11 esce dalla banda 55-75%,
    **non** ritoccare numeri a occhio: registrare la misura e segnalarlo all'utente nel report; tarare solo con partite vere.

## Global Constraints

- Motore puro: niente `document`/`window`/`localStorage` in `webapp/public/motore/*.js` (`test-motore-purezza.mjs` vieta anche la
  sottostringa «document» nei commenti-stripped: usare «docu…»).
- Strumenti: Bash collassa `\\` in `\`: per le regex usare **Edit/Write**, non `sed`/`node -e`. I sorgenti hanno CRLF: ancore
  multi-riga negli script falliscono, usare Edit. `python3` non c'e'.
- Test dalla radice del repo (`node webapp/test-xxx.mjs`). Server di prova: `node webapp/server.js` (8017) e/o wrangler (8787),
  **chiudere a fine misura**. Baseline gia' rossa (non toccare): `test-engine.mjs` (jpg mancanti, ~10 KO), `test-digitale.mjs`,
  `test-abilita.mjs` (2 KO), `test-digitale-regressioni.mjs`.
- Commit solo dei file toccati, messaggio italiano `fix:`/`feat:`, trailer Co-Authored-By + Claude-Session (vedi piano precedente).

## Review Focus (cosa un giocatore incontrera' e nessun task ovvio copre)

1. **Deadlock del pilota/simulatori**: se la coda `sp.provaVento` blocca le azioni e `mappa-pilota.mjs` / i simulatori non sanno
   risolverla, l'Ep.11 si pianta a round 1-2 e la mappa-pilota dira' 0%. (Task 5 lo copre.)
2. Eroe **a terra** o **gia' a 0** su tessera esposta: niente prova per lui; party con 1 solo eroe vivo.
3. **Ricarica pagina / secondo telefono** con la coda a meta': lo stato e' la verita' (`sp.provaVento` salvata), i telefoni dei
   giocatori vedono «prove del vento in corso» e non possono agire.
4. Eroe che **si sposta** durante la fase Eroi: la prova e' a inizio round sulla tessera di partenza; non si ripete.
5. **Salvataggio vecchio** a meta' episodio (senza i campi nuovi): la partita non si rompe.

---

## Task 1 (FATTO) — Il dato: `regola_vento` dell'episodio e i modificatori puri

**Files:** `webapp/public/motore/ambiente.js` oppure nuovo `webapp/public/motore/vento.js` (preferire il nuovo file: piccolo, puro),
`webapp/public/motore/regole.js` solo se serve; test `webapp/test-vento.mjs` (nuovo).

**Interfaces — Produces** (in `vento.js`, tutte pure, `g = {comune, ep, partita, sp, carte}`):
- `ventoAttivo(g)`: true se `g.ep.id` e' l'Ep.11 e T1 e' in `sp.rivelate`. **Ruling**: l'attivazione e' dichiarata dal DATO, non dall'id:
  aggiungere in `webapp/data/ep11.json` (via il sorgente che lo genera: cercare dove `export-data.py` costruisce `tessere[*].esposta`,
  e aggiungere `"regola_vento": {"attiva_da": "T1", "base": "Facile", "stat": "nervi"}`) e leggere quel campo. Se il sorgente del dato e'
  troppo contorto, **ruling di ripiego**: `g.ep.tessere.some(t => t.esposta)` come test di presenza della regola (solo Ep.11 ha `esposta` true), registrarlo.
- `gradiniVento(g, tessera)`: `Math.min(2, sp.vento||0) + (FORTE?1:0) + (MASSIMO?1:0)` → tetto 2 (Difficile) applicato dopo la somma; ritorna `{diff:'Facile'|'Media'|'Difficile', gradini}`.
- `buioMalus(g)`: `-1` se la tessera e' esposta e nessun oggetto di gruppo contiene «Lanterna da Guglia», altrimenti 0.
- `bonusVento(g)`: lista `[{label, val}]` con +1 *Taccuino Ordinato* (oggetto di gruppo) e +1 D3 esatta.
- `eroiInProva(g)`: nomi degli eroi vivi (`sp.vite[nm] > 0`, `undefined` = pieni) su tessera esposta (usa `griglia.tileDi(g, id)` e il flag `esposta`,
  come `bersagliInsidia` in `digitale.js` ~1176: `t.esposta ?? /ESPOSTA/.test(t.testo||'')`), se `ventoAttivo`.

- [x] 1.1 Scrivi `test-vento.mjs` ROSSO: stato Ep.11 con party di 4 (modello: `webapp/test-con-oggetto.mjs`, helper `nuova`/`gDi`), T1 rivelata, un eroe su T2 e uno su T3:
      `eroiInProva` = solo quello su T2; con `sp.vento = 1` e eroe su T4 → `diff 'Difficile'`; `sp.vento = 5` → ancora `Difficile` (tetto);
      `buioMalus` = −1 senza lanterna, 0 con «La Lanterna da Guglia» in `partita.indagine.oggetti`; `bonusVento` = +1 col Taccuino; eroe a 0 vita escluso; Ep.1 (qualunque altro): `ventoAttivo` false e `eroiInProva` = [].
- [x] 1.2 Implementa `vento.js` + il campo dato. Verde.
- [x] 1.3 Sabotaggio: rimuovi il tetto, il filtro «vivi», il controllo `ventoAttivo`: ognuno deve far diventare rosso almeno un'asserzione. Ripristina.
- [x] 1.4 `test-motore-purezza.mjs` verde. Commit `feat: regola del vento Ep.11 — modificatori puri`. Registro.

## Task 2 (FATTO) — Il contatore dei Crescendo e la coda a inizio round

**Files:** `webapp/public/motore/comandi.js` (ramo crescendo di `pescaUna`, ~riga 270), `webapp/public/motore/nemici.js` (`fineRoundNemici`, dopo `sp.fase = 'eroi'` ~265), `vento.js`, `test-vento.mjs`.

**Interfaces — Produces:** `sp.vento` (numero), `sp.provaVento = {round, chi:[nomi]}` | assente; `vento.apriProveVento(g)` → annunci.

- [x] 2.1 Test ROSSO: (a) pescando «Crescendo — Il Primo Refolo» (mazzo precaricato come in `test-con-oggetto.mjs`: `sp.mazzo = {pool:[titolo], ordine:[0], indice:0}`) `sp.vento` passa da 0 a 1; due carte → 2; una carta Crescendo di un altro episodio non lo tocca;
      (b) la regex e' sul TESTO («alzate di 1 la difficolta' delle prove di vento»), non sul titolo;
      (c) a fine round (`fase-nemici` → `fineRoundNemici`) con un eroe su T2 e uno su T3: `sp.provaVento.chi` = [eroe su T2], round = nuovo round; con nessuno esposto `sp.provaVento` assente; con eroe a terra su T2: escluso.
- [x] 2.2 Implementa: nel ramo crescendo, `if (/alzate di 1 la difficolt.. delle prove di vento/i.test(testo)) sp.vento = (sp.vento||0) + 1;` (nel sorgente il carattere dopo «difficolt» e' `à`: usare `\S` o `.` nella regex, NON scrivere la lettera accentata in un'espressione che passa da Bash; usare Edit). In `fineRoundNemici`, dopo aver messo `sp.fase='eroi'`: `ann.push(...vento.apriProveVento(g))`.
      Le carte annullate da oggetto («Con X: nessun effetto») NON incrementano (il ramo `annullata` e' gia' separato: verificare che l'incremento stia nel ramo non annullato).
- [x] 2.3 Sabotaggio dei tre punti (contatore, apertura coda, filtro vivi). Ripristina.
- [x] 2.4 Regressione: `test-con-oggetto`, `test-danno`, `test-favore`, `test-ostacolo`, `test-motore-comandi`, `test-motore-interazioni`, `test-motore-purezza`. Commit. Registro.

## Task 3 (FATTO) — Il comando `prova-vento` e il blocco delle azioni

**Files:** `webapp/public/motore/comandi.js` (tabella comandi + il punto in cui `applica` smista), `azioni.js` (riuso di `prova()`/`tiraLa`, ~126-145; esportare se serve), `webapp/public/motore/proiezione.js` (cosa vede un telefono), `test-vento.mjs`.

**Interfaces — Consumes:** `vento.eroiInProva/gradiniVento/buioMalus/bonusVento`, `azioni.applicaConseguenza`, `prova()` (soglia da `comune.regole.diff[diff]`, bonus `[{label,val}]`).
**Produces:** comando `{tipo:'prova-vento', nm, tiri?}` → eventi `{tipo:'tiro', causa:'vento', ...}` e, se fallita, `{tipo:'conseguenza', righe}`; toglie `nm` da `sp.provaVento.chi` e cancella `sp.provaVento` quando vuota.

- [x] 3.1 Leggi come `favore` e `carta-vista` sono dichiarati e smistati (`grep -n "'favore'" comandi.js`) e come `comando.tiri` (dadi di legno del tavolo) entra in `tiraLa`: la prova del vento DEVE accettare `tiri` (modalita' tavolo) esattamente come le altre.
- [x] 3.2 Test ROSSO: (a) con coda [A] e A su T2, `prova-vento` con `tiri` forzati che sommano molto → successo: nessuna conseguenza, coda svuotata; con tiri minimi → fallimento: `sp.vincoli[A].scatto === true` e `round === sp.round+1`;
      (b) fallimento con `sp.vite[A] === 1` → vita 0 (+ annuncio «a terra»); con *La Corda del Campanaro* in inventario → vita resta 1 ma lo scatto si perde;
      (c) il bonus del Taccuino si vede in `bonus` dell'evento; il buio −1 compare e sparisce con la Lanterna da Guglia; la soglia dell'evento e' 7 a `sp.vento=0`, 9 a 1, 11 a 2;
      (d) un `nm` non in coda → rifiuto; qualunque comando-azione dell'eroe (`muovi`, `attacca`, `interagisci`, `fase-minaccia`…: elencali dal codice) con coda non vuota → rifiuto con testo «prima le prove del vento», e a coda vuota riparte normale;
      (e) la proiezione per un telefono (`proiezione.js`) porta `provaVento` (altrimenti il giocatore non sa perche' e' bloccato);
      (f) solo l'arbitro puo' mandarla (come `favore`).
- [x] 3.3 Implementa. Il blocco va nel punto UNICO che smista i comandi (non per-comando): una guardia in `applica` con una lista esplicita dei comandi sempre ammessi (`prova-vento`, `carta-vista`, comandi di sistema/stato).
- [x] 3.4 Sabotaggio: togli la guardia, togli la conseguenza, togli il bonus Taccuino, togli l'esenzione Corda: ognuno rosso. Ripristina.
- [x] 3.5 Regressione completa del set + `test-engine` (stessi KO baseline). Commit. Registro.

## Task 4 (FATTO) — La UI: il tiro del vento e il blocco visibile

**Files:** `webapp/public/js/digitale.js` (dove si mostra la fase Eroi: cercare dove si legge `sp.fase === 'eroi'` e si disegnano i pulsanti degli eroi; modello della richiesta di prova: `schermataCarta`/`tiraProva`), `webapp/test-vento-ui.mjs` (nuovo, Playwright 8017, modello `test-con-oggetto-ui.mjs`).

- [x] 4.1 Quando `SP().provaVento` non e' vuota: chi conduce vede un pannello «Il vento — NERVI (Facile|Media|Difficile)» col nome dell'eroe, il dettaglio dei modificatori (gradini, buio, bonus) e un bottone che apre `tiraProva` (stessa componente delle Insidie; modo dadi = `modoDadi()`, tavolo = tiri di legno); al risultato manda `esegui({tipo:'prova-vento', nm, tiri})`. Chi non conduce vede «prove del vento in corso» e nessun bottone di azione attivo.
- [x] 4.2 Test Playwright ROSSO: stato Ep.11 con un eroe su T2 e coda `[eroe]`: il pannello c'e', i bottoni di azione sono bloccati, dopo il tiro (forzare il successo) il pannello sparisce e l'eroe e' selezionabile; un secondo contesto non-arbitro non ha il bottone del tiro. Sabotaggio (pannello rimosso → rosso).
- [x] 4.3 **Guardare lo schermo** (screenshot a 390×844 via Playwright, aprirlo con Read): niente testo tagliato, il pannello non copre i controlli. (Memoria: «lo strumento ci arriva fin li'?»: verificare anche che il pannello compaia con lo stato ricaricato da zero, non solo dopo la transizione.)
- [x] 4.4 Ep.11: verificare la Raffica sul Caposquadra (vedi sezione «Il testo stampato»): se `controllaFiloPerso`/crescendo non coprono «a 1 Ferita su ESPOSTA + pesca Raffica = cade», aggiungerlo con test; altrimenti annotare «gia' coperto» nel registro.
- [x] 4.5 Commit. Registro.

## Task 5 (FATTO) — Il pilota non deve piantarsi, e si misura

**Files:** `webapp/mappa-pilota.mjs` (e il pilota Playwright che pilota davvero la UI: cercare dove risolve `#ins-risolvi` / le prove), eventuali simulatori in `src/` che chiamano `applica`.

- [x] 5.1 `grep -n "ins-risolvi\|fase-minaccia\|carta-vista" webapp/*.mjs`: individua OGNI loop-bot che avanza il round. Insegna a ognuno a risolvere la coda (`prova-vento` per ogni nome in `sp.provaVento.chi`) prima di far agire gli eroi. Senza questo l'Ep.11 si pianta (Review Focus 1).
- [x] 5.2 **Misura a codice fermo** (memoria «Misura a codice fermo»: `git status` pulito prima), baseline = valore Ep.11 in `docs/` o HANDOFF «Mappa pilota» (win% con 4 eroi, N=20, banda sana 55-75%); poi dopo la regola. Lancia le partite **in parallelo**. Registra le due misure nel registro e in HANDOFF.
- [x] 5.3 Se fuori banda: NON ritarare (ruling 10). Riporta all'utente con i numeri e le leve candidate (base Media/Facile, tetto, danno da vertigine) e lascia il codice com'e'.
- [x] 5.4 Chiudi i server di prova.

## Task 6 — Chiusura

- [x] 6.1 Aggiorna `AUDIT-TESTI.md` §2.2 (la nota sui Crescendo «non e' detto se si sommano» → «si sommano, lo dice la carta; vedi piano del vento») e la riga «residuo» del §4.
- [x] 6.2 `HANDOFF.md` in cima: cosa e' fatto, le due misure, i rulings.
- [ ] 6.3 Push `main` e deploy (`node webapp/export-data.js && python webapp/export-assets.py && bash deploy/deploy.sh`); verifica; chiudi i server.
- [ ] 6.4 Report all'utente in 2 righe: cosa fa ora l'Ep.11, i numeri prima/dopo, e i rulings piu' discutibili (base Facile + tetto Difficile; danno da vertigine letterale a 1 Ferita).

---

## Registro avanzamento (aggiorna a ogni commit)

| Data | Task | Commit | Note |
|---|---|---|---|
| 2026-10-05 | Piano scritto | (questo commit) | nessun codice ancora |
| 2026-10-05 | Task 1 | (vedi git log: «regola del vento Ep.11 — modificatori puri») | `vento.js` + `test-vento.mjs` (sabotaggi: tetto, vivi, T1-rivelata, esposta, buio, bonus D3: tutti rossi). Rulings: (a) «Vento al massimo» sta in **T6** (la guglia), non T5: riconosciuto dal testo (`FORTE` T4, `vento al massimo` T6); (b) `ventoAttivo` = ripiego `tessere.some(t=>t.esposta)` (solo Ep.11 le ha) + T1 rivelata, niente campo dato nuovo; (c) D3: nuovo campo `bonus_vento` in `EFFETTI_DOMANDE[('ep11',3)]` (export-data.py) letto da `domande.effettiAttivi`. |
| 2026-10-05 | Task 2 | (git log: «contatore dei Crescendo e coda a inizio round») | `contaCrescendo` nel ramo crescendo non annullato (comandi.js), `apriProveVento` dopo `sp.fase='eroi'` (nemici.js); sabotaggi rossi. Regressioni verdi. |
| 2026-10-05 | Task 3 | (git log: «comando prova-vento e blocco delle azioni») | `azioni.provaVento` + ramo `prova-vento` in `provaDi` (serve anche al tavolo), guardia unica in `applica` con lista `PASSANO_COL_VENTO` (default-deny), `prova-vento` in `COMANDI_DI_ARBITRO`. La proiezione spalma `...sp`: `provaVento` arriva ai telefoni senza codice. Comando: `{tipo:'prova-vento', eroe, tiri?}`. Etichetta bonus buio = «Buio». Sabotaggi tutti rossi (anche `vite===1`). |
| 2026-10-05 | Task 4 | (git log: «pannello delle prove») | Pannello `ventoHtml` in `azioniHtml` (coda → riga per eroe con difficolta' e modificatori, tasto «tira» solo a chi arbitra, azioni nascoste finche' la coda c'e'). **Bug trovato dal test UI**: `incassa()` travasa lo stato con `Object.assign`, che non toglie le chiavi cancellate dal motore → `delete sp.provaVento` lasciava la coda in vista per sempre; ora si scrive `{round, chi: []}` (sabotaggio rosso). 4.4: la Raffica NON era coperta (la clausola «Caposquadra a 1 Ferita su ESPOSTA, CADE» era prosa): `vento.caduteInRaffica` (comandi.js, ramo Crescendo) toglie dal campo il bersaglio e `controllaFiloPerso` scrive il filo perso; 4 test, sabotaggi rossi. Screenshot 390×844 guardati (coda, dadi, conseguenza). `test-vento-ui.mjs` richiede `node webapp/server.js`. |
| 2026-10-05 | Task 5 | (git log: «il pilota di misura …») | `misura-episodio.mjs`: `proveVento()` dopo `attendiFaseEroi`. Scoperto che il pilota non sapeva scegliere la porta delle carte Favore (stallo in fase nemici, anche SENZA vento: provato con `ventoAttivo=false`): aggiunto `.fav-scelta` (prima porta). Misura Ep11 N=20 (4×5 in parallelo, git pulito, server 8017): **senza vento 60% (6 piene+6 parziali), con vento 35% (1 piena+6 parziali)**, round medi 16.3→18.5. Sotto banda 55-75: non ritarato. Simulatori Python non toccati. |
