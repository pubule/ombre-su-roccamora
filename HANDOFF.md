# Handoff — dove siamo

> A cosa serve: se la sessione muore, questo file basta a riprendere senza
> ricostruire niente. Si aggiorna a ogni commit. Il **cosa** fare sta nel
> piano (`PIANO-ACCOUNT-E-SALVATAGGI.md`, con le caselle da spuntare); qui c'è
> solo dove siamo arrivati, cosa gira, e il prossimo comando esatto.

**Lavoro in corso:** account, tavoli e salvataggi sul server.
Spec `DESIGN-ACCOUNT-E-SALVATAGGI.md` · piano `PIANO-ACCOUNT-E-SALVATAGGI.md`

**Aggiornato:** 09/08/2026 · ramo `main`

## Stato dei task

| | Task | Esito |
|---|---|---|
| ✅ | 1. Schema e database D1 | `ombre-salvataggi` creato (regione EEUR), schema applicato in locale e in remoto, cascata provata |
| ✅ | 2. Verifica del JWT di Access | `webapp/worker/access.js`, 9 asserzioni, provato non vacuo su 3 guasti |
| ✅ | 3. I cinque endpoint | `worker/api.js`, `worker/index.js`, 18 asserzioni, provato non vacuo su 3 guasti |
| ✅ | 4. Regola dei conflitti (`sync.js`) | 10 asserzioni, provata non vacua su 2 guasti (4 e 6 cadute) |
| ✅ | 5. Coda e `store.js` per tavolo | coda provata non vacua; i banchi di misura Playwright girano identici (ricaduta sulla chiave piatta senza tavolo) |
| ✅ | 6. Schermata tavoli e spia | 12 asserzioni end-to-end, provate non vacue su 2 guasti |
| 🔨 | 7. Access, dominio, prova sull'iPad | Access attivo e configurato; **manca la prova col browser** |

## Task 7 — dov'è arrivato

**Fatto.** L'applicazione Access esiste, con destinazione di tipo *Workers*
(copre URL di produzione e di anteprima), metodo di accesso **One-time PIN**
(codice via email — non Google: deciso il 09/08/2026, la barriera è comunque la
lista di email, e Google avrebbe richiesto un client OAuth su Google Cloud).
`ACCESS_TEAM=smartcores` e `ACCESS_AUD` sono in `wrangler.jsonc` e il Worker è
pubblicato (versione `c0ebac23`).

Verificato dal vivo: home, `/data/comune.json` e `/api/stato` rispondono tutti
302 verso `smartcores.cloudflareaccess.com`, anche presentando un JWT inventato.
Access intercetta prima del Worker, quindi la verifica nel Worker è la seconda
linea e non l'unica.

**Resta da fare, e richiede un browser:**

1. Aprire <https://ombre-su-roccamora.fabio-stocco85.workers.dev>, entrare col
   codice via email, e controllare che compaia **«chi gioca stasera?»** invece
   della lista episodi. È la prova che l'anello si chiude: cookie di Access →
   JWT al Worker → `/api/stato` 200 → schermata dei tavoli.
2. Creare un tavolo, aprire un episodio, e verificare che la spia in home dica
   *allineato*.
3. **Durata sessione a 1 month**, sull'applicazione **e sul criterio** (quella
   del criterio prevale): col default di 24 ore si rifà il login a metà serata.
4. **La prova sull'iPad**, che nessun test sostituisce: login in Safari,
   «Aggiungi alla schermata Home», aprire **dall'icona**, creare un tavolo,
   chiudere e riaprire. Se dall'icona ricompare il login e il giro passa da
   Safari lasciando fuori l'app, è il rischio previsto nella spec: annotarlo
   lì sotto «Rischi» e fermarsi a decidere insieme.

**Il dominio `roccamora.smartcores.org` NON è stato aggiunto, apposta.** La
destinazione Access è di tipo *Workers* e copre gli URL `workers.dev`, non un
dominio personalizzato: aggiungerlo adesso aprirebbe una seconda porta *senza*
Access davanti. Prima va aggiunta in Access una destinazione «nome host
pubblico» per quel nome, poi si mette la route in `wrangler.jsonc`. Finché non
serve, l'indirizzo `workers.dev` è protetto e va benissimo.

## Come si riprende

```bash
./webapp/build-dist.sh                                                    # wrangler dev serve dist, non public
npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787   # terminale a parte
npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788   # terminale a parte
node webapp/test-access.mjs      # non ha bisogno di server
node webapp/test-api.mjs         # ha bisogno di TUTTI E DUE i server
```

Servono due server perché l'isolamento fra account non si può provare con un
utente solo. Condividono lo stesso D1 locale, quindi il secondo vede davvero i
tavoli del primo — e deve rifiutarli.

Prossimo passo concreto: la prova col browser descritta sopra — entrare col
codice via email e vedere se compare «chi gioca stasera?». Da lì in poi il
lavoro è finito, salvo la prova sull'iPad.

## Cose sapute che il codice non dice

- **Il sito non è più pubblico** (dal 09/08/2026): Access chiede il codice via
  email prima di ogni cosa, `/data` con le soluzioni incluso. Access intercetta
  PRIMA del Worker, quindi in produzione un token storto non arriva nemmeno a
  `emailDaJwt()`: quella verifica serve contro i token validi ma emessi per
  un'altra applicazione dello stesso team.
- **`OSR_DEV_EMAIL` non deve mai entrare in `wrangler.jsonc`**: salta la
  verifica del token. Esiste solo come `--var` di `wrangler dev`, e c'è un
  test che controlla che non sia finito in configurazione.
- **Il `PRAGMA foreign_keys` del piano non è stato scritto**: è di connessione,
  non di database, quindi in cima a uno schema non fa niente. D1 applica i
  vincoli di suo — verificato cancellando un tavolo senza PRAGMA nel lotto.
- **`wrangler dev` ricarica a caldo, ma non all'istante.** Provando un test con
  un guasto deliberato, il test parte contro il codice VECCHIO e sembra che il
  guasto non venga rilevato — falso negativo che fa credere vacuo un test buono.
  Prima di lanciarlo, aspettare che il comportamento sia davvero cambiato (una
  chiamata di sonda in ciclo), non che il server risponda.
- **`compatibility_date` sta a `2026-08-08`**: il workerd che wrangler 4.120.0
  si porta dietro non conosce date più recenti e `wrangler dev` non parte.
- **Il binding `ASSETS` pretende un `main`**: non esiste uno stato intermedio
  in cui si dichiara il binding senza il Worker. Se `wrangler dev` dice
  «Cannot use assets with a binding in an assets-only Worker», è quello.
- Database D1: `ombre-salvataggi`, id `b0a85d9c-e7a6-4c3b-8940-1a50ad87fee2`.
- Dominio deciso per il Task 7: `roccamora.smartcores.org` (zona
  `smartcores.org`, l'unica sull'account).
