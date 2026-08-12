// Le abilità di Spedizione che il motore digitale deve APPLICARE, non narrare.
//
// Nasce dall'audit del 12/08/2026 (AUDIT-CLASSI.md): Voce ferma di Serra, Esca
// preziosa di Carbone e Colpo da macello di Ottone erano stampate sulla carta
// dell'eroe, avevano il bottone, spendevano carica e azione — e non facevano
// niente. Tre eroi su undici senza abilità funzionante, e proprio in mezzo a
// quelli che le misure danno per deboli.
//
// Voce ferma e la gittata dell'esca sono già provate a mano in test-digitale
// (funzioni pure). Qui si prova quello che vive solo nel DOM e nella fase
// nemici: che l'esca si posi davvero, che i nemici la seguano invece di
// attaccare, e che il secondo colpo di Ottone parta senza costare l'azione.
//
// Uso:  node webapp/server.js   (in un altro terminale)
//       node webapp/test-abilita.mjs [porta]
import { chromium } from 'playwright';

const PORT = process.argv[2] || 8017;
const BASE = `http://localhost:${PORT}`;
const CHIAVE = 'osr.partita.ep1';
let errori = 0;
const ko = (m) => { errori += 1; console.log('  KO', m); };
const ok = (c, m) => { if (c) console.log('  ok', m); else ko(m); };

const OTTONE = 'OTTONE “MEZZENA” MASSARI';
const CARBONE = 'FULGENZIO CARBONE';
const SERRA = 'DOTT. LAZZARO SERRA';
const ELENA = 'ELENA FOSCO';
const PARTY = [OTTONE, CARBONE, SERRA, ELENA];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const jsErrors = [];
page.on('pageerror', (e) => jsErrors.push(e.message));

// Una partita seminata a mano: T1 sola, eroi e nemici dove servono. Passare
// dall'interfaccia (arruola, scendi, muovi) per arrivare a «due sgherri
// adiacenti a Ottone, uno a una ferita dalla fine» costerebbe cento click e
// dipenderebbe dai dadi.
async function semina(sp) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ k, p, s }) => {
    localStorage.clear();
    localStorage.setItem(k, JSON.stringify({
      v: 1, episodio: 'ep1', modo: 'digitale', plancia: 'schermo', party: p,
      creata: Date.now(), fase: 'spedizione',
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [],
        parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
        secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: true },
      vantaggi: { tier: 'preparati' },
      spedizione: {
        digitale: true, round: 3, fase: 'eroi', canto: 0, cantoBonus: false, esito: null,
        rivelate: ['T1'], eroiPos: s.eroiPos, nemici: s.nemici,
        scortati: [{ liberato: false, pos: null, mosso: false }], scortAttivo: null,
        grate: [], uscita: null, uscitaTentati: [],
        vite: s.vite, eroiFatti: [], eroiAttivo: s.attivo, azioni: {}, cercate: {},
        insidie: { T1: true },   // niente prova d'ingresso a disturbare
        abilita: {}, diversivoPronto: false, storditi: {},
        // una carta Minaccia che non fa niente («Quiete — Presagio»): il mazzo
        // deve esistere, ma non deve schierare nessuno né chiedere prove, o la
        // misura sull'esca la sporcherebbe un rinforzo comparso dal nulla
        mazzo: { pool: ['Quiete — Presagio'], ordine: [0], indice: 0 },
        log: ['seminata'],
      },
    }));
  }, { k: CHIAVE, p: PARTY, s: sp });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.locator('.tessera-episodio[data-ep="ep1"]').click();
  // la partita salvata passa dalla schermata «riprendi»
  if (await page.locator('#continua').count()) await page.locator('#continua').click();
  await page.locator('.board-digitale').waitFor({ timeout: 8000 });
}

const stato = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k)).spedizione, CHIAVE);
// i pannelli laterali sono fuori vista nel layout immersivo: si clicca dal DOM,
// come fa il pilota. Non e' una scorciatoia sul gioco — il gestore e' lo stesso.
const clic = (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (e) { e.click(); return true; } return false; }, sel);
// I dadi sono una scena, non una funzione: si tira, il cubo rotola tre secondi
// e poi compare «continua». Qui si aspetta il fatto, non un tempo. Torna `true`
// se un tiro si e' davvero concluso — cosi' «non c'e' stato un secondo tiro»
// diventa un'asserzione invece di un silenzio.
async function dadi(max = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < max) {
    if (await page.locator('#dadi-chiudi:visible').count()) {
      await clic('#dadi-chiudi');
      // l'overlay si chiude con una dissolvenza: finche' e' li' un secondo
      // `dadi()` ripremerebbe lo stesso bottone e direbbe «c'e' stato un altro
      // tiro» senza che ce ne sia stato uno. Si aspetta che sparisca davvero.
      for (let k = 0; k < 30 && await page.locator('.dadi-overlay').count(); k++) await page.waitForTimeout(100);
      return true;
    }
    if (await page.locator('#dadi-lancia:visible').count()) { await clic('#dadi-lancia'); }
    else if (await page.locator('.scelta-overlay').count()) {
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('.scelta-overlay .scelta-btn')].find((x) => x.textContent.trim() !== 'annulla');
        if (b) b.click();
      });
    }
    await page.waitForTimeout(150);
  }
  return false;
}

