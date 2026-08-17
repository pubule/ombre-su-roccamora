// NIENTE LAMPO: la stessa pagina non si riscrive.
//
// Segnalato al tavolo: «in Spedizione vedo un glitch doppio nelle schermate
// dopo che scendo — sembra un veloce refresh». Le spinte del tavolo arrivano
// anche quando quel che si vede non cambia (il filo che si apre, il
// `mettiSulTavolo` di chi arbitra, uno stato che cresce in parti che non si
// guardano): scendendo, la carta della tessera veniva scritta TRE volte in
// sessanta millesimi, e ogni riscrittura la fa sparire e ricomparire.
//
// Qui si conta: ogni riscrittura di `#app` e' un lampo, e per una schermata
// sola dev'essercene una sola.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-lampo.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const GIOCATORE = 'giocatore@esempio.it', ARBITRO = 'arbitro@esempio.it';
const chiama = (chi, m, p, c) => fetch(BASE + p, { method: m,
  headers: { 'X-Osr-Dev-Email': chi, ...(c ? { 'Content-Type': 'application/json' } : {}) },
  body: c ? JSON.stringify(c) : undefined });
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const party = COMUNE.eroi.slice(0, 2).map((e) => e.nome);
const T0 = EP.tessere[0].id;
const stato = {
  v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
  indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
              approfondimentiLetti: [], risposte: ['', '', '', ''] },
  vantaggi: { tier: 'preparati' }, rng: { seme: 4242, passo: 0 }, aggiornato: 1,
  spedizione: { round: 1, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, digitale: true,
    rivelate: [T0], grate: [], log: [], compiti: {}, cercate: {}, nemici: [],
    eroiPos: Object.fromEntries(party.map((nm, i) => [nm, { t: T0, x: i, y: 0 }])),
    vite: Object.fromEntries(party.map((nm) => [nm, 6])),
    azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[0],
    scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {} },
};
const idT = crypto.randomUUID();
await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'lampo' });
await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party });
await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: party[0] });
await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato });

const b = await chromium.launch();
const ctxArb = await b.newContext({ viewport: { width: 900, height: 1000 },
  extraHTTPHeaders: { 'X-Osr-Dev-Email': ARBITRO } });
const p = await ctxArb.newPage();
p.on('pageerror', (e) => console.log('[errore]', e.message));
await p.goto(BASE, { waitUntil: 'networkidle' });
// si conta ogni riscrittura di #app
await p.evaluate(() => {
  window.__disegni = [];
  const app = document.querySelector('#app');
  new MutationObserver(() => window.__disegni.push({
    t: Math.round(performance.now()),
    testa: (app.innerText || '').slice(0, 30).replace(/\s+/g, ' '),
  })).observe(app, { childList: true });
});
await p.evaluate(async ({ t, eroe }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const v = await (await fetch(`/api/tavolo/${t}/stato`)).json();
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), v.stato, () => {},
                      { tavolo: t, ruolo: 'arbitro', eroe: null, eroi: [] });
}, { t: idT, eroe: party[0] });
await p.waitForTimeout(3000);
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
{
  // il primo movimento e' lo svuotamento del banco (`innerHTML = ''`): quel che
  // conta e' che dopo ci sia UNA scrittura sola
  const d = await p.evaluate(() => window.__disegni.slice(1).map((x) => x.testa));
  ok(d.length === 1, `scendendo, la pagina si scrive una volta sola (viste ${d.length}: ${d.join(' · ')})`);
}

// e ora una mossa che rivela una tessera nuova
await p.evaluate(() => { window.__disegni = []; });
await p.evaluate(() => {
  const c = [...document.querySelectorAll('.cella-mossa.reveal, .cella-mossa')].pop();
  if (c) c.click();
});
await p.waitForTimeout(4000);
{
  // una mossa che rivela una stanza: la carta della stanza compare una volta,
  // non una per ogni spinta
  const d = await p.evaluate(() => window.__disegni.map((x) => x.testa));
  const doppi = d.filter((x, i) => i && x === d[i - 1]);
  ok(doppi.length === 0, `entrando in una tessera nessuna pagina si riscrive uguale (${doppi.length} riscritture: ${doppi.join(' · ')})`);
}
await b.close();
console.log(ko === 0 ? 'test-lampo: nessuna pagina riscritta uguale'
                     : `test-lampo: ${ko} controlli rossi`);
process.exit(ko === 0 ? 0 : 1);
