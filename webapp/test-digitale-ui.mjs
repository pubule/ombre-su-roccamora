// Smoke test end-to-end della modalita' DIGITALE: semina una partita digitale
// in fase spedizione, entra dal menu, gioca alcuni round automatici (finisci
// eroi -> minaccia -> nemici) e verifica board, token, nessun errore JS.
// Uso: node webapp/server.js (altrove) ; node webapp/test-digitale-ui.mjs
import { chromium } from 'playwright';
const BASE = 'http://localhost:8017';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
// Il 404 su /api/stato e' voluto: e' la sonda con cui l'app capisce se esiste
// un server dei salvataggi, e webapp/server.js serve solo file.
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if ((m.location()?.url || '').includes('/api/')) return;
  errs.push('console.error: ' + m.text().slice(0, 200));
});
page.on('response', (r) => { if (r.status() >= 500) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });

// seed: partita digitale, indagine chiusa, spedizione da inizializzare
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  localStorage.clear();
  return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
    const party = c.eroi.slice(0, 3).map((e) => e.nome);
    localStorage.setItem('osr.partita.ep1', JSON.stringify({
      v: 1, episodio: 'ep1', modo: 'digitale', party, creata: Date.now(), fase: 'spedizione',
      indagine: { ora: 24, lettaLettera: true, visitati: [], scoperti: [], sbloccati: [], parole: [],
        oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {}, secondoFiato: {},
        note: '', risposte: ['', '', '', ''], chiusa: true },
      spedizione: { round: 0, canto: 0, cantoBonus: false, mazzo: null, esito: null },
    }));
  });
});

const fail = (m) => { console.error('FAIL:', m); errs.push(m); };
const has = async (sel) => (await page.locator(sel).count()) > 0;
const clickIf = async (sel) => {
  if (!(await has(sel))) return false;
  try { await page.locator(sel).first().click({ force: true, timeout: 1500 }); } catch { return false; }
  await page.waitForTimeout(120); return true;
};

// entra: home -> tessera ep1 -> continua
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(200);
const ep = page.getByText('Il Coro Sommerso').first();
if (await ep.count()) { await ep.click(); } else fail('tessera episodio non trovata');
await page.waitForTimeout(200);
await clickIf('#continua');                 // -> setup digitale
await page.waitForTimeout(150);
// La schermata d'ingresso e' testo, e il layout immersivo non scorre: qui la
// classe NON deve esserci, o su un telefono le righe di sotto sparirebbero.
if (await has('#app.immersivo')) fail('la schermata d’ingresso e’ immersiva (non scorre)');
await clickIf('#via');                       // -> board
// la stanza d'ingresso si legge come tutte le altre: chi arbitra la chiude
await clickIf('#ok-msg');
await page.waitForTimeout(200);

if (!(await has('.board-digitale'))) fail('board non renderizzato');
// la Spedizione nasce a tabellone: e' il default, non una scelta da rifare
if (!(await has('#app.immersivo'))) fail('la plancia non parte a schermo pieno');
const nTok = await page.locator('.tok-board.eroe').count();
if (nTok < 3) fail(`token eroe attesi 3, trovati ${nTok}`);

// IL SANGUE SUL TOKEN. Quanto ne resta si legge addosso alla figura — la
// velatura che sale col calare della salute, e la riga di livello — invece che
// solo nella lista di fianco: in mezzo a una mischia di sei token nessuno
// leggeva il conto, e si scopriva che un eroe era a un colpo dalla fine quando
// cadeva. A vita piena il token è pulito: nessuna velatura, nessuna riga.
{
  const ferito = await page.evaluate(() => {
    const t = document.querySelector('.tok-board.eroe');
    const nome = t?.getAttribute('data-eroe');
    // gli si toglie metà salute e si ridisegna, come farebbe un colpo
    const p = JSON.parse(localStorage.getItem('osr.partita.ep1'));
    return { nome, prima: t?.classList.contains('ferito'), max: p.spedizione.vite[nome] };
  });
  if (ferito.prima) fail('a vita piena il token non deve avere sangue addosso');
  const dopo = await page.evaluate(async ({ nome, max }) => {
    const { vistaDigitale } = await import('/js/digitale.js');
    const p = JSON.parse(localStorage.getItem('osr.partita.ep1'));
    p.spedizione.vite[nome] = 1;                       // in fin di vita
    document.querySelector('#app').innerHTML = '';
    await vistaDigitale(document.querySelector('#app'), p, () => {}, null);
    const t = document.querySelector(`.tok-board[data-eroe="${nome}"]`);
    return { ferito: !!t && t.classList.contains('ferito'),
             grave: !!t && t.classList.contains('grave'),
             f: t ? t.style.getPropertyValue('--f') : '',
             // TUTT'E DUE le velature: quella che tinge e quella che scurisce.
             // Col solo scurire, su un ritratto verdazzurro il rosso diventa
             // fango e sotto la riga si vede ancora l'azzurro — provato.
             velatura: !!t && !!t.querySelector('.sangue.tinge')
                       && !!t.querySelector('.sangue.cupo'), max };
  }, ferito);
  if (!dopo.ferito || !dopo.velatura) fail('un eroe ferito deve portare il sangue sul token');
  if (!(Number(dopo.f) > 0.5)) fail(`la velatura deve seguire la salute (--f ${dopo.f}, era ${dopo.max})`);
  if (!dopo.grave) fail('e sotto un terzo di salute il bordo si accende');
}

