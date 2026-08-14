// IL BIVIO E IL TACCUINO, dallo schermo.
//
// `test-bivi.mjs` prova che i Bivi siano tradotti, `test-bivi-motore.mjs` che
// applicarli cambi lo stato. Qui si prova l'ultimo pezzo, quello che nessuno
// dei due vede: che al tavolo la scelta si possa DAVVERO prendere, che chi
// gioca da telefono la veda senza poterla sigillare al posto degli altri, e che
// una volta sigillata resti scritta dove la serata dopo andra' a leggerla.
//
// E' l'anello in cui questo lavoro puo' morire in silenzio: motore giusto,
// dati giusti, e un bottone che non c'e'.
//
// Uso: node webapp/server.js (altrove) ; node webapp/test-bivi-ui.mjs
import { chromium } from 'playwright';
const BASE = 'http://localhost:8017';

const browser = await chromium.launch();
const errs = [];
const fail = (m) => { console.error('FAIL:', m); errs.push(m); };

async function apri({ ruolo = 'arbitro' } = {}) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if ((m.location()?.url || '').includes('/api/')) return;   // il 404 su /api e' voluto
    errs.push('console.error: ' + m.text().slice(0, 200));
  });
  await page.addInitScript(() => { window.confirm = () => true; });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // una serata dell'Ep.1 gia' chiusa: e' il momento in cui il Bivio si pone
  // Chi gioca da telefono si semina cosi': un tavolo scelto e un ruolo gia'
  // noto. `server.js` non ha `/api/stato`, e senza risposta l'app usa l'ultimo
  // ruolo conosciuto — che e' esattamente la difesa contro il telefono che si
  // ritrova arbitro per un errore di rete.
  const TAV = 'tav-prova';
  await page.evaluate(async ({ r, TAV }) => {
    localStorage.clear();
    const c = await (await fetch('/data/comune.json')).json();
    const party = c.eroi.slice(0, 3).map((e) => e.nome);
    const chiave = r === 'arbitro' ? 'osr.partita.ep1' : `osr.partita.${TAV}.ep1`;
    if (r !== 'arbitro') {
      localStorage.setItem('osr.tavolo', TAV);
      localStorage.setItem(`osr.ruolo.${TAV}`, 'giocatore');
    }
    localStorage.setItem(chiave, JSON.stringify({
      v: 1, episodio: 'ep1', modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [],
        parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
        secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: true },
      // `digitale: true` dice «la spedizione e' gia' cominciata»: senza, l'app
      // rimanda alla schermata d'ingresso e l'epilogo non si vede mai
      spedizione: { digitale: true, round: 4, canto: 2, cantoBonus: false, esito: 'vittoria',
                    mazzo: { pool: [], ordine: [], indice: 0, scarti: [] },
                    fase: 'eroi', log: [], nemici: [], scortati: [], rivelate: ['T1'],
                    eroiPos: {}, vite: {}, azioni: {}, eroiFatti: [], abilita: {},
                    cercate: {}, insidie: {}, storditi: {}, uscitaTentati: [], grate: [] },
    }));
  }, { r: ruolo, TAV });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  return page;
}

