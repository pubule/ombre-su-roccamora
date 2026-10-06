// I DADI DELLA NOTTE: l'interruttore «dadi della notte: l'app» vale anche per le prove d'insidia
// delle carte Minaccia (un tiro per eroe), non solo per gli attacchi dei nemici.
//
// Uso:  node webapp/server.js ; node webapp/test-dadi-notte-ui.mjs
import { chromium } from 'playwright';

const [A, B, Cc] = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE'];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const browser = await chromium.launch();
const errori = [];

async function apri(nemiciApp) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => errori.push(e.message));
  await page.goto('http://localhost:8017', { waitUntil: 'networkidle' });
  await page.evaluate(async ({ party, nemiciApp }) => {
    const carte = await (await fetch('/data/carte.json')).json();
    const carta = carte.minacce.ep1.find((c) => /Fumi Soporiferi/.test(c.title));
    const { vistaDigitale } = await import('/js/digitale.js');
    const partita = { v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione', nemiciApp,
      indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] }, vantaggi: { tier: 'preparati' },
      spedizione: { digitale: true, round: 2, canto: 1, cantoBonus: false, fase: 'nemici', esito: null, rivelate: ['T1'], stanzeLette: ['T1'], grate: [], compiti: {}, cercate: {}, log: [],
        eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T1', x: 1, y: 1 }, [party[2]]: { t: 'T1', x: 0, y: 1 } },
        vite: { [party[0]]: 8, [party[1]]: 8, [party[2]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null,
        scortati: [], mazzo: { ordine: [0], indice: 0 }, pendenza: null, insidie: {}, abilita: {}, nemici: [], provaVento: { round: 2, chi: [] },
        carta: { titolo: carta.title, carta, annunci: [] } } };
    window.__partita = partita;
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {}, null);
  }, { party: [A, B, Cc], nemiciApp });
  await page.waitForSelector('#ins-risolvi');
  return page;
}

// interruttore spento: il primo tiro lo chiede al tavolo, col ripiego «da qui li tira l'app»
let page = await apri(false);
await page.click('#ins-risolvi');
await page.waitForSelector('.dadi-overlay');
ok(await page.locator('#dadi-sempre').count() === 1, 'a interruttore spento il tiro si chiede, col ripiego «da qui li tira l app»');
await page.close();

// interruttore acceso dal tasto sulla carta: nessun overlay, un esito per eroe
page = await apri(false);
ok(/vostri/i.test(await page.locator('#tog-nemici-app').innerText()), 'sulla carta c e l interruttore «dadi della notte: vostri»');
await page.click('#tog-nemici-app');
ok(/app/i.test(await page.locator('#tog-nemici-app').innerText()), 'premuto diventa «l app»');
await page.click('#ins-risolvi');
await page.waitForSelector('#ok-msg', { state: 'visible', timeout: 5000 });
ok(await page.locator('.dadi-overlay').count() === 0, 'nessuna finestra dei dadi: tira l app');
ok(await page.locator('#ins-esito p').count() >= 3, `un esito per eroe (${await page.locator('#ins-esito p').count()})`);
// un ridisegno DOPO le prove (la spinta del tavolo) non deve riportare la carta al bottone:
// era il giro senza uscita — si tirava di nuovo per ogni eroe, all'infinito
await page.evaluate(async () => { (await import('/js/digitale.js'))._motore.render(); });
await page.waitForTimeout(300);
ok(await page.evaluate(() => {
  const r = document.querySelector('#ins-risolvi');
  const okb = document.querySelector('#ok-msg');
  return (!r || getComputedStyle(r).display === 'none') && okb && getComputedStyle(okb).display !== 'none'
    && document.querySelectorAll('#ins-esito p').length >= 3;
}), 'dopo un ridisegno la carta resta risolta: niente bottone «risolvete», c e continua e gli esiti');
await page.close();

// preferenza gia' accesa nella partita: stesso risultato senza toccare niente
page = await apri(true);
await page.click('#ins-risolvi');
await page.waitForSelector('#ok-msg', { state: 'visible', timeout: 5000 });
ok(await page.locator('.dadi-overlay').count() === 0, 'con la preferenza gia accesa tira subito l app');

ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
