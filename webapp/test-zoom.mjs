// Le carte si aprono a tutto schermo (zoom.js). Al tavolo la carta stampata la
// si avvicina agli occhi; a schermo, alla misura del pannello il testo di
// regola non si legge — e in galleria men che meno.
//
// Semina una partita con un oggetto gia' in mano, apre l'inventario, apre la
// riga di quell'oggetto e verifica che l'immagine aperta col tocco sia DAVVERO
// piu' grande di quella nel pannello (non solo che l'overlay esista), poi che
// ESC la chiuda.
//
// Uso:  node webapp/server.js   (altrove) ; node webapp/test-zoom.mjs [porta]
import { chromium } from 'playwright';

const PORT = process.argv[2] || 8017;
const BASE = `http://localhost:${PORT}`;
let errori = 0;
const ko = (m) => { errori += 1; console.log('  KO', m); };
const ok = (c, m) => { if (c) console.log('  ok', m); else ko(m); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
page.on('pageerror', (e) => ko('errore JS: ' + e.message.split('\n')[0]));

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // un oggetto dell'Ep.1 che ha una carta resa: cosi' la miniatura c'e' davvero
  await page.evaluate(() => {
    localStorage.clear();
    return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
      const party = c.eroi.slice(0, 3).map((e) => e.nome);
      localStorage.setItem('osr.partita.ep1', JSON.stringify({
        v: 1, episodio: 'ep1', modo: 'tavolo', party, creata: Date.now(), fase: 'indagine',
        indagine: { ora: 19, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [],
          parole: [], oggetti: ['Il Diapason d’Argento'], reperti: [], approfondimentiLetti: [],
          caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: false },
      }));
    });
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.locator('.tessera-episodio[data-ep="ep1"]').click();
  await page.locator('#continua').click();
  // l'elenco delle cose sta nel menu: la scena tiene solo quel che succede
  await page.locator('#apri-menu').click();
  await page.locator('#m-mano').click();
  // DAL 14/08 l'inventario e' un ELENCO DI NOMI: la carta non sta piu' in
  // pagina come miniatura, si apre toccando la riga. Il pizzico per ingrandire
  // parte da li' — che e' il posto dove al tavolo si avvicina la carta agli
  // occhi.
  await page.locator('[data-pezzo="oggetto"]').first().click();

  const mini = page.locator('.carta-grande img').first();
  await mini.waitFor();
  const primaBox = await mini.boundingBox();
  ok(primaBox.width > 0, `la carta nel pannello c'è (${Math.round(primaBox.width)} px)`);

  await mini.click();
  const grande = page.locator('.zoom-overlay img');
  await grande.waitFor({ state: 'visible', timeout: 3000 });
  const dopoBox = await grande.boundingBox();
  // il punto non e' che l'overlay esista: e' che si veda PIU' GRANDE
  // «piu' grande» e non «esiste»: un overlay che apre la stessa misura non
  // serve a niente, ed e' il modo in cui questo si romperebbe in silenzio
  ok(dopoBox.height > primaBox.height * 1.4,
    `aperta a tutto schermo: da ${Math.round(primaBox.height)} a ${Math.round(dopoBox.height)} px di altezza`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  ok(await page.locator('.zoom-overlay').count() === 0, 'ESC la richiude');

  await mini.click();
  await grande.waitFor({ state: 'visible', timeout: 3000 });
  await page.locator('.zoom-overlay').click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(150);
  ok(await page.locator('.zoom-overlay').count() === 0, 'e un tocco qualunque pure');

  // la pagina sotto deve restare dov'era: l'overlay non e' una navigazione
  ok(await page.locator('.carta-grande img').count() > 0,
    'chiudendo si torna dove si era, senza ricaricare la vista');
} catch (e) {
  ko(`flusso interrotto: ${e.message.split('\n')[0]}`);
}

await browser.close();
console.log(errori ? `\n${errori} CHECK FALLITI` : '\ntest-zoom: la carta si apre e si chiude');
process.exit(errori ? 1 : 0);
