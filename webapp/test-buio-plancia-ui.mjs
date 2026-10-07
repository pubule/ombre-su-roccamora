// IL BUIO STA SOPRA LA PLANCIA, e attorno alla plancia c'e' il fuori dell'episodio, non il nero.
// Senza position:absolute i due canvas della luce stavano nel flusso: il buio finiva SOTTO la plancia
// come una striscia nera, e le stanze non erano mai al buio. E dove la finestra ha proporzioni
// diverse dalle stanze restavano bande nere: ora il contenitore prende lo stesso fuori, scurito.
//
// Uso:  node webapp/server.js ; node webapp/test-buio-plancia-ui.mjs
import { chromium } from 'playwright';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1600, height: 780 } });
const errori = [];
pg.on('pageerror', (e) => errori.push(e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await pg.evaluate(async () => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const party = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
  const partita = { v: 1, episodio: 'preludio', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 4, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1', 'T2', 'T4'],
      stanzeLette: ['T1', 'T2', 'T4'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T2', x: 1, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 },
      azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0], scortati: [{ liberato: false, pos: null, mosso: false }],
      mazzo: { ordine: [0], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 4, chi: [] } } };
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
});
await pg.waitForSelector('canvas.buio');
await pg.waitForTimeout(800);
const m = await pg.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const b = r('.board-digitale'); const z = r('canvas.buio');
  return { bTop: b.top, bH: b.height, zTop: z.top, zH: z.height,
    fondo: getComputedStyle(document.querySelector('#board-wrap')).backgroundImage };
});
ok(Math.abs(m.zTop - m.bTop) < 2 && Math.abs(m.zH - m.bH) < 2, `il buio copre la plancia (buio ${Math.round(m.zTop)}+${Math.round(m.zH)}, plancia ${Math.round(m.bTop)}+${Math.round(m.bH)})`);
ok(/pavimenti\/acqua/.test(m.fondo), 'attorno alla plancia c e l acqua del Preludio, non il nero');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
