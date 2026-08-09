# Registro delle anomalie narrative aperte

Questo file è il **contenitore delle cose che il loop di revisione non può
chiudere da solo**. `scripts/audit.py` decide meccanicamente ciò che o passa o
non passa (regole, artefatti, ponti, lessico) e il loop si ferma quando quel
conto arriva a zero. Tutto ciò che invece richiede un giudizio d'autore — la
tenuta di un twist, il peso di una scena, se un depistaggio funzioni — finisce
qui, **senza bloccare il loop**, e si lavora dopo.

Regole del registro:

- una voce = un'anomalia, con un **id stabile** (`N-nn`) che non si riusa;
- `stato`: `aperta` · `decisa` (c'è una scelta, va eseguita) · `chiusa` · `scartata`;
- chi la chiude scrive **come** e in quale file, così la voce resta leggibile
  fra sei mesi;
- il loop **aggiunge** voci, non le toglie: la rimozione è un atto umano.

Ultimo aggiornamento: 08/08/2026 · fonti: `AUDIT-20260807.md`, `AUDIT-20260808.md`
e la tornata di correzioni dell'08/08.

---

## Aperte — decisione d'autore

### N-01 · L'architettura del reveal: quanto presto si può capire chi è C.B.
**stato: chiusa** — l’Atto III è un how-to-prove: l’Ep. 18 chiede di PROVARE il nome, non di indovinarlo (lettera, 4 Domande, note d’arbitro) · riferimenti: `08`B1, `07`N1/N2

La correzione dell'08/08 ha tolto le tre affermazioni più esplicite (Ep. 9
Referto, Ep. 12 copertura, Ep. 13 epilogo). Resta la domanda di fondo, che è
d'autore e non di refuso: **l'Atto III è un whodunit o un how-to-prove?** Se è
il secondo — e la lettera dell'Ep. 18 lo suggerisce già («la risposta è più
semplice, e più terribile, di quanto crediate») — allora l'Ep. 18 non deve
chiedere «pronunciate un nome che non conoscete» ma «provate il nome che tutti
pensate». Oggi il fascicolo dell'Ep. 18 è scritto nel primo modo.

Da decidere prima di rimettere mano a Ep. 14-15-18.

### N-02 · Il depistaggio Braga regge ancora?
**stato: aperta** · riferimenti: `07`N1

Gli Ep. 14 e 15 chiedono al tavolo due serate di sospensione dell'incredulità su
un C.B. esterno. Con le correzioni all'Ep. 12/13 il terreno è stato ripulito,
ma la verifica vera è a tavolo: **serve un playtest cieco** di Ep. 13→15 con
giocatori che non conoscono il finale. Finché non c'è, è un'ipotesi.

### N-03 · La Contro-busta dell'Ep. 15 dice una cosa nuova?
**stato: chiusa** — la Contro-busta si sposta sul diritto d’accesso al manuale (la copia n. 7 si chiede per statuto), che l’Ep. 12 non dice · riferimenti: `08`B1

D5 rivela «una MANO INTERNA alla Società». Dopo l'Ep. 12 (che stabilisce ordini
autentici dall'interno) il salto è piccolo. Proposta da valutare: spostare la
Contro-busta sul **metodo** — «ha usato la copia n. 7 del nostro manuale: il
falsario ha *diritto* a quella copia» — che è un'informazione che l'Ep. 12 non
dà. Non è un refuso: è una scelta su dove mettere il colpo di teatro.

### N-04 · Le Migliorie si esauriscono a metà campagna
**stato: chiusa** — Migliorie da 5 voci ripetibili a 12 a caselle con molteplicità dichiarata — 18 scelte per 20 serate. **Cambia il bilanciamento: le misure vanno rifatte** · riferimenti: `08`C4

L'elenco ha cinque voci (`gen_docs.py`) per venti serate, e tre sono oggetti
one-shot; Tempra è cappata a 4. Dalla sesta serata l'unica scelta viva è Fibra,
all'infinito: un eroe arriva all'Ep. 20 con +13 Salute. Nessun simulatore
modella le migliorie, quindi **tutte le percentuali di vittoria misurate valgono
per eroi al primo episodio** e la curva reale di un gruppo di campagna è più
morbida di quella misurata.

Serve una decisione: allungare l'elenco (una miglioria per atto?), oppure
cappare la Crescita, oppure accettarlo e ritarare le misure. Tocca il
bilanciamento, quindi non è lavoro da loop.

### N-05 · Ep. 18 e Ep. 20 concentrano gli Approfondimenti su uno o due specialisti
**stato: chiusa** — tipi ribilanciati: Ep. 18 a 3/2/2/2, Ep. 20 a 2/3/2/2 · riferimenti: `08`C6

`ep18`: Referto ×4, Presagio ×3, Testimonianza ×1, Osservazione ×1.
`ep20`: Presagio ×4, Osservazione ×3, Testimonianza ×1, Referto ×1.
Negli altri episodi la distribuzione è piatta (2-3 per tipo). Un tavolo senza
Attilio/Brera perde quasi tutta la profondità dell'episodio della deduzione
finale. L'«Aiuto profano» evita il blocco duro, quindi non è una violazione —
è una fragilità, e ribilanciarla significa riscrivere testo, non struttura.

### N-06 · Le due metà dei Frammenti: il titolo della carta e il conteggio
**stato: chiusa** — il titolo resta, il corpo lo smentisce in apertura («si dividono in due — ma non a metà»): rinominare costava quattro file per nulla · riferimenti: `08`A1

La divisione è nove/undici, non a metà; il testo è stato corretto ovunque, ma
il **titolo** della carta resta «Le due metà dei Frammenti» (vive in
`cards-data.js`, `webapp/data/carte.json` e `webapp/data/ep20.json`, ed è anche
un nome di file). Il corpo ora apre con «si dividono in due — ma non a metà»,
così il titolo non viene smentito senza preavviso. Rinominarlo va fatto sui
quattro file insieme: **decidere se vale il costo.**

### N-07 · Il Frammento 20 e la promessa del «canto»
**stato: chiusa** — i nove sono ora versetti a tre battute con giuntura fissa (due punti con parola ripetuta, terza battuta aperta da «E»): parallelismus membrorum, nessuna rima. Il n. 20 tiene la cadenza e la abbandona — «Poi la citta dorme.» Gli undici restano prosa, ed e il contrasto che fa funzionare la rivelazione

I venti Frammenti sono deduzioni in prosa. Il finale li reinterpreta come
*righe di un canto* da intonare. Nessuno dei venti testi è scritto come un
verso: al tavolo, «cantate i nove» significa rileggere nove frasi in prosa. È
coerente meccanicamente (il ritmo conta i Frammenti conservati) ma la promessa
poetica non atterra. Valutare se riscrivere i nove del canto del sonno con una
cadenza riconoscibile — è l'intervento più caro del registro, e il più bello.

### N-08 · Ep. 20: perché la Vetri sia «l'ultima voce» va seminato prima
**stato: chiusa** — la Vetri torna in scena nell’Ep. 11, nell’elenco di ciò che i topografi non hanno ancora misurato · riferimenti: `07`I3/A, `08`A2

L'Ep. 20 ora la nomina, e l'Ep. 6 la dichiara già «la solista mai catturata».
Manca l'anello centrale: **fra l'Ep. 6 e l'Ep. 19 la Vetri non compare mai.**
Quattordici serate di silenzio per il personaggio su cui si chiude la campagna.
Serve almeno una comparsa — l'Ep. 11 (il censimento delle campane) e l'Ep. 16
(il respiro) sono i due innesti naturali.

### N-09 · La deriva fra carte fisiche e fascicoli: 76 voci residue
**stato: aperta** · riferimenti: `08`D1

