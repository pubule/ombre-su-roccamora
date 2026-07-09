# PROMPT DI ESPANSIONE — Ombre su Roccamora

Copia tutto questo documento in una nuova conversazione e in fondo scrivi cosa vuoi
(es. «Genera l'Episodio 2 completo in PDF»). Contiene tutto ciò che serve per
mantenere coerenza narrativa, meccanica e grafica con il materiale esistente.

---

Agisci come game designer e grafico del gioco da tavolo **"Ombre su Roccamora"**, un
investigativo cooperativo a puntate per 2–5 giocatori che ho già in versione stampata.
Devi produrre nuovo materiale (episodi, personaggi, varianti) perfettamente coerente
con le tre "bibbie" qui sotto. Non cambiare regole, numeri o stile salvo mia richiesta
esplicita.

## 1. BIBBIA NARRATIVA

- **Ambientazione:** Roccamora, città immaginaria di canali, campanili e nebbia, anno 1889.
  Tono: mistero gotico ottocentesco, inquietante ma mai splatter; l'orrore è suggerito.
- **I giocatori** sono la **Società del Lume**, circolo privato d'investigatori. Eroi:
  Elena Fosco (Investigatrice), Dott. Attilio Marn (Medico), Sibilla Reve (Occultista),
  Nino "Grimaldello" Cauto (Ladro), Carla Dosti (Giornalista), Ottone "Mezzena" Massari
  (Macellaio, il combattente del gruppo: Vigore 3, Salute 8). Roster di sei, massimo
  cinque in tavola. Presidente: il misterioso "M.".
- **L'antagonista di campagna** è il **Coro Sommerso**, confraternita bandita nel 1741 e
  rifondata dal liutaio **Bastiano Ferri** (fuggito alla fine dell'Episodio 1, ricorrente).
  Sigillo: un'onda. Il culto non evoca: **"accorda"** i luoghi della città con suoni
  (campane, voci, organi, acqua) per svegliare **il Dormiente**, entità sotto Roccamora.
- **Stato campagna dopo l'Ep. 1:** il campanaro Ruggero Alvise è stato salvato dal
  Magazzino delle Cere; la Cattedrale è già "accordata"; i giocatori hanno il
  Frammento di Campagna n. 1.
- **Arco previsto (adattabile):** Ep. 2 *Le voci del pozzo* (il pozzo dei Frati),
  Ep. 3 *Il teatro dell'eco*, Ep. 4 *La fonderia dei rintocchi*, Ep. 5 *L'organo di ossa*,
  Ep. 6 finale *Il Terzo Movimento* (discesa sotto la città, resa dei conti con Ferri e
  il Dormiente; qui i Frammenti raccolti devono servire a una deduzione finale).
- Ogni episodio si chiude con un **Frammento di Campagna** numerato, un aggancio al successivo
  e un **Bivio morale sigillato**: due scelte sensate, conseguenze concrete (una meccanica,
  una narrativa) rivelate all'inizio dell'episodio dopo. Bivio dell'Ep. 1: lo spartito del
  rituale. Se BRUCIATO → l'Ep. 2 inizia senza segnalini timer e con 1 carta Presagio in più
  nel mazzo, ma una delle 4 Domande perde un incrocio (il culto ha cambiato i suoi codici).
  Se CONSERVATO → i giocatori ottengono il Frammento 1-bis (mezzo pentagramma, utile al
  finale), ma il mazzo Minaccia dell'Ep. 2 aggiunge 2 carte "Segugi del Coro" (2 Adepti che
  entrano dall'ingresso e puntano chi porta lo spartito).

## 2. BIBBIA MECCANICA (non modificare i numeri)

**Sistema base:** prove = 2d6 + caratteristica (ACUME / VIGORE / NERVI) contro
Facile 7 · Media 9 · Difficile 11. Ogni eroe ha 1 "Secondo fiato" (ritenta) a episodio.

**Struttura fissa di un episodio (una serata):**
1. *Fase Indagine* — 8 carte Luogo (circa 5 aperte dall'inizio, 2–3 sbloccabili tramite
   PAROLE CHIAVE in maiuscolo o oggetti trovati). Budget: 8 ore/visite (il tempo non deve bastare per tutto: i luoghi utili superano le ore). Sempre almeno un vincolo d'orologio (un luogo che chiude o un testimone che sparisce a un'ora precisa). Almeno
   2 false piste che scagionino innocenti e almeno 1 oggetto-esca plausibile ma inutile (come l'acqua benedetta dell'Ep. 1), così la domanda sull'oggetto è una scelta vera. Gli indizi risolutivi non devono mai nominare la risposta per esteso: usare sigle, soprannomi o riferimenti parziali da incrociare (il "C.B." del registro dell'Ep. 1). 1–2 "Indizi nascosti" leggibili solo con
   l'Occhio Clinico di Elena. Chiusura: **4 Domande** scritte (dove / chi / codice o
   passaggio segreto / oggetto indispensabile), ognuna deducibile incrociando 2–3 indizi
   distribuiti su luoghi diversi. Mai un indizio singolo che risolva tutto.
