# Guida di scenografia delle stanze

Come si mette in scena una stanza della Spedizione coi pezzi di Forgotten
Adventures. Nasce dal mockup «lanterne» (25/09/2026): le sue sei stanze
dell'Episodio 1 sono piaciute non per gli asset in se', ma per **come sono
stati usati** — ogni oggetto sta dove sta per una ragione che viene dal testo
della stanza. Questa guida rende quelle ragioni esplicite, perche' chiunque
componga una stanza nuova (una persona, o un modello) arrivi allo stesso
risultato e non a 127 stanze con barile, sacco e ragnatela.

Il riferimento visivo e' `webapp/public/mockups/tessere-alt/1-lanterne.html`
(il codice delle stanze sta in `lanterne.js`, costante `DECORI`), e la **prova
della guida** e' `6-scenografia.html` (Ep.1 e i tetti dell'Ep.11, scenografie
in `scena/`): aprili prima di comporre qualunque cosa.

---

## Il mood: gotico ottocentesco, l'orrore suggerito

Il tono del gioco lo fissa la bibbia narrativa (`PROMPT-ESPANSIONE.md`, §1):
**«mistero gotico ottocentesco, inquietante ma mai splatter; l'orrore e'
suggerito»**. Roccamora, 1889: canali, campanili, nebbia, un coro che canta
sotto le pietre alle tre di notte, cultisti che di giorno impastano il pane.
Ogni stanza deve sembrare un posto dove **qualcosa e' appena successo, o sta
per succedere** — mai un posto dove e' successo tutto sotto gli occhi.

Come si traduce in scena:

- **Abbandono, non strage.** L'inquietudine sta in quel che manca: una sedia
  rovesciata, un pasto freddo, una lanterna lasciata accesa, un cappotto
  appeso in una stanza vuota, una porta di cella aperta. Quel che manca fa
  paura piu' di quel che c'e'.
- **Il sangue e' una virgola, non un lago.** Al massimo **una** traccia di
  sangue per stanza, piccola, e solo se il testo o l'episodio lo giustificano
  (una lotta, una ferita, un sacrificio). La cartella `Horror/.../Gore` si
  usa per una macchia, mai per un corpo aperto. Niente cadaveri esposti: ossa
  gia' vecchie in una cripta si', un morto fresco no.
- **Decadimento.** Ragnatele negli angoli alti, polvere, calcinacci ai piedi
  dei muri, colature di cera, muffa vicino all'acqua. Il posto e' vecchio e
  nessuno lo cura piu'.
- **Il sacro rovesciato.** Candele nere, altari, reliquiari, statue senza
  volto, crocifissi girati, teschi-candela, spartiti: la religione della
  citta' e quella del coro sono la stessa iconografia, piegata.
- **Cera e acqua.** Sono le due materie del gioco: la cera che cola (il culto)
  e l'acqua nera che sale (i canali, la marea, le cisterne). Dove il testo le
  nomina, devono vedersi.
