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

## Access — chi può arrivare alla porta

Team `smartcores`. Applicazione **`roccamora`** su `roccamora.smartcores.org`,
identità **one-time PIN** (il codice via email), `auto_redirect_to_identity`
attivo.

**Due autorizzazioni diverse, e vanno tenute distinte:**

| | chi decide | dove si cambia |
|---|---|---|
| *puoi arrivare al sito?* | criterio di Access | dalla **rubrica** (o a mano dalla dashboard) |
| *a che tavolo siedi, con che eroe?* | tabella `membri` | dalla schermata «chi gioca» |

**Invitare qualcuno dall'app NON gli manda nessuna email**: scrive una riga in
`membri`. L'unica email in gioco è il codice OTP di Access, e parte solo quando
l'invitato apre il sito e digita il proprio indirizzo — e solo se il criterio lo
ammette. Un invitato fuori dal criterio non riceve niente e non capisce perché:
è la porta che lo ferma prima, non l'app.

Per questo la **rubrica** (dentro l'app) apre anche il criterio quando si crea
una persona: era l'unico passaggio rimasto sulla dashboard, e quindi l'unico che
si dimenticava.

### Aggiungere l'email di un giocatore — dalla RUBRICA

Dal 16/08/2026 questo passaggio sta **dentro l'app**: schermata dei tavoli →
**rubrica** → *aggiungi una persona*. Nome ed email si scrivono una volta sola,
e l'indirizzo entra nel criterio nello stesso gesto; ai tavoli poi si danno i
posti toccando i nomi. Chi era già in rubrica quando la porta non c'era si
sistema col bottone **«apri la porta a chi manca»**.

**Perché funzioni serve un token**, e non sta nel repository:

1. <https://dash.cloudflare.com> → **My Profile → API Tokens → Create Token**
2. permesso **Account · Access: Apps and Policies · Edit** sull'account giusto
3. `npx --no-install wrangler secret put CF_API_TOKEN` e incollarlo

Il resto è in `wrangler.jsonc` → `vars`: `CF_ACCOUNT_ID`, `ACCESS_POLICY_ID` (il
criterio che l'app scrive) e `PORTIERI` — chi può aprire la porta dall'app.
Vuoto, o senza token, l'app non chiama Cloudflare e la rubrica dice cosa manca.

**L'app aggiunge e basta**: non toglie mai un indirizzo dal criterio — si apre
da sola, si chiude a mano, così un tocco sbagliato non lascia fuori qualcuno a
metà campagna. Chi resta nel criterio senza rubrica si vede in fondo alla
schermata.

### A mano, dalla dashboard

Serve solo per togliere qualcuno, o se il token non è configurato.

1. <https://one.dash.cloudflare.com> → team **smartcores**
2. **Access → Applications → `roccamora`**
3. scheda **Policies** → apri il criterio dei giocatori
4. nel blocco **Include**, selettore **Emails**: aggiungi o togli l'indirizzo —
   uno per riga, o `Add include` per aggiungerne altri
5. **Save**

In alternativa, per non aggiungerli uno per uno: `Include` → **Emails ending
in** `@gmail.com`, oppure **Everyone** con `Require` → *one-time PIN*. Quella
strada lascia entrare chiunque verifichi un'email — ma chi non è in `membri`
apre l'app e **non vede nulla**: nessun tavolo, nessuna partita. È il modello
per cui l'autorizzazione sta in D1.

### La sessione dura 24 ore, e al tavolo si sente

Ogni browser richiede il codice ogni giorno: a serata cominciata significa
fermare tutti per farsi mandare un OTP. Va portata a un mese **in due posti** —
quella del criterio prevale su quella dell'applicazione, quindi cambiarne uno
solo non basta:

1. **Access → Applications → `roccamora` → Configuration → Session Duration** →
   `1 month`
2. stessa app → **Policies** → il criterio → **Session Duration** → `1 month`

## Invitare un giocatore

Dalla schermata dei tavoli, **«chi gioca»** sul proprio tavolo: si scrive
l'email con cui entrerà nell'app e gli si dà un eroe. Il bottone c'è solo sui
tavoli che si arbitra — un giocatore seduto non può portarne altri, e il Worker
lo impone comunque (`arbitroDi` in `api.js`).

L'eroe può restare in sospeso: quelli non presi da nessuno restano a chi
arbitra. Uno già preso non compare nell'elenco, perché due giocatori non possono
avere lo stesso eroe allo stesso tavolo — a dirlo è un indice unico nel
database, non un controllo che qualcuno un giorno dimenticherà.

**Da lì non parte nessuna email.** Il posto resta pronto e basta: il link
all'app mandaglielo tu (la schermata lo mostra, con un bottone per copiarlo), e
lui entra da solo. Perché ci riesca, la sua email deve già essere nel criterio
di Access — vedi sopra.

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
