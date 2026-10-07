// IL CONFINE DELLE MOSSE (mockups/celle-mossa, variante C): al posto dei quadrati azzurri un filo
// d'oro attorno all'area raggiungibile. Al passaggio del mouse compare il percorso a puntini; sul
// telefono il primo tocco mostra il percorso e il secondo conferma. Il filo deve chiudersi: ogni
// lato sta sul bordo fra una casella dentro e una fuori.
//
// Uso:  node webapp/server.js ; node webapp/test-confine-mossa-ui.mjs
import { chromium } from 'playwright';

const party = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const browser = await chromium.launch();

async function apri(opz) {
  const pg = await browser.newPage(opz);
  const errori = [];
  pg.on('pageerror', (e) => errori.push(e.message));
  await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
  await pg.evaluate(async (party) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const partita = { v: 1, episodio: 'preludio', modo: 'digitale', party, fase: 'spedizione',
      indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
      spedizione: { digitale: true, round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1'], stanzeLette: ['T1'],
        grate: [], compiti: {}, cercate: {}, log: [], eroiPos: { [party[0]]: { t: 'T1', x: 1, y: 1 }, [party[1]]: { t: 'T1', x: 2, y: 1 } },
        vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
        scortati: [{ liberato: false, pos: null, mosso: false }], insidie: {}, abilita: {}, provaVento: { round: 2, chi: [] },
        mazzo: { ordine: [0], indice: 0 }, pendenza: null, nemici: [] } };
    window.__p = partita; document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
  }, party);
  await pg.waitForSelector('.cella-mossa');
  // passi attesi: nella stanza aperta (si passa sugli alleati) sono la distanza di Manhattan dalla partenza
  await pg.evaluate(() => { window.__dist = (k) => { const [, x, y] = k.split(',').map(Number); const p = window.__p.spedizione.eroiPos['ELENA FOSCO']; return Math.abs(x - p.x) + Math.abs(y - p.y); }; });
  return { pg, errori };
}
const pos = (pg) => pg.evaluate(() => JSON.stringify(window.__p.spedizione.eroiPos['ELENA FOSCO']));
// la casella piu' lontana fra quelle semplici: il percorso ha piu' di un passo
const lontana = (pg) => pg.evaluate(() => {
  const da = document.querySelector('.tok-slot[data-tok="E:ELENA FOSCO"]').getBoundingClientRect();
  let best = null, d0 = -1;
  for (const c of document.querySelectorAll('.cella-mossa:not(.reveal)')) {
    const r = c.getBoundingClientRect(); const d = Math.hypot(r.x - da.x, r.y - da.y);
    if (d > d0) { d0 = d; best = c.dataset.k; }
  }
  return best;
});

// PC: il filo, il percorso al passaggio, un clic muove
{
  const { pg, errori } = await apri({ viewport: { width: 1440, height: 900 } });
  const m = await pg.evaluate(() => {
    const blu = [...document.querySelectorAll('.cella-mossa')].filter((c) => /127, 230, 219|95, 184, 176/.test(getComputedStyle(c).backgroundColor + getComputedStyle(c).borderColor)).length;
    const cell = parseFloat(document.querySelector('.cella-mossa').style.width);
    const dentro = new Set([...document.querySelectorAll('.cella-mossa')].map((c) => `${parseFloat(c.style.left)},${parseFloat(c.style.top)}`));
    const lati = [...document.querySelectorAll('.confine-mossa')].map((l) => [parseFloat(l.style.left), parseFloat(l.style.top), parseFloat(l.style.width), parseFloat(l.style.height)]);
    return { blu, cell, lati: lati.length, celle: dentro.size };
  });
  ok(m.blu === 0, 'niente quadrati azzurri');
  ok(m.lati >= 4 && m.celle > 0, `il filo d'oro c'e' (${m.lati} lati attorno a ${m.celle} caselle)`);
  const k = await lontana(pg);
  await pg.locator(`.cella-mossa[data-k="${k}"]`).hover();
  const passi = await pg.locator('.passo-mossa').count();
  ok(passi >= 4, `al passaggio del mouse compare il percorso a puntini (${passi} puntini verso ${k})`);
  // anche passando sopra un alleato (Attilio in T1,2,1) il percorso non si spezza: due puntini per passo
  for (const kk of ['T1,3,1', k]) {
    await pg.locator(`.cella-mossa[data-k="${kk}"]`).hover();
    const n = await pg.locator('.passo-mossa').count(); const d = await pg.evaluate((x) => window.__dist(x), kk);
    ok(n === 2 * d, `il percorso verso ${kk} ha tutti i passi (${n} puntini, ${d} passi)`);
  }
  await pg.mouse.move(5, 5);
  ok(await pg.locator('.passo-mossa').count() === 0, 'uscendo dalla casella il percorso sparisce');
  const prima = await pos(pg);
  await pg.locator(`.cella-mossa[data-k="${k}"]`).click();
  await pg.waitForTimeout(700);
  ok(await pos(pg) !== prima, 'col mouse un clic muove');
  ok(errori.length === 0, `PC: nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
  await pg.close();
}

// TELEFONO: il primo tocco mostra il percorso, il secondo conferma
{
  const { pg, errori } = await apri({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const k = await lontana(pg);
  const prima = await pos(pg);
  await pg.locator(`.cella-mossa[data-k="${k}"]`).tap();
  await pg.waitForTimeout(500);
  ok(await pos(pg) === prima && await pg.locator('.passo-mossa').count() >= 4, 'telefono: il primo tocco mostra il percorso e non muove');
  await pg.locator(`.cella-mossa[data-k="${k}"]`).tap();
  await pg.waitForTimeout(700);
  ok(await pos(pg) !== prima, 'telefono: il secondo tocco sulla stessa casella muove');
  ok(errori.length === 0, `telefono: nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
  await pg.close();
}
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
