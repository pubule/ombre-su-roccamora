// L'INSIDIA DI UNA CARTA MINACCIA SI TIRA. La carta aperta si disegna dallo
// stato (schermataCarta in digitale.js); quella schermata aveva perso il
// bottone della prova: «Ogni eroe prova NERVI» compariva, si premeva
// «continua» e nessuno tirava. Qui: «continua» nascosto finche' ogni eroe non
// ha tirato, poi compare — e un fallimento stordisce.
//
// Uso:  node webapp/server.js ; node webapp/test-carta-insidia.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = 'http://localhost:8017';
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const CARTA = CARTE.minacce.ep1.find((c) => /Ogni eroe prova NERVI/.test(c.rules));
const PARTY = COMUNE.eroi.slice(0, 2).map((e) => e.nome);

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(async ({ party, carta }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const eroiPos = {}; const vite = {};
  party.forEach((n, i) => { eroiPos[n] = { t: 'T1', x: i, y: 1 }; vite[n] = 6; });
  const partita = {
    v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
    vantaggi: { tier: 'preparati' },
    spedizione: {
      digitale: true, round: 1, canto: 1, cantoBonus: false, fase: 'minaccia', esito: null,
      rivelate: ['T1'], stanzeLette: ['T1'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
      scortati: [], mazzo: { ordine: [0], indice: 1 }, pendenza: null, insidie: {}, abilita: {}, nemici: [],
      minacceDaPescare: 0,
      carta: { titolo: 'minaccia 1 di 1', carta: { file: carta.file, rules: carta.rules }, annunci: [] },
    },
  };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: PARTY, carta: CARTA });

await page.waitForSelector('#ins-risolvi', { timeout: 5000 }).catch(() => {});
ok(await page.locator('#ins-risolvi').count() === 1, 'la carta mostra il bottone della prova');
ok(!(await page.locator('#ok-msg').isVisible()), '«continua» e’ nascosto finche’ non si tira');

await page.click('#ins-risolvi');
for (let i = 0; i < PARTY.length; i++) {
  await page.waitForSelector('.dadi-overlay [data-tot="2"]', { timeout: 5000 });
  await page.click('.dadi-overlay [data-tot="2"]');                 // 2 + bonus: fallisce
  await page.waitForSelector('#dadi-chiudi', { state: 'visible', timeout: 8000 });
  await page.click('#dadi-chiudi');
  await page.waitForTimeout(300);
}
await page.waitForSelector('#ok-msg', { state: 'visible', timeout: 5000 }).catch(() => {});
ok(await page.locator('#ok-msg').isVisible(), 'dopo la prova di tutti compare «continua»');
const st = await page.evaluate(() => window.__partita.spedizione.storditi);
ok(PARTY.every((n) => st[n] === 2), `chi ha fallito e’ stordito: ${JSON.stringify(st)}`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
