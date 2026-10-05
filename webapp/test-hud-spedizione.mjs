// L'HUD A TRE COLONNE della Spedizione (Task 6, piano
// docs/superpowers/plans/2026-09-24-plancia-lanterne.md): tre colonne
// (#col-eroi, .board-area, #col-notte), la carta dell'eroe di turno che si
// apre, sul telefono le schede eroi/la notte/diario — e la notte SENZA il
// diario, diario SOLO col diario (il difetto visto nel mockup il 25/09/2026,
// corretto li').
//
// Si semina la partita come test-posto-eroe.mjs (chiama `vistaDigitale`
// direttamente, con o senza un `posto`): e' lo stesso schema-dati di
// test-digitale-ui.mjs (fase spedizione, rivelate/eroiPos/vite) ma permette
// anche il secondo giro con un GIOCATORE, che il solo `localStorage` non puo'
// dare (`posto` e' un parametro di `vistaDigitale`, non dello storage).
//
// Uso:  node webapp/server.js ; node webapp/test-hud-spedizione.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = 'http://localhost:8017';
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const T0 = EP.tessere[0].id;

const ELENA = COMUNE.eroi.find((e) => e.nome.includes('ELENA')).nome;
const ATTILIO = COMUNE.eroi.find((e) => e.nome.includes('ATTILIO')).nome;   // ha una carica vera (CARICHE_SPED)
const SIBILLA = COMUNE.eroi.find((e) => e.nome.includes('SIBILLA')).nome;
const PARTY = [ELENA, ATTILIO, SIBILLA];

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
const fail = (m) => { console.error('FAIL:', m); ko++; };

const browser = await chromium.launch();

// Apre la Spedizione gia' cominciata (round 2, ATTILIO di turno) con un posto
// dato — `null`/assente = l'arbitro. `ritocca(partita)` cambia lo stato
// seminato prima di montare la vista (usato per il giro «tutti hanno agito»
// dello Step 5).
async function apri(viewport, posto, ritocca) {
  const page = await browser.newPage({ viewport });
  const errori = [];
  page.on('pageerror', (e) => errori.push(e.message));
  // il 404 su /api/stato e' voluto: e' la sonda con cui l'app capisce se
  // esiste un server dei salvataggi (webapp/server.js serve solo file), come
  // in test-digitale-ui.mjs
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if ((m.location()?.url || '').includes('/api/')) return;
    errori.push('console.error: ' + m.text().slice(0, 200));
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async ({ ep, party, posto: p, t0, r }) => {
    const mod = await import('/js/digitale.js');
    const { vistaDigitale } = mod;
    const eroiPos = {}; const vite = {};
    party.forEach((n, i) => { eroiPos[n] = { t: t0, x: i, y: 1 }; vite[n] = 6; });
    const partita = {
      v: 1, episodio: ep, modo: 'digitale', party, fase: 'spedizione',
      indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true, approfondimentiLetti: [] },
      vantaggi: { tier: 'preparati' },
      spedizione: {
        digitale: true, round: 2, canto: 2, cantoBonus: false, fase: 'eroi', esito: null,
        rivelate: [t0], grate: [], compiti: {}, cercate: {}, log: ['Gli eroi sbarcano alla banchina.'],
        eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: party[1],
        scortati: [], mazzo: { ordine: Array.from({ length: 12 }, (_, i) => i), indice: 3 },
        pendenza: null, insidie: {}, abilita: {},
        // l'esca (Carbone): un nemico entro 2 caselle la segue OGNI VOLTA che
        // il piano gira — non e' un accecamento, che si consuma alla prima
        // lettura e non farebbe ricrescere il diario a un SECONDO render().
        // E' il modo con cui si vede il sabotaggio (3) dello Step 7: se
        // `intenzioni()` gira su `g` invece che sulla copia, ogni render()
        // scrive di nuovo «segue il luccichio del monile» nel diario VERO.
        esca: { t: t0, x: 3, y: 3 },
        nemici: [
          { nome: 'ADEPTO INCAPPUCCIATO', num: 1, ferite: 0, max: 1, pos: { t: t0, x: 3, y: 3 } },
          { nome: 'CANE DEI MOLI', num: 1, ferite: 0, max: 1, pos: { t: t0, x: 3, y: 0 }, flash: true },
        ],
      },
    };
    if (r) new Function('p', `(${r})(p)`)(partita);
    window.__partita = partita;   // stessa referenza di `ctx.partita`: la usa il controllo su SP().log
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {}, p);
  }, { ep: 'ep1', party: PARTY, posto, t0: T0, r: ritocca ? ritocca.toString() : null });
  // `vistaDigitale` puo' aprirsi sulla schermata d'ingresso (o su una carta
  // ancora da leggere) prima della plancia: si preme quel che c'e' finche' il
  // tabellone non compare, come fa il pilota.
  for (let i = 0; i < 5; i++) {
    for (const sel of ['#continua', '#via', '#ok-msg']) {
      const b = page.locator(sel);
      if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(200); }
    }
    if (await page.locator('.board-digitale').count()) break;
  }
  await page.waitForTimeout(300);
  return { page, errori };
}

