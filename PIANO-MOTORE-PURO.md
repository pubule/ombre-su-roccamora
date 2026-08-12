# Fase 1 — il motore puro: piano d'esecuzione

> **Per chi esegue:** un task per volta, nell'ordine. Ogni task finisce con un
> commit e un cancello verde. Sta qui e non in `docs/`, come
> `PIANO-ACCOUNT-E-SALVATAGGI.md`.

**Obiettivo:** estrarre le regole di Spedizione da `digitale.js` in
`webapp/motore/`, seminare la RNG, convertire le diciannove sospensioni
`await`-UI in comandi completi più `stato.pendenza`, e far animare al client
un `eventi[]` prodotto dal motore. **A schermo non cambia niente.**

**Architettura:** il motore è un modulo puro isomorfo — nessun DOM, nessuna API
di browser né di node — con una sola porta d'ingresso,
`applica(stato, comando, dati) → { stato, eventi, pendenza }`. In questa fase
gira ancora nel client: `digitale.js` smette di contenere regole e diventa
`render` + `aggancia` + `replay`.

**Stack:** JavaScript ESM nativo, nessun build step, nessun framework di test.
I test sono script `node` standalone con `ok()` e `process.exit(ko ? 1 : 0)`,
come `webapp/test-digitale.mjs`.

## Vincoli globali

- **Il motore sta in `webapp/public/motore/`**, non accanto a `webapp/`.
  Verificato all'esecuzione del Task 2: l'import relativo deve risolvere sia
  per node (filesystem) sia per il browser (HTTP, con la root del server su
  `webapp/public`). Con la cartella fuori, `../../motore/…` risolve in node e
  **esce dalla root via HTTP**: i test unitari passano e la pagina muore in
  silenzio. Effetto collaterale gradito: `build-dist.sh` copia già `public/`,
  quindi non va toccato.
- **Nessun DOM nel motore.** Niente `document`, `window`, `localStorage`,
  `setTimeout`, `requestAnimationFrame`, `fetch`, `Math.random`. Lo verifica
  `webapp/test-motore-purezza.mjs`, **uno solo per tutta la cartella**: chi
  aggiunge un modulo non deve ricordarsi di aggiungere anche il controllo.
  Guarda il codice e non i commenti, che di `Math.random` parlano apposta.
- **Nessun build step.** I file del motore sono ESM caricati sia da
  `<script type="module">` sia da `node`. Nessun transpile, nessun bundler.
- **Italiano nei nomi**, come tutto il resto del repo: `applica`, `eventi`,
  `pendenza`, `stato`. Non `apply`, non `events`.
- **Le stringhe di gioco restano parola per parola.** Un `log()` che cambia
  testo è una regressione: i test le confrontano.
- **La modalità tavolo (`spedizione.js`) non si tocca in questa fase.** È la
  Fase 2.
- **Una misura lunga non gira mentre si tocca il codice che misura.** Imparato
  due volte in questa fase: due baseline da 420 partite buttate perché il
  `digitale.js` sotto cambiava — la seconda con l'import rotto a metà corsa, che
  ha prodotto 17 corse NON VALIDE su 21 e scarti fino a -85 punti. Sembravano
  dati sul gioco, erano dati sul cantiere. Prima di lanciare `mappa-pilota.mjs`:
  `git status` pulito, e nessuna modifica finché non ha finito.

## Il cancello, corretto

`DESIGN-VISTA-EROE.md` prometteva «esiti bit-a-bit uguali al codice attuale».
**Non è realizzabile e non va inseguito:** il pilota è un bot che clicca e la
sua sequenza di `Math.random()` dipende dal timing dell'animazione, quindi
«stessa sequenza di random» non è una condizione riproducibile. Al suo posto,
tre reti, tutte e tre necessarie:

1. **Test differenziale** (Task 2-8): ogni funzione pura estratta viene
   confrontata con l'originale su migliaia di stati generati. Deterministico,
   automatico, ed è la rete forte — copre le ~700 righe pure.
2. **Test di regressione esistenti** verdi a ogni task: `test-digitale.mjs`,
   `test-digitale-regressioni.mjs`, `test-abilita.mjs`, `test-engine.mjs`.
3. **Mappa pilota invariata** (Task 16): `mappa-pilota.mjs` con N alto prima e
   dopo. Non «identica» — **dentro la banda di rumore**. È l'unica rete per le
   ~450 righe miste, che oracolo automatico non hanno.

**Sugli stalli.** Il cancello qui sotto diceva «ogni corsa VALIDA». Misurato il
12/08/2026: **non è vero già oggi**, e non per colpa dell'estrazione. Sul
commit precedente a tutto questo lavoro, l'Ep.1 dà 3 partite in stallo su 8 e
la corsa risulta NON VALIDA. Lo stallo è il pilota che non trova come
proseguire, non il gioco che si rompe. Quindi il cancello non è «zero stalli»
ma **«non più stalli della baseline»**, e la baseline li registra episodio per
episodio.

---

## Struttura dei file

### Nuovi

Tutti sotto `webapp/public/motore/` — vedi il vincolo globale sul perché.

| file | responsabilità | stato |
|---|---|---|
| `rng.js` | generatore seminato, `tira2d6`, `mescola` | ✅ Task 1 |
| `griglia.js` | grafo tessere, BFS, cammino, adiacenza, occupazione | ✅ Task 2 |
| `stat.js` | statistiche derivate, economia azioni, `raggEroe`/`celleEsca` | Task 3 |
| `regole.js` | ex `engine.js` senza le stringhe di presentazione | Task 4 |
| `obiettivi.js` | compiti, orologio, rogo, cancellazione, ritmo, pressione, filo | Task 5 |
| `vittoria.js` | condizioni di vittoria, sconfitta, scorta | Task 6 |
| `minaccia.js` | spawn, risveglio boss, pesca, fase Minaccia | Task 7 |
| `nemici.js` | piano e risoluzione del turno nemici | Task 8 |
| `comandi.js` | `applica()`, la porta d'ingresso | Task 9 |

Fuori dal motore:

| file | responsabilità | stato |
|---|---|---|
| `webapp/public/js/replay.js` | riproduce `eventi[]` come animazioni | Task 13 |
| `webapp/test-motore-purezza.mjs` | la barriera: niente ambiente nel motore | ✅ Task 1 |
| `webapp/rigenera-oracolo.sh` | prepara l'oracolo dei differenziali | ✅ Task 2 |
| `webapp/test-motore-*.mjs` | un test per modulo estratto | in corso |
| `webapp/pilota-motore.mjs` | il pilota headless, senza browser | Task 14 |

**`raggEroe`, `celleEsca` e `raggScortato` non stanno in `griglia.js`**: leggono
`azioniRestano` e `movimento`, che sono statistiche derivate. Vanno in `stat.js`
col Task 3. Il piano li dava alla griglia, ed era sbagliato.

### Modificati

| file | come |
|---|---|
| `webapp/public/js/digitale.js` | perde le regole, resta vista (~900 righe) |
| `webapp/public/js/engine.js` | diventa un re-export di `motore/regole.js` più gli URL asset |
| `webapp/build-dist.sh` | copia anche `motore/` |
| `.gitignore` | ignora `webapp/public/js/_oracolo.js` |

### L'oracolo del test differenziale

I test differenziali confrontano il codice nuovo con quello **di partenza**,
preparato da uno script:

```bash
bash webapp/rigenera-oracolo.sh          # dal commit 588825bd, il default
bash webapp/rigenera-oracolo.sh DISCO    # dal file su disco, per un confronto al volo
```

Lo script fa tre cose, e tutte e tre servono: estrae `digitale.js` dal commit
di partenza, lo scrive in `webapp/public/js/_oracolo.js` (**accanto** agli
originali, perché i suoi import relativi risolvano), e gli **appende un export
`_diff`** con le 65 funzioni interne da confrontare — `digitale.js` ne esporta
solo una manciata, e senza quell'aggiunta metà dei differenziali passerebbe a
vuoto. Infine prova a importarlo: un oracolo che non si carica fa passare a
vuoto ogni confronto, ed è peggio di non averlo.

`588825bd` è l'ultimo commit prima che l'estrazione tocchi `digitale.js`. Il
file è gitignorato. **A fine Fase 1 i differenziali e l'oracolo si cancellano**
(Task 15): sono un'impalcatura, non una suite.

---

## Task 0: la rete di sicurezza

Nessuna riga di motore viene toccata prima che esista un riferimento numerico
a cui tornare.

**Files:**
- Create: `webapp/BASELINE-20260812.md`
- Modify: `.gitignore`

**Interfaces:**
- Produce: il file di baseline con i win% di riferimento, letto a mano nel Task 16.

- [ ] **Passo 1: verificare che il pilota parta**

```bash
node webapp/server.js &
node webapp/misura-episodio.mjs ep1 2
```

Atteso: due righe di partita, poi `--- validità della corsa ---` seguito da
`VALIDA: nessuna azione fallita, nessun round perso, nessun errore JS`.

Se dice `NON VALIDA`, **fermarsi qui e riferire**: senza pilota valido questa
fase non ha cancello e non va cominciata.

- [ ] **Passo 2: registrare la mappa di partenza**

```bash
node webapp/mappa-pilota.mjs 20 4 2>/dev/null | tee webapp/BASELINE-20260812.md
```

N=20 e non 12: è il riferimento contro cui si giudicherà tutto il resto, e a N
basso gli episodi party-dipendenti oscillano troppo per distinguere una
regressione dal rumore. Dura un pomeriggio; lanciarlo e passare al Passo 3.

- [ ] **Passo 3: preparare l'oracolo**

```bash
echo 'webapp/public/js/_oracolo.js' >> .gitignore
git show 11cabc8e:webapp/public/js/digitale.js > webapp/public/js/_oracolo.js
node -e "import('./webapp/public/js/_oracolo.js').then(()=>console.log('oracolo importabile'))"
```

Atteso: `oracolo importabile`. Se fallisce per `localStorage is not defined`,
lo stub va messo prima dell'import, come in `test-digitale.mjs:11`.

- [ ] **Passo 4: commit**

```bash
git add .gitignore webapp/BASELINE-20260812.md
git commit -m "test(motore): la mappa di partenza contro cui misurare l'estrazione"
```

---

## Task 1: la RNG seminata

**Files:**
- Create: `webapp/motore/rng.js`, `webapp/test-motore-rng.mjs`

**Interfaces:**
- Produce:
  - `creaRng(seme: number) → { seme, passo }` — lo stato serializzabile
  - `prossimo(rng) → number` in `[0,1)`, muta `rng.passo`
  - `interoFino(rng, n) → number` in `[0,n)`
  - `tira2d6(rng) → { d: [number, number], tot: number }`
  - `mescola(rng, array) → array` (in place, Fisher-Yates)

- [ ] **Passo 1: scrivere il test che fallisce**

```js
// webapp/test-motore-rng.mjs
// Il generatore seminato: stessa partita, stessi dadi. Senza questo il
// bilanciamento e' statistica su rumore e nessuna misura si puo' rigiocare.
import { creaRng, prossimo, interoFino, tira2d6, mescola } from './motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// --- riproducibilita': stesso seme, stessa sequenza
{
  const a = creaRng(12345), b = creaRng(12345);
  const sa = Array.from({ length: 200 }, () => prossimo(a));
  const sb = Array.from({ length: 200 }, () => prossimo(b));
  ok(sa.join() === sb.join(), 'stesso seme, stessa sequenza');
  ok(a.passo === 200 && b.passo === 200, 'il passo conta i tiri');
}

// --- semi diversi divergono
{
  const a = creaRng(1), b = creaRng(2);
  ok(prossimo(a) !== prossimo(b), 'semi diversi, sequenze diverse');
}

// --- ripresa da uno stato salvato: e' la riconnessione al tavolo
{
  const a = creaRng(999);
  for (let i = 0; i < 37; i++) prossimo(a);
  const ripreso = { seme: a.seme, passo: a.passo };
  ok(prossimo(ripreso) === prossimo(creaRng(999) && (() => {
    const c = creaRng(999); for (let i = 0; i < 37; i++) prossimo(c); return c;
  })()), 'riprendendo da {seme,passo} la sequenza continua identica');
}

// --- dominio
{
  const r = creaRng(7);
  let fuori = 0;
  for (let i = 0; i < 10000; i++) { const v = prossimo(r); if (v < 0 || v >= 1) fuori++; }
  ok(fuori === 0, 'prossimo() resta in [0,1)');

  const r2 = creaRng(7);
  const conteggio = new Array(6).fill(0);
  for (let i = 0; i < 60000; i++) conteggio[interoFino(r2, 6)]++;
  ok(conteggio.every((c) => c > 9000 && c < 11000),
     `interoFino(6) uniforme (visto ${conteggio.join(',')})`);
}

// --- 2d6: dominio e campana
{
  const r = creaRng(42);
  const freq = {};
  for (let i = 0; i < 60000; i++) {
    const t = tira2d6(r);
    ok(t.d.length === 2 && t.d.every((x) => x >= 1 && x <= 6), 'i due dadi sono d6');
    ok(t.tot === t.d[0] + t.d[1], 'il totale e\' la somma dei due dadi');
    freq[t.tot] = (freq[t.tot] || 0) + 1;
  }
  ok(Object.keys(freq).length === 11, '2d6 copre 2..12');
  ok(freq[7] > freq[2] * 4, 'la campana ha il 7 al centro');
}

// --- mescola: permutazione vera, e riproducibile
{
  const base = Array.from({ length: 50 }, (_, i) => i);
  const a = mescola(creaRng(5), base.slice());
  const b = mescola(creaRng(5), base.slice());
  ok(a.join() === b.join(), 'mescola e\' riproducibile col seme');
  ok(a.slice().sort((x, y) => x - y).join() === base.join(),
     'mescola permuta senza perdere ne\' duplicare elementi');
  ok(a.join() !== base.join(), 'mescola cambia davvero l\'ordine');
}

console.log(ko === 0 ? 'TUTTO OK (rng)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire**

Run: `node webapp/test-motore-rng.mjs`
Atteso: `ERR_MODULE_NOT_FOUND` su `./motore/rng.js`.

- [ ] **Passo 3: scrivere l'implementazione**

```js
// webapp/motore/rng.js
// Il generatore della partita. NON e' Math.random: lo stato ({seme, passo}) vive
// dentro la partita e si salva con lei, quindi la stessa serata si rigioca
// identica — che e' cio' che rende misurabile il bilanciamento invece che
// stimabile. `passo` conta i numeri gia' estratti: riprendendo da un
// salvataggio si riavvolge fino a li' e la sequenza continua dov'era.
//
// mulberry32: 32 bit di stato, veloce, distribuzione buona. Non e'
// crittografico e non deve esserlo — qui si tirano dadi, non si generano
// chiavi.
export const creaRng = (seme) => ({ seme: seme >>> 0, passo: 0 });

