// Tavoli, offline e divergenza, contro `wrangler dev` (D1 locale vero).
// Uso, in tre terminali:
//   ./webapp/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
//   node webapp/test-account-ui.mjs
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8787';
let ko = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };

const browser = await chromium.launch();
const nuovaScheda = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
  p.on('pageerror', (e) => { console.log('   !! pageerror:', e.message); ko++; });
  return p;
};

// --- 1. si parte dai tavoli, non dagli episodi
const p1 = await nuovaScheda();
await p1.goto(BASE, { waitUntil: 'networkidle' });
await p1.waitForTimeout(400);
ok(await p1.getByText(/nuovo tavolo/i).count() > 0, "la prima schermata e' quella dei tavoli");
ok(await p1.getByText('Il Coro Sommerso').count() === 0, 'gli episodi non si vedono prima di avere un tavolo');

// --- 2. creato il tavolo, si arriva agli episodi
await p1.getByText(/nuovo tavolo/i).first().click();
await p1.fill('#nome-tavolo', 'Gruppo del giovedì');
await p1.click('#crea-tavolo');
await p1.waitForTimeout(800);
ok(await p1.getByText('Il Coro Sommerso').count() > 0, 'dopo il tavolo si vede la lista episodi');
const idTavolo = await p1.evaluate(() => localStorage.getItem('osr.tavolo'));
ok(!!idTavolo, 'il tavolo scelto resta sul dispositivo');

// --- 3. una partita giocata qui arriva al server
await p1.evaluate(async () => {
  const { salva } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep1', modo: 'tavolo', party: ['NINO GRIMALDELLO CAUTO'],
          fase: 'indagine', indagine: { ora: 21, chiusa: false }, spedizione: { round: 3 } });
});
await p1.waitForTimeout(4000);                      // la coda si svuota ogni 3s
const stato = await (await fetch(BASE + '/api/stato')).json();
ok(stato.salvataggi.some((s) => s.episodio === 'ep1' && s.tavolo === idTavolo),
  'il salvataggio e\' arrivato al server');

// --- 4. senza rete si gioca lo stesso, e al ritorno la coda si svuota
await p1.context().setOffline(true);
await p1.evaluate(async () => {
  const { salva } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep2', modo: 'tavolo', party: ['NINO GRIMALDELLO CAUTO'],
          fase: 'indagine', indagine: { ora: 19, chiusa: false }, spedizione: { round: 0 } });
});
await p1.waitForTimeout(4000);
ok(await p1.evaluate(() => (localStorage.getItem('osr.dasincronizzare') || '').includes('ep2')),
  'senza rete il salvataggio resta in coda');
ok(await p1.evaluate(() => !!localStorage.getItem(`osr.partita.${localStorage.getItem('osr.tavolo')}.ep2`)),
  'senza rete la partita si salva comunque sul dispositivo');
await p1.context().setOffline(false);
await p1.waitForTimeout(5000);
const stato2 = await (await fetch(BASE + '/api/stato')).json();
ok(stato2.salvataggi.some((s) => s.episodio === 'ep2'), 'tornata la rete, il salvataggio arriva al server');
// e la coda si svuota davvero: una coda che non si svuota rispedisce tutto per
// sempre, e con sendBeacon rimanda stato vecchio a ogni passaggio in secondo piano
ok(await p1.evaluate(() => JSON.parse(localStorage.getItem('osr.dasincronizzare') || '[]').length === 0),
  'dopo la spedizione la coda resta vuota');

// --- 5. due tavoli sullo stesso episodio non si incrociano
await p1.evaluate(async () => {
  const r = await fetch('/api/tavolo', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: crypto.randomUUID(), nome: 'Gruppo del sabato' }),
  });
  const { id } = await r.json();
  localStorage.setItem('osr.tavolo', id);
});
await p1.evaluate(async () => {
  const { salva, carica } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep1', modo: 'tavolo', party: ['CARLA DOSTI'], fase: 'indagine',
          indagine: { ora: 24, chiusa: false }, spedizione: { round: 0 } });
});
const partitaGiovedi = await p1.evaluate((t) =>
  JSON.parse(localStorage.getItem(`osr.partita.${t}.ep1`)), idTavolo);
ok(partitaGiovedi.indagine.ora === 21 && partitaGiovedi.spedizione.round === 3,
  'il secondo gruppo non ha toccato la partita del primo');

// --- 6. divergenza: l'app chiede, non sovrascrive
const p2 = await nuovaScheda();
await p2.goto(BASE, { waitUntil: 'networkidle' });
await p2.evaluate((t) => {
  localStorage.setItem('osr.tavolo', t);
  // stessa partita, andata avanti QUI dopo l'ultimo allineamento: sul server
  // c'e' la versione del punto 3, e nessuna delle due e' figlia dell'altra
  localStorage.setItem(`osr.partita.${t}.ep1`, JSON.stringify({
    v: 1, episodio: 'ep1', modo: 'tavolo', party: ['NINO GRIMALDELLO CAUTO'],
    fase: 'indagine', aggiornato: Date.now(), sincronizzato: 1,
    indagine: { ora: 18, chiusa: false }, spedizione: { round: 9 } }));
}, idTavolo);
await p2.reload({ waitUntil: 'networkidle' });
await p2.waitForTimeout(500);
await p2.getByText('Il Coro Sommerso').first().click();
await p2.waitForTimeout(400);
await p2.locator('#continua').click();
await p2.waitForTimeout(1200);
ok(await p2.getByText(/due versioni di questa partita/i).count() > 0,
  "con due versioni divergenti l'app chiede invece di sovrascrivere");
ok(await p2.getByText(/round 9/).count() > 0 && await p2.getByText(/round 3/).count() > 0,
  'la schermata mostra a che punto sono tutt\'e due');

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\ntest-account-ui: tutto a posto');
process.exit(ko ? 1 : 0);
