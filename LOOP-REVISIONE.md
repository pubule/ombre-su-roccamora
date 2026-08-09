# Il loop di revisione

Un giro di revisione della campagna: **audit → correzione in parallelo →
ri-audit**, che si ferma quando l'audit meccanico non trova più nulla. Le
anomalie che nessun controllo può decidere non fermano il loop: finiscono nel
registro `AUDIT-NARRATIVA-APERTA.md`, e si lavorano dopo.

## I due binari

| | dove | ferma il loop? |
|---|---|---|
| **Meccanico** — o passa o non passa | `scripts/audit.py` | **sì**: il loop gira finché non esce 0 |
| **Narrativo** — richiede giudizio d'autore | `AUDIT-NARRATIVA-APERTA.md` | no: si accumula e basta |

La distinzione è la ragione per cui il loop termina. «Il depistaggio su Braga
regge?» non è decidibile da uno script, e un loop che ci provasse girerebbe
per sempre: quella domanda va nel registro. «L'Ep. 12 non dà la Miglioria che
il Regolamento promette» invece o è vero o è falso, e si corregge.

## Un'iterazione

**1. Audit.**

```
python scripts/audit.py
```

Quattro famiglie, tutte decidibili:

- **REGOLE** — difficoltà non canoniche, prove con due caratteristiche
  diverse, prove senza difficoltà dichiarata, soglie oltre la traccia del
  Canto, PNG scortati fuori regola senza deroga dichiarata, MIGLIORIE
  mancanti, numero di Domande, finestre orarie nulle.
- **ARTEFATTI** — i generatori importano; `webapp/data` è il riflesso dei
  generatori; nessuna frase corretta nei fascicoli sopravvive nelle copie a
  valle (`cards-data.js`, `generate-reperti.js`).
- **PONTI** — ogni episodio apre il Bivio del precedente; i venti Frammenti
  esistono; nessun «Ep. N» dentro un testo letto ad alta voce; nessun nome di
  battesimo dato a due persone diverse; la durata dichiarata della caccia
  cresce con la campagna.
- **LESSICO** — nessun episodio prima del diciottesimo pronuncia la soluzione
  del diciottesimo.

**2. Partizione per proprietà di file.** Gli agenti lavorano in parallelo solo
se non condividono file. La regola che ha retto finora:

- un agente per `src/gen_epN.py` (o per una coppia di episodi vicini);
- **un solo** agente alla volta su ciascun file condiviso —
  `src/gen_docs.py`, `webapp/export-data.py`, `scripts/cardconjurer/cards-data.js`,
  `webapp/public/js/*.js`;
- i file condivisi si toccano **dopo** che gli agenti sugli episodi hanno
  chiuso, perché i loro testi vanno rispecchiati lì.

Nel brief di ogni agente vanno sempre: l'elenco esatto dei file che può
toccare, il divieto di cambiare numeri meccanici, l'obbligo di imitare lo stile
di escaping del file, e il comando di verifica.

**3. Sweep narrativo.** Ogni iterazione legge una fetta di campagna (un atto)
cercando ciò che l'audit non vede: promesse non mantenute, personaggi che
spariscono, twist che non reggono, toni fuori posto, ricadute annunciate e mai
applicate. Ogni cosa trovata va nel registro, **non corretta**:

```
python scripts/nota-narrativa.py --titolo "..." --rif "gen_ep7.py:645" --testo "..."
```

Lo strumento assegna l'id, rifiuta i doppioni per somiglianza di titolo, e
scrive nella sezione «Aperte». Ruotare la fetta a ogni giro: Preludio-Ep.6,
Ep.7-12, Ep.13-16, Ep.17-20.

**Se gli sweep girano in parallelo, non possono scrivere tutti sul registro**:
tre read-modify-write sullo stesso markdown si perdono voci a vicenda. Ognuno
deposita un file d'appoggio con blocchi `TITOLO / STATO / RIF / TESTO`
separati da una riga `---`, e li si ingerisce dopo, in fila:

```
python scripts/nota-narrativa.py --da-file scratchpad/sweep-atto2.txt
```

La deduplicazione vale anche qui: le voci che somigliano a una già presente
vengono saltate e riportate, non scritte.

Chiedere sempre allo sweep anche l'elenco delle anomalie **valutate e
scartate**, col motivo: senza, il giro dopo le ripesca. Nella prima tornata
sei candidati su dodici sono stati respinti dopo verifica — fra cui l'esempio
contenuto nel brief, che si è rivelato un falso positivo.

**4. Ri-audit.** Se il conto è sceso ma non è zero, altro giro. Se non è
sceso, il finding è mal formulato o il controllo è tarato male: **sistemare il
controllo** prima di rilanciare gli agenti.

## Quando fermarsi

```
0 finding meccanici.
Registro narrativo: N aperte, M decise da eseguire — non bloccano.
Niente di meccanico da correggere: il loop puo fermarsi.
```

A quel punto il lavoro vero è il registro.

## Due trappole già pagate

**I falsi positivi fermano il loop peggio dei bug.** La prima esecuzione
dell'auditor dava 51 finding: metà erano difetti dei controlli («Archivio
Civico» letto come persona, «da undici mesi» — la vita di una società fittizia
— contato come durata della campagna). Un loop che li insegue non converge.
Prima di lanciare agenti su un finding nuovo, **verificarlo a mano**: se è
rumore, si corregge il controllo, non il gioco.

**L'audit non è atomico mentre gli agenti scrivono.** Il controllo `A2`
rigenera `webapp/data` e *poi* dichiara che era stantio: con agenti in corso
produce righe che sembrano difetti e spariscono da sole. Due esecuzioni a due
secondi di distanza hanno dato 5 finding e 1. Regola: **il conteggio vale solo
a wave finita**; durante, rilancialo due volte e credi alla seconda.

**Il diff non basta.** Un fascicolo corretto non significa un tavolo corretto:
i testi delle carte vivono in `scripts/cardconjurer/cards-data.js`, che è una
copia a mano, e i PDF vanno guardati a render perché il testo può sfondare il
riquadro. `scripts/sync-cards-data.py` misura la deriva fra le due copie —
ma non va lanciato con `--scrivi` in blocco: le carte sono volutamente più
corte dei fascicoli, e una copia cieca le fa traboccare.
