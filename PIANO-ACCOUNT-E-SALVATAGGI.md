# Account, tavoli e salvataggi — piano di implementazione

> **Per chi esegue:** usare `superpowers:subagent-driven-development` (o
> `superpowers:executing-plans`) per lavorare un task alla volta. I passi hanno
> caselle `- [ ]` per segnare l'avanzamento.
>
> Spec: `DESIGN-ACCOUNT-E-SALVATAGGI.md`. Sta alla radice come gli altri
> documenti di progetto del repo.

**Obiettivo:** entrare nel sito con Google su invito, e avere i salvataggi
legati a un tavolo e conservati sul server, senza che una serata possa
fermarsi per mancanza di rete.

**Architettura:** Cloudflare Access (Google + lista email) davanti a
`roccamora.smartcores.org`; il Worker che oggi serve soli asset statici prende
un `main` e cinque endpoint sotto `/api/`; i salvataggi vanno su D1. L'app
resta locale-prima: `localStorage` è la verità durante la serata, il server è
la copia che si allinea quando c'è linea.

**Tecnologie:** Worker (JavaScript, moduli ES), D1 (SQLite), Web Crypto per la
verifica del JWT, `wrangler dev` per il D1 locale, Playwright per i test
end-to-end, `node --test` non serve: i test puri sono file `.mjs` con `assert`,
come `webapp/test-digitale.mjs`.

## Vincoli globali

- **Italiano** in codice, commenti, messaggi a schermo e commit, come tutto il repo.
- **Nessuna dipendenza npm nuova.** Tutto con quello che c'è: Web Crypto,
  `fetch`, Playwright già presente, wrangler già bloccato a `4.120.0`.
- **La modalità tavolo non cambia comportamento.** Nessuna regola di gioco
  viene toccata da questo lavoro.
- **Hostname:** `roccamora.smartcores.org`. `workers_dev` va spento.
- **Sessione Access:** un mese.
- **Niente migrazione** delle partite già in `localStorage`.
- **Ogni test di regressione va provato non vacuo**: si rompe di proposito la
  cosa che controlla e si verifica che fallisca. Un test che non fallisce mai
  non è un test.
- **Il salvataggio non attende mai la rete.** Se un passo introduce un `await`
  nel percorso di `salva()`, è sbagliato.
- **`OSR_DEV_EMAIL` non deve mai comparire in `wrangler.jsonc`**: esiste solo
  come `--var` di `wrangler dev`. C'è un test che lo verifica (Task 3).
- **`wrangler dev` serve `webapp/dist`**, non `webapp/public`: prima di
  lanciarlo, e dopo ogni modifica ai file dell'app, va rifatto
  `./webapp/build-dist.sh`. Vale per tutti i task che usano `wrangler dev`.

## File

| File | Responsabilità |
|---|---|
| `webapp/schema.sql` | **nuovo** — tabelle `tavoli` e `salvataggi`, `PRAGMA foreign_keys` |
| `webapp/worker/access.js` | **nuovo** — verifica del JWT di Access, restituisce l'email o `null`. Nient'altro |
| `webapp/worker/api.js` | **nuovo** — i cinque endpoint, tutte le query D1. Riceve l'email già verificata |
| `webapp/worker/index.js` | **nuovo** — punto d'ingresso: separa `/api/` dagli asset, chiama `access.js`, poi `api.js` |
| `webapp/public/js/sync.js` | **nuovo** — regola dei conflitti (pura) e coda di spedizione |
| `webapp/public/js/tavoli.js` | **nuovo** — schermata elenco tavoli e creazione |
| `webapp/public/js/store.js` | modifica — chiave con il tavolo, `salva()` accoda |
| `webapp/public/js/main.js` | modifica — si parte dai tavoli, la spia di stato in barra |
| `webapp/test-access.mjs` | **nuovo** — test della verifica JWT |
| `webapp/test-sync.mjs` | **nuovo** — test della regola dei conflitti |
| `webapp/test-api.mjs` | **nuovo** — test dei cinque endpoint contro `wrangler dev` |
| `webapp/test-account-ui.mjs` | **nuovo** — Playwright: tavoli, offline, divergenza |
| `wrangler.jsonc` | modifica — `main`, binding D1 e ASSETS, dominio, `workers_dev: false` |
| `README.md` | modifica — come si sviluppa con `wrangler dev` |

---

### Task 1: Lo schema, e un database che esiste davvero

**File:**
- Crea: `webapp/schema.sql`
- Modifica: `wrangler.jsonc`

**Interfacce:**
- Produce: un binding `DB` (D1) disponibile nel Worker; tabelle `tavoli(id,
  proprietario, nome, creato)` e `salvataggi(tavolo, episodio, aggiornato,
  dati)`.

- [ ] **Passo 1: scrivere lo schema**

`webapp/schema.sql`:

```sql
-- Ombre su Roccamora — salvataggi sul server (vedi DESIGN-ACCOUNT-E-SALVATAGGI.md).
-- I vincoli di chiave esterna in SQLite sono spenti di default: senza questo
-- PRAGMA, cancellare un tavolo lascerebbe i suoi salvataggi orfani in silenzio.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tavoli (
  id            TEXT PRIMARY KEY,
  proprietario  TEXT NOT NULL,
  nome          TEXT NOT NULL,
  creato        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tavoli_proprietario ON tavoli(proprietario);

CREATE TABLE IF NOT EXISTS salvataggi (
  tavolo        TEXT NOT NULL REFERENCES tavoli(id) ON DELETE CASCADE,
  episodio      TEXT NOT NULL,
  aggiornato    INTEGER NOT NULL,
  dati          TEXT NOT NULL,
  PRIMARY KEY (tavolo, episodio)
);
```

- [ ] **Passo 2: creare il database su Cloudflare**

```bash
npx --no-install wrangler d1 create ombre-salvataggi
```

Stampa un blocco di configurazione con un `database_id`. Serve al passo dopo.

- [ ] **Passo 3: dichiarare i binding**

In `wrangler.jsonc`, aggiungere accanto ad `assets` (l'`id` è quello stampato
al passo 2):

```jsonc
  "assets": { "directory": "./webapp/dist", "binding": "ASSETS" },
  "d1_databases": [
    { "binding": "DB", "database_name": "ombre-salvataggi", "database_id": "INCOLLARE-QUI" }
  ]
```

- [ ] **Passo 4: applicare lo schema, in locale e in remoto**

```bash
npx --no-install wrangler d1 execute ombre-salvataggi --local  --file=webapp/schema.sql
npx --no-install wrangler d1 execute ombre-salvataggi --remote --file=webapp/schema.sql
```

Atteso: `Executed 5 commands`.

- [ ] **Passo 5: verificare che il PRAGMA morda davvero**