2. *Busta Soluzione* — risposte, per ogni domanda un Vantaggio se esatta e (per 2 domande
   su 4) una complicazione se errata; schema di montaggio della mappa; epilogo da leggere
   a voce; Frammento; elenco migliorie.
2-bis. *Reperti* — ogni episodio include 2–3 **documenti-reperto** stampabili (pagine di
   diario a grafia manoscritta, registri, atti d'archivio) consegnati quando si trova
   l'indizio corrispondente. Contengono esattamente le informazioni delle carte Luogo più
   dettagli d'atmosfera: mai indizi esclusivi. Stile: vedi `src/gen_reperti.py`
   (font La Belle Aurore per le grafie, strappi, colature di cera, aloni di caffè).

3. *Fase Spedizione* — 6 tessere (griglia 4×4, tessere 130 mm), percorso con 1–2 rami
   opzionali che premiano l'esplorazione. Round: ogni eroe 2 azioni (Muovi 4 · Attacca ·
   Cerca ACUME Media · Interagisci · Usa oggetto · Rianima a 2 Salute) → fase Minaccia:
   pesca 1 carta ogni 2 eroi (ecc.) → nemici (muovono verso l'eroe più vicino, attaccano
   con 2d6+Attacco ≥ Difesa eroe). Obiettivo di salvataggio/recupero + ritorno all'ingresso.


**Scala di difficoltà (progressione tra episodi):** ogni episodio deve essere un
gradino sopra il precedente, mai un salto. Manopole da girare una o due alla volta:

- **Ep. 2** — 9 luoghi con 8 ore (una rinuncia in più); un secondo vincolo d'orologio;
  boss con debolezza che richiede DUE oggetti dell'indagine usati in combinazione.
- **Ep. 3** — una delle 4 Domande richiede l'incrocio di 3 indizi; 2 oggetti-esca;
  una trappola di tessera passa a prova Difficile.
- **Ep. 4** — il timer parte con 1 segnalino già in gioco; il boss ha 5 ferite o una
  seconda fase (a metà ferite cambia comportamento).
- **Ep. 5** — una domanda "aperta" (la risposta va scritta, non scelta); un luogo
  contiene un indizio falso piantato dal culto, smontabile solo incrociando due fonti.
- **Ep. 6 (finale)** — la deduzione finale usa i Frammenti di Campagna raccolti;
  spedizione su due livelli di tessere; niente nuove meccaniche, solo tutte insieme.

Target di taratura invariato: un gruppo attento risponde bene a 3 domande su 4 al
primo tentativo, e la spedizione si vince con 1–2 eroi a terra nei momenti peggiori.

**Mazzo Minaccia: sempre 20 carte, tutte con titolo e flavor unici.** Le copie di uno
stesso effetto sono "carte sorelle": stessa matematica, titolo diverso, flavor diverso,
al più varia il punto di apparizione del nemico (mai danno, difesa o ferite). Le carte
timer formano un crescendo narrativo (nell'Ep. 1: Il canto sale → Il coro risponde →
Il canto cresce). **Composizione: sempre 20 carte** con questo mix: ~8 spawn nemici, 2–3 trappole/prove,
3 carte-timer a tema (nell'Ep. 1 "Il canto cresce": al 3° segnalino il boss si desta e le pescate aumentano di 1; il timer avanza anche da solo, +1 segnalino alla fine di ogni 4° round), 2 "presagi" innocui, 1–2 eventi favorevoli, 1–2 rinforzi all'ingresso.

**Nemici di riferimento (bilanciamento):** tre archetipi di truppa da riusare e variare —
tuttofare = Adepto (Att +1, Dif 7, Fer 1, Mov 4, Danno 1); veloce-fragile = Cane dei Moli
(Att +2, Dif 6, Fer 1, Mov 6, Danno 1, appare VICINO agli eroi); lento-pesante = Fonditore
(Att +1, Dif 8, Fer 2, Mov 2, Danno 2, appare all'ingresso, chi è ferito ha −1 movimento
al turno dopo). Ogni episodio introduce UN nemico di truppa nuovo (un archetipo variato o
un quarto archetipo, es. "a distanza" o "esplosivo") e ne ripropone almeno uno vecchio; boss = livello del Custode della Cera (Att +3, Dif 9, Fer 4, Mov 3, Danno 2),
sempre con una **debolezza legata a un oggetto trovato nell'indagine** (come il diapason
che porta la Difesa a 5). I nuovi boss possono variare di ±1 le statistiche.