const vaiAllEpilogo = async (page) => {
  await page.getByText('Il Coro Sommerso').first().click();
  await page.waitForTimeout(200);
  if (await page.locator('#continua').count()) {
    await page.locator('#continua').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(400);
};

// --- CHI ARBITRA VEDE IL BIVIO E LO SIGILLA
{
  const page = await apri();
  await vaiAllEpilogo(page);

  if (!(await page.locator('#riq-bivio').count())) fail('l’epilogo non mostra il Bivio');
  const opzioni = await page.locator('#riq-bivio [data-bivio]').count();
  if (opzioni !== 2) fail(`il Bivio deve avere due strade sigillabili (viste ${opzioni})`);
  // le conseguenze si leggono PRIMA di scegliere: una scelta al buio non e' una scelta
  const testo = await page.locator('#riq-bivio').innerText();
  if (!/canto/i.test(testo)) fail('il Bivio non dice cosa cambia (nessun accenno al Canto)');

  await page.locator('#riq-bivio [data-bivio="bruciarlo"]').click();
  await page.waitForTimeout(150);
  if (await page.locator('.scelta-btn, #conf-si').count()) {
    await page.locator('.scelta-btn:not(.annulla), #conf-si').first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
  const scelte = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('osr.scelte.') || '{}'));
  if (scelte.ep1 !== 'bruciarlo') fail(`la scelta non e’ stata registrata (visto ${JSON.stringify(scelte)})`);
  // e sigillata si deve VEDERE: al tavolo il Frammento si gira, qui la strada
  // presa non puo’ essere indistinguibile da quella lasciata
  if (!(await page.locator('#riq-bivio .pannello.scelto').count())) fail('la strada sigillata non si distingue');
  if (await page.locator('#riq-bivio [data-bivio="bruciarlo"]').count()) {
    fail('si puo’ ancora sigillare la stessa strada due volte');
  }

  // --- IL TACCUINO: il Frammento di stanotte, e la scelta scritta sul retro
  await page.locator('#nav-esci, #al-menu').first().click();
  await page.waitForTimeout(400);
  if (!(await page.locator('#taccuino').count())) fail('la home non porta al Taccuino di Campagna');
  await page.locator('#taccuino').click();
  await page.waitForTimeout(300);
  const tac = await page.locator('#app').innerText();
  if (!/1 frammento/i.test(tac)) fail(`il Taccuino non conta il Frammento della serata vinta:\n${tac.slice(0, 300)}`);
  if (!/bruciarlo|bruciare|rogo|fuoco/i.test(tac)) fail('il Taccuino non riporta la scelta sigillata');
  // il Frammento e' il TESTO, non una spunta: e' quel che comporra' il mistero
  // finale, e un elenco di crocette non lo comporrebbe
  if (!/accorda/i.test(tac)) fail('il Taccuino non riporta il testo del Frammento');
  await page.close();
}

// --- DAL TELEFONO SI LEGGE, NON SI SIGILLA
// La decisione e' del tavolo, la mano che la registra e' una sola: e' la stessa
// regola della carta Minaccia e della notte. Ma leggerla si deve poter leggere,
// altrimenti chi gioca decide alla cieca.
//
// Si prova chiamando la vista, non simulando un telefono: `server.js` non ha
// `/api/stato`, e senza server l'app dice giustamente «si arbitra da soli» —
// il posto da giocatore non si puo' fingere qui, e fingerlo male proverebbe
// un'altra cosa.
{
  const page = await apri();
  const esito = await page.evaluate(async () => {
    const { bivioHtml } = await import('/js/bivio-scelta.js');
    const ep = await (await fetch('/data/ep1.json')).json();
    return { arb: bivioHtml(ep, 'ep1', true), gio: bivioHtml(ep, 'ep1', false),
             finale: bivioHtml(await (await fetch('/data/ep20.json')).json(), 'ep20', true) };
  });
  if (!/data-bivio/.test(esito.arb)) fail('chi arbitra non ha il bottone per sigillare');
  if (/data-bivio/.test(esito.gio)) fail('dal telefono si può sigillare il Bivio al posto di chi arbitra');
  if (esito.gio.length < 200) fail('dal telefono il Bivio non si legge');
  if (!/arbitra/.test(esito.gio)) fail('dal telefono non si capisce chi debba sigillare');
  // l'Ep.20 e' il finale: applica i Bivi degli altri e non ne ha uno proprio
  if (esito.finale !== '') fail('il finale non deve chiedere un Bivio che non esiste');
  await page.close();
}

