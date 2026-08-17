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
    risposteEsatte: [true, false, false, false], chiusa: false, ...over,
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
// `chi` = l'eroe di questo posto. Quasi sempre Elena; i controlli sui doni
// vogliono il telefono di chi quel dono ce l'ha, e senza questo parametro
// guarderebbero la home di un altro eroe — cioe' non guarderebbero niente.
const apriIndagine = (stato, chi = ELENA) => page.evaluate(async ({ t, eroe, s }) => {
  const { vistaIndagine } = await import('/js/indagine.js');
  document.querySelector('#app').innerHTML = '';
  // `vaiA` NON e' un buco nero: si segna dove la vista ha mandato il telefono.
  // Con una funzione vuota, «il telefono e' stato buttato nella Spedizione»
  // non si vedeva — e il controllo sulla busta sarebbe passato anche col
  // difetto in piedi.
  window.__vaiA = null;
  await vistaIndagine(document.querySelector('#app'), s, (dove) => { window.__vaiA = dove; },
                      { tavolo: t, ruolo: 'giocatore', eroe, eroi: eroe ? [eroe] : [] });
}, { t: idT, eroe: chi, s: stato });

// L'ARRIVO: dal 14/08 il telefono che trova il gruppo dentro un luogo vede
// prima la facciata, e si entra col dito (blocco 14). I controlli che vogliono
// essere DENTRO passano di qui, invece di ripetere il clic cinque volte.
const entraSeSiE = async () => {
  if (await page.locator('#entrate').count()) {
    await page.evaluate(() => document.querySelector('#entrate').click());
    await page.waitForTimeout(700);
  }
};

await apriIndagine(serata());
await page.waitForTimeout(1200);          // il filo si apre
ok(errori.length === 0, `il telefono apre l'Indagine senza errori JS: ${errori.slice(0, 2).join(' | ')}`);

// --- 0. LA CORNICE STA IN RIGA
//
// Il tasto dei suoni stava DENTRO la riga dell'orologio: su uno schermo di
// telefono quella riga va a capo — le ore sopra, «5 ore a mezzanotte» sotto —
// e il tasto finiva a mezz'aria, disallineato dal menu. Sono tutt'e due
// comandi della cornice, e ora stanno insieme: si misura, perché «sembra
// storto» non è una cosa che un banco possa vedere da sé.
{
  const c = await page.evaluate(() => {
    const s = document.querySelector('#suoni')?.getBoundingClientRect();
    const m = document.querySelector('#apri-menu')?.getBoundingClientRect();
    if (!s || !m) return null;
    return { scarto: Math.abs((s.top + s.height / 2) - (m.top + m.height / 2)),
             suoniDestra: s.right <= m.left + 1 };
  });
  ok(c, 'i due comandi della cornice ci sono');
  ok(c && c.scarto <= 4, `e stanno sulla stessa riga (scarto ${c && Math.round(c.scarto)}px)`);
  ok(c && c.suoniDestra, 'col tasto dei suoni accanto al menu, non in mezzo all’orologio');
}

