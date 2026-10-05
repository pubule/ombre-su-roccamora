# Handoff — dove siamo

## FATTO (05/10/2026): effetti delle carte Minaccia applicati dal motore + REGOLA DEL VENTO Ep11

Piani: `docs/superpowers/plans/2026-10-05-effetti-carta-non-applicati.md` e `docs/superpowers/plans/2026-10-05-regola-del-vento-ep11.md` (tutto spuntato, rulings e registro in fondo).
Vento Ep11: a inizio round chi sta su tessera ESPOSTA prova NERVI (base Facile, +1 gradino per Crescendo, +1 T4, +1 T6, tetto Difficile; buio −1 salvo Lanterna da Guglia; +1 Taccuino, +1 D3 esatta); chi fallisce perde lo scatto, e a 1 Ferita subisce 1 danno (salvo Corda del Campanaro). Le azioni restano bloccate finche' la coda `sp.provaVento` non e' vuota; le prove le tira chi arbitra. La Raffica fa cadere il Caposquadra all'ultima Ferita sull'esposto (filo perso).
**Misura Ep11 (pilota Playwright, 4 eroi, N=20, codice fermo, 05/10/2026): prima 60% (6 piene + 6 parziali), dopo 35% (1 piena + 6 parziali), round medi 16 → 18.5.** Sotto la banda 55-75: NON ritarato, decide il tavolo (memoria «il tavolo giudica»). Il pilota ha imparato anche le carte Favore (prima restava in stallo a 'Scegliete quale porta si apre'): TUTTA la mappa pilota precedente per gli episodi con Favore e' da rifare.
Rulings piu' discutibili: base Facile + tetto Difficile; danno da vertigine letterale a 1 Ferita; «Vento al massimo» e' in T6, non T5. Simulatori Python non aggiornati (solo prefiltro).

## Plancia lanterne: Task 1-9 FATTI e rivisti (05/10/2026); restano solo prove umane

Tutte le 21 spedizioni hanno scenografia scritta a mano; revisione finale (opus) fatta, tre
correzioni applicate (ac9e35b69), nessun blocco. Commit locali su main, NON ancora pushati.

**Da guardare al tavolo / sul telefono (Task 10, serve gente e dispositivi veri):**
- Step 1: `node webapp/server.js`, dal telefono `http://<IP PC>:8017/`, Spedizione Ep.1 ed Ep.11
  (tetti), vista eroe e arbitro. Il passo dell'eroe e il tremolio delle luci non devono scattare.
  Sospetti in ordine: `drop-shadow` di `.pezzo-fa.ombra`/`.fiamma` (app.css ~974), poi la
  lettura di `offsetLeft` a ogni frame in digitale.js ~1631 (layout forzato), poi `stanzaHtml`
  chiamata due volte per render. Luci fisse oggi: max 4 per tessera (tetto del piano: 8).
- Step 2: un episodio intero al tavolo: leggibilita' al buio di caselle e nemici; il buio aiuta
  l'ansia o nasconde troppo?
- Step 3: deploy solo dopo l'ok del committente: `python webapp/export-assets.py`,
  `bash deploy/deploy.sh`, poi `roccamora.smartcores.org` e una Spedizione (i PNG di
  `/assets/vtt/` devono dare 200; verificato in locale: 6618 URL, nessuno mancante).
- Residui noti: mockups/tessere-alt/regole-posto.js ha le vecchie regex riva/fondament.

## Revisione finale plancia lanterne (24/09 sera) — tre correzioni

- **Anteprima della notte stabile**: `intenzioni()` (digitale.js) usa un caso fisso
  (`CASO_ANTEPRIMA`), e `pianoNemici` porta `attacco.candidati` (campo additivo: gli eroi
  adiacenti). Con piu' candidati la carta dice «colpira' uno di voi» (senza Difesa, che
  dipende dal bersaglio), con uno solo lo nomina. La notte vera resta a Math.random.
  Non modificato: se un PNG vulnerabile e' adiacente il caso fisso lo sceglie sempre
  nell'anteprima (era 50%).
- **`perche` non esce**: `con_scenografia` (export-data.py) esporta solo `decori`/`arredi`;
  test-scenografia.mjs controlla che nei dati esportati non ci sia `perche`.
