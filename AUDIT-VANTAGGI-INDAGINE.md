# Audit — i vantaggi d'Indagine arrivano davvero nella Spedizione? (21/09/2026)

**Domanda.** In ogni episodio, quel che l'Indagine consegna alla Spedizione (il
gradino Slancio / Preparati / Nessuno, il gettone Intuizione, l'effetto di ogni
Domanda) viene *applicato* dalla Spedizione, o resta scritto su una schermata?

**Metodo.** Non si legge il codice e si dice «c'e'»: si gioca. Per il preludio e
per ogni episodio (ep.1-20), e per cinque notti d'Indagine che coprono ogni
gradino (`audit-vantaggi.mjs`):

1. si costruisce una notte vera e si apre la busta col **motore** (`applica`, `apri-busta`);
2. si scende con l'**interfaccia** vera (`#via` → `iniziaPartita`);
3. si legge lo stato che la Spedizione ha davvero: Salute massima di ogni eroe,
   azioni del 1° round, Canto di partenza, quante carte Minaccia pesca il round 1;
4. si confronta con le **regole stampate** (`src/gen_docs.py`, «Il vantaggio
   d'Indagine»), riscritte a mano nell'audit e non importate dal motore.

`node webapp/server.js` e poi `node webapp/audit-vantaggi.mjs [--solo=ep3,ep7]`
(~3 minuti; si puo' spezzare in tre esecuzioni parallele). Il banco e' provato
non vacuo: togliendo i bonus di `stat.js` (`bonusTier`, `azioniMax`) fallisce
su ogni scenario col vantaggio, e ripristinandoli torna verde.

## Le regole stampate

| gradino | condizione | effetto in Spedizione |
|---|---|---|
| Slancio | TUTTE le Domande esatte E 3+ ore avanzate | 3 azioni (di tipo diverso) a testa nel 1° round, +1 Salute massima |
| Preparati | 1+ ore avanzate O 6+ luoghi visitati | +1 Salute massima a testa |
| Nessuno | tutto il resto | niente |
| Dossier completo | 0 ore avanzate | 1 gettone Intuizione: un ri-tiro di un tiro appena fallito, una volta |
| Ogni Domanda | esatta / sbagliata | un effetto suo (`esatta` / `sbagliata` nei dati d'episodio) |

## Esito

### Applicato davvero, in tutti gli episodi — 104 scenari su 104 verdi

Preludio + ep.1-20 × 5 notti (Slancio; Preparati per ore; Preparati per luoghi;
Nessuno + dossier; «tutte giuste ma solo 2 ore» = il gradino sotto), meno il
gradino per luoghi del preludio, che ne ha 4:

- **il gradino**: la busta da' quello che dice la regola, ovunque (le soglie sono
  identiche in tutti gli episodi: 3 / 1 / 6);
- **+1 Salute massima** con Slancio e con Preparati, e nessun bonus con Nessuno
  (le vite di partenza dell'`iniziaPartita` vera, contro `salute` + bonus taglia
  + vantaggio + `salute_extra` dell'episodio);
- **3 azioni nel 1° round** con Slancio, 2 altrimenti;
- **il Canto di partenza**: le 11 Domande con `penalita.canto` (ep.2, 3, 4, 6×2,
  7×2, 8×2, 9, 20) lo fanno partire da 1 in piu' quando sbagliate. Nessuna
  Domanda scrive «un segnalino Canto in piu'» senza il campo strutturato;
- il vantaggio **arriva ai telefoni** (`statoPerPosto` lo lascia passare).

Il preludio non ha il gradino per luoghi (ne ha 4 su 6 richiesti): non e' un difetto.

### Promesso e NON applicato — lacune

**1. Il gettone Intuizione (dossier) non esiste in Spedizione.** La busta lo
annuncia («Dossier completo: 1 gettone Intuizione — un solo ri-tiro»), il
motore lo calcola (`vantaggi.dossier`), ma nessuno stato lo tiene e nessun
comando lo spende: `dossier` non e' letto da niente. Vale per **tutti i 21
episodi** in cui si arriva a 0 ore. Chi arbitra deve ricordarselo e gestire a
mano il ri-tiro, che nel digitale non ha nemmeno un posto dove farsi.

**2. «Domanda 1 esatta: nel 1° round non si pesca nessuna carta Minaccia» non e'
applicata in nessuno dei 20 episodi.** E' la ricompensa piu' comune (20
Domande su 80). `carteDaPescare` non guarda le risposte: la Spedizione pesca
comunque, e nel digitale il mazzo lo pesca il motore, quindi chi arbitra non puo'
«saltare» la pesca. Chi ha risposto giusto non riceve il premio.

**3. Quasi tutti gli altri effetti per-Domanda sono prosa, non regole.** Su
80 Domande d'Indagine (ep.1-20) solo 11 hanno un campo che il motore legge
(`penalita.canto`). Il resto vive nei campi `esatta` / `sbagliata`, che la
busta mostra a chi arbitra e poi non si vedono piu':

| effetto (prima classe che combacia) | Domande | esempio |
|---|---|---|
| nessuna Minaccia nel 1° round (esatta) | 20 | Domanda 1 di ogni episodio |
| il boss salta un'attivazione/attacco, «gridate il suo nome» | 13 | ep.3.2, ep.6.2, ep.9.2 |
| traccia, tessere, prove, Difesa, tipo di vittoria | 22 | ep.10.3 (DEMOLIZIONE parte da 2), ep.12.3 (FUGA dimezzata), ep.13.3/13.4 |
| nemico extra in T1 (sbagliata), non gia' contato sopra | 1 | (gli altri ~14 castighi stanno sulla stessa Domanda 1 della prima riga) |
| Canto di partenza | 7 | ep.4.3, ep.6.3, ep.7.3/7.4, ep.8.3/8.4, ep.9.3 — **applicate** |
| narrativa / seme di campagna, nessun effetto meccanico | 17 | ep.15-20 in gran parte |

Le 11 Domande con `penalita.canto` sono le 7 dell'ultima riga piu' 4 che
stanno anche in «nessuna Minaccia» (ep.2.1, 3.1, 6.1, 20.1): per quelle il Canto
e' applicato, il premio della risposta esatta no.

Anche i **castighi** della Domanda 1 sbagliata («1 Sgherro appare in T1 alla
rivelazione», in ~15 episodi) non sono applicati: la Spedizione digitale e' cosi'
un po' piu' facile di quella stampata quando si sbaglia, e ugualmente non premia
chi indovina. Le classi sono per parole chiave: sono conteggi, non un verdetto.

### Anomalia trovata strada facendo — Ep.9 non ha pressione dal mazzo

Nell'**Ep.9** il motore, alla **prima** fase Minaccia, dichiara *«Obiettivo
compiuto: il mazzo Minaccia non pesca piu'»* — e il mazzo non pesca **mai**. La
causa: `obiettivoFatto` (motore/obiettivi.js) conta i PNG scortati «liberati», e
Anselmo Riva parte gia' libero (`parte_libero: true`, unico caso nei dati);
l'episodio non ha compiti. L'obiettivo vero — portarlo al Molo (T6) — non e'
affatto compiuto. Non l'ho misurato sul pilota: e' una lettura del codice
confermata dal banco, non una stima di quanto renda l'episodio piu' facile.
L'Ep.9 e' fra gli episodi che la mappa del pilota segnava come fuori banda.

## Cosa proporrei, in ordine di costo

1. **Ep.9** (piccolo): `obiettivoFatto` non deve contare come «liberato» chi
   `parte_libero`; per la scorta l'obiettivo e' l'arrivo alla `meta`. Poi
   rimisurare l'episodio col pilota, perche' cambia il bilanciamento.
2. **«Nessuna Minaccia nel 1° round»** (piccolo): un campo strutturato sulla
   Domanda (`effetto: { nessuna_minaccia_r1: true }`, generato da
   `export-data`), letto da `carteDaPescare` con `vantaggi.risposte[0]`.
3. **Castighi di Domanda 1** (medio): `effetto: { spawn_t1: 'SGHERRO' }`, applicato
   alla rivelazione di T1.
4. **Intuizione** (medio): `sp.intuizione: 1` se `vantaggi.dossier`, un comando
   che ripete l'ultimo tiro fallito di un eroe, e un bottone sull'overlay del
   tiro; senza, tenere almeno un promemoria sulla plancia.
5. **Effetti su traccia/tessere/prove/boss** (grande): ognuno e' una regola
   diversa per episodio. Conviene decidere quali automatizzare e quali lasciare a
   chi arbitra *dicendolo* al momento giusto (un promemoria sulla plancia al
   round che li riguarda), invece di sparire dopo la busta.

## Cosa questo audit NON copre

- solo 4 eroi (la taglia piu' comune); `salute_bonus_per_taglia` nei dati vale
  solo per 2 e 4 eroi (`{"2":1,"4":1}`): a 3, 5+ non c'e' bonus taglia;
- che le 3 azioni dello Slancio siano davvero di tipo diverso (l'audit conta le
  azioni consentite, non prova la regola «tipo diverso» con tre azioni vere);
- il ramo «solo la spedizione» (`vistaEsitoIndagine`), dove il gradino si
  dichiara a mano: legge gli stessi bonus, ma non e' stato giocato qui;
- la modalita' tavolo stampata (carta e dadi): qui si e' provato il digitale.
