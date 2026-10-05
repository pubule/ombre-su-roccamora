// LA STANZA SI LEGGE PRIMA DEL TIRO D'INGRESSO. Entrando per la prima volta in
// una tessera con insidia (Ep.1 T3, «prova NERVI»), l'app chiedeva il dado e solo
// dopo mostrava la descrizione che spiega la prova: il dado si chiede prima di
// mandare la mossa, mentre il testo nasce con la mossa (esegui() in digitale.js).
// Ordine giusto: descrizione -> «continua» -> dadi -> plancia, e la descrizione
// non riappare dopo il tiro.
//
// Uso:  node webapp/server.js ; node webapp/test-stanza-prima-del-tiro.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = 'http://localhost:8017';
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const PARTY = COMUNE.eroi.slice(0, 2).map((e) => e.nome);
const INS = 'T3', DA = 'T2';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(async ({ party, da }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const eroiPos = {}; const vite = {};
  party.forEach((n, i) => { eroiPos[n] = { t: da, x: 3, y: 1 + i }; vite[n] = 6; });
  const partita = {
    v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
    vantaggi: { tier: 'preparati' },
    spedizione: {
      digitale: true, round: 1, canto: 1, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: ['T1', da], stanzeLette: ['T1', da], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {},
      nemici: [],
    },
  };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: PARTY, da: DA });
await page.waitForSelector('.board-digitale');

await page.locator(`.cella-mossa[data-reveal="${INS}"]`).first().click({ force: true });
await page.waitForSelector('#ok-msg', { timeout: 5000 }).catch(() => {});
const prima = await page.evaluate(() => ({
  descrizione: !!document.querySelector('#ok-msg'),
  dadi: !!document.querySelector('.dadi-overlay'),
  testo: (document.querySelector('.pannello') || {}).textContent || '',
}));
ok(prima.descrizione && !prima.dadi, 'dopo la mossa si vede la descrizione, non ancora i dadi');
ok(/NERVI/i.test(prima.testo), 'la descrizione spiega la prova');

await page.click('#ok-msg');
await page.waitForSelector('.dadi-overlay [data-tot="12"]', { timeout: 5000 });
ok(true, 'letta la stanza, compaiono i dadi');
await page.click('.dadi-overlay [data-tot="12"]');
await page.waitForSelector('#dadi-chiudi', { state: 'visible', timeout: 8000 });
await page.click('#dadi-chiudi');
await page.waitForSelector('.board-digitale', { timeout: 8000 });
await page.waitForTimeout(500);
const dopo = await page.evaluate(() => ({
  descrizione: !!document.querySelector('#ok-msg'),
  carta: window.__partita.spedizione.carta || null,
  rivelata: window.__partita.spedizione.rivelate.includes('T3'),
}));
ok(dopo.rivelata, 'la tessera e’ rivelata');
ok(!dopo.descrizione && !dopo.carta, 'dopo il tiro la descrizione non torna e nessuna carta resta aperta');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