// ============================================================ STEP 1 — desktop
{
  const { page, errori } = await apri({ width: 1400, height: 860 }, null);
  ok(errori.length === 0, `l'arbitro apre senza errori JS (1400x860): ${errori.slice(0, 3).join(' | ')}`);
  const c = await page.evaluate(() => ({
    colonne: ['#col-eroi', '.board-area', '#col-notte'].every((s) => document.querySelector(s)),
    carte: document.querySelectorAll('#col-eroi .ce').length,
    aperta: document.querySelectorAll('#col-eroi .ce.on .tasti').length,
    abilSenzaIndagine: [...document.querySelectorAll('#col-eroi .abil')].every((e) => !/In indagine/i.test(e.textContent)),
    diari: [...document.querySelectorAll('.diario')].filter((e) => e.offsetWidth).length,
    largo: document.documentElement.scrollWidth <= innerWidth,
  }));
  if (!c.colonne) fail('mancano le tre colonne');
  if (c.carte !== PARTY.length) fail(`carte eroe ${c.carte}, party ${PARTY.length}`);
  if (c.aperta !== 1) fail('la carta di turno non e’ aperta (o ne sono aperte piu’ d’una)');
  if (!c.abilSenzaIndagine) fail('un’abilita’ mostra anche la parte d’indagine');
  if (c.diari !== 1) fail(`diario visibile ${c.diari} volte`);
  if (!c.largo) fail('la pagina e’ piu’ larga dello schermo');
  await page.close();
}

// ============================================================ STEP 1 — telefono
{
  const { page, errori } = await apri({ width: 390, height: 844 }, null);
  ok(errori.length === 0, `l'arbitro apre senza errori JS (390x844): ${errori.slice(0, 3).join(' | ')}`);
  const c = await page.evaluate(() => ({
    colonne: ['#col-eroi', '.board-area', '#col-notte'].every((s) => document.querySelector(s)),
    largo: document.documentElement.scrollWidth <= innerWidth,
  }));
  if (!c.colonne) fail('mancano le tre colonne (telefono)');
  if (!c.largo) fail('la pagina e’ piu’ larga dello schermo (telefono)');
  // ogni scheda mostra solo la sua parte
  for (const [s, atteso] of [['eroi', { eroi: true, diario: 0, torre: 0 }],
                              ['notte', { eroi: false, diario: 0, torre: 1 }],
                              ['diario', { eroi: false, diario: 1, torre: 0 }]]) {
    await page.click(`.schede button[data-s="${s}"]`); await page.waitForTimeout(150);
    const v = await page.evaluate(() => {
      const vis = (e) => !!(e && (e.offsetWidth || e.offsetHeight));
      return { eroi: vis(document.getElementById('col-eroi')),
               diario: [...document.querySelectorAll('.diario')].filter(vis).length,
               torre: [...document.querySelectorAll('.torre')].filter(vis).length };
    });
    if (JSON.stringify(v) !== JSON.stringify(atteso)) fail(`scheda ${s}: ${JSON.stringify(v)}, attesa ${JSON.stringify(atteso)}`);
  }
  await page.close();
}