// --- I FRAMMENTI ARRIVANO AL FINALE
// L'Ep.20 canta il controcanto a un ritmo che dipende da quanti Frammenti
// INTERI porta il gruppo. Fin qui il numero si dichiarava a mano perche' lo
// stato di campagna non c'era; ora si legge dai salvataggi, che sono la
// verita'. Tre casi, e il terzo e' quello che si dimentica.
{
  const page = await browser.newPage({ viewport: { width: 900, height: 1100 } });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const semina = (n, parziali) => page.evaluate(async ({ n, parziali }) => {
    localStorage.clear();
    const c = await (await fetch('/data/comune.json')).json();
    const party = c.eroi.slice(0, 3).map((e) => e.nome);
    const tutti = ['preludio', 'ep1', 'ep2', 'ep3', 'ep4', 'ep5', 'ep6', 'ep7', 'ep8', 'ep9',
      'ep10', 'ep11', 'ep12', 'ep13', 'ep14', 'ep15', 'ep16', 'ep17', 'ep18', 'ep19'];
    const serata = (esito, k) => ({
      v: 1, episodio: k, modo: 'tavolo', party, creata: Date.now(), fase: 'spedizione',
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [],
        parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
        secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: true },
      spedizione: { round: 4, canto: 2, esito, fase: 'eroi', log: [], nemici: [], scortati: [],
        mazzo: { pool: [], ordine: [], indice: 0, scarti: [] },
        rivelate: ['T1'], eroiPos: {}, vite: {}, azioni: {}, eroiFatti: [], abilita: {} },
    });
    tutti.slice(0, n).forEach((k) => localStorage.setItem(`osr.partita.${k}`, JSON.stringify(serata('vittoria', k))));
    tutti.slice(n, n + parziali).forEach((k) => localStorage.setItem(`osr.partita.${k}`, JSON.stringify(serata('parziale', k))));
  }, { n, parziali });

  const avviaEp20 = async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(350);
    await page.locator('.tessera-episodio[data-ep="ep20"]').click();
    await page.waitForTimeout(350);
    await page.locator('#avanti').click();
    await page.waitForTimeout(450);
    for (let i = 0; i < 3; i++) {
      await page.locator('.eroe-tile').nth(i).click({ force: true });
      await page.waitForTimeout(250);
      await page.locator('#arruola').click();
      await page.waitForTimeout(250);
    }
    await page.locator('#inizia').click();
    await page.waitForTimeout(800);
    return page.evaluate(() => JSON.parse(localStorage.getItem('osr.partita.ep20') || 'null'));
  };

  await semina(5, 1);
  let p20 = await avviaEp20();
  if (!p20 || p20.frammenti !== 5) {
    fail(`cinque serate vinte e una parziale fanno 5 Frammenti interi (visto ${p20 && p20.frammenti})`);
  }

  // tutte perdute: ZERO e' un numero, e va detto — non e' «non lo sappiamo»
  await semina(0, 3);
  p20 = await avviaEp20();
  if (!p20 || p20.frammenti !== 0) {
    fail(`tre serate parziali fanno 0 Frammenti interi (visto ${p20 && p20.frammenti})`);
  }

  // NESSUNA serata alle spalle: chi apre l'Ep.20 per provarlo, e i banchi di
  // misura che giocano un episodio alla volta. Scrivere 0 lo renderebbe
  // ingiocabile e falserebbe la taratura: il numero non si scrive, e vale il
  // default dei dati.
  await semina(0, 0);
  p20 = await avviaEp20();
  if (!p20 || p20.frammenti != null) {
    fail(`senza campagna alle spalle il numero non si dichiara (visto ${p20 && p20.frammenti})`);
  }
  await page.close();
}

// --- RIPRENDERE UNA SERATA NON RICHIEDE COME SI GIOCA
// Come si gioca stasera e da dove si comincia sono decisioni gia' prese: se la
// partita c'e', ripresentarle e' chiedere due volte la stessa cosa, con la
// seconda risposta che non conta niente. Ricomincia/rigioca cancella il
// salvataggio, e allora le domande tornano.
{
  const page = await apri();
  await page.getByText('Il Coro Sommerso').first().click();
  await page.waitForTimeout(400);
  const con = await page.locator('#app').innerText();
  // dal 14/08/2026 non si sceglie piu' COME si gioca — si gioca al tavolo con
  // la plancia a schermo — e resta una domanda sola: da dove si comincia
  if (/da dove cominciate/i.test(con)) fail('riprendendo una serata chiede ancora da dove si comincia');
  if (!/rivedi l/i.test(con)) fail('e non offre nemmeno di rivedere l’epilogo');

  // un episodio mai giocato le chiede eccome: e' li' che servono
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.locator('.tessera-episodio[data-ep="ep7"]').click();
  await page.waitForTimeout(400);
  const senza = await page.locator('#app').innerText();
  if (!/da dove cominciate/i.test(senza)) fail('una partita nuova non chiede più da dove si comincia');
  await page.close();
}

await browser.close();
console.log(errs.length === 0
  ? 'test-bivi-ui: il Bivio si legge, si sigilla una volta sola, e resta scritto'
  : `${errs.length} FAIL`);
process.exit(errs.length ? 1 : 0);
