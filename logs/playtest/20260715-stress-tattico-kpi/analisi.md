# Analisi — sessione stress tattico + KPI (20260715)

Prima sessione di stress QUALITATIVO sotto la griglia tattica reale: le run
di stress precedenti (run-04..08) giravano sul modello a distanza astratta.
Config di produzione ovunque (tetto3_ritardato + curva-G_tattica +
CUSTODE_TENSIONE_EXTRA). 6 run di stress × 10 seed + round KPI fresco
(5 party × 30 seed × taglie 2-10). Baseline: `logs/playtest/20260715-002418/`.

## Giocabilità

- **Curva KPI stabile rispetto alla baseline** (tutte le differenze entro il
  rumore di 150 sim/taglia): 2 eroi 40% (era 44%), 4 eroi 91% (87%), 6 eroi
  73% (74%), 8 eroi 66% (73%), 10 eroi 75% (82%). n=8 resta la taglia più
  debole, n=2 resta sotto il target 80% (nessuna scalatura scatta a 2, il
  party minimo è fragile per costruzione — non è una regressione).
- **ARTEFATTO DEL SIMULATORE trovato — stallo da affollamento a n=8-10.**
  `stress-08-senza-healer/spedizione.log`, round 16-31: 4 eroi vivi ripetono
  "si avvicina a ADEPTO INCAPPUCCIATO, non ancora a contatto" per 15 round
  consecutivi, mentre TUTTI i nemici in tessera ripetono "si avvicina, non
  ancora a contatto" — nessuno raggiunge mai nessuno fino al TIMEOUT (30
  round). Cause nel codice, non nel gioco:
  1. `fase_nemici` (riga ~1181): un nemico che arriva da fuori tessera prende
     la cella della porta **incondizionatamente** — con la tessera piena si
     impilano più nemici sulla stessa cella (nel log seed 0: ~14 nemici con
     posizione + 8 eroi in una tessera da 16 celle, fisicamente impossibile)
     e il BFS resta bloccato per tutti.
  2. `fase_eroi` (riga ~1279): con tutti i bersagli irraggiungibili
     (`cammino() or 99`), l'eroe insegue comunque quello con meno Ferite
     invece di ripiegare su Rianimare (4 alleati a terra ignorati per 15
     round) o Cercare.
  Conteggio nei log seed-0 disponibili: 4 TIMEOUT su 11 esiti a n≥8
  (kpi-08_p0, kpi-10_p0, kpi-10_p4, stress-08-senza-healer). I timeout
  contano come non-vittorie: **il 66%/75% a 8/10 eroi è sottostimato** da
  questo artefatto, non è tutta difficoltà onesta. Al tavolo vero lo stallo
  non esiste: i giocatori non impilano miniature e non inseguono un nemico
  irraggiungibile.