// ============================================================ STEP 5 — vista eroe
// la carta aperta e' quella di CHI GIOCA (mioEroe()), non quella di turno —
// qui e' ATTILIO di turno ma ELENA e' il posto — e «fase minaccia» resta
// dell'arbitro: si semina un giro dove tutti hanno gia' agito, cosi'
// azioniHtml() ci arriva davvero (altrimenti il controllo sarebbe vacuo).
{
  const tuttiFatti = (p) => { p.spedizione.eroiFatti = p.party.slice(); p.spedizione.eroiAttivo = null; };
  const { page: pArb, errori: eArb } = await apri({ width: 1400, height: 860 }, null, tuttiFatti);
  ok(eArb.length === 0, `l'arbitro (tutti fatti) apre senza errori: ${eArb.slice(0, 3).join(' | ')}`);
  ok(await pArb.locator('#fase-minaccia').count() === 1, 'l’arbitro vede «fase minaccia» quando tutti hanno agito');
  await pArb.close();

  const { page, errori } = await apri({ width: 1400, height: 860 },
    { ruolo: 'giocatore', eroe: ELENA, eroi: [ELENA] }, tuttiFatti);
  ok(errori.length === 0, `il giocatore apre senza errori JS: ${errori.slice(0, 3).join(' | ')}`);
  const v = await page.evaluate((elena) => {
    const on = document.querySelector('#col-eroi .ce.on');
    return { onEroe: on ? on.dataset.eroe : null, faseMinaccia: document.querySelectorAll('#fase-minaccia').length };
  }, ELENA);
  if (v.onEroe !== ELENA) fail(`la carta aperta e’ ${v.onEroe}, atteso l’eroe del giocatore (${ELENA})`);
  if (v.faseMinaccia !== 0) fail('«fase minaccia» compare anche sul telefono di chi gioca');
  await page.close();
}

// ============================================================ STEP 3/7-3 — «cosa fara' la notte» non tocca la partita
// `intenzioni()` (Step 3) chiama `pianoNemici` su una COPIA: il piano vero
// scrive nel diario (qui, il nemico accecato: «...e' accecato: salta il
// turno.») e consuma gli accecamenti — un render() e' un DISEGNO, non deve
// cambiare niente nello stato vero. E' anche il bersaglio del sabotaggio (3)
// dello Step 7: passare `g` invece della copia deve far crescere il diario a
// ogni giro.
{
  const { page, errori } = await apri({ width: 1400, height: 860 }, null);
  ok(errori.length === 0, `apre senza errori JS (controllo intenzioni): ${errori.slice(0, 3).join(' | ')}`);
  const { prima, dopo } = await page.evaluate(async () => {
    const m = await import('/js/digitale.js');
    const prima = window.__partita.spedizione.log.length;
    m._motore.render();
    const dopo = window.__partita.spedizione.log.length;
    return { prima, dopo };
  });
  if (dopo !== prima) fail(`SP().log e' cambiato da un render() (era ${prima}, ora ${dopo} righe): «cosa fara' la notte» non e' un'anteprima`);
  await page.close();
}

