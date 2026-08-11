# Audit dei testi degli artefatti

**11/08/2026.** Corpus: `webapp/data/*.json` — 5.090 testi, 161.638 parole, di
cui **972 carte distinte** (429 minaccia, 197 approfondimento, 183 luogo, 115
oggetto, 37 nemico, 11 eroe). Cosa è stato letto e cosa solo passato al setaccio
sta nel §6, per intero.

Due famiglie di difetti, e vale la pena tenerle separate:

- **la regola** — §1, §2, §3: la carta dice una cosa che il gioco non sa fare,
  o la dice in un lessico che il resto del mazzo non usa;
- **la frase** — §4 e soprattutto **§5**: manca una parola, o è quella
  sbagliata. È la famiglia di *Corrente Gelida*, e si sente leggendo ad alta
  voce — che è come si usano questi testi.

Ogni voce dice **dove**, **cosa non va** e **perché è un difetto**, cioè cosa
succede al tavolo.

---

## 1. Difetti che si pagano in partita

### 1.1 DESTREZZA non esiste — 9 carte

`carte.json` · minacce ep13 (3), ep14 (4), ep16 (1), ep18 (1)

> L'eroe attivo prova **VIGORE/DESTREZZA** (Media)

Le statistiche del gioco sono ACUME, NERVI, VIGORE, Difesa, Salute (vedi
`comune.json`). **DESTREZZA non è una di quelle**, e nel resto del mazzo non
compare mai: 73 prove NERVI, 18 VIGORE, e queste 9. Chi pesca la carta cerca sulla
scheda un valore che non c'è.

C'è anche un secondo problema, indipendente dal nome: la barra. `VIGORE/DESTREZZA`
non dice se si sceglie, se si sommano, o se sono sinonimi. In nessun'altra carta
compare una prova a due statistiche.

Carte: *La Corrente della Roggia*, *La Passerella Scivolosa*, *Il Telaio che Cade*
(ep13); *Il Coppo che Frana*, *Il Vetro del Lucernario*, *La Fune Tesa*, *Il
Colombo in Volo* (ep14); *Il Lampadario che Oscilla* (ep16); *Il Buio che
Conoscete Male* (ep18).

**Rimedio:** `VIGORE` secco. È già la statistica che le carte gemelle usano per
la stessa cosa (*La Grondaia Marcia*, ep14: «prova VIGORE (Media)… uno strappo, un
volo breve»).

### 1.2 «verso Nord», ma il Nord non è mai definito — 5 carte

`carte.json` · minacce ep15, ep16, ep17, ep18, ep19

> Fino a fine round, sulla tessera dell'eroe attivo muoversi **verso Nord** costa
> il doppio.

Nessuno di quei cinque episodi nomina il Nord da nessun'altra parte: zero
occorrenze in `ep15/16/17/18/19.json`, tessere comprese. Il Nord esiste solo negli
Ep. 7 e 9, dove la nota d'arbitro lo dichiara sulla tessera.

Le venti carte *Ostacolo* che fanno la stessa cosa non nominano nessuna
direzione: «muoversi costa il doppio», e basta.

**Rimedio:** togliere «verso Nord» (allineandole alle Ostacolo), oppure stampare
la rosa dei venti sulle tessere di quei cinque episodi.

### 1.3 «a caso» e «sceglie» nella stessa frase

`carte.json` · minacce ep9 · *Insidia — La Folla che Spinge*

> Riva è spinto di 2 caselle **a caso (chi arbitra sceglie)**.

O è casuale o lo decide l'arbitro. Con un PNG da scortare la differenza non è
accademica: due caselle scelte male lo mettono in mano agli Sgherri.

### 1.4 Carte con la finzione al posto della regola — 4 carte

Sotto il `{divider}` va la regola; sopra la finzione. Su queste quattro, sotto il
divider c'è ancora finzione, e la carta non dice cosa fa:

