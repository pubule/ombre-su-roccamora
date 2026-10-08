// UN SOLO FILO COL TAVOLO, UN SOLO «CONTINUA» PER TIRO. Segnalato: attaccando un nemico la schermata
// dei dadi con «continua» compariva DUE volte. La causa: ogni volta che si entra nella Spedizione
// (aprendo l'episodio dal menu, tornando dopo un «← menu») si apriva un nuovo filo col tavolo senza
// chiudere il precedente. Con due fili, l'eco della propria mossa arrivava due volte: la prima era
// riconosciuta come propria e scartata, la seconda no, e veniva rimessa in scena come il tiro di un
// altro (i dadi in sola vista, col loro «continua»).
//
// La strada e' quella VERA, con un tavolo vero (Durable Object) e due browser autenticati.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:arbitro@esempio.it --port 8787
//   node webapp/test-doppio-continua-tavolo.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const ARB = 'arbitro@esempio.it';
const OSP = 'giocatore@esempio.it';
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const C = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const party = [C.eroi.find((e) => e.nome.includes('ELENA')).nome, C.eroi.find((e) => e.nome.includes('SIBILLA')).nome];
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };
const api = (chi, m, p, c) => fetch(BASE + p, {
  method: m, headers: { 'X-Osr-Dev-Email': chi, ...(c ? { 'Content-Type': 'application/json' } : {}) },
  body: c ? JSON.stringify(c) : undefined });

const id = crypto.randomUUID();
await api(ARB, 'POST', '/api/tavolo', { id, nome: 'Doppio continua' });
await api(ARB, 'PUT', '/api/party', { tavolo: id, party });
await api(ARB, 'POST', '/api/membri', { tavolo: id, email: ARB, eroe: party[0] });
await api(ARB, 'POST', '/api/membri', { tavolo: id, email: OSP, eroe: party[1] });
const apri = await api(ARB, 'POST', `/api/tavolo/${id}/apri`, { tavolo: id, stato: {
  v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione', rng: { seme: 5, passo: 0 }, creata: Date.now(), aggiornato: Date.now(),
  vantaggi: { tier: 'preparati' }, indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [],
    approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: true },
  spedizione: { digitale: true, round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, rivelate: ['T1'], stanzeLette: ['T1'], grate: [],
    compiti: {}, cercate: {}, log: [], scarti: [], eroiPos: { [party[0]]: { t: 'T1', x: 2, y: 1 }, [party[1]]: { t: 'T1', x: 1, y: 1 } },
    vite: { [party[0]]: 8, [party[1]]: 8 }, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
    scortati: [{ liberato: false, pos: null, mosso: false }], insidie: {}, abilita: {}, provaVento: { round: 2, chi: [] },
    mazzo: { pool: ['Quiete — Presagio'], ordine: [0, 0, 0], indice: 0 }, pendenza: null,
    nemici: [{ nome: 'LO SGHERRO', num: 1, ferite: 0, max: 5, pos: { t: 'T1', x: 3, y: 1 } }] } } });
ok(apri.ok, 'tavolo aperto con uno sgherro accanto a Elena');

const browser = await chromium.launch();
const errori = [];
const cx = await browser.newContext({ viewport: { width: 1280, height: 900 }, extraHTTPHeaders: { 'X-Osr-Dev-Email': ARB } });
const pg = await cx.newPage();
pg.on('pageerror', (e) => errori.push(e.message.slice(0, 90)));
// i fili aperti: ogni WebSocket creato, e se e' ancora vivo
await pg.addInitScript(() => {
  window.__ws = [];
  const W = window.WebSocket;
  window.WebSocket = function (...a) { const w = new W(...a); window.__ws.push(w); return w; };
  window.WebSocket.prototype = W.prototype;
  Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
});
await pg.goto(BASE, { waitUntil: 'domcontentloaded' });
await pg.evaluate((i) => { localStorage.clear(); localStorage.setItem('osr.tavolo', i); localStorage.setItem('osr.tavolo.nome', 'Doppio continua'); }, id);
await pg.goto(BASE, { waitUntil: 'networkidle' });
await pg.waitForSelector('#nav-esci');
const vivi = () => pg.evaluate(() => window.__ws.filter((w) => w.readyState <= 1 && /\/ws$/.test(new URL(w.url).pathname)).length);
ok(await vivi() === 1, `entrati nella Spedizione: un filo (${await vivi()})`);

// fuori al menu e dentro di nuovo, due volte: come fa chi esce e rientra
for (let i = 0; i < 2; i++) {
  await pg.click('#nav-esci');
  await pg.waitForSelector(`text=${EP.titolo}`, { timeout: 8000 });
  await pg.getByText(EP.titolo).first().click();
  await pg.getByText('Riprendete la serata', { exact: false }).first().click();
  await pg.waitForSelector('#nav-esci', { timeout: 8000 });
  await pg.waitForTimeout(600);
}
ok(await vivi() === 1, `dopo essere usciti e rientrati due volte: ancora un filo (${await vivi()})`);

// l'attacco: un solo «continua» sui dadi
await pg.evaluate(() => {
  window.__fin = [];
  new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) {
    if (n.nodeType === 1 && n.matches && n.matches('.dadi-overlay')) window.__fin.push(n.querySelector('[data-tot]') ? 'tiro' : 'vista');
  } }).observe(document.body, { childList: true });
});
await pg.locator('[data-nemico]').first().click();
await pg.waitForSelector('.dadi-overlay.aperto [data-tot="9"]');
await pg.click('.dadi-overlay.aperto [data-tot="9"]');
await pg.locator('#dadi-chiudi').waitFor({ state: 'visible', timeout: 5000 });
await pg.click('#dadi-chiudi');
await pg.waitForTimeout(3500);   // tempo per un'eco rimessa in scena
const finestre = await pg.evaluate(() => window.__fin);
ok(finestre.length === 1, `una sola finestra dei dadi per un attacco (${JSON.stringify(finestre)})`);
ok(errori.length === 0, `nessun errore JS: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
