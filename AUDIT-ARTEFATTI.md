# Audit degli artefatti stampabili — testo e artwork

Passaggio di lettura su tutti e 21 i bucket (Preludio + Episodio 1-20): fascicoli
PDF pagina per pagina, tutte le tessere di Spedizione a piena risoluzione
confrontate con l'originale in `artworks/`, tutte le carte dei mazzi piccoli e un
campione ampio (almeno 2/3) dei mazzi grandi, tutti i reperti (fronte). Un agente
per bucket, stesso metodo e stessa lista di problemi noti passata in eredità da un
episodio al successivo via mano a mano che emergevano pattern ricorrenti — per
questo i problemi sistemici sono stati verificati con crescente attenzione mano a
mano che si procedeva.

Non rifà l'audit testuale già fatto in `AUDIT-TESTI.md` (11/08/2026): guarda gli
artefatti *renderizzati* (PDF impaginati, PNG/JPG finali), non le stringhe sorgente,
e copre l'artwork, mai controllato sistematicamente prima d'ora.

## Come leggere questo referto

- **Sistemici**: lo stesso difetto, con la stessa causa tecnica, ricorre in quasi
  tutti gli episodi. Vale la pena risolverli una volta nel generatore/pipeline
  piuttosto che episodio per episodio.
- **Per episodio**: difetti specifici di un singolo bucket (refusi, carte mancanti,
  contraddizioni narrative).
- Gravità: **alta** = rompe la giocabilità o la leggibilità al tavolo; **media** =
  visibile e da correggere ma non blocca la partita; **bassa** = rifinitura.

---

## 1. Problemi sistemici (riscontrati nella maggioranza degli episodi)

### 1.1 Tessere di Spedizione troppo scure — ~~ALTA~~ NON È UN BUG (confermato dall'autore)

**Correzione post-audit**: la causa tecnica è un velo nero fisso al 75% di
opacità sopra l'arte (`.dim` in `scripts/tiles/generate-tiles.js`), trovato e
proposto come fix — ma l'autore ha confermato che è **voluto**, non un difetto
di generazione. Nessuna modifica applicata. I dati sotto restano come
documentazione di quanto misurato, non come lista di cose da correggere.

Ogni tessera in `Episodio N/board/*.png` è stata confrontata pixel per pixel con
il suo originale in `artworks/`. In *ogni* episodio controllato le tessere
pubblicate hanno una percentuale di pixel neri/quasi-neri drammaticamente più alta
dell'originale — la scena resta visibile solo a brandelli (angoli, piccoli
riquadri con l'icona di un oggetto), il resto stampa come un buco nero:

| Episodio | % nero pubblicato | % nero originale |
|---|---|---|
| 1 | 25-42% | — |
| 2 | 60-80% | — |
| 3 | 58-77% | 1-13% |
| 4 | 73-88% | 20-37% |
| 5 | 72-86% | 6-29% |
| 6 (8 tessere) | 83-90% | 23-42% |
| 7 (8 tessere) | 92-94% | 33-62% |
| 8 | 87-91% | 23-33% |
| 9 | 80-87% | 9-27% |
| 10 | 84-91% | 32-69% |
| 11 | 85-92% | 27-50% |
| 12 | 77-79% | 10-31% |
| 13 | 86-92% | 46-59% |
| 14 | 85-91% | 23-62% |
| 15 | 87-94% | 45-55% |
| 16 | "quasi completamente neri" (segnalato dal primo audit) | — |
| 17 | 86-90% | 18-46% |
| 18 | 82-90% | 6-29% |
| 19 | 80-92% | 2-29% |
| 20 (solo T1 esiste) | 97.7% | 61.1% |

Il trend peggiora dall'Episodio 1 in poi: qualcosa nella pipeline di generazione
delle tessere (`scripts/tiles/generate-tiles.js`) sta scurendo sistematicamente
l'arte rispetto alla sorgente in `artworks/`. **Priorità massima**: senza questo
fix, la plancia fisica di Spedizione è illeggibile in praticamente ogni episodio.

### 1.2 Tabella Ferite del Bestiario non crescente — ~~ALTA~~ NON È UN BUG

