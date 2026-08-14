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

  // ...ma quel che e' SUO ce l'ha. Le cariche d'Indagine sono la risorsa di chi
  // gioca: «l'ho gia' usata la mia Testimonianza?» e' una domanda sua, e
  // doverla fare ad alta voce e' farla rispondere a chi conduce.
  ok((await page.locator('.pip-carica').count()) > 0,
     'il telefono conta le cariche d’Indagine del proprio eroe');

  // e la carta di un Approfondimento GIA' LETTO ad alta voce: il gruppo era
  // nella stanza quando si e' letta, nasconderla non protegge niente
  ok(/quel che avete in mano/i.test(testo), 'e ha la sezione di quel che avete in mano');

  // e la lettera d'incarico si rilegge: a meta' serata «cosa ci aveva chiesto
  // M.?» e' la domanda che torna piu' spesso
  ok((await page.locator('#lettera-eroe').count()) === 1, 'e puo’ rileggere la lettera');
  await page.locator('#lettera-eroe').click();
  await page.waitForTimeout(400);
  const lettera = await page.locator('#app').innerText();
  ok(/lettera d’incarico/i.test(lettera), 'la lettera si apre');
  // la coda in corsivo e' regia: dice quali porte esistono prima che il gruppo
  // le abbia trovate, e sul telefono non ci va
  ok(!/luoghi disponibili/i.test(lettera),
     'senza la coda d’arbitro, che direbbe quali porte esistono');
  await page.locator('#torna-strada').click();
  await page.waitForTimeout(400);
  ok(/dove siete stati/i.test(await page.locator('#app').innerText()), 'e si torna in strada');
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

// --- 6. LA SERATA RICOMINCIATA ARRIVA SUBITO, non alla prima mossa
//
// Visto al tavolo: chi arbitra ricomincia il Preludio ed e' fermo ALLA LETTERA
// — dove non si e' ancora salvato niente — e il telefono resta nell'epilogo
// della serata di prima. La Spedizione si mette sul tavolo appena si apre;
// l'Indagine no, e cosi' il tavolo aveva ancora la partita finita.
//
// SERVE UN TAVOLO DI CUI IL BROWSER SIA L'ARBITRO: chi conduce lo decide il
// server dall'email, non il `posto` che si passa alla vista. Il browser non
// manda header, quindi e' `OSR_DEV_EMAIL` — e un tavolo aperto DA LUI ce l'ha
// come proprietario.
{
  const idA = await page.evaluate(async () => {
    const id = crypto.randomUUID();
    await fetch('/api/tavolo', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ id, nome: 'Tavolo di chi arbitra' }) });
    return id;
  });

  // sul tavolo c'e' una serata FINITA
  const finita = serata({ chiusa: true });
  finita.fase = 'spedizione';
  finita.spedizione = { round: 6, canto: 2, esito: 'vittoria', mazzo: null, digitale: true,
                        fase: 'eroi', log: [], nemici: [], scortati: [], rivelate: [],
                        eroiPos: {}, vite: {}, azioni: {}, eroiFatti: [], abilita: {} };
  const messa = await page.evaluate(async ({ t, st }) => {
    const r = await fetch(`/api/tavolo/${t}/apri`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, stato: st }) });
    return r.status;
  }, { t: idA, st: finita });
  ok(messa === 200, `sul tavolo c'e' una serata finita (visto ${messa})`);

  // chi arbitra la RICOMINCIA e apre l'Indagine: e' fermo alla lettera, e non
  // ha ancora salvato niente. `vistaIndagine` deve metterla sul tavolo da se'.
  const daccapo = serata({ lettaLettera: false, ora: 18, visitati: [] });
  await page.evaluate(async ({ t, st }) => {
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), st, () => {},
                        { tavolo: t, ruolo: 'arbitro', eroe: null });
  }, { t: idA, st: daccapo });
  await page.waitForTimeout(1500);

  const viva = await page.evaluate(async (t) =>
    (await (await fetch(`/api/tavolo/${t}/stato`)).json()).stato, idA);
  ok(viva && viva.fase === 'indagine' && !viva.spedizione.esito,
     `aprendo l'Indagine la serata nuova arriva sul tavolo subito (fase ${viva && viva.fase}, esito ${viva && viva.spedizione.esito})`);
}