```bash
npx --no-install wrangler d1 execute ombre-salvataggi --local --command "PRAGMA foreign_keys = ON; INSERT INTO tavoli VALUES ('t1','a@b.it','prova',1); INSERT INTO salvataggi VALUES ('t1','ep1',1,'{}'); DELETE FROM tavoli WHERE id='t1'; SELECT count(*) AS rimasti FROM salvataggi;"
```

Atteso: `rimasti: 0`. Se esce `1`, la cascata non sta funzionando e il difetto
va risolto ora, non dopo.

- [ ] **Passo 6: commit**

```bash
git add webapp/schema.sql wrangler.jsonc
git commit -m "feat(account): schema D1 dei tavoli e dei salvataggi"
```

---

### Task 2: La verifica del token di Access

Questo è il confine di fiducia dell'intera funzione: se qui passa un'email
inventata, chiunque legge e sovrascrive le partite di chiunque. Si scrive col
test davanti.

**File:**
- Crea: `webapp/worker/access.js`
- Test: `webapp/test-access.mjs`

**Interfacce:**
- Produce: `emailDaJwt(token, { team, aud, adesso, prendiChiavi })` →
  `Promise<string|null>`. `adesso` sono millisecondi (default `Date.now()`),
  `prendiChiavi` è una funzione `(team) => Promise<jwk[]>` che di default
  scarica le chiavi da Cloudflare — nei test si passa la propria.

- [ ] **Passo 1: scrivere il test che fallisce**

`webapp/test-access.mjs`:

```js
// Verifica del JWT di Cloudflare Access. E' il confine di fiducia: qui si
// decide di chi sono le partite. node webapp/test-access.mjs
import assert from 'node:assert';
import { emailDaJwt } from './worker/access.js';

const b64url = (buf) => Buffer.from(buf).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// una coppia di chiavi vera, come quella di Cloudflare (RS256)
const coppia = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true, ['sign', 'verify']);
const jwk = { ...(await crypto.subtle.exportKey('jwk', coppia.publicKey)), kid: 'k1', alg: 'RS256' };
const prendiChiavi = async () => [jwk];

const firma = async (corpo, chiave = coppia.privateKey, kid = 'k1') => {
  const testa = b64url(JSON.stringify({ alg: 'RS256', kid }));
  const payload = b64url(JSON.stringify(corpo));
  const s = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', chiave,
    new TextEncoder().encode(`${testa}.${payload}`));
  return `${testa}.${payload}.${b64url(s)}`;
};

const OPZ = { team: 'prova', aud: 'AUD1', adesso: 1000_000, prendiChiavi };
const buono = { email: 'fabio@esempio.it', aud: ['AUD1'], exp: 2000 };  // exp in secondi

let ko = 0;
const ok = async (atteso, token, msg, opz = OPZ) => {
  const r = await emailDaJwt(token, opz);
  if (r !== atteso) { console.error('FAIL:', msg, '— atteso', atteso, 'ricevuto', r); ko++; }
};

await ok('fabio@esempio.it', await firma(buono), 'token valido');
await ok(null, null, 'token assente');
await ok(null, 'non-un-jwt', 'token malformato');
await ok(null, await firma({ ...buono, exp: 999 }), 'token scaduto');
await ok(null, await firma({ ...buono, aud: ['ALTRO'] }), 'aud di un\'altra applicazione');
await ok(null, await firma(buono, (await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true, ['sign', 'verify'])).privateKey), 'firmato con un\'altra chiave');
await ok(null, await firma(buono, coppia.privateKey, 'sconosciuto'), 'kid che non esiste');
await ok(null, await firma({ ...buono, email: undefined }), 'token senza email');

// manomissione: corpo cambiato dopo la firma
const t = await firma(buono);
const [h, , s] = t.split('.');
await ok(null, `${h}.${b64url(JSON.stringify({ ...buono, email: 'ladro@esempio.it' }))}.${s}`,
  'corpo sostituito mantenendo la firma');

console.log(ko ? `${ko} FALLITI` : 'test-access: tutto a posto');
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: lanciarlo e vederlo fallire**

```bash
node webapp/test-access.mjs
```

Atteso: fallisce con `Cannot find module … worker/access.js`.

- [ ] **Passo 3: scrivere `webapp/worker/access.js`**

```js
// Verifica il JWT che Cloudflare Access mette nell'intestazione
// `Cf-Access-Jwt-Assertion`. NON ci si fida di `Cf-Access-Authenticated-User-Email`:
// e' un'intestazione, e le intestazioni si scrivono. Qui si controlla la firma.
const cache = { quando: 0, chiavi: null };

