# PROMPT DI ESPANSIONE — Ombre su Roccamora

Copia tutto questo documento in una nuova conversazione e in fondo scrivi cosa vuoi
(es. «Genera l'Episodio 2 completo in PDF»). Contiene tutto ciò che serve per
mantenere coerenza narrativa, meccanica e grafica con il materiale esistente.

---

Agisci come game designer e grafico del gioco da tavolo **"Ombre su Roccamora"**, un
investigativo cooperativo a puntate per 2–10 giocatori che ho già in versione stampata.
Devi produrre nuovo materiale (episodi, personaggi, varianti) perfettamente coerente
con le tre "bibbie" qui sotto. Non cambiare regole, numeri o stile salvo mia richiesta
esplicita.

## 1. BIBBIA NARRATIVA

- **Ambientazione:** Roccamora, città immaginaria di canali, campanili e nebbia, anno 1889.
  Tono: mistero gotico ottocentesco, inquietante ma mai splatter; l'orrore è suggerito.
- **I giocatori** sono la **Società del Lume**, circolo privato d'investigatori. Eroi:
  Elena Fosco (Investigatrice), Dott. Attilio Marn (Medico), Sibilla Reve (Occultista),
  Nino "Grimaldello" Cauto (Ladro), Carla Dosti (Giornalista), Ottone "Mezzena" Massari
  (Macellaio, il combattente del gruppo: Vigore 3, Salute 8), Dott. Lazzaro Serra
  (Alienista: sblocca i Presagi, aura +2 NERVI), Padre Celso Marani (Esorcista Sospeso:
  Discernimento in indagine, Litania anti-Canto in spedizione), Fulgenzio Carbone
  (Antiquario dell'Occulto: esamina Oggetti/Reperti, Esca preziosa), Ottavio Brera
  (Magistrato in Pensione: sblocca i Referti, rimuove un nemico di truppa), Mora "Spilla"
  Fanti (Contrabbandiera dei Canali, col furetto Ombra: conta gli Approfondimenti di un
  luogo prima di sceglierlo, sposta oggetti tra eroi in spedizione). Roster di undici,
  ne scendono in tavola tanti quanti i giocatori (fino a dieci): la composizione del
  party e' essa stessa una scelta di gioco (chi resta a casa lascia chiuse le sue
  porte in indagine).
  Presidente: il misterioso "M.".
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

**Il Preludio (tutorial, esiste già — non rifarlo, usalo come riferimento):**
"La Prova del Lume" (`src/gen_preludio.py`, `pdf/Preludio/`) è il mini-episodio
introduttivo giocato prima dell'Ep. 1: racconta come gli undici si incontrano
ed entrano nella Società, e insegna le regole con i box "Scuola del Lume" dentro i
fascicoli. Deroga deliberatamente dalla struttura fissa (2 Domande invece di 4,
1 falsa pista, 1 reperto, Approfondimenti solo di corroborazione senza nucleo
garantito, niente boss, 3 tessere e mazzo
Minaccia riusati dall'Ep. 1, orologio "Marea" solo automatico): quelle deroghe
valgono SOLO per il tutorial, gli episodi veri seguono la struttura sotto. Se un
nuovo episodio vuole richiamare il Preludio: Ansaldo (il custode-archivista) e
il nipote sono PNG riusabili; il Frammento 0 è la mezza onda; il committente mai
visto («un signore ben vestito, mani da artigiano») è Ferri, non nominarlo mai
prima che l'Ep. 1 lo riveli.

**Struttura fissa di un episodio (una serata):**
1. *Fase Indagine* — 8 carte Luogo (circa 5 aperte dall'inizio, 2–3 sbloccabili tramite
   PAROLE CHIAVE in maiuscolo o oggetti trovati). Budget: 8 ore/visite (il tempo non deve bastare per tutto: i luoghi utili superano le ore). Sempre almeno un vincolo d'orologio (un luogo che chiude o un testimone che sparisce a un'ora precisa). Almeno
   2 false piste che scagionino innocenti e almeno 1 oggetto-esca plausibile ma inutile (come l'acqua benedetta dell'Ep. 1), così la domanda sull'oggetto è una scelta vera. Gli indizi risolutivi non devono mai nominare la risposta per esteso: usare sigle, soprannomi o riferimenti parziali da incrociare (il "C.B." del registro dell'Ep. 1). Chiusura: **4 Domande** scritte (dove / chi / codice o
   passaggio segreto / oggetto indispensabile), ognuna deducibile incrociando 2–3 indizi
   distribuiti su luoghi diversi. Mai un indizio singolo che risolva tutto.
