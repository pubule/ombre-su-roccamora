// «CONTINUA» NON RESTA MUTO SE IL TAVOLO E' RIMASTO INDIETRO.
//
// Segnalato: alla descrizione della prima tessera, premendo «continua» non si entrava nella
// Spedizione. Il tavolo (Durable Object) puo' avere uno stato diverso da quello di chi arbitra — un
// `apri` scartato per via dei timbri, una Spedizione di prima con l'esito gia' scritto — e rifiuta
// il comando: la carta restava li' per sempre. Chi arbitra e' l'autore dello stato: a un rifiuto
// chiude la carta, rimanda il suo stato al tavolo con `forza` e prosegue.
//
// Qui il tavolo viene portato di proposito in uno stato che rifiuta («La spedizione e' gia' chiusa»)
// mentre la carta e' aperta, poi si preme «continua».
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:arbitro@esempio.it --port 8787
//   node webapp/test-tavolo-riallineato.mjs
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
await api(ARB, 'POST', '/api/tavolo', { id, nome: 'Tavolo riallineato' });
await api(ARB, 'PUT', '/api/party', { tavolo: id, party });
await api(ARB, 'POST', '/api/membri', { tavolo: id, email: ARB, eroe: party[0] });
await api(ARB, 'POST', '/api/membri', { tavolo: id, email: OSP, eroe: party[1] });
const creata = Date.now();
const stato = (extra = {}) => ({ v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'indagine', vantaggi: null,
  rng: { seme: 5, passo: 0 }, creata, aggiornato: Date.now(),
  indagine: { ora: 20, lettaLettera: true, visitati: [1, 2], scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [],
    approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: false },
  spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, scarti: [], esito: null }, ...extra });
await api(ARB, 'POST', `/api/tavolo/${id}/apri`, { tavolo: id, stato: stato() });

const browser = await chromium.launch();
const cx = await browser.newContext({ viewport: { width: 1280, height: 800 }, extraHTTPHeaders: { 'X-Osr-Dev-Email': ARB } });
const arb = await cx.newPage();
const errori = [];
arb.on('pageerror', (e) => errori.push(e.message.slice(0, 90)));
await arb.goto(BASE, { waitUntil: 'domcontentloaded' });
await arb.evaluate((i) => { localStorage.clear(); localStorage.setItem('osr.tavolo', i); localStorage.setItem('osr.tavolo.nome', 'Tavolo riallineato'); }, id);
await arb.goto(BASE, { waitUntil: 'networkidle' });
await arb.waitForTimeout(1500);

await arb.click('#apri-menu'); await arb.click('#m-taccuino');
const dom = EP.soluzione.domande.filter((d) => !d.dopo_spedizione);
for (let i = 0; i < dom.length; i++) await arb.locator(`[data-risposta="${i}"]`).fill(dom[i].risposta);
await arb.click('#apri-busta');
const si = arb.locator('.scelta-box.chiesta [data-si]');
await si.waitFor({ state: 'visible', timeout: 5000 }); await si.click();
await arb.waitForSelector('#alla-spedizione'); await arb.waitForTimeout(500);
await arb.click('#alla-spedizione'); await arb.waitForSelector('#via'); await arb.waitForTimeout(400);
await arb.click('#via'); await arb.waitForTimeout(2000);
ok(await arb.locator('#ok-msg').isVisible(), 'si e alla descrizione della prima tessera');

// IL TAVOLO VA IN UNO STATO CHE RIFIUTA: un'altra versione, con timbro piu' alto e la Spedizione chiusa
const dopo = await (await api(ARB, 'GET', `/api/tavolo/${id}/stato`)).json();
const rotto = { ...dopo.stato, aggiornato: Date.now() + 60000,
  spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, scarti: [], esito: null } };
const r = await api(ARB, 'POST', `/api/tavolo/${id}/apri`, { tavolo: id, stato: rotto });
ok(r.ok, 'il tavolo e stato portato al segnaposto della Spedizione, con un timbro piu alto');
await arb.waitForTimeout(500);

await arb.click('#ok-msg'); await arb.waitForTimeout(3000);
ok(await arb.locator('.board-digitale').count() === 1, 'premuto «continua» si entra comunque nella Spedizione');
const nuovo = await (await api(ARB, 'GET', `/api/tavolo/${id}/stato`)).json();
ok(nuovo.stato.spedizione.digitale === true && nuovo.stato.spedizione.round === 1, 'e il tavolo e stato riallineato alla Spedizione di chi arbitra');
ok(errori.length === 0, `nessun errore JS ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