// --- 1. I SEGRETI NON ARRIVANO
{
  const testo = await page.locator('#app').innerText();
  const html = await page.evaluate(() => document.querySelector('#app').innerHTML);

  ok(/per le strade/i.test(testo), 'il telefono mostra l\'Indagine di chi gioca');
  ok(!new RegExp(CHIUSO.nome.slice(0, 14), 'i').test(testo),
     `e il luogo dove il gruppo non e' entrato non si vede (${CHIUSO.nome})`);

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
  for (const sel of ['#cerca-via', '.voce[data-voce]', '#fine-visita', '#m-busta']) {
    ok((await page.locator(sel).count()) === 0, `dal telefono non c'e' ${sel}`);
  }

  // ...ma quel che e' SUO ce l'ha, e da qui in poi lo si cerca DOVE STA: dal
  // 15/08 la scena tiene solo quel che succede adesso, e tutto il resto —
  // squadra, cose, luoghi battuti, lettera — sta dietro il tasto del menu. È
  // l'impianto deciso sul mockup, e il banco fa la strada che fa un giocatore.
  await page.evaluate(() => document.querySelector('#apri-menu').click());
  await page.waitForTimeout(500);
  const menu = await page.locator('.foglio').innerText();
  ok(/quel che avete in mano/i.test(menu), 'nel menu c’è quel che avete in mano');
  ok(/dove siete stati/i.test(menu), 'e i luoghi battuti');

  // le cariche d'Indagine sono la risorsa di chi gioca: «l'ho gia' usata la mia
  // Testimonianza?» e' una domanda sua, e doverla fare ad alta voce e' farla
  // rispondere a chi conduce. Ora si guardano nella squadra, e ci sono quelle
  // di TUTTI: «chi può leggere un Referto?» smette di essere una domanda.
  await page.evaluate(() => document.querySelector('#m-squadra').click());
  await page.waitForTimeout(400);
  ok((await page.locator('.pip-carica').count()) > 0,
     'il telefono conta le cariche d’Indagine');
  await page.evaluate(() => document.querySelector('#sq-indietro').click());
  await page.waitForTimeout(300);

  // i luoghi battuti si riaprono: a meta' serata nessuno ricorda cosa c'era al
  // Molo, e la risposta ce l'ha in tasca — la proiezione i luoghi visitati li
  // manda interi
  await page.evaluate(() => document.querySelector('#m-luoghi').click());
  await page.waitForTimeout(400);
  ok(new RegExp(VISITATO.nome.slice(0, 14), 'i').test(await page.locator('#app').innerText()),
     'e il luogo dove il gruppo E’ entrato si rilegge');
  await page.evaluate(() => document.querySelector('#dv-indietro').click());
  await page.waitForTimeout(300);

  // e la lettera d'incarico si rilegge: a meta' serata «cosa ci aveva chiesto
  // M.?» e' la domanda che torna piu' spesso
  ok((await page.locator('#m-lettera').count()) === 1, 'e puo’ rileggere la lettera');
  await page.evaluate(() => document.querySelector('#m-lettera').click());
  await page.waitForTimeout(400);
  const lettera = await page.locator('#app').innerText();
  ok(/lettera d’incarico/i.test(lettera), 'la lettera si apre');
  // la coda in corsivo e' regia: dice quali porte esistono prima che il gruppo
  // le abbia trovate, e sul telefono non ci va
  ok(!/luoghi disponibili/i.test(lettera),
     'senza la coda d’arbitro, che direbbe quali porte esistono');
  await page.locator('#torna-strada').click();
  await page.waitForTimeout(400);
  ok(/per le strade/i.test(await page.locator('#app').innerText()), 'e si torna in strada');
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
  // dal 16/08/2026 il capo dice «3 ore» e basta: quante ne restano lo dicono i
  // lumi accanto, e la frase lunga mandava a capo la riga sul telefono
  ok(prima && /^\d+ ore?$/.test(prima), `l'orologio si vede (${prima})`);

  // chi arbitra spende un'ora e la manda al tavolo, come fa `salvaP()`
  const dopoStato = serata({ ora: 22 });
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: dopoStato })).ok,
     'l\'arbitro spende un\'ora dal suo dispositivo');

  // NESSUN reload, NESSUN click: se cambia, e' arrivato dal filo
  await page.waitForTimeout(1500);
  const dopo = await ora();
  ok(prima !== dopo, `l'orologio si muove da solo sul telefono (prima «${prima}», dopo «${dopo}»)`);

  // LA BARRA DELLE AZIONI STA SOPRA LA SCENA.
  //
  // Il titolo del luogo ha un indice di sovrapposizione suo — gli serve per
  // stare sopra la velatura della scena — e la barra appiccicata in fondo non
  // ne aveva: il nome del luogo veniva disegnato IN MEZZO ai bottoni. Si vede
  // solo quando i due si incrociano, cioè con la barra alta tre righe (un eroe
  // che legge tre tipi) e poca altezza visibile: un telefono con la barra del
  // browser aperta. Con la finestra alta non succede mai, ed è per questo che
  // non l'aveva preso nessun banco.
  {
    const eraLarga = page.viewportSize();
    // 390x664: un telefono con la barra del browser aperta — meno altezza
    // visibile, e la scena (alta in proporzione) arriva dentro la barra.
    await page.setViewportSize({ width: 390, height: 664 });
    // e il telefono dev'essere DENTRO un luogo, o non c'è né scena né barra:
    // la prima stesura di questo controllo misurava una schermata che non le
    // aveva, e passava senza guardare niente
    await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
      { tavolo: idT, stato: serata({ ora: 21, luogoAperto: VISITATO.n }) });
    await page.waitForTimeout(1600);
    if (await page.locator('#entrate').count()) {
      await page.locator('#entrate').click();
      await page.waitForTimeout(700);
    }
    // SI MISURA LA REGOLA, non una sovrapposizione costruita. I due si
    // incrociano solo quando la barra è alta tre righe (un eroe che legge tre
    // tipi) e l'altezza visibile è poca: qui l'eroe del banco ne legge due, e
    // fabbricare la situazione vorrebbe dire provare una schermata finta.
    // Quel che conta è che la barra abbia un indice più alto del titolo — è la
    // riga che mancava, ed è la riga che si può togliere per sbaglio domani.
    const chi = await page.evaluate(() => {
      const barra = document.querySelector('.barra-azioni');
      const dentro = document.querySelector('.scena .dentro');
      if (!barra || !dentro) return { manca: true };
      const num = (el) => { const z = getComputedStyle(el).zIndex; return z === 'auto' ? 0 : Number(z); };
      return { barra: num(barra), titolo: num(dentro),
        appiccicata: getComputedStyle(barra).position };
    });
    ok(!chi.manca, `la scena e la barra ci sono tutt'e due (${JSON.stringify(chi)})`);
    ok(chi.appiccicata === 'sticky', `la barra è appiccicata in fondo (${chi.appiccicata})`);
    ok(chi.barra > chi.titolo,
       `la barra sta davanti al titolo della scena (barra ${chi.barra}, titolo ${chi.titolo})`);

    // IL NOME DEL LUOGO SI LEGGE SENZA SCORRERE. La scena è alta 50dvh — `dvh`
    // e non `vh`, perché sul telefono `vh` conta lo schermo intero, barra del
    // browser compresa: con la barra aperta il titolo finiva sotto la piega.
    const titolo = await page.evaluate(() => {
      const t = document.querySelector('.scena h2, .scena h1');
      const barra = document.querySelector('.barra-azioni');
      if (!t) return { manca: true };
      const rt = t.getBoundingClientRect();
      const rb = barra ? barra.getBoundingClientRect() : null;
      return { basso: Math.round(rt.bottom), finestra: window.innerHeight,
        barra: rb ? Math.round(rb.top) : null };
    });
    ok(!titolo.manca, 'il titolo del luogo si trova');
    // NON BASTA «ci sta nella finestra»: con l'eroe del banco la barra è di una
    // riga sola, e anche una scena alta due terzi passerebbe. La regola vera è
    // che il titolo stia nella PRIMA PARTE della schermata — sotto i due terzi
    // — così sotto resta posto per la barra anche quando è di tre righe, che è
    // il caso in cui il nome del luogo finiva in mezzo ai bottoni.
    const soglia = Math.round(titolo.finestra * 0.68);
    ok(titolo.basso <= soglia,
       `il titolo sta nella prima parte della schermata (finisce a ${titolo.basso}, soglia ${soglia})`);
    ok(titolo.barra == null || titolo.basso <= titolo.barra,
       `e non finisce dentro la barra delle azioni (${titolo.basso} contro ${titolo.barra})`);
    await page.setViewportSize(eraLarga);
    await page.waitForTimeout(300);
  }

  // IL RIDISEGNO DAL TAVOLO NON MUOVE IL SEGNO. Cambiando schermata si torna in
  // cima (lo prova test-ui), ma qui la schermata non cambia: si sta leggendo, e
  // chi arbitra spende un'ora. Riportare in cima sarebbe peggio del male —
  // significherebbe perdere il punto in cui si stava leggendo, a ogni mossa
  // degli altri.
  await page.evaluate(() => { document.body.style.minHeight = '3000px'; window.scrollTo(0, 700); });
  const segnoPrima = await page.evaluate(() => Math.round(window.scrollY));
  ok(segnoPrima > 200, `la pagina si può scorrere (${segnoPrima})`);
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: serata({ ora: 22 }) });
  await page.waitForTimeout(1500);
  const segnoDopo = await page.evaluate(() => Math.round(window.scrollY));
  ok(Math.abs(segnoDopo - segnoPrima) < 40,
     `il ridisegno dal tavolo lascia il segno dov'era (da ${segnoPrima} a ${segnoDopo})`);

  // IL MENU RESTA APERTO MENTRE IL TAVOLO SI MUOVE. Il foglio vive sul `body`
  // apposta: se stesse dentro la schermata, un'ora spesa da chi arbitra lo
  // farebbe sparire in mezzo a una lettura.
  const apertura = await page.evaluate(() => {
    try { document.querySelector('#apri-menu').click(); return 'ok'; }
    catch (e) { return String(e && e.message || e); }
  });
  await page.waitForTimeout(400);
  const dopoApertura = await page.evaluate(() => ({
    fogli: document.querySelectorAll('.foglio').length,
    veli: document.querySelectorAll('.velo').length,
    voci: document.querySelectorAll('.menu-voce').length,
    testa: document.querySelector('#app')?.innerText.slice(0, 60),
  }));
  ok(dopoApertura.fogli === 1,
     `il menu si apre come foglio (apertura: ${apertura} · ${JSON.stringify(dopoApertura)})`);
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: serata({ ora: 23 }) });
  await page.waitForTimeout(1500);
  ok(await page.locator('.foglio').count() === 1,
     'e resta aperto anche se il tavolo ridisegna la schermata sotto');

  // ...MA NON SOPRAVVIVE ALL'USCITA. Se la serata passa alla Spedizione mentre
  // il menu è aperto, velo e foglio resterebbero sopra una schermata che non è
  // più la loro: un velo a tutto schermo si mangia ogni tocco, e l'app sembra
  // bloccata senza dire perché.
  const inSpedizione = serata({ ora: 24 });
  inSpedizione.fase = 'spedizione';
  inSpedizione.indagine.chiusa = true;
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: inSpedizione });
  await page.waitForTimeout(2000);
  const appesi = await page.evaluate(() => document.querySelectorAll('.velo, .foglio').length);
  ok(appesi === 0, `passando alla Spedizione non resta nessun velo appeso (${appesi})`);
}