**Correzione post-audit**: la causa è `BOSS_DELTA = [-1, 0, 1, 0, 1]` in
`src/gen_bestiario.py:134`, applicato alle cinque fasce di eroi. Il commento
sul posto (righe 123-132) documenta che è una scelta di bilanciamento
deliberata, ritarata il 20260716 sul motore di simulazione e incrociata con
`CUSTODE_TENSIONE_EXTRA` in `scripts/simulate_playtest.py`: *"+1 a 6 e a
9-10 (a 7 e 8 no: testato e bocciato in entrambe le ritarature)"*. Il calo
alla fascia 7-8 eroi è voluto e testato, non un difetto di generazione.
Nessuna modifica applicata.

In *ogni singolo episodio* controllato (Preludio escluso solo perché non ha un
boss con questa tabella), la tabella "Ferite per eroi in tavola" di un nemico —
quasi sempre il boss/nemico principale — non è monotona crescente: il valore
**cala** nella fascia **7-8 eroi** rispetto ai 6 eroi, per poi risalire a 9-10
eroi. Pattern identico episodio dopo episodio (Ep.1 Custode della Cera, Ep.2
Scoriatore, Ep.3 L'Accordatore, Ep.4 Il Suggeritore, Ep.5 Il Salmodiante, Ep.6
Bastiano Ferri, Ep.7 Il Capocantiere, Ep.8 Il Cambiavalute, Ep.9 Sicario Gentile,
Ep.10 Il Muratore, Ep.11 Il Caposquadra, Ep.12 Il Corriere/Sicario Gentile, Ep.13
Sorvegliante del Molino, Ep.14 Il Primo Gatto, Ep.15 Il Capo Apparecchiatore,
Ep.16 "Lo Sposo", Ep.17 Guardia del Notaio, Ep.18 Guardia del Presidente, Ep.19
Ispettore Vidal, Ep.20 il boss finale "La Camera del Dormiente"). Quasi certamente
un bug nella formula/tabella di scaling in `src/gen_bestiario.py`, non un errore
isolato — vale la pena cercare la causa comune lì piuttosto che correggere 20
tabelle a mano.

### 1.3 Carte Approfondimento (Indizio/Testimone/Referto) che duplicano l'arte del Luogo — ALTA/MEDIA — *ogni episodio da Ep.9 in poi*

A partire dall'Episodio 9, in ogni episodio le carte Indizio Nascosto/Testimone/
Referto legate a un Luogo riusano **pixel-per-pixel** l'illustrazione della carta
Luogo corrispondente invece di avere un'immagine propria. Non un caso isolato: in
Ep.9, 12, 15, 17, 18, 19, 20 riguarda **l'intero mazzo Approfondimenti**
dell'episodio (tutte le 9-10 carte). Dimezza la varietà visiva reale del mazzo e
rende le carte coperte indistinguibili l'una dall'altra finché non si scoprono.

### 1.4 Carte Minacce con illustrazione placeholder ripetuta — MEDIA/ALTA — *ogni episodio dall'1 al 20*

In ogni episodio, un sottoinsieme di carte Minaccia (tipicamente il sottotipo
"Malavita"/spawn) condivide una manciata di illustrazioni identiche tra carte con
nomi ed effetti di gioco completamente diversi. La proporzione cresce nel tempo:
2-3 illustrazioni su 20-23 carte in Ep.2-6, fino a 13-14 carte su 21 che riusano
solo 2-4 immagini in Ep.9-10. Probabile causa: mancanza di arte dedicata generata
per queste carte, con un fallback su un pool ristretto di immagini.

### 1.5 Mappa.pdf: lo stradario sconfina e si tronca — ALTA — *ogni episodio dal 5 al 20*

