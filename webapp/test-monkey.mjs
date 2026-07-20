// Monkey/fuzz test: clicca a caso su elementi (e coordinate) della webapp per
// stanare crash, schermi vuoti, errori JS, 5xx e stati NON recuperabili (dopo il
// fuzz ricarica l'app e verifica che il giocatore riprenda la partita). Semina
// alcuni stati (fresh / indagine / spedizione avviata) per coprire in profondita'.
// Uso: node webapp/server.js (altrove) ; node webapp/test-monkey.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:8017';
const RUNS = 9;
const CLICKS = 140;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function seed(page, kind) {
  await page.evaluate((k) => {
    localStorage.clear();
    return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
      const party = c.eroi.slice(0, 3 + (k === 'sped4' ? 1 : 0)).map((e) => e.nome);
      const base = {
        v: 1, episodio: 'ep1', modo: 'tavolo', party, creata: Date.now(),
        indagine: { ora: 21, lettaLettera: true, visitati: [1, 2], scoperti: [1, 2, 5], sbloccati: [],
          parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
          note: '', risposte: ['', '', '', ''], chiusa: k.startsWith('sped') },
        spedizione: { round: 0, canto: 0, cantoBonus: false, ferite: [], mazzo: null, scarti: [], esito: null },
      };
      base.fase = k.startsWith('sped') ? 'spedizione' : 'indagine';
      localStorage.setItem('osr.partita.ep1', JSON.stringify(base));
    });
  }, kind).catch(() => {});
}

const SEL = ['button', '[data-tessera]', '[data-vita]', '[data-abil-usa]', '[data-abil-undo]',
  '[data-canto]', '[data-turno-eroe]', '[data-turno-nemico]', '.tessera-episodio', '.voce',
  '.eroe-tile', '.scelta-btn', '.chip-turno', '[id]', 'img', 'a', 'textarea', 'input',
  'summary', 'details', '.pip-vita', '.nemico-pips'].join(', ');

const bugs = [];
let totalClicks = 0;
const browser = await chromium.launch();