// --- 3. IL TIRO PARTE DA CHI HA L'EROE, E IL COMANDO SE LO PORTA DIETRO
//
// Prima: il telefono CHIEDEVA, chi arbitra eseguiva, la prova restava sospesa
// (`indagine.pendenza`), il telefono tirava, l'esito tornava. Cinque passaggi e
// tre pezzi di stato, e bastava che chi conduce non fosse sull'episodio perche'
// niente accadesse. Ora il dado si tira PRIMA di mandare e viaggia dentro il
// comando: chi tira e' chi manda, e il motore sta nel Durable Object.
{
  const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
  const TIPO = LUOGO.approfondimenti[0].tipo;
  const IDONEO = COMUNE.eroi.find((e) => ((e.cariche || {})[TIPO] || 0) > 0);
  const dentro = serata({ luogoAperto: LUOGO.n, visitati: [LUOGO.n], ora: 21 });
  dentro.party = [IDONEO.nome, OTTONE];
  dentro.creata = 3_000;

  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: dentro.party });
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: IDONEO.nome });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: dentro });
  await apriIndagine(dentro);
  await page.waitForTimeout(1200);
  await entraSeSiE();

  const sel = `[data-appr="approfondisci"][data-tipo="${TIPO}"]`;
  ok((await page.locator(sel).count()) === 1,
     `chi ha l'eroe vede il bottone della SUA abilita' (${TIPO})`);
  await page.evaluate((x) => document.querySelector(x).click(), sel);
  await page.waitForTimeout(1200);

  // i dadi si aprono QUI, prima di mandare — e si puo' tirare in due modi
  ok((await page.locator('.dadi-overlay').count()) === 1,
     'i dadi si aprono sul telefono di chi ha quell\u2019eroe, PRIMA del comando');
  const vede = (x) => page.evaluate((y) => {
    const e = document.querySelector(y);
    return !!e && getComputedStyle(e).display !== 'none';
  }, x);
  ok(await vede('#dadi-lancia'), 'si puo\u2019 far tirare l\u2019app');
  ok(await vede('#dadi-tavolo'), 'oppure dichiarare due dadi veri, nello stesso tiro');

  // USCENDO DAL TIRO SENZA TIRARE si torna alla PROPRIA schermata. Prima si
  // tornava sempre a `schedaLuogo`, che e' la vista di chi conduce: chi gioca
  // si ritrovava in mano i quattro tipi con scritto chi puo' tentarli e il
  // bottone per lasciare il luogo. Non un segreto svelato, ma il mestiere
  // sbagliato in mano alla persona sbagliata.
  await page.locator('#dadi-annulla').click();
  await page.waitForTimeout(900);
  {
    const dove = await page.evaluate(() => ({
      tipi: document.querySelectorAll('.tipi').length,
      barra: document.querySelectorAll('.barra-azioni').length,
      lasciate: document.querySelectorAll('#fine-visita').length,
    }));
    ok(dove.tipi === 0,
       `annullando il tiro NON si finisce nella schermata di chi arbitra (${JSON.stringify(dove)})`);
    ok(dove.lasciate === 0, 'e non si prende in mano il suo bottone per lasciare il luogo');
    ok(dove.barra === 1, 'si torna alla propria scena, con le proprie azioni');
  }
  // e si ricomincia, stavolta tirando davvero
  await page.evaluate((x) => document.querySelector(x).click(), sel);
  await page.waitForTimeout(1200);
  await page.locator('#dadi-tavolo [data-tot="12"]').click();
  await page.waitForTimeout(2600);
  // il tiro si legge, poi si continua: e' qui che il comando parte
  await page.locator('#dadi-chiudi').click();
  await page.waitForTimeout(1500);

  // NESSUN ARBITRO IN LINEA: qui non c'e' un secondo browser, e non serve.
  // E' il difetto che ha aperto la migrazione, e questo e' il controllo che
  // prima non si poteva nemmeno scrivere.
  const st = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  const letti = st.stato.indagine.approfondimentiLetti || [];
  ok(letti.length === 1 && letti[0].n === LUOGO.n,
     `il comando cambia la partita senza che chi arbitra sia collegato (${JSON.stringify(letti)})`);
  ok((st.stato.indagine.caricheUsate || {})[IDONEO.nome],
     'e la carica dell\u2019eroe e\u2019 spesa sul tavolo, non sul telefono');
}

