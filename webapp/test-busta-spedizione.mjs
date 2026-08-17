// ROTTO IL SIGILLO, SI SCENDE ALLA VILLA.
//
// Segnalato al tavolo: chi arbitra rompe il sigillo, legge le risposte, preme
// «continuate» — e si ritrova nello STRADARIO, a notte finita, senza una
// strada per passare alla Spedizione.
//
// La causa erano due cose in fila, e questo banco le prende tutt'e due:
//   1. la pagina della busta di chi arbitra veniva rimpiazzata dalla propria
//      schermata condivisa, che torna indietro dal tavolo un istante dopo —
//      cioè dalla versione SENZA correzioni e senza «alla spedizione»;
//   2. quella schermata, chiudendosi, torna sempre dov'è il gruppo: giusto per
//      una carta letta a metà serata, sbagliato a busta aperta.
//
// COM'E' MESSO IN PIEDI. Due browser: uno autenticato come ARBITRO (l'header
// `X-Osr-Dev-Email` vale in `wrangler dev`, e Playwright lo mette su tutto il
// contesto — richieste e WebSocket), uno come chi gioca. E' la prima volta che
// il banco guarda lo schermo di chi conduce invece di bussare via HTTP.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-busta-spedizione.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const GIOCATORE = 'giocatore@esempio.it';
const ARBITRO = 'arbitro@esempio.it';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const chiama = (chi, metodo, percorso, corpo) => fetch(BASE + percorso, {
  method: metodo,
  headers: { 'X-Osr-Dev-Email': chi, ...(corpo ? { 'Content-Type': 'application/json' } : {}) },
  body: corpo ? JSON.stringify(corpo) : undefined,
});

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EP1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const ELENA = COMUNE.eroi.find((e) => e.nome.includes('ELENA')).nome;
const OTTONE = COMUNE.eroi.find((e) => e.nome.includes('OTTONE')).nome;

// una serata a fine corsa: le risposte scritte, le ore quasi finite
const serata = () => ({
  v: 1, episodio: 'ep1', modo: 'digitale', party: [ELENA, OTTONE], fase: 'indagine',
  vantaggi: null, rng: { seme: 77, passo: 0 }, aggiornato: Date.now(), creata: 3000,
  indagine: {
    ora: 23, lettaLettera: true, visitati: EP1.luoghi.slice(0, 3).map((l) => l.n),
    luogoAperto: null, scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [],
    approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: 'la chiave non torna',
    risposte: ['una', 'due', 'tre', 'quattro'], chiusa: false,
  },
  spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, scarti: [], esito: null },
});

const idT = crypto.randomUUID();
ok((await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'La busta' })).ok,
   'l’arbitro apre il tavolo');
ok((await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: [ELENA, OTTONE] })).ok,
   'e mette in campo i due eroi');
ok((await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: ELENA })).ok,
   'e da’ Elena a chi gioca');
ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: serata() })).ok,
   'e mette la serata sul tavolo');

const browser = await chromium.launch();
const errori = [];

// lo schermo di CHI ARBITRA: un contesto autenticato col suo indirizzo
const ctxArb = await browser.newContext({
  viewport: { width: 900, height: 1000 },
  extraHTTPHeaders: { 'X-Osr-Dev-Email': ARBITRO },
});
const arb = await ctxArb.newPage();
arb.on('pageerror', (e) => errori.push('arbitro: ' + e.message));
await arb.goto(BASE, { waitUntil: 'networkidle' });
ok(await arb.evaluate(async () => (await (await fetch('/api/stato')).json()).email) === ARBITRO,
   'il browser di chi arbitra è davvero il suo');

const apri = (p, ruolo, eroe) => p.evaluate(async ({ t, r, e, s }) => {
  const { vistaIndagine } = await import('/js/indagine.js');
  document.querySelector('#app').innerHTML = '';
  window.__vaiA = null;
  await vistaIndagine(document.querySelector('#app'), s, (dove) => { window.__vaiA = dove; },
                      { tavolo: t, ruolo: r, eroe: e, eroi: e ? [e] : [] });
}, { t: idT, r: ruolo, e: eroe, s: serata() });

await apri(arb, 'arbitro', null);
await arb.waitForTimeout(1200);

// e lo schermo di chi gioca, che deve leggere la busta e poi scendere anche lui
const tel = await browser.newPage({ viewport: { width: 420, height: 900 } });
tel.on('pageerror', (e) => errori.push('telefono: ' + e.message));
await tel.goto(BASE, { waitUntil: 'networkidle' });
await apri(tel, 'giocatore', ELENA);
await tel.waitForTimeout(1200);

