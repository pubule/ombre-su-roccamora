// LA CARTA DELLA PRIMA STANZA non rispunta all'infinito: se lo stato che torna dal tavolo non ha la
// stanza fra le lette (la spinta non era arrivata), il «continua» riportava sempre alla stessa carta.
//
// Uso:  node webapp/server.js ; node webapp/test-prima-stanza-ui.mjs
import { chromium } from 'playwright';

const [A, B] = ['ELENA FOSCO', 'DOTT. ATTILIO MARN'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errori = [];
pg.on('pageerror', (e) => errori.push(e.message));
await pg.goto('http://localhost:8017', { waitUntil: 'networkidle' });
await pg.evaluate(async ({ party }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const partita = { v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
    spedizione: { digitale: true, round: 1, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1'], grate: [], compiti: {}, cercate: {}, log: [],
      eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T1', x: 1, y: 1 } }, vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
      scortati: [], mazzo: { ordine: [0, 1, 2, 3], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 1, chi: [] } } };
  window.__partita = partita;
  document.querySelector('#app').innerHTML = '';
  window.__vai = null;
  await vistaDigitale(document.querySelector('#app'), partita, (d) => { window.__vai = d; }, null);
}, { party: [A, B] });

await pg.waitForSelector('#ok-msg');
ok(true, 'la prima stanza si apre con la sua carta');
// la schermata da leggere ha il suo menu: se «continua» non risponde, non si resta chiusi dentro
ok(await pg.locator('#carta-esci').count() === 1, 'la carta della stanza ha il tasto «menu»');
await pg.click('#carta-esci');
ok(await pg.evaluate(() => window.__vai) === 'menu', 'e il menu riporta alla home');
await pg.click('#ok-msg');
await pg.waitForSelector('.board-digitale');
ok(await pg.locator('#ok-msg').count() === 0, 'dopo «continua» c e la plancia');

// lo stato che torna dal tavolo non ricorda la stanza fra le lette: il ridisegno non deve riaprirla
await pg.evaluate(async () => {
  const sp = window.__partita.spedizione; sp.stanzeLette = []; sp.carta = null;
  (await import('/js/digitale.js'))._motore.render();
});
await pg.waitForTimeout(400);
ok(await pg.locator('#ok-msg').count() === 0 && await pg.locator('.board-digitale').count() === 1,
  'con lo stato del tavolo senza la stanza fra le lette la carta non rispunta');
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