// --- 7. CAMBIARE SERATA VINCE SUL TIMBRO
// I timbri si confrontano solo FRA LO STESSO EPISODIO. Chi arbitra puo'
// riprendere una serata vecchia, col suo timbro di settimane fa: e' comunque la
// serata di stasera, e i telefoni devono seguirla.
{
  const vecchissima = {
    v: 1, episodio: 'preludio', modo: 'digitale', party: [ELENA], fase: 'indagine',
    aggiornato: 1_000,                                  // un timbro antico
    indagine: { ora: 19, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [],
                parole: [], oggetti: [], reperti: [], approfondimentiLetti: [],
                caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''],
                chiusa: false, pendenza: null },
    spedizione: { round: 0, canto: 0, mazzo: null, esito: null },
  };
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: vecchissima })).ok, 'chi arbitra riprende una serata vecchia');
  const viva = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(viva.stato && viva.stato.episodio === 'preludio',
     `il tavolo la segue anche se il timbro e’ antico (visto ${viva.stato && viva.stato.episodio})`);
}

// --- 8. LA SERATA RICOMINCIATA VINCE SUL TIMBRO DEL SERVER
//
// Il timbro `aggiornato` NON viene da un orologio solo: lo mette il Durable
// Object quando applica un comando, e il browser di chi arbitra quando salva.
// In locale i due clock sono lo stesso e non si vede niente; in produzione
// bastano pochi secondi di scarto — e allora una serata RICOMINCIATA, col
// timbro del PC, veniva rifiutata da un tavolo che aveva il timbro del server
// piu' avanti. Chi arbitra ripartiva dall'Indagine e i telefoni restavano nella
// Spedizione di prima, senza un errore da nessuna parte.
//
// Si simula lo scarto mettendo sul tavolo una Spedizione col timbro nel futuro.
{
  const conOrologioAvanti = serata({ chiusa: true });
  conOrologioAvanti.fase = 'spedizione';
  conOrologioAvanti.creata = 1_000;                    // la serata di prima
  conOrologioAvanti.aggiornato = Date.now() + 300_000; // il clock del server, avanti
  conOrologioAvanti.spedizione = { round: 3, canto: 1, esito: null, digitale: true,
    mazzo: { pool: [], ordine: [], indice: 0, scarti: [] }, fase: 'eroi', log: [],
    nemici: [], scortati: [], rivelate: ['T1'], eroiPos: {}, vite: {}, azioni: {},
    eroiFatti: [], abilita: {} };
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: conOrologioAvanti })).ok, 'sul tavolo c’e’ una Spedizione col timbro avanti');

  // chi arbitra RICOMINCIA lo stesso episodio: serata nuova, `creata` nuovo,
  // timbro normale — indietro rispetto a quello del tavolo
  const daccapo = serata({ lettaLettera: false, ora: 18, visitati: [] });
  daccapo.creata = 2_000;                              // un'altra serata
  daccapo.aggiornato = Date.now();
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: daccapo })).ok, 'e chi arbitra la ricomincia dall’Indagine');

  const viva = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(viva.stato && viva.stato.fase === 'indagine' && viva.stato.creata === 2_000,
     `il tavolo segue la serata nuova (fase ${viva.stato && viva.stato.fase}, creata ${viva.stato && viva.stato.creata})`);

  // ...e la guardia contro chi si ricollega con roba vecchia resta in piedi:
  // STESSA partita, timbro indietro -> non si sovrascrive
  const vecchioDiTasca = { ...daccapo, aggiornato: daccapo.aggiornato - 10_000,
                           indagine: { ...daccapo.indagine, ora: 22 } };
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: vecchioDiTasca });
  const dopo = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(dopo.stato.indagine.ora === 18,
     `chi si ricollega con una copia vecchia della STESSA serata non la sovrascrive (ora ${dopo.stato.indagine.ora})`);
}

