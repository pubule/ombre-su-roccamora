// LA PLANCIA COI PEZZI FA, IN PARTITA VERA (Task 5, 25/09/2026): le stanze
// rivelate sono composte da stanza.js (Task 3) invece del PNG dipinto, vivono
// al buio di luce.js (Task 4), e sul fuori/i tetti c'e' quel che lo Step 4a/4b
// hanno aggiunto — il margine dell'episodio e la citta' sotto i tetti.
//
// Uso: node webapp/server.js (altrove) ; node webapp/test-plancia-fa.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:8017';
let ko = 0;
const fail = (m) => { console.error('FAIL:', m); ko++; };

const browser = await chromium.launch();

// --------------------------------------------------------------------------
// PARTE 1 (Step 1/6/7): una spedizione vera, seminata come fa
// test-digitale-ui.mjs (righe 22-40) — party fresco, si entra e si scende in
// tessera T1. Qui vivono i controlli del Task 5 sul DOM della plancia vera, e
// il sabotaggio (1) del Step 7 li fa fallire rimettendo lo sfondo PNG.
async function parte1() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !(m.location()?.url || '').includes('/api/')) errs.push('console.error: ' + m.text().slice(0, 200)); });
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });

  // `?prova` espone `window.__luceViva` (digitale.js) — serve al controllo
  // finale: uscendo dalla Spedizione il ciclo della luce si deve fermare.
  await page.goto(BASE + '/?prova', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
      const party = c.eroi.slice(0, 3).map((e) => e.nome);
      localStorage.setItem('osr.partita.ep1', JSON.stringify({
        v: 1, episodio: 'ep1', modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
        indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
          oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
          note: '', risposte: ['', '', '', ''], chiusa: true },
        spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null },
      }));
    });
  });

  const has = async (sel) => (await page.locator(sel).count()) > 0;
  const clickIf = async (sel) => {
    if (!(await has(sel))) return false;
    try { await page.locator(sel).first().click({ force: true, timeout: 1500 }); } catch { return false; }
    await page.waitForTimeout(120); return true;
  };

  await page.goto(BASE + '/?prova', { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  // `.stampa-caso[data-ep="..."]` (come test-partite.mjs): piu' robusto del
  // testo del titolo, e funziona qualunque sia la progressione di campagna.
  const ep = page.locator('.stampa-caso[data-ep="ep1"]');
  if (await ep.count()) { await ep.click(); } else fail('tessera episodio non trovata');
  await page.waitForTimeout(200);
  await page.locator('#apri-caso').click();
  await page.waitForTimeout(200);
  await clickIf('#continua');
  await page.waitForTimeout(150);
  await clickIf('#via');
  await clickIf('#ok-msg');   // la stanza d'ingresso si legge come tutte le altre
  await page.waitForTimeout(200);

  const c = await page.evaluate(() => ({
    stanze: document.querySelectorAll('.stanza-fa').length,
    pngVecchi: [...document.querySelectorAll('.tessera-b')].filter((e) => /\/board\//.test(e.style.backgroundImage)).length,
    buio: !!document.querySelector('.board-digitale canvas.buio'),
    nemiciSuCoperte: [...document.querySelectorAll('.tok-board.nemico')].length,
    quadrati: document.querySelector('.cella-mossa') ? getComputedStyle(document.querySelector('.cella-mossa'), '::after').borderRadius : null,
    credito: /Forgotten Adventures/.test(document.body.innerText),
  }));
  if (c.stanze < 1) fail('nessuna stanza composta');
  if (c.pngVecchi) fail('tessere dipinte ancora in uso');
  if (!c.buio) fail('manca il buio');
  // NEMICI SULLE COPERTE (Step 7, sabotaggio 2): a spedizione appena
  // cominciata nessun nemico e' ancora sul campo (la minaccia non ha ancora
  // pescato), quindi qui il conto e' zero in partenza. Il controllo che conta
  // DAVVERO e' strutturale, non di questo momento: `azioni.js:184` chiama
  // `spawnDaTesto(g, dest.testo, revealId)` SOLO subito dopo aver spinto
  // `revealId` dentro `sp.rivelate` (riga 171, stesso blocco) — un nemico non
  // puo' esistere su una tessera che il motore non ha ancora segnato come
  // rivelata, qualunque cosa disegni `stanza.js`. Per questo il sabotaggio
  // "disegna anche le coperte" (Step 7.2) NON fa fallire questo controllo: la
  // garanzia non sta nel rendering, sta nel motore, a monte del disegno.
  if (c.nemiciSuCoperte) fail('nemici visibili prima che la loro stanza sia svelata');
  if (c.quadrati !== '8px') fail(`le caselle non sono quadrati (border-radius ${c.quadrati})`);
  if (!c.credito) fail('manca il credito di Forgotten Adventures');

  // uscire dalla spedizione: il ciclo della luce si ferma (Task 4 + Step 4)
  await page.click('#nav-esci'); await page.waitForTimeout(300);
  const vivo = await page.evaluate(() => window.__luceViva && window.__luceViva());
  if (vivo) fail('la luce gira ancora fuori dalla plancia');

  if (errs.length) fail('errori di pagina: ' + errs.join(' | '));
  await page.close();
}

// --------------------------------------------------------------------------
// PARTE 2 (Step 4a): Ep.1 con TUTTE le tessere svelate — il margine intorno a
// tutto il complesso deve essere acqua (la banchina T1 e il canale T?), non
// solo il bordo vicino a T1.
async function parte2() {
  const page = await browser.newPage({ viewport: { width: 500, height: 900 } });
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    return fetch('/data/comune.json').then((r) => r.json()).then((c) => fetch('/data/ep1.json')
      .then((r) => r.json()).then((ep) => {
        const party = c.eroi.slice(0, 3).map((e) => e.nome);
        const ids = ep.tessere.map((t) => t.id);
        localStorage.setItem('osr.partita.ep1', JSON.stringify({
          v: 1, episodio: 'ep1', modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
          indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
            oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
            note: '', risposte: ['', '', '', ''], chiusa: true },
          spedizione: {
            digitale: true, round: 1, fase: 'eroi', canto: 0, cantoBonus: false, esito: null,
            rivelate: ids, stanzeLette: ids, grate: [], log: [], nemici: [], scortati: [],
            eroiPos: Object.fromEntries(party.map((nm) => [nm, { t: ids[0], x: 1, y: 1 }])),
            vite: Object.fromEntries(party.map((nm) => [nm, 6])), azioni: {}, eroiFatti: [],
            abilita: {}, cercate: {}, insidie: {}, storditi: {}, uscitaTentati: [], mazzo: null,
          },
        }));
      }));
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const ep = page.locator('.stampa-caso[data-ep="ep1"]');
  if (await ep.count()) await ep.click(); else fail('(ep.1 tutto svelato) tessera episodio non trovata');
  await page.waitForTimeout(200);
  await page.locator('#apri-caso').click();
  await page.waitForTimeout(300);
  if (!(await page.locator('.board-digitale').count())) fail('(ep.1 tutto svelato) board non renderizzato');

  const info = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.fuori-fa')];
    const tutteAcqua = els.every((e) => {
      const onda = e.querySelector('.onda-fa');
      return onda && /acqua/.test(onda.style.backgroundImage);
    });
    const conPav = els.filter((e) => e.querySelector('.pav-fa')).length;   // qualunque fuori NON acqua
    const lefts = els.map((e) => parseFloat(e.style.left));
    const tops = els.map((e) => parseFloat(e.style.top));
    return { n: els.length, tutteAcqua, conPav,
      spanX: lefts.length ? Math.max(...lefts) - Math.min(...lefts) : 0,
      spanY: tops.length ? Math.max(...tops) - Math.min(...tops) : 0 };
  });
  if (info.n < 8) fail(`(ep.1 tutto svelato) pochi riquadri di fuori (${info.n})`);
  if (!info.tutteAcqua || info.conPav) fail('(ep.1 tutto svelato) non tutto il margine e\' acqua');
  // il complesso di Ep.1 e' largo piu' di una tessera: se il fuori si vedesse
  // solo vicino a T1 lo scarto (in pixel di plancia, cell=104) resterebbe
  // sotto una larghezza di tessera (416px)
  if (info.spanX < 416 && info.spanY < 416) fail('(ep.1 tutto svelato) il fuori sta solo vicino a T1, non intorno a tutto il complesso');

  await page.close();
}

