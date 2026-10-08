// L'EPILOGO SI LEGGE: scritto a mano solo il PARLATO. L'epilogo intero nella grafia a mano (Ep.2, 08/10/2026)
// non si leggeva: le istruzioni («EPILOGO — da leggere a voce alta», «annotatelo sul Frammento») stanno in un
// carattere normale, e solo la battuta fra «…» — la voce che si legge davvero — e' in corsivo calligrafico.
// Si controllano i caratteri VERI (quelli calcolati) di ogni episodio con un epilogo.
//
// Uso:  node webapp/server.js ; node webapp/test-epilogo-parlato-ui.mjs
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const party = COMUNE.eroi.slice(0, 2).map((e) => e.nome);
const browser = await chromium.launch();
const errori = [];
const pg = await browser.newPage({ viewport: { width: 1000, height: 900 } });
pg.on('pageerror', (e) => errori.push(e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });

let provati = 0;
for (const id of ['ep2', 'ep5', 'ep11', 'ep20']) {
  if (!existsSync(`webapp/data/${id}.json`)) continue;
  const m = await pg.evaluate(async ({ id, party }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const partita = { v: 1, episodio: id, modo: 'digitale', party, fase: 'spedizione',
      indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
      spedizione: { digitale: true, round: 9, canto: 3, cantoBonus: false, fase: 'eroi', esito: 'vittoria', rivelate: ['T1'], stanzeLette: ['T1'],
        grate: [], compiti: {}, cercate: {}, log: [], eroiPos: Object.fromEntries(party.map((p, i) => [p, { t: 'T1', x: i, y: 1 }])),
        vite: Object.fromEntries(party.map((p) => [p, 8])), azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
        scortati: [], insidie: {}, abilita: {}, mazzo: { ordine: [0], indice: 0 }, pendenza: null, nemici: [] } };
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
    await new Promise((r) => setTimeout(r, 400));
    const box = document.querySelector('.epilogo-testo'); if (!box) return null;
    const mano = (el) => /Mano/i.test(getComputedStyle(el).fontFamily);
    return { corpo: mano(box), testo: box.innerText, parlati: [...box.querySelectorAll('.parlato')].map((p) => ({ t: p.innerText, mano: mano(p) })),
      grassetto: [...box.querySelectorAll('b')].some(mano) };
  }, { id, party });
  if (!m) { console.log(`   (${id}: nessun epilogo di vittoria)`); continue; }
  provati += 1;
  ok(!m.corpo, `${id}: il corpo dell'epilogo non e' a mano`);
  ok(!m.grassetto, `${id}: le istruzioni in grassetto non sono a mano`);
  ok(m.parlati.length === 0 || m.parlati.every((p) => p.mano && /^«[\s\S]*»$/.test(p.t)), `${id}: ogni battuta fra «…» e' a mano (${m.parlati.length})`);
  if (id !== 'ep20') ok(m.parlati.length >= 1, `${id}: c'e' almeno una battuta a mano`);
}
ok(provati >= 3, `provati ${provati} episodi`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