const b64url = (s) => Uint8Array.from(
  atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const json = (s) => JSON.parse(new TextDecoder().decode(b64url(s)));

async function chiaviDiCloudflare(team) {
  if (cache.chiavi && Date.now() - cache.quando < 3600_000) return cache.chiavi;
  const r = await fetch(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error('chiavi di Access non raggiungibili: ' + r.status);
  cache.chiavi = (await r.json()).keys;
  cache.quando = Date.now();
  return cache.chiavi;
}

export async function emailDaJwt(token, opzioni = {}) {
  const { team, aud, adesso = Date.now(), prendiChiavi = chiaviDiCloudflare } = opzioni;
  if (!token || typeof token !== 'string') return null;
  const parti = token.split('.');
  if (parti.length !== 3) return null;
  const [testa, corpo, firma] = parti;
  let h, c;
  try { h = json(testa); c = json(corpo); } catch { return null; }

  const jwk = (await prendiChiavi(team)).find((k) => k.kid === h.kid);
  if (!jwk) return null;
  const chiave = await crypto.subtle.importKey(
    'jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valida = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', chiave,
    b64url(firma), new TextEncoder().encode(`${testa}.${corpo}`));
  if (!valida) return null;

  if (!c.exp || c.exp * 1000 <= adesso) return null;
  const destinatari = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (!destinatari.includes(aud)) return null;
  return c.email || null;
}
```

- [ ] **Passo 4: lanciarlo e vederlo passare**

```bash
node webapp/test-access.mjs
```

Atteso: `test-access: tutto a posto`.

- [ ] **Passo 5: provare che il test non è vacuo**

Tre guasti, uno alla volta, rimettendo a posto ogni volta:

1. togliere `if (!valida) return null;` → devono fallire almeno "firmato con
   un'altra chiave" e "corpo sostituito";
2. togliere il controllo su `exp` → deve fallire "token scaduto";
3. togliere il controllo su `aud` → deve fallire "aud di un'altra applicazione".

Se un guasto non fa fallire niente, il test non sta controllando quella cosa e
va corretto.

- [ ] **Passo 6: commit**

```bash
git add webapp/worker/access.js webapp/test-access.mjs
git commit -m "feat(account): verifica del JWT di Access, col test dei modi di aggirarla"
```

---

### Task 3: I cinque endpoint

**File:**
- Crea: `webapp/worker/api.js`, `webapp/worker/index.js`
- Modifica: `wrangler.jsonc`
- Test: `webapp/test-api.mjs`

**Interfacce:**
- Consuma: `emailDaJwt` (Task 2), binding `DB` e `ASSETS` (Task 1).
- Produce: `api(request, env, email) → Promise<Response>`; gli endpoint
  descritti nella spec, che il client userà nel Task 5.

- [ ] **Passo 1: scrivere il test che fallisce**

`webapp/test-api.mjs`:

```js
// I cinque endpoint, contro un `wrangler dev` con D1 locale.
// Uso: npx wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787   (altrove)
//      node webapp/test-api.mjs
import assert from 'node:assert';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8787';
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
const chiama = (metodo, percorso, corpo) => fetch(BASE + percorso, {
  method: metodo,
  headers: corpo ? { 'Content-Type': 'application/json' } : {},
  body: corpo ? JSON.stringify(corpo) : undefined,
});

// il tavolo si crea
const idT = crypto.randomUUID();
ok((await chiama('POST', '/api/tavolo', { id: idT, nome: 'Gruppo del giovedì' })).ok, 'crea tavolo');

// lo stato lo elenca, e non contiene blob
const stato = await (await chiama('GET', '/api/stato')).json();
ok(stato.email === 'uno@esempio.it', 'stato riporta l\'email verificata');
ok(stato.tavoli.some((t) => t.id === idT), 'il tavolo compare nello stato');
ok(!JSON.stringify(stato).includes('"dati"'), 'lo stato non trascina i salvataggi interi');

// salvataggio e rilettura
await chiama('POST', '/api/salvataggio', { tavolo: idT, episodio: 'ep1', aggiornato: 100, dati: '{"v":1,"ora":24}' });
const letto = await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json();
ok(letto.dati === '{"v":1,"ora":24}', 'rilegge il salvataggio');
ok(letto.aggiornato === 100, 'rilegge il timestamp');

// un pacchetto vecchio arrivato in ritardo NON sovrascrive
await chiama('POST', '/api/salvataggio', { tavolo: idT, episodio: 'ep1', aggiornato: 50, dati: '{"vecchio":true}' });
const dopo = await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json();
ok(dopo.aggiornato === 100, 'il salvataggio vecchio non sovrascrive il nuovo');

// uno nuovo sì
await chiama('POST', '/api/salvataggio', { tavolo: idT, episodio: 'ep1', aggiornato: 200, dati: '{"nuovo":true}' });
ok((await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json()).aggiornato === 200,
  'il salvataggio nuovo sovrascrive il vecchio');

// due tavoli, stesso episodio, non si toccano: e' il guaio n.2 della spec
const idT2 = crypto.randomUUID();
await chiama('POST', '/api/tavolo', { id: idT2, nome: 'Gruppo del sabato' });
await chiama('POST', '/api/salvataggio', { tavolo: idT2, episodio: 'ep1', aggiornato: 300, dati: '{"sabato":true}' });
ok((await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json()).dati === '{"nuovo":true}',
  'il secondo gruppo non ha sovrascritto il primo');

// un tavolo che non e' mio non esiste, nemmeno conoscendone l'id
const altrui = crypto.randomUUID();
ok((await chiama('POST', '/api/salvataggio', { tavolo: altrui, episodio: 'ep1', aggiornato: 1, dati: '{}' })).status === 404,
  'non si scrive su un tavolo che non esiste o non e\' mio');

// cancellazione
await chiama('DELETE', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
ok((await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).status === 404, 'cancella');

// il varco di sviluppo non deve essere in produzione
const cfg = fs.readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
ok(!cfg.includes('OSR_DEV_EMAIL'), 'OSR_DEV_EMAIL non compare in wrangler.jsonc');

console.log(ko ? `${ko} FALLITI` : 'test-api: tutto a posto');
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: lanciarlo e vederlo fallire**

In un terminale: `npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787`
In un altro: `node webapp/test-api.mjs`

Atteso: fallisce (il Worker non ha ancora un `main`, quindi `/api/*` risponde
404 dagli asset).

- [ ] **Passo 3: scrivere `webapp/worker/api.js`**

```js
// I cinque endpoint. L'email arriva gia' verificata da index.js e non e' MAI
// un parametro della richiesta: ogni query filtra per proprietario.
const jsonRisposta = (o, stato = 200) => Response.json(o, { status: stato });

async function mioTavolo(env, email, id) {
  if (!id) return false;
  return (await env.DB.prepare('SELECT 1 FROM tavoli WHERE id = ? AND proprietario = ?')
    .bind(id, email).first()) != null;
}

export async function api(request, env, email) {
  const url = new URL(request.url);
  const p = url.pathname;
  const metodo = request.method;

  if (p === '/api/stato' && metodo === 'GET') {
    const tavoli = await env.DB.prepare(
      'SELECT id, nome, creato FROM tavoli WHERE proprietario = ? ORDER BY creato')
      .bind(email).all();
    const salvataggi = await env.DB.prepare(
      `SELECT s.tavolo, s.episodio, s.aggiornato FROM salvataggi s
         JOIN tavoli t ON t.id = s.tavolo
        WHERE t.proprietario = ?`).bind(email).all();
    return jsonRisposta({ email, tavoli: tavoli.results, salvataggi: salvataggi.results });
  }

  if (p === '/api/tavolo' && metodo === 'POST') {
    const { id, nome } = await request.json();
    if (!id || !nome) return jsonRisposta({ errore: 'id e nome sono obbligatori' }, 400);
    await env.DB.prepare('INSERT INTO tavoli (id, proprietario, nome, creato) VALUES (?, ?, ?, ?)')
      .bind(id, email, String(nome).slice(0, 80), Date.now()).run();
    return jsonRisposta({ id });
  }

  if (p === '/api/salvataggio' && metodo === 'GET') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    const r = await env.DB.prepare(
      'SELECT tavolo, episodio, aggiornato, dati FROM salvataggi WHERE tavolo = ? AND episodio = ?')
      .bind(tavolo, url.searchParams.get('episodio')).first();
    return r ? jsonRisposta(r) : jsonRisposta({ errore: 'non trovato' }, 404);
  }

  if (p === '/api/salvataggio' && metodo === 'POST') {
    const { tavolo, episodio, aggiornato, dati } = await request.json();
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    if (!episodio || !Number.isFinite(aggiornato) || typeof dati !== 'string')
      return jsonRisposta({ errore: 'salvataggio malformato' }, 400);
    // Chi arriva per ultimo non vince: vince chi e' piu' recente. Un pacchetto
    // rimasto in coda mentre si giocava altrove non puo' riportare indietro
    // una partita.
    await env.DB.prepare(
      `INSERT INTO salvataggi (tavolo, episodio, aggiornato, dati) VALUES (?, ?, ?, ?)
       ON CONFLICT(tavolo, episodio) DO UPDATE
         SET aggiornato = excluded.aggiornato, dati = excluded.dati
         WHERE excluded.aggiornato > salvataggi.aggiornato`)
      .bind(tavolo, episodio, aggiornato, dati).run();
    return jsonRisposta({ ok: true });
  }

  if (p === '/api/salvataggio' && metodo === 'DELETE') {
    const tavolo = url.searchParams.get('tavolo');
    if (!(await mioTavolo(env, email, tavolo))) return jsonRisposta({ errore: 'non trovato' }, 404);
    await env.DB.prepare('DELETE FROM salvataggi WHERE tavolo = ? AND episodio = ?')
      .bind(tavolo, url.searchParams.get('episodio')).run();
    return jsonRisposta({ ok: true });
  }

  return jsonRisposta({ errore: 'endpoint sconosciuto' }, 404);
}
```

- [ ] **Passo 4: scrivere `webapp/worker/index.js`**

```js
import { emailDaJwt } from './access.js';
import { api } from './api.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    // OSR_DEV_EMAIL esiste SOLO come --var di `wrangler dev`. Non va MAI in
    // wrangler.jsonc: sarebbe una porta aperta in produzione. C'e' un test
    // che lo verifica (test-api.mjs, ultimo controllo).
    const email = env.OSR_DEV_EMAIL || await emailDaJwt(
      request.headers.get('Cf-Access-Jwt-Assertion'),
      { team: env.ACCESS_TEAM, aud: env.ACCESS_AUD });
    if (!email) return new Response('non autorizzato', { status: 403 });

    try {
      return await api(request, env, email);
    } catch (e) {
      // il client tiene la sua coda: un 500 non fa perdere niente
      return new Response(JSON.stringify({ errore: String(e.message) }),
        { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  },
};
```

- [ ] **Passo 5: dichiarare il `main` e le variabili**

In `wrangler.jsonc`, aggiungere (`ACCESS_TEAM` e `ACCESS_AUD` si riempiono nel
Task 7, quando l'applicazione Access esiste; per ora stringhe vuote):

```jsonc
  "main": "./webapp/worker/index.js",
  "vars": { "ACCESS_TEAM": "", "ACCESS_AUD": "" }
```

- [ ] **Passo 6: rilanciare e vedere passare**

Riavviare `wrangler dev` (rilegge la configurazione) e:

```bash
node webapp/test-api.mjs
```

Atteso: `test-api: tutto a posto`.

- [ ] **Passo 7: provare che il test non è vacuo**

1. Nella `ON CONFLICT`, togliere `WHERE excluded.aggiornato > salvataggi.aggiornato`
   → deve fallire "il salvataggio vecchio non sovrascrive il nuovo".
2. In `mioTavolo`, togliere `AND proprietario = ?` → deve fallire "non si scrive
   su un tavolo che non è mio".
3. Aggiungere `OSR_DEV_EMAIL` a `vars` in `wrangler.jsonc` → deve fallire
   l'ultimo controllo.

Rimettere a posto dopo ognuno.

- [ ] **Passo 8: verificare che senza token si prenda un 403**

Fermare `wrangler dev` e riavviarlo **senza** `--var`:

```bash
npx --no-install wrangler dev --port 8787
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8787/api/stato
```

Atteso: `403`. Poi riavviarlo con il `--var` per i task successivi.

- [ ] **Passo 9: commit**

```bash
git add webapp/worker/api.js webapp/worker/index.js webapp/test-api.mjs wrangler.jsonc
git commit -m "feat(account): i cinque endpoint su D1, con l'ultima scrittura che vince per data e non per ordine d'arrivo"
```

---

### Task 4: La regola dei conflitti

Logica pura, nessuna rete, nessun DOM. È il pezzo che decide se una serata può
sparire, quindi si scrive isolato e si prova per bene.

**File:**
- Crea: `webapp/public/js/sync.js`
- Test: `webapp/test-sync.mjs`

**Interfacce:**
- Produce: `decidi(locale, remoto) → {azione}` dove `azione` è
  `'niente' | 'manda' | 'scarica' | 'chiedi'`. `locale` è
  `{aggiornato, sincronizzato}` (millisecondi), `remoto` è `{aggiornato}` o
  `null`. Con `'chiedi'` restituisce anche `locale` e `remoto`.

- [ ] **Passo 1: scrivere il test che fallisce**

`webapp/test-sync.mjs`:

```js
// La regola dei conflitti: cosa si fa all'apertura di un episodio.
// node webapp/test-sync.mjs
import { decidi } from './public/js/sync.js';

let ko = 0;
const ok = (atteso, l, r, msg) => {
  const a = decidi(l, r).azione;
  if (a !== atteso) { console.error('FAIL:', msg, '— atteso', atteso, 'ricevuto', a); ko++; }
};

ok('niente',  null, null, 'non c\'e\' niente da nessuna parte');
ok('scarica', null, { aggiornato: 10 }, 'solo il server ce l\'ha: e\' un altro dispositivo');
ok('manda',   { aggiornato: 10, sincronizzato: 0 }, null, 'solo il dispositivo ce l\'ha: prima volta');
ok('niente',  { aggiornato: 10, sincronizzato: 10 }, { aggiornato: 10 }, 'nessuno ha giocato da allora');
ok('manda',   { aggiornato: 20, sincronizzato: 10 }, { aggiornato: 10 }, 'ho giocato io, il server e\' fermo');
ok('scarica', { aggiornato: 10, sincronizzato: 10 }, { aggiornato: 20 }, 'ha giocato l\'altro dispositivo');
ok('chiedi',  { aggiornato: 20, sincronizzato: 10 }, { aggiornato: 30 }, 'hanno giocato entrambi: non si decide da soli');
ok('chiedi',  { aggiornato: 30, sincronizzato: 10 }, { aggiornato: 20 }, 'entrambi, col locale piu\' avanti: si chiede lo stesso');

// un salvataggio nato prima che esistesse la sincronizzazione non ha
// `sincronizzato`: vale come "mai sincronizzato", quindi e' cambiato
ok('chiedi',  { aggiornato: 20 }, { aggiornato: 30 }, 'senza sincronizzato, il locale conta come cambiato');

// con 'chiedi' devono tornare tutt'e due, o la schermata non puo' mostrarli
const c = decidi({ aggiornato: 20, sincronizzato: 10 }, { aggiornato: 30 });
if (!c.locale || !c.remoto) { console.error('FAIL: chiedi deve restituire le due partite'); ko++; }

console.log(ko ? `${ko} FALLITI` : 'test-sync: tutto a posto');
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: lanciarlo e vederlo fallire**

```bash
node webapp/test-sync.mjs
```

Atteso: `Cannot find module … sync.js`.

- [ ] **Passo 3: scrivere la regola**

`webapp/public/js/sync.js`, per ora solo questa funzione:

```js
// Cosa fare all'apertura di un episodio, confrontando il salvataggio sul
// dispositivo con quello che dice il server.
//
// `sincronizzato` e' l'istante dell'ultimo allineamento riuscito, e serve a
// una cosa sola: sapere CHI ha giocato da allora. Se e' stato uno solo, vince
// lui in silenzio (e' il caso normale, hai cambiato dispositivo). Se hanno
// giocato entrambi, non si sceglie: decide chi ha giocato. Sovrascrivere di
// nascosto una serata e' l'unico esito che questo file rende impossibile.
export function decidi(locale, remoto) {
  if (!locale && !remoto) return { azione: 'niente' };
  if (!locale) return { azione: 'scarica' };
  if (!remoto) return { azione: 'manda' };

  const base = locale.sincronizzato ?? 0;
  const localeCambiato = locale.aggiornato > base;
  const remotoCambiato = remoto.aggiornato > base;

  if (localeCambiato && remotoCambiato) return { azione: 'chiedi', locale, remoto };
  if (remotoCambiato) return { azione: 'scarica' };
  if (localeCambiato) return { azione: 'manda' };
  return { azione: 'niente' };
}
```

- [ ] **Passo 4: lanciarlo e vederlo passare**

```bash
node webapp/test-sync.mjs
```

Atteso: `test-sync: tutto a posto`.

- [ ] **Passo 5: provare che il test non è vacuo**

Due guasti, uno alla volta:

1. sostituire il ramo `localeCambiato && remotoCambiato` con
   `return { azione: 'manda' }` (vince sempre il locale) → devono fallire i due
   casi "hanno giocato entrambi";
2. mettere `return { azione: 'scarica' }` in cima a tutto (vince sempre il
   server) → devono fallire almeno quattro casi.

- [ ] **Passo 6: commit**

```bash
git add webapp/public/js/sync.js webapp/test-sync.mjs
git commit -m "feat(account): la regola dei conflitti, che soprattutto dice quando non decidere da sola"
```

---

### Task 5: La coda, e `store.js` che accoda senza aspettare

**File:**
- Modifica: `webapp/public/js/sync.js` (aggiunta della coda),
  `webapp/public/js/store.js`
- Test: `webapp/test-sync.mjs` (aggiunte)

**Interfacce:**
- Consuma: `decidi()` (Task 4), gli endpoint (Task 3).
- Produce: da `sync.js` — `accoda(chiave, corpo)`, `svuota()`,
  `stato()` → `'allineato'|'da mandare'|'sessione scaduta'`,
  `avviaCoda()`. Da `store.js` — `salva(partita)`, `carica(tavolo, episodio)`,
  `cancella(tavolo, episodio)`, `tavoloCorrente()`, `impostaTavolo(id)`.

- [ ] **Passo 1: scrivere i test che falliscono**

In fondo a `webapp/test-sync.mjs`, prima della riga finale:

```js
// --- la coda sopravvive alla chiusura dell'app e non perde niente
import { _coda } from './public/js/sync.js';

const finto = {};
globalThis.localStorage = {
  getItem: (k) => finto[k] ?? null,
  setItem: (k, v) => { finto[k] = String(v); },
  removeItem: (k) => { delete finto[k]; },
};

_coda.accoda('a', { tavolo: 't', episodio: 'ep1', aggiornato: 1, dati: '{}' });
_coda.accoda('b', { tavolo: 't', episodio: 'ep2', aggiornato: 2, dati: '{}' });
if (_coda.leggi().length !== 2) { console.error('FAIL: la coda non ha due elementi'); ko++; }

// stessa chiave due volte: resta l'ultimo, non due copie
_coda.accoda('a', { tavolo: 't', episodio: 'ep1', aggiornato: 9, dati: '{"nuovo":1}' });
if (_coda.leggi().length !== 2) { console.error('FAIL: la coda duplica la stessa partita'); ko++; }
if (_coda.leggi().find((x) => x.chiave === 'a').corpo.aggiornato !== 9) {
  console.error('FAIL: la coda ha tenuto la versione vecchia'); ko++;
}

// la coda vive in localStorage: un'app riaperta la ritrova
if (!finto['osr.dasincronizzare']) { console.error('FAIL: la coda non e\' persistente'); ko++; }

// spedizione riuscita: sparisce solo quella spedita
_coda.togli('a');
if (_coda.leggi().length !== 1 || _coda.leggi()[0].chiave !== 'b') {
  console.error('FAIL: togli() ha tolto la cosa sbagliata'); ko++;
}
```

- [ ] **Passo 2: lanciarlo e vederlo fallire**

```bash
node webapp/test-sync.mjs
```

Atteso: `_coda is not defined` o simile.

- [ ] **Passo 3: aggiungere la coda a `sync.js`**

```js
// --- la coda -------------------------------------------------------------
// Vive in localStorage: se l'app si chiude a meta' serata, alla riapertura
// riparte da dove era. La chiave e' `tavolo/episodio`, quindi accodare due
// volte la stessa partita sostituisce, non accumula: al server interessa solo
// l'ultimo stato.
const CHIAVE_CODA = 'osr.dasincronizzare';

const leggi = () => { try { return JSON.parse(localStorage.getItem(CHIAVE_CODA)) || []; } catch { return []; } };
const scrivi = (v) => localStorage.setItem(CHIAVE_CODA, JSON.stringify(v));

function accoda(chiave, corpo) {
  const v = leggi().filter((x) => x.chiave !== chiave);
  v.push({ chiave, corpo });
  scrivi(v);
}
function togli(chiave) { scrivi(leggi().filter((x) => x.chiave !== chiave)); }

export const _coda = { leggi, accoda, togli };

let ultimoStato = 'allineato';
export const stato = () => ultimoStato;

// Spedisce quello che c'e'. Non lancia mai: senza rete la coda resta e si
// riprova dopo — la serata non si ferma per un router.
export async function svuota() {
  for (const { chiave, corpo } of leggi()) {
    try {
      const r = await fetch('/api/salvataggio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      // Access scaduto risponde con un redirect al login: la richiesta finisce
      // altrove e non e' JSON. La coda NON si tocca.
      if (r.status === 403 || r.redirected) { ultimoStato = 'sessione scaduta'; return; }
      if (!r.ok) { ultimoStato = 'da mandare'; return; }
      togli(chiave);
    } catch { ultimoStato = 'da mandare'; return; }
  }
  ultimoStato = leggi().length ? 'da mandare' : 'allineato';
}

export function avviaCoda() {
  setInterval(svuota, 3000);
  // l'app che va in secondo piano (o l'iPad che si blocca) manda l'ultimo
  // stato mentre la pagina muore: sendBeacon sa fare solo POST, ed e' il
  // motivo per cui l'endpoint e' POST e non PUT
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return;
    for (const { corpo } of leggi()) {
      navigator.sendBeacon('/api/salvataggio',
        new Blob([JSON.stringify(corpo)], { type: 'application/json' }));
    }
  });
}
```

- [ ] **Passo 4: verificare**

```bash
node webapp/test-sync.mjs
```

Atteso: `test-sync: tutto a posto`.

- [ ] **Passo 5: provare che il test non è vacuo**

In `accoda`, togliere il `.filter(...)` → devono fallire "la coda duplica la
stessa partita" e "la coda ha tenuto la versione vecchia".

- [ ] **Passo 6: `store.js` — la chiave prende il tavolo**

Sostituire in `webapp/public/js/store.js` le righe 5 e 49-61 con:

```js
const PREFISSO = 'osr.partita.';
const CHIAVE_TAVOLO = 'osr.tavolo';

// Il tavolo sta nella chiave: e' la riga che impedisce al Gruppo del sabato di
// cancellare la serata del Gruppo del giovedi'.
const chiave = (tavolo, episodio) => `${PREFISSO}${tavolo}.${episodio}`;

export const tavoloCorrente = () => localStorage.getItem(CHIAVE_TAVOLO);
export const impostaTavolo = (id) => localStorage.setItem(CHIAVE_TAVOLO, id);

export function salva(partita) {
  const tavolo = tavoloCorrente();
  partita.aggiornato = Date.now();
  localStorage.setItem(chiave(tavolo, partita.episodio), JSON.stringify(partita));
  // Accoda e basta: `salva()` non aspetta la rete. Se qui comparisse un
  // `await`, il tavolo aspetterebbe un router per giocare.
  accoda(`${tavolo}/${partita.episodio}`, {
    tavolo, episodio: partita.episodio, aggiornato: partita.aggiornato,
    dati: JSON.stringify(partita),
  });
}

export function carica(episodioId, tavolo = tavoloCorrente()) {
  const raw = localStorage.getItem(chiave(tavolo, episodioId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function cancella(episodioId, tavolo = tavoloCorrente()) {
  localStorage.removeItem(chiave(tavolo, episodioId));
  fetch(`/api/salvataggio?tavolo=${tavolo}&episodio=${episodioId}`, { method: 'DELETE' })
    .catch(() => { /* senza rete si cancella solo qui: e' accettabile */ });
}
```

E in cima al file, dopo il commento di intestazione:

```js
import { _coda } from './sync.js';
const { accoda } = _coda;
```

- [ ] **Passo 7: verificare che il resto dell'app non si sia rotto**

```bash
node webapp/test-digitale.mjs
node webapp/test-engine.mjs
```

Atteso: entrambi come prima. Se `test-digitale.mjs` si lamenta di
`localStorage`, aggiungere `osr.tavolo` al finto localStorage in cima a quel
file:

```js
globalThis.localStorage = { setItem() {}, getItem(k) { return k === 'osr.tavolo' ? 'prova' : null; }, removeItem() {} };
```

- [ ] **Passo 8: commit**

```bash
git add webapp/public/js/sync.js webapp/public/js/store.js webapp/test-sync.mjs webapp/test-digitale.mjs
git commit -m "feat(account): il tavolo entra nella chiave, e salva() accoda invece di aspettare la rete"
```

---

### Task 6: La schermata dei tavoli e la spia

**File:**
- Crea: `webapp/public/js/tavoli.js`
- Modifica: `webapp/public/js/main.js`, `webapp/public/app.css`
- Test: `webapp/test-account-ui.mjs`

**Interfacce:**
- Consuma: `/api/stato`, `/api/tavolo` (Task 3); `tavoloCorrente`,
  `impostaTavolo` (Task 5); `stato()`, `avviaCoda()` (Task 5).
- Produce: `vistaTavoli(app, quandoScelto)` — mostra l'elenco e chiama
  `quandoScelto(idTavolo)`.

- [ ] **Passo 1: scrivere il test end-to-end che fallisce**

`webapp/test-account-ui.mjs`:

```js
// Tavoli, offline e divergenza, contro `wrangler dev` (D1 locale vero).
// Uso: npx wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787  (altrove)
//      node webapp/test-account-ui.mjs
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8787';
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const browser = await chromium.launch();
const nuovo = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
  return p;
};

// 1. si parte dai tavoli, non dagli episodi
const p1 = await nuovo();
await p1.goto(BASE, { waitUntil: 'networkidle' });
ok(await p1.getByText(/nuovo tavolo/i).count() > 0, 'la prima schermata e\' quella dei tavoli');

// 2. creato il tavolo, si arriva agli episodi
await p1.getByText(/nuovo tavolo/i).first().click();
await p1.fill('#nome-tavolo', 'Gruppo del giovedì');
await p1.click('#crea-tavolo');
await p1.waitForTimeout(600);
ok(await p1.getByText('Il Coro Sommerso').count() > 0, 'dopo il tavolo si vede la lista episodi');

// 3. una partita cominciata qui si ritrova in un browser pulito
await p1.evaluate(async () => {
  const { salva } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep1', modo: 'tavolo', party: ['Nino'], fase: 'indagine',
          indagine: { ora: 21, chiusa: false }, spedizione: { round: 3 } });
});
await p1.waitForTimeout(3500);                       // la coda si svuota ogni 3s
const stato = await (await fetch(BASE + '/api/stato')).json();
ok(stato.salvataggi.some((s) => s.episodio === 'ep1'), 'il salvataggio e\' arrivato al server');

// 4. offline: si gioca lo stesso, e al ritorno il server si allinea
await p1.context().setOffline(true);
await p1.evaluate(async () => {
  const { salva } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep2', modo: 'tavolo', party: ['Nino'], fase: 'indagine',
          indagine: { ora: 19, chiusa: false }, spedizione: { round: 0 } });
});
await p1.waitForTimeout(3500);
ok(await p1.evaluate(() => localStorage.getItem('osr.dasincronizzare')?.includes('ep2')),
  'senza rete il salvataggio resta in coda');
await p1.context().setOffline(false);
await p1.waitForTimeout(4000);
const stato2 = await (await fetch(BASE + '/api/stato')).json();
ok(stato2.salvataggi.some((s) => s.episodio === 'ep2'), 'tornata la rete, la coda si e\' svuotata');

// 5. divergenza: l'app chiede, non sovrascrive
const p2 = await nuovo();
await p2.goto(BASE, { waitUntil: 'networkidle' });
await p2.evaluate((t) => localStorage.setItem('osr.tavolo', t), stato.tavoli[0].id);
await p2.evaluate(() => {
  const t = localStorage.getItem('osr.tavolo');
  localStorage.setItem(`osr.partita.${t}.ep1`, JSON.stringify({
    v: 1, episodio: 'ep1', modo: 'tavolo', party: ['Nino'], fase: 'indagine',
    aggiornato: Date.now(), sincronizzato: 1,        // entrambi cambiati dopo `1`
    indagine: { ora: 24, chiusa: false }, spedizione: { round: 0 } }));
});
await p2.reload({ waitUntil: 'networkidle' });
await p2.getByText('Il Coro Sommerso').first().click();
await p2.waitForTimeout(800);
ok(await p2.getByText(/quale.*tenere|due versioni/i).count() > 0,
  'con due versioni divergenti l\'app chiede invece di sovrascrivere');

await browser.close();
console.log(ko ? `${ko} FALLITI` : 'test-account-ui: tutto a posto');
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: lanciarlo e vederlo fallire**

```bash
node webapp/test-account-ui.mjs
```

Atteso: fallisce al primo controllo (non esiste nessuna schermata dei tavoli).

- [ ] **Passo 3: scrivere `webapp/public/js/tavoli.js`**

```js
// Prima schermata: si sceglie il tavolo, poi si entra negli episodi. Un tavolo
// e' un gruppo di persone che gioca la sua campagna: le partite di due gruppi
// non si incrociano mai.
import { impostaTavolo } from './store.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function vistaTavoli(app, quandoScelto) {
  let stato = { tavoli: [], salvataggi: [], email: '' };
  try {
    stato = await (await fetch('/api/stato')).json();
  } catch {
    // senza rete si va avanti col tavolo gia' scelto sul dispositivo: la
    // serata non si ferma perche' l'elenco non si carica
  }

  const ultima = (id) => {
    const suoi = stato.salvataggi.filter((s) => s.tavolo === id);
    if (!suoi.length) return 'nessuna serata';
    const q = new Date(Math.max(...suoi.map((s) => s.aggiornato)));
    return `ultima serata: ${q.toLocaleDateString('it-IT')}`;
  };

  app.innerHTML = `
    <header class="home-testata">
      <h1>ombre su roccamora</h1>
      <div class="sotto">${esc(stato.email || '')}</div>
      <div class="filetto"></div>
    </header>
    <div class="pannello">
      <h2>chi gioca stasera?</h2>
      ${stato.tavoli.map((t) => `
        <div class="modo tavolo-voce" data-id="${esc(t.id)}">
          <h3>${esc(t.nome)}</h3>
          <p>${ultima(t.id)}</p>
        </div>`).join('') || '<p class="nota">Nessun tavolo: creane uno.</p>'}
      <div class="btn-riga mt">
        <button class="btn pieno" id="nuovo-tavolo">nuovo tavolo</button>
      </div>
      <div id="modulo-tavolo" style="display:none" class="mt">
        <input id="nome-tavolo" class="campo" placeholder="Gruppo del giovedì" maxlength="80">
        <div class="btn-riga mt"><button class="btn pieno" id="crea-tavolo">crea</button></div>
      </div>
    </div>`;

  app.querySelectorAll('.tavolo-voce').forEach((el) => el.addEventListener('click', () => {
    impostaTavolo(el.dataset.id);
    quandoScelto(el.dataset.id);
  }));
  document.getElementById('nuovo-tavolo').onclick = () => {
    document.getElementById('modulo-tavolo').style.display = '';
  };
  document.getElementById('crea-tavolo').onclick = async () => {
    const nome = document.getElementById('nome-tavolo').value.trim() || 'Il mio tavolo';
    const id = crypto.randomUUID();
    await fetch('/api/tavolo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nome }),
    });
    impostaTavolo(id);
    quandoScelto(id);
  };
}
```

- [ ] **Passo 4: agganciare `main.js`**

In `webapp/public/js/main.js`:

1. riga 4, aggiungere gli import:

```js
import { dati, nuovaPartita, salva, carica, cancella, tavoloCorrente } from './store.js';
import { vistaTavoli } from './tavoli.js';
import { decidi, avviaCoda, stato as statoSync } from './sync.js';
```

2. in `vistaHome()`, dopo la riga `<div class="filetto"></div>`, aggiungere la
   spia e il modo di cambiare tavolo:

```js
      <div class="spia" id="spia">${statoSync()}</div>
      <button class="btn piccolo" id="cambia-tavolo">cambia tavolo</button>
```

e in fondo alla funzione, prima della chiusura:

```js
  document.getElementById('cambia-tavolo').onclick = () => vistaTavoli(app, () => vistaHome());
```

3. sostituire l'avvio (righe 353-362) con:

```js
// ------------------------------------------------------------------ avvio
tieniSveglio();
avviaCoda();
const errore = (e) => h(`
  <div class="pannello centrato" style="margin-top:20vh">
    <h2>manca qualcosa</h2>
    <p>${esc(e.message)}</p>
    <p class="nota mt">Sul PC: <code>python webapp/export-data.py</code>,
    <code>node webapp/export-data.js</code>, <code>python webapp/export-assets.py</code>
    e ricarica.</p>
  </div>`);

// senza un tavolo scelto non si entra: e' lui che dice di chi sono le partite
if (tavoloCorrente()) vistaHome().catch(errore);
else vistaTavoli(app, () => vistaHome().catch(errore));
```

- [ ] **Passo 5: la scelta quando le versioni divergono**

Sempre in `main.js`, sostituire il gestore di `continua` (riga 169) con:

```js
  document.getElementById('continua')?.addEventListener('click', async () => {
    const locale = carica(epId);
    let remoto = null;
    try {
      const r = await fetch(`/api/salvataggio?tavolo=${tavoloCorrente()}&episodio=${epId}`);
      if (r.ok) remoto = await r.json();
    } catch { /* senza rete si gioca il locale */ }

    const d = decidi(locale, remoto);
    if (d.azione === 'scarica') return vistaPartita(JSON.parse(remoto.dati));
    if (d.azione !== 'chiedi') return vistaPartita(locale);

    // Due versioni divergenti: qui NON si sceglie. Si mostrano e decide chi ha
    // giocato — sovrascrivere di nascosto una serata e' l'unica cosa vietata.
    const q = (ms) => new Date(ms).toLocaleString('it-IT');
    const r = JSON.parse(remoto.dati);
    h(`
      <div class="barra"><button class="btn" id="indietro">← indietro</button>
        <div class="titolo">due versioni di questa partita</div><span></span></div>
      <div class="pannello">
        <p class="nota">Questa partita e' andata avanti in due posti diversi.
        Quale volete tenere? L'altra si perde.</p>
        <div class="modi mt">
          <div class="modo" id="tieni-locale"><h3>questo dispositivo</h3>
            <p>Indagine alle ${locale.indagine?.ora ?? '—'}, round ${locale.spedizione?.round ?? 0}.
            Salvata il ${q(locale.aggiornato)}.</p></div>
          <div class="modo" id="tieni-remoto"><h3>l'altro dispositivo</h3>
            <p>Indagine alle ${r.indagine?.ora ?? '—'}, round ${r.spedizione?.round ?? 0}.
            Salvata il ${q(remoto.aggiornato)}.</p></div>
        </div>
      </div>`);
    document.getElementById('indietro').onclick = () => vistaEpisodio(epId);
    document.getElementById('tieni-locale').onclick = () => { salva(locale); vistaPartita(locale); };
    document.getElementById('tieni-remoto').onclick = () => { salva(r); vistaPartita(r); };
  });
```

- [ ] **Passo 6: lo stile dei pezzi nuovi**

In fondo a `webapp/public/app.css`:

```css
/* account: spia di sincronizzazione e campo del nome tavolo */
.spia { font-size: .72rem; letter-spacing: .08em; text-transform: lowercase; opacity: .6; }
.btn.piccolo { font-size: .72rem; padding: .3rem .6rem; }
.campo { width: 100%; padding: .7rem; font-family: inherit; font-size: 1rem;
  background: #0e0c11; color: inherit; border: 1px solid #3a3340; border-radius: 3px; }
```

- [ ] **Passo 7: lanciare il test e vederlo passare**

Con `wrangler dev` acceso su 8787:

```bash
node webapp/test-account-ui.mjs
```

Atteso: `test-account-ui: tutto a posto`.

- [ ] **Passo 8: provare che il test non è vacuo**

1. In `main.js`, sostituire il ramo `if (d.azione !== 'chiedi')` con
   `return vistaPartita(locale)` sempre → deve fallire il controllo 5.
2. In `sync.js`, in `svuota()`, togliere `togli(chiave)` → deve fallire il
   controllo 4 (la coda non si svuota mai).

- [ ] **Passo 9: verificare che il gioco non sia cambiato**

```bash
node webapp/test-digitale.mjs && node webapp/test-digitale-regressioni.mjs && node webapp/test-engine.mjs
```

Atteso: tutti come prima del Task 1. Se uno fallisce, il difetto è in questo
lavoro, non nel gioco.

- [ ] **Passo 10: commit**

```bash
git add webapp/public/js/tavoli.js webapp/public/js/main.js webapp/public/app.css webapp/test-account-ui.mjs
git commit -m "feat(account): si comincia scegliendo il tavolo, e due versioni divergenti si scelgono a mano"
```

---

### Task 7: Access, il dominio, e la prova sull'iPad

L'unico task con passi fuori dal terminale. Finché non è finito, il sito è
online **senza** protezione: farlo tutto d'un fiato.

**File:**
- Modifica: `wrangler.jsonc`, `README.md`

- [ ] **Passo 1: creare l'applicazione Access**

Su <https://one.dash.cloudflare.com> → Access → Applications → Add → Self-hosted:

- nome: `Ombre su Roccamora`
- dominio: `roccamora.smartcores.org`
- **Session Duration: 1 month** (non 24 ore: nessuno deve rifare il login a
  metà serata)
- identità: Google (Settings → Authentication → Login methods → Google, se non
  c'è già)
- policy: Allow → Include → Emails → la tua e quelle dei giocatori

Segnare due valori: il **team domain** (`<team>.cloudflareaccess.com`) e
l'**Application Audience (AUD) tag** dell'applicazione.

- [ ] **Passo 2: metterli in configurazione**

In `wrangler.jsonc`, riempire i `vars` lasciati vuoti nel Task 3 e aggiungere
il dominio, spegnendo `workers.dev`:

```jsonc
  "vars": { "ACCESS_TEAM": "IL-TUO-TEAM", "ACCESS_AUD": "IL-TUO-AUD" },
  "workers_dev": false,
  "routes": [ { "pattern": "roccamora.smartcores.org", "custom_domain": true } ]
```

- [ ] **Passo 3: pubblicare**

```bash
./webapp/deploy.sh
```

- [ ] **Passo 4: verificare che la porta di servizio sia chiusa**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://ombre-su-roccamora.fabio-stocco85.workers.dev/
```

Atteso: `404` o errore DNS — **non** `200`. Finché quell'indirizzo risponde,
la lista di invitati non protegge niente.

- [ ] **Passo 5: verificare che il dominio nuovo chieda Google**

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://roccamora.smartcores.org/
```

Atteso: un `302` verso `<team>.cloudflareaccess.com`.

- [ ] **Passo 6: verificare che l'API non si fidi delle intestazioni**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://roccamora.smartcores.org/api/stato \
  -H "Cf-Access-Authenticated-User-Email: ladro@esempio.it"
```

Atteso: **non** `200`. L'email in un'intestazione non deve valere niente.

- [ ] **Passo 7: la prova che conta, sull'iPad vero**

È il rischio scritto nella spec e nessun test lo può sostituire.

1. Su Safari dell'iPad aprire `https://roccamora.smartcores.org` e fare il
   login con Google.
2. "Aggiungi alla schermata Home".
3. Aprire l'app **dall'icona**, non da Safari.
4. Deve entrare senza rifare il login. Creare un tavolo e una partita.
5. Chiudere l'app, riaprirla: la partita deve esserci.

Se dall'icona ricompare il login e il giro passa da Safari lasciando fuori
l'app, il difetto è quello previsto: annotarlo in `DESIGN-ACCOUNT-E-SALVATAGGI.md`
sotto "Rischi" con quello che si è visto, e fermarsi lì per decidere insieme —
non improvvisare una soluzione.

- [ ] **Passo 8: aggiornare il README**

Nella sezione "Online (Cloudflare)", sostituire l'indirizzo `workers.dev` con
`https://roccamora.smartcores.org` e aggiungere:

````markdown
Il sito è chiuso da Cloudflare Access: si entra con Google, e solo con un
indirizzo in lista (Zero Trust → Access → Applications → Ombre su Roccamora).

Per lavorarci in locale, con un D1 vero e senza toccare la produzione:

```bash
npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
node webapp/test-api.mjs          # i cinque endpoint
node webapp/test-account-ui.mjs   # tavoli, offline, divergenza
```

`OSR_DEV_EMAIL` salta la verifica del token e vale solo qui: non va **mai**
in `wrangler.jsonc`, e c'è un test che lo controlla.
````

- [ ] **Passo 9: commit**

```bash
git add wrangler.jsonc README.md
git commit -m "feat(account): il sito si chiude dietro Access e si sposta su roccamora.smartcores.org"
git push origin main
```

---

## Copertura della spec

| Requisito della spec | Dove |
|---|---|
| Login Google su invito | Task 7 (Access), nessun codice di login |
| Verifica del JWT, non dell'intestazione | Task 2, provata anche dal vivo nel Task 7 passo 6 |
| `workers.dev` spento | Task 7 passi 2 e 4 |
| Tabelle e `PRAGMA foreign_keys` | Task 1, verificato al passo 5 |
| I cinque endpoint | Task 3 |
| Vince il più recente, non l'ultimo arrivato | Task 3 (SQL) e Task 4 (client) |
| Isolamento fra account | Task 3, controllo "tavolo non mio" |
| Locale-prima, coda persistente | Task 5, provata offline nel Task 6 |
| `POST` per `sendBeacon` | Task 3 (endpoint), Task 5 (`avviaCoda`) |
| Chiave per tavolo | Task 5 passo 6, provata nel Task 3 |
| Regola dei conflitti, e quando chiede | Task 4, a schermo nel Task 6 passo 5 |
| Elenco tavoli, spia, email | Task 6 |
| Sessione di un mese | Task 7 passo 1 |
| Modalità tavolo intatta | Task 6 passo 9 |
| Rischio iPad in schermata Home | Task 7 passo 7 |
| Niente migrazione | nessun task: è fuori scopo, e la chiave nuova non incrocia la vecchia |