// --- 9. APPROFONDIRE E' DELL'EROE, e l'esito e' del tavolo
//
// Il tiro era gia' suo; l'azione che lo innesca no, e la distanza fra le due
// cose si sentiva: chi conduce premeva per te un bottone col nome della TUA
// abilita'. Ora il bottone sta dove sta l'abilita', chi arbitra resta il motore,
// e quel che si coglie — o non si coglie — si legge su OGNI schermo.
{
  const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
  const TIPO = LUOGO.approfondimenti[0].tipo;
  const IDONEO = COMUNE.eroi.find((e) => ((e.cariche || {})[TIPO] || 0) > 0);

  // il tavolo: il gruppo E' DENTRO quel luogo, e l'eroe del telefono e' idoneo
  const dentro = {
    v: 1, episodio: 'ep1', modo: 'digitale', party: [IDONEO.nome, OTTONE],
    fase: 'indagine', creata: 5_000, aggiornato: Date.now(),
    indagine: { ora: 21, lettaLettera: true, visitati: [LUOGO.n], luogoAperto: LUOGO.n,
                scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [],
                approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: '',
                risposte: ['', '', '', ''], chiusa: false, pendenza: null, carta: null },
    spedizione: { round: 0, canto: 0, mazzo: null, esito: null },
  };
  // il telefono ha QUELL'eroe
  ok((await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: dentro.party })).ok,
     'la compagnia e’ quella giusta');
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: IDONEO.nome });
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: dentro })).ok,
     'e il gruppo e’ dentro il luogo');

  await apriIndagine(dentro);
  await page.waitForTimeout(1200);

  // IL BOTTONE C'E', ed e' quello della sua abilita'
  const bott = page.locator(`[data-appr="approfondisci"][data-tipo="${TIPO}"]`);
  ok((await bott.count()) === 1,
     `chi ha l’eroe vede il bottone della SUA abilita’ (${TIPO})`);
  ok((await page.locator('[data-appr="profano"]').count()) === 1,
     'e l’aiuto profano, che e’ l’occasione una di questo luogo');

  // lo preme: al tavolo arriva la mano alzata
  await bott.click();
  await page.waitForTimeout(1200);
  const st = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  const r = st.stato.indagine.richiesta;
  ok(r && r.azione === 'approfondisci' && r.tipoApp === TIPO && r.eroe === IDONEO.nome,
     `la richiesta arriva al tavolo (${r ? `${r.azione}/${r.tipoApp}/${r.eroe}` : '—'})`);

  // ...e la si puo' fare solo COL PROPRIO EROE
  const rubata = await page.evaluate(async ({ t, altro }) => {
    const res = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'chiedi-indagine',
        richiesta: { azione: 'approfondisci', luogo: 1, tipoApp: 'Referto', eroe: altro, id: 'x' } }),
    });
    return res.status;
  }, { t: idT, altro: OTTONE });
  ok(rubata === 403, `e non si spende la carica di un altro (visto ${rubata})`);

  // L'ESITO SI LEGGE SU OGNI SCHERMO. Lo scrive chi conduce (`indagine.carta`),
  // e chi guarda non ha un «continuate»: si va avanti quando chiude lui.
  const conCarta = { ...dentro, aggiornato: Date.now() + 1 };
  conCarta.indagine = { ...dentro.indagine, richiesta: null,
    carta: { titolo: 'osservazione — la prova', corpo: '<p>Quel che avete colto.</p>' } };
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: conCarta });
  await page.waitForTimeout(1400);
  const schermo = await page.locator('#app').innerText();
  ok(/quel che avete colto/i.test(schermo), `l’esito compare sul telefono:
${schermo.slice(0, 160)}`);
  ok((await page.locator('#ok-msg').count()) === 0,
     'e chi guarda non ha un «continuate»: chiude chi conduce');
}

