// MENTRE AGISCE LA NOTTE chi guarda dal telefono non vede eroi di turno, ne' caselle verdi,
// ne' tasti d'azione.
//
// Uso:  node webapp/server.js ; node webapp/test-notte-ui.mjs
import { chromium } from 'playwright';

const [A, B] = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
const avvia = (fase) => page.evaluate(async ({ party, fase }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = { v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 2, canto: 1, cantoBonus: false, fase, esito: null, rivelate: ['T1'], stanzeLette: ['T1'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T1', x: 1, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 2, chi: [] } } };
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, { ruolo: 'eroe', eroi: [party[0]] });
}, { party: [A, B], fase });
const conta = (sel) => page.locator(sel).count();

await avvia('eroi');
await page.waitForSelector('.board-digitale');
ok(await conta('.cella-mossa') > 0, 'turno degli eroi: ci sono le caselle verdi (controllo del test)');
ok(await conta('.tok-board.attivo') > 0, 'turno degli eroi: c e un eroe attivo');

await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await avvia('nemici');
await page.waitForSelector('.board-digitale');
await page.waitForTimeout(500);
ok(await conta('.cella-mossa') === 0, 'notte: nessuna casella verde');
ok(await conta('.tok-board.attivo') === 0, 'notte: nessun eroe attivo sulla plancia');
ok(!/di turno/i.test(await page.evaluate(() => document.body.innerText)), 'notte: nessuna carta «di turno»');
ok(await conta('#az-fine, #az-cercare, #az-interagire') === 0, 'notte: nessun tasto d azione');
// la notte si anima SUL telefono mentre lo stato e' gia' quello del round dopo: un ridisegno
// in mezzo mostrerebbe gli eroi di turno sopra i nemici che colpiscono
await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await avvia('eroi');
await page.waitForSelector('.board-digitale');
await page.evaluate(async () => {
  const m = (await import('/js/digitale.js'))._motore;
  m.impostaNotte(true);
  document.querySelector('#app').dataset.segno = 'resta';
  document.querySelector('.board-digitale').dataset.segno = 'resta';
  m.render();
});
ok(await page.evaluate(() => document.querySelector('.board-digitale').dataset.segno === 'resta'), 'durante la notte il telefono non si ridisegna');
await page.evaluate(async () => { const m = (await import('/js/digitale.js'))._motore; m.impostaNotte(false); m.render(); });
ok(await page.evaluate(() => document.querySelector('.board-digitale').dataset.segno !== 'resta'), 'finita la notte il ridisegno riparte');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