Il difetto di "troppo testo, troppo poco spazio" che l'audit cercava
esplicitamente: a partire dall'Episodio 5, lo stradario di **ogni** Mappa.pdf
successivo va in overflow oltre il margine/piè di pagina e si interrompe a metà
alfabeto — spesso già alla lettera C, in un caso (Ep.8) fermandosi a "F" per
mancanza di una terza pagina. Le voci tagliate a metà a volte si fondono senza
spazio ("Comunalevicolo delle Quinte"), a volte vengono cancellate dalla
sovrapposizione col footer di copyright. L'effetto pratico: mancano dallo
stradario stampato la maggior parte dei luoghi centrali di ogni caso (Ep.7: 5
luoghi chiave assenti; Ep.8: tutto da G in poi). A questo si aggiungono, in
diversi episodi (11-20), **righe di editing/barrature non ripulite** rimaste nel
PDF finale e voci fuori ordine alfabetico ("Locanda del Forestiero" ricorre fuori
posto in almeno 5 episodi). Causa probabile: `src/gen_mappa.py` non pagina
l'elenco quando cresce oltre una soglia (lo stradario è dichiaratamente
incrementale, cresce a ogni episodio — la Mappa.pdf dell'Ep.20 dovrebbe elencare
quasi 200 luoghi).

---

## 2. Problemi gravi specifici (non sistemici, ma seri)

- **Ep.13 — fuga di spoiler (ALTA)**: tre carte Approfondimento (2 Testimoni, 1
  Referto) rivelano esplicitamente "una fermata in più al Palazzo del Lume", il
  segreto di campagna che la Soluzione dice testualmente di non svelare prima
  dell'Episodio 18. Nessuna fuga simile trovata negli altri episodi controllati
  (14, 15, 17 espliciti "nessuno spoiler rilevato").
- **Ep.15 — tre carte intere mancanti (ALTA)**: manca la carta Luogo "Il
  Tribunale" (uno dei 4 luoghi iniziali), la carta Testimone "Il vecchio
  giudice" e la carta Oggetto "Un Ritaglio del Dossier", tutte e tre citate nei
  fascicoli come esistenti/ottenibili.
- **Ep.19 — contraddizione narrativa strutturale (ALTA)**: i gendarmi comuni
  sono narrati come "onesti, in buona fede" (poliziotti ingannati) ma
  meccanicamente sono istanze del mostro "Lo Sgherro", la cui scheda Bestiario
  li descrive come Malavita/criminali pagati dal culto — caratterizzazione
  opposta. Manca inoltre del tutto la carta Nemico "Lo Sgherro" nel mazzo.
- **Ep.20 (finale) — conteggio Frammenti incoerente (ALTA)**: la Soluzione
  elenca i Frammenti del "canto del sonno" come 9 numeri a pag.2 (1-7, 11, 20)
  ma a pag.4 li richiama come "nove" mostrandone solo 8 (manca il 20) — un
  errore nel conteggio decisivo per la deduzione del finale di campagna.
- **Ep.20 — 5 tessere su 6 non esistono (ALTA, stato)**: `board/` ha solo T1;
  mancano T2-T6 e i relativi sorgenti in `artworks/`. Probabilmente l'arte del
  finale non è ancora stata prodotta, non un bug di generazione.
- **Contenuto non finalizzato — "Effetto: nessuno finora scoperto" (ALTA)**:
  quattro carte Oggetto in tre episodi diversi hanno questo testo placeholder al
  posto di un vero effetto di gioco: Ep.18 (L'Accusa Pronta contro di Voi, Il
  Ritratto del Rivale), Ep.19 (La Taglia da Riscuotere, La Via Facile), Ep.20
  (Il Grimorio del Rito, La Chiave del Coro) — sei carte in tutto.
- **Oggetto citato ma mancante dal mazzo (ALTA)**: bug ricorrente distinto dal
  precedente — Ep.10 ("Una Lanterna a Olio"), Ep.11 ("Una Corda di Servizio"),
  Ep.12 ("Un Remo di Scorta"), Ep.14 ("Una Fune Leggera"): la tessera/il
  fascicolo dice di prendere un oggetto che non esiste nel mazzo Oggetti.
- **Miniature mancanti per un nemico del Bestiario (MEDIA/ALTA)**: la pagina
  "Miniature — ritagliare" di Spedizione.pdf non fornisce sempre un token per
  ogni nemico schedato — mancava per il Sicario Gentile (Ep.12), per uno tra
  Guardia/Notaio (Ep.17), per il boss e per "M." (Ep.18), per il boss Ispettore
  Vidal (Ep.19), per "M. (senza maschera)" (Ep.20).

## 3. Problemi minori e di rifinitura

