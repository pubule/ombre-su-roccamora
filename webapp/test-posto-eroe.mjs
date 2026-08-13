// LA PLANCIA VISTA DA CHI GIOCA UN EROE SOLO.
//
// La plancia è la stessa dell'arbitro — non se ne fa una copia, sarebbe
// ricreare la divergenza fra due versioni della stessa cosa. Cambia CHI PUÒ
// TOCCARE COSA, e questo test guarda proprio quello, nel browser vero:
//
//   - le caselle si accendono solo per l'eroe che è mio;
//   - il bottone «ha finito» compare solo nel mio turno;
//   - «gli eroi cadono» resta a chi conduce.
//
// Non serve un server: il posto si inietta a mano nella pagina, perché quel che
// c'è da provare è la VISTA, non l'autorizzazione — quella la prova
// test-tavolo-do.mjs contro il Durable Object, ed è lì che conta davvero.
// Qui si prova che il telefono non offra bottoni che il motore rifiuterebbe.
//
// Uso:  node webapp/server.js ; node webapp/test-posto-eroe.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = 'http://localhost:8017';
const EP = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const T0 = EP.tessere[0].id;

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const PARTY = COMUNE.eroi.slice(0, 3).map((e) => e.nome);
const MIO = PARTY[0];
const ALTRUI = PARTY[1];

const browser = await chromium.launch();

// Apre la Spedizione con un posto dato, seminando la partita e chiamando
// direttamente `vistaDigitale` col posto — è il modo di provare la vista senza
// tirarsi dietro account, tavoli e Durable Object.
async function apri(posto) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  const errori = [];
  page.on('pageerror', (e) => errori.push(e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async ({ ep, party, mio, posto: p, t0 }) => {
    const mod = await import('/js/digitale.js');
    window.__d = mod;                      // per chiamare i pezzi dal test
    const { vistaDigitale } = mod;
    const eroiPos = {}; const vite = {};
    party.forEach((n, i) => { eroiPos[n] = { t: t0, x: i, y: 0 }; vite[n] = 6; });
    const partita = {
      v: 1, episodio: ep, modo: 'digitale', party, fase: 'spedizione',
      indagine: { ora: 24, visitati: [], oggetti: [], caricheUsate: {}, chiusa: true,
                  approfondimentiLetti: [] },
      vantaggi: { tier: 'preparati' },
      spedizione: {
        round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null,
        rivelate: [t0], grate: [], nemici: [], log: [], compiti: {}, cercate: {},
        eroiPos, vite, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: mio,
        scortati: [], mazzo: null, pendenza: null, insidie: {}, abilita: {},
      },
    };
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), partita, () => {}, p);
  }, { ep: 'ep1', party: PARTY, mio: MIO, posto, t0: T0 });
  // `vistaDigitale` comincia dalla schermata d'ingresso (com'e' giusto: la
  // Spedizione si apre leggendo), e la plancia arriva dopo. Come fa il pilota,
  // si preme quel che c'e' finche' il tabellone non compare.
  for (const sel of ['#continua', '#via', '#inizia-spedizione', '#ok-msg']) {
    const b = page.locator(sel);
    if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(250); }
  }
  await page.waitForTimeout(500);
  return { page, errori };
}

const conta = (page, sel) => page.locator(sel).count();

// --- L'ARBITRO: la plancia di sempre
{
  const { page, errori } = await apri(null);
  ok(errori.length === 0, `l'arbitro apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);
  ok(await conta(page, '.cella-mossa') > 0, 'le caselle dell\'eroe attivo si accendono');
  ok(await conta(page, '#az-fine') === 1, 'e c\'è il bottone «ha finito»');
  ok(await conta(page, '#sconfitta') === 1, 'e «gli eroi cadono», che è di chi conduce');
  await page.close();
}

// --- IL GIOCATORE, quando tocca a LUI
{
  const { page, errori } = await apri({ ruolo: 'giocatore', eroe: MIO });
  ok(errori.length === 0, `il giocatore apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);
  ok(await conta(page, '.tok-board') > 0, 'la plancia c\'è: è la stessa, non una copia');
  ok(await conta(page, '.cella-mossa') > 0, 'nel suo turno le caselle si accendono');
  ok(await conta(page, '#az-fine') === 1, 'e può chiudere il turno');
  ok(await conta(page, '#sconfitta') === 0,
     '«gli eroi cadono» NON c\'è: chiudere la serata è di chi conduce');
  await page.close();
}

