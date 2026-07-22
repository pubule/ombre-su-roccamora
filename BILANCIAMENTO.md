# Bilanciamento della campagna — il tabellone

Stato del lavoro di taratura, episodio per episodio. Questo file è la memoria
del ciclo: le conversazioni si perdono, il tabellone no. Si rilegge prima di
decidere cosa toccare e si riscrive dopo ogni misura.

## Cosa si misura, e cosa no

Si misura con `python scripts/misura_kpi.py <epN|tutti> [n_party] [n_seed]`,
sempre **a 4 eroi** — la taglia di riferimento.

| KPI | strumento | bersaglio |
|-----|-----------|-----------|
| giocabilità | `pct_vittoria` | **70-80%** |
| ansia | `pct_vittoria_sofferta` / `pct_sofferta` | **≥ 60%** |
| ansia | `media_max_down` (picco di eroi a terra) | **≥ 1.0** |
| coinvolgimento | *nessuno* | — |
| immersione | *nessuno* | — |

**Un episodio in fascia con l'ansia sotto soglia non è chiuso**: è diventato
una passeggiata, e si respinge come si respinge una sconfitta.

Coinvolgimento e immersione non hanno numero. Nessuna riga di questa tabella
dice se un episodio è ancora bello — per questo ogni modifica passa da una
domanda, e ogni leva viene etichettata:

- **taratura** — cadenza del Canto (`ep.canto_ogni`), serbatoi (`pool`),
  soglie, composizione del mazzo, statistiche nemiche: cambiano *quanto è duro*
  un episodio;
- **struttura** — togliere un inseguimento, aprire una scorciatoia, accorciare
  la spina, eliminare il ritorno: cambiano *cos'è* un episodio. Sono quelle che
  uccidono immersione e coinvolgimento senza che nessun numero se ne accorga.

Il precedente che giustifica tutta questa cautela: il 22/07/2026 l'uscita
segreta ha portato l'Ep.4 dal 4% al 97% **cancellando l'inseguimento del
Suggeritore**. Il KPI diceva «risolto», il gioco era peggiorato.

## Avvertenze sulle misure

- **600 partite** (`n_party=20, n_seed=30`) per decidere. Sotto, il rumore è
  ±10 punti: lo stesso Ep.3 a 4 eroi ha dato 0%, 16% e 31% con gruppi diversi.
- Solo confronti **appaiati** (stesso `seed_base`) valgono qualcosa.
- I simulatori sono **ottimisti sul movimento** (regalano una tessera a round):
  le percentuali assolute vanno lette con quel margine, i confronti no.

## Il tabellone

Rimisura del **22/07/2026**, 4 eroi, 600 partite per episodio
(`seed_base=970000`). Lo stato con l'asterisco (`aperto*`) segna gli episodi a
**tensione non letale**, dove le soglie sul sangue non si applicano.

| ep | vittoria | piena | sofferte | picco | round | stato | cosa manca |
|----|---------:|------:|---------:|------:|------:|-------|------------|
| ep1 | 99% | — | 10% | 0.2 | 10.4 | aperto | troppo facile (99% > 80%); poca ansia: sofferte 10% < 60%; poca ansia: |
| ep2 | 69% | — | 60% | 1.6 | 23.9 | aperto | troppo duro (69% < 70%) |
| ep3 | 99% | — | 6% | 0.1 | 13.0 | aperto | troppo facile (99% > 80%); poca ansia: sofferte 6% < 60%; poca ansia:  |
| ep4 | 87% | — | 35% | 1.0 | 14.0 | aperto | troppo facile (87% > 80%); poca ansia: sofferte 35% < 60% |
| ep5 | 83% | — | 82% | 1.7 | 20.2 | aperto | troppo facile (83% > 80%) |
| ep6 | 62% | — | 66% | 0.9 | 19.1 | aperto | troppo duro (62% < 70%); poca ansia: picco a terra 0.9 < 1.0 |
| ep7 | 73% | — | 89% | 2.4 | 17.0 | **CHIUSO** | il riferimento sano |
| ep8 | 86% | — | 84% | 1.7 | 11.9 | aperto | troppo facile (86% > 80%) |
| ep9 | 48% | — | 31% | 0.3 | 7.2 | aperto* | troppo duro (48% < 70%) |
| ep10 | 0% | — | 10% | 3.6 | 12.2 | aperto | troppo duro (0% < 70%); poca ansia: sofferte 10% < 60% |
| ep11 | 16% | — | 95% | 3.9 | 11.2 | aperto | troppo duro (16% < 70%) |
| ep12 | 0% | — | 0% | 0.1 | 7.1 | aperto | troppo duro (0% < 70%); poca ansia: sofferte 0% < 60%; poca ansia: pic |
| ep13 | 58% | 58% | 87% | 2.5 | 12.2 | aperto | troppo duro (58% < 70%) |
| ep14 | 100% | 78% | 48% | 0.6 | 11.0 | aperto* | troppo facile (100% > 80%); il finale amaro non esiste (78% > 60%) |
| ep15 | 98% | 58% | 47% | 0.7 | 11.7 | aperto* | troppo facile (98% > 80%) |
| ep16 | 100% | 100% | 5% | 0.1 | 10.0 | **esente** | «il respiro»: facile per scelta |
| ep17 | 83% | 71% | 75% | 1.6 | 12.1 | aperto | troppo facile (83% > 80%); il finale amaro non esiste (71% > 60%) |
| ep18 | 86% | 46% | 68% | 0.8 | 12.4 | aperto* | troppo facile (86% > 80%) |
| ep19 | 100% | 51% | 14% | 0.2 | 9.6 | aperto* | troppo facile (100% > 80%) |
| ep20 | 8% | — | 45% | 0.2 | 11.3 | aperto | troppo duro (8% < 70%); poca ansia: sofferte 45% < 60%; poca ansia: pi |

