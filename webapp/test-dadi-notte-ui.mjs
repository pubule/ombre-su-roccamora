// LE PROVE D'INSIDIA SONO DEGLI EROI: si chiedono sempre, anche con «dadi della notte: l'app», che
// vale solo per gli attacchi dei nemici (deciso il 07/10/2026: con l'interruttore acceso l'app tirava
// anche le insidie e al tavolo sembrava che il tiro mancasse). Per i Fumi (un tiro per eroe) c'e'
// il ripiego «tira l'app per tutta la carta», che vale per quella carta e poi si spegne.
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


// i tiri a mano: un 7 nella finestra, poi «continua»
async function tiraAMano(page) {
  await page.waitForSelector('.dadi-overlay.aperto [data-tot="7"]');
  await page.click('.dadi-overlay.aperto [data-tot="7"]');
  await page.locator('.dadi-overlay.aperto #dadi-chiudi').click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(450);
}
async function perTuttaLaCarta(page) {
  await page.waitForSelector('.dadi-overlay.aperto #dadi-sempre');
  await page.click('.dadi-overlay.aperto #dadi-sempre');
  await page.click('.dadi-overlay.aperto #dadi-lancia');
  await page.locator('.dadi-overlay.aperto #dadi-chiudi').click({ timeout: 8000 }).catch(() => {});
}

// interruttore della notte ACCESO: la prova si chiede lo stesso, e sulla carta l'interruttore non c'e'
let page = await apri(true);
ok(await page.locator('#tog-nemici-app').count() === 0, 'sulla carta d insidia non c e l interruttore della notte');
await page.click('#ins-risolvi');
ok(await page.waitForSelector('.dadi-overlay', { timeout: 5000 }).then(() => true).catch(() => false),
  'con «dadi della notte: l app» la prova d insidia apre comunque la finestra dei dadi');
ok(/tutta la carta/.test(await page.locator('.dadi-overlay #dadi-sempre').innerText()), 'nella finestra c e il ripiego «tira l app per tutta la carta»');
// il primo eroe a mano, poi «per tutta la carta»: il terzo senza finestra
await tiraAMano(page);
await perTuttaLaCarta(page);
await page.waitForSelector('#ok-msg', { state: 'visible', timeout: 5000 });
ok(await page.locator('#ins-esito .esito-ins').count() === 3, `un esito per eroe (${await page.locator('#ins-esito .esito-ins').count()})`);
ok(await page.evaluate(() => window.__partita.nemiciApp === true), 'l interruttore della notte non e stato toccato');
// un ridisegno DOPO le prove (la spinta del tavolo) non deve riportare la carta al bottone:
// era il giro senza uscita — si tirava di nuovo per ogni eroe, all'infinito
await page.evaluate(async () => { (await import('/js/digitale.js'))._motore.render(); });
await page.waitForTimeout(300);
ok(await page.evaluate(() => {
  const r = document.querySelector('#ins-risolvi');
  const okb = document.querySelector('#ok-msg');
  return (!r || getComputedStyle(r).display === 'none') && okb && getComputedStyle(okb).display !== 'none'
    && document.querySelectorAll('#ins-esito .esito-ins').length === 3;
}), 'dopo un ridisegno la carta resta risolta: niente bottone «risolvete», c e continua e gli esiti');
await page.close();

// il ripiego vale per QUELLA carta: una nuova carta chiede di nuovo i dadi
page = await apri(false);
await page.click('#ins-risolvi');
await perTuttaLaCarta(page);
await page.waitForSelector('#ok-msg', { state: 'visible', timeout: 5000 });
await page.evaluate(async () => { delete window.__partita.spedizione.carta.esiti; (await import('/js/digitale.js'))._motore.render(); });
await page.click('#ins-risolvi');
ok(await page.waitForSelector('.dadi-overlay', { timeout: 3000 }).then(() => true).catch(() => false), 'la carta dopo chiede di nuovo i dadi');
await page.close();

ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