- Peggiorativo collaterale: nelle partite in stallo le carte crescendo fanno
  recuperare 1 ferita al Custode ("Il Custode recupera 1 ferita (4/4) e si
  attiva subito", round 23+31) → partita matematicamente persa ma trascinata
  fino al tetto dei 30 round.
- `stress-03-taglia-orfana` (3 eroi, mai misurata prima): 100% vittorie,
  20% sofferte, 11.4 round. Con 2 carte Minaccia (come a 4) e un eroe in
  meno regge comunque — nessun buco tra le taglie 2 e 4.

## Ansia

- **Il wipe dei "cervelli" è da manuale** (`stress-cervelli-griglia`, seed 0,
  round 9-11): Custode picchia da 2 danni su Difesa 8 (round 9: Sibilla
  3/7; round 10: Serra a terra su colpo del Fonditore 11+1=12, Carbone
  ridotto a 1/7 da tre attacchi consecutivi; round 11: Sgherro fresco da B1
  chiude Carbone, Custode chiude Sibilla). Escalation leggibile, morte a
  ondate, zero anticlimax: 60% vittorie e Custode anticipato al 10% (bordo
  alto del target 0-10%). Il party senza VIGORE paga il prezzo giusto.
- `stress-08-senza-healer`: 83% di vittorie sofferte e picco 2.7 eroi a
  terra — tensione altissima, ma il numero è gonfiato dagli stalli (le
  partite lunghe accumulano cadute). Da rimisurare dopo il fix del
  simulatore.
- n=6 resta il picco di tensione sana della curva: 64% di vittorie sofferte
  (baseline 60%) con 73% di vittorie — il bonus +2 Ferite a 6 lavora come
  progettato.

## Coinvolgimento

- Indagine piatta a 4.0 luoghi per ogni taglia ≥4 (identica alla baseline):
  l'euristica "efficiente" chiude appena ha il nucleo garantito. Non è un
  problema di design — è la via veloce prevista dal Vantaggio a due vie — ma
  significa che il proxy "luoghi visitati" non discrimina più tra taglie.
  La variante `stress-diapason-a-fondo` conferma che la via approfondita
  funziona: 6.0 luoghi, SLANCIO preso a 0 ore avanzate, 100% vittorie.
- Turn-order avverso (`stress-turnorder-brera-tattico`): anche agendo per
  ultimo, dopo Ottone ed Elena, Brera trova il bersaglio per "Vi conosco,
  Malacarne" (riga 84: "usa Vi conosco, Malacarne su ADEPTO INCAPPUCCIATO:
  rimosso dal tabellone"). La nicchia regge sotto la griglia reale: 90%
  vittorie, nessuna abilità morta nei log.

## Immersività

- **Diapason mai trovato: 0% perfino con l'euristica approfondita che
  visita 6 luoghi** (`stress-diapason-a-fondo/indagine.log`): il party
  trova la CORDA DI VIOLINO in Casa di Ruggero alle h21 — Bice dice
  esplicitamente che "Ferri ne teneva uno, in bottega" — ma l'euristica
  alle h22-23 sceglie Canale Basso e Sagrestia e le ore finiscono. Causa:
  `punteggio()` ordina per urgenza di chiusura e la Bottega del Liutaio
  (L5) non chiude mai → è sempre ultima in coda. Un tavolo vero, sentita
  Bice, ci ANDREBBE: nel genere (Sherlock Holmes Consulting Detective) i
  giocatori seguono le piste nominate, è il cuore del deduttivo. Il proxy
  `pct_diapason` oggi misura solo un limite dell'IA del simulatore, non
  l'immersione del gioco.
- CHI COMANDA confermato scala bene con la taglia (25% a 2 eroi → 99% a
  10): più eroi = più tipi di Approfondimento coperti. Il payoff narrativo
  della Domanda 2 arriva quasi sempre ai tavoli medi/grandi.

## Proposte (solo simulatore, nessuna regola di gioco toccata)

1. **Fix stallo** (`fase_nemici`): un nemico in arrivo entra solo se c'è una
   cella libera (porta o adiacente libera più vicina); altrimenti resta in
   coda fuori tessera. Precedente: HeroQuest/Gloomhaven — una stanza piena
   non accoglie altre miniature, lo spawn slitta.
2. **Fix bersaglio irraggiungibile** (`fase_eroi`): se nessun bersaglio ha
   cammino valido, l'eroe ripiega su Rianimare/Cercare invece di inseguire
   a vuoto (è quello che farebbe qualunque giocatore).
3. **Euristica diapason** (`punteggio()`): con la CORDA DI VIOLINO in mano,
   la Bottega del Liutaio sale in coda (modella il tavolo che segue la
   pista esplicita di Bice). In alternativa: dichiarare morto il proxy
   `pct_diapason` e toglierlo dalla tabella KPI.

Dopo i fix 1-2, rimisurare la curva n=8-10: l'aspettativa è che il 66%/75%
salga verso il target 80% senza toccare alcuna formula di gioco.