- **Luce calda, buio freddo.** Le luci sono oro di fiamma, poche; tutto il
  resto scivola nel verde-acqua scuro della notte (palette del gioco: oro
  #d8b25e, abisso #0e1519, rosso-notte #1d1014, osso #e8dcc0). Non si
  illumina per far vedere: si illumina per far guardare una cosa sola.
- **Verticale e ferro.** Il gotico e' fatto di cose che salgono e pesano:
  candelabri alti, statue, colonne, catene, grate, cancellate. Dove il posto
  lo permette, un elemento verticale da' carattere a una stanza piatta.

## Cosa decidi tu, e cosa no

**Non decidi:** il pavimento e il «fuori» (li dice il nome della stanza, con la
regola di `webapp/public/motore/ambiente.js`, la stessa delle tessere
stampate), gli arredi (sono nei dati: bloccano il passo e sono regole di
gioco), i muri e le porte (li disegna il codice dove sono le uscite), le luci
degli eroi.

**Decidi:** i **decori** — tutto il resto che sta nella stanza: oggetti,
tracce, luci fisse della stanza. Non bloccano il passo: raccontano.

Se una stanza ha bisogno di un pavimento diverso, non si forza la stanza: si
corregge la regola in `ambiente.js`, e cambia anche la tessera stampata,
com'e' giusto. Se il **nome non basta** a distinguere due posti — «L'abbaino»
dell'Ep.11 e' un riparo al chiuso, quello dell'Ep.14 sporge sul tetto — la
tessera nei dati sorgente (`src/gen_ep*.py`) porta il campo `pavimento`, che
vince sulla regola (esempio: Ep.11 T1, `pavimento='assi'`). Vale per stampa e
schermo insieme; non si mette nella scenografia.

**L'arredo del posto.** I dati usano pochi nomi per gli ostacoli, e li usano
dappertutto: sui tetti dell'Ep.11 gli ostacoli si chiamano «casse» e perfino
«altare». Il gioco non cambia (bloccano il passo lo stesso), ma il **pezzo**
che li disegna lo sceglie il posto, con una regola del codice:

| dove | «casse» diventa | «altare» diventa |
|---|---|---|
| stanza con «campan» nel nome | una campana grande appesa | una campana caduta |
| guglia | la statua della Morte | la statua della Morte |
| tessera ESPOSTA (tetti col vento) | un comignolo | una statua incappucciata sul colmo |
| ovunque altrove | casse | altare |

Se in una stanza la regola sbaglia, la scenografia puo' correggerla per
quella stanza sola: `"arredi": { "1,2": "campana-grande" }` (casella in
coordinate schermo → pezzo del catalogo).

**Il fuori e' dell'episodio, non della stanza.** Attorno alla mappa (il
rettangolo che la contiene, piu' una tessera di margine) ogni riquadro vuoto
prende il fuori della **stanza piu' vicina che ne dichiara uno** — acqua,
melma, erba, roccia, terra, o i tetti — con la stessa regola del nome. Se
nessuna stanza lo dichiara (un episodio tutto al chiuso), resta buio.
Nell'Ep.1 l'unica stanza che lo dichiara e' la banchina: l'acqua circonda
tutto il complesso, non solo i lati della banchina. Negli episodi misti ogni
zona prende il suo (fogne dell'Ep.3: melma, acqua e roccia dove stanno i
chiusini, la cisterna, la galleria). Lo fa il codice: tu componi sapendo che
il fuori c'e' gia'.

**Sui tetti** il codice non disegna muri ne' porte (il vuoto e' il muro), mette
sotto la plancia la citta' vista dall'alto — canali, vie coi lampioni,
finestre accese a grappoli — e fa passare il vento sulle tessere esposte
(campo `esposta` dei dati, o ESPOSTA nel testo; piu' forte dove dice FORTE).

---

## I principi

1. **Leggi il testo, poi la stanza viene da sola.** Di ogni tessera leggi
   `nome`, `testo`, `cerca`, `cerca_vuoto`, `hook`. Sottolinea ogni oggetto,
   materia, luce e traccia che nominano: e' la lista della spesa. «Migliaia di
   candele nere», «la cera cola dalle mensole», «un riflesso che non e' cera»
   diventano gruppi di candele nere, colature, e qualcosa di rosso dove
   l'occhio deve cadere. Quel che il testo non nomina, non lo inventi a caso:
   lo deduci dal posto (una banchina ha cime e barili; un archivio ha carte).

2. **Un punto focale per stanza.** La cosa che il testo vuole che si guardi:
   mettila dove la luce arriva, e costruiscile intorno. Nel corridoio delle
   candele e' il sangue al centro fra i bracieri; nella cripta e' l'altare con
   le ossa ai piedi. Una stanza senza punto focale e' un magazzino di sprite.

3. **Le luci raccontano.** Una luce fissa della stanza (torcia, candele,
   braciere, teschio-candela) va **solo dove il testo mette il fuoco** o dove
   qualcuno l'avrebbe lasciata: una torcia vicino all'ingresso di una banchina
   di lavoro, candele sull'altare, un lume sulla scrivania. Al massimo **4 luci
   fisse fra i decori** per stanza (i fuochi degli arredi dei dati — bracieri,
   crogioli, stufe — non contano: ci sono per regola). Una stanza il cui testo
   e' buio **resta buia**: solo le lanterne degli eroi. Il buio e' ansia, ed e'
   un KPI del gioco.

4. **Periferia piena, centro libero.** Gli oggetti stanno contro i muri, negli
   angoli, accanto agli arredi — dove la roba si accumula davvero. Il centro e
   le linee fra una porta e l'altra restano leggibili: chi guarda deve capire
   al volo da dove si passa.

5. **Gruppi, asimmetria, rotazioni.** Non una cosa per casella in fila: gruppi
   di 2-3 pezzi (un sacco appoggiato a un barile, una corda arrotolata vicino
   alla bitta), e rotazioni diverse (mai tutte a 0°). Una stanza simmetrica
   sembra generata.

6. **Quanti pezzi.** Stanze chiuse: **5-9 decori** oltre agli arredi dei dati.
   Stanze all'aperto (tetti, giardini, cortili): **0-5** — l'aperto e' vuoto.
   **Zero e' una scelta giusta** quando il testo lo dice: sui tetti dell'Ep.11
   «quassu' non resta appoggiato niente che non sia inchiodato», «su questo
   anello di pietra non si posa nulla». Li' il principio 1 vince sul numero:
   niente oggetti sciolti, al massimo **architettura** (ali di pietra sul
   parapetto, una statua) — cose che il vento non si porta via. Mai piu' di 12.

6-bis. **Quel che si trova cercando non si mette in scena.** Il campo `cerca`
   dice cosa si trova *cercando* (il piede di porco, la chiave, la corda del
   campanaro): se lo metti per terra, la ricerca non ha piu' senso. Metti in
   scena il *contesto* dell'oggetto (la scrivania dove sta la chiave), non
   l'oggetto.

7. **Mai sopra il gioco.** Nessun decoro su una casella-porta, ne' su una
   casella con arredo — con un'eccezione sola: un oggetto piccolo **appoggiato
   sopra** una superficie (un lume o delle carte sulla scrivania, candele
   sull'altare) puo' stare sulla casella dell'arredo, se lo dichiari con
   `"sopra": true` e l'arredo e' una superficie (`scrivania`, `altare`,
   `toeletta`). Un decoro puo' stare *a cavallo* del bordo fra due caselle
   libere, non sopra una occupata. Il test (`webapp/test-scenografia.mjs`) lo
   verifica, ma componi gia' pulito.

8. **Varieta' nell'episodio.** In un episodio nessun pezzo compare in piu' di
   3 stanze (eccezione: ragnatele e candele, dove il posto lo chiede). Due
   stanze dello stesso ambiente devono comunque sembrare due posti diversi.

9. **Il fuori e' parte della scena.** Se la regola dice acqua, la banchina
   finisce nell'acqua: metti le cime verso il bordo, una pozza, una barca
   ormeggiata se il testo la nomina. Se dice vuoto (tetti), niente muri e
   pochi oggetti: il vuoto si sente.

10. **Roccamora, 1889.** Citta' di canali, cera, campane, un coro sotto le
    pietre, cultisti che di giorno fanno i fornai. Niente fantasy fuori posto:
    niente armi magiche, pozioni colorate, scudi, tesori di draghi. Il
    catalogo e' gia' filtrato; se ti serve un pezzo che non c'e', vedi in
    fondo.

11. **Scrivi il perche'.** Ogni stanza ha una riga `perche` che dice da dove
    viene la composizione («il testo dice…, quindi…»). Se di un pezzo non sai
    dire perche' e' li', toglilo.

---

## Gli esempi (Episodio 1, dal mockup)

Coordinate: `x`, `y` = centro del pezzo in caselle, dentro la stanza (0..4,
riga 0 in alto); `lato` = quanto e' grande in caselle; `rot` = gradi.

### T1 · Banchina d'ingresso

> «L'acqua nera lambisce le pietre della banchina; l'aria sa di sego, di sale e
> di qualcosa di piu' antico.»

```json
"T1": {
  "decori": [
    { "pezzo": "corda",     "x": 0.55, "y": 1.35, "lato": 0.7,  "rot": 20 },
    { "pezzo": "barile",    "x": 3.45, "y": 1.3,  "lato": 0.75, "rot": 0 },
    { "pezzo": "pozza",     "x": 2.4,  "y": 2.55, "lato": 1.1,  "rot": 30 },
    { "pezzo": "ragnatela", "x": 3.62, "y": 3.62, "lato": 0.8,  "rot": 180 },
    { "pezzo": "torcia",    "x": 0.22, "y": 2.5,  "lato": 0.8,  "rot": 90,  "luce": "torcia" },
    { "pezzo": "torcia",    "x": 3.78, "y": 2.5,  "lato": 0.8,  "rot": -90, "luce": "torcia" }
  ],
  "perche": "Banchina di lavoro sull'acqua nera: la corda sta vicino alla bitta (arredo molo), un barile contro il muro delle casse, una pozza dove l'acqua entra. Due torce ai lati dell'ingresso: e' da qui che si parte, e deve essere l'unico posto davvero illuminato."
}
```

### T3 · Corridoio delle candele

> «Migliaia di candele nere trasformano il corridoio in una gola di luce
> tremolante; […] Tra le colate, in fondo, un riflesso che non e' cera.»

```json
"T3": {
  "decori": [
    { "pezzo": "candele-nere",   "x": 1.5,  "y": 0.45, "lato": 0.8, "rot": 0,   "luce": "cera" },
    { "pezzo": "candele-nere-2", "x": 2.5,  "y": 0.5,  "lato": 0.8, "rot": 90,  "luce": "cera" },
    { "pezzo": "candele-nere-3", "x": 1.5,  "y": 3.5,  "lato": 0.8, "rot": 180, "luce": "cera" },
    { "pezzo": "sangue",         "x": 2.1,  "y": 2.2,  "lato": 0.6, "rot": 0 },
    { "pezzo": "teschio",        "x": 3.5,  "y": 2.5,  "lato": 0.6, "rot": 0,   "luce": "cera" }
  ],
  "perche": "Il testo e' tutto luce di candela: i gruppi di candele nere corrono lungo i due muri lunghi (i bracieri negli angoli sono arredi dei dati), cosi' e' l'unica stanza dell'episodio piena di luce — e la luce inquieta. Il punto focale e' il 'riflesso che non e' cera': una macchia piccola al centro, che si capisce solo guardando, e un teschio-candela in fondo."
}
```

(Il mockup aveva 5 gruppi di candele, cioe' 6 luci fra i decori, e una pozza
di sangue grande: qui le luci sono 4 e il sangue e' una virgola, come vogliono
i principi 3 e il mood. La guida vince sul mockup quando lo corregge.)

### T6 · Cripta della cera

> La cripta del Custode: l'altare, la cella di Ruggero.

```json
"T6": {
  "decori": [
    { "pezzo": "ossa",           "x": 0.95, "y": 2.95, "lato": 1.4, "rot": 20 },
    { "pezzo": "catene",         "x": 3.7,  "y": 2.5,  "lato": 0.8, "rot": -90 },
    { "pezzo": "sangue",         "x": 2.0,  "y": 2.9,  "lato": 0.9, "rot": 40 },
    { "pezzo": "teschio",        "x": 0.5,  "y": 0.5,  "lato": 0.6, "rot": 0,   "luce": "cera" },
    { "pezzo": "candele-nere-3", "x": 1.5,  "y": 2.4,  "lato": 0.7, "rot": 0,   "luce": "cera" },
    { "pezzo": "candele-nere",   "x": 2.5,  "y": 2.4,  "lato": 0.7, "rot": 0,   "luce": "cera" },
    { "pezzo": "ragnatela",      "x": 3.62, "y": 3.62, "lato": 0.9, "rot": 180 }
  ],
  "perche": "Il punto focale e' l'altare (arredo): due gruppi di candele nere davanti, il sangue e le ossa ai suoi piedi. Le catene al muro vicino alla cella di Ruggero dicono chi ci e' stato legato. Un teschio-candela nell'angolo opposto e' l'unica altra luce."
}
```

---

## Lista di controllo, stanza per stanza

Con la foto della stanza davanti (la produce `node webapp/mappa-plancia-fa.mjs --ep <episodio>`, Task 7 del piano),
rispondi si'/no. Un no si corregge prima di passare alla stanza dopo.

- [ ] Ho letto `testo`, `cerca`, `cerca_vuoto`, `hook`, e ogni oggetto nominato che ha un pezzo nel catalogo e' in scena.
- [ ] C'e' un punto focale, ed e' illuminato (o volutamente al buio, se il testo e' buio).
- [ ] Le luci fisse sono ≤ 4 e ognuna ha un motivo nel testo o nel posto.
- [ ] Il centro e le linee fra le porte si leggono.
- [ ] Nessun decoro sopra arredi, porte, ingresso (il test lo conferma).
- [ ] Gruppi e rotazioni: nessuna fila, nessuna simmetria da generatore.
- [ ] Nessun pezzo gia' usato in 3 stanze dell'episodio (salvo ragnatele/candele).
- [ ] Niente di fantasy fuori da Roccamora 1889.
- [ ] Niente di quel che si trova cercando (campo `cerca`) e' in scena.
- [ ] Il mood c'e': qualcosa e' appena successo o sta per succedere; un segno di abbandono o di decadimento; al massimo una traccia di sangue, piccola; luce calda su una cosa sola, il resto nel buio freddo.
- [ ] Accanto alle stanze dell'Episodio 1, questa regge il confronto.
- [ ] La riga `perche` spiega ogni pezzo.

---

## Il catalogo

I pezzi stanno in `webapp/vtt/decori/`, e `webapp/vtt/decori/CATALOGO.json`
dice per ognuno: gli ambienti dove sta bene, il lato tipico in caselle, se fa
luce. Lo produce `scripts/importa-fa-lanterne.py` dalla libreria
`risorse-vtt/FA_Assets_Webp/` (148 mila file). Da dove pescare, per ambiente:

| ambiente (pavimento/nome) | cartelle della libreria |
|---|---|
| acqua, banchine, moli, darsene | `!Core_Settlements/Structures/Water_Structures`, `!Core_Settlements/Vehicles/Ships`, `!Core_Settlements/Clutter/Adventuring_Gear/Ropes`, `!Core_Settlements/Decor/Storage` |
| magazzini, depositi, quinte | `!Core_Settlements/Decor/Storage`, `!Core_Settlements/Workplace_Equipment`, `!Core_Settlements/Clutter/Cloth` |
| chiese, navate, cori, organi | `!Core_Settlements/Furniture/Altars`, `…/Furniture/Seating`, `…/Lightsources/Candelabras`, `…/Lightsources/Candles`, `…/Decor/Musical_Instruments`, `…/Structures/Statues`, `…/Decor/Wall_Hangings` |
| cripte, ossari, cimiteri | `!Core_Settlements/Burial_and_Graves`, `Horror/!Wilderness/Decor`, `Horror/!Wilderness/Gore` (con misura), `!Effects/Webs` |
| fonderie, forni, officine | `Industrial/Base_Industrial_Settlement`, `!Core_Settlements/Workplace_Equipment`, `…/Lightsources/Coals_and_Firewood`, `!Effects/Smoke` |
| archivi, biblioteche, studi, uffici | `…/Furniture/Shelves`, `…/Furniture/Book_Stands`, `…/Furniture/Tables`, `…/Clutter/Paper_Goods`, `…/Clutter/Writing_Implements`, `…/Decor/Office`, `…/Decor/Rugs_and_Carpets` |
| case, salotti, camere | `…/Furniture/Seating`, `…/Furniture/Bedding`, `…/Furniture/Cupboards_and_Wardrobes`, `…/Furniture/Mirrors`, `…/Decor/Busts`, `…/Decor/Wall_Hangings` |
| tetti, guglie, ballatoi, logge | `…/Structures/Beams_and_Supports`, `…/Structures/Rubble`, `…/Natural_Decor` |
| giardini, serre, cortili | `Woodlands/Botanical_Garden_Settlement`, `Woodlands/!Wilderness`, `…/Natural_Decor` |
| fogne, cisterne, gallerie, grotte | `Swamp/!Wilderness`, `Underdark/!Wilderness`, `Horror/!Wilderness/Paths`, `!Effects/Webs` |
| ovunque, con misura | `!Effects/Webs`, `…/Structures/Rubble`, `…/Lightsources/Torches_and_Sconces/Lit`, `…/Lightsources/Candles` |
| il gotico, trasversale (mood) | `…/Lightsources/Candelabras`, `…/Lightsources/Chandeliers`, `…/Structures/Statues`, `…/Decor/Busts`, `…/Decor/Restraints_and_Torture` (catene, gabbie), `…/Furniture/Seating` (sedie da rovesciare), `…/Clutter/Food` e `…/Clutter/Kitchenware` (pasti freddi, tazze lasciate), `…/Clutter/Magic_Items/Skulls` (solo teschi-candela), `Horror/!Wilderness/Decor` |

(`…` = `!Core_Settlements`.) **Se ti serve un pezzo che non c'e'** nel
catalogo: non ripiegare su uno a caso. Cercalo nella libreria
(`find risorse-vtt/FA_Assets_Webp -iname '*parola*'`), guarda il provino
(`python scripts/importa-fa-lanterne.py --provino <cartella>`), aggiungilo a
`PEZZI` nello script con il suo ambiente, rilancia, e usalo.
