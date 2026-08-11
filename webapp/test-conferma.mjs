// Le domande irreversibili devono arrivare DENTRO il gioco, non dal browser.
//
// Questo banco e' l'unico che NON sostituisce window.confirm: gioca come chi
// gioca davvero. Gli altri lo sostituiscono per andare avanti da soli, e per
// loro chiedi.js obbedisce alla sostituzione — quindi senza questo test la
// finestra del fascicolo potrebbe non comparire mai a nessuno e nessuno se ne
// accorgerebbe.
//
// Uso: node webapp/server.js (altrove) ; node webapp/test-conferma.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:8017';
let ko = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
page.on('pageerror', (e) => { console.log('   !! pageerror:', e.message); ko++; });
// se una finestra di sistema si aprisse davvero, il test si accorgerebbe qui
let sistemaAperto = 0;
page.on('dialog', async (d) => { sistemaAperto++; await d.dismiss(); });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  localStorage.clear();
  return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
    localStorage.setItem('osr.partita.ep1', JSON.stringify({
      v: 1, episodio: 'ep1', modo: 'tavolo', plancia: 'fisica',
      party: c.eroi.slice(0, 3).map((e) => e.nome), creata: Date.now(), fase: 'indagine',
      indagine: { ora: 21, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [],
        parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
        secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: false },
      spedizione: { round: 0, canto: 0, cantoBonus: false, ferite: [], mazzo: null, scarti: [], esito: null },
    }));
  });
});

// --- il sigillo: la domanda che piu' di tutte non deve venire dal browser
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.getByText('Il Coro Sommerso').first().click();
await page.waitForTimeout(300);
await page.locator('#continua').click();
await page.waitForTimeout(700);
await page.locator('#taccuino').click();
await page.waitForTimeout(400);
await page.locator('#apri-busta').click();
await page.waitForTimeout(400);

ok(await page.locator('.scelta-box.chiesta').count() === 1, 'si apre la finestra del gioco');
ok(await page.locator('.scelta-box.chiesta .sigillo').count() === 1, 'con il sigillo di ceralacca');
ok(sistemaAperto === 0, 'e nessuna finestra di sistema');

// --- «non ancora» non deve aprire la busta
await page.locator('.scelta-box.chiesta .annulla').click();
await page.waitForTimeout(400);
ok(await page.locator('.scelta-box.chiesta').count() === 0, 'annullando la finestra si chiude');
ok(await page.locator('#apri-busta').count() === 1, 'e l’indagine e’ ancora aperta');

// --- il tasto Escape vale come «non ancora»
await page.locator('#apri-busta').click();
await page.waitForTimeout(300);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
ok(await page.locator('.scelta-box.chiesta').count() === 0, 'Escape annulla');
ok(await page.locator('#apri-busta').count() === 1, 'e non apre la busta');

// --- rompendolo davvero, l'indagine si chiude
await page.locator('#apri-busta').click();
await page.waitForTimeout(300);
await page.locator('.scelta-box.chiesta .btn.pieno').click();
await page.waitForTimeout(800);
const chiusa = await page.evaluate(() => {
  const k = Object.keys(localStorage).find((x) => x.includes('osr.partita'));
  return JSON.parse(localStorage.getItem(k)).indagine.chiusa;
});
ok(chiusa === true, 'rompendo il sigillo l’indagine si chiude davvero');
ok(sistemaAperto === 0, 'in tutto il giro, mai una finestra di sistema');

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\ntest-conferma: tutto a posto');
process.exit(ko ? 1 : 0);
