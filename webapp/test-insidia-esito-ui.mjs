// L'ESITO DI UN'INSIDIA SI LEGGE. Con «dadi della notte: l'app» la prova la tira l'app senza finestra
// dei dadi: sotto la carta restava una riga grigia («elena: prova superata.») e l'avviso «risolvete
// la prova» ancora acceso, e al tavolo sembrava che la carta fosse tornata senza che nessuno avesse
// tirato (07/10/2026: Cera sotto i Piedi e Fumi Soporiferi di fila). Ora ogni riga dice chi, il tiro e
// la soglia, l'avviso sparisce, e l'esito va nel diario. Due insidie di fila, come quella sera.
//
// Le prove le tira l'app col ripiego «per tutta la carta» (i dadi d'insidia si chiedono sempre).
//
// Uso:  node webapp/server.js ; node webapp/test-insidia-esito-ui.mjs
import { chromium } from 'playwright';

const party = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errori = [];
pg.on('pageerror', (e) => errori.push(e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await pg.evaluate(async (party) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const pool = ['Insidia — Cera sotto i Piedi', 'Insidia — Fumi Soporiferi'];
  const pos = (x, y) => ({ t: 'T1', x, y });
  const partita = { v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione', nemiciApp: true, rng: { seme: 3, passo: 0 },
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 5, canto: 2, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1'], stanzeLette: ['T1'],
      grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: Object.fromEntries(party.map((p, i) => [p, pos(i, 1)])), vite: Object.fromEntries(party.map((p) => [p, 8])),
      azioni: {}, storditi: {}, eroiFatti: party.slice(), eroiAttivo: null,
      scortati: [{ liberato: false, pos: null, mosso: false }], insidie: {}, abilita: {}, provaVento: { round: 5, chi: [] },
      mazzo: { pool, ordine: [0, 1, 0, 1], indice: 0 }, pendenza: null, nemici: [] } };
  window.__p = partita; document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
}, party);

const carta = () => pg.evaluate(() => ({
  titolo: document.querySelector('.titolo')?.innerText || '',
  img: document.querySelector('.carta-grande img')?.getAttribute('src') || '',
  avviso: !!document.querySelector('#ins-nota'),
  esiti: [...document.querySelectorAll('#ins-esito .esito-ins')].map((p) => p.innerText),
}));

// le prove d'insidia chiedono i dadi anche con «dadi della notte: l'app»: qui li tira l'app per la carta
async function perTuttaLaCarta() {
  await pg.waitForSelector('.dadi-overlay.aperto #dadi-sempre');
  await pg.click('.dadi-overlay.aperto #dadi-sempre');
  await pg.click('.dadi-overlay.aperto #dadi-lancia');
  await pg.locator('.dadi-overlay.aperto #dadi-chiudi').click({ timeout: 8000 }).catch(() => {});
}
await pg.click('#fase-minaccia');
await pg.waitForSelector('#ins-risolvi');
const c1 = await carta();
await pg.click('#ins-risolvi');
await pg.waitForSelector('.scelta-btn[data-id]');
await pg.locator('.scelta-btn[data-id]').first().click();
await perTuttaLaCarta();
await pg.waitForSelector('#ins-esito .esito-ins');
const r1 = await carta();
ok(r1.esiti.some((x) => /^elena prova NERVI \(Media\): 🎲 \d+ contro \d+, (superata|fallita)\.$/i.test(x)), `prima insidia: la riga dice chi, il tiro e la soglia (${r1.esiti.join(' / ')})`);
ok(!r1.avviso, 'prima insidia: risolta, l avviso «risolvete la prova» sparisce');
await pg.click('#ok-msg');
await pg.waitForFunction((src) => document.querySelector('.carta-grande img')?.getAttribute('src') !== src, c1.img);
const c2 = await carta();
ok(/2 di 2/.test(c2.titolo) && c2.img !== c1.img, `la seconda carta e un altra carta, non la prima tornata (${c2.titolo})`);
await pg.click('#ins-risolvi');
await perTuttaLaCarta();
await pg.waitForSelector('#ins-esito .esito-ins');
const r2 = await carta();
const righe = r2.esiti.filter((x) => /🎲 \d+ contro \d+/.test(x));
ok(righe.length === 4, `seconda insidia («ogni eroe»): una riga col tiro per ognuno dei 4 eroi (${righe.length})`);
const log = await pg.evaluate(() => window.__p.spedizione.log);
ok(log.filter((x) => /^(Cera sotto i Piedi|Fumi Soporiferi): .*🎲/.test(x)).length === 5, `le cinque prove vanno nel diario (${log.length} righe)`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
