// INVITARE QUALCUNO AL PROPRIO TAVOLO, dalla schermata invece che con `curl`.
//
// L'API c'era già ed era provata (test-membri.mjs); quel che mancava era il
// modo di usarla senza un terminale — cioè, per chiunque non sia chi ha scritto
// il codice, il modo di usarla. Qui si prova la catena intera nel browser vero:
// si invita, l'invito compare, l'eroe preso non si può ridare, si toglie.
//
// Uso:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:arbitro@esempio.it --port 8787
//   node webapp/test-invito.mjs          (o OSR_BASE=http://127.0.0.1:8793 …)
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const IO = 'arbitro@esempio.it';            // = OSR_DEV_EMAIL: chi apre il browser
const AMICO = 'amico@esempio.it';
const ALTRO = 'altro@esempio.it';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const ELENA = COMUNE.eroi.find((e) => e.nome.includes('ELENA')).nome;

const idT = crypto.randomUUID();
await fetch(`${BASE}/api/tavolo`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: idT, nome: 'Il tavolo degli inviti' }),
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));

// si apre la schermata di chi siede al tavolo, come ci si arriva dall'app
async function apri() {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async (id) => {
    const { vistaMembri } = await import('/js/membri.js');
    document.querySelector('#app').innerHTML = '';
    await vistaMembri(document.querySelector('#app'), id, 'Il tavolo degli inviti', () => {});
  }, idT);
  await page.waitForTimeout(500);
}
await apri();
ok(errori.length === 0, `la schermata apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);

// --- IL TAVOLO VUOTO lo dice, invece di mostrare una lista vuota
{
  const t = await page.locator('.pannello').first().innerText();
  ok(/nessuno/i.test(t), `un tavolo senza invitati lo dice (visto «${t.slice(0, 60)}…»)`);
}

// --- SI INVITA, e l'invito compare
{
  await page.fill('#nome-invito', 'Giulia');
  await page.fill('#email-invito', AMICO);
  await page.selectOption('#eroe-invito', ELENA);
  await page.click('#invita');
  await page.waitForTimeout(700);

  const t = await page.locator('.pannello').first().innerText();
  // AL TAVOLO CI SI CHIAMA PER NOME: l'email serve alla porta, non alla serata
  ok(/Giulia/.test(t), `il nome compare nell'elenco (visto «${t.slice(0, 90)}…»)`);
  ok(t.includes(AMICO), 'e l’email resta, in piccolo, per sapere chi è');
  const r0 = await (await fetch(`${BASE}/api/membri?tavolo=${idT}`)).json();
  ok((r0.membri || []).some((m) => m.email === AMICO && m.nome === 'Giulia'),
     'e il nome è finito nel database, non solo a schermo');
  ok(/elena/i.test(t), 'con l\'eroe che gli è stato dato');

  // e c'è davvero, non solo a schermo
  const r = await (await fetch(`${BASE}/api/membri?tavolo=${idT}`)).json();
  ok((r.membri || []).some((m) => m.email === AMICO && m.eroe === ELENA),
     'e il tavolo se lo ricorda');
}

// --- LO STESSO EROE NON SI DÀ DUE VOLTE
// È una regola, e la impone il database con un indice unico. La schermata la
// anticipa togliendo l'eroe dall'elenco, così non si arriva nemmeno a chiederlo.
{
  const opz = await page.locator('#eroe-invito option', { hasText: /elena/i }).first();
  ok(await opz.isDisabled(), 'l\'eroe già preso non si può più scegliere');
  const testo = await opz.innerText();
  ok(/già preso/i.test(testo), `e l'elenco dice perché (visto «${testo}»)`);
}

// --- SI PUÒ INVITARE SENZA DARE L'EROE: lo sceglierà dopo
{
  await page.fill('#nome-invito', '');
  await page.fill('#email-invito', ALTRO);
  await page.selectOption('#eroe-invito', '');
  await page.click('#invita');
  await page.waitForTimeout(700);
  const t = await page.locator('.pannello').first().innerText();
  ok(t.includes(ALTRO) && /nessun eroe/i.test(t),
     'si invita anche senza eroe, e si vede che manca');
}

// --- UN'EMAIL SBAGLIATA non passa in silenzio
{
  await page.fill('#email-invito', 'non-una-email');
  await page.click('#invita');
  await page.waitForTimeout(700);
  const t = await page.locator('.pannello').first().innerText();
  ok(/non valida|riprova/i.test(t), `l'email sbagliata lo dice (visto «${t.slice(-70)}»)`);
}

// --- SI TOGLIE
{
  page.once('dialog', (d) => d.accept());
  await page.click(`.togli-membro[data-email="${ALTRO}"]`);
  await page.waitForTimeout(300);
  // la conferma è la finestra dell'app, non quella del browser
  const si = page.locator('button', { hasText: /toglietelo/i });
  if (await si.count()) await si.first().click();
  await page.waitForTimeout(700);

  const r = await (await fetch(`${BASE}/api/membri?tavolo=${idT}`)).json();
  ok(!(r.membri || []).some((m) => m.email === ALTRO), 'chi è tolto se ne va davvero');
  ok((r.membri || []).some((m) => m.email === AMICO), 'e gli altri restano');
}

ok(errori.length === 0, `nessun errore JS in tutta la sessione: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
await fetch(`${BASE}/api/tavolo?id=${idT}`, { method: 'DELETE' });
console.log(ko === 0 ? 'test-invito: si invita dalla schermata' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
