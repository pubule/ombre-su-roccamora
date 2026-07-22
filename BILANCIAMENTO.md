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

Rimisura del **22/07/2026, dopo le correzioni allo strumento**, 4 eroi, 600
partite per episodio (`seed_base=970000`).

| ep | vittoria | sofferte | picco | round | canto | stato | nota |
|----|---------:|---------:|------:|------:|------:|-------|------|
| ep1 | 99% | 10% | 0.2 | 10.4 | 4.0 | aperto | scorta: **il simulatore non vale** (Playwright: 22%) |
| ep2 | 69% | 60% | 1.6 | 23.9 | 12.8 | aperto | scorta: il simulatore non vale — era 39% |
| ep3 | 99% | 6% | 0.1 | 13.0 | 5.1 | aperto | scorta: **il simulatore non vale** |
| ep4 | 87% | 35% | 1.0 | 14.0 | 8.0 | aperto | scorta: **il simulatore non vale** |
| ep5 | 83% | 82% | 1.7 | 20.2 | 9.6 | aperto | era 36%: il flag di vittoria non scattava col boss anticipato |
| ep6 | 62% | 66% | 0.9 | 19.1 | 9.7 | aperto |  |
| ep7 | 73% | 89% | 2.4 | 17.0 | 9.4 | **CHIUSO** | il riferimento sano |
| ep8 | 86% | 84% | 1.7 | 11.9 | 4.5 | aperto | ansia buona, solo un po’ facile |
| ep9 | 48% | 31% | 0.3 | 7.2 | 4.2 | aperto | sette round: si perde senza che cada nessuno |
| ep10 | 0% | 10% | 3.6 | 12.2 | 6.5 | aperto | orologio Demolizione: sale e non scende mai |
| ep11 | 16% | 95% | 3.9 | 11.2 | 6.9 | aperto | ansia altissima (95%), vittoria troppo bassa |
| ep12 | 0% | 0% | 0.1 | 7.1 | 6.4 | aperto | orologio FUGA: **12 sconfitte su 12 per scadenza** |
| ep13 | 58% | 87% | 2.5 | 12.2 | 8.5 | aperto |  |
| ep14 | 100% | 48% | 0.6 | 11.0 | 6.8 | aperto | passeggiata piatta |
| ep15 | 100% | 26% | 0.3 | 11.0 | 8.2 | aperto | passeggiata piatta |
| ep16 | 100% | 5% | 0.1 | 10.0 | 6.2 | **esente** | «il respiro»: facile per scelta |
| ep17 | 83% | 75% | 1.6 | 12.1 | 8.2 | aperto |  |
| ep18 | 63% | 78% | 1.0 | 12.5 | 8.1 | aperto |  |
| ep19 | 100% | 14% | 0.2 | 9.6 | 4.5 | aperto | passeggiata piatta |
| ep20 | 8% | 45% | 0.2 | 11.3 | 8.8 | aperto | il finale è quasi impossibile |

**Cinque difetti dello strumento, nessuna modifica al gioco** hanno spostato
l'Ep.2 da 39% a 69% e l'Ep.5 da 36% a 83%. Restano fuori, con numeri di cui ci
si può fidare:

- **troppo duri**: ep6 62%, ep9 48%, ep13 58%, ep18 63%
- **impossibili**: ep10 0%, ep12 0%, ep20 8%, ep11 16%
- **passeggiate piatte**: ep14, ep15, ep19 (100%, sofferte 14-48%)
- **appena sopra, ma tesi**: ep5 83%, ep8 86%, ep17 83% — l'ansia è a posto
  (75-84% di vittorie sofferte), manca solo qualche punto di difficoltà

**Il pattern più netto** non è la difficoltà, è l'ansia. Gli episodi facili sono
anche piatti (ep19 vince sempre col 14% di vittorie sofferte e un picco di 0.2):
non è che si vincano troppo spesso, è che **non succede niente**. E l'Ep.9, con
il 48% di vittorie, ha un picco di 0.3 su sette round: si perde senza cadere.

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

Alzare le tracce non basta e non si può: sono **componenti stampati**, e la più
lunga arriva a 14 caselle — non al doppio. La strada che il gioco già usa
altrove è far battere l'orologio **a round alterni**: è lo stesso trucco della
pesca Minaccia, dove la carta in più si pesca solo nei round pari
(`finale_v3`). Raddoppia la durata senza chiedere una casella in più al
cartone.
