# Audit dei testi dell'app

> **STATO: applicato il 24/09/2026.** Tutte le voci sono chiuse; le tre che
> chiedevano una decisione (§1) sono state decise così:
>
> - **T-01** — il Bivio **non** si blocca: bloccarlo impedirebbe anche di
>   rigiocare un episodio sigillando un'altra strada, e la scelta resta di chi
>   arbitra. È il testo che ora dice la verità (`bivio-scelta.js`): la nuova
>   scelta vale per ogni episodio che comincia da quel momento. Corretto anche
>   l'avviso di `main.js` sul rigiocare, che diceva «comprese le serate già
>   giocate»: i Bivi si applicano in `comincia`, quindi le serate giocate
>   restano com'erano.
> - **T-02** — ha ragione **la carta stampata**: la regola «non conta come ora
>   avanzata (né come luogo in più)» è scritta sulle carte di Carla e di Marani
>   e due volte nel Regolamento. Il motore ora tiene il conto delle visite
>   regalate (`entra` → `oreRegalate`, `luoghiRegalati`) e `tierIndagine` le
>   toglie. Nuovo controllo in `test-motore-indagine.mjs`, provato non vacuo
>   (col vecchio calcolo: 6 ore contro 5, 1 luogo contro 0).
> - **T-03** — la mia analisi era sbagliata: i dadi della Spedizione sono
>   **fisici** (`digitale.js: modoDadi = 'tavolo'`, l'app chiede il totale),
>   quindi il ritento di «Fiato lungo» si fa a mano prima di dare il totale e
>   la Miglioria **funziona**. Il difetto era solo la nota di sviluppo: ora il
>   testo dice come si usa.
>
> Nel correggere sono emerse altre voci della stessa famiglia, chiuse insieme:
> «PNG» anche nei testi della busta (Ep.7, 9, 12, 13, 16-20: ~25 frasi, lette
> al tavolo dopo aver aperto la Soluzione), due virgolette dritte nell'epilogo
> dell'Ep.19, «Portalo» (Nina, Ep.16) e «Tocca a **il PNG**» (il nome di
> ripiego dello scortato). «Spawn» invece resta: è il nome di un tipo di carta
> nel lessico del gioco, usato in oltre 15 punti.
>
> **T-11, la voce:** il gioco e le schermate di chi gioca parlano al «voi»
> (anche «Toccate», «Trascinate», «guardate di nuovo», «entrerete»); le
> schermate di servizio di chi arbitra (tavoli, rubrica, compagnia) al «tu»,
> **bottoni compresi** («elimina il tavolo», «chiudi la porta», «togli dal
> tavolo», «lascia stare»). Così sparivano anche «toglietelo»/«toglietela», che
> costringevano a scegliere un genere.
>
> **Un mio errore del 23/09, trovato eseguendo i test d'interfaccia:** per
> ridare «ricomincia da capo» a una serata in corso avevo tolto la scorciatoia
> «riprendete la serata → dritti dentro la partita». Era una scelta di design
> protetta da `test-ui` e `test-account-ui`, che da allora erano rossi. Ora la
> scorciatoia è tornata, e «ricominciate da capo» sta **nella scheda del caso**
> accanto a «riprendete la serata» (solo per chi arbitra, e con lo stesso
> avviso sul Bivio). `test-ui` controlla che ci sia.
>
> **La barriera:** `webapp/test-testi-app.mjs` controlla i sorgenti dell'app
> (solo le stringhe: commenti e codice esclusi) per accenti con l'apostrofo,
> «PNG» e apostrofi dritti. Provata non vacua sui sorgenti di prima: 22
> difetti trovati. `test-testi.mjs` è di nuovo verde.

**24/09/2026.** `AUDIT-TESTI.md` (11/08) ha riletto le carte, cioè i testi in
`webapp/data/*.json`. Da allora nell'app sono nati molti testi che non passano
di lì: le schermate dei tavoli, della rubrica e della compagnia, la scheda del
caso, le piste fredde, i messaggi del motore, i doni degli eroi, le Migliorie.
Questo referto rilegge **quelli**, e riprova i dati con la barriera esistente.