`scripts/sync-cards-data.py` conta le divergenze fra `cards-data.js` e i
fascicoli. Delle 92 iniziali ne sono state riallineate 16 (quelle che
portavano le correzioni dell'08/08), **riscritte a misura di carta** e non
copiate: le carte sono volutamente più corte. Restano ~76, che vanno guardate
a render una per una. La decisione di fondo è editoriale: accorciare i
fascicoli, allungare le carte, o accettare due registri e dichiararlo.

Sotto, la causa: `cards-data.js` è una copia a mano. Finché resta tale, la
deriva torna. Strade: un campo `testo_carta` accanto a `testo` nei generatori
(una fonte, due lunghezze), oppure far leggere ai generatori il file JS.

### N-19 · Il notaio del benefattore ha due cognomi: Grillanda nell'Ep. 4, Rasca nell'Ep. 13
**stato: chiusa** — Grillanda → Rasca nell’Ep. 4 (4 occorrenze) e sul Reperto in `generate-reperti.js` · riferimenti: gen_ep4.py:211,255,633,981 / gen_ep13.py:7,112

L'Ep. 4 nomina tre volte «il notaio Grillanda», l'uomo che firma per «un benefattore che ama la lirica» sia il restauro di vent'anni fa sia la commissione ad Alboni. L'Ep. 13 mette in scena «il Notaio Ludovico Rasca» e la sua stessa docstring lo dichiara «l'uomo del benefattore dell'Ep. 4», con la Testimonianza che ripete alla lettera la formula «il benefattore che ama la lirica dell'inverno scorso». E' la stessa persona con due cognomi: l'audit non lo vede perche' c_omonimi confronta solo i nomi di battesimo del CAST. Scelta ovvia, resta solo il lavoro: tenere Rasca (compare in scena, ha una bio da Bestiario e un intero episodio addosso) e rinominare Grillanda nell'Ep. 4 - quattro occorrenze in gen_ep4.py, piu' l'eventuale carta in cards-data.js.

### N-20 · Il benefattore del palco 13 arriva alla gala «per la prima volta in vent'anni» e l'Ep. 4 non lo mette mai in scena
**stato: chiusa** — il palco 13 pesa nell’epilogo dell’Ep. 4: candele consumate, velluto tiepido, un guanto chiaro, e la maschera che nega · riferimenti: gen_ep4.py:251-261, epilogo gen_ep4.py:~726

Il Luogo 8 dice tre cose in fila: il palco 13 e' pagato da vent'anni e mai occupato, il benefattore «non e' un ammiratore, e' un PROPRIETARIO», e «stavolta ha chiesto le candele: per la prima volta in vent'anni, stasera, il benefattore viene a sentire». Poi la Spedizione si gioca sotto il palco mentre lui e' seduto sopra, nessuna delle 4 Domande lo riguarda, nessuna tessera lo nomina e l'epilogo chiude su Alboni in questura senza dire se il 13 fosse occupato. E' l'unico momento dell'Atto I in cui il committente e' a portata di mano, e il fascicolo non offre al tavolo nemmeno un modo per guardare in quella direzione. Non e' decidibile da uno script perche' la domanda e' se l'episodio VOGLIA la frustrazione (mostrare la preda e negarla) o se sia un filo dimenticato. Se e' voluta, basta una riga d'epilogo che la nomini («il 13 era vuoto, e le candele erano state accese»); se non lo e', costa una Domanda o un Approfondimento in piu'.

### N-21 · L'Ep. 6 ricorda un finale dell'Ep. 1 che non e' mai stato giocato: Ferri annegato, e la Fonderia «cinque casi fa»
**stato: chiusa** — l’Ep. 6 non ricorda più un annegamento mai giocato; «cinque casi fa» → quattro; e la bottega sigillata «da due anni» → cinque mesi · riferimenti: gen_ep6.py:155, gen_ep6.py:176; epilogo Ep.1 in gen_docs.py:774-779

La Testimonianza «M., a porte chiuse» (Ep. 6, L4) dice: «Ferri e' vivo. L'ho sempre saputo - un uomo cosi' non annega in un canale». Ma l'epilogo dell'Ep. 1 non annega nessuno: dice solo «del liutaio, al magazzino, nessuna traccia». Il tavolo non ha mai creduto Ferri morto, quindi la battuta che dovrebbe far ripartire il finale d'atto smentisce una convinzione che il gruppo non ha. Sulla stessa pagina, il Luogo 5 dice «il bronzo scampato alla Fonderia, cinque casi fa»: la Fonderia e' l'Ep. 2, cioe' quattro casi prima, e la lettera dello stesso episodio conta «cinque casi alle spalle». Nessuno dei due e' un refuso che uno script possa vedere (c_cronologia guarda solo i «N mesi» di caccia): sono ricordi di un Atto I diverso. Costo minimo: o l'Ep. 1 lascia intendere l'annegamento nel canale, o l'Ep. 6 riscrive la battuta di M. su cio' che l'Ep. 1 ha davvero mostrato (la bottega vuota, lo spartito lasciato); e «cinque» diventa «quattro».

### N-22 · «Chiedetevi per CHI era la dodicesima canna»: l'Ep. 3 pone la domanda e nessuno dei diciassette episodi dopo la raccoglie
**stato: chiusa** — la dodicesima canna ha un destinatario reperibile nell’Ep. 3: è vuota, e porta graffiato il nome di Piero · riferimenti: gen_ep3.py:203-205 (Luogo 6), epilogo gen_ep3.py:678-679

L'Ep. 3 costruisce l'enigma con cura su due indizi core: Bo ha consegnato «dodici canne di piombo» e i pozzi murati del Borgo sono undici - «una canna e' per qualcosa che pozzo non e'». L'epilogo lo consegna al tavolo come compito esplicito, per bocca di Tobia: «Il barbiere non contava per loro. Contava la dodicesima canna. Chiedetevi per CHI era.» La parola «dodicesima» non ricompare in nessun altro generatore della campagna, e nessuna Domanda, Frammento o Soluzione successiva torna sulla canna in piu'. E' una promessa esplicita, non un'atmosfera: un episodio dice al gruppo di tenere aperta una domanda che il gioco non richiudera'. Non e' decidibile da uno script perche' la risposta potrebbe esistere implicita (la Vetri dell'Ep. 4? Ferri? il quarto rigo?) e va scelta. Due strade: eleggere il destinatario e nominarlo dove serve (l'Ep. 4 e' l'innesto naturale, la solista che il Coro insegue), oppure togliere l'imperativo dall'epilogo e lasciare la dodicesima canna come colore.

### N-23 · La RILETTURA dell'Ep. 16 promette un «dettaglio di troppo» in ogni lettera di M., ma quelle del Preludio e dell'Ep. 1 non ne hanno
**stato: chiusa** — innestato un dettaglio di troppo nelle lettere del Preludio (l’orologio d’argento) e dell’Ep. 1 (la lanterna al gancio) · riferimenti: gen_ep16.py:203-220,646; LETTERA_P in gen_preludio.py:84, lettera Ep.1 in story.py:4

L'Ep. 16 fa debuttare la meccanica di campagna piu' importante: rileggere le vecchie lettere d'incarico, «una per ogni episodio conservato», perche' «rilette in fila hanno tutte, ognuna, un dettaglio di troppo: una cosa saputa un giorno prima del dovuto, un nome anticipato, una data» - e ogni rilettura banca un incrocio che nell'Ep. 18 vale come mezza risposta su chi sia C.B. L'Atto I regge la promessa solo a meta': l'Ep. 3 ha il tell perfetto (M. scrive «manca da martedi'» mentre in casa nessuno ha mai parlato di martedi'), l'Ep. 4 ha «non disturbate il benefattore, e' un amico della Societa'», l'Ep. 5 nomina i timbri della Curia prima che il gruppo scopra che tutto lo schema poggia su un timbro prestato. Ma la lettera del Preludio e quella dell'Ep. 1 non contengono nulla del tipo descritto, e l'Ep. 2 si ferma a un suggerimento tattico («se salite abbastanza in alto»). Al tavolo, il momento in cui il gruppo va a riprendere la prima lettera - quella con cui e' entrato nella Societa' - e' il piu' carico della campagna, e trova una pagina pulita. Nessuno script puo' misurare «un dettaglio che M. non poteva sapere»: e' lettura. La proposta e' la piu' economica del registro: una subordinata per lettera, decisa episodio per episodio, senza toccare indizi ne' Domande.

### N-24 · Il gancio vuoto del Palazzo del Lume: il Preludio toglie un ritratto dalla sala del consiglio e nessuno lo rimette
**stato: chiusa** — la cornice vuota è pagata nell’Ep. 18: in fuga il gruppo ci passa davanti e capisce dov’è finito l’undicesimo ritratto · riferimenti: gen_preludio.py:108-111, 189-197; corridoio dei ritratti in gen_ep18.py:315,888

Il primo luogo che il gruppo visita in tutta la campagna e' la sala del consiglio della Societa': «undici poltrone attorno a un tavolo, dieci ritratti alle pareti e un gancio vuoto dove l'undicesimo e' stato tolto» - e la descrizione per il narratore insiste, «polvere piu' chiara tutt'intorno, come un'ombra che si rifiuta di sbiadire, e nessuno, negli ultimi anni, ha mai spiegato perche'». La parola «undicesim» non ricompare in nessun altro file della campagna. L'Ep. 18, che gioca la fuga proprio dentro casa vostra, fa attraversare al gruppo «il corridoio dei ritratti dei presidenti passati» con le luci che si spengono una a una: il posto perfetto per il ritratto tolto, e li' i ritratti ci sono tutti. Con un Atto III che si chiude su una mano interna alla Societa', un ritratto rimosso dalla sala del consiglio e' l'arma carica lasciata sul tavolo alla prima serata. Stesso capitolo, minore: Ansaldo, custode del palazzo da vent'anni e primo salvataggio della campagna, non e' piu' nominato dopo il Preludio (grep: solo `gen_preludio.py` e le carte). Non decidibile da uno script: va scelto se il gancio vuoto sia un mistero da pagare (chi era l'undicesimo? l'Ep. 18 e' l'innesto) o solo atmosfera - e in quel caso conviene smorzare la descrizione del narratore, che oggi lo presenta come una promessa.


### N-25 · Nell'Atto III la prima Domanda smette di essere una domanda: la lettera d'incarico nomina il luogo che il fascicolo chiede di dedurre
**stato: chiusa** — lettere bonificate — Ep. 13 dal 100% allo 0%, Ep. 5 dal 60% al 20%, Ep. 16 a 0%, Ep. 15 ridotta; e la D4 dell’Ep. 13 non nomina più il Molino · riferimenti: gen_ep13.py:63-65 / gen_ep14.py:69-72 / gen_ep15.py:59 / gen_ep16.py:58

Per undici serate la convenzione tiene: la lettera di M. dice il caso e il nome dello scomparso, mai il posto (Ep.2 «Trovate Ilario» → Fonderia Vecchia; Ep.5 «scoprite chi suona» → cripta murata; Ep.10, Ep.11, Ep.12 idem). Dall'Ep.13 salta, e salta in tutte e quattro le serate: la lettera dell'Ep.13 dice «il Molino delle Carte, due ore di carrozza fuori città» e la D1 risponde «Al Molino delle Carte, due ore fuori città» — le stesse parole; l'Ep.15 nomina la Gendarmeria e la villa di Braga, che sono le due metà della D1; l'Ep.16 dice «la villa sul lago è poco fuori porta» e la D1 risponde «sul lago, poco fuori città». (L'Ep.17 continua, fuori dalla mia fetta.) Nessuno script lo vede perché c_domande conta le Domande e non le confronta con la lettera. Il costo non è solo di mistero: la D1 esatta vale «nessuna carta Minaccia al 1° round» in tutti e quattro gli episodi, quindi è un bonus regalato che sposta anche le misure di bilanciamento. Proposta: togliere il toponimo dalla lettera e lasciarci il problema («la carta viene da un solo opificio in provincia, e non so quale»), oppure — se la lettera DEVE nominarlo, come nell'Ep.15 dove il plico è arrivato in Gendarmeria — spostare la D1 su ciò che il briefing non può sapere. Costa una riga per lettera nel primo caso, una Domanda riscritta nel secondo.


**Misurato (08/08).** Quota di parole-chiave della risposta a D1 gia' presenti nel corpo della lettera d'incarico: **Ep.13 100%** (la regala per intero), **Ep.5 60%**, Ep.15 57%, Ep.16 33%, Ep.14 20%; tutti gli altri 0%. Quindi non e' un tratto dell'Atto III: e' l'Ep.13 in modo flagrante, con l'Ep.5 — che sta nell'Atto I — subito dietro. Lo script di misura sta in `scratchpad/prova-d1.py`, e vale la pena rifarlo dopo ogni riscrittura di lettera.

### N-26 · Ep.14 — il mandante dell'impianto spiega l'impianto nella propria lettera d'incarico, e con questo si toglie il depistaggio da sotto i piedi
**stato: chiusa** — la lettera dell’Ep. 14 non spiega più l’impianto: manda a verbalizzare, e alla rilettura è M. che fa certificare la propria scena · riferimenti: gen_ep14.py:69-72

La docstring di soluzione è netta: «È M. che prepara il falso smascheramento dell'Ep.15, arredando la colpa del rivale. Nessuno può ancora capirlo». Ma la lettera che M. firma quella stessa sera dice: «Un ladro porta via; chi vuole ingannarvi lascia. Guardate cosa è tornato in più nelle sue casse — un sigillo, delle ricevute, dei mezzi appunti che lui giura di non aver mai posseduto — e chiedetevi a chi conviene che Braga possieda proprio quello». È la tesi dell'episodio, la risposta letterale della D3 (stessi tre oggetti, stesso ordine) e la riga d'oro della Spedizione («per fargli dire cosa gli hanno ordinato di lasciare») consegnate nel briefing. In più M. cita il diniego di Braga prima che il gruppo vada da Braga, e sa che la refurtiva rientrerà «mentre indagate». Non è il «dettaglio di troppo» che l'Ep.16 promette per la RILETTURA: è l'intera deduzione. Il problema vero non è la D3 regalata, è che il regista del falso indica il falso: dopo questa lettera il tavolo non deve credere a Braga per due serate, e l'Ep.15 non ha più niente da rovesciare. Non è decidibile da uno script perché la domanda è di voce: quanto può permettersi di essere spavaldo M. senza sabotare il proprio piano. Proposta a costo basso: la lettera ordina di contare («contate ciò che c'è, non ciò che manca») e si ferma lì, senza elencare i tre intrusi né trarre la conclusione.

### N-27 · La Contro-busta dell'Ep.15 arriva dopo che tre carte lette ad alta voce della stessa serata hanno già detto «è uno di noi»
**stato: chiusa** — tolte da L5 e L9 dell’Ep. 15 le tre frasi che dicevano «è uno di noi» prima della Contro-busta · riferimenti: gen_ep15.py:200, gen_ep15.py:282, gen_ep15.py:298 / gen_ep14.py:241-247

N-03 chiede se la Contro-busta dica qualcosa che l'Ep.12 non abbia già detto; questa è un'altra misura — la stessa sera. La Contro-busta si apre dopo la Spedizione e risponde «una MANO INTERNA alla Società, non un nome». Ma durante l'Indagine il Presagio del Luogo 5 dice già «Non un ladro: un confratello. Chi ha scritto il dossier non ha rubato il metodo, lo aveva: è dentro la Società, ha diritto a quella copia» e chiude con «il ritratto vi somiglia»; l'indizio 1 del Luogo 9 presenta gli Apparecchiatori come «la squadra di scena di C.B.» che lavora in casa di Braga — cioè dichiara che C.B. non è Braga; e il Presagio dello stesso Luogo 9 chiude con «Non è la mano di Braga. È una delle nostre.» Tutte e tre sono `indizi`/`approfondimenti`, quindi testo verbatim ai giocatori. La Contro-busta, che dovrebbe essere il prezzo di aver rifiutato la soluzione servita, non paga niente che il gruppo non abbia già in mano. Sull'altro lato della cucitura, il Referto del Luogo 7 dell'Ep.14 pre-annuncia il dossier dell'Ep.15 con tre giorni d'anticipo («quando, tra qualche giorno, arriverà un dossier che accusa Braga, questo faldone sarà la sua prima conferma»). Non decidibile da uno script: va scelto dove sta il colpo di teatro. Se resta nella Contro-busta, l'Indagine dell'Ep.15 deve fermarsi al «è un falso» senza mai dire da che parte viene la mano — e allora L5 e L9 vanno smorzati di due frasi ciascuno; se il colpo sta nell'Indagine, la Contro-busta ha bisogno di un contenuto suo (la copia n.7 con la firma abrasa è oggi già spesa nel Luogo 5).

### N-28 · Ep.16 — il nastro verde, su cui poggia tutta la crepa, lo ha visto un estraneo alla Stazione tre giorni prima
**stato: chiusa** — il capostazione non vede più il nastro: ricorda la risata e i guanti lunghi della festa. Allineate anche le due carte fisiche · riferimenti: gen_ep16.py:86-87 contro gen_ep16.py:151 e gen_ep16.py:161

La D4, il Frammento 16, l'epilogo e l'abilitazione della RILETTURA poggiano tutti su una sola premessa: il nastro verde è «un segreto tra me e lei, mai detto ad anima viva», quindi M. non poteva saperlo. Ma due Luoghi più in là, al Luogo 4, il capostazione dice: «Aveva un nastro verde al polso, me lo ricordo perché mano nella mano con lui giocherellava con quel nastro», e la sua Testimonianza lo ripete. Il nastro è un oggetto portato in pubblico, notato e ricordato da uno sconosciuto: non è mai stato un segreto, è solo una cosa che il padre non ha raccontato. Un tavolo attento chiude la crepa in un secondo — «l'ha chiesto alla Stazione, come noi» — e con essa il gancio più pesante verso l'Ep.18. Le due carte sono entrambe lette ad alta voce nello stesso episodio, quindi nessuno script le può mettere a confronto. La scelta è ovvia e resta solo il lavoro: il capostazione ricorda qualcos'altro (la risata, il cappellino, il modo di salire), oppure il nastro sta sotto il polsino e il padre lo dice esplicitamente («lo portava sotto la manica, glielo avevo detto io»). Due righe, in un file solo.

### N-29 · Il decano regge quattro episodi e nasce in una riga di AGGANCIO la sera prima di essere rapito
**stato: chiusa** — il decano Ferrante entra in scena nell’Ep. 13 (Prefettura) e nell’Ep. 16 (Archivio delle Lettere), col gesto che l’Ep. 17 riscuote · riferimenti: gen_ep16.py:698-700 / gen_ep17.py:60 (grep «decano»: solo gen_ep16 e gen_ep17-20)

L'Ep.17 è costruito su di lui: lo SCISMA dà −1 ai NERVI a tutti gli eroi finché non lo trovano vivo, la soglia-decano è l'orologio della Spedizione, la sua matrice è la chiave della deduzione dell'Ep.18 e la sua firma apre le lettere dell'Ep.19 e dell'Ep.20. Prima di tutto questo il decano compare due volte in tutta la campagna, tutte e due nell'Ep.16: una subordinata nel Presagio del Luogo 9 («quando il decano non ci sarà più») e l'AGGANCIO finale, in cui un uomo mai nominato prima ferma il gruppo sotto un lampione e dice «Anch'io ho un nastro verde. Il mio è del 1885». Sedici serate dentro la Società del Lume e il suo decano non esiste; il nome, Ferrante, arriva solo nella lettera dell'Ep.17. Il malus morale dell'Ep.17 chiede al tavolo un lutto per uno sconosciuto. Non è la stessa cosa di N-08 (la Vetri, Ep.6→Ep.19) né di Ansaldo in N-24: qui il personaggio non svanisce, non è mai arrivato. L'innesto più economico è l'Ep.12, che gioca dentro il Palazzo del Lume e ha già bisogno di qualcuno che dica «i sigilli erano intatti»; in alternativa l'Ep.6, dove M. apre l'archivio dei Frammenti. Costa un Approfondimento, o due battute in un Luogo che esiste già.

### N-30 · Ep.16 — «il respiro» non viene mai lasciato respirare: quattro carte su nove interrompono il caso piccolo per indicare M.
**stato: chiusa** — tolti tre dei quattro ammicchi a M.: resta un presentimento sordo, e il caso piccolo respira · riferimenti: gen_ep16.py:135, gen_ep16.py:142, gen_ep16.py:190, gen_ep16.py:241

L'episodio si dichiara «il respiro, zero culto», e il caso c'è davvero: il lampionaio che accende i lumi per una figlia che non torna, la donna con le scatole da scarpe, Nina che si sfila la mano di dosso da sola. Ma i testi di payoff dei Luoghi 3, 5 e 7 — quelli letti ad alta voce quando il gruppo ha finito di lavorare un posto — smontano ogni volta il caso appena costruito per parlare d'altro: «a meno che qualcuno, in alto, non abbia un motivo per tenervi occupati con le sciocchezze» (L3), «perché M. vi manda a caccia di un topo, quando cacciate lupi da sedici mesi?» (L3), «il vero lupo vi guarda da casa vostra, e sorride del vostro riposo» (L5), «un altro modo per non guardare la vera domanda, che non riguarda lo Sposo ma chi vi ha mandato a prenderlo» (L7). Il Presagio del Luogo 9 fa lo stesso. Cinque volte in una serata il fascicolo dice al tavolo che quello che sta giocando non conta: il contrasto che dovrebbe farlo male — il male piccolo dopo mesi di ombre — viene raccontato invece che lasciato accadere, e il riposo promesso dalla lettera non arriva mai. Non è misurabile: è una scelta su quante volte l'episodio può ammiccare. Il taglio più netto è togliere i due ammicchi del Luogo 3 e quello del Luogo 7 e lasciare la crepa dove è forte davvero — la casa del lampionaio, l'archivio delle lettere, l'epilogo. Costa tre frasi, nessuna meccanica.

### N-31 · Il Bivio dell'Ep. 8 promette quattro serate di ricaduta e ne trova una sola: l'incrocio annunciato per l'Ep. 12 non esiste
**stato: chiusa** — il Bivio dell’Ep. 8 è pagato negli Strascichi dell’Ep. 12, con le leve già in uso · riferimenti: gen_ep8.py:689-693

Il Bivio dell'oro dichiara ricadute su un arco lungo: «gli Episodi 9-12 tolgono 1 carta Malavita dai mazzi» sul ramo SEQUESTRARE, e «la rete dei traccianti varra' un incrocio nell'Episodio 12 / il pool nemici degli Episodi 9-12 guadagna +1 Sgherro» sul ramo LASCIAR CIRCOLARE. Solo l'Ep. 9 lo applica (gen_ep9.py:612-616, ±1 carta spawn); Ep. 10, 11 e 12 non nominano mai l'Ep. 8, e in particolare l'Ep. 12 apre con un paragrafo «Strascichi» che raccoglie ordinatamente i Bivi dell'Ep. 9 e dell'Ep. 10 (gen_ep12.py:606-614) e salta proprio quello che gli era stato promesso. Non e' decidibile da uno script perche' c_bivi verifica che ogni Bivio abbia un ramo applicato, non che la finestra dichiarata sia coperta per intero. Costo minimo: due righe nello «Strascichi» dell'Ep. 12 (l'incrocio dei traccianti sulla Domanda 1 o 3) e una riga nei fascicoli 10 e 11 per il ±1 al pool; in alternativa, restringere la promessa dell'Ep. 8 al solo Ep. 9 — ma allora il ramo «traccianti» resta senza premio e il Bivio diventa una scelta finta.

### N-32 · La Vedova Bruna esce di scena a testa alta e non torna mai — con lei sparisce l'unica ostilita' d'Atto III che la campagna si era impegnata a pagare
**stato: chiusa** — il Bivio dell'Ep. 8 e ora incassato in tre episodi dell'Atto III con le leve gia in uso: Ep. 13 (un uomo del molino in piu alla porta dell'atto), Ep. 14 (il Ricettatore non parla, e la tazzina sul banco lo fa sentire senza metterla in scena), Ep. 16 (un complice prestato gratis). Scartati Ep. 15 e 17, con motivo · riferimenti: gen_ep8.py:681-690

L'Ep. 8 costruisce la Vedova come un'antagonista non sconfitta: non e' una figura di comodo ma «un'impresa in espansione» (L8), l'epilogo la lascia libera alla veranda — «vi ha gia' misurati. Il caffe', la prossima volta, non ve lo offrira'» — e il Bivio incassa il conto: «la Vedova vi segna: dall'Atto III la Malavita vi sara' SEMPRE ostile». La parola «Malavita» non ricompare in nessun generatore dopo gen_ep9.py:952, e «Bruna» esiste solo in gen_ep8.py e nella voce di mappa di gen_mappa.py: quattordici serate di silenzio per l'unica avversaria di tutto l'Atto II che resta libera, armata e organizzata (Voltan patteggia, il Cambiavalute e' abbattuto, Grassi e Bo sono strumenti, Speranza e Godi vengono presi). Nessuno script lo vede: c_omonimi confronta nomi, non presenze. Due strade, e vanno scelte: darle una comparsa d'Atto III — l'Ep. 14 e l'Ep. 15 comprano informazioni in oro d'antica fusione, e' l'innesto naturale — oppure togliere dal Bivio la clausola sull'Atto III e chiudere l'Ep. 8 con lei che lascia la citta', cosi' che il silenzio sia un fatto e non un'omissione.

### N-33 · Il Bivio dell'Ep. 9 fa di Riva «la fonte segreta dell'Episodio 17», e nell'Ep. 17 Riva non c'e'
**stato: chiusa** — Riva torna nell’Ep. 17 come Testimonianza condizionata al ramo che lo promette (nasconderlo, non farlo deporre) · riferimenti: gen_ep9.py:705-709

Il ramo «Nasconderlo e perdere la causa» compra un prezzo pesante e verificabile (un Testimone in meno negli Ep. 10-12, e i tre fascicoli lo applicano davvero) contro un premio esplicito: «Riva, vivo e libero e in debito con voi, diventa la fonte segreta dell'Episodio 17». In gen_ep17.py la stringa «Riva» compare zero volte, e nessun luogo o Approfondimento dell'Ep. 17 ha una fonte riconducibile al sacrestano. Il ramo opposto, invece, e' onorato ovunque (Ep. 10 registra il PNG-alleato perso; l'incrocio dell'Ep. 18 e' contabilizzato). Non e' meccanico: uno script non sa che «la fonte segreta» debba essere un personaggio nominato. L'Ep. 17 e' l'episodio della «caccia alla talpa» in cui il gruppo e' indagato dalla propria Societa': un uomo che deve la vita al gruppo e non e' della Societa' e' esattamente la fonte che quell'episodio non ha. Costa un Approfondimento (o l'intestazione di uno esistente) e vale il ritorno del personaggio piu' fragile della campagna.

### N-34 · In tre punti l'Ep. 9 intitola «di C.B.» un biglietto che nel testo e' firmato «M.» — l'etichetta pronuncia l'equazione che il corpo del testo si sforza di non dire
**stato: chiusa** — la carta è «Il biglietto nel cestino»; allineati anche i tre posti cablati del Reperto, verificato che l’Esame di Carbone accoppi ancora · riferimenti: gen_ep9.py:279, gen_ep9.py:861, gen_ep9.py:955

Alla Locanda del Forestiero il gruppo trova «un biglietto appallottolato: carta di pregio, poche righe, firma "M."» (L8, indizio 2), e l'Approfondimento e l'Esame di Carbone lavorano con cura per NON chiudere il cerchio: «un'iniziale non e' un nome, e in citta' di gente che si firma con una lettera sola ce n'e' piu' d'una». Ma il nome della carta, in tutti e tre i posti in cui e' stampato — l'Approfondimento «carta "Il biglietto di C.B."», il Reperto C «il Biglietto di C.B.» tra le carte da prendere, e la voce dell'Esame — attribuisce quel biglietto a C.B. Il tavolo si porta a casa un Reperto (webapp/data/ep9.json:242 lo espone identico) il cui titolo dice, in due parole, che chi si firma «M.» e' C.B.: la deduzione che l'Ep. 18 vende come rivelazione. Non e' il problema di N-01 (che riguarda l'architettura del reveal e cita il *corpo* del Referto, gia' corretto l'08/08): qui e' un'etichetta, e la si cambia senza toccare una riga di finzione. Proposta: intitolare la carta per l'oggetto e non per il mittente — «il biglietto sul cuscino della Locanda», «il biglietto del forestiero» — su gen_ep9.py, cards-data.js e webapp/data/ep9.json.

### N-35 · L'usciere del Tribunale e' insieme il testimone che rifiuta l'oro, il rivelatorio che il gruppo deve credere, e l'unico bugiardo dell'episodio
**stato: chiusa** — la bugia passa al brigadiere, che gli orari li scrive di suo pugno: l’usciere resta pulito · riferimenti: gen_ep9.py:170-175, gen_ep9.py:655-661

La Testimonianza «L'usciere del Tribunale» (L4) e' una delle tre carte designate come rivelatorio della Domanda 2, e in essa l'usciere racconta di aver nascosto Riva, di aver rifiutato «uno stipendio annuo in oro vecchio» per dire dov'e', e di aver giurato sul Vangelo. Venti righe piu' sotto, la deduzione bonus «CHI MENTE?» stabilisce che il bugiardo e' lui: «e' l'unico che sa dov'e' Riva, ed e' stato girato». Le due cose non stanno insieme in nessuna lettura: un usciere comprato non consegna al gruppo il nascondiglio del teste al primo indizio (L4, indizio 1), non e' credibile come conferma di chi paga l'avvocato, e non avrebbe bisogno della «via sicura» falsa dato che ha lui la chiave della sacrestia. Nessuno script puo' pesarlo: c_domande controlla che ogni Domanda sia raggiungibile, non che una fonte sia coerente con se stessa. Due uscite pulite: spostare la bugia su un quarto personaggio (il brigadiere della Gendarmeria, che gia' dice «qualcuno, sopra di me, ha dato ordini», e' il candidato naturale — l'usciere resta la fonte pulita), oppure tenere l'usciere bugiardo e togliergli il rivelatorio, riscrivendo la sua Testimonianza come la mezza verita' di un uomo che si sta gia' vendendo.

### N-36 · La lettera dell'Ep. 11 dichiara impossibile la Spedizione che l'Ep. 11 fa giocare: «col buio non si sale», e la Spedizione e' una scalata notturna
**stato: chiusa** — la lettera dell’Ep. 11 non vieta più la salita: «lassù, al buio, lui è a casa sua e voi no» · riferimenti: gen_ep11.py:72-73

M. chiude l'incarico con «Avete 6 ore, dalle 18:00 alle 24:00; poi cala il buio sui tetti, e col buio non si sale». Alle 24:00 comincia la Spedizione, che e' esattamente questo: «la via delle guglie, col vento che chiama giu'» (gen_ep11.py:528), l'abbaino, i camminamenti senza ringhiera, le prove NERVI del vento e l'inseguimento di un uomo che «quei tetti li conosce a memoria». Gli altri cinque episodi dell'atto usano la stessa clausola per creare urgenza SENZA negare la serata («poi comincia la notte, e la scorta», «poi il corriere sara' allo scambio»): l'Ep. 11 e' l'unico che si contraddice. La scelta e' ovvia e resta solo il lavoro: sostituire la clausola con una che spinga invece di vietare — p. es. «poi cala il buio sui tetti, e lassu' lui e' a casa sua» — una riga in LETTERA_11, piu' l'eventuale carta gemella.

### N-37 · L'Ep. 11 dice che la mappatura acustica punta al «Terzo Movimento» — il rituale che il gruppo ha gia' sventato nell'Ep. 6
**stato: chiusa** — non più «Terzo Movimento» ma «un Movimento che deve ancora suonare» — senza nominare il Quarto, che il gruppo non conosce · riferimenti: gen_ep11.py:673-674

La verita' dell'Ep. 11 recita: «Le misure convergono in un punto sotto la Cattedrale che le mappe non riconoscono: e' il puntamento per il Terzo Movimento». Ma «Il Terzo Movimento» e' il titolo dell'Ep. 6 ed e' un fatto compiuto: l'Atto II si apre dichiarandolo sventato, e l'Ep. 20 lo cita come passato («ci risiamo, come nel Terzo Movimento»). Il rito verso cui la mappatura punta davvero e' il Quarto Movimento del finale — lo conferma il Bivio dello stesso Ep. 11 («la mappatura si completa: all'Episodio 20 il rituale parte con 1 segnalino Canto in piu'») e l'Ep. 20 che incassa la mappatura della gola. Il refuso non e' visibile a c_cronologia (che guarda solo le durate dichiarate) e sfugge anche alla ricerca a occhio perche' la frase e' spezzata su due righe di literal. Va scelto che cosa deve leggere chi arbitra: «il puntamento per il prossimo Movimento» tiene il mistero, «per il Quarto Movimento» lo nomina con quattro serate d'anticipo — la prima e' quasi certamente quella giusta, ma e' una decisione, non una correzione.

### N-38 · La Spedizione dell'Ep. 7 si gioca «al cambio delle nove», tre ore dentro la finestra d'Indagine che va fino a mezzanotte
**stato: chiusa** — la Spedizione dell’Ep. 7 si gioca al cambio della sera dopo, e il fascicolo lo dice · riferimenti: gen_ep7.py:527, gen_ep7.py:670-673

L'Indagine dell'Ep. 7 dura «6 ore, dalle 18:00 alle 24:00» e la risposta alla Domanda 3 e' «alle NOVE, al cambio del guardiano»: la copertina della Spedizione la stampa come sottotitolo, «il palazzone di sant'Orsola, al cambio delle nove», e tre luoghi (L4, L6, L8) confermano che il turno stacca alle nove di sera, ogni sera. Un gruppo che spende tutte e sei le ore arriva al cancello tre ore dopo la finestra che l'episodio gli ha appena insegnato a colpire. Gli altri cinque episodi dell'atto collocano la Spedizione DOPO la mezzanotte («tra l'una e le tre», «prima dell'alba», «stanotte») e non hanno il problema. Nessuno script lo vede: c_finestre controlla le chiusure dei luoghi, non il rapporto fra l'orologio d'Indagine e l'ora della Spedizione. Il costo dipende da cosa si vuole: spostare il cambio del capoturno a mezzanotte tocca quattro indizi e la Domanda 3; oppure lasciarlo alle nove e dichiararlo nel fascicolo come tensione voluta (chi si attarda entra a cancello chiuso: sarebbe un ottimo motivo per correre, ma oggi non e' scritto da nessuna parte).

### N-39 · Il criterio con cui l'Ep. 20 divide i Frammenti — «parla della citta' o dell'uomo» — smista male quattro dei sei Frammenti dell'Atto II
**stato: chiusa** — via l’euristica «città o uomo», dentro l’elenco: i nove sono 1-7, 11 e 20. Il Frammento 0 resta dichiaratamente fuori da entrambi i conti · riferimenti: gen_ep7.py:736, gen_ep10.py:716, gen_ep20.py:163-165, gen_ep20.py:689-691

Il finale chiede al tavolo di separare da solo i nove del canto del sonno dagli undici della firma, e gli da' un test in una riga: «chiedetevi se il Frammento parla della citta' o dell'uomo». Applicato ai sei Frammenti scritti in questo atto, il test sbaglia. Il n. 10 — «La citta' nuova e' fatta coi materiali della vecchia. Chi sceglie i materiali sceglie che cosa la citta' ricordera'» — non contiene una parola su carta, denaro, sigilli o maschere e nomina la citta' due volte, eppure sta fra gli undici. Il n. 7 chiude su «Qualcuno compra il silenzio — a carrettate» (l'uomo) ma sta fra i nove; il n. 11 apre con «Qualcuno sta misurando» (l'uomo) e sta fra i nove; il n. 9 e' una metafora di bronzo e fusione (la citta') e sta fra gli undici. La lista corretta esiste ed e' stampata nella Soluzione dell'Ep. 20, quindi al tavolo non si rompe niente — si rompe la deduzione, che e' il modo in cui si vince il finale: il gruppo ordina secondo la regola, sbaglia, e scopre di aver sbagliato solo aprendo la busta. Non e' meccanico perche' richiede di rileggere venti frasi e giudicare di che cosa parlano. Due strade: riscrivere le mezze frasi che tradiscono il criterio (la piu' economica: il n. 10 e il n. 7 sono a una subordinata di distanza dalla parte giusta), oppure sostituire il test con uno che regga davvero — p. es. «e' una cosa che avete scoperto sulla citta', o una cosa che avete scoperto su di LUI?».

### N-40 · «La Quiete S.A.» — societa' anonima, undici mesi di vita, sede presso uno studio notarile — e' il filo piu' concreto verso C.B. di tutto l'atto, e nessuno lo tira
**stato: chiusa** — il filo è raccolto nel Referto del Luogo 2 dell’Ep. 13: la società anonima del quartiere sordo e le intestazioni del Notaio sono due maschere di carta della stessa specie — senza nominare M. · riferimenti: gen_ep7.py:187-200, gen_ep7.py:271-275, gen_ep13.py:658-659

