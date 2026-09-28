// webapp/mappa-plancia-fa.mjs — Task 7 (docs/scenografia.md): la macchina
// fotografica delle stanze. Fotografa ogni stanza SVELATA di un episodio con
// UN EROE al centro (cosi' la sua lanterna la illumina, come in partita
// vera) — la semina di localStorage e' quella di test-digitale-ui.mjs, con
// TUTTE le tessere gia' rivelate come in test-plancia-fa.mjs (Parte 2).
//
// Raccoglie i 404 su /assets/vtt/ e gli errori di pagina durante tutta la
// sessione: se ce n'e' anche uno solo, esce con errore — niente foto
// silenziosamente rotte (pezzo mancante, piastrella nera) scambiate per una
// scenografia vera.
//
// Uso:
//   node webapp/server.js                          (in un altro terminale)
//   node webapp/mappa-plancia-fa.mjs --ep ep1       -> logs/plancia-fa/ep1/<Tn>.png
//   node webapp/mappa-plancia-fa.mjs --tutte        -> una foto d'ingresso per
//                                                      ogni episodio + logs/plancia-fa/foglio.jpg
import { chromium } from 'playwright';
import { readFileSync, readdirSync, mkdirSync } from 'fs';
import path from 'path';

const BASE = 'http://localhost:8017';
// dimensione reale di una stanza a zoom 1 (4 caselle * ctx._geo.cell, vedi
// webapp/public/js/digitale.js:700 `cell = 104`) — si azzera lo zoom (come fa
// test-plancia-fa.mjs per la misura) e si lascia al deviceScaleFactor il
// compito di arrivare a 800x800 senza sfocare i pezzi (vera sovracampionatura,
// non uno zoom CSS che stira i raster gia' disegnati).
const ROOM_CSS = 416;
const SHOT = 800;
const DPR = SHOT / ROOM_CSS;

const args = process.argv.slice(2);
const epArg = args.includes('--ep') ? args[args.indexOf('--ep') + 1] : null;
const tutte = args.includes('--tutte');
if (!epArg && !tutte) {
  console.error('uso: node webapp/mappa-plancia-fa.mjs --ep <id> | --tutte');
  process.exit(1);
}

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const partyDi = () => COMUNE.eroi.slice(0, 3).map((e) => e.nome);
const erroriGlobali = [];

// La cella libera piu' vicina al centro (non un arredo, cosi' il token
// dell'eroe non galleggia sopra un mobile disegnato). Coordinate nello stesso
// spazio "dati" di tile.arredi (nessun ribaltamento: e' quello che usa anche
// eroiPos altrove nel motore).
function cellaCentrale(tile) {
  const occ = new Set((tile.arredi || []).map(([x, y]) => `${x},${y}`));
  const candidate = [[1, 1], [2, 1], [1, 2], [2, 2], [1, 0], [2, 0], [0, 1], [3, 1], [1, 3], [2, 3], [0, 2], [3, 2]];
  for (const [x, y] of candidate) if (!occ.has(`${x},${y}`)) return { x, y };
  return { x: 1, y: 1 };
}

