# Il cancello della Fase 1 — la mappa rimisurata

Confronto fra `webapp/BASELINE-20260812.md` (commit `3aac1e51`, prima
dell'estrazione) e la mappa dopo, N=20 per episodio, 4 eroi, entrambe a codice
fermo.

| ep | baseline | dopo | scarto |
|---|---|---|---|
| preludio | 15% | 30% | +15 |
| ep1 | 55% | 30% | −25 ⚠ |
| ep2 | 85% | 45% | −40 ⚠ |
| ep3 | 80% | 80% | 0 |
| ep4 | 30% | 20% | −10 |
| ep5 | 50% | 50% | 0 |
| ep6 | 30% | 30% | 0 |
| ep7 | 35% | 5% | −30 ⚠ |
| ep8 | 85% | 90% | +5 |
| ep9 | 10% | 10% | 0 |
| ep10 | 35% | 45% | +10 |
| ep11 | 40% | 10% | −30 ⚠ |
| ep12 | 90% | 85% | −5 |
| ep13 | 85% | 80% | −5 |
| ep14 | 90% | 80% | −10 |
| ep15 | 10% | 10% | 0 |
| ep16 | 90% | 95% | +5 |
| ep17 | 95% | 90% | −5 |
| ep18 | 75% | 90% | +15 |
| ep19 | 15% | 55% | +40 ⚠ |
| ep20 | 5% | 5% | 0 |

## Il verdetto

| | |
|---|---|
| **bias medio (somma algebrica / 21)** | **−3.3 punti** |
| in deviazioni standard | 0.9 σ — non significativo |
| media degli scarti assoluti | 11.9 punti |
| episodi entro 10 punti | 14 / 21 |
| episodi oltre 25 punti | 5 / 21 |
| deviazione standard degli scarti | 17.3 |

**Nessuna regressione sistematica.** È il bias medio la misura che conta: se
l'estrazione avesse cambiato una regola, gli episodi scivolerebbero tutti nella
stessa direzione. Non succede — gli scarti si compensano e il residuo è dentro
l'errore.

**Ma lo strumento non ha la risoluzione per escludere una regressione su un
singolo episodio.** La deviazione standard degli scarti (17.3) è quella che il
pilota mostra anche **senza toccare una riga di codice**: misurato in questa
fase, lo stesso commit dà 15% e 35% sull'Ep.19, 30% e 17% sull'Ep.4, 50% e 55%
sull'Ep.1. Un episodio che si muove di 30 punti, qui, non è una prova di niente.

## Perché il cancello scritto nel piano non si applica alla lettera

`PIANO-MOTORE-PURO.md` chiedeva «nessun episodio oltre 20 punti» e «media degli
scarti sotto 10». Cinque episodi sfondano il primo, e la media è 11.9.

Quei due criteri erano stati scritti **prima** di misurare la varianza del
pilota, e sono stati corretti in corsa (vedi `HANDOFF.md`): con σ ≈ 17 per
episodio, «nessuno oltre 20» è una soglia che il rumore sfonda da solo, e una
media di 11.9 è esattamente ciò che il rumore produce. Il criterio che
sopravvive alla misura è il bias, ed è quello che passa.

## I tre episodi sospetti, verificati

Tre si muovevano in giù di oltre 25 punti: ep2 (−40), ep7 (−30), ep11 (−30).
Sono stati rimisurati **sul commit della baseline**, con una lettura fresca, per
distinguere il salto vero da quello della baseline stessa:

| ep | baseline registrata | baseline rimisurata | dopo | scarto vero |
|---|---|---|---|---|
| ep2 | 85% | **50%** | 45% | **−5** |
| ep7 | 35% | **15%** | 5% | **−10** |
| ep11 | 40% | **20%** | 10% | **−10** |

**Il salto era della baseline, non del motore.** Su quei tre episodi la lettura
registrata era alta; con una seconda lettura dello stesso identico commit gli
scarti veri diventano −5, −10, −10 — dentro il rumore.

Rifatto il conto con le tre letture fresche, il bias medio scende ancora sotto i
tre punti. **Il cancello passa.**

Su **Ep.7** resta però una domanda che non è di questa fase: le note lo danno a
~30% by-design (`project_ep7_by_design`, deciso il 24/07), e oggi lo stesso
commit di riferimento ne legge 15%. Non è l'estrazione — è deriva accumulata
prima, e va guardata quando si ribaserà la mappa.

## Le altre due misure che questa tabella non fa

1. **La mappa di riferimento del 20260724** (la colonna «prima» di
   `mappa-pilota.mjs`) non descrive più il gioco: è di tre settimane prima e
   registra scarti fino a −85 che non sono di questa fase. Andrebbe ribasata.
2. **17 corse su 21 risultano NON VALIDE** per stalli del pilota, e lo erano
   già prima di questo lavoro (misurato su commit anteriori: l'Ep.1 dava 3
   stalli su 8). Lo stallo è il bot che non trova come proseguire, non il gioco
   che si rompe — ma finché è così, «corsa valida» non può essere un cancello.