- Scritte in inglese o anacronistiche impresse nelle illustrazioni (Ep.2:
  "FOUNDRY", "WEIGHMASTER", "Mawnshop"; Ep.4: "THEATRE"/"PROGRAM"; Ep.11:
  "OFFICIAL INSPETTOR...").
- Scritte gibberish/pseudo-testo da generazione IA visibili nelle illustrazioni
  (Ep.2, 3, 12, 19, 20 — spesso la stessa stringa "...asit Frank Staii
  Cochines" ricorre identica su carte di episodi diversi che condividono
  artwork di sfondo).
- Glifi non renderizzati (icone a teschio mancanti) in una carta Referto di
  Ep.20.
- Titoli di carte diverse identici o quasi-identici che generano ambiguità al
  tavolo: "Presagio" nome di un tipo di Indizio Nascosto *e* di una carta
  Minaccia (Ep.1); "La colpa del morto" per un Oggetto e un Indizio diversi
  (Ep.11); "Mappa dei Sigilli"/"mappa dei sigilli" per un Oggetto e un Indizio
  (Ep.19).
- File reperto obsoleto (nome vecchio, versione col bug maiuscole non
  corretto) rimasto accanto alla versione corretta e rinominata: `Reperto C -
  Biglietto di C.B..png` in Ep.9, da rimuovere.
- Vari refusi/incongruenze isolati: didascalia reperto troncata con nome
  sbagliato del lattoniere (Ep.3); effetto agrammaticale di un Oggetto,
  duplicato anche in Spedizione.pdf (Ep.4); contraddizione su quando si
  risveglia un boss tra Spedizione e Soluzione (Ep.4); firma "C.B." invece di
  "B. Camillo" (Ep.12); nome/soprannome di un eroe non collegato esplicitamente
  nello stesso fascicolo (Preludio, "Fulgenzio" vs "Carbone").
- Carta Testimone/Luogo con artwork tonalmente incoerente (una donna dagli
  occhi rossi luminescenti su un personaggio descritto come dimesso, Ep.5).

---

## 4. Copertura e limiti dell'audit

Ogni bucket è stato controllato per intero sui PDF (tutte le pagine) e sulle
tessere/reperti (tutti i file); per i mazzi di carte più grandi (Minacce, spesso
20-23 carte) è stato controllato un campione di almeno 2/3. Non è quindi da
escludere che esistano ulteriori carte Minacce con lo stesso pattern di
placeholder oltre a quelle esplicitamente elencate qui.

Gli episodi 7, 8, 9, 16, 17, 18, 19, 20 hanno ricevuto arte nuova molto di
recente (poco prima di questo audit): dove qualcosa risultava ancora mancante
è stato segnalato come stato attuale della produzione, non come errore.

## 5. Priorità — e cosa è stato fatto dopo l'audit

Le voci 1.1 e 1.2 (le due in cima a questa lista quando l'audit è stato
scritto) sono state indagate e **non erano bug**: vedi le correzioni nelle
rispettive sezioni sopra. Resta un solo problema sistemico da codice, già
risolto:

1. ~~Tessere troppo scure~~ — confermato voluto dall'autore, nessuna modifica.
2. ~~Ferite Bestiario non crescenti~~ — confermato bilanciamento deliberato
   e testato, nessuna modifica.
3. **Mappa.pdf che si tronca** (1.5) — unico bug di pipeline confermato:
   `pagina_stradario()` non paginava mai. **Fixato** in `src/gen_mappa.py`
   (controllo dello spazio residuo + pagina "stradario — segue"
   automatica) e rigenerato per tutti i bucket.
4. **Fuga di spoiler in Ep.13** e **contraddizione narrativa in Ep.19** — non
   sistemici ma rompono rispettivamente la struttura della campagna e la
   coerenza del culto/Malavita. Vedi stato dei fix più sotto.
5. **Oggetti citati ma mancanti** e **"Effetto: nessuno finora scoperto"** —
   piccolo numero di carte. Vedi stato dei fix più sotto.
6. **Riuso di artwork** (1.3, 1.4) — un problema di varietà visiva che
   richiede nuova arte Midjourney: non risolvibile in questa sessione (nessun
   accesso di rete a Midjourney), resta come lavoro futuro.
