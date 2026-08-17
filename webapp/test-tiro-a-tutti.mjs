// IL TIRO LO VEDONO TUTTI.
//
// Il dado dell'Indagine lo tira chi ha quell'eroe, dal suo telefono. Fin qui
// rotolava SOLO li': al tavolo gli altri sentivano un silenzio, e poi l'esito
// gia' scritto — che è il contrario di quel che il tiro serve a fare. Adesso la
// stessa finestra si apre su ogni schermo, in sola vista: i cubi arrivano fermi
// sul risultato, il conto e' gia' scritto, e non c'e' niente da premere se non
// «continua».
//
// COME SI PROVA. Due schermi sullo stesso tavolo: da uno si tira, sull'altro
// deve comparire la finestra. Il secondo schermo qui e' una seconda scheda
// dello stesso posto — non c'e' modo di far autenticare un browser come
// l'arbitro senza il suo JWT — ma la strada che percorre e' quella vera: il
// Durable Object sparge gli eventi a TUTTE le sessioni, e chi li riceve non
// sa (ne' gli importa) da che posto vengano.
//
// LA COSA CHE NON DEVE ACCADERE, ed e' il motivo del `rif`: la spinta torna
// anche a chi ha tirato. Senza contrassegno, il suo schermo rifarebbe la scena
// dei propri dadi un istante dopo averli visti fermarsi.
//
// Uso, in due terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:giocatore@esempio.it --port 8787
//   node webapp/test-tiro-a-tutti.mjs
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
const OTTONE = COMUNE.eroi.find((e) => e.nome.includes('OTTONE')).nome;

// il luogo con qualcosa da cogliere, e l'eroe che ha la carica per coglierlo
const LUOGO = EP1.luoghi.find((l) => (l.approfondimenti || []).length);
const TIPO = LUOGO.approfondimenti[0].tipo;
const IDONEO = COMUNE.eroi.find((e) => ((e.cariche || {})[TIPO] || 0) > 0);

const serata = () => ({
  v: 1, episodio: 'ep1', modo: 'digitale', party: [IDONEO.nome, OTTONE], fase: 'indagine',
  vantaggi: null, rng: { seme: 77, passo: 0 }, aggiornato: Date.now(), creata: 3000,
  indagine: {
    ora: 21, lettaLettera: true, visitati: [LUOGO.n], luogoAperto: LUOGO.n, scoperti: [],
    sbloccati: [], parole: [], oggetti: [], reperti: [], approfondimentiLetti: [],
    caricheUsate: {}, secondoFiato: {}, note: '', risposte: ['', '', '', ''],
    risposteEsatte: [false, false, false, false], chiusa: false,
  },
  spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, scarti: [], esito: null },
});

const idT = crypto.randomUUID();
ok((await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'Il tiro davanti a tutti' })).ok,
   'l’arbitro apre il tavolo');
ok((await chiama(ARBITRO, 'PUT', '/api/party', { tavolo: idT, party: [IDONEO.nome, OTTONE] })).ok,
   'e mette in campo i due eroi');
ok((await chiama(ARBITRO, 'POST', '/api/membri',
                 { tavolo: idT, email: GIOCATORE, eroe: IDONEO.nome })).ok,
   `e da’ ${IDONEO.nome.split(' ')[0]} a chi gioca`);
ok((await chiama(ARBITRO, 'POST', `/api/tavolo/${idT}/apri`, { tavolo: idT, stato: serata() })).ok,
   'e mette la serata sul tavolo');

const browser = await chromium.launch();
const errori = [];

// due schermi, stesso tavolo: da `chiTira` si tira, `chiGuarda` deve vedere
const apriSchermo = async () => {
  const p = await browser.newPage({ viewport: { width: 420, height: 900 } });
  p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(async ({ t, eroe, s }) => {
    const { vistaIndagine } = await import('/js/indagine.js');
    document.querySelector('#app').innerHTML = '';
    await vistaIndagine(document.querySelector('#app'), s, () => {},
                        { tavolo: t, ruolo: 'giocatore', eroe, eroi: [eroe] });
  }, { t: idT, eroe: IDONEO.nome, s: serata() });
  await p.waitForTimeout(1200);            // il filo si apre
  if (await p.locator('#entrate').count()) {
    await p.evaluate(() => document.querySelector('#entrate').click());
    await p.waitForTimeout(700);
  }
  return p;
};

