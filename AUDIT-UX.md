# Audit di usabilità e di esperienza

**24/09/2026.** Non è una lettura del codice: è una serata percorsa. Con
Playwright su un **iPad** (820×1180, lo schermo di chi arbitra) e su un
**telefono** (390×844, quello di chi gioca), con il Worker locale e il database
vero, ho fatto quello che fa un gruppo nuovo: primo accesso, un tavolo, la
compagnia, un invito; il telefono dell'invitata; il Preludio dalla scelta del
caso alla lettera, lo stradario, una pista fredda, un luogo aperto, il menu, il
taccuino con le Domande e la busta; la Spedizione dell'Ep.1 dall'ingresso alla
plancia, una mossa e un tiro; l'epilogo con la crescita e il Bivio. Circa
cinquanta schermate guardate una per una, più tre misure (bersagli tattili,
contrasto, peso delle pagine) e la lettura dei punti in cui l'app parla di rete
e di errori.

Ogni voce dice **dove**, **cosa succede al tavolo** e **un rimedio**. Gli id
(`U-nn`) sono stabili. In fondo: cosa funziona e va tenuto, e cosa non ho visto.

---

## In breve

L'app è **bella e, dove racconta, funziona benissimo**: la lettera d'incarico,
la scena di un luogo, il pannello dei dadi e il menu sono di livello alto.
I problemi stanno quasi tutti **ai margini della finzione**: nelle schermate di
servizio (tavoli, compagnia), nelle decisioni irreversibili, nei momenti in cui
la rete cede, e nel primo contatto di un gruppo nuovo. Cinque voci costano la
serata o la fiducia di chi gioca (§1); le altre rallentano o confondono (§2) o
sono rifinitura (§3).

---

## 1. Priorità alta — costano la serata o la fiducia

### U-01 · «Rompete il sigillo» è il bottone più in vista, e nessuno controlla le risposte

`js/indagine.js` — il taccuino con le Domande (menu → *taccuino e domande*)

Sotto le Domande ci sono due bottoni: **«salvate e tornate in strada»**, scuro,
e **«rompete il sigillo»**, pieno, color lume — lo stile che nel resto dell'app
vuol dire «è questa l'azione giusta». Ma è l'unica azione **irreversibile**
dell'Indagine: chiude la notte per sempre e decide il vantaggio in Spedizione.
La conferma che segue («La busta si apre una volta sola…») non guarda le
risposte: **si rompe il sigillo con le caselle vuote** senza che nessuno lo
faccia notare.

Al tavolo: chi arbitra entra nel taccuino per rileggere una Domanda, vede il
bottone acceso, lo tocca pensando di andare avanti. Una serata intera finisce
con due risposte in bianco.

**Rimedio:** «salvate e tornate in strada» diventa il bottone pieno, il sigillo
un bottone normale; e se una risposta è vuota la conferma lo dice — «La Domanda 2
non ha risposta: la busta si apre lo stesso?».

### U-02 · L'invitata vede «elimina» sul tavolo di un altro, e poi le si dice che manca la rete

`js/tavoli.js:59` e `:109` · `worker/api.js:485`

Giulia, invitata al *Gruppo del giovedì*, apre l'app: vede lo stesso schermo di
chi arbitra — «nuovo tavolo», «rubrica» — e accanto al tavolo un bottone
**«elimina»**. Se lo tocca: «Eliminare «Gruppo del giovedì»? Non si torna
indietro.» → conferma → **«Non riesco a eliminare il tavolo: manca la rete.
Riprova.»**

Il server fa la cosa giusta (solo il proprietario cancella: risponde 404), ma
l'interfaccia offre un'azione che non esiste e poi dà la colpa alla rete, e Giulia
riprova. Intanto niente le dice la cosa che le serve: **toccare il tavolo per
entrare** (la riga non ha una freccia, né un «entra»).

**Rimedio:** «elimina» solo sui tavoli propri (per gli altri, se serve, «lascia
il tavolo»); un errore dal server non è «manca la rete» — distinguere il 404/403
dall'assenza di linea; sulla riga del tavolo un invito visibile («entra →»).

### U-03 · «I dadi si tirano sullo schermo» — ma si tirano sul tavolo

`js/digitale.js:276-278`, la prima schermata di ogni Spedizione

> Tutta la spedizione è qui: muovete gli eroi a caselle […]. **I dadi si tirano
> sullo schermo.**

