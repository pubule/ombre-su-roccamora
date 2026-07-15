# Analisi — ricalibrazione post-fix motore (6 giri, 20260715)

Obiettivo: riportare la curva al target ~80% vittoria / Custode anticipato
≤10% / ansia viva (vittorie sofferte ~25-40%) dopo che i fix al motore
(commit `e82a407`) hanno rivelato la difficoltà reale: 2:29 4:73 6:30 8:48
10:56. Metodo: 6 giri di matrici sui soli knob del simulatore, stessi seed
(310000+size*1000 dal giro finale in poi) per confronti puliti per taglia.
~7.000 simulazioni totali.

## Percorso (cosa è stato scartato e perché)

1. **Giro 1**: il rollback dei bonus Ferite sistema n=6 da solo (30→96%).
   Bocciate: `tetto2_oltre8` concettualmente (più dura, non più dolce);
   3 carte nude a 8-10 (73-74%, sotto target); 2 carte (96-97%, ansia 5-12%).
2. **Giro 2**: boss+1 con 2 carte a 8-10 morde appena (93-95%). A n=6 invece
   è la rifinitura giusta (96/13 → 89/28). n=2 col +2 Salute: 45→59%.
3. **Giro 3**: +1 Salute funziona a n=4 (67→79%) ma è NULLO a 8-10 (74→75,
   73→70): lì il collo di bottiglia sono le ondate, non i punti ferita.
   n=2 col +3 Salute: 43% — il campione a 2 eroi non risolve (rumore ±16).
4. **Giro 4**: n=3 con 1 carta, nudo: 85/28 (da 39%!). n=5 nudo: 87/30
   (meglio di 90/21 col bonus — Salute solo a n=4). n=7: confermato il
   dirupo 2 carte=93% / 3 carte=61-65% — nessuna leva convenzionale centra
   il mezzo.
5. **Giro 5**: mezza carta (terza carta SOLO nei round pari, alla Pandemic)
   a 7-10: 86/91/88/92 — il dirupo è colmato, leggermente sopra target.
6. **Giro 6**: mezza carta + boss+1 a 7-10: 8-10 → **81/79/80 con sofferte
   33-37** (centro pieno); n=7 cala a 69 (troppo: è il tavolo grande con
   meno braccia) → a 7 resta la mezza carta nuda.

## Config finale raccomandata

| Leva | Valore |
|---|---|
| Carte Minaccia/round | 2-3 eroi: **1** · 4-6: **2** · 7-10: **2, +1 nei round pari** |
| Bonus Ferite generale | **abolito** (il +2 a n=6 era il killer post-fix) |
| Boss: +1 Ferita | a **6 e 8-10** (NON a 7) |
| Salute massima | **+1 a testa solo in 4** |
| Tavolo da 2 eroi | nessuna leva regge (39-59%, rumore enorme): **modalità dura dichiarata**; in 2 giocatori si consiglia di giocare **4 eroi, 2 a testa** (multi-handed, precedente Gloomhaven/Arkham) → curva del tavolo da 4 |

## Curva finale misurata (5 party × 30 seed per taglia)

| Taglia | % Vittoria | % Sofferte | % Custode anticipo | Giro |
|---|---|---|---|---|
| 2 | 39% | 35% | 0% | finale (hard mode dichiarato) |
| 3 | 85% | 28% | 0% | 4 |
| 4 | 77-79% | 25-39% | 1-2% | 3, finale |
| 5 | 87% | 30% | 2% | 4 |
| 6 | 83-89% | 24-28% | 0-3% | 2, finale |
| 7 | 86% | 24% | 0% | 5 |
| 8 | 81% | 33% | 0% | 6 |
| 9 | 79% | 37% | 1% | 6 |
| 10 | 80% | 35% | 0% | 6 |

Tutta la curva 3-10 nel target ~80%, ansia viva ovunque, Custode anticipato
mai sopra il 3%. Pool esauriti a 7-10 scesi da 8-10 a 1.6-4.5 (la mezza
carta riduce anche la saturazione fisica della tessera, il limite
strutturale residuo non corretto).

## Cosa cambierebbe nei componenti (SE approvata — non toccato nulla)

1. **Regolamento** (`src/gen_docs.py`): tabella Fase Minaccia (2:1, 3:1,
   4-6:2, 7-10:"2, +1 nei round pari"); paragrafo "Tavolo grande" riscritto
   (via il +2 Ferite a 6 e la spiegazione annessa; boss+1 a 6 e 8-10;
   regola round pari); nuova riga "+1 Salute in 4"; box "in 2 giocatori:
   consigliati 4 eroi, 2 a testa — il tavolo a 2 eroi è la modalità dura".
2. **Aiuto Giocatore** (stesso file): stessa tabella e stesse due righe.
3. **Bestiario** (`src/gen_bestiario.py`): `ferite_per_fascia` →
   `[base, base+boss@6, base, base+boss@8-10]` (il +2 generale a 6 sparisce).
4. **Bibbia** (`PROMPT-ESPANSIONE.md`): sezione 3-quater (tavoli grandi e
   piccoli) allineata ai nuovi numeri; nota che le formule validate sono
   `finale_v3` + boss {6,8,9,10} + salute {4:1} in `simulate_playtest.py`.
5. **Simulatore**: promuovere la config finale a default di produzione nei
   round KPI (`sessione_approfondita`).