// --------------------------------------------------------------------------
// PARTE 3 (Step 4a): Ep.5 — nessuna stanza dichiara un fuori: il margine
// resta senza riquadri (buio e basta, o niente sotto i tetti).
async function parte3() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    return fetch('/data/comune.json').then((r) => r.json()).then((c) => fetch('/data/ep5.json')
      .then((r) => r.json()).then((ep) => {
        const party = c.eroi.slice(0, 3).map((e) => e.nome);
        const t0 = ep.tessere[0].id;
        localStorage.setItem('osr.partita.ep5', JSON.stringify({
          v: 1, episodio: 'ep5', modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
          indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
            oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
            note: '', risposte: ['', '', '', ''], chiusa: true },
          spedizione: {
            digitale: true, round: 1, fase: 'eroi', canto: 0, cantoBonus: false, esito: null,
            rivelate: [t0], stanzeLette: [t0], grate: [], log: [], nemici: [], scortati: [],
            eroiPos: Object.fromEntries(party.map((nm) => [nm, { t: t0, x: 1, y: 1 }])),
            vite: Object.fromEntries(party.map((nm) => [nm, 6])), azioni: {}, eroiFatti: [],
            abilita: {}, cercate: {}, insidie: {}, storditi: {}, uscitaTentati: [], mazzo: null,
          },
        }));
      }));
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const ep = page.locator('.stampa-caso[data-ep="ep5"]');
  const trovata = await ep.count();
  if (trovata) { await ep.click(); await page.waitForTimeout(200); await page.locator('#apri-caso').click(); await page.waitForTimeout(300); }
  else fail('(ep.5) tessera episodio non trovata in home');
  if (trovata) {
    const n = await page.locator('.fuori-fa').count();
    if (n !== 0) fail(`(ep.5) nessuna stanza dichiara un fuori: attesi 0 riquadri, trovati ${n}`);
  }
  await page.close();
}

