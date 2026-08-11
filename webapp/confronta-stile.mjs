// Affianca mockup e app della stessa schermata: e' la prova di «il piu' simile
// possibile», e la giudica l'occhio dell'autore — test-stile.mjs misura i
// colori, ma se una schermata SOMIGLIA al mockup lo dice solo chi guarda.
// Scrive webapp/_mock-*.png e webapp/_app-*.png (ignorati da git).
// Uso: node webapp/server.js (altrove) ; node webapp/confronta-stile.mjs
import { chromium } from 'playwright';
const B = 'http://localhost:8017';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
await p.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
const scatta = async (url, file, dopo) => {
  await p.goto(url, { waitUntil: 'networkidle' });
  if (dopo) await dopo();
  await p.waitForTimeout(500);
  await p.screenshot({ path: file, fullPage: true });
};
// il mockup
for (const n of ['home', 'episodio', 'indagine', 'taccuino']) {
  await scatta(`${B}/mockups/stile/fascicolo-${n === 'episodio' ? 'episodio' : n}.html`, `webapp/_mock-${n}.png`);
}
// l'app, seminata
await p.goto(B, { waitUntil: 'networkidle' });
await p.evaluate(() => {
  localStorage.clear();
  return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
    const party = c.eroi.slice(0, 3).map((e) => e.nome);
    localStorage.setItem('osr.partita.ep1', JSON.stringify({
      v: 1, episodio: 'ep1', modo: 'tavolo', plancia: 'fisica', party, creata: Date.now(),
      fase: 'indagine',
      indagine: { ora: 21, lettaLettera: true, visitati: [1], scoperti: [], sbloccati: [],
        parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
        secondoFiato: {}, note: 'la chiave non torna', risposte: ['il custode, Fossa', '', '', ''], chiusa: false },
      spedizione: { round: 0, canto: 0, cantoBonus: false, ferite: [], mazzo: null, scarti: [], esito: null },
    }));
  });
});
await scatta(B, 'webapp/_app-home.png');
await p.getByText('Il Coro Sommerso').first().click();
await p.waitForTimeout(400); await p.screenshot({ path: 'webapp/_app-episodio.png', fullPage: true });
await p.locator('#continua').click();
await p.waitForTimeout(700); await p.screenshot({ path: 'webapp/_app-indagine.png', fullPage: true });
await p.locator('#taccuino').click();
await p.waitForTimeout(500); await p.screenshot({ path: 'webapp/_app-taccuino.png', fullPage: true });
await b.close();
console.log('fatto');
