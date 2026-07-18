# Varietà indagine Ep.5 — «Gli ultimi due carri» (orologio inverso narrativo)

> Spec prodotta da subagent (20260718), da APPLICARE. Torsione assegnata:
> orologio inverso — una prova fisica si SPOSTA/si distrugge mentre indaghi,
> non un vincolo d'orario di chiusura. Nessun file ancora modificato.

## 0. Perché questa e non un altro orologio

L'Ep. 5 ha già due orologi *di chiusura* (Ossario chiude 22, Curia chiude 21):
un luogo diventa irraggiungibile a un'ora fissa. La torsione è l'opposto: **il
Cimitero Nuovo (L3) resta visitabile tutta la notte**, ma la sua **prova fisica
si SPOSTA** mentre indaghi. Non una porta che si chiude: un carro che parte.

Fiction già presente: «ventidue casse consegnate, DUE ancora da consegnare»
(L5), «le ultime due lapidi… dopodomani» (L8), i carri notturni «entrano vuoti,
escono pesanti» (L3), l'onda «scalpellata via» dalle lapidi (L3/L8). Il Coro sta
cancellando un censimento in tempo reale.

## 1. Quale prova scade e perché

**Prova:** dietro la rimessa del **Cimitero Nuovo (L3)**, le **lapidi originali
con l'onda scalpellata via** — l'unico oggetto fisico che prova la Domanda 3
(*quali* ossa: solo i confratelli del 1741, marcati con l'onda).

**Perché si muove:** ultima notte di cantiere. Gli uomini di **Zaccaria Mola**
caricano le lapidi originali sui carri per portarle dal marmista a farne polvere
(chiude il cerchio con L8) e riesumano le **ultime due casse** marcate. Verso le
**21:00** il carico è finito: cortile spazzato, lapidi sparite, due casse già
sulla strada del sagrato.

## 2. La regola a tavolo

**Scadenza (a ore, non a chiusura):** il Cimitero resta visitabile tutta la
notte, ma la **prova delle lapidi vale solo entro la 3ª ora** (orologio a 18/19/
20). Dalle **21:00** la prova è persa; il luogo dà ancora le parole chiave
(«IL MAESTRO DEI REGISTRI», «CONTANTI NUOVI», «LAPIDI RIFATTE») e la Testimonianza.

**Ricompensa se in tempo:** oltre al riscontro D3, **blocci gli ultimi due carri**
— le due casse finali sono già in salvo in T5 (senza dover fermare Mola).

**Penalità se tardi/mai:** il Cimitero non conta più come riscontro D3; le due
casse non sono salvate qui; se la D3 resta sbagliata, in **T5 ogni cassa richiede
ACUME (Media)** (complicazione già a sistema).

**Via alternativa — anti-softlock:** la D3 richiede 2 riscontri su 3 (Ossario L2 ·
Cimitero L3 · Marmista L8). Persa L3, restano **L2 (aperto)** e **L8 (parola
«LAPIDI RIFATTE», ottenibile da L2 o dallo stesso L3 tardivo)**. Due riscontri
bastano ancora → nessun softlock, ma L8 costa una parola e un'ora in più.

## 3. Modifiche file per file

### A) `src/gen_ep5.py`
- **`LETTERA_5`** nota italica: aggiungere «…al Cimitero Nuovo i carri notturni
  finiscono il carico verso le 21:00: le lapidi che portano via, dopo, non le
  trovate più.»
- **`LUOGHI_5` L3**: aggiungere `scade_prova=21`; riscrivere la coda del 3° indizio
  (lapidi accatastate) chiudendo con la scadenza.
- **`indagine()` Taccuino**: terza riga «! il Cimitero (3): dalle 21:00 i carri
  hanno finito — la prova delle lapidi è persa (il luogo resta aperto)». Marcare
  18–19–20 come *finestra da cogliere* (segno diverso dalle chiusure).
- **`soluzione()`** blocco D3: paragrafo «Orologio inverso — la prova delle
  lapidi» (in tempo → riscontro D3 + 2 casse salve; tardi → perso, restano
  Ossario+Marmista; se D3 sbagliata → ACUME per cassa in T5). Epilogo: se scaduta,
  le ultime due casse mancano dal conto.

### B) `scripts/cardconjurer/cards-data.js`
- **`LUOGHI5` n:3**: appendere al `testo` la nota di scadenza (come le chiusure
  sono sulla carta). Nessun'altra carta cambia. Zero componenti nuovi.

### C) `scripts/simulate_ep5.py`
- **`LUOGHI_SIM` L3**: `scade_prova=21`.
- **Stato**: `prova_scaduta = False`, `casse_gratis = 0`.
- **`luogo_raggiungibile`**: nessuna modifica (L3 non chiude).
- **`punteggio`**: estendere `rischio` così che, in finestra e non visitato, L3
  salti in testa alla coda:
  ```python
  scade = l.get('scade_prova')
  rischio = 0 if ((l['chiude'] is not None and ora_corrente + 1 >= l['chiude'])
                  or (scade is not None and l['n'] not in visitati
                      and ora_corrente < scade)) else 1
  ```
- **Alla visita** (blocco `if l.get('incrocio_d3'):`): solo per L3, se
  `ora_corrente >= scade_prova` → `prova_scaduta=True`, niente riscontro; altrimenti
  `incroci_d3 += 1` e `casse_gratis = 2`. L2/L8 restano incondizionati (via
  alternativa L2+L8 dà comunque `d3_ok`).
- **Return**: aggiungere `prova_scaduta`, `casse_gratis`.

## 4. Impatto curva (banda 3-10 ~70-95%)

La D3 NON è nel loop di combattimento → la torsione non tocca il win-rate
direttamente. Unico canale: il tier Vantaggio (`tutte_esatte` per lo SLANCIO):
prova scaduta → un'ora in più su L8 → meno ore avanzate → qualche SLANCIO→PREPARATI.
Nudge piccolo, sulle taglie già ~70 (4/7/8). Con L3 in testa alla coda in finestra,
in sim `prova_scaduta` è raro → impatto minimo. **Ri-simulare** (5×30, seed base
650000). Leva compensativa se 4/7/8 < 70: `scade_prova=22` (finestra alla 4ª ora).
Ep.2/3/4/6 invariati.

## 5. Fedeltà

Battuti/sconsacrazione/cripta intatti. La torsione rinforza il tema (ossa in
viaggio Cimitero→sagrato→cripta, con conto alla rovescia letterale). Mola resta
il fornitore; la torsione tocca la *prova fisica*, non il testimone, così D2 (chi)
e D3 (quali) restano distinti.
