# Audit del bilanciamento fra le classi — Indagine e Spedizione

**12/08/2026.** La domanda posta: *il gioco è giocabile con ogni combinazione
di eroi?* Undici eroi, squadre da quattro: **330 combinazioni**. Questo
referto risponde separatamente per le due metà della serata, perché le due
metà usano statistiche diverse e premiano eroi diversi.

## Verdetto in tre righe

1. **Nessuna combinazione è ingiocabile in Indagine.** Nessun contenuto è
   chiuso a chiave dietro un eroe: le 4 Domande si rispondono con gli indizi
   core in tutti e 21 gli episodi (verificato uno per uno), e dove serve
   un'abilità che manca c'è l'**aiuto profano** o il **Grimaldello** di Nino.
   La differenza è di ricchezza, non di esito: la squadra migliore coglie
   **4,8 Approfondimenti a episodio**, la peggiore **1,9** — ×2,6.
2. **In Spedizione no: il VIGORE decide.** 1200 partite misurate, 240 per
   squadra: la squadra di ferro vince il **54%**, quella di vetro il **33%**.
   Ventun punti, sei volte l'incertezza — non è rumore. E l'ordine è
   *esattamente* l'ordine del VIGORE totale, senza eccezioni.
3. **Quattro episodi sono di fatto chiusi a chi non picchia**: Ep. 9, 11, 15 e
   19, dove la squadra di vetro sta fra 0% e 20% e quella di ferro fra 35% e
   65%. L'**11%** delle 330 squadre non ha nemmeno un eroe con VIGORE ≥ 2.

E il difetto che rendeva tutto questo peggiore di quanto dovesse essere: **in
modalità digitale tre abilità di Spedizione e nove oggetti personali erano
stampati e non facevano niente** (§5) — e appartengono in maggioranza proprio
agli eroi fragili.

> **Aggiornamento della sera del 12/08.** Le tre abilità sono state accese
> (Voce ferma, Esca preziosa, Colpo da macello) e le due porte dell'Ep. 9 sono
> state riaperte agli indizi core. Rimisurato: **il divario fra la squadra di
> vetro e quella di ferro passa da 21 punti a 7**, e l'Ep. 19 esce dalla lista
> degli episodi chiusi. I dettagli nel §7 — e le sezioni 2-4 restano scritte
> com'erano, che è la fotografia di prima.

---

## 1. Come è stato misurato

Due strumenti, tutti e due nuovi, perché la domanda non ne aveva.

| | strumento | cosa fa |
|---|---|---|
| Spedizione | `webapp/misura-classi.mjs` | pilota Playwright (`misura-episodio.mjs`) con `PARTY=` fisso: 5 squadre × 12 episodi × 20 partite = **1200 partite vere** sul motore digitale |
| Indagine | `webapp/misura-indagine-classi.py` | il conto esatto delle regole di `indagine.js` con dadi veri, su **tutte e 330** le squadre × 21 episodi |

