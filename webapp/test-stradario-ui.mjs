// LO STRADARIO SULLA MAPPA (la lanterna nella nebbia, mockups/stradario/c-lanterna.html):
// lumini sulla mappa, le vie battute accese, la via scelta con cartiglio e lastra «andate qui»,
// la ricerca che spegne i lumini, lo zoom, l'elenco a scomparsa sul telefono.
//
// Uso:  node webapp/server.js ; node webapp/test-stradario-ui.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const C = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const party = C.eroi.slice(0, 3).map((e) => e.nome);
const luogo = EP.luoghi.find((l) => l.n === 1);
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
async function apri(w, h, id = 'ep1', titolo = EP.titolo) {
  const pg = await browser.newPage({ viewport: { width: w, height: h } });
  const errori = [];
  pg.on('pageerror', (e) => errori.push(e.message));
  await pg.goto('http://localhost:8017', { waitUntil: 'domcontentloaded' });
  await pg.evaluate(({ p, id }) => {
    localStorage.clear();
    localStorage.setItem(`osr.partita.${id}`, JSON.stringify({ v: 1, episodio: id, modo: 'digitale', plancia: 'schermo', party: p, creata: Date.now(), fase: 'indagine',
      indagine: { ora: 21, lettaLettera: true, visitati: [3, 4], scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: false },
      vantaggi: { tier: 'preparati' }, spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null } }));
  }, { p: party, id });
  await pg.goto('http://localhost:8017', { waitUntil: 'domcontentloaded' });
  await pg.getByText(titolo).first().click();
  await pg.waitForSelector('#apri-caso'); await pg.click('#apri-caso');
  await pg.waitForSelector('#str-mappa');
  return { pg, errori };
}

// ---- schermo largo: la mappa e l'elenco affiancati
let { pg, errori } = await apri(1440, 900);
const pins = await pg.locator('.str-pin').count();
const voci = await pg.locator('.voce[data-voce]').count();
ok(pins > 8 && pins === voci, `un lumino per ogni via con posizione (${pins} lumini, ${voci} vie nell elenco)`);
ok(await pg.locator('.str-pin.battuta').count() === 2, 'le due vie battute sono accese');
ok(await pg.locator('.str-fianco').isVisible(), 'sullo schermo largo l elenco sta di fianco');
ok(/la citt. . al buio/i.test(await pg.locator('#str-dichiara').innerText()), 'prima di scegliere la lastra dice «la citta e al buio»');

// la luna tra la nebbia: uno strato di luce che non intercetta i tocchi e si muove piano
ok(await pg.evaluate(() => {
  const l = document.querySelector('.str-luna'); if (!l) return false;
  const a = getComputedStyle(l.querySelector('.alone'));
  return getComputedStyle(l).pointerEvents === 'none' && a.animationName !== 'none';
}), 'la luna tra la nebbia c e, non intercetta i tocchi e respira');
await pg.locator('.str-pin:not(.battuta)').first().click({ force: true });
ok(await pg.locator('.str-pin.scelto').count() === 1, 'toccato un lumino diventa la lanterna');
ok(await pg.locator('#str-cartiglio').isVisible(), 'il cartiglio col nome compare sulla mappa');
ok(await pg.locator('#str-andate').count() === 1, 'la lastra offre «andate qui»');
ok(await pg.evaluate(() => document.querySelector('#str-luce').getAttribute('cx') !== '-50'), 'la luce della lanterna si sposta sulla via');

await pg.fill('#cerca-via', 'cattedrale');
ok(await pg.locator('.str-pin.spento').count() > 0 && await pg.locator('.str-pin:not(.spento)').count() < pins, 'la ricerca spegne i lumini che non c entrano');
await pg.fill('#cerca-via', '');

await pg.click('#str-piu');
ok(await pg.evaluate(() => document.querySelector('#str-mappa').style.width) === '160%', 'lo zoom + allarga la mappa');

// «andate qui» dichiara davvero: l'ora si spende (o la pista e' fredda e non costa)
await pg.locator(`.voce[data-voce="${luogo.voce_mappa}"]`).click();
await pg.click('#str-andate');
await pg.waitForTimeout(800);
const ora = await pg.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep1')).indagine);
ok(ora.luogoAperto != null || ora.ora < 21 || (ora.visitati || []).length > 2, 'andate qui dichiara la via al motore');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await pg.close();

// ---- telefono: l'elenco e' un ripiego a scomparsa
({ pg, errori } = await apri(390, 844));
ok(!(await pg.locator('.str-fianco').isVisible()), 'sul telefono l elenco e chiuso');
await pg.click('#str-piega');
ok(await pg.locator('.str-fianco').isVisible(), 'il tasto «l elenco delle vie» lo apre');
const sfora = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok(sfora <= 0, `niente sforamento in larghezza (${sfora}px)`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await pg.close();

// ---- il cartiglio non esce mai dalla mappa, per nessuna via (Ep.2 ha la Corte della Faenza, a sinistra)
const EP2 = JSON.parse(readFileSync('webapp/data/ep2.json', 'utf8'));
({ pg, errori } = await apri(390, 844, 'ep2', EP2.titolo));
const nomi = await pg.locator('.str-pin').evaluateAll((els) => els.map((e) => e.dataset.voce));
const fuori = [];
for (const nome of nomi) {
  await pg.locator(`.str-pin[data-voce="${nome}"]`).click({ force: true });
  const r = await pg.evaluate(() => {
    const c = document.querySelector('#str-cartiglio').getBoundingClientRect();
    const m = document.querySelector('#str-mappa').getBoundingClientRect();
    return { l: c.left - m.left, r: m.right - c.right, t: c.top - m.top };
  });
  if (r.l < -1 || r.r < -1 || r.t < -1) fuori.push(`${nome} (${Math.round(r.l)}, ${Math.round(r.r)}, ${Math.round(r.t)})`);
}
ok(nomi.length > 20 && fuori.length === 0, `nessun cartiglio tagliato su ${nomi.length} vie${fuori.length ? ': ' + fuori.slice(0, 4).join('; ') : ''}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
