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
const OTTONE = COMUNE.eroi.find((e) => e.nome.includes('OTTONE')).nome;
const FUORI = COMUNE.eroi.find((e) => ![ELENA, OTTONE].includes(e.nome)).nome;

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

// --- LA COMPAGNIA si sceglie una volta, e vincola tutto il resto
//
// Prima il party si sceglieva a ogni partita, e assegnare un eroe offriva tutti
// e undici quelli del Comune: dando a un giocatore un eroe fuori squadra si
// otteneva un posto muto — il motore rifiuta i suoi comandi e sul telefono non
// si accende niente, senza errore e senza spiegazione.
{
  const vuoto = await page.locator('#eroe-invito option').count();
  ok(vuoto > 2, `senza compagnia si può scegliere fra tutti gli eroi (viste ${vuoto} voci)`);

  // si compone toccando i ritratti: il tocco APRE LA SCHEDA, e si arruola da lì
  // — chi compone la compagnia decide guardando chi è, non il nome sotto la foto
  await page.click(`.eroe-tile[data-nome="${ELENA}"]`);
  ok((await page.locator('.eroe-dettaglio').count()) === 1,
     'il ritratto apre la scheda dell’eroe');
  ok((await page.locator('#arruola').count()) === 1,
     'e la scheda, qui, offre di arruolarlo');
  await page.click('#arruola');
  await page.click(`.eroe-tile[data-nome="${OTTONE}"]`);
  await page.click('#arruola');
  const conta = (await page.locator('#conta-party').innerText()).trim();
  // si contano i ritratti accesi, non la scritta: il contatore e' decorazione,
  // la selezione e' la cosa vera
  ok((await page.locator('.eroe-tile.scelto').count()) === 2,
     `due ritratti accesi dopo due tocchi (contatore: ${conta})`);
  // niente bottone: la compagnia si salva da sé appena arriva al secondo eroe
  await page.waitForTimeout(1000);

  const dopo = await page.locator('#eroe-invito option').allInnerTexts();
  ok(dopo.length === 3, `ora si scelgono solo gli eroi della compagnia (viste ${dopo.length} voci)`);
  ok(dopo.join(' ').toLowerCase().includes('elena'), 'e sono quelli scelti');

  // il vincolo non è solo a schermo: il server rifiuta un eroe fuori squadra
  const r = await fetch(`${BASE}/api/membri`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tavolo: idT, email: 'furbo@esempio.it', eroe: FUORI }),
  });
  ok(r.status === 400, `un eroe fuori compagnia è rifiutato anche dal server (visto ${r.status})`);
}

// --- IL TAVOLO VUOTO lo dice, invece di mostrare una lista vuota
{
  const t = await page.locator('#p-membri').innerText();
  ok(/nessuno/i.test(t), `un tavolo senza invitati lo dice (visto «${t.slice(0, 60)}…»)`);
}

// --- SI INVITA, e l'invito compare
{
  await page.fill('#nome-invito', 'Giulia');
  await page.fill('#email-invito', AMICO);
  await page.selectOption('#eroe-invito', ELENA);
  await page.click('#invita');
  await page.waitForTimeout(700);

  const t = await page.locator('#p-membri').innerText();
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
  const t = await page.locator('#p-membri').innerText();
  ok(t.includes(ALTRO) && /nessun eroe/i.test(t),
     'si invita anche senza eroe, e si vede che manca');
}

// --- UN'EMAIL SBAGLIATA non passa in silenzio
{
  await page.fill('#email-invito', 'non-una-email');
  await page.click('#invita');
  await page.waitForTimeout(700);
  const t = await page.locator('#p-membri').innerText();
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

// --- UNA COMPAGNIA DI UNO NON È UNA COMPAGNIA
// Le regole scalano da 2 a 10: fuori di lì non è una squadra, ed è meglio
// dirlo qui che scoprirlo a serata cominciata.
{
  const r = await fetch(`${BASE}/api/party`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tavolo: idT, party: [ELENA] }),
  });
  ok(r.status === 400, `una compagnia di un eroe solo è rifiutata (visto ${r.status})`);
}

// --- CREARE UN TAVOLO PORTA DRITTI A COMPORLO
//
// Prima si finiva sugli episodi, e per assegnare eroi e posti bisognava tornare
// indietro con «cambia tavolo»: un giro a vuoto, ogni volta. La compagnia e chi
// gioca sono le due cose che servono PRIMA di qualunque episodio.
{
  const p2 = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await p2.goto(BASE, { waitUntil: 'networkidle' });
  await p2.evaluate(async () => {
    const { vistaTavoli } = await import('/js/tavoli.js');
    document.querySelector('#app').innerHTML = '';
    await vistaTavoli(document.querySelector('#app'), () => {
      document.querySelector('#app').dataset.episodi = '1';   // dove si andava prima
    });
  });
  await p2.waitForTimeout(600);
  await p2.click('#nuovo-tavolo');
  await p2.fill('#nome-tavolo', 'Tavolo appena nato');
  await p2.click('#crea-tavolo');
  await p2.waitForTimeout(1200);

  ok(await p2.locator('.eroe-tile').count() > 0,
     'appena creato il tavolo si è già a comporre la compagnia');
  ok(await p2.locator('#email-invito').count() === 1, 'e a invitare');
  ok(!(await p2.evaluate(() => document.querySelector('#app').dataset.episodi)),
     'e NON si è passati per gli episodi');
  ok(await p2.locator('#avanti').count() === 1, 'con il bottone per proseguire quando si è pronti');

  await p2.click('#avanti');
  await p2.waitForTimeout(400);
  ok(await p2.evaluate(() => document.querySelector('#app').dataset.episodi) === '1',
     'e quel bottone porta agli episodi');
  await p2.close();
}

// --- LA COMPAGNIA SI SCEGLIE UNA VOLTA: l'episodio non la richiede
//
// Con la compagnia sul tavolo, aprire un episodio portava di nuovo alla
// schermata d'arruolamento — la stessa scelta, già fatta, da riconfermare. La
// seconda volta sembra che la prima non sia servita.
{
  const idC = crypto.randomUUID();
  await fetch(`${BASE}/api/tavolo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: idC, nome: 'Tavolo con compagnia' }),
  });
  await fetch(`${BASE}/api/party`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tavolo: idC, party: [ELENA, OTTONE] }),
  });

  const p3 = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await p3.goto(BASE, { waitUntil: 'networkidle' });
  // `osr.tavolo` contiene l'id NUDO, non un JSON; il nome sta a parte
  await p3.evaluate((id) => {
    localStorage.setItem('osr.tavolo', id);
    localStorage.setItem('osr.tavolo.nome', 'Tavolo con compagnia');
  }, idC);
  await p3.reload({ waitUntil: 'networkidle' });
  await p3.waitForTimeout(800);
  await p3.locator('.tessera-episodio').first().click();
  await p3.waitForTimeout(600);
  const av = p3.locator('#avanti');
  if (await av.count()) { await av.click(); await p3.waitForTimeout(2000); }

  ok(await p3.locator('.griglia-arruolo').count() === 0,
     'col tavolo che ha già la compagnia, l’episodio non richiede gli eroi');
  await p3.close();
  await fetch(`${BASE}/api/tavolo?id=${idC}`, { method: 'DELETE' });
}

ok(errori.length === 0, `nessun errore JS in tutta la sessione: ${errori.slice(0, 2).join(' | ')}`);
await browser.close();
await fetch(`${BASE}/api/tavolo?id=${idT}`, { method: 'DELETE' });
console.log(ko === 0 ? 'test-invito: si invita dalla schermata' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