**Dove siamo, dopo una giornata di correzioni.** Un episodio chiuso (Ep.7),
uno esente per scelta (Ep.16), e il resto raggruppato per che cosa gli manca:

- **troppo facili**: ep5 83%, ep8 86%, ep17 83%, ep18 86%, ep15 98%, ep14 100%,
  ep19 100% — quasi tutti con l'ansia già a posto o non pertinente
- **troppo duri**: ep6 62%, ep9 48%, ep13 58%, ep11 16%, ep20 8%
- **non misurabili col simulatore**: ep1, ep3, ep4 (scorta e uscita segreta),
  ep10, ep12 (la vittoria dipende dal tenere inchiodato un nemico)

Quasi tutto il resto è arrivato qui **senza toccare il gioco**: cinque difetti
dello strumento valevano l'Ep.2 da 39% a 69% e l'Ep.5 da 36% a 83%. Le uniche
modifiche di gioco applicate finora sono la cadenza del Canto per Ep.3, 5 e 6 e
le tre soglie dell'Atto III.

**Due lezioni che il tabellone deve ricordare.** La prima: il KPI contava le
vittorie parziali insieme a quelle vere, e nascondeva finali che nessuno
avrebbe mai visto. La seconda: cinque episodi non sono letali per scelta, e
misurarli col sangue avrebbe portato a insanguinarli — nell'Ep.19, raddoppiare
le carte che generano nemici sposta le vittorie sofferte dal 21% al 26%, perché
lo Sgherro fa 1 danno contro 7-9 Salute. Non erano tarati male: sono fatti di
un'altra materia.

## Il KPI misurava la cosa sbagliata (22/07/2026)

`pct_vittoria` conta **anche le vittorie parziali**. Negli episodi con due
finali questo nasconde il dato che conta:

| ep | a tabellone | vittoria **piena** | scarto |
|----|------------:|-------------------:|-------:|
| ep14 | 100% | 76% | 24 |
| ep15 | 100% | **0%** | 100 |
| ep17 | 82% | **2%** | 80 |
| ep18 | 58% | 16% | 42 |
| ep19 | 100% | 52% | 48 |

L'Ep.15 non apre **mai** la Contro-busta — il finale che dice «chi ha scritto
il dossier?» — in seicento partite. L'Ep.17 due volte su cento. Sono i finali
che portano avanti l'Atto III, e nessun tavolo li vedrà.

Causa, per l'Ep.15: la regola stampata vuole «Capo preso E 4+ tell documentati
prima del sigillo». I tell si raccolgono in abbondanza (6 su 4 richiesti), ma
il Capo sta in T6 e la villa si sigilla al Canto 5, cioè al round 8-9, mentre
in T6 si arriva al round 11. **Il viaggio è più lungo dell'orologio**, come per
Ep.10 ed Ep.12 — ma qui la soglia è un numero d'episodio, che la Soluzione già
dichiara, e alzarla funziona:

**APPLICATO il 22/07/2026.** Le tre soglie erano tarate su una marcia lunga la
metà: la spedizione arriva al secondo obiettivo al round 11-12, e scattavano al
round 5-8. Alzate nei simulatori e nelle Soluzioni stampate (testo verificato
nei PDF renderizzati):

| ep | soglia | prima | dopo | piena prima | piena dopo |
|----|--------|------:|-----:|------------:|-----------:|
| ep15 | sigillo | 5 | **8** | 0% | **58%** |
| ep17 | decano | 3 | **6** | 1% | **71%** |
| ep18 | arresto | 4 | **7** | 21% | **46%** |

Non chiudono gli episodi: restano troppo facili sul totale (98%, 83%, 86%) e
due su tre sono piatti (picco 0.7 e 0.8). Ma i finali che portano avanti l'Atto
III adesso si vedono.

