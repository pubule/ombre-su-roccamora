// IL FAVORE SI SCEGLIE DALLA SCHERMATA DELLA CARTA: bottoni delle porte, niente
// «continua» finche' non si sceglie, il clic rivela la tessera.
// Uso:  node webapp/server.js ; node webapp/test-favore-ui.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = 'http://localhost:8017';
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const CARTA = CARTE.minacce.ep1.find((c) => /rivelate una tessera coperta adiacente/i.test(c.rules.split('{divider}').pop()));
const PARTY = COMUNE.eroi.slice(0, 2).map((e) => e.nome);

let ko = 0;
const ok = (c, m) => { if (!c) ko++; console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

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
      carta: { titolo: 'minaccia 1 di 1', carta: { file: carta.file, rules: carta.rules }, annunci: [],
        favore: { candidati: [{ da: 'T1', dir: 'N', dest: 'T2' }] } },
    },
  };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: PARTY, carta: CARTA });

await page.waitForSelector('.fav-scelta', { timeout: 5000 }).catch(() => {});
ok(await page.locator('.fav-scelta').count() === 1, 'un bottone per ogni porta candidata');
ok(!(await page.locator('#ok-msg').isVisible()), '«continua» nascosto finche’ non si sceglie');
const testo = await page.locator('.fav-scelta').innerText();
ok(/nord/i.test(testo), `il bottone dice la direzione: ${testo.replace(/\n/g, ' ')}`);
await page.click('.fav-scelta');
await page.waitForTimeout(800);
const sp = await page.evaluate(() => window.__partita.spedizione);
ok(sp.rivelate.includes('T2'), `dopo il clic T2 e’ rivelata: ${JSON.stringify(sp.rivelate)}`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
