// L'INDAGINE SU DUE DISPOSITIVI.
//
// La Spedizione vive su piu' schermi da mesi; l'Indagine no. Chi entrava al
// tavolo dal proprio telefono a serata in corso si trovava davanti la
// SCRIVANIA DI CHI ARBITRA — le chiavi delle porte, gli indizi dei luoghi mai
// visitati, il testo degli Approfondimenti non ancora letti — e ogni
// dispositivo mutava il proprio salvataggio senza sapere degli altri.
//
// Qui si prova quel che nessun test poteva provare prima:
//   1. dal telefono i segreti dell'Indagine NON arrivano;
//   2. una mossa di chi arbitra compare DA SOLA sull'altro schermo;
//   3. il tiro che il tavolo aspetta si fa sul telefono di CHI HA QUELL'EROE,
//      e l'esito torna al tavolo.
//
// COM'E' MESSO IN PIEDI, come `test-eroe.mjs`: un `wrangler dev` SOLO — due
// processi hanno due Durable Object separati e la partita sarebbe due partite.
// Il browser non manda header, quindi e' `OSR_DEV_EMAIL` (il giocatore);
// l'arbitro bussa da qui con `X-Osr-Dev-Email`.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-indagine-eroe.mjs
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

// il primo luogo e' visitato (il gruppo c'e' entrato), tutti gli altri no
const VISITATO = EP1.luoghi[0];
const CHIUSO = EP1.luoghi.find((l) => l.n !== VISITATO.n && l.chiave) || EP1.luoghi[1];

const serata = (over = {}) => ({
  v: 1, episodio: 'ep1', modo: 'digitale', party: [ELENA, OTTONE], fase: 'indagine',
  vantaggi: null, rng: { seme: 77, passo: 0 }, aggiornato: Date.now(),
  indagine: {
    ora: 21, lettaLettera: true, visitati: [VISITATO.n], scoperti: [], sbloccati: [],
    parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
    secondoFiato: {}, note: 'la chiave non torna', risposte: ['', '', '', ''],
    risposteEsatte: [true, false, false, false], chiusa: false, pendenza: null, ...over,
  },
  spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, scarti: [], esito: null },
});

// --- si prepara la serata: un tavolo, un giocatore che ha preso Elena
const idT = crypto.randomUUID();
ok((await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'Indagine a due' })).ok,
   'l\'arbitro apre il tavolo');
ok((await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: ELENA })).ok,
   'e invita il giocatore, che prende Elena');
ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: serata() })).ok,
   'e mette l\'Indagine sul tavolo');

// --- LA GUARDIA: la serata la apre chi arbitra, non chi gioca
{
  const r = await chiama(GIOCATORE, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: serata({ ora: 18 }) });
  // 404 e non 403: il Worker a chi non arbitra non dice nemmeno che quella
  // porta esiste (`tavolo.js`), ed e' la stessa scelta di tutti gli altri
  // endpoint. Nel Durable Object c'e' la seconda serratura, che da qui non si
  // raggiunge nemmeno.
  ok(r.status === 404,
     `dal telefono non si riscrive la partita di tutti (visto ${r.status})`);
}

// --- IL TELEFONO DEL GIOCATORE
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));
await page.goto(BASE, { waitUntil: 'networkidle' });

// SI PARTE DALLA COPIA LOCALE PIENA. E' la strada vera: `entraNelTavolo`
// scarica il salvataggio del tavolo (`/api/salvataggio`, il blob INTERO) e lo
// passa a `vistaPartita`, quindi sul telefono la busta c'e' in memoria.
//
// DUE DIFESE, e vanno provate separate perche' proteggono cose diverse:
//   - a tenere i segreti fuori dallo SCHERMO e' la vista di chi gioca, che
//     semplicemente non disegna i luoghi non battuti (i controlli qui sotto);
//   - a tenerli fuori dal DISPOSITIVO e' la proiezione nel Durable Object, che
//     non li manda mai (il controllo «quel che il server manda», piu' sotto, e
//     `test-motore-proiezione` su tutti e 21 gli episodi).
// La `vista()` che `indagine.js` applica anche in locale e' la terza cintura:
// non protegge da niente che le altre due non coprano gia', ma tiene `ctx.ep`
// identico a quel che il server manderebbe — cosi' il giorno che questa
// schermata mostrera' qualcosa in piu', non potra' pescarlo dal blob locale.
const apriIndagine = (stato) => page.evaluate(async ({ t, elena, s }) => {
  const { vistaIndagine } = await import('/js/indagine.js');
  document.querySelector('#app').innerHTML = '';
  await vistaIndagine(document.querySelector('#app'), s, () => {},
                      { tavolo: t, ruolo: 'giocatore', eroe: elena });
}, { t: idT, elena: ELENA, s: stato });

await apriIndagine(serata());
await page.waitForTimeout(1200);          // il filo si apre
ok(errori.length === 0, `il telefono apre l'Indagine senza errori JS: ${errori.slice(0, 2).join(' | ')}`);

