// «DADI DELLA NOTTE: L'APP» — dopo la fase Minaccia la notte si tira da sola: nessuna finestra dei
// dadi chiede un numero per gli attacchi dei nemici. Segnalato al tavolo: subito dopo la Minaccia
// l'app chiedeva un dado per ogni eroe attaccato, anche con l'interruttore su «l'app».
//
// Uso:  node webapp/server.js ; node webapp/test-notte-app-ui.mjs
import { chromium } from 'playwright';

const [A, B] = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errori = [];
pg.on('pageerror', (e) => errori.push(e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await pg.evaluate(async ({ party }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = { v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione', nemiciApp: true,
    rng: { seme: 11, passo: 0 },
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1'], stanzeLette: ['T1'],
      grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T1', x: 1, y: 1 } },
      vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [party[0], party[1]], eroiAttivo: null,
      scortati: [{ liberato: false, pos: null, mosso: false }], insidie: {}, abilita: {}, provaVento: { round: 2, chi: [] },
      mazzo: { pool: ['Quiete — Presagio'], ordine: [0, 0, 0], indice: 0 }, pendenza: null,
      nemici: [{ nome: 'LO SGHERRO', num: 1, ferite: 0, max: 2, pos: { t: 'T1', x: 3, y: 1 } },
               { nome: 'LO SGHERRO', num: 2, ferite: 0, max: 2, pos: { t: 'T1', x: 1, y: 2 } }] } };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: [A, B] });

await pg.waitForSelector('#fase-minaccia');
await pg.click('#fase-minaccia');
let chiesti = 0;
for (let i = 0; i < 80; i++) {
  if (await pg.locator('.dadi-overlay [data-tot]').count()) { chiesti += 1; await pg.click('.dadi-overlay [data-tot="7"]').catch(() => {}); }
  if (await pg.locator('#dadi-chiudi').isVisible().catch(() => false)) await pg.click('#dadi-chiudi').catch(() => {});
  if (await pg.locator('#ok-msg').isVisible().catch(() => false)) await pg.click('#ok-msg').catch(() => {});
  if (await pg.evaluate(() => window.__partita.spedizione.round) >= 3 && await pg.locator('#col-eroi').count()) break;
  await pg.waitForTimeout(250);
}
const log = await pg.evaluate(() => window.__partita.spedizione.log.join('\n'));
ok(/sgherro (colpisce|manca)/.test(log), 'la notte ha agito: gli sgherri hanno attaccato');
ok(chiesti === 0, `nessuna finestra dei dadi chiede un numero per gli attacchi (${chiesti} chieste)`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
