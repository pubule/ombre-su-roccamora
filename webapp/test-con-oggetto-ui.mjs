// «CON [OGGETTO]» NELLA SCHERMATA DELLA CARTA: aperta.prova toglie la prova o ne
// abbassa la difficolta'. Uso:  node webapp/server.js ; node webapp/test-con-oggetto-ui.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = 'http://localhost:8017';
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const carta = (e, t) => CARTE.minacce[e].find((c) => c.title === t);
const PARTY = COMUNE.eroi.slice(0, 2).map((e) => e.nome);

let ko = 0;
const ok = (c, m) => { if (!c) ko++; console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const errori = [];

async function apri(ep, c, prova) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => errori.push(e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async ({ party, c, prova, ep }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const eroiPos = {}; const vite = {};
    party.forEach((n, i) => { eroiPos[n] = { t: 'T1', x: i, y: 1 }; vite[n] = 6; });
    const partita = {
      v: 1, episodio: ep, modo: 'digitale', party, fase: 'spedizione',
      indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
      vantaggi: { tier: 'preparati' },
      spedizione: {
        digitale: true, round: 1, canto: 1, cantoBonus: false, fase: 'minaccia', esito: null,
        rivelate: ['T1'], stanzeLette: ['T1'], grate: [], compiti: {}, cercate: {}, log: [],
        eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
        scortati: [], mazzo: { ordine: [0], indice: 1 }, pendenza: null, insidie: {}, abilita: {}, nemici: [],
        minacceDaPescare: 0,
        carta: { titolo: 'minaccia 1 di 1', carta: { file: c.file, rules: c.rules }, annunci: [], ...(prova ? { prova } : {}) },
      },
    };
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
  }, { party: PARTY, c, prova, ep });
  await page.waitForTimeout(400);
  return page;
}

const T = carta('ep11', 'Insidia — La Tegola che Scivola');
let page = await apri('ep11', T, null);
ok(await page.locator('#ins-risolvi').count() === 1 && !(await page.locator('#ok-msg').isVisible()), 'Tegola senza Corda: la prova resta richiesta, «continua» nascosto');
await page.close();
page = await apri('ep11', T, 'nessuna');
ok(await page.locator('#ins-risolvi').count() === 0 && await page.locator('#ok-msg').isVisible(), 'Tegola con la Corda: nessuna prova, «continua» visibile');
await page.close();

const A = carta('ep20', 'Insidia — L’Acqua che Sale');
page = await apri('ep20', A, 'Facile');
await page.click('#ins-risolvi');
await page.waitForTimeout(600);
const label = await page.locator('.prova').first().innerText();
ok(/facile/i.test(label) && !/media/i.test(label), `Acqua con la Mappa: il tiro è a Facile (${label.replace(/s+/g, ' ')})`);
await page.close();

ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