Al primo tiro l'app chiede invece «tirate i 2d6 veri — quanto fanno, senza
bonus?» con una tastiera da 2 a 12 (`modoDadi = () => 'tavolo'`). È la prima
cosa che la Spedizione dice di sé, ed è sbagliata: il gruppo non prepara i dadi,
e al primo tiro si ferma a cercarli.

**Rimedio:** «I dadi sono i vostri: l'app vi chiede il totale (e se non li
avete, li tira lei).»

### U-04 · Quando il filo cade, o la sessione scade, lo schermo tace

`js/canale.js:48` · `js/indagine.js:910` · `js/digitale.js:251` · `js/sync.js:84`

Il canale del tavolo si riconnette da solo (bene), e il suo commento promette di
«dire com'è messo: un'app che tace mentre è scollegata fa credere che il gioco
sia rotto». Ma chi ascolta `onStato` si limita a una variabile: **nessuna spia a
schermo**. Chi gioca lo scopre solo toccando un bottone («Un momento: mi sto
ricollegando al tavolo»); chi arbitra continua in locale senza saperlo.

Peggio quando la **sessione d'accesso scade** a metà serata: il WebSocket
viene respinto e ritenta ogni 15 secondi **per sempre**, e il telefono continua
a dire «mi sto ricollegando». «Sessione scaduta, ricaricate» esiste
(`sync.js:84`), ma compare **solo nella home**, dove durante una partita non si
passa. Secondo `HANDOFF.md` («Quello che resta», punto 1) la sessione è ancora
a **24 ore**: una serata iniziata alle 21 del giorno dopo il login può saltare a
metà. Da verificare sulla dashboard.

**Rimedio:** una spia fissa nella testata di gioco (collegato · ricollegamento ·
sessione scaduta → «ricaricate»), e sessione di Access a un mese (applicazione
**e** criterio).

### U-05 · Il bottone più grande della prima schermata è «esci»

`js/tavoli.js` — «chi gioca stasera?»

Al primo accesso lo schermo mostra il titolo, l'email e poi un bottone **largo
quanto lo schermo: «esci»**, sopra «nuovo tavolo». Uscire da Cloudflare Access
vuol dire rifare il login con il codice via email. È l'elemento più grande e il
primo che il pollice incontra; «nuovo tavolo», l'azione per cui si è lì, è più
piccolo e più in basso.

