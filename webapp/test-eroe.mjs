// DUE DISPOSITIVI SULLA STESSA SERATA.
//
// E' il cancello della vista eroe, e prova la cosa che nessun test di prima
// poteva provare: che una mossa fatta da UNO compaia da SOLA sullo schermo
// dell'ALTRO. Finche' questo non e' verde, giocare in tanti non esiste — c'e'
// solo la stessa app aperta due volte.
//
// COM'E' MESSO IN PIEDI. Un `wrangler dev` solo, perche' due processi hanno due
// Durable Object separati e la partita sarebbe due partite (condividono il D1,
// non i DO). Chi e' chi lo decide da che parte si bussa:
//
//   - il BROWSER non manda header, quindi e' OSR_DEV_EMAIL, cioe' il giocatore
//     — ed e' giusto cosi': il WebSocket lo apre la pagina da sola, come sul
//     telefono vero;
//   - l'ARBITRO bussa da qui con `X-Osr-Dev-Email`, e muove via HTTP.
//
// Uso, in due terminali:
//   ./webapp/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   (altra porta: OSR_BASE=http://127.0.0.1:8791 node webapp/test-eroe.mjs)
//   node webapp/test-eroe.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const GIOCATORE = 'giocatore@esempio.it';     // = OSR_DEV_EMAIL: chi apre il browser
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
const T0 = EP1.tessere[0].id;

const partitaNuova = () => ({
  v: 1, episodio: 'ep1', modo: 'digitale', party: [ELENA, OTTONE], fase: 'spedizione',
  indagine: { ora: 20, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
              approfondimentiLetti: [], risposte: ['', '', '', ''] },
  vantaggi: { tier: 'preparati' }, rng: { seme: 4242, passo: 0 }, aggiornato: 1,
  spedizione: {
    round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, digitale: true,
    rivelate: [T0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
    eroiPos: { [ELENA]: { t: T0, x: 1, y: 1 }, [OTTONE]: { t: T0, x: 3, y: 1 } },
    vite: { [ELENA]: 6, [OTTONE]: 7 },
    azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: ELENA,
    scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {},
  },
});

// --- si prepara la serata: un tavolo, un giocatore che ha preso Elena
const idT = crypto.randomUUID();
ok((await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'Due dispositivi' })).ok,
   'l\'arbitro apre il tavolo');
ok((await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: ELENA })).ok,
   'e invita il giocatore, che prende Elena');
ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: partitaNuova() })).ok,
   'e mette la partita sul tavolo');

// --- IL TELEFONO DEL GIOCATORE
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });

await page.evaluate(async ({ idT: t, elena }) => {
  const { vistaDigitale } = await import('/js/digitale.js');
  const r = await fetch(`/api/tavolo/${t}/stato`);
  const v = await r.json();
  document.querySelector('#app').innerHTML = '';
  await vistaDigitale(document.querySelector('#app'), v.stato, () => {},
                      { tavolo: t, ruolo: 'giocatore', eroe: elena });
}, { idT, elena: ELENA });
for (const sel of ['#continua', '#via']) {
  const b = page.locator(sel);
  if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(250); }
}
await page.waitForTimeout(1200);          // il filo si apre e la prima vista arriva
ok(errori.length === 0, `il telefono apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);
ok(await page.locator('.tok-board').count() > 0, 'e vede la plancia');

// Dove sta Ottone adesso, sullo schermo del giocatore. La posizione e' sul
// `.tok-slot` (left/top in pixel), non sul segnalino dentro: e' lo slot che
// scivola quando il token si muove.
const dovEOttone = () => page.evaluate((nm) => {
  const slot = document.querySelector(`.tok-board[data-eroe="${nm}"]`)?.closest('.tok-slot');
  return slot ? `${slot.style.left}/${slot.style.top}` : null;
}, OTTONE);

// --- LA MOSSA DELL'ALTRO ARRIVA DA SOLA
{
  const prima = await dovEOttone();
  ok(prima !== null, 'il segnalino di Ottone c\'è sullo schermo del giocatore');

  const m = await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'muovi', eroe: OTTONE, nodo: { t: T0, x: 3, y: 3 } });
  ok(m.ok, `l'arbitro muove Ottone dal suo dispositivo (visto ${m.status})`);

  // NESSUN reload, NESSUN click: se cambia, è arrivato dal filo
  await page.waitForTimeout(1500);
  const dopo = await dovEOttone();
  ok(prima !== dopo,
     `la mossa dell'arbitro compare da sola sul telefono (prima «${prima}», dopo «${dopo}»)`);
}

