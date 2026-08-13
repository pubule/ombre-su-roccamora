# Deploy

Tutto quel che serve a mandare online Ombre su Roccamora sta qui.

| file | cosa fa |
|---|---|
| `deploy.sh` | **il comando unico**: assembla, migra il database, pubblica |
| `build-dist.sh` | assembla `webapp/dist`, la cartella che Cloudflare serve |
| `applica-schema.sh` | porta il database allo schema (locale o produzione) |
| `schema.sql` | le tabelle: `tavoli`, `salvataggi`, `membri` |

La configurazione del Worker sta in `wrangler.jsonc` alla radice, perché
`wrangler` la cerca lì.

## Pubblicare

```bash
./deploy/deploy.sh
```

Fa tre cose **in quest'ordine**, e l'ordine è la sostanza:

1. `build-dist.sh` — appiattisce `public/`, `data/`, `assets/`, `fonts/` in
   `webapp/dist`;
2. `applica-schema.sh --remote` — porta il database di produzione allo schema;
3. `wrangler deploy` — pubblica il Worker.

Presuppone che `export-data.py`/`export-data.js`, `export-assets.py` e
`./fetch_fonts.sh` siano già girati: `webapp/data` e `webapp/assets` sono in
`.gitignore` e non stanno nel repo.

## La lezione che ha creato questa cartella

**`wrangler deploy` pubblica il codice e non tocca il database.** Sono due cose
separate e nessuno lo dice.

Il 13/08/2026 è andata online la vista eroe, che interroga la tabella `membri`.
In produzione quella tabella non esisteva: lo schema era stato scritto e provato
in locale, ma nessuno l'aveva applicato al database vero. Risultato: **ogni**
apertura dell'app rispondeva 500 su `/api/stato`. Il deploy era «riuscito», i
test erano tutti verdi, e l'app era morta — e non c'era modo di accorgersene
senza aprirla.

Per questo il passo 2 ora è dentro `deploy.sh` invece di essere una cosa da
ricordarsi: tutte le DDL sono `IF NOT EXISTS`, quindi rilanciarlo non costa
niente, e dimenticarlo costa l'app intera.

## Il database

D1 `ombre-salvataggi`, id `b0a85d9c-e7a6-4c3b-8940-1a50ad87fee2`.

```bash
./deploy/applica-schema.sh            # il D1 locale di `wrangler dev`
./deploy/applica-schema.sh --remote   # PRODUZIONE
```

Lo script stampa in fondo le tabelle presenti: se una manca si vede lì, e non da
un 500 in faccia a chi apre l'app.

Per guardarci dentro a mano:

```bash
npx --no-install wrangler d1 execute ombre-salvataggi --remote \
  --command "SELECT id, nome, proprietario FROM tavoli"
```

## Access

Team `smartcores`, applicazione su `roccamora.smartcores.org`.

L'autorizzazione ai tavoli sta **in D1**, non nel criterio di Access: Access
stabilisce *chi sei* (email verificata via OTP), `membri` stabilisce *a che
tavolo siedi e con che eroe*. Perciò invitare un giocatore non richiede di
toccare la dashboard Cloudflare.

Finché il criterio resta ristretto a una lista di email, però, un invitato che
non è in quella lista non arriva nemmeno alla porta. Per aprire a chiunque
verifichi un'email, il criterio va allargato dalla dashboard — è l'ultimo passo
che manca perché l'invito funzioni davvero da solo.

## Invitare un giocatore

L'API c'è ed è provata (`webapp/test-membri.mjs`), **l'interfaccia no**: si
invita a mano.

```bash
curl -X POST https://roccamora.smartcores.org/api/membri \
  -H 'Content-Type: application/json' \
  -d '{"tavolo":"<id-del-tavolo>","email":"amico@esempio.it","eroe":"ELENA FOSCO"}'
```

`eroe` può essere `null`: gli eroi non reclamati restano a chi arbitra.

## Provare in locale prima di pubblicare

Un solo `wrangler dev`. Due processi hanno **due Durable Object separati**
(condividono il D1, non i DO) e la stessa serata diventerebbe due partite.

```bash
./deploy/build-dist.sh
./deploy/applica-schema.sh
npx --no-install wrangler dev --var OSR_DEV_EMAIL:tu@esempio.it --port 8787
node webapp/test-eroe.mjs
```

Due trappole che costano tempo, entrambe già pagate:

- **più `wrangler dev` sulla stessa porta**: nessuno risponde, e il log continua
  a dire `Ready`. Si vede con `netstat -ano | grep ":8787"` — più righe
  `LISTENING` è quello. Chiudere i server di prova quando la prova finisce.
- **`wrangler dev` non ricarica** né `worker/*.js` né gli asset comparsi dopo
  l'avvio: un file nuovo in `public/js/` dà 404 finché non si riavvia.