// --- SI ROMPE IL SIGILLO, dal menu di chi arbitra
await arb.evaluate(() => document.querySelector('#apri-menu').click());
await arb.waitForTimeout(400);
ok(await arb.locator('#m-busta').count() === 1, 'nel menu c’è la busta');
await arb.evaluate(() => document.querySelector('#m-busta').click());
await arb.waitForTimeout(600);
ok(await arb.locator('#apri-busta').count() === 1, 'e il taccuino ha il sigillo da rompere');
await arb.evaluate(() => document.querySelector('#apri-busta').click());
await arb.waitForTimeout(600);
await arb.evaluate(() => document.querySelector('.scelta-overlay [data-si]').click());

// la spinta del tavolo torna indietro un istante dopo: è LI' che la pagina
// veniva rimpiazzata
await arb.waitForTimeout(2500);

{
  const dove = await arb.evaluate(() => ({
    titolo: document.querySelector('#app')?.innerText.slice(0, 40) || '',
    scendi: document.querySelectorAll('#alla-spedizione').length,
    continuate: document.querySelectorAll('#ok-msg').length,
  }));
  ok(/busta/i.test(dove.titolo), `chi arbitra sta leggendo la busta (${JSON.stringify(dove.titolo)})`);
  // IL CONTROLLO CHE DESCRIVE IL DIFETTO: il bottone per scendere deve essere
  // ancora lì. Rimpiazzata la pagina, al suo posto c'era solo «continuate».
  ok(dove.scendi === 1,
     `e la sua pagina tiene il bottone per scendere alla villa (${JSON.stringify(dove)})`);
}

// --- CHI ARRIVA DOPO (una scheda riaperta, chi arbitra che ricarica) trova la
// schermata condivisa e basta: quella si chiude col «continuate», e anche da
// li' la strada deve portare giu'. A busta aperta la notte e' finita, e
// tornare dov'era il gruppo vorrebbe dire rimandarlo a battere strade che non
// esistono piu'.
{
  // SI RIAPRE COLLO STATO DEL TAVOLO, non con la serata di partenza: chi
  // arbitra, aprendo, RIMETTE la partita sul tavolo — e ripassargli quella di
  // prima cancellerebbe la busta appena aperta. (E' successo scrivendo questo
  // banco: il tavolo tornava a `chiusa: false`.)
  await arb.evaluate(async ({ t }) => {
    const { vistaIndagine } = await import('/js/indagine.js');
    const v = await (await fetch(`/api/tavolo/${t}/stato`)).json();
    document.querySelector('#app').innerHTML = '';
    window.__vaiA = null;
    await vistaIndagine(document.querySelector('#app'), v.stato, (dove) => { window.__vaiA = dove; },
                        { tavolo: t, ruolo: 'arbitro', eroe: null, eroi: [] });
  }, { t: idT });
  await arb.waitForTimeout(2000);
  const dove = await arb.evaluate(() => ({
    continuate: document.querySelectorAll('#ok-msg').length,
    testo: document.querySelector('#app')?.innerText.slice(0, 40) || '',
  }));
  if (process.env.DIAG) {
    const st = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
    console.log('  [diag stato] chiusa:', st.stato.indagine.chiusa,
                '· carta:', st.stato.indagine.carta ? st.stato.indagine.carta.titolo : 'nessuna',
                '· fase:', st.stato.fase);
    console.log('  [diag schermo]', (await arb.evaluate(() => document.querySelector('#app').innerText)).slice(0, 160).replace(/\s+/g, ' '));
  }
  ok(dove.continuate === 1 && /busta/i.test(dove.testo),
     `ricaricando si trova la busta gia' aperta (${JSON.stringify(dove)})`);
  await arb.evaluate(() => document.querySelector('#ok-msg')?.click());
  await arb.waitForTimeout(1500);
  const finito = await arb.evaluate(() => window.__vaiA);
  ok(finito === 'spedizione',
     `e anche da li' si scende alla villa (visto ${finito})`);
}

// --- E SI SCENDE: qualunque bottone ci sia, si finisce in Spedizione
await arb.evaluate(() => {
  const b = document.querySelector('#alla-spedizione') || document.querySelector('#ok-msg');
  if (b) b.click();
});
await arb.waitForTimeout(1500);
{
  const dove = await arb.evaluate(() => window.__vaiA);
  ok(dove === 'spedizione', `rotto il sigillo, chi arbitra passa alla Spedizione (visto ${dove})`);
}

// e il telefono ci arriva quando la notte è chiusa davvero
await tel.waitForTimeout(2000);
{
  const dove = await tel.evaluate(() => window.__vaiA);
  ok(dove === 'spedizione', `e il telefono lo segue (visto ${dove})`);
}

ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);

await browser.close();
console.log(ko === 0 ? 'test-busta-spedizione: rotto il sigillo si scende alla villa'
                     : `test-busta-spedizione: ${ko} controlli rossi`);
process.exit(ko === 0 ? 0 : 1);
