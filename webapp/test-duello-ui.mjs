// IL DUELLO: l'attacco dei nemici si racconta in una striscia FISSA in cima alla plancia, con il
// nemico, l'eroe colpito, il tiro e l'esito. Prima era un banner volante a meta' schermo che copriva
// la plancia e non diceva chi veniva colpito. Su telefono, iPad e PC: la striscia non copre la
// plancia, non si sposta durante la notte, e i tasti dello zoom stanno sotto di lei.
// E il fuori oltre la plancia e' buio quanto il buio: l'acqua non deve vedersi.
//
// Uso:  node webapp/server.js ; node webapp/test-duello-ui.mjs
import { chromium } from 'playwright';

const [A, B] = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const browser = await chromium.launch();

async function prova(nome, width, height) {
  const pg = await browser.newPage({ viewport: { width, height } });
  const errori = [];
  pg.on('pageerror', (e) => errori.push(e.message));
  await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
  await pg.evaluate(async ({ party }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const partita = { v: 1, episodio: 'preludio', modo: 'digitale', party, fase: 'spedizione', nemiciApp: true,
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
  await pg.waitForTimeout(400);
  const misura = () => pg.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().toJSON() : null; };
    const d = document.querySelector('#duello');
    return { d: r('#duello'), w: r('#board-wrap'), z: r('.zoom-ctrl'), notte: !!document.querySelector('#duello.notturno'),
      testo: d ? d.innerText.replace(/\s+/g, ' ') : '', nem: !!document.querySelector('#duello .rit-d.cattivo img'),
      eroe: !!document.querySelector('#duello .rit-d.eroe img'), volante: document.querySelectorAll('.turno-banner').length,
      fondo: getComputedStyle(document.querySelector('#board-wrap')).backgroundImage };
  });
  const giorno = await misura();
  ok(giorno.d && giorno.w && giorno.d.bottom <= giorno.w.top + 1, `${nome}: di giorno la striscia sta sopra la plancia, non sopra le stanze`);
  ok(/rgba\(2, 3, 4, 0\.98\)/.test(giorno.fondo), `${nome}: il fuori oltre la plancia e' buio quanto il buio`);

  await pg.click('#fase-minaccia');
  const notte = [];
  for (let i = 0; i < 80; i++) {
    if (await pg.locator('#ok-msg').isVisible().catch(() => false)) await pg.click('#ok-msg').catch(() => {});
    const m = await misura();
    if (m.notte) notte.push(m);
    if (await pg.evaluate(() => window.__partita.spedizione.round) >= 3 && await pg.locator('#col-eroi').count()) break;
    await pg.waitForTimeout(150);
  }
  const esiti = notte.filter((m) => /colpisce|manca/.test(m.testo));
  ok(notte.length >= 5, `${nome}: la notte si racconta nella striscia (${notte.length} istanti)`);
  ok(esiti.length > 0 && esiti.every((m) => m.nem && m.eroe && /elena|attilio/.test(m.testo) && /🎲 \d+/.test(m.testo)),
    `${nome}: l'esito mostra nemico, eroe colpito e tiro (${esiti[0] && esiti[0].testo})`);
  ok(notte.every((m) => m.volante === 0), `${nome}: nessun banner volante`);
  ok(notte.every((m) => m.d && Math.abs(m.d.top - notte[0].d.top) < 1 && Math.abs(m.d.height - notte[0].d.height) < 1),
    `${nome}: la striscia resta ferma per tutta la notte`);
  ok(notte.every((m) => m.d.bottom <= m.w.top + 1 && m.d.right <= width + 1), `${nome}: di notte non copre la plancia e non esce dallo schermo`);
  ok(notte.every((m) => !m.z || m.z.top >= m.d.bottom), `${nome}: i tasti dello zoom stanno sotto la striscia`);
  ok(errori.length === 0, `${nome}: nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
  await pg.close();
}

await Promise.all([prova('telefono', 390, 844), prova('ipad', 820, 1180), prova('pc', 1440, 810)]);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