// --------------------------------------------------------------------------
// PARTE 4 (Step 4b): Ep.11 (i tetti) — almeno una tessera alAperto: sotto la
// plancia va la citta', un canvas fermo.
async function parte4() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    return fetch('/data/comune.json').then((r) => r.json()).then((c) => fetch('/data/ep11.json')
      .then((r) => r.json()).then((ep) => {
        const party = c.eroi.slice(0, 3).map((e) => e.nome);
        const t0 = ep.tessere[0].id;
        localStorage.setItem('osr.partita.ep11', JSON.stringify({
          v: 1, episodio: 'ep11', modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
          indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
            oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
            note: '', risposte: ['', '', '', ''], chiusa: true },
          spedizione: {
            digitale: true, round: 1, fase: 'eroi', canto: 0, cantoBonus: false, esito: null,
            rivelate: [t0], stanzeLette: [t0], grate: [], log: [], nemici: [], scortati: [],
            eroiPos: Object.fromEntries(party.map((nm) => [nm, { t: t0, x: 1, y: 1 }])),
            vite: Object.fromEntries(party.map((nm) => [nm, 6])), azioni: {}, eroiFatti: [],
            abilita: {}, cercate: {}, insidie: {}, storditi: {}, uscitaTentati: [], mazzo: null,
          },
        }));
      }));
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const ep = page.locator('.stampa-caso[data-ep="ep11"]');
  const trovata = await ep.count();
  if (!trovata) { fail('(ep.11) tessera episodio non trovata in home'); await page.close(); return; }
  await ep.click(); await page.waitForTimeout(200);
  await page.locator('#apri-caso').click(); await page.waitForTimeout(300);
  if (!(await page.locator('canvas.citta').count())) fail('(ep.11, tetti) manca la citta\' sotto la plancia');
  await page.close();
}

await parte1();
await parte2();
await parte3();
await parte4();
await browser.close();

console.log(ko ? `\n${ko} FALLITI` : '\ntest-plancia-fa: tutto a posto (stanze coi pezzi FA, fuori dell\'episodio, citta\' sotto i tetti, luce che si ferma uscendo)');
process.exit(ko ? 1 : 0);