L'Ep. 7 non lascia C.B. nell'ombra come gli altri episodi dell'atto: gli da' una persona giuridica. La Quiete S.A. deposita il brevetto, ha «sede presso uno studio notarile», compra la produzione della calcina (la Q coronata sui sacchi, L8), e i suoi conti stanno sulla scrivania di Voltan. La stringa «Quiete» non esiste in nessun altro file della campagna, e l'Ep. 13 apre la caccia da capo con una premessa che quel nome smentisce: «La caccia a C.B. comincia dalla carta di pregio: filigrana rara, un solo Molino delle Carte fuori citta'. La filiera e' amministrata dal Notaio Rasca». Il gruppo, dall'Ep. 7, ha gia' in mano un notaio e una ragione sociale — cioe' la strada breve — e la campagna fa finta di niente per sei serate. Non e' decidibile da uno script perche' la domanda e' se la societa' anonima sia una prova o solo colore. Due uscite: farla riemergere dove serve (l'Ep. 13 e' l'innesto: lo studio notarile della Quiete e' lo studio di Rasca, e l'Ep. 7 diventa retroattivamente il primo indizio giusto), oppure chiuderla nell'epilogo dell'Ep. 7 — la societa' si scioglie, lo studio notarile e' una cassetta postale, il filo muore li' — cosi' che l'Ep. 13 possa ripartire onestamente dalla carta.

### N-41 · Nessuna regola in venti episodi toglie un Frammento, quindi il ritmo del controcanto vale 4 per ogni tavolo del mondo
**stato: chiusa** — una regola sola nel Regolamento: la vittoria parziale frutta il Frammento **incrinato**, che non conta nel finale. Taccuino e Ep. 20 allineati. **Cambia il bilanciamento** · riferimenti: gen_ep20.py:697

L'Ep. 20 fa del conteggio dei Frammenti il cuore del finale — «1 riga + 1 ogni 6 Frammenti conservati» — e la nota per chi arbitra ci appoggia sopra il senso di tutta la campagna: «un gruppo che canta 2 righe per round e uno che ne canta 4 non giocano la stessa partita... quel ritmo lo decidono venti episodi di scelte» (gen_ep20.py:653-660). Ma i Frammenti 1-19 sono assegnati incondizionatamente nella pagina d'epilogo di ogni Soluzione, e in tutta la campagna non esiste una riga che ne neghi, tolga o metta a rischio uno (grep su «perdete il Frammento», «non ottenete», «Frammenti persi»: zero); per giunta il retro di ciascuno porta scritto il Bivio, quindi nessuno lo scarterebbe. Chiunque abbia giocato Ep. 1-19 arriva con 19, cioè 1+3 = 4 righe/round, sempre: la scala «2 righe contro 4» non ha una metà bassa e «un gruppo con pochi Frammenti deve perdere» descrive un tavolo che non può esistere. Non è decidibile da uno script perché il difetto è l'assenza di una regola, non un valore sbagliato. Due strade: legare il Frammento all'esito (vittoria piena = Frammento, parziale = no, che rende vivo anche il conto) — costa una riga in venti epiloghi e ritara l'Ep. 20; oppure ammettere che il ritmo è fisso e riscrivere la nota d'arbitro, che oggi promette una varianza inesistente.

### N-42 · L'Ep. 18 dà il decano per morto in un indizio letto al tavolo, mentre l'Ep. 17 lo libera vivo e l'Ep. 19 lo mette in scena
**stato: chiusa** — il decano non è morto: «ha rischiato la pelle per questa riga» · riferimenti: gen_ep18.py:230

Il Luogo 7 dell'Ep. 18 fa leggere: «Il decano è morto per questa riga; ora la riga parla», e la lettera d'incarico parla della «matrice del povero decano» (gen_ep18.py:62). Ma l'Ep. 17 ha come Obiettivo 1 esplicito «liberare il decano vivo» (T5, gen_ep17.py:346-352) e il caso peggiore dell'orologio è «lo recuperate ferito grave», mai morto; e l'Ep. 19 gli dedica un Luogo intero in cui è «provato ma vivo» e consegna la matrice completa (gen_ep19.py:192-205). Un tavolo che ha appena strappato Ferrante alla villa-prigione se lo sente seppellire una serata dopo e resuscitare quella dopo ancora. Uno script non lo vede perché nessun controllo confronta lo stato di un PNG fra episodi. La scelta è ovvia (il decano vivo è l'esito canonico e l'Ep. 19 ci costruisce sopra un Luogo): resta il lavoro di rendere condizionali le due righe dell'Ep. 18 — «il decano ha rischiato la pelle per questa riga» regge in entrambi i rami e non costa nulla.

### N-43 · Braga consegna lo stesso archivio due volte, da due posti diversi, e l'Ep. 19 rimette in dubbio una morte che l'Ep. 17 dichiara
**stato: chiusa** — l’Ep. 17 consegna il biglietto e la chiave di lettura, l’Ep. 19 l’archivio; la morte resta ignota quella notte e risolta settimane dopo · riferimenti: gen_ep19.py:176

Il Bivio dell'Ep. 15 promette che Braga protetto «vi consegnerà nell'Ep. 17 il suo archivio privato su M.», e l'Ep. 17 paga: apertura e Luogo 3 lo consegnano dalla cella del Tribunale, col biglietto «guardate le penne, non le mani» (gen_ep17.py:129-131, 621-631). Poi l'Ep. 19 lo rifà da capo: Luogo 5 «La Villa-Museo di Braga», il professore libero che apre la porta e dice «Ve l'avevo detto: guardate le penne, non le mani... Prendete, e usatelo», come se fosse la prima consegna — e quell'archivio è gate di metà delle Prove per l'Ispettore. Nessun episodio lo scarcera fra il 17 e il 19. Sull'altro ramo la deriva è inversa: l'Ep. 17 chiude netto («la cella è vuota: Braga è morto nel sonno») e l'Ep. 19 torna incerto («Braga è morto, o sparito»). Non è materia da script: sono due scene scritte come se fossero l'unica. Il taglio più economico è togliere la consegna dall'Ep. 17 (che vive benissimo col solo biglietto) e lasciare l'archivio all'Ep. 19, dove serve meccanicamente; costa la scarcerazione, una riga nell'epilogo dell'Ep. 18.

### N-44 · Il «conto dei bivi» dell'Ep. 19 chiede 3 alleati su un'enumerazione di tre voci, una delle quali non è un Bivio, più «i minori» che nessuno elenca
**stato: chiusa** — il conto dei bivi ha un elenco chiuso di cinque alleati con la loro condizione; soglia 3, raggiungibile in entrambi i rami · riferimenti: gen_ep19.py:625

La soglia è un numero secco — «serve conto ≥ 3 alleati» per convincere Vidal, cioè per la vittoria piena — e le voci nominate sono tre: «Braga protetto Ep. 15, decano lucido Ep. 17, prova pubblica Ep. 18, e i minori». Ma «decano lucido» non è un Bivio: il Bivio dell'Ep. 17 è processo-contro-trappola (gen_ep17.py:721-727), e il decano lucido è l'esito della soglia-decano in spedizione; e «i minori» non sono elencati da nessuna parte della campagna (grep: la parola compare solo in queste due righe). Il risultato è che il conto non è computabile a tavolo, e che il ramo «tenere la prova» dell'Ep. 18 — che l'apertura dell'Ep. 19 sostiene e compensa, dichiarando «la soglia resta quella, in entrambi i rami» (gen_ep19.py:595) — resta a 2 su 3 e non può raggiungere la soglia con le sole voci nominate. Un contatore lo direbbe solo se l'elenco fosse chiuso, e non lo è. Proposta: enumerare i minori una volta sola (i Bivi 3, 9, 10, 14, 16 hanno tutti un PNG dietro) e abbassare la soglia a 3 su un elenco più largo, oppure dichiarare che il ramo «tenere la prova» compra la piena in un altro modo.

### N-45 · L'Ep. 20 legge il Bivio dell'Ep. 19 e ignora l'esito: chi ha fallito la persuasione incassa comunque la rete di Vidal
**stato: chiusa** — l’Ep. 20 distingue Vidal convinto da Vidal solo fermato: la rete è solo di chi l’ha convinto · riferimenti: gen_ep20.py:627

L'Ep. 19 ha due canali paralleli verso il finale che dicono la stessa cosa. Il primo è l'esito: «Fascicolo preso e Ispettore CONVINTO = vittoria piena (nell'Ep. 20 Vidal tiene aperte le uscite: ritirata sicura); solo fermato = parziale (l'Ep. 20 senza la sua rete)» (gen_ep19.py:652-654). Il secondo è il Bivio, le cui due opzioni sono «Convincere l'Ispettore con le prove» e «Entrare da soli». L'apertura dell'Ep. 20 legge solo il secondo, e ci appende una regola pesantissima: sul primo ramo Rianimare funziona, sul secondo «un eroe che cade resta a terra fino alla fine» — in una spedizione dichiarata fuori scala. Quindi un gruppo che NON ha convinto Vidal può sigillare «Convincere l'Ispettore con le prove» e prendersi la ritirata che non si è meritato; e un gruppo che l'ha convinto, se sigilla «Entrare da soli», perde una rete che l'epilogo dell'Ep. 19 gli ha appena promesso a voce («o almeno tengo aperte le uscite»). Uno script non se ne accorge perché entrambe le buste esistono e sono ben formate. Il costo di sistemarlo è basso: rendere il Bivio disponibile solo a chi ha convinto Vidal (chi non l'ha convinto entra da solo, punto), oppure spostare Rianimare sull'esito e lasciare al Bivio solo il ritmo del Canto.

### N-46 · Lo stato in cui arriva la Vetri è attribuito all'Ep. 4, ma le tre condizioni vengono da tre posti diversi e la migliore non corrisponde a nessun ramo
**stato: chiusa** — lo stato della Vetri è una tabella a due ingressi su due Bivi che esistono davvero; la spedizione esce dal conto · riferimenti: gen_ep20.py:196