## Il difetto che invalida la colonna «troppo duro» (22/07/2026)

Cinque simulatori — **Ep.1, 2, 3, 5, 6** — contengono un ciclo
`while boss['fer'] > 0 and vivi()`: **inchiodano il gruppo al boss finché uno
dei due non muore**. Sono esattamente i cinque episodi «troppo duri» con
l'orologio del Canto.

Ma i fascicoli dicono il contrario. L'Ep.2: «QUANDO ILARIO ENTRA NEL CONDOTTO
la spedizione è VINTA». L'Ep.3: «potete fuggire con Tobia senza affrontarlo».
Il boss, in quegli episodi, **si può evitare** — e il simulatore non lo sa.

Cosa succede davvero, tracciato su una partita dell'Ep.2 (party wipe al round
30): 22 round di scontro, **51 carte Minaccia pescate, 24 nemici piazzati
contro 19 abbattuti**. Il gruppo uccide quasi alla stessa velocità con cui la
stanza si riempie, e intanto incassa. Non è un boss difficile: è un tapis
roulant da cui il simulatore non lascia scendere.

**Nessuna taratura di quei cinque episodi vale niente finché questo non è
risolto**: si renderebbe il gioco più facile per compensare uno strumento che
lo gioca male.

## Due strumenti, e quando credere a quale (22/07/2026)

Corretti i due difetti sopra, l'Ep.1 misura **99%** di vittorie in **10.4
round**. Il pilota Playwright, che gioca la plancia vera, misura lo stesso
episodio al **22%** in **17-25 round**.

Settantasette punti di scarto non sono rumore: è il limite del simulatore.
Regala una tessera a round e ignora blocchi, porte e ingombri — e negli
episodi di **scorta con uscita segreta** tutta la difficoltà è proprio lì:
portare fuori un PNG lento (Mov 3, non agisce) attraverso una stanza piena.
Tolto il rientro a piedi, al simulatore non resta niente da simulare.

| episodi | strumento da usare |
|---------|--------------------|
| Ep.1-4 (scorta + uscita segreta) | **Playwright** (`webapp/misura-episodio.mjs`) — lento (~1-2 min a partita) ma vede lo spazio; richiede le tessere disegnate, che oggi esistono solo per Ep.1 e Ep.2 |
| tutti gli altri | il simulatore, che per loro va bene |

Le percentuali di Ep.1, 2, 3 e 4 in questa tabella **non vanno usate per
tarare**: descrivono una spedizione senza geometria.

## Gli orologi che non si possono battere (Ep.10, 12, 20)

Ep.10 ed Ep.12 misurano **0%**, e non perché il gruppo muoia: su 12 partite
dell'Ep.12, **12 sconfitte per scadenza** della traccia FUGA, mai una per
ferite. Le tracce salgono di 1 a round e non scendono quasi mai
(`FUGA_BACKGROUND = 1`, `DEMO_BACKGROUND`), mentre il viaggio è lungo il doppio
di quanto era quando quei numeri furono scelti: i simulatori regalavano una
tessera a round finché la marcia non è stata corretta a 2 round per tessera.

`FUGA_MAX = 10` con +1 a round garantisce la sconfitta entro il 10° round; la
spedizione ne dura 11-12. È aritmetica, non difficoltà.

**Provato: far battere l'orologio a round alterni non serve** — misurato su
entrambi, zero guadagno, e la modifica è stata rimossa invece di lasciare nel
gioco una regola cambiata senza prove. Il ritmo di fondo non è il termine che
decide. Quello che decide, in tutti e due, è una regola che il simulatore non
sa rappresentare:

- **Ep.12**, dalla Soluzione: «alla fine di ogni round in cui **NESSUN eroe è
  adiacente al Corriere**, +1». Il freno è stargli addosso — e nel modello il
  Corriere non sta nemmeno sulla plancia: la FUGA sale sempre.
- **Ep.10**, dalla Soluzione: all'intercapedine «ogni turno del Muratore in cui
  **NESSUN eroe gli è adiacente** vale +2; **inchiodato, attacca voi e non
  demolisce**». È da lì che arrivano i salti a +2 che riempiono la traccia,
  non dal ritmo di fondo. Tracciata una partita: DEMOLIZIONE 13/12 contro PROVA
  12/14 — persa per **due caselle**.

In entrambi gli episodi la vittoria dipende dal **tenere il nemico inchiodato**,
cioè da una scelta di posizione che il modello a corsa non ha. Sono nella stessa
condizione degli episodi di scorta: numeri da non usare per tarare.

Il che sposta la domanda: se anche Ep.10 e Ep.12 vanno misurati sulla plancia,
gli episodi che il simulatore sa misurare davvero sono quelli senza inseguimento
e senza scorta.