1-bis. *Approfondimenti* — sistema di indizi gated per abilità eroe, **non bonus
   decorativo**: almeno un dettaglio decisivo per **una o due** delle 4 Domande (mai tutte
   e 4, o il gruppo può restare bloccato) deve emergere **solo** tramite un Approfondimento
   qualsiasi. Ogni eroe ha un verbo fisso (non cambiarli tra episodi). Sette eroi
   producono carte: **Elena** = Osservazione (2/episodio) · **Serra** = Presagio
   (1/episodio) · **Attilio e Brera** = Referto (1/episodio a testa) · **Ottone e
   Carla** = Testimonianza (1/episodio a testa) · **Sibilla** = jolly, un Approfondimento
   qualsiasi del luogo presente, o intuisce dove cercarne uno (1/episodio). Quattro
   eroi NON producono carte, hanno una nicchia diversa che aggira il sistema invece
   di alimentarlo: **Nino** = Accesso, entra in un luogo bloccato senza requisiti
   (1/episodio) · **Marani** = Discernimento, sì/no su un luogo (1/episodio) ·
   **Carbone** = esamina un Oggetto/Reperto già trovato (1/episodio) · **Fanti** =
   conta gli Approfondimenti di un luogo prima di sceglierlo (1/episodio). Attenzione
   in fase di scelta party per un tavolo a 2: con 4 eroi su 11 senza carta (contro
   1 su 6 dell'episodio originale), una coppia sfortunata (es. Nino+Marani) può
   restare senza alcun Approfondimento per l'intero episodio — non capita spesso ma
   non è più trascurabile come quando c'era solo Nino. Le carte (Indizio Nascosto /
   Testimone / Referto) stanno in un
   **unico mazzo coperto**: il dorso mostra **solo il tipo** (mai il numero del luogo, né
   qualunque altro riferimento a un luogo/tessera specifico — sulle carte stesse, fronte
   o retro, non deve mai comparire), così i giocatori non sanno in anticipo dove si
   nasconde qualcosa né possono dedurlo sfogliando il mazzo, e le carte restano riusabili
   tra episodi. Il legame carta↔luogo/tessera (quale carta prendere quando un eroe sblocca
   quel tipo in quel luogo) vive **solo** in `pdf/Episodio N/Luoghi.pdf` (vedi Bibbia
   Visiva), mai su una carta. **Nucleo garantito scritto dentro ogni carta, ma a due
   livelli** (non un frammento condiviso appeso in coda — nell'Ep. 1 lo era, un "Eco
   del Coro" soprannaturale identico su ogni carta comprese quelle forensi/
   testimoniali, suonava incoerente e ripetitivo, sistemato dopo; poi si è visto che
   garantire OGNI fatto decisivo su OGNI carta rende una singola carta pescata a caso
   sufficiente a risolvere anche la Domanda più "climax", con poca tensione sulla
   rivelazione del colpevole — corretto in una sessione successiva). Distingui:
   - il dato **meccanico** (dove si trova qualcosa, quale numero, quale oggetto — a
     basso impatto emotivo, penalità lieve se sbagliato) resta scritto **dentro
     ciascuna carta Approfondimento** dell'episodio, nella voce del suo tipo
     (Osservazione = dettaglio fisico, Referto = forense, Testimonianza = discorso
     diretto, Presagio = sensoriale/occulto — quest'ultimo può restare onirico, è
     coerente col suo tipo). Così non conta QUALE carta si peschi per questo dato,
     basta pescarne una qualsiasi;
   - il dato **rivelatorio** (chi è il colpevole/chi comanda — il vero climax della
     detection) va invece **concentrato in 2-3 carte designate**, tutte in luoghi
     raggiungibili senza chiavi/parole chiave (mai dietro un solo gate, altrimenti un
     party che non lo sblocca non ha mai la possibilità di ottenerlo). Le altre carte
     lasciano il colpevole presente, temuto, coinvolto, ma senza confermarne
     apertamente il ruolo di comando — stesso tono, un grado di certezza in meno.
   Ogni carta resta comunque una rivelazione a sé, non la stessa frase che ricorre.
   La Domanda legata al dato rivelatorio **non deve avere una complicazione in caso
   di risposta sbagliata/vicina** (solo il vantaggio extra va perso): altrimenti la
   scelta di concentrarlo diventa un vero soft-lock, non più tensione. Verifica con
   `scripts/simulate_playtest.py` (colonna "Chi confermato" nel riepilogo,
   `CHI_ESPLICITO` nel codice) che un party plausibile trovi la conferma nella
   maggioranza dei casi; un party "stress-test" apposta senza la giusta copertura di
   tipo può mancarla, è un esito accettabile, non un difetto da correggere.
   Verifica quando possibile che una coppia di eroi (il minimo per 2 giocatori)
   possa sbloccare almeno una carta: nell'Ep. 1 solo 7 eroi su 11 producono carte
   (vedi sopra) — non è più garantito per ogni coppia come quando i "senza carta"
   erano solo Nino (vedi nota sopra sul rischio con 4 eroi senza carta).
1-quater. *Piste false e vicoli ciechi* — un paio di sospettati sbagliati non bastano
   se non costano mai nulla: nell'Ep. 1 originale ogni luogo "sbagliato" pagava
   comunque un indizio verso la verità, zero rischio a seguirli. Due tecniche
   aggiunte in una sessione successiva, entrambe senza nuove regole:
   - *pista falsa a costo zero* (come le esistenti Tonio/Don Callisto, più le nuove
     Bice e "Learco il ramaio"): un sospettato plausibile con movente, seminato in un
     indizio core, smontato da un'altra carta/indizio già presente (non serve
     inventarne una apposta) — pura profondità narrativa, nessun rischio meccanico;
   - *vicolo cieco a costo* (nuovo): un indizio core **contraddittorio**, in un luogo-
     hub di pettegolezzi (una taverna, un mercato), che NON si autosmentisce nella
     stessa riga (a differenza delle piste a costo zero) — resta lì, in competizione
     con la testimonianza corretta nello stesso luogo e con le carte Approfondimento.
     Un gruppo che non incrocia le fonti rischia di rispondere male alla Domanda
     legata al dato meccanico — usa la penalità di risposta sbagliata che la Domanda
     ha già in tabella, non inventarne una nuova. Occhio ai nomi: mai riusare il nome
     di un nemico/creatura già nel bestiario per un sospettato umano innocente (rischio
     di confusione reale — successo con "il Fonditore", nome già della creatura
     soprannaturale: il sospettato del bronzo si chiama "Learco il ramaio").
1-ter. *Leggere la scena* — regola CORE (non opzionale per episodio), introdotta per non
   avere l'Indagine come unica fase senza mai un tiro di dado: alla prima visita di ogni
   luogo, un eroe a scelta prova ACUME (Media) prima di leggere gli indizi. Riuscita: si
   legge tutto come di consueto. Fallita: gli indizi meccanici core (parola chiave,
   oggetto, reperto) restano **sempre garantiti** — mai dietro un tiro, principio Gumshoe/
   Trail of Cthulhu: un tiro storto non deve mai creare un vicolo cieco — ma l'eventuale
   Approfondimento di quel luogo resta nascosto per quella visita: si recupera tornandoci
   (1 ora, come ogni visita), senza ripetere la prova la seconda volta. In scrittura,
   questo permette agli indizi meccanici di essere leggermente meno espliciti nella prosa
   (l'informazione resta garantita, cambia solo il registro con cui arriva — non nominare
   MAI la parola chiave/oggetto in chiaro se già "risolta" a metà frase, lasciare un
   piccolo margine di ricomposizione al tavolo), perché ora è il tiro a fare da filtro,
   non la sola visita.
2. *Busta Soluzione* — risposte, per ogni domanda un Vantaggio se esatta e (per 2 domande
   su 4) una complicazione se errata; schema di montaggio della mappa; epilogo da leggere
   a voce; Frammento; elenco migliorie; **nota per chi arbitra** su quale nucleo garantito
   portano gli Approfondimenti (vedi 1-bis) e come giudicare risposte "vicine" se il gruppo
   non ha consultato nessun Approfondimento.