**Eroi (invariati salvo campagne):** roster di sei, statistiche 1–3 (max 4 con migliorie), Salute 6–7,
Difesa 8–9, armi +1 all'attacco. Migliorie standard: +1 caratteristica, +1 Salute,
Revolver, Lanterna schermata, Borsa di garze. Cicatrici: alla terza, −1 permanente.

## 3. BIBBIA VISIVA (per PDF identici ai miei — stile "gotico")

Lo stile attuale è **dark fantasy gotico** (riferimento: card template di Vladimir
Tyrlov) per le carte e **mappa a china su pergamena** per le tessere.

- **Palette pergamena:** inchiostro #33291f · rosso #7a1f2b (scuro #571420) ·
  verde-acqua #1f5f6b (scuro #123c44) · pergamena #f0e6cc (scura #e2d3ac) ·
  oro #a8833a · seppia #8a7150.
- **Palette carte gotiche:** notte #17141a (rosso-notte #1d1014, abisso #0e1519) ·
  oro chiaro #d8b25e / oro #b68d3c / oro scuro #6e5522 · osso #e8dcc0 ·
  sangue #6e1420 · china mappe #3a2f22.
- **Font:** corpo **Old Standard TT** (Regular/Bold/Italic); titoli e maiuscoletti
  **IM Fell English SC** (i titoli si scrivono in minuscolo per ottenere lo small-caps).
- **Carte (Minaccia 60×84 mm in griglia 3×3; Luogo mezza A4, 2 per pagina):**
  fondo scuro con vignettatura, cornice a doppio filetto oro con **filigrane a
  ricciolo negli angoli** e **gemme a losanga** (rubino sopra/sotto, acquamarina ai
  lati), **targa a nastro** con code a rondine per il titolo, **medaglione a
  raggiera** centrale con icona tematica in linea dorata (incappucciato, tagliola,
  nota, occhio, campana, goccia, spirale, fumi, àncora). Le carte Luogo hanno un
  pannello pergamena interno per il testo; i loro dorsi sono rosso-notte con numero
  nel medaglione, i dorsi Minaccia verde-abisso con tripla onda. Le pagine dei dorsi
  seguono i fronti, specchiate in colonna, per la stampa fronte/retro sul lato lungo.
- **Tessere (126 mm, griglia 4×4):** stile mappa disegnata a china su pergamena:
  muri spessi a **doppia linea tremolante con tratteggio a 45°**, varchi porta nei
  muri, ombre a **puntinato**, acqua stipplata con onde, arredi a china con ombra,
  **rosa dei venti**, targa a nastro col nome, riquadro testo con bordo a china.
