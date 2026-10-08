// LE BARRE DI SCORRIMENTO NON SI VEDONO in tutta l'app, e si scorre lo stesso. Chromium senza
// --hide-scrollbars disegna la barra classica da 15 px: se un elemento che scorre ha larghezza esterna maggiore di quella
// interna, la barra c'e'. Si controlla la pagina intera, un contenitore creato qui e quelli veri della
// Spedizione (le colonne), e che lo scorrimento funzioni.
//
// Uso:  node webapp/server.js ; node webapp/test-scrollbar-nascoste-ui.mjs
import { chromium } from 'playwright';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
// headless nasconde da solo le barre (--hide-scrollbars): si toglie, o il test non vedrebbe mai niente
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const pg = await browser.newPage({ viewport: { width: 1300, height: 700 } });
const errori = [];
pg.on('pageerror', (e) => errori.push(e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });

const m = await pg.evaluate(() => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:0;top:0;width:200px;height:100px;overflow:auto;z-index:9999';
  el.innerHTML = '<div style="height:800px;width:400px">x</div>'; document.body.append(el);
  const r = { barraV: el.offsetWidth - el.clientWidth, barraO: el.offsetHeight - el.clientHeight };
  el.scrollTop = 120; r.scorre = el.scrollTop; el.remove();
  r.pagina = window.innerWidth - document.documentElement.clientWidth;
  r.paginaScorre = document.documentElement.scrollHeight > window.innerHeight;
  return r;
});
ok(m.barraV === 0 && m.barraO === 0, `un contenitore che scorre non ha barre (${m.barraV} px verticale, ${m.barraO} orizzontale)`);
ok(m.scorre === 120, `ma scorre (${m.scorre})`);
ok(m.pagina === 0, `la pagina non ha barra (${m.pagina} px)${m.paginaScorre ? '' : ' [pagina corta]'}`);

// la Spedizione: le colonne scorrono e non hanno la barra
await pg.evaluate(async () => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const party = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
  const partita = { v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1'], stanzeLette: ['T1'],
      grate: [], compiti: {}, cercate: {}, log: Array.from({ length: 40 }, (_, i) => `riga ${i}`),
      eroiPos: { [party[0]]: { t: 'T1', x: 1, y: 1 }, [party[1]]: { t: 'T1', x: 2, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 },
      azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0], scortati: [{ liberato: false, pos: null, mosso: false }], insidie: {},
      abilita: {}, provaVento: { round: 2, chi: [] }, mazzo: { ordine: [0], indice: 0 }, pendenza: null, nemici: [] } };
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
});
await pg.waitForSelector('#col-eroi');
const c = await pg.evaluate(() => [...document.querySelectorAll('#col-eroi, #col-notte, #board-wrap')].map((e) => ({
  id: e.id, barra: e.offsetWidth - e.clientWidth - parseFloat(getComputedStyle(e).borderLeftWidth) - parseFloat(getComputedStyle(e).borderRightWidth), scorribile: e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth })));
ok(c.length === 3 && c.every((x) => x.barra === 0), `colonne e plancia senza barra (${c.map((x) => `${x.id}:${x.barra}${x.scorribile ? '*' : ''}`).join(' ')})`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