Il secondo non è un pilota ed è dichiarato tale: il pilota Playwright **non
gioca l'Indagine**, la semina come esito, quindi quella metà della serata non
aveva nessuno strumento. Il modello è scritto in testa al file, e sottostima
di proposito (non modella Ombra di Mora, il Discernimento di Marani, la
macchina fotografica di Carla — che comunque, §5, nell'app non esiste).

**Il limite dello strumento, dichiarato:** il pilota si impianta. Su Ep. 1,
30% delle partite con squadra casuale e 45% con la squadra «vetro» finiscono
in stallo — il gruppo si sparpaglia e smette di avanzare. È il difetto noto
(«un pilota greedy per-eroe non produce gioco di squadra», BILANCIAMENTO.md),
e qui pesa **contro le squadre fragili**, che si decimano prima. Gli stalli
contano come non-vittorie. Quindi i numeri bassi delle squadre deboli sono un
**pavimento**: un tavolo umano coordinato fa meglio.

### 1.1 Un difetto dello strumento trovato strada facendo — e corretto

La prima tornata di misure dava sull'**Ep. 9** un divario che sembrava enorme:
0% per quattro squadre su cinque e 90% per la quinta. Riprodotto due volte,
quindi non rumore. Isolando eroe per eroe, la causa non era la squadra: erano
**gli stessi quattro eroi scritti in un ordine diverso** — `ELENA, OTTONE,
MARN, BRERA` vinceva il 60%, `MARN, ELENA, OTTONE, BRERA` il 10%.

Il motivo sta nel motore: `iniziaPartita()` (`digitale.js:328`) piazza gli
eroi sulla tessera d'ingresso **nell'ordine del party**, cioè nell'ordine in
cui li si è arruolati. Per un tavolo umano è irrilevante — al primo turno ci
si muove — ma per un pilota che punta la meta e va, chi parte davanti tira
tutto il gruppo, e chi parte davanti dipende da dove è scritto.

`misura-episodio.mjs` ora **rimescola l'ordine a ogni partita** anche con
`PARTY=` fisso: la sedia non è una proprietà della squadra. Verificato non
vacuo: gli stessi due ordini, dopo la correzione, danno 50% e 25% — e quattro
corse identiche della stessa squadra danno 20-25-30-40%, cioè **il rumore a 20
partite è ±10-20 punti**. Da qui la regola di lettura di questo referto:
*la singola casella non significa niente; conta la media sui dodici episodi*
(240 partite per squadra, incertezza ~3 punti).

Tutte le misure del §4 sono state **rifatte da zero** dopo questa correzione.

---

## 2. Indagine — chi apre cosa

Gli Approfondimenti sono di quattro tipi, e ogni tipo ha i suoi lettori.
Questa è tutta la matrice:

| tipo | quanti in campagna | chi lo apre | cariche |
|---|--:|---|--:|
| Osservazione | 59 | **Elena** | 2 |
| Testimonianza | 55 | **Ottone**, **Carla** | 1+1 |
| Referto | 49 | **Marn**, **Brera** | 1+1 |
| Presagio | 34 | **Serra** | 1 |
| *(qualsiasi)* | — | **Sibilla** (jolly) | 1 |
| nessuno | — | Nino, Marani, Carbone, Mora | 0 |

Due conseguenze immediate.

**La copertura è asimmetrica.** Osservazione (il tipo più diffuso) e Presagio
hanno **un solo lettore a testa**; Referto e Testimonianza ne hanno due.

| tipo | squadre che non hanno nessuno che lo apra |
|---|--:|
| Osservazione | **126/330 = 38%** |
| Presagio | **126/330 = 38%** |
| Referto | 70/330 = 21% |
| Testimonianza | 70/330 = 21% |

**Esiste esattamente una squadra a zero cariche**: Nino + Marani + Carbone +
Mora — i quattro eroi senza cariche d'Indagine sono precisamente quattro. Per
loro ogni Approfondimento passa dall'aiuto profano: ACUME (Difficile), una
sola occasione per luogo, **al massimo il 42%** di riuscita col miglior ACUME
in campo.

### 2.1 Il divario misurato

330 squadre, 21 episodi, 20 partite ciascuna. Approfondimenti colti per
episodio:

| | squadra | colti |
|---|---|--:|
| peggiore | nino, ottone, carbone, mora | **1,9** |
| mediana | nino, carla, serra, mora | 3,6 |
| migliore | elena, carla, serra, celso | **4,8** |

**×2,6 fra i due estremi.** Quanto sposta ogni eroe, come media delle squadre
che lo contengono: carla **4,0** · elena 3,8 · brera/serra/celso 3,6 ·
sibilla 3,5 · marn 3,4 · ottone/mora/nino/carbone **3,3**.

Carla è la più forte non per la carica ma per la **visita gratuita**: un'ora
in più su sei è +17% di città vista. Marani vale lo stesso senza avere
cariche, ed è il motivo per cui compare fra le squadre migliori pur non
leggendo niente.

*Il numero è stato provato non vacuo:* dando a tutti e undici gli eroi la
stessa carica, il divario collassa da 1,9–4,8 a **3,2–4,8**, e quel che resta
è solo ACUME più le due visite gratuite. Cioè: il ×2,6 lo produce
l'asimmetria delle cariche, non il modello.

### 2.2 Le due porte dietro un'abilità — **corrette il 12/08**

Cento luoghi chiusi in campagna, novantasei aperti da una parola. Controllata
una per una: da dove viene, e se quella fonte è un indizio core (si legge
visitando) o un Approfondimento (serve l'abilità giusta).

Due porte erano dietro un'abilità, tutte e due nell'Ep. 9:

| luogo | parola | stava solo in | ora |
|---|---|---|---|
| L7 · La casa del teste | «l'oro della parcella» | **una** Testimonianza (L3) | nominata negli indizi core di L2 (la Gazzetta) e L5 (lo studio) |
| L6 · La sacrestia del tribunale | «la deposizione di domani» | un'Osservazione (L1) o una Testimonianza (L4) | nominata nel ruolo d'udienza, indizio core di L1 |

In tutt'e due i casi il fatto **era già** negli indizi core: la parcella d'oro
vecchio è descritta due volte, la deposizione di domani è scritta sul ruolo
d'udienza. Mancava solo che il testo la chiamasse **col nome che apre la
porta** — il commento in cima a `gen_ep9.py` dichiarava già l'intenzione
(«l'oro della parcella da L3 e L2»), e la prosa non la rispettava. Corretto
riscrivendo tre righe, senza aggiungere informazione.

Le quattro porte che restano senza fonte testuale (Ep. 6 L9, Ep. 7 L9, Ep. 8
L9, Ep. 9 L9) si aprono con un **oggetto**, non con una parola: l'oggetto sta
in un luogo raggiungibile, verificato.

> **Nota sul metodo, perché non si ripeta.** La prima lettura di questa
> sezione dava *tre* porte, e la terza (Ep. 6 L8, «il maestro dei registri»)
> non era vera: il mio strumento cercava la parola **con l'articolo**, mentre
> `bussa()` in `engine.js` lo toglie da tutt'e due i lati. Un indizio core del
> Palazzo del Lume la nomina eccome. Il difetto poteva solo inventare porte
> chiuse, mai dichiararne aperte una davvero chiusa — ma è stato trovato
> leggendo il testo, non rileggendo il codice.

### 2.3 Le 4 Domande: nessuna è dietro una classe

Controllate tutte, episodio per episodio, cercando la risposta prima negli
indizi core e poi negli Approfondimenti. **Ogni risposta ha una fonte core.**
L'unico caso senza fonte nel proprio episodio è l'Ep. 6, «CHI dirige il
rito? → Bastiano Ferri»: la risposta è il finale dell'Ep. 1, ed è
deliberatamente memoria di campagna.

Quindi il vantaggio d'Indagine — lo Slancio, la Salute in più in Spedizione —
**è alla portata di tutte le 330 squadre**.

---

## 3. Spedizione — cosa dicono le statistiche prima dei dadi

Gli undici eroi stanno in pochi gruppi. Sette su undici hanno **VIGORE 1**;
i combattenti veri sono quattro (Ottone 3, Mora 3, Marn 2, Nino 2).

Estremi su tutte e 330 le squadre:

| | minimo | massimo |
|---|---|---|
| ACUME | 7 (marn, nino, ottone, carbone) | 12 (elena, carla, serra, brera) |
| VIGORE | 4 (carla, celso, carbone, brera) | 10 (marn, nino, ottone, mora) |
| NERVI | 6 (elena, marn, nino, mora) | 11 (sibilla, serra, celso, carbone) |
| Salute | 24 | 29 |

Tradotto in probabilità, contro il nemico tipico (Difesa 8, 20 nemici su 37):

- **colpi a segno per round** (un attacco a testa): 2,89 → 3,50. **+21%**;
- **fallimenti attesi su una prova NERVI (Media) «ogni eroe»**: 1,25 → 2,00.
  **+60%**.

Sulla carta il contrappeso c'è, ed è la cosa meglio pensata dell'impianto:
**le prove del gioco sono quasi tutte di NERVI** — 92 contro 29 di VIGORE e 3
di ACUME — e delle 89 carte con prova solo 36 lasciano scegliere chi la
affronta: **23 colpiscono ogni eroe** e 30 il più avanzato, quindi non basta
avere *un* eroe saldo di nervi. La squadra col VIGORE massimo (marn, nino,
ottone, mora) è **esattamente** quella col NERVI minimo. Sulla carta, chi
picchia più forte prende più danni dal mazzo, e la penalità NERVI (+60%)
sembra più grande del vantaggio in mischia (+21%).

**Sul tabellone non è così**, ed è il risultato principale di questo audit:
vedi §4. Il contrappeso è progettato e non funziona.

Come mai: +21% di colpi a segno è un vantaggio che si applica **due volte per
round per eroe, tutti i round**, mentre la penalità NERVI si applica quando
esce una carta con insidia, e costa 1 danno su 24-29 di salute. E la salute in
più (+21%) sta dalla stessa parte del VIGORE, non dall'altra: i quattro
combattenti sono anche i quattro più robusti. Le due leve non si oppongono —
si sommano.

Distribuzione del VIGORE su tutte e 330 le squadre: **11% sta a 4** (nessun
eroe VIGORE ≥ 2), 21% a 5, 28% a 6, 25% a 7, 15% a 8 o più.

---

## 4. Spedizione — la misura

12 episodi × 5 squadre × 20 partite = **1200 partite** sul motore digitale,
con l'ordine rimescolato a ogni partita (§1.1).

| episodio | vetro | ferro | occulto | muti | misto |
|---|--:|--:|--:|--:|--:|
| preludio | 45% | 20% | 50% | 30% | 20% |
| ep1 | 30% | 50% | 35% | 35% | 40% |
| ep3 | 80% | 95% | 80% | 80% | 85% |
| ep5 | 50% | 55% | 45% | 40% | 65% |
| ep7 | 5% | 20% | 5% | 20% | 20% |
| **ep9** | **0%** | 35% | **0%** | 15% | 35% |
| **ep11** | **0%** | 50% | 30% | 40% | 25% |
| ep13 | 85% | 95% | 90% | 90% | 85% |
| **ep15** | **5%** | 45% | **10%** | 30% | 10% |
| ep17 | 80% | 100% | 95% | 95% | 100% |
| **ep19** | **20%** | 65% | **20%** | 40% | 60% |
| ep20 | 0% | 15% | 0% | 15% | 0% |
| **media (240 partite)** | **33%** | **54%** | **38%** | **44%** | **45%** |

E la classifica coincide con una statistica sola:

| squadra | VIGORE tot | Salute tot | NERVI tot | vittorie |
|---|--:|--:|--:|--:|
| ferro | **10** | **29** | 6 | **54%** |
| misto | 7 | 27 | 9 | 45% |
| muti | 7 | 26 | 8 | 44% |
| occulto | 4 | 24 | **11** | 38% |
| vetro | 4 | 24 | 8 | 33% |

**Monotòna nel VIGORE, senza una sola inversione.** Il NERVI, che sulla carta
doveva compensare, non compensa: «occulto» ha il NERVI massimo della campagna
ed è la seconda peggiore. Ventun punti fra i due estremi, con 240 partite a
squadra: l'incertezza è ~3 punti, quindi sono **sei volte il rumore**.

### 4.1 I quattro episodi che si chiudono

Ep. **9**, **11**, **15** e **19**: la squadra senza VIGORE sta fra 0% e 20%,
quella di ferro fra 35% e 65%. Non sono episodi «duri per tutti» — l'Ep. 20 lo
è (0-15% per chiunque) e va bene così: è il finale. Questi quattro sono duri
**per una parte del tavolo soltanto**, e hanno una cosa in comune: chiedono di
**fermare qualcuno in fretta**. Scortare il teste dell'Ep. 9 mentre tre Sicari
lo bersagliano, ridurre il Caposquadra dell'Ep. 11 all'ultima Ferita senza
ucciderlo, l'Ep. 15 e l'Ep. 19 con la stessa fretta. Chi tira due colpi a
segno in meno per round arriva tardi, e tardi lì vuol dire mai.

### 4.2 L'ansia, per contro, sta meglio dove si vince meno

Picco medio di eroi a terra: vetro **2,0** · occulto **2,0** · misto 1,7 ·
muti 1,6 · ferro **1,3**. Il bersaglio dichiarato in BILANCIAMENTO.md è ≥ 1,0,
e ci stanno tutte — ma la squadra che vince di più è anche quella che rischia
di meno (1,3 contro 2,0). Non è un difetto da correggere: è la conferma che
la fragilità *si sente*. Il problema non è che le squadre di vetro soffrano —
è che soffrano **e perdano**.

---

## 5. Il difetto che va acceso prima di ritarare

In **modalità digitale** l'app fa da arbitro. Tre abilità di Spedizione sono
stampate sulla carta dell'eroe, hanno il bottone «usa», **spendono la carica e
l'azione — e non fanno niente**:

| eroe | abilità | cosa dovrebbe fare | nel codice |
|---|---|---|---|
| **Serra** | Voce ferma (3 usi) | +2 NERVI agli eroi adiacenti | `digitale.js:743` — «carica spesa, effetto narrato» |
| **Carbone** | Esca preziosa (2 usi) | attira i nemici entro 2 caselle | idem |
| **Ottone** | Colpo da macello | secondo attacco se abbatte in mischia | dichiarata «automatica», nessun codice |

Serra e Carbone sono attivamente **in perdita**: il bottone c'è, il gruppo lo
preme, e l'azione è persa. Il pilota fa lo stesso, quindi la misura del §4 le
conta come sono davvero.

E i **nove oggetti personali con effetto meccanico** (la lente di Elena, i
sali di Marn, i gessetti di Sibilla, il rampino di Nino, il fiasco di Ottone,
la macchina fotografica di Carla, il laudano di Serra, la stola di Marani, la
toga di Brera) sono **mostrati nella scheda e mai applicati**, in nessuna
delle due modalità. Al tavolo l'arbitro umano li applica leggendo la carta;
nel digitale non li applica nessuno.

Perché conta per questo audit: quegli oggetti sono quasi tutti **assicurazioni
proprio contro la debolezza della loro classe**. La stola di Marani annulla
una prova NERVI fallita contro un'insidia — cioè la cosa che il gioco chiede
92 volte. La macchina fotografica di Carla recupera l'Approfondimento che il
gruppo non ha potuto cogliere — cioè esattamente la falla del §2.1. Accesi,
il divario fra le classi si stringe da solo.

In **modalità tavolo** non c'è difetto: `spedizione.js` dichiara che tiene
solo il conto delle cariche e che l'effetto lo applicano i giocatori. Va
lasciata com'è.

---

## 6. Cosa propongo

In ordine: prima si accende ciò che esiste e non funziona, **poi** si rimisura,
e solo dopo si tocca un numero. Le prime due voci non sono tarature — sono
cose stampate sulle carte degli eroi che il motore digitale non applica, e
appartengono in maggioranza agli eroi che risultano deboli. Finché sono spente,
il 33% della squadra di vetro è una misura del gioco **incompleto**.

1. ~~**Accendere le tre abilità morte**~~ — **fatto il 12/08**: Voce ferma,
   Esca preziosa e Colpo da macello ora esistono nel motore digitale. Vedi §7
   per cosa è cambiato nei numeri, e `webapp/test-abilita.mjs` per la barriera
   che impedisce che tornino prosa. La modalità tavolo non è stata toccata.
2. **Accendere i nove oggetti personali**, o toglierli dalla scheda digitale.
   Cinque su nove sono difensivi (laudano, stola, fiasco, toga, sali) e stanno
   quasi tutti in mano agli eroi fragili: sono l'assicurazione che il progetto
   aveva previsto e il codice non ha mai stipulato. **Non fatto**: quattro dei
   nove sono *reazioni* (la stola di Marani annulla una prova NERVI già
   fallita, il laudano di Serra toglie 1 al danno che sta arrivando, la toga di
   Brera devia un attacco durante il turno dei nemici) e vanno offerte al
   giocatore nel mezzo di un tiro altrui. Come si chiedono senza spezzare la
   scena è una scelta di regia, non di codice, e la decide l'autore.
3. ~~**Rimisurare**~~ — **fatto**, §7.
4. Se il divario resta, la leva **strutturale** è sui quattro episodi del
   §4.1, non sulle statistiche degli eroi: Ep. 9, 11, 15, 19 chiedono tutti la
   stessa cosa (fermare qualcuno in fretta) e nessuno dei quattro offre una
   strada che non sia la mischia. Una via alternativa in ciascuno — bloccare
   invece di abbattere, un percorso che si può chiudere, un'azione che compra
   un round — vale più di +1 VIGORE distribuito a caso.
5. ~~**Ep. 9**, le due parole dietro un Approfondimento~~ — **fatto**: vedi
   §2.2. Nessuna porta della campagna è più chiusa dietro un'abilità.
6. **Presagio ha un lettore solo** per 34 carte, e Osservazione un solo
   lettore per 59. Il rimedio economico non è una carica in più a chi ce l'ha:
   è che **Carbone e Mora, che non leggono niente, leggano qualcosa** —
   l'antiquario dell'occulto e chi vive di voci sono i candidati naturali a
   Presagio e Testimonianza. Sono anche i due senza oggetti personali: oggi
   sono i due eroi più vuoti del gruppo.

Da **non** fare: livellare le statistiche degli eroi. Il disegno
VIGORE↔NERVI — chi mena prende, chi regge non sfonda — è giusto; quello che
non funziona è il cambio, non la moneta.

---

## 7. Cosa è cambiato accendendo le tre abilità (12/08, sera)

Applicati i punti 1 e 5 del §6, la misura è stata rifatta sui due estremi —
quelli fra cui stava il divario — sugli stessi 12 episodi, 20 partite per
casella, **480 partite**.

| | vetro (VIGORE 4) | ferro (VIGORE 10) | divario |
|---|--:|--:|--:|
| prima (abilità morte) | 33% | 54% | **21 punti** |
| dopo | **40%** | **47%** | **7 punti** |

**Il divario si chiude di due terzi.** Con l'avvertenza d'obbligo: fra le due
misure c'è anche il rumore (±3 punti a squadra), e il calo di «ferro» — che
dalle abilità nuove poteva solo guadagnare, col Colpo da macello — è per
forza in parte rumore. Il numero solido non è il singolo 40 o 47: è che due
misure indipendenti dopo la correzione danno 7 e 11 punti di divario, dove
prima ne davano 21.

E la mappa dei quattro episodi chiusi si accorcia a tre:

| episodio | vetro | ferro | |
|---|--:|--:|---|
| ep9 | 0% | 25% | ancora chiuso |
| ep11 | 5% | 35% | ancora chiuso |
| ep15 | 5% | 25% | ancora chiuso |
| **ep19** | **40%** | **50%** | **aperto** (era 20% contro 65%) |

L'Ep. 19 era il caso in cui il divario veniva dalle abilità mancanti, non
dalla struttura: è pieno di truppa (Malavita e Adepti) sparsa in stanze
larghe, e l'Esca di Carbone più la Voce ferma cambiano la serata. Gli altri
tre no: lì il problema è che l'obiettivo si raggiunge solo picchiando in
fretta, e nessuna abilità lo aggira. Restano il punto 4 del §6.

L'ansia non peggiora: picco medio 1,9 per «vetro» e 1,5 per «ferro» —
la squadra fragile continua a rischiare di più, e ora vince quasi quanto
l'altra. È esattamente lo stato che si voleva.

> **Un difetto dello strumento, trovato e corretto anche questo.** La prima
> rimisura dava Ep. 19 ed Ep. 20 allo **0% per tutte e cinque le squadre**, e
> sembrava una regressione grave del motore. Era il server locale
> (`webapp/server.js`) morto a metà corsa per `EMFILE: too many open files`
> dopo ~1200 partite: senza un gestore sull'evento `error` di
> `createReadStream`, il processo si spegne e le ultime caselle risultano zero.
> Ora l'errore si gestisce e il server resta in piedi. Vale la regola di
> sempre: prima di credere a un crollo, guardare se lo strumento è vivo.
