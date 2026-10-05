// LE PROVE DEL VENTO nell'app (Ep.11): a inizio round chi sta su tessera ESPOSTA
// prova NERVI prima di agire. Il pannello elenca chi deve tirare, chi arbitra
// tira, il fallimento toglie lo scatto e a fine coda tornano le azioni.
//
// Uso:  node webapp/server.js ; node webapp/test-vento-ui.mjs
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'fs';

const BASE = 'http://localhost:8017';
const EP = JSON.parse(readFileSync('webapp/data/ep11.json', 'utf8'));
const [ELENA, SIBILLA] = ['ELENA FOSCO', 'SIBILLA REVE'];
const T0 = EP.tessere[0].id;
const ESP = EP.tessere.find((t) => t.esposta).id;

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
mkdirSync('webapp/screenshot-prova', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(async ({ party, t0, esp }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = {
    v: 1, episodio: 'ep11', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
    vantaggi: { tier: 'preparati' },
    spedizione: {
      digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'eroi', esito: null,
      rivelate: [t0, esp], stanzeLette: [t0, esp], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: esp, x: 3, y: 1 }, [party[1]]: { t: t0, x: 3, y: 1 } },
      vite: { [party[0]]: 6, [party[1]]: 6 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {},
      nemici: [], provaVento: { round: 2, chi: [party[0]] },
    },
  };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, { party: [ELENA, SIBILLA], t0: T0, esp: ESP });
await page.waitForSelector('.board-digitale');

const pannello = () => page.evaluate(() => document.body.innerText);
const testo = await pannello();
ok(/Il vento sale/.test(testo), 'il pannello annuncia il vento');
ok(await page.locator('[data-vento]').count() === 1 && await page.locator(`[data-vento="${ELENA}"]`).count() === 1, 'in coda solo chi sta su tessera ESPOSTA, col tasto «tira» per chi arbitra');
ok(await page.locator('#az-fine, #az-cercare').count() === 0, 'nessuna azione finche la coda non e vuota');
await page.screenshot({ path: 'webapp/screenshot-prova/vento-coda.png' });

await page.click('[data-vento]');
await page.waitForSelector('.dadi-overlay [data-tot="2"]', { timeout: 5000 });
await page.screenshot({ path: 'webapp/screenshot-prova/vento-dadi.png' });
await page.click('.dadi-overlay [data-tot="2"]');
await page.waitForSelector('#dadi-chiudi', { state: 'visible', timeout: 8000 });
await page.click('#dadi-chiudi');
await page.waitForSelector('#ok-msg', { timeout: 5000 });
ok(/perde lo scatto/.test(await pannello()), 'la conseguenza dice che perde lo scatto');
await page.screenshot({ path: 'webapp/screenshot-prova/vento-conseguenza.png' });
await page.click('#ok-msg');
await page.waitForTimeout(600);
const sp = await page.evaluate(() => window.__partita.spedizione);
ok(!(sp.provaVento && sp.provaVento.chi.length), 'coda svuotata dopo la prova');
ok(sp.vite[ELENA] === 6, 'fallire con 6 Ferite non fa danno');
ok(sp.vincoli && sp.vincoli[ELENA], 'la prova mancata toglie lo scatto del round dopo');
ok(!/Il vento sale/.test(await pannello()) && await page.locator('#az-fine').count() === 1, 'tornato il pannello delle azioni');
await page.screenshot({ path: 'webapp/screenshot-prova/vento-dopo.png' });
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
