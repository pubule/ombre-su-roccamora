// LE CASSE DI OSSA nell'app (Ep.5): il tasto su T5, la prova con la Domanda 3 sbagliata, e
// il conto nell'epilogo.
//
// Uso:  node webapp/server.js ; node webapp/test-casse-ui.mjs
import { chromium } from 'playwright';

const [A, B] = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
const avvia = (esito) => page.evaluate(async ({ party, esito }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = { v: 1, episodio: 'ep5', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
    vantaggi: { tier: 'preparati', risposte: [true, false, false, true] },
    spedizione: { digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'eroi', esito, rivelate: ['T1', 'T5'], stanzeLette: ['T1', 'T5'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T5', x: 1, y: 1 }, [party[1]]: { t: 'T1', x: 2, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 2, chi: [] },
      secondari: { casse: 3 }, effetti: { prova_secondari: { casse: { attr: 'acume', diff: 'Media' } } } } };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: [A, B], esito });

await avvia(null);
await page.waitForSelector('#az-interagire');
ok(/cassa di ossa.*3\/4/i.test(await page.locator('#az-interagire').innerText()), 'il tasto Interagire dice «cassa di ossa (3/4)»');
await page.click('#az-interagire');
await page.waitForSelector('.dadi-overlay [data-tot="12"]', { timeout: 5000 });
ok(/media/i.test(await page.locator('.dadi-overlay').innerText()), 'con la Domanda 3 sbagliata c e la prova ACUME Media');
await page.click('.dadi-overlay [data-tot="12"]');
await page.waitForSelector('#dadi-chiudi', { state: 'visible', timeout: 8000 });
await page.click('#dadi-chiudi');
await page.waitForTimeout(800);
ok((await page.evaluate(() => window.__partita.spedizione.secondari.casse)) === 4, 'prova riuscita: 4 casse in salvo');
ok(await page.locator('#az-interagire').count() === 0 || !/cassa/i.test(await page.locator('#az-interagire').innerText()), 'finite le casse il tasto sparisce');

await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await avvia('vittoria');
await page.waitForSelector('#al-menu');
ok(/Casse di ossa in salvo:\s*3 su 4/i.test(await page.evaluate(() => document.body.innerText)), 'l epilogo dice quante casse sono in salvo');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