function grezzo(seme, passo) {
  let a = (seme + 0x6D2B79F5 * (passo + 1)) >>> 0;
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}

export function prossimo(rng) {
  const v = grezzo(rng.seme, rng.passo);
  rng.passo += 1;
  return v;
}

export const interoFino = (rng, n) => Math.floor(prossimo(rng) * n);

// Due dadi separati, non un numero fra 2 e 12: la differenza si vede
// all'animazione (le facce) e nelle regole che guardano il doppio.
export function tira2d6(rng) {
  const d = [interoFino(rng, 6) + 1, interoFino(rng, 6) + 1];
  return { d, tot: d[0] + d[1] };
}

// Fisher-Yates, in place. Sostituisce i due rimescolamenti di engine.js
// (costruisciMazzo :138, pesca :157), che usavano Math.random.
export function mescola(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = interoFino(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```

- [ ] **Passo 4: eseguirlo e vederlo passare**

Run: `node webapp/test-motore-rng.mjs`
Atteso: `TUTTO OK (rng)`, exit 0.

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/rng.js webapp/test-motore-rng.mjs
git commit -m "feat(motore): il generatore seminato, perche' una serata si possa rigiocare"
```

---

## Task 2: la griglia, e il pattern del test differenziale

Questo task definisce **il pattern** che i Task 3-8 ripetono. Chi esegue i
task successivi legge questo per primo.

**Files:**
- Create: `webapp/motore/griglia.js`, `webapp/test-motore-griglia.mjs`
- Modify: `webapp/public/js/digitale.js:63-202`, `:420-445`, `:598-608`
- Modify: `webapp/build-dist.sh`

**Interfaces:**
- Consuma: niente.
- Produce — ogni funzione prende come primo argomento un **contesto esplicito**
  `{ ep, sp }` al posto del `ctx` globale (`digitale.js:22`):
  - `dentro([x,y]) → boolean`
  - `chiave([x,y]) → string`
  - `dirExit(raw) → string`
  - `arrediSet(g, tile) → Set<string>`
  - `portaCella(tile, dir) → [x,y]`
  - `dirVerso(tile, versoId) → string|null`
  - `tileDi(g, id) → tile`
  - `nk(nodo) → string`
  - `layout(g) → { [tileId]: [x,y] }` — memoizza su `g._layout`
  - `viciniGlob(g, nodo) → nodo[]`
  - `esploraMosse(g, da, budget, bloccate) → { [chiave]: { node, costo, reveal? } }`
  - `camminoGlob(g, da, a, bloccate) → nodo[]`
  - `adiacGlob(g, a, b) → boolean`
  - `celleAdiacLibere(g, nodo) → nodo[]`
  - `celleLibereTile(g, tileId) → nodo[]`
  - `raggEroe(g, nome) → { [chiave]: {...} }`
  - `celleEsca(g, nome) → { [chiave]: {...} }`
  - `raggScortato(g, i) → { [chiave]: {...} }`
  - `distGlob(g, a, b) → number`

  dove `g = { ep, sp, _layout }`. **`g` non contiene mai `app`, `comune.carte`
  o altro che non sia dati d'episodio e stato di spedizione.**

- [ ] **Passo 1: scrivere il test differenziale che fallisce**

```js
// webapp/test-motore-griglia.mjs
// DIFFERENZIALE: la griglia estratta deve rispondere esattamente come quella
// dentro digitale.js prima dell'estrazione. L'oracolo e' il file a 11cabc8e:
//   git show 11cabc8e:webapp/public/js/digitale.js > webapp/public/js/_oracolo.js
// Impalcatura temporanea: si cancella a fine Fase 1.
globalThis.localStorage = { setItem() {}, getItem() { return null; }, removeItem() {} };

import { _motore as vecchio } from './public/js/_oracolo.js';
import * as nuovo from './motore/griglia.js';
import { creaRng, interoFino } from './motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// Le stesse tessere di test-digitale.mjs: exits e arredi 1:1 dall'Ep.1.
const TESS = [
  { id: 'T1', nome: 'Banchina', exits: { N: 'T2' }, start: 'S', arredi: [[0, 3, 'molo'], [3, 3, 'casse']] },
  { id: 'T2', nome: 'Casse', exits: { S: 'T1', E: 'T3', O: 'T4', N: 'T5 (grata: apri)' }, arredi: [[1, 1, 'casse'], [2, 2, 'casse']] },
  { id: 'T3', nome: 'Candele', exits: { O: 'T2' }, arredi: [[0, 0, 'c'], [3, 0, 'c'], [0, 3, 'c'], [3, 3, 'c']] },
  { id: 'T4', nome: 'Ufficio', exits: { E: 'T2' }, arredi: [[1, 3, 's'], [3, 0, 'b']] },
  { id: 'T5', nome: 'Scala', exits: { S: 'T2', N: 'T6' }, arredi: [[1, 1, 's'], [2, 1, 's'], [1, 2, 's'], [2, 2, 's']] },
  { id: 'T6', nome: 'Cripta', exits: { S: 'T5' }, arredi: [[1, 2, 'a'], [2, 2, 'a'], [3, 3, 'cella']] },
];
const ep = { tessere: TESS, cartella: 'Episodio 1', obiettivo: '' };

// Genera stati di spedizione plausibili e vari: rivelate diverse, grate aperte
// o chiuse, nemici e eroi sparsi, uscita segreta aperta o no.
function statoCasuale(rng) {
  const quante = 1 + interoFino(rng, TESS.length);
  const rivelate = TESS.slice(0, quante).map((t) => t.id);
  const grate = interoFino(rng, 2) ? ['T2-N'] : [];
  const cella = () => ({ t: rivelate[interoFino(rng, rivelate.length)],
                         x: interoFino(rng, 4), y: interoFino(rng, 4) });
  const nemici = Array.from({ length: interoFino(rng, 5) },
    () => ({ nome: 'SGHERRO', pos: cella(), ferite: 0, max: 2 }));
  const eroiPos = { 'ELENA FOSCO': cella(), 'OTTONE BRERA': cella() };
  const uscita = interoFino(rng, 3) === 0
    ? { tile: 'T6', cella: [3, 3], aperta: true } : null;
  return { rivelate, grate, nemici, eroiPos, uscita,
           scortati: [{ liberato: true, pos: cella() }],
           vite: { 'ELENA FOSCO': 6, 'OTTONE BRERA': 7 }, round: 1 + interoFino(rng, 9) };
}

const rng = creaRng(20260812);
const party = ['ELENA FOSCO', 'OTTONE BRERA'];
let confronti = 0;

for (let i = 0; i < 2000; i++) {
  const sp = statoCasuale(rng);
  vecchio._setup(ep, JSON.parse(JSON.stringify(sp)), { party });
  const g = { ep, sp: JSON.parse(JSON.stringify(sp)), partita: { party } };

  const nodo = { t: sp.rivelate[0], x: interoFino(rng, 4), y: interoFino(rng, 4) };
  const meta = { t: sp.rivelate[sp.rivelate.length - 1], x: interoFino(rng, 4), y: interoFino(rng, 4) };
  const budget = 1 + interoFino(rng, 6);

  const casi = [
    ['layout', () => vecchio.layout(), () => nuovo.layout(g)],
    ['portaCella N', () => vecchio.portaCella(TESS[1], 'N'), () => nuovo.portaCella(TESS[1], 'N')],
    ['arrediSet T6', () => [...vecchio.arrediSet(TESS[5])].sort(), () => [...nuovo.arrediSet(g, TESS[5])].sort()],
    ['viciniGlob', () => vecchio.viciniGlob(nodo), () => nuovo.viciniGlob(g, nodo)],
    ['esploraMosse', () => vecchio.esploraMosse(nodo, budget, new Set()), () => nuovo.esploraMosse(g, nodo, budget, new Set())],
    ['camminoGlob', () => vecchio.camminoGlob(nodo, meta, new Set()), () => nuovo.camminoGlob(g, nodo, meta, new Set())],
    ['adiacGlob', () => vecchio.adiacGlob(nodo, meta), () => nuovo.adiacGlob(g, nodo, meta)],
    ['celleEsca', () => vecchio.celleEsca(party[1]), () => nuovo.celleEsca(g, party[1])],
  ];

  for (const [nome, a, b] of casi) {
    let va, vb;
    try { va = JSON.stringify(a()); } catch (e) { va = 'ERR:' + e.message; }
    try { vb = JSON.stringify(b()); } catch (e) { vb = 'ERR:' + e.message; }
    confronti++;
    if (va !== vb) {
      ok(false, `${nome} diverge allo stato #${i}\n  vecchio: ${String(va).slice(0, 300)}\n  nuovo:   ${String(vb).slice(0, 300)}`);
      if (ko > 5) { console.error('troppe divergenze, mi fermo'); process.exit(1); }
    }
  }
}

// --- il vincolo globale: nel motore non entra il browser
{
  const src = await (await import('fs')).promises.readFile('webapp/motore/griglia.js', 'utf8');
  const vietati = ['document', 'window', 'localStorage', 'setTimeout',
                   'requestAnimationFrame', 'fetch', 'Math.random'];
  for (const v of vietati) ok(!src.includes(v), `griglia.js non deve contenere «${v}»`);
}

console.log(ko === 0 ? `TUTTO OK (griglia, ${confronti} confronti)` : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire**

Run: `node webapp/test-motore-griglia.mjs`
Atteso: `ERR_MODULE_NOT_FOUND` su `./motore/griglia.js`.

Se invece fallisce su `./public/js/_oracolo.js`, rigenerare l'oracolo (Task 0,
passo 3).

- [ ] **Passo 3: estrarre**

Spostare in `webapp/motore/griglia.js` le righe di `digitale.js` elencate qui,
**senza cambiarne la logica** — solo la provenienza dei dati:

| da `digitale.js` | funzioni |
|---|---|
| `:64-69` | `dentro`, `chiave`, `eq`, `dirExit`, `OPP`, `DELTA` |
| `:71-99` | `arrediSet`, `vicini`, `portaCella`, `dirVerso`, `tileDi` |
| `:101-119` | `nk`, `layout`, `grataChiusa` |
| `:120-202` | `viciniGlob`, `esploraMosse`, `camminoGlob`, `celleAdiacLibere`, `adiacGlob` |
| `:355-368` | `celleLibereTile` |
| `:420-445` | `raggEroe`, `celleEsca` |
| `:598-608` | `raggScortato` |
| `:719-720` | `distGlob` |

Tre sole trasformazioni meccaniche, da applicare ovunque:

1. `ctx.ep` → `g.ep`; `SP()` → `g.sp`; `P()` → `g.partita`.
2. Ogni funzione prende `g` come primo parametro; le chiamate interne lo passano.
3. `ctx.layout` (la memoizzazione, `:105` e `:116`) → `g._layout`.

Non toccare `arrediSet` nella sostanza: la riga `:75` legge
`ctx && ctx.partita && SP() && SP().uscita` — quella catena di guardie diventa
`g.sp && g.sp.uscita`, e va tenuta, perché `arrediSet` viene chiamata anche
prima che la spedizione esista.

In `digitale.js`, sostituire le definizioni rimosse con un import e adattatori
che tengono `g` implicito, così il resto del file non cambia di una riga:

```js
import * as griglia from '../../motore/griglia.js';
const G = () => ({ ep: ctx.ep, sp: SP(), partita: P(), get _layout() { return ctx.layout; },
                   set _layout(v) { ctx.layout = v; } });
const layout = () => griglia.layout(G());
const esploraMosse = (da, budget, bloccate) => griglia.esploraMosse(G(), da, budget, bloccate);
const camminoGlob = (da, a, bloccate) => griglia.camminoGlob(G(), da, a, bloccate);
const adiacGlob = (a, b) => griglia.adiacGlob(G(), a, b);
const viciniGlob = (n) => griglia.viciniGlob(G(), n);
const arrediSet = (tile) => griglia.arrediSet(G(), tile);
const celleAdiacLibere = (n) => griglia.celleAdiacLibere(G(), n);
const celleLibereTile = (id) => griglia.celleLibereTile(G(), id);
const raggEroe = (nm) => griglia.raggEroe(G(), nm);
const celleEsca = (nm) => griglia.celleEsca(G(), nm);
const raggScortato = (i) => griglia.raggScortato(G(), i);
const distGlob = (a, b) => griglia.distGlob(G(), a, b);
const tileDi = (id) => griglia.tileDi(G(), id);
const { dentro, chiave, dirExit, portaCella, dirVerso, nk } = griglia;
```

Gli adattatori sono deliberatamente banali e temporanei: spariscono nel Task 14,
quando `digitale.js` smette di chiamare il motore direttamente.

- [ ] **Passo 4: eseguire il differenziale e i test esistenti**

```bash
node webapp/test-motore-griglia.mjs
node webapp/test-digitale.mjs
node webapp/test-digitale-regressioni.mjs
```

Atteso: `TUTTO OK (griglia, 16000 confronti)`, `TUTTO OK (motore multi-tessera)`,
e il regressioni verde. Tutti e tre exit 0.

- [ ] **Passo 5: verificare che il browser non si sia rotto**

```bash
node webapp/server.js &
node webapp/misura-episodio.mjs ep1 3
```

Atteso: `VALIDA`, e nessun errore JS. Una partita che gira dall'inizio alla
fine è la prova che gli import ESM risolvono anche nel browser — cosa che i
test node non dimostrano.

- [ ] **Passo 6: far arrivare `motore/` in produzione**

In `webapp/build-dist.sh`, accanto alle copie esistenti (`:14-22`), aggiungere
la cartella del motore. Poi verificare:

```bash
bash webapp/build-dist.sh && ls webapp/dist/motore/
```

Atteso: `griglia.js  rng.js`. Se la cartella manca, in produzione la pagina
carica a metà e nessun test locale se ne accorge.

- [ ] **Passo 7: commit**

```bash
git add webapp/motore/griglia.js webapp/test-motore-griglia.mjs \
        webapp/public/js/digitale.js webapp/build-dist.sh
git commit -m "refactor(motore): la griglia esce da digitale.js, con l'oracolo che la sorveglia"
```

---

## Task 3: le statistiche derivate

Stesso pattern del Task 2: differenziale, estrazione meccanica, adattatori.

**Files:**
- Create: `webapp/motore/stat.js`, `webapp/test-motore-stat.mjs`
- Modify: `webapp/public/js/digitale.js:204-264`, `:568-579`, `:598-621`

**Interfaces:**
- Consuma: `griglia.adiacGlob`, `griglia.layout`.
- Produce:
  - `eroe(g, nome) → eroeDati` — da `digitale.js:204`
  - `nemStat(g, nome) → nemicoDati` — `:213`
  - `fascia(g, taglia) → number` — `:222`
  - `feriteMaxNem(g, nome) → number` — `:229`
  - `saluteMax(g, eroeDati) → number` — `:230`
  - `movimento(g, nome) → number` — `:218`
  - `specScortati(g) → spec[]`, `specScort(g, i) → spec`
  - `occupati(g) → Set<string>` — `:255`
  - `primo(nome) → string`, `eroiAttivoNome(g) → string|null` — `:568-579`
  - `azioniOf(g, nome) → string[]`, `azioneSpesa(g, nome, tipo) → boolean`
  - `stordito(g, nome) → boolean`, `azioniMax(g, nome) → number`
  - `azioniRestano(g, nome) → boolean` — `:598-621`
  - `bonusVoce(g, nome, stat) → [{label, val}]` — `:779-787`

`saluteMax` legge `ep.salute_extra` e `partita.vantaggi.tier`
(`digitale.js:230-244`): `g` deve quindi portare anche `partita`, non solo
`ep` e `sp`. È già così dal Task 2.

- [ ] **Passo 1: scrivere il differenziale**

Copiare `webapp/test-motore-griglia.mjs` in `webapp/test-motore-stat.mjs` e
sostituire l'array `casi` con:

```js
  const nm = party[interoFino(rng, party.length)];
  const casi = [
    ['eroe', () => vecchio._m.eroe(nm), () => nuovo.eroe(g, nm)],
    ['nemStat', () => vecchio._m.nemStat('SGHERRO'), () => nuovo.nemStat(g, 'SGHERRO')],
    ['fascia', () => vecchio._m.fascia(1 + interoFino(rng, 10)), () => nuovo.fascia(g, 4)],
    ['saluteMax', () => vecchio._m.saluteMax(vecchio._m.eroe(nm)), () => nuovo.saluteMax(g, nuovo.eroe(g, nm))],
    ['movimento', () => vecchio._m.movimento(nm), () => nuovo.movimento(g, nm)],
    ['occupati', () => [...vecchio._m.occupati()].sort(), () => [...nuovo.occupati(g)].sort()],
    ['azioniMax', () => vecchio._m.azioniMax(nm), () => nuovo.azioniMax(g, nm)],
    ['azioniRestano', () => vecchio._m.azioniRestano(nm), () => nuovo.azioniRestano(g, nm)],
    ['bonusVoce nervi', () => vecchio._m.bonusVoce(nm, 'nervi'), () => nuovo.bonusVoce(g, nm, 'nervi')],
    ['eroiAttivoNome', () => vecchio._m.eroiAttivoNome(), () => nuovo.eroiAttivoNome(g)],
  ];
```

`statoCasuale` va esteso per generare anche i campi che queste funzioni
leggono, altrimenti si confrontano due `undefined` e il test passa a vuoto:

```js
  sp.azioni = { 'ELENA FOSCO': interoFino(rng, 2) ? ['muovere'] : [] };
  sp.storditi = interoFino(rng, 3) === 0 ? { 'ELENA FOSCO': sp.round } : {};
  sp.eroiFatti = [];
  sp.eroiAttivo = interoFino(rng, 2) ? 'ELENA FOSCO' : null;
  sp.voceFerma = interoFino(rng, 2) ? { da: 'OTTONE BRERA', round: sp.round } : null;
```

**Verificare che il test non sia vacuo** prima di fidarsene: cambiare a mano un
segno in `motore/stat.js` (per esempio `>=` in `>` dentro `azioniRestano`) e
controllare che il differenziale FALLISCA. Poi rimettere. Un test che passa
sempre non è una rete.

L'oracolo va esteso per esporre queste funzioni: in `_oracolo.js`, aggiungere
al blocco `_motore` (in fondo al file) un secondo export

```js
export const _m = { eroe, nemStat, fascia, saluteMax, movimento, occupati,
                    azioniMax, azioniRestano, bonusVoce, eroiAttivoNome, primo,
                    azioniOf, azioneSpesa, stordito, specScortati, specScort };
```

L'oracolo è gitignorato e monouso: modificarlo a mano è legittimo. Va rifatto
ogni volta che si rigenera, quindi conviene aggiungere queste righe a uno
script `webapp/rigenera-oracolo.sh`.

- [ ] **Passo 2: eseguirlo e vederlo fallire**

Run: `node webapp/test-motore-stat.mjs` → `ERR_MODULE_NOT_FOUND`.

- [ ] **Passo 3: estrarre** le righe elencate sopra, con le stesse tre
trasformazioni del Task 2, e mettere in `digitale.js` gli adattatori a `g`
implicito.

- [ ] **Passo 4: eseguire**

```bash
node webapp/test-motore-stat.mjs && node webapp/test-digitale.mjs \
  && node webapp/test-digitale-regressioni.mjs && node webapp/test-abilita.mjs
```

Atteso: tutti verdi.

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/stat.js webapp/test-motore-stat.mjs webapp/public/js/digitale.js
git commit -m "refactor(motore): le statistiche derivate escono da digitale.js"
```

---

## Task 4: le regole comuni (ex `engine.js`)

**Files:**
- Create: `webapp/motore/regole.js`, `webapp/test-motore-regole.mjs`
- Modify: `webapp/public/js/engine.js`

**Interfaces:**
- Consuma: `rng.mescola`, `rng.interoFino`.
- Produce: tutto ciò che `engine.js` esporta **tranne** gli URL asset
  (`:278-315`) e `PISTE_FREDDE` (`:54-60`), che restano nella vista. Le tre
  funzioni che usavano `Math.random` cambiano firma:
  - `dichiaraVoce(ep, comune, nomeVoce) → {tipo:'visita',luogo} | {tipo:'fredda'}`
    — **non sceglie più la frase**: restituisce solo il tipo, e la vista pesca
    da `PISTE_FREDDE`. Toglie l'ultima ragione per cui il motore conosceva della
    prosa.
  - `costruisciMazzo(rng, carte, ep, epId) → mazzo`
  - `pesca(rng, mazzo, carte, epId, ep) → carta`

- [ ] **Passo 1: scrivere il test**

```js
// webapp/test-motore-regole.mjs
// Le regole comuni, con la RNG passata invece che pescata dall'ambiente.
import * as r from './motore/regole.js';
import { creaRng } from './motore/rng.js';
import { readFileSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const carte = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const ep1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const comune = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));

// --- il mazzo e' riproducibile col seme
{
  const a = r.costruisciMazzo(creaRng(77), carte, ep1, 'ep1');
  const b = r.costruisciMazzo(creaRng(77), carte, ep1, 'ep1');
  ok(a.ordine.join() === b.ordine.join(), 'stesso seme, stesso mazzo');
  const c = r.costruisciMazzo(creaRng(78), carte, ep1, 'ep1');
  ok(c.ordine.join() !== a.ordine.join(), 'semi diversi, mazzi diversi');
  ok(a.ordine.slice().sort((x, y) => x - y).join() === a.pool.map((_, i) => i).join(),
     'il mazzo contiene ogni carta una volta sola');
  ok(!a.pool.some((t) => t.startsWith('Bivio')), 'le carte Bivio restano fuori');
}

// --- pescare l'intero mazzo e' riproducibile, e il rimescolo pure
{
  const rng = creaRng(5); const m = r.costruisciMazzo(rng, carte, ep1, 'ep1');
  const tirate = [];
  for (let i = 0; i < m.pool.length + 3; i++) tirate.push(r.pesca(rng, m, carte, 'ep1', ep1).title);
  ok(tirate.every(Boolean), 'ogni pesca restituisce una carta');
  ok(m.rimescolato === 1, 'finito il mazzo, si rimescola una volta sola');

  const rng2 = creaRng(5); const m2 = r.costruisciMazzo(rng2, carte, ep1, 'ep1');
  const tirate2 = [];
  for (let i = 0; i < m.pool.length + 3; i++) tirate2.push(r.pesca(rng2, m2, carte, 'ep1', ep1).title);
  ok(tirate.join('|') === tirate2.join('|'), 'la sequenza di pesca si rigioca identica');
}

// --- dichiaraVoce non sceglie piu' la prosa
{
  const dentro = r.dichiaraVoce(ep1, comune, ep1.luoghi[0].voce_mappa);
  ok(dentro.tipo === 'visita' && dentro.luogo, 'una voce dell\'episodio e\' una visita');
  const fuori = r.dichiaraVoce(ep1, comune, 'IL PANIFICIO CHE NON ESISTE');
  ok(fuori.tipo === 'fredda', 'una voce estranea e\' una pista fredda');
  ok(!('frase' in fuori), 'il motore non sceglie piu\' la frase: la prosa e\' della vista');
}

// --- il tick del Canto non e' cambiato (regressione sul cuore del bilanciamento)
{
  const sped = { round: 4, canto: 0, cantoBonus: false };
  const ann = r.fineRound(comune, ep1, sped);
  ok(sped.canto === 1, `al 4o round scatta il segnalino (visto ${sped.canto})`);
  ok(sped.round === 5, 'e poi si avanza di round');
  ok(ann.length >= 1 && /segnalino/i.test(ann[0]), 'con l\'annuncio giusto');

  const sped2 = { round: 3, canto: 0, cantoBonus: false };
  r.fineRound(comune, ep1, sped2);
  ok(sped2.canto === 0, 'al 3o round non scatta niente');
}

// --- nel motore non entra il browser, e nemmeno Math.random
{
  const src = readFileSync('webapp/motore/regole.js', 'utf8');
  for (const v of ['document', 'window', 'localStorage', 'Math.random', '/assets/']) {
    ok(!src.includes(v), `regole.js non deve contenere «${v}»`);
  }
}