Corpus: 549 stringhe visibili estratte da `webapp/public/js/*.js`,
`webapp/public/motore/*.js` e `index.html`, commenti esclusi; più il giro di
`webapp/test-testi.mjs`, `scripts/audit.py` e `webapp/test-piste-fredde.mjs`
sui dati rigenerati. Cosa è stato letto e cosa no sta nel §5.

Come in `AUDIT-TESTI.md`, ogni voce dice **dove**, **cosa non va** e **perché
è un difetto** — cioè cosa succede al tavolo. Gli id (`T-nn`) sono stabili.

---

## 1. Il testo promette una regola che l'app non applica

Sono le voci che non si correggono con una parola: il testo e il motore dicono
due cose diverse, e va deciso **quale dei due ha ragione**.

### T-01 · Il Bivio «si può cambiare fino alla prossima serata» — ma si cambia sempre

`js/bivio-scelta.js:50`

> Cambia le regole degli episodi che verranno. Si può ancora cambiare idea,
> finché la prossima serata non comincia.

Nessuna riga di codice chiude il Bivio quando comincia la serata dopo: dall'epilogo
(«rivedi l'epilogo») le altre opzioni restano sigillabili per sempre, anche con
dieci episodi giocati sopra. Chi arbitra legge una garanzia che non c'è, e può
cambiare le regole di serate già giocate senza accorgersene. Da ieri il rischio
ha anche una seconda porta: rigiocando un episodio (l'avviso di `main.js:273` lo
dice, questo testo no).

**Da decidere:** o l'app chiude il Bivio quando esiste un salvataggio di un
episodio successivo (e la frase diventa vera), o la frase dice la verità:
«Si può cambiare idea anche dopo: vale da quel momento per tutta la campagna».

### T-02 · Le Fonti riservate di Carla: «il vantaggio premia le ore spese davvero»

`js/indagine.js:1770` (e il commento gemello in `motore/indagine.js:428`)

> Non conta come ora avanzata a fine indagine: il vantaggio premia le ore spese
> davvero.

Due problemi sovrapposti:

- **la frase dice il contrario della regola.** Il vantaggio d'Indagine premia le
  ore **non** spese (`regole.js:tierIndagine`: `oreAvanzate = 24 - ind.ora`);
  «premia le ore spese davvero» si legge come «più ore spendete, meglio è»;
- **il motore non fa quel che la prima metà promette.** La visita gratuita non
  avanza l'orologio, quindi l'ora risparmiata resta non barrata e **conta** fra
  le avanzate. Il commento in `regole.js:112-116` lo dice apertamente («niente
  sconti punitivi qui»). Il giocatore legge «non conta», il motore la conta.

**Da decidere:** se l'ora di Carla deve contare (è quel che fa il codice), la
nota va tolta o riscritta: «L'ora che risparmiate resta vostra fino a fine
indagine». Se non deve contare, è il motore da cambiare.

### T-03 · La Miglioria «Fiato lungo» si compra, ma in Spedizione non fa niente

`motore/migliorie.js:79`

> Fiato lungo: il vostro «Secondo fiato» si ricarica una seconda volta, la prima
> volta che scendete a 2 Salute o meno. In Spedizione a schermo il Secondo fiato
> non è ancora offerto: tenetelo a mente al tavolo.

La seconda frase è una **nota di sviluppo** finita nel testo di gioco: l'app
ammette di non saper fare quel che vende. E la vende davvero — la casella costa
punti di crescita, che sono pochi (uno a serata riuscita). Chi la sceglie dal
telefono paga per un effetto che nessuno schermo gli offrirà mai.

**Da decidere:** nasconderla dalle offerte finché il Secondo fiato non esiste in
Spedizione, oppure implementarlo. In ogni caso la frase «non è ancora offerto»
non dovrebbe arrivare a chi gioca.

### T-04 · «Tutto il sotterraneo è qui» — sui tetti, a teatro, in archivio

`js/digitale.js:276`, la prima schermata di ogni Spedizione a schermo

> Tutto il sotterraneo è qui: muovete gli eroi a caselle…

Vale per le cripte e le cisterne, non per tutte le Spedizioni: l'**Ep.14** si
gioca sui tetti (*La Gronda, Il Comignolo, La Terrazza dei Panni, L'Abbaino, Il
Lucernario*), l'**Ep.4** dietro le quinte di un teatro, l'**Ep.19** nelle sale di
un archivio. È la prima frase della serata, e smentisce la carta del luogo che
il tavolo ha appena guardato.

**Rimedio:** «Tutta la spedizione è qui: …» — vale per ogni episodio.

---

## 2. Testo sbagliato

### T-05 · Accenti scritti con l'apostrofo — 2 stringhe

La famiglia di `AUDIT-TESTI.md` §5.3, tornata nei testi nuovi:

- `js/main.js:273` — «il Bivio di questo episodio **e' gia'** sigillato… le
  serate **gia'** giocate». È l'avviso aggiunto il 23/09 (mio): la convenzione
  dei commenti del repo è scivolata nel testo per i giocatori. **Corretto** nello
  stesso commit di questo referto.
- `motore/vittoria.js:70` — «… **e'** al sicuro, ma il lavoro non **e'**
  finito». È la riga del diario quando lo scortato è salvo ma resta un compito:
  si legge ad alta voce, a fine serata.

**Rimedio:** è, già.

### T-06 · «PNG» nel testo dei giocatori — torna, 17 volte

La famiglia di `AUDIT-TESTI.md` §5.6 era stata chiusa l'11/08; `test-testi.mjs`
oggi è **rosso** su questa sonda.

- `motore/comandi.js:100` — «Quel **PNG** non è ancora libero.»
- 16 note di Bivio nei dati (`ep10`, `ep11`, `ep12`, `ep13` … `bivi_qui[].nota`):
  «… un **PNG**-alleato in meno per il resto della campagna». Le note dei Bivi si
  leggono **prima** di sigillare, ad alta voce, a tutto il tavolo.

PNG è una sigla d'arbitro da manuale: nessuno al tavolo la dice, e nel resto
dell'app il personaggio ha sempre un nome.

**Rimedio:** «Non è ancora libero.» (il nome lo porta già il bottone); nelle
note, «un alleato in meno» — la frase sta in quattro sorgenti: `src/bivi.py`,
`src/gen_ep9.py`, `src/gen_ep10.py`, `src/gen_ep17.py`.

### T-07 · Virgolette dritte negli epiloghi — 6 casi, regressione

`test-testi.mjs` **rosso** anche qui (`AUDIT-TESTI.md` §3.3):

- `ep14.json epilogo.vittoria` — «“Il lavoro era strano,” dice. **"**Di solito ci
  pagano per portar via…**"**» e «…l'avrebbero trovata.**"**»: nello stesso
  paragrafo convivono virgolette curve e dritte.
- `ep17.json epilogo.vittoria` — «Sorride: **"**Il mio cliente firma poco,
  signori. Ma paga sempre.**"**»

**Rimedio:** caporali o virgolette curve, come il resto degli epiloghi; la fonte
è in `src/gen_ep14.py` e `src/gen_ep17.py`.

### T-08 · Il genere fisso al maschile — eroine, Nina, gli invitati

Quattro degli undici eroi sono donne (Elena Fosco, Sibilla Reve, Carla Dosti,
Mora Fanti). Queste righe ricevono il nome e lo accordano sempre al maschile:

- `motore/azioni.js:53`, `js/digitale.js:903` — «Elena **è stordito**: 1 sola
  azione al prossimo turno.»
- `js/digitale.js:733` — «Nessuna casella raggiungibile: Sibilla **è bloccato**…»
- `motore/comandi.js:79` — «Il tiro fallito è di mora: **tocca a lui**.»
- `motore/interazioni.js:149` — nell'**Ep.16** lo scortato è Nina: «Nina **è
  libero**! **Riportatelo** in T1.» (Gli altri scortati sono uomini.)

E la persona invitata cambia sesso da una schermata all'altra, nella stessa
frase: in rubrica è lei (`rubrica.js:90,95` «come **la** chiami», `:160` «non
**le** arriverà»), nella compagnia è lui (`membri.js:141` «**lui** entra da
solo», `:159,162` «come **lo** chiami», `:289` «non **gli** arriverà»).

**Rimedio:** dove il nome è di un eroe, riformulare senza accordo («Elena,
stordimento: 1 sola azione al prossimo turno», «il tiro fallito è di Mora: la
ripetizione spetta a chi l'ha fallito»); per gli scortati, o un campo di genere
nei dati («Nina è libera») o una frase che non accorda («Via libera: portate
Nina in T1»). Per gli invitati, la forma di `rubrica.js` è già neutra rispetto a
«persona»: usarla anche in `membri.js`.

### T-09 · «(aveste speso tutte e sei le ore)»

`js/main.js:525`, nella schermata «com'era finita l'indagine?» della sola
Spedizione

Il congiuntivo da solo, fra parentesi, non regge la frase. Tutta la schermata è
al trapassato («quali **avevate** azzeccato?»).

**Rimedio:** «(avevate speso tutte e sei le ore)».

### T-10 · «bancate un incrocio», «sul board»

- `motore/migliorie.js:76` — «Taccuino fitto: … rileggete una lettera
  d'incarico già archiviata e **bancate** un incrocio in più»
- `js/digitale.js:738` — «▸ Tocca un'altra pedina sul **board** per farla
  agire.»

«Bancare» non è italiano (è gergo da giocatori, *to bank*), e «board» è
inglese: nel resto dell'app è sempre «il tabellone» o «la mappa». Fra caporali,
lettere d'incarico e il «voi» del 1889 sono le uniche due parole che escono
dall'epoca.

**Rimedio:** «e segnate un incrocio in più»; «sulla mappa».

---

## 3. Forma: la stessa voce che cambia modo di parlare

### T-11 · «Tu» e «voi» nella stessa schermata

La divisione in sé è sensata e va tenuta: **il gioco parla al tavolo** («voi»:
«scegliete il caso», «tornate indietro», «rompete il sigillo»), **le schermate di
servizio parlano a chi arbitra** («tu»: «le persone con cui giochi», «se esci,
viene scartato»). Il difetto è dove le due voci si mescolano:

- nel gioco, al «tu»: `digitale.js:732` «**Tocca** una casella verde», `:737`
  «**Tocca** un nemico adiacente», `:451` «**Trascina** per spostare la mappa»,
  `:770` «a chi **spari**?», `:988` «🎲 **risolvi** la prova richiesta»,
  `main.js:258` «**scegli** gli investigatori →», `main.js:678` «**entrerai**
  direttamente nella partita — non **devi** scegliere niente»;
- fra le abilità, una sola al «tu»: `abilita.js:35` «Fino al **tuo** prossimo
  turno…», accanto a `:57` «**Muovetevi** di 3 caselle»;
- nelle schermate di servizio, i bottoni al «voi» accanto a quelli al «tu»:
  `tavoli.js:80` «**butta** dal dispositivo» e `:101` «**eliminate** il tavolo»
  nella stessa schermata; `membri.js:205` «**scarta** il tavolo»;
  `rubrica.js:198` «**chiudete** la porta» in una domanda che dice «Chiudere la
  porta a Giulia? Non potrà più entrare…».

**Rimedio:** portare ciascuna riga alla voce della sua schermata.

### T-12 · Apostrofi dritti — una ventina di stringhe

Tutto il resto dell'app usa l'apostrofo tipografico (’). Queste righe no:
`digitale.js:733,738,1068,1558` (tutt'intorno, un'altra, l'uscita,
nell'inventario); `indagine.js:1371` (un'ora); `abilita.js:158,182,205`;
`azioni.js:353`; `comandi.js:343`; `interazioni.js:158,242,266,277`;
`migliorie.js:59,63,69,73,76` (scritti `\'` nel sorgente).

Sul telefono il carattere cambia forma nel mezzo della frase. È la famiglia di
`AUDIT-TESTI.md` §3.3, e `test-testi.mjs` la controlla solo sui dati, non sui
sorgenti dell'app.

### T-13 · «Secondo Fiato» e «Secondo fiato»

`js/indagine.js:1628` «Secondo **F**iato di Elena»; `motore/migliorie.js:79-80`
«il vostro «Secondo **f**iato»». Stessa regola, due grafie. Il Regolamento
decide quale.

---

## 4. Controllato e trovato giusto

Per non ricontrollarlo la prossima volta:

- le **sei ore** d'Indagine («tutte e sei le ore», «È mezzanotte») — ogni
  episodio ha `ore_budget: 6`, dalle 18 alle 24;
- «con **un'ora sola** non si dichiara» (`indagine.js:1371`) — le trasferte da 2
  ore sono solo due (Ep.13, Ep.17): il pannello scatta davvero solo con un'ora
  residua;
- gli **atti** della scheda del caso (I = 1-6 … IV = 19-20) coincidono con i
  sottotitoli di tutti i 21 episodi;
- **Mora e il furetto Ombra**, **Carbone e la bottega**, **il pendolo di
  Sibilla**, **Marani** — i doni nel testo coincidono con le schede in
  `comune.json`;
- il **turno dei nemici** («si avvicina all'eroe più vicino e colpisce se
  adiacente») è una semplificazione onesta di `nemici.js`;
- le **piste fredde** (`engine.js:43-71`): 3.690 frasi, nessuna fa bussare dove
  non c'è una porta (`test-piste-fredde.mjs`); lessico d'epoca, nessun
  anacronismo trovato;
- `scripts/audit.py`: **0** finding meccanici.

## 5. Cosa ho letto e cosa no

- **Letto per intero:** le 549 stringhe dell'app (§ corpus), una per una.
- **Passato al setaccio, non riletto:** i 5.437 testi dei dati, con le sonde di
  `test-testi.mjs` (quelle rosse sono T-06 e T-07). La rilettura a voce dei
  dati è stata fatta l'11/08 (`AUDIT-TESTI.md`); i testi aggiunti ai dati dopo
  quella data — epiloghi e note dei Bivi toccati dal 12/08 in poi — meritano
  una rilettura a sé, che qui non c'è.
- **Non letto:** i mockup (`webapp/public/mockups/`), che non arrivano al tavolo;
  i PDF di stampa.
- **Coerenza con la storia:** i testi nuovi dell'app sono quasi tutti
  meccanici — nomi, doni, luoghi, atti, orari tornano con canone e dati. L'unico
  scarto narrativo trovato è T-04. I giudizi d'autore sulla trama restano in
  `AUDIT-NARRATIVA-APERTA.md` (1 aperta, 1 decisa da eseguire).

## 6. Se si correggono

- **T-05 … T-13** sono correzioni di testo: nessuna cambia una regola.
- **T-01 … T-03** chiedono prima una decisione (§1): correggere la frase senza
  decidere significa scegliere a caso fra testo e motore.
- **T-04** è una parola.
- Perché non tornino: estendere `test-testi.mjs` ai sorgenti dell'app per le
  tre famiglie meccaniche (accenti con apostrofo, apostrofi dritti, «PNG»).
  T-06 e T-07 sono tornate proprio perché la barriera c'era ma nessuno l'ha
  guardata rossa.