| carta | testo sotto il divider |
|---|---|
| ep1 · *Corda di Violino d'Argento* | «una corda così la vende una sola bottega — e qualcuno, lì, potrebbe volerla indietro» |
| ep2 · *La Polizza del Monte* | «certe porte, davanti a chi restituisce, si aprono da sole» |
| ep3 · *Le Chiavi dei Chiusini* | «certe porte si aprono solo per chi può aprire anche i coperchi» |
| ep1 · *Quiete — Presagio* | «Un brivido corre lungo la schiena. Non accade nulla… per ora.» |

Il confronto sta nel Preludio, dove la stessa cosa è detta per intero:
*L'Anello di Chiavi* — «apre la porta della banchina (T1 → T2) con Interagire,
senza prove». E le altre 19 *Quiete* aprono tutte con «**Nessun effetto.**»
prima della battuta.

### 1.5 Due oggetti diversi con lo stesso nome

- **I Tappi di Cera**: ep3 «+1 alle prove NERVI contro suoni, echi e voci»;
  ep7 «un eroe ignora la PRIMA prova NERVI da rumore o allarme della spedizione».
- **Lanterna Cieca**: ep4 *Una* Lanterna Cieca «+1 alle prove NERVI finché la
  porta chi l'ha trovata»; ep11 *La* Lanterna Cieca «annulla il −1 alle prove di
  vento».

In una campagna dove gli oggetti si portano avanti, due carte con lo stesso nome
e regole diverse sono un contenzioso al tavolo.

### 1.6 Piazzamento incompleto — 3 carte

`carte.json` · minacce ep20

| carta | testo | cosa manca |
|---|---|---|
| *Le Voci Prezzolate* | «sull'uscita più vicina.» | più vicina **a chi** (le altre 400 dicono «agli eroi») |
| *Il Coro Stonato* | «sull'ingresso della tessera.» | «(dal lato da cui siete entrati)» |
| *Chi Trattiene la Candidata* | «Piazzate 1 Sgherro (impiegato).» | il posto, del tutto |

---

## 2. Il caso segnalato, e la sua famiglia

### 2.1 *Ostacolo — Corrente Gelida* (ep1)

> Fino all'inizio del **vostro** prossimo turno **ogni eroe** ha -1 al Movimento
> (minimo 1).

Tre cose in una riga sola:

1. **«il vostro prossimo turno» non è un momento del gioco.** Nel mazzo il turno
   è sempre di *uno*: 35 carte dicono «chi fallisce ha 1 sola azione al prossimo
   turno», riferito a un singolo eroe. Un turno collettivo non esiste, quindi non
   si sa quando l'effetto scade.
2. **La persona cambia a metà frase**: «vostro» (voi, il gruppo) e poi «ogni
   eroe» (loro). Le altre carte restano su una persona sola.
3. **È un unicum**: è l'unica carta del gioco con questa durata. Le altre 26 che
   durano un round dicono tutte «**Fino a fine round**».

**Riscrittura proposta**, nel lessico che il mazzo usa già:

> Fino a fine round ogni eroe ha −1 al Movimento (minimo 1).

E la riga di finzione, sopra il divider, è sbagliata a sua volta:

> **Un freddo** d'acqua nera risale i condotti e vi entra nelle ossa.

«Un freddo d'acqua nera» che *risale i condotti*: manca il sostantivo, e un
freddo non risale niente. Non è una supposizione — il testo da cui la carta è
stata compressa è nell'episodio, `ep1.json` · Il Canale Basso:

> «una **corrente** più fredda delle altre risale dai condotti e vi si infila
> sotto i vestiti»

La parola persa è **corrente**, che è anche il titolo della carta.

> Una corrente d'acqua nera risale i condotti e vi entra nelle ossa.

### 2.2 La stessa famiglia, altrove

- **ep11 · *La Tegola che Scivola*** — «perde **lo scatto**». «Scatto» non compare
  in nessun altro testo del gioco. Le altre otto carte dicono «perde il movimento
  extra».
- **ep13 · *La Corrente della Roggia*** — «**1 round perso** a risalire», mentre
  ep14 · *Il Coppo che Frana*, per la stessa caduta, dice «resta un round
  aggrappato — **perde il turno**». Round e turno non sono la stessa unità.
  (Anche ep20 · *La Corrente Fredda*: «1 round perso a risalire».)