// ============================================================ REVISIONE FINALE — l'anteprima della notte e' STABILE
// Il bersaglio di un nemico con piu' eroi accanto si tira a caso, e la notte
// vera tira per conto suo: l'anteprima non puo' nominarne uno (cambiava a ogni
// render()). Con due candidati dice «uno di voi», con uno solo lo nomina.
{
  const testoNemico = (page) => page.evaluate(async () => {
    const m = await import('/js/digitale.js');
    const out = [];
    for (let k = 0; k < 20; k++) { m._motore.render(); out.push(document.querySelector('.nem .int')?.textContent.trim()); }
    return out;
  });
  const due = (p) => {   // ELENA e ATTILIO ai due lati del nemico, SIBILLA lontana
    const sp = p.spedizione; const t = sp.rivelate[0];
    sp.eroiPos[p.party[0]] = { t, x: 0, y: 1 }; sp.eroiPos[p.party[1]] = { t, x: 2, y: 1 };
    sp.eroiPos[p.party[2]] = { t, x: 3, y: 3 };
    sp.esca = null; sp.nemici = [{ nome: 'ADEPTO INCAPPUCCIATO', num: 1, ferite: 0, max: 1, pos: { t, x: 1, y: 1 } }];
  };
  const uno = (p) => {   // come `due`, ma ATTILIO e' lontano
    const sp = p.spedizione; const t = sp.rivelate[0];
    sp.eroiPos[p.party[0]] = { t, x: 0, y: 1 }; sp.eroiPos[p.party[1]] = { t, x: 3, y: 1 };
    sp.eroiPos[p.party[2]] = { t, x: 3, y: 3 };
    sp.esca = null; sp.nemici = [{ nome: 'ADEPTO INCAPPUCCIATO', num: 1, ferite: 0, max: 1, pos: { t, x: 1, y: 1 } }];
  };
  const { page: p2 } = await apri({ width: 1400, height: 860 }, null, due);
  const t2 = await testoNemico(p2);
  ok(new Set(t2).size === 1, `anteprima instabile fra un render e l'altro: ${[...new Set(t2)].join(' | ')}`);
  ok(/uno di voi/.test(t2[0] || '') && !/→/.test(t2[0] || ''), `due candidati: attesa «uno di voi», vista «${t2[0]}»`);
  await p2.close();
  const { page: p1 } = await apri({ width: 1400, height: 860 }, null, uno);
  const t1 = await testoNemico(p1);
  ok(new Set(t1).size === 1 && /→ Elena/i.test(t1[0] || ''), `un solo candidato: atteso il nome di Elena, visto «${t1[0]}»`);
  await p1.close();
}

// ============================================================ FIX ROUND 1 — il mazzo potato di chi gioca
// `SP().mazzo` ha DUE forme, non una: da arbitro e' l'ordine vero
// ({ordine, indice, pool} — motore/regole.js), ma su un tavolo vero un
// giocatore lo riceve gia' POTATO da motore/proiezione.js:142 a
// {restano, rimescolato} — l'ordine e' il segreto del round dopo, e non deve
// lasciare lo schermo di chi arbitra. `mazzoRestano()` (digitale.js) assumeva
// solo la prima forma: `m.ordine.length` lanciava su `undefined`, DENTRO il
// template di `render()`, prima ancora di scrivere `app.innerHTML` — schermo
// d'errore generico per OGNI giocatore, ogni volta. Non lo prendeva
// test-hud-spedizione.mjs perche' seminava sempre la forma intera anche per
// il posto giocatore (niente tavolo vero, `collegaAlTavolo()` non parte) — lo
// ha trovato solo test-telefono-azioni.mjs, contro un `wrangler dev` vero.
// Qui si semina la forma potata per davvero, cosi' la suite se ne accorge
// anche senza un tavolo.
{
  const mazzoPotato = (p) => { p.spedizione.mazzo = { restano: 5, rimescolato: 0 }; };
  const { page, errori } = await apri({ width: 1400, height: 860 },
    { ruolo: 'giocatore', eroe: ELENA, eroi: [ELENA] }, mazzoPotato);
  ok(errori.length === 0, `il giocatore apre senza errori col mazzo potato: ${errori.slice(0, 3).join(' | ')}`);
  const testo = await page.evaluate(() => document.querySelector('.capo .quanto')?.textContent || '');
  if (!/mazzo 5/.test(testo)) fail(`il capo non legge «restano» del mazzo potato (visto «${testo.trim()}»)`);
  await page.close();
}

console.log(ko === 0 ? 'test-hud-spedizione: OK' : `${ko} FAIL`);
await browser.close();
process.exit(ko ? 1 : 0);
