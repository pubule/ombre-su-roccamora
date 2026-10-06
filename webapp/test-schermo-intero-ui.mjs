// IL ⤢ DELLA SPEDIZIONE chiede lo schermo intero e basta: non deve spegnere il
// layout a tre colonne (l'altro sfora in larghezza su telefono e spacca la pagina).
//
// Uso:  node webapp/server.js ; node webapp/test-schermo-intero-ui.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const EP = JSON.parse(readFileSync('webapp/data/ep11.json', 'utf8'));
const [A, B] = ['ELENA FOSCO', 'SIBILLA REVE'];
const T0 = EP.tessere[0].id; const ESP = EP.tessere.find((t) => t.esposta).id;
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
for (const [nome, w, h] of [['telefono', 390, 844], ['tablet', 820, 1180], ['pc', 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  // chi aveva gia' spento il layout col vecchio ⤢ ha '0' scritto: non deve contare
  await page.addInitScript(() => { try { localStorage.setItem('osr.immersivo', '0'); } catch { /* niente */ } });
  await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
  await page.evaluate(async ({ party, t0, esp }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const partita = { v: 1, episodio: 'ep11', modo: 'digitale', party, fase: 'spedizione',
      indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
      spedizione: { digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, rivelate: [t0, esp], stanzeLette: [t0, esp], grate: [], compiti: {}, cercate: {}, log: [],
        eroiPos: { [party[0]]: { t: esp, x: 3, y: 1 }, [party[1]]: { t: t0, x: 3, y: 1 } }, vite: { [party[0]]: 6, [party[1]]: 6 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
        scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 2, chi: [] } } };
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
  }, { party: [A, B], t0: T0, esp: ESP });
  await page.waitForSelector('.board-digitale');
  const stato = () => page.evaluate(() => ({ imm: document.querySelector('#app').classList.contains('immersivo'),
    sfora: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  let s = await stato();
  ok(s.imm && s.sfora <= 0, `${nome}: all'ingresso layout acceso e niente sforamento (${JSON.stringify(s)})`);
  await page.click('[data-zoom="0"]'); await page.waitForTimeout(800);
  s = await stato();
  ok(s.imm && s.sfora <= 0, `${nome}: dopo il ⤢ il layout resta (${JSON.stringify(s)})`);
  await page.close();
}
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