L'Ep. 20 dichiara che lo stato della Vetri «dipende dagli esiti dell'Ep. 4 (voce restituita / melodia impressa / conchiglia disaccordata o registrata)» (gen_ep20.py:682) e il Presagio del Luogo 5 lo articola in tre esiti: intera «se le rendeste la voce (la conchiglia spenta, le lastre di cera recuperate)», a metà «se i legni la registrarono, o se la melodia impressa è rimasta vostra sotto sigillo», muta «se la conchiglia fu disaccordata e distrutta». Ma il Bivio dell'Ep. 4 è binario — Distruggerla / Sigillarla e conservarla (gen_ep4.py:721-728) — e non contiene nessuna «voce restituita»: quella è il ramo del Bivio dell'Ep. 3 («Restituire le voci», gen_ep3.py:685-690, l'unico che nomina la prima donna del Comunale). «Disaccordata» e «lastre recuperate» sono poi esiti della spedizione dell'Ep. 4, non del Bivio. Il risultato: le tre condizioni si sovrappongono (disaccordare i pannelli è la condizione di vittoria dell'Ep. 4, quindi ricorre sia in «intera» sia in «muta»), lo stato migliore non è raggiungibile da nessun singolo ramo, e un tavolo che ha restituito le voci nell'Ep. 3 e sigillato la conchiglia nell'Ep. 4 non sa quale delle tre righe si applichi. Non è materia da script: i tre esiti sono prosa e le condizioni sono nomi di scene. La proposta minima è riscrivere le tre condizioni come una tabella a due ingressi (Bivio 3 × Bivio 4) e togliere la spedizione dal conto; costa un paragrafo dell'Ep. 20 e una riga di rimando nell'Ep. 3.

### N-47 · L'Ep. 9 promette Riva «fonte segreta dell'Episodio 17» e l'Ep. 17 non lo nomina mai
**stato: scartata** — doppione di N-33, che dice la stessa cosa · riferimenti: gen_ep9.py:707

Il Bivio dell'Ep. 9 è costruito su una rinuncia dura — perdere la causa, subire la sentenza-beffa, un Testimone in meno negli Ep. 10-12 — e il compenso è nominale e datato: «Ma Riva, vivo e libero e in debito con voi, diventa la fonte segreta dell'Episodio 17». Nell'Ep. 17 la stringa «Riva» non compare (le uniche occorrenze nel finale sono dentro «Rivale», in gen_ep18.py:644 e :855), l'apertura della Soluzione applica i Bivi 16, 15 e 12 e non il 9, e nessun Luogo o Approfondimento ha una fonte anonima interna. È l'unico Bivio della campagna che promette un PNG a un episodio preciso e non lo consegna: il tavolo apre la busta, legge «fonte segreta», e non trova nessuna porta a cui bussare. Non è visibile a uno script perché il Bivio è ben formato e l'Ep. 17 è internamente coerente. Costo: Riva è già un sacrestano introdotto e vivo, e l'Ep. 17 ha un Luogo 6 (il membro interno additato) e un Luogo 2 (l'assemblea) dove una voce di dentro sta bene; una Testimonianza in più, oppure — più economico — spostare la promessa sull'Ep. 19, dove l'intero episodio è già il censimento dei debiti.

### N-48 · La cosa che M. prende dallo studio nell'Ep. 18 «che rivedrete nell'Atto IV» non ricompare in nessuno dei due episodi dell'Atto IV
**stato: chiusa** — la cosa che M. prende è il grimorio del Quarto Movimento, che l’Ep. 20 già mette in scena senza provenienza · riferimenti: gen_ep18.py:338

In T4 dell'Ep. 18 la tessera fa leggere: «M. è qui un istante — prende una cosa sola (che rivedrete nell'Atto IV), vi guarda, e sparisce nel muro», e il Luogo 5 la mostra in negativo («nella cera del ripiano resta un rettangolo più lucido, delle dimensioni di una cartella», gen_ep18.py:798-799) e T4 la mostra di nuovo («l'impronta rettangolare di una cosa presa in fretta»). È un gancio scritto con cura, e l'Atto IV è tutto qui: Ep. 19 e Ep. 20. Grep su entrambi: la cosa non c'è, M. nell'Ep. 20 arriva alla camera con il grimorio e il coro comprato, che vengono da altri fili. Non è decidibile da uno script perché l'oggetto non ha un nome da cercare — è proprio questo il punto: la promessa è deliberatamente anonima e nessuno la battezza dopo. Due strade: dargli un nome nell'Ep. 18 e farlo ricomparire (il Grimorio del Rito dell'Ep. 20 è già lì, gli manca solo la provenienza — costa una subordinata in due file); oppure togliere l'incidentale «che rivedrete nell'Atto IV» e lasciare il gesto come colore.

### N-49 · La regola per separare i nove dagli undici sbaglia su almeno tre Frammenti, e il Frammento del Preludio non sta in nessuna delle due metà
**stato: scartata** — doppione di N-39, che dice la stessa cosa · riferimenti: gen_ep20.py:164

Il momento della rivelazione finale è un esercizio di smistamento, e l'Ep. 20 dice al tavolo come farlo: «Riconoscerle è semplice: chiedetevi se il Frammento parla della città o dell'uomo» — i nove «parlano della città, del bronzo, dei legni e del dio che dorme», gli undici «parlano di lui — carta, denaro, sigilli, maschere». La lista vera è 1-7, 11, 20 contro 8-10, 12-19 (gen_ep20.py:689-691), e su quei testi la regola non tiene: il Frammento 10 («La città nuova è fatta coi materiali della vecchia. Chi sceglie i materiali sceglie che cosa la città ricorderà») nomina la città due volte e non ha né carta né denaro né sigilli, ma sta negli undici; il Frammento 9 («La storia ufficiale è una campana: chi la fonde decide come suona») è tutto bronzo e sta negli undici; il Frammento 6 («Ferri contava i movimenti su quattro dita. Poi chiudeva il pugno») parla di un uomo e sta nei nove. Il tavolo che applica l'euristica sbaglia tre carte su venti proprio nella scena in cui la campagna dovrebbe scattare in posizione. Sotto, un secondo buco della stessa contabilità: il Preludio consegna un «Frammento di Campagna n. 0» dicendo «conservatelo con gli altri Frammenti» (gen_preludio.py:501), e il finale conta 1-19 e divide 9/11 — il primo oggetto che la campagna mette in mano ai giocatori non appartiene a nessuna delle due metà e non vale una riga. È lettura, non aritmetica: uno script conta venti Frammenti e li trova tutti. Distinta da N-06 (il titolo della carta) e da N-07 (la forma di verso): qui il problema è che la chiave di lettura offerta dà la risposta sbagliata.

### N-50 · L'epilogo di campagna non nomina un solo PNG — nemmeno la Vetri, che il gruppo ha appena salvato nella camera
**stato: chiusa** — scritto il commiato: Vetri, Vidal, Ferrante, Fossa, Ranuzzi, condizionati ai Bivi · riferimenti: gen_ep20.py:740

Dopo venti serate l'ultima pagina liquida tutte le persone con quattro parole: «Migliorie finali e commiato dei PNG secondo i Bivi», e non c'è nessun testo di commiato da nessuna parte. L'epilogo di vittoria (gen_ep20.py:727-734) nomina solo M.; l'epilogo di sconfitta e il finale aperto nemmeno lui. La più pesante è la signora Vetri: è la risposta alla Domanda 3, la fase 2 della spedizione consiste nel sottrarla a M., il Presagio del Luogo 5 costruisce tre stati diversi in cui può arrivare — e l'epilogo non dice se sia viva, se canti ancora, se sia tornata al Comunale. Stessa sorte per il decano, Fossa, Ranuzzi, Vidal e Braga, che l'Ep. 19 ha appena passato in rassegna uno per uno come «il conto della campagna». Non è un giudizio di gusto: è una voce dichiarata nel fascicolo («commiato dei PNG») che non ha contenuto, nell'unico punto in cui la campagna può ripagare le persone invece dei fili. Costo: cinque o sei righe condizionali sul modello già usato altrove («se la Vetri è arrivata intera... se il decano è vivo...»), tutte nella stessa pagina.

### N-51 · Fossa «vi deve la vita dal Preludio», ma nel Preludio non lo salvate
**stato: chiusa** — Fossa non deve la vita: deve un pugno di favori mai riscossi e un nome mai finito in un verbale · riferimenti: gen_ep19.py:104

L'Ep. 19 fonda il suo Luogo 2 — porta aperta, mappa dei sigilli, metà della Domanda 1, e uno dei tre esempi con cui l'episodio spiega la sua tesi «chi avete salvato torna a salvarvi» (gen_ep19.py:116-117) — su un debito preciso: «Fossa vi deve la vita dal Preludio, e non l'ha dimenticato». Nel Preludio Fossa compare cinque volte e non è mai in pericolo: il Banco è un luogo disponibile dall'inizio, e il suo ruolo è tenere il registro dei pegni che scagiona un sospetto (gen_preludio.py:144-146, 220, 480). È il PNG più ricorrente della campagna (otto episodi) e la prima volta che il finale gli dà un passato, gliene dà uno che non è successo. Uno script non lo vede perché il nome è coerente ovunque; è la relazione a essere inventata. Due strade a costo simile: cambiare il debito in ciò che è davvero accaduto («gli avete tenuto il Banco fuori dai verbali» funziona con l'Ep. 7 o l'Ep. 8, dove il Banco è già in scena), oppure seminare il salvataggio nel Preludio — che però tocca il primo episodio, ed è il ramo caro.

### N-52 · L'Ep. 19 mette la Gazzetta dentro il conto degli alleati e, otto righe dopo, la dichiara fuori
**stato: chiusa** — risolta tenendo Ranuzzi nel conto: la Gazzetta e una porta aperta a tutti, ma nel conto entra Ranuzzi che si schiera, e quello si merita al Bivio dell'Ep. 18. Soglia 3 invariata, verificata raggiungibile su entrambi i rami · riferimenti: gen_ep19.py:658 contro gen_ep19.py:671-673

La pagina «il conto dei bivi — l'elenco chiuso» elenca come voce n. 3 «Il cronista Ranuzzi (Luogo 3) — Bivio dell'Ep. 18, ramo "Rendere pubblica la prova subito"», e l'apertura conferma che vale +1 alleato. Il paragrafo di chiusura della stessa pagina dice però: «I quattro luoghi aperti dall'inizio — l'oste della Chiatta, Fossa, la Gazzetta, il gendarme amico — vi aiutano comunque, ma NON si contano: il conto misura ciò che vi siete meritati, non ciò che vi è dovuto». Il Luogo 3 È la Gazzetta, e Ranuzzi è il suo PNG: la frase esclude dal conto l'alleato n. 3 dell'elenco che sta sopra. Non è decidibile da uno script perché entrambe le formulazioni sono ben formate e il legame è «Luogo 3 = la Gazzetta = Ranuzzi», che solo un lettore fa. Con la soglia a 3 su 5 il difetto è pratico: un tavolo che legge il paragrafo di chiusura si toglie un alleato e può mancare la persuasione di Vidal. Proposta minima: la frase escluda «la Taverna, Fossa e il gendarme amico» e aggiunga «la Gazzetta conta soltanto per la voce n. 3».

### N-53 · Il Bivio dell'Ep. 15 promette ancora l'archivio di Braga per l'Ep. 17, che è stato riscritto apposta per non consegnarlo
**stato: chiusa** — Bivio dell'Ep. 15 e apertura dell'Ep. 16 allineati alla nuova divisione: dalla cella arriva il biglietto e la chiave di lettura, l'archivio resta in casa di Braga e torna quando sara lui a riaprire quella porta · riferimenti: gen_ep15.py:725-726 e gen_ep16.py:637-638 contro gen_ep17.py:665-670 e gen_ep19.py:198-205

La correzione di N-43 è stata applicata a valle e non a monte. L'Ep. 17 ora dice esplicitamente «Braga mantiene la promessa per la parte che si può mandare fuori da una cella: NON l'archivio (…restano in casa sua, e le riprenderete quando sarà lui a riaprire quella porta) ma la chiave per leggerlo», e l'Ep. 19 fa la consegna vera al Luogo 5. Ma il testo del Bivio dell'Ep. 15 — quello che i giocatori scrivono sul retro del Frammento n. 15 e rileggono due serate dopo — continua a dire «Braga, protetto, vi consegnerà nell'Ep. 17 il suo archivio privato su M.: trent'anni di rivalità», e l'apertura dell'Ep. 16 ripete «là arriva anche il compenso: l'archivio privato di Braga». Nessuno script lo vede: il Bivio è ben formato e l'Ep. 17 applica un ramo. Al tavolo il gruppo apre la busta all'Ep. 17 aspettando l'archivio e trova un biglietto. Costo: due righe (Ep. 15: «vi manderà dalla cella la chiave per leggerlo, e l'archivio quando tornerà libero»; Ep. 16: «e là arriva il primo pezzo del compenso»).

### N-54 · La rilettura dell'Ep. 16 vale 1 incrocio per lettera; l'Ep. 18 la conta 3 in tutto, e il massimo di campagna è 7
**stato: chiusa** — vince la contabilita dell'Ep. 18: la RILETTURA e cappata a 3 in cinque punti dell'Ep. 16, compresa la riga del taccuino che i giocatori spuntano, e sulla carta della matrice · riferimenti: gen_ep16.py:494 e gen_ep16.py:675-679 contro gen_ep18.py:704-713

L'Ep. 16 stampa sul taccuino d'indagine, letto dai giocatori, «Ogni vecchia lettera riletta = 1 incrocio bancato per l'Episodio 18», e la Soluzione precisa «rileggete le vecchie lettere d'incarico di M. (una per ogni episodio conservato)» — cioè fino a quindici, senza costo in ore dichiarato oltre l'accesso al Luogo 6. La scala dell'Ep. 18, riscritta stanotte, dice invece «+1 per ogni vecchia lettera d'incarico riletta (una sessione piena ne vale 3)» e «il massimo che la campagna può produrre è 7». Le due contabilità non sono conciliabili, e la parola «sessione» non è definita da nessuna parte. È la scala che decide la vittoria piena dell'Ep. 18 (5+ = prova forte): un tavolo che ha bancato dodici riletture arriva col massimo qualunque cosa abbia fatto ai quattro Bivi, e l'intera pagina «gli incroci di campagna — la scala» smette di misurare qualcosa. Uno script non lo vede perché i due numeri stanno in file diversi e non hanno una forma comune. Proposta: l'Ep. 16 dichiari il tetto sul posto («la sessione di rilettura banca al massimo 3 incroci, per quante lettere rileggiate»). Nota a margine, stesso punto: l'esame di Carbone «LA RILETTURA DELLE VECCHIE LETTERE» (gen_ep16.py:957) non corrisponde a nessun Oggetto né Reperto dell'episodio — è l'unico esame orfano di tutta la campagna, e in modalità digitale (indagine.js, esameCarbone) non è raggiungibile per costruzione.

### N-55 · La Contro-busta dell'Ep. 15 è di nuovo pre-pagata: l'Esame di Carbone del Manuale dice già «lo aveva»
**stato: chiusa** — l'Esame di Carbone descrive ora l'oggetto (il dorso allentato, le cocche piegate, la firma raschiata) e non trae piu la conclusione sul diritto d'accesso. Allineata anche la carta fisica, che diceva ancora «lo aveva» · riferimenti: gen_ep15.py:942-946 contro gen_ep15.py:701-708

N-27 è stato chiuso smorzando L5 e L9 (verificato: gli indizi e i due Presagi ora si fermano prima della conclusione), e N-03 spostando la Contro-busta sul diritto d'accesso: «il registro delle consultazioni si firma soltanto se se ne ha diritto… La firma è abrasa; il diritto no. Chi ha scritto il dossier non ha rubato il nostro metodo di nascosto: se l'è fatto prestare alla luce del giorno, come gli spettava». Ma l'Esame di Carbone su «IL MANUALE INDIZIARIO» — il Manuale è l'Oggetto del Luogo 5, quindi la carta si legge ad alta voce durante l'Indagine — dice ancora: «E delle dodici copie, la n. 7 è stata consultata il mese scorso, la firma cancellata. Chi ha scritto il falso non ha rubato il metodo: LO AVEVA». È la tesi nuova della Contro-busta, parola per parola, tre ore prima che si apra. La chiusura di N-27 nominava proprio questo pezzo («la copia n. 7 con la firma abrasa è oggi già spesa nel Luogo 5») e l'ha lasciato intatto. Nessuno script accoppia il testo di un esame con quello di una busta sigillata. Costo: una frase — l'esame si fermi sul fatto («la n. 7 è stata consultata, e la firma sul registro è stata raschiata via») senza trarre la conclusione sul diritto.

### N-56 · L'Ep. 12 dà a M. un alibi documentale — gli ordini protocollati in ore d'assemblea — e nessun episodio, nemmeno il 18, lo smonta
**stato: chiusa** — l'alibi non era falso: era letto male. Il protocollo lo batte un impiegato la mattina dopo, quindi l'ora in margine e quella del timbro, non della penna. Emerge dove il gruppo lo cerca (custode delle penne, Referto, Esame di Carbone), e la carta fisica ora porta la confutazione · riferimenti: gen_ep12.py:132-133, gen_ep12.py:236-238, gen_ep12.py:950-952; deduzione in gen_ep18.py:676-692

La copertura riscritta stanotte poggia su un fatto positivo, ripetuto tre volte e sempre in testo letto ad alta voce (indizio del Luogo 2, Referto del Luogo 6, Esame di Carbone): gli ordini che hanno fatto copiare i Frammenti sono autentici «ma protocollati in ore in cui il presidente sedeva in assemblea, a verbale, davanti a venti confratelli». È l'unico alibi verificabile che M. abbia in venti serate, ed è testimoniato dai venti confratelli che all'Ep. 18 siedono in quella stessa sala. L'obiezione che l'Ep. 12 offre — «nessuno protocolla un tradimento: si protocolla un ordine che si vuole poter negare come di routine» — risponde al perché, non al come: non spiega come una mano possa protocollare mentre il suo proprietario è a verbale altrove. L'Ep. 18, che è diventato un how-to-prove e chiede di reggere il nome «davanti a trenta confratelli che lo hanno eletto», prova la firma (inchiostro), la cassa (oro vecchio) e la logistica (carrozza), e non nomina mai il protocollo: grep «protocoll» su gen_ep18.py = zero. Un tavolo che ha giocato l'Ep. 12 con attenzione ha in mano l'obiezione che vince l'assemblea, e il fascicolo non gli dà nulla per rispondere. Non è decidibile da uno script perché nessun controllo confronta un alibi con la sua confutazione. Proposta a costo basso: una riga nel Luogo 1 o nel Luogo 3 dell'Ep. 18 — il protocollo lo tiene un impiegato la mattina dopo, e la mano che scrive di notte non è quella che timbra — oppure spostare l'obiezione nell'Esame di Carbone «GLI INCROCI DI CAMPAGNA», che oggi non la tocca.

### N-57 · Il Frammento 14 raddoppia l'età del duello: «sessant'anni» dove tredici altri passaggi dicono trenta
**stato: chiusa** — «sessant'anni» -> «trent'anni»: i due conteggi contati davvero (21 passaggi sul duello, 4 sulle forniture di carta), e la riformulazione toglie anche l'ambiguita fra eta del duello e anzianita di chi arreda · riferimenti: gen_ep14.py:726-728

Il Frammento riscritto stanotte recita «chi arreda una colpa da sessant'anni conosce l'uomo da sessant'anni». Ma la rivalità Braga/M. è «di trent'anni» ovunque, e sette volte nello stesso file — dalla lettera d'incarico («il nostro rivale di trent'anni») alla chiave d'accesso del Luogo 2 («il duello di trent'anni») fino all'epilogo che sta due paragrafi sopra il Frammento («per arredargli addosso una vita di crimini, bisogna conoscerlo da una vita»); l'Ep. 15 e l'Ep. 19 la contano trent'anni a loro volta («trent'anni di studio del rivale», «per crimini di trent'anni»). Il Frammento 14 è una delle undici righe della firma che si rileggono nel finale, quindi il numero torna sul tavolo all'Ep. 20. c_cronologia non lo vede: guarda solo le durate in mesi della caccia. Correzione ovvia — «sessant'» → «trent'», due occorrenze in una riga — ma va decisa, perché se l'intenzione era «una vita intera» conviene scriverlo così invece di darle una cifra.

### N-58 · Il Bestiario dell'Ep. 17 attribuisce al Notaio «il rapimento di Braga (Ep. 14)», che nell'Ep. 14 non avviene
**stato: chiusa** — il Bestiario del Notaio elenca ora solo fatti visti in scena — il nolo intestato, i registri lasciati alle fiamme, il decano. Tolta anche una seconda attribuzione falsa («vegliato sul falso»), che nell'Ep. 15 non ha una sola occorrenza · riferimenti: gen_ep17.py:428-429 (bio_bestiario del Notaio); l'Ep. 14 in gen_ep14.py:6, 76, 105-112

La scheda di Bestiario di Ludovico Rasca — stampata, e letta dall'arbitro nell'episodio in cui il Notaio finalmente si prende — dice: «Al Molino vi è scappato in carrozza; ha ordito il rapimento di Braga (Ep. 14) e vegliato sul falso (Ep. 15); ha preso il decano perché sapeva troppo». Nell'Ep. 14 nessuno rapisce Braga: il professore denuncia un furto, riceve il gruppo in casa propria al Luogo 1 e parla («il duello di trent'anni l'ho perso io»); il lavoro del Notaio quella notte è il furto al contrario, cioè la roba lasciata in casa sua. Braga finisce in cella solo nell'Ep. 15, e per arresto, non per rapimento. Uno script non lo vede perché è una frase di colore in una bio, e i nomi sono tutti coerenti. Costo: una parola — «il furto arredato in casa di Braga (Ep. 14)». La stessa bio è copiata in webapp/data/comune.json e va allineata.

### N-59 · Nove episodi mandano a scrivere sul Taccuino di Campagna cose per cui il Taccuino stampato non ha una casella
**stato: chiusa** — la pagina 2 del Taccuino era BIANCA (solo padding fronte/retro): ora porta i tre riquadri che nove episodi chiedono — gli incroci di campagna con il tetto di 7, i cinque alleati del conto con la loro condizione, e tre righe per le note che non sono ne Frammento ne Bivio · riferimenti: gen_taccuino_campagna.py:63-112 contro gen_ep18.py:700, gen_ep17.py:650, gen_ep15.py:631/636, gen_ep19.py:651, gen_ep10.py:648

Il Taccuino stampato ha quattro colonne — episodio, «framm.», «incrin.», «bivio scelto» — più un riquadro finale con CONSERVATI / INCRINATI / CHE CONTANO. La casella «incrinato» è arrivata con la regola nuova; la contabilità degli INCROCI no. Eppure l'Ep. 18 dice che gli Incroci di Campagna «si contano una volta sola, all'apertura, SUL TACCUINO DI CAMPAGNA», l'Ep. 15 e l'Ep. 17 dicono «segnate sul Taccuino, alla riga "Episodio 18", un incrocio in più/in meno», l'Ep. 19 dice «spuntateli sul Taccuino di Campagna» per i cinque alleati, e l'Ep. 10 «segnare sul Taccuino il PNG-alleato perso». Nessuna di queste righe ha dove finire: la riga 18 ha una sola linea, ed è quella del Bivio. Non è meccanico — nessuno script confronta un'istruzione in prosa con un layout in millimetri, e il difetto si vede solo guardando il PDF renderizzato. Proposta: due colonne strette in più (una «incroci Ep. 18», una «alleati Ep. 19», entrambe a caselle) oppure una colonna «note» accanto al Bivio; in alternativa, riscrivere le nove istruzioni perché rimandino al retro del Frammento, che quel posto ce l'ha.

### N-60 · «Non incrinati» è arrivato in quattro punti su sette: la lettera dell'Ep. 20, il suo Approfondimento L3, la regola del ritmo e la carta stampata contano ancora «i Frammenti conservati»
**stato: chiusa** — chiusa: «e non incrinati» ora e in tutti e sette i punti, compreso quello che stampa la regola del ritmo e la carta fisica. Era mia: avevo introdotto la regola e applicata a meta · riferimenti: gen_ep20.py:83, gen_ep20.py:149, gen_ep20.py:740, gen_ep19.py:689 e :716; carta «La deduzione finale» in cards-data.js:4816

La regola nuova (vittoria parziale = Frammento incrinato, si conserva e non conta) è scritta nel Regolamento e ha una casella sul Taccuino, e l'Ep. 20 la applica nel taccuino d'indagine (:486), nel titolo di sezione (:502), nella nota d'arbitro (:691) e nella risposta alla Domanda 4 (:734). Ma la riga che stabilisce materialmente il ritmo, dieci righe più sotto, dice ancora «cantate 1 riga + 1 ogni 6 Frammenti conservati» (:740); la lettera d'incarico letta ad alta voce dice «portate con voi… TUTTI i Frammenti conservati» (:83); la Testimonianza «Chi vi resta» dice «i Frammenti conservati (le righe da cantare)» (:149); e l'Ep. 19, che è dove il gruppo prepara l'economia del finale, li elenca due volte come «i Frammenti conservati (n. 1-19)». La carta fisica «La deduzione finale», che è quella che il tavolo ha davanti quando conta, porta la formula vecchia (questa parte ricade sotto N-09, il resto no). Non è decidibile da uno script perché sono formulazioni in prosa della stessa regola. Costo: quattro «e non incrinati» e un allineamento di carta — ma va fatto tutto insieme, perché è il numero con cui si vince la campagna.

### N-61 · La prima donna del Comunale è muta per il Bivio dell'Ep. 3, canta la gala nell'Ep. 4, e l'Ep. 20 la dichiara «mai presa»
**stato: chiusa** — linea fissata: la Vetri fu MISURATA e MANCATA, non ammutolita. Non le tolsero la voce ma il ricordo di quella notte — cosi l'Ep. 4 resta intatto (canta la gala su entrambi i rami), si spiega perche il Coro cambi metodo, e le due frasi dell'Ep. 20 diventano vere insieme · riferimenti: gen_ep3.py:707-714 / gen_ep4.py:71,648 / gen_ep6.py:647 / gen_ep20.py:194-195,218

Il Bivio dell'Ep. 3 mette la prima donna del Teatro Comunale — cioè la signora Vetri, che nell'Ep. 4 tiene il passe-partout «della prima donna» — fra gli ammutoliti: «Gli ammutoliti guariscono, e una di loro — la prima donna del Teatro Comunale — ricorda TUTTO di chi l'ha “misurata”», e sul ramo opposto «I muti restano muti». Ma la lettera dell'Ep. 4 dice senza condizioni «stasera la signora Vetri canterà per metà città», l'intera Domanda 3 dipende dal fatto che lei canti l'aria del terzo atto, e la Testimonianza «La Vetri» (L2) si legge su entrambi i rami (l'apertura dell'Ep. 4 la rende solo più facile). Poi l'Ep. 6 la chiama «la solista mai catturata» e l'Ep. 20 «la solista che il Coro insegue da allora e non ha mai preso» — mentre due righe sotto lo stesso Presagio dice che restituire le canne-voce le fa tornare «la memoria di chi l'aveva misurata», cioè che presa lo era. Non è decidibile da uno script: c_bivi verifica che il ramo sia applicato, non che il mondo regga. La tabella a due ingressi dell'Ep. 20 (chiusura di N-46) ha appena reso questa ambiguità portante per il finale, quindi va sciolta: o la prima donna dell'Ep. 3 non è la Vetri (basta chiamarla altrimenti nel Bivio 3), o la Vetri fu solo «misurata» e mai tagliata — e allora «una di loro» e «I muti restano muti» vanno riscritti.

### N-62 · L'Ep. 9 sposta la bugia sul brigadiere, e l'Ep. 10 usa lo stesso brigadiere come rivelatorio della Domanda 2
**stato: chiusa** — scelta la continuita: e lo stesso brigadiere, e l'Ep. 10 lo dice in bocca a lui — «l'altra notte gli orari ve li ho passati io, e non erano i miei». L'Ep. 10 aveva gia una meccanica (la Testimonianza che si perde su un ramo) che presuppone un rapporto continuo con la divisa: sdoppiare le persone ci avrebbe combattuto contro · riferimenti: gen_ep9.py:671-682 / gen_ep10.py:171-174, 184, 689 / gen_ep1 (gen_cards.py:311) / gen_preludio.py:525

La chiusura di N-35 ha tolto la bugia all'usciere e l'ha data «al brigadiere della Gendarmeria», che è però l'unico gendarme ricorrente della campagna e non ha nome che lo distingua: compare nel Bivio del Preludio (vi registra come investigatori privati), nell'Ep. 1 (Luogo 8), nell'Ep. 9 (Luogo 4) e nell'Ep. 10 (Luogo 4). Nell'Ep. 10 è una delle tre carte designate come rivelatorio della Domanda 2 e dice «tra noi: quel caso l'abbiamo chiuso troppo in fretta» — cioè il gruppo deve credere, una serata dopo, all'uomo che ha appena smascherato come comprato e che con un'ora falsa ha quasi fatto ammazzare Riva. In più l'apertura dell'Ep. 10 usa proprio la sua Testimonianza come pegno del rapporto con la divisa. Nessuno script lo vede: non c'è controllo che confronti lo stato di un PNG fra episodi, e il brigadiere non è nel CAST di c_omonimi perché non ha nome proprio. Due uscite: dare un nome al bugiardo dell'Ep. 9 (un brigadiere fra tanti, non IL brigadiere), oppure far pagare la cosa nell'Ep. 10 con una riga — il brigadiere che parla perché è in debito con voi dopo l'affare Riva.

### N-63 · La dodicesima canna ora è di Piero, ma la Soluzione dell'Ep. 3 la conta ancora fra i riscontri della Domanda 3
**stato: chiusa** — il conto delle canne non e piu un riscontro della D3: dodici su undici dice che una canna non serve a un pozzo, non QUALE pozzo. Domanda e risposta invariate, cambia l'istruzione all'arbitro; l'indizio letto ad alta voce resta vero · riferimenti: gen_ep3.py:216-218 (L6, indizio letto ad alta voce) / gen_ep3.py:649-653 (Domanda 3) / gen_ep3.py:344-350 (T5) / gen_ep3.py:694-698 (epilogo)

L'indizio core del Luogo 6 fa il conto in pubblico: «dodici canne di piombo consegnate… ma i pozzi murati del Borgo sono undici. Una canna è per qualcosa che pozzo non è», e la Soluzione elenca «il conto delle canne: dodici canne, undici pozzi» come uno dei tre riscontri della Domanda 3 (quale pozzo è il Pozzo Maestro). Dopo la correzione, però, la dodicesima canna ha un destinatario stampato in due punti: è vuota, senza sigillo, col nome di Piero graffiato nel piombo. La canna in più non indica più un luogo: indica un bambino morto. Il tavolo che segue l'aritmetica stampata arriva a una conclusione che l'epilogo poi smentisce, e la Domanda 3 resta in piedi solo sugli altri due riscontri. Non è decidibile da uno script perché entrambe le frasi sono vere separatamente. Costo minimo: togliere «il conto delle canne» dai riscontri della D3 (registro dei livelli e ventaglio delle falde bastano), oppure far dire a Bo tredici canne — dodici per i pozzi e la gola, più quella con il nome.

### N-64 · Il Preludio innesta il «dettaglio di troppo» nell'unica lettera che M. ordina di bruciare
**stato: chiusa** — l'ordine di bruciare resta, e l'Ep. 16 chiarisce che si rileggono le MINUTE di M., non le vostre copie — compresa la prima, quella che vi ordino di distruggere. La scena d'apertura resta intatta e il freddo raddoppia · riferimenti: gen_preludio.py:110-113 / gen_ep16.py:222-223, 232-233

La lettera del Preludio ora porta il tell (l'orologio d'argento con la corona consumata da un pollice solo, «se vi capitasse tra le mani, riportateglielo»), ma quattro righe dopo dice: «Bruciate questa lettera appena l'avrete letta: le altre dieci dicono la stessa cosa, ma nessuna è stata scritta perché qualcuno la conservi». L'Ep. 16 costruisce la RILETTURA esattamente sul contrario — «le vecchie lettere d'incarico di M., conservate una a una» — e il Referto chiede di rileggerle «dal primo giorno». Al tavolo il fascicolo c'è sempre, quindi non si rompe niente di meccanico; si rompe la scena, che è il punto: il gruppo torna a prendere la prima lettera e la finzione dice che non esiste più. Non è materia da script: nessun controllo confronta un ordine dato nel Preludio con una meccanica che debutta quindici serate dopo. La riparazione più economica è nell'Ep. 16, non nel Preludio: l'Archivio delle Lettere conserva le MINUTE di M., non le copie dei destinatari — e allora bruciare la propria non toglie niente, anzi rende più freddo il fatto che lui le abbia tenute tutte.

### N-65 · M. chiede di riportare ad Ansaldo l'orologio, e il Preludio non dice mai se si possa riprendere
**stato: chiusa** — «riportateglielo» -> «se dovesse saltar fuori, non sara in una tasca sua»: non chiede piu un'azione che nessuna riga permette, e il tell diventa doppio (la corona consumata, e la previsione che P3 conferma alla lettera) · riferimenti: gen_preludio.py:110-112 / gen_preludio.py:164-166, 173-176 / gen_preludio.py:509-520

Il dettaglio innestato non è solo colore: è un'istruzione. «Porta con sé un orologio da tasca d'argento… se vi capitasse tra le mani, riportateglielo.» L'orologio poi si trova davvero — è nel registro di Fossa (P3, indizio 1) e c'è un Referto intero che lo esamina — ma nessun indizio, nessuna regola e nessuna riga della Soluzione dice se il gruppo possa riscattarlo, e l'epilogo, che pure mette in scena Ansaldo che beve mezzo bicchiere e M. che posa undici spille, non lo nomina. Il primo compito esplicito che la campagna assegna resta senza risposta nella stessa serata in cui è dato, e nel fascicolo che deve insegnare come si gioca. Uno script non lo vede perché non è una regola mancante: è una promessa. Costa una subordinata: o Fossa lo cede (o lo fa riscattare a tariffa) come chiusura dell'Approfondimento, o l'epilogo dice che il pegno è già stato girato a terzi — e quel dettaglio, alla rilettura, pesa il doppio.

### N-66 · «Sacrestia» è stato corretto solo nell'Ep. 5, e nemmeno sulle sue carte: il Luogo 9 ha due nomi diversi
**stato: chiusa** — uniformato «sacrestia» in 15 righe su 6 file (esclusi i percorsi degli artwork), e il nome del Luogo 9 ora coincide fra carta e fascicolo. Aggiunto il controllo A6 in audit.py: il nome di un Luogo sulla carta DEVE coincidere col fascicolo — ha subito trovato altri due disallineamenti (Ep. 3 L4, Ep. 14 L2), corretti · riferimenti: gen_ep5.py:283-290 contro cards-data.js:1262-1264 e generate-reperti.js:416 / gen_cards.py:211 / gen_ep6.py:81

Il fascicolo dell'Ep. 5 chiama il Luogo 9 «LA SACRESTIA DEI BATTUTI» e usa «sacrestia» in tutte le sue occorrenze; la carta Luogo stampata si intitola «La Sagrestia dei Battuti», il suo req e il suo testo dicono «sagrestia vecchia», e il Reperto C stampato dice «trovato nella sagrestia vecchia». Non è la deriva generica di N-09: qui divergono il NOME di un luogo — cioè la parola con cui il gruppo lo chiamerà per tutta la serata — fra la carta in mano ai giocatori e il fascicolo in mano a chi arbitra. Fuori dall'Ep. 5 la correzione non è mai stata portata: l'Ep. 1 ha il Luogo 4 «LA SAGRESTIA DELLA CATTEDRALE» e l'Ep. 6 il Luogo 1 «LA CATTEDRALE, LA SAGRESTIA» — la stessa stanza, scritta in due modi, a cinque serate di distanza. Va deciso una volta sola e applicato ai tre file (cards-data.js, generate-reperti.js, gen_cards.py/gen_ep6.py); il posto giusto per non farla tornare è la lista `vietate` di scripts/audit.py, che già intercetta le copie stantie sulle carte.

### N-67 · Ep. 10 — tolto il nome dalla lettera, la lettera regala ancora la Domanda 2 («il vedovo»)
**stato: chiusa** — la lettera non nomina piu ne «Malfanti» ne «il vedovo», e spinge verso l'Archivio invece di anticipare; allineata anche la nota d'arbitro, che accettava una risposta deducibile dal solo briefing. Nome e ruolo restano in tre Luoghi aperti su quattro · riferimenti: gen_ep10.py:76-78 (lettera) / gen_ep10.py:670-674 (Domanda 2) / gen_ep10.py:687-691 (nota sul rivelatorio)

N-18 è chiusa con «nome tolto», ma la Domanda 2 non chiede un cognome: chiede CHI ha ucciso, e la risposta è «Corrado Malfanti, il vedovo». La lettera racconta ancora tutto il resto — «una voce avrebbe dettato… come un uomo strangolò la moglie e la murò» e, in chiaro, «Il vedovo, risposato, abita ancora nella corte» — e la nota per chi arbitra dichiara accettabile «una risposta vicina (es. “il vedovo, quello che denunciò l'abbandono”)». Un gruppo che ha letto solo il briefing scrive «il vedovo» e incassa il vantaggio, che qui non è piccolo: «La casa ha già parlato» toglie al Muratore il primo colpo di demolizione e, se lo incontrate, rimuove il Vedovo dal gioco in T4. Uno script non lo vede: c_domande non confronta la risposta con la lettera, e la misura di N-25 riguardava la D1. Costa una riga: la lettera dica che nella corte abitano ancora i protagonisti di quella vecchia denuncia, senza dire chi denunciò chi — oppure la D2 chieda la prova («COSA rende il vedovo l'unico che poteva murarla lì»), non il nome.

### N-68 · N-23 è chiusa avendo coperto due lettere su tre: l'Ep. 2 resta senza «dettaglio di troppo»
**stato: chiusa** — innestato nella lettera dell'Ep. 2 il tic privato di Ilario — la nota ripassata due volte — che esiste solo dentro un taccuino che nessuno ha ancora aperto. Scartati ghisa da scafo, fonderia vecchia e oggetti perche sono chiavi o risposte: li regalare avrebbe cambiato la struttura dell'indagine · riferimenti: gen_ep2.py:77 / AUDIT-NARRATIVA-APERTA.md N-23

Il corpo di N-23 elencava tre buchi nell'Atto I — Preludio, Ep. 1 e «l'Ep. 2 si ferma a un suggerimento tattico (“se salite abbastanza in alto”)» — e la nota di chiusura ne dichiara riparati due. La lettera dell'Ep. 2 è rimasta identica: «C'è dell'altro, e non lo scrivo: lo sentirete da soli, se salite abbastanza in alto» è un consiglio, non una cosa che M. non poteva sapere, e alla rilettura dell'Ep. 16 quella pagina non paga niente. Una voce chiusa a due terzi è peggio di una aperta, perché il prossimo giro non la riapre. L'innesto è a portata di mano nella lettera stessa: M. sa già, all'alba, che i pani «pesavano giusto ma non erano più bronzo» — basta che dica anche di che cosa erano fatti (la ghisa da scafo del Cimitero delle Barche), che è la scoperta del Luogo del molo e non poteva essere sulla sua scrivania.

### N-69 · Ep. 6 — Ferri porta al collo «il vostro diapason d'argento», e nessun episodio glielo restituisce
**stato: chiusa** — spiegato e reso preciso: il diapason era rientrato coi reperti sotto i sigilli della Gendarmeria, e i sigilli li ha tagliati Ferri da dentro (la bottega riaperta dal di dentro era gia nel testo). E «il vostro diapason» diventa «il diapason del vostro primo caso» · riferimenti: gen_ep6.py:381 (T8, testo letto ad alta voce) / gen_ep6.py:194-199 (L5) / gen_docs.py:709 (Domanda 4 dell'Ep. 1)

Nell'Ep. 1 il diapason d'argento è la risposta alla Domanda 4: il gruppo lo prende dal banco della bottega Ferri e lo usa contro il Custode della Cera. Fra l'Ep. 1 e l'Ep. 6 la parola «diapason» non compare in nessun generatore. Poi il fronte di T8 — testo letto ad alta voce alla rivelazione della tessera — dice: «al centro, con la bacchetta di liutaio e il vostro diapason d'argento al collo, Bastiano Ferri», e il Luogo 5 conferma il passaggio di mano («l'astuccio è aperto e vuoto… vi ho lasciato l'astuccio. Il LA giusto, stanotte, lo do io»). L'oggetto-firma della prima serata cambia proprietario fuori scena, e il gruppo lo scopre vedendolo addosso al boss senza che nessuno gli abbia mai frugato la sacca. Nessuno script lo vede: non c'è inventario di campagna, e la parola non è in nessuna lista. Va scelto se il furto sia voluto — e allora merita d'essere giocato o almeno nominato (una carta Minaccia dell'Ep. 4 o 5, una riga d'epilogo: «manca una cosa sola dalla vostra cassetta») — oppure se sia una svista, e allora basta togliere «vostro» da T8: Ferri ne ha uno suo, ed è più inquietante che ne abbia costruito un gemello.

### N-70 · Due Bo a sei serate di distanza: il lattoniere dell'Ep. 3 e il giurato dell'Ep. 9
**stato: chiusa** — il lattoniere dell'Ep. 3 e ora Zanchetta, verificato unico nel repo; allineate anche le tre superfici sulla carta (nome, req, soggetto). Il percorso dell'artwork resta 'Lattoniere Bo.png' finche l'arte non viene generata · riferimenti: gen_ep3.py:149, 216, 629, 654 / gen_ep9.py:124, 141, 154, 668, 777

L'Ep. 3 costruisce un personaggio memorabile sul cognome nudo — «il lattoniere Bo», l'uomo delle dodici canne, che dà la parola-chiave e l'oggetto della Domanda 4 — e l'Ep. 9 mette in scena «Amilcare Bo, il giurato», rivelatorio designato della Domanda 2, con una Testimonianza intestata al suo nome. Sono due persone diverse con lo stesso cognome nella stessa città, entrambe in testi letti ad alta voce. c_omonimi non lo prende perché confronta i nomi di battesimo del CAST e il lattoniere non ne ha uno. È la stessa specie di N-16 e costa quanto è costata quella: un cognome nuovo a uno dei due — il più economico è il giurato, che ha già un nome proprio e un solo episodio addosso.

### N-71 · «Si possono perdere eroi» e' stampato cinque volte nel finale, e nessuna regola in tutto il gioco dice come si perde un eroe
**stato: chiusa** — allineata alla regola che esiste davvero, in cinque punti dell'Ep. 20 piu' l'obiettivo digitale e i tre documenti di progetto: «gli eroi cadono, e quaggiu' rialzarli puo' non essere possibile» (vero su entrambi i rami dell'Ep. 19). Nessuna regola di morte permanente inventata. · riferimenti: gen_ep20.py:9, :404, :430, :544, :597 contro gen_docs.py:400-401 e :956-957

Il Regolamento conosce un solo stato: a 0 Salute un eroe cade «a terra», non agisce finche' non viene rianimato, e «se tutti gli eroi sono a terra l'episodio e' fallito». Non esiste da nessuna parte una morte, una perdita definitiva, un ritiro dal roster: grep su gen_docs.py per «muore/morto/morire/perdere un eroe» da zero risultati. L'Ep. 20 promette il contrario in cinque punti stampati — la docstring, l'arbitro di T6, la bio di Bestiario della Camera, la prima pagina di Spedizione e la pagina nemici — e il ramo «Entrare da soli» aggiunge solo «resta a terra fino alla fine», che non e' una perdita ma una panchina. La cosa che dovrebbe rendere il finale fuori scala, cioe' la posta piu' alta di venti serate, e' l'unica regola del finale che non e' scritta: o si scrive (l'eroe a terra alla fine della camera e' perduto, e il commiato lo nomina), o si toglie la promessa da cinque posti.

### N-72 · Il ritmo del controcanto non ha pavimento: con tre impiegati in campo un gruppo normale canta zero righe, e il coro rientra dal mazzo
**stato: chiusa** — pavimento a 1 riga stampato nei quattro punti in cui il tavolo legge il ritmo, e portato nel simulatore (`max(1, ...)` se c'e' almeno un cantore). La scala 2-5 righe non e' stata toccata: sparisce solo lo stato assorbente a zero. · riferimenti: gen_ep20.py:561-562, :741-743, :760

Il ritmo e' 1 riga + 1 ogni 6 Frammenti (+1 Mappa) meno 1 per ogni impiegato in campo, e nessuna riga dice che il risultato non possa scendere a zero o sotto. Un gruppo con 12 Frammenti buoni canta 4 righe/round: gli bastano quattro coristi per non cantare piu' affatto, e il mazzo ne ha 7 carte spawn su 21 con 5 miniature disponibili, anche nella camera. Zero non e' «lento»: e' uno stato assorbente, perche' mentre non canti M. in piedi aggiunge +1 Canto/round e il conto va solo in una direzione. La Soluzione dichiara che «un gruppo con un Bivio duro e pochi Frammenti deve perdere», ed e' una scelta legittima, ma qui la perdita non arriva da una corsa persa: arriva da una moltiplicazione che si annulla, e il tavolo se ne accorge guardando una traccia ferma. Proposta minima: pavimento a 1 riga sempre («per quanti siano, una riga la cantate»), che lascia intatta la scala 2-5 e toglie il muro.

### N-73 · Nella camera l'unico orologio e' M.: abbattuto un uomo da 5 Ferite, il boss dichiarato «la camera» non fa piu' nulla, e la via piu' rapida al finale che «non si vince con l'acciaio» e' l'acciaio
**stato: chiusa** — il rito accelera il risveglio finche' **ha una voce**: M. in piedi con la sua, oppure un impiegato del coro che canta al posto suo. Nessun numero nuovo — cambia chi tiene l'orologio. Riflesso in `gen_ep20.py` (cinque punti), nel simulatore e sulla carta Minaccia del risveglio. Chiude l'exploit: il controcanto non costa azioni, quindi tutte le azioni erano libere per abbattere M. e poi aspettare. · riferimenti: gen_ep20.py:745, :761-763

Nella camera il Canto sale per tre cose sole: ogni 6o round, ogni crescendo pescato (4, 5 col Bivio 18), e +1/round finche' M. e' in piedi con la sua voce. Le fasi ambientali della camera partono da Canto 4. Quindi un gruppo che entra a Canto 4-5 e stende M. (Att 2, Dif 8, Fer 5, Danno 1: due round per quattro eroi) si trova un boss che non colpisce, un orologio che avanza di 1 ogni sei round e tutto il tempo del mondo per dieci righe che ne richiedono tre o quattro. Se poi ha anche salvato la Vetri, M. non accelera nemmeno da in piedi. L'episodio dice cinque volte «non abbassate la lama, alzate la voce», e la struttura premia esattamente il contrario: e' una decisione d'autore, non un refuso — o M. si rialza / il rito prosegue senza di lui (il coro comprato canta lo stesso), oppure la camera acquista una pressione propria che non dipenda da lui.

### N-74 · riapre N-60 — l'Ep. 19, cioe' il posto dove si fa il censimento prima del finale, conta ancora «i Frammenti conservati (n. 1-19)» senza «non incrinati», e il suo gemello digitale invece l'ha
**stato: chiusa** — applicata anche al secondo punto dell'Ep. 19 (`gen_ep19.py:691`), dove il letterale era spezzato su piu' righe sorgente e la prima passata non l'aveva agganciato: ora «Frammenti conservati e non incrinati (n. 1-19, quelli che avete tenuto serata dopo serata vincendo pieno)». · riferimenti: gen_ep19.py:691 e :718 contro webapp/data/ep19.json:322 e webapp/export-data.py:721

La nota di chiusura di N-60 dichiara sistemati «gen_ep19.py:689 e :716», ma nel fascicolo la risposta alla Domanda 4 («COSA portate alla discesa?») dice ancora «i Frammenti conservati (n. 1-19, quelli che avete tenuto serata dopo serata)» e la pagina di Spedizione lo ripete otto righe dopo. La correzione e' finita solo nella copia hardcoded di webapp/export-data.py e quindi in ep19.json, cioe' nella modalita' digitale: in modalita' tavolo l'arbitro fa il conto sbagliato una serata prima di quella in cui il conto decide la campagna. Sono due «e non incrinati» in un file solo, ma vanno messi la' dove il conto si fa la prima volta, non solo dove si spende.

### N-75 · riapre N-06 — sulle carte fisiche i venti Frammenti si dividono ancora «in due meta'», due volte, e una delle due e' la carta che il tavolo ha in mano mentre conta
**stato: chiusa** — le due aritmetiche sbagliate corrette su carta e in `ep20.json`: «si dividono in due parti disuguali — nove... undici». Il titolo del Referto «Le due meta' dei Frammenti» resta: e' chiave di join col file d'arte renderizzato, e il corpo lo smentisce nella riga successiva. · riferimenti: cards-data.js:4657 e :4815 (gemelli in carte.json:3700 e :5666); webapp/data/ep20.json:299

N-06 e' stata chiusa lasciando il titolo «Le due meta' dei Frammenti» e facendolo smentire dal corpo («si dividono in due — ma non a meta'»), ma il corpo corretto sta solo nei generatori. La carta dell'indizio del Luogo 4 dice «Qui i venti Frammenti si dividono in due meta'» e il flavor della carta «La deduzione finale» dice «meta' erano il canto del sonno, che M. voleva; meta' lo smascheravano»: e' il testo che afferma proprio la cosa che la chiusura doveva impedire, sulla carta che si guarda mentre si contano i Frammenti. Anche l'«obiettivo» dell'Ep. 20 in ep20.json porta la formula vecchia. Non e' la divergenza di lunghezza tollerata da N-09: qui carta e fascicolo dicono due aritmetiche diverse (10+10 contro 9+11) nello stesso momento della serata.

### N-76 · riapre N-50 — il commiato nomina cinque PNG su sei: manca Braga, che il corpo di N-50 elencava e che e' l'unico con due esiti davvero opposti
**stato: chiusa** — commiato completato sul modello condizionale della Vetri: Braga (dubbio dichiarato in pubblico -> viene al molo / avallato -> morto in cella) e gli eroi rimasti a terra nella camera. · riferimenti: gen_ep20.py:784-805 contro AUDIT-NARRATIVA-APERTA.md N-50 e gen_ep19.py:653-654

Il commiato scritto copre Vetri, Vidal, Ferrante, Fossa e Ranuzzi; il corpo di N-50 chiedeva «il decano, Fossa, Ranuzzi, Vidal e Braga». Braga e' l'unico dei sei che su un ramo e' vivo, libero e vi ha aperto la villa-museo (Bivio 15, «dichiarare pubblicamente il dubbio») e sull'altro e' morto in cella per un falso che avete avallato: e' il congedo con il contrasto piu' forte della pagina, ed e' quello che manca. Nella stessa pagina, e per la stessa ragione, non c'e' una riga per gli eroi caduti nella camera — il finale li promette perdibili e poi l'ultima pagina della campagna non li saluta. Due righe condizionali sul modello gia' usato per la Vetri.

### N-77 · L'epilogo che consegna il Frammento 20 scrive «Otto erano il canto del sonno», e otto piu' undici fa diciannove
**stato: chiusa** — `gen_ep20.py`: «Otto erano il canto del sonno» -> «Nove». · riferimenti: gen_ep20.py:806-810

La riga dice «l'ultima riga del canto del sonno, la nona — ... Otto erano il canto del sonno con lei (Frammenti 1-7 e 11: M. li voleva), undici la sua firma». Letta con calma torna (otto piu' questa fanno nove), ma e' l'unico punto di tutta la campagna in cui il numero stampato accanto agli «undici» e' otto, e sta nella pagina che chiude il conto: nove piu' undici uguale venti e' la struttura su cui il tavolo ragiona da venti serate, e qui a colpo d'occhio legge diciannove. Costa una parola: «Con lei sono nove le righe del canto del sonno (1-7, 11 e questa), undici la sua firma».

### N-78 · Nello stesso Luogo 5, l'indizio e la Testimonianza datano la caccia alla Vetri a due notti diverse — l'inverno degli ammutoliti e la notte della gala
**stato: chiusa** — la caccia comincia con l'inverno degli ammutoliti; la gala e' il tentativo fallito. Corretti i quattro punti dell'Ep. 20, fra cui la Testimonianza letta ad alta voce. La carta fisica lo diceva gia' cosi': era il fascicolo a essere rimasto indietro. · riferimenti: gen_ep20.py:193-197 contro gen_ep20.py:208-210 e la D3 in gen_ep20.py:712-713

L'indizio 1 fissa la linea decisa con N-61 («La misurarono quell'inverno e la mancarono ... e la inseguono da allora»), cioe' dall'Ep. 3; la Testimonianza dello stesso Luogo dice «la solista che il Coro insegue dalla notte della gala e non ha mai preso», cioe' dall'Ep. 4; la Soluzione prova a tenerle insieme («la solista mai catturata dell'Ep. 4, che il Coro insegue dall'Ep. 3»). Sono tutte e tre carte lette ad alta voce nella stessa mezz'ora, e la Domanda 3 e' quella che decide se la Vetri si salva. Non e' decidibile da uno script perche' entrambe le frasi sono vere separatamente: va scelto se la caccia comincia con la misura sbagliata del Borgo o col tentativo fallito alla gala, e allineata la Testimonianza.

