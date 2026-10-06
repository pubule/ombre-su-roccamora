// LA FASE PERSA: il tavolo dice «indagine» con la Spedizione gia' aperta (visto sul salvataggio vero
// del Preludio). «Continua» andava all'Indagine e la carta della prima tessera non si chiudeva mai.
// Qui si porta il tavolo in quello stato, si ricarica la pagina di chi arbitra e si preme «continua».
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:arbitro@esempio.it --port 8787
//   node webapp/test-fase-persa-tavolo.mjs
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
await api(ARB, 'POST', '/api/tavolo', { id, nome: 'Fase persa' });
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

// IL TAVOLO PERDE LA FASE: stesso stato, ma «indagine» e un timbro piu' alto
const dopo = await (await api(ARB, 'GET', `/api/tavolo/${id}/stato`)).json();
const r = await api(ARB, 'POST', `/api/tavolo/${id}/apri`, { tavolo: id, stato: { ...dopo.stato, fase: 'indagine', aggiornato: Date.now() + 60000 } });
ok(r.ok, 'il tavolo ora dice «indagine» con la plancia aperta');
// chi arbitra ricarica la pagina, come al tavolo vero
await arb.reload({ waitUntil: 'networkidle' }); await arb.waitForTimeout(2500);
ok(await arb.locator('#ok-msg').isVisible(), 'dopo il ricarica chi arbitra e alla descrizione della tessera');
await arb.click('#ok-msg'); await arb.waitForTimeout(3000);
ok(await arb.locator('.board-digitale').count() === 1 && await arb.locator('#ok-msg').count() === 0, 'premuto «continua» si entra nella Spedizione');
const nuovo = await (await api(ARB, 'GET', `/api/tavolo/${id}/stato`)).json();
ok(nuovo.stato.fase === 'spedizione' && !nuovo.stato.spedizione.carta, 'e il tavolo e di nuovo in Spedizione, con la carta chiusa');
ok(errori.length === 0, `nessun errore JS ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