console.log(ko === 0 ? 'TUTTO OK (regole)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire** — `ERR_MODULE_NOT_FOUND`.

- [ ] **Passo 3: creare `motore/regole.js`** copiando `engine.js` righe 1-276
e applicando:
- `costruisciMazzo`: togliere il ciclo `:136-140`, usare `mescola(rng, ordine)`.
- `pesca`: togliere il ciclo `:155-159`, usare `mescola(rng, mazzo.ordine)`.
- `dichiaraVoce`: togliere `PISTE_FREDDE` e `:64-65`, restituire `{tipo:'fredda'}`.
- Lasciare fuori `:278-315` (gli URL) e `rendi` (`:12-19`, è HTML).

- [ ] **Passo 4: far reggere `engine.js` ai consumatori esistenti**

`indagine.js`, `spedizione.js` e `digitale.js` importano da `./engine.js` e in
questa fase non devono cambiare. Quindi `engine.js` diventa:

```js
// Le regole sono passate in motore/regole.js, isomorfo e senza prosa. Qui
// restano i pezzi che appartengono alla VISTA — l'html-lite, gli URL degli
// asset, le frasi delle piste fredde — piu' un re-export di tutto il resto,
// cosi' i tre consumatori non cambiano una riga in questa fase.
export * from '../../motore/regole.js';
import { dichiaraVoce as _dichiaraVoce, costruisciMazzo as _costruisci,
         pesca as _pesca } from '../../motore/regole.js';
```

più: `rendi`, `PISTE_FREDDE`, `urlCarta`, `urlArt`, `cartaLuogo`,
`cartaApprofondimento`, `cartaOggetto` invariati, e tre adattatori che
mantengono **la vecchia firma** iniettando una RNG di comodo:

```js
// Ponte temporaneo: finche' la partita non ha una sua RNG (Task 9), le tre
// funzioni che tiravano a caso continuano a farlo, ma passando dal generatore
// invece che da Math.random. Sparisce nel Task 9.
import { creaRng, interoFino } from '../../motore/rng.js';
const rngVolatile = creaRng((Date.now() ^ 0x5f3759df) >>> 0);

export function dichiaraVoce(ep, comune, nomeVoce) {
  const out = _dichiaraVoce(ep, comune, nomeVoce);
  if (out.tipo !== 'fredda') return out;
  return { ...out, frase: PISTE_FREDDE[interoFino(rngVolatile, PISTE_FREDDE.length)] };
}
export const costruisciMazzo = (carte, ep, epId) => _costruisci(rngVolatile, carte, ep, epId);
export const pesca = (mazzo, carte, epId, ep) => _pesca(rngVolatile, mazzo, carte, epId, ep);
```

- [ ] **Passo 5: eseguire tutto**

```bash
node webapp/test-motore-regole.mjs && node webapp/test-engine.mjs \
  && node webapp/test-digitale.mjs && node webapp/test-digitale-regressioni.mjs
node webapp/server.js & node webapp/misura-episodio.mjs ep1 3
```

Atteso: tutti verdi, e la corsa `VALIDA`. `test-engine.mjs` è il controllo
importante: gira sulle firme vecchie e deve continuare a passare.

- [ ] **Passo 6: commit**

```bash
git add webapp/motore/regole.js webapp/test-motore-regole.mjs webapp/public/js/engine.js
git commit -m "refactor(motore): le regole comuni escono da engine.js, coi dadi che vengono dal seme"
```

---

## Task 5: obiettivi d'episodio

**Files:**
- Create: `webapp/motore/obiettivi.js`, `webapp/test-motore-obiettivi.mjs`
- Modify: `webapp/public/js/digitale.js:1197-1533`

**Interfaces:**
- Consuma: `griglia`, `stat`.
- Produce, tutte con `g` primo parametro e **senza `salvaP()`** (le due chiamate
  a `:1342` e `:1529` escono; il salvataggio lo fa il chiamante):
  `specCompiti`, `compitiFiniti`, `obiettivoFatto`, `compitoDisponibile`,
  `specOrologio`, `avanzaOrologio(g, quanti, causa) → annunci[]`,
  `specRogo`, `rogoBrucia`, `haProtezioneRogo`, `avanzaRogo`,
  `avanzaCancellazione`, `specRitmo`, `frammentiPortati`, `avanzaRitmo`,
  `avanzaPressione`, `controllaFiloPerso`.

Ognuna restituisce **l'elenco degli annunci**, come già fa oggi.

- [ ] **Passo 1: scrivere il test**

`test-digitale.mjs:75-287` contiene già la suite completa di questi orologi —
cancellazione dell'Ep.15, ritmo e pressione dell'Ep.20, filo perso dell'Ep.11,
demolizione dell'Ep.10. **Copiarla** in `test-motore-obiettivi.mjs`
sostituendo `_setup(ep, sp, extra)` con la costruzione esplicita di `g`:

```js
const G = (ep, sp, extra = {}) => ({ ep, sp, partita: { party: [], ...extra } });
const gioca = (ep, sp, extra) => obiettivi.avanzaCancellazione(G(ep, sp, extra));
```

Le asserzioni e i valori attesi non si toccano: sono la specifica misurata di
cinque episodi e cambiarli è cambiare il gioco.

- [ ] **Passo 2: eseguirlo e vederlo fallire** — `ERR_MODULE_NOT_FOUND`.

- [ ] **Passo 3: estrarre** `digitale.js:1197-1533`, togliendo i due `salvaP()`.

- [ ] **Passo 4: eseguire**

```bash
node webapp/test-motore-obiettivi.mjs && node webapp/test-digitale.mjs \
  && node webapp/test-digitale-regressioni.mjs
```

Entrambe le suite (la copia nuova e l'originale in `test-digitale.mjs`) devono
passare: finché `digitale.js` delega, dicono la stessa cosa da due lati.

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/obiettivi.js webapp/test-motore-obiettivi.mjs webapp/public/js/digitale.js
git commit -m "refactor(motore): gli orologi d'episodio escono da digitale.js"
```

---

## Task 6: vittoria e sconfitta

**Files:**
- Create: `webapp/motore/vittoria.js`, `webapp/test-motore-vittoria.mjs`
- Modify: `webapp/public/js/digitale.js:1535-1552`, `:1587-1628`, `:2155-2196`

**Interfaces:**
- Produce:
  - `controllaVittoria(g) → { esito, riga } | null` — **non chiama più
    `epilogo()`**: dice solo se e come si è vinto, e il chiamante decide.
    Da `digitale.js:1535-1552`, dove le righe `:1544-1550` restano identiche e
    spariscono `salvaP(); epilogo(); return true` (`:1551`).
  - `scortaPuoVincere(g) → boolean` — `:1626-1628`, invariata
  - `esitoScorta(g, i, node) → { esito, righe[] } | null` — la parte *di regola*
    di `muoviScortato` (`:1587-1616`): posizione, uscita dal condotto, vittoria
    per meta. Le tre uscite `render()`/`epilogo()` diventano il valore di ritorno.
  - `chiudiFaseNemici(g) → { esito, righe[] } | null` — `:2155-2166`
  - `risolviRestoNemici(g, piano) → eventi[]` — `:2170-2196`

- [ ] **Passo 1: scrivere il test**

```js
// webapp/test-motore-vittoria.mjs
// Le condizioni di chiusura: chi vince, chi perde, chi arriva secondo. Sono le
// righe che decidono se una serata e' stata vinta, quindi vanno provate su
// stati costruiti a mano, non solo giocando.
import * as v from './motore/vittoria.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const TESS = [{ id: 'T1', nome: 'Ingresso', exits: { N: 'T2' }, arredi: [] },
              { id: 'T2', nome: 'Fondo', exits: { S: 'T1' }, arredi: [] }];
const G = (ep, sp, party = ['ELENA FOSCO']) => ({ ep, sp, partita: { party } });
const base = (o = {}) => ({ rivelate: ['T1', 'T2'], nemici: [], vite: { 'ELENA FOSCO': 5 },
                            eroiPos: { 'ELENA FOSCO': { t: 'T2', x: 0, y: 0 } },
                            compiti: {}, log: [], round: 5, esito: null, ...o });

// --- compito finito + tutti sulla tessera giusta = vittoria
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2', testo: 'Siete salvi.' },
               compiti: [{ id: 'x', quante: 1, tile: 'T2' }] };
  const sp = base({ compiti: { x: 1 } });
  const out = v.controllaVittoria(G(ep, sp));
  ok(out && out.esito === 'vittoria', `compito fatto in T2 = vittoria (visto ${out && out.esito})`);
  ok(out.riga === 'Siete salvi.', 'con il testo dichiarato dall\'episodio');
}

// --- stesso stato, ma un eroe e' rimasto indietro
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1, tile: 'T2' }] };
  const sp = base({ compiti: { x: 1 }, vite: { 'ELENA FOSCO': 5, 'NINO MORA': 4 },
                    eroiPos: { 'ELENA FOSCO': { t: 'T2', x: 0, y: 0 }, 'NINO MORA': { t: 'T1', x: 0, y: 0 } } });
  ok(!v.controllaVittoria(G(ep, sp, ['ELENA FOSCO', 'NINO MORA'])),
     'chi e\' rimasto indietro tiene aperta la partita');
}

// --- un eroe a terra non trattiene nessuno: si conta chi e' in piedi
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1, tile: 'T2' }] };
  const sp = base({ compiti: { x: 1 }, vite: { 'ELENA FOSCO': 5, 'NINO MORA': 0 },
                    eroiPos: { 'ELENA FOSCO': { t: 'T2', x: 0, y: 0 }, 'NINO MORA': { t: 'T1', x: 0, y: 0 } } });
  ok(v.controllaVittoria(G(ep, sp, ['ELENA FOSCO', 'NINO MORA'])),
     'un compagno a terra in T1 non impedisce la vittoria');
}

// --- il boss ancora in piedi sbarra la vittoria; a terra no
{
  const ep = { tessere: TESS, vittoria: { boss: true }, soluzione: { boss: 'IL DORMIENTE' },
               compiti: [{ id: 'x', quante: 1 }] };
  const inPiedi = base({ compiti: { x: 1 }, nemici: [{ nome: 'IL DORMIENTE', pos: { t: 'T2', x: 1, y: 1 } }] });
  ok(!v.controllaVittoria(G(ep, inPiedi)), 'col boss in piedi non si vince');
  const aTerra = base({ compiti: { x: 1 }, nemici: [{ nome: 'IL DORMIENTE', pos: { t: 'T2', x: 1, y: 1 }, abbattuto: true }] });
  ok(v.controllaVittoria(G(ep, aTerra)), 'il boss a terra in attesa d\'essere preso non sbarra piu\'');
}

// --- il declassamento: si vince, ma parziale
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }] };
  const rogo = base({ compiti: { x: 1 }, registriAnneriti: true });
  ok(v.controllaVittoria(G(ep, rogo)).esito === 'parziale', 'i registri anneriti declassano a parziale');
  const orol = base({ compiti: { x: 1 }, declassato: 'Il decano se n\'e\' andato.' });
  ok(v.controllaVittoria(G(ep, orol)).esito === 'parziale', 'l\'orologio superato declassa a parziale');
}

// --- partita gia' chiusa: non si vince due volte
{
  const ep = { tessere: TESS, vittoria: { tessera: 'T2' }, compiti: [{ id: 'x', quante: 1 }] };
  ok(!v.controllaVittoria(G(ep, base({ compiti: { x: 1 }, esito: 'vittoria' }))),
     'a partita chiusa controllaVittoria tace');
}

// --- TPK
{
  const ep = { tessere: TESS };
  const sp = base({ vite: { 'ELENA FOSCO': 0, 'NINO MORA': 0 } });
  const out = v.chiudiFaseNemici(G(ep, sp, ['ELENA FOSCO', 'NINO MORA']));
  ok(out && out.esito === 'sconfitta', 'tutti a terra = sconfitta');
}

// --- il motore non tocca lo schermo
{
  const src = await (await import('fs')).promises.readFile('webapp/motore/vittoria.js', 'utf8');
  for (const x of ['document', 'epilogo(', 'render(', 'salvaP(']) {
    ok(!src.includes(x), `vittoria.js non deve contenere «${x}»`);
  }
}

