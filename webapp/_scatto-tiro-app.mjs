// Guardare il tiro VERO, non il mockup: la finestra dell'app, sullo schermo di
// chi tira e su quello di chi guarda.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const GIOCATORE = 'giocatore@esempio.it', ARBITRO = 'arbitro@esempio.it';
const chiama = (chi, m, p, c) => fetch(BASE + p, { method: m,
  headers: { 'X-Osr-Dev-Email': chi, ...(c ? { 'Content-Type': 'application/json' } : {}) },
  body: c ? JSON.stringify(c) : undefined });
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EP1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const OTTONE = COMUNE.eroi.find((e) => e.nome.includes('OTTONE')).nome;
const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
const TIPO = LUOGO.approfondimenti[0].tipo;
const IDONEO = COMUNE.eroi.find((e) => ((e.cariche || {})[TIPO] || 0) > 0);
const serata = () => ({ v: 1, episodio: 'ep1', modo: 'digitale', party: [IDONEO.nome, OTTONE],
  fase: 'indagine', vantaggi: null, rng: { seme: 77, passo: 0 }, aggiornato: Date.now(), creata: 3000,
  indagine: { ora: 21, lettaLettera: true, visitati: [LUOGO.n], luogoAperto: LUOGO.n, scoperti: [],
    sbloccati: [], parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
    secondoFiato: {}, note: '', risposte: ['', '', '', ''], risposteEsatte: [false, false, false, false],
    chiusa: false },
  spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, scarti: [], esito: null } });
const idT = crypto.randomUUID();
await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'scatti del tiro' });
await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: [IDONEO.nome, OTTONE] });
await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: IDONEO.nome });
await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: serata() });
const b = await chromium.launch();
const apri = async () => {
  const p = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(async ({ t, eroe, s }) => {
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), s, () => {},
                        { tavolo: t, ruolo: 'giocatore', eroe, eroi: [eroe] });
  }, { t: idT, eroe: IDONEO.nome, s: serata() });
  await p.waitForTimeout(1200);
  if (await p.locator('#entrate').count()) { await p.evaluate(() => document.querySelector('#entrate').click()); await p.waitForTimeout(700); }
  return p;
};
const a = await apri(), g = await apri();
await a.evaluate((x) => document.querySelector(x).click(), `[data-appr="approfondisci"][data-tipo="${TIPO}"]`);
await a.waitForTimeout(1200);
await a.screenshot({ path: 'scatti/app-tiro-1-scelta.png' });
await a.locator('#dadi-tavolo [data-tot="4"]').click();   // 4: sotto la soglia, cosi' si vede la seconda occasione
await a.waitForTimeout(3200);
await a.screenshot({ path: 'scatti/app-tiro-2-verdetto.png' });
await a.locator('#dadi-chiudi').click();
await g.waitForTimeout(2500);
await g.screenshot({ path: 'scatti/app-tiro-3-chi-guarda.png' });
// e la Spedizione: il colpo lo manda chi arbitra, la finestra si apre qui
{
  const T0 = EP1.tessere[0].id;
  const NEMICO = (EP1.nemici && EP1.nemici[0] && EP1.nemici[0].nome)
    || (COMUNE.nemici && COMUNE.nemici[0] && COMUNE.nemici[0].nome);
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: {
    v: 1, episodio: 'ep1', modo: 'digitale', party: [IDONEO.nome, OTTONE], fase: 'spedizione',
    indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
                approfondimentiLetti: [], risposte: ['', '', '', ''] },
    vantaggi: { tier: 'preparati' }, rng: { seme: 4242, passo: 0 }, aggiornato: 1,
    spedizione: { round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, digitale: true,
      rivelate: [T0], grate: [], log: [], compiti: {}, cercate: {},
      nemici: [{ nome: NEMICO, pos: { t: T0, x: 2, y: 1 }, ferite: 0, max: 3 }],
      eroiPos: { [IDONEO.nome]: { t: T0, x: 1, y: 1 }, [OTTONE]: { t: T0, x: 3, y: 1 } },
      vite: { [IDONEO.nome]: 6, [OTTONE]: 7 }, azioni: {}, storditi: {}, eroiFatti: [],
      eroiAttivo: IDONEO.nome, scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {} },
  } });
  const s2 = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await s2.goto(BASE, { waitUntil: 'networkidle' });
  await s2.evaluate(async ({ t, eroe }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const v = await (await fetch(`/api/tavolo/${t}/stato`)).json();
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), v.stato, () => {},
                        { tavolo: t, ruolo: 'giocatore', eroe, eroi: [eroe] });
  }, { t: idT, eroe: IDONEO.nome });
  for (const sel of ['#continua', '#via']) {
    const x = s2.locator(sel);
    if (await x.count()) { await x.first().click().catch(() => {}); await s2.waitForTimeout(250); }
  }
  await s2.waitForTimeout(1200);
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'attacca', eroe: IDONEO.nome, bersaglio: 0, tiri: [[6, 6]] });
  await s2.waitForTimeout(2600);
  await s2.screenshot({ path: 'scatti/app-tiro-4-spedizione.png' });
  console.log('riga di chi tira:', JSON.stringify(await s2.evaluate(() => {
    const c = document.querySelector('.chi-tira');
    return c ? { nome: c.querySelector('.nome')?.textContent.trim(),
                 prova: c.querySelector('.prova')?.textContent } : null;
  })));
}
await b.close();
console.log('scatti pronti');