// prova un movimento: clicca una cella raggiungibile se c'e'
await clickIf('.cella-mossa');

// risolve un tiro di dado nell'overlay (una sola scena dadi)
const tira = async () => {
  if (!(await has('.dadi-overlay'))) return false;
  await clickIf('#dadi-lancia'); await page.waitForTimeout(2400);
  await clickIf('#dadi-chiudi'); await page.waitForTimeout(500);
  return true;
};
const visible = async (sel) => page.locator(sel).first().isVisible().catch(() => false);
// risolve una carta insidia (prova obbligatoria: scelta bersaglio + dadi)
const risolviInsidia = async () => {
  if (!(await visible('#ins-risolvi'))) return false;   // gia' risolta = display:none
  await clickIf('#ins-risolvi'); await page.waitForTimeout(150);
  if (await has('.scelta-btn')) await clickIf('.scelta-btn:not(.annulla)');
  for (let k = 0; k < 8; k++) {                     // uno o piu' bersagli (ogni eroe)
    if (!(await tira())) break;
    if (await has('.scelta-btn')) await clickIf('.scelta-btn:not(.annulla)');
  }
  return true;
};

// gioca parecchi round: esplora (celle reveal/mossa), chiudi eroi, passa messaggi
for (let step = 0; step < 160; step++) {
  if (await has('#al-menu')) break;                 // epilogo raggiunto
  if (await clickIf('#salta-nemici')) { await page.waitForTimeout(500); continue; }  // turno nemici animato
  if (await risolviInsidia()) continue;             // prova obbligatoria della carta insidia
  if (await clickIf('#ok-msg')) continue;           // carta minaccia / messaggio
  if (await tira()) continue;
  // preferisci esplorare: le celle dorate rivelano stanze nuove (verso T6)
  if (await clickIf('.cella-mossa.reveal')) continue;
  if (step % 2 === 0 && await clickIf('.cella-mossa')) continue;  // ogni tanto muovi
  if (await clickIf('#az-fine')) continue;          // finisci l'eroe attivo
  if (await clickIf('#fase-minaccia')) continue;    // tutti fatti
  await page.waitForTimeout(80);
}
// drena eventuali messaggi/dadi in coda per fermarsi su uno stato stabile
for (let d = 0; d < 8; d++) {
  if (await has('#al-menu')) break;
  if (await clickIf('#salta-nemici')) { await page.waitForTimeout(500); continue; }
  if (await has('.board-digitale') && !(await has('#salta-nemici'))) break;   // board fase eroi
  if (await risolviInsidia()) continue;
  if (await clickIf('#ok-msg')) continue;
  if (await tira()) continue;
  await page.waitForTimeout(120);
}

// stato finale coerente: board o epilogo, mai schermo vuoto
const finale = (await has('.board-digitale')) || (await has('#al-menu'));
if (!finale) fail('stato finale non valido (ne board ne epilogo)');
// l'epilogo e' testo lungo (c'e' anche la contro-busta): deve tornare a scorrere
if (await has('#al-menu') && await has('#app.immersivo')) fail('l’epilogo e’ immersivo (non scorre)');

// recuperabilita': ricarica e verifica che riprenda
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(150);
const ep2 = page.getByText('Il Coro Sommerso').first();
if (await ep2.count()) { await ep2.click(); await page.waitForTimeout(150); }
if (!(await has('#continua'))) fail('dopo reload: nessuna partita da continuare');

await browser.close();
console.log(errs.length ? `PROBLEMI (${errs.length}):\n` + errs.join('\n') : 'SMOKE OK: board, token, round automatici, reload recuperabile.');
process.exit(errs.length ? 1 : 0);
