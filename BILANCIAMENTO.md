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

Misura di base del **22/07/2026**, 4 eroi, 600 partite per episodio
(`seed_base=970000`). **Un episodio chiuso su venti.**

| ep | vittoria | sofferte | picco | round | canto | stato | cosa manca |
|----|---------:|---------:|------:|------:|------:|-------|------------|
| ep1 | 64% | 60% | 1.9 | 17.9 | 9.0 | aperto | troppo duro; sofferte al limite |
| ep2 | 39% | 93% | 2.7 | 34.5 | 19.8 | aperto | troppo duro — **34 round**, il più lungo |
| ep3 | 43% | 32% | 1.1 | 17.5 | 7.8 | aperto | troppo duro e poca ansia |
| ep4 | 87% | 35% | 1.0 | 14.0 | 8.0 | aperto | troppo facile e piatto |
| ep5 | 36% | 75% | 2.1 | 21.7 | 10.0 | aperto | troppo duro |
| ep6 | 55% | 64% | 0.8 | 18.8 | 9.4 | aperto | troppo duro, picco sotto |
| **ep7** | **73%** | **89%** | **2.4** | 17.0 | 9.4 | **CHIUSO** | il riferimento sano |
| ep8 | 86% | 84% | 1.7 | 11.9 | 4.5 | aperto | troppo facile (ansia buona) |
| ep9 | 48% | 31% | 0.3 | 7.2 | 4.2 | aperto | duro **e** senza ansia: 7 round |
| ep10 | 0% | 10% | 3.6 | 12.2 | 6.5 | aperto | impossibile; orologio da rifare |
| ep11 | 16% | 95% | 3.9 | 11.2 | 6.9 | aperto | troppo duro (ansia altissima) |
| ep12 | 0% | 0% | 0.1 | 7.1 | 6.4 | aperto | impossibile; orologio da rifare |
| ep13 | 58% | 87% | 2.5 | 12.2 | 8.5 | aperto | troppo duro, poco |
| ep14 | 100% | 48% | 0.6 | 11.0 | 6.8 | aperto | passeggiata |
| ep15 | 100% | 26% | 0.3 | 11.0 | 8.2 | aperto | passeggiata |
| **ep16** | 100% | 5% | 0.1 | 10.0 | 6.2 | **ESENTE** | «il respiro»: facile per scelta |
| ep17 | 83% | 75% | 1.6 | 12.1 | 8.2 | aperto | poco troppo facile |
| ep18 | 63% | 78% | 1.0 | 12.5 | 8.1 | aperto | troppo duro, poco |
| ep19 | 100% | 14% | 0.2 | 9.6 | 4.5 | aperto | passeggiata |
| ep20 | 8% | 45% | 0.2 | 11.3 | 8.8 | aperto | il finale è impossibile |

**Come si distribuiscono i guai:** sette episodi troppo duri (ep2, 3, 5, 6, 9,
13, 18), quattro impossibili (ep10, 12, 20, 11), cinque passeggiate (ep14, 15,
19, 4, 8), uno appena sopra (ep17). Nessuno è «quasi a posto» per caso: l'unico
chiuso è l'Ep.7.

**Il pattern più netto** non è la difficoltà, è l'ansia. Gli episodi facili sono
anche piatti (ep14 sofferte 48%, ep15 26%, ep19 14%, picchi 0.2-0.6): non è che
si vincano troppo spesso, è che **non succede niente**. E l'Ep.9, con 48% di
vittorie, ha un picco di 0.3 su sette round: si perde senza nemmeno cadere.

## Lavoro preliminare ancora aperto

- **I simulatori di Ep.1 ed Ep.2 sono ciechi sulla loro uscita segreta**
  (insegnata solo a `simulate_ep3.py` e `simulate_ep4.py`): i loro numeri
  descrivono un episodio che non esiste più e vanno corretti prima di tararli.
- **Ep.10, 11, 12 e 20** hanno orologi per-round (`FUGA_MAX`,
  `DEMOLIZIONE_MAX`, `SOGLIA_RISVEGLIO`) tarati su partite di lunghezza
  dimezzata: vanno rifatti, non ritoccati.