// --- 10. E CHI CONDUCE LA ESEGUE DAVVERO
//
// I controlli sopra provano che la mano alzata ARRIVA. Questo prova l'anello in
// cui il lavoro puo' morire in silenzio: che chi arbitra la raccolga e la porti
// dentro il motore. Serve un tavolo di cui il BROWSER sia l'arbitro — chi
// conduce lo decide il server dall'email, non il `posto` passato alla vista.
{
  const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
  const TIPO = LUOGO.approfondimenti[0].tipo;
  const IDONEO = COMUNE.eroi.find((e) => ((e.cariche || {})[TIPO] || 0) > 0);

  const idB = await page.evaluate(async () => {
    const id = crypto.randomUUID();
    await fetch('/api/tavolo', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ id, nome: 'Chi conduce esegue' }) });
    return id;
  });

  const conRichiesta = {
    v: 1, episodio: 'ep1', modo: 'digitale', party: [IDONEO.nome, OTTONE],
    fase: 'indagine', creata: 9_000, aggiornato: Date.now(),
    indagine: { ora: 21, lettaLettera: true, visitati: [LUOGO.n], luogoAperto: LUOGO.n,
                scoperti: [], sbloccati: [], parole: [], oggetti: [], reperti: [],
                approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {}, note: '',
                risposte: ['', '', '', ''], chiusa: false, pendenza: null, carta: null,
                richiesta: { azione: 'approfondisci', luogo: LUOGO.n, tipoApp: TIPO,
                             eroe: IDONEO.nome, da: IDONEO.nome, id: 'rq-prova' } },
    spedizione: { round: 0, canto: 0, mazzo: null, esito: null },
  };
  await page.evaluate(async ({ t, st }) => {
    await fetch(`/api/tavolo/${t}/apri`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, stato: st }) });
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), st, () => {},
                        { tavolo: t, ruolo: 'arbitro', eroe: null });
  }, { t: idB, st: conRichiesta });
  await page.waitForTimeout(2000);

  // la richiesta e' entrata nel motore: «guardare meglio» chiede una prova, e
  // in questo tavolo quell'eroe non e' di nessuno, quindi la tira chi conduce
  const schermoArb = (await page.locator('#app').innerText()).slice(0, 90).replace(/\s+/g, ' ');
  ok((await page.locator('.dadi-overlay').count()) === 1,
     `la richiesta finisce nel motore e apre la prova (schermo: ${schermoArb})`);
  const titolo = await page.locator('.dadi-titolo').innerText().catch(() => '');
  ok(/guardare meglio/i.test(titolo) && titolo.toLowerCase().includes(IDONEO.nome.split(' ')[0].toLowerCase()),
     `e la tira l'eroe che l'ha chiesta (visto «${titolo}»)`);

  // e la richiesta non resta appesa: servita due volte sarebbero due cariche
  const dopo = await page.evaluate(async (t) =>
    (await (await fetch(`/api/tavolo/${t}/stato`)).json()).stato.indagine.richiesta, idB);
  ok(!dopo, 'e la mano alzata si abbassa: servita una volta sola');
}

// --- 11. LO SCARTO D'OROLOGIO NON DEVE BLOCCARE LA SERATA
//
// Visto al tavolo: con Mora dentro un luogo, l'aiuto profano non faceva niente.
// Il telefono mandava, il tavolo riceveva — e nessuno eseguiva. Il motivo:
// scrivendo la richiesta il Durable Object timbrava `aggiornato` COL CLOCK DEL
// SERVER, e la spinta successiva di chi arbitra — col clock del suo PC, magari
// qualche secondo indietro — veniva rifiutata da `apri` in silenzio.
//
// Nell'Indagine l'autore e' il browser di chi conduce, e `aggiornato` e' la sua
// lineage: il Durable Object scrive e sparge, ma non timbra.
{
  const base = serata({ ora: 20 });
  base.creata = 77_000;
  base.aggiornato = 1_000;                    // un PC molto indietro
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: base });

  // il telefono alza la mano: il tavolo scrive la richiesta
  const primaDelloScarto = (await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json())
    .stato.aggiornato;
  await page.evaluate(async (t) => {
    await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'chiedi-indagine',
        richiesta: { azione: 'profano', luogo: 1, tipoApp: 'Osservazione', id: 'rq-clock' } }),
    });
  }, idT);
  await page.waitForTimeout(600);

  const dopoRichiesta = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(dopoRichiesta.stato.indagine.richiesta, 'la mano alzata arriva al tavolo');
  ok(dopoRichiesta.stato.aggiornato === primaDelloScarto,
     `e il tavolo NON ci mette il proprio orologio (era ${primaDelloScarto}, ora ${dopoRichiesta.stato.aggiornato})`);

  // ...cosi' la mossa di chi arbitra, che viene subito dopo col SUO timbro,
  // non trova un tavolo piu' avanti di lei e passa
  const eseguita = { ...base, aggiornato: 1_001 };
  eseguita.indagine = { ...base.indagine, richiesta: null, ora: 19 };
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: eseguita })).ok, 'chi arbitra esegue e rimanda al tavolo');
  const fine = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(!fine.stato.indagine.richiesta && fine.stato.indagine.ora === 19,
     `e la sua mossa passa (ora ${fine.stato.indagine.ora}, richiesta ${
       fine.stato.indagine.richiesta ? 'ancora li’' : 'servita'})`);
}