// --- 1. I SEGRETI NON ARRIVANO
{
  const testo = await page.locator('#app').innerText();
  const html = await page.evaluate(() => document.querySelector('#app').innerHTML);

  ok(/dove siete stati/i.test(testo), 'il telefono mostra l\'Indagine di chi gioca');
  ok(new RegExp(VISITATO.nome.slice(0, 14), 'i').test(testo),
     'e il luogo dove il gruppo E\' entrato si vede');
  ok(!new RegExp(CHIUSO.nome.slice(0, 14), 'i').test(testo),
     `e quello dove non e' entrato no (${CHIUSO.nome})`);

  // la chiave di una porta non battuta e' la deduzione: dirla e' dire la
  // soluzione un pezzo alla volta
  if (CHIUSO.chiave) {
    ok(!html.includes(CHIUSO.chiave[1]),
       `la chiave di «${CHIUSO.nome}» non e' sullo schermo di chi gioca`);
  }
  // e nemmeno la busta, ne' quali risposte sono giuste
  for (const d of (EP1.soluzione.domande || [])) {
    ok(!html.includes(String(d.risposta).slice(0, 20)),
       `la risposta «${String(d.risposta).slice(0, 24)}…» non arriva al telefono`);
  }

  // i comandi di chi conduce non ci sono: non e' la stessa schermata con meno
  // bottoni, e' un'altra schermata
  for (const sel of ['#taccuino', '#chiudi-indagine', '.voce[data-voce]', '#rileggi']) {
    ok((await page.locator(sel).count()) === 0, `dal telefono non c'e' ${sel}`);
  }
}

// --- 1-bis. E NEMMENO IL SERVER LI MANDA
// La difesa vera sta qui: quel che non parte non e' mai arrivato, e non c'e'
// niente da aggirare coi devtools. Il browser E' il giocatore (non manda
// header, quindi vale `OSR_DEV_EMAIL`), percio' questa e' la vista sua.
{
  const grezzo = await page.evaluate(async (t) =>
    JSON.stringify(await (await fetch(`/api/tavolo/${t}/stato`)).json()), idT);
  ok(!grezzo.includes('"soluzione"'), 'la busta non parte verso il telefono');
  for (const d of (EP1.soluzione.domande || [])) {
    ok(!grezzo.includes(String(d.risposta).slice(0, 20)),
       `e nemmeno la risposta «${String(d.risposta).slice(0, 24)}…»`);
  }
  if (CHIUSO.chiave) {
    ok(!grezzo.includes(CHIUSO.chiave[1]),
       `ne' la chiave di «${CHIUSO.nome}», che e' una deduzione`);
  }
  ok(!grezzo.includes('risposteEsatte'), 'ne’ quali risposte sono giuste');
}

// --- 2. LA MOSSA DI CHI ARBITRA COMPARE DA SOLA
{
  const ora = () => page.evaluate(() =>
    document.querySelector('.riga-registro .resta')?.textContent.trim());
  const prima = await ora();
  ok(prima && /ore a mezzanotte/.test(prima), `l'orologio si vede (${prima})`);

  // chi arbitra spende un'ora e la manda al tavolo, come fa `salvaP()`
  const dopoStato = serata({ ora: 22 });
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: dopoStato })).ok,
     'l\'arbitro spende un\'ora dal suo dispositivo');

  // NESSUN reload, NESSUN click: se cambia, e' arrivato dal filo
  await page.waitForTimeout(1500);
  const dopo = await ora();
  ok(prima !== dopo, `l'orologio si muove da solo sul telefono (prima «${prima}», dopo «${dopo}»)`);
}

// --- 3. IL TIRO E' DI CHI HA L'EROE
{
  // il tavolo aspetta una prova su Elena, che e' l'eroe del telefono
  const id = 'pv-prova-1';
  const conPendenza = serata({ ora: 22 });
  conPendenza.indagine.pendenza = {
    tipo: 'prova', a: ELENA, chi: 'giocatore', id,
    prova: { titolo: 'guardare meglio — elena', diffLabel: 'Media', soglia: 9,
             bonus: [{ label: 'ACUME', val: 2 }] },
  };
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: conPendenza })).ok,
     'l\'arbitro chiede una prova su Elena');
  await page.waitForTimeout(1500);

  ok((await page.locator('.dadi-overlay').count()) > 0,
     'i dadi si aprono sul telefono di chi ha quell\'eroe');
  // TUTT'E DUE LE STRADE, a scelta per tiro: l'app o due dadi veri
  const vede = (s) => page.evaluate((sel) => {
    const e = document.querySelector(sel);
    return !!e && getComputedStyle(e).display !== 'none';
  }, s);
  ok(await vede('#dadi-lancia'), 'si puo\' far tirare l\'app');
  ok(await vede('#dadi-tavolo'), 'oppure dichiarare due dadi veri, nello stesso tiro');

  // si dichiara un 10 con dadi veri: 10 + 2 di ACUME = 12, sopra la soglia
  await page.locator('#dadi-tavolo [data-tot="10"]').click();
  await page.waitForTimeout(2600);
  await page.locator('#dadi-chiudi').click();
  await page.waitForTimeout(1200);

  const st = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  const p = st.stato.indagine.pendenza;
  ok(p && p.id === id && p.esito, 'l\'esito del tiro torna al tavolo');
  ok(p && p.esito && p.esito.tot === 12 && p.esito.ok === true,
     `e porta il totale coi bonus (visto ${p && p.esito ? `${p.esito.tot}/${p.esito.ok}` : '—'})`);
}