// --- 4. L'ABILITA' DI UN ALTRO NON SI SPENDE DA QUI
{
  const rubata = await page.evaluate(async ({ t, altro }) => {
    const res = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'approfondisci', luogo: 1, tipoApp: 'Referto',
                             eroe: altro, tiri: [[6, 6]] }),
    });
    return res.status;
  }, { t: idT, altro: OTTONE });
  ok(rubata === 403, `non si spende la carica di un altro eroe (visto ${rubata})`);

  // e nemmeno i comandi del gruppo: l'ora, le porte, la busta sono di chi conduce
  const gruppo = await page.evaluate(async (t) => {
    const res = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'apri-busta' }),
    });
    return res.status;
  }, idT);
  ok(gruppo === 403, `e la busta resta di chi arbitra (visto ${gruppo})`);
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
  // il titolo dell'episodio non sta piu' in cima alla scena — dal 16/08/2026 in
  // cima ci sono solo l'ora e il menu, e il titolo lo dice il menu quando lo si
  // apre. Si guarda li', che e' dove adesso l'app scrive «dove siete».
  await page.locator('#apri-menu').click().catch(() => {});
  await page.waitForTimeout(400);
  const testo = await page.locator('body').innerText();
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
                chiusa: false },
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
                risposte: ['', '', '', ''], chiusa: false, carta: null },
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
  await entraSeSiE();

  // IL BOTTONE C'E', ed e' quello della sua abilita'
  const bott = page.locator(`[data-appr="approfondisci"][data-tipo="${TIPO}"]`);
  ok((await bott.count()) === 1,
     `chi ha l’eroe vede il bottone della SUA abilita’ (${TIPO})`);
  ok((await page.locator('[data-appr="profano"]').count()) === 1,
     'e l’aiuto profano, che e’ l’occasione una di questo luogo');

  // l'aiuto profano non e' di nessuno: e' l'occasione UNA di questo luogo,
  // e il bottone sta su ogni telefono presente.

  // L'ESITO SI LEGGE SU OGNI SCHERMO. Lo scrive chi conduce (`indagine.carta`),
  // e chi guarda non ha un «continuate»: si va avanti quando chiude lui.
  const conCarta = { ...dentro, aggiornato: Date.now() + 1 };
  conCarta.indagine = { ...dentro.indagine,
    carta: { titolo: 'osservazione — la prova', corpo: '<p>Quel che avete colto.</p>' } };
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: conCarta });
  await page.waitForTimeout(1400);
  const schermo = await page.locator('#app').innerText();
  ok(/quel che avete colto/i.test(schermo), `l’esito compare sul telefono:
${schermo.slice(0, 160)}`);
  ok((await page.locator('#ok-msg').count()) === 0,
     'e chi guarda non ha un «continuate»: chiude chi conduce');
}

// --- 10. CHI ARBITRA PUO' ANCHE NON ESSERCI
//
// Il difetto che ha aperto la migrazione: chi conduce sulla lista degli
// episodi, il telefono premeva, e non accadeva niente — perche' il motore era
// la SUA finestra. Qui il tavolo non ha nessun browser d'arbitro aperto: il
// telefono manda un comando del proprio eroe e la partita cambia lo stesso.
{
  const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
  const idB = await page.evaluate(async () => {
    const id = crypto.randomUUID();
    await fetch('/api/tavolo', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ id, nome: 'Chi conduce non c\u2019e\u2019' }) });
    return id;
  });
  const dentro = serata({ luogoAperto: LUOGO.n, visitati: [LUOGO.n], ora: 21 });
  dentro.creata = 9_000;
  await page.evaluate(async ({ t, st }) => {
    await fetch(`/api/tavolo/${t}/apri`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, stato: st }) });
  }, { t: idB, st: dentro });

  const esito = await page.evaluate(async ({ t, chi, luogo, tipoApp }) => {
    const res = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'aiuto-profano', luogo, tipoApp, eroe: chi, tiri: [[6, 6]] }),
    });
    return { status: res.status, corpo: await res.json() };
  }, { t: idB, chi: ELENA, luogo: LUOGO.n, tipoApp: LUOGO.approfondimenti[0].tipo });
  ok(esito.status === 200 && !esito.corpo.rifiuto,
     `il comando passa senza nessun arbitro collegato (${esito.status} ${
       JSON.stringify(esito.corpo.rifiuto || '')})`);

  const dopo = await page.evaluate(async (t) =>
    (await (await fetch(`/api/tavolo/${t}/stato`)).json()).stato.indagine, idB);
  ok((dopo.profano || {})[LUOGO.n] === true,
     'e la serata e\u2019 cambiata: l\u2019occasione del luogo e\u2019 spesa');
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

  // il telefono gioca: il tavolo applica e sparge, ma non ci mette il proprio
  // orologio — se lo facesse, la mossa seguente di chi arbitra (col clock del
  // suo PC, magari qualche secondo indietro) verrebbe rifiutata in silenzio.
  const primaDelloScarto = (await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json())
    .stato.aggiornato;
  await page.evaluate(async ({ t, chi }) => {
    await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'nota-eroe', eroe: chi, testo: 'la cera' }),
    });
  }, { t: idT, chi: ELENA });
  await page.waitForTimeout(600);

  const dopoComando = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok((dopoComando.stato.indagine.noteEroe || {})[ELENA] === 'la cera',
     'il comando del telefono arriva al tavolo');
  ok(dopoComando.stato.aggiornato === primaDelloScarto,
     `e il tavolo NON ci mette il proprio orologio (era ${primaDelloScarto}, ora ${
       dopoComando.stato.aggiornato})`);

  // ...cosi' la mossa di chi arbitra, che viene subito dopo col SUO timbro,
  // non trova un tavolo piu' avanti di lei e passa
  const eseguita = { ...base, aggiornato: 1_001 };
  eseguita.indagine = { ...base.indagine, ora: 19 };
  ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`,
    { tavolo: idT, stato: eseguita })).ok, 'chi arbitra spende un\u2019ora e rimanda al tavolo');
  const fine = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(fine.stato.indagine.ora === 19, `e la sua mossa passa (ora ${fine.stato.indagine.ora})`);
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
  // Il clic si fa DENTRO la pagina: la vista si ridisegna a ogni spinta dal
  // filo, e il nodo che Playwright ha trovato un istante prima puo' essere gia'
  // staccato — il clic andrebbe a vuoto senza dire niente. Al tavolo il dito
  // trova comunque il bottone che c'e' in quel momento.
  await page.evaluate(() => document.querySelector('#apri-menu').click());
  await page.waitForTimeout(500);
  ok((await page.locator('#m-taccuino').count()) === 1, 'dal menu si apre il taccuino');
  await page.evaluate(() => document.querySelector('#m-taccuino').click());
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

// --- 13. LA SCHERMATA CONDIVISA ARRIVA ANCHE A CHI ARBITRA
//
// Visto al tavolo il 14/08: «il telefono fa l'azione e poi non può fare più
// niente». Non era bloccato: aspettava. Quel che un eroe coglie si legge
// insieme, e la schermata la chiude chi conduce — ma durante l'Indagine il suo
// browser NON ridisegna su quel che arriva dal filo, quindi quella schermata
// sul suo schermo non compariva mai. Nessuno da chiudere, e il telefono fermo
// su «si va avanti quando chi arbitra chiude» per sempre.
//
// Qui il browser è arbitro del proprio tavolo (l'ha aperto lui), e la carta gli
// arriva dal filo come gliela manderebbe un telefono.
{
  const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
  const idC = await page.evaluate(async () => {
    const id = crypto.randomUUID();
    await fetch('/api/tavolo', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ id, nome: 'La carta condivisa' }) });
    return id;
  });
  const dentro = serata({ luogoAperto: LUOGO.n, visitati: [LUOGO.n], ora: 21 });
  dentro.creata = 13_000;

  await page.evaluate(async ({ t, st }) => {
    await fetch(`/api/tavolo/${t}/apri`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, stato: st }) });
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), JSON.parse(JSON.stringify(st)), () => {},
                        { tavolo: t, ruolo: 'arbitro', eroe: null });
  }, { t: idC, st: dentro });
  await page.waitForTimeout(1500);
  ok(!/quel che avete colto/i.test(await page.locator('#app').innerText()),
     'chi arbitra parte dalla sua scrivania');

  // un eroe coglie qualcosa: la carta entra nello stato e il filo la sparge
  await page.evaluate(async (t) => {
    await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'carta', titolo: 'osservazione — la prova',
                             corpo: '<p>Quel che avete colto.</p>' }),
    });
  }, idC);
  await page.waitForTimeout(1500);

  const schermo = await page.locator('#app').innerText();
  ok(/quel che avete colto/i.test(schermo),
     `la schermata condivisa compare sullo schermo di chi arbitra:
${schermo.slice(0, 140).replace(/\s+/g, ' ')}`);
  ok((await page.locator('#ok-msg').count()) === 1,
     'e lui ha il «continuate»: è sua la mano che chiude');

  // e chiudendola il tavolo riparte davvero, per tutti
  // se il bottone non c'e' il difetto e' gia' segnato qui sopra: si va avanti a
  // dirlo tutto, invece di far cadere il banco con un errore che nasconde il
  // resto dei controlli
  await page.evaluate(() => document.querySelector('#ok-msg')?.click());
  await page.waitForTimeout(1200);
  const dopo = await page.evaluate(async (t) =>
    (await (await fetch(`/api/tavolo/${t}/stato`)).json()).stato.indagine.carta, idC);
  ok(!dopo, `chiudendola si riparte (carta ${dopo ? 'ancora lì' : 'chiusa'})`);
  ok(!/quel che avete colto/i.test(await page.locator('#app').innerText()),
     'e chi arbitra torna alla sua scrivania');
}

// --- 14. L'ARRIVO E' DI CHI GUARDA, E NON MUOVE IL TAVOLO
//
// Chi arbitra dichiara la destinazione ed entra dritto: l'ora è del gruppo e la
// spende lui. Sui telefoni entrare non era un momento — cambiava il contenuto
// della pagina in silenzio, e chi guardava il proprio schermo si ritrovava
// dentro senza essersene accorto. Ora la facciata si apre a tutto schermo e si
// entra col dito, ognuno per sé: non è una mossa, quindi il tavolo non si deve
// muovere di un millimetro.
{
  const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
  const TIPO = LUOGO.approfondimenti[0].tipo;
  const IDONEO = COMUNE.eroi.find((e) => ((e.cariche || {})[TIPO] || 0) > 0);
  const dentro = serata({ luogoAperto: LUOGO.n, visitati: [LUOGO.n], ora: 21 });
  dentro.party = [IDONEO.nome, OTTONE];
  dentro.creata = 14_000;

  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: dentro.party });
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: IDONEO.nome });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: dentro });
  await apriIndagine(dentro);
  await page.waitForTimeout(1200);

  // LA FACCIATA, non la pagina delle azioni
  ok((await page.locator('#entrate').count()) === 1, 'il telefono arriva davanti al luogo');
  const facciata = await page.locator('#app').innerText();
  ok(facciata.toLowerCase().includes(LUOGO.nome.toLowerCase().slice(0, 12)),
     `e la facciata dice quale (${facciata.slice(0, 90).replace(/\s+/g, ' ')})`);
  ok((await page.locator('[data-appr]').count()) === 0,
     'le azioni non ci sono ancora: prima si entra');
  ok(!/indizi|leggeteli ad alta voce/i.test(facciata),
     'e il testo del luogo nemmeno: quello si legge dentro');

  const prima = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();

  await page.evaluate(() => document.querySelector('#entrate').click());
  await page.waitForTimeout(900);
  ok((await page.locator('[data-appr]').count()) > 0,
     'entrando compaiono le azioni di chi ha l’eroe');

  // e il tavolo non si è mosso: l'arrivo non è un comando
  const dopo = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  ok(dopo.stato.aggiornato === prima.stato.aggiornato
     && dopo.stato.indagine.luogoAperto === prima.stato.indagine.luogoAperto,
     `e il tavolo non si è mosso (timbro ${prima.stato.aggiornato} → ${dopo.stato.aggiornato})`);
}

// --- 15. IL DONO DAL TELEFONO, E LA STRADA DETTA PER NOME
//
// Ombra e Discernimento indicano un luogo LONTANO, e la loro risposta si apre
// su ogni schermo. Diceva «là si nasconde ancora qualcosa»: chi aveva premuto
// sapeva di che strada si parlava, gli altri no — una risposta senza la
// domanda, letta proprio dalla gente che doveva informare.
//
// Si guarda quel che finisce NELLO STATO, non quel che disegna la pagina: è la
// stessa carta che arriva a tutti gli schermi.
{
  const MORA = COMUNE.eroi.find((e) => e.nome.includes('FANTI')).nome;
  const perStrada = serata({ ora: 21 });
  perStrada.party = [MORA, OTTONE];
  perStrada.creata = 15_000;
  delete perStrada.indagine.luogoAperto;

  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: perStrada.party });
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: MORA });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: perStrada });
  await apriIndagine(perStrada, MORA);
  await page.waitForTimeout(1200);

  ok((await page.locator('#dono-eroe').count()) === 1,
     'chi ha Mora vede il suo dono sulla home, e nessun altro');
  await page.evaluate(() => document.querySelector('#dono-eroe').click());
  await page.waitForTimeout(700);
  const voci = page.locator('.scelta-overlay .scelta-btn:not(.annulla)');
  ok((await voci.count()) > 1, 'e lo stradario si sceglie dal telefono: le strade non sono un segreto');
  const strada = (await voci.first().innerText()).trim();
  await voci.first().click();
  await page.waitForTimeout(1600);

  const st = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  const carta = st.stato.indagine.carta || {};
  ok(/ombra/i.test(carta.titolo || ''),
     `la risposta si apre su ogni schermo (${carta.titolo || '—'})`);
  ok((carta.corpo || '').toLowerCase().includes(strada.toLowerCase()),
     `e nomina la strada, che è la domanda di quella risposta (cercavo «${strada}»)`);
  ok(st.stato.indagine.ombraUsata === true, 'e il dono è speso sul tavolo');
}

// --- 16. LA BUSTA SI LEGGE INSIEME, E NESSUN TELEFONO VA NELL'ALLESTIMENTO
//
// Il difetto: appena `indagine.chiusa` diventava vera il filo portava i telefoni
// a `vaiA('spedizione')`, dove `vistaDigitale` — con la spedizione non ancora
// cominciata — apriva l'ALLESTIMENTO di chi arbitra, «si scende →». Quel
// bottone chiama `iniziaPartita()`, che costruisce una spedizione intera in
// locale, mazzo mescolato compreso. Nel momento più alto della serata i
// telefoni uscivano dalla stanza, e a uno bastava un tocco per farsi una
// partita parallela.
//
// Ora la busta è una schermata condivisa: si legge, e si passa di là quando chi
// arbitra chiude.
{
  const conBusta = serata({ ora: 22 });
  conBusta.creata = 16_000;
  conBusta.indagine.chiusa = true;
  conBusta.indagine.carta = { titolo: 'la busta è aperta',
                              corpo: '<p>le risposte, e il vantaggio</p>' };
  conBusta.vantaggi = { tier: 'preparati', dossier: false, risposte: [true, false, false, false] };
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: conBusta });
  await apriIndagine(conBusta);
  await page.waitForTimeout(1400);

  // la spinta dal filo e' il ramo che conta: e' li' che il telefono veniva
  // mandato via appena `chiusa` diventava vera
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`,
    { tipo: 'carta', titolo: 'la busta è aperta', corpo: '<p>le risposte, e il vantaggio</p>' });
  await page.waitForTimeout(1400);

  const schermo = await page.locator('#app').innerText();
  ok(/le risposte, e il vantaggio/i.test(schermo),
     `il telefono legge la busta insieme al tavolo:
${schermo.slice(0, 120).replace(/\s+/g, ' ')}`);
  ok(!(await page.evaluate(() => window.__vaiA)),
     `e NON è stato mandato via (${await page.evaluate(() => window.__vaiA)})`);
  ok((await page.locator('#via').count()) === 0,
     'né è finito nell’allestimento della Spedizione');

  // ...e quando chi arbitra chiude, allora sì: la notte è finita
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`, { tipo: 'carta-vista' });
  await page.waitForTimeout(1400);
  ok((await page.evaluate(() => window.__vaiA)) === 'spedizione',
     `chiudendo la carta, il telefono passa alla Spedizione (${
       await page.evaluate(() => window.__vaiA)})`);

  // e nemmeno arrivandoci per la strada lunga: l'allestimento non offre «si
  // scende» a chi non arbitra, o un tocco costruirebbe una partita parallela
  const allestimento = await page.evaluate(async () => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const p = JSON.parse(localStorage.getItem('osr.partita.ep1'));
    p.fase = 'spedizione';
    p.spedizione = { round: 0, canto: 0, mazzo: null, esito: null, digitale: false };
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), p, () => {},
                        { tavolo: null, ruolo: 'giocatore', eroe: null, eroi: null ? [null] : [] });
    return { via: document.querySelectorAll('#via').length,
             testo: document.querySelector('#app').innerText.slice(0, 200) };
  });
  ok(allestimento.via === 0,
     `«si scende» non è di chi gioca (${allestimento.testo.replace(/\s+/g, ' ').slice(0, 90)})`);
}

// --- 17. LA CARTA ARRIVA IN DUE TEMPI, E IL PRIMO E' VUOTO
//
// Visto al tavolo il 15/08: un eroe coglie qualcosa dal telefono, e sullo
// schermo di chi arbitra compare il titolo giusto sopra un pannello NERO, con
// «continuate». Il motore scrive «c'è qualcosa da leggere» (`daLeggere`) ma non
// può comporla — la prosa e le carte sono mestiere della vista, e chi ha
// giocato le manda un istante dopo. Chi arbitra disegnava il primo tempo e poi
// non si ridisegnava più: il titolo era lo stesso.
{
  const idD = await page.evaluate(async () => {
    const id = crypto.randomUUID();
    await fetch('/api/tavolo', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ id, nome: 'La carta in due tempi' }) });
    return id;
  });
  const dentro = serata({ ora: 21 });
  dentro.creata = 17_000;
  await page.evaluate(async ({ t, st }) => {
    await fetch(`/api/tavolo/${t}/apri`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, stato: st }) });
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), JSON.parse(JSON.stringify(st)), () => {},
                        { tavolo: t, ruolo: 'arbitro', eroe: null });
  }, { t: idD, st: dentro });
  await page.waitForTimeout(1400);

  // PRIMO TEMPO: il motore segna che c'è qualcosa da leggere, senza prosa
  await page.evaluate(async ({ t, st }) => {
    const s2 = JSON.parse(JSON.stringify(st));
    s2.aggiornato = st.aggiornato + 1;
    s2.indagine.carta = { titolo: 'osservazione — la polvere smossa' };
    await fetch(`/api/tavolo/${t}/apri`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, stato: s2 }) });
  }, { t: idD, st: dentro });
  await page.waitForTimeout(1300);
  ok(!(await page.locator('#ok-msg').count()),
     'la carta senza prosa non si mostra: non c’è ancora niente da leggere');

  // SECONDO TEMPO: la prosa, mandata da chi ha giocato
  await page.evaluate(async (t) => {
    await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'carta', titolo: 'osservazione — la polvere smossa',
                             corpo: '<p>Qualcuno ha spostato la cassa, e da poco.</p>' }),
    });
  }, idD);
  await page.waitForTimeout(1400);
  const schermo = await page.locator('#app').innerText();
  ok(/qualcuno ha spostato la cassa/i.test(schermo),
     `e quando la prosa arriva, chi arbitra la legge:
${schermo.slice(0, 140).replace(/\s+/g, ' ')}`);
  ok((await page.locator('#ok-msg').count()) === 1, 'col «continuate» che la chiude');
}

// --- 18. LA SCHEDA DI UN EROE NON ARRUOLA NESSUNO
//
// A serata cominciata la compagnia è quella: la scheda si apre per guardare le
// abilità, e «arruola eroe» — che è della scelta del party — non c’entra
// niente. Compariva perché `schedaEroe(e, {})` passa un oggetto vuoto ma VERO,
// e la scheda lo legge come «stai arruolando».
{
  const conMio = serata({ ora: 21 });
  conMio.creata = 18_000;
  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: [ELENA, OTTONE] });
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: ELENA });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: conMio });
  await apriIndagine(conMio, ELENA);
  await page.waitForTimeout(1200);

  await page.evaluate(() => document.querySelector('#apri-menu').click());
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('#m-scheda').click());
  await page.waitForTimeout(500);
  const scheda = await page.locator('.eroe-dettaglio').innerText().catch(() => '');
  ok(/elena/i.test(scheda), `la scheda del proprio eroe si apre (${scheda.slice(0, 60).replace(/\s+/g, ' ')})`);
  ok((await page.locator('#arruola').count()) === 0,
     'e non offre di arruolarlo: la compagnia è già quella');
}

// --- 19. QUEL CHE C'E' DA PRENDERE SI VEDE ANCHE DAL TELEFONO
//
// Visto al tavolo: dal telefono gli oggetti di un luogo non si vedevano — né
// prima che qualcuno li prendesse, né dopo. Uno poteva uscire da una stanza
// senza sapere che ci aveva lasciato una chiave. A raccoglierli resta chi
// arbitra (sono del gruppo, e le carte le passa lui dal mazzo), ma SAPERE che
// ci sono è di tutti.
{
  const L = (EP1.luoghi || []).find((x) => (x.oggetti || []).length);
  if (L) {
    const dentro = serata({ luogoAperto: L.n, visitati: [L.n], ora: 21 });
    dentro.creata = 19_000;
    await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: [ELENA, OTTONE] });
    await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
    await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: ELENA });
    await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: dentro });
    await apriIndagine(dentro, ELENA);
    await page.waitForTimeout(1200);
    await entraSeSiE();

    const primo = L.oggetti[0];
    const schermo = await page.locator('#app').innerText();
    ok(schermo.toLowerCase().includes(String(primo).toLowerCase()),
       `il telefono vede cosa c’è da prendere qui (${String(primo)})`);
    ok(!(await page.locator('[data-oggetto]').count()),
       'ma non lo raccoglie: gli oggetti sono del gruppo, e le carte le passa chi arbitra');

    // e quando chi arbitra lo prende, la carta si apre su OGNI schermo
    await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`,
      { tipo: 'prendi-oggetto', nome: primo });
    await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/comando`,
      { tipo: 'carta', titolo: String(primo).toLowerCase(),
        corpo: '<p class="nota">Prendete la carta dal mazzo Oggetti: da ora è vostra.</p>' });
    await page.waitForTimeout(1400);
    ok(/dal mazzo oggetti/i.test(await page.locator('#app').innerText()),
       'e quando lo prende, la carta si apre anche sul telefono');
  }
}

// --- 20. «SI SCENDE» ARRIVA AL TAVOLO
//
// Visto al tavolo: chi arbitra fa scendere il gruppo e i telefoni restano
// sull'allestimento, «tutto a schermo», per sempre. Non era la loro pagina a
// essere ferma: era il tavolo a non saperlo. Cominciare la spedizione non passa
// da un comando — costruisce la partita, mazzo mescolato compreso, e la salva —
// e il salvataggio non usciva da quel browser.
{
  const idE = await page.evaluate(async () => {
    const id = crypto.randomUUID();
    await fetch('/api/tavolo', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ id, nome: 'Si scende' }) });
    return id;
  });
  const primaDiScendere = {
    v: 1, episodio: 'ep1', party: [ELENA, OTTONE], fase: 'spedizione',
    creata: 20_000, aggiornato: 1_000, vantaggi: { tier: 'preparati' },
    indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [],
                parole: [], oggetti: [], reperti: [], approfondimentiLetti: [],
                caricheUsate: {}, secondoFiato: {}, note: '', noteEroe: {},
                risposte: ['', '', '', ''], chiusa: true },
    spedizione: { round: 0, canto: 0, mazzo: null, esito: null },
  };
  const dopo = await page.evaluate(async ({ t, st }) => {
    await fetch(`/api/tavolo/${t}/apri`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, stato: st }) });
    const { vistaDigitale } = await import('/js/digitale.js');
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), JSON.parse(JSON.stringify(st)), () => {},
                        { tavolo: t, ruolo: 'arbitro', eroe: null });
    const via = document.querySelector('#via');
    if (!via) return { via: false };
    via.click();
    await new Promise((r) => setTimeout(r, 1200));
    const s2 = await (await fetch(`/api/tavolo/${t}/stato`)).json();
    return { via: true, digitale: !!(s2.stato.spedizione || {}).digitale,
             round: (s2.stato.spedizione || {}).round };
  }, { t: idE, st: primaDiScendere });

  ok(dopo.via, 'chi arbitra ha il bottone «si scende»');
  ok(dopo.digitale, `e facendolo scendere il TAVOLO lo sa (${JSON.stringify(dopo)})`);
  ok(dopo.round >= 1, 'con la spedizione cominciata, non l’allestimento');
}

// --- 21. UN DISPOSITIVO, DUE EROI
//
// Due amici con un iPad solo giocano i loro due eroi da lì. Il posto tiene un
// INSIEME, e la guardia del tavolo passa dall'uguaglianza all'appartenenza: qui
// un buco non è un difetto, è un giocatore che muove l'eroe di un altro.
{
  const TERZO = COMUNE.eroi.find((e) => ![ELENA, OTTONE].includes(e.nome)).nome;
  const insieme = serata({ ora: 21 });
  insieme.creata = 21_000;
  insieme.party = [ELENA, OTTONE, TERZO];
  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: insieme.party });
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIOCATORE)}`);
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: GIOCATORE, eroe: ELENA });

  // il dispositivo se ne prende un secondo, da solo
  const preso = await page.evaluate(async ({ t, eroi }) => {
    const r = await fetch('/api/mio-eroe', { method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, eroi }) });
    return { stato: r.status, corpo: await r.json().catch(() => ({})) };
  }, { t: idT, eroi: [ELENA, OTTONE] });
  ok(preso.stato === 200, `un posto può prendersi due eroi (${JSON.stringify(preso)})`);

  const m = await (await chiama(ARBITRO, 'GET', `/api/membri?tavolo=${idT}`)).json();
  const mio = (m.membri || []).find((x) => x.email === GIOCATORE) || {};
  ok((mio.eroi || []).length === 2, `e il tavolo li vede tutti e due (${JSON.stringify(mio.eroi)})`);

  // ...e li comanda tutti e due
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: insieme });
  for (const chi of [ELENA, OTTONE]) {
    const r = await page.evaluate(async ({ t, eroe }) => {
      const res = await fetch(`/api/tavolo/${t}/comando`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'nota-eroe', eroe, testo: 'la cera' }),
      });
      return res.status;
    }, { t: idT, eroe: chi });
    ok(r === 200, `e comanda ${chi.split(' ')[0]}, che è suo (visto ${r})`);
  }

  // il terzo no, e lo dice
  const rubato = await page.evaluate(async ({ t, eroe }) => {
    const res = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'nota-eroe', eroe, testo: 'non sono io' }),
    });
    return { stato: res.status, corpo: await res.json().catch(() => ({})) };
  }, { t: idT, eroe: TERZO });
  ok(rubato.stato === 403, `ma non un eroe che non è suo (visto ${rubato.stato})`);
  ok(/non è un tuo eroe/i.test(((rubato.corpo || {}).rifiuto || {}).motivo || ''),
     `e il rifiuto lo dice (${((rubato.corpo || {}).rifiuto || {}).motivo})`);

  // UN COMANDO SENZA NOME, con due eroi in mano, è ambiguo: attribuirlo al
  // primo della lista vorrebbe dire spendere la carica di uno per la mossa
  // dell'altro, e in silenzio.
  const muto = await page.evaluate(async (t) => {
    const res = await fetch(`/api/tavolo/${t}/comando`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'esame-carbone', pezzo: 'qualunque' }),
    });
    return { stato: res.status, corpo: await res.json().catch(() => ({})) };
  }, idT);
  ok(muto.stato === 400, `un comando senza eroe, con due in mano, è rifiutato (visto ${muto.stato})`);
  ok(/dite quale gioca/i.test(((muto.corpo || {}).rifiuto || {}).motivo || ''),
     'e chiede quale dei due sta giocando');

  // e lo stesso eroe non può essere di due posti: lo dice il database
  const altro = 'secondo@esempio.it';
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: altro });
  const conteso = await chiama(ARBITRO, 'POST', '/api/membri',
    { tavolo: idT, email: altro, eroe: ELENA });
  ok(!conteso.ok, `un eroe ha un posto solo (visto ${conteso.status})`);
  await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${encodeURIComponent(altro)}`);
}

// --- 22. L'INTERRUTTORE: su questo schermo si gioca un eroe per volta
{
  const due = serata({ ora: 21 });
  due.creata = 22_000;
  due.party = [ELENA, OTTONE];
  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: due.party });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: due });
  await page.evaluate(async ({ t, s: st, eroi }) => {
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), JSON.parse(JSON.stringify(st)), () => {},
                        { tavolo: t, ruolo: 'giocatore', eroe: eroi[0], eroi });
  }, { t: idT, s: due, eroi: [ELENA, OTTONE] });
  await page.waitForTimeout(1200);

  await page.evaluate(() => document.querySelector('#apri-menu').click());
  await page.waitForTimeout(400);
  ok((await page.locator('#m-cambia').count()) === 1,
     'con due eroi in mano compare «giocate come…»');
  await page.evaluate(() => document.querySelector('#m-cambia').click());
  await page.waitForTimeout(400);
  const scelte = await page.locator('[data-in-mano]').count();
  ok(scelte === 2, `e si sceglie fra i propri due (${scelte})`);

  // si passa al secondo, e il taccuino diventa il SUO
  await page.evaluate((nm) => document.querySelector(`[data-in-mano="${nm}"]`).click(), OTTONE);
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('#apri-menu').click());
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('#m-taccuino').click());
  await page.waitForTimeout(600);
  const mieI = await page.locator(`[data-nota-eroe="${OTTONE}"]`).count();
  const altrui = await page.locator(`[data-nota-eroe="${ELENA}"]`).count();
  ok(mieI === 1 && altrui === 0,
     `cambiando eroe, gli appunti sono i suoi (${OTTONE.split(' ')[0]}: ${mieI}, altri: ${altrui})`);
}

// --- 23. IL DONO SI PAGA CON LA CARICA DI CHI E' IN MANO
//
// Dal telefono i doni partivano SENZA nome — con un eroe solo il tavolo lo
// riempiva. Con due il tavolo rifiuta, e ha ragione: il primo della lista
// spenderebbe la carica dell'altro. Qui si guarda che parta il dono giusto,
// che e' la differenza fra «Carla apre la porta» e «Mora ha perso il furetto».
{
  const MORA = COMUNE.eroi.find((e) => e.nome.includes('MORA')).nome;
  const CARLA = COMUNE.eroi.find((e) => e.nome.includes('CARLA')).nome;
  const doni = serata({ ora: 21 });
  doni.creata = 23_000;
  doni.party = [MORA, CARLA];
  await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: doni.party });
  await page.evaluate(async ({ t, eroi }) => {
    await fetch('/api/mio-eroe', { method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tavolo: t, eroi }) });
  }, { t: idT, eroi: [MORA, CARLA] });
  await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: doni });
  await page.evaluate(async ({ t, s: st, eroi }) => {
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), JSON.parse(JSON.stringify(st)), () => {},
                        { tavolo: t, ruolo: 'giocatore', eroe: eroi[0], eroi });
  }, { t: idT, s: doni, eroi: [MORA, CARLA] });
  await page.waitForTimeout(1500);

  const donoOra = async () => (await page.locator('#dono-eroe').count()
    ? (await page.locator('#dono-eroe').innerText()).toLowerCase() : '(nessun dono)');
  ok((await donoOra()).includes('ombra'),
     `la barra offre il dono di chi e' in mano (${await donoOra()})`);

  // si passa a Carla
  await page.evaluate(() => document.querySelector('#apri-menu').click());
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('#m-cambia').click());
  await page.waitForTimeout(400);
  await page.evaluate((nm) => document.querySelector(`[data-in-mano="${nm}"]`).click(), CARLA);
  await page.waitForTimeout(800);
  ok((await donoOra()).includes('fonti'),
     `cambiando eroe cambia il dono nella barra (${await donoOra()})`);

  // ...e premendolo il tavolo lo accetta e lo segna a CARLA
  await page.evaluate(() => document.querySelector('#dono-eroe').click());
  await page.waitForTimeout(1200);
  const dopo = await (await chiama(ARBITRO, 'GET', `/api/tavolo/${idT}/stato`)).json();
  const ind23 = (dopo.stato || {}).indagine || {};
  ok(ind23.fontiRiservateUsate === true,
     'da un posto con due eroi il dono parte davvero (il tavolo non lo rifiuta)');
  ok(!ind23.ombraUsata,
     'e a pagarlo è Carla, non il primo della lista');
}

await browser.close();
console.log(ko === 0
  ? 'test-indagine-eroe: l\'Indagine si gioca in due, senza che i segreti passino'
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