// Apre l'episodio con TUTTE le tessere rivelate e un eroe per stanza-obiettivo
// (eroiPos e' gia' quello giusto quando arriva qui). Ritorna la pagina pronta
// da fotografare (zoom azzerato, luce assestata) o ok:false con l'errore.
async function apriEpisodio(browser, epId, ep, eroiPos, vite) {
  const page = await browser.newPage({ viewport: { width: 2400, height: 1400 }, deviceScaleFactor: DPR });
  const erroriPagina = [];
  page.on('pageerror', (e) => erroriPagina.push(`pageerror ${epId}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if ((m.location()?.url || '').includes('/api/')) return;   // sonda nota, vedi altri test
    erroriPagina.push(`console.error ${epId}: ${m.text().slice(0, 200)}`);
  });
  page.on('response', (r) => { if (r.status() === 404 && r.url().includes('/assets/vtt/')) erroriPagina.push(`404 ${epId}: ${r.url()}`); });
  page.on('requestfailed', (r) => { if (r.url().includes('/assets/vtt/')) erroriPagina.push(`richiesta fallita ${epId}: ${r.url()} (${r.failure()?.errorText || '?'})`); });
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });

  const party = partyDi();
  const ids = ep.tessere.map((t) => t.id);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(({ epId, party, ids, eroiPos, vite }) => {
    localStorage.clear();
    localStorage.setItem(`osr.partita.${epId}`, JSON.stringify({
      v: 1, episodio: epId, modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
        oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
        note: '', risposte: ['', '', '', ''], chiusa: true },
      spedizione: {
        digitale: true, round: 1, fase: 'eroi', canto: 0, cantoBonus: false, esito: null,
        rivelate: ids, stanzeLette: ids, grate: [], log: [], nemici: [], scortati: [],
        eroiPos, vite, azioni: {},
        // TUTTI GIA' FATTI: senza questo, l'eroe attivo si porta dietro le
        // caselle raggiungibili (il riquadro turchese dei Global Constraints,
        // vedi commit 1c144b9cf) sopra META' della stanza — copre la
        // scenografia nella foto. Nessun eroe attivo = nessuna casella accesa.
        eroiFatti: party, eroiAttivo: null,
        abilita: {}, cercate: {}, insidie: {}, storditi: {}, uscitaTentati: [], mazzo: null,
      },
    }));
  }, { epId, party, ids, eroiPos, vite });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  const casoLoc = page.locator(`.stampa-caso[data-ep="${epId}"]`);
  if (!(await casoLoc.count())) { erroriPagina.push(`${epId}: tessera episodio non trovata in home`); return { page, ok: false, erroriPagina }; }
  await casoLoc.click();
  await page.waitForTimeout(250);
  await page.locator('#apri-caso').click();
  // come test-hud-spedizione.mjs: qualche giro di clic su quel che c'e' (una
  // schermata intermedia puo' comparire per un attimo), finche' la plancia
  // non e' davvero montata — evita un fallimento per pura corsa fra i clic.
  for (let i = 0; i < 6 && !(await page.locator('.board-digitale').count()); i++) {
    for (const sel of ['#continua', '#via', '#ok-msg']) {
      const b = page.locator(sel);
      if (await b.count()) { await b.first().click({ force: true }).catch(() => {}); await page.waitForTimeout(200); }
    }
    await page.waitForTimeout(200);
  }
  if (!(await page.locator('.board-digitale').count())) { erroriPagina.push(`${epId}: board non renderizzato`); return { page, ok: false, erroriPagina }; }

  // zoom a 1: la stanza torna alla sua dimensione nota (416px CSS), e il
  // deviceScaleFactor fa il resto per arrivare a 800x800 in pixel veri.
  await page.evaluate(() => { const b = document.querySelector('.board-digitale'); if (b) b.style.zoom = '1'; });
  await page.waitForTimeout(400);   // la luce (rAF, luce.js) si assesta sulla nuova posizione
  return { page, ok: true, erroriPagina };
}

// Fotografa le stanze di un episodio, una alla volta (un caricamento di
// pagina per stanza: piu' lento di un solo giro con render() ripetuto, ma
// riusa la stessa semina gia' provata di test-plancia-fa.mjs invece di
// inventare un canale nuovo per spingere stato dentro il modulo — un errore
// di quel canale romperebbe la foto senza che sia colpa della scenografia).
// `soloEntrata`: solo la prima tessera (per --tutte, una per episodio).
async function fotografaStanze(browser, epId, soloEntrata) {
  const ep = JSON.parse(readFileSync(`webapp/data/${epId}.json`, 'utf8'));
  const party = partyDi();
  const entrata = ep.tessere[0];
  const daFotografare = soloEntrata ? [entrata] : ep.tessere;
  const outDir = path.join('logs', 'plancia-fa', epId);
  mkdirSync(outDir, { recursive: true });
  const foto = [];

  for (const tile of daFotografare) {
    const c = cellaCentrale(tile);
    const eroiPos = { [party[0]]: { t: tile.id, x: c.x, y: c.y } };
    // il resto del gruppo resta all'ingresso, fuori dai piedi della foto
    party.slice(1).forEach((nm, i) => { eroiPos[nm] = { t: entrata.id, x: i, y: 0 }; });
    const vite = Object.fromEntries(party.map((nm) => [nm, 6]));
    const { page, ok, erroriPagina } = await apriEpisodio(browser, epId, ep, eroiPos, vite);
    erroriGlobali.push(...erroriPagina);
    if (ok) {
      const stanza = page.locator(`.stanza-fa[data-t="${tile.id}"]`);
      if (await stanza.count()) {
        const dest = path.join(outDir, `${tile.id}.png`);
        await stanza.first().screenshot({ path: dest });
        foto.push(dest);
        console.log('  foto ->', dest);
      } else {
        erroriGlobali.push(`${epId}:${tile.id}: stanza non trovata sulla plancia (fuori dal rettangolo mostrato?)`);
      }
    }
    await page.close();
  }
  return foto;
}

// Un foglio di contatto: tutte le foto (base64, autonomo) in una griglia CSS,
// fotografato a sua volta con Playwright — niente libreria di composizione
// immagini in piu' (non e' fra le dipendenze del progetto).
async function componiFoglio(browser, voci) {
  const { readFileSync: rf } = await import('fs');
  const celle = voci.map(({ epId, file }) => {
    const b64 = rf(file).toString('base64');
    return `<figure><img src="data:image/png;base64,${b64}"><figcaption>${epId}</figcaption></figure>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;background:#0e1519;font-family:sans-serif}
    .foglio{display:grid;grid-template-columns:repeat(5,200px);gap:8px;padding:8px}
    figure{margin:0}
    img{width:200px;height:200px;object-fit:cover;display:block;border:1px solid #d8b25e}
    figcaption{color:#e8dcc0;font-size:11px;text-align:center;padding:2px 0}
  </style></head><body><div class="foglio">${celle}</div></body></html>`;
  const page = await browser.newPage();
  await page.setContent(html);
  const dest = path.join('logs', 'plancia-fa', 'foglio.jpg');
  await page.screenshot({ path: dest, type: 'jpeg', quality: 85, fullPage: true });
  await page.close();
  console.log('foglio ->', dest);
}

const browser = await chromium.launch();

if (epArg) {
  console.log(`fotografo ${epArg}...`);
  await fotografaStanze(browser, epArg, false);
} else if (tutte) {
  const epFiles = readdirSync('webapp/data').filter((f) => /^ep\d+\.json$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));
  const voci = [];
  for (const f of epFiles) {
    const epId = f.replace('.json', '');
    console.log(`fotografo ${epId} (ingresso)...`);
    const foto = await fotografaStanze(browser, epId, true);
    if (foto[0]) voci.push({ epId, file: foto[0] });
  }
  if (voci.length) await componiFoglio(browser, voci);
}

await browser.close();

if (erroriGlobali.length) {
  console.error(`\n${erroriGlobali.length} ERRORI:`);
  for (const e of erroriGlobali) console.error('  ' + e);
  process.exit(1);
}
console.log('\nmappa-plancia-fa: nessun 404 su /assets/vtt/, nessun errore di pagina.');