- **ep10 · *La Ninnananna di Ada*** e **ep11 · *Lo Sguardo in Giù*** — «L'eroe con
  meno NERVI prova NERVI», **senza** il «(a pari merito: sceglie il gruppo)» che
  le altre sei carte gemelle hanno sempre.
- **«per sempre» a intermittenza.** L'effetto di soglia «+1 carta Minaccia per
  Fase» è scritto «per sempre» in ep7, ep8, ep9, ep13, ep15, ep16, ep17, ep18,
  ep19 — e senza in ep11, in tre carte su quattro dell'ep12, e in ep20
  (*Il Dormiente si Muove*). Stesso effetto, durata dichiarata solo a volte.
- **ep11 · i tre *Crescendo* del vento** — «alzate di 1 la difficoltà delle prove
  di vento, **per sempre**», su tre carte identiche più *La Raffica sulla Guglia*
  che ne aggiunge un'altra. Non è detto se si sommano. Con tre pescate la
  difficoltà arriverebbe a +3, e nessuna carta lo conferma né lo esclude.

---

## 3. Incoerenze di forma sugli oggetti stampati

### 3.1 Sei carte nemico hanno il corsivo rovesciato

Su **966 carte su 972** la finzione sta in corsivo sopra il divider e la regola in
tondo sotto. **Sei no** — e sono le più vecchie, i nemici dell'Ep. 1:

*Adepto Incappucciato*, *Cane dei Moli*, *Il Fonditore*, *Il Custode della Cera*,
*Lo Sgherro*, *Il Sicario*.

Lì la finzione è in tondo e sotto il divider c'è «*Statistiche nel Bestiario
dell'episodio*» in corsivo. Conseguenza vera, non solo estetica: su tre di quelle
carte **una regola è finita nel blocco della finzione**, dove si legge come
racconto —

- *Lo Sgherro*: «Tattica del branco: se è adiacente a un altro Sgherro, ha +1
  Attacco.»
- *Il Sicario*: «Colpo a tradimento: +2 all'Attacco contro un eroe isolato… o già
  ferito.»
- *Il Custode della Cera*: «Se il diapason d'argento viene fatto vibrare a lui
  adiacente (azione): Difesa 5 per il resto della partita…»

### 3.2 Tre caratteri diversi per lo stesso «meno»

Nei testi di regola: `−` (U+2212, 7 volte), `-` (trattino, 3), `—` (lineato, 8).
Sulla carta stampata si vedono di lunghezze diverse.

### 3.3 Virgolette dritte dove il resto è curvo

44 casi, tutti `"`. I più visibili sono due nomi di eroe sulle carte personaggio:
`Nino "Grimaldello" Cauto` e `Ottone "Mezzena" Massari` — mentre
`Mora “Spilla” Fanti` ha le curve. Stessa fila di carte, due tipografie.

### 3.4 Formule gemelle scritte in tre modi

- «finché la porta chi l'ha **trovata**» (3) / «**presa**» (2) / «**comprata**» (1).
- *Il Diapason d'Argento* (ep1) dice «Difesa 5 per il resto della partita»,
  mentre i quattro oggetti equivalenti (ep2, ep3, ep4, ep5) dicono «Difesa
  **8→5**». Manca il valore di partenza proprio dove l'oggetto è il primo che si
  incontra.
- Le soglie: Ep. 1 e 2 dicono «**Al terzo**», dall'Ep. 3 in poi «**Alla soglia**».
  Stesso numero (`soglia_canto: 3`), due formule.

### 3.5 *Favore — Eco Amica* (ep1) fa una cosa diversa dalle sue gemelle

> Rivelate una tessera coperta adiacente **a una già rivelata**.

Le altre diciotto carte *Favore* dicono: «adiacente **a quella di un eroe** (la
scelgono i giocatori)». La versione dell'Ep. 1 è più permissiva (qualunque
tessera rivelata, anche lontana dal gruppo) e non dice chi sceglie.

---

## 4. Grammatica e refusi

Il corpus è tipograficamente sano: nessun `pò`, nessun `perchè`, nessun `qual'è`,
nessuna parentesi o virgoletta caporale spaiata in 5.090 testi. Restano:

- **`ep11.json` luoghi.1.indizi.2** — parola raddoppiata: «Le misure che non
  tornano **tornano** eccome». (Potrebbe essere voluto, come figura retorica: da
  decidere, non da correggere a occhi chiusi.)
- **`ep5.json` luoghi.4.indizi.1** — manca lo spazio dopo un punto.
- **8 casi di `...`** invece di `…` (Ep. 1, 4, 5 e due carte).
- **60 casi di ` - `** dove il resto del progetto usa ` — ` (quasi tutti nei
  titoli «Reperto A - …», che finiscono stampati).
- **ep17 · tre carte** dicono «−1 **morale**». Il termine è definito solo nel
  testo di una tessera dell'Ep. 17 («il MORALE (−1 NERVI a tutti)»), non sulla
  carta che lo usa.

---

## 5. La prosa: parole mancanti, parole sbagliate

Questa è la classe di cui *Corrente Gelida* è l'esempio: non regole, ma frasi.
Si sente leggendo ad alta voce, e a tavola si legge ad alta voce.

### 5.1 Il sostantivo che non c'è — 2 carte

Oltre a *Corrente Gelida* (§2.1), la stessa costruzione in:

**ep1 · *Insidia — Fumi Soporiferi***

> **Un dolciastro** di sego e papavero vi riempie i polmoni.

«Dolciastro» è un aggettivo usato come nome. Vuole il suo sostantivo: *un odore
dolciastro*, *un dolciore*. Entrambe le carte stanno nell'Ep. 1, ed entrambe
comprimono un testo d'episodio più lungo.

### 5.2 L'accordo appeso al titolo

**ep1 · *Insidia — Cera sotto i Piedi***

> Il pavimento cede morbido sotto lo stivale. **Era ancora calda.**

«Calda» è femminile e nel testo non c'è niente di femminile: l'unico
riferimento possibile è *la cera*, che sta soltanto nel **titolo** della carta.
Chi legge ad alta voce dice «era ancora calda» e nessuno sa cosa.

### 5.3 Gli accenti scritti con l'apostrofo — tutte e 11 le biografie degli eroi

`comune.json` · `eroi[].bio` — **67 casi**, in tutti gli undici eroi:
`e'`, `piu'`, `citta'`, `perche'`, `verita'`, `meta'`, `gia'`, `purche'`,
`nego'`, `Lascio'`, `se'`, `li'`.

> «cammina per la **citta'** senza scorta **perche'** la malavita…» (Ottavio Brera)

Non è un dettaglio da sorgente: `scheda-eroe.js:59` stampa `e.bio` nel riquadro
**«chi sei»**, cioè la schermata che si legge scegliendo il personaggio.
Distribuzione: Ottone 10, Sibilla 9, Carla 8, Padre Celso 8, Ottavio 8, Mora 5,
Elena 4, Attilio 4, Nino 4, Fulgenzio 4, Lazzaro 3.