// --- 4. IL TIRO DI UN ALTRO NON SI FA DA QUI
{
  ok((await page.locator('.dadi-overlay').count()) === 0,
     'a tiro fatto i dadi si chiudono e non si riaprono da soli');
  const id = 'pv-prova-2';
  const conPendenza = serata({ ora: 22 });
  conPendenza.indagine.pendenza = {
    tipo: 'prova', a: OTTONE, chi: 'nessuno', id,
    prova: { titolo: 'guardare meglio — ottone', diffLabel: 'Media', soglia: 9, bonus: [] },
  };
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: conPendenza });
  await page.waitForTimeout(1400);
  const quanti = await page.locator('.dadi-overlay').count();
  if (quanti) console.error('   [diag]', await page.locator('.dadi-overlay').first().innerText());
  ok(quanti === 0, `la prova di un altro eroe non apre i dadi su questo telefono (${quanti})`);

  // e nemmeno mandandola a mano: il tiro e' del suo personaggio
  const r = await page.evaluate(async ({ t, i }) => {
    const res = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'prova-indagine', id: i, esito: { tot: 99, ok: true } }),
    });
    return res.status;
  }, { t: idT, i: id });
  ok(r === 403, `e nemmeno mandandola a mano (visto ${r})`);
}

// --- 5. IL REFRESH PORTA DOVE STA CHI ARBITRA
//
// Il difetto vero, visto al tavolo: dal telefono ogni ricarica finiva
// nell'epilogo del Preludio, ovunque fosse chi arbitra. Due cose che si
// sommavano — «la serata aperta e' il salvataggio piu' recente», e il telefono
// che SALVANDO una serata per guardarla la faceva diventare la piu' recente.
// Un errore che si autoalimentava: piu' lo si guardava, piu' restava.
//
// Si semina esattamente quello: un Preludio finito e toccato DOPO, l'Ep.1
// aperto sul tavolo, e poi si RICARICA LA PAGINA come farebbe un telefono.
{
  const vecchia = {
    v: 1, episodio: 'preludio', modo: 'digitale', party: [ELENA], fase: 'spedizione',
    aggiornato: Date.now() + 600_000,      // toccata molto DOPO quella viva
    indagine: { ora: 24, visitati: [], oggetti: [], approfondimentiLetti: [],
                caricheUsate: {}, chiusa: true, risposte: ['', '', '', ''] },
    spedizione: { round: 6, canto: 2, esito: 'vittoria', mazzo: null, digitale: true,
                  fase: 'eroi', log: [], nemici: [], scortati: [], rivelate: [],
                  eroiPos: {}, vite: {}, azioni: {}, eroiFatti: [], abilita: {} },
  };
  ok((await chiama(GIOCATORE, 'POST', '/api/salvataggio',
    { tavolo: idT, episodio: 'preludio', aggiornato: vecchia.aggiornato,
      dati: JSON.stringify(vecchia) })).ok, 'sul tavolo resta un Preludio gia’ finito');

  // ...ed e' il salvataggio piu' recente: e' il caso in cui il vecchio criterio
  // sbagliava, e senza questo il test non proverebbe niente
  const recente = await page.evaluate(async () => {
    const s = await (await fetch('/api/stato')).json();
    return (s.salvataggi || []).sort((a, b) => b.aggiornato - a.aggiornato)[0]?.episodio;
  });
  ok(recente === 'preludio', `ed e' il salvataggio piu' recente del tavolo (visto ${recente})`);

  // sul tavolo pero' c'e' l'Ep.1: e' li' che sta chi arbitra
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: serata({ ora: 20 }) })).ok, 'e chi arbitra e’ nell’Ep.1');

  // IL REFRESH, quello vero: si ricarica la pagina col tavolo scelto, ed e'
  // `avvio()` -> `entraNelTavolo()` a decidere dove si finisce.
  await page.evaluate((t) => { localStorage.setItem('osr.tavolo', t);
                               localStorage.setItem('osr.tavolo.nome', 'Indagine a due'); }, idT);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const testo = await page.locator('#app').innerText();
  ok(/il coro sommerso/i.test(testo),
     `ricaricando si finisce dove sta chi arbitra:
${testo.slice(0, 180)}`);
  ok(!/prova del lume|l’alba vi trova/i.test(testo),
     'e non nell’epilogo di una serata chiusa un’altra sera');
}

await browser.close();
console.log(ko === 0
  ? 'test-indagine-eroe: l\'Indagine si gioca in due, senza che i segreti passino'
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