**Rimedio:** «esci» piccolo e in fondo (o accanto all'email, come link).

---

## 2. Priorità media — rallentano o confondono

### U-06 · Da dove si comincia? La home non lo dice, e le copertine si ripetono

`js/main.js` (`vistaHome`, `COPERTINE`)

Le 21 stampe hanno lo stesso peso. Un gruppo nuovo non sa che il **Preludio è il
tutorial** (dice solo «preludio»); un gruppo a metà campagna non vede **qual è
il prossimo caso** (ci sono solo i bolli «vinta» e «in corso»). E sette casi
condividono una copertina con altri: la **stessa casa sull'acqua** per Ep.3, 13,
17 e 20; le **stesse poltrone** per Preludio, Ep.12 e 18; lo stesso archivio
per Ep.7 e 19; lo stesso ufficio per Ep.9 e 15. Per riconoscere un caso bisogna
leggere, e i titoli sono in maiuscoletto da 11-12px.

Sul lato del gioco da tavolo: il Regolamento è di **14 pagine, ~6.800 parole**,
e l'app non insegna niente di suo — si affida al Preludio, che però non si
presenta come tale.

**Rimedio:** sulla stampa del Preludio «cominciate da qui»; sulla prima non
conclusa «il prossimo caso»; una copertina per caso (anche un dettaglio diverso
della stessa arte).

### U-07 · Nell'epilogo il Bivio sta sotto 44 bottoni tutti uguali

`js/digitale.js` (epilogo) · `js/crescita-scelta.js`

L'ordine dell'epilogo è: testo letto a voce → Frammento → **crescita** (per ogni
eroe, 11 Migliorie: con quattro eroi sono **44 pillole identiche**) → **Bivio**.
Il Bivio è la decisione narrativa della serata, quella da prendere insieme; la
crescita è contabilità da fare ciascuno per conto suo. Su iPad il Bivio arriva
dopo due schermate e mezzo di bottoni.

E le pillole dicono solo nome e prezzo («mano ferma · 1», «passo felpato · 1»):
cosa fa una Miglioria si scopre toccandola, una alla volta.

**Rimedio:** prima il Bivio, poi la crescita; la crescita chiusa per eroe
(«Elena — 1 punto da spendere ›»), e ogni voce con la sua riga d'effetto.

### U-08 · La plancia sul telefono: una mappa piccola, e le istruzioni sotto la piega

`js/digitale.js` (plancia), `app.css`

Su un telefono la mappa è larga **circa 200 punti** e sopra resta un grande
riquadro vuoto (la tessera non ancora rivelata); i bottoni dello zoom ne
occupano un terzo. Le istruzioni («Toccate una casella verde…») e i bottoni
dell'eroe («cercare», «ha finito») sono **sotto la piega**: si tocca una casella
in alto, si scorre per leggere cosa succede, si risale per la mossa dopo.

Le **pedine** sono ritratti rotondi senza nome: a quella misura Elena, Nino e
Mora sono tre dischi teal e arancio quasi uguali.

**Rimedio:** sul telefono, azioni dell'eroe attivo in una barra fissa in basso;
la mappa centrata su quel che è rivelato; sulle pedine l'iniziale o il nome.
(Su iPad la mappa sta bene, ma occupa un riquadro piccolo in mezzo a molto nero:
vale la stessa centratura.)

### U-09 · La compagnia dice «tocca per aggiungere», ma il tocco apre la scheda

`js/membri.js:88`

> Tocca un ritratto per aggiungerlo o toglierlo — si salva da sé.

Il tocco apre la scheda dell'eroe, e serve un secondo tocco per aggiungerlo. La
schermata gemella della partita lo dice giusto («Toccate un ritratto per leggere
chi è — e decidere se arruolarlo»). Chi si fida della frase tocca, vede la
scheda, e pensa di aver sbagliato.

**Rimedio:** la frase della schermata gemella.

### U-10 · Compagnia: due bottoni principali in fondo, e un link scritto a mano

`js/membri.js`

In fondo alla schermata ci sono **due bottoni color lume**: «in rubrica, e al
tavolo» e «salva il tavolo». Non si capisce quale chiude il lavoro. E il link da
mandare agli invitati è mostrato **nel corsivo a mano** dei campi di carta: un
indirizzo web in grafia è difficile da leggere e da controllare.

**Rimedio:** un solo bottone pieno («salva il tavolo»); il link in carattere
tondo, col bottone «copia» accanto.

### U-11 · La home pesa 12,9 MB su un telefono

misurato (`_ux-4-peso.mjs`, rimosso a fine audit)

Home sul telefono: **83 richieste, 12,9 MB, di cui 10,6 MB di immagini**. Ogni
copertina è un **PNG da ~800 KB** a 900 px, mostrato a **153×201 punti**. In 4G
al tavolo sono dieci-trenta secondi di schermo che si riempie a pezzi, e il
traffico di chi gioca col proprio telefono.

**Rimedio:** copertine e arti di luogo in JPG/WebP a ~400 px per le stampe
(l'arte grande solo nella scheda e nella scena), `loading="lazy"` sotto la
piega.

### U-12 · Ricordare cosa si è appena fatto

`js/indagine.js`

- La **pista fredda** non nomina il luogo: titolo «PISTA FREDDA», poi «Il
  portone è sprangato…». Dopo tre dichiarazioni a vuoto non si sa più quale
  porta fosse. **Rimedio:** il nome del luogo nel titolo.
- La **lettera** dice quali luoghi sono aperti dall'inizio («il Palazzo del
  Lume, la Taverna della Chiatta e il Banco dei Pegni di Fossa»); nello
  stradario quei tre non si distinguono dagli altri undici, e per ricordarli
  bisogna riaprire la lettera dal menu. Fa parte del gioco non dire cosa c'è
  dietro una porta; non dire quello che la lettera ha già detto no.
  **Rimedio:** nello stradario un segno discreto sui luoghi che la lettera
  nomina.

### U-13 · Chi arbitra è un indirizzo email

`js/mio-eroe.js` — «Tavolo di **arbitro@esempio.it**, che arbitra.» Anche nella
lista «chi gioca a questo tavolo» chi ha creato il tavolo compare con l'email
grezza, mentre gli invitati hanno il nome. Al tavolo ci si chiama per nome.
**Rimedio:** un nome anche per chi crea il tavolo (chiesto alla creazione).

### U-14 · «(vedi Soluzione)» a metà Spedizione

`ep1.json`, prima stanza (T1) — «La porta sul retro ha un lucchetto a tre cifre
(**vedi Soluzione**).» Nel gioco a schermo la Soluzione è una busta dell'app,
e la frase rimanda al fascicolo stampato. **Rimedio:** nel testo digitale, dire
dove si trova (o farlo dire all'app quando si interagisce col lucchetto).

---

## 3. Rifinitura

### U-15 · Il bottone dei suoni

`#suoni`: un glifo **«♪̸»** (nota con barra combinata) che su iPad appare come
«♪/», largo **30 px** — sotto i 44 di un bersaglio per dito. Non dice se il suono è
acceso o spento. Sotto i 44 ci sono anche i **nomi degli eroi nella «salute
degli eroi»** della Spedizione (aprono la scheda: 24 px d'altezza).
**Rimedio:** icona da sprite (altoparlante / altoparlante barrato), 44×44; i
nomi della salute alti almeno 44.

### U-16 · Testate

- In Indagine il titolo del caso compare due volte («LA PROVA DEL LUME ·
  INDAGINE» e sotto «La Prova del Lume»).
- In Spedizione, sul telefono, «TUTTO A SCHERMO · ROUND 1 · CANTO 0» va a capo
  su due righe: «tutto a schermo» è il nome di una modalità, non un'informazione
  per chi gioca.

### U-17 · Contrasto e corpi piccoli

Misurati sui token di `app.css`: testo su lastra **15,9:1**, note **9,3:1**,
lume **10,9:1** — ottimi. Due eccezioni: il **rosso dei nemici** sulla mappa
(`--segnale-nemico` #a3253a) è **2,5:1** sul fondo, sotto il 3:1 che serve a un
elemento grafico da riconoscere al volo; le note attenuate (opacità .6) scendono
a **4,0:1**. E una quindicina di regole usano **11-12 px** (la spia di
sincronia, i bottoni piccoli della home, le statistiche sotto i ritratti, le
etichette delle tessere): a un braccio di distanza, su un iPad appoggiato sul
tavolo, non si leggono.

### U-18 · La scena di un luogo, su un telefono

Il Palazzo del Lume sul telefono è lungo **quasi tre schermate**; la descrizione
è un solo blocco di corsivo di ~180 parole prima degli indizi. Su iPad regge;
sul telefono di chi gioca, l'arte da sola occupa metà del primo schermo.
**Rimedio:** sul telefono arte più bassa e descrizione in capoversi.

---

## 4. Cosa funziona, e va tenuto

- **La lettera d'incarico**: grafia grande, «da leggere ad alta voce», le
  informazioni di gioco (ore, luoghi) staccate in fondo in tondo.
- **La scena di un luogo**: indizi separati e marcati, oggetti come bottoni,
  le quattro strade d'Approfondimento con chi della squadra può tentarle e
  perché no («nessuno in squadra»).
- **Il pannello dei dadi**: chi tira, cosa, la soglia («da 9»), il totale dei
  dadi veri con una tastiera 2-12, e «niente dadi? tira l'app».
- **Il menu**: raggruppato per chi lo usa (il gruppo · chi conduce · la
  serata), con i contatori a destra.
- **Le conferme dentro il gioco** (`chiedi.js`) invece dei popup del browser.
- **La pista fredda** che dice «Nessuna ora spesa»: la regola è nella scena.
- **La scheda dell'eroe**: statistiche leggibili, biografia, abilità, cosa ha
  in tasca, un bottone solo.
- **Bersagli tattili**: a parte `#suoni` e i nomi della salute (U-15), tutti
  ≥ 44 px.

## 5. Cosa non ho visto

- **Nessuna serata vera**: nessun gruppo di persone, nessun rumore, nessun
  tempo reale. L'audit dice cosa l'interfaccia fa, non come la vive un tavolo;
  alcune voci (U-07, U-08) meritano di essere confermate giocando.
- **Solo Chromium**, non Safari su un iPad vero (il `HANDOFF` segnala il rischio
  del login in modalità Home su iOS).
- **La nebbia di sfondo** non c'era: le librerie esterne (`fetch_vendor.sh`)
  sono bloccate in questo ambiente. Le schermate sono senza la sua animazione.
- **Non percorsi**: il turno dei nemici e le carte Minaccia, la fine di una
  Spedizione giocata davvero, la rubrica e la porta, la sessione che scade
  (U-04 è letto nel codice, non provato), più dispositivi insieme sulla stessa
  serata.
- **Il login** (Cloudflare Access con codice via email): fuori dall'app, non
  provato.
