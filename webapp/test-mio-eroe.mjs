// IL GIOCATORE SI PRENDE L'EROE, dal proprio telefono.
//
// Chi arbitra dice a quale tavolo siedi; quale eroe giochi lo decidi tu. Senza
// questo, l'arbitro sceglieva per tutti prima di ogni serata, e chi arrivava
// dopo restava con un posto muto finché qualcuno non tornava sul PC.
//
// Quel che c'è da provare è che il permesso sia stretto quanto serve: si scrive
// SOLO il proprio posto, SOLO fra gli eroi della compagnia, e SOLO se libero.
//
// Uso:
//   ./deploy/build-dist.sh && ./deploy/applica-schema.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-mio-eroe.mjs        (o OSR_BASE=http://127.0.0.1:8799 …)
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const GIOCATORE = 'giocatore@esempio.it';    // = OSR_DEV_EMAIL: chi apre il browser
const ARBITRO = 'arbitro@esempio.it';
const TERZO = 'terzo@esempio.it';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const chiama = (chi, metodo, percorso, corpo) => fetch(BASE + percorso, {
  method: metodo,
  headers: { 'X-Osr-Dev-Email': chi, ...(corpo ? { 'Content-Type': 'application/json' } : {}) },
  body: corpo ? JSON.stringify(corpo) : undefined,
});

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const ELENA = COMUNE.eroi.find((e) => e.nome.includes('ELENA')).nome;
const OTTONE = COMUNE.eroi.find((e) => e.nome.includes('OTTONE')).nome;
const FUORI = COMUNE.eroi.find((e) => ![ELENA, OTTONE].includes(e.nome)).nome;

// --- l'arbitro prepara: tavolo, compagnia, e due posti senza eroe
const idT = crypto.randomUUID();
await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'Il tavolo di prova' });
await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, nome: 'Fabio' });
await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: TERZO, nome: 'Marco' });
ok((await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: [ELENA, OTTONE] })).ok,
   'l\'arbitro compone la compagnia');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));

async function apri() {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async ({ id }) => {
    const { vistaMioEroe } = await import('/js/mio-eroe.js');
    document.querySelector('#app').innerHTML = '';
    await vistaMioEroe(document.querySelector('#app'), id, 'Il tavolo di prova', () => {
      document.querySelector('#app').dataset.entrato = '1';
    });
  }, { id: idT });
  await page.waitForTimeout(600);
}
await apri();
ok(errori.length === 0, `la schermata apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);

// --- SI VEDONO SOLO GLI EROI DELLA COMPAGNIA
{
  const tiles = await page.locator('.eroe-tile').count();
  ok(tiles === 2, `si scelgono solo i due della compagnia (visti ${tiles})`);
}

// --- SI PRENDE UN EROE, e resta preso
{
  await page.click(`.eroe-tile[data-nome="${ELENA}"]`);
  await page.waitForTimeout(700);
  const r = await (await chiama(ARBITRO, 'GET', `/api/membri?tavolo=${idT}`)).json();
  const mio = (r.membri || []).find((m) => m.email === GIOCATORE);
  ok(mio && mio.eroe === ELENA, `l'eroe scelto è suo (visto ${mio && mio.eroe})`);
  const t = await page.locator('.pannello').innerText();
  ok(/il tuo eroe/i.test(t), 'e la schermata lo dice');
}

// --- L'EROE DI UN ALTRO NON SI PRENDE
// L'indice unico su (tavolo, eroe) morde comunque, ma un rifiuto in chiaro è
// meglio di un errore di database — e la schermata non lo propone nemmeno.
{
  ok((await chiama(TERZO, 'PUT', '/api/mio-eroe', { tavolo: idT, eroe: OTTONE })).ok,
     'il terzo prende l\'altro eroe');
  await apri();
  const preso = page.locator(`.eroe-tile[data-nome="${OTTONE}"]`);
  ok((await preso.getAttribute('class')).includes('preso'), 'l\'eroe altrui si vede occupato');
  const et = await preso.innerText();
  ok(/marco/i.test(et), `e dice di chi è, per nome (visto «${et.replace(/\\n/g, ' ')}»)`);

  const r = await chiama(GIOCATORE, 'PUT', '/api/mio-eroe', { tavolo: idT, eroe: OTTONE });
  ok(r.status === 409, `e il server lo rifiuta lo stesso (visto ${r.status})`);
}

// --- FUORI DALLA COMPAGNIA non si sceglie
{
  const r = await chiama(GIOCATORE, 'PUT', '/api/mio-eroe', { tavolo: idT, eroe: FUORI });
  ok(r.status === 400, `un eroe fuori compagnia è rifiutato (visto ${r.status})`);
}

// --- E NON SI SCRIVE IL POSTO DI UN ALTRO
// È il punto del permesso: si apre quel tanto che basta perché ognuno scriva
// SOLO il proprio, non perché chiunque scriva ovunque.
{
  const estraneo = 'nessuno@esempio.it';
  const r = await chiama(estraneo, 'PUT', '/api/mio-eroe', { tavolo: idT, eroe: ELENA });
  ok(r.status === 404, `chi non siede al tavolo non tocca niente (visto ${r.status})`);

  const dopo = await (await chiama(ARBITRO, 'GET', `/api/membri?tavolo=${idT}`)).json();
  ok((dopo.membri || []).find((m) => m.email === GIOCATORE).eroe === ELENA,
     'e l\'eroe di chi c\'era resta suo');
}

// --- SI PUÒ CAMBIARE IDEA: ritoccare il proprio lo libera
{
  await apri();
  await page.click(`.eroe-tile[data-nome="${ELENA}"]`);
  await page.waitForTimeout(700);
  const r = await (await chiama(ARBITRO, 'GET', `/api/membri?tavolo=${idT}`)).json();
  ok((r.membri || []).find((m) => m.email === GIOCATORE).eroe === null,
     'ritoccare il proprio eroe lo lascia');
}

ok(errori.length === 0, `nessun errore JS in tutta la sessione: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
await chiama(ARBITRO, 'DELETE', `/api/tavolo?id=${idT}`);
console.log(ko === 0 ? 'test-mio-eroe: ognuno si prende il suo' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
