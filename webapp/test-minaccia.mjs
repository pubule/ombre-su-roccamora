// LE CARTE MINACCIA SU OGNI SCHERMO.
//
// La carta pescata resta APERTA nello stato (`sp.carta`) e viaggia intera:
// e' cosi' che i telefoni la vedono, e che chi ricarica la ritrova. Qui si
// prova la catena per intero, dalle due parti: chi arbitra preme «fase
// minaccia», e sul telefono deve comparire la stessa carta — immagine
// compresa, perche' nelle Minacce l'immagine E' la carta.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-minaccia.mjs        (EP=preludio per il Preludio)
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const GIOCATORE = 'giocatore@esempio.it', ARBITRO = 'arbitro@esempio.it';
const chiama = (chi, m, p, c) => fetch(BASE + p, { method: m,
  headers: { 'X-Osr-Dev-Email': chi, ...(c ? { 'Content-Type': 'application/json' } : {}) },
  body: c ? JSON.stringify(c) : undefined });
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const QUALE = process.env.EP || 'ep1';
const EP = JSON.parse(readFileSync(`webapp/data/${QUALE}.json`, 'utf8'));
const party = COMUNE.eroi.slice(0, 4).map((e) => e.nome);
const T0 = EP.tessere[0].id;
const stato = {
  v: 1, episodio: QUALE, modo: 'digitale', party, fase: 'spedizione',
  indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
              approfondimentiLetti: [], risposte: ['', '', '', ''] },
  vantaggi: { tier: 'preparati' }, rng: { seme: 4242, passo: 0 }, aggiornato: 1,
  spedizione: { round: 3, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, digitale: true,
    rivelate: [T0], grate: [], log: [], compiti: {}, cercate: {}, nemici: [], stanzeLette: [T0],
    eroiPos: Object.fromEntries(party.map((nm, i) => [nm, { t: T0, x: i, y: 0 }])),
    vite: Object.fromEntries(party.map((nm) => [nm, 6])),
    azioni: {}, storditi: {}, eroiFatti: [...party], eroiAttivo: null,
    scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {} },
};
// il mazzo vero: senza, la fase minaccia non pesca (e il banco misurerebbe il nulla)
{
  const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
  const { costruisciMazzo } = await import('./public/motore/regole.js');
  stato.spedizione.mazzo = costruisciMazzo({ seme: 4242, passo: 0 }, CARTE, EP, QUALE, null);
}

const idT = crypto.randomUUID();
await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'minaccia' });
await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party });
await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: party[0] });
await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato });

const b = await chromium.launch();
const monta = async (page, ruolo, eroe) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async ({ t, r, e }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const v = await (await fetch(`/api/tavolo/${t}/stato`)).json();
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), v.stato, () => {},
                        { tavolo: t, ruolo: r, eroe: e, eroi: e ? [e] : [] });
  }, { t: idT, r: ruolo, e: eroe });
  await page.waitForTimeout(1200);
};
const ctxArb = await b.newContext({ viewport: { width: 900, height: 1000 },
  extraHTTPHeaders: { 'X-Osr-Dev-Email': ARBITRO } });
const arb = await ctxArb.newPage();
arb.on('pageerror', (e) => console.log('[errore arbitro]', e.message));
await monta(arb, 'arbitro', null);
const tel = await b.newPage({ viewport: { width: 420, height: 900 } });
tel.on('pageerror', (e) => console.log('[errore telefono]', e.message));
await monta(tel, 'giocatore', party[0]);

// chi arbitra manda la fase minaccia
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
ok(await arb.evaluate(() => !!document.querySelector('#fase-minaccia')),
   'chi arbitra ha il bottone della fase minaccia');
await arb.evaluate(() => document.querySelector('#fase-minaccia').click());
await arb.waitForTimeout(3000);
const leggi = async (p) => p.evaluate(() => ({
  testa: (document.querySelector('#app').innerText || '').slice(0, 46).replace(/\s+/g, ' '),
  carta: document.querySelectorAll('.carta-grande').length,
  // l'IMMAGINE della carta e' la carta: se non carica, a schermo non c'e'
  img: [...document.querySelectorAll('.carta-grande img')].map((i) => ({
    src: i.getAttribute('src').slice(-42), caricata: i.naturalWidth > 0, vista: i.offsetParent !== null })),
}));
const chiArbitra = await leggi(arb);
const telefono = await leggi(tel);
const st = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
ok(st.stato.spedizione.carta, 'la carta pescata resta aperta nello stato del tavolo');
ok(chiArbitra.carta === 1, `chi arbitra vede la carta (${JSON.stringify(chiArbitra.testa)})`);
// IL PUNTO: la stessa carta sul telefono, immagine compresa — nelle Minacce
// l'immagine E' la carta, e un riquadro vuoto non e' una carta mostrata
ok(telefono.carta === 1, `e il telefono vede la stessa carta (${JSON.stringify(telefono.testa)})`);
ok(telefono.img.length === 1 && telefono.img[0].caricata && telefono.img[0].vista,
   `e l'immagine della carta e' caricata e a schermo (${JSON.stringify(telefono.img)})`);
await b.close();
console.log(ko === 0 ? 'test-minaccia: la carta pescata si vede su ogni schermo'
                     : `test-minaccia: ${ko} controlli rossi`);
process.exit(ko === 0 ? 0 : 1);
