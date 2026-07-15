# Analisi — verifica dei 3 fix simulatore (20260715, seconda passata)

Sessione di verifica dopo tre fix al simulatore (`scripts/simulate_playtest.py`):
1. `cella_libera_vicino()` — un nemico in arrivo non si impila più sulla
   cella della porta se occupata, cerca la cella libera più vicina (o resta
   in coda fuori tessera se la tessera è piena).
2. `fase_eroi` — un eroe con TUTTI i bersagli irraggiungibili (nessun
   cammino BFS valido) ripiega su Rianimare/Cercare invece di inseguire a
   vuoto all'infinito.
3. `spawn_from_card` — la distanza iniziale di un rinforzo "dalla Banchina"
   era `CASELLE_TESSERA * round_n` (a round 30: 180 caselle, irraggiungibile
   per costruzione); corretta a `CASELLE_TESSERA` fisso, come da commento
   originale della costante ("fatto strutturale sulla tessera, non sul
   ritmo del gruppo").

## Esito 1: il fix del diapason funziona

`stress-diapason-a-fondo` e `stress-turnorder-brera-tattico`: **100%
diapason trovato** (era 0% in entrambe le sessioni precedenti). L'euristica
ora segue la pista di Bice non appena ha la CORDA DI VIOLINO in mano. KPI
generale: 0-21% (rumore su 5 party, atteso: il proxy dipende dal party
avere/non avere chi passa per Casa di Ruggero prima delle 2 ore residue).

## Esito 2: i due fix di movimento eliminano MOLTI timeout, ma non tutti

Timeout residui nei log seed-0: `stress-08-senza-healer`, `kpi-08_p0/p1/p2`,
`kpi-10_p0/p1/p4` — ancora frequenti a n=8-10. Letto per intero
`stress-08-senza-healer/spedizione.log`: dal round 16 in poi ZERO righe
"si muove verso" fino al timeout (round 31) — non più uno stallo per
bug di codice (nemici correttamente in coda, eroi correttamente ripiegano
su Rianimare), ma un **vero e proprio esaurimento delle celle libere**: 8
eroi (i corpi a terra occupano comunque la cella) + l'ondata di rinforzi
che continuano ad arrivare mentre nessuno viene abbattuto (tutti impegnati
a rianimarsi a vicenda) riempiono la tessera 4x4 fino a azzerare le celle
libere per chiunque. Non è più un bug del simulatore: è un limite
strutturale — una tessera da 16 caselle non regge un tavolo da 8-10 eroi
+ ondate di rinforzo quando il gruppo entra in un ciclo di rianimazione
che non uccide mai nulla. **Non l'ho corretto**: modellare "isole di
schieramento fuori tessera" o un tetto ai rinforzi contemporanei è una
scelta di design, non una correzione di bug — serve una decisione, non
l'ho presa da solo.

## Esito 3 — IMPORTANTE: le vittorie crollano ovunque, non solo a 8-10

| Taglia | % Vittoria PRIMA (bug presenti) | % Vittoria DOPO (fix) | Delta |
|---|---|---|---|
| 2 | 40-44% | 29% | -11/-15 |
| 4 | 87-91% | 73% | -14/-18 |
| 6 | 73-74% | **30%** | **-43/-44** |
| 8 | 66-73% | 48% | -18/-25 |
| 10 | 75-82% | 56% | -19/-26 |

Verificato che n=6 non è rumore: `kpi-06_p3/spedizione.log` è una vera
SCONFITTA (party wipe) a round 18, con movimento reale confermato riga per
riga fino alla fine (nemici che raggiungono, si muovono, colpiscono senza
intoppi) — non uno stallo mascherato.

**Causa: i due bug di movimento (impilamento sulla porta, inseguimento a
vuoto) rendevano il combattimento sistematicamente più debole di quanto
progettato — spesso i nemici restavano bloccati fuori portata e non
attaccavano mai.** Tutta la calibrazione di produzione fatta in questa
campagna (`tetto3_ritardato`, `curva-G_tattica`, `CUSTODE_TENSIONE_EXTRA`,
il round "griglia tattica" che ha fissato questi valori nel Regolamento)
è stata misurata SU QUESTO SIMULATORE CON QUESTI BUG. Ora che i nemici
raggiungono ed attaccano correttamente, il gioco reale (quello che i bug
nascondevano) risulta sensibilmente più difficile del bersaglio ~80%.

## Non ho toccato

Nessuna formula di gioco, nessuna carta, nessun valore nel Regolamento.
Solo codice del simulatore (3 fix, tutti già commentati inline con la
motivazione). I numeri sopra sono la prima fotografia onesta della
difficoltà reale — la ricalibrazione (se necessaria) è una decisione di
design a parte, da fare consapevolmente con l'utente, non silenziosamente
dentro un "fixa i bug".
