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
| ⬜ | 6. Schermata tavoli e spia | |
| ⬜ | 7. Access, dominio, prova sull'iPad | **ha passi manuali nel dashboard** |

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

Prossimo passo concreto: Task 6, `tavoli.js` e l'aggancio in `main.js`.

## Cose sapute che il codice non dice

- **Il sito in produzione è ancora pubblico.** Access non esiste ancora
  (Task 7): chiunque conosca l'URL entra e legge `/data` con le soluzioni.
  Gli endpoint `/api/` invece sono chiusi: con `ACCESS_TEAM`/`ACCESS_AUD`
  vuoti, `emailDaJwt()` rifiuta tutto e si prende un 403.
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