// --- E LA MOSSA DEL GIOCATORE VA AL TAVOLO
{
  await page.evaluate(async ({ idT: t, elena }) => {
    await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'finisci-eroe', eroe: elena, rif: 'dal-telefono' }),
    });
  }, { idT, elena: ELENA });
  await page.waitForTimeout(800);
  const v = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok((v.stato.spedizione.eroiFatti || []).includes(ELENA),
     'quel che fa il telefono, l\'arbitro se lo ritrova');
}

// --- E QUEL CHE NON È SUO, IL TELEFONO NON LO PUÒ
{
  const r = await page.evaluate(async ({ idT: t, ottone }) => {
    const x = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'muovi', eroe: ottone, nodo: { t: 't1', x: 0, y: 0 } }),
    });
    return x.status;
  }, { idT, ottone: OTTONE });
  ok(r === 403, `il telefono non muove l'eroe di un altro nemmeno dalla console (visto ${r})`);
}

// --- CHI ARBITRA METTE LA PARTITA SUL TAVOLO SOLO APRENDO LA SPEDIZIONE
//
// Senza questo passo il tavolo resta vuoto: i giocatori si collegano a un
// oggetto che non ha nessuna partita e sui loro schermi non arriva niente — un
// silenzio, non un errore, che è il modo peggiore di rompersi. Qui NON si
// chiama `/apri`: si apre la pagina come fa chi arbitra, e si guarda se il
// tavolo poi ce l'ha.
{
  // il tavolo è di GIOCATORE, così il browser (che è OSR_DEV_EMAIL) ne è
  // l'arbitro senza bisogno di header
  const idA = crypto.randomUUID();
  await chiama(GIOCATORE, 'POST', '/api/tavolo', { id: idA, nome: 'Il tavolo che si apre da sé' });

  const vuoto = await chiama(GIOCATORE, 'GET', `/api/tavolo/${idA}/stato`);
  ok(vuoto.status === 404, `prima di aprire, il tavolo è vuoto (visto ${vuoto.status})`);

  const p2 = await browser.newPage();
  const err2 = [];
  p2.on('pageerror', (e) => err2.push(e.message));
  await p2.goto(BASE, { waitUntil: 'networkidle' });
  await p2.evaluate(async ({ id, elena, ottone, t0 }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const partita = {
      v: 1, episodio: 'ep1', modo: 'digitale', party: [elena, ottone], fase: 'spedizione',
      indagine: { ora: 20, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
                  approfondimentiLetti: [], risposte: ['', '', '', ''] },
      vantaggi: { tier: 'preparati' }, rng: { seme: 11, passo: 0 }, aggiornato: 2,
      spedizione: {
        round: 1, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, digitale: true,
        rivelate: [t0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
        eroiPos: { [elena]: { t: t0, x: 1, y: 1 }, [ottone]: { t: t0, x: 2, y: 1 } },
        vite: { [elena]: 6, [ottone]: 7 },
        azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: elena,
        scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {},
      },
    };
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {},
                        { tavolo: id, ruolo: 'arbitro', eroe: null });
  }, { id: idA, elena: ELENA, ottone: OTTONE, t0: T0 });
  await p2.waitForTimeout(1200);
  ok(err2.length === 0, `la pagina apre senza errori JS: ${err2.slice(0, 2).join(' | ')}`);

  const dopo = await chiama(GIOCATORE, 'GET', `/api/tavolo/${idA}/stato`);
  ok(dopo.ok, `dopo, il tavolo ha la partita (visto ${dopo.status})`);
  if (dopo.ok) {
    const v = await dopo.json();
    ok(v.stato.episodio === 'ep1' && v.stato.spedizione, 'ed è quella giusta');
  }
  await p2.close();
  await chiama(GIOCATORE, 'DELETE', `/api/tavolo?id=${idA}`);
}

await browser.close();
await chiama(ARBITRO, 'DELETE', `/api/tavolo?id=${idT}`);
console.log(ko === 0 ? 'test-eroe: due dispositivi, una serata sola' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