// --- IL GIOCATORE, quando tocca a UN ALTRO
{
  const { page, errori } = await apri({ ruolo: 'giocatore', eroe: ALTRUI });
  ok(errori.length === 0, `apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);
  ok(await conta(page, '.tok-board') > 0, 'la plancia si vede lo stesso: si guarda il tavolo');
  ok(await conta(page, '.cella-mossa') === 0,
     'ma NESSUNA casella accesa: non è il suo turno, e illuminare il cammino di un altro confonde');
  ok(await conta(page, '#az-fine') === 0, 'né il bottone per chiudere il turno altrui');
  const testo = await page.locator('.pannello').allInnerTexts();
  ok(testo.join(' ').toLowerCase().includes('aspetta'),
     'e lo dice, invece di mostrare un pannello vuoto');
  await page.close();
}

// --- IL LAYOUT DA TELEFONO: lo stesso HTML, in un altro ordine
//
// Si misura l'ordine A SCHERMO (le coordinate), non quello del DOM: e' il CSS a
// ordinare, quindi guardare il DOM proverebbe soltanto che il DOM non e'
// cambiato — e infatti la prima versione di questo test passava anche col CSS
// spento.
const ordineVisivo = (page) => page.evaluate(() =>
  [...document.querySelectorAll('.fascia-turno,.board-area,#p-salute,#p-azioni,#p-giro')]
    .map((e) => [e.id || e.className.split(' ')[0], Math.round(e.getBoundingClientRect().top)])
    .sort((a, b) => a[1] - b[1]).map((x) => x[0]).join(' → '));

{
  const { page } = await apri({ ruolo: 'giocatore', eroe: MIO });
  ok((await page.locator('#app').getAttribute('class')).includes('vista-eroe'),
     'il telefono accende il layout da telefono');
  const ord = await ordineVisivo(page);
  ok(ord === 'fascia-turno → board-area → p-salute → p-azioni → p-giro',
     `plancia in alto e azioni dove arriva il pollice (visto «${ord}»)`);
  const f = await page.locator('.fascia-turno').innerText();
  ok(/tocca a te/i.test(f), `e la fascia dice di chi è il turno (visto «${f.trim()}»)`);
  ok(await page.locator('#p-salute .nemico-riga.mia').count() === 1,
     'la propria salute è marcata, non è una riga come le altre');
  await page.close();
}

// --- L'ARBITRO NON SI TOCCA: stesso schermo di prima, stesso ordine
{
  const { page } = await apri(null);
  ok(!(await page.locator('#app').getAttribute('class')).includes('vista-eroe'),
     'chi arbitra NON prende il layout da telefono');
  ok(await page.locator('.fascia-turno').count() === 0,
     'e nessuna fascia del turno: ha il tabellone davanti e li muove tutti');
  const ord = await ordineVisivo(page);
  ok(ord === 'board-area → p-giro → p-azioni → p-salute',
     `e i pannelli restano nell'ordine di sempre (visto «${ord}»)`);
  await page.close();
}

// --- LA CARTA MINACCIA: si vede, ma il «continua» non è di chi gioca
//
// La pesca è un gesto di chi arbitra (`COMANDI_DI_ARBITRO` nel Durable Object).
// Sul telefono la carta compare uguale — deciso il 13/08/2026: il telefono si
// ferma insieme al tavolo — ma senza bottone, perché un «continua» che non fa
// continuare niente è una bugia.
{
  const carta = { title: 'Crescendo — Il Canto Cresce', rules: 'Le voci salgono di un tono.',
                  file: 'Episodio 1/Minacce/Il Canto Cresce' };
  for (const [chi, posto, bottoni] of [
    ['chi arbitra', null, 1],
    ['chi gioca', { ruolo: 'giocatore', eroe: MIO }, 0],
  ]) {
    const { page } = await apri(posto);
    await page.evaluate(async ({ carta, annunci }) => {
      const m = await import('/js/digitale.js');
      // la carta si mostra senza aspettare che si chiuda: sul telefono non si
      // chiude affatto finché il tavolo non va avanti, ed è il punto
      m._motore.messaggioCarta('minaccia 1 di 2', carta, annunci);
    }, { carta, annunci: ['Il Canto sale a 3 su 3.'] });
    await page.waitForTimeout(400);
    ok(await page.locator('.carta-grande').count() === 1, `${chi}: la carta si vede`);
    ok(await page.locator('#ok-msg').count() === bottoni,
       `${chi}: bottoni «continua» attesi ${bottoni}, visti ${await page.locator('#ok-msg').count()}`);
    if (!bottoni) {
      const t = (await page.locator('.pannello, .nota').allInnerTexts()).join(' ');
      ok(/chi arbitra/i.test(t), 'e il telefono dice chi la sta leggendo');
    }
    await page.close();
  }
}

// --- IL COLPO CHE ARRIVA A TE
//
// Il numero che sale dal segnalino e lo scossone del token ci sono per tutti.
// Quel che si prova qui e' il segnale in piu' che serve a uno schermo tenuto in
// mano: su un tabellone grande il colpo lo vedono tutti perche' tutti guardano
// li'; su un telefono si guarda altrove, e senza qualcosa che fermi lo schermo
// si scopre di essere a terra due turni dopo.
{
  const { page } = await apri({ ruolo: 'giocatore', eroe: MIO });
  const allarme = () => page.evaluate(() => document.querySelector('#app').classList.contains('colpo-mio'));

  ok(!(await allarme()), 'a riposo nessun allarme');

  await page.evaluate((nm) => window.__d._motore.evidenziaColpito(nm), ALTRUI);
  await page.waitForTimeout(120);
  ok(!(await allarme()), 'un colpo a un ALTRO eroe non fa allarme sul mio telefono');

  await page.evaluate((nm) => window.__d._motore.evidenziaColpito(nm), MIO);
  await page.waitForTimeout(120);
  ok(await allarme(), 'il colpo che arriva a ME sì');

  // e passa da solo: un allarme che resta smette di essere un allarme
  await page.waitForTimeout(1700);
  ok(!(await allarme()), 'e si spegne da solo');
  await page.close();
}

// --- E CHI ARBITRA non prende l'allarme: ha il tabellone davanti, e nessun
// eroe è «suo» più degli altri
{
  const { page } = await apri(null);
  await page.evaluate((nm) => window.__d._motore.evidenziaColpito(nm), MIO);
  await page.waitForTimeout(120);
  ok(!(await page.evaluate(() => document.querySelector('#app').classList.contains('colpo-mio'))),
     'chi arbitra non riceve nessun allarme del colpo');
  await page.close();
}

await browser.close();
console.log(ko === 0 ? 'test-posto-eroe: la plancia rispetta il posto' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
