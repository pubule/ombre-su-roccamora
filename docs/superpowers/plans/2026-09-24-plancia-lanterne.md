# La plancia «lanterne» per tutte le spedizioni — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** la Spedizione (tutti i 21 episodi, 127 tessere) diventa quella del mockup `5-spedizione.html`: al centro la plancia che compone ogni stanza coi pezzi di Forgotten Adventures sotto un buio che si apre solo dove arriva la luce (mockup «lanterne»), ai lati gli eroi e la notte a tre colonne, con tutte le informazioni per giocare.

**Architecture:** tre moduli nuovi e puri in `webapp/public/js/plancia/` (ambiente → cosa c'e' in una stanza; stanza → l'HTML della stanza; luce → il buio su canvas), un modulo di regole condiviso in `webapp/public/motore/ambiente.js` che anche il generatore delle tessere stampate usa, e un solo punto di innesto in `digitale.js` (`boardHtml` e il suo ciclo di vita). Gli asset passano da `webapp/vtt/` (fuori da git) a `webapp/assets/vtt/` con `export-assets.py`, come ogni altra immagine che va in produzione.

**La scenografia si scrive, non si genera.** I decori di ogni stanza (quali oggetti, dove, quali luci) non li inventa una regola: li compone chi esegue, stanza per stanza, seguendo **`docs/scenografia.md`** (principi, mood gotico, esempi dell'Ep.1, lista di controllo) e li scrive in `src/scenografia/<episodio>.json`, tracciato in git; `export-data.py` li unisce ai dati come campo `scena` di ogni tessera. La regola automatica (`ambiente-fa.js`) resta solo come ripiego per una stanza non ancora scritta, e come controllo.

**Tech Stack:** JS moduli ES nel browser senza bundler; Node 22 (`require()` di un modulo ES funziona senza flag) per il generatore; Python + Pillow per l'export; Playwright per le prove in pagina; `node webapp/server.js` (porta 8017) come server di prova.

**Spec:** non c'e' un documento di design separato. La specifica sono i mockup
`webapp/public/mockups/tessere-alt/5-spedizione.html` (l'HUD a tre colonne) e
`webapp/public/mockups/tessere-alt/1-lanterne.html` (la plancia; il codice
condiviso sta in `lanterne.js`, `mondo.js`, `mondo.css`,
`scripts/importa-fa-lanterne.py`), **piu'** le decisioni prese guardandoli col
committente il 24-25/09/2026, riportate qui sotto come vincoli. Chi esegue legge
i mockup: sono loro la specifica visiva («il mockup e' la specifica»).

**La prova della guida (25/09/2026):** `webapp/public/mockups/tessere-alt/6-scenografia.html` compone l'Ep.1 e l'Ep.11 (i tetti) dai dati veri con la guida applicata; le scenografie di prova stanno in `webapp/public/mockups/tessere-alt/scena/ep1.json` e `ep11.json` e **sono il punto di partenza dei Task 7 e 8** (si spostano in `src/scenografia/`). La prova ha corretto la guida e questo piano in cinque punti, gia' riportati sotto: i muri seguono `alAperto()` e non `fuoriDi()`; le porte aperte non si disegnano; l'arredo del posto; zero decori all'aperto quando il testo lo dice; niente in scena di quel che si trova cercando.

**Una differenza voluta dal mockup:** li' i pavimenti dell'Ep.1 erano scelti a
mano (corridoio delle candele = navata, scala = pietra). Qui vale la regola
condivisa con le tessere stampate, che da' corridoio = mattonelle e scala =
assi. Se al tavolo la navata del corridoio manca, si aggiunge `candel` alla riga
`navata` di `PAVIMENTI` — e cambia anche la tessera stampata, com'e' giusto.

## Riprendere dopo un limite di utilizzo

Questo piano e' lungo: probabile che l'esecuzione attraversi uno o piu' stop
per limite di utilizzo (quota), non solo di contesto. Non e' un problema — e'
il motivo per cui il piano e' scomposto in task piccoli che finiscono con un
commit:

- **Il lavoro non si perde.** I commit stanno in git, su disco, indipendenti
  dalla sessione di Claude e dai suoi limiti. Quando la quota si esaurisce, la
  sessione si ferma; i file restano esattamente com'erano.
- **Se il limite scatta a META' di un task**, prima del commit di quel task, le
  modifiche non salvate restano comunque sul disco (working tree): non
  spariscono, solo non sono ancora in git. Alla ripresa, `git status` dice
  cosa c'e' di non committato — si valuta se completarlo o azzerarlo con
  `git checkout -- <file>` e ripartire da capo quel singolo task (mai da capo
  il piano intero).
- **Per riprendere**, in ordine: (1) leggere `HANDOFF.md` per l'ultimo task
  completato e lo stato; (2) confermare con `git log --oneline -10`; (3)
  lanciare un subagente fresco sul task successivo (o proseguire quello a
  meta', dopo aver deciso cosa fare delle modifiche non committate).
- Per questo **ogni task chiude con un commit**, e per questo `HANDOFF.md` va
  aggiornato a ogni commit (vedi sotto): un limite di quota blocca il
  *quando* si lavora, mai *cosa* e' gia' stato fatto.

## Global Constraints

- **La guida di scenografia e' vincolante:** `docs/scenografia.md`. Ogni stanza si compone leggendo il suo testo, con un punto focale, luci che raccontano (≤ 4 fra i decori), periferia piena e centro libero, 5-9 decori al chiuso e 2-5 all'aperto, e il **mood del gioco: mistero gotico ottocentesco, l'orrore suggerito, mai splatter** (al massimo una traccia di sangue, piccola, per stanza). Ogni stanza ha la sua riga `perche`. Si legge la guida **prima** di comporre, non dopo.
- **Ogni stanza si guarda:** nessuna scenografia si committa senza averne visto la foto e spuntato la lista di controllo della guida.
- **Un solo branch, `main`.** Niente worktree, niente branch di lavoro. Commit dei soli file toccati, mai `git add -A`.
- **`HANDOFF.md` aggiornato a ogni commit** (cosa e' fatto, cosa manca, come si riprende): e' un lavoro lungo.
- **Regola dei nemici:** un nemico si vede solo se la sua tessera e' svelata — e da li' si vede sempre, luce o no. Niente occhi nel buio, niente nemici nascosti dalla luce.
- **Caselle di movimento:** quadrati arrotondati con bordo luminoso (turchese per muovere, oro per svelare), non pallini — `border-radius: 8px`, bordo 3px, 72% della casella.
- **Buio:** canvas a un quarto di risoluzione (`Q = 4`), `rgba(2,3,4,.95)`, luci bucate con `destination-out`; calore su un secondo canvas in `lighter`, opacita' CSS `.32`. Nessuna maschera SVG, nessuna animazione di `background-position` (sono le due cose che facevano scattare il telefono).
- **Cupo:** pavimenti `brightness(.46) saturate(.4) sepia(.25) hue-rotate(-8deg)`; raggi: lanterna `cell * (2.8 - canto * .11)`, torcia `1.9`, candela `1.3`, candele nere `.95` celle; vignetta ai bordi dello schermo.
- **Il pavimento lo dice il nome della stanza**, con la STESSA regola delle tessere stampate (`PAVIMENTI`/`FUORI_DI`): una sola fonte, non due copie.
- **Le tessere stampate non cambiano:** `pittura-vtt.js` deve produrre esattamente lo stesso pavimento di prima per tutte le 127 tessere.
- **Licenza:** asset Forgotten Adventures CC BY-NC-SA 4.0 — credito visibile nella schermata della Spedizione: «Mappe realizzate con asset di Forgotten Adventures». NOTICE.md ha gia' la sezione.
- **Modalita' tavolo intatta:** il comportamento di gioco (movimento, porte, arredi che bloccano, turni) non cambia; cambia solo come si disegna.
- **Ogni prova va dimostrata non vacua:** per ogni test nuovo, un passo di sabotaggio che lo fa fallire.
- **Il deploy prova una copia:** dopo ogni modifica si rifa' `bash deploy/build-dist.sh` prima di provare con `wrangler dev`.

## Review Focus

1. **Porta non nella seconda casella.** `portaCella()` sceglie fra gli indici `[1, 2, 0, 3]` il primo senza arredo: il buco nel muro e la porta disegnata devono cadere li', non a indice fisso. (Test in Task 3.)
2. **Id di tessera non numerici o saltati:** `T3P`, `T4I` (Ep.7), otto tessere (Ep.6), `T3` assente (Preludio). Niente deve assumere `T1..T6`. (Test in Task 3 e provino del Task 9.)
3. **Stanze senza muri veri — e il tranello di `fuoriDi`.** `fuoriDi()` restituisce `'vuoto'` **anche di default**, per ogni stanza che non e' riva, fogna, giardino, grotta o cortile: la sala delle casse e la cripta ne escono «vuoto». Se i muri dipendessero da `fuoriDi() === 'vuoto'`, meta' delle stanze al chiuso uscirebbero senza muri (visto nella prova del 25/09). I muri, le porte e i pilastri dipendono da `alAperto(tile)` — la sola riga dei tetti di `FUORI_DI`. (Test in Task 1 e Task 3.)
4. **Arredi in coppia verticale e scale sparse:** la fusione 2x1 vale solo in orizzontale e la scalinata 2x2 solo se le quattro caselle `scala` formano davvero un quadrato; altrimenti uno sprite per casella. (Test in Task 3.)
5. **Si esce dalla Spedizione e il ciclo della luce resta vivo:** il `requestAnimationFrame` va fermato quando la plancia non c'e' piu', o scalda il telefono sul menu. (Test in Task 5.)

---

## Struttura dei file

| file | cosa fa |
|---|---|
| `webapp/public/motore/ambiente.js` (nuovo) | `PAVIMENTI`, `FUORI_DI`, `pavimentoDi(tile)`, `fuoriDi(tile)` — spostati da `pittura-vtt.js`, identici |
| `scripts/tiles/pittura-vtt.js` (modifica) | usa `require('../../webapp/public/motore/ambiente.js')` invece delle sue copie |
| `webapp/public/js/plancia/ambiente-fa.js` (nuovo) | quali pezzi FA usa una stanza: pavimento, decori, luci — deterministico dalla tessera |
| `webapp/public/js/plancia/stanza.js` (nuovo) | `stanzaHtml(tile, opz)` → HTML di una stanza (pavimento, arredi, muri, porte, decori) + l'elenco delle sue luci |
| `webapp/public/js/plancia/luce.js` (nuovo) | `creaLuce(el)` → `{ dimensiona, imposta, avvia, ferma }`: buio e calore su canvas |
| `webapp/public/js/digitale.js` (modifica) | `boardHtml` usa `stanzaHtml`; ciclo di vita della luce; eroi come sorgenti |
| `webapp/public/app.css` (modifica) | stile della plancia nuova (sezione board), delle caselle quadrate e delle tre colonne |
| `webapp/test-hud-spedizione.mjs` (nuovo) | le tre colonne, la carta di turno, le schede del telefono, vista eroe/arbitro |
| `scripts/importa-fa-lanterne.py` (modifica) | scrive in `webapp/vtt/{muri,porte,decori}/` invece che nel mockup |
| `webapp/export-assets.py` (modifica) | copia `webapp/vtt/**` in `webapp/assets/vtt/` |
| `webapp/test-ambiente.mjs`, `test-stanza.mjs`, `test-plancia-fa.mjs`, `test-luce.mjs` (nuovi) | le prove |
| `webapp/mappa-plancia-fa.mjs` (nuovo) | fotografa le stanze: una per una (`--ep ep5`) o tutte le 21 spedizioni svelate per intero |
| `docs/scenografia.md` (gia' scritto) | la guida: principi, mood, esempi Ep.1, lista di controllo, dove pescare nella libreria |
| `src/scenografia/<episodio>.json` (nuovi, uno per episodio) | i decori di ogni stanza, scritti a mano con il loro `perche` |
| `webapp/export-data.py` (modifica) | unisce `src/scenografia/<ep>.json` alle tessere, come campo `scena` |
| `webapp/vtt/decori/CATALOGO.json` (generato) | ogni pezzo: ambienti, lato tipico, luce, se si appoggia sopra |
| `webapp/test-scenografia.mjs` (nuovo) | ogni scenografia scritta rispetta la guida: pezzi esistenti, niente su porte/arredi, luci, quantita', varieta', `perche` |

---

### Task 1: La regola del pavimento diventa un modulo condiviso

**Files:**
- Create: `webapp/public/motore/ambiente.js`
- Modify: `scripts/tiles/pittura-vtt.js:186-320` (blocchi `FUORI_DI`, `fuoriDi`, `PAVIMENTI`, `pavimentoDi`)
- Test: `webapp/test-ambiente.mjs`

**Interfaces:**
- Produces: `export const PAVIMENTI`, `export const FUORI_DI`, `export function pavimentoDi(tile) → string`, `export function fuoriDi(tile) → string` (attenzione: `'vuoto'` anche di default), `export function alAperto(tile) → boolean` (vero solo se il nome corrisponde alla riga dei tetti di `FUORI_DI`) (stessi valori di oggi: `'assi'|'tavolato'|'pietra'|…`, e per il fuori `'acqua'|'melma'|'erba'|'roccia'|'terra'|'vuoto'|null`).

- [ ] **Step 1: Fotografare i valori di OGGI prima di toccare niente**

```bash
node -e "const {pavimentoDi}=require('./scripts/tiles/pittura-vtt.js');const fs=require('fs');const o={};for(const f of fs.readdirSync('webapp/data').filter(f=>/^(ep\d+|preludio)\.json$/.test(f))){const d=JSON.parse(fs.readFileSync('webapp/data/'+f));for(const t of d.tessere)o[f+':'+t.id]=pavimentoDi(t)}fs.writeFileSync('webapp/test-ambiente.atteso.json',JSON.stringify(o,null,1))"
```

`fuoriDi` oggi non e' esportato: aggiungere temporaneamente `fuoriDi` a `module.exports` di `pittura-vtt.js` (riga 1181), rilanciare aggiungendo `fuori:` accanto, poi il file atteso ha per ogni tessera `{ "pav": ..., "fuori": ... }`. Deve contenere 127 righe.

- [ ] **Step 2: Scrivere il test che confronta**

```js
// webapp/test-ambiente.mjs — la regola del pavimento e' UNA: la usano le
// tessere stampate e la plancia digitale. Questo test tiene fermi i valori di
// prima dello spostamento, per tutte le 127 tessere.
import { readFileSync, readdirSync } from 'fs';
import { pavimentoDi, fuoriDi } from './public/motore/ambiente.js';
const atteso = JSON.parse(readFileSync('webapp/test-ambiente.atteso.json', 'utf8'));
let guai = 0, n = 0;
for (const f of readdirSync('webapp/data').filter((f) => /^(ep\d+|preludio)\.json$/.test(f))) {
  for (const t of JSON.parse(readFileSync('webapp/data/' + f, 'utf8')).tessere) {
    n++; const a = atteso[`${f}:${t.id}`];
    const v = { pav: pavimentoDi(t), fuori: fuoriDi(t) };
    if (v.pav !== a.pav || v.fuori !== a.fuori) { guai++; console.error(`${f}:${t.id} ${t.nome}`, v, 'atteso', a); }
  }
}
if (n !== 127) { guai++; console.error('tessere contate', n, 'attese 127'); }
console.log(guai ? `FAIL ${guai}` : `OK ${n} tessere, pavimento e fuori invariati`);
process.exit(guai ? 1 : 0);
```

- [ ] **Step 3: Eseguirlo, deve fallire**

Run: `node webapp/test-ambiente.mjs`
Expected: errore `Cannot find module .../public/motore/ambiente.js`

- [ ] **Step 4: Creare il modulo spostando i blocchi**

Tagliare da `pittura-vtt.js` i blocchi `FUORI_DI` + `fuoriDi` (righe ~186-217) e `PAVIMENTI` + `pavimentoDi` (righe ~219-320) CON I LORO COMMENTI, incollarli in `webapp/public/motore/ambiente.js` cambiando solo `const` → `export const` e `function` → `export function`. In testa al file:

```js
// LE REGOLE DEL POSTO: dal nome di una stanza, che pavimento ha e che cosa c'e'
// fuori. Una sola fonte per due usi — le tessere stampate
// (scripts/tiles/pittura-vtt.js) e la plancia digitale (js/plancia/) — perche'
// una banchina non puo' essere di assi al tavolo e di pietra sullo schermo.
```

In coda al modulo, la funzione che il generatore non aveva e che la plancia vuole:

```js
// ATTENZIONE: fuoriDi() da' 'vuoto' anche di DEFAULT (per il generatore vuol
// dire «fuori non si disegna niente»). Per sapere se una stanza e' davvero
// SUI TETTI — niente muri, il vuoto intorno — serve questa, che guarda la sola
// riga dei tetti. Vista nella prova del 25/09: coi muri legati a fuoriDi,
// la sala delle casse e la cripta uscivano senza muri.
const TETTI = FUORI_DI[FUORI_DI.length - 1][0];
export const alAperto = (tile) => TETTI.test(`${tile.nome || ''} ${tile.id || ''}`);
// il fuori che la stanza DICHIARA (senza il 'vuoto' di default): serve al
// fuori dell'episodio (Task 5, Step 4b); null se la stanza non dice niente
export function fuoriDichiarato(tile) {
  const n = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, q] of FUORI_DI.slice(0, -1)) if (re.test(n)) return q;
  return TETTI.test(n) ? 'tetti' : null;
}
```

e in `test-ambiente.mjs` le righe che lo fissano — `fuoriDichiarato` da' `'acqua'` per ep1 T1 e `null` per ep1 T2..T6; `alAperto` vero per `ep11` T1-T6, falso per `ep1` T2 e T6 (che hanno `fuoriDi === 'vuoto'`).

In `pittura-vtt.js`, al posto dei blocchi tolti:

```js
// la regola sta con quella dello schermo: una sola fonte
const { PAVIMENTI, FUORI_DI, pavimentoDi, fuoriDi } = require('../../webapp/public/motore/ambiente.js');
```

- [ ] **Step 5: Eseguire, deve passare; il generatore deve ancora caricarsi**

Run: `node webapp/test-ambiente.mjs && node -e "require('./scripts/tiles/pittura-vtt.js'); console.log('generatore ok')"`
Expected: `OK 127 tessere, pavimento e fuori invariati` e `generatore ok`

- [ ] **Step 6: Sabotaggio — il test deve accorgersene**

In `ambiente.js` cambiare `'assi'` della riga `molo|banchin` in `'pietra'`, rilanciare: deve stampare `FAIL` con le banchine. Rimettere `'assi'`, rilanciare: `OK`.

- [ ] **Step 7: Commit**

```bash
git add webapp/public/motore/ambiente.js scripts/tiles/pittura-vtt.js webapp/test-ambiente.mjs webapp/test-ambiente.atteso.json HANDOFF.md
git commit -m "refactor: la regola del pavimento in un modulo solo, per tessere stampate e plancia"
```

---

### Task 2: Gli asset in produzione

**Files:**
- Modify: `scripts/importa-fa-lanterne.py` (scrive in `webapp/vtt/` invece che nel mockup)
- Modify: `webapp/export-assets.py` (copia `webapp/vtt/` in `webapp/assets/vtt/`)
- Modify: `webapp/public/mockups/tessere-alt/1-lanterne.html` (legge da `/assets/vtt/`)

**Interfaces:**
- Produces: URL stabili `/assets/vtt/pavimenti/<nome>.png`, `/assets/vtt/arredi/<chiave>[-2|-3].png`, `/assets/vtt/muri/{muro-a,muro-b,pilastro,scale}.png`, `/assets/vtt/porte/{porta,porta-2,grata}.png`, `/assets/vtt/decori/<nome>.png`.

- [ ] **Step 1: Spostare la destinazione dell'importatore**

In `scripts/importa-fa-lanterne.py`: `OUT = os.path.join(ROOT, 'webapp', 'vtt')`; nella tabella `PEZZI` le chiavi diventano percorsi relativi per cartella (`'muri/muro-a.png'`, `'porte/porta.png'`, `'porte/grata.png'`, `'decori/torcia.png'`, `'decori/candele-nere.png'`, …). Togliere le righe dei pavimenti e degli arredi: stanno gia' in `webapp/vtt/` (li porta `importa-fa.py`). Creare le sottocartelle con `os.makedirs(os.path.dirname(out), exist_ok=True)`.

- [ ] **Step 2: Lanciare e verificare**

Run: `python scripts/importa-fa-lanterne.py && ls webapp/vtt/muri webapp/vtt/porte webapp/vtt/decori`
Expected: `OK … pezzi`, e le tre cartelle piene (muri 4, porte 3, decori 14 file).

- [ ] **Step 3: `export-assets.py` porta `webapp/vtt/` in `assets/`**

In `main()` di `webapp/export-assets.py`, dopo le altre sorgenti:

```python
    # LA PLANCIA DIGITALE compone le stanze coi pezzi di Forgotten Adventures
    # (js/plancia/). webapp/vtt/ non e' in git e non va in dist: in produzione
    # arrivano solo per questa strada. PNG con alfa, nessuna riconversione.
    vtt = os.path.join(os.path.dirname(OUT), 'vtt')
    for base, _, files in os.walk(vtt):
        for f in files:
            if not f.endswith('.png'):
                continue
            dst = os.path.join(OUT, 'vtt', os.path.relpath(os.path.join(base, f), vtt))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(os.path.join(base, f), dst)
```

(`import shutil` in testa se manca.) Copiare anche `webapp/vtt/LICENZE.txt` in `assets/vtt/`.

- [ ] **Step 4: Verificare che il server li serva**

Run: `python webapp/export-assets.py && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8017/assets/vtt/muri/muro-a.png`
Expected: `200`

- [ ] **Step 5: Il mockup legge da li'** — in `1-lanterne.html` `const FA = (n) => ...` punta a `/assets/vtt/...` con la cartella giusta per pezzo; cancellare `webapp/public/mockups/tessere-alt/fa/`. Aprire il mockup: deve essere identico a prima (confronto a occhio con una foto presa prima dello step).

- [ ] **Step 6: Il catalogo dei decori, da 14 a circa 100 pezzi**

La creativita' delle stanze dipende da cosa c'e' da scegliere. `docs/scenografia.md`, sezione «Il catalogo», dice per ogni ambiente da quali cartelle della libreria pescare. In `scripts/importa-fa-lanterne.py`:

1. Aggiungere il modo provino, per SCEGLIERE GUARDANDO (i nomi dei file mentono):

```python
def provino(cartella, max_n=60):
    # un foglio coi primi max_n pezzi di una cartella, col nome sotto: si
    # sceglie guardando, non leggendo i nomi dei file
    from PIL import ImageDraw
    fs = sorted(glob.glob(os.path.join(FA, cartella, '**', '*.webp'), recursive=True))[:max_n]
    S, cols = 160, 10
    foglio = Image.new('RGB', (cols * S, ((len(fs) + cols - 1) // cols) * (S + 28)), (40, 36, 32))
    d = ImageDraw.Draw(foglio)
    for i, f in enumerate(fs):
        im = Image.open(f).convert('RGBA'); im.thumbnail((S - 8, S - 8))
        x, y = (i % cols) * S, (i // cols) * (S + 28)
        foglio.paste(im, (x + 4, y + 4), im)
        d.text((x + 4, y + S), os.path.basename(f)[:26], fill=(220, 210, 190))
    out = os.path.join(ROOT, 'logs', 'provini', cartella.replace('/', '_').replace('!', '') + '.jpg')
    os.makedirs(os.path.dirname(out), exist_ok=True); foglio.save(out, quality=85)
    print('provino:', out)
```

(con `import glob` in testa, e in `main()`: `if '--provino' in sys.argv: return provino(sys.argv[sys.argv.index('--provino') + 1])`).

2. Per ogni riga della tabella «Il catalogo» della guida: lanciare il provino sulle sue cartelle, **guardare i fogli**, scegliere **6-10 pezzi per ambiente** che servono al mood (gotico, 1889, abbandono, cera, acqua; niente fantasy), e aggiungerli a `PEZZI` in questa forma:

```python
    'decori/sarcofago.png': (FA, f'{CS}/Burial_and_Graves/Sarcophagi/<file scelto>.webp',
                             {'ambienti': ['cripta'], 'lato': 1.6, 'luce': None, 'sopra': False}),
```

I pezzi che esistono gia' (torcia, candele-nere-*, ragnatela-*, ossa, sangue, pozza, catene, barile, sacco, corda, teschio) prendono anche loro il dizionario (`teschio`: `'sopra': True, 'luce': 'cera'`; `candele-nere*`: `'sopra': True, 'luce': 'cera'`; `torcia`: `'luce': 'torcia'`).

3. A fine `main()`, scrivere `webapp/vtt/decori/CATALOGO.json` = `{ nome_senza_png: { ambienti, lato, luce, sopra, fonte } }` per ogni pezzo in `decori/`.

- [ ] **Step 7: Verificare il catalogo**

Run: `python scripts/importa-fa-lanterne.py && python -c "import json;c=json.load(open('webapp/vtt/decori/CATALOGO.json'));print(len(c));import collections;print(collections.Counter(a for v in c.values() for a in v['ambienti']))"`
Expected: fra 80 e 130 pezzi, e **ogni ambiente della tabella con almeno 6**. Poi un provino del catalogo finale (`--provino` sulla cartella `webapp/vtt/decori` adattando il percorso) da guardare: nessun pezzo stona col mood.

- [ ] **Step 8: Commit**

```bash
git add scripts/importa-fa-lanterne.py webapp/export-assets.py webapp/public/mockups/tessere-alt/1-lanterne.html HANDOFF.md
git commit -m "feat: i pezzi Forgotten Adventures della plancia arrivano in produzione, e il catalogo per ambiente"
```

---

### Task 3: Che cosa c'e' in una stanza, e il suo HTML

I decori di una stanza vengono dalla sua **scenografia scritta** (`tile.scena`, da `src/scenografia/<ep>.json`); solo se una stanza non ce l'ha ancora, dalla regola di ripiego di `ambiente-fa.js`. Questo task costruisce la strada; le scenografie le scrivono i Task 7 e 8.

**Files:**
- Create: `webapp/public/js/plancia/ambiente-fa.js`
- Create: `webapp/public/js/plancia/stanza.js`
- Create: `src/scenografia/` (cartella, vuota per ora)
- Modify: `webapp/export-data.py:1783` (prima del `json.dump` di ogni episodio)
- Test: `webapp/test-stanza.mjs`, `webapp/test-scenografia.mjs`

**Interfaces:**
- Consumes: `pavimentoDi`, `fuoriDi` (Task 1); `portaCella`, `dirExit` da `webapp/public/motore/griglia.js`; URL di Task 2.
- Produces:
  - `export function arredoFa(nome) → chiave|null` — `'casse'|'molo'|…` (le 14 chiavi di `webapp/vtt/arredi`)
  - `export function decoriDi(ep, tile) → [{ pezzo, x, y, lato, rot, luce, sopra }]` — **se `tile.scena` esiste restituisce `tile.scena.decori` tali e quali**, altrimenti la regola di ripiego; `x`,`y` centro in caselle locali 0..4 dall'alto-sinistra; `luce` in `'torcia'|'cera'|null`
  - dati: `tile.scena = { decori: [...], perche: string }` (formato in `docs/scenografia.md`, sezione «Gli esempi»)
  - `export function stanzaHtml(ep, tile, { cell, rivelata(id) }) → { html: string, luci: [{ x, y, tipo }] }` — coordinate locali alla tessera in pixel; `html` va messo dentro un contenitore `position:absolute` grande `4*cell`.

- [ ] **Step 1: Scrivere il test delle proprieta' su tutte le 127 tessere**

```js
// webapp/test-stanza.mjs — la stanza composta rispetta il gioco: i muri si
// aprono dove portaCella mette la porta, nessun decoro copre un arredo o una
// porta, e lo stesso input da' sempre lo stesso disegno.
import { readFileSync, readdirSync } from 'fs';
import { stanzaHtml, decoriDi } from './public/js/plancia/stanza.js';
import { portaCella, dirExit } from './public/motore/griglia.js';
import { alAperto } from './public/motore/ambiente.js';
let guai = 0; const no = (m) => { guai++; console.error('  ' + m); };
const eps = readdirSync('webapp/data').filter((f) => /^(ep\d+|preludio)\.json$/.test(f));
for (const f of eps) {
  const ep = JSON.parse(readFileSync('webapp/data/' + f, 'utf8'));
  for (const t of ep.tessere) {
    const opz = { cell: 100, rivelata: () => false };
    const a = stanzaHtml(ep, t, opz), b = stanzaHtml(ep, t, opz);
    if (a.html !== b.html) no(`${f}:${t.id} non deterministica`);
    // una porta chiusa per uscita, nella casella di portaCella (non sui tetti)
    for (const [dir, raw] of Object.entries(t.exits || {})) {
      const [gx, gy] = portaCella(t, dir);
      const c = a.html.includes(`data-porta="${dir}:${gx},${gy}"`);
      if (!alAperto(t) && !c) no(`${f}:${t.id} porta ${dir}→${dirExit(raw)} non in ${gx},${gy}`);
      if (alAperto(t) && c) no(`${f}:${t.id} porta disegnata sui tetti`);
    }
    // a stanze accanto gia' aperte, nessun battente (e' il passaggio libero)
    if ((stanzaHtml(ep, t, { cell: 100, rivelata: () => true }).html.match(/data-porta=/g) || []).length) no(`${f}:${t.id} battente disegnato verso una stanza aperta`);
    // muri: 16 tratti meno le porte al chiuso, nessuno sui tetti — con alAperto,
    // non con fuoriDi: fuoriDi da' 'vuoto' anche alla sala delle casse
    const muri = (a.html.match(/data-muro=/g) || []).length;
    const attesi = alAperto(t) ? 0 : 16 - Object.keys(t.exits || {}).length;
    if (muri !== attesi) no(`${f}:${t.id} muri ${muri}, attesi ${attesi}`);
    // decori mai su arredi o porte
    const occ = new Set((t.arredi || []).map(([x, y]) => `${x},${3 - y}`));
    for (const dir of Object.keys(t.exits || {})) { const [x, y] = portaCella(t, dir); occ.add(`${x},${3 - y}`); }
    for (const d of decoriDi(ep, t)) {
      const k = `${Math.floor(d.x)},${Math.floor(d.y)}`;
      if (occ.has(k)) no(`${f}:${t.id} decoro ${d.pezzo} su casella occupata ${k}`);
    }
  }
}
console.log(guai ? `FAIL ${guai}` : 'OK stanze composte su tutte le tessere');
process.exit(guai ? 1 : 0);
```

Aggiungere in coda tre casi espliciti del Review Focus:

```js
// porta NON alla seconda casella: una tessera con arredo in [1,3] e uscita N
{ const t = { id: 'TX', nome: 'SALA', exits: { N: 'TY' }, arredi: [[1, 3, 'casse']] };
  const { html } = stanzaHtml({ tessere: [t] }, t, { cell: 100, rivelata: () => false });
  const [gx, gy] = portaCella(t, 'N');           // [2,3]
  if (gx !== 2 || !html.includes(`data-porta="N:2,3"`)) no('porta con arredo davanti: non spostata'); }
// scale non in quadrato: niente scalinata 2x2
{ const t = { id: 'TS', nome: 'SALA', exits: {}, arredi: [[0, 0, 'scala'], [2, 2, 'scala']] };
  const { html } = stanzaHtml({ tessere: [t] }, t, { cell: 100, rivelata: () => false });
  if (html.includes('muri/scale.png')) no('scalinata 2x2 su scale sparse'); }
// coppia VERTICALE di altari: due sprite, non uno largo
{ const t = { id: 'TA', nome: 'CRIPTA', exits: {}, arredi: [[1, 1, 'altare'], [1, 2, 'altare']] };
  const { html } = stanzaHtml({ tessere: [t] }, t, { cell: 100, rivelata: () => false });
  if ((html.match(/arredi\/altare/g) || []).length !== 2) no('coppia verticale fusa'); }
```

- [ ] **Step 2: Eseguire, deve fallire**

Run: `node webapp/test-stanza.mjs`
Expected: `Cannot find module .../js/plancia/stanza.js`

- [ ] **Step 3: `ambiente-fa.js` — i decori per ambiente, posati in modo stabile**

```js
// COSA RACCONTA UNA STANZA, per famiglia di pavimento. I pezzi sono quelli di
// webapp/vtt/decori (scripts/importa-fa-lanterne.py). Non si decorano 127
// stanze a mano: la famiglia sceglie COSA, il nome della tessera sceglie DOVE
// (un generatore con seme), cosi' la stessa stanza e' sempre uguale.
import { pavimentoDi, fuoriDi } from '../../motore/ambiente.js';
import { portaCella } from '../../motore/griglia.js';

const FAMIGLIE = {
  assi:      { pezzi: ['corda', 'barile', 'pozza', 'ragnatela'], torce: 2 },
  tavolato:  { pezzi: ['sacco', 'barile', 'corda', 'ragnatela'], torce: 1 },
  pietra:    { pezzi: ['ossa', 'catene', 'sangue', 'ragnatela', 'teschio'], torce: 0, candele: 2 },
  navata:    { pezzi: ['ragnatela', 'teschio'], torce: 0, candele: 3 },
  roccia:    { pezzi: ['pozza', 'ossa', 'ragnatela'], torce: 1 },
  melma:     { pezzi: ['pozza', 'ossa', 'sangue'], torce: 1 },
  mattoni:   { pezzi: ['barile', 'catene', 'sacco'], torce: 2 },
  metallo:   { pezzi: ['barile', 'catene', 'corda'], torce: 2 },
  paglia:    { pezzi: ['sacco', 'corda', 'barile'], torce: 1 },
  mattonelle:{ pezzi: ['ragnatela', 'sacco', 'teschio'], torce: 1 },
  tappeto:   { pezzi: ['ragnatela', 'teschio'], torce: 1, candele: 1 },
  mosaico:   { pezzi: ['ragnatela', 'sacco'], torce: 2 },
  // fuori: niente muri su cui appendere una torcia, poco da posare
  lastricato:{ pezzi: ['pozza', 'sacco', 'barile'], torce: 0 },
  terra:     { pezzi: ['pozza', 'sacco'], torce: 0 },
  ghiaia:    { pezzi: ['barile', 'sacco', 'pozza'], torce: 0 },
  erba:      { pezzi: ['pozza'], torce: 0 },
  tetti:     { pezzi: [], torce: 0 },
  lamiera:   { pezzi: ['barile', 'corda'], torce: 1 },
  acqua:     { pezzi: ['corda'], torce: 0 },
};
export const ARREDI_FA = ['casse', 'molo', 'candele', 'scrivania', 'branda', 'scala', 'altare', 'cella',
  'armadio', 'toeletta', 'scorie', 'forma', 'crogiolo', 'stufa'];
export const arredoFa = (nome) => ARREDI_FA.find((k) => new RegExp(k, 'i').test(nome)) || null;

// L'ARREDO DEL POSTO (docs/scenografia.md): i dati chiamano «casse» anche gli
// ostacoli di un tetto. Il gioco non cambia; il pezzo lo sceglie il posto.
// Restituisce un percorso relativo a /assets/vtt/ senza estensione.
export function arredoDelPosto(tile, nome) {
  if (/campan/i.test(tile.nome)) return /altare/i.test(nome) ? 'decori/campana-grande-2' : 'decori/campana-grande';
  if (/guglia/i.test(tile.nome)) return 'decori/statua-morte';
  if (/ESPOSTA/.test(tile.testo || '')) return /altare/i.test(nome) ? 'decori/statua-incappucciata' : 'decori/comignolo';
  const k = arredoFa(nome); return k ? 'arredi/' + k : null;
}

// un seme dalla tessera: mulberry32 su un hash del nome dell'episodio + id
function caso(seme) {
  let h = 2166136261; for (const c of seme) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h |= 0; h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// caselle libere, in coordinate SCHERMO (riga 0 in alto): niente arredi, niente porte
function libere(tile) {
  const occ = new Set((tile.arredi || []).map(([x, y]) => `${x},${3 - y}`));
  for (const dir of Object.keys(tile.exits || {})) { const [x, y] = portaCella(tile, dir); occ.add(`${x},${3 - y}`); }
  const out = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!occ.has(`${c},${r}`)) out.push([c, r]);
  return out;
}

export function decoriDi(ep, tile) {
  // LA SCENOGRAFIA SCRITTA VINCE: e' stata composta leggendo il testo della
  // stanza (docs/scenografia.md). La regola qui sotto e' solo il ripiego per
  // una stanza che nessuno ha ancora messo in scena.
  if (tile.scena && tile.scena.decori) return tile.scena.decori;
  const fam = FAMIGLIE[pavimentoDi(tile)] || FAMIGLIE.mattonelle;
  const rnd = caso(`${ep.id || ep.titolo || ''}:${tile.id}`);
  // prima i bordi (e' li' che la roba si accumula), poi il centro
  const celle = libere(tile).sort((a, b) => {
    const bordo = ([c, r]) => (c === 0 || c === 3 || r === 0 || r === 3 ? 0 : 1);
    return bordo(a) - bordo(b) || rnd() - .5;
  });
  const out = []; let i = 0;
  const posa = (pezzo, luce, lato) => {
    const cella = celle[i++]; if (!cella) return;
    const [c, r] = cella;
    out.push({ pezzo, luce, lato, rot: Math.round(rnd() * 360),
      x: c + .5 + (rnd() - .5) * .3, y: r + .5 + (rnd() - .5) * .3 });
  };
  const n = Math.min(fam.pezzi.length, 2 + Math.floor(rnd() * 2));
  for (let k = 0; k < n; k++) posa(fam.pezzi[(k + Math.floor(rnd() * 10)) % fam.pezzi.length], null, .7);
  for (let k = 0; k < (fam.candele || 0); k++) posa(['candele-nere', 'candele-nere-2', 'candele-nere-3'][k % 3], 'cera', .75);
  return out;
}

// le torce stanno SUL muro: [lato, indice del tratto] di tratti senza porta
export function torceDi(ep, tile) {
  if (tile.scena) return [];            // nella scena scritta le torce sono decori con luce: 'torcia'
  const fam = FAMIGLIE[pavimentoDi(tile)] || FAMIGLIE.mattonelle;
  if (!fam.torce || fuoriDi(tile) === 'vuoto') return [];
  const rnd = caso(`torce:${ep.id || ''}:${tile.id}`);
  const porte = new Set(Object.keys(tile.exits || {}).map((d) => `${d}:${portaCella(tile, d).join(',')}`));
  const tratti = [];
  for (const lato of ['N', 'S', 'E', 'O']) for (let i = 0; i < 4; i++) {
    const g = { N: [i, 3], S: [i, 0], E: [3, 3 - i], O: [0, 3 - i] }[lato];
    if (!porte.has(`${lato}:${g.join(',')}`)) tratti.push([lato, i]);
  }
  return tratti.sort(() => rnd() - .5).slice(0, fam.torce);
}
```

- [ ] **Step 4: `stanza.js` — l'HTML della stanza**

Portare `stanzaHtml` dal mockup (`1-lanterne.html`, funzione omonima) con quattro cambi, uno per punto del Review Focus:

```js
// LA STANZA COMPOSTA: pavimento, arredi, muri, porte, decori, torce. Coordinate
// locali alla tessera (0..4 caselle, riga 0 in alto); chi chiama mette l'HTML
// dentro un riquadro 4x4 gia' posizionato sulla plancia.
import { pavimentoDi, alAperto } from '../../motore/ambiente.js';
import { portaCella, dirExit } from '../../motore/griglia.js';
import { arredoDelPosto, decoriDi, torceDi } from './ambiente-fa.js';
export { decoriDi } from './ambiente-fa.js';

const V = (p) => `/assets/vtt/${p}.png`;
const ROT = { S: 0, N: 180, O: 90, E: -90 };

export function stanzaHtml(ep, tile, { cell, rivelata }) {
  const px = (v) => +(v * cell).toFixed(1); let h = ''; const luci = [];
  const vuoto = alAperto(tile);          // NON fuoriDi()==='vuoto': vedi Review Focus 3
  h += `<div class="pav-fa" style="width:${px(4)}px;height:${px(4)}px;background-image:url('${V('pavimenti/' + pavimentoDi(tile))}')"></div>`;

  // arredi: coppia ORIZZONTALE fusa, scalinata 2x2 solo su un quadrato vero
  const arr = {}; for (const [x, y, n] of tile.arredi || []) arr[`${x},${3 - y}`] = n;
  const fatti = new Set();
  const scale = Object.keys(arr).filter((k) => /scala/i.test(arr[k])).map((k) => k.split(',').map(Number));
  const q = scale.length === 4 && (() => { const c0 = Math.min(...scale.map((s) => s[0])), r0 = Math.min(...scale.map((s) => s[1]));
    return scale.every(([c, r]) => c - c0 <= 1 && r - r0 <= 1) ? [c0, r0] : null; })();
  if (q) {
    scale.forEach(([c, r]) => fatti.add(`${c},${r}`));
    h += `<div class="pezzo-fa ombra" style="left:${px(q[0])}px;top:${px(q[1])}px;width:${px(2)}px;height:${px(2)}px;background-image:url('${V('muri/scale')}')"></div>`;
  }
  for (const [k, nome] of Object.entries(arr)) {
    if (fatti.has(k)) continue;
    const [c, r] = k.split(',').map(Number);
    const largo = arr[`${c + 1},${r}`] === nome && !fatti.has(`${c + 1},${r}`);
    fatti.add(k); if (largo) fatti.add(`${c + 1},${r}`);
    // l'arredo del posto (docs/scenografia.md): sui tetti le «casse» sono
    // comignoli, nella loggia campane; la scenografia puo' forzarlo per casella
    const forzato = tile.scena && tile.scena.arredi && tile.scena.arredi[k];
    const chiave = forzato || arredoDelPosto(tile, nome); if (!chiave) continue;
    const v = (c * 7 + r * 13) % 3;
    const fuoco = /candele|crogiolo|stufa/.test(chiave);
    if (fuoco) luci.push({ x: c + (largo ? 1 : .5), y: r + .5, tipo: 'candela' });
    const src = chiave.startsWith('arredi/') ? chiave + (v ? '-' + (v + 1) : '') : chiave.includes('/') ? chiave : 'decori/' + chiave;
    h += `<div class="pezzo-fa ${fuoco ? 'fiamma' : 'ombra'}" style="left:${px(c + .06)}px;top:${px(r + .06)}px;width:${px((largo ? 2 : 1) - .12)}px;height:${px(.88)}px;background-image:url('${V(src)}')"></div>`;
  }

  // decori (e le loro luci)
  for (const d of decoriDi(ep, tile)) {
    if (d.luce) luci.push({ x: d.x, y: d.y, tipo: d.luce });
    h += `<div class="pezzo-fa ${d.luce ? 'fiamma' : 'decoro'}" style="left:${px(d.x - d.lato / 2)}px;top:${px(d.y - d.lato / 2)}px;width:${px(d.lato)}px;height:${px(d.lato)}px;transform:rotate(${d.rot}deg);background-image:url('${V('decori/' + d.pezzo)}')"></div>`;
  }

  // muri e porte: la porta sta dove la mette portaCella (NON sempre a indice 1)
  const porte = {};
  for (const [dir, raw] of Object.entries(tile.exits || {})) porte[`${dir}:${portaCella(tile, dir).join(',')}`] = { dir, verso: dirExit(raw), grata: /grata/i.test(raw) };
  const torce = new Set(torceDi(ep, tile).map(([l, i]) => `${l}${i}`));
  for (const lato of ['N', 'S', 'E', 'O']) for (let i = 0; i < 4; i++) {
    const g = { N: [i, 3], S: [i, 0], E: [3, 3 - i], O: [0, 3 - i] }[lato];     // coordinate di gioco (y in su)
    const [cx, cy] = { N: [i + .5, 0], S: [i + .5, 4], E: [4, i + .5], O: [0, i + .5] }[lato];   // bordo, schermo
    const p = porte[`${lato}:${g.join(',')}`];
    if (vuoto) continue;                                   // sui tetti niente muri e niente porte
    if (p) {
      // la porta verso una stanza gia' aperta e' il passaggio libero: il
      // battente si disegna solo chiuso, verso il buio. Ruotato «aperto»
      // attraversava la stanza come un'asse (prova del 25/09).
      if (!rivelata(p.verso))
        h += `<div class="pezzo-fa porta-fa" data-porta="${lato}:${g.join(',')}" style="left:${px(cx - .5)}px;top:${px(cy - .5)}px;width:${px(1)}px;height:${px(1)}px;transform:rotate(${ROT[lato]}deg) scale(1.45);background-image:url('${V(p.grata ? 'porte/grata' : 'porte/porta')}')"></div>`;
      continue;
    }
    h += `<div class="pezzo-fa" data-muro="${lato}${i}" style="left:${px(cx - .5)}px;top:${px(cy - 1)}px;width:${px(1)}px;height:${px(2)}px;transform:rotate(${ROT[lato]}deg);background-image:url('${V(i % 2 ? 'muri/muro-b' : 'muri/muro-a')}')"></div>`;
    if (torce.has(`${lato}${i}`)) {
      const [tx, ty] = { N: [cx, .22], S: [cx, 3.78], E: [3.78, cy], O: [.22, cy] }[lato];
      luci.push({ x: tx, y: ty, tipo: 'torcia' });
      h += `<div class="pezzo-fa fiamma" style="left:${px(tx - .4)}px;top:${px(ty - .4)}px;width:${px(.8)}px;height:${px(.8)}px;transform:rotate(${ROT[lato] + 180}deg);background-image:url('${V('decori/torcia')}')"></div>`;
    }
  }
  if (!vuoto) for (const [ax, ay] of [[0, 0], [4, 0], [0, 4], [4, 4]])
    h += `<div class="pezzo-fa" style="left:${px(ax - .32)}px;top:${px(ay - .32)}px;width:${px(.64)}px;height:${px(.64)}px;background-image:url('${V('muri/pilastro')}')"></div>`;
  return { html: h, luci };
}
```

Nota sul conto dei muri nel test: su una tessera `vuoto` i tratti sono 0; altrove 16 meno le uscite (ogni uscita occupa un tratto). Se un'uscita cade in un tratto gia' contato da un'altra, il test lo dice.

- [ ] **Step 5: Eseguire, deve passare**

Run: `node webapp/test-stanza.mjs`
Expected: `OK stanze composte su tutte le tessere`

Nel test di Step 1, il controllo «decori mai su arredi» va adattato: un decoro con `sopra: true` puo' stare su un arredo `scrivania|altare|toeletta` (principio 7 della guida).

- [ ] **Step 5b: La scenografia entra nei dati** — in `webapp/export-data.py`, prima del `json.dump` di riga 1783 (dove si scrive ogni episodio):

```python
# LA SCENOGRAFIA SCRITTA (docs/scenografia.md): i decori di ogni stanza,
# composti a mano leggendo il testo. Sta in src/ perche' e' sorgente, non
# un derivato: webapp/data/ si rigenera, questa no.
SCENA = os.path.join(ROOT, 'src', 'scenografia')

def con_scenografia(obj):
    p = os.path.join(SCENA, f"{obj.get('id')}.json")
    if not os.path.exists(p):
        return obj
    with open(p, encoding='utf-8') as f:
        sc = json.load(f)
    ignote = set(sc) - {t['id'] for t in obj.get('tessere', [])}
    if ignote:
        sys.exit(f"scenografia {obj.get('id')}: stanze che l'episodio non ha: {sorted(ignote)}")
    for t in obj.get('tessere', []):
        if t['id'] in sc:
            t['scena'] = sc[t['id']]
    return obj
```

e al `json.dump(senza_reportlab(obj), …)` passare `con_scenografia(obj)`. Verifica: `python webapp/export-data.py` gira come prima (nessuna scenografia ancora: nessun campo `scena`).

- [ ] **Step 5c: Il test della scenografia** — `webapp/test-scenografia.mjs`, su ogni file in `src/scenografia/` (se non ce n'e' nessuno, `OK 0`):

```js
// webapp/test-scenografia.mjs — ogni scenografia scritta rispetta la guida
// (docs/scenografia.md): la parte che si puo' verificare a macchina. Il resto
// — il mood, il punto focale — si verifica guardando la foto.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { portaCella } from './public/motore/griglia.js';
import { alAperto } from './public/motore/ambiente.js';
const CAT = JSON.parse(readFileSync('webapp/vtt/decori/CATALOGO.json', 'utf8'));
const SUPERFICI = /scrivania|altare|toeletta/i;
const LIBERI_OGNI_EP = /^(ragnatela|candele-nere)/;
let guai = 0; const no = (m) => { guai++; console.error('  ' + m); };
const dir = 'src/scenografia'; const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
for (const f of files) {
  const epId = f.replace('.json', ''); const sc = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  const ep = JSON.parse(readFileSync(`webapp/data/${epId}.json`, 'utf8'));
  const usi = {};
  for (const [id, scena] of Object.entries(sc)) {
    const t = ep.tessere.find((x) => x.id === id); if (!t) { no(`${f}: ${id} non esiste`); continue; }
    if (!scena.perche || scena.perche.length < 40) no(`${f}:${id} manca il perche' (o e' troppo corto)`);
    const arr = {}; for (const [x, y, n] of t.arredi || []) arr[`${x},${3 - y}`] = n;
    const porte = new Set(Object.keys(t.exits || {}).map((d) => { const [x, y] = portaCella(t, d); return `${x},${3 - y}`; }));
    const aperto = alAperto(t) || /giardino|orto|serra|prato|cortile/i.test(t.nome);
    const n = scena.decori.length, luci = scena.decori.filter((d) => d.luce).length;
    // all'aperto anche zero: «quassu' non resta niente che non sia inchiodato» (Ep.11)
    if (aperto ? n > 5 : (n < 5 || n > 12)) no(`${f}:${id} ${n} decori (${aperto ? 'aperto: 0-5' : 'chiuso: 5-12'})`);
    if (luci > 4) no(`${f}:${id} ${luci} luci fra i decori (max 4)`);
    if (scena.decori.filter((d) => d.pezzo === 'sangue' || /sangue/.test(d.pezzo)).length > 1) no(`${f}:${id} piu' di una traccia di sangue`);
    for (const d of scena.decori) {
      if (!CAT[d.pezzo]) no(`${f}:${id} pezzo inesistente "${d.pezzo}"`);
      if (d.x < 0 || d.x > 4 || d.y < 0 || d.y > 4) no(`${f}:${id} ${d.pezzo} fuori stanza (${d.x},${d.y})`);
      const k = `${Math.floor(d.x)},${Math.floor(d.y)}`;
      if (porte.has(k)) no(`${f}:${id} ${d.pezzo} su una porta (${k})`);
      if (arr[k] && !(d.sopra && SUPERFICI.test(arr[k]) && CAT[d.pezzo] && CAT[d.pezzo].sopra)) no(`${f}:${id} ${d.pezzo} sull'arredo ${arr[k]} (${k})`);
      if (!LIBERI_OGNI_EP.test(d.pezzo)) (usi[d.pezzo] = usi[d.pezzo] || new Set()).add(id);
    }
    if (new Set(scena.decori.map((d) => d.rot)).size === 1 && n > 2) no(`${f}:${id} tutte le rotazioni uguali`);
  }
  for (const [pz, stanze] of Object.entries(usi)) if (stanze.size > 3) no(`${f}: "${pz}" in ${stanze.size} stanze (max 3)`);
}
console.log(guai ? `FAIL ${guai}` : `OK ${files.length} scenografie`);
process.exit(guai ? 1 : 0);
```

Run: `node webapp/test-scenografia.mjs` → `OK 0 scenografie`. Sabotaggio: creare un `src/scenografia/ep1.json` finto con `{"T1":{"decori":[{"pezzo":"barile","x":1.5,"y":0.5,"lato":1,"rot":0}],"perche":"x"}}` → deve segnalare perche', quantita' e **barile su una porta (1,0)**. Cancellarlo.

- [ ] **Step 6: Sabotaggi (uno per volta, poi ripristinare)**

1. In `stanzaHtml` sostituire `portaCella(tile, dir)` con `[1, dir === 'N' ? 3 : 0]` → il test deve segnalare la porta con arredo davanti e le tessere reali con porta spostata.
2. In `libere()` togliere la riga delle porte → deve segnalare `decoro … su casella occupata`.
3. In `caso()` usare `Math.random` → deve segnalare `non deterministica`.

- [ ] **Step 7: Commit**

```bash
git add webapp/public/js/plancia/ambiente-fa.js webapp/public/js/plancia/stanza.js webapp/test-stanza.mjs webapp/test-scenografia.mjs webapp/export-data.py HANDOFF.md
git commit -m "feat: la stanza composta coi pezzi FA dalla sua scenografia scritta, porte dove le mette portaCella"
```

---

### Task 4: La luce

**Files:**
- Create: `webapp/public/js/plancia/luce.js`
- Test: `webapp/test-luce.mjs` (Playwright, server su 8017)

**Interfaces:**
- Produces: `export function creaLuce(contenitore) → { dimensiona(W, H), imposta(sorgenti), avvia(), ferma() }` — `sorgenti` e' una funzione chiamata a ogni fotogramma che restituisce `[{ id, x, y, tipo }]` in pixel della plancia (`tipo` in `'lanterna'|'torcia'|'candela'|'cera'`); `canto` si passa con `imposta(sorgenti, { canto })`.

- [ ] **Step 1: Scrivere il test in pagina**

Una pagina di prova minima creata dal test stesso (`page.setContent`) che importa `/js/plancia/luce.js`, mette una sorgente `lanterna` a (200,200) su 800x800, aspetta 3 fotogrammi e legge l'alfa del canvas del buio:

```js
// webapp/test-luce.mjs — il buio c'e' dove non c'e' luce, e si buca dove c'e'.
import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await b.newPage();
await pg.goto('http://localhost:8017/');
const r = await pg.evaluate(async () => {
  const { creaLuce } = await import('/js/plancia/luce.js');
  const el = document.createElement('div'); el.style.cssText = 'position:relative;width:800px;height:800px';
  document.body.appendChild(el);
  const L = creaLuce(el); L.dimensiona(800, 800);
  L.imposta(() => [{ id: 'e', x: 200, y: 200, tipo: 'lanterna' }], { canto: 0 }); L.avvia();
  await new Promise((ok) => setTimeout(ok, 200));
  const cv = el.querySelector('canvas.buio'); const g = cv.getContext('2d');
  const a = (x, y) => g.getImageData(x / 4, y / 4, 1, 1).data[3];
  const vivo = L.vivo(); L.ferma(); await new Promise((ok) => setTimeout(ok, 100));
  return { centro: a(200, 200), lontano: a(700, 700), vivo, fermo: !L.vivo() };
});
let guai = 0;
if (r.centro > 40) { guai++; console.error('sotto la lanterna e\' ancora buio', r.centro); }
if (r.lontano < 230) { guai++; console.error('lontano dalla luce non e\' buio', r.lontano); }
if (!r.vivo || !r.fermo) { guai++; console.error('ciclo non parte o non si ferma', r); }
console.log(guai ? 'FAIL' : 'OK luce', JSON.stringify(r)); await b.close(); process.exit(guai ? 1 : 0);
```

- [ ] **Step 2: Eseguire, deve fallire** — Run: `node webapp/test-luce.mjs` → errore di import.

- [ ] **Step 3: Implementare** portando il ciclo del mockup (`1-lanterne.html`, blocco «Il buio: si riempie tutto di nero…») in un modulo:

```js
// IL BUIO DELLA PLANCIA: due canvas a un quarto della risoluzione, allargati
// dal CSS. Sono sfumature: ingrandite non perdono niente e costano un
// sedicesimo dei pixel. La maschera SVG grande quanto la mappa, ridisegnata a
// ogni fotogramma, faceva scattare il telefono (mockup lanterne, 24/09/2026).
const Q = 4;
const RAGGIO = { torcia: 1.9, candela: 1.3, cera: .95 };        // in caselle
const TINTE = { lanterna: [255, 179, 92], torcia: [255, 170, 80], cera: [255, 207, 122], candela: [255, 207, 122] };

export function creaLuce(el, { cell = 104 } = {}) {
  const buio = document.createElement('canvas'); buio.className = 'buio';
  const calore = document.createElement('canvas'); calore.className = 'calore';
  el.append(calore, buio);
  const gB = buio.getContext('2d'), gC = calore.getContext('2d');
  let sorgenti = () => [], canto = 0, raf = 0;
  const pos = {};                                   // id -> {x,y}: la luce insegue la sorgente
  function dimensiona(W, H) {
    for (const c of [buio, calore]) { c.width = Math.ceil(W / Q); c.height = Math.ceil(H / Q); c.style.width = W + 'px'; c.style.height = H + 'px'; }
  }
  function fotogramma(now) {
    const w = buio.width, h = buio.height, base = cell * (2.8 - canto * .11);
    gB.globalCompositeOperation = 'source-over'; gB.fillStyle = 'rgba(2,3,4,.95)'; gB.fillRect(0, 0, w, h);
    gB.globalCompositeOperation = 'destination-out';
    gC.globalCompositeOperation = 'source-over'; gC.clearRect(0, 0, w, h); gC.globalCompositeOperation = 'lighter';
    for (const s of sorgenti()) {
      const p = pos[s.id] || (pos[s.id] = { x: s.x, y: s.y });
      p.x += (s.x - p.x) * .2; p.y += (s.y - p.y) * .2;
      const fl = 1 + Math.sin(now / 90 + s.id.length * 7) * .025 + Math.sin(now / 37 + s.x) * .02;
      const r = (RAGGIO[s.tipo] ? cell * RAGGIO[s.tipo] : base) * fl / Q, cx = p.x / Q, cy = p.y / Q;
      const g = gB.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.4, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      gB.fillStyle = g; gB.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      const [R, G, B] = TINTE[s.tipo] || TINTE.cera;
      const c = gC.createRadialGradient(cx, cy, 0, cx, cy, r * .9);
      c.addColorStop(0, `rgba(${R},${G},${B},.9)`); c.addColorStop(1, `rgba(${R},${G - 60},${B - 60},0)`);
      gC.fillStyle = c; gC.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    // si ferma da solo quando la plancia non e' piu' nella pagina
    raf = el.isConnected ? requestAnimationFrame(fotogramma) : 0;
  }
  return {
    dimensiona,
    imposta(f, o = {}) { sorgenti = f; if (o.canto != null) canto = o.canto; },
    avvia() { if (!raf) raf = requestAnimationFrame(fotogramma); },
    ferma() { cancelAnimationFrame(raf); raf = 0; },
    vivo: () => !!raf,
  };
}
```

- [ ] **Step 4: Eseguire, deve passare** — `node webapp/test-luce.mjs` → `OK luce`.

- [ ] **Step 5: Sabotaggi** — (1) commentare il `fillRect` del buco → `sotto la lanterna e' ancora buio`; (2) togliere il controllo `el.isConnected` e non chiamare `ferma()` nel test → deve fallire `ciclo non parte o non si ferma` (col solo `ferma()` tolto dal test). Ripristinare.

- [ ] **Step 6: Commit**

```bash
git add webapp/public/js/plancia/luce.js webapp/test-luce.mjs HANDOFF.md
git commit -m "feat: il buio della plancia su canvas a un quarto, che si ferma quando la plancia sparisce"
```

---

### Task 5: L'innesto nella Spedizione vera

**Files:**
- Modify: `webapp/public/js/digitale.js:499-623` (`boardHtml`), `:1303-1360` (`agganciaMappa`, dove la plancia e' gia' nel DOM)
- Modify: `webapp/public/app.css` (sezione board, righe ~961-1060)
- Test: `webapp/test-plancia-fa.mjs` (Playwright), e i test esistenti `test-digitale-ui.mjs`, `test-arredi.mjs`, `test-partite.mjs`, `test-stile.mjs`

**Interfaces:**
- Consumes: `stanzaHtml(ep, tile, { cell, rivelata })` (Task 3), `creaLuce(el, { cell })` (Task 4).
- Produces: nel DOM, per ogni tessera rivelata `<div class="stanza-fa" data-t="T1">` al posto di `.tessera-b` con sfondo PNG; le tessere di frontiera restano `.tessera-b.coperta`, nere.

- [ ] **Step 1: Test in pagina** — seminare una partita come fa `test-digitale-ui.mjs` (righe 22-40), entrare nella plancia, e verificare:

```js
// webapp/test-plancia-fa.mjs (estratto dei controlli)
const c = await page.evaluate(() => ({
  stanze: document.querySelectorAll('.stanza-fa').length,
  pngVecchi: [...document.querySelectorAll('.tessera-b')].filter((e) => /\/board\//.test(e.style.backgroundImage)).length,
  buio: !!document.querySelector('.board-digitale canvas.buio'),
  nemiciSuCoperte: [...document.querySelectorAll('.tok-board.nemico')].length,
  quadrati: getComputedStyle(document.querySelector('.cella-mossa'), '::after').borderRadius,
  credito: /Forgotten Adventures/.test(document.body.innerText),
}));
if (c.stanze < 1) fail('nessuna stanza composta');
if (c.pngVecchi) fail('tessere dipinte ancora in uso');
if (!c.buio) fail('manca il buio');
if (c.nemiciSuCoperte) fail('nemici visibili prima che la loro stanza sia svelata');
if (c.quadrati !== '8px') fail('le caselle non sono quadrati');
if (!c.credito) fail('manca il credito di Forgotten Adventures');
// uscire dalla spedizione: il ciclo della luce si ferma
await page.click('#nav-esci'); await page.waitForTimeout(300);
const vivo = await page.evaluate(() => window.__luceViva && window.__luceViva());
if (vivo) fail('la luce gira ancora fuori dalla plancia');
```

(`window.__luceViva` lo espone `digitale.js` solo sotto `?prova` nell'URL: `if (new URLSearchParams(location.search).has('prova')) window.__luceViva = () => luce.vivo();`.)

- [ ] **Step 2: Eseguire, deve fallire** — `node webapp/test-plancia-fa.mjs` → `nessuna stanza composta`.

- [ ] **Step 3: `boardHtml`** — nel blocco `tiles` (riga ~529), per le tessere rivelate sostituire celle + `background-image:url(urlBoard)` con:

```js
const { html } = stanzaHtml(ctx.ep, tile, { cell, rivelata: (id) => rev.includes(id) });
return `<div class="stanza-fa" data-t="${id}" style="left:${left}px;top:${top}px;width:${size}px;height:${size}px;--cell:${cell}px">${html}</div>`;
```

Togliere `etichette` (le «verso T2» disegnate in DOM: ora c'e' la porta), e `urlBoard` se non lo usa piu' nessuno (`grep -n urlBoard webapp/public/js/*.js`). Il `.tess-tag` con l'id resta sulle coperte.

- [ ] **Step 4: Le sorgenti di luce** — in `agganciaMappa()`, dopo che `.board-digitale` e' nel DOM:

```js
// la luce vive con la plancia: un solo oggetto per partita, ridimensionato a ogni disegno
const bd = app.querySelector('.board-digitale');
luce = luce && luce.el === bd ? luce : Object.assign(creaLuce(bd, { cell: ctx._geo.cell }), { el: bd });
luce.dimensiona(ctx._geo.w, ctx._geo.h);
// torce, candele, bracieri: calcolate una volta per disegno, in pixel della plancia
const { minX, maxY, cell } = ctx._geo; const lay = layout(); const rev = SP().rivelate;
const fisse = rev.flatMap((id) => {
  const [TX, TY] = lay[id]; const ox = (TX - minX) * 4 * cell, oy = (maxY - TY) * 4 * cell;
  return stanzaHtml(ctx.ep, tileDi(id), { cell, rivelata: (v) => rev.includes(v) }).luci
    .map((l, i) => ({ id: `${id}-${i}`, x: ox + l.x * cell, y: oy + l.y * cell, tipo: l.tipo }));
});
luce.imposta(() => [
  ...fisse,
  ...[...bd.querySelectorAll('.tok-slot[data-tok^="E:"]')].map((s) => ({ id: s.dataset.tok,
    x: s.offsetLeft + ctx._geo.cell / 2, y: s.offsetTop + ctx._geo.cell / 2, tipo: 'lanterna' })),
], { canto: SP().canto });
luce.avvia();
```

Le lanterne leggono la posizione dal token in pagina: cosi' la luce segue anche l'animazione del passo (`scivolaEroe`) senza che nessuno la avvisi.

- [ ] **Step 4a: Il fuori dell'episodio** (deciso col committente il 25/09/2026, vedi `docs/scenografia.md`). La plancia si allarga di **una tessera di margine** attorno al rettangolo delle stanze (`ctx._geo` ne tiene conto); ogni riquadro vuoto in quel rettangolo prende il fuori della **stanza piu' vicina** (distanza di Chebyshev fra le coordinate di `layout()`, a parita' la prima nell'ordine dell'episodio) che ha `fuoriDichiarato(tile) !== null`. `'acqua'` e `'melma'` scorrono (strato `.onda`, solo `transform`); `'erba'`, `'roccia'`, `'terra'` sono fermi e piu' scuri (`brightness(.32) saturate(.4)`); `'tetti'` non disegna niente (sotto c'e' la citta', Step 4b). Nessuna stanza che lo dichiari → buio. Il codice e' il ciclo «IL FUORI E' DELL'EPISODIO» di `6-scenografia.html`. Il buio (Task 4) copre anche il fuori, tranne i tetti. Test in `test-plancia-fa.mjs`: sull'Ep.1 con tutte le tessere svelate, **ogni** riquadro vuoto del margine e' acqua (non solo quelli accanto a T1); sull'Ep.5 nessun riquadro di fuori.

- [ ] **Step 4b: I tetti.** Se almeno una tessera dell'episodio e' `alAperto`, sotto la plancia va la **citta' vista dall'alto**: un canvas fermo, disegnato una volta sola per episodio (canali verde-acqua scuro che serpeggiano, isolati appena piu' chiari del nero, vie coi lampioni in fila, poche finestre accese a grappoli) — il codice e' la funzione `citta(W, H, seme)` di `webapp/public/mockups/tessere-alt/6-scenografia.html`, da portare in `js/plancia/citta.js`. Il buio (Task 4) si stende **solo sulle stanze e sull'acqua**, non sul vuoto: la citta' si vede sempre, ed e' quel che fa sentire l'altezza. Sulle tessere il cui testo contiene `ESPOSTA`, lo strato del vento (`.vento`, stesso file; `.forte` se il testo dice FORTE), animato solo con `transform`.

- [ ] **Step 5: CSS** — nella sezione board di `app.css`: `.stanza-fa`, `.pav-fa` (con i filtri cupi dei Global Constraints), `.pezzo-fa` e varianti `ombra/decoro/fiamma/porta-fa` (dal mockup), `canvas.buio { z-index: 4 }`, `canvas.calore { z-index: 2; opacity: .32 }`, token eroi e nemici `z-index: 5` (sopra il buio), `.cella-mossa::after` quadrato come nei Global Constraints, la vignetta su `.board-area::after`. Il credito sotto la plancia: `<p class="credito-fa">Mappe realizzate con asset di Forgotten Adventures</p>` in `render()`, dopo `.board-area`.

- [ ] **Step 6: Eseguire tutto** — server su 8017, poi in parallelo:

```bash
node webapp/test-plancia-fa.mjs & node webapp/test-digitale-ui.mjs & node webapp/test-arredi.mjs & node webapp/test-partite.mjs & node webapp/test-stile.mjs & wait
```

Expected: tutti `OK`. Se `test-digitale-ui.mjs` cercava `.tessera-b` di tessere rivelate o `.porta-lbl`, aggiornarne l'asserzione al nuovo DOM **nello stesso commit**, scrivendo nel commento perche' e' cambiata.

- [ ] **Step 7: Sabotaggi** — (1) in `boardHtml` rimettere lo sfondo PNG → `tessere dipinte ancora in uso`; (2) in `stanza.js` disegnare anche le tessere coperte → i nemici sulle coperte non devono comunque comparire (il motore non li crea prima della rivelazione: se il test passa comunque, e' il motore a garantirlo — scriverlo nel commento del test).

- [ ] **Step 8: Commit**

```bash
git add webapp/public/js/digitale.js webapp/public/app.css webapp/test-plancia-fa.mjs webapp/test-digitale-ui.mjs HANDOFF.md
git commit -m "feat: la Spedizione disegna le stanze coi pezzi FA, al buio, come il mockup lanterne"
```

---

### Task 6: L'HUD a tre colonne

La specifica visiva e' `webapp/public/mockups/tessere-alt/5-spedizione.html` (scelta dal committente il 25/09/2026: «struttura B, piu' completa»). Si porta nella Spedizione vera **riusando le funzioni che gia' producono i dati**, non riscrivendole: `giroEroiHtml`, `azioniHtml`, `saluteHtml`, `abilitaHtml`, `miglioriteHtml`, `nemiciHtml`, `oggettiHtml`, `domandeHtml`, `logHtml` restano la fonte; cambia dove e come si dispongono.

**Files:**
- Modify: `webapp/public/js/digitale.js:384-482` (`render()`), `:625-760` (le funzioni `…Html` che cambiano forma)
- Modify: `webapp/public/app.css` (sezione immersivo/vista-eroe, righe ~974-1060 e ~1255-1305)
- Test: `webapp/test-hud-spedizione.mjs` (Playwright) + i test esistenti

**Interfaces:**
- Consumes: la plancia di Task 5 (colonna centrale).
- Produces: tre colonne `#col-eroi`, `.board-area`, `#col-notte`; sul telefono le schede `eroi | la notte | diario`, dove **«la notte» non contiene il diario e «diario» contiene solo il diario** (difetto visto nel mockup il 25/09 e corretto li').

**Cosa va in ogni colonna** (dal mockup, con i dati veri):
- **capo**: episodio, fase («round N · gli eroi» / «agisce la notte»), canto a campane con la soglia di `regole.soglia_canto` e il massimo `regole.canto_max`, mazzo, obiettivo (troncato), suoni, menu. Sostituisce la `.barra` «tutto a schermo».
- **eroi**: una carta per eroe del party — ritratto, salute (pallini + `v/max`), azioni rimaste (`azioniRestano`), cariche, stato (`stordito`, a terra, ha agito). La carta di turno si apre: attributi (`acume`, `vigore`, `nervi`, `difesa`), arma dall'`equip`, l'abilita' **solo nella parte «In spedizione»** (tagliare a «In indagine»: nel mockup Attilio si portava dietro il Referto), cariche, i tasti di `azioniHtml` con la loro formula («2d6 + Acume 3 contro 9»), le migliorie, e l'ultimo tiro riassunto in una riga (i dadi 3D di `dadi.js` restano).
- **notte**: torre del canto con le soglie, mazzo, i nemici in campo con Att/Dif/Dan/Mov, stanza, pallini ferite e **cosa faranno** al loro turno; obiettivo intero e scortati (`statoScortati`, `specScort`); oggetti del gruppo; domande (`domandeHtml`); diario.

- [ ] **Step 1: Test in pagina** — seminare la partita come `test-digitale-ui.mjs` e verificare, su 1400x860 e su 390x844:

```js
const c = await page.evaluate(() => ({
  colonne: ['#col-eroi', '.board-area', '#col-notte'].every((s) => document.querySelector(s)),
  carte: document.querySelectorAll('#col-eroi .ce').length,
  aperta: document.querySelectorAll('#col-eroi .ce.on .tasti').length,
  abilSenzaIndagine: [...document.querySelectorAll('#col-eroi .abil')].every((e) => !/In indagine/i.test(e.textContent)),
  diari: [...document.querySelectorAll('.diario')].filter((e) => e.offsetWidth).length,
  largo: document.documentElement.scrollWidth <= innerWidth,
}));
if (!c.colonne) fail('mancano le tre colonne');
if (c.carte !== party.length) fail(`carte eroe ${c.carte}, party ${party.length}`);
if (c.aperta !== 1) fail('la carta di turno non e’ aperta (o ne sono aperte piu’ d’una)');
if (!c.abilSenzaIndagine) fail('un’abilita’ mostra anche la parte d’indagine');
if (c.diari !== 1) fail(`diario visibile ${c.diari} volte`);
if (!c.largo) fail('la pagina e’ piu’ larga dello schermo');
// telefono: ogni scheda mostra solo la sua parte

if (viewport.width < 900) for (const [s, atteso] of [['eroi', { eroi: true, diario: 0, torre: 0 }], ['notte', { eroi: false, diario: 0, torre: 1 }], ['diario', { eroi: false, diario: 1, torre: 0 }]]) {
  await page.click(`.schede button[data-s="${s}"]`); await page.waitForTimeout(150);
  const v = await page.evaluate(() => { const vis = (e) => !!(e && (e.offsetWidth || e.offsetHeight));
    return { eroi: vis(document.getElementById('col-eroi')), diario: [...document.querySelectorAll('.diario')].filter(vis).length,
             torre: [...document.querySelectorAll('.torre')].filter(vis).length }; });
  if (JSON.stringify(v) !== JSON.stringify(atteso)) fail(`scheda ${s}: ${JSON.stringify(v)}, attesa ${JSON.stringify(atteso)}`);
}
```

- [ ] **Step 2: Eseguire, deve fallire** — `node webapp/test-hud-spedizione.mjs` → `mancano le tre colonne`.

- [ ] **Step 3: «Cosa fara' la notte», senza toccare la partita.** `pianoNemici(g, caso, differito)` (motore/nemici.js:67) scrive nel diario e consuma gli accecamenti mentre pianifica: per l'anteprima si chiama su una copia.

```js
// l'intenzione di ogni nemico al prossimo turno, calcolata su una COPIA: il
// piano vero scrive nel diario e consuma gli accecamenti, e un'anteprima non
// deve cambiare niente
function intenzioni() {
  const g = G(); const copia = { ...g, sp: structuredClone(g.sp), partita: structuredClone(g.partita) };
  const piano = nemici.pianoNemici(copia, () => 0.5, true);
  return Object.fromEntries(piano.map((p) => [p.i, p]));   // p.pos1 = dove arriva, p.attacco = chi colpisce (o null)
}
```

Nella riga del nemico: se `p.attacco` → «al suo turno → <eroe>: 2d6+Att contro Difesa D, −Dan»; se si muove senza attaccare → «si avvicina a <eroe piu' vicino>»; se `p.flash` → «salta il turno».

- [ ] **Step 4: `render()`** — sostituire il markup delle righe 432-469 con le tre colonne (`#col-eroi`, `.board-area` di sempre, `#col-notte`) e le schede; spostare dentro le colonne l'output delle funzioni `…Html` esistenti. La carta dell'eroe e la torre si scrivono come nel mockup (`5-spedizione.html`, funzioni `cartaEroe` e il blocco `c-notte`), leggendo i dati da `eroe(nm)`, `SP().vite`, `azioniRestano`, `stat`, `P().regole`.

- [ ] **Step 5: Vista eroe e arbitro.** Sul telefono di chi gioca (`!arbitro()`): la carta aperta e' quella di `mioEroe()`, i tasti degli altri eroi non ci sono, «la notte reagisce» / «fase minaccia» restano solo all'arbitro (come oggi in `azioniHtml`, righe 711-719). Aggiungere al test di Step 1 un secondo giro con la partita vista da un giocatore: `.ce.on` deve essere l'eroe del giocatore e `#fase-minaccia` non deve esistere.

- [ ] **Step 6: Eseguire tutto** — in parallelo `test-hud-spedizione.mjs`, `test-plancia-fa.mjs`, `test-digitale-ui.mjs`, `test-mio-eroe.mjs`, `test-migliorie-app.mjs`, `test-abilita.mjs`, `test-stile.mjs`: tutti `OK`. Dove un test esistente cercava i vecchi pannelli (`#p-giro`, `#p-azioni`, `#p-salute`), aggiornarne il selettore nello stesso commit, dicendo nel commento perche'.

- [ ] **Step 7: Sabotaggi** — (1) rimettere il diario anche nella scheda «la notte» → `scheda notte: … diario 1`; (2) togliere il taglio a «In indagine» → `un’abilita’ mostra anche la parte d’indagine`; (3) in `intenzioni()` passare `g` invece della copia → aggiungere al test il controllo che `SP().log.length` non cambi dopo `render()`, e deve fallire.

- [ ] **Step 8: Commit**

```bash
git add webapp/public/js/digitale.js webapp/public/app.css webapp/test-hud-spedizione.mjs HANDOFF.md
git commit -m "feat: la Spedizione a tre colonne — eroi, plancia al buio, la notte"
```

---

### Task 7: La scenografia dell'Episodio 1, e la macchina fotografica delle stanze

L'Ep.1 e' il **metro** per tutti gli altri: le sue sei stanze vanno scritte per prime, e bene, perche' la lista di controllo chiede a ogni stanza nuova se «regge il confronto con l'Ep.1».

**Files:**
- Create: `src/scenografia/ep1.json`
- Create: `webapp/mappa-plancia-fa.mjs`

**Interfaces:**
- Consumes: `tile.scena` (Task 3), catalogo (Task 2), plancia (Task 5).
- Produces: `node webapp/mappa-plancia-fa.mjs --ep <id>` → `logs/plancia-fa/<id>/<Tn>.png`, una foto per stanza, **con la luce accesa come in partita** e tutte le stanze dell'episodio svelate; `--tutte` → una foto per episodio + `logs/plancia-fa/foglio.jpg`.

- [ ] **Step 1: La macchina fotografica.** Playwright; per l'episodio chiesto: seminare la partita come `test-digitale-ui.mjs`, impostare `spedizione.rivelate` = tutte le tessere, mettere un eroe al centro di ogni stanza a turno (per avere la lanterna accesa li') e fotografare il riquadro della stanza (posizione da `ctx._geo` e `layout()`), 800x800. Raccogliere i 404 su `/assets/vtt/` e gli errori di pagina: se ce ne sono, uscire con errore.

- [ ] **Step 2: Scrivere `src/scenografia/ep1.json`.** T1, T3 e T6 sono gia' scritti nella guida (`docs/scenografia.md`, «Gli esempi»): copiarli. **T2, T4, T5 si compongono ora**, seguendo la guida dall'inizio: leggere `testo`, `cerca`, `cerca_vuoto`, `hook` in `webapp/data/ep1.json`, e il catalogo nuovo. Spunti dal testo, da non ignorare:
  - T2 Sala delle casse — «casse marchiate a fuoco con l'onda, accatastate fino al soffitto in corridoi ciechi; qualcosa, tra le pile, scricchiola»: sacchi, barili, corde a ridosso delle casse (arredi), un corridoio cieco lasciato vuoto e buio; il piede di porco si trova cercando (non metterlo in scena).
  - T4 Ufficio del custode — «scrivania sommersa di spartiti annotati, un pagliericcio che puzza di sego, una tazza ancora tiepida; sulla mensola, tra i vasetti, un filo di spago»: carte e spartiti **sopra** la scrivania (`sopra: true`), la tazza, vasetti, un lume sulla scrivania (l'unica luce: il custode e' appena uscito — mood «qualcosa e' appena successo»).
  - T5 Scala al piano interrato — la scalinata e' arredo; ai lati umidita', calcinacci, ragnatele alte; buia (nessuna luce fra i decori: si scende nel buio).

- [ ] **Step 3: Controllare a macchina** — `python webapp/export-data.py && node webapp/test-scenografia.mjs` → `OK 1 scenografie`.

- [ ] **Step 4: Guardare.** `node webapp/mappa-plancia-fa.mjs --ep ep1`, aprire le sei foto, e per ognuna spuntare la lista di controllo della guida. Metterle accanto alle foto del mockup (`1-lanterne.html`): devono essere **almeno** al suo livello. Correggere finche' ogni voce e' si'.

- [ ] **Step 5: Commit** (le foto restano in `logs/`, fuori da git)

```bash
git add src/scenografia/ep1.json webapp/mappa-plancia-fa.mjs HANDOFF.md
git commit -m "feat: la scenografia dell'Episodio 1, il metro per tutte le altre"
```

---

### Task 8: La scenografia degli altri 20 episodi

Un episodio alla volta, **un subagente per episodio** (o una sessione): e' il lavoro piu' lungo, e dividerlo cosi' fa si' che un limite di utilizzo interrompa al massimo un episodio (vedi «Riprendere dopo un limite di utilizzo»). Ordine: `preludio`, poi `ep2` … `ep20`. Per ognuno, gli stessi sei passi:

- [ ] **Step 1: Leggere.** `docs/scenografia.md` per intero (anche se l'hai gia' letta: e' breve, e il mood si perde in fretta). Poi, per ogni tessera dell'episodio in `webapp/data/<ep>.json`: `nome`, `testo`, `cerca`, `cerca_vuoto`, `hook`, `arredi`, `exits`. Poi `src/scenografia/ep1.json` come esempio di livello.

- [ ] **Step 2: Comporre** `src/scenografia/<ep>.json`, stanza per stanza, principio per principio. Per ogni stanza, prima di scrivere le coordinate, scrivere il `perche`: se il perche' non regge, la stanza non e' pronta. Coordinate: le caselle occupate si calcolano con `portaCella` (porte) e `3 - y` (arredi); il test le ricontrolla.

- [ ] **Step 3: Pezzo che manca?** Se il testo chiede un oggetto che il catalogo non ha e che la libreria probabilmente ha: cercarlo (`find risorse-vtt/FA_Assets_Webp -iname '*parola*'`), provino, aggiungerlo a `PEZZI` in `scripts/importa-fa-lanterne.py`, rilanciare. **Mai** ripiegare su un pezzo a caso: meglio una stanza con un decoro in meno.

- [ ] **Step 4: Controllare a macchina** — `python webapp/export-data.py && node webapp/test-scenografia.mjs && node webapp/test-stanza.mjs` → tutti `OK`.

- [ ] **Step 5: Guardare** — `node webapp/mappa-plancia-fa.mjs --ep <ep>`; per ogni stanza la lista di controllo della guida, **con la foto dell'Ep.1 aperta accanto**. Una voce «no» si corregge prima di passare alla stanza dopo. Le stanze all'aperto (tetti, giardini) si guardano col mood in mente: il vuoto deve sentirsi, non sembrare incompleto.

- [ ] **Step 6: Commit dell'episodio** (e `HANDOFF.md`: episodi fatti, episodio successivo)

```bash
git add src/scenografia/<ep>.json scripts/importa-fa-lanterne.py HANDOFF.md
git commit -m "feat: la scenografia di <titolo dell'episodio>"
```

---

### Task 9: Guardare tutte le 21 spedizioni

**Files:**
- Modify (se serve): `webapp/public/js/plancia/*.js`, `src/scenografia/*.json`

**Interfaces:**
- Consumes: `webapp/mappa-plancia-fa.mjs --tutte` (Task 7), tutte le scenografie (Task 8).

- [ ] **Step 1: Fotografare tutto** — `node webapp/mappa-plancia-fa.mjs --tutte` → nessun 404, nessun errore, 21 foto + `logs/plancia-fa/foglio.jpg`.

- [ ] **Step 2: Guardare il foglio intero**, questa volta da lontano: le 21 spedizioni devono sembrare 21 posti diversi della stessa citta' gotica. Cercare: episodi che si somigliano troppo (stessi pezzi, stesse luci), muri che tagliano una porta, torce su un tratto di vuoto, pavimenti sbagliati per il nome della stanza, tetti con muri, stanze senza punto focale, sangue fuori misura.

- [ ] **Step 3: Correggere** — un difetto di disegno si corregge in `ambiente-fa.js`/`stanza.js` (mai un'eccezione per tessera) con un caso nuovo in `test-stanza.mjs`; un difetto di messa in scena si corregge nella scenografia di quell'episodio, rileggendo la guida. Rilanciare Step 1.

- [ ] **Step 4: Commit**

```bash
git add webapp/public/js/plancia/ src/scenografia/ webapp/test-stanza.mjs HANDOFF.md
git commit -m "fix: le correzioni che il provino delle 21 spedizioni ha mostrato"
```

---

### Task 10: Il telefono, e il tavolo

**Files:** nessun file nuovo; eventuali ritocchi a `app.css` / `luce.js`.

- [ ] **Step 1: Prova sul telefono vero** — `node webapp/server.js` e dal telefono sulla stessa rete `http://<IP del PC>:8017/`: una Spedizione dell'Ep.1 e una dell'Ep.11 (tetti, niente muri), vista eroe e vista arbitro. Criterio: il passo di un eroe e il tremolio delle luci non scattano. Se scatta: il primo sospetto sono le `drop-shadow` di `.pezzo-fa.ombra` (sostituirle con un'ombra gia' cotta nel PNG da `importa-fa-lanterne.py`), il secondo il numero di luci fisse (limitare a 8 per tessera).

- [ ] **Step 2: Partita vera al tavolo** — un episodio intero con chi gioca. Il pilota filtra, ma e' il tavolo che giudica: leggibilita' al buio delle caselle quadrate e dei nemici, se il buio aiuta l'ansia o nasconde troppo.

- [ ] **Step 3: Deploy** — solo dopo l'ok del committente: `python webapp/export-assets.py`, `bash deploy/deploy.sh`, poi aprire `roccamora.smartcores.org` e verificare una Spedizione (i PNG di `/assets/vtt/` devono rispondere 200).

- [ ] **Step 4: Commit finale** di `HANDOFF.md` con lo stato («fatto», «da guardare al tavolo»).
