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
| ✅ | 7. Access, dominio, login | provato dal vivo l'11/08/2026: si entra col codice e compare la scelta del tavolo |

## Task 7 — com'è finito

Il lavoro è in piedi su **<https://roccamora.smartcores.org>**. Si entra con un
**codice via email** (One-time PIN, non Google: deciso il 09/08/2026 — la
barriera è comunque la lista di indirizzi, e Google avrebbe richiesto un client
OAuth su Google Cloud). L'applicazione Access ha due destinazioni: il Worker
(URL di produzione e anteprima) e il nome host pubblico.

`ACCESS_TEAM=smartcores` e `ACCESS_AUD` in `wrangler.jsonc`. Verificato dal
vivo: home, `/data/comune.json` e `/api/stato` rispondono 302 verso
`smartcores.cloudflareaccess.com` anche presentando un JWT inventato.

**`ombre-su-roccamora.fabio-stocco85.workers.dev` è spento** (404): aggiungendo
la route del dominio, wrangler ha disattivato da sé `workers.dev` — e con esso
gli URL di anteprima. Per riaccenderlo servirebbe `"workers_dev": true`, ma
allora andrebbe verificato che la destinazione Workers dell'applicazione Access
lo copra ancora.

### Quello che resta

1. **Durata sessione a 1 month**, sull'applicazione **e sul criterio**: quella
   del criterio prevale, e col default di 24 ore si rifà il login ogni giorno.
2. **La prova sull'iPad**, che nessun test sostituisce: login in Safari,
   «Aggiungi alla schermata Home», aprire **dall'icona**, creare un tavolo,
   chiudere e riaprire. Se dall'icona ricompare il login e il giro passa da
   Safari lasciando fuori l'app, è il rischio previsto nella spec: annotarlo lì
   sotto «Rischi» e fermarsi a decidere insieme.
3. Da provare quando capita: una serata vera, e la partita ripresa da un altro
   dispositivo.

### Aggiunto l'11/08/2026

Gestione dei tavoli: si elimina un tavolo dalla sua voce nell'elenco (con le
sue partite, per cascata), e la home mostra il nome del tavolo corrente
accanto alla spia — «cambia tavolo» era gia' li' ma non si trovava, e sembrava
che un tavolo nuovo si potesse creare solo quando non ce n'erano.

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

Prossimo passo concreto: nessuno in codice. Restano i due punti qui sopra —
durata sessione e prova sull'iPad — che si fanno col browser.

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
