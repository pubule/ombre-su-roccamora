// CERCARE e trovare un oggetto mostra la CARTA dell'oggetto, non solo il testo.
//
// Uso:  node webapp/server.js ; node webapp/test-cerca-carta-ui.mjs
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
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1', 'T2'], stanzeLette: ['T1', 'T2'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T2', x: 2, y: 1 }, [party[1]]: { t: 'T1', x: 2, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 2, chi: [] } } };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: [A, B] });
await page.waitForSelector('#az-cercare');
await page.click('#az-cercare');
await page.waitForSelector('.dadi-overlay [data-tot="12"]', { timeout: 5000 });
await page.click('.dadi-overlay [data-tot="12"]');
await page.waitForSelector('#dadi-chiudi', { state: 'visible', timeout: 8000 });
await page.click('#dadi-chiudi');
await page.waitForSelector('#ok-msg', { timeout: 5000 });
ok(/Trovato/.test(await page.evaluate(() => document.body.innerText)), 'il messaggio dice cosa e stato trovato');
ok(await page.locator('.carta-grande img').count() > 0, 'sopra il testo c e la carta dell oggetto');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
