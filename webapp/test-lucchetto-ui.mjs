// IL LUCCHETTO nell'app (Ep.1, Domanda 3 sbagliata): il tasto compare su T1, il tiro
// lo risolve, e a prova riuscita il tasto sparisce.
//
// Uso:  node webapp/server.js ; node webapp/test-lucchetto-ui.mjs
import { chromium } from 'playwright';

const [A, B] = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await page.evaluate(async ({ party }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = { v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: ['UN PIEDE DI PORCO'], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
    vantaggi: { tier: 'preparati', risposte: [true, true, false, true] },
    spedizione: { digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1'], stanzeLette: ['T1'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T1', x: 1, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 2, chi: [] },
      effetti: { porta_forzata: { tile: 'T1', attr: 'acume', diff: 'Difficile', bonus: ['piede di porco'] } } } };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: [A, B] });
await page.waitForSelector('#az-interagire');
ok(/lucchetto/i.test(await page.locator('#az-interagire').innerText()), 'il tasto Interagire parla del lucchetto');
await page.click('#az-interagire');
await page.waitForSelector('.dadi-overlay [data-tot="12"]', { timeout: 5000 });
ok(/difficile/i.test(await page.locator('.dadi-overlay').innerText()), 'la prova e ACUME Difficile');
await page.click('.dadi-overlay [data-tot="12"]');
await page.waitForSelector('#dadi-chiudi', { state: 'visible', timeout: 8000 });
await page.click('#dadi-chiudi');
await page.waitForTimeout(800);
const sp = await page.evaluate(() => window.__partita.spedizione);
ok(sp.portaForzata === true, 'a prova riuscita il lucchetto cede');
ok(await page.locator('#az-interagire').count() === 0 || !/lucchetto/i.test(await page.locator('#az-interagire').innerText()), 'il tasto del lucchetto sparisce');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