// --- 12. IL TACCUINO DAL TELEFONO: le domande si leggono, gli appunti si scrivono
//
// Il Taccuino era uno solo e lo teneva chi conduce: al tavolo funziona, perche'
// sta in mezzo. Con un telefono a testa no — quel che tieni a mente e' TUO, e
// la nota di un altro e' la cosa piu' utile che leggi fra una porta e l'altra.
{
  const conNote = serata({ ora: 21 });
  conNote.creata = 12_000;
  conNote.party = [ELENA, OTTONE];
  conNote.indagine.risposte = ['al magazzino di Dellacqua', '', '', ''];
  conNote.indagine.noteEroe = { [OTTONE]: 'il liutaio esce di notte' };
  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: [ELENA, OTTONE] });
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: ELENA });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: conNote });

  await apriIndagine(conNote);
  await page.waitForTimeout(900);
  ok((await page.locator('#taccuino-eroe').count()) === 1, 'dalla home si apre il taccuino');
  // Il clic si fa DENTRO la pagina: la vista si ridisegna a ogni spinta dal
  // filo, e il nodo che Playwright ha trovato un istante prima puo' essere gia'
  // staccato — il clic andrebbe a vuoto senza dire niente. Al tavolo il dito
  // trova comunque il bottone che c'e' in quel momento.
  await page.evaluate(() => document.querySelector('#taccuino-eroe').click());
  await page.waitForTimeout(700);
  const t = await page.locator('#app').innerText();

  // LE DOMANDE SI LEGGONO. Stanno dentro `soluzione`, che al telefono non
  // arriva mai: la proiezione ne manda i soli testi in `ep.domande`.
  ok(/DOVE|CHI |COSA|QUAL/i.test(t), `le Domande si leggono dal telefono:
${t.slice(0, 140)}`);
  for (const d of (EP1.soluzione.domande || [])) {
    ok(!t.includes(String(d.risposta).slice(0, 20)),
       `ma non la risposta a «${String(d.q).slice(0, 26)}…»`);
  }
  // e non si risponde da qui: la busta si apre una volta sola, e per tutti
  ok((await page.locator('[data-risposta]').count()) === 0,
     'e dal telefono non si risponde: la busta e’ di chi arbitra');

  // GLI APPUNTI: il proprio si scrive, quelli degli altri si leggono
  const mie = page.locator(`[data-nota-eroe="${ELENA}"]`);
  if ((await mie.count()) !== 1) console.error('   [diag]', t.slice(0, 260).replace(/\s+/g, ' '));
  ok((await mie.count()) === 1, 'i propri appunti si scrivono');
  ok((await page.locator(`[data-nota-eroe="${OTTONE}"]`).count()) === 0,
     'quelli di un altro no: sono i suoi');
  ok(/il liutaio esce di notte/.test(t), '…ma si leggono, ed e’ il punto');

  // scrivendoli, arrivano al tavolo
  await mie.fill('la cera veniva dalla cattedrale');
  await mie.blur();
  await page.waitForTimeout(1200);
  const st = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok((st.stato.indagine.noteEroe || {})[ELENA] === 'la cera veniva dalla cattedrale',
     `e arrivano al tavolo (visto ${JSON.stringify((st.stato.indagine.noteEroe || {})[ELENA])})`);

  // ...e solo i propri: il taccuino di un altro non si scrive da qui
  const rubato = await page.evaluate(async ({ t: tv, altro }) => {
    const r = await fetch(`/api/tavolo/${tv}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'nota-eroe', eroe: altro, testo: 'non sono io' }),
    });
    return r.status;
  }, { t: idT, altro: OTTONE });
  ok(rubato === 403, `e non si scrive nel taccuino di un altro (visto ${rubato})`);
}

await browser.close();
console.log(ko === 0
  ? 'test-indagine-eroe: l\'Indagine si gioca in due, senza che i segreti passino'
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
