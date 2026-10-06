// ENTRANDO IN UNA STANZA il testo non compare prima dell'immagine: con l'arte
// lenta il pannello resta invisibile, poi appare tutto insieme.
//
// Uso:  node webapp/server.js ; node webapp/test-carta-stanza-ui.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const EP = JSON.parse(readFileSync('webapp/data/ep11.json', 'utf8'));
const [A, B] = ['ELENA FOSCO', 'SIBILLA REVE'];
const T0 = EP.tessere[0].id; const ESP = EP.tessere.find((t) => t.esposta).id;
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.route(/\/T\d+-ep11\.png/, async (r) => { await new Promise((x) => setTimeout(x, 900)); r.continue(); });
await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await page.evaluate(async ({ party, t0, esp }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = { v: 1, episodio: 'ep11', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, rivelate: [t0, esp], stanzeLette: [t0, esp], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: esp, x: 3, y: 1 }, [party[1]]: { t: t0, x: 3, y: 1 } }, vite: { [party[0]]: 6, [party[1]]: 6 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 2, chi: [] },
      carta: { tessera: t0, titolo: 'una stanza', testo: 'Un testo che non deve comparire da solo.', annunci: [] } },
  };
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: [A, B], t0: T0, esp: ESP });
await page.waitForSelector('.pannello img', { state: 'attached' });
const opacita = () => page.evaluate(() => getComputedStyle(document.querySelector('.pannello')).opacity);
await page.waitForTimeout(300);
ok(await opacita() === '0', `a immagine non arrivata il pannello e' invisibile (opacita ${await opacita()})`);
await page.waitForTimeout(1500);
ok(await opacita() === '1', `arrivata l'immagine il pannello compare (opacita ${await opacita()})`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