Fuori dalle biografie, altri due: `approfondimenti_carte.ep20.6` («Il **piu'**
vecchio del Coro») e `ep14.json tessere.3.arbitro` («**gia'** a 2 Ferite»).

### 5.4 Errori di grammatica nel testo letto ad alta voce

| dove | testo | va detto |
|---|---|---|
| `preludio.json` luoghi.2.indizi.0 | «un signore **coi stivali** chiodati» | «con gli stivali» — e il testo del luogo, poco sopra, lo scrive già giusto |
| ep12 · *La Corrente Contraria* | «proprio mentre lui **la ha** a favore» | «l'ha» |
| ep17 · *Il Corridoio delle Celle* | «**quale è** il decano?» | «qual è» |
| ep19 · *Il Faldone Sbagliato* | «**quale è** il Fascicolo del 1741?» | «qual è» |
| ep19 · *Un Alleato del Conto* | «Un PNG **che vi dovete** apre una porta» | «a cui dovete qualcosa» — la costruzione non regge |

### 5.5 Un accento che non esiste — 9 casi

**«leggìo»** (8 volte: `ep18` luoghi 1, 2, 4 ×2, 8; `ep20` luoghi 6 ×2) e
**«scricchiolìo»** (`ep18` · *Il Palazzo che Trattiene il Fiato*). In italiano
sono **leggio** e **scricchiolio**, senza accento.

### 5.6 «PNG» nel testo dei giocatori — 8 casi

La sigla d'arbitro è finita in prosa che i giocatori leggono o sentono leggere:

- `ep19.json` **lettera** d'incarico: «Gli altri PNG del passato aprono…»
- `ep19.json` **obiettivo**: «ogni luogo è un PNG del passato»
- `ep19.json` luoghi.6 indizio e approfondimento, `ep20.json` luoghi.2
- le carte `minacce.ep19.18`, `approfondimenti_carte.ep19.3`, `.ep20.5`

Dentro la finzione non esistono i «personaggi non giocanti»: esistono persone.
(In `tessere[].arbitro` la sigla è al suo posto: quello lo legge chi arbitra.)

### 5.7 Riferimenti che non si agganciano — 2 carte

- **ep8 · *La Passerella Marcia*** — «Il molo in disarmo è in disarmo davvero,
  dove serve **a lui**.» Chi è «lui»? Nel testo non c'è nessuno.
- **ep18 · *Chi Vi Riconosce*** — «sono loro, **quelli che accusa il
  presidente**!» Si legge tanto come «quelli che il presidente accusa» quanto
  come «quelli che accusano il presidente» — e nell'Ep. 18 sono vere entrambe.

### 5.8 Una carta-luogo monca

**ep4 · *3 · Il Loggione*** — il testo intero è: «Apre col pubblico, alle
20:00». Cinque parole, senza punto, senza descrizione. Le altre 182 carte-luogo
hanno un paragrafo.

### 5.9 Da decidere, non da correggere

`ep11.json` luoghi.1.indizi.2 — «Le misure che non **tornano tornano** eccome».
Può essere il bisticcio voluto («non tornano» / «tornano eccome») o una parola
raddoppiata per sbaglio. Lo sa solo chi l'ha scritta.

---

## 6. Cosa ho letto e cosa no

**Letto riga per riga** (1.014 testi): tutte le 972 carte — 429 minaccia
(regola *e* finzione), 197 approfondimento, 183 luogo, 115 oggetto, 37 nemico,
11 eroe — più le 11 biografie di `comune.json` e tutta la prosa rivolta ai
giocatori di `preludio.json` e `ep1.json`.

**Passato solo per i controlli meccanici**: la prosa dei restanti 19 episodi
(~110.000 parole di `testo`, `indizi`, `approfondimenti`, `lettera`). Le sonde
sono quelle dei §4 e §5 — accenti con apostrofo, articoli davanti a s impura,
«quale è», elisioni mancate, doppioni, sigle d'arbitro, testi mozzi, virgolette
e parentesi spaiate — e su quel corpus hanno trovato quanto è elencato qui. Ma
un difetto come «un freddo d'acqua nera» **nessuna sonda lo prende**: quello si
vede solo leggendo. Se serve, quelle 110.000 parole vanno lette.

**Non guardato affatto**: il regolamento e l'Aiuto Giocatore
(`src/gen_docs.py`), i testi che vivono solo nei sorgenti dei fascicoli, e i
**PDF renderizzati** — qui ho letto i dati, non il foglio stampato. Le voci del
§3 (corsivi, trattini, virgolette) vanno confermate guardando il PNG/PDF, come
da prassi del progetto.

---

## 7. Se si correggono

Per quanto pesano: **1.1** (9 carte inservibili), **5.3** (67 refusi sulla
schermata che si legge scegliendo l'eroe), **1.2** (5 carte), **2.1** + **5.1**
+ **5.2** (le tre carte dell'Ep. 1 con la frase rotta), **1.6** e **1.3** (una
riga l'una), poi **5.4**–**5.8**, **1.4**–**1.5**, e per ultimo il §3, che è un
passaggio solo e meccanico.

Le §5.3, §5.5 e §3.2 si fanno con una sostituzione automatica; tutto il resto va
riscritto a mano.

Tutte le correzioni vanno fatte nei **sorgenti** (`src/gen_*.py`,
`scripts/cardconjurer/cards-data.js`), non in `webapp/data/`, che è generato.