### N-79 · La Miglioria «Voce che regge» vale +1 Frammento nel finale, e nessuno dei sette punti dell'Ep. 20 che stampano il ritmo la nomina
**stato: chiusa** — «Voce che regge» nominata dove il ritmo si conta (taccuino) e dove la formula e' autoritativa (nota d'arbitro e formula canonica), col vincolo «una sola per gruppo». · riferimenti: gen_docs.py:585-587 contro gen_ep20.py:487, :503, :692, :735, :741

Il Regolamento vende una casella di Miglioria che «nell'ultimo episodio conta come un Frammento in piu' per il ritmo del controcanto», una sola per gruppo. L'Ep. 20 stampa la formula in cinque punti piu' la carta e il taccuino, e in nessuno c'e' un posto dove quel +1 entri: il taccuino ha CONSERVATI / INCRINATI / CHE CONTANO e basta, e il ritmo si legge «1 riga + 1 ogni 6 Frammenti conservati e non incrinati». Poiche' la soglia e' ogni 6, quel +1 e' silenzioso tranne che sui valori 5, 11 e 17 — dove pero' vale una riga per round, cioe' molto. O l'Ep. 20 la nomina dove stampa la formula, o la casella del Regolamento va tolta.

### N-80 · Due leve di partenza dicono entrambe «il Canto parte da 1», e un gruppo che le prende tutte e due ne paga una sola
**stato: chiusa** — il Bivio dell'Ep. 11 diventa un incremento che **si somma** alla D1 sbagliata: tetto dichiarato a 2, «la partita piu' dura che questo finale sappia dare, e resta giocabile». Allineata anche la penalita' digitale, che assorbiva le due leve in una. · riferimenti: gen_ep20.py:683 (Bivio Ep. 11) contro gen_ep20.py:708 (D1 sbagliata)

Il ramo «Infiltrare la squadra» dell'Ep. 11 e la Domanda 1 sbagliata sono formulati come un valore assoluto, non come un incremento: «il Canto (risveglio) parte da 1» in entrambi i casi. Chi ha infiltrato la squadra e ha sbagliato l'ora parte quindi da 1 come chi ha fatto una sola delle due cose, e il prezzo del Bivio si azzera nell'unico episodio dove doveva incassarsi. Costa una parola in uno dei due punti («+1 segnalino Canto, cumulabile»); vale la pena decidere anche il tetto, perche' la nota d'arbitro dice che un solo segnalino di partenza «e' il colpo piu' duro dei tre».

### N-81 · Il Reperto C dell'Ep. 13 — la carta che il gruppo si porta a casa — stampa ancora «C.B. paga da dove pagate voi», e il controllo che doveva impedirlo è cieco per un a capo
**stato: chiusa** — il Reperto B dell'Ep. 13 ora da' il fatto e non la conclusione: «Sessant'anni di forniture alla stessa penna, e un giro che certe notti allunga di una fermata». · riferimenti: scripts/reperti/generate-reperti.js:852 (repertoC13) contro scripts/audit.py:249 (lista `vietate`)

La tornata dell'08/08 ha tolto quella conclusione da epilogo, Referto, due Testimonianze e due Esami di Carbone dell'Ep. 13; il Reperto C — il registro dei noli, il SEME dell'Atto, l'unico oggetto fisico dell'episodio che resta in mano ai giocatori e torna sul tavolo all'Ep. 18 — la porta intatta e la rincara: «Chi paga la carta di C.B. paga da dove pagate voi: è in casa, e da sessant'anni». È la frase che l'Ep. 18 tiene per il Luogo 2 («paga C.B. paga da dove paghiamo noi. Non è un nemico esterno. È in bilancio», gen_ep18.py:103): il Reperto la anticipa di cinque serate e aggiunge «è in casa», che l'Ep. 18 non dice nemmeno lì. `c_carte_stantie` cerca proprio la stringa 'paga da dove pagate voi' nello stesso file e non la trova perché il template HTML la spezza su due righe («…paga da dove\n pagate voi»): il guardiano esiste, è puntato sul bersaglio giusto e passa. Costo: due parole nel Reperto, più normalizzare gli spazi in `c_carte_stantie` (`re.sub(r'\s+',' ',...)` prima del confronto), altrimenti ogni frase vietata futura sfuggirà allo stesso modo.

