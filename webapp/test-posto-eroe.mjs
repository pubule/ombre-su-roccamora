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
    const [{ vistaDigitale }] = await Promise.all([import('/js/digitale.js')]);
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

await browser.close();
console.log(ko === 0 ? 'test-posto-eroe: la plancia rispetta il posto' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