- **Citta' sotto i tetti solo se un tetto e' rivelato** (`sp.rivelate`, non l'episodio
  intero): test-plancia-fa parte4 prova Ep.11 con la sola T1 (niente citta') e con T1+T2.
- Provati col sabotaggio (CASO casuale + UI che nomina; citta' sull'episodio intero).

## IN CORSO (25/09/2026) — la Spedizione nuova: plancia a lanterne + HUD a tre colonne

Decisa col committente. Tutto sta nel piano
`docs/superpowers/plans/2026-09-24-plancia-lanterne.md` (10 task; si riprende dal primo
non spuntato) e nella guida `docs/scenografia.md` (vincolante per le stanze).

**Task 1 FATTO (25/09/2026)**: estratta la regola del pavimento in `webapp/public/motore/ambiente.js`
(`PAVIMENTI`, `FUORI_DI`, `pavimentoDi()`, `fuoriDi()`, `alAperto()`, `fuoriDichiarato()`).
Una sola fonte per le tessere stampate (pittura-vtt.js) e la plancia digitale.
Test: `node webapp/test-ambiente.mjs` (127 tessere OK).
Il generatore require() il modulo ES-compatibile (Node CJS-ESM interop).

- Specifica visiva: `webapp/public/mockups/tessere-alt/5-spedizione.html` (HUD B a tre
  colonne) e `6-scenografia.html` (prova della guida: Ep.1 e i tetti dell'Ep.11, fuori
  dell'episodio su tutti i 21). Server: `node webapp/server.js`, porta 8017.
- I pezzi FA dei mockup (`tessere-alt/fa/`, 46 MB) NON sono in git: si rigenerano con
  `python scripts/importa-fa-lanterne.py` (dopo `python scripts/importa-fa.py`).
- Gia' fatti (fuori dal piano): «pietra» di importa-fa.py era uno strato di sole fughe
  (ora Stone_Tiles, con un controllo che rifiuta i pavimenti trasparenti); ballatoio →
  pietra; campo `pavimento` sulla tessera (Ep.11 T1 abbaino = assi); export di
  `pavimento`/`esposta`.
- Esecuzione: un subagente per task; per il Task 8 (scenografia di 20 episodi) uno per
  episodio. Dopo un limite d'uso: questo file + `git log`, poi il task successivo.

**Task 2 FATTO (25/09/2026)**: `scripts/importa-fa-lanterne.py` scrive muri/porte/decori
in `webapp/vtt/` (non piu' nel mockup); `webapp/export-assets.py` li porta in
`webapp/assets/vtt/` (URL `/assets/vtt/{muri,porte,decori}/*.png`, verificato 200 a
server acceso). Catalogo `webapp/vtt/decori/CATALOGO.json` (derivato, non in git, come
tutto `webapp/vtt/`): **85 pezzi**, tutte le 12 famiglie della tabella di
`docs/scenografia.md` con almeno 6 (acqua e' la piu' stretta, esattamente 6). Un pezzo
sostituito guardando il PNG: `tife-marce` puntava a `Cattail_Brown_A1` (disegno vero su
22x22px dentro una tela 200x200 — quasi un punto, invisibile a scala di gioco), ora
`Cattail_Brown_A12` (un ciuffo vero, 128x120px). **Non fatto, fuori scope**: lo Step 5
del piano (`FA()` → `/assets/vtt/`, cancellare `tessere-alt/fa/`) — `FA()` non vive in
`1-lanterne.html` (25 righe, nessun riferimento) ma in `lanterne.js` riga 10, condiviso
con `5-spedizione.html`; toccarlo e' fuori dalla lista file del Task 2. `tessere-alt/fa/`
resta per ora (cancellarlo romperebbe il mockup finche' `FA()` non e' ripuntato).

**Task 3 FATTO (25/09/2026)**: composizione della stanza. `webapp/public/js/plancia/ambiente-fa.js`
(decori di ripiego per famiglia di pavimento con seme stabile, `arredoFa`/`arredoDelPosto`,
`torceDi`) e `stanza.js` (`stanzaHtml`, portato dal mockup `lanterne.js` con le porte dove
le mette `portaCella`, non a indice fisso). `decoriDi(ep, tile)`: se `tile.scena` esiste
(scenografia scritta, Task 7/8) vince quella, altrimenti la regola di ripiego — la strada
c'e', il contenuto lo scrivono i task dopo. `export-data.py` fonde `src/scenografia/<id>.json`
in ogni tessera prima del dump, se il file esiste (verificato: senza, export bit-identico a
prima; con un fisso di prova, `scena` compare solo sulla tessera giusta; `sys.exit` se la
scenografia nomina una stanza che l'episodio non ha). Test: `test-stanza.mjs` (127 tessere +
3 casi Review Focus: porta con arredo davanti, scale sparse, altari in verticale), tutti e tre
i sabotaggi del piano mordono (porta a indice fisso, `libere()` senza porte, seme con
`Math.random`); `test-scenografia.mjs` (0 scenografie oggi, sabotaggio con `ep1.json` finto
verificato a mano e cancellato). `src/scenografia/` non esiste ancora (vuota per davvero,
la popolano i Task 7-8).

**Task 4 FATTO (28/09/2026)**: il buio della plancia. `webapp/public/js/plancia/luce.js`
(`creaLuce(el, {cell}) → {dimensiona, imposta, avvia, ferma, vivo}`), portato pari pari dal
ciclo del mockup `lanterne.js` (due canvas a un quarto risoluzione — `buio` che si buca con
`destination-out`, `calore` sommato con `lighter` — allargati dal CSS, non da una maschera
SVG che scattava sul telefono). `imposta(sorgenti, {canto})` prende una funzione richiamata
a ogni fotogramma, non un array fisso: e' cosi' che segue gettoni e canto che cambiano senza
ricreare l'oggetto. Il ciclo si ferma da solo se `el` esce dal DOM (`el.isConnected`) e
`ferma()` chiama `cancelAnimationFrame` in modo sincrono, nessun fotogramma residuo dopo.
Test: `webapp/test-luce.mjs` (Playwright, server su 8017): una lanterna a (200,200) su una
plancia 800x800, alfa del canvas buio ~0 sotto la luce e 255 lontano, `vivo()`/`ferma()`
verificati. Sabotaggi mordono entrambi: fillRect del buco commentato → 'sotto la lanterna
e' ancora buio'; `el.isConnected` tolto insieme a `L.ferma()` nel test → 'ciclo non parte o
non si ferma'; ripristinati, test torna verde. Non toccato: `digitale.js` (Task 5, ci
collega questo modulo) e i mockup (solo lettura).

**Task 5 FATTO (28/09/2026)**: l'innesto nella Spedizione vera. `boardHtml()` (`digitale.js`)
disegna le tessere rivelate con `stanzaHtml()` (`.stanza-fa`, non piu' `.tessera-b` col PNG
dipinto); le coperte restano segnaposto scuro. `agganciaMappa()` accende `creaLuce()` sulla
`.board-digitale` (un solo oggetto, tenuto finche' e' appeso allo stesso nodo — quasi mai fra
un render e l'altro, sempre dentro lo stesso) e passa le sorgenti fisse (torce/candele dai
decori, ricalcolate da `stanzaHtml().luci`) piu' le lanterne degli eroi lette dal
`.tok-slot[data-tok^="E:"]` in pagina — cosi' la luce segue anche `scivolaEroe()` senza essere
avvisata. **Step 4a (fuori dell'episodio)**: la plancia si allarga di una tessera di margine
(`ctx._geo`), e ogni riquadro vuoto prende il fuori (acqua/melma scorrono, erba/roccia/terra
ferme e scure) della stanza RIVELATA piu' vicina (Chebyshev su `layout()`) che lo dichiara con
`fuoriDichiarato()` — porto del ciclo «IL FUORI E' DELL'EPISODIO» di `6-scenografia.html`.
**Step 4b (i tetti)**: nuovo `webapp/public/js/plancia/citta.js` (`citta(W,H,seme)`, porto
fedele), appeso come primo figlio di `.board-digitale` (sotto tutto) quando almeno una tessera
e' `alAperto()`; ridisegnato solo quando la misura cambia, non a ogni fotogramma. Vento
(`.vento`/`.forte`, CSS-only) sulle tessere ESPOSTE. CSS: `.stanza-fa`/`.pav-fa`/`.pezzo-fa`
(+ombra/decoro/fiamma/porta-fa)/`.fuori-fa`/`.onda-fa` coi filtri dei Global Constraints
(`mockups/tessere-alt/lanterne.css`); `canvas.buio{z-index:4}`, `canvas.calore{z-index:2}`;
`.tok-slot`/`.cella-mossa` a `z-index:5` (sopra il buio, o si spegnerebbero anche loro);
`.cella-mossa::after` quadrato (`border-radius:8px`, non piu' `50%`); vignetta su
`.board-area::after`; `.credito-fa` sotto la plancia. Rimossi `urlBoard`, le etichette
`.porta-lbl` (ora la porta si vede) e i quadretti `.cella-b`/arredo (dentro `stanza.js`).
Test: `webapp/test-plancia-fa.mjs` (Playwright) — stanze composte, niente PNG dipinti, buio
presente, caselle quadrate, credito FA, la luce si ferma uscendo (`?prova` → `window.__luceViva`);
Ep.1 tutto svelato → il margine e' tutto acqua anche lontano da T1; Ep.5 → zero riquadri di
fuori; Ep.11 → `canvas.citta` presente. Sabotaggi (Step 7) mordono/non mordono come atteso:
(1) rimesso lo sfondo PNG sulle rivelate → 'tessere dipinte ancora in uso'; (2) fatte disegnare
anche le coperte come stanze vere → il test NON fallisce, e apposta: nessun nemico compare
perche' l'ENGINE (non il rendering) crea i nemici solo a `sp.rivelate.push` avvenuto
(`azioni.js:184`, `spawnDaTesto` chiamato subito dopo, stesso blocco) — commentato nel test.
Girati insieme (server 8017): `test-plancia-fa`, `test-digitale-ui`, `test-arredi`, `test-stile`
puliti; `test-partite` ha KO pre-esistenti e indipendenti da questo task (timeout su
`.reperto-img` in fase Indagine, 9-10 KO sui primi 15 scenari) — confermato con `git stash` sul
codice non toccato: stessi KO, stesso pattern, prima del Task 5.
**Fix (stesso giorno, dopo la review)**: il concern sopra e' risolto. `luce.js` (`dimensiona`)
accetta ora un terzo argomento opzionale `regioni` (array di `{x,y,w,h}`); omesso/null scurisce
tutto il canvas come sempre (default invariato, `test-luce.mjs` intatto). `digitale.js`
(`boardHtml()`) costruisce `ctx._geo.regioniBuio` riusando la stessa geometria dello Step 4a
(ogni tessera mostrata + ogni riquadro di fuori/acqua non-tetti); `agganciaMappa()` la passa a
`luce.dimensiona()` solo se l'episodio ha tetti, altrimenti niente (comportamento di sempre).
`test-plancia-fa.mjs` (parte4) legge il canale alfa di `canvas.buio` su un punto del vuoto sotto
i tetti (deve restare 0, sabotato e confermato: passando `null` senza condizione l'alfa saliva a
255) e su un angolo di stanza rivelata (deve restare scuro). Girati di nuovo (server 8017):
`test-luce`, `test-plancia-fa`, `test-digitale-ui`, `test-arredi`, `test-stile` puliti.
`test-partite` non ri-controllato: il fix non tocca nulla vicino a cio' che esercita (Indagine),
i KO restano quelli pre-esistenti gia' confermati con `git stash`.
**Task 6 FATTO (28/09/2026)**: l'HUD a tre colonne. Porto di
`mockups/tessere-alt/5-spedizione.html` — `render()` in `digitale.js` non scrive piu' la
`.barra`+`.board-area`+`.lato` «tutto a schermo»: a sinistra `#col-eroi` (una `capoHtml()` in
alto, poi `cartaEroe(nm)` per eroe — quella di turno si apre su attributi, arma (`armaDi()`,
letta dall'`equip`), l'abilita' **solo «In spedizione»** da `caricaDi()`/`abilRigaDi()` — mai
da `e.abil`, che porta anche il testo d'indagine — le migliorie (`miglioriteHtml(nm)`, ora con
un filtro per eroe), i tasti di `azioniHtml()` riusati cosi' come sono, e l'ultimo tiro
riassunto (`ctx.ultimiTiri`, popolato in `riproduci()` a ogni evento `tiro`, view-only, non si
salva)), al centro la plancia di Task 5 invariata, a destra `#col-notte` (`notteHtml()`: torre
del canto, i nemici con Att/Dif/Dan/Mov e **cosa faranno** — `intenzioni()`, Step 3 del piano,
`pianoNemici` su una COPIA — l'obiettivo intero coi PNG scortati, gli oggetti, le domande,
il diario in `.sez-diario`). Sul telefono (`<900px`, qualunque ruolo — non piu' solo
`!arbitro()`) le tre colonne diventano schede eroi/la notte/diario, CSS puro
(`:has(#col-eroi)`, `vistaScheda()`). Test: `webapp/test-hud-spedizione.mjs`.

**Il brief del piano aveva un bug nel suo stesso Step 3**: `intenzioni()` come scritto passava
`() => 0.5` al posto di un `caso` — ma `pianoNemici` chiama `caso.scegli(n)`, non `caso(n)`, e
quella riga lancia `TypeError: caso.scegli is not a function` appena c'e' piu' di un bersaglio
possibile (verificato eseguendolo: crash riprodotto e poi tolto). Corretto passando il `CASO`
gia' in uso per la notte vera (`Math.random` dentro `.scegli`) — per un'anteprima non serve
deterministico, e `tira2d6` non lo chiama nessuno con `differito=true`.

**Un difetto vero, trovato SOLO eseguendo** (non nel diff): la carta eroe porta `data-eroe`
sulla carta INTERA, non piu' solo sul token — e un tasto dentro (`data-abil`, «cerca», «fine»)
fa risalire il click, per bolla, al gestore generico `[data-eroe]`, che tra le sue righe fa
`sp.escaModo = null` («via d'uscita: chi ci ripensa tocca un eroe»). Risultato: cliccare «usa»
sull'Esca di Carbone l'accendeva e la spegneva nello stesso tocco — `test-abilita.mjs` e' andato
da 14/14 a 5/14 sulla sezione esca. Il gestore ora esce subito se il click arriva da un
`button` (`ev.target.closest('button')`), una riga sola, buona anche per `[data-nemico]` se un
domani porta bottoni dentro.

**Compatibilita' coi piloti**: `misura-ep1.mjs`/`misura-episodio.mjs` selezionano il turno con
`[data-turno="nome"]` (`turnoEroe()`) — la vecchia chip di `giroEroiHtml()`, tolta insieme alla
striscia dei turni (le carte eroe la sostituiscono). La carta porta ora `data-turno` ACCANTO a
`data-eroe`, stesso elemento: i piloti non cambiano una riga. `test-abilita.mjs` lo esercita
gia' (la sua `notte()` clicca `[data-turno]`) ed e' rimasto verde.

**Girati** (server 8017, uno-a-uno e a coppie — sei playwright insieme mandano questa macchina
in timeout di navigazione, non e' un difetto del codice: risolto a coppie/da soli, sempre
verdi): `test-hud-spedizione`, `test-plancia-fa`, `test-digitale-ui`, `test-abilita`,
`test-stile` puliti; `test-abilita` ha 2 KO pre-esistenti («colpo da macello di Ottone»,
confermati identici con `git stash`); `test-migliorie-app` fallisce identico a `git stash`
(bug pre-esistente, non toccato). `test-mio-eroe` (wrangler dev, porta 8787) pulito.
Sabotaggi (Step 7) mordono/ripristinano tutti e tre: (1) tolta la riga CSS che nasconde il
diario nella scheda «la notte» → il test lo vede subito (`diario:1`, atteso 0); (2) rimesso
`e.abil` (che porta «In indagine») nel blocco abilita' → `abilSenzaIndagine` cade; (3)
`intenzioni()` su `g` invece della copia → serviva un nemico che LOGGA a ogni giro per
accorgersene (un accecato si consuma alla prima lettura, un secondo `render()` non lo
ritrova piu' acceso): il seme usa un'esca di Carbone che un nemico segue a ogni pianificazione,
e li' il diario cresce ogni volta — SP().log passa da 3 a 5 righe in un giro solo, sabotato.

Aggiornati anche (selettori vecchi `#p-giro`/`#p-azioni`/`#p-salute`, spariti con l'HUD):
`test-posto-eroe.mjs` (le due verifiche sull'ordine dei pannelli diventavano, con la griglia
nuova, verifiche sulla presenza delle schede sotto i 900px — per QUALUNQUE ruolo, non piu' solo
il giocatore: e' la larghezza a deciderle, non `!arbitro()`), verificato verde;
`test-telefono-azioni.mjs` (selettore aggiornato a `#col-eroi .ce.on .tasti`, non ri-eseguito:
vuole `wrangler dev` con `OSR_DEV_EMAIL` e un tavolo vero, fuori dal giro di misura di oggi).

**Fix round 1 (28/09/2026, dopo la revisione)**: `test-telefono-azioni.mjs` girato per davvero
(`build-dist.sh` + `wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787`, come
lasciato scritto sopra) — e' andato in crash. `mazzoRestano()` (nuova del Task 6) leggeva solo
la forma di `SP().mazzo` da arbitro (`{ordine, indice}`); su un tavolo vero un GIOCATORE la
riceve gia' potata da `motore/proiezione.js:142` a `{restano, rimescolato}` — l'ordine del
mazzo e' il segreto del round dopo, e non deve lasciare lo schermo di chi arbitra. `m.ordine.length`
su `undefined` lanciava dentro il template di `render()`, prima di scrivere `app.innerHTML`:
schermata d'errore generica per OGNI giocatore, sempre, appena in Spedizione — non un caso
limite, il percorso di default di `vista-eroe`. Non lo prendeva `test-hud-spedizione.mjs` perche'
semina `vistaDigitale()` in locale senza un tavolo vero, quindi vedeva sempre la forma intera
anche per un posto giocatore: aggiunto un caso che semina la forma potata, cosi' la suite sulla
8017 non ha piu' bisogno di un `wrangler dev` per una regressione di questa famiglia. Corretta
`mazzoRestano()` a riconoscere entrambe le forme. Un secondo difetto, stessa causa (HUD nuovo,
lezione vecchia non riapplicata): con la carta corretta, la griglia a tre colonne chiudeva
`#col-eroi` a `1fr` con lo scroll solo interno — per chi arbitra va bene, ma per chi gioca da
telefono la pagina intera deve poter scorrere fino ai tasti, la stessa regola gia' scritta per
il vecchio `.vista-eroe` e non riportata sulla struttura nuova. Corretto con
`#app.vista-eroe.immersivo:has(#col-eroi)` scoped (non tocca l'arbitro ne' il desktop).
`test-telefono-azioni.mjs` verde due volte contro `wrangler dev`; resto dello Step 6 (porta
8017) rilanciato, identico al giro precedente. Non toccato (pre-esistente, stessa famiglia di
difetto, fuori dal mandato di questo giro): `motore/abilita.js:120-123,225-230` (il Sesto Senso
di Sibilla) legge `m.ordine`/`m.indice` con la stessa assunzione di forma unica.

**Task 7 FATTO (28/09/2026)**: la scenografia dell'Episodio 1 — il metro per le altre 20.
`src/scenografia/ep1.json`: T1/T3/T6 copiati verbatim dagli esempi della guida
(`docs/scenografia.md`); T2 (Sala delle casse), T4 (Ufficio del Custode) e T5 (Scala al
piano interrato) composti da zero leggendo `testo`/`cerca`/`cerca_vuoto` di `ep1.json` e il
catalogo (`webapp/vtt/decori/CATALOGO.json`, 85 pezzi). Trovato durante la composizione,
utile per chi scrive gli altri 20: `webapp/public/mockups/tessere-alt/scena/ep1.json`
esiste gia' e ha una versione approvata di TUTTE le sei stanze (non solo T1/T3/T6 che la
guida cita) — non l'ho copiata (il brief chiedeva di comporre T2/T4/T5 da sola sugli spunti
del task), ma il primo giro (senza punto focale in T2/T4/T5) reggeva la macchina
(`test-scenografia.mjs` verde) e guardando le foto era piu' debole di quel riferimento:
rivisto un giro, T2 ha preso un `nido` (risponde a «qualcosa, tra le pile, scricchiola» del
testo senza dirlo), T4 uno `sgabello-rovesciato` davanti alla scrivania (il «qualcosa e'
appena successo» del mood — non solo un calamaio rovesciato, un mobile ribaltato si legge
molto meglio in foto), T5 uno spartito caduto ai piedi della scala (punto focale) piu' una
candela nera SPENTA (nessun campo `luce`: dice che chi e' sceso portava la propria luce).
**Step 1**: `webapp/mappa-plancia-fa.mjs` (Playwright) — semina una spedizione con TUTTE le
tessere rivelate (come `test-plancia-fa.mjs` Parte 2) e un eroe alla volta al centro di ogni
stanza (cella libera piu' vicina al centro, mai su un arredo), zoom della `.board-digitale`
azzerato a 1 e `deviceScaleFactor` calcolato apposta (800/416) cosi' la foto e' 800x800 senza
sfocare i pezzi (supercampionatura vera, non uno zoom CSS che stira il raster). Trovato
guardando le prime foto: **il riquadro turchese delle caselle raggiungibili copriva mezza
stanza** (l'eroe seminato aveva 0/2 azioni, quindi era "attivo" e tutte le sue caselle di
movimento si accendevano) — corretto seminando `eroiFatti: party, eroiAttivo: null`
(nessun eroe attivo = nessuna casella accesa, la lanterna resta comunque accesa perche' la
legge dal token in pagina, non dalla fase). `--tutte` fotografa l'ingresso di ogni episodio
e compone `logs/plancia-fa/foglio.jpg` (una pagina HTML con le foto in base64, fotografata a
sua volta — niente libreria di composizione immagini in piu', playwright c'e' gia'). Le foto
restano in `logs/plancia-fa/` (aggiunto a `.gitignore`), mai committate.
**Verificato guardando**, non solo leggendo il JSON: `node webapp/mappa-plancia-fa.mjs --ep
ep1` (0 errori, 0 404 su `/assets/vtt/`), le sei foto aperte una per una col controllo della
guida, confrontate col mockup di riferimento — un giro di correzione (sopra) prima di
committare. Test: `python webapp/export-data.py && node webapp/test-scenografia.mjs` → `OK 1
scenografie`.

**Prossimo**: Task 8 del piano (`docs/superpowers/plans/2026-09-24-plancia-lanterne.md`) — la
scenografia degli altri 20 episodi, un subagente a episodio, ognuno giudicato contro Ep.1.

**Task 8 — preludio FATTO (28/09/2026)**: `src/scenografia/preludio.json`, le tre tessere
della "Prova del Lume" (T1 banchina della dogana, T2 il deposito, T4 lo stanzino del
daziere — non sequenziali, l'episodio non ha T3/T5/T6). Composte da zero leggendo
`testo`/`exits`/`arredi` di `webapp/data/preludio.json` contro il catalogo esistente (nessun
pezzo mancante, `scripts/importa-fa-lanterne.py` non toccato). T1 e T4 hanno arredi/uscite
quasi identici a T1/T4 dell'Ep.1 (stessa banchina-molo-casse, stesso schema scrivania-branda),
quindi la composizione li rispecchia da vicino di proposito — corda/barile/pozza/torce doppie
per la banchina che qui e' anche il punto di vittoria (riportare Ansaldo alla barca);
sgabello-rovesciato + calamaio rovesciato per l'interruzione sulla scrivania del daziere,
catene vicino alla branda per dire come Ansaldo e' stato tenuto (senza mostrare il PNG
scortato, che e' arredo/token di motore, non decoro). T2 (deposito, "la dogana e' un guscio")
resta buio come il Sala-delle-Casse dell'Ep.1: nessuna luce fissa. Zero sangue nelle tre
stanze: nessun testo lo giustifica. Verificato guardando le tre foto (`node
webapp/mappa-plancia-fa.mjs --ep preludio`) affiancate a quelle dell'Ep.1 — nessuna
correzione necessaria al primo giro. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Task 8 — ep2 FATTO (29/09/2026)**: `src/scenografia/ep2.json` (La voce del bronzo),
T1-T6 composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di
`webapp/data/ep2.json` contro il catalogo esistente (nessun pezzo mancante,
`scripts/importa-fa-lanterne.py` non toccato). T1 (Banchina delle Scorie) riusa lo
schema-molo dell'Ep.1 ma capovolto nel mood: non e' un arrivo sicuro (e' l'ambush
dell'Isola delle Scorie), quindi zero luci fisse e un'`ancora` arrugginita come punto
focale ("qualcosa di piu' antico") al posto delle torce. T6 (Sala dei Forni, il boss)
mostra le campanelle grezze della rastrelliera (`campana` x2, coi "due posti vuoti" del
testo) senza favorire visivamente il crogiolo sull'uscita segreta rispetto alle due
forme-decoy: decori distribuiti equidistanti dai tre mobili.

**Due difetti trovati SOLO guardando le foto, non nel JSON:**
1. **`fumo` e' illeggibile su questo motore**: il PNG ha alpha reale (verificato con
   PIL, non e' un'immagine piatta), ma e' fumo SCURO su pavimenti gia' scuri (ghiaia,
   mattoni, mattonelle) — anche ingrandito restava un'ombra indistinguibile dalla
   texture. Sostituito ovunque con la famiglia `carbone`/`carbone-2`/`carbone-mucchio`
   (braci nere, sagoma netta): visibile subito in T6 (mucchio grande), leggibile da
   vicino in T2/T5 (piccolo, voluto — "terra ancora calda" non e' un fuoco vivo).
2. **Il token-eroe della foto (`cellaCentrale` di `mappa-plancia-fa.mjs`) copre sempre
   la stessa cella "centrale"** di ogni tessera rivelata (dati (1,1) se libera, altrimenti
   il prossimo candidato) — un decoro messo li' e' semplicemente invisibile nella foto di
   verifica. Presa in T3 (la `pozza` focale finiva sotto il ritratto) e in T1 (due pezzi
   finivano dietro il gruppo di partenza in basso a sinistra): spostati, ora tutti visibili.

**Lezione da portare avanti**: dopo OGNI modifica al JSON, `python webapp/export-data.py`
PRIMA di rilanciare `mappa-plancia-fa.mjs` — l'ho dimenticato una volta a meta' sessione
e ho passato un giro intero a guardare foto che in realta' erano ancora la versione
precedente (stessa`fumo`, stesse coordinate): tre render "senza cambiamenti" che in
realta' non avevano mai visto il nuovo JSON. Vale il principio "misura a codice fermo"
al contrario: qui era il DATO fermo, non il codice.

Verificato guardando tutte e sei le foto (`node webapp/mappa-plancia-fa.mjs --ep ep2`)
affiancate a quelle dell'Ep.1, due giri di correzione (sopra) prima di committare. Test:
`python webapp/export-data.py && node webapp/test-scenografia.mjs && node
webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep3` — stesso procedimento, giudicato contro Ep.1 e preludio.

**Task 8 — ep3 FATTO (29/09/2026)**: `src/scenografia/ep3.json` (Le voci del pozzo),
T1-T6 composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di
`webapp/data/ep3.json` contro il catalogo esistente (nessun pezzo mancante,
`scripts/importa-fa-lanterne.py` non toccato). Episodio tutto sotterraneo (pozzi
murati, cisterne, gallerie): scelta deliberata di **zero luci fisse** in cinque
tessere su sei (solo T1 ne ha una) — il testo non nomina mai fuoco quaggiu', e il
buio uniforme e' coerente col genere (caccia furtiva in un covo, non un rifugio).

**Due giri di correzione guardando le foto** (non nel JSON, la stessa lezione di
preludio/ep2 — un punto focale tecnicamente presente ma dark-on-dark/troppo
sottile per il colpo d'occhio):
1. **T1**: la `pozza` prevista come focale rendeva un'ombra chiara indistinta
   sulle assi, illeggibile. Sostituita con **una sola torcia accesa** — come il
   T1 dell'Ep.1 e' l'unico posto davvero illuminato della Spedizione (qui: dove
   si torna a vincere con Tobia), e la fiamma calda contro il legno buio si
   vede subito.
2. **T2**: il punto focale scelto (`catene`) rendeva come un piccolo scarabocchio
   sottile, quasi invisibile sull'acqua. Sostituito con una **gabbia** arrugginita
   (controllato il PNG sorgente prima di usarla): il grigliato scuro e pesante
   ("verticale e ferro") contro l'acqua chiara si vede a colpo d'occhio e lega
   visivamente la sala alla prigionia di Tobia in T6.
3. **T5**: il secondo pezzo `organo` (canne di piombo in rastrelliera) ruotato a
   85° collassava in una sottile barretta verticale illeggibile — la sagoma reale
   del pezzo (controllata sul PNG sorgente: una base di legno con 5 fori tondi,
   vista dall'alto) non regge rotazioni estreme. Riportato a 15°, entrambe le
   copie ingrandite leggermente.

**Da non mostrare in scena, verificato tessera per tessera**: la lanterna da
minatore (T2, campo `cerca`), la scatolina col Campanello di Piero e la canna
senza sigillo col nome PIERO (T5, entrambe dentro il campo `cerca`, non `testo` —
le rastrelliere generiche di canne SI mostrano, quelle due no).

Verificato guardando tutte e sei le foto (`node webapp/mappa-plancia-fa.mjs --ep
ep3`) affiancate a quelle dell'Ep.1, un giro di correzione (sopra) prima di
committare — `export-data.py` rilanciato PRIMA di ogni rigenerazione foto, come
da lezione dell'ep2. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep4` — stesso procedimento, giudicato contro Ep.1, preludio
ed ep2/ep3.

**Task 8 — ep4 FATTO (29/09/2026)**: `src/scenografia/ep4.json` (Il teatro
dell'eco), T1-T6 composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/
`arredi` di `webapp/data/ep4.json` contro il catalogo esistente (nessun pezzo
mancante, `scripts/importa-fa-lanterne.py` non toccato — cercato in
`risorse-vtt/FA_Assets_Webp` un pezzo per i "fondali arrotolati"/"cielo
stellato" di T2 e per gli "specchi coperti da lenzuoli" di T4, ma niente di
buono: la libreria non ha tele arrotolate ne' specchi coperti, solo cornici
viste di taglio — illeggibili dall'alto — e specchi "rotti". Deciso di NON
forzare un pezzo sbagliato: T2 usa una topiaria secca vera come prop di
"bosco finto" (deduzione dal posto, principio 1), T4 usa specchi rotti al
posto di specchi coperti — la rottura dice lo stesso abbandono).

Episodio tutto backstage/sottopalco: **zero luci fisse in quattro tessere su
sei**. Le due eccezioni hanno un perche' preciso: T1 (la Quinta di Carico) e'
anche il punto di ritorno/vittoria — una sola torcia, come il molo dell'Ep.1
e la banchina dell'Ep.3, fa da faro del "siete salvi"; T6 (la Conchiglia) ha
un cero acceso vicino al leggio di spartiti, lasciato da chi lavora ancora
alle lastre di cera prima del sipario.

**Un errore di sistema di coordinate, prima di render**: avevo capito
`portaCella` come diretta cella-porta in spazio-decoro. Non e' cosi' —
`test-scenografia.mjs` applica un SECONDO flip `3-y` all'output di
`portaCella` per ottenere la cella in spazio-decoro (la porta N di T1
risultava (1,3) dal mio calcolo, ma la cella vera in spazio-decoro e' (1,0)
— confermato dal test che ha bocciato uno straccio li' sopra al primo giro).
Derivata la formula corretta leggendo `test-scenografia.mjs` riga per riga:
porta N=(idx,0), S=(idx,3), E=(3,idx), O=(0,idx) in spazio-decoro — la stessa
intuizione naturale (N=riga0=alto) a cui ero arrivata a occhio, solo con
un passaggio in piu' che avevo saltato. Corretto lo straccio di T1, test
verde.

**Due giri di correzione guardando le foto** (non nel JSON — la stessa
lezione di preludio/ep2/ep3, un punto focale tecnicamente presente ma troppo
debole per il colpo d'occhio):
1. **T3** (Sala dei Contrappesi): il gruppo di corde ("funi che salgono nel
   buio") stava in alto, piccolo, e perdeva subito contro le quattro casse
   grandi e simmetriche ai lati. Ingrandito (corda principale lato 0.95→1.3)
   e spostato ben dentro lo spazio libero centrale, lontano dalla cella dove
   cade il token-eroe della foto — ora e' la prima cosa che si vede.
2. **T5** (Fossa del Contrappeso Morto): la catena sulla parete destra era
   troppo sottile contro il pavimento metallo scuro. Ingrandita (lato
   1.1→1.3) e riposizionata per restare dentro i bordi della stanza.

**Controllato il token-eroe della foto su tutte e sei le tessere** (lezione
ep3: puo' nascondere un pezzo): per ognuna ho calcolato a mano le celle
libere "centrali" candidate (le quattro equidistanti dal centro reale della
griglia) e tenuto ogni decoro fuori da quelle celle, poi verificato a occhio
sulle foto — nessuna occlusione, il token cade sempre lontano dai pezzi
scelti (T3: cella (1,2), tutti i decori altrove).

**Non mostrato in scena, per il campo `cerca`**: la lanterna cieca del
trovarobe (T2) e la maschera dorata dietro lo specchio (T4) — entrambe si
trovano cercando, non sono decoro. La maschera dorata non compare in nessuna
tessera di questo episodio per questo motivo (e' anche l'oggetto di un
luogo d'Indagine, fuori scope di questo task).

Verificato guardando tutte e sei le foto (`node webapp/mappa-plancia-fa.mjs
--ep ep4`) affiancate a quelle dell'Ep.1, due giri di correzione (sopra)
prima di committare — `export-data.py` rilanciato prima di ogni
rigenerazione foto. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep5` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2/ep3/ep4.

**Task 8 — ep5 FATTO (29/09/2026)**: `src/scenografia/ep5.json` (L'organo di
ossa), T1-T6 composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/
`arredi` di `webapp/data/ep5.json` contro il catalogo esistente. Un pezzo
mancante: 'banchi marci in fila' (T2, la navata sepolta) non aveva un pezzo
— cercato in `risorse-vtt/FA_Assets_Webp/.../Furniture/Seating/Benches`,
guardato il PNG (`Bench_Wood_Ashen_A1_2x1`, tavola di legno chiaro/marcio,
sagoma pulita), aggiunto `panca-marcia` a `scripts/importa-fa-lanterne.py`,
rilanciato l'importer (93 pezzi ora) ed `export-assets.py` (altrimenti 404
sulla prima foto — lezione «wrangler serve una copia» vale anche qui, un
asset nuovo va esportato prima di fotografare).

Episodio tutto chiesa-cripta dei Battuti: **buio deliberato in T1/T2/T3**
(nessuna luce fissa — il testo non nomina mai fuoco li', solo salmodia e
freddo), **una sola luce da T4 in poi** (il candelabro sulla scrivania: da
li' qualcuno lavora ancora ai registri), **due luci in T5** (il crogiolo e'
gia' un arredo caldo, piu' un candelabro sul banco) e **tre in T6**, il boss,
l'unica stanza davvero illuminata — una gradazione di luce voluta, dal buio
totale della discesa al fuoco del rito.

**Scoperta guardando le prime foto (non nel JSON) — la stessa lezione di ogni
episodio precedente, ma con una causa nuova**: diversi pezzi del catalogo
hanno il disegno vero dentro un riquadro quasi tutto trasparente (verificato
con `PIL.Image.getbbox()`): `teschio` 26%x35%, `candela-nera`/`cero` 22%x18%,
`calcinacci` 40%x35% — a un `lato` normale escono puntini, non oggetti. Il
`candela-nera` (NERO) sul pavimento di legno SCURO di T1 era proprio
invisibile: sostituito con `cero` (cera chiara, contrasto vero). In T4/T5 il
`cero` sulla scrivania spariva: sostituito con `candelabro-2` (52%x52% di
riempimento, fiamma e metallo visibili). `teschio` (T3/T6) ingrandito
(0.6→0.9-1.05) per compensare. Riga utile per chi arreda dopo: prima di
scegliere un pezzo per un punto focale, `python -c "from PIL import Image;
print(Image.open('webapp/vtt/decori/X.png').getbbox())"` dice se il disegno
riempie davvero il riquadro o no.

**Il token dell'eroe (lezione ep2/ep3/ep4, confermata ancora) ha nascosto
due pezzi al primo giro**: il busto di T2 (messo al centro) e le due candele
nere di T6 (una proprio sotto il token) — invisibili nella prima foto,
spostati in periferia (T2: busto contro il muro vicino all'altare; T6: le
due candele spostate a fiancheggiare l'altare su file 1, lontano dal centro
dove il token cade quasi sempre in queste sei stanze).

**Un arredo forte come punto focale, non solo un decoro**: T1 (la scala) e
T5 (l'officina) hanno un arredo che il gioco disegna gia' acceso/caldo
(rispettivamente `candele` e `crogiolo`) — esattamente lo stesso principio
del T6 dell'Ep.1 (l'altare-arredo con le candele costruite intorno): li' il
punto focale e' l'arredo, i decori ci si costruiscono intorno invece di
competere con un secondo oggetto debole.

**Controllato il token su tutte e sei le tessere** (T1 coi tre token
dell'entrata inclusi: i due agli angoli (0,3)/(1,3) e quello centrale) —
nessuna occlusione residua dopo le correzioni sopra, verificato guardando le
foto rigenerate, non a occhio sulle coordinate.

**Non mostrato in scena, per il campo `cerca`**: la lanterna d'altare
(T2), lo scalpello da liutaio (T5). Il sandalo pietrificato di T1
(`cerca_vuoto`) non ha un pezzo nel catalogo: non forzato, una stanza con un
decoro in meno. Le tre canne da sfregiare di T6 sono un meccanismo di gioco
(contrassegnate sulla tessera): non ridisegnate come decoro.

Verificato guardando tutte e sei le foto due volte (`node
webapp/mappa-plancia-fa.mjs --ep ep5`, `export-data.py` rilanciato prima di
ogni rigenerazione) affiancate a quelle dell'Ep.1, un giro di correzione
(sopra) prima di committare. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Task 8 — ep6 FATTO (29/09/2026)**: `src/scenografia/ep6.json` (Il Terzo
Movimento — finale dell'Atto I, 8 tessere invece delle solite 6), T1-T8
composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di
`webapp/data/ep6.json` contro il catalogo esistente. Due pezzi mancanti: T7
(l'anticamera del coro) chiede "dodici mantelli appesi" e "dodici paia di
scarpe buone allineate" — cercato in `risorse-vtt/FA_Assets_Webp`, guardati i
PNG (`Cloak_Cloth_Black_A1_1x2`, un mantello nero incappucciato che lega
subito al pool ADEPTO INCAPPUCCIATO; `Boots_Leather_Black_A1_1x1`), aggiunti
`mantello`/`scarpe` a `scripts/importa-fa-lanterne.py` (95 pezzi ora),
rilanciato l'importer ed `export-assets.py`.

Le tre sale-vestibolo (T3 Bronzo, T5 Pietra, T6 Ossa) condividono lo schema
arredi crogiolo/forma: T3 e T4 hanno il crogiolo come arredo, che il motore
accende gia' da solo (`fuoco = /candele|crogiolo|stufa/`), quindi **zero luci
decoro aggiunte li'** — stessa lezione di Ep.5 T5/T6. Gradazione di luce
sull'episodio: T1/T2/T5 buio totale (il testo insiste sul buio o sulla
marea), T3/T4 il bagliore automatico del crogiolo, T6/T7/T8 candele vere via
via piu' fitte verso il rito finale.

**Un focal point sbagliato, trovato SOLO in foto**: T3 usava `campana-grande`
(la campana vista da SOPRA, un disco piatto grigio) come punto focale della
"campana APPESA, il battaglio gia' in tiro" — in foto era un secondo disco
indistinguibile dai due arredi rotondi (crogiolo/forma) gia' in stanza,
falliva il colpo d'occhio. Guardato il PNG sorgente di `campana-grande-2`
(stessa campana, vista di lato/tre-quarti): sagoma a campana netta,
riconoscibile subito, spostata lontano dagli arredi rotondi. T5 aveva tre
oggetti "sopra" il leggio (arredo `scrivania`, qui reskin narrativo — il
tavolo di calcolo di chi ha accordato la gola): fogli/calamaio/libro
sparivano del tutto in foto (bbox minuscola contro l'arte del leggio) — tolti
invece di forzarli, lo sgabello rovesciato resta da solo il fuoco della
stanza. T6 (`organo`) e T7 (`scarpe`) ingranditi dopo la prima foto per lo
stesso motivo (lezione 3 gia' nota da Ep.5: pezzi con poco disegno reale nel
riquadro).

**Il cuneo maestro di T5 non ha un pezzo**: cercato "wedge"/"peg"/"chisel" in
`risorse-vtt/FA_Assets_Webp`, niente di credibile (solo spicchi di patata e
utensili da cucina). Non forzato — il meccanismo di gioco (l'azione
dell'arbitro) resta senza decoro dedicato, come le canne da sfregiare
dell'Ep.5 T6.

**Il token dell'eroe controllato su tutte e otto le tessere** (T1 coi tre
token dell'entrata inclusi: i due angoli (0,3)/(1,3) e il centrale (1,2)) —
calcolate a mano le celle libere candidate per ogni tessera prima di comporre
(script Node su `cellaCentrale`/`portaCella`), poi riverificato a occhio
sulle foto: nessuna occlusione. Un errore di conteggio corretto dal test, non
dall'occhio: `calcinacci` finiva in 4 stanze (T1/T2/T4/T5, il tetto e' 3) —
T2 spostato su `calcinacci-2`; e due corde di T2 cadevano sulla cella
dell'arredo `molo` invece che accanto.

**Non mostrato in scena, per il campo `cerca`**: la mazzetta di piombo da
campanaro (T3), il contratto del corista nel mantello (T7). T8 (la Camera
delle Tre Acque, il boss) e' voluta la stanza con meno decori dell'episodio
(5, il minimo): il `cerca_vuoto` dice esplicitamente "pietra nuda... niente
lasciato indietro" — niente ragnatele ne' calcinacci li', solo l'apparato del
rito in corso (candele, spartiti).

Verificato guardando tutte e otto le foto due volte (`node
webapp/mappa-plancia-fa.mjs --ep ep6`, `export-data.py` rilanciato prima di
ogni rigenerazione) affiancate a quelle dell'Ep.1, un giro di correzione
(sopra) prima di committare. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep7` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2/ep3/ep4/ep5/ep6.

**Task 8 — ep7 FATTO (29/09/2026)**: `src/scenografia/ep7.json` (Il quartiere
sordo — apertura dell'Atto II), 8 tessere non sequenziali: T1, T2, T3P, T4P
(la via dei Ponteggi di Ponente), T3I, T4I, T5I (la via delle Intercapedini di
Levante), T6 — trattate come 8 stanze distinte, il ramo P/I e' solo
narrativo. Due pezzi mancanti nel catalogo, cercati in `risorse-vtt/FA_Assets_Webp`
e guardati i provini prima di importarli, aggiunti a `PEZZI` in
`scripts/importa-fa-lanterne.py` (99 pezzi ora): `carrucola` (un argano a
corda, `Winch_Rope_Wood_Ashen_Metal_Rusty_B1`) per il montacarichi dei viveri
di T4I ("una carrucola, secchi che salgono e scendono"), e `sacco-chiaro`
(`Sack_Cloth_White_A`) per i sacchi di calce — pallidi, diversi apposta dal
`sacco` scuro gia' nel catalogo, usato invece per le scorie di bronzo di T6.

**Episodio deliberatamente senza luci fisse, tranne una.** Il testo non
nomina mai fuoco o candele: e' un'infiltrazione notturna in un cantiere
sordo ("silenzio SBAGLIATO", "IL SILENZIO SEPARA"), non una cripta gotica —
le sei stanze dell'Ep.6 avevano candele quasi ovunque, qui la scelta opposta
e' altrettanto voluta. L'unica eccezione e' T1 (ingresso e punto di ritorno
per vincere): una torcia accanto allo sgabello rovesciato, il posto del
guardiano appena lasciato — non un lume per chi arriva di soppiatto, ma il
posto di chi se n'e' appena andato (`cerca_vuoto`: "una garitta con la stufa
ancora tiepida e una sedia scostata in fretta").

**Due pezzi sparivano in foto, corretti guardando il render (non il JSON)**:
T4P usava `tenda-strappata` (la tenda nera del catalogo) per "il telo
strappato" — nero su pavimento scuro, invisibile nella foto, stessa lezione
di Ep.6 T3/campana-grande. Cercato un telo chiaro nella libreria:
`Tarp_Awning_Cloth_Beige_Ruined_A1_2x2` (beige, con uno strappo visibile),
aggiunto come `telo-strappato`, sagoma che ora si vede a colpo d'occhio.
T5I usava una `candela-nera` piccola come unico fuoco della tavola — nera su
assi scure, quasi invisibile: sostituito il ruolo di focal point con
`calcinacci-2` ingrandito (la "polvere di calce che non conserva impronte"
del `cerca_vuoto`), la candela resta ma piccola e spenta, dettaglio minore
non piu' il fuoco. T6 aveva `detriti-bronzo` (piccolo, grigio, debole) come
focal point: spostato sulle `catene` alla parete, ingrandite, sagoma verticale
netta che lega al tema della prigionia di Fava; i detriti di bronzo restano
in scena come richiamo tematico secondario (le scorie del Quarantuno, il
motivo di tutta la campagna).

**Non mostrato in scena, per il campo `cerca`**: il badile del capoturno
(T2), la fune di servizio con gancio (T3P), il gesso "F. — III — vivo"
(T3I), il contenuto dei secchi del montacarichi — pane, cera, biglietto
(T4I): in scena restano solo i secchi (il contesto del montacarichi), non
cio' che ci sta dentro, stessa regola gia' applicata alla scrivania
dell'Ep.1 T4.

Verificato guardando tutte e otto le foto, due giri (`node
webapp/mappa-plancia-fa.mjs --ep ep7`, `export-data.py` rilanciato prima di
ogni rigenerazione) affiancate a quelle dell'Ep.1, correzioni sopra prima di
committare. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep8` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2/ep3/ep4/ep5/ep6/ep7.

**Task 8 — ep8 FATTO (29/09/2026)**: `src/scenografia/ep8.json` (L'oro
vecchio — l'ansa morta), T1-T6 composte da zero leggendo
`testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di `webapp/data/ep8.json`
contro il catalogo esistente. Quattro pezzi mancanti, cercati in
`risorse-vtt/FA_Assets_Webp` e guardati i provini prima di importarli,
aggiunti a `PEZZI` in `scripts/importa-fa-lanterne.py` (102 pezzi ora):
`crogiolo` (`Crucible_Large_Metal_Sut_Molten_A1`, il crogiolo colmo acceso
di T4), `lingotto` (`Ingot_Gold_A2`, un lingotto appena colato), `bilancia`
(`Scales_Metal_Brass_A1`, il bilancino da pesatore) e `fornello-freddo`
(`Stove_Rusty_C`, la stufa spenta di T5 — nome scelto apposta SENZA la
sottostringa "stufa": quella accenderebbe da sola la regola dell'arredo del
posto se mai riusata come override).

**Due correzioni d'arredo per posto (docs/scenografia.md, tabella «arredo
del posto»), non nel decoro**: T3 (Il Magazzino del Carbone) ha tre celle
"casse" dei dati che il testo ripete essere sacchi di carbone fino alle
travi — corrette a `carbone-mucchio` con `"arredi": {...}` per tessera. T4
(La Sala del Crogiolo) ha un'unica cella "casse" che il testo vuole sia il
crogiolo acceso "che non si spegne mai" — corretta a `crogiolo`: il nome
del pezzo fa scattare da solo `fuoco = /candele|crogiolo|stufa/` in
`ambiente-fa.js`, quindi l'unica luce fissa della stanza arriva
dall'arredo, zero luci aggiunte nei decori (stessa lezione di Ep.5
T5/Ep.6 T3-T4).

**Una sorpresa del nome-tessera, presa dal test e non dall'occhio**: T2 (La
Tettoia delle Chiatte) contiene la sottostringa "tetto" dentro "tettoia" —
`alAperto()` (`webapp/public/motore/ambiente.js`) la classifica quindi come
un tetto: niente muri ne' porte disegnate, budget decori 0-5 invece di
5-12. `test-scenografia.mjs` l'ha bocciata al primo giro (7 decori,
"aperto: 0-5"); tagliata a 5 e riletta come quel che e' in effetti nel
testo — una semplice pensilina aperta sull'acqua, non una stanza chiusa.
Coerente col pavimento 'acqua' che la stessa riga di regex le assegna
(sostantivo "chiatte" prima della riga "tettoia" nell'elenco ordinato).

**Il token dell'eroe ha nascosto due decori al primo giro** (stessa lezione
di ogni episodio precedente): la `pozza` di T1 e la `bilancia` di T4
cadevano proprio sulla cella dove il fotografo mette il token centrale —
spostate, verificato sulle foto rigenerate (non a occhio sulle coordinate).
T1 ha in piu' i due token dell'entrata (angoli (0,3)/(1,3)): nessun decoro
li' fin dal primo giro.

**Non mostrato in scena, per il campo `cerca`**: il gancio da carico sotto
la cerata (T2 — la cerata stessa, il "contesto", resta in scena), il libro
dei corrieri (T5 — sulla scrivania restano registri generici). Le quattro
casse d'oro dell'obiettivo non sono mai decoro: tre sono gia' l'arredo
"casse" del posto (T2/T3/T5), una a T4 e' testualmente "aperta" e li'
basta il crogiolo/lingotto/bilancia gia' in scena — nessuna cassa
disegnata extra in nessuna tessera.

Verificato guardando tutte e sei le foto, due giri (`node
webapp/mappa-plancia-fa.mjs --ep ep8`, `export-data.py` rilanciato prima di
ogni rigenerazione, `export-assets.py` rilanciato dopo l'aggiunta dei
quattro pezzi nuovi) affiancate a quelle dell'Ep.1, correzioni sopra prima
di committare. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Task 8 — ep8, fix round 1 (29/09/2026, dopo la review)**: la review formale
di ep8 ha trovato un difetto vero nel motore condiviso, non nel JSON — letto
`webapp/public/motore/ambiente.js` per confermarlo prima di toccarlo, non
fidandosi solo del report. `alAperto()` testava la riga dei tetti ISOLATA
(`TETTI.test(...)`), mentre `fuoriDichiarato()`, definita subito sotto nello
stesso file, cammina l'elenco ORDINATO di `FUORI_DI` prima di arrivare alla
riga dei tetti — due funzioni adiacenti, stessa domanda, risposte diverse.
"La Tettoia delle Chiatte" (ep8 T2) contiene "tetto" dentro "tettoia", ma
contiene anche "chiatt" (prima riga di `FUORI_DI`, → 'acqua'): `alAperto()`
la marcava tetto (niente muri, niente porte, budget decori 0-5), mentre la
sua stessa `fuoriDichiarato()` diceva gia' 'acqua'. Corretto riordinando le
due funzioni e facendo `alAperto = (tile) => fuoriDichiarato(tile) ===
'tetti'` — la stessa logica, una sola fonte. Non toccati `fuoriDi()`,
`pavimentoDi()`, `PAVIMENTI` (fuori mandato, e gia' corretti: `PAVIMENTI` ha
gia' una riga apposta `tettoia|baracc|capannone|rimessa` → 'lamiera' per il
pavimento, la stessa protezione che mancava qui).

**Verificato prima di considerarlo sicuro**: uno script Node a parte ha
ricalcolato `alAperto` vecchio-vs-nuovo su tutte le 127 tessere del
campionato — **un solo cambiamento in tutta la campagna**, esattamente
ep8:T2 (`true`→`false`). Nessun'altra tessera si muove. Ep.14 ("Fuga sui
tetti", il caso vero da non rompere) riverificato tessera per tessera contro
`ambiente.js` fixato: T1 Gronda, T2 Comignolo, T3 Terrazza dei Panni, T4
Abbaino, T5 Lucernario restano `alAperto=true` (nessuna di queste contiene
una parola di una riga precedente di `FUORI_DI`); T6 Attico del Corso era
gia' `false` PRIMA del fix (non contiene nessuna parola della riga tetti:
comportamento pre-esistente, fuori mandato, non toccato). `webapp/test-ambiente.mjs`
non pinnava `alAperto` su tutte le 127 (solo Ep.11 tutto vero, Ep.1 T2/T6
falso — nessuno dei due tocco dal fix): aggiunta un'asserzione dedicata
(`alAperto(ep8:T2)===false`, `fuoriDichiarato(ep8:T2)==='acqua'`) con
commento che rimanda a questo fix, cosi' una regressione futura la becca da
sola.

**Poi, nel mio ambito**: T2 ora prende muri/porte veri e il budget 5-12
delle stanze chiuse (non piu' 0-5). Verificato con un controllo DOM diretto
(non solo a occhio sulla foto, che a bassa risoluzione confondeva le pietre
scure dei muri con la trama scura dell'acqua): 14 `[data-muro]` dentro
`.stanza-fa[data-t="T2"]` (16 lati meno i 2 varchi di porta N/S verso T1/T3,
gia' rivelate — nessuno sprite di porta disegnato li', per design:
"la porta verso una stanza gia' aperta e' il passaggio libero"). Ripristinati
i due decori tagliati per il budget sbagliato (`sacco` e `straccio`, di
nuovo 7 decori) e riscritto il `perche'` per descrivere la stanza com'e'
davvero: coperta, chiusa, non un tetto. Punto focale confermato ancora
leggibile nella foto rigenerata (la cerata strappata chiara contro il
pavimento/muri scuri).

Rilanciato tutto: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs && node
webapp/test-ambiente.mjs` → tutti `OK`. Foto di ep8 rigenerate.

**Prossimo**: Task 8, `ep9` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2/ep3/ep4/ep5/ep6/ep7/ep8.

**Task 8 — ep9 FATTO (29/09/2026)**: `src/scenografia/ep9.json` (Il processo —
scorta di Anselmo Riva), T1-T6 composte da zero leggendo
`testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di `webapp/data/ep9.json` contro
il catalogo esistente (nessun pezzo mancante, `scripts/importa-fa-lanterne.py`
non toccato). Episodio di fuga/scorta, non d'indagine: **buio in T1-T5, un'unica
luce in T6** (la lanterna schermata del battello, il testo la nomina — echeggia
il molo d'ingresso dell'Ep.1, l'unico posto davvero illuminato dopo cinque
tessere al buio).

**Un riuso creativo, non un pezzo mancante**: T2 (Vicolo dei Tintori) chiede
"vasche di guado" — il guado e' il colorante blu dei tintori, e `tinozza-fonderia`
(pensata per le fonderie) ha gia' l'acqua tinta d'azzurro: usata due volte come
le vasche, contrasto netto sul lastricato scuro, senza aggiungere un pezzo nuovo
al catalogo.

**Due correzioni trovate SOLO guardando le foto (non nel JSON)**:
1. T1 (edera sul muro nord): al primo giro spariva vicino ai token d'ingresso —
   non l'arredo-occlusione gia' nota (lezione ep2-ep8), ma il bagliore ambrato
   che il motore disegna intorno ai token, che ne spegneva il verde. Spostata
   lontano dalla zona token, ora visibile.
2. T3 (Ponte delle Catene, la stanza del boss): le due `catene` ai lati — lezione
   gia' nota da Ep.3 (questo pezzo rende "come un piccolo scarabocchio" se troppo
   piccolo) — una era ben visibile, l'altra quasi invisibile sul legno scuro.
   Ingrandita (lato 0.8→1.15) e spostata leggermente: ora le due sponde si
   leggono allo stesso modo ("le grandi catene... ai lati" del testo).

**Un arredo generico lasciato com'e', dopo verifica sul PNG**: T3 ha un'unica
cella "altare" dei dati a meta' ponte (dove il testo mette il Sicario Gentile
"appoggiato al parapetto"). Guardato `webapp/vtt/arredi/altare.png`: e' una
lastra di pietra grigia neutra, senza croci ne' candelieri scolpiti — non legge
come un altare ecclesiastico fuori posto, quindi nessuna correzione forzata
(la tabella della guida non impone override fuori da campan/guglia/ESPOSTA).

**Non mostrato in scena, per il campo `cerca`**: la pertica da tintore dietro
una vasca (T2 — la vasca stessa, il contesto, resta in scena), la lanterna
cieca sotto un banco (T4). La "carriola" del `cerca_vuoto` di T1 non ha un
pezzo a catalogo: nessuna forzatura, una stanza con un decoro in meno.

**Il token dell'eroe controllato su tutte e sei le tessere** (T1 coi tre token
d'ingresso inclusi: i due angoli (0,3)/(1,3) decor e il centrale (1,2)) —
calcolate a mano le celle libere con `portaCella`/il flip `3-y`, poi
riverificato guardando le foto rigenerate: nessuna occlusione residua dopo le
due correzioni sopra.

**Un vincolo di riuso preso al secondo giro dal test, non dall'occhio**:
`calcinacci` e `calcinacci-2` finivano ciascuno in 4 stanze (avevo dimenticato
che T3 li usava entrambi, oltre a T1/T2/T4/T5/T6) — tolto un uso di ciascuno
(T3 perde `calcinacci`, T5 perde `calcinacci-2`), tornati a 3 stanze ciascuno.

**Nessun problema di classificazione per sottostringa nel nome** (lezione
Ep.8/ep8 sulla "Tettoia delle Chiatte"): controllati tutti e sei i nomi contro
`ambiente.js` — "Il Ponte delle Catene" contiene "ponte" ma la riga `FUORI_DI`
lo assegna ad 'acqua' PRIMA della riga dei tetti (stesso ordine gia' corretto
per ep8), quindi resta una stanza chiusa con pavimento 'assi', non un tetto:
budget 5-12 corretto, non 0-5. Nessun'altra tessera contiene tetto/guglia/
torre/terrazza/loggia. Unica cosa degna di nota, non un bug di motore: T1 si
chiama "LA SACRESTIA (USCITA DI SERVIZIO)" (→ pavimento 'navata' per la
sottostringa "sacrest") ma il testo descrive la scena come un "cortile buio"
con un pozzo — il nome e' scelto per il punto di passaggio (la porticina), non
per lo spazio inquadrato. Non e' una collisione di sottostringa accidentale
(il nome contiene davvero "sacrestia" a ragion veduta, non per caso come
"tetto" dentro "tettoia"): verificato il pavimento 'navata' renderizzato
(marmo scuro) — passabile per un cortile di notte, non palesemente sbagliato —
quindi non segnalato come difetto di motore, solo annotato qui per chi
componesse la prossima tessera con lo stesso schema nome/scena disallineati.

Verificato guardando tutte e sei le foto, tre giri di correzione (sopra,
`export-data.py` rilanciato prima di ogni rigenerazione) affiancate a quelle
dell'Ep.1. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep10` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2/ep3/ep4/ep5/ep6/ep7/ep8/ep9.

**Task 8 — ep10 FATTO (29/09/2026)**: `src/scenografia/ep10.json` (La casa che
ricorda), T1-T6 composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/
`arredi` di `webapp/data/ep10.json` contro il catalogo esistente (nessun pezzo
mancante, `scripts/importa-fa-lanterne.py` non toccato). Casa unica su sei
tessere (ingresso, scala, corridoio, camera, sottoscala, intercapedine):
**buio in T2-T4** (la salita nel buio verso la voce nel muro), **un lume solo
in T1** (il cero che i Neri non sono tornati a spegnere) e **una torcia
pratica in T5/T6** (dove il Muratore lavora davvero, cosi' la mischia e la
corsa finale si vedono).

**Un pezzo del catalogo che rende inutilizzabile, scoperto solo guardando la
foto**: `tenda-strappata` (T4, "tenda strappata" contro la parete che detta)
usciva come una riga sottile a zig-zag, illeggibile — controllato il sorgente
(`Curtain_Large_Cloth_Black_A_3x1.webp`, 600×200px, bbox reale 416×38px): e'
un asset pensato per una mantovana larga 3 caselle, non per un decoro 1x1;
schiacciato a `lato` singolo diventa quasi invisibile. Sostituito con
`mantello` (gia' provato altrove nell'episodio), nessun'altra modifica al
catalogo.

**Due giri di misura del "colpo d'occhio" (principio 1), non uno**: il primo
giro (`lato` 0.3-0.8 come gli esempi della guida) produceva foto quasi vuote
su questo episodio — sedia rovesciata, tazza, straccio, ragnatele e
calcinacci sparivano quasi del tutto contro il mosaico chiaro di T1 e la
pietra chiara di T2/T3/T5/T6 (diverso dal legno scuro dell'Ep.1, dove gli
stessi pezzi alla stessa scala leggono bene). Corretto ingrandendo i pezzi
deboli (0.55-1.15 invece di 0.3-0.8) e appoggiando il fuoco scenico su pezzi
a silhouette dura gia' provati altrove (`specchio-rotto`/`specchio-rotto-2`,
`busto`, `ossa`) invece che su pezzi sottili (`sgabello-rovesciato` resta,
ma ingrandito e con luce vicina). Rigenerate tutte e sei le foto dopo la
correzione.

**Ragnatele quasi invisibili agli angoli, non un difetto di motore**:
`ragnatela`/`ragnatela-2` risultano praticamente assenti a occhio in quasi
tutti gli angoli di questo episodio, anche dopo l'ingrandimento. Controllato
il sorgente (`Cobweb_Black_A1/A2.webp`): e' un tratto grigio chiaro sottile
su fondo quasi bianco, con l'inchiostro sbilanciato in un angolo del proprio
riquadro — contro le pietre chiare screpolate di T2/T3/T5/T6 (diverse dal
legno scuro dell'Ep.1) si confonde con le crepe del pavimento gia' disegnate.
Un pezzo vicino alla stessa posizione (`calcinacci`, contenuto piu' centrato
nel riquadro) resta visibile, seppure debole: non e' quindi un'occlusione di
motore (muri/pilastri d'angolo), solo un pezzo per natura delicato — coerente
con l'esenzione dal tetto di riuso che la guida gia' gli concede. Lasciato
com'e', accettato come dettaglio atmosferico minore: nessuna stanza vi si
appoggia come punto focale.

**Il token dell'eroe controllato su tutte e sei le tessere** (T1 coi tre
token d'ingresso inclusi: i due angoli (0,3)/(1,3) decor e il centrale
(1,2) — variabile tessera per tessera, calcolato a mano da `cellaCentrale()`
sulle coordinate RAW degli arredi, non quelle decor): nessun decoro cade
sulla cella del token attivo ne' su quelle d'ingresso, verificato sia a
calcolo sia guardando le sei foto rigenerate.

**Nessun problema di classificazione per sottostringa che rompa muri o porte**
(lezione Ep.8 sulla "Tettoia delle Chiatte"): controllati tutti e sei i nomi
contro `ambiente.js`. Un caso di sottostringa reale ma innocuo, solo sul
pavimento (come "La Sacrestia" dell'ep9): T5 "IL SOTTOSCALA" contiene "scala"
(→ riga `assi`, che vince PRIMA della riga dedicata "sottoscala" → `roccia`,
piu' in basso nell'elenco `PAVIMENTI`). Verificato che non tocchi muri/porte
(quelli dipendono solo da `exits`/`arredi`, mai dal pavimento) e che il
risultato — assi di legno per un vano sotto una scala interna — resti
plausibile quanto la roccia viva prevista, forse di piu' in un contesto
domestico: non segnalato come difetto di motore, solo annotato per chi
componesse "IL SOTTOSCALA" o simili altrove. T1 "L'INGRESSO (IL TINELLO)"
prende invece pavimento 'mosaico' per la sottostringa "ingresso" (riga
dedicata, PRIMA della riga "tinello"→'mattonelle'): non e' una collisione,
e' la regola giusta che vince — un ingresso a mosaico e' piu' calzante di un
tinello a mattonelle per la prima stanza della casa.

Verificato guardando tutte e sei le foto, due giri di correzione (sopra,
`export-data.py` rilanciato prima di ogni rigenerazione) affiancate a quelle
dell'Ep.1. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep11` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2/ep3/ep4/ep5/ep6/ep7/ep8/ep9/ep10.

**Task 8 — ep11 FATTO (29/09/2026)**: `src/scenografia/ep11.json` (Il censimento
delle campane), T1-T6 composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/
`hook`/`arredi` di `webapp/data/ep11.json` contro il catalogo esistente (nessun
pezzo mancante, `scripts/importa-fa-lanterne.py` non toccato). Episodio unico
nel piano: la scalata della Torre Civica, sei tessere che `alAperto()`
classifica **tutte e sei come tetti** (nomi: abbaino, camminamento, loggia,
tetto a schiena d'asino, ballatoio, guglia — ognuno matcha la stessa riga
`FUORI_DI`/`PAVIMENTI`), quindi tutte a budget 0-5 e senza muri/porte
disegnati, coerente col brief ("non combattere una classificazione da tetti
genuina"). Letto anche il riferimento informale pre-piano
`webapp/public/mockups/tessere-alt/scena/ep11.json` (citato dalla stessa
`docs/scenografia.md` come "prova della guida" insieme all'Ep.1): usato per
orientarsi, non copiato — verificati da zero contro `CATALOGO.json` tutti i
pezzi che suggeriva (`botola`, `ali-di-pietra`, `campana-grande-2`,
`detriti-bronzo`, `nido`, `calcinacci`/`calcinacci-2`), tutti esistenti con i
flag giusti, ma budget e composizione rifatti stanza per stanza dal testo
attuale (es. T5 "Il Ballatoio" qui e' 1 solo decoro d'architettura contro i 2
del riferimento informale, seguendo alla lettera "su questo anello di pietra
non si posa nulla e non resta nulla").

**Gli arredi "casse"/"altare" fanno gia' il lavoro del punto focale su 4
tessere su 6**, per la regola del posto (`arredoDelPosto`, non scenografia):
in T3 "LA LOGGIA DELLE CAMPANE" (sottostringa "campan" nel nome) le due casse
diventano due bronzi enormi; in T4 "IL TETTO A SCHIENA D'ASINO" (ESPOSTA) casse
e altare diventano un comignolo e una statua incappucciata sul colmo; in T6
"LA GUGLIA" l'unica cassa diventa la statua della Morte. Scenografia scritta
di conseguenza leggera: 0-4 decori a tessera (T6 zero, per testo — "il vento
strappa di mano qualunque cosa non sia stretta forte"), mai piu' di 1 luce
(un cero mozzo in T1, l'unica di tutto l'episodio: il resto resta al buio o
sferzato dal vento, coerente col mood).

**Controllato guardando tutte e sei le foto** (`node webapp/mappa-plancia-fa.mjs
--ep ep11`, `export-data.py` rilanciato prima), affiancate a quelle dell'Ep.1:
i due dischi di bronzo di T3 e i comignoli di T4/T5 sono resi correttamente
distinti (verificati i PNG sorgente uno per uno: `campana-grande` e
`comignolo` sono asset diversi, non lo stesso disco riusato); la statua
incappucciata (T4) e la statua della Morte (T6) leggono chiaramente come
figure incappucciate anche ritagliate a bordo tessera. Token controllato su
tutte e sei: T1 (prima tessera, tre token — il centrale a `cellaCentrale`
dati (1,1) = schermo (1,2), i due d'ingresso a schermo (0,3)/(1,3)) e le
altre cinque a un token, nessun decoro sulla cella del token ne' su
arredi/porte (calcolato a mano, poi confermato dal test e dalla foto).

**Nessun problema di classificazione per sottostringa** (lezione Ep.8 sulla
"Tettoia delle Chiatte"): le sei tessere sono genuinamente tetti/belfry, e
`alAperto()` concorda su tutte e sei senza ambiguita' — nessun caso da
segnalare come nell'Ep.8. Unica annotazione, non un difetto: T1 "L'ABBAINO"
ha `pavimento='assi'` esplicito (citato da `docs/scenografia.md` come
l'esempio del campo che "vince sulla regola") ma quel campo tocca solo il
pavimento, non `alAperto()` — quindi anche T1 risulta senza muri disegnati,
nonostante il testo la chiami "ultimo riparo" con "il vento che fischia dalle
fessure" (implicitamente un vano ancora chiuso). Guardata la foto: il
risultato non e' rotto (nessuna incoerenza fra due controlli come l'Ep.8),
solo un'interpretazione — l'abbaino come soglia gia' aperta sui tetti,
plausibile quanto un ultimo vano chiuso. Non toccato `ambiente.js` per
questo: e' una scelta di lettura, non un bug a doppio controllo in
disaccordo.

Test: `python webapp/export-data.py && node webapp/test-scenografia.mjs &&
node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep12` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2/ep3/ep4/ep5/ep6/ep7/ep8/ep9/ep10/ep11.

**Task 8 — ep12 FATTO (29/09/2026)**: `src/scenografia/ep12.json` (La seconda
copia — l'inseguimento del corriere Tullio Vela nei canali), T1-T6 composte
da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di
`webapp/data/ep12.json` contro il catalogo esistente. Episodio molto diverso
dagli undici precedenti: quasi tutto all'aperto sui canali (un ponte
coperto, una calle stretta, il canale in nebbia, un secondo ponte, il
cimitero delle barche), non stanze chiuse di un edificio — solo T1 (l'archivio
violato) e' un vero interno.

**Cinque pezzi mancanti, tutti cercati in `risorse-vtt/FA_Assets_Webp` e
guardati i provini prima di importarli**, aggiunti a `PEZZI` in
`scripts/importa-fa-lanterne.py` (107 pezzi ora): `rete` (una rete da pesca
piena — `Fishing_Net_01_Fish_01_A1_2x2`, per il `cerca_vuoto` di T3 che dice
letteralmente "Reti, secchi, l'odore di alga" e per la trappola "reti stese"
dell'arbitro), `barca-rovesciata` (uno scafo capovolto e rotto —
`Rowboat_Upsidedown_Broken_Wood_Dark_A1_2x2`, trovato nella cartella
`Vehicles/Boats/Broken` — il punto focale di T6, "le chiatte rovesciate...
costole all'aria"), `lanterna-cieca` (`Lantern_Metal_Rusty_A1`, per "una
lanterna cieca... spenta" al gancio del barcaiolo — nessun campo luce,
coerente col testo), `bitta-cima` (un palo di ormeggio con la cima legata —
`Mooring_Post_Metal_Rusty_Rope_Ashen_A2`, per "le cime lasciate agli anelli
si tendono e si allentano") e `sigillo-cera` (`Wax_Sigil_Red_A`, per i
"sigilli a terra... come gusci vuoti" di T1 — bbox piccolo di proposito,
lezione ep1 T3: un dettaglio che si nota solo guardando, non il punto
focale).

**Episodio interamente senza luci fisse**: nessuna delle sei tessere nomina
un fuoco vero (le uniche lanterne del testo sono "cieca" o "sorda", mai
accesa in scena) — coerente con un'infiltrazione/inseguimento notturno,
stessa scelta gia' fatta per Ep.7 e gran parte di Ep.9.

**T1 (L'Archivio Violato) e' l'unica stanza "ordinata" della campagna finora**:
il testo insiste che i sigilli sono intatti e "nemmeno un foglio caduto" —
zero decadimento, zero carte sparse, l'inquietudine sta proprio nell'ordine
che rimane dopo un furto. Corretto un primo tentativo (`orologio-fermo`):
al render e' solo un anello sottile su sfondo quasi trasparente, illeggibile
(lezione 1/4) — sostituito con un `baule` chiuso, sagoma solida.

**T6 (Il Cimitero delle Barche) e' la tessera piu' ricca**: la chiatta
rovesciata al centro passa il colpo d'occhio subito (silhouette scura e
frastagliata su tavolato chiaro); `lanterna-cieca` ingrandita da lato 0.6 a
1.0 dopo la prima foto (bbox reale 28% del riquadro, stessa lezione del
teschio di Ep.5) per restare leggibile come dettaglio secondario.

**T5 (Il Sottoportico): la trave-forca usata come punto focale usciva dal
bordo della stanza** al primo giro (lato 1.6 ruotato a 90 su un centro
troppo vicino al muro destro, meta' del pezzo tagliata fuori) — spostata
verso il centro e accorciata (lato 1.4), ora intera in foto. T2 e T5
condividono lo stesso schema di arredi (due casse in diagonale, un ponte
coperto identico nei dati): differenziate nel decoro (T2: catene verticali,
punto focale unico; T5: trave-forca, catene piu' piccole come richiamo, non
il fuoco della stanza) per non sembrare lo stesso posto (principio 8).

**Un tetto di riuso sforato, preso dal test non dall'occhio**: `corda`
finiva in 4 stanze (T2/T4/T5/T6) contro il massimo di 3 — tolta da T4 e
sostituita con `calcinacci-2` (che restava comunque a 3 stanze in tutto:
T2/T4/T5).

**Un possibile difetto di classificazione, NON toccato, documentato per il
Task 9**: T3 ("La Fondamenta Stretta") ha il proprio testo che dice
esplicitamente "l'acqua a filo del **selciato**" (pavimento lastricato), ma
in `webapp/public/motore/ambiente.js` la lista `PAVIMENTI` fa scattare la
riga `/molo|banchin|imbarcader|**fondament**|riva|barc|.../` (→ 'assi',
legno) PRIMA di arrivare alla riga piu' sotto che elenca esplicitamente
`fondamenta strett` (→ 'lastricato') — quella seconda riga e' di fatto
irraggiungibile per qualunque nome contenga "fondamenta", perche' la prima
occorrenza vince sempre. Non e' la stessa specie del bug di Ep.8 (li' due
funzioni diverse, `alAperto()` e `fuoriDichiarato()`, rispondevano diverso
alla stessa domanda): qui e' un'unica lista ordinata con una voce successiva
che non puo' mai scattare — piu' vicino, per effetto, ai casi di Ep.9
(Sacrestia) ed Ep.10 (Sottoscala): un mismatch fra testo e resa, non un
autocontraddizione del codice. Verificato in foto: T3 rende davvero con
pavimento 'assi' (legno), non 'lastricato'. La composizione (rete, secchi,
tife, pozza) non dipende dal materiale del pavimento e regge comunque.
Fuori mandato di questo episodio: non toccato `ambiente.js`.

Verificato guardando tutte e sei le foto, tre giri di correzione (sopra,
piu' il tetto di riuso preso dal test) prima di committare (`node
webapp/mappa-plancia-fa.mjs --ep ep12`, `export-data.py` rilanciato prima di
ogni rigenerazione, `export-assets.py` rilanciato dopo i cinque pezzi
nuovi). Controllato il token dell'eroe su tutte e sei le tessere (T1 coi tre
token dell'entrata inclusi) calcolando a mano le celle libere candidate
(`cellaCentrale`/`portaCella`) prima di comporre: nessuna occlusione vista
in foto. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep13` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2-ep11.

**Task 8 — ep13 FATTO (29/09/2026)**: `src/scenografia/ep13.json` (Carta di
pregio — l'assalto notturno al Molino delle Carte fuori le mura), T1-T6
composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di
`webapp/data/ep13.json` contro il catalogo esistente. Episodio industriale,
non gotico-religioso: il tema e' la fabbrica della carta, non la cripta.

**Tre pezzi mancanti, per i tre nomi stessi delle tessere**: nessun pezzo del
catalogo rendeva una macina, un telaio da essiccatoio o un torchio da stampa
— "casse" generiche avrebbero appiattito il cuore visivo di T3/T5/T6.
Cercati in `risorse-vtt/FA_Assets_Webp`, guardati prima di importarli
(bbox controllato con PIL), aggiunti a `PEZZI` in
`scripts/importa-fa-lanterne.py` (110 pezzi ora): `macina`
(`Grain_Mill_Stone_Earthy_Wood_Ashen_A1_2x3`, lato 2.2 — asset 2:3 non
quadrato, ingrandito per pesare come un pezzo quadrato alla stessa `lato`,
lezione 3) per T3 (punto focale, "la grande ruota e le macine, in moto");
`telaio-carta` (`Drying_Rack_Wood_Dark_Empty_A1_2x2`, un telaio da
essiccazione a rete — trovato nella cartella pesca perche' la libreria non
ha una categoria carta/cartiera, ma la forma e' quella giusta) per T5,
usato due volte per il "labirinto di telai coi fogli appesi"; `torchio`
(`Printing_Press_Wood_Dark_A_3x3`, un vero torchio da stampa) per T6, punto
focale della tessera-titolo dell'episodio. Tutti e tre resi come decoro
(non come override di `arredi`, che nella stanza.js sarebbero schiacciati a
~1 casella): in campo si vedono grandi e leggibili, confermato in foto.

**Nessuna luce fissa in nessuna delle sei tessere**: molino fuori citta',
di notte, mai un fuoco che il testo nomini — T4/T5/T6 hanno anche un motivo
di sicurezza (polvere infiammabile, carta, stracci pronti al rogo): un
lume fisso lì avrebbe anticipato l'incendio scriptato. Unica eccezione: una
torcia sola in T1, al cancello, dove le guardie controllano il
Lasciapassare.

**Un quinto caso di collisione di sottostringa nel nome, NON toccato,
documentato per il Task 9**: T1 ("IL CORTILE DEL MOLINO") e' un cortile
aperto — per nome dovrebbe prendere `terra` dalla riga
`/cortile|terrapien|.../` di `PAVIMENTI` in `webapp/public/motore/ambiente.js`
— ma la riga `/molino|macine|torchio|essiccatoio|stracci|.../` (→ 'paglia')
sta PRIMA nell'elenco e scatta per prima sulla sottostringa "molino" dentro
"CORTILE DEL MOLINO", quindi la tessera rende con pavimento 'paglia'
(paglia/terra battuta) invece di 'terra'. Stessa famiglia dei casi di Ep.9
(Sacrestia), Ep.10 (Sottoscala), Ep.11 (Abbaino) ed Ep.12 (Fondamenta): un
nome di tessera contiene per intero il nome del luogo che la ospita, e la
regex piu' generica vince perche' viene prima nell'elenco. Verificato in
foto: T1 rende davvero su un pavimento paglia-terra, non su terra battuta
pura — visivamente non stona (un cortile di stalla/carrozze puo' avere
paglia a terra), ma e' un effetto del bug, non una scelta. Fuori mandato di
questo episodio: non toccato `ambiente.js`.

**Un tetto di riuso preso al primo giro, non dopo il test**: `straccio`
avrebbe toccato 4 stanze (T3/T4/T5/T6) contro il massimo di 3 — tolto da T5
e sostituito con `pacco` (un fascio di fogli gia' pronti, coerente col
testo del deposito), che resta comunque a sole 2 stanze (T4/T5).

Verificato guardando tutte e sei le foto, un giro di correzione (il tetto
di riuso sopra) prima di committare (`node webapp/mappa-plancia-fa.mjs --ep
ep13`, `export-data.py` rilanciato prima di ogni rigenerazione,
`export-assets.py` rilanciato dopo i tre pezzi nuovi). Controllato il token
dell'eroe su tutte e sei le tessere (T1 coi tre token dell'entrata inclusi)
calcolando a mano le celle libere candidate (`cellaCentrale`/`portaCella`)
prima di comporre: nessuna occlusione vista in foto. Test: `python
webapp/export-data.py && node webapp/test-scenografia.mjs && node
webapp/test-stanza.mjs` → tutti `OK`.

**Task 8 — ep14 FATTO (29/09/2026)**: `src/scenografia/ep14.json` (Il rivale —
la scalata sui tetti del Corso), T1-T6 composte da zero leggendo
`testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di `webapp/data/ep14.json`
contro il catalogo esistente. Due pezzi mancanti per T3 (Terrazza dei
Panni, "lenzuola stese ad asciugare"): il primo tentativo (banner di
stoffa strappati, `Wall_Hangings/Flags_and_Banners`) sembrava giusto sul
provino isolato ma aveva un bbox quasi tutto trasparente (contenuto reale
~26% dell'altezza della sua stessa tela 3:1) — nella casella quadrata
diventava un filo grigio illeggibile, stessa lezione bbox di Ep.5/Ep.9.
Sostituiti con panni da bucato rigonfi dal vento
(`Clutter/Clothing/Hanging`, pose "B", bbox ~50% pieno): `panni-stesi`
(`Clothing_Cloth_White_B1`) e `panni-stesi-2` (`Clothing_Cloth_Tan_B2`),
aggiunti a `PEZZI` in `scripts/importa-fa-lanterne.py` (112 pezzi ora),
importer + `export-assets.py` rilanciati.

**Confermata la classificazione attesa** (il motivo per cui questo set di
tessere era gia' citato come riferimento nelle review di ep8/ep9/ep11):
T1 Gronda, T2 Comignolo, T3 Terrazza dei Panni, T4 Abbaino, T5 Lucernario
sono genuinamente `alAperto()===true` (tetti aperti, niente muri); T6
Attico del Corso e' `alAperto()===false` (stanza chiusa in cima alla
scalata) — split verificato di nuovo con `test-scenografia.mjs`/
`test-stanza.mjs`, nessuna sorpresa.

**L'arredo del posto corretto per casella, cinque volte**: le "casse"/
"altare" generiche dei dati su T1/T2/T4/T5 sarebbero rimaste casse di
legno o un altare di pietra — fuori posto su una gronda appena rifatta,
un tetto che porta il nome del comignolo, un abbaino con vetri rotti, un
lucernario di vetro e piombo (nessuna di queste tessere e' marcata
ESPOSTA nei dati, quindi la regola automatica campan/guglia/ESPOSTA non
scatta da sola). Corrette per tessera con `"arredi": {...}`: T1/T2 →
`comignolo`/`comignolo-2` (il nome stesso della tessera, in T2); T4 →
`trave-spezzata` + `vetri-infranti` (il `cerca_vuoto` nomina "vetri rotti
da tempo" sul davanzale); T5 → `trave-spezzata`/`trave-spezzata-2` (il
telaio del lucernario). T3 e T6 restano casse letterali di proposito: una
terrazza da bucato ancora in uso e un covo di refurtiva, non
un'architettura morta.

**Un pezzo troppo piccolo per il suo stesso ruolo, trovato guardando la
foto**: `sigillo-cera` (il sigillo "C.B." di T6, l'oggetto-prova
dell'episodio) ha bbox 7-8% della sua tela — al `lato` di catalogo (0.35)
spariva in un puntino di pochi pixel contro il pavimento decorato di T6.
Nessun pezzo del catalogo rende meglio un dischetto di ceralacca piccolo:
tenuto lo stesso pezzo ma con `lato` raddoppiato (0.35→0.55) e il ruolo di
"punto focale" spostato onestamente sulle casse (arredo, gia' la macchia
satura della stanza) — il sigillo resta un dettaglio da guardare da
vicino, coerente col fatto che non e' un `cerca` (e' descritto in chiaro
nel testo).

**Trovato guardando i dati, non un difetto da correggere qui — sesta
occorrenza dello stesso schema (lezione 8 della guida, gia' aperta
ep9-ep13)**: `pavimentoDi()` (`webapp/public/motore/ambiente.js`)
classifica "L'ATTICO DEL CORSO" (T6) come pavimento `tappeto` (la riga
`salone|salotto|...|attico|...` matcha la sottostringa "attico"), non
`tavolato`/`tetti` — nonostante il testo descriva esplicitamente "un
pianerottolo di TAVOLE sotto il cielo aperto", un covo di ladri sui tetti,
non un salotto con moquette. Nessuna riga precedente della lista intercetta
"attico" prima che arrivi li'. **Non corretto** (fuori mandato per questo
episodio, come le cinque collisioni precedenti — parcheggiato per il Task
9, la passata dedicata su tutta la campagna): la scenografia di T6 e'
composta ignorando il tappeto reso a schermo, con decori pensati per un
solaio di legno vero.

Verificato guardando tutte e sei le foto, due giri di correzione (sopra:
il banner illeggibile di T3, il sigillo minuscolo di T6) prima di
committare (`node webapp/mappa-plancia-fa.mjs --ep ep14`, `export-data.py`
rilanciato prima di ogni rigenerazione, `export-assets.py` rilanciato dopo
i due pezzi nuovi) affiancate a Ep.1 ed Ep.11 (il precedente genuino di
tetti aperti). Controllato il token dell'eroe su tutte e sei le tessere
(T1 coi tre token dell'entrata inclusi) calcolando a mano le celle libere
prima di comporre: nessuna occlusione vista in foto. Test: `python
webapp/export-data.py && node webapp/test-scenografia.mjs && node
webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep15` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2-ep14.

**Task 8 — ep15 FATTO (29/09/2026)**: `src/scenografia/ep15.json` (Lo
smascheramento — la Villa-Museo di Braga, T1 Il Cancello → T6 Lo Studio
Segreto), composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/
`arredi` di `webapp/data/ep15.json` contro il catalogo esistente (nessun
pezzo mancante, nessuna modifica a `scripts/importa-fa-lanterne.py`). Tema
ricorrente dell'episodio: una villa messa in scena troppo perfetta da chi
la incastra (gli Apparecchiatori) — T2 (Atrio) e T4 (Galleria dei Cimeli) e
T6 (Studio Segreto) evitano di proposito ragnatele/polvere, perche' e'
proprio l'assenza di decadimento a essere il segno del falso.

**Arredo del posto corretto due volte**: T2 e T6 avrebbero reso le "casse"
dei dati come casse di magazzino — fuori posto in un atrio signorile e in
uno studio "in ordine da fotografia". Corrette con `"arredi": {...}` a
`baule` (un baule da viaggio nell'atrio, il baule degli attrezzi di scena
del regista in T6). T1/T3/T4/T5 restano casse letterali di proposito
(motivate nel `perche'` di ognuna: scatole d'archivio, materiale di
retroguardia degli Apparecchiatori sulle scale, ecc.).

**Occlusione trovata guardando la prima foto di T1, corretta**: tre decori
(catene, calcinacci, lanterna-cieca), piazzati inizialmente lungo il muro
sud, finivano dietro i due token "d'ingresso" del party (T1, come prima
tessera dell'episodio, ne porta tre: l'eroe attivo al centro piu' i due
d'ingresso in basso a sinistra) — invisibili nella foto pur essendo nel
JSON. Spostati sulla meta' destra della stanza, fuori dall'ingombro dei due
token fissi; rigenerata la foto, tutti e sei i decori ora leggibili.
Nello stesso giro, `libri` di T2 spostato verso il centro: il pilastro
d'angolo lo tagliava a meta'.

**Trovato guardando i dati, non un difetto da correggere qui — settima
occorrenza dello stesso schema (lezione 8 della guida, gia' aperta
ep9-ep14)**: `pavimentoDi()` (`webapp/public/motore/ambiente.js`, riga
della lista `PAVIMENTI` con `/grotta|caverna|scavo|galler|cunicol|
intercapedine|sottoscala|pietra viva|discesa/i` → `roccia`) classifica "LA
GALLERIA DEI CIMELI" (T4) come pavimento `roccia` — la sottostringa
"galler" di "galleria" intercetta prima di arrivare, poche righe piu' giu',
alla riga che elenca esplicitamente "cimeli" → `tappeto`. Il testo descrive
esplicitamente vetrine, cartellini scritti a macchina, vetro lucido senza
un'impronta: un salone da museo, non una galleria sotterranea — confermato
guardando la foto, che mostra pavimento di roccia screpolata sotto una
collezione di cimeli. Provabilmente sbagliato (non solo "poco plausibile"),
stesso tipo di collisione delle sei precedenti. **Non corretto** (fuori
mandato per questo episodio): la scenografia di T4 e' composta ignorando
la roccia resa a schermo, con decori pensati per una sala di collezionismo
vera.

Verificato guardando tutte e sei le foto (con quella di Ep.1 accanto), un
giro di correzione (l'occlusione di T1, il taglio d'angolo di T2) prima di
committare (`node webapp/mappa-plancia-fa.mjs --ep ep15`, `export-data.py`
rilanciato prima di ogni rigenerazione). Controllato il token dell'eroe su
tutte e sei le tessere (T1 coi tre token dell'entrata inclusi): nessun'altra
occlusione, nessun decoro su porte o arredi. Test: `python
webapp/export-data.py && node webapp/test-scenografia.mjs && node
webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep16` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2-ep15.

**Task 8 — ep16 FATTO (29/09/2026)**: `src/scenografia/ep16.json` (Un caso
qualunque — la villa sul lago dello Sposo, T1 Il Cancello del Giardino → T6
La Stanza di Nina), composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/
`hook`/`arredi` di `webapp/data/ep16.json` contro il catalogo esistente.
Primo episodio con un giardino all'italiana e un salone da ballo veri (non
gotico/industriale): **dieci pezzi mancanti**, cercati in
`risorse-vtt/FA_Assets_Webp` e guardati i provini prima di importarli,
aggiunti a `PEZZI` in `scripts/importa-fa-lanterne.py` (122 pezzi ora) —
`statua-giardino` (la ninfa con l'anfora, T2), `panca-giardino`,
`rose-bianche`/`succulente` (il fiore-firma dello Sposo e le piante grasse
della serra, T2/T3), `tavolo-banchetto` (il banchetto del T4, riusato anche
come arredo forzato sull'`altare` dei dati), `barca` (l'imbarcadero, T5),
`armadio`/`toeletta` (T6) e `letto-nozze`/`vestito-appeso` (la stanza
finale). `armadio` e `toeletta` correggono un buco pre-esistente (v. «Quello
che resta» §5 sotto): quei due nomi sono gia' in `ARREDO_KEYS`/
`ambiente-fa.js` da prima di questo episodio ma nessuno li aveva mai usati,
e l'unico pezzo di catalogo dietro il nome vicino (`armadio-anta`) e' solo
il ritaglio di un'anta vista di lato — una fessura illeggibile se usata
come mobile intero (principio 1): ora hanno il mobile vero, visto dall'alto.

**Arredo del posto riscritto in quattro stanze**, tutte con `"arredi":
{...}` per cella e motivato nel `perche'`: T2 (una `casse` diventa la panca
sotto il pergolato — il *contesto* della bottiglia di vino del `cerca`, non
l'oggetto), T4 (l'`altare` dei dati non ha senso in un salone da ballo:
diventa il primo tavolo del banchetto, con candelabro e cartellini dei
posti `sopra`; una `casse` diventa un baule di lini), T6 (`armadio` e
`toeletta` hanno finalmente il mobile vero; la `casse` accanto al letto
diventa un baule — proprio i "bauli delle mogli" che lo Sposo fa portare,
citati nel testo d'uscita di Nina — e nasconde senza dirlo il passaggio
segreto verso T5).

**Tre giri di correzione guardando le foto, non nel JSON** (la stessa
lezione di ogni episodio precedente, con una causa un po' diversa questa
volta): i muri/pilastri d'angolo si disegnano DOPO i decori nell'HTML della
stanza (`stanza.js`), quindi un pezzo grande piazzato vicino a un bordo
finisce sotto la pietra, non sopra — non una questione di angoli soli, ma
di quanto un pezzo grande sporge oltre la banda di un muro. La statua di T2
(lato 1.6) a y=0.5-0.6 spariva a meta' sotto il muro nord; spostata al
centro della stanza (lato ridotto a 1.2, y=1.5) e' tornata intera. Stessa
causa, pezzi piu' piccoli, danno piu' lieve: rose-bianche e succulente di
T2/T3 spostate qualche decimo piu' dentro la stanza. Un secondo problema,
diverso: il secondo tavolo di T4 (decoro libero) cadeva a ridosso del baule
(arredo forzato sulla cella accanto), i due sprite si fondevano in un
groviglio — spostato lontano e rimpicciolito (lato 1.6→1.0).

**Controllato il token dell'eroe su tutte e sei le tessere** (T1 coi tre
token dell'entrata inclusi): nessuna occlusione residua dopo le correzioni
sopra, verificato sulle foto rigenerate.

**Nessun ottavo caso di collisione di sottostringa nel nome** (lezione 8
della guida, sette gia' trovati ep9-ep15): controllate a mano tutte e sei le
righe di `PAVIMENTI`/`FUORI_DI` (`webapp/public/motore/ambiente.js`) contro
i sei nomi delle tessere — "IL CANCELLO DEL GIARDINO"/"IL GIARDINO" →
`giardino` (riga 15, erba), "LA SERRA" → `serra` (stessa riga, erba, nessuna
riga precedente la intercetta), "IL SALONE" → `salone` (riga 19, tappeto),
"L'IMBARCADERO" → `imbarcader` (riga 5, assi/acqua), "LA STANZA DI NINA" →
`stanza di` (riga 19, tappeto) — ognuna vince alla riga giusta, coerente col
testo e con la foto. Nessuna correzione necessaria.

**Non mostrato in scena, per il campo `cerca`**: la bottiglia di vino sotto
il pergolato (T2 — resta solo la panca, il contesto). L'Indirizzo della
Villa e il Fascicolo delle Vittime (campo `hook`, non `cerca`) sono oggetti
di *altri* luoghi (Registro degli Affitti, Casa dell'Ex Fidanzata in
Indagine): non compaiono mai come decoro qui, per costruzione.

Verificato guardando tutte e sei le foto due volte (`node
webapp/mappa-plancia-fa.mjs --ep ep16`, `export-data.py` e
`export-assets.py` rilanciati dopo i dieci pezzi nuovi, poi `export-data.py`
prima di ogni rigenerazione) affiancate a quelle dell'Ep.1, tre giri di
correzione (sopra) prima di committare. Test: `python webapp/export-data.py
&& node webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti
`OK`.

**Prossimo**: Task 8, `ep17` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2-ep16.

**Task 8 — ep17 FATTO (29/09/2026)**: `src/scenografia/ep17.json` (Lo scisma
— la villa-prigione del Notaio fuori porta, T1 Il Cancello di Campagna → T6
Lo Studio del Notaio), composte da zero leggendo `testo`/`cerca`/
`cerca_vuoto`/`hook`/`arredi` di `webapp/data/ep17.json` contro il catalogo
esistente. Nessun pezzo mancante: cercata esplicitamente una "carrozza
chiusa del Notaio" (nominata nel testo di T2) in
`risorse-vtt/FA_Assets_Webp/!Core_Settlements/Vehicles/Carts_and_Wagons` —
solo carretti/carri agricoli aperti a due-quattro assi (vista dall'alto,
niente di chiuso), nessuna carrozza credibile: non forzata, `scripts/importa-fa-lanterne.py`
non toccato, il cortile (T2) racconta la rimessa con un telo strappato sul
suo contenuto invece che con la carrozza stessa.

**Un arredo dei dati riscritto per posto**: T4 (Sala degli Interrogatori) ha
un `altare` generico fra gli arredi — un residuo del vocabolario dati
condiviso, senza senso in una villa secolare — corretto con
`"arredi": {"2,3": "tavolo-banchetto"}` al "tavolo" che il testo nomina, col
cero acceso appoggiato sopra (`"sopra": true`, la `SUPERFICI` del test
guarda ancora il nome dato `altare`, non il pezzo scelto) a fare da "lampada
accesa" del `cerca_vuoto`.

**Episodio deliberatamente quasi tutto buio**: cinque tessere su sei senza
alcuna luce fissa (infiltrazione notturna in una villa-prigione fuori porta,
nessun fuoco acceso ad aspettare gli eroi), una sola luce nell'intero
episodio — il cero di T4. Stesso schema gia' scelto per Ep.7 (il quartiere
sordo) e Ep.9 (la fuga), coerente col genere qui: un raid furtivo, non un
rito.

**Tre correzioni trovate SOLO guardando le foto (non nel JSON)**, tutte con
`PIL.Image.getbbox()` per confermare prima di tagliare — lezione Ep.5 (il
disegno vero puo' riempire una minima parte del riquadro) riapplicata:
1. **T4**: una candela nera spenta come accento d'angolo riempiva solo
   22%x18% del riquadro e, senza fiamma, era del tutto invisibile — la
   stessa combinazione (nero, spento, disegno minuscolo) gia' vista in
   Ep.5 T1. Tolta prima di committare, non dopo.
2. **T6**: un sigillo di ceralacca (la firma del Notaio) riempiva solo
   7%x8% — un puntino, non una virgola. Tolto.
3. **T1**: la catena del cancello (punto focale) e' passata da lato 0.9 a
   1.05 per stare piu' salda nel colpo d'occhio, dopo un primo giro in cui
   sembrava competere debolmente con l'edera sulle pareti.

**Controllato il token dell'eroe su tutte e sei le tessere** (T1 coi tre
token dell'entrata inclusi: i due angoli e il centrale) calcolando a mano
`cellaCentrale()` (`webapp/mappa-plancia-fa.mjs`) contro le coordinate-schermo
di ogni decoro prima di comporre, non solo a occhio dopo: nessuna
occlusione in nessuna delle sei foto.

**Nessun ottavo caso di collisione di sottostringa nel nome** (lezione 8
della guida, sette gia' trovati ep9-ep15): controllati a mano tutti i sei
nomi delle tessere contro `PAVIMENTI`/`FUORI_DI`
(`webapp/public/motore/ambiente.js`) — "IL CANCELLO DI CAMPAGNA" non incrocia
nessuna riga (default `lastricato`, corretto per un viale di campagna), "IL
CORTILE" → `cortile` (riga dedicata, `terra`), "LE CUCINE" non incrocia
nessuna riga (default `lastricato`, ragionevole per una cucina di villa),
"LA SALA DEGLI INTERROGATORI" → `sala`/`interrogator` (riga dedicata,
`mattonelle`, non intercettata prima da `salone`: quella riga cerca
"salone" non "sala"), "LA CELLA DEL DECANO" → `cella` (stessa riga,
`mattonelle`), "LO STUDIO DEL NOTAIO" → `studio` (riga dedicata, `tappeto`).
Ognuna vince alla riga giusta o cade nel default corretto: nessuna
correzione necessaria.

**Non mostrato in scena, per il campo `cerca`**: la lanterna cieca della
rimessa (T2 — resta il pozzo, il contesto). Le Chiavi della Villa-Prigione e
il Salvacondotto (campo `hook`, non `cerca`) sono oggetti di *altri* luoghi
(il Rifugio del Notaio, la Dogana Vecchia, in Indagine): non compaiono mai
come decoro qui.

Verificato guardando tutte e sei le foto due volte (`node
webapp/mappa-plancia-fa.mjs --ep ep17`, `export-data.py` rilanciato prima di
ogni rigenerazione) affiancate a quelle dell'Ep.1, un giro di correzione
(sopra) prima di committare. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep18` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2-ep17.

**Task 8 — ep18 FATTO (29/09/2026)**: `src/scenografia/ep18.json` (La mano
sola — l'ultima assemblea al Palazzo del Lume: sala dell'assemblea,
corridoio dei ritratti, biblioteca, studio privato di M., scalinata,
uscita), T1-T6 composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/
`hook`/`arredi` di `webapp/data/ep18.json` contro il catalogo esistente.
Nessun pezzo mancante, `scripts/importa-fa-lanterne.py` non toccato.

Le 'casse' generiche dei dati riscritte per posto in quasi ogni stanza
(docs/scenografia.md): T1 armadio+baule (documenti/verbali contro le
pareti dell'aula), T2 busto marmoreo caduto (il "gancio spoglio"/
piedistallo vuoto reso fisico) + candelabro-2 forzato SENZA campo luce
(una delle lampade gia' spente), T3 due armadio come scaffali gemelli
(uno, non segnalato, e' quello che ruota sul passaggio segreto), T4
arredi/scrivania + toeletta (lo specchio che si fronteggia col ritratto,
con un candelabro sopra:true, unica luce della stanza — "la lampada sta
fra il ritratto e lo specchio"), T5 due arredi/scala (i gradini veri), T6
armadio-guardaroba coi mantelli abbandonati accanto ("cappotti che
nessuno e' tornato a riprendere"). La scrivania di T4 resta VOLUTAMENTE
VUOTA (il testo lo dice due volte): nessun decoro sulla sua cella, ne'
'sopra' (il test lo impedirebbe comunque: il nome raw li' e' 'casse', non
una superficie).

Gradazione di luce sull'episodio: T1/T3/T4 con 1-2 luci fisse (l'assemblea
ancora viva, chi legge in biblioteca, l'unica lampada dello studio), T2/T5/
T6 completamente al buio ("le luci si spengono una a una", coerente con lo
schema fuga gia' usato in Ep.7/Ep.9/Ep.17).

**Due correzioni trovate SOLO guardando le foto (non nel JSON)**:
1. T2: un `orologio-fermo` (bbox reale 85%x85%, non uno sprite sparso)
   restava comunque illeggibile — stesso tono caldo-grigio del pavimento
   'tappeto' sotto, il "colore troppo vicino al pavimento" della guida.
   Sostituito con `specchio-rotto` (tono freddo/blu, molto piu' leggibile).
2. T5: una `candela-nera` spenta risultava invisibile sul pavimento 'assi'
   (legno scuro) — lo stesso difetto gia' noto dall'Ep.5 (candela nera su
   legno scuro). Sostituita con `vetri-infranti-2`.

**OTTAVO caso di collisione per sottostringa nel nome, trovato guardando
la foto e NON corretto qui** (stesso schema dei sette gia' noti, Ep.9-15,
l'ultima nota esplicita in `src/scenografia/ep15.json:45`): la tessera T4
si chiama "LO STUDIO PRIVATO DI M.", e "PRIVATO" contiene la sottostringa
"riva". In `webapp/public/motore/ambiente.js:49` (PAVIMENTI) la riga
`molo|banchin|imbarcader|fondament|riva|barc|approdo|dogana|squero` ->
'assi' intercetta la stanza PRIMA della riga :72 (`...studio...` ->
'tappeto') che la classificherebbe giusta: lo studio del presidente rende
con tavole di legno scuro (confermato in foto, diverso dal tappeto di
T1/T2/T3), non un salotto. **Piu' grave del solito**: la stessa riga
esiste identica in FUORI_DI (ambiente.js:17), quindi `fuoriDichiarato(T4)`
restituisce 'acqua' — verificato da riga di comando (`pavimentoDi`/
`fuoriDichiarato` chiamate direttamente su tutte e sei le tessere): T4 e'
l'UNICA tessera dell'intero episodio a dichiarare un fuori (le altre
cinque danno `null`), quindi l'intero margine della mappa di Ep.18 rischia
di riempirsi d'acqua attorno a un Palazzo tutto al chiuso — un raggio
d'effetto piu' ampio delle sette collisioni precedenti (quasi tutte
confinate a una stanza sola). Severita' stimata: media-alta (puramente
cosmetico, nessuna exit/meccanica coinvolta, test-suite verde — ma il
raggio e' l'intera mappa, non una stanza). Non toccato: ne' `ambiente.js`
ne' `gen_ep18.py` sono nella lista file di questo task. Documentato anche
nel campo `perche'` di T4 in `src/scenografia/ep18.json` e nel report
`.superpowers/sdd/2026-09-24-plancia-lanterne/task-8-ep18-report.md`, per
la passata dedicata (Task 9).

**Controllato il token su tutte e sei le tessere** (T1 coi tre token
d'ingresso inclusi: l'eroe attivo al centro screen (1,2) e i due
d'ingresso screen (0,3)/(1,3), calcolati a mano da `cellaCentrale()`/dati
arredi PRIMA di scrivere le coordinate; le altre cinque tessere hanno un
solo token: T2 (2,2), T3 (1,2), T4 (1,2), T5 (2,2), T6 (1,2)) — nessuna
occlusione dopo le due correzioni sopra.

**Riuso tracciato a mano**: `libri` (T1,T2,T3 = 3, al limite), `candelabro`
(T1,T3,T4 = 3, al limite), `mantello` (T1,T6), `candela-nera` (T2,T5),
`orologio-fermo` (T2,T4), `calcinacci` (T5,T6) — tutti entro il limite di 3
stanze; ragnatele esenti, usate liberamente in T2/T3/T5/T6.

**Non mostrato in scena, per il campo `cerca`**: la lanterna cieca della
biblioteca (T3, in un cassetto — resta lo scaffale, il contesto).

Verificato guardando tutte e sei le foto due volte (`node
webapp/mappa-plancia-fa.mjs --ep ep18`, `export-data.py` rilanciato prima
di ogni rigenerazione) affiancate a quelle dell'Ep.1, un giro di correzione
(sopra) prima di committare. Test: `python webapp/export-data.py && node
webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

**Task 8 — ep19 FATTO (29/09/2026)**: `src/scenografia/ep19.json` (La
Società braccata — irruzione nell'Archivio Civico sequestrato: ingresso
sigillato, atrio dei gendarmi, sale di catalogazione, corridoio dei
sigilli, sala di lettura, deposito reperti), T1-T6 composte da zero
leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi` di
`webapp/data/ep19.json` contro il catalogo esistente. Nessun pezzo
mancante, `scripts/importa-fa-lanterne.py` non toccato.

Scelta di fondo: l'episodio resta BUIO ovunque tranne T2. Il
`cerca_vuoto` di T1 dice esplicitamente "sale buie" (plurale) e quello di
T5 "lampade verdi spente": letto come descrizione dell'intero Archivio
sequestrato di notte, non di una stanza sola. Un'unica torcia accesa (T2,
l'atrio della guardia onesta in servizio) contro il buio di tutte le
altre cinque: la sola luce fissa di tutto l'episodio, coerente col
principio 3 ("il buio e' ansia, un KPI del gioco") e un forte contrasto
con la guardia illuminata.

L'arredo dato "altare" di T4 (screen 2,3) non e' stato forzato: rende
`arredi/altare.png`, una lastra di pietra grigia neutra senza
iconografia religiosa — letta come banco/piano su cui appoggiare un
registro (`libro-aperto-2` con `sopra:true`), non un vero altare fuori
posto. Nessuna correzione necessaria.

**Due difetti trovati SOLO guardando le foto, corretti prima di
committare**:
1. **`ragnatela` illeggibile su pavimenti chiari.** Il pezzo (fili
   grigio-chiari sottili, non neri) sparisce su `mosaico`/`mattonelle`/
   `tappeto` (tutti grigio-tan chiari); confrontato con l'angolo
   equivalente dell'Ep.1 T1 (tavolato scuro) si vede che anche li' e'
   appena percettibile — e' un pezzo intrinsecamente sottile, non un
   difetto nuovo. Rimossa da T1/T2/T5 (dove il pavimento e' chiaro) e
   sostituita con `calcinacci-2`/`vetri-infranti` (silhouette piu' dura,
   contorno nero marcato, leggibili a colpo d'occhio); mantenuta solo in
   T6 (`tavolato`, legno scuro) coerente col precedente Ep.1.
2. **`sigillo-cera` troppo piccolo per fare da punto focale.** Al `lato`
   di catalogo (0.35) il blob di ceralacca e' minuscolo e quasi invisibile
   anche su pavimento grigio. Ingrandito a 0.45-0.55 dove doveva reggere
   da solo (T1 "sigillo debole" del hook, T4 ritmo dei sigilli lungo il
   corridoio, T6 "sigillo fresco" del testo); in T1 il vero punto focale
   e' stato spostato sul `baule` (piu' grande, silhouette netta, gia'
   ben leggibile senza modifiche) e il sigillo retrocesso a dettaglio
   secondario.

**Nessuna collisione di sottostringa trovata** in `PAVIMENTI`/`FUORI_DI`
per i sei nomi di T1-T6 (controllato con `portaCella`/`pavimentoDi`/
`fuoriDichiarato` da riga di comando prima di scrivere le coordinate):
"L'INGRESSO SIGILLATO"→mosaico, "L'ATRIO DEI GENDARMI"→mosaico, "LE SALE
DI CATALOGAZIONE"→mattonelle, "IL CORRIDOIO DEI SIGILLI"→mattonelle, "LA
SALA DI LETTURA"→tappeto (intenzionale, "lettura" e' nel gruppo
salone/studio), "IL DEPOSITO REPERTI"→tavolato — tutte corrette al primo
match, nessuna riga precedente nella lista intercetta per errore. Nessuna
delle sei dichiara un `fuoriDichiarato()`: l'intero episodio e' al chiuso
(nessun raggio d'effetto sul margine mappa, comportamento gia' previsto
dalla guida per un "episodio tutto al chiuso" — non e' il nono caso
delle otto collisioni note).

**Controllato il token su tutte e sei le tessere** (T1 coi tre token
d'ingresso inclusi: l'eroe attivo al centro screen (1,2) e i due
d'ingresso screen (0,3)/(1,3); le altre cinque un solo token: T2 (2,2),
T3 (1,2), T4 (1,2), T5 (2,2), T6 (1,2)). Trovate due occlusioni reali
dopo la prima generazione foto (non visibili leggendo solo il JSON): in
T1 un `calcinacci` cadeva sotto il token d'ingresso screen (0,3); in T2
`fogli`+`tazza` cadevano dentro/dietro il token attivo screen (2,2).
Entrambi spostati fuori dal raggio dei token, poi riverificato con le
foto rigenerate.

**Riuso tracciato a mano (ricontato sul JSON finale, non a memoria)**:
`pacco` (T1,T3,T6 = 3, al limite), `sigillo-cera` (T1,T4,T6 = 3, al
limite), `libri` (T1,T3,T6 = 3, al limite), `calcinacci` (T1,T5,T6 = 3,
al limite), `fogli` (T2,T3,T4 = 3, al limite), `calcinacci-2` (T1,T2),
`busto` (T3,T5), `libro-aperto-2` (T3,T4), `corda` (T2,T6) — tutti entro
il limite di 3 stanze; `ragnatela` esente, usata solo in T6.

**Non mostrato in scena, per il campo `cerca`/testo dell'obiettivo**: il
lasciapassare notturno di T2 (resta lo spunto di scrivania/registro, non
l'oggetto); il Fascicolo del 1741 di T6 (obiettivo interagibile, non un
campo `cerca` — messo in scena solo per contesto: un sigillo fresco
accanto alla cassa, senza disegnare il fascicolo stesso).

Verificato guardando tutte e sei le foto due volte (`node
webapp/mappa-plancia-fa.mjs --ep ep19`, `export-data.py` rilanciato prima
di ogni rigenerazione, server `node webapp/server.js` su 8017) affiancate
a quelle dell'Ep.1, un giro di correzione (sopra) prima di committare.
Test: `python webapp/export-data.py && node webapp/test-scenografia.mjs
&& node webapp/test-stanza.mjs` → tutti `OK`.

**Prossimo**: Task 8, `ep20` — stesso procedimento, giudicato contro Ep.1,
preludio ed ep2-ep19.

**Task 8 — ep20 FATTO, ULTIMO EPISODIO (29/09/2026)**: `src/scenografia/ep20.json`
(Il Quarto Movimento — il finale: la discesa oltre la Cattedrale, T1 La
Discesa/La Cripta, T2 Le Tre Acque, T3 La Pietra Viva, T4 Il Coro a
Pagamento, T5 La Soglia della Camera, T6 La Camera del Dormiente), T1-T6
composte da zero leggendo `testo`/`cerca`/`cerca_vuoto`/`hook`/`arredi`
di `webapp/data/ep20.json` contro il catalogo. Due pezzi mancanti
aggiunti a `PEZZI` in `scripts/importa-fa-lanterne.py` (provini guardati
prima di importarli): `decori/leggio.png` (Music_Stand_Wood_Dark_A1, per
i "leggii da orchestra" del cerca_vuoto di T4) e `decori/borraccia.png`
(Waterskin_A_Dark, per le "borracce d'acqua per la gola" dello stesso
cerca_vuoto).

Scelta di fondo: **zero luci fisse in tutto l'episodio**. Il testo di
ogni tessera della discesa insiste sul buio ("scendete nel buio", "la
luce esce e non torna", canto del dio che filtra nel nero) — coerente col
principio 3 ("il buio e' ansia, un KPI del gioco") e un contrasto voluto
con l'illuminazione delle altre 19 scenografie: la campagna chiude nel
buio piu' totale che abbia mai avuto.

**Un difetto di pezzo trovato SOLO guardando le foto, diagnosticato con
`PIL.getbbox()` e corretto prima di committare**: `ragnatela`/
`ragnatela-2`, anche ingranditi a `lato` 1.2-1.4 e riposizionati lontano
da muri/token, restavano invisibili nelle foto generate (T1/T2/T3/T5).
`getbbox()` sull'alpha del PNG mostra perche': la trama vera di
`ragnatela` occupa solo il 20% destro del riquadro quadrato (118-198 di
200px), quella di `ragnatela-2` il 34%×53% in alto a sinistra — il resto
e' trasparente, e a differenza di `calcinacci`/`candele-nere` (contenuto
centrato, 35-70% del riquadro) lo spostamento del centro per compensare
l'offset non bastava a renderle leggibili nel rendering reale. Sostituite
ovunque con `candele-nere`/`candele-nere-2`/`candele-nere-3` SPENTE
(nessun campo `luce`): stesso ruolo di dettaglio di decadimento
marginale, ma pezzo con contenuto centrato e verificato visibile in foto,
e coerente con la materia "cera" del gioco (docs/scenografia.md). Le
`candele-nere*` sono esenti dal limite di riuso (come le ragnatele), cosi'
non hanno eroso il budget di `calcinacci`/`calcinacci-2`/`pozza`, gia' al
limite di 3 stanze ciascuno.

**T5 (La Soglia della Camera) e T6 (La Camera del Dormiente) sotto il
budget "naturale" del testo, alzati al minimo macchina (5) con contenuto
onesto, non riempitivo**: il `cerca_vuoto` di T5 e' un ordine esplicito
("nessuna nicchia, nessun arredo: da qui in avanti la roccia e' nuda") e
quello di T6 chiude ogni possibilita' ("solo pietra, acqua e buio... non
si prende con le mani") — letti alla lettera darebbero zero decori, ma
`test-scenografia.mjs` impone 5-12 per le stanze chiuse (l'eccezione a
zero, principio 6, e' scritta per l'aperto/tetti, non per un corridoio
chiuso). Risolto tenendo tutto il contenuto ai margini estremi (angoli,
lontano dalla colonna centrale fra le porte) per T5 — mozziconi di
candela spenti e gruppi di candele nere spente, la traccia di chi e'
sceso portando la propria luce — e con acqua/pietra antica ripetute ma
non allineate per T6, dove il centro resta eccezionalmente occupato
(l'unica stanza dell'episodio dove il punto focale sta in mezzo, per
scelta esplicita motivata nel `perche'`).

**Controllato il token su tutte e sei le tessere** (T1 coi tre token
d'ingresso: l'eroe attivo al centro e i due d'ingresso in basso a
sinistra; le altre cinque un solo token). Trovata un'occlusione reale
dopo la prima generazione foto: in T1 la `ragnatela` (angolo in basso a
sinistra) cadeva sotto uno dei due token d'ingresso — spostata
nell'angolo alto opposto (poi sostituita con `candele-nere`, sopra).

**Riuso tracciato a mano sul JSON finale, non a memoria (lezione 7)**:
`pozza` (T1,T2,T6 = 3, al limite), `calcinacci` (T1,T2,T3 = 3, al
limite), `calcinacci-2` (T1,T3,T6 = 3, al limite); `candele-nere`/
`candele-nere-2`/`candele-nere-3`/`candela-nera` esenti (famiglia
candele); `leggio`/`spartiti`/`borraccia`/`straccio` solo in T4. Nessun
pezzo oltre il limite.

**Possibile nono caso di collisione di sottostringa in
`PAVIMENTI`/`FUORI_DI`, trovato ma NON corretto (parcheggiato per la
Task 9, come da mandato per questo episodio)**: tre delle sei tessere
prendono un pavimento che il loro stesso testo contraddice. "IL CORO A
PAGAMENTO" matcha `coro` nella riga chiesa/navata (`PAVIMENTI` riga 8) →
pavimento `navata`, ma il testo descrive un'antecamera sotterranea di
lavoranti pagati, non una chiesa consacrata. "LA SOGLIA DELLA CAMERA"
matcha `soglia` nella riga atrio/vestibolo → pavimento `mosaico`, ma il
`cerca_vuoto` della stessa tessera dice letteralmente "la roccia e' nuda"
(visibile in foto: un pavimento a losanghe chiaro, non la pietra grezza
del testo). "LA CAMERA DEL DORMIENTE" matcha `camer` nella riga
ufficio/stanza generica → pavimento `mattonelle`, contro un testo che
descrive solo pietra bagnata e acqua. **Controllato `fuoriDichiarato()`
su tutte e sei**: solo T1 ("discesa") e T3 ("pietra viva") dichiarano un
fuori, entrambi `roccia` — concordi fra loro, quindi il margine
dell'intera mappa dell'episodio resta coerente (roccia), NON e' l'ottavo
caso (Ep.18) dove una singola tessera dominava il fuori di tutto
l'episodio con un valore sbagliato. Il difetto qui e' solo nel
pavimento (texture sotto i piedi), non nel margine mappa. Visivamente il
danno e' lieve (texture di pietra/marmo comunque plausibile per un
sotterraneo, non un pavimento assurdo come legno o erba), ma le tre
tessere non hanno la texture di roccia grezza che il testo chiede.

Verificato guardando tutte e sei le foto piu' volte (`node
webapp/mappa-plancia-fa.mjs --ep ep20`, `export-data.py` e
`export-assets.py` rilanciati prima di ogni rigenerazione dopo l'aggiunta
dei due pezzi nuovi, server `node webapp/server.js` su 8017) affiancate a
quelle dell'Ep.1, piu' giri di correzione (sopra, in particolare il
riposizionamento delle ragnatele) prima di committare. Test: `python
webapp/export-data.py && node webapp/test-scenografia.mjs && node
webapp/test-stanza.mjs` → tutti `OK`.

**TASK 8 COMPLETA**: tutti e 20 gli episodi hanno la scenografia
(preludio, ep2-ep20 da questa Task, piu' l'Ep.1 dalla Task 7) —
21 spedizioni in tutto con `src/scenografia/*.json` scritto e
verificato. **Prossimo**: Task 9, "guardare tutte le 21 spedizioni" (la
passata dedicata su tutta la campagna, gia' citata nei mandati di ep14 e
ep18 per i difetti parcheggiati) — non un altro episodio.

## FATTO (05/10/2026) — Task 9: guardare tutte le 21 spedizioni (fix del provino)

Fotografate tutte e 21 le spedizioni (`node webapp/mappa-plancia-fa.mjs --tutte`,
poi `--ep` sulle stanze toccate; server `node webapp/server.js` su 8017): zero
404, zero errori, 21 cartelle, `logs/plancia-fa/foglio.jpg`. Trovati 13 sospetti
(pavimenti, un tetto): 8 corretti, 5 lasciati (decisione sotto).

- **Codice** (`webapp/public/motore/ambiente.js`, regressione in
  `webapp/test-ambiente.mjs`): `riva` -> `riva` in FUORI_DI e PAVIMENTI («Lo
  Studio PRIVATO» di ep18 T4 matchava «riva»: pavimento di assi e, peggio,
  `fuoriDichiarato` 'acqua' => il margine dell'INTERO ep18 era un'onda; ora null,
  pavimento tappeto). `fondament(?!a strett)` (ep12 T3 «Fondamenta stretta» =
  selciato, `lastricato`). Attenzione: il lookahead che il reviewer proponeva,
  `(?! strett)`, NON funziona (dopo «fondament» c'e' «a», non lo spazio).
  `alAperto` onora il campo `tile.aperto` (come `pavimento`, ma per i muri).
- **Dati**: `aperto=False` in `gen_ep11.py` T1 (l'abbaino e' un riparo chiuso,
  prima usciva senza muri ne' porta); `export-data.py` ora passa `aperto`;
  `pavimento` aggiunto in ep14 T6 (tavolato), ep15 T4 (tappeto), ep20 T2 (acqua),
  T5 e T6 (roccia). Regex NON allargata per «Tre Acque»: avrebbe reso acqua anche
  ep6 T8 «La camera delle tre acque» (pietra nuda nel testo).
- **Scenografia**: ep11 T1 da 4 a 6 decori (chiusa => budget 5-12): trave
  spezzata e secchio. `docs/scenografia.md` documenta `aperto`.
- **Lasciati** (plausibili): ep9 T1 navata, ep10 T5 assi, ep13 T1 paglia, ep20 T4
  navata (coro + altare), ep6 T8 mosaico. Nota: ep20 T2 ha 3 pozze su pavimento
  d'acqua (ridondanti, innocue): ritoccabili in ep20.json.
- **Raggio d'azione**: confronto prima/dopo su tutte le 127 tessere
  (pavimentoDi, fuoriDi, alAperto, fuoriDichiarato): cambiano esattamente 8
  tessere (ep11 T1 aperto, ep12 T3, ep14 T6, ep15 T4, ep18 T4, ep20 T2/T5/T6),
  tutte volute; pin di `test-ambiente.atteso.json` aggiornati. Asserzioni nuove
  sabotate una a una (codice vecchio, alAperto senza override, regex senza
  lookahead, riva senza , export senza `aperto`): tutte falliscono, poi
  ripristinate.
- Test: `python webapp/export-data.py && node webapp/test-scenografia.mjs && node
  webapp/test-stanza.mjs && node webapp/test-ambiente.mjs` -> tutti OK.
  Dettaglio: `.superpowers/sdd/2026-09-24-plancia-lanterne/task-9-report.md`.
- `mappa-plancia-fa.mjs --ep` lanciato 6 volte IN PARALLELO ha dato «tessera
  episodio non trovata in home»: lanciarlo in sequenza.

**TASK 9 COMPLETA**; piano plancia-lanterne finito.

## FATTO (22/09/2026) — i vantaggi d'Indagine arrivano in Spedizione (audit + correzioni)

Report: `AUDIT-VANTAGGI-INDAGINE.md`. Banco: `node webapp/audit-vantaggi.mjs [porta]
[--solo=ep3,ep7]` (server statico su, ~3 min; spezzare in 3 shard paralleli).

- `webapp/public/motore/domande.js` (nuovo): applica gli effetti delle Domande. I dati
  sono `premio`/`penalita` di ogni Domanda, generati da `EFFETTI_DOMANDE` in
  `webapp/export-data.py` (chiavi: nessuna_minaccia_r1, minaccia_extra_r1, canto,
  spawn_t1, senza_spawn, smascherato, boss_salta, boss_difesa, senza_prova,
  traccia_iniziale). Aggancio: `avviaEffetti()` da `iniziaPartita` (digitale.js) —
  scrive `sp.effetti`, `sp.intuizione`, `sp.promemoria`, `sp.modNemici`, `sp.saltaNemici`.
- Senza `partita.vantaggi.risposte` non si applica niente (il pilota non le semina:
  baseline dei win% intatta; `RISPOSTE=sbagliate|giuste` per misurarle).
- Gettone Intuizione: comando `intuizione` (comandi.js), `sp.ultimoFallito` scritto dopo
  ogni comando, pannello `#p-intuizione` in digitale.js. Test: `test-motore-domande.mjs`.
- Ep.9: `obiettivoFatto` non conta chi `parte_libero`. Pilota N=20: 1 vittoria (era 2):
  fuori banda dal lato difficile, NON ritarato — decisione aperta.
- 33 Domande su 80 restano a mano (tracce, tessere, tipo di vittoria, narrativa): stanno
  nel pannello «le domande d'indagine» in Spedizione.
- Non provato: Durable Object/telefoni col comando `intuizione` (suite wrangler non
  rilanciate: test-telefono-azioni, test-tavolo-do).
- Suite UI gia' rosse prima (verificato su HEAD): test-abilita, test-digitale-regressioni
  (uscita segreta), test-engine (jpg minaccia ep.5/6), test-testi (virgolette, sigle).
  test-partite e' instabile (ep1 «.reperto-img hidden» a intermittenza, anche su HEAD).

## FATTO (21/09/2026) — account, tavoli, scelta dell'episodio, correzioni

Tutto su `origin/main` e in produzione (ultimo deploy: commit `fa93a23cf`).

**Account e tavoli**
- **Logout:** «esci» nella pagina dei tavoli, un link a `/cdn-cgi/access/logout`
  (lo serve l'edge di Access: nessun codice nel Worker).
- **Tavoli orfani** (il server non li conosce: cancellati altrove o di un altro
  account): `entraNelTavolo` scorda la scelta e va all'elenco, dove compaiono in
  «sul dispositivo, ma non nel tuo account» con «butta dal dispositivo»
  (`store.tavoliLocali`, `dimenticaTavolo`). `sync.svuota()` non si ferma piu' su
  un 404: la voce resta in coda, non blocca le altre.
- **Un tavolo si salva completo:** «salva il tavolo» (`membri.js`) chiede la
  compagnia (2-10 eroi, salvata sul server) e almeno un invitato; se manca
  qualcosa un popup dell'app (`chiedi.avvisa`) lo dice. Uscire da un tavolo non
  completo lo scarta (DELETE); rientrandoci il creatore torna alla creazione; in
  elenco si legge «da completare».
- **Ognuno sceglie il proprio eroe, creatore compreso:** niente menu dell'eroe
  all'invito. `PUT /api/mio-eroe` accetta anche il creatore; `/api/stato` porta
  `creatore`, `invitati` ed `eroi` del creatore; `/api/membri` porta
  `proprietario` ed `eroiProprietario` (il creatore NON e' fra i `membri`).
  Chi non ha un eroe vede solo la scelta dell'eroe (`entraNelTavolo`), con
  «cambia tavolo» sempre a portata. In gioco chi arbitra resta chi conduce:
  `postoDiQuestoTavolo` gli da' `eroi` vuoto, come prima — se si vuole che il
  creatore giochi davvero il suo eroe e' un lavoro a parte sulle viste.
- **Copyright** solo nella voce «info» del menu di gioco (Indagine), non piu' in
  fondo alle schermate.

**Scelta dell'episodio (mockup C)** — `js/scheda-caso.js`: ogni caso e' una
stampa (`.eroe-tile` + nastrino col numero, sigillo per le vinte); toccarla apre
la scheda del caso e solo da li' si comincia («si comincia» / «riprendete la
serata» che va dentro senza ripassare da «continua» / «rigiocate il caso»).
Vittoria parziale = «vinta a meta'». I banchi di prova che aprono un episodio
passano ora da `#apri-caso`. Le vecchie regole `.tessera-episodio` restano in
`app.css` solo perche' il mockup `mockups/episodi/oggi.html` le usa; i mockup A
e B (per atti) sono in `mockups/episodi/`, non portati.

**Correzioni**
- La patina sulle carte: `.c3d-ombra` stava DOPO `.c3d` nel markup e dipingeva
  sopra la carta (z-index auto: vince l'ordine nel DOM). Ora e' il primo figlio;
  `test-carta3d` controlla l'ordine.
- «tornate indietro» dalle pagine del menu di gioco riporta alla pagina da cui
  si era aperto il menu (`indagine.js`, `origine` ricordata in `menu()`).

**Deploy — come si fa oggi.** Solo Worker: `deploy.sh` si ferma sull'import D1
(`Authentication error 10000`, il token OAuth di wrangler; rimedio: `wrangler
login`), e lo schema non cambia da agosto. Si pubblica da un export pulito di
`origin/main` (NON dal working tree: c'e' lavoro non committato), con `data`,
`assets`, `fonts/*.ttf` e `js/vendor` copiati o collegati, poi `build-dist.sh` e
`npx --no-install wrangler deploy`. La CI parte solo a comando. Il repo ha un
solo branch, `main`, e nessun worktree extra.

**Ancora aperto**
- Falliscono gia' su `origin/main`, non toccati: `test-abilita` (2 KO),
  `test-digitale-regressioni` (3), `test-partite` ep1 ed ep2 (`.reperto-img`
  nascosto; `test-partite` intero dura oltre nove minuti).
- La nebbia non e' provata su un iPad vero (vedi sotto).
- Nel working tree c'e' il lavoro NON committato sulle carte del Preludio:
  `scripts/cardconjurer/*`, `Preludio/cards/*` (sotto-cartelle per tipo) e
  `test-carta3d.mjs` (dorsi del Preludio).
- Banchi con `wrangler`: `test-account-ui` (identita' `uno@esempio.it`),
  `test-invito` (`arbitro@esempio.it`), `test-mio-eroe` (`giocatore@esempio.it`),
  `test-membri` (due server, 8787 uno e 8788 due, avviati uno alla volta: due
  `wrangler dev` insieme si pestano il `build-dist`). Prima `build-dist.sh`.

## FATTO (21/09/2026) — la nebbia di sfondo

Vanta.FOG (three.js) dietro a tutte le schermate: `webapp/public/js/nebbia.js`,
un `<div id="vanta-bg">` fisso in `index.html`, e in `app.css` `#vanta-bg` a
z-index 0 con `.schermo` a z-index 1 (l'app sta sempre sopra). Palette e
tentativi scartati: `mockups/nebbia.html`. Palette attuale «teal e brace»
(21/09/2026, scelta fra sei in `mockups/nebbia-colori.html`, che resta per
riprovarle): base `#0c0e11`, valli `#06191a`, medio `#1a4a4d`, creste `#5c3421`.

- **Librerie vendorizzate, mai da CDN**: `./fetch_vendor.sh` le scarica in
  `webapp/public/js/vendor/` (gitignored) e blocca l'hash sha384. Stanno fra i
  prerequisiti di `build-dist.sh` e del workflow di deploy, come i font: in un
  worktree pulito vanno copiate/scaricate prima di `build-dist.sh`.
- **Non rompe mai l'app**: senza le librerie `VANTA` non e' definito e
  `nebbia.js` non fa niente.
- **Costo** (si gioca per ore su un iPad): `scale: 2` (un quarto dei pixel su
  retina), e nel modo immersivo (`#app.immersivo`, la plancia) la nebbia si
  SPEGNE e riparte uscendone. `prefers-reduced-motion` la ferma.
- **Provata** con `node webapp/test-nebbia.mjs` (server: `node webapp/server.js`).
  NON provata su un iPad vero: batteria e temperatura dopo una serata intera
  sono da guardare; se pesa, il primo rimedio e' spegnerla anche fuori dal
  modo immersivo, e il secondo un interruttore nel menu.

## IN CORSO (16/08/2026) — la pelle nuova: «notte e nebbia»

**Dove sta tutto.** I mockup sono in repo: `webapp/public/mockups/stile2/`
(`index.html` li presenta tutti). Si guardano con `node webapp/server.js` e poi
**<http://192.168.178.221:8017/mockups/stile2/>** — dal telefono, non dal PC.

**Le decisioni prese, tutte il 16/08/2026:**

1. Fra tre direzioni (A gabinetto d'ottone · B referto clinico · C notte e
   nebbia) è scelta **C**: l'artwork occupa lo schermo, il testo vive su lastre
   di vetro fumé. Regola che la tiene in piedi: **nessun testo sull'immagine
   nuda**.
2. I bottoni stanno in una **griglia a colonne uguali** (`.azioni`), icona sopra
   la parola: la larghezza la decide la griglia, non l'etichetta. Colonne da
   128px (152 per quelli di servizio): sotto, «testimonianza» sbordava.
3. Il **menu** sta in un capo appiccicato in alto, con l'ora/il canto a sinistra
   e il bollino quando c'è del nuovo; dentro va tutto quel che non è «adesso».
4. Le **tessere** si disegnano col **modo 2**: la stanza è il pezzo — l'arte
   della tessera fa da pavimento, il reticolo è un filo sopra, la nebbia copre
   quel che non è rivelato. Il modo 3 (reticolo solo dove serve) resta scritto,
   da provare al tavolo.
5. Il porto nell'app si fa **a pezzi, dall'Indagine**, e il risultato deve
   essere **identico ai mockup** (richiesta esplicita: niente scorciatoie).

### LE TESSERE DIPINTE (18/08/2026) — tre librerie, e la scelta è del committente

**Dov'è.** `webapp/public/mockups/stile2/nebbia2-tessere-3vie.html`: le stesse
**quindici tessere campione** (una per ognuno dei dieci ambienti, più quelle con
un arredo raro) generate **tre volte** dallo stesso pennello e dagli stessi dati.
Cambia solo da dove viene il disegno.

**La scelta è di licenza prima che di gusto.** Forgotten Adventures è
CC BY-NC-**SA** e il ShareAlike si attacca alle tessere; 2-Minute Tabletop è
CC BY-NC e non lo fa. La terza via — 2M con FA a tappare i buchi — sul piano
della licenza **è identica alla prima**: basta un pezzo. Finché la scelta non è
presa, `NOTICE.md` non si tocca.

**Com'è fatto.** Il pennello legge la libreria da `OSR_VTT`, tappa da FA solo se
`OSR_MISTO=1`, e sceglie i muri con `OSR_MURI=2m|fa|casa`. **Senza variabili si
comporta esattamente come prima**: verificato generando la stessa tessera col
codice di prima e con quello di adesso — stesso SHA.

**Con la sola 2M escono tutte dipinte 52 tessere su 127.** Le altre hanno almeno
un pezzo di ripiego, che non vuol dire vuoto: i pavimenti scoperti prendono le
texture Poly Haven CC0, gli arredi scoperti le sagome CSS.

**Quattro cose che si sono viste solo GUARDANDO, e che i nomi non dicevano:**

- il *Mercantile Tokens* esiste solo a **72 DPI** (Roll20): 205 px per casella
  contro i 616 px di stampa. Casse, scrivania, forma, branda e armadio escono
  ingranditi tre volte e morbidi. Gli altri pacchetti hanno la cartella a 300 DPI;
- `Tile - 1 (3x3)` del Dungeon Room Builder **non è** una texture ripetibile: è
  un quadrato con le fughe disegnate a mano ai bordi. `mattonelle` resta CC0;
- `Wall - Stone - 4x2` del Basic Building è una striscia larga **2,5 caselle su
  4** con gli estremi irregolari: il muro vero è `Wall - Straight (5x2)` del
  Dungeon Room Builder, l'unico che arriva ai bordi della sua tela. E il ritaglio
  va fatto sull'alfa **con una soglia**, perché sotto la pietra c'è un'ombra
  sfumata che arriva al bordo e `getbbox()` non toglierebbe niente;
- gli asset 2MT sono **chiari** (inchiostro su carta bianca) e il gioco è scuro:
  senza la **ritinta** un oggetto esce incollato sopra invece che appoggiato. Le
  cifre stanno in `pittura-vtt.js` (`RITINTA_2M`, `.lato2m`) e sono manopole —
  il muro a 0,7 caselle di spessore aveva un davanzale che sembrava un ballatoio,
  ed è a 0,55.

**Cosa manca per chiudere.** Tre pacchetti 2MT del LEGGIMI non sono ancora
scaricati (The Furniture Map, Modular Jail, Buildings Pack) e coprirebbero
altare, stufa, toeletta, cella, branda e i tetti. Il `crogiolo` non lo copre
nessuno dei tre.

### LE STANZE SAGOMATE (18/08/2026) — la direzione 2, montata su cinque episodi

**Dov'è.** `webapp/public/mockups/stile2/nebbia2-spedizioni-sagome.html`: Preludio,
Ep. 3, 5, 11 e 12 con le plance composte dal grafo delle uscite, e un
interruttore che scambia sul posto le tessere quadrate di oggi con quelle
sagomate. Le tessere sono **vere**, generate dal pennello con arredi e pavimenti
dipinti — non un disegno di come sarebbero.

**Come funziona.** `scripts/tiles/sagome.js` decide il taglio dal **nome della
stanza**, con la stessa regola con cui il nome dice già il pavimento: ballatoio →
anello, cisterna → tonda con le colonne, camminamento → fascia larga due caselle,
navata → abside, banchina → l'angolo sull'acqua, guglia → si stringe. Sui 21
episodi: 68 tessere prendono una sagoma, 59 restano quadrate. Si accende con
`OSR_SAGOME=1`; senza, tutto è come prima.

**Due invarianti, e sono il motivo per cui la cosa sta in piedi:**

1. **Le porte non si spostano mai.** `pickDoorIndex` e la sua gemella
   `portaCella` scelgono la casella della porta senza sapere niente di sagome: se
   una sagoma togliesse quella casella, il cartoncino e l'app direbbero due cose
   diverse. La sagoma si adatta alle porte, mai il contrario.
2. **La stanza resta tutta attaccata.** Se un taglio la spezzerebbe in due, si
   rinuncia alle sue caselle **una alla volta** (l'elenco è ordinato: prima il
   profilo, poi i dettagli) finché torna intera. Su 127 tessere succede cinque
   volte, e mai per più di due caselle. Buttare tutto e tornare al quadrato pieno
   era lo spreco della prima stesura: la cisterna perdeva anche le pareti tonde
   per colpa di due colonne che spezzavano l'anello.

**Il collaudo era vacuo, e si è visto solo provandolo.** `node
scripts/tiles/sagome.js` girava verde anche togliendo la riga che rimette le
caselle-porta: chiedeva «la casella c'è?», e quando la sagoma murava una porta
veniva ridotta, quindi la casella c'era comunque. Ora il controllo è sul
**taglio** (dev'essere adattato, non ridotto) e c'è un tetto sul numero di
riduzioni. Provato col guasto deliberato: adesso morde.

**L'INVARIANTE DA RICONTROLLARE A OGNI TOCCO DEL PENNELLO.** Senza variabili
d'ambiente, `node scripts/tiles/generate-tiles.js ep1 --vtt --solo T6 --out
reg-tmp` deve produrre un PNG con SHA-256 che comincia per **`77fbb56bf88c15dd`**.
Passando i muri da «quattro lati per indice» a «i bordi della sagoma» la variante
A/B del kit si era messa a dipendere da `cx+cy` invece che dall'indice lungo il
lato: le tessere già stampate cambiavano disegno del muro su tre lati su quattro,
e nessun banco se ne accorgeva. Si vede solo confrontando gli SHA.

**IL MURO STA FUORI DALLE CASELLE, e la tessera è cresciuta** (18/08, secondo
giro). Il pezzo del kit veniva appoggiato *sopra* la prima casella del bordo e ne
mangiava metà — misurato sull'alfa: la pietra occupava dal 9% al 60% della
casella. Una pedina posata lì sembrava dentro il muro, e le caselle giocabili
vere erano meno di sedici. Ora `htmlVtt` prende una `cornice` (in caselle) e la
tessera vale `4 caselle + 2 cornici`; il muro è una **fascia** ricavata dal pezzo
del kit, scalata perché la sua pietra sia alta esattamente quanto la cornice e
ripetuta in orizzontale, con i quadrati d'angolo a chiudere gli spigoli.

**La cornice è MEZZO muro** (correzione del 18/08, terzo giro). Con un muro
intero per tessera, fra due stanze accostate ce n'erano DUE, e in mezzo un canale
scuro spesso mezza casella: al tavolo sembrava che le stanze non si toccassero.
Ora ogni tessera ne disegna la metà e accostandole le due metà fanno la parete —
, non 0.28. E **la soglia non è un buco**: nel varco va una
porta di legno e ferro disegnata nella cornice, mezza per tessera, così il
battente appartiene alla giuntura e non a una delle due stanze (è come la mette
in tavola HeroQuest). Tessera **257 mm**, casella 60 mm, muro condiviso 17 mm.

Le due manopole stanno in `generate-tiles.js` e arrivano dall'ambiente:
`OSR_CASELLA` (px per casella, 616 = 50 mm) e `OSR_CORNICE` (spessore del muro in
caselle). **A valori di default il PNG è identico a prima** — è lo stesso
invariante dello SHA qui sotto. Le cinque spedizioni sono generate con
`OSR_CASELLA=740 OSR_CORNICE=0.28`: casella **60 mm**, muro **17 mm**, tessera
**271 mm** invece di 200. Sta ancora in un A3.

Attenzione a chi disegna il reticolo sopra: con la cornice **non è più tutta
l'immagine**, è il 6,14% in dentro per lato. Nel mockup è un `inset`; in
`digitale.js` andrà fatto lo stesso se la direzione viene scelta.

**LA TAGLIA DELLA STANZA LA DICE IL NOME** (18/08, quarto giro), come già il
pavimento e la pianta: `scripts/tiles/stanze.js`. 4×4 uno stanzino o un abbaino,
5×5 una stanza o un corridoio, 6×6 una navata, una cisterna, un magazzino. Sulle
127 tessere: 8 piccole, 81 medie, 38 grandi — le caselle di gioco passano da
2.032 a **3.521**. La casella resta 46 mm per tutte (`OSR_CASELLA=568`), a
cambiare è la tessera: 199 / 245 / 291 mm, tutte in A3. Si accende con
`OSR_LATO=auto`.

**E la stanza si arreda da sola** (`OSR_ARREDA=1`): una sala di 36 caselle che ne
riempie due è un capannone. Il corredo lo dice il nome — un magazzino accatasta
casse, una navata allinea candele e altari — e gli oggetti si addossano ai muri,
mai sulla soglia né sulla casella davanti. **Sono una proposta per i dati**:
finché non ci entrano il motore non li conosce e non fermano nessuno.

**Le sagome ora si RICUCIONO invece di essere buttate.** Prima bastava un arredo
dei dati capitato fuori dalla fascia del corridoio per far cadere tutto il
taglio: «la galleria delle eco» tornava una stanza quadrata. Adesso il pezzo
staccato si riattacca riaccendendo il cammino più corto. Cinque tessere su 127
hanno una cucitura, nessuna ne ha più di due.

**Le posizioni della plancia si contano in CASELLE**, non in tessere: con taglie
diverse non c'è più una scacchiera su cui contare. Vale per il mockup e varrà per
`layout()` in `griglia.js`.

**LE TEXTURE SONO LARGHE SEI CASELLE, non una.** `scala` in `TARATURA` stava fra
0,9 e 2,4: una piastrella per casella o poco piu'. Ma le texture della libreria
sono disegnate per un reticolo da ~140 px per casella, e una da 1000 px e'
pensata per coprirne SETTE — stringendola a una si zoomava dentro, la fuga fra
due lastre diventava larga un dito e su una stanza da dodici caselle il motivo si
ripeteva dieci volte: carta da parati. Ora sta fra 4 e 9 secondo cosa raffigura
(le assi corrono lunghe, l'acqua non ha scala di riferimento, un tappeto e' un
oggetto solo). Si paga in nitidezza — sei caselle a 300 px l'una sono 1800 px
chiesti a un file da 1000 — ma una texture morbida si legge come pietra, una
nitida e ripetuta dieci volte si legge come parati. I pavimenti si importano
percio' fino a 2048 px, non piu' a 1024 come gli oggetti.

E ogni tessera parte da un punto suo della piastrella (`sfasa`, dal nome, quindi
stabile): senza, due stanze accostate mostravano il ritaglio nello stesso posto e
la ripetizione saltava da una tessera all'altra. Lo sfasamento copre TUTTA la
piastrella — a mille pixel fissi, su una da otto caselle, spostava di un decimo.

Nuovo riferimento dello SHA per ep1/T6 senza variabili: **30376ae404400d86**.

**DIECI CASELLE E' IL MINIMO** (19/08). Sotto, una stanza e' un incrocio: si
entra, si vede tutto, si esce. Le taglie sono ora **10 / 12 / 14** (stanzino ·
stanza · sala) e la casella scende a **28 mm** — una base da 25 mm ci sta con un
filo di margine. Caselle di gioco sulla campagna: da 2.032 a **19.912**. In
carta: 10x10 → 289 mm (A3), 12x12 → 345 mm, 14x14 → 401 mm (A2, o due A3 uniti).
E' il prezzo delle dieci caselle, ed e' una decisione da prendere sapendolo.

I tagli si riscalano col lato — smusso L/4, colonne della cisterna diradate a
passo L/3, fascia del passaggio L/5, l'acqua che si mangia un angolo di L/3 — o
su una 14x14 una casella tolta per angolo e' una tacca. E gli arredi si contano
sul **perimetro**, non sull'area: le cose stanno ai muri, e a contare l'area una
10x10 usciva con venticinque oggetti. Si prende un posto ogni tot invece dei
primi in fila, o escono tutti attaccati allo stesso muro — uno scaffale, non una
stanza arredata.

**LA MANO DEL GIOCO.** Gli artwork sono fatti con un prompt che si ripete
identico su ogni carta e ogni tessera: «1889 gaslamp gothic, oil painting,
dramatic candlelight, muted teal and crimson palette with gold accents, very dark
and atmospheric». Le texture VTT non nascono cosi', e fino a ieri **i pavimenti
dipinti saltavano la gradazione** — `saturate(.9) brightness(1)`, cioe' quasi
niente, «perche' hanno gia' la loro luce». Ce l'hanno, ma e' la luce di un'altra
scatola. Ora passano da `MANO_PAVIMENTO`, e sopra ci sono la velatura teal, il
cremisi in soft-light, la grana d'olio e la filigrana d'oro consumata — che il
prompt della tessera del gioco nomina alla lettera.

Due cose imparate tarando: **il contrasto fa vedere la pietra, non la
luminosita'** (abbassando la luce usciva una nebbia grigia e la fuga fra due
lastre spariva); e **le texture vanno esposte tutte uguali all'import**
(`esponi()` in importa-fa.py, luminanza media 118), perche' fra le tre varianti
di «navata» una era marmo bianco e una marmo nero, e nessuna gradazione a valle
puo' rimediare a due punti di partenza diversi. Da 20÷200 a 72÷118.

**DICIANNOVE AMBIENTI, non più dieci** (18/08, quinto giro). Dieci erano secchi
larghi: «mattoni» teneva insieme la fonderia e il magazzino, «terra» il giardino e
la cantina, «navata» tutte le chiese. Ora ci sono `assi tavolato lastricato pietra
mattonelle mosaico navata mattoni metallo lamiera acqua melma terra ghiaia roccia
erba tappeto paglia tetti`, e sui 21 episodi ne servono **18 su 19**: la
distribuzione passa da «mattonelle 30, lastricato 23, assi 22» a una coda lunga
col massimo a 23. Il fuoco sta sul mattone, il ferro sulla lamiera, la merce sul
tavolato, chi sta seduto sul tappeto, chi entra sul mosaico.

**Tre varianti per ambiente**, come per gli arredi, scelte in modo stabile da un
hash di id+nome: due stanze dello stesso tipo accostate non hanno più lo stesso
identico pavimento. E le **macchie** non sono più tre pozze nere uguali per
tutti: fuliggine in fonderia, ruggine in officina, polvere in navata, verde
d'acqua nel canale (`SPORCO` in pittura-vtt.js).

Due cose viste sul render: **i colori squillanti non sono varianti** — FA numera
lo stesso tetto in nero, blu e rosso, e pescandone tre a caso la guglia usciva
col pavimento azzurro a righe (ora filtrati, ma solo sui pavimenti: sugli arredi
il colore è l'oggetto); e **i coppi stanno in `.webp`**, non in `.jpg` — la regola
«i pavimenti sono jpg» vale per le texture di terreno, e chiedendo `.jpg` il
tetto cadeva sulla lamiera ondulata.

**L'INVARIANTE DELLO SHA È CAMBIATO DI PROPOSITO**: le texture importate non sono
più le stesse, quindi ep1/T6 senza variabili d'ambiente ora vale
**`2d80b389bbf79bf0`** e non più `77fbb56bf88c15dd`. Da qui in poi il confronto si
fa con questo.

**L'artwork è tutto Forgotten Adventures**, muri compresi: è l'unica libreria in
casa che copre 127 tessere con una mano sola, e la coerenza era la richiesta.
Resta CC BY-NC-SA — la scelta di licenza è ancora aperta.

### IL TIRO (17/08/2026) — fatto, in app

**Scelto guardando i mockup dal telefono:** dadi d'**osso** con i punti a
**fiammella** (`webapp/public/mockups/stile2/nebbia2-dadi.html` mette a
confronto quattro materiali - osso, vetro fume', corno, ottone - e quattro
segni sulle facce - pallini, fiammelle, cifre, romane), e la messa in scena
della pagina **`nebbia2-tiro.html`**, che prende cinque cose da Baldur's Gate 3.

**Perche' non icone al posto dei valori.** Nel genere la regola e' netta: chi
tira e SOMMA tiene facce contabili (Betrayal at House on the Hill, coi suoi
0/1/2 pallini; i dadi numerati), chi CONFRONTA SIMBOLI mette icone (Mansions of
Madness 2e, Elder Sign, HeroQuest) e non somma mai. Qui si sommano 2d6 contro
una soglia: la faccia deve dire quanto vale. Le fiammelle sono icone che si
contano ancora - l'unico modo di avere le une e l'altra cosa.

**Le cinque cose prese da BG3**, tutte in `dadi.js` + il blocco `.dadi-*` di
`app.css`:

1. **chi tira ha una faccia** - ritratto, nome e prova nella riga in cima;
2. **il conto e' un registro** (`.registro-tiro`), una riga per modificatore,
   col nome della fonte e il valore a destra, e le righe entrano una alla volta;
3. **la soglia sta a schermo prima, durante e dopo**, e alla fine c'e' scritto
   il confronto (`7 < 9`);
4. **la seconda occasione arriva dopo il fallimento**: il Secondo Fiato era una
   schermata a parte che si apriva a finestra gia' chiusa, ora e' dentro la
   finestra, acceso, con scritto cosa costa;
5. **il verdetto si imprime sui dadi**, che sotto si spengono.

**IL TIRO LO VEDONO TUTTI** (richiesta del 17/08). Il dado lo tira chi ha
quell'eroe, dal suo telefono; fin qui rotolava solo li'. Ora la stessa finestra
si apre **su ogni schermo del tavolo**, in sola vista (`soloVista: true`): i
cubi arrivano fermi, il conto e' gia' scritto, e c'e' solo «continua». Non
serviva stato nuovo: gli eventi del motore il Durable Object li sparge gia' a
tutte le sessioni (`spargi`), e l'evento `tiro` porta chi, cosa, i due dadi, i
bonus, la soglia e l'esito. Il contrassegno `rif` sui comandi dell'Indagine
distingue il proprio tiro - gia' visto rotolare - da quello degli altri.

**Il banco: `webapp/test-tiro-a-tutti.mjs`** (vuole un `wrangler dev` solo).
Due schermi sullo stesso tavolo: da uno si tira, sull'altro deve comparire la
finestra in sola vista, e chi ha tirato non deve rivederla. Provato col
sabotaggio in tutt'e due i versi (spento il replay: 8 rossi; tolto il `rif`: 1
rosso).

**Due difetti visti solo GUARDANDO il render:** le regole del materiale erano
legate a `.dadi-overlay` e nella pagina dei mockup i dadi restavano senza
faccia, invisibili; e `.registro` era gia' il nome della fila delle ore - le
due regole si sommavano e le righe del conto finivano in fila invece che una
sotto l'altra (stesso inciampo del velo delle tessere: e' `.registro-tiro`).

**Non toccata la Spedizione**: li' il dado e' fisico e lo si tira davanti a
tutti (`riproduci()` in `digitale.js` lo dice da mesi), quindi rimetterlo in
scena sugli altri schermi lo mostrerebbe due volte. Se al tavolo servira'
anche li', e' un secondo passo.

### QUEL CHE IL TAVOLO HA VISTO (17/08/2026), e come e' chiuso

Quattro difetti segnalati giocando, tutti in produzione col loro banco.

**1. Rotto il sigillo si tornava allo stradario** (`ea98a2d2`). `busta()` manda
a tutti la propria pagina come schermata condivisa, ma non si segnava di averla
in scena: la spinta del tavolo tornava indietro e la RIMPIAZZAVA con la
versione senza «alla spedizione». E quella schermata, chiudendosi, torna sempre
dov'e' il gruppo — giusto a meta' serata, sbagliato a busta aperta.
Banco: `test-busta-spedizione.mjs`, che e' anche il primo a guardare lo schermo
di CHI ARBITRA: un contesto Playwright con `X-Osr-Dev-Email` si autentica come
lui, WebSocket compreso. Da qui in poi si puo' provare la sua meta' del tavolo.

**2. In Spedizione i dadi sembravano tirati due volte** (`5765f393`). Non era
il motore: la finestra in sola vista restava aperta finche' non la si chiudeva
a mano, e li' i tiri si susseguono — al secondo ce n'erano due sovrapposte, con
due risultati diversi, e sul telefono la vecchia si mangiava i tocchi della
nuova. Ora resta 4,2 secondi e se ne va da sola, e una nuova prende il posto
della vecchia invece di coprirla.

**3. Nel Preludio si camminava sugli arredi** (`c43d35f3`). Il Preludio non ha
tessere sue: STAMPA quelle dell'Episodio 1, e gli arredi glieli dava una
tabella scritta a mano che diceva altro (T1 addirittura senza ostacoli). Ora
`PRELUDIO_ARREDI` legge le TILES dell'Ep.1. Il banco `test-arredi.mjs` aveva
due buchi, ed erano quelli che l'hanno lasciato passare: girava sui soli
`ep*.json` (il Preludio non si chiama cosi') e non confrontava episodi che
stampano la STESSA tessera — adesso le immagini le riconosce da sole, per md5.

**4. Il lampo scendendo in Spedizione** (`c19a03b4`). `#app` veniva scritto tre
volte in sessanta millesimi: il disegno vero, la spinta del filo che si apre e
quella del `mettiSulTavolo`. Riconoscere le spinte inutili guardando lo STATO
non regge (lo stato cambia davvero: stanza letta, carta); conta quel che si
vede, e ora una pagina identica a quella a schermo non si riscrive. Banco:
`test-lampo.mjs` — 3 riscritture prima, 1 adesso.

**Il metodo che ha retto**, e che conviene tenere: prima un banco che RIPRODUCE
il difetto (rosso), poi il rimedio, poi il sabotaggio del rimedio per vedere il
banco tornare rosso. Il difetto del Preludio, in particolare, si e' trovato solo
perche' il banco copriva un elenco di episodi e il Preludio ne era fuori: un
episodio non in elenco e' un episodio non misurato.

**Fatto finora nell'app** (`webapp/public/app.css`): i token di `:root` sono la
palette di «notte e nebbia» (i nomi restano — `--tavolo`, `--ardesia`, `--osso`,
`--nastro` = il lume — perché mille righe li usano già), e sono passati alla
pelle nuova `.pannello` (lastra di vetro, raggio 10, sfocatura), `.btn`
(pillola; il pieno è di lume con la scritta scura), `.voce`, `.menu-voce`,
`.menu-titolo`. La home gira senza errori JS.

**Fatto anche** (commit `36f0f73c`, poi il passo 2): `test-stile.mjs` riscritto
sulle regole della direzione nuova — nessun testo sull'immagine nuda, le lastre
sono di vetro, ogni bersaglio arriva a 44px; restano la carta vera e il
contrasto. E in `app.css` ci sono le componenti nuove copiate dai mockup:
`.capo`, `.lumi`/`.lume-punto`, `.scena`, `.azioni`, `.bottoni`, `.foglio`,
`.velo`, `.ic`, `.turno`.

**Il banco che rende verificabile «identico ai mockup»: `webapp/test-pelle.mjs`.**
Pianta le stesse componenti nel mockup e nell'app e confronta gli stili
calcolati, proprietà per proprietà (raggio, tinta, corpo, padding, sfocatura,
colonne della griglia). Se una regola diverge, **il mockup ha ragione**: è lui
la specifica. Ha già trovato due derive (il carattere delle voci di menu, un
`white-space` di troppo) e passa quattro sabotaggi.

**L'Indagine, fatta finora:** il capo (ora coi lumi + menu con l'icona e il
bollino) al posto della vecchia riga-registro; la scena a piena larghezza con
l'artwork e il nome del luogo sopra, al posto del banner alto 172px; via la
barra con la freccia — l'uscita dalla serata è una voce del menu; i quattro
tipi di Approfondimento sono righe intere con l'icona e chi può tentarli. Le
icone stanno in `webapp/public/icone/` e lo sprite lo genera
`webapp/fai-icone.mjs` (lo stesso dei mockup: due copie divergerebbero).

**Tre difetti veri trovati misurando, non guardando:** la colonna della griglia
non si stringeva e il paragrafo del narratore usciva di 39px dallo schermo; un
bottone con l'etichetta lunga usciva di 8px (era il `white-space: nowrap`); la
scena restava a 2px dai bordi invece che a filo. Corretti **in tutt'e due** —
app e mockup — perché aggiustare da una parte sola li fa divergere.

**L'Indagine è finita** (16/08/2026): capo, scena, azioni in griglia, tipi con
le icone, e il **menu come foglio** che sale dal basso — appeso al `body`, così
sopravvive ai ridisegni che arrivano dal tavolo, e chiuso all'uscita, così non
resta un velo a tutto schermo sopra una schermata che non è più la sua. La
classe `.velo` voleva dire due cose (la velatura decorativa delle tessere e
questo velo): la prima si chiama `.velo-tessera`.

**Un rosso intermittente da chiudere**: in `test-partite` una giocata su 42
cade con `locator.waitFor: Timeout`, in punti diversi a ogni corsa (ep4 in una,
ep1 in un'altra), circa 2 volte su 16 — ma poi 10 corse di fila senza cadute, e
il controllo del velo è verde. **Non è ancora spiegato.** Il modo per coglierlo
è `OSR_DIAG=1 node webapp/test-partite.mjs --solo=3` in ciclo finché non cade:
il banco stampa la schermata e lo stack solo con quella variabile.

**In produzione la versione `ffba45c8`** (17/08/2026): pelle nuova ovunque,
Indagine portata per intero, home a manifesti. Dopo i mockup sono arrivate tre
richieste al tavolo, tutte fatte: le **icone sui bottoni** della testata, lo
**stradario spostato in una voce di menu** (resta in pagina solo su «siete per
le strade», dove è il punto della schermata), e dentro un luogo **prima «da
prendere, qui», poi gli Approfondimenti**.

**Due controlli erano vacui e sono stati rifatti**, e vale la pena ricordarlo
perché è lo stesso errore due volte: quello sull'ordine dentro il luogo girava
su un luogo senza oggetti (condizione mai entrata, verde a vuoto), e quello sul
testo sull'immagine nuda non vedeva i manifesti (lì l'immagine è un fratello
sotto, non un antenato). Adesso il primo pretende che il luogo di prova abbia
davvero le due sezioni, il secondo guarda la geometria.

**Il prossimo passo, in ordine:**

1. **`webapp/test-stile.mjs` va riscritto sulla direzione nuova.** Oggi difende
   le regole del «fascicolo» e fallisce di conseguenza: *«nessun bordo d'oro
   fuori dalla mappa»* (19) e *«nessun angolo tondo oltre 3px»* (44). Non è il
   codice a essere sbagliato — è il banco che custodisce una direzione che è
   stata cambiata per decisione. Restano valide: la regola della carta vera e il
   contrasto (311 testi misurati, 0 sotto soglia).
2. Le componenti nuove in `app.css`, copiate dai mockup: `.capo` (sticky, ora +
   menu col bollino), `.scena` (artwork a piena larghezza con la doppia
   velatura), `.azioni` (griglia 128px, righe da 68px), `.foglio` (il menu che
   sale dal basso), `.lumi`, `.turno`, e per la Spedizione `.mappa`/`.stanza`
   con la nebbia.
3. Le viste dell'Indagine (`webapp/public/js/indagine.js`) riscritte sulle
   stesse classi dei mockup — prima quella di chi arbitra (stradario di fianco),
   poi il telefono.
4. Poi la Spedizione (`digitale.js`, `boardHtml()`): lì si tocca **codice di
   gioco**, non solo stile.

**Come si verifica che sia identico:** i mockup e l'app si aprono affiancati
sullo stesso schermo (390px e 1024px), e si confrontano le misure — colori,
raggi, corpi, altezze delle celle — non le impressioni. Le pagine dei mockup
sono già state passate al setaccio: contrasto ≥4.5:1, bersagli ≥44px, griglie
con tutti i bottoni della stessa larghezza.

**Da non dimenticare:** `test-ui`, `test-zoom`, `test-partite` (42 giocate) e i
banchi del tavolo vanno rifatti **a codice fermo** prima di ogni commit; e la
regola della carta vera (`--carta*` solo dove nella finzione c'è un foglio) non
si tocca: è l'unica cosa che nella pelle nuova resta com'era.


> A cosa serve: se la sessione muore, questo file basta a riprendere senza
> ricostruire niente. Si aggiorna a ogni commit. Qui c'è **dove siamo**, cosa
> gira e il prossimo comando; il *cosa fare* di un lavoro in corso sta nel suo
> piano.

**Aggiornato:** 14/08/2026 · ramo `main` · in produzione la versione `55ecc1ea`
su <https://roccamora.smartcores.org> — **i Bivi di campagna** (venti scelte che
cambiano davvero le regole degli episodi seguenti), il **Taccuino di Campagna**
e l'**epilogo per esteso**. Tabella `scelte_campagna` applicata al remoto.

**Non ancora in produzione:** le **Migliorie** (sotto). La tabella
`migliorie_campagna` non è al remoto, ma **non c'è niente da ricordarsi**: sta
in `deploy/schema.sql` e in `deploy/migrazioni/003-migliorie.sql`, e
`deploy/deploy.sh` chiama `applica-schema.sh --remote` da solo. Vale però
l'avvertenza di sempre: pubblicando a mano con `wrangler deploy` invece che con
lo script, il codice va su e il database no — ed è già successo, con `membri`.

## Le Migliorie: da carta stampata a regola che gira

**Fase A chiusa (14/08/2026), commit `73422a0c`, `a78ba3b6`, `7a6f6289`.** Il
Regolamento prometteva da sempre una crescita permanente per eroe — «dopo ogni
episodio riuscito, ogni eroe spunta una casella» — e non ne esisteva **una riga
di codice**: zero occorrenze in `webapp/`, nel motore, nello schema D1, nei
simulatori. Lo dichiarava il Regolamento stesso: *«Nessun simulatore modella le
Migliorie: le percentuali di vittoria misurate finora valgono per eroi al primo
episodio»*.

Piano in `~/.claude/plans/ad-oggi-l-app-e-floofy-matsumoto.md`. **Le Fasi B
(misurare col pilota) e D (la carta stampata) non sono state fatte.**

**`webapp/public/motore/migliorie.js`** — dodici voci, con la disciplina dei
Bivi: quel che l'app sa fare si applica da solo, quel che può solo dire esce
come riga, una voce sconosciuta non passa in silenzio. Nove agganci, tutti
dentro funzioni che esistevano già: `eroe()` (Tempra, Fibra, Cicatrici — e
siccome ogni chiamante di `saluteMax` prende l'oggetto da lì, la Fibra arriva
alla Salute senza una seconda riga), la nuova `difesaDi()` (Spalle coperte),
`prova()` accanto a `bonusVoce` (Mano ferma), `provaDi` (Lanterna, Revolver),
`abilita.js` (Borsa di garze, Passo felpato), `frammentiPortati` (Voce che
regge), `motore/indagine.js` (Occhio esercitato).

**Tre voci compravano regole che non esistono, e sono state riscritte.** *Passo
felpato* comprava l'immunità agli attacchi di reazione — che non sono nel
Regolamento (il turno nemici dice solo «se adiacente, attacca») né in
`nemici.js`: ora è +3 caselle. *Occhio esercitato* comprava il ritiro di una
prova che già non spende la carica: ora tiene aperta la scena, cioè risparmia
l'ora. *Il Revolver* era «una volta per round» — a dieci eroi, dieci colpi
gratis a round, che `PROMPT-ESPANSIONE.md` vieta esplicitamente: ora spende
l'azione di attacco, quindi in un turno si spara **o** si mena.

**Due restano righe da leggere**, ed è dichiarato: *Taccuino fitto* (la
RILETTURA non è implementata) e *Fiato lungo* (il Secondo fiato in Spedizione
non esiste — vedi «Quello che resta»).

**Le Migliorie costano.** Un punto per serata riuscita (l'Ep.6 due), i punti si
mettono da parte, e le voci hanno un prezzo: Tempra 1/2/3/4 sulla stessa
caratteristica, Fibra 1/2/3, Revolver e Spalle coperte e Fiato lungo 2, il
resto 1. Comprare tutto costa **28 punti contro i ~22 di una campagna
perfetta**: la scelta resta viva fino all'ultima serata. Senza prezzo, 17
caselle contro 21 serate facevano una tabella di marcia — lo stesso guasto
dell'elenco a cinque voci, rimandato di otto serate. I prezzi stanno in un
posto solo (`COSTI` in `migliorie.js`) e **vanno tarati dopo la Fase B**.

**Chi spunta cosa.** Dal **telefono** si spuntano le caselle del proprio eroe e
le altre si leggono — la scheda è di chi la gioca, e al tavolo la matita ce l'ha
lui; il proprio eroe sta **in cima** alla lista, che su un telefono la compagnia
è una colonna lunga. Chi **arbitra** le spunta tutte, perché tiene in mano gli
eroi che nessuno ha reclamato e perché quando si gioca in due davanti a uno
schermo solo la mano è una. È lo stesso `posso(nm)` che decide chi muove quale
pedina, e il server dice la stessa cosa (`puoSegnare` in `api.js`): se le due
guardie divergessero si vedrebbe un bottone che il server rifiuta, che è peggio
che non vederlo.

**I punti sono a testa, non un salvadanaio comune** — «una casella **a testa**
dopo ogni episodio riuscito». La prima versione li sommava su tutta la
compagnia: quattro eroi si dividevano il budget di uno, e dal telefono due
giocatori che spendono insieme si sarebbero mangiati i punti a vicenda.

**Dove stanno.** `migliorie_campagna(tavolo, eroe, voci, cicatrici)` su D1,
gemella di `scelte_campagna`: una casella spuntata dopo l'Ep.3 pesa fino
all'Ep.20, e il blob di salvataggio è per episodio. Migrazione
`deploy/migrazioni/003-migliorie.sql`, endpoint `/api/migliorie`, copia locale
in `store.js`, `partita.migliorie` scritta da `comincia()`. **I punti
guadagnati e spesi non si scrivono**: i primi li dicono i salvataggi, i secondi
la somma dei prezzi — due conti della stessa cosa divergono, come per i
Frammenti. Si spuntano nell'epilogo (`crescita-scelta.js`), accanto al Bivio e
con le sue stesse regole.

**Tre difetti che il diff non conteneva, trovati eseguendo:**

1. **Il Revolver non aveva un bottone.** Il motore accettava `arma: 'revolver'`
   e nessuna vista lo mandava: la cosa esatta che `AUDIT-CLASSI.md` condanna.
2. **`schedaEroe` mostrava la carta stampata**, non l'eroe di stanotte. Dopo
   dieci serate quei numeri sono altri, e ci si accorge dell'errore litigando
   su un tiro.
3. **`motore/indagine.js` leggeva l'ACUME da `comune.eroi` dritto**: un eroe
   cresciuto tirava «leggere la scena» coi numeri del primo episodio. Nessun
   errore da nessuna parte — il tiro riesce lo stesso, solo meno spesso.

E uno trovato dal sabotaggio: **`distGlob` torna 0 quando un cammino non c'è**,
e 0 non è «vicinissimo». Senza la guardia, il Revolver sparava attraverso i
muri — e il colpo più comodo del gioco era quello impossibile.

**Le due barriere, e come sono state provate.**
`webapp/test-migliorie.mjs` (motore, 18 sabotaggi) e
`webapp/test-migliorie-app.mjs` (la vista, 6 sabotaggi; vuole il server).
Ognuno dei 24 fa cadere almeno una sonda. Il sabotaggio ha bocciato due
versioni del banco: una che guardava se il bottone c'era invece di premerlo
(un bottone scollegato passava), e una che cercava «garze» in `innerText`
mentre la striscia delle cariche vive in `.secondario`, che il modo immersivo
ripiega.

> **Nota per chi misura.** `test-abilita` (2 KO) e `test-digitale-regressioni`
> (3 falliti) erano **già rossi**: verificato con un A/B su `git worktree` al
> commit `58a9de0c`, stessi identici falliti prima delle Migliorie.

**Il prossimo passo è la Fase B**, e va fatta a codice fermo (`git status`
pulito): seminare le Migliorie in `misura-episodio.mjs` come già si semina il
tier d'Indagine, insegnare al pilota a sparare e a usare la Borsa, e rimisurare
Ep. 9, 11, 15 e 20 con un gruppo cresciuto. Ricordando che σ ≈ 17 punti per
episodio: conta la media sui ventuno, non la singola casella.

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
| `test-migliorie` | le dodici Migliorie **agiscono** nel motore, e in Indagine come in Spedizione. 18 sabotaggi, tutti mordono |
| `test-migliorie-app` | le Migliorie si **vedono e si toccano**: il bottone del Revolver, le cariche, la scheda cresciuta. Vuole il server; 6 sabotaggi |
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

## L'Indagine dentro il motore

Dopo la notte dei quattro difetti — tutti con lo stesso sintomo, «premo e non
accade niente», e la stessa radice: **il motore era una finestra aperta su un
PC** — l'Indagine si sposta nel motore, come la Spedizione. Piano in
`~/.claude/plans/synchronous-hopping-hartmanis.md`.

**Prima, una potatura**: resta **una modalità sola** — al tavolo, con la plancia
a schermo. Via `spedizione.js` (1131 righe), via `modo` e `plancia`, via la
domanda «come giocate stasera». La sola scelta è **da dove si comincia**.

**Finita.** `motore/indagine.js` è puro; `applica` smista per fase. Sono
comandi: dichiarare, bussare, il grimaldello, entrare e uscire, oggetti e
reperti, la lettera, gli appunti (del gruppo e di ciascuno), le risposte,
**guardare meglio**, l'**aiuto profano**, il **Secondo Fiato**, le quattro
**una-tantum** (Discernimento, Fonti riservate, Ombra, Esame di Carbone), il
**pendolo** di Sibilla, la **busta** e le **correzioni**. Il tiro viaggia
**dentro il comando**, e con questo si è cancellata la macchina della pendenza:
`richiesta`, `pendenza`, `chiediAlTavolo`, `eseguiRichiesta`, `chiHaLEroe`,
`attesaDelTiro`, i due comandi del Durable Object e la spia «il tavolo sta
guardando». `js/indagine.js` non muta più niente: chiede a `esegui()` e disegna.

**Chi manda cosa.** Del gruppo — l'ora, le porte, gli oggetti, le risposte, la
busta — chi arbitra (`INDAGINE_DI_ARBITRO`). Del proprio eroe — approfondire,
la propria una-tantum, i propri appunti — chi lo gioca, e chi arbitra per gli
eroi che nessuno ha preso. Le una-tantum controllano **due** cose: che quell'eroe
sia in squadra, e che il comando venga dal suo telefono («quel dono è di X»).

**Il peso della notte lo calcola il motore.** `pesa()` rifà da capo tier,
dossier, risposte e Canto iniziale a ogni correzione — un conto incrementale
qui sarebbe il posto perfetto dove nascondere un errore. E a **busta aperta**
due comandi passano ancora (`DOPO_LA_BUSTA`): `correggi`, perché l'ultima parola
è del gruppo, e `carta-vista`.

**Due difetti veri trovati montando le tappe 3-4**, e sono il genere che il
diff non mostra:

1. **Il tavolo timbrava `aggiornato` col clock del server** anche sui comandi
   d'Indagine. `aggiornato` è la lineage del salvataggio di chi arbitra: la sua
   mossa successiva, col clock del suo PC, veniva rifiutata da `apri` **in
   silenzio**. In locale i due orologi sono lo stesso e non si vede niente.
2. **`ctx.tavoloVivo` non veniva mai alzato in `js/indagine.js`.** La Spedizione
   lo alza in `digitale.js`; l'Indagine, che quel ramo non l'aveva mai avuto,
   no. Quindi `esegui()` restava **sempre** sul ramo locale, e chi gioca leggeva
   «mi sto ricollegando al tavolo» premendo bottoni che non facevano niente —
   cioè il difetto di partenza, sopravvissuto alla migrazione dentro una
   variabile mai messa a `true`.

**Due lezioni che valgono oltre questo lavoro.**

*Una scena non è un errore.* Due volte ho trasformato «hanno chiuso alle 20» o
«il dilettante ha già avuto la sua occasione» in un rifiuto rosso. Dichiarare
era una mossa **legale**: la risposta è «non se ne fa niente, e l'ora resta».
Sono eventi, e la prosa la compone la vista.

*Il banco che non arriva fin lì.* `test-indagine-eroe` vuole
`--var OSR_DEV_EMAIL:giocatore@esempio.it`, e `test-partite` vuole
`node webapp/server.js` sulla **8017**: lanciato contro il `wrangler dev` con
gli account, si ferma sulla scelta del tavolo e dà **42 giocate rosse** che non
c'entrano niente col codice.

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

0. **Le Migliorie: Fase B e Fase D.** La misura col pilota (a codice fermo) e
   la carta stampata — la scheda personaggio ha ancora quattro righe vuote
   invece delle caselle (`gen_deluxe.py:138`), il Taccuino di Campagna non
   traccia i punti, e i fascicoli di **Ep. 2, 3, 4, 5 e 7 stampano ancora
   l'elenco vecchio a cinque voci** (`gen_ep2.py:685` e gemelli). Finché la
   Fase D non è fatta, al tavolo la regola non ha dove essere segnata.
0-bis. **La Spedizione digitale gioca senza il Secondo fiato.** È stampato
   sulla scheda (`gen_deluxe.py:119`) e sul Regolamento (`gen_docs.py:153`),
   vive in `indagine.js` e non esiste in `digitale.js` né nel motore: a schermo
   quel ritento non l'ha mai avuto nessuno. Non è un problema delle Migliorie —
   ma **Fiato lungo non si può implementare finché quello non esiste**, ed è il
   motivo per cui oggi è una riga da leggere. Va misurato che effetto ha prima
   di accenderlo.
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
