// IL TIRO DI UN ALTRO NON COPRE UNA CARTA ANCORA APERTA.
//
// `.dadi-overlay` e' `position:fixed; z-index:100` (app.css): copre qualunque
// cosa sia a schermo. Finche' la fase Minaccia lascia una carta aperta
// (`sp.carta`, tutti la vedono — anche chi guarda da telefono, `schermataCarta`
// in digitale.js), il tiro di UN ALTRO eroe che arriva nel frattempo
// spegneva quella lettura sotto la finestra dei dadi: non un difetto di rete,
// un ordine di arrivo che nessuno controllava (riproduci(), digitale.js).
//
// Qui: si pesca una carta (resta aperta, nessuno la chiude), un secondo eroe
// attacca (tiri dichiarati) — sul telefono di chi guarda la carta deve
// restare a schermo finche' chi arbitra non la chiude, e SOLO allora arriva
// la finestra del tiro.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-dadi-vs-carta.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const GIOCATORE = 'giocatore@esempio.it', ARBITRO = 'arbitro@esempio.it';
const chiama = (chi, m, p, c) => fetch(BASE + p, { method: m,
  headers: { 'X-Osr-Dev-Email': chi, ...(c ? { 'Content-Type': 'application/json' } : {}) },
  body: c ? JSON.stringify(c) : undefined });

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const party = COMUNE.eroi.slice(0, 2).map((e) => e.nome);
const T0 = EP.tessere[0].id;
const SGH = COMUNE.nemici[0].nome;

const stato = {
  v: 1, episodio: 'ep1', modo: 'digitale', party, fase: 'spedizione',
  indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
              approfondimentiLetti: [], risposte: ['', '', '', ''] },
  vantaggi: { tier: 'preparati' }, rng: { seme: 4242, passo: 0 }, aggiornato: 1,
  spedizione: { round: 3, canto: 1, cantoBonus: false, fase: 'eroi', esito: null, digitale: true,
    rivelate: [T0], grate: [], log: [], compiti: {}, cercate: {}, stanzeLette: [T0],
    nemici: [{ nome: SGH, num: 1, pos: { t: T0, x: 2, y: 1 }, ferite: 0, max: 2 }],
    eroiPos: { [party[0]]: { t: T0, x: 1, y: 2 }, [party[1]]: { t: T0, x: 1, y: 1 } },
    vite: Object.fromEntries(party.map((nm) => [nm, 6])),
    azioni: {}, storditi: {}, eroiFatti: [...party], eroiAttivo: null,
    scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {} },
};
{
  const { costruisciMazzo } = await import('./public/motore/regole.js');
  stato.spedizione.mazzo = costruisciMazzo({ seme: 4242, passo: 0 }, CARTE, EP, 'ep1', null);
}

const idT = crypto.randomUUID();
await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'dadi vs carta' });
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

const leggiTel = () => tel.evaluate(() => {
  const o = document.querySelector('.dadi-overlay');
  return {
    carta: document.querySelectorAll('.carta-grande').length,
    overlayVisibile: !!o && getComputedStyle(o).display !== 'none' && o.classList.contains('aperto'),
  };
});

// --- 1. si pesca la carta: resta aperta, nessuno la chiude
await arb.evaluate(() => document.querySelector('#fase-minaccia').click());
await arb.waitForTimeout(1200);
ok((await leggiTel()).carta === 1, 'la carta pescata si vede sul telefono');
ok(!(await leggiTel()).overlayVisibile, 'e nessun tiro e ancora in scena');

// --- 2. un ALTRO eroe (non quello del telefono) attacca, con la carta ancora aperta
const rTiro = await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`, {
  tipo: 'attacca', eroe: party[1], bersaglio: 0, tiri: [[6, 6]],
});
ok(rTiro.ok, `l'attacco parte con la carta ancora aperta (${rTiro.status})`);

// --- 3. SUBITO DOPO: la carta deve essere ANCORA li', non coperta dal tiro
await tel.waitForTimeout(500);
{
  const st = await leggiTel();
  ok(st.carta === 1, `[subito dopo il tiro] la carta e' ancora a schermo (${JSON.stringify(st)})`);
  ok(!st.overlayVisibile, `[subito dopo il tiro] il tiro NON copre la carta (${JSON.stringify(st)})`);
}

// --- 4. chi arbitra chiude la carta: SOLO ORA deve comparire il tiro dell'altro
await arb.evaluate(() => document.querySelector('#ok-msg')?.click());
await tel.waitForTimeout(1500);
{
  const st = await leggiTel();
  ok(st.overlayVisibile, `chiusa la carta, il tiro dell'altro arriva (${JSON.stringify(st)})`);
}