// «fase minaccia» compare solo quando tutti hanno finito: qui si chiude il
// giro degli eroi senza far loro fare niente, che e' quello che serve per
// arrivare alla notte.
async function notte() {
  for (const nm of PARTY) {
    await page.evaluate((n) => document.querySelector(`[data-turno="${CSS.escape(n)}"]`)?.click(), nm);
    await page.waitForTimeout(120);
    await clic('#az-fine');
    await page.waitForTimeout(150);
  }
  if (!(await page.locator('#fase-minaccia').count())) return false;
  await clic('#fase-minaccia');
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(400);
    await clic('#ok-msg'); await clic('#salta-nemici');
    if ((await stato()).fase === 'eroi' && !(await page.locator('#salta-nemici').count())) return true;
  }
  return false;
}

try {
  // ================================================ 1. ESCA PREZIOSA
  console.log('esca preziosa di Carbone');
  await semina({
    // Il gruppo tutto in colonna 0, i due sgherri in colonna 2, l'esca in (2,2):
    // andare all'esca e andare addosso agli eroi sono direzioni OPPOSTE, e la
    // misura sa distinguerle. Con l'esca spenta i due arrivano a contatto.
    eroiPos: { [CARBONE]: { t: 'T1', x: 0, y: 2 }, [OTTONE]: { t: 'T1', x: 0, y: 0 },
               [SERRA]: { t: 'T1', x: 0, y: 1 }, [ELENA]: { t: 'T1', x: 1, y: 3 } },
    nemici: [{ nome: 'LO SGHERRO', pos: { t: 'T1', x: 2, y: 0 }, ferite: 0, max: 2 },
             { nome: 'LO SGHERRO', pos: { t: 'T1', x: 2, y: 1 }, ferite: 0, max: 2 }],
    vite: { [CARBONE]: 6, [OTTONE]: 8, [SERRA]: 6, [ELENA]: 6 }, attivo: CARBONE,
  });

  ok(await clic(`[data-abil="${CARBONE}"]`), 'il bottone «usa» dell’esca c’è');
  const celle = await page.locator('.cella-mossa').count();
  ok(celle > 0, `il tabellone accende le caselle dove lanciare l’esca (${celle})`);
  // la gittata si misura da Carbone, che sta in (0,2)
  const oltre3 = await page.$$eval('.cella-mossa', (e) => e
    .filter((x) => x.dataset.t === 'T1' && Math.abs(+x.dataset.x - 0) + Math.abs(+x.dataset.y - 2) > 3)
    .map((x) => `${x.dataset.x},${x.dataset.y}`));
  ok(oltre3.length === 0, `nessuna casella oltre le 3 di gittata${oltre3.length ? ' — ' + oltre3.join(' ') : ''}`);

  ok(await clic('.cella-mossa[data-t="T1"][data-x="2"][data-y="2"]'), 'si tocca la casella (2,2)');
  await page.waitForTimeout(300);
  const dopoLancio = await stato();
  ok(dopoLancio.esca && dopoLancio.esca.x === 2 && dopoLancio.esca.y === 2, 'l’esca è posata sulla casella scelta');
  ok((dopoLancio.abilita || {})[CARBONE] === 1, 'la carica è spesa (una sola)');
  ok((dopoLancio.azioni[CARBONE] || []).includes('abilita'), 'e l’azione pure');
  ok(await page.locator('.tok-board.esca').count() === 1, 'il monile si vede sulla plancia');

  // la notte: i due sgherri devono ANDARE all'esca, non addosso agli eroi
  const prima = dopoLancio.nemici.map((n) => `${n.pos.x},${n.pos.y}`).join(' ');
  const saluteP = Object.values(dopoLancio.vite).reduce((a, b) => a + b, 0);
  ok(await notte(), 'la notte è passata');
  const notte_ = await stato();
  const dopo = notte_.nemici.map((n) => `${n.pos.x},${n.pos.y}`).join(' ');
  const vicinoEsca = notte_.nemici.every((n) => Math.abs(n.pos.x - 2) + Math.abs(n.pos.y - 2) <= 1);
  const aContatto = notte_.nemici.some((n) => Object.values(notte_.eroiPos)
    .some((p) => Math.abs(p.x - n.pos.x) + Math.abs(p.y - n.pos.y) === 1));
  ok(dopo !== prima, `i nemici si sono mossi (${prima} → ${dopo})`);
  ok(vicinoEsca, `e sono finiti sull’esca (${dopo})`);
  ok(!aContatto, 'nessuno è andato a contatto di un eroe: l’esca ha vinto sul bersaglio');
  ok(Object.values(notte_.vite).reduce((a, b) => a + b, 0) === saluteP, 'nessun eroe è stato colpito: seguivano il monile');
  ok(!notte_.esca, 'l’esca si consuma dopo una sola attivazione, come dice la carta');

  // ================================================ 2. COLPO DA MACELLO
  console.log('colpo da macello di Ottone');
  await semina({
    eroiPos: { [OTTONE]: { t: 'T1', x: 1, y: 1 }, [CARBONE]: { t: 'T1', x: 0, y: 0 },
               [SERRA]: { t: 'T1', x: 0, y: 1 }, [ELENA]: { t: 'T1', x: 0, y: 2 } },
    // due sgherri adiacenti a Ottone, tutti e due a UNA ferita dalla fine
    nemici: [{ nome: 'LO SGHERRO', pos: { t: 'T1', x: 2, y: 1 }, ferite: 1, max: 2 },
             { nome: 'LO SGHERRO', pos: { t: 'T1', x: 1, y: 2 }, ferite: 1, max: 2 }],
    vite: { [OTTONE]: 8, [CARBONE]: 6, [SERRA]: 6, [ELENA]: 6 }, attivo: OTTONE,
  });

  // si colpisce finché il primo cade: Ottone ha VIGORE 3 + arma, contro Difesa 8
  // basta un 4 — ma i dadi sono dadi, e qui interessa cosa succede DOPO il colpo.
  let caduti = 0;
  for (let giro = 0; giro < 12 && caduti === 0; giro++) {
    await semina({
      eroiPos: { [OTTONE]: { t: 'T1', x: 1, y: 1 }, [CARBONE]: { t: 'T1', x: 0, y: 0 },
                 [SERRA]: { t: 'T1', x: 0, y: 1 }, [ELENA]: { t: 'T1', x: 0, y: 2 } },
      nemici: [{ nome: 'LO SGHERRO', pos: { t: 'T1', x: 2, y: 1 }, ferite: 1, max: 2 },
               { nome: 'LO SGHERRO', pos: { t: 'T1', x: 1, y: 2 }, ferite: 1, max: 2 }],
      vite: { [OTTONE]: 8, [CARBONE]: 6, [SERRA]: 6, [ELENA]: 6 }, attivo: OTTONE,
    });
    await clic('[data-nemico="0"]');
    if (!(await dadi())) { ko('il primo tiro d’attacco non si è concluso'); break; }
    const dopoUno = await stato();
    if (dopoUno.nemici.length === 2) continue;      // mancato: si riprova
    caduti = 1;
    // il secondo colpo deve partire DA SOLO: se non c'è, `dadi()` torna falso
    const secondo = await dadi(6000);
    await page.waitForTimeout(400);        // segnaAzione arriva dopo il colpo gratuito
    const s = await stato();
    ok(secondo, 'abbattuto il primo, parte subito un secondo tiro senza chiederlo');
    ok((s.azioni[OTTONE] || []).filter((x) => x === 'attaccare').length === 1,
       `il secondo colpo non costa una seconda azione (azioni: ${JSON.stringify(s.azioni[OTTONE] || [])})`);
    ok(s.macello === s.round, 'il colpo da macello è segnato come speso per questo turno');
    const riga = (s.log || []).join(' | ');
    ok(/è abbattuto/.test(riga), 'il primo sgherro è abbattuto');
    ok(/colpisce|manca/.test(riga.split('è abbattuto')[1] || ''),
       `e nel diario resta traccia del colpo in più (log: ${(s.log || []).slice(-3).join(' · ')})`);
  }
  ok(caduti >= 1, 'in dodici tentativi almeno uno sgherro è caduto (altrimenti non si è misurato niente)');

  ok(jsErrors.length === 0, `zero errori JS${jsErrors.length ? ' — ' + jsErrors.slice(0, 2).join(' | ') : ''}`);
} catch (e) {
  ko(`eccezione: ${e.message}`);
} finally {
  await browser.close();
}

console.log(errori ? `\n${errori} KO` : '\nTUTTO OK (abilità di spedizione)');
process.exit(errori ? 1 : 0);