for (let run = 0; run < RUNS; run++) {
  const seedN = 91000 + run * 13;
  const rng = mulberry32(seedN);
  const kind = run % 4 === 0 ? "indagine" : (run % 2 === 1 ? "sped" : "sped4");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console.error: ' + m.text().slice(0, 200)); });
  page.on('response', (r) => { if (r.status() >= 500) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  await page.addInitScript(() => {
    window.alert = () => {}; window.confirm = () => true; window.prompt = () => null;
    window.addEventListener('unhandledrejection', (e) =>
      console.error('unhandledrejection: ' + ((e.reason && e.reason.message) || e.reason)));
    window.addEventListener('beforeunload', (e) => { e.stopImmediatePropagation(); }, true);
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  if (kind !== 'fresh') { await seed(page, kind); await page.goto(BASE, { waitUntil: 'networkidle' }); }
  else await page.evaluate(() => localStorage.clear());

  for (let step = 0; step < CLICKS; step++) {
    try {
      if (rng() < 0.28) {
        await page.mouse.click(5 + Math.floor(rng() * 380), 10 + Math.floor(rng() * 824), { timeout: 400 });
      } else {
        const els = await page.$$(SEL);
        const vis = [];
        for (const h of els) { if (await h.isVisible().catch(() => false)) vis.push(h); }
        if (vis.length) await vis[Math.floor(rng() * vis.length)].click({ timeout: 500 }).catch(() => {});
        else await page.mouse.click(5 + Math.floor(rng() * 380), 10 + Math.floor(rng() * 824), { timeout: 400 });
      }
    } catch { /* fuzz: click fallito, si prosegue */ }
    totalClicks++;
    await page.waitForTimeout(12);
    // schermo vuoto? (ricontrolla dopo settle per evitare flakiness)
    let empty = await page.evaluate(() => {
      const a = document.querySelector('#app'); return !a || a.innerText.trim().length < 3;
    }).catch(() => false);
    if (empty) {
      await page.waitForTimeout(120);
      empty = await page.evaluate(() => {
        const a = document.querySelector('#app'); return !a || a.innerText.trim().length < 3;
      }).catch(() => false);
      if (empty) errs.push('SCHERMO VUOTO (#app senza contenuto)');
    }
    while (errs.length) bugs.push({ run, seedN, kind, step, msg: errs.shift() });
  }

  // ---- RECUPERABILITA': dopo i click casuali, ricarico l'app (come chiudere e
  // riaprire) e verifico che il giocatore riprenda quello che stava facendo, o
  // se lo stato salvato e' corrotto/softlockato (= ripartire da zero). ----
  const salvato = await page.evaluate(() => localStorage.getItem('osr.partita.ep1')).catch(() => null);
  let saveValido = false;
  if (salvato) { try { JSON.parse(salvato); saveValido = true; } catch { errs.push('RECUPERO: partita salvata NON e\' JSON valido (corrotta)'); } }
  await page.goto(BASE, { waitUntil: 'networkidle' }).catch((e) => errs.push('RECUPERO: reload fallito ' + e.message));
  await page.waitForTimeout(250);
  const dopoReload = await page.evaluate(() => {
    const a = document.querySelector('#app');
    return { testo: a ? a.innerText.trim().length : 0,
      azionabili: a ? a.querySelectorAll('button,[data-tessera],[data-abil-usa],[data-turno-eroe],.tessera-episodio,.voce,.scelta-btn,[id]').length : 0 };
  }).catch(() => ({ testo: 0, azionabili: 0 }));
  if (dopoReload.testo < 3) errs.push('RECUPERO: dopo il reload lo schermo e\' VUOTO (non recuperabile)');
  else if (dopoReload.azionabili === 0) errs.push('RECUPERO: dopo il reload NESSUN elemento azionabile (softlock)');
  // se esiste una partita valida, deve potersi RIPRENDERE: home -> ep1 -> continua
  if (saveValido) {
    try {
      const tile = page.locator('.tessera-episodio[data-ep="ep1"]');
      if (await tile.count()) {
        await tile.click({ timeout: 1000 });
        await page.waitForTimeout(200);
        const cont = page.locator('#continua');
        if (await cont.count()) {
          await cont.click({ timeout: 1000 });
          await page.waitForTimeout(300);
          const ripreso = await page.evaluate(() => {
            const a = document.querySelector('#app');
            return { testo: a ? a.innerText.trim().length : 0,
              azionabili: a ? a.querySelectorAll('button,[data-tessera],[data-abil-usa],[data-turno-eroe],.scelta-btn,[id]').length : 0 };
          });
          if (ripreso.testo < 3) errs.push('RIPRESA: schermo vuoto dopo "continua" (partita non riprendibile)');
          else if (ripreso.azionabili === 0) errs.push('RIPRESA: nessun elemento azionabile dopo "continua" (softlock)');
        }
      }
    } catch (e) { errs.push('RIPRESA: eccezione nel riprendere la partita — ' + e.message.slice(0, 120)); }
  }
  while (errs.length) bugs.push({ run, seedN, kind, step: 'recupero', msg: errs.shift() });

  await page.close();
  process.stdout.write(`  run ${run} (${kind}, seed ${seedN}): ${CLICKS} click${saveValido ? ' + ripresa' : ''}\n`);
}
await browser.close();

// dedup per messaggio (normalizzato)
const uniq = new Map();
for (const b of bugs) {
  const key = b.msg.replace(/\d+/g, '#').slice(0, 160);
  if (!uniq.has(key)) uniq.set(key, { ...b, count: 0 });
  uniq.get(key).count += 1;
}
console.log(`\n=== ${totalClicks} click totali su ${RUNS} sessioni ===`);
if (!uniq.size) { console.log('NESSUN BUG: zero errori JS, zero schermi vuoti, zero 5xx.'); }
else {
  console.log(`${uniq.size} tipi di problema (${bugs.length} occorrenze):`);
  for (const [, b] of uniq) console.log(`  [x${b.count}] (${b.kind}, seed ${b.seedN}, click #${b.step}) ${b.msg}`);
}
process.exit(uniq.size ? 1 : 0);