### N-82 · riapre N-27 — le due frasi «è uno di noi» tolte dal fascicolo dell'Ep. 15 sono ancora stampate sulle carte fisiche, e una passa sotto il naso del controllo per una parola
**stato: chiusa** — tolte da entrambe le carte: il Presagio dice «e' di qualcuno che lo conosce meglio di lui», la carta del boss «Il regista della scena». Rimosso anche «di C.B.», che attribuiva il mandante tre episodi prima del tempo. · riferimenti: scripts/cardconjurer/cards-data.js:3560 (Presagio L9) e :3706 (nemico «Il Capo Apparecchiatore»)

N-27 è chiusa dicendo «tolte da L5 e L9 dell'Ep. 15 le tre frasi che dicevano "è uno di noi" prima della Contro-busta», e nel fascicolo è vero; sulle carte no. Il Presagio del Luogo 9 chiude ancora con «Non è la mano di Braga. **È una delle nostre.**» — parola per parola la risposta della Contro-busta, letta ad alta voce durante l'Indagine — e la scheda del boss lo presenta come «Il regista di scena **di C.B.**», cioè dichiara che C.B. non è Braga mentre la squadra lavora in casa di Braga. La seconda sfugge anche ad `audit.py`, la cui lista `vietate` contiene 'la squadra di scena di C.B.': la carta dice «il regista di scena di C.B.», stessa affermazione a due parole di distanza. Sono le due superfici che il tavolo ha davvero in mano: finché restano, N-27 è chiusa solo sul lato che nessuno legge.

### N-83 · riapre N-55 — l'Esame di Carbone risparmiato è quello delle Istruzioni, che conclude «è dentro casa nostra» e regala la Contro-busta proprio a chi non se l'è meritata
**stato: chiusa** — l'Esame di Carbone delle Istruzioni si ferma al fatto («ha avuto sotto gli occhi, a lungo, il nostro manuale») e il Reperto A gemello pure. La conclusione resta alla Contro-busta. · riferimenti: src/gen_ep15.py:954-957 (ESAMI_CARBONE_15, «LE ISTRUZIONI CON LA GRAFIA DI BRAGA») e scripts/reperti/generate-reperti.js:916 (repertoA15)

N-55 è stata chiusa smorzando l'Esame del MANUALE (verificato: ora descrive il dorso allentato, le cocche, la firma raschiata, e non trae più la conclusione sul diritto) e allineando la sua carta. L'Ep. 15 ha però tre Esami, e il terzo — sulle Istruzioni con la Grafia di Braga, Reperto A — chiude così: «Chi ha scritto questo conosce Braga e il metodo meglio di Braga stesso: **è dentro casa nostra. Il mostro ha il nostro volto**», che è testualmente la battuta finale dell'epilogo riservato a chi apre la Contro-busta (gen_ep15.py:717). Il guaio non è solo la ripetizione: le Istruzioni si ottengono prendendo il Capo, e prendere il Capo con meno di 4 tell dà la vittoria PARZIALE, dichiarata «un dubbio, non una prova» — ma il Reperto che quel gruppo si porta via, e il suo Esame, gli consegnano la prova per intero. Costo: una frase, come nel gemello — l'Esame descriva la grafia troppo perfetta e il metodo morelliano e si fermi lì.

### N-84 · Ep. 13 — la riscrittura della D3 è arrivata sulle carte di L1 e L4 in una forma più generosa che nel fascicolo: due luoghi aperti dall'inizio regalano la risposta intera
**stato: chiusa** — le due carte aperte dall'inizio non regalano piu' tutt'e due le meta' della D3: il capostazione torna a «l'ora di partenza, le soste, il ritorno», il doganiere a «quando parte e quando torna». I turni della guardia restano dietro la porta chiusa del capo-catena. · riferimenti: scripts/cardconjurer/cards-data.js:3042 e :3063 contro src/gen_ep13.py:114-121, 190-198 e 718-726

La D3 nuova chiede «l'ora del nolo E i turni della guardia», e il fascicolo la tiene a due conferme incrociate su un luogo chiuso a chiave: gli appunti del capo-catena (L5, si apre solo con la parola «il capo-catena annegato») più il registro dei noli (L7). Le carte fisiche di L1 e L4, entrambi aperti dall'inizio e visitabili alla prima ora, contengono già tutt'e due le metà: il capostazione «a che ora parte, a che ora rientra, **chi monta la guardia**», il doganiere «sapeva a che ora parte la carrozza **e in quali ore i magazzini del Molino restano scoperti**» — mentre nel fascicolo lo stesso capostazione dice «l'ora di partenza, le soste, il ritorno» e lo stesso doganiere «quando parte e quando torna». La D3 esatta vale lo slittamento di 2 round di tutto l'orologio del rogo, cioè il singolo vantaggio più pesante dell'episodio: un tavolo che gioca con le carte lo incassa in due visite e senza aprire L5. Non è divergenza di lunghezza (le carte sono più corte per costruzione): qui la carta dice una cosa in più, e proprio quella che il fascicolo ha appena chiuso a chiave.

### N-85 · Ep. 13 — il Taccuino del Capo-Catena e la D3 esatta danno lo stesso identico bonus, e nessuno dei tre posti in cui è scritto dice se si sommino
**stato: chiusa** — non-cumulabilita' dichiarata nei tre punti del fascicolo, sulla carta Oggetto e nella D3 digitale: «chi ha tutt'e due slitta di 2 round in tutto, non di 4». · riferimenti: src/gen_ep13.py:718-726 (D3), :388-390 (hook T4), :361-363 (T2), scripts/cardconjurer/cards-data.js:3228 (carta Oggetto)

«Tutto l'orologio del rogo slitta di 2 round, ogni soglia compresa» + «le prove d'ambiente sono più facili» è insieme il premio della D3 esatta e l'effetto dell'oggetto Taccuino, quest'ultimo stampato tale e quale sulla carta che i giocatori hanno in mano («l'arbitro fa scattare il rogo 2 round più tardi e rende Facili le prove d'ambiente»). Il fascicolo pubblica una sola tabella slittata (T5 al 9, T6 al 11, T4 al 14, T3 al 16, T2 al 18, T1 al 20), quindi implicitamente i due non si sommano — ma non lo dice, e il tavolo che ha entrambi si chiederà se il rogo slitti di 2 o di 4. Peggio: i due si accompagnano quasi sempre, perché la D3 non è rispondibile senza gli appunti di L5, e chi visita L5 prende il Taccuino. La lettura economica è che il premio della D3 esatta sia un'altra cosa (la prova che regge in tribunale, come dice già il testo digitale), e che il rinvio del rogo resti dell'oggetto solo; l'alternativa è una riga di non-cumulabilità.

### N-86 · Ep. 13 — le 4 Domande vivono in due sorgenti e la riscrittura ne ha aggiornata una sola: nel testo digitale la D1 dà il bonus di un oggetto e la D3 non dà più niente
**stato: chiusa** — `SOLUZIONI['ep13']` riallineato Domanda per Domanda: la D1 prometteva il Lasciapassare invece del round senza Minaccia, la D3 «il seme dell'Atto III» invece dello slittamento di 2 round dell'orologio del rogo. Aggiunti nome completo del Notaio, le due conferme vere e il vincolo delle 20 sulla Cassetta. · riferimenti: webapp/export-data.py:576-592 (SOLUZIONI['ep13']) contro src/gen_ep13.py:710-726

`SOLUZIONI` in export-data.py è una seconda stesura a mano delle stesse quattro Domande, e `c_data_allineati` verifica che i JSON siano il riflesso dei generatori — ma non che le due stesure dicano la stessa cosa. La riscrittura ha toccato il testo della *risposta* di D3 in entrambe (coincidono), non gli effetti: nel fascicolo D1 esatta vale «nel 1° round della spedizione non si pesca nessuna carta Minaccia» (la convenzione d'atto: Ep. 14, 15 e 16 la ripetono identica), nel digitale vale «col Lasciapassare del Nolo saltate lo sbarramento del Cortile», cioè l'effetto di un oggetto; e D3 esatta, che nel fascicolo slitta l'intero orologio del rogo di 2 round, nel digitale non ha alcun effetto meccanico («il seme dell'Atto III è saldo, la prova regge in tribunale»). L'Ep. 13 è l'unico dell'Atto III fuori convenzione su D1. Il rimedio strutturale è far leggere le Domande ai generatori invece di ricopiarle, o un controllo che confronti i due elenchi campo per campo.

### N-87 · Ep. 13 — «il Luogo 9 costa 2 ore» è scritto in quattro posti del fascicolo e in nessun posto del codice: `fuori_citta` è una chiave che non legge nessuno
**stato: chiusa** — chiusa su tutte le superfici. Il fascicolo dichiara cosa significhi operativamente («barrate due cerchi, che la dichiarazione sia giusta o sbagliata»); la chiave `fuori_citta`, che vivevaSOLO nei generatori e nei simulatori Python, ora e' esportata come `ore` e onorata dal motore digitale nei tre punti in cui si spende l'ora, piu' un cancello che rifiuta la trasferta con un'ora sola. Vale anche per la Villa-Prigione dell'Ep. 17, che aveva la stessa chiave morta. · riferimenti: src/gen_ep13.py:313 (`fuori_citta=True`), :91, :493, :502, :739-740 contro webapp/export-data.py:230-246 (`luogo_json`) e webapp/public/js/indagine.js:249,261,289

La trasferta al Molino è la scelta economica centrale dell'Indagine — sei ore, e una visita ne costa due — ed è dichiarata nella lettera, sull'orologio del taccuino, nel promemoria a margine e nella nota d'arbitro. `luogo_json` non esporta `fuori_citta` (né alcun costo), e l'app scala sempre `ind.ora += 1`: in modalità digitale il Molino costa un'ora come una bottega in centro. Poiché è il pilota digitale a misurare il bilanciamento, l'Ep. 13 risulta misurato con un'ora in più di quante ne abbia davvero, e con l'ultimo luogo a metà prezzo. Stessa chiave morta, stesso effetto, sull'Ep. 17 (`gen_ep17.py:83`, la Villa-Prigione fuori porta): sono due episodi e una riga sola — esportare il costo e farlo scalare in `indagine.js`. (Gemello inerte accanto: `in_quota` in gen_ep14/gen_ep15 non è letto da nessuno, ma lì non regge nessuna regola.)

### N-88 · Ep. 15 — la CANCELLAZIONE, cioè la meccanica che dà il nome all'episodio, non esiste nei dati digitali: il pilota misura una serata senza clessidra
**stato: chiusa** — modellata in digitale: `cancellazione` nei dati dell'Ep. 15 e `avanzaCancellazione()` a fine round in `digitale.js`, generica e guidata dai dati (compito, tessera d'innesco, per_round, finche_compito). Un tell per round da T4 finche' il Capo e' in piedi, pool a pavimento zero. Il commento nel sorgente diceva «un domani si potrebbe modellare»: e' oggi. Cinque asserzioni nuove in `webapp/test-digitale.mjs`, **provate non vacue** (spento il decremento: 3 FAIL). **Il sigillo a 7 era tarato senza la clessidra: l'Ep. 15 va rimisurato col pilota prima di fidarsi della sua percentuale** — vedi [[N-110]]. Non modellato il tell extra bruciato dalle due carte Minaccia: resta ricchezza da tavolo. · riferimenti: webapp/data/ep15.json (`compiti`: 4 tell su T2/T3/T4, nessun decadimento) contro src/gen_ep15.py:532-536, 360-364, 686-689

Il fascicolo costruisce l'episodio su un pool che si svuota — «da T4 gli Apparecchiatori cancellano un tell per round finché il Capo è in piedi», 5 tell in tutto, 4 necessari per la Contro-busta — e due carte Minaccia ne bruciano uno extra a testa. Nei dati digitali i tell sono quattro compiti di Interagire distribuiti su T2/T3/T4 e non sparisce niente: la sola pressione modellata è il Sigillo (Canto 7). La vittoria piena digitale è quindi «prendi 4 tell e poi il Capo entro il Canto 7», una gara col tempo, non con la squadra che cancella: è un episodio diverso da quello stampato, ed è quello su cui gira la misura. L'Ep. 15 è fra gli outlier della mappa pilota ancora da classificare, e questa è la prima cosa da escludere prima di attribuire l'anomalia alla taratura.


**Misurato dopo la chiusura (pilota Playwright, 4 eroi).** La prima versione era un muro: 0/6 vittorie, tutte le partite ferme a 3 tell su 4, T6 mai raggiunta. Baseline senza clessidra, stesso pilota: 3/6 = 50%. La causa non era la clessidra ma il pool: in digitale i tell documentabili erano **quattro**, quanti ne servono, mentre il fascicolo ne mette **cinque** alla villa e ne chiede quattro — senza quel margine una cancellazione da 1/round non lascia scampo. Aggiunto `massimo` alla specifica dei compiti (`quante` = quanti servono, `massimo` = quanti ne esistono) e portato il pool dell'Ep. 15 a 5. Rimisurato: **4/8 = 50%**, cioe' la stessa riuscita di prima ma partite diverse — 18.3 round medi contro 15.7, e il contatore dei tell che oscilla (5/4, 3/4, 1/4, 0/4) invece di salire dritto. La clessidra morde e non mura.
### N-89 · Ep. 15 — la cancellazione è scritta 1 tell/round in quattro punti e 2 per round nell'unico punto che decide la vittoria
**stato: chiusa** — «un tell per round» anche nel sesto punto, e `CANCELLA_PER_ROUND` del prefiltro portato da 2 a 1 (contraddiceva la docstring dello stesso file). **Le misure dell'Ep. 15 fatte col prefiltro sono da rifare.** · riferimenti: src/gen_ep15.py:687 («2 per round») contro :533, :362, :403, :565 e scripts/cardconjurer/cards-data.js:3706 (tutti «un tell per round»)

Il fascicolo di Spedizione, la nota d'arbitro di T4, la nota del boss, la pagina «nemici in campo» e la carta fisica del Capo dicono tutti «un tell per round»; la Soluzione — la pagina che stabilisce i numeri — dice «Da T4 gli Apparecchiatori ne cancellano 2 per round». Con 5 tell totali e 4 richiesti la differenza non è di sfumatura: a 2 per round bastano due round dopo T4 perché la Contro-busta diventi irraggiungibile, e le due carte che ne tolgono uno «in più» (`La Prova che Svanisce`, `Il Cordone si Stringe`, entrambe scritte «oltre a quello normale», al singolare) chiudono la finestra da sole. Terzo numero, di nuovo sulla soglia: la Contro-busta digitale si apre con «3-4 tell documentati» (webapp/data/ep15.json, D5) contro il 4+ di ogni altro punto. Non è decidibile da uno script perché sono tre formulazioni in prosa della stessa regola in tre file; va scelto un numero e portato in sei posti.

### N-90 · Ep. 13 — il registro autentico della Prefettura descrive C.B. come «un professore collezionista» da sessant'anni, e l'Ep. 15 scagiona Braga senza mai rispondere a quel documento
**stato: chiusa** — i sessant'anni diventano l'argomento invece del problema: un conto piu' vecchio di chiunque possa averlo aperto **e'** la prova che l'intestazione e' una maschera. Scritto nell'indizio, nel Referto e nella nota d'arbitro dell'Aggancio, e rispecchiato sulla carta e sul Reperto. Nessuna rivelazione anticipata. · riferimenti: src/gen_ep13.py:263-270 (L7, indizi 2 e 3), :796-798 (AGGANCIO) contro src/gen_ep15.py:160-165 (L3) e :256-262 (L7)

Il seme dell'Atto III è un registro pubblico, vero, non fabbricato, che il gruppo sequestra rischiando la pelle: e quel registro dice «sessant'anni di forniture allo stesso cliente storico, **un professore collezionista**, iniziali C.B.», col funzionario che rincara «nessuno ha mai chiesto perché **un professore di lettere** avesse bisogno di tanta carta di pregio», e l'AGGANCIO che traduce per il tavolo — «il rivale storico del vostro presidente». Due serate dopo l'Ep. 15 dimostra che tutto ciò che accusa Braga è stato stampato in una settimana («prodotta in una settimana», L7) e che «nessuno di loro è Braga» (L3): nessun luogo, nessun Approfondimento e nessuna nota d'arbitro tocca il registro dei noli, che è vecchio di sessant'anni e non lo si può aver falsificato. Un tavolo attento esce dall'Ep. 15 con la prova migliore ancora puntata su Braga, e con l'unica lettura che concilia le due cose — che il conto sia una maschera intestata a un professore, come «La Quiete S.A.» — scritta da nessuna parte, benché l'Ep. 13 abbia già il Referto giusto in cui dirlo (L2, la specie delle maschere di carta). Nota separata sulla stessa riga: sessant'anni sono anche un'età che nessun personaggio vivente della campagna può avere, e N-57 ha deliberatamente lasciato le quattro occorrenze «carta» a sessanta mentre portava tutto il resto a trenta.

### N-91 · Ep. 15 — due Domande su quattro sono già scritte nella lettera d'incarico, e con esse lo Slancio: N-25 aveva misurato solo la D1
**stato: chiusa** — lettera d'incarico ripulita delle due risposte (il nome di Braga e il fascicolo al Tribunale), con la reticenza che diventa caratterizzazione di M. E la D1 non stampa piu' il nome dell'accusato: «DOVE sono le prove contro l'accusato?» su fascicolo e dati digitali — il nome rientrava dalla scheda di lavoro dopo essere stato tolto dalla busta. · riferimenti: src/gen_ep15.py:72-87 (LETTERA_15) contro :654-657 (D2) e :663-665 (D4)

La lettera nomina «il caso contro il professor **Cesare Braga**» e la D2 chiede «CHI accusa il dossier?» — risposta: «Il professor Cesare Braga»; la lettera ordina «Verificate e chiudete entro stanotte: all'alba il **fascicolo** passa al Tribunale» e la D4 chiede «COSA consegnate alla Gendarmeria?» — risposta: «Il fascicolo che chiude il caso pubblico». Sono due risposte al 100% dal briefing, e la D1 ne ha ancora metà («alla Gendarmeria»), cioè la parte che N-25 ha chiuso come «Ep. 15 ridotta» senza dare un numero. Il conto che pesa è lo Slancio, che richiede tutte e quattro esatte e 3+ ore avanzate: in questo episodio le quattro esatte sono quasi gratis, quindi lo Slancio — il vantaggio d'Indagine più forte — dipende di fatto dalla sola economia delle ore. Sull'unico ramo del Bivio dell'Ep. 14 che nomina la villa («il suo avvocato chiede che la villa sia sigillata subito», gen_ep15.py:632-635, applicato PRIMA della lettera) anche la seconda metà della D1 arriva dal briefing. La proposta di N-25 per questo caso era esplicita e non è stata eseguita: se la lettera DEVE nominare la Gendarmeria, allora la D1 va spostata su ciò che il briefing non può sapere.

### N-92 · Ep. 13 — la Soluzione indica come seconda conferma della D1 un luogo che si apre solo con la risposta alla D1
**stato: chiusa** — tracciate le dipendenze reali fra i nove luoghi e le quattro Domande: le due conferme della D1 sono il Fermo-Posta L3 e la Dogana L4, aperti dall'inizio. Il Deposito delle Risme e' dichiarato NON valido come conferma, perche' si apre pronunciando la risposta stessa. Verificato che ogni Domanda chiude entro le 6 ore senza dipendere da un luogo chiuso. · riferimenti: src/gen_ep13.py:710-711 contro :285-289 (L8, chiave «IL MOLINO FUORI PORTA») e il commento di progetto a :94-96

La nota d'arbitro dice: «Al Molino delle Carte, due ore fuori città (le bolle alla Dogana + il deposito risme: serve più di una conferma)». La Dogana (L4) è aperta, il Deposito delle Risme (L8) no: si apre pronunciando «il molino fuori porta», che è la risposta alla D1. Il commento di progetto in testa a LUOGHI_13 dichiara tutt'altra coppia, corretta e tutta su luoghi aperti — «il molino fuori porta» (L3+L4) — quindi la doppia via esiste, ma chi arbitra legge l'altra. Effetto pratico: un tavolo che ha incrociato Fermo-Posta e Dogana ha la conferma doppia che il fascicolo pretende, e l'arbitro che segue la Soluzione alla lettera gliela nega. Costa la sostituzione di due parole nella nota.

### N-93 · Ep. 13 — il rogo è un orologio assoluto, ma la tessera che lo introduce dice che parte quando il Notaio dà l'ordine: chi arriva tardi vede bruciare prima dell'incendio
**stato: chiusa** — letta l'implementazione (`rogoBrucia()` confronta il round, non le tessere rivelate): l'orologio assoluto e' la versione vera, la tessera mentiva. T4 riscritta come constatazione — l'ordine «l'ha gia' dato» — e dichiarato in Soluzione che il rogo non e' legato ne' al Canto ne' alla comparsa del Notaio. · riferimenti: src/gen_ep13.py:378-387 (T4) contro :748-754 (schedule) e webapp/public/js/digitale.js:1243-1246

T4 fa leggere ad alta voce: «appare IL NOTAIO… dà l'ordine di dar fuoco ai registri e si avvia alla carrozza. **Da ora** l'orologio del ROGO corre». La tabella però conta round assoluti dall'inizio della Spedizione (T5 al 7, T6 al 9) e l'app li applica sul solo `sp.round`, senza guardare se T4 sia stata rivelata: un gruppo che si attarda alla roggia o alle macine vede l'essiccatoio prendere fuoco al round 7 mentre il Notaio non è ancora comparso a ordinarlo, e lo vedrà comparire dopo per ordinare un incendio già in corso. Con la D3 esatta la finestra si allarga (T5 al 9) e il caso si dirada, ma è proprio il gruppo in difficoltà — quello lento, senza Taccuino — a incontrarlo. Uscite: legare la prima soglia alla rivelazione di T4 («al round successivo alla comparsa del Notaio»), oppure riscrivere T4 come constatazione («l'ordine è già stato dato: dai magazzini sale fumo»), che costa una riga e non tocca i numeri.