// --- 5. IL VERSO OPPOSTO: il tiro di un altro e' GIA' a schermo (non ancora
// chiuso da chi guarda) quando arriva una carta — la carta deve aspettare
// lei, non spuntare sotto l'overlay pronta di scatto appena quello si chiude.
{
  const stato2 = JSON.parse(JSON.stringify(stato));
  stato2.spedizione.nemici = [{ nome: SGH, num: 1, pos: { t: T0, x: 2, y: 1 }, ferite: 0, max: 2 }];
  stato2.spedizione.carta = null;
  {
    const { costruisciMazzo } = await import('./public/motore/regole.js');
    stato2.spedizione.mazzo = costruisciMazzo({ seme: 5150, passo: 0 }, CARTE, EP, 'ep1', null);
  }
  const idT2 = crypto.randomUUID();
  await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT2, nome: 'dadi vs carta (verso opposto)' });
  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT2, party });
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT2, email: GIOCATORE, eroe: party[0] });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT2}/apri`, { tavolo: idT2, stato: stato2 });

  const arb2ctx = await b.newContext({ viewport: { width: 900, height: 1000 },
    extraHTTPHeaders: { 'X-Osr-Dev-Email': ARBITRO } });
  const arb2 = await arb2ctx.newPage();
  arb2.on('pageerror', (e) => console.log('[errore arbitro 2]', e.message));
  await arb2.goto(BASE, { waitUntil: 'networkidle' });
  await arb2.evaluate(async ({ t }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const v = await (await fetch(`/api/tavolo/${t}/stato`)).json();
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), v.stato, () => {},
                        { tavolo: t, ruolo: 'arbitro', eroe: null, eroi: [] });
  }, { t: idT2 });
  await arb2.waitForTimeout(1000);

  const tel2 = await b.newPage({ viewport: { width: 420, height: 900 } });
  tel2.on('pageerror', (e) => console.log('[errore telefono 2]', e.message));
  await tel2.goto(BASE, { waitUntil: 'networkidle' });
  await tel2.evaluate(async ({ t, e }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const v = await (await fetch(`/api/tavolo/${t}/stato`)).json();
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), v.stato, () => {},
                        { tavolo: t, ruolo: 'giocatore', eroe: e, eroi: [e] });
  }, { t: idT2, e: party[0] });
  await tel2.waitForTimeout(1200);

  const leggiTel2 = () => tel2.evaluate(() => {
    const o = document.querySelector('.dadi-overlay');
    return {
      carta: document.querySelectorAll('.carta-grande').length,
      overlayVisibile: !!o && getComputedStyle(o).display !== 'none' && o.classList.contains('aperto'),
    };
  });

  // il SECONDO eroe attacca per primo: il telefono (che ha il primo) vede
  // il tiro di un altro, e non lo chiude
  const rTiro2 = await chiama(ARBITRO, 'POST', `/api/tavolo/${idT2}/comando`, {
    tipo: 'attacca', eroe: party[1], bersaglio: 0, tiri: [[6, 6]],
  });
  ok(rTiro2.ok, `[verso opposto] l'attacco parte (${rTiro2.status})`);
  await tel2.waitForTimeout(700);
  ok((await leggiTel2()).overlayVisibile, '[verso opposto] il telefono vede il tiro dell\'altro, aperto');

  // ORA arriva la carta, col tiro ancora a schermo sul telefono
  await arb2.evaluate(() => document.querySelector('#fase-minaccia').click());
  await tel2.waitForTimeout(700);
  {
    const st = await leggiTel2();
    ok(st.overlayVisibile, `[verso opposto] il tiro resta a schermo (${JSON.stringify(st)})`);
    ok(st.carta === 0, `[verso opposto] la carta NON e' ancora arrivata (${JSON.stringify(st)})`);
  }

  // chi guarda chiude il tiro: SOLO ORA deve arrivare la carta
  await tel2.evaluate(() => document.querySelector('#dadi-chiudi')?.click());
  await tel2.waitForTimeout(1200);
  {
    const st = await leggiTel2();
    ok(st.carta === 1, `[verso opposto] chiuso il tiro, la carta arriva (${JSON.stringify(st)})`);
  }
}

await b.close();
console.log(ko === 0
  ? '\ntest-dadi-vs-carta: dadi e carta si aspettano a vicenda, mai uno sopra l\'altro'
  : `\n${ko} FALLITI`);
process.exit(ko ? 1 : 0);
