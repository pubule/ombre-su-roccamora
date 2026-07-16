# Ricalibrazione 20260716 — motore onesto (tick del Canto + abilità complete)

## Perché

L'audit di fedeltà degli script di playtest ha trovato che il motore NON
simulava:

- **il tick del Canto** (+1 segnalino automatico alla fine di ogni 4° round —
  il "secondo orologio" stampato su Regolamento/Aiuto era semplicemente
  assente: CRITICO, invalidava tutta la taratura precedente);
- lo **scruta di Sibilla** (3 usi: guarda le prime 2 del mazzo Minaccia,
  seppellisce la peggiore);
- il **Flash! di Carla** (2 usi: un nemico entro 2 caselle salta
  l'attivazione);
- il **Secondo Fiato** (1 ritento a episodio per eroe, condiviso
  Indagine+Spedizione);
- la **perdita di 1 azione** da insidie fallite (Trappola/Cera sotto i
  piedi/Fumi) e dagli eventi scriptati T5/T4;
- e **Voce ferma** dava +2 NERVI a TUTTO il gruppo invece che ai soli eroi
  adiacenti a Serra (regola vera).

Tutto implementato in `scripts/simulate_playtest.py` (vedi docstring
"Fedeltà e limiti" per le divergenze deliberate residue).

**Bug di riproducibilità trovato durante la taratura**: i run non erano
riproducibili tra processi a parità di seed — l'ordine di iterazione dei
`set` Python (PYTHONHASHSEED) decideva i pareggi di `min()` su `down`,
±4-8 punti di %vittoria tra due esecuzioni identiche. Fix: tie-break
ordinati (`sorted(down)`), verificato bit-identico su hash seed diversi.

## Baseline col motore onesto (config 20260715, seed 410000+)

| Taglia | % Vittoria | Sofferte | Note |
|---|---|---|---|
| 2 | 21% | 36% | crollata (era ~50%) |
| 3 | 83% | 26% | ok |
| 4 | 69% | 31% | sotto target |
| 5 | 73% | 31% | limite |
| 6 | 81% | 25% | ok |
| 7 | 76% | 27% | ok |
| 8 | 59% | 32% | KO |
| 9 | 75% | 23% | ok |
| 10 | 75% | 29% | ok |

Il tick affonda le taglie che pescano "più carte Minaccia che corpi"
(n=2, 4, 8); il Canto finale medio sale a 4-12 segnalini.

## Matrice testata (d0/d1/d2, deterministica, stessi seed)

- `TICK_CANTO_OGNI=5`: incoerente — aiuta 5/8 (+13/+14) ma PEGGIORA n=4
  (63%) e non muove n=2. Scartato: il valore stampato "ogni 4° round" resta.
- Boss +1 tolto a n=8: 59→81% (sofferte 19%). Tolto anche a 9/10: 85/91%
  con sofferte 14-16% — troppo comodo, l'ansia muore. Tenuto SOLO il taglio a 8.
- n=4: +2 Salute = 74% ma piatto (sofferte 22%); **Custode −1 Ferita = 75%
  con sofferte 32%** — vince (ansia intatta). Esteso a 3 e 5: 95/92%, bocciato.
- n=2: −1 Ferita al Custode: 21→43% (49% in validazione). Resta la
  modalità dura dichiarata, ma giocabile.

## Config di produzione nuova

- `CUSTODE_TENSIONE_EXTRA = {2:-1, 4:-1, 6:+1, 9:+1, 10:+1}` (era
  `{6,8,9,10:+1}`) — il boss ora scala anche verso il basso.
- Invariati: `finale_v3`, `SALUTE_BONUS_PER_N={4:1}`, `TICK_CANTO_OGNI=4`,
  `SOGLIA_CANTO=3` (nessun valore stampato sulle carte cambia).

## Validazione (seed 510000+, MAI usati in taratura)

Vedi `riepilogo_fedelta.md`: 3-10 → 69-89% vittoria, sofferte 14-34%,
risveglio anticipato ≤17%; n=2 → 49%. Le due misure più fuori centro
(n=5 89%, n=9 69%) sono varianza di campionamento party (media dei due
set di seed: ~81% e ~72%).

## KPI di design

| KPI | Esito | Perché |
|---|---|---|
| Giocabilità | ✅ | curva 69-89% su 3-10, nessuna taglia KO; n=2 dura dichiarata ma vinciblie (49%) |
| Ansia | ✅ | sofferte 14-34%, secondo orologio VERO ora attivo (Canto finale medio 4-10), risvegli anticipati reali |
| Coinvolgimento | ✅ | scruta/Flash/Secondo Fiato ora contano davvero nei numeri; il boss scala in entrambe le direzioni senza toccare la truppa |
| Immersione | ✅ | nessun valore stampato sulle carte cambia; Bestiario leggibile a colpo d'occhio (5 fasce, scalature in rosso) |