### N-94 · Ep. 15 — il falso finale non ha una fase di seduzione: nessuno dei nove luoghi porta un solo argomento a favore della colpevolezza di Braga
**stato: chiusa** — il falso finale ha di nuovo una fase di seduzione: quattro prove a carico (i pagamenti verificati dalla Gendarmeria stessa L1, il movente a verbale di trent'anni L2, il gesto che nessuno poteva insegnare al teste L4, la perizia calligrafica firmata L6), ciascuna ribaltata una a una dalla Contro-busta. Il filo: «sono state scelte le abitudini di un uomo che le tiene esposte — non era il piu' colpevole, era il piu' facile da scrivere». Rispecchiato sulle quattro carte, che portavano ancora la versione che pre-annulla l'accusa. Nessuna frase-conclusione reintrodotta. · riferimenti: src/gen_ep15.py:97-117 (L1), 122-141 (L2), 146-165 (L3), 170-187 (L4), 222-238 (L6), 245-262 (L7), 269-288 (L8)

Distinta da N-02, che chiede un playtest cieco sulla tenuta a tavolo del depistaggio Braga: qui il conto è testuale e si fa a tavolino. Il primo indizio del primo luogo aperto già accoppia l'accusa al dubbio («Mai visto un caso così pulito» → il Referto: «è proprio questo il problema»); L2 dice che l'ha scritto chi il metodo lo *insegna*, L3 che «nessuna di loro è Braga», L4 che il teste è istruito, L6 che qualcuno di fuori dalla Gendarmeria ha orchestrato le voci, L7 che il dossier è nato archiviato, L8 che le prove sono state stampate e pagate «in oro d'antica fusione e carta col giglio — la firma di sempre», cioè da C.B. in persona. Zero carte a carico, nove a discarico, e la stessa D3 della Busta *pubblica* ha come risposta ufficiale «il dossier segue il metodo della Società (la copia n. 7 consultata)»: chi risponde correttamente alle quattro Domande pubbliche ha già in mano il perimetro della Contro-busta, e il «rifiuto della soluzione servita» smette di essere una scelta perché non c'è nessuna soluzione servita che qualcuno possa voler accettare. La tentazione dell'arresto facile va rimessa da qualche parte — un luogo che regga davvero l'accusa, o la pressione che oggi è solo dichiarata (la città, il Tribunale, M. che chiede di chiudere) portata dentro le carte lette ad alta voce.

### N-95 · I tre ammicchi a M. che l'Ep. 16 ha tolto sono ancora stampati, parola per parola, sulle carte che il tavolo legge
**stato: chiusa** — i tre ammicchi tolti anche dalle cinque carte (L3 testo e Osservazione, L5 Presagio, L7 testo e Osservazione), a lunghezza di carta e allineati al testo del fascicolo. · riferimenti: scripts/cardconjurer/cards-data.js:3737, 3740, 3755, 3768, 3771

N-30 e chiusa con «tolti tre dei quattro ammicchi» e cita solo gen_ep16.py. Le carte fisiche li hanno tutti e tre, identici alla versione cancellata: la carta Luogo 3 chiude su «perche la Societa si abbassa a un caso cosi piccolo?» e la sua Osservazione su «perche M. vi manda a caccia di un topo, quando cacciate lupi da sedici mesi?»; il Presagio del Luogo 5 su «il vero lupo — quello che sapeva del nastro verde — vi guarda da casa vostra, e sorride del vostro riposo»; la carta Luogo 7 e la sua Osservazione su «un altro modo per non guardare la vera domanda, che non riguarda lo Sposo ma chi vi ha mandato a prenderlo». Osservazioni e Presagi sono testo letto ad alta voce: al tavolo l'episodio ammicca esattamente le volte di prima, e il fascicolo che dovrebbe farlo respirare non lo legge nessuno durante il gioco. Non e la deriva generica di N-09 (lunghezza diversa): sono le frasi che la chiusura ha deciso di eliminare, sopravvissute nel gemello. Costo: quattro tagli in un file solo, gli stessi gia fatti in gen_ep16.py.

### N-96 · La carta dell'Archivio delle Lettere dice ancora che si rileggono «le vostre» lettere conservate — la frase esatta che N-64 ha sostituito con le minute di M.
**stato: chiusa** — la carta del Luogo 6 porta ora le minute di M., «compresa la prima, quella che vi ordino' di bruciare». · riferimenti: scripts/cardconjurer/cards-data.js:3760 contro src/gen_ep16.py:222-223

N-64 e chiusa spostando la RILETTURA sulle MINUTE di M. («non le vostre copie, le sue minute — compresa la prima, quella che vi ordino di bruciare»), proprio per riparare la scena in cui il gruppo torna a prendere una lettera che il Preludio gli ha ordinato di bruciare. La carta Luogo 6 porta ancora la formulazione vecchia, citata alla lettera nel corpo di N-64: «Il Taccuino e le vecchie lettere d'incarico di M., conservate una a una». E la carta e il testo che il gruppo ha in mano quando entra nell'archivio: la riparazione, al tavolo, non si vede. Una riga.

### N-97 · Il tetto di 3 alla RILETTURA non e arrivato sulle tre superfici che non sono il fascicolo: carta, obiettivo digitale e Domanda 4 digitale la danno ancora illimitata
**stato: chiusa** — «al massimo 3» aggiunto sulle tre superfici: carta Referto «La firma nelle lettere» (che perde anche il numero d'episodio letto ad alta voce), obiettivo digitale dell'Ep. 16, esatta della Domanda 4 digitale. · riferimenti: scripts/cardconjurer/cards-data.js:3763 / webapp/export-data.py:659 e :1339 (webapp/data/ep16.json)

N-54 dichiara la RILETTURA «cappata a 3 in cinque punti dell'Ep. 16» e i cinque punti in gen_ep16.py ci sono davvero (lettera, taccuino, riga Oggetto del Luogo 6, Soluzione, Frammento). Fuori dal fascicolo il tetto non esiste: il Referto stampato «La firma nelle lettere» chiude con «(RILETTURA: ogni lettera vecchia riletta banca un incrocio per l'Ep. 18.)», l'obiettivo dell'Ep. 16 in modalita digitale dice «ogni rilettura banca un incrocio per la deduzione finale (Ep.18)» e la risposta alla Domanda 4 digitale ripete «banca incroci per l'Ep.18» senza numero. E la stessa contabilita che N-54 aveva deciso in favore dell'Ep. 18, e proprio nei punti che il tavolo legge senza aprire il fascicolo dell'arbitro. Tre volte «, al massimo 3».

### N-98 · L'Esame di Carbone «LA RILETTURA DELLE VECCHIE LETTERE» resta orfano: non esiste oggetto ne reperto da portare al banco, e in digitale non e raggiungibile per costruzione
**stato: chiusa** — l'Esame di Carbone ha un pezzo d'ingresso: `('Oggetto', 'Il Mazzo delle Minute', ...)`, come fanno gli altri due esami dell'episodio. Scelto Oggetto e non Reperto perche' `luogo_json` esporta le etichette Oggetto da solo, quindi il digitale si ripara senza toccare `export-data.py`. Carta fisica creata (il check `test-engine.mjs` la pretendeva e falliva). · riferimenti: src/gen_ep16.py:963 e :870 / webapp/public/js/indagine.js:746-752 / webapp/data/ep16.json (esami_carbone)

La nota a margine di N-54 segnalava l'esame orfano e la chiusura non l'ha toccata. La riga «Rilettura» del Luogo 6 e una riga di sola regola (gen_narrator.oggetto_righe la stampa senza carta, perche il campo nome e vuoto), quindi al banco di Fulgenzio non si puo portare niente che vi corrisponda; in digitale esameCarbone accoppia il nome scelto con le chiavi confrontando oggetti e reperti posseduti, e l'unico match possibile al Luogo 6 e «Reperto A - Lettera d'Incarico», che pesca l'altro esame. Risultato: l'unica voce d'esame di tutta la campagna che non si puo mai leggere, ed e quella che spiega la meccanica di campagna. Due strade: dare un oggetto vero alla Rilettura (una carta «Il Mazzo delle Minute») oppure fondere il testo dentro l'esame della Lettera d'Incarico e togliere la voce.

### N-99 · In modalita digitale la Domanda 4 dell'Ep. 18 e ancora un whodunit: «LA RIVELAZIONE... il volto del mostro», e chi sbaglia «non ha un caso»
**stato: chiusa** — la D4 digitale riscritta how-to-prove («non chiede di trovarlo — lo avete davanti — chiede di poterlo dire ad alta voce e reggere»), con la scala completa 5+/3-4/0-2, l'elenco chiuso degli incroci e il refuso «col la» sistemato. La risposta sbagliata non incolpa piu' il tavolo di non aver indovinato. · riferimenti: webapp/export-data.py:701 (→ webapp/data/ep18.json, soluzione.domande[3])

Il riorientamento a how-to-prove ha investito gen_ep18.py da cima a fondo (lettera, taccuino, titolo di pagina, nota d'arbitro, D4: «Non e una rivelazione: e una firma... non chiede di trovarlo, chiede di poterlo dire ad alta voce»). Il testo che la webapp mostra al posto di quella pagina non e stato toccato: «LA RIVELAZIONE. Non un vantaggio meccanico: il volto del mostro», e per la risposta sbagliata «Senza la deduzione, non c'e caso: e la soluzione che vi ha scritto M.» — cioe la sorpresa, e la colpa di non averla indovinata. D1, D2 e D3 digitali sono allineate: solo la Domanda che porta tutto il peso e rimasta indietro. Le Domande dell'Ep. 18 non vivono in gen_ep18.py ma in webapp/export-data.py (SOLUZIONI), ed e la ragione per cui la riscrittura non ci e passata: vale la pena annotarlo come quarta superficie da toccare a ogni riscrittura di Domande. Nella stessa riga c'e anche un refuso, «uscite col la prova FORTE».

### N-100 · «Il massimo che la campagna puo produrre e 7, non c'e altra fonte» — e poi tre superfici contano fra le fonti anche i verbali, la matrice e i bonus di apertura
**stato: chiusa** — seconda meta' eseguita. Il bonus di Domanda si chiama ora **conferma** in tutti e dodici i punti della campagna (`gen_ep7,8,11,12,13,14,15,17,18`), «incrocio» resta la sola moneta di campagna, e la pagina della scala dell'Ep. 18 le distingue una volta per tutte: «un incrocio e' la moneta di campagna che si somma in questa scala; una conferma e' il vantaggio su una singola Domanda — nel conto qui sopra non entra». Verificato nel PDF renderizzato. Un tavolo che legge in fila apertura e scala non arriva piu' a 8 dove il massimo e' 7. — meta' eseguita: la carta «Gli Incroci di Campagna» e la Domanda 4 digitale portano ora l'elenco chiuso (4 dai Bivi + 3 dalle riletture, massimo 7) e la scala completa. **Resta** la seconda meta', la piu' pesante: «incrocio» nomina due valute diverse in undici file (`gen_ep5,7,8,9,10,11,12,13,14,15,16,17,18`, `gen_docs`), e il bonus di Domanda va rinominato **conferma** in tutti. E' una passata lessicale di campagna: va fatta in un colpo solo, quando nessun agente tiene quei file. · riferimenti: src/gen_ep18.py:717-733 contro scripts/cardconjurer/cards-data.js:4364, webapp/export-data.py:701, src/gen_ep18.py:652-666

La pagina della scala chiude l'elenco: 4 dai Bivi (9, 12, 14, 16) piu 3 dalle riletture, «e non c'e altra fonte — i verbali e la matrice servono le Domande, non il conto». Ma la carta Oggetto «Gli Incroci di Campagna», che il tavolo ha in mano mentre conta, elenca «bivi, verbali, riletture (Ep. 16), matrice (Ep. 17)», e la D4 digitale ripete la stessa quaterna. Peggio: il conto si fa «una volta sola, all'apertura», e l'apertura dell'Ep. 18 e proprio il punto in cui il Bivio dell'Ep. 17 assegna «un incrocio in piu alla Domanda 3» o «alla Domanda 1». La parola «incrocio» indica due valute diverse — la moneta di campagna che si somma fino a 7 e la conferma in piu su una singola Domanda — e nessuna pagina lo dice: un tavolo che legge in fila apertura e scala arriva a 8 e sballa la soglia che decide la vittoria piena. Non e decidibile da uno script perche le due valute hanno lo stesso nome. Proposta: chiamare «conferma» il bonus di Domanda (in tutti gli episodi, ma qui e urgente) e allineare la carta e la riga digitale all'elenco chiuso.

### N-101 · La banda 3-4 della scala degli Incroci sparisce nei due punti in cui si assegna la vittoria, e il 5+ con un eroe arrestato ha due esiti diversi in due pagine
**stato: chiusa** — la stessa tabella, identica, nei tre punti che assegnano la vittoria: 5+ forte, 3-4 sufficiente (piena solo senza eroi arrestati), 0-2 debole. La banda 3-4 — l'esito piu' probabile — era assente da due dei tre. · riferimenti: src/gen_ep18.py:407-411 (T6, nota d'arbitro) e :763-768 (Soluzione, «Vittoria») contro :734-741 (la scala)

La scala ha tre gradini — 5+ forte, 3-4 sufficiente (piena solo se nessun eroe e stato arrestato), 0-2 debole. La nota d'arbitro di T6, che e quella letta al momento di chiudere la spedizione, ne conosce due: «prova FORTE (5 o piu) = piena. Con la prova debole (0-2), o con eroi arrestati = parziale». Un gruppo a 3-4 con tutti gli eroi liberi — l'esito piu probabile per un tavolo normale — non e previsto ne li ne nel riepilogo Spedizione della Soluzione, che ripete la stessa dicotomia. In piu i due testi non concordano sul 5+: la scala dice piena e basta, il riepilogo aggiunge «e tutti gli eroi liberi». Sono tre formulazioni della stessa tabella scritte in tre momenti diversi; a decidere e sempre l'ultima che si legge. Costo: una tabella sola, ripetuta identica nei tre punti.

### N-102 · Ep. 16, la stanza di Nina ha tre mobili e la nota d'arbitro dice ancora «l'unico mobile della stanza» — la ricerca appena riparata torna a un candidato solo
**stato: chiusa** — contati i mobili nel codice (`arredi`: casse, armadio, toeletta = tre) e allineata la nota: «uno dei tre mobili». La ricerca torna ad avere tre candidati. · riferimenti: src/gen_ep16.py:390 (e :396-400 con il commento della correzione) / webapp/data/ep16.json, tessera T6

La correzione recente ha aggiunto armadio e toeletta perche «il testo promette "non sapete da sotto quale" e la ricerca aveva un candidato solo, cioe nessuna». Sei righe sopra gli arredi, la stessa nota d'arbitro conserva la parentesi vecchia: «SEGRETO: e dietro le CASSE accanto al letto (l'unico mobile della stanza)». Chi arbitra legge quella riga e sa — anzi, gli viene detto — che di mobili ce n'e uno: la prova VIGORE sull'arredo giusto diventa di nuovo automatica, e l'unico momento di ricerca della serata sparisce. La riga e esportata identica anche in ep16.json, quindi il difetto e in entrambe le modalita. Cancellare cinque parole.

### N-103 · L'undicesimo ritratto e pagato con un'allusione: la tessera dice «capite finalmente», ma nessuna pagina dice di chi sia il volto nella cornice nera
**stato: chiusa** — contati ritratti e posti vuoti: **un** ritratto mancante, **due** posti vuoti. Il volto e' quello di M. — «il Machiavelli» e' il soprannome che si e' dato, quindi «il ritratto del Machiavelli» *era gia'* il suo su ogni pagina esistente. Il conto torna: il consiglio e' da dove l'ha tolto, il corridoio e' dove non e' ancora arrivato (il nome si incide quando un presidente e' passato, e lui e' in carica). Detto una volta sola, in T2, dov'e' la promessa «capite finalmente». · riferimenti: src/gen_ep18.py:349-357 (T2) contro :204-207 e :858-869 (Luogo 5) e src/gen_preludio.py:124, :209-210

N-24 e chiusa cosi: in fuga il gruppo passa davanti alla cornice vuota e «capisce dov'e finito l'undicesimo ritratto — e stato spostato, in una cornice nera senza targhetta, dove lo guarda un uomo solo». L'unica cornice nera senza targhetta della campagna e quella dello studio di M., e ogni altra pagina la descrive come «il ritratto del Machiavelli» (indizio del Luogo 5, descrizione del Luogo 5, descrizione di T4, Presagio «Le due maschere allo specchio»). Quindi o il ritratto del Machiavelli e il presidente rimosso — lettura bellissima e mai scritta — oppure la tessera indica un oggetto che il resto dell'episodio dice essere un altro. In piu ora i posti vuoti sono due per un ritratto solo: il gancio nella sala del consiglio (Preludio) e la cornice vuota in fondo al corridoio dei presidenti (T2), e il testo li spiega l'uno con l'altra senza dire perche siano due. Non e decidibile da uno script: va scelto chi era l'undicesimo e detto una volta, in una subordinata del Presagio del Luogo 5 o nell'epilogo. Finche non lo si dice, la promessa piu vecchia della campagna viene riscossa con un «capite finalmente» che non contiene la risposta.

### N-104 · Nella fuga dell'Ep. 18 due carte Minaccia citano il manifesto con la vostra faccia, che secondo l'Aggancio dello stesso episodio esce all'alba, ore dopo
**stato: chiusa** — i due flavor spostati prima del manifesto: «quelli che accusa il presidente!» e «la vostra faccia, e per la prima volta vi sembra colpevole». · riferimenti: scripts/cardconjurer/cards-data.js:4294 e :4318 contro src/gen_ep18.py:790-791

La spedizione e la notte stessa dell'assemblea, e la ragione per cui i gendarmi arrivano e detta al Luogo 9: «M. ha girato le accuse su di voi». Il manifesto «RICERCATI» arriva dopo, ed e l'Aggancio all'Atto IV: «All'alba, un manifesto in ogni piazza. Ma non e la faccia di M.: e la vostra.» Ma la carta spawn «Chi Vi Riconosce» fa dire a un brigadiere «sono loro, quelli del manifesto!» e l'insidia «Lo Specchio del Corridoio» fa vedere agli eroi «la vostra faccia — quella del manifesto». Sono flavor letti ad alta voce, e bruciano di qualche ora il colpo finale dell'atto: il tavolo arriva all'Aggancio avendo gia sentito due volte che i manifesti ci sono. Nessuno script confronta l'orologio di una carta Minaccia con quello di un epilogo. Costo: due flavor («sono loro, quelli che accusa il presidente!», «la vostra faccia, e per la prima volta vi sembra colpevole»).

### N-105 · Il taccuino dell'Ep. 18 e l'unico dell'Atto III senza le caselle dei luoghi visitati e delle cariche d'abilita — e la sua Soluzione ne chiede il conto
**stato: chiusa** — `contatori_indagine` chiamato anche negli Ep. 18, 19 e 20, e **verificato nel PDF** (estrazione testo: Indagine.pdf p.2 di tutti e tre, come nell'Ep. 17). L'Ep. 18 stampa ora le soglie del Vantaggio d'Indagine per esteso invece di «come sempre». · riferimenti: src/gen_ep18.py:482-518 (nessuna chiamata a contatori_indagine) e :715 contro src/deluxe_style.py:244-273

contatori_indagine e stampato sul taccuino di sedici episodi (Preludio-Ep. 17); Ep. 18, 19 e 20 non lo chiamano. Sono le due caselle nate apposta perche l'arbitro non tenesse i conti a mente: i nove luoghi visitati — da cui dipende il gradino «Preparati» — e le cariche d'abilita, una per eroe per episodio. E l'Ep. 18 la Soluzione chiude con «Vantaggio d'Indagine: come sempre», unico episodio a non stampare le soglie, mentre la pagina su cui il tavolo dovrebbe segnarle e vuota: c'e spazio (le 4 Domande finiscono molto sopra gli 80 mm da cui il blocco parte). Una riga di codice per file, piu le soglie scritte per esteso come negli altri diciassette. Non e materia da script perche l'audit controlla le regole, non cosa e disegnato sul foglio — lo si vede solo guardando il PDF.

### N-106 · La parola che apre l'Archivio delle Lettere e stampata in grassetto nella lettera d'incarico: il luogo che «apre solo a chi ha notato la crepa» e aperto dal minuto zero
**stato: chiusa** — tolto il colore dalla lettera («la piccola col nastro al polso»), lasciato l'incarico. La serratura non cambia: la parola resta IL NASTRO VERDE e si guadagna al Luogo 1, aperto dall'inizio, che la dice tre volte. Allineati i cinque punti del fascicolo, la carta Oggetto e il commento delle chiavi, cosi' la prossima riscrittura non rimette «verde» nella busta. · riferimenti: src/gen_ep16.py:75 e :212-215 / webapp/public/js/indagine.js:257-277 (la parola si dichiara, non si deve aver trovata)

Il Luogo 6 si apre con «IL NASTRO VERDE», e la lettera letta ad alta voce prima della prima ora dice «la piccola col nastro verde al polso», in grassetto. Al tavolo come in digitale la parola si dichiara e basta: nessuno verifica dove l'abbiate presa. Quindi il luogo che regge la RILETTURA, il Reperto A e la D4 si puo aprire alle 18:00 senza essere passati dal lampionaio, e il suo requisito («apre solo a chi ha notato la crepa») e un merito che nessuno deve guadagnare; peggio, chi ci va per primo legge «impossibile — eppure eccolo» senza sapere ancora che il nastro era un segreto. Misurato sul resto della campagna: la stessa cosa succede all'Ep. 7 (L6 «LA CALCE NUOVA»), Ep. 15 (L6 «IL TESTIMONE OCULARE»), Ep. 17 (L6 e L9 «LA CACCIA ALLA TALPA», L7 e L8 «IL DOSSIER CIFRATO») ed Ep. 20 (L7 e L8 «IL CONTROCANTO», L9 «LA VIA DELLE TRE ACQUE») — nove serrature su cinque episodi. Non e un refuso, e una convenzione mai decisa: o le parole-chiave non stanno mai nella lettera (e allora qui basta togliere «verde», che l'indizio 2 del Luogo 1 restituisce subito), o si accetta e i requisiti smettono di promettere un merito. Distinta da N-25, che misurava le risposte alla D1 e non le chiavi.

### N-107 · Nel simulatore dell'Ep. 18 il commento dice che l'Uscita di Servizio abbassa la soglia-arresto a 5; il codice la alza a 8 e il fascicolo pure
**stato: chiusa** — commento allineato al codice e al fascicolo: «(8 con l'Uscita di Servizio)». · riferimenti: scripts/simulate_ep18.py:53 contro :336 e src/gen_ep18.py:753-755

`SOGLIA_ARRESTO = 7 # Canto oltre cui i gendarmi sigillano (5 con l'Uscita di Servizio)`, mentre la riga che conta fa `SOGLIA_ARRESTO + (1 if uscita else 0)` e il fascicolo dice «soglia-arresto = Canto 7 (8 con l'Uscita di Servizio)». Il comportamento misurato e giusto: sbagliato e il commento, cioe l'unica cosa che legge chi tara la leva. Su una leva gia ritoccata una volta (da 4 a 7, su 600 partite) un commento che dice il contrario del codice e la prossima taratura sbagliata. Una parola.

### N-108 · In modalita' digitale il pannello della porta chiusa stampava la parola d'ordine: 36 serrature su 90 erano aperte dal minuto zero
**stato: chiusa** — eseguita nella stessa tornata (vedi corpo). · riferimenti: webapp/public/js/indagine.js:232 (ora requisitoSenzaChiave)

N-106 ha tolto la chiave dalla lettera d'incarico dell'Ep. 16, ma e' il caso particolare di una falla generale. Il campo `requisito` di ogni luogo bloccato e' prosa d'arbitro e contiene spessissimo la parola d'ordine alla lettera («l'archivio delle lettere apre solo a chi ha notato la crepa: IL NASTRO VERDE che il presidente sapeva prima di tutti»). Al tavolo l'arbitro lo legge e non lo dice; in digitale il pannello `bussare` lo stampava intero a chi bussa. Misurato: 36 serrature a parola su 90, cioe' il 40% delle porte chiuse della campagna, si aprivano leggendo la porta. Chiuse: la webapp ora cancella la chiave dal requisito prima di mostrarlo (e riassorbe l'articolo e la preposizione articolata rimasti orfani, «la faccenda del….» -> «la faccenda …»). Verificato su tutti e novanta i luoghi: zero parole servite, zero resti ruvidi. La modalita' tavolo non e' toccata. Conseguenza da non dimenticare: le misure di bilanciamento fatte col pilota Playwright su quei cinque episodi sono ottimistiche, perche' il pilota entrava gratis.

### N-109 · Ep. 13 — la partenza del rogo ha una terza versione in T6, dove divampa quando strappate i registri
**stato: chiusa** — i tre punti dicono ora che quella di T6 e' una **vampata, non l'accensione**: «il fuoco che gia' corre trova gli stracci», e la Soluzione lo dichiara esplicitamente («l'orologio del rogo corre dal 1o round comunque»). Coerente con N-93, che ha stabilito l'orologio assoluto leggendo `rogoBrucia()`. · riferimenti: src/gen_ep13.py:551-553 e la tessera T6

N-93 ha stabilito che il rogo e' un orologio assoluto (parte dal 1o round, `rogoBrucia()` confronta il round e non le tessere rivelate) e ha riscritto T4 come constatazione. Resta un terzo punto che racconta una partenza diversa: «nell'istante in cui li avete, il molino divampa». Le due cose possono convivere — l'incendio e' gia' in corso, e strappare i registri e' la vampata che fa fuggire gli sgherri — ma sono tre formulazioni della stessa partenza scritte in tre momenti, ed e' la specie di divergenza che a due riscritture di distanza diventa una regola inventata al tavolo. Va deciso se e' la stessa fiammata o un evento suo, e detto una volta sola.

### N-110 · Sei correzioni di regola hanno spostato i numeri: tutta la mappa pilota e' da rimisurare
**stato: aperta** · riferimenti: project_mappa_pilota, scripts/simulate_ep15.py, scripts/simulate_ep20.py, webapp/public/js/indagine.js

La tornata dell'08-09/08 ha cambiato il comportamento misurato, non solo il testo. (1) N-87: la trasferta fuori citta' costa 2 ore anche in digitale — l'Ep. 13 e l'Ep. 17 erano misurati con un'ora di troppo in mano. (2) La falla del requisito: 36 serrature su 90 si aprivano leggendo la porta, quindi il pilota entrava gratis in cinque episodi. (3) N-72: il ritmo del controcanto ha un pavimento a 1 — l'Ep. 20 era misurato piu' duro del vero. (4) N-73: il rito continua col coro anche a M. abbattuto — l'Ep. 20 era misurato piu' facile del vero. (5) N-89: `CANCELLA_PER_ROUND` dell'Ep. 15 da 2 a 1. (6) N-04 e N-41, gia' segnalate. Le prime due tirano in una direzione e le altre in quella opposta, quindi non si puo' nemmeno stimare il segno: **le percentuali di vittoria di tutti gli episodi vanno rifatte col pilota Playwright**, non col prefiltro. E' la conseguenza aperta piu' pesante del lavoro fatto.


**Avanzamento (09/08).** Ep. 15 rimisurato dopo la clessidra: 4/8 = 50%, round medi 18.3 (vedi [[N-88]]). Ep. 20 misurato 2/8 = 25%, ma il numero non vale: la webapp modella il finale in un altro modo (vedi [[N-111]]). **Restringimento utile:** il pilota non gioca l'Indagine, la simula come esito — quindi la trasferta da 2 ore e le 36 serrature che si aprivano da sole **non** hanno falsato le percentuali di Spedizione gia' in mappa. Restano da rifare solo gli episodi il cui *combattimento* e' cambiato, non tutti e ventuno.
### N-111 · Il finale e' due giochi diversi: al tavolo il controcanto e' un ritmo per round, in digitale e' un compito per azione
**stato: chiusa** — il digitale gioca ora il finale stampato. `ritmo` nei dati e `avanzaRitmo()` a fine round: 1 riga + 1 ogni 6 Frammenti conservati e non incrinati, +1 con la Mappa Acustica, -1 per ogni nemico nella camera, mai sotto 1, e non costa azioni — come al tavolo, si spendono a spezzare il coro. `pressione` e `avanzaPressione()` per l'altra meta': il Dormiente si desta ogni round, e il rito accelera finche' ha una voce. I Frammenti, che prima erano astratti nel tier d'Indagine e non pesavano nulla, sono ora l'ingresso di campagna del finale (`partita.frammenti`, default 12 nei dati). Dodici asserzioni nuove in `test-digitale.mjs`, **provate non vacue** su cinque guasti finti. Le due modalita' ora concordano — e concordano su una sconfitta: vedi [[N-112]]. · riferimenti: webapp/data/ep20.json (compiti.controcanto, per_azione) contro src/gen_ep20.py (ritmo per round)

N-72 e N-73 hanno riscritto il cuore del finale: il controcanto avanza di «1 riga + 1 ogni 6 Frammenti conservati e non incrinati», ogni impiegato del coro in campo toglie una riga, il ritmo non scende mai sotto 1, e il rito accelera il risveglio finche' ha una voce (M. in piedi oppure un impiegato che canta al posto suo). Sono state applicate al fascicolo e al simulatore Python. La webapp non le conosce: modella il controcanto come un compito da 10 con `per_azione` legato al tier d'Indagine (1 / 2 / 4 righe per azione riuscita, prova di NERVI Media), e il coro non lo rallenta. Sono due giochi diversi sotto lo stesso nome: al tavolo si spezza il coro per liberare il canto, in digitale si tirano dadi finche' bastano. Misurato col pilota dopo le correzioni: 2/8 = 25%, round medi 12.0, e due partite su otto non raggiungono nemmeno la camera — ma quel numero non e' una misura del finale stampato, e' la misura di un altro finale. Va deciso quale dei due e' il finale vero, e allineato l'altro; finche' non lo si fa, l'Ep. 20 non e' misurabile.

### N-112 · Allineato il finale, si scopre che non si vince: 1% al tavolo, 0% in digitale, e il conto non torna di due round
**stato: aperta** · riferimenti: src/gen_ep20.py (ritmo e pressione), scripts/simulate_ep20.py, webapp/data/ep20.json

Chiusa N-111 (il digitale ora gioca il finale stampato: ritmo del controcanto dai Frammenti, coro che rallenta, pavimento 1, Dormiente che si desta ogni round, rito che canta finche' ha una voce), le due modalita' concordano — e concordano su una sconfitta. Simulatore da tavolo, 5 party x 30 seed: **1% vittorie a 4 eroi, 99% risveglio, controcanto fermo a 4,9 righe su 10**, Canto finale 8,8. Pilota Playwright, 10 partite per livello di Frammenti: **0% a 6, a 12 e a 18 Frammenti**, con la camera raggiunta in 10 casi su 10. L'aritmetica, dai numeri misurati. Il gruppo entra nella camera al round ~9,8 **col Canto gia' a 5,5 su 8** (il tick ogni 6 round vale 1: il resto sono i crescendo pescati nella discesa T1-T5). Nella camera la pressione stampata e' +1 (il Dormiente si desta) +1 (il rito ha una voce) = **+2 per round**: restano un round e mezzo. Il controcanto, col miglior caso misurato (18 Frammenti, Mappa Acustica, un solo del coro in campo) canta 1+3+1-1 = **4 righe per round**, e per dieci righe ne servono tre. Mancano due round, e non li si trova dentro la camera: si perdono nella discesa. Non e' una taratura da ritoccare a occhio, e non l'ho toccata. Le tre leve, e cio' che costano: 1. **La discesa costa troppo Canto.** E' la causa misurata (5,5 su 8 spesi prima di cominciare la scena). La leva indicata dal progetto stesso e' `canto_ogni`, gia' a 6 — ma il grosso viene dai crescendo del mazzo Minaccia, non dal tick. 2. **La soglia-risveglio a 8.** Un commento in `export-data.py` la dichiara gia' riportata a 8 dopo un tentativo fuori scala, e 8 e' il numero di segnalini in scatola: e' un vincolo fisico, non un numero libero. 3. **Le dieci righe di controcanto.** Abbassarle e' la strada piu' corta e la piu' brutta: il dieci e' la misura del rito. Da guardare per prima: quanto Canto costa davvero la discesa, cioe' quanti crescendo pesca un gruppo fra T1 e T5. Se sono tre o quattro, il finale non ha budget e nessuna regola della camera lo puo' salvare. Nota: la pressione della camera e' anche conseguenza di N-73 (il rito continua col coro anche a M. abbattuto). Quella correzione ha chiuso un exploit reale — il controcanto non costa azioni, quindi tutte le azioni erano libere per abbattere M. e poi aspettare — ma non era stata misurata, e va contata fra le cause.

---


**Misurata la discesa (09/08, `webapp/misura-discesa-ep20.mjs`, 3000 repliche).** La domanda era: il
finale ha un budget di Canto? No, e si sa esattamente dove finisce.

In 10 round di discesa — il round medio in cui il pilota entra in T6 e' 9,8 — il gruppo arriva alla
camera con **5,6 Canto su 8**. Il modello combacia col gioco vero (il pilota ne misura 5,5), quindi la
scomposizione e' attendibile:

| voce | Canto |
|---|---|
| Crescendo pescati | **4,6** |
| tick di fine round (`canto_ogni` = 6) | 1,0 |

**Il tick vale 1 su 5,6.** La leva indicata dal commento in `export-data.py` — «se serve davvero piu'
finestra la leva e' `canto_ogni`» — non puo' risolvere niente: portarla da 6 a 12 recupera **un solo
segnalino**. E' la leva sbagliata, e va corretto quel commento.

La causa vera e' la lunghezza della discesa combinata con la densita' del mazzo. Quattro Crescendo su
21 carte, ma in 10 round se ne pescano **24,2**: il mazzo si rimescola e i quattro Crescendo tornano
piu' di una volta a testa. E il meccanismo si autoalimenta — superata la soglia 3 si pesca una carta
in piu' per round, quindi piu' Crescendo, quindi la soglia arriva prima.

La curva sulla lunghezza della discesa e' netta:

| round per raggiungere la camera | Canto all'ingresso | arriva con 2 o meno di margine | gia' al risveglio |
|---|---|---|---|
| 6 | 3,3 | 0% | 0% |
| 8 | 4,3 | 0% | 0% |
| **10 (quello vero)** | **5,6** | **49%** | 1% |
| 12 | 7,5 | 100% | 60% |

A 8 round il finale ha respiro; a 10 meta' dei tavoli entra con due segnalini in mano; a 12 e' gia'
finito. **La domanda di progetto non e' quanto costa la camera, e' perche' servono dieci round per
attraversare cinque tessere.** E' materia di geometria e movimento, cioe' l'unica cosa su cui i
simulatori Python sono ciechi e il pilota no.

Ne segue che le tre leve elencate sopra vanno riordinate: la (1) e' l'unica viva, ma non nella forma
in cui l'avevo scritta — non «la discesa costa troppo Canto» in astratto, bensi' **la discesa e'
troppo lunga, oppure il mazzo restituisce i Crescendo troppe volte**. La (2) e la (3) restano quello
che erano: un vincolo fisico e una resa.

**Dove si perdono i dieci round (09/08, `webapp/misura-cammino-ep20.mjs`).** Non in combattimento: in
geometria. Un eroe solo, campo sgombro, mai una sosta, che scende scegliendo sempre la mossa che
avvicina, entra nella camera al **round 9** — due round esatti per tessera, cinque tessere. Il pilota
ne misura 9,8: **l'attrito di una partita vera vale 0,8 round su dieci.**

La causa e' una regola del motore, non una scelta dell'episodio: `esploraMosse` non espande oltre una
casella che rivela una tessera coperta, quindi **entrare in una tessera nuova chiude il movimento del
round**. Un round per entrare, uno per attraversare, per ciascuna delle cinque tessere. Alleggerire il
mazzo o evitare i combattimenti non accorcia la discesa di un round.

**Cosa sposta davvero il conto** (9 round di discesa, 4 eroi, 4000 repliche):

| variante | Canto all'ingresso | margine | round di canto disponibili |
|---|---|---|---|
| come e' adesso | 5,0 | 3,0 | **1,5** |
| 3 Crescendo invece di 4 | 3,8 | 4,2 | 2,1 |
| **2 Crescendo invece di 4** | **2,7** | 5,3 | **2,6** |
| i Crescendo non tornano (niente rimescolo) | 4,9 | 3,1 | 1,6 |
| la soglia non accelera la pesca | 4,4 | 3,6 | 1,8 |

Il rimescolo non c'entra (4,9 contro 5,0): a contare e' la densita'. L'accelerazione della soglia vale
0,6. **La sola leva grossa e' quanti Crescendo stanno nel mazzo.**

**Ma non basta, e va detto.** Il controcanto chiede 10 righe. Il ritmo di un gruppo tipico (12
Frammenti, Mappa Acustica, un solo del coro rimasto in camera) e' 3 righe per round: servono 4 round.
Anche dimezzando i Crescendo il margine ne concede 2,6. Il conto torna solo se **si somma una seconda
cosa**, e le candidate misurate sono due:

- **sgomberare la camera.** Senza nemici dentro, il rito perde la voce: la pressione scende da +2 a +1
  per round e i round disponibili raddoppiano. E' la vittoria che l'episodio descrive («va spezzato il
  coro, non l'uomo»), e il canto non costa azioni proprio per lasciarle tutte al coro. Nelle dieci
  partite del pilota il gruppo non ci e' mai riuscito: c'e' sempre stato «1 in T6». Da capire se e'
  incapacita' del pilota o se quattro eroi contro cinque Sgherri non ce la fanno in due round.
- **accorciare la discesa.** Cinque tessere a due round l'una sono dieci round. Con tre tessere sono
  sei, e il Canto all'ingresso scende a ~3,3 (misurato). Costa una riscrittura della plancia.

Quello che **non** e' una leva, e va tolto dall'elenco: `canto_ogni` (vale 1 su 5), il rimescolo del
mazzo (0,1), e la soglia-risveglio a 8 (vincolo fisico: 8 sono i segnalini in scatola).

**Rallentare il Canto dentro la camera: la leva che non avevo provato, ed era quella giusta**
(09/08, `webapp/misura-corsa-ep20.mjs`, modello dell'intera corsa discesa+camera, 8000 repliche,
validato sul pilota — coi valori di oggi da' 0%, come le dieci partite vere).

Le due misure precedenti guardavano solo il lato discesa. Dentro la camera si spendono **+2 Canto per
round su un budget di 8**, e li avevo trattati come intoccabili perche' stampati. Provati, cambiano
tutto — e si scopre che il gioco quella leva **ce l'ha gia'**, ed e' sgomberare la camera: senza
nemici dentro il rito perde la voce e la pressione scende da +2 a +1.

Vittorie in funzione di quanti impiegati del coro restano nella camera:

| Frammenti | 0 dentro | 1 | 2 | 3 |
|---|---|---|---|---|
| 0 | 0% | 0% | 0% | 0% |
| 6 | 0% | 0% | 0% | 0% |
| 12 | **52%** | **0%** | 0% | 0% |
| 18 | **99%** | **0%** | 0% | 0% |

**Un solo impiegato in piedi nella camera porta il finale da 52% a 0%**, e nessuna quantita' di
Frammenti lo compensa. Il motivo e' che quella miniatura fa due mestieri opposti sui due contatori:
toglie **una riga per round** al controcanto *e* da' **+1 Canto per round** al rito. Su un ritmo tipico
di 3 righe e un budget di 3 round, vale uno scarto di due righe per round: e' l'intera partita.

Questo riscrive la diagnosi che avevo dato ieri. **Non e' un finale rotto: e' un finale che si gioca
su una condizione sola, e in modo binario.** L'episodio dice la cosa giusta — «va spezzato il coro,
non l'uomo» — e il canto non costa azioni proprio per lasciarle tutte al coro. Ma non c'e' una via di
mezzo: sgomberato = si vince, un rimasto = si perde.

Le altre leve, misurate nello stesso modello, e nessuna basta da sola:

| leva | vittorie |
|---|---|
| come e' adesso (12 Frammenti, 1 impiegato) | 0% |
| il Dormiente si desta a round alterni | 0% |
| 2 Crescendo nel mazzo invece di 4 | 0% |
| 3 tessere di discesa invece di 5 | 0% |
| 4 tessere invece di 5 | 0% |
| 2 Crescendo **+** Dormiente a round alterni | 63% |
| 2 Crescendo **+** camera sgomberata | 100% |

Da notare che **accorciare la discesa da solo non serve**, e non e' intuitivo: i round guadagnati se li
mangia la pressione della camera, che continua a costare +2. Era la mia raccomandazione di ieri, ed
era sbagliata.

**La domanda di progetto, adesso.** Quattro eroi contro cinque Sgherri: riescono a sgomberare la camera
nei due round che hanno? Il pilota non ci e' mai riuscito in dieci partite. Se la risposta e' no, la
scelta non e' fra le leve qui sopra ma piu' a monte: o il coro nella camera e' meno numeroso, o
l'impiegato non fa due mestieri contemporaneamente (toglie una riga **oppure** da' voce al rito, non
entrambe). La seconda e' la correzione piu' piccola e toglie il gradino.

**Il coro si riempie da solo: la misura precedente era ottimista** (09/08, modello esteso, 8000
repliche). Sette carte su ventuno **piazzano** un impiegato, «sull'ingresso della tessera» o
«sull'uscita piu' vicina»: se il gruppo e' nella camera, dentro la camera. E l'ordine del round e'
**eroi -> Minaccia -> nemici -> controllo del ritmo**: gli eroi sgomberano, il mazzo riempie, e *poi*
si conta chi c'e'. La camera vuota al momento del controllo e' un'eventualita', non uno stato che si
possa tenere.

Corretta l'assunzione (il coro entra ed esce davvero; lo Sgherro ha Dif 8 e «si rompe a meta' Ferite»,
quindi un colpo a segno lo toglie: 72% per eroe), la tabella cambia e il finale smette di essere
binario:

| variante | vittorie |
|---|---|
| **come e' adesso** | **6%** |
| il Dormiente si desta a round alterni | 20% |
| il rito non accelera (solo il Dormiente) | 20% |
| il Dormiente non si desta (solo il rito) | 34% |
| 3 Crescendo invece di 4 | 22% |
| 2 Crescendo invece di 4 | 37% |
| 4 tessere di discesa invece di 5 | 12% |
| 3 tessere invece di 5 | 39% |
| **l'impiegato rallenta il canto ma non da' voce al rito** | **22%** |
| l'impiegato da' voce al rito ma non rallenta il canto | 6% |
| gli impiegati non vengono piazzati dentro la camera | 50% |

**Va corretto anche cio' che avevo scritto sopra:** «camera sgomberata = 52%» valeva col coro
congelato a zero, che non e' uno stato raggiungibile. Col mazzo che riempie, quella riga vale 6%.

**La correzione consigliata resta la stessa, e ora si vede perche'.** Togliere all'impiegato uno dei
due mestieri — resta il −1 riga, sparisce la voce al rito — porta il finale da 6% a 22%, ma soprattutto
**restituisce una curva dove c'era un gradino**:

| Frammenti conservati e non incrinati | vittorie |
|---|---|
| 6 | 0% |
| 12 | 22% |
| 18 | 50% |

E' l'unica variante provata in cui venti serate di raccolta si vedono nel risultato in modo graduale,
che e' esattamente cio' che i Frammenti dovrebbero fare. Le altre leve alzano la percentuale ma
lasciano il finale indifferente a come e' andata la campagna.

**Limiti del modello, dichiarati.** Muove solo i due contatori: ignora ferite, movimento e eroi che
vanno a terra, e per questo e' generoso — da' 6% dove il pilota ne misura 0. Ci si puo' fidare
dell'**ordine** delle leve, non dei valori assoluti. Qualunque variante si scelga va poi rimisurata
col pilota, che il combattimento lo gioca davvero.
## Chiuse in questa tornata

| id | cosa | come |
|---|---|---|
| N-10 | Ep. 16, la Soluzione mandava a un luogo «entro le 18» chiuso alle 21 | `gen_ep16.py` |
| N-11 | l'Ep. 1 non applicava il Bivio del Preludio | banner in `gen_docs.py` |
| N-12 | il Frammento 14 affermava ciò che l'Ep. 14 smonta | riscritto |
| N-13 | il Frammento 19 ripeteva l'Ep. 6 | riscritto sul «cosa si dà in cambio» |
| N-14 | la lettera dell'Ep. 15 mandava M. contro i propri uomini | riscritta |
| N-15 | «la candidata» del finale non esisteva | è la signora Vetri |
| N-16 | quattro Anselmo, due Bruna, due Tobia | Amedeo · Nina · Egidio Neri |
| N-17 | Ep. 4: la gala sembrava un evento futuro | «stasera, sabato» + 9 allineamenti |
| N-18 | Ep. 10: la lettera regalava la risposta alla Domanda 2 | nome tolto |

---

## Come ci si scrive dentro

Una voce nuova la aggiunge chi la trova — anche un agente, durante il loop —
in coda alla sezione «Aperte», con questo scheletro:

```markdown
### N-nn · titolo in una riga
**stato: aperta** · riferimenti: <file:riga o codice d'audit>

Che cosa non torna, e perché non è decidibile automaticamente.
Se c'è una proposta, dirla; se costa una decisione, dire quale.
```

Prima di aggiungere, **cercare** se l'anomalia c'è già: il registro si sporca
in fretta se ogni giro riscrive le stesse voci con parole diverse.