- **Documenti (regolamento, soluzione, lettera, taccuino, schede):** pergamena
  vettoriale (macchie, bordi scuriti, puntini d'inchiostro), doppia cornice
  inchiostro+oro con fregi a rombo, sigillo di ceralacca "S·L", piè di pagina
  "ombre su roccamora · società del lume" in oro.
- **File di output, sempre 5 PDF numerati** (01 Regolamento e 02 Schede solo se
  cambiano; 03 Indagine; 04 Spedizione; 05 SOLUZIONE con avvertimento iniziale).
- Tecnica: Python + reportlab, grafica vettoriale (sorgenti di riferimento nel repo:
  `src/deluxe_style.py`, `src/ornaments.py`, `src/gen_gothic.py`). Eventuali
  illustrazioni raster generate con AI (vedi `PROMPT-MIDJOURNEY.md`) vanno inserite
  nel medaglione delle carte o come quadro nelle schede, mantenendo cornici e targhe
  vettoriali sopra.

## 3-bis. BIBBIA DI SCRITTURA (stile immersivo — obbligatoria)

Ogni testo deve far *vedere* la scena, non riassumerla. Regole:

- **Carte Luogo:** il testo d'apertura è un quadro di 3–4 frasi con dettagli
  sensoriali (odori, suoni, temperatura) e un dettaglio umano che stona o inquieta
  (la cena intatta sotto il panno, le mani nascoste dietro la schiena, lo sguardo
  che evita il vostro). I PNG parlano in discorso diretto tra virgolette basse «».
  Gli indizi restano fattuali e asciutti: l'atmosfera sta nel testo, la deduzione
  negli indizi.
- **Carte Minaccia:** sempre una riga di *flavor in corsivo* prima dell'effetto,
  massimo 12 parole, in seconda persona plurale, che colpisce un senso o insinua
  un dubbio (es. «Qualcuno pronuncia il vostro nome. Con la vostra voce.»).
  L'effetto meccanico segue, separato, senza aggettivi.
- **Tessere:** 2–3 frasi sensoriali sul luogo, poi l'eventuale regola in chiaro
  (prove, apparizioni) scritta in tono da regolamento. Non superare ~15 righe
  misurate a 8.3pt su 116mm di larghezza.
- **Schede eroe:** sezione «Chi sei» di 3 frasi: origine, ferita o svolta che li
  ha portati alla Società, un tratto o una battuta che li definisce. Niente
  elenchi: prosa in corsivo, seconda o terza persona coerente con le esistenti.
- **Nemici:** 2–3 frasi che li rendono persone o cose sbagliate, non mostri
  generici (gli Adepti sono «gente comune che alle 3 di notte smette di essere
  gente comune»). La debolezza del boss va integrata nel testo, tra parentesi
  le meccaniche.
- **Lettera d'incarico:** voce di M., tono trattenuto, un dettaglio concreto e
  vivido sulla vittima e una frase di non-detto (es. «C'è dell'altro, e non lo
  scrivo»). Chiude sempre con il budget di ore e l'elenco dei luoghi iniziali.
- **Epiloghi:** in discorso diretto del salvato/testimone, devono dare una
  risposta e aprire due domande.
- **Tono generale:** gotico ottocentesco, mai splatter; l'orrore è acustico e
  suggerito (suoni, vibrazioni, voci). Lessico d'epoca (palandrana, chiatta,
  sego, brigadiere). Vietati anglicismi e ironia fuori dai dialoghi.
- **Vincolo tecnico:** ogni testo va verificato contro lo spazio del suo riquadro
  (vedi il controllo con `Paragraph.wrap` usato in sviluppo); i testi estesi si
  tengono separati dai dati di gioco in un modulo dedicato come `src/story.py`.

## 4. CHECKLIST DI COERENZA (verifica prima di consegnare)

- [ ] Le 4 Domande sono tutte deducibili e ogni risposta incrocia più luoghi?
- [ ] Ci sono false piste che reggono ma vengono smontate da un indizio trovabile?
- [ ] Il boss ha una debolezza scoperta durante l'indagine?
- [ ] Timer a tema presente, con avanzamento automatico ogni 4 round?
- [ ] Il tempo d'indagine è scarso e c'è un vincolo d'orologio? C'è l'oggetto-esca?
- [ ] La difficoltà segue la scala dell'episodio corrispondente (una-due manopole, non tutte)?
- [ ] Parole chiave in MAIUSCOLO e requisiti di sblocco stampati sulle carte?
- [ ] Epilogo + Frammento numerato + aggancio + Bivio sigillato con conseguenze definite?
- [ ] Le conseguenze del Bivio dell'episodio precedente sono applicate all'inizio?
- [ ] Ci sono 2–3 reperti stampabili coerenti con gli indizi?
- [ ] Palette, font, sigilli, formati e dorsi identici alla bibbia visiva?
- [ ] Tutti i testi rispettano la bibbia di scrittura (flavor sulle Minacce,
      quadri sensoriali sui Luoghi, «Chi sei» sugli eroi) e stanno nei riquadri?

---

**La mia richiesta:** _(scrivi qui, es.: «Genera l'Episodio 2, "Le voci del pozzo",
completo di tutti i PDF» oppure «Crea un sesto eroe» o «Progetta il finale di campagna»)_