console.log(ko === 0 ? 'TUTTO OK (vittoria)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire** — `ERR_MODULE_NOT_FOUND`.

- [ ] **Passo 3: estrarre**, e in `digitale.js` riattaccare le code rimosse:

```js
function controllaVittoria() {
  const out = vittoria.controllaVittoria(G());
  if (!out) return false;
  const sp = SP(); sp.esito = out.esito; sp.log.push(out.riga);
  salvaP(); epilogo(); return true;
}
```

Lo stesso per `muoviScortato`, che tiene `render()`/`epilogo()` e delega la
regola a `esitoScorta`.

- [ ] **Passo 4: eseguire**

```bash
node webapp/test-motore-vittoria.mjs && node webapp/test-digitale-regressioni.mjs
node webapp/server.js & node webapp/misura-episodio.mjs ep4 5
```

Ep.4 e non Ep.1: è l'episodio con **due** PNG da scortare, e la vittoria
richiede che escano entrambi — è lì che le condizioni di chiusura sono più
intricate.

Atteso: `VALIDA`, e almeno una vittoria su cinque.

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/vittoria.js webapp/test-motore-vittoria.mjs webapp/public/js/digitale.js
git commit -m "refactor(motore): le condizioni di chiusura dicono l'esito invece di disegnare l'epilogo"
```

---

## Task 7: minaccia e spawn

**Files:**
- Create: `webapp/motore/minaccia.js`, `webapp/test-motore-minaccia.mjs`
- Modify: `webapp/public/js/digitale.js:1875-2054`

**Interfaces:**
- Consuma: `rng`, `regole`, `griglia`, `stat`, `obiettivi`.
- Produce:
  - `spawnRegex(g) → RegExp` — `:1880-1901`
  - `spawnUno(g, rng, nome, tileId) → nemico|null` — `:1903-1925`
  - `tessLontana(g) → tileId` — `:1927-1939`
  - `destaBossSeSoglia(g, rng) → annunci[]` — `:1941-1977`
  - `spawnDaTesto(g, rng, testo, tileId) → annunci[]` — `:1978-1996`
  - `tileAffollata(g, tileId) → boolean` — `:1998-2004`
  - `faseMinaccia(g, rng) → { eventi[], pendenza|null }` — da `:2007-2054`

`faseMinaccia` è la prima funzione **mista** convertita, ed è il modello per i
Task 10-12. Oggi `:2051` fa `await messaggioCarta(...)` **dentro** il ciclo di
pesca: la carta si mostra e, se porta un'insidia, si tira una prova prima di
passare alla successiva. Nella versione nuova il ciclo **non si ferma**: per
ogni carta produce un evento

```js
{ tipo: 'carta', titolo, carta, annunci: [...] }
```

e se la carta richiede una prova (`provaRichiesta(carta.rules)`), si ferma lì
restituendo

```js
{ eventi, pendenza: { a: 'arbitro', tipo: 'insidia',
                      contesto: { carta: carta.title, rimaste: n },
                      opzioni: viviCheLaPossonoSubire } }
```

Le carte non ancora pescate restano nel mazzo: la fase riprende col comando
`{ tipo:'rispondi', scelta }` che risolve l'insidia e continua a pescare. È
esattamente ciò che l'`await` faceva, ma con lo stato dell'attesa **scritto**
invece che sospeso in una promise.

- [ ] **Passo 1: scrivere il test**

```js
// webapp/test-motore-minaccia.mjs
import * as m from './motore/minaccia.js';
import { creaRng } from './motore/rng.js';
import { readFileSync } from 'fs';

let ko = 0;
const ok = (c, msg) => { if (!c) { console.error('FAIL:', msg); ko++; } };

const carte = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const comune = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const ep1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const G = (sp, party = ['ELENA FOSCO', 'OTTONE BRERA']) =>
  ({ ep: ep1, comune, carte, sp, partita: { party, episodio: 'ep1' } });
const base = (o = {}) => ({ round: 3, canto: 0, cantoBonus: false, rivelate: ['T1'],
                            nemici: [], vite: { 'ELENA FOSCO': 6, 'OTTONE BRERA': 7 },
                            eroiPos: { 'ELENA FOSCO': { t: 'T1', x: 1, y: 1 },
                                       'OTTONE BRERA': { t: 'T1', x: 2, y: 1 } },
                            compiti: {}, log: [], esito: null, ...o });

// --- la fase pesca il numero giusto di carte per la taglia
{
  const rng = creaRng(11);
  const sp = base({ mazzo: null });
  sp.mazzo = (await import('./motore/regole.js')).costruisciMazzo(rng, carte, ep1, 'ep1');
  const out = m.faseMinaccia(G(sp), rng);
  const pescate = out.eventi.filter((e) => e.tipo === 'carta').length;
  const attese = (await import('./motore/regole.js')).carteDaPescare(comune, 2, 3, false, 'ep1');
  ok(pescate >= 1, 'la fase Minaccia pesca almeno una carta');
  ok(pescate === attese || out.pendenza,
     `pesca ${attese} carte per una taglia di 2 (viste ${pescate}), salvo fermarsi su un'insidia`);
}

// --- riproducibilita': stesso seme, stessa fase
{
  const uno = (seme) => {
    const rng = creaRng(seme); const sp = base();
    sp.mazzo = null;
    return JSON.stringify(m.faseMinaccia(G(sp), rng).eventi.map((e) => e.tipo));
  };
  ok(uno(4) === uno(4), 'stesso seme, stessa fase Minaccia');
}

// --- l'insidia ferma la fase invece di sospendere una promise
{
  // si costruisce un mazzo di una carta sola, che richiede una prova
  const rng = creaRng(3);
  const sp = base({ mazzo: { pool: ['finta'], ordine: [0], indice: 0, scarti: [] } });
  const g = G(sp);
  g.carte = { minacce: { ep1: [{ title: 'finta', file: 'x/y', rules: 'Ogni eroe: NERVI (Media) o 1 danno.' }] } };
  const out = m.faseMinaccia(g, rng);
  ok(out.pendenza, 'una carta con prova lascia una pendenza');
  ok(out.pendenza.tipo === 'insidia', 'di tipo insidia');
  ok(out.pendenza.opzioni.length === 2, 'con i due eroi in piedi come bersagli');
}

// --- il boss si desta alla soglia, una volta sola
{
  const rng = creaRng(9);
  const sp = base({ canto: 3, rivelate: ['T1', 'T2'] });
  const g = G(sp);
  const a = m.destaBossSeSoglia(g, rng);
  const b = m.destaBossSeSoglia(g, rng);
  ok(a.length === 0 || b.length === 0, 'il boss non si desta due volte');
}

// --- il tetto ai segnalini e' fisico: 8 in scatola
{
  const rng = creaRng(1);
  const sp = base({ canto: 99 });
  m.faseMinaccia(G(sp), rng);
  ok(sp.canto <= Math.max(8, ep1.canto_max ?? 8), 'il Canto non sfonda il tetto');
}

// --- niente browser
{
  const src = readFileSync('webapp/motore/minaccia.js', 'utf8');
  for (const x of ['document', 'await messaggio', 'Math.random', 'render(']) {
    ok(!src.includes(x), `minaccia.js non deve contenere «${x}»`);
  }
}

console.log(ko === 0 ? 'TUTTO OK (minaccia)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire** — `ERR_MODULE_NOT_FOUND`.

- [ ] **Passo 3: estrarre**, convertendo `faseMinaccia` come descritto sopra.

- [ ] **Passo 4: adattare `digitale.js`**, che ora chiama il motore e mostra:

```js
async function faseMinaccia() {
  const out = minaccia.faseMinaccia(G(), rngPartita());
  for (const ev of out.eventi) {
    if (ev.tipo === 'carta') await messaggioCarta(ev.titolo, ev.carta, ev.annunci);
  }
  if (out.pendenza) await risolviPendenza(out.pendenza);
  salvaP(); render();
}
```

- [ ] **Passo 5: eseguire**

```bash
node webapp/test-motore-minaccia.mjs && node webapp/test-digitale-regressioni.mjs
node webapp/server.js & node webapp/misura-episodio.mjs ep2 5
```

Ep.2: ha lo spawn speciale del Contrassegno e un boss con soglia.
Atteso: `VALIDA`.

- [ ] **Passo 6: commit**

```bash
git add webapp/motore/minaccia.js webapp/test-motore-minaccia.mjs webapp/public/js/digitale.js
git commit -m "feat(motore): la fase Minaccia scrive l'attesa nello stato invece di sospendersi"
```

---

## Task 8: il turno dei nemici

**Files:**
- Create: `webapp/motore/nemici.js`, `webapp/test-motore-nemici.mjs`
- Modify: `webapp/public/js/digitale.js:2198-2436`

**Interfaces:**
- Produce:
  - `pianoNemici(g, rng) → piano[]` — da `:2272-2433`, la parte già pura
  - `risolviTurnoNemici(g, rng, piano) → eventi[]` — la risoluzione che oggi sta
    **dentro l'animazione** (`:2215-2238`), unita a `risolviRestoNemici`
    (`:2170-2196`) e al ramo schermo (`:2328-2364`)

Qui muore la triplicazione del danno (`:2360`, `:2234`, `:2190`): una sola
applicazione, tre riproduttori che diventano uno. Gli eventi prodotti:

```js
{ tipo: 'nemico-muove', idx, da, a }
{ tipo: 'nemico-attacca', idx, bersaglio, tiro: {d:[4,3], tot:7}, soglia, colpito: true }
{ tipo: 'danno', chi, quanto, salute }
{ tipo: 'eroe-a-terra', chi }
{ tipo: 'accecato-salta', idx }
```

I tiri fisici della modalità tavolo (`tiroNemico`, `:50-56`) entrano come
`comando.tiri: [[4,3], ...]`: se presenti, `risolviTurnoNemici` li consuma in
ordine invece di tirare col seme.

- [ ] **Passo 1: scrivere il test**

```js
// webapp/test-motore-nemici.mjs
// Il turno dei nemici: piano e risoluzione, senza animazione. Il danno era
// scritto tre volte (schermo, tavolo, salta-animazione) e le tre copie
// divergevano: qui c'e' una sola applicazione, e questo test la fissa.
import * as n from './motore/nemici.js';
import { creaRng } from './motore/rng.js';
import { readFileSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const comune = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const TESS = [{ id: 'T1', nome: 'Sala', exits: {}, arredi: [] }];
const ep = { tessere: TESS, cartella: 'Episodio 1' };
const sgherro = comune.nemici[0].nome;
const G = (sp) => ({ ep, comune, sp, partita: { party: ['ELENA FOSCO'] } });
const base = (o = {}) => ({ round: 2, rivelate: ['T1'], log: [],
  vite: { 'ELENA FOSCO': 6 }, eroiPos: { 'ELENA FOSCO': { t: 'T1', x: 1, y: 1 } },
  nemici: [{ nome: sgherro, pos: { t: 'T1', x: 1, y: 2 }, ferite: 0, max: 2 }],
  azioni: {}, storditi: {}, eroiFatti: [], esito: null, ...o });

// --- riproducibilita'
{
  const uno = () => {
    const rng = creaRng(31); const sp = base(); const g = G(sp);
    return JSON.stringify(n.risolviTurnoNemici(g, rng, n.pianoNemici(g, rng)));
  };
  ok(uno() === uno(), 'stesso seme, stesso turno nemici');
}

// --- il nemico adiacente attacca, e il danno arriva una volta sola
{
  const rng = creaRng(2); const sp = base(); const g = G(sp);
  const ev = n.risolviTurnoNemici(g, rng, n.pianoNemici(g, rng));
  const attacchi = ev.filter((e) => e.tipo === 'nemico-attacca');
  ok(attacchi.length === 1, `un nemico adiacente attacca una volta (visti ${attacchi.length})`);
  const danni = ev.filter((e) => e.tipo === 'danno');
  ok(danni.length === (attacchi[0].colpito ? 1 : 0),
     'un evento danno se e solo se il colpo e\' andato a segno');
  ok(sp.vite['ELENA FOSCO'] === 6 - danni.length, 'la salute scende esattamente del danno inflitto');
}

// --- i tiri fisici del tavolo sostituiscono il seme
{
  const rng = creaRng(2); const sp = base(); const g = G(sp);
  const ev = n.risolviTurnoNemici(g, rng, n.pianoNemici(g, rng), { tiri: [[6, 6]] });
  const a = ev.find((e) => e.tipo === 'nemico-attacca');
  ok(a && a.tiro.tot === 12, `col tiro dichiarato dal tavolo vale 12 (visto ${a && a.tiro.tot})`);
  ok(a.colpito, 'e un 12 colpisce');
}

// --- l'accecato salta il turno, e una volta sola
{
  const rng = creaRng(2);
  const sp = base(); sp.nemici[0].flash = true;
  const g = G(sp);
  const ev = n.risolviTurnoNemici(g, rng, n.pianoNemici(g, rng));
  ok(ev.some((e) => e.tipo === 'accecato-salta'), 'il nemico accecato salta');
  ok(!ev.some((e) => e.tipo === 'nemico-attacca'), 'e non attacca');
  ok(!sp.nemici[0].flash, 'il flash si consuma');
}

// --- un eroe a 1 va a terra, non sotto zero
{
  const rng = creaRng(2);
  const sp = base({ vite: { 'ELENA FOSCO': 1 } });
  const g = G(sp);
  n.risolviTurnoNemici(g, rng, n.pianoNemici(g, rng), { tiri: [[6, 6]] });
  ok(sp.vite['ELENA FOSCO'] === 0, `la salute si ferma a 0 (vista ${sp.vite['ELENA FOSCO']})`);
}

// --- niente animazione nel motore
{
  const src = readFileSync('webapp/motore/nemici.js', 'utf8');
  for (const x of ['pausa(', 'setTimeout', 'document', 'innerHTML', 'Math.random']) {
    ok(!src.includes(x), `nemici.js non deve contenere «${x}»`);
  }
}

console.log(ko === 0 ? 'TUTTO OK (nemici)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire** — `ERR_MODULE_NOT_FOUND`.

- [ ] **Passo 3: estrarre**, unificando le tre applicazioni del danno in una.

- [ ] **Passo 4: eseguire, e qui il pilota conta davvero**

```bash
node webapp/test-motore-nemici.mjs && node webapp/test-digitale-regressioni.mjs
node webapp/server.js &
node webapp/misura-episodio.mjs ep1 10 && node webapp/misura-episodio.mjs ep7 10
```

Ep.7 è quello a ~30% by-design: se qui il win% si muove tanto, la risoluzione
del combattimento è cambiata. Confrontare con `webapp/BASELINE-20260812.md`.

Atteso: entrambe `VALIDA`, win% dentro ±15 punti della baseline a N=10.

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/nemici.js webapp/test-motore-nemici.mjs webapp/public/js/digitale.js
git commit -m "refactor(motore): il turno nemici si risolve una volta sola, e poi si anima"
```

---

## Task 9: il contratto — `applica`, gli eventi, la pendenza

Il cuore della fase. Fin qui si è spostato codice; da qui cambia la forma.

**Files:**
- Create: `webapp/motore/comandi.js`, `webapp/test-motore-comandi.mjs`

**Interfaces:**
- Produce:

```js
applica(stato, comando, dati) → { stato, eventi, pendenza, rifiuto }
```

dove:
- `stato` è la partita intera (`store.js:36-71`) più `stato.rng` e
  `stato.pendenza`;
- `dati` è `{ ep, comune, carte }`, immutabile;
- `eventi` è il copione per la vista;
- `rifiuto` è `{ motivo }` quando il comando è illegale — al posto dei dodici
  `flash()` di `digitale.js` (`:725, 736, 741, 746, 1632-1635, 1680, 1718,
  1722, 1843, 1844, 1851, 1862`).

Comandi di questa fase:

| comando | campi | da |
|---|---|---|
| `inizia` | `seme` | `iniziaPartita` `:322-354` |
| `muovi` | `eroe`, `nodo`, `rivela?` | `muoviEroe` `:1558-1582` |
| `attacca` | `eroe`, `bersaglio` | `attaccaNemico` `:1630-1676` |
| `cerca` | `eroe` | `azioneCercare` `:1678-1702` |
| `interagisci` | `eroe`, `scelta?` | `azioneInteragire` `:1712-1808` |
| `abilita` | `eroe`, `scelta?`, `cella?` | `usaAbilita` `:722-772` |
| `oggetto` | `eroe`, `quale`, `bersaglio?` | `usaOggetto` `:1841-1873` |
| `rianima` | `eroe`, `chi` | `azioneRianima` `:1809-1835` |
| `finisci-eroe` | `eroe` | `finisciEroe` `:1553-1556` |
| `muovi-scortato` | `indice`, `nodo` | `muoviScortato` `:1587-1616` |
| `fase-minaccia` | `tiri?` | `faseMinaccia` `:2007-2054` |
| `fase-nemici` | `tiri?` | `faseNemiciAI` `:2272-2436` |
| `rispondi` | `scelta` | scioglie `stato.pendenza` |

**La regola della pendenza:** finché `stato.pendenza` è valorizzata, `applica`
rifiuta ogni comando che non sia `rispondi` proveniente dal posto indicato in
`pendenza.a`. È l'unico meccanismo di sospensione del motore, e sostituisce
diciannove `await` nascosti nelle catene di promise.

**La regola dei tiri:** se `comando.tiri` è presente, il motore li consuma in
ordine invece di tirare col seme. Serve alla modalità tavolo, dove i dadi sono
di legno. Un comando con più tiri di quelli che servono è un rifiuto, non un
avanzo silenzioso.

- [ ] **Passo 1: scrivere il test del contratto**

```js
// webapp/test-motore-comandi.mjs
// Il contratto: comando dentro, stato + eventi fuori. Nessuna sospensione che
// non sia scritta in stato.pendenza.
import { applica } from './motore/comandi.js';
import { readFileSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const DATI = {
  ep: JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8')),
  comune: JSON.parse(readFileSync('webapp/data/comune.json', 'utf8')),
  carte: JSON.parse(readFileSync('webapp/data/carte.json', 'utf8')),
};
const PARTY = ['ELENA FOSCO', 'OTTONE BRERA'];
const avvia = (seme = 100) => applica(
  { v: 1, episodio: 'ep1', modo: 'digitale', party: PARTY, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati' },
    spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null } },
  { tipo: 'inizia', seme }, DATI);

// --- determinismo: stesso seme, stessa partita
{
  const a = avvia(7), b = avvia(7);
  ok(JSON.stringify(a.stato) === JSON.stringify(b.stato), 'stesso seme, stato iniziale identico');
  const c = avvia(8);
  ok(JSON.stringify(c.stato) !== JSON.stringify(a.stato), 'semi diversi, partite diverse');
}

// --- il motore non muta l'ingresso
{
  const prima = { v: 1, episodio: 'ep1', modo: 'digitale', party: PARTY, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true }, vantaggi: { tier: 'preparati' },
    spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null } };
  const copia = JSON.stringify(prima);
  applica(prima, { tipo: 'inizia', seme: 3 }, DATI);
  ok(JSON.stringify(prima) === copia, 'applica() non muta lo stato che riceve');
}

// --- un comando illegale e' un rifiuto, non un'eccezione e non un no-op muto
{
  const { stato } = avvia();
  const out = applica(stato, { tipo: 'attacca', eroe: PARTY[0], bersaglio: 99 }, DATI);
  ok(out.rifiuto, 'attaccare un bersaglio inesistente e\' un rifiuto');
  ok(typeof out.rifiuto.motivo === 'string' && out.rifiuto.motivo.length > 3,
     'col motivo in chiaro, che e\' quello che la vista mostrava col flash');
  ok(JSON.stringify(out.stato) === JSON.stringify(stato), 'e lo stato non si muove');
}

// --- un eroe che non e' nel party non gioca
{
  const { stato } = avvia();
  const out = applica(stato, { tipo: 'cerca', eroe: 'NESSUNO' }, DATI);
  ok(out.rifiuto, 'un eroe fuori dal party e\' rifiutato');
}

// --- la pendenza blocca tutto tranne la risposta
{
  let { stato } = avvia(4);
  // si pesca finche' non esce un'insidia (il mazzo dell'Ep.1 ne ha)
  let out = null;
  for (let i = 0; i < 40 && !(out && out.pendenza); i++) {
    out = applica(stato, { tipo: 'fase-minaccia' }, DATI); stato = out.stato;
    if (!out.pendenza) { out = applica(stato, { tipo: 'fase-nemici' }, DATI); stato = out.stato; }
  }
  if (!out || !out.pendenza) { console.log('  (nessuna insidia in 40 round: controllo saltato)'); }
  else {
    const bloccato = applica(stato, { tipo: 'muovi', eroe: PARTY[0], nodo: { t: 'T1', x: 0, y: 0 } }, DATI);
    ok(bloccato.rifiuto, 'con una pendenza aperta, muovere e\' rifiutato');
    const sciolto = applica(stato, { tipo: 'rispondi', scelta: out.pendenza.opzioni[0] }, DATI);
    ok(!sciolto.rifiuto, 'rispondere e\' ammesso');
    ok(!sciolto.stato.pendenza, 'e la pendenza si chiude');
  }
}

// --- i tiri dichiarati dal tavolo sostituiscono il seme
{
  const { stato } = avvia();
  const a = applica(stato, { tipo: 'fase-nemici', tiri: [[6, 6], [6, 6], [6, 6], [6, 6]] }, DATI);
  const b = applica(stato, { tipo: 'fase-nemici', tiri: [[1, 1], [1, 1], [1, 1], [1, 1]] }, DATI);
  ok(JSON.stringify(a.eventi) !== JSON.stringify(b.eventi),
     'tiri diversi dichiarati al tavolo danno esiti diversi');
}

// --- ogni evento e' serializzabile: passera' da un WebSocket
{
  const { stato } = avvia();
  const out = applica(stato, { tipo: 'fase-minaccia' }, DATI);
  for (const ev of out.eventi) {
    ok(JSON.stringify(ev) !== undefined && ev.tipo, `evento serializzabile e tipizzato: ${JSON.stringify(ev).slice(0, 80)}`);
  }
}

// --- il motore resta puro
{
  const src = readFileSync('webapp/motore/comandi.js', 'utf8');
  for (const x of ['document', 'window', 'localStorage', 'Math.random', 'await scegli', 'await tiraProva', 'render(']) {
    ok(!src.includes(x), `comandi.js non deve contenere «${x}»`);
  }
}

console.log(ko === 0 ? 'TUTTO OK (comandi)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire** — `ERR_MODULE_NOT_FOUND`.

- [ ] **Passo 3: scrivere lo scheletro**

```js
// webapp/motore/comandi.js
// LA PORTA D'INGRESSO DEL MOTORE. Un comando entra, uno stato nuovo e un
// copione di eventi escono. Nient'altro tocca lo stato di spedizione.
//
// Perche' i comandi sono COMPLETI: le regole di digitale.js si fermavano a
// meta' per chiedere («curare chi?», «tira il dado»), e una regola che si
// sospende non si puo' spedire su una rete ne' rigiocare. Qui il client chiede
// PRIMA (i candidati si calcolano dallo stato) e manda un comando che il motore
// esegue fino in fondo.
//
// Le sole scelte che restano davvero in mezzo — quelle che pretendono di vedere
// l'esito prima di scegliere: il Colpo da macello di Ottone, il bersaglio di
// un'insidia appena pescata — passano da `stato.pendenza`, che e' UNA e sta
// scritta nello stato. Chi ricarica la pagina se la ritrova; una promise
// interrotta, no.
import { creaRng } from './rng.js';

const clona = (x) => JSON.parse(JSON.stringify(x));
const rifiuta = (stato, motivo) => ({ stato, eventi: [], pendenza: stato.pendenza || null, rifiuto: { motivo } });

// Il portafoglio dei tiri: col seme quando si gioca a schermo, coi numeri
// dichiarati dal tavolo quando i dadi sono di legno. Chi risolve non sa quale
// dei due sta usando, ed e' il punto.
function creaDadi(rng, tiri) {
  let i = 0;
  return {
    tira2d6() {
      if (tiri && i < tiri.length) { const d = tiri[i++]; return { d, tot: d[0] + d[1] }; }
      if (tiri) throw new Error('tiri dichiarati insufficienti');
      return require2d6(rng);
    },
    avanzati: () => i,
  };
}

const GESTORI = {
  // riempito nei Task 10-12: un gestore per comando, ognuno
  //   (g, cmd, dadi) => { eventi, pendenza? } | { rifiuto }
};

export function applica(statoIn, comando, dati) {
  const stato = clona(statoIn);
  const g = { ep: dati.ep, comune: dati.comune, carte: dati.carte,
              sp: stato.spedizione, partita: stato, _layout: null };

  if (stato.pendenza && comando.tipo !== 'rispondi') {
    return rifiuta(stato, `C'è una scelta in sospeso: ${stato.pendenza.tipo}.`);
  }
  if (comando.eroe && !stato.party.includes(comando.eroe)) {
    return rifiuta(stato, `${comando.eroe} non è in questa squadra.`);
  }
  const gestore = GESTORI[comando.tipo];
  if (!gestore) return rifiuta(stato, `Comando sconosciuto: ${comando.tipo}.`);

  const rng = stato.rng || (stato.rng = creaRng(comando.seme ?? 1));
  const dadi = creaDadi(rng, comando.tiri);
  let out;
  try { out = gestore(g, comando, dadi); }
  catch (e) { return rifiuta(statoIn, e.message); }
  if (out.rifiuto) return rifiuta(statoIn, out.rifiuto);

  stato.pendenza = out.pendenza || null;
  stato.aggiornato = comando.quando ?? stato.aggiornato;
  return { stato, eventi: out.eventi || [], pendenza: stato.pendenza, rifiuto: null };
}
```

I gestori arrivano nei task seguenti; qui basta che `inizia`,
`fase-minaccia` e `fase-nemici` siano collegati ai moduli già estratti,
perché il test del contratto li usa.

- [ ] **Passo 4: eseguire**

Run: `node webapp/test-motore-comandi.mjs`
Atteso: `TUTTO OK (comandi)`.

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/comandi.js webapp/test-motore-comandi.mjs
git commit -m "feat(motore): la porta d'ingresso — comandi completi, eventi, una sola pendenza"
```

---

## Task 10: le azioni dell'eroe che non chiedono niente

**Files:**
- Create: `webapp/test-motore-azioni.mjs`
- Modify: `webapp/motore/comandi.js`, `webapp/public/js/digitale.js:1553-1582`, `:1678-1702`, `:1809-1835`, `:1184-1195`

**Interfaces:**
- Produce, dentro `GESTORI`: `muovi`, `cerca`, `rianima`, `finisci-eroe`.
- Produce, esportata per il replay: `segnaAzione(g, nome, tipo) → eventi[]` —
  da `:1184-1195`, senza `render()` e senza `salvaP()`, ma **con** la chiamata a
  `controllaVittoria` che oggi sta a `:1193`.

Conversioni puntuali:
- `muoviEroe` (`:1558-1582`): l'`await messaggioProva` dell'insidia d'ingresso
  (`:1579`) diventa un evento `{tipo:'insidia-ingresso', tessera, prova}` più
  una `pendenza` se la prova ha bisogno di un bersaglio; con un solo eroe in
  movimento il bersaglio è lui, quindi il motore la risolve subito e produce
  `{tipo:'prova', chi, tiro, superata}`.
- `azioneCercare` (`:1678-1702`): `await tiraProva` (`:1683`) diventa
  `dadi.tira2d6()`; l'`await messaggioProva` finale (`:1700`) diventa gli eventi
  `{tipo:'cercato', tessera, esito, trovato?}`.
- I due `flash` di `:1680` e le guardie di `azioneRianima` diventano `rifiuto`.

- [ ] **Passo 1: scrivere il test**

```js
// webapp/test-motore-azioni.mjs
// Le azioni che il motore risolve senza chiedere niente a nessuno.
import { applica } from './motore/comandi.js';
import { readFileSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const DATI = {
  ep: JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8')),
  comune: JSON.parse(readFileSync('webapp/data/comune.json', 'utf8')),
  carte: JSON.parse(readFileSync('webapp/data/carte.json', 'utf8')),
};
const PARTY = ['ELENA FOSCO', 'OTTONE BRERA'];
const avvia = (seme = 100) => applica(
  { v: 1, episodio: 'ep1', modo: 'digitale', party: PARTY, fase: 'spedizione',
    indagine: { oggetti: [], caricheUsate: {}, chiusa: true }, vantaggi: { tier: 'preparati' },
    spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null } },
  { tipo: 'inizia', seme }, DATI).stato;

// --- muovere: la pedina si sposta e l'azione si segna
{
  const s = avvia();
  const da = s.spedizione.eroiPos[PARTY[0]];
  const out = applica(s, { tipo: 'muovi', eroe: PARTY[0], nodo: { t: da.t, x: da.x, y: (da.y + 1) % 4 } }, DATI);
  ok(!out.rifiuto, `muovere di una casella e' ammesso (${out.rifiuto && out.rifiuto.motivo})`);
  ok((out.stato.spedizione.azioni[PARTY[0]] || []).includes('muovere'), 'e l\'azione risulta spesa');
}

// --- due azioni dello stesso tipo non si possono
{
  let s = avvia();
  const p = () => s.spedizione.eroiPos[PARTY[0]];
  let out = applica(s, { tipo: 'muovi', eroe: PARTY[0], nodo: { t: p().t, x: p().x, y: (p().y + 1) % 4 } }, DATI);
  s = out.stato;
  out = applica(s, { tipo: 'muovi', eroe: PARTY[0], nodo: { t: p().t, x: (p().x + 1) % 4, y: p().y } }, DATI);
  ok(out.rifiuto, 'le due azioni del turno devono essere di tipo diverso');
}

// --- muovere in una casella irraggiungibile e' rifiutato
{
  const s = avvia();
  const out = applica(s, { tipo: 'muovi', eroe: PARTY[0], nodo: { t: 'T6', x: 0, y: 0 } }, DATI);
  ok(out.rifiuto, 'una tessera lontana e non rivelata non e\' raggiungibile');
}

// --- cercare: due volte nella stessa stanza, no
{
  let s = avvia();
  let out = applica(s, { tipo: 'cerca', eroe: PARTY[0] }, DATI);
  ok(!out.rifiuto, 'cercare la prima volta e\' ammesso');
  ok(out.eventi.some((e) => e.tipo === 'cercato'), 'e produce l\'evento del ritrovamento');
  ok(out.eventi.some((e) => e.tipo === 'tiro'), 'con il tiro in chiaro, che la vista animera\'');
  s = out.stato;
  out = applica(s, { tipo: 'cerca', eroe: PARTY[1] }, DATI);
  ok(out.rifiuto, 'nella stessa stanza non si cerca due volte');
}

// --- cercare e' riproducibile
{
  const a = applica(avvia(55), { tipo: 'cerca', eroe: PARTY[0] }, DATI);
  const b = applica(avvia(55), { tipo: 'cerca', eroe: PARTY[0] }, DATI);
  ok(JSON.stringify(a.eventi) === JSON.stringify(b.eventi), 'stesso seme, stessa ricerca');
}

// --- rianimare chi non e' a terra e' un rifiuto
{
  const s = avvia();
  const out = applica(s, { tipo: 'rianima', eroe: PARTY[0], chi: PARTY[1] }, DATI);
  ok(out.rifiuto, 'non si rianima chi e\' in piedi');
}

// --- finito il turno, l'eroe non agisce piu'
{
  let s = avvia();
  s = applica(s, { tipo: 'finisci-eroe', eroe: PARTY[0] }, DATI).stato;
  ok(s.spedizione.eroiFatti.includes(PARTY[0]), 'l\'eroe risulta fatto');
  const out = applica(s, { tipo: 'cerca', eroe: PARTY[0] }, DATI);
  ok(out.rifiuto, 'e non puo\' piu\' agire in questo round');
}

console.log(ko === 0 ? 'TUTTO OK (azioni)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire** — i gestori non esistono ancora.

- [ ] **Passo 3: scrivere i quattro gestori** e far delegare `digitale.js`.

- [ ] **Passo 4: eseguire**

```bash
node webapp/test-motore-azioni.mjs && node webapp/test-motore-comandi.mjs \
  && node webapp/test-digitale-regressioni.mjs
node webapp/server.js & node webapp/misura-episodio.mjs ep1 5
```

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/comandi.js webapp/test-motore-azioni.mjs webapp/public/js/digitale.js
git commit -m "feat(motore): muovere, cercare, rianimare passano dai comandi completi"
```

---

## Task 11: attaccare, e l'unica pendenza reattiva del turno eroe

**Files:**
- Create: `webapp/test-motore-attacco.mjs`
- Modify: `webapp/motore/comandi.js`, `webapp/public/js/digitale.js:1630-1676`

**Interfaces:**
- Produce, in `GESTORI`: `attacca`.

`attaccaNemico` è la funzione mista più delicata perché contiene **l'unica
scelta genuinamente reattiva del turno eroe**: il Colpo da macello di Ottone
(`:1660-1670`), che si può fare solo dopo aver visto un nemico cadere. Diventa:

1. il comando `attacca` risolve il colpo per intero;
2. se chi ha colpito è Ottone, il nemico è caduto, `sp.macello !== sp.round`, e
   restano nemici adiacenti in piedi, il gestore restituisce
   `pendenza = { a: eroe, tipo: 'macello', opzioni: [indici] }`;
3. se il candidato è **uno solo**, il motore non chiede: lo risolve e basta,
   com'è oggi (`:1664`);
4. `rispondi` con `scelta = null` rinuncia, e la carica non si consuma (`:1667`).

Le quattro guardie di `:1632-1635` diventano quattro `rifiuto` con lo stesso
testo di oggi, parola per parola.

- [ ] **Passo 1: scrivere il test**

```js
// webapp/test-motore-attacco.mjs
// L'attacco, e il Colpo da macello di Ottone — la sola scelta del turno eroe
// che pretende di vedere l'esito prima di decidere, quindi la sola che passa
// da stato.pendenza.
import { applica } from './motore/comandi.js';
import { readFileSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const DATI = {
  ep: JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8')),
  comune: JSON.parse(readFileSync('webapp/data/comune.json', 'utf8')),
  carte: JSON.parse(readFileSync('webapp/data/carte.json', 'utf8')),
};
const OTTONE = DATI.comune.eroi.find((e) => e.nome.includes('OTTONE')).nome;
const ELENA = DATI.comune.eroi.find((e) => e.nome.includes('ELENA')).nome;
const SGH = DATI.comune.nemici[0].nome;

// Stato seminato a mano: due sgherri a un passo da Ottone, entrambi a una
// ferita dalla fine, cosi' il primo colpo ne abbatte uno di sicuro.
function scena(over = {}) {
  const s = applica(
    { v: 1, episodio: 'ep1', modo: 'digitale', party: [OTTONE, ELENA], fase: 'spedizione',
      indagine: { oggetti: [], caricheUsate: {}, chiusa: true }, vantaggi: { tier: 'preparati' },
      spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null } },
    { tipo: 'inizia', seme: 1 }, DATI).stato;
  const p = s.spedizione.eroiPos[OTTONE];
  s.spedizione.nemici = [
    { nome: SGH, pos: { t: p.t, x: p.x, y: (p.y + 1) % 4 }, ferite: 1, max: 2 },
    { nome: SGH, pos: { t: p.t, x: (p.x + 1) % 4, y: p.y }, ferite: 1, max: 2 },
  ];
  s.spedizione.azioni = {};
  Object.assign(s.spedizione, over);
  return s;
}

// --- un tiro alto abbatte, e con due adiacenti si apre la pendenza del macello
{
  const out = applica(scena(), { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(!out.rifiuto, `attaccare un adiacente e' ammesso (${out.rifiuto && out.rifiuto.motivo})`);
  ok(out.eventi.some((e) => e.tipo === 'abbattuto'), 'il nemico a una ferita dalla fine cade');
  ok(out.pendenza && out.pendenza.tipo === 'macello',
     `col secondo adiacente in piedi si apre il Colpo da macello (vista ${out.pendenza && out.pendenza.tipo})`);
  ok(out.pendenza.a === OTTONE, 'e la scelta e\' di Ottone');
}

// --- rinunciare non consuma il colpo
{
  const s0 = scena();
  const uno = applica(s0, { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  const due = applica(uno.stato, { tipo: 'rispondi', scelta: null }, DATI);
  ok(!due.stato.pendenza, 'rinunciando la pendenza si chiude');
  ok(due.stato.spedizione.macello !== due.stato.spedizione.round,
     'e il Colpo da macello resta disponibile: chi annulla non lo spende');
}

// --- con UN solo adiacente il motore non chiede
{
  const s = scena();
  s.spedizione.nemici = [s.spedizione.nemici[0]];
  const out = applica(s, { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(!out.pendenza, 'senza un secondo bersaglio non c\'e\' niente da chiedere');
}

// --- chi non e' Ottone non ha il macello
{
  const s = scena();
  const p = s.spedizione.eroiPos[ELENA];
  s.spedizione.nemici = [{ nome: SGH, pos: { t: p.t, x: p.x, y: (p.y + 1) % 4 }, ferite: 1, max: 2 },
                         { nome: SGH, pos: { t: p.t, x: (p.x + 1) % 4, y: p.y }, ferite: 1, max: 2 }];
  const out = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(!out.pendenza, 'il Colpo da macello e\' di Ottone e di nessun altro');
}

// --- le quattro guardie, parola per parola come i flash di prima
{
  const s = scena();
  const lontano = applica(s, { tipo: 'attacca', eroe: ELENA, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(lontano.rifiuto && /adiacente/i.test(lontano.rifiuto.motivo),
     `chi e' lontano non attacca (${lontano.rifiuto && lontano.rifiuto.motivo})`);

  const giaAterra = scena();
  giaAterra.spedizione.nemici[0].abbattuto = true;
  const out2 = applica(giaAterra, { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(out2.rifiuto && /a terra|prendere/i.test(out2.rifiuto.motivo),
     'un nemico gia\' a terra va preso, non colpito');

  const giaMosso = scena({ azioni: { [OTTONE]: ['attaccare'] } });
  const out3 = applica(giaMosso, { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  ok(out3.rifiuto && /tipo diverso|gi(à|a) attaccato/i.test(out3.rifiuto.motivo),
     'le 2 azioni sono di tipo diverso');
}

// --- il bersaglio di un compito resta in campo, a terra
{
  const s = scena();
  s.spedizione.nemici[0].nome = 'IL CORRIERE';
  DATI.ep.compiti = [{ id: 'preso', nemico: 'IL CORRIERE', quante: 1 }];
  const out = applica(s, { tipo: 'attacca', eroe: OTTONE, bersaglio: 0, tiri: [[6, 6]] }, DATI);
  const n = out.stato.spedizione.nemici.find((x) => x.nome === 'IL CORRIERE');
  ok(n && n.abbattuto, 'il bersaglio di un compito resta in campo, a terra, per poter essere preso');
  delete DATI.ep.compiti;
}

console.log(ko === 0 ? 'TUTTO OK (attacco)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
```

- [ ] **Passo 2: eseguirlo e vederlo fallire.**

- [ ] **Passo 3: scrivere il gestore `attacca`** e far delegare `digitale.js`,
che tiene solo l'animazione (`dmgPop`, `evidenziaColpito`) e la resa della
pendenza come overlay `scegli`.

- [ ] **Passo 4: eseguire**

```bash
node webapp/test-motore-attacco.mjs && node webapp/test-digitale-regressioni.mjs
node webapp/server.js & PARTY=Ottone,Elena,Attilio,Sibilla node webapp/misura-episodio.mjs ep1 10
```

`PARTY` con Ottone: il Colpo da macello si esercita solo se lui è in campo.
Atteso: `VALIDA`, e nel log almeno un «colpo da macello».

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/comandi.js webapp/test-motore-attacco.mjs webapp/public/js/digitale.js
git commit -m "feat(motore): l'attacco, e il Colpo da macello come unica pendenza del turno eroe"
```

---

## Task 12: abilità, oggetti, interazioni

Le tre funzioni con più `await scegli` dentro, e tutte e tre **pre-dichiarabili**:
i candidati si calcolano dallo stato, quindi il client li mostra prima e manda
un comando già completo. Nessuna nuova pendenza.

**Files:**
- Create: `webapp/test-motore-abilita.mjs`
- Modify: `webapp/motore/comandi.js`, `webapp/public/js/digitale.js:722-772`, `:1712-1808`, `:1841-1873`, `:887-940`

**Interfaces:**
- Produce, in `GESTORI`: `abilita`, `oggetto`, `interagisci`.
- Produce, per il client che deve mostrare le opzioni:
  - `candidatiAbilita(g, nome) → { eff, opzioni: [{id,label}] } | null`
  - `interazioniDi(g, nome) → [{tipo, dir?, id, label}]` — da
    `interazioneDisponibile` (`:887-940`), **separando la legalità
    dall'etichetta**: il motore restituisce `tipo` e `id`, la vista compone la
    frase. Oggi sono lo stesso oggetto (`:888-913`) e per questo la regola non
    si poteva spedire.

Conversione delle sei `scegli` di `usaAbilita`:

| riga | scelta | diventa |
|---|---|---|
| `:731` | curare chi | `comando.scelta = nomeEroe` |
| `:737` | flash su chi | `comando.scelta = indiceNemico` |
| `:742` | malacarne chi | `comando.scelta = indiceNemico` |
| `:752` | scruta quale | `comando.scelta = '0' \| '1' \| 'skip'` |
| `:765` | esca, dove | `comando.cella = nodo` — l'`escaModo` a due tempi sparisce |

L'esca merita una nota: oggi `:762-767` mette `sp.escaModo`, salva, ridisegna e
**esce dalla regola**, che riprende quando il giocatore tocca una casella. Con
il comando completo il giocatore sceglie la casella prima, e `escaModo` non
serve più. Il pilota lo sa fare già (`misura-episodio.mjs:376-387`): va
aggiornato di conseguenza nel Task 15.

- [ ] **Passo 1: scrivere il test**

Coprire, per ciascuna delle otto abilità di `CARICHE_SPED` (`:674-685`): che la
carica si consuma **una sola volta**, che un comando senza `scelta` quando la
scelta serve è un `rifiuto`, che l'effetto sullo stato è quello di oggi. Il
riferimento per i valori attesi è `webapp/test-abilita.mjs`, che va tenuto
verde in parallelo.

Un controllo che deve esserci, perché è il difetto storico di queste due
abilità (`test-digitale.mjs:318-322`, `AUDIT-CLASSI.md`):

```js
// La Voce Ferma di Serra e l'Esca di Carbone sono state per mesi «carica spesa,
// effetto narrato». Questi due controlli esistono perche' non tornino prosa.
{
  const out = applica(scenaConSerra(), { tipo: 'abilita', eroe: SERRA }, DATI);
  ok(out.stato.spedizione.voceFerma, 'la Voce Ferma lascia un segno nello stato');
  ok(out.stato.spedizione.abilita[SERRA] === 1, 'e consuma esattamente una carica');
}
{
  const s = scenaConCarbone();
  const senza = applica(s, { tipo: 'abilita', eroe: CARBONE }, DATI);
  ok(senza.rifiuto, 'l\'Esca senza una casella dichiarata e\' un rifiuto, non un mezzo turno');
  const con = applica(s, { tipo: 'abilita', eroe: CARBONE, cella: cellaEntro3(s) }, DATI);
  ok(con.stato.spedizione.nemici.some((n) => n.verso), 'l\'Esca sposta davvero qualcuno');
  ok(!('escaModo' in con.stato.spedizione), 'e il modo a due tempi non serve piu\'');
}
```

- [ ] **Passo 2: eseguirlo e vederlo fallire.**

- [ ] **Passo 3: scrivere i tre gestori.**

- [ ] **Passo 4: eseguire**

```bash
node webapp/test-motore-abilita.mjs && node webapp/test-abilita.mjs \
  && node webapp/test-digitale-regressioni.mjs
node webapp/server.js & node webapp/misura-episodio.mjs ep20 8
```

Ep.20: è quello col Controcanto, il Ritmo e la Pressione, cioè dove
`azioneInteragire` fa più lavoro.

- [ ] **Passo 5: commit**

```bash
git add webapp/motore/comandi.js webapp/test-motore-abilita.mjs webapp/public/js/digitale.js
git commit -m "feat(motore): abilita', oggetti e interazioni si dichiarano per intero prima di partire"
```

---

## Task 13: `digitale.js` diventa una vista

**Files:**
- Create: `webapp/public/js/replay.js`
- Modify: `webapp/public/js/digitale.js`

**Interfaces:**
- Produce: `riproduci(ctx, eventi) → Promise<void>` — consuma gli eventi
  nell'ordine e li anima, riusando `muoviToken` (`:2076-2078`), `scivolaEroe`
  (`:2086-2095`), `dmgPop` ed `evidenziaColpito` (`:2144-2153`), `flash`
  (`:2441-2445`).

A questo punto `digitale.js` non contiene più regole. Gli adattatori a `g`
implicito introdotti nel Task 2 spariscono: resta un solo punto di contatto,

```js
async function esegui(comando) {
  const out = applica(ctx.partita, comando, { ep: ctx.ep, comune: ctx.comune, carte: ctx.carte });
  if (out.rifiuto) { flash(out.rifiuto.motivo); return false; }
  ctx.partita = out.stato; salvaP();
  await riproduci(ctx, out.eventi);
  render();
  return true;
}
```

- [ ] **Passo 1: contare le righe di partenza**

```bash
wc -l webapp/public/js/digitale.js
```

Annotare il numero: serve al passo 4.

- [ ] **Passo 2: scrivere `replay.js`** spostandoci le funzioni di animazione
elencate sopra.

- [ ] **Passo 3: togliere da `digitale.js`** ogni funzione che non sia
`render`, `boardHtml`, gli `*Html`, `aggancia`, zoom/pan/immersivo, gli
overlay (`scegli`, `messaggio`, `messaggioCarta`, `messaggioProva`), `epilogo`
e `esegui`.

- [ ] **Passo 4: verificare che sia dimagrito**

```bash
wc -l webapp/public/js/digitale.js
grep -cE 'Math\.random|await tiraProva|await scegli' webapp/public/js/digitale.js
```

Atteso: intorno alle 900 righe (da ~2495), e **0** occorrenze del secondo
comando. Se `Math.random` compare ancora, una regola è rimasta indietro.

- [ ] **Passo 5: la prova vera**

```bash
node webapp/test-digitale.mjs && node webapp/test-digitale-regressioni.mjs \
  && node webapp/test-digitale-ui.mjs && node webapp/test-zoom.mjs
node webapp/server.js &
node webapp/misura-episodio.mjs ep1 10
MODO=tavolo node webapp/misura-episodio.mjs ep1 5
```

La corsa con `MODO=tavolo` è il controllo che i dadi fisici passino ancora: è
il ramo che il comando `tiri` ha sostituito.

Atteso: tutte e due `VALIDA`.

- [ ] **Passo 6: commit**

```bash
git add webapp/public/js/replay.js webapp/public/js/digitale.js
git commit -m "refactor(digitale): la plancia smette di conoscere le regole e si limita a mostrarle"
```

---

## Task 14: il pilota headless

**Files:**
- Create: `webapp/pilota-motore.mjs`

**Interfaces:**
- Consuma: `applica`, e le euristiche di `misura-episodio.mjs:50-203` e
  `:400-585`, che sono già pure e leggono solo lo stato.
- Produce: lo stesso formato d'uscita di `misura-episodio.mjs` — le righe
  `VITTORIE n/N = p%` e `VALIDA`/`NON VALIDA` — così `mappa-pilota.mjs`
  funziona senza modifiche.

Le euristiche si portano quasi tutte com'erano. Cambiano due cose:
- `celle()` leggeva `.cella-mossa` dal DOM: diventa `griglia.raggEroe(g, nome)`;
- `sciogli()` scioglieva overlay: diventa la risposta a `stato.pendenza`.

- [ ] **Passo 1: scrivere il pilota** riusando le funzioni `score`, `meta`,
`bersaglio`, `abilitaUtile`, `daCatturare`, `turnoEroe`, `turnoScortato` di
`misura-episodio.mjs`, con le due sostituzioni sopra.

- [ ] **Passo 2: confrontarlo col pilota vecchio sullo stesso episodio**

```bash
node webapp/server.js &
node webapp/misura-episodio.mjs ep1 20   # col browser
node webapp/pilota-motore.mjs ep1 20     # senza
```

Atteso: due win% **dentro ±15 punti** l'uno dall'altro a N=20, ed entrambe le
corse VALIDE. Non devono coincidere — sono due bot, non lo stesso bot — ma se
divergono di più c'è una regola che il motore applica diversamente, e va
trovata prima di andare avanti.

Annotare il tempo delle due corse: la seconda dovrebbe essere di un ordine di
grandezza più rapida.

- [ ] **Passo 3: commit**

```bash
git add webapp/pilota-motore.mjs
git commit -m "feat(pilota): misura il motore direttamente, senza passare dal browser"
```

---

## Task 15: il cancello

**Files:**
- Modify: `HANDOFF.md`
- Delete: `webapp/public/js/_oracolo.js`, `webapp/test-motore-griglia.mjs`,
  `webapp/test-motore-stat.mjs`

- [ ] **Passo 1: rimisurare la mappa intera**

```bash
node webapp/server.js &
node webapp/mappa-pilota.mjs 20 4 | tee webapp/MAPPA-DOPO-MOTORE.md
```

- [ ] **Passo 2: confrontare con la baseline**

Aprire `webapp/BASELINE-20260812.md` e `webapp/MAPPA-DOPO-MOTORE.md` affiancati.

**Il cancello passa se e solo se:**
- **nessuna corsa NON VALIDA** — questo è assoluto, non c'è banda di tolleranza;
- **nessun episodio si muove di oltre 20 punti** rispetto alla baseline;
- **la media degli scarti in valore assoluto sta sotto i 10 punti** — sopra, non
  è rumore: è una regola cambiata, anche se nessun singolo episodio salta
  all'occhio;
- **Ep.7 resta sotto il 45%**: è a ~30% by-design, ed è il canarino. Se sale, la
  risoluzione del combattimento si è ammorbidita.

Se il cancello non passa, **non ritarare niente**: la baseline è il gioco, il
motore nuovo deve riprodurla. Si cerca la regola che è cambiata, partendo dagli
episodi con lo scarto maggiore e usando `DIAG=1 node webapp/pilota-motore.mjs <ep> 1`.

- [ ] **Passo 3: togliere l'impalcatura**

```bash
rm webapp/public/js/_oracolo.js webapp/test-motore-griglia.mjs webapp/test-motore-stat.mjs
grep -rn '_oracolo' webapp/ --include=*.mjs --include=*.js
```

Atteso: nessun risultato. I differenziali hanno fatto il loro lavoro
durante l'estrazione e non servono a chi verrà dopo; i test di comportamento
(`test-motore-rng`, `-regole`, `-obiettivi`, `-vittoria`, `-minaccia`,
`-nemici`, `-comandi`, `-azioni`, `-attacco`, `-abilita`) restano.

- [ ] **Passo 4: la suite intera, una volta sola**

```bash
for t in rng regole obiettivi vittoria minaccia nemici comandi azioni attacco abilita; do
  node webapp/test-motore-$t.mjs || echo "FALLITO: $t"
done
for t in digitale digitale-regressioni digitale-ui engine abilita sync api zoom conferma; do
  node webapp/test-$t.mjs || echo "FALLITO: $t"
done
```

Atteso: nessuna riga `FALLITO:`.

- [ ] **Passo 5: aggiornare `HANDOFF.md`** con lo stato della Fase 1, la nuova
mappa e il fatto che la Fase 2 (`spedizione.js` sullo stesso motore) è la
prossima.

- [ ] **Passo 6: commit**

```bash
git add -A
git commit -m "test(motore): il cancello della Fase 1 — mappa rimisurata, impalcatura rimossa"
```

---

## Autoverifica del piano

**Copertura della spec.** `DESIGN-VISTA-EROE.md` Fase 1 chiede quattro cose:
motore puro estratto (Task 2-8), RNG seminata (Task 1, più l'innesto nel Task 9),
diciannove sospensioni convertite (Task 7 e 10-12, con `pendenza` definita nel
Task 9), `eventi[]` e `replay.js` (Task 9 e 13). Coperte tutte.

**Cosa questo piano NON fa, e va detto:**
- `indagine.js` non si tocca. Le sue ~120 righe di regole (economia delle ore,
  `UNA_TANTUM`, `provaConFiato`) restano dov'erano: la Fase 1 riguarda la
  Spedizione. `provaConFiato` e `provaConRitiro` restano due varianti della
  stessa regola fino alla Fase 2.
- `spedizione.js` non si tocca, e per tutta la Fase 1 **contiene una copia
  divergente delle regole appena estratte**. È voluto: unificarle è la Fase 2,
  e farlo qui raddoppierebbe la superficie di un refactoring già grosso.
- Il motore resta nel client. Il Durable Object è la Fase 4.

**Rischio maggiore:** il Task 13 tocca `digitale.js` in profondità e il suo
cancello è statistico, non esatto. Se il Task 15 fallisce, il sospetto va per
primo lì e poi al Task 8 (la risoluzione del combattimento), che è l'altro
punto dove tre implementazioni sono diventate una.
