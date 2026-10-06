// DALLA BUSTA ALLA SPEDIZIONE, COL TAVOLO VERO (Durable Object): chi arbitra e un telefono.
//
// Segnalato: aprendo la busta e passando alla Spedizione comparivano schermate strane, e si restava
// sulla descrizione della prima tessera. La causa trovata: lo stato che arriva dal tavolo — lo snapshot
// all'apertura del filo, l'eco di un `apri` vecchio — era il segnaposto della Spedizione (round 0,
// nessuna plancia), e render() lo disegnava (Cannot read properties of undefined) invece di restare
// sulla schermata d'ingresso; chi arbitra, inoltre, lo applicava sopra la Spedizione appena cominciata.
//
// La strada qui e' quella VERA (main.js: entraNelTavolo, vaiA), con due browser autenticati.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:arbitro@esempio.it --port 8787
//   node webapp/test-spedizione-tavolo.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const ARB = 'arbitro@esempio.it';
const OSP = 'giocatore@esempio.it';
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const C = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const party = [C.eroi.find((e) => e.nome.includes('ELENA')).nome, C.eroi.find((e) => e.nome.includes('OTTONE')).nome];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const api = (chi, m, p, c) => fetch(BASE + p, {
  method: m, headers: { 'X-Osr-Dev-Email': chi, ...(c ? { 'Content-Type': 'application/json' } : {}) },
  body: c ? JSON.stringify(c) : undefined });
const id = crypto.randomUUID();
await api(ARB, 'POST', '/api/tavolo', { id, nome: 'Dalla busta alla spedizione' });
await api(ARB, 'PUT', '/api/party', { tavolo: id, party });
await api(ARB, 'POST', '/api/membri', { tavolo: id, email: ARB, eroe: party[0] });
await api(ARB, 'POST', '/api/membri', { tavolo: id, email: OSP, eroe: party[1] });
await api(ARB, 'POST', `/api/tavolo/${id}/apri`, { tavolo: id, stato: {
  v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'indagine', vantaggi: null, rng: { seme: 5, passo: 0 },
  creata: Date.now(), aggiornato: Date.now(),
  indagine: { ora: 20, lettaLettera: true, visitati: [1, 2], scoperti: [], sbloccati: [], parole: [], oggetti: [],
    reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: false },
  spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, scarti: [], esito: null } } });

const browser = await chromium.launch();
const errori = [];
async function utente(chi, nome, w, h) {
  const cx = await browser.newContext({ viewport: { width: w, height: h }, extraHTTPHeaders: { 'X-Osr-Dev-Email': chi } });
  const pg = await cx.newPage();
  pg.on('pageerror', (e) => errori.push(`${nome}: ${e.message.slice(0, 90)}`));
  await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
  await pg.evaluate((i) => { localStorage.clear(); localStorage.setItem('osr.tavolo', i); localStorage.setItem('osr.tavolo.nome', 'Dalla busta alla spedizione'); }, id);
  await pg.goto(BASE, { waitUntil: 'networkidle' });
  return pg;
}
const arb = await utente(ARB, 'arbitro', 1280, 800);
const tel = await utente(OSP, 'telefono', 420, 900);
await arb.waitForTimeout(1500);
const dove = (p) => p.evaluate(() => ({ t: document.body.innerText.replace(/\n/g, ' | '), ok: !!document.querySelector('#ok-msg'),
  via: !!document.querySelector('#via'), board: !!document.querySelector('.board-digitale') }));

// si apre la busta e si scende
await arb.click('#apri-menu'); await arb.click('#m-taccuino');
const dom = EP.soluzione.domande.filter((d) => !d.dopo_spedizione);
for (let i = 0; i < dom.length; i++) await arb.locator(`[data-risposta="${i}"]`).fill(dom[i].risposta);
await arb.click('#apri-busta');
const si = arb.locator('.scelta-box.chiesta [data-si]');
await si.waitFor({ state: 'visible', timeout: 5000 }); await si.click();
await arb.waitForSelector('#alla-spedizione'); await arb.waitForTimeout(800);
await arb.click('#alla-spedizione'); await arb.waitForSelector('#via'); await arb.waitForTimeout(500);

// la schermata d'ingresso della Spedizione porta il titolo, anche sul telefono (non il segnaposto spoglio)
const telIngresso = await dove(tel);
ok(/Il Coro Sommerso/.test(telIngresso.t), 'sul telefono la schermata d\'ingresso della Spedizione ha il titolo dell\'episodio');

await arb.click('#via'); await arb.waitForTimeout(2500);
ok((await dove(arb)).ok, 'chi arbitra legge la descrizione della prima tessera');
await arb.click('#ok-msg'); await arb.waitForTimeout(2000);
const a = await dove(arb); const t = await dove(tel);
ok(a.board && !a.ok, 'premuto «continua» chi arbitra esce dalla descrizione e vede la plancia');
ok(t.board, 'e il telefono vede la plancia');
ok(errori.length === 0, `nessun errore JS, ne su chi arbitra ne sul telefono ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