2-bis. *Reperti* — ogni episodio include 2–3 **documenti-reperto** stampabili (pagine di
   diario a grafia manoscritta, registri, atti d'archivio) consegnati quando si trova
   l'indizio corrispondente. Contengono esattamente le informazioni degli indizi nel
   fascicolo Luoghi (le carte Luogo portano solo l'ambientazione, non gli indizi — vedi
   1-bis) più dettagli d'atmosfera: mai indizi esclusivi. Stile: vedi
   `scripts/reperti/generate-reperti.js` (testo composto su un'unica foto di
   pergamena, font La Belle Aurore per le grafie, blend mode Multiply).
2-ter. *Oggetti trovabili* — una **carta fisica per ogni oggetto** (dagli indizi dei
   Luoghi o dal `cerca` delle tessere), mazzo a parte con arte dedicata (nature morte,
   non riusata da altre carte). Titolo, un flavor breve nuovo (evocativo, mai un dato di
   gioco), poi l'effetto meccanico **copiato 1:1** dalla fonte — la carta non introduce
   mai una regola nuova, è solo un supporto fisico invece di una riga da ricordare.
   Includi sempre almeno un oggetto-esca con effetto "nessuno finora scoperto" tra quelli
   con carta (coerenza con l'oggetto-esca del punto 1). Dati: `OGGETTI` in
   `src/gen_cards.py`, mazzo `oggetti` in `scripts/cardconjurer/cards-data.js`.
   Facoltativo, 0–2 per episodio: un **oggetto rischioso**, segnalato con `rischio=True`
   in `OGGETTI` (solo per oggetti trovati via `cerca` in Spedizione, mai in Indagine —
   l'Indagine non ha prove di dadi). Il testo di `cerca`/`effetto` include per intero la
   scelta e la prova, stesso linguaggio delle carte insidia (`prova X (difficoltà): se
   fallisce, Y`), riusando la matematica di un'insidia esistente quando possibile
   ("carte sorelle"). Non forzato mai: il gruppo può sempre lasciare l'oggetto sul posto
   senza conseguenze e tornare a prenderlo più tardi. Il fallimento costa sempre e solo
   la penalità scritta, mai l'oggetto. Riservalo a un oggetto trovato in un contesto già
   inquietante (mai il decoy, mai un oggetto consegnato a mano da un PNG); se tocca
   l'oggetto critico dell'ultimo miglio, tienine la penalità minima (mai perdita di
   oggetto, mai danno grave).

3. *Fase Spedizione* — 6 tessere (griglia 4×4, tessere 200 mm, caselle 50 mm — il minimo
   per muovere comodo le miniature), percorso con 1–2 rami
   opzionali che premiano l'esplorazione. Round, ciclo fisso e ripetuto: **Turno degli
   eroi** (ogni eroe 2 azioni, sempre di tipo diverso — mai la stessa due volte, es. niente
   doppio Movimento; un'abilità che concede un'azione extra, come Colpo da macello di
   Ottone, non conta come ripetizione: Muovi 3 (Nino 4) · Attacca · Cerca ACUME Media su
   una tessera già rivelata, solo se nasconde un oggetto — non tutte le tessere ne hanno
   uno, e non serve per liberare prigionieri, quello è Interagire · Interagisci · Usa
   oggetto, come indicato sulla sua carta · Rianima a 2 Salute) → **Fase Minaccia** (pesca
   1 carta ogni 2 eroi,
   arrotondando per eccesso, applicane il testo) → **Turno dei nemici** (ognuno si muove
   verso l'eroe più vicino, attacca se adiacente: 2d6+Attacco ≥ Difesa eroe). Nota: rivelare
   una tessera (vedere che stanza è, quando un eroe ci entra) è automatico e diverso da
   Cercare (trovare cosa nasconde, un'azione a parte). Obiettivo di salvataggio/recupero +
   ritorno all'ingresso.
3-bis. *Ferite nemici* — nessun gettone o dado per nemico sul tabellone: si traccia su un
   **Registro delle Ferite** riusabile (una pagina in fondo al fascicolo Spedizione, vedi
   `registro_ferite()` in `src/gen_gothic.py`), righe generiche "nemico attivo" (mai per
   tipo: si cancellano e riusano a fine combattimento) con **10 caselle a goccia** a riga,
   fisse indipendentemente dalle Ferite dell'episodio corrente (oggi il massimo è 3, ma il
   Registro regge già eventuali boss futuri più duri senza bisogno di rifare il PDF — vedi
   scala di difficoltà sotto). Tenuto da chi pesca il mazzo Minaccia quel round — stesso
   principio di D&D/HeroQuest (il master tiene le ferite dei mostri su un proprio foglio,
   non su un componente fisico per mostro), qui senza master: il foglio è pubblico, non un
   segreto. Se mai un nemico superasse 10 Ferite, allora sì va alzato `N_PIP` in
   `registro_ferite()` — non prima.

3-ter. *Tavoli grandi (6–10 eroi)* — la proporzione "1 carta Minaccia ogni 2 eroi"
   NON si estende linearmente oltre i 5: a 6+ eroi vale una tabella dedicata,
   validata con `scripts/simulate_playtest.py` (batch multi-seed su composizioni
   casuali di eroi, non party fissi — vedi i log in `logs/playtest/`): **Fase
   Minaccia 2 carte a 6 eroi, 3 carte da 7 a 10** (non 3/4/5 come darebbe la
   proporzione semplice — troppe carte a quel punto rendono la spedizione
   ingiocabile). In parallelo, **bonus Ferite ai nemici** per compensare il maggior
   numero di attacchi/round: +0 sotto i 6 eroi, +2 Ferite da 6 a 8, +3 da 9 a 10,
   applicato a tutti i nemici piazzati **incluso il boss dell'episodio**, fissato
   a inizio spedizione in base agli eroi schierati (non ricalcolato se qualcuno
   cade a terra durante la spedizione). Qualunque nuovo episodio con Ferite boss
   più alte di 3 deve verificare che boss-Ferite-base + 3 resti sotto la soglia
   `N_PIP=10` del Registro (vedi 3-bis) — con Ferite-base 3 c'è ancora margine
   fino a 7. Regola spiegata per i giocatori nel **Regolamento** (fascicolo 01,
   sezione "Giocare in un tavolo grande") — qui basta sapere che esiste quando si
   tara un nuovo episodio per la stessa fascia di giocatori.

**Il Canto (o equivalente orologio a tema per l'episodio):** non un nemico, un
**contatore di segnalini che non torna mai indietro**, alimentato da **due fonti
indipendenti**: (a) alcune carte Minaccia-timer aggiungono 1 segnalino quando pescate;
(b) **in più**, a prescindere dalle carte, +1 segnalino automatico alla fine di ogni
**4° round** (4°, 8°, 12°...) — garantisce che il pericolo massimo arrivi comunque, anche
evitando ogni carta-timer. Al raggiungimento della **soglia** (nell'Ep. 1: 3 segnalini) il
boss si desta immediatamente e **da quel momento ogni Fase Minaccia pesca 1 carta in più**,
permanentemente, per il resto della spedizione. Spiega questo meccanismo per intero nel
**Regolamento** (fascicolo 01, letto prima di giocare): nell'Ep. 1 mancava e ha confuso i
giocatori — la Soluzione (sigillata) aggiunge solo i dettagli specifici dell'episodio
(quale nemico, dove compare), non il meccanismo generale.


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

**Mazzo Minaccia: 20–23 carte, tutte con titolo e flavor unici.** Le copie di uno
stesso effetto sono "carte sorelle": stessa matematica, titolo diverso, flavor diverso,
al più varia il punto di apparizione del nemico (mai danno, difesa o ferite). Le carte
timer formano un crescendo narrativo (nell'Ep. 1: Il canto sale → Il coro risponde →
Il canto cresce). **Composizione di riferimento (Ep. 1, 23 carte):** 12 spawn (4
famiglia-Adepto con apparizioni diverse, 2 Cani, 2 Fonditori, 1 Ronda, **3 Malavita** —
Sgherro/Sicario, vedi sotto), 3 prove/NERVI (2 trappole + 1 evento di gruppo), 3
carte-timer Canto a crescendo narrativo, e il resto in eventi vari (1 presagio innocuo, 1
evento favorevole tipo "Eco Amica", 1–2 effetti di movimento, 1 danno diretto tipo
"Sussurri") fino al totale. Non è vietato scendere a 20 se l'episodio è più snello — ma
mai sotto, si perde varietà.

**Dove piazzare i nemici (testo delle carte spawn, corretto nell'Ep. 1 dopo un
playtest simulato):** un nemico si muove del suo Movimento verso l'eroe più
vicino e attacca solo se adiacente (vedi "Turno dei nemici" sotto) — un nemico
piazzato "sulla tessera/uscita **più lontana**" quindi spesso non raggiunge mai
un gruppo che continua ad avanzare, restando un evento di minaccia solo sulla
carta, mai in pratica. Le carte spawn di famiglia vanno scritte piazzando il
nemico **"sull'uscita più vicina agli eroi"** della tessera corrente (stesso
schema di "Cani dei Moli", già così nell'Ep. 1), non sulla tessera/uscita più
lontana — fanno eccezione, deliberatamente, le carte che piazzano **all'ingresso
della Banchina/punto di partenza** (inseguitori da dietro, es. "Il Fonditore",
"Ronda"): quelle restano lontane per tema (un nemico lento che non vi raggiunge
mai è comunque narrativamente giusto, vedi il Fonditore "non corre mai") e le
carte "si attiva subito" (già adiacenti per testo, es. "Cani dei Moli").

**Nemici di riferimento (bilanciamento):** tre archetipi di truppa legati al culto, da
riusare e variare — tuttofare = Adepto (Att +1, Dif 7, Fer 1, Mov 4, Danno 1);
veloce-fragile = Cane dei Moli (Att +2, Dif 6, Fer 1, Mov 6, Danno 1, appare VICINO agli
eroi); lento-pesante = Fonditore (Att +1, Dif 8, Fer 2, Mov 2, Danno 2, appare
all'ingresso, chi è ferito ha −1 movimento al turno dopo). Ogni episodio introduce UN
nemico di truppa nuovo legato al culto (un archetipo variato o un quarto archetipo, es.
"a distanza" o "esplosivo") e ne ripropone almeno uno vecchio; boss = livello del Custode
della Cera (Att +3, Dif 9, Fer 3, Mov 3, Danno 2), sempre con una **debolezza legata a un
oggetto trovato nell'indagine** (come il diapason che porta la Difesa a 5). I nuovi boss
possono variare di ±1 le statistiche.

**Malavita di Roccamora (nemici secolari, cross-episodio — riusa, non reinventare):**
**Sgherro** (Att +2, Dif 8, Fer 2, Mov 4, Danno 1, tattica del branco: +1 Attacco se
adiacente a un altro Sgherro) e **Sicario** (Att +3, Dif 7, Fer 1, Mov 5, Danno 2, colpo a
tradimento: +2 Attacco contro un eroe isolato o già ferito). Non hanno cera, maschere né
legami col culto: sono i bravacci/sicari che QUALSIASI antagonista umano di Roccamora può
assoldare a pagamento. Riusali quando serve un pericolo "umano e ordinario" invece che
cultista — specialmente in episodi dove il culto non è (ancora) l'antagonista diretto, o
per rompere la monotonia visiva/tattica se un episodio ha già molti nemici a tema.
Data: `NEMICI` in `src/gen_cards.py` (già presenti, non ridefinirli).

**Eroi (invariati salvo campagne):** roster di undici, statistiche 1–3 con somma sempre 6
(max 4 con migliorie), Salute = 5+VIGORE, Difesa 8 (9 solo Nino), armi +1 all'attacco.
Abilità: una nicchia indagine + una spedizione a testa, mai sovrapposte tra eroi, sempre
a usi contati (mai "per round": scala male col numero di giocatori). Migliorie standard:
+1 caratteristica, +1 Salute, Revolver, Lanterna schermata, Borsa di garze. Cicatrici:
alla terza, −1 permanente.

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
  raggiera** centrale con icona tematica in linea dorata: ogni FAMIGLIA di carte ha la
  sua icona (cappuccio, zampa, mestolo, tagliola, fumi, nota, occhio, campana, goccia,
  spirale, àncora). Le carte Luogo hanno un
  pannello pergamena interno per il **solo testo d'apertura** (l'ambientazione, 3–4
  frasi): gli indizi **non stanno più sulla carta**, vivono in `Luoghi.pdf` (vedi sotto
  e 3-bis) — la carta serve solo a mostrare ai giocatori dove sono, chi arbitra legge
  gli indizi dal fascicolo. I loro dorsi sono rosso-notte con numero
  nel medaglione, i dorsi Minaccia verde-abisso con tripla onda. Le pagine dei dorsi
  seguono i fronti, specchiate in colonna, per la stampa fronte/retro sul lato lungo.
- **Limite di lunghezza del testo in carta (verificato empiricamente, Ep. 1):** il
  box di testo delle carte piccole (Minaccia, Approfondimento — Indizio Nascosto/
  Testimone/Referto, Oggetto) regge comodamente **fino a ~65-70 parole**; oltre le
  **~85-90** il testo riempie il box fino al bordo, zero margine, a rischio di
  sforare se anche solo una parola cambia. Le carte Eroi (bio breve) e la Scheda
  Personaggio (bio estesa) hanno un box diverso, molto più ampio: non c'è lo stesso
  vincolo lì. Per ogni nuova carta Approfondimento: contare le parole prima di
  finalizzare, restare sotto ~65-70, e se serve tagliare farlo togliendo ridondanze
  (ripetizioni del nome del nascondiglio già chiaro dal contesto, "che fu di"/"che
  è" superflui, subordinate che raddoppiano un'informazione già detta) **mai** il
  nucleo garantito o la voce propria del tipo — l'immersività non si sacrifica,
  si toglie il grasso, non l'osso. Verificare sempre a video dopo la generazione
  (`node scripts/cardconjurer/generate-test.js "Titolo carta"`), non fidarsi del
  solo conteggio.
- **Tessere (200 mm, griglia 4×4, casella 50 mm — minimo per muovere comodo le
  miniature, nessuna PDF le forza a dimensione: vanno stampate a quella taglia):**
  stile mappa disegnata a china su pergamena: muri spessi a **doppia linea
  tremolante con tratteggio a 45°**, varchi porta nei muri, ombre a
  **puntinato**, acqua stipplata con onde, arredi a china con ombra,
  **rosa dei venti**, targa a nastro col nome, riquadro testo con bordo a china.
- **Miniature quadrate (50 mm, la taglia di una casella tessera):** al posto di
  gettoni tondi astratti, eroi e nemici di truppa/boss usano il proprio ritratto
  (stessa arte delle carte) ritagliato a quadrato — `token_sheet()` in
  `src/gen_gothic.py`, stessa tecnica cover-fit di `deluxe_style._cover_image`
  usata per lo strappo delle schede eroe, ma clippata invece che velata da un
  bordo di pergamena. Solo le unità senza ritratto dedicato (l'NPC da salvare,
  i segnalini Canto) restano gettoni tondi piccoli. Se un episodio introduce un
  nuovo nemico con arte dedicata, aggiungilo a `token_sheet()`; se il crop
  taglia male testa/soggetto, taralo in `MINI_CROP` (stesso principio di
  `top_margin`/`overscan` delle schede — verifica sempre a video prima di
  fissare i parametri, non tutti i ritratti si comportano uguale).
- **Documenti (regolamento, soluzione, lettera, taccuino, schede, aiuto):** sfondo
  pergamena **reale** (`artworks/background manuale.png`, non più procedurale — un
  overlay procedurale di vignettatura ai bordi resta sopra per uniformità), cornice
  sottile inchiostro/seppia, titoli di sezione H1 come **banner rosso** (Table con
  sfondo `RED_DK`, righe oro sopra/sotto, testo small-caps color crema — vedi `h1_bar()`
  in `src/gen_docs.py`, non semplice testo colorato), **drop-cap** sulla prima lettera dei
  paragrafi d'apertura (stesso trucco della lettera d'incarico: `<font size=X
  color=RED>Prima</font>lettera`), sigillo di ceralacca **arte reale**
  (`artworks/Sigillo.png`, non più disegnato: vedi sotto), piè di pagina "ombre su
  roccamora · società del lume" in oro/seppia. Box di nota con sfondo pergamena e
  bordo seppia (non oro: l'oro resta per i filetti/rifiniture, il seppia per i bordi
  "a inchiostro").
- **Schede Personaggio:** ogni scheda fonde il **ritratto dell'eroe** (stessa arte delle
  carte Eroi) attraverso lo **strappo trasparente reale** di
  `artworks/background scheda personaggio 2.png` (canale alpha vero, non un placeholder:
  vedi `torn_portrait()`/`_cover_image()` in `src/deluxe_style.py`). Usa **solo** la
  variante con strappo in basso a destra: quella in alto invaderebbe nome/statistiche/
  abilità, zona troppo densa. Il ritratto è cover-fit sulla sola finestra dello strappo
  (mai sull'intera pagina, altrimenti zooma a caso) con `top_margin`/`overscan` tarati per
  vedere la figura quasi intera senza tagliare la testa sul bordo frastagliato — se
  aggiungi un settimo eroe, genera prima un ritratto di prova e verifica a video prima di
  fissare i parametri.
- **Due biografie per eroe (breve + estesa):** ogni eroe ha *due* testi in
  `src/story.py`. `BIO` è la versione **breve** (4–5 righe), stampata sulla **carta
  Eroe** (`cards-data.js`), dove lo spazio è poco e il ritratto è il protagonista.
  `BIO_SCHEDA` è la versione **estesa e immersiva** (~11–12 righe), usata **solo sulla
  Scheda Personaggio**, dove c'è respiro: sensoriale, con una scena o un'abitudine
  concreta, una paura, un dettaglio d'ambientazione 1889 gaslamp gothic. `apply()`
  popola `hro['bio_scheda']` con fallback a `bio` se manca. Il riquadro "chi sei" della
  scheda (`gen_deluxe.py`) è alto ~60mm = ~12 righe a corpo 9.8: **non sforare**, la bio
  estesa che eccede finisce sotto le caselle statistiche (verifica a video le due più
  lunghe dopo ogni modifica). Un eroe nuovo porta **entrambe** le versioni.
- **Sigillo di cera:** l'arte sorgente (`artworks/Sigillo.jpg`) ha spesso una scacchiera
  grigia cablata nei pixel al posto della trasparenza vera (jpg, niente alpha): va isolata
  con una soglia di saturazione (la scacchiera è grigia desaturata, cera e oro no) + crop
  al bounding box, salvata come .png con alpha reale prima di poterla usare in `seal()`.
- **Glifi mancanti nei font (verificato due volte, controlla sempre prima di usarli):**
  **IM Fell English SC** (font small-caps dei titoli, `F['sc']`) non ha il segno meno
  tipografico **−** (U+2212) né la nota musicale **♪** (U+266A) — escono come quadratino
  vuoto. Usa il trattino ASCII **-** (U+002D) al posto di − ovunque in quel font; per
  simboli decorativi usa glifi verificati presenti (es. **†**, bullet, asterisco). Se in
  dubbio, verifica col cmap del font (`fontTools`) prima di generare, non dopo.
- **File di output:** `pdf/01-Regolamento`, `pdf/02-Schede-Personaggio`,
  `pdf/06-Aiuto-Giocatore` (riepilogo regole da tavolo, **una sola pagina**, stesso
  sfondo/stile ma senza banner H1 pesanti — è un cheat-sheet, deve restare
  scannerizzabile a colpo d'occhio) sono comuni a tutta la campagna. Ogni episodio
  ha una sua sottocartella `pdf/Episodio N/`: `Indagine` (lettera d'incarico +
  taccuino), `Spedizione` (note tessera + segnalini), `Luoghi` (riferimenti per
  chi arbitra), `Soluzione (non aprire)` (sigillata, con avvertimento iniziale).
  Le carte stesse (dorso Approfondimenti, titolo Oggetti) non mostrano MAI il
  luogo/tessera d'origine, solo `Luoghi.pdf` lo dice.
- **`Luoghi.pdf` (`src/gen_narrator.py`; il Preludio ha l'equivalente in
  `gen_preludio.py::luoghi()`, stesso pattern):** una pagina per luogo più le
  tessere che nascondono un oggetto da Cercare. Stile scheda personaggio: arte
  del luogo/tessera fusa nello strappo trasparente reale di
  `artworks/background scheda personaggio.png` (la variante con lo strappo **in
  alto**, per opporsi visivamente alle schede eroe che usano quella in basso —
  vedi `torn_portrait(..., window=WINDOW_TOP)`), con numero/nome in alto a
  sinistra dell'arte e sotto, nella stessa colonna, una **descrizione densa e
  coinvolgente** della scena — non il testo terso della carta Luogo/Tessera, ma
  una versione più estesa e sensoriale (suoni, odori, temperatura, un dettaglio
  che stona), pensata per essere letta o improvvisata a voce da chi arbitra:
  stessi fatti e stesse battute di dialogo della carta, mai nuove informazioni
  o contraddizioni. Per le tessere con una regola in chiaro (prove NERVI,
  apparizioni) la frase meccanica va mantenuta **verbatim** dentro il testo
  arricchito, non riscritta. La colonna si auto-adatta in altezza (riduce il
  font finché non entra, vedi `fit_desc()`) così si può scrivere quanto serve
  senza contare le righe a mano. Sotto la riga separatrice, in ordine:
  (1) **"indizi — leggeteli ad alta voce"**, i 3 indizi core del luogo
  (`LUOGHI[n]['indizi']` in `gen_cards.py`, verbatim — la carta fisica non li
  porta più, questa è la loro unica sede), poi una seconda riga separatrice e
  (2) **"carte da prendere — solo per chi arbitra"**, l'elenco essenziale
  `Tipo — carta "Titolo"` per ogni Approfondimento/Oggetto di quel luogo/
  tessera, mai il loro contenuto (quello lo dice la carta stessa una volta
  trovata) — questa seconda parte non va mai letta ad alta voce, è l'unica
  informazione del fascicolo riservata a chi arbitra.
- **Taratura dell'arte in `Luoghi.pdf` (verifica sempre a video, non dare per
  buono il ritaglio di default):** la finestra è stretta e verticale, ma quasi
  tutta l'arte sorgente è panoramica (2688×1792 tipico da Midjourney) — col
  ritaglio "cover" di default (`overscan=0.75, top_margin=0, center_x=0.5`) si
  vede solo il 57% superiore dell'immagine, centrato orizzontalmente: se il
  soggetto (un volto, un oggetto chiave) non è già in quella fascia, sparisce
  dal ritaglio anche se è ben visibile nell'arte originale — successo
  nell'Ep. 1 a metà delle 8 pagine. Dopo aver generato ogni pagina, guarda
  l'arte originale in `artworks/` e confrontala col render: se il soggetto non
  si vede bene, aggiungi una voce in `LUOGHI_CROP` (`gen_narrator.py`) o
  `LUOGHI_P_CROP` (`gen_preludio.py`), stesso principio di `MINI_CROP` per le
  miniature — `overscan` più basso mostra più immagine (meno zoom, utile se il
  soggetto è centrato verticalmente invece che in alto, es. una campana a
  mezza altezza); `top_margin` sposta il ritaglio più in basso nell'immagine
  (utile se il soggetto è più in basso del previsto, es. dei volti); `center_x`
  (0=sinistra, 0.5=centro, 1=destra) sposta il ritaglio in orizzontale (utile
  se il soggetto non è centrato, es. un personaggio spostato a destra
  nell'inquadratura) — non esisteva prima di questa correzione, è stato
  aggiunto a `_cover_image()`/`torn_portrait()` in `src/deluxe_style.py`
  apposta per questo. Regola pratica: parti da un piccolo aggiustamento
  (overscan 0.1-0.15, top_margin 10-15mm, center_x 0.15-0.85), rigenera,
  guarda di nuovo — non serve calcolare i valori esatti, bastano 1-2 iterazioni
  a occhio.
- **Tipi di carta completi:** Eroi, Nemici, Minacce, Luoghi, Indizi Nascosti,
  Testimoni, Referti, **Oggetti**. Luoghi e Indizi Nascosti riusano la stessa
  arte (stesso soggetto, due carte); Testimoni/Referti riusano l'arte del loro
  Luogo; **Oggetti hanno arte dedicata**, mai riusata (sono nature morte a sé,
  non scene). **Eroi** sono solo ritratto+ruolo+bio (zero meccanica, quella
  sta sulla Scheda Personaggio): servono a stendersi sul tavolo per la scelta
  del personaggio a inizio serata (vedi Regolamento, sezione "I PERSONAGGI")
  — non sono decorative, hanno uno scopo d'uso definito, non vanno trattate
  come orfane. Genera i nuovi mazzi con
  `node scripts/cardconjurer/generate-batch.js <gruppo>` (vedi `README.md`
  per la lista gruppi aggiornata).
- **Dove finiscono i file (`cards/`, `board/`, `reperti/`): stesso schema di
  `pdf/`.** Quello riusabile tra episodi (Eroi, Malavita) sta al livello
  comune (`cards/Eroi/`, `cards/Nemici/` — solo Sgherro/Sicario); tutto il
  resto del nuovo episodio va sotto una sua sottocartella, mai al livello
  comune: `cards/Episodio N/<Tipo>/`, `board/Episodio N/`,
  `reperti/Episodio N/`. In `cards-data.js` questo si imposta nel campo
  `file` di ogni carta (es. `` `Episodio ${N}/Luoghi/${...}` ``) — vedi come
  già fatto per l'Episodio 1 e per `NEMICI.forEach()`, che smista i nemici
  del culto in `Episodio 1/Nemici/` e lascia la Malavita in `Nemici/` in base
  al campo `type`.
- Tecnica: Python + reportlab, grafica vettoriale (sorgenti di riferimento nel repo:
  `src/deluxe_style.py`, `src/ornaments.py`, `src/gen_gothic.py`, `src/gen_docs.py`,
  `src/gen_deluxe.py`, `src/gen_narrator.py`).
  Illustrazioni raster generate con AI (vedi `PROMPT-MIDJOURNEY.md`) vanno inserite come
  arte di sfondo delle carte (cardconjurer) o come quadro/ritratto nei documenti,
  mantenendo cornici e testo vettoriali sopra.

## 3-bis. BIBBIA DI SCRITTURA (stile immersivo — obbligatoria)

Ogni testo deve far *vedere* la scena, non riassumerla. Regole:

- **Carte Luogo:** il testo d'apertura (l'unico testo stampato sulla carta fisica,
  vedi Bibbia Visiva — gli indizi non ci stanno più) è un quadro di 3–4 frasi con
  dettagli sensoriali (odori, suoni, temperatura) e un dettaglio umano che stona o
  inquieta (la cena intatta sotto il panno, le mani nascoste dietro la schiena, lo
  sguardo che evita il vostro). I PNG parlano in discorso diretto tra virgolette
  basse «». Gli **indizi** (3 per luogo, in `LUOGHI[n]['indizi']`, stampati solo in
  `Luoghi.pdf`, mai sulla carta) restano fattuali e asciutti: l'atmosfera sta nel
  testo d'apertura, la deduzione negli indizi.
- **Carte Minaccia:** sempre una riga di *flavor in corsivo* prima dell'effetto,
  massimo 12 parole, in seconda persona plurale, che colpisce un senso o insinua
  un dubbio (es. «Qualcuno pronuncia il vostro nome. Con la vostra voce.»).
  L'effetto meccanico segue, separato, senza aggettivi.
- **Tessere:** 2–3 frasi sensoriali sul luogo, poi l'eventuale regola in chiaro
  (prove, apparizioni) scritta in tono da regolamento. Non superare ~15 righe
  misurate a 8.3pt su 116mm di larghezza.
- **`Luoghi.pdf` — descrizione atmosferica (per chi arbitra, letta o
  improvvisata a voce a tutti):** stessi fatti e battute del testo d'apertura
  della carta Luogo/Tessera, ma **molto più estesi e sensoriali** — qui lo
  spazio non è tirato, la colonna si auto-adatta, quindi si scrive un quadro
  pieno: non solo odore/suono/temperatura ma anche un piccolo dettaglio che si
  muove o cambia durante la scena (un'ombra, un rumore che si ferma quando ci
  si ferma, una mano che trema), utile a chi arbitra per improvvisare risposte
  alle domande dei giocatori. Mai una nuova informazione o un indizio che non
  sia già altrove: solo più aria attorno agli stessi fatti. Le eventuali regole
  in chiaro (prove NERVI, danni, apparizioni) restano **testo verbatim**, mai
  parafrasate: sono meccanica, non atmosfera. **Vale per ogni fascicolo
  `Luoghi.pdf` del progetto, incluso quello di un Preludio/mini-episodio**:
  ogni generatore ha un proprio dizionario dedicato (`LUOGHI_DESC` in
  `gen_narrator.py`, `LUOGHI_P_DESC` in `gen_preludio.py`, stesso nome
  `*_DESC` per un episodio futuro) — **mai** passare a `fit_desc()` il campo
  `testo` della carta fisica: sono due testi diversi con due scopi diversi,
  anche se raccontano la stessa scena (bug reale successo nel Preludio:
  `luoghi()` stampava `L['testo']`, lo stesso testo terso della carta, finché
  non è stato introdotto `LUOGHI_P_DESC`).
- **`Luoghi.pdf` — sezione indizi (leggeteli ad alta voce, sotto la descrizione
  atmosferica):** qui gli indizi sono riportati **verbatim**, esattamente come
  scritti per `LUOGHI[n]['indizi']` — stesso registro fattuale/asciutto della
  voce "Carte Luogo" sopra, non vanno riscritti in tono più letterario solo
  perché ora c'è più spazio: restano indizi da dedurre, non prosa da assaporare
  (quella è già la descrizione atmosferica appena sopra).
- **Schede eroe:** sezione «Chi sei» di 3 frasi: origine, ferita o svolta che li
  ha portati alla Società, un tratto o una battuta che li definisce. Niente
  elenchi: prosa in corsivo, seconda o terza persona coerente con le esistenti.
- **Nemici:** 2–3 frasi che li rendono persone o cose sbagliate, non mostri
  generici (gli Adepti sono «gente comune che alle 3 di notte smette di essere
  gente comune»). La debolezza del boss va integrata nel testo, tra parentesi
  le meccaniche. La Malavita (Sgherro/Sicario) è deliberatamente **senza** soprannaturale:
  niente cera, maschere o rituale — sono criminali comuni, il testo li tratta come tali.
- **Carte Approfondimento (Osservazione/Referto/Testimonianza/Presagio):** una riga o
  poche, tono coerente col verbo — Osservazione è un dettaglio fisico notato da Elena
  ("le mani tremano su un solo scaffale"), Referto è clinico/forense (voce di Attilio),
  Testimonianza è discorso diretto o riportato di chi parla, Presagio è sensoriale/
  occulto (voce di Sibilla, mai spiegato razionalmente — l'unico tipo dove un accenno
  onirico/soprannaturale è coerente, non un'eccezione bolt-on). Il nucleo garantito
  (vedi 1-bis) va infilato dentro il testo, restando nel registro proprio del tipo:
  mai un frammento a parte che rompe il tono, nessuna carta deve suonare "diversa"
  dalle altre del suo stesso tipo. Restare sotto **~65-70 parole** (vedi il limite
  di lunghezza in Bibbia Visiva): sono queste le carte più a rischio di riempire
  il box fino al bordo, perché portano sia atmosfera sia il nucleo garantito.
- **Carte Oggetto:** una riga di flavor (mai un dato di gioco, solo atmosfera —
  "freddo, pesante, già piegato da altre porte"), poi l'effetto meccanico copiato 1:1
  dalla fonte, senza aggettivi, come le Minacce.
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

- [ ] Le 4 Domande sono tutte deducibili dai soli indizi **core** (senza Approfondimenti) e
      ogni risposta incrocia più luoghi?
- [ ] Almeno un dettaglio decisivo per 1-2 Domande (mai tutte e 4) emerge **solo** tramite
      Approfondimento, scritto dentro il testo di OGNI carta di quell'episodio (mai un
      frammento condiviso appeso in coda)?
- [ ] Ogni eroe ha il suo verbo in Indagine (vedi 1-bis per l'elenco completo dei sette
      che producono carte e dei quattro che non lo fanno) e le coppie di eroi più
      probabili a un tavolo da 2 possono sbloccare almeno un Approfondimento?
- [ ] Il mazzo Approfondimenti ha dorsi con SOLO il tipo (mai il numero del luogo né il
      contenuto)? Le carte Oggetto hanno solo il nome (mai il luogo/tessera d'origine)?
- [ ] Ogni oggetto trovabile (Indagine o Cercare) ha una carta Oggetto con arte dedicata,
      flavor breve ed effetto copiato 1:1 dalla fonte? C'è almeno un oggetto-esca?
- [ ] Ci sono false piste che reggono ma vengono smontate da un indizio trovabile, e almeno
      un vicolo cieco a costo vero (vedi 1-quater, non solo piste a costo zero)? Il dato
      rivelatorio (chi è il colpevole) è concentrato in 2-3 carte designate e sempre
      raggiungibili senza chiavi, non su tutte le carte Approfondimento (vedi 1-bis)?
      `scripts/simulate_playtest.py` conferma che un party plausibile la trovi quasi sempre?
- [ ] Il boss ha una debolezza scoperta durante l'indagine?
- [ ] Il Canto (o equivalente) ha due fonti di avanzamento (carte + automatico ogni 4°
      round) ed è spiegato per intero nel **Regolamento**, non solo nella Soluzione sigillata?
- [ ] Il tempo d'indagine è scarso e c'è un vincolo d'orologio? C'è l'oggetto-esca?
- [ ] La difficoltà segue la scala dell'episodio corrispondente (una-due manopole, non tutte)?
- [ ] Parole chiave in MAIUSCOLO e requisiti di sblocco stampati sulle carte?
- [ ] Le 20-23 carte Minaccia hanno tutte titolo unico, flavor proprio e icona di famiglia?
      Hai riusato Sgherro/Sicario (Malavita) invece di inventare nemici umani nuovi?
- [ ] I prompt Midjourney dei nuovi soggetti (inclusi eventuali nuovi Oggetti) sono stati
      aggiunti a `PROMPT-MIDJOURNEY.md`?
- [ ] Epilogo + Frammento numerato + aggancio + Bivio sigillato con conseguenze definite?
- [ ] Le conseguenze del Bivio dell'episodio precedente sono applicate all'inizio?
- [ ] Ci sono 2–3 reperti stampabili coerenti con gli indizi?
- [ ] Palette, font, sigilli, formati e dorsi identici alla bibbia visiva? Hai controllato
      che i caratteri usati coi font small-caps esistano davvero nel cmap (niente − o ♪)?
- [ ] Tutti i testi rispettano la bibbia di scrittura (flavor sulle Minacce,
      quadri sensoriali sui Luoghi, «Chi sei» sugli eroi) e stanno nei riquadri?
- [ ] Il file PDF 06 (Aiuto-Giocatore) è aggiornato e sta ancora su una sola pagina?
- [ ] `Luoghi.pdf` esiste per il nuovo episodio (Preludio incluso, se previsto), con una
      pagina per luogo (più le tessere che nascondono un oggetto), descrizione
      atmosferica densa da un dizionario `*_DESC` **dedicato** (mai il campo `testo`
      della carta fisica passato direttamente a `fit_desc()`), sezione **indizi verbatim
      leggibile ad alta voce** ed elenco Approfondimenti/Oggetto (solo per chi arbitra)
      corretto?
- [ ] Le carte Luogo mostrano **solo** il testo d'apertura (mai gli indizi)? Ogni carta
      Approfondimento resta sotto ~65-70 parole (verificato a video, non solo contate)?
- [ ] Hai guardato ogni pagina di `Luoghi.pdf` a confronto con l'arte originale in
      `artworks/`? Se il soggetto non si vede bene nel ritaglio, hai tarato
      `LUOGHI_CROP`/`LUOGHI_P_CROP` (overscan/top_margin/center_x)?
- [ ] Le carte spawn di nemici piazzano "sull'uscita più vicina agli eroi" (non
      "più lontana"), salvo le eccezioni tematiche dichiarate (inseguitori dalla
      Banchina, carte "si attiva subito")?
- [ ] Stampa a bucket (Comune vs Preludio vs episodio): ogni nuova carta
      Nemico/Minaccia in `cards-data.js` ha un `file` che comincia per
      `Episodio N/...` se specifica di questo episodio, o senza quel prefisso
      (`Nemici/`, `Minacce/`) solo se davvero riusabile ovunque come la
      Malavita (vedi `bucketOf()` in `generate-print-sheets.js` — sbagliare il
      prefisso non rompe nulla a schermo, ma stampa la carta nel PDF sbagliato).
      Aggiunta una voce in `BUCKETS` dentro `scripts/merge-print-all.py` per il
      nuovo episodio? Chi ha già il Comune non deve MAI dover ristampare
      Eroi/Malavita/tessere per giocare un episodio nuovo.

---

**La mia richiesta:** _(scrivi qui, es.: «Genera l'Episodio 2, "Le voci del pozzo",
completo di tutti i PDF» oppure «Crea un sesto eroe» o «Progetta il finale di campagna»)_
