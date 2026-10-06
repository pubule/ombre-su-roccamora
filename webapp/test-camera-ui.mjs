// LA CAMERA NON SI MUOVE SE NON SERVE: a ogni mossa la plancia si ricostruisce,
// ma lo scroll non deve ripartire da 0 per poi scorrere fino all'eroe.
//
// Uso:  node webapp/server.js ; node webapp/test-camera-ui.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = 'http://localhost:8017';
const EP = JSON.parse(readFileSync('webapp/data/ep11.json', 'utf8'));
const [ELENA, SIBILLA] = ['ELENA FOSCO', 'SIBILLA REVE'];
const T0 = EP.tessere[0].id;
const ESP = EP.tessere.find((t) => t.esposta).id;

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(async ({ party, t0, esp }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = {
    v: 1, episodio: 'ep11', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
    vantaggi: { tier: 'preparati' },
    spedizione: {
      digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [t0, esp], stanzeLette: [t0, esp], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: esp, x: 3, y: 1 }, [party[1]]: { t: t0, x: 3, y: 1 } },
      vite: { [party[0]]: 6, [party[1]]: 6 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {},
      nemici: [], provaVento: { round: 2, chi: [] },
    },
  };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: [ELENA, SIBILLA], t0: T0, esp: ESP });
await page.waitForSelector('.board-digitale');
await page.waitForTimeout(1500);

const scroll = () => page.evaluate(() => { const w = document.querySelector('#board-wrap'); return [Math.round(w.scrollLeft), Math.round(w.scrollTop)]; });
const prima = await scroll();
ok(prima[0] + prima[1] > 0, `la camera e' centrata sull'eroe (scroll ${prima})`);

// l'eroe fa un passo: la plancia si ridisegna e la camera puo' spostarsi, ma solo
// fra la vista di prima e quella di dopo — mai passando da 0
await page.evaluate(() => {
  window.__campioni = []; const w = () => document.querySelector('#board-wrap');
  const t0 = performance.now();
  const giro = () => { if (w()) window.__campioni.push([Math.round(w().scrollLeft), Math.round(w().scrollTop)]); if (performance.now() - t0 < 2000) requestAnimationFrame(giro); };
  giro();
});
ok(await page.locator('.cella-mossa').count() > 0, 'ci sono caselle dove muoversi');
await page.evaluate(() => document.querySelector('.cella-mossa').click());
await page.waitForTimeout(2200);
const campioni = await page.evaluate(() => window.__campioni);
const dopo = campioni[campioni.length - 1];
const fuori = campioni.filter(([l, t]) => l < Math.min(prima[0], dopo[0]) - 3 || l > Math.max(prima[0], dopo[0]) + 3
  || t < Math.min(prima[1], dopo[1]) - 3 || t > Math.max(prima[1], dopo[1]) + 3);
ok(campioni.length > 20, `campionati ${campioni.length} fotogrammi`);
ok(fuori.length === 0, `la camera resta fra ${prima} e ${dopo} (fuori: ${JSON.stringify(fuori.slice(0, 3))})`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