const chiTira = await apriSchermo();
const chiGuarda = await apriSchermo();
ok(errori.length === 0, `i due schermi aprono l'Indagine senza errori JS: ${errori.slice(0, 2).join(' | ')}`);

// --- si tira: si dichiarano due dadi veri, e si manda
const sel = `[data-appr="approfondisci"][data-tipo="${TIPO}"]`;
ok((await chiTira.locator(sel).count()) === 1, `chi ha l'eroe vede il suo ${TIPO}`);
await chiTira.evaluate((x) => document.querySelector(x).click(), sel);
await chiTira.waitForTimeout(1200);

// LA FINESTRA DI CHI TIRA: e' la sua, e si comanda. La riga di chi tira porta
// il ritratto e la soglia, che sono le due cose prese da BG3 che si vedono
// prima ancora del dado.
{
  const suo = await chiTira.evaluate(() => {
    const o = document.querySelector('.dadi-overlay');
    if (!o) return null;
    return {
      ritratto: !!o.querySelector('.chi-tira img'),
      soglia: (o.querySelector('.chi-tira .soglia b') || {}).textContent || '',
      tavolo: getComputedStyle(o.querySelector('#dadi-tavolo')).display !== 'none',
    };
  });
  ok(suo && suo.ritratto, 'chi tira ha una faccia: il ritratto sta nella finestra');
  ok(suo && /^\d+$/.test(suo.soglia.trim()), `e la soglia e' scritta (vista «${suo && suo.soglia}»)`);
  ok(suo && suo.tavolo, 'e i dadi veri si possono ancora dichiarare');
}

await chiTira.locator('#dadi-tavolo [data-tot="12"]').click();
await chiTira.waitForTimeout(2800);
await chiTira.locator('#dadi-chiudi').click();

// --- L'ALTRO SCHERMO: la finestra si apre da sola, e si guarda soltanto
await chiGuarda.waitForTimeout(2500);
{
  const visto = await chiGuarda.evaluate(() => {
    const o = document.querySelector('.dadi-overlay');
    if (!o) return null;
    const mostrato = (x) => {
      const e = o.querySelector(x);
      return !!e && getComputedStyle(e).display !== 'none';
    };
    return {
      righe: o.querySelectorAll('.registro-tiro .riga').length,
      verdetto: (o.querySelector('#dadi-verdetto') || {}).textContent || '',
      lancia: mostrato('#dadi-lancia'),
      tavolo: mostrato('#dadi-tavolo'),
      annulla: mostrato('#dadi-annulla'),
      chiudi: mostrato('#dadi-chiudi'),
      chi: (o.querySelector('.chi-tira .nome') || {}).textContent || '',
    };
  });
  ok(visto, 'il tiro di un altro apre la finestra anche su questo schermo');
  ok(visto && visto.righe >= 3,
     `e il conto e' gia' scritto per intero (${visto ? visto.righe : 0} righe)`);
  ok(visto && /successo|fallita|totale/.test(visto.verdetto),
     `e il verdetto e' quello del tavolo (visto «${visto ? visto.verdetto : ''}»)`);
  ok(visto && visto.chi.toLowerCase().includes(IDONEO.nome.split(' ')[0].toLowerCase()),
     `e dice chi ha tirato (visto «${visto ? visto.chi.trim() : ''}»)`);
  // SI GUARDA, NON SI TIRA: da qui non si puo' rifare il tiro di un altro, ne'
  // annullarlo. Restano solo i cubi fermi e il «continua».
  ok(visto && !visto.lancia, 'da qui non si tira il tiro di un altro');
  ok(visto && !visto.tavolo, 'e non si dichiarano i suoi dadi');
  ok(visto && !visto.annulla, 'e non si annulla');
  ok(visto && visto.chiudi, 'si chiude e basta');
}

// --- E CHI HA TIRATO NON LO RIVEDE. La spinta del tavolo torna anche a lui:
// senza contrassegno si riaprirebbe la finestra sui dadi appena visti.
await chiTira.waitForTimeout(500);
{
  const riaperta = await chiTira.locator('.dadi-overlay').count();
  ok(riaperta === 0, `chi ha tirato non si rivede i propri dadi (${riaperta} finestre)`);
}

ok(errori.length === 0, `nessun errore JS in tutta la scena: ${errori.slice(0, 2).join(' | ')}`);

await browser.close();
console.log(ko === 0 ? 'test-tiro-a-tutti: il tiro si vede su ogni schermo'
                     : `test-tiro-a-tutti: ${ko} controlli rossi`);
process.exit(ko === 0 ? 0 : 1);
