// LA NOTTE VISTA DA CHI ARBITRA: mentre i nemici si muovono e colpiscono nessun eroe e'
// attivo sulla plancia, e non ci sono caselle verdi ne' HUD degli eroi. Una partita vera di Ep.1.
//
// Uso:  node webapp/server.js ; node webapp/test-notte-arbitro-ui.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const C = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const party = C.eroi.slice(0, 3).map((e) => e.nome);
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'domcontentloaded' });
await pg.evaluate(({ p, id }) => {
  localStorage.clear();
  localStorage.setItem(`osr.partita.${id}`, JSON.stringify({ v: 1, episodio: id, modo: 'digitale', plancia: 'schermo', party: p, creata: Date.now(), fase: 'spedizione',
    indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: true },
    vantaggi: { tier: 'preparati' }, spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null } }));
}, { p: party, id: 'ep1' });
await pg.goto('http://localhost:8017', { waitUntil: 'domcontentloaded' });
await pg.getByText(EP.titolo).first().click();
await pg.waitForSelector('#apri-caso'); await pg.click('#apri-caso');
await pg.waitForSelector('#via'); await pg.click('#via');
// i tempi veri: quando il duello della notte cambia l'ultima volta e quando la plancia torna agli eroi
await pg.evaluate(() => {
  window.__gap = []; let nato = 0; let attesa = false;
  new MutationObserver((ms) => {
    for (const m of ms) for (const n of m.addedNodes) {
      if (n.nodeType === 1 && n.closest && n.closest('#duello.notturno')) { nato = performance.now(); attesa = true; }
    }
    if (attesa && document.querySelector('#col-eroi')) { window.__gap.push(Math.round(performance.now() - nato)); attesa = false; }
  }).observe(document.body, { childList: true, subtree: true });
});

const istante = () => pg.evaluate(() => ({
  hud: !!document.querySelector('#col-eroi'),
  celle: document.querySelectorAll('.cella-mossa').length,
  attivo: document.querySelectorAll('.tok-board.attivo').length,
  banner: [...document.querySelectorAll('#duello.notturno')].map((x) => x.innerText.replace(/\n/g, ' ')).join('|'),
  notte: document.querySelectorAll('.attivo-nem').length,
  bannerNotte: document.querySelectorAll('#duello.notturno, .dmg-pop').length,
}));
const campioni = [];
const presto = [];   // istanti in cui la plancia e' gia' degli eroi ma la notte sta ancora parlando
let finita = false;   // la notte e' finita e la plancia e' tornata agli eroi
for (let giro = 0; giro < 800 && !(campioni.length >= 6 && finita); giro++) {
  // le carte che chiedono qualcosa prima di «continua»: una prova d'insidia, la porta di un Favore
  if (await pg.locator('#ins-risolvi').isVisible().catch(() => false)) await pg.click('#ins-risolvi').catch(() => {});
  if (await pg.locator('.fav-scelta').count()) await pg.locator('.fav-scelta').first().click().catch(() => {});
  const msg = pg.locator('#ok-msg');
  if (await msg.count() && await msg.isVisible()) await msg.click().catch(() => {});
  if (await pg.locator('.dadi-overlay [data-tot="7"]').count()) await pg.click('.dadi-overlay [data-tot="7"]').catch(() => {});
  if (await pg.locator('#dadi-chiudi').isVisible().catch(() => false)) await pg.click('#dadi-chiudi').catch(() => {});
  const s = await istante();
  if (s.notte || /agisce|colpisce|manca/.test(s.banner)) campioni.push(s);
  if ((s.hud || s.celle > 0) && s.bannerNotte > 0) presto.push(s);
  if (campioni.length >= 6 && s.hud) finita = true;
  const fm = pg.locator('#fase-minaccia');
  if (await fm.count() && await fm.isVisible()) await fm.click().catch(() => {});
  else {
    for (const nm of party) {
      const t = pg.locator(`[data-turno="${nm}"]`);
      if (await t.count()) {
        await t.first().click().catch(() => {});
        const f = pg.locator('#az-fine');
        if (await f.count()) await f.click().catch(() => {});
      }
    }
  }
  await pg.waitForTimeout(150);
}
const gap = await pg.evaluate(() => window.__gap);
await b.close();

ok(campioni.length >= 3, `campionati ${campioni.length} istanti di notte`);
ok(campioni.every((s) => s.attivo === 0), 'durante la notte nessun eroe e attivo sulla plancia');
ok(campioni.every((s) => s.celle === 0), 'durante la notte nessuna casella verde');
ok(campioni.every((s) => !s.hud), 'durante la notte non c e l HUD degli eroi');
ok(gap.length > 0 && gap.every((g) => g >= 1900), `dopo l ultimo banner della notte la plancia torna agli eroi solo quando e sparito (${JSON.stringify(gap)} ms)`);
ok(presto.length === 0, `la plancia torna agli eroi solo quando la notte ha finito di parlare (${presto.length} istanti in anticipo)`);
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
