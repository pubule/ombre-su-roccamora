// LA RUBRICA E LA PORTA.
//
// Le persone si scrivono una volta sola, e creandole si apre anche la porta —
// il criterio di Cloudflare Access, che era l'unico passaggio rimasto fuori
// dall'app e quindi l'unico che si dimenticava: posto pronto al tavolo, porta
// chiusa, e l'invitato che digita la sua email e non riceve nessun codice.
//
// Qui non si chiama Cloudflare: si chiama uno STUB (`test-porta-stub.mjs`), e
// si guarda COSA il Worker gli manda. È l'unico modo di prendere il difetto
// vero — un PUT che riscrive l'`include` da zero cancella le regole scritte
// dalla dashboard, e chi le aveva messe se ne accorge il giorno in cui qualcuno
// non entra più.
//
// Uso (la porta collegata):
//   ./deploy/build-dist.sh && ./deploy/applica-schema.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:portiere@esempio.it \
//     --var CF_API_BASE:http://127.0.0.1:8791 --var CF_ACCOUNT_ID:prova \
//     --var ACCESS_POLICY_ID:prova --var PORTIERI:portiere@esempio.it,capo@esempio.it \
//     --var CF_API_TOKEN:finto --port 8787
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:altro@esempio.it \
//     --var CF_API_BASE:http://127.0.0.1:8791 --var CF_ACCOUNT_ID:prova \
//     --var ACCESS_POLICY_ID:prova --var PORTIERI:portiere@esempio.it,capo@esempio.it \
//     --var CF_API_TOKEN:finto --port 8788
//   node webapp/test-rubrica.mjs
//
// Il secondo serve perché la schermata di chi NON tiene le chiavi si guarda da
// una pagina aperta con la SUA email, e l'email la stabilisce il server: da un
// processo solo si proverebbe sempre lo stesso posto.
//
// E una seconda volta SENZA `--var CF_API_TOKEN` (né PORTIERI): il banco se ne
// accorge da solo e prova l'altra metà — che senza token non parta niente.
import { chromium } from 'playwright';
import { alzaStub } from './test-porta-stub.mjs';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
const BASE_ALTRO = process.env.OSR_ALTRO_BASE || 'http://127.0.0.1:8788';
const PORTIERE = 'portiere@esempio.it';      // = OSR_DEV_EMAIL, e = PORTIERI
const ALTRO = 'altro@esempio.it';            // ha un account, non ha le chiavi

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const chiama = (chi, metodo, percorso, corpo) => fetch(BASE + percorso, {
  method: metodo,
  headers: { 'X-Osr-Dev-Email': chi, ...(corpo ? { 'Content-Type': 'application/json' } : {}) },
  body: corpo ? JSON.stringify(corpo) : undefined,
});
const json = async (r) => ({ stato: r.status, corpo: await r.json().catch(() => ({})) });

const stub = await alzaStub(8791);
const GIULIA = `giulia-${Date.now()}@esempio.it`;
const CARLO = `carlo-${Date.now()}@esempio.it`;

// la porta è collegata? lo dice il Worker, e da lì dipende cosa si prova
const primo = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
const collegata = !!primo.corpo.configurata;

if (!collegata) {
  // --- LA PORTA SPENTA: si gioca come prima, e non parte niente
  const r = await json(await chiama(PORTIERE, 'POST', '/api/rubrica',
    { email: GIULIA, nome: 'Giulia' }));
  ok(r.stato === 200, `senza token la persona si scrive lo stesso (visto ${r.stato})`);
  ok(r.corpo.porta === 'spenta', `e lo dice: porta «${r.corpo.porta}»`);
  ok(stub.stato.chiamate.length === 0,
     `e non parte nessuna chiamata (viste ${stub.stato.chiamate.length})`);
  const el = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
  ok((el.corpo.persone || []).some((x) => x.email === GIULIA), 'e la persona c\'è');
  ok((el.corpo.persone || []).every((x) => x.porta === null),
     'nessun semaforo acceso: uno spento confonde più di nessuno');
  ok(el.corpo.configurata === false, 'e la schermata sa che la porta non è collegata');

  // ...MA LA SCHERMATA DEVE DIRLO. Chi non tiene le chiavi scrive una persona,
  // legge «è in rubrica», la invita — e quella non riceve mai il codice: è il
  // difetto per cui la rubrica esiste, solo spostato di una schermata.
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const { vistaRubrica } = await import('/js/rubrica.js');
    document.querySelector('#app').innerHTML = '';
    await vistaRubrica(document.querySelector('#app'), () => {});
  });
  await page.waitForTimeout(900);
  ok(await page.locator('#non-portiere').count() === 1,
     'chi non tiene le chiavi legge che la porta non la apre lui');
  ok(await page.locator('.apri-porta').count() === 0
     && await page.locator('#apri-tutte').count() === 0,
     'e non trova bottoni della porta, che non potrebbero riuscire');
  await browser.close();

  await chiama(PORTIERE, 'DELETE', `/api/rubrica?email=${encodeURIComponent(GIULIA)}`);
  await stub.chiudi();
  console.log(ko === 0 ? 'test-rubrica (porta spenta): niente parte, e si gioca come prima'
    : `${ko} FAIL`);
  process.exit(ko ? 1 : 0);
}

// --- 1. CREARE UNA PERSONA APRE LA PORTA
{
  stub.azzera();
  const r = await json(await chiama(PORTIERE, 'POST', '/api/rubrica',
    { email: GIULIA, nome: 'Giulia' }));
  ok(r.stato === 200 && r.corpo.porta === 'aperta',
     `creando la persona la porta si apre (${r.stato}, «${r.corpo.porta}»)`);
  ok(stub.scritture().length === 1,
     `e parte UNA scrittura verso Access (viste ${stub.scritture().length})`);
  ok(stub.emails().includes(GIULIA), 'e l\'indirizzo è nel criterio');
  const mandato = stub.scritture()[0].corpo;
  // IL DIFETTO DA PRENDERE: riscrivere l'elenco da zero. Le voci che non sono
  // email — un «emails ending in» messo dalla dashboard — devono sopravvivere.
  ok((mandato.include || []).some((v) => v.email_domain),
     'il criterio conserva le voci che non sono email');
  ok((mandato.include || []).some((v) => v.email && v.email.email === 'arbitro@esempio.it'),
     'e conserva gli indirizzi che c\'erano');
  ok(mandato.session_duration === '730h',
     `e la durata della sessione (vista ${mandato.session_duration})`);
  ok(stub.scritture()[0].autorizzazione === 'Bearer finto',
     'la chiamata porta il token, o Access la rifiuterebbe');
}

// --- 2. DUE VOLTE LA STESSA: non si riscrive niente
{
  stub.azzera();
  const r = await json(await chiama(PORTIERE, 'POST', '/api/rubrica',
    { email: GIULIA, nome: 'Giulia' }));
  ok(r.corpo.porta === 'gia', `la seconda volta la porta era già aperta («${r.corpo.porta}»)`);
  ok(stub.scritture().length === 0,
     `e non si riscrive il criterio (viste ${stub.scritture().length} scritture)`);
}

// --- 3. SE ACCESS NON RISPONDE, la persona resta scritta
{
  stub.azzera();
  stub.stato.rompi = 500;
  const r = await json(await chiama(PORTIERE, 'POST', '/api/rubrica',
    { email: CARLO, nome: 'Carlo' }));
  ok(r.stato === 200 && r.corpo.porta === 'errore',
     `la porta fallisce e lo dice (${r.stato}, «${r.corpo.porta}»)`);
  stub.stato.rompi = 0;
  const el = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
  ok((el.corpo.persone || []).some((x) => x.email === CARLO),
     'ma la persona è in rubrica lo stesso: il nome è il dato vero, la porta una comodità');
  ok((el.corpo.persone || []).find((x) => x.email === CARLO).porta === 'fuori',
     'e la rubrica dice che la sua porta è chiusa');
}

// --- 4. IL RIMEDIO: «apri la porta» a chi era rimasto fuori
{
  stub.azzera();
  const r = await json(await chiama(PORTIERE, 'POST', '/api/porta', { email: CARLO }));
  ok(r.stato === 200 && r.corpo.porta === 'aperta', `il rimedio apre (${r.stato}, «${r.corpo.porta}»)`);
  ok(stub.emails().includes(CARLO), 'e adesso l\'indirizzo è nel criterio');
}

// --- 5. LE CHIAVI SONO DI CHI LE HA
{
  stub.azzera();
  const r = await json(await chiama(ALTRO, 'POST', '/api/rubrica',
    { email: 'estraneo@esempio.it', nome: 'Estraneo' }));
  ok(r.stato === 200 && r.corpo.porta === 'spenta',
     `chi non è portiere scrive in rubrica ma non apre («${r.corpo.porta}»)`);
  ok(stub.scritture().length === 0,
     `e dal suo account non parte niente (viste ${stub.scritture().length})`);
  const p = await json(await chiama(ALTRO, 'POST', '/api/porta', { email: 'estraneo@esempio.it' }));
  ok(p.stato === 403, `e il rimedio gli è rifiutato (visto ${p.stato})`);
  await chiama(ALTRO, 'DELETE', '/api/rubrica?email=estraneo@esempio.it');
}

// --- 6. NON SI APRE A UN INDIRIZZO QUALUNQUE
// È il vincolo che tiene: dall'app la porta si apre solo a chi hai in rubrica.
{
  stub.azzera();
  const r = await json(await chiama(PORTIERE, 'POST', '/api/porta',
    { email: 'passante@esempio.it' }));
  ok(r.stato === 404, `un indirizzo fuori dalla propria rubrica è rifiutato (visto ${r.stato})`);
  ok(stub.scritture().length === 0, 'e non parte nessuna scrittura');
  ok(!stub.emails().includes('passante@esempio.it'), 'e non entra nel criterio');
}

// --- 7. LA RUBRICA È DI CHI LA TIENE
{
  const mia = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
  const sua = await json(await chiama(ALTRO, 'GET', '/api/rubrica'));
  ok((mia.corpo.persone || []).some((x) => x.email === GIULIA), 'le mie persone le vedo io');
  ok(!(sua.corpo.persone || []).some((x) => x.email === GIULIA),
     'e un altro account non le vede: sarebbe un elenco di indirizzi altrui');
  ok(sua.corpo.portiere === false, 'e a lui la porta non risulta nemmeno sua');
}

// --- 8. SI APRE DA SOLA, SI CHIUDE A MANO
{
  stub.azzera();
  await chiama(PORTIERE, 'DELETE', `/api/rubrica?email=${encodeURIComponent(CARLO)}`);
  const el = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
  ok(!(el.corpo.persone || []).some((x) => x.email === CARLO), 'togliere dalla rubrica toglie');
  ok(stub.scritture().length === 0,
     'ma non chiude la porta: un tocco sbagliato non lascia fuori qualcuno a metà campagna');
  ok((el.corpo.estranei || []).includes(CARLO),
     'e chi resta nel criterio senza rubrica si vede, in fondo');
}

// --- 9. IL TAVOLO PESCA DALLA RUBRICA
const idT = crypto.randomUUID();
await chiama(PORTIERE, 'POST', '/api/tavolo', { id: idT, nome: 'Il tavolo di prova' });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errori = [];
page.on('pageerror', (e) => errori.push(e.message));

{
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async ({ id }) => {
    const { vistaMembri } = await import('/js/membri.js');
    document.querySelector('#app').innerHTML = '';
    await vistaMembri(document.querySelector('#app'), id, 'Il tavolo di prova', () => {});
  }, { id: idT });
  await page.waitForTimeout(900);
  ok(errori.length === 0, `la schermata apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);

  const riga = page.locator(`.dai-posto[data-email="${GIULIA}"]`);
  ok(await riga.count() === 1, 'chi è in rubrica si offre al tavolo, senza riscrivere niente');
  await riga.click();
  await page.waitForTimeout(900);
  const m = await json(await chiama(PORTIERE, 'GET', `/api/membri?tavolo=${idT}`));
  const dato = (m.corpo.membri || []).find((x) => x.email === GIULIA);
  ok(!!dato, 'un tocco dà il posto');
  ok(dato && dato.nome === 'Giulia', `col nome che aveva in rubrica (visto ${dato && dato.nome})`);
  ok(await page.locator(`.dai-posto[data-email="${GIULIA}"]`).count() === 0,
     'e sparisce dall\'elenco: offrirla ancora sarebbe un bottone che il server rifiuta');
}

// --- 10. TOGLIERE DAL TAVOLO non tocca la porta
{
  stub.azzera();
  await chiama(PORTIERE, 'DELETE',
    `/api/membri?tavolo=${idT}&email=${encodeURIComponent(GIULIA)}`);
  ok(stub.scritture().length === 0, 'togliere un posto non chiude nessuna porta');
}

// --- 11. LA SCHERMATA DELLA RUBRICA
{
  // una persona che il criterio non ammette: il bottone del rimedio dev'esserci
  await chiama(PORTIERE, 'POST', '/api/rubrica', { email: CARLO, nome: 'Carlo' });
  stub.stato.criterio.include = stub.stato.criterio.include
    .filter((v) => !(v.email && v.email.email === CARLO));

  await page.evaluate(async () => {
    const { vistaRubrica } = await import('/js/rubrica.js');
    document.querySelector('#app').innerHTML = '';
    await vistaRubrica(document.querySelector('#app'), () => {});
  });
  await page.waitForTimeout(900);
  ok(errori.length === 0, `la rubrica apre senza errori JS: ${errori.slice(0, 2).join(' | ')}`);
  const testo = await page.locator('.pannello').first().innerText();
  ok(testo.includes('Giulia'), 'la rubrica elenca le persone');
  ok(/la porta è chiusa/i.test(testo), 'e dice chi non può ancora entrare');
  ok(await page.locator(`.apri-porta[data-email="${CARLO}"]`).count() === 1,
     'con il bottone per rimediare, dove serve');
  ok(await page.locator(`.apri-porta[data-email="${GIULIA}"]`).count() === 0,
     'e non dove non serve');

  await page.locator(`.apri-porta[data-email="${CARLO}"]`).click();
  await page.waitForTimeout(900);
  ok(stub.emails().includes(CARLO), 'premendolo, la porta si apre davvero');
  ok(await page.locator(`.apri-porta[data-email="${CARLO}"]`).count() === 0,
     'e il bottone sparisce, perché non c\'è più niente da rimediare');
}

// --- 12. LE PERSONE DEGLI ALTRI
//
// La rubrica è per account: se un altro arbitra un tavolo suo e ci invita due
// persone, quelle stanno nella SUA rubrica. Senza vederle, chi tiene le chiavi
// dovrebbe tornare sulla dashboard di Cloudflare per farle entrare — cioè il
// passaggio che la rubrica doveva togliere, riapparso un metro più in là.
const SUA = `sara-${Date.now()}@esempio.it`;
{
  stub.azzera();
  await chiama(ALTRO, 'POST', '/api/rubrica', { email: SUA, nome: 'Sara' });
  ok(stub.scritture().length === 0, 'chi non è portiere non apre niente scrivendola');

  const mia = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
  const gruppo = (mia.corpo.altrui || []).find((g) => g.proprietario === ALTRO);
  ok(!!gruppo, 'chi tiene le chiavi vede la rubrica dell\'altro arbitro');
  const sara = gruppo && gruppo.persone.find((x) => x.email === SUA);
  ok(!!sara, 'con dentro la persona che ha scritto');
  ok(sara && sara.nome === 'Sara' && sara.porta === 'fuori',
     `col suo nome e la porta chiusa (${sara && sara.nome}, ${sara && sara.porta})`);
  ok(!(mia.corpo.persone || []).some((x) => x.email === SUA),
     'e non mescolata alle proprie: la rubrica resta di chi la tiene');

  const sua = await json(await chiama(ALTRO, 'GET', '/api/rubrica'));
  ok(sua.corpo.altrui === undefined,
     'chi non tiene le chiavi non legge la rubrica di nessun altro');
}

// --- 13. E LA PORTA SI APRE ANCHE A LORO
{
  stub.azzera();
  const r = await json(await chiama(PORTIERE, 'POST', '/api/porta', { email: SUA }));
  ok(r.stato === 200 && r.corpo.porta === 'aperta',
     `il portiere apre a una persona di un altro (${r.stato}, «${r.corpo.porta}»)`);
  ok(stub.emails().includes(SUA), 'e l\'indirizzo entra nel criterio');

  // IL DIFETTO DEL CONFRONTO SU UNA RUBRICA SOLA: appena aperta, quella persona
  // risulterebbe «estranea» — un elenco che si riempie da solo di gente giusta.
  const dopo = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
  ok(!(dopo.corpo.estranei || []).includes(SUA),
     'e non finisce fra gli estranei: sta in una rubrica, solo non nella mia');
}

// --- 14. LA SCHERMATA: si aprono da lì, e non si riordina la roba altrui
{
  await page.evaluate(async () => {
    const { vistaRubrica } = await import('/js/rubrica.js');
    document.querySelector('#app').innerHTML = '';
    await vistaRubrica(document.querySelector('#app'), () => {});
  });
  await page.waitForTimeout(900);
  ok(await page.locator('#rubriche-altrui').count() === 1,
     'la schermata ha il pannello delle rubriche altrui');
  const testo = await page.locator('#rubriche-altrui').innerText();
  ok(testo.includes(ALTRO), 'che dice di chi è ogni elenco');
  ok(testo.includes('Sara'), 'e ci mette dentro le sue persone');
  ok(await page.locator(`#rubriche-altrui .togli-persona`).count() === 0,
     'senza «togli»: il portiere apre porte, non riordina elenchi altrui');

  // una sua persona ancora chiusa, e il bottone che la apre
  const ALTRA = `luca-${Date.now()}@esempio.it`;
  await chiama(ALTRO, 'POST', '/api/rubrica', { email: ALTRA, nome: 'Luca' });
  await page.evaluate(async () => {
    const { vistaRubrica } = await import('/js/rubrica.js');
    document.querySelector('#app').innerHTML = '';
    await vistaRubrica(document.querySelector('#app'), () => {});
  });
  await page.waitForTimeout(900);
  ok(await page.locator(`#rubriche-altrui .apri-porta[data-email="${ALTRA}"]`).count() === 1,
     'col bottone dove la porta è chiusa');
  await page.locator(`#rubriche-altrui .apri-porta[data-email="${ALTRA}"]`).click();
  await page.waitForTimeout(1000);
  ok(stub.emails().includes(ALTRA), 'premendolo la porta si apre davvero');
  ok(await page.locator(`.apri-porta[data-email="${ALTRA}"]`).count() === 0,
     'e il bottone sparisce, perché non c\'è più niente da rimediare');
  await chiama(ALTRO, 'DELETE', `/api/rubrica?email=${encodeURIComponent(ALTRA)}`);
}

// --- 15. LA PORTA SI CHIUDE ANCHE, e da qui
//
// «Si apre da sola, si chiude a mano» valeva finché la mano doveva andare sulla
// dashboard. Adesso il giro si finisce dall'app: le proprie persone, quelle
// della rubrica di un altro, e gli indirizzi rimasti nel criterio senza
// rubrica.
const CAPO = 'capo@esempio.it';          // secondo portiere: si prova che non lo si chiude fuori
{
  // una persona propria, dentro
  stub.azzera();
  await chiama(PORTIERE, 'POST', '/api/rubrica', { email: GIULIA, nome: 'Giulia' });
  const r = await json(await chiama(PORTIERE, 'DELETE',
    `/api/porta?email=${encodeURIComponent(GIULIA)}`));
  ok(r.stato === 200 && r.corpo.porta === 'chiusa',
     `la porta si chiude (${r.stato}, «${r.corpo.porta}»)`);
  ok(!stub.emails().includes(GIULIA), 'e l\'indirizzo esce dal criterio');
  const mandato = stub.scritture()[0].corpo;
  ok((mandato.include || []).some((v) => v.email_domain),
     'chiudendo si conservano le voci che non sono email');
  ok((mandato.include || []).some((v) => v.email && v.email.email === 'arbitro@esempio.it'),
     'e gli altri indirizzi restano dove sono');

  // e la persona resta in rubrica: chiudere la porta non è cacciare nessuno
  const el = await json(await chiama(PORTIERE, 'GET', '/api/rubrica'));
  const sua = (el.corpo.persone || []).find((x) => x.email === GIULIA);
  ok(sua && sua.porta === 'fuori', 'la persona resta in rubrica, con la porta chiusa');

  // due volte: la seconda non riscrive niente
  stub.azzera();
  const due = await json(await chiama(PORTIERE, 'DELETE',
    `/api/porta?email=${encodeURIComponent(GIULIA)}`));
  ok(due.corpo.porta === 'gia', `chiudere una porta già chiusa non fa niente («${due.corpo.porta}»)`);
  ok(stub.scritture().length === 0, 'e non tocca il criterio');
  await chiama(PORTIERE, 'POST', '/api/porta', { email: GIULIA });   // si rimette com'era
}

// --- 16. ANCHE QUELLE DEGLI ALTRI, e quelle di nessuno
{
  stub.azzera();
  const ESTRANEO = `passato-${Date.now()}@esempio.it`;
  stub.stato.criterio.include.push({ email: { email: ESTRANEO } });

  const r = await json(await chiama(PORTIERE, 'DELETE',
    `/api/porta?email=${encodeURIComponent(SUA)}`));
  ok(r.corpo.porta === 'chiusa', `si chiude a una persona di un altro («${r.corpo.porta}»)`);
  ok(!stub.emails().includes(SUA), 'e quell\'indirizzo esce dal criterio');

  const e = await json(await chiama(PORTIERE, 'DELETE',
    `/api/porta?email=${encodeURIComponent(ESTRANEO)}`));
  ok(e.corpo.porta === 'chiusa',
     `e a un indirizzo che non sta in nessuna rubrica («${e.corpo.porta}»)`);
  ok(!stub.emails().includes(ESTRANEO), 'che è l\'unico modo di finire il giro senza dashboard');
  await chiama(PORTIERE, 'POST', '/api/porta', { email: SUA });
}

// --- 17. MA NON A SE STESSI, NÉ A UN ALTRO PORTIERE
//
// Chi si chiude fuori da solo non se ne accorge: la sessione dura un mese, e il
// muro arriva il giorno in cui ricarica — senza più un modo di rientrare.
{
  stub.azzera();
  stub.stato.criterio.include.push({ email: { email: PORTIERE } });
  stub.stato.criterio.include.push({ email: { email: CAPO } });

  const io2 = await json(await chiama(PORTIERE, 'DELETE',
    `/api/porta?email=${encodeURIComponent(PORTIERE)}`));
  ok(io2.stato === 403, `non ci si chiude fuori da soli (visto ${io2.stato})`);
  const altro2 = await json(await chiama(PORTIERE, 'DELETE',
    `/api/porta?email=${encodeURIComponent(CAPO)}`));
  ok(altro2.stato === 403, `né si chiude fuori un altro portiere (visto ${altro2.stato})`);
  ok(stub.scritture().length === 0, 'e non parte nessuna scrittura');
  ok(stub.emails().includes(PORTIERE) && stub.emails().includes(CAPO),
     'i due restano nel criterio');

  // e chi non tiene le chiavi non chiude niente
  const nessuno = await json(await chiama(ALTRO, 'DELETE',
    `/api/porta?email=${encodeURIComponent(GIULIA)}`));
  ok(nessuno.stato === 403, `chi non è portiere non chiude (visto ${nessuno.stato})`);
}

// --- 18. IL BOTTONE, dove serve
{
  await page.evaluate(async () => {
    const { vistaRubrica } = await import('/js/rubrica.js');
    document.querySelector('#app').innerHTML = '';
    await vistaRubrica(document.querySelector('#app'), () => {});
  });
  await page.waitForTimeout(900);
  ok(await page.locator(`.chiudi-porta[data-email="${GIULIA}"]`).count() === 1,
     'sulle proprie persone aperte c\'è «chiudi la porta»');
  ok(await page.locator(`#rubriche-altrui .chiudi-porta[data-email="${SUA}"]`).count() === 1,
     'e anche su quelle degli altri');
  ok(await page.locator(`.apri-porta[data-email="${GIULIA}"]`).count() === 0,
     'e non c\'è «apri» dove la porta è già aperta');

  page.once('dialog', (d) => d.accept());
  await page.locator(`.chiudi-porta[data-email="${GIULIA}"]`).click();
  await page.waitForTimeout(300);
  const si = page.locator('button', { hasText: /chiudete la porta/i });
  ok(await si.count() === 1, 'si chiede conferma prima: è l\'unico gesto che toglie qualcosa');
  await si.first().click();
  await page.waitForTimeout(1000);
  ok(!stub.emails().includes(GIULIA), 'e premendo la porta si chiude davvero');
  ok(await page.locator(`.apri-porta[data-email="${GIULIA}"]`).count() === 1,
     'e al suo posto torna «apri la porta»');
}

// --- 19. CHI NON TIENE LE CHIAVI LEGGE IL SEMAFORO, E NON LO TOCCA
//
// Serve a chi invita: sapere se la persona che sta per mettere al tavolo entrerà
// o troverà un muro è l'informazione per cui la rubrica esiste. I comandi no —
// un bottone che il server rifiuta è peggio che nessun bottone.
{
  // la sua persona, con la porta aperta da chi tiene le chiavi
  await chiama(ALTRO, 'POST', '/api/rubrica', { email: SUA, nome: 'Sara' });
  await chiama(PORTIERE, 'POST', '/api/porta', { email: SUA });
  const chiusa = `chiusa-${Date.now()}@esempio.it`;
  await chiama(ALTRO, 'POST', '/api/rubrica', { email: chiusa, nome: 'Nina' });

  const suo = await json(await chiama(ALTRO, 'GET', '/api/rubrica'));
  const vedi = (e) => (suo.corpo.persone || []).find((x) => x.email === e);
  ok(vedi(SUA) && vedi(SUA).porta === 'dentro',
     `vede aperta quella aperta (${vedi(SUA) && vedi(SUA).porta})`);
  ok(vedi(chiusa) && vedi(chiusa).porta === 'fuori',
     `e chiusa quella chiusa (${vedi(chiusa) && vedi(chiusa).porta})`);
  ok(suo.corpo.portiere === false, 'restando uno che non tiene le chiavi');
  ok((suo.corpo.estranei || []).length === 0,
     'e gli indirizzi senza rubrica restano roba di chi le tiene');

  // la SCHERMATA, aperta con la sua email: semafori sì, bottoni no
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({ viewport: { width: 420, height: 900 } });
  const rotture = [];
  p2.on('pageerror', (e) => rotture.push(e.message));
  await p2.goto(BASE_ALTRO, { waitUntil: 'networkidle' });
  await p2.evaluate(async () => {
    const { vistaRubrica } = await import('/js/rubrica.js');
    document.querySelector('#app').innerHTML = '';
    await vistaRubrica(document.querySelector('#app'), () => {});
  });
  await p2.waitForTimeout(900);
  ok(rotture.length === 0, `la sua schermata apre senza errori JS: ${rotture.slice(0, 2).join(' | ')}`);
  const testo2 = await p2.locator('.pannello').first().innerText();
  ok(/può entrare/i.test(testo2) && /la porta è chiusa/i.test(testo2),
     'la sua schermata mostra chi entra e chi no');
  ok(await p2.locator('.apri-porta').count() === 0
     && await p2.locator('.chiudi-porta').count() === 0
     && await p2.locator('#apri-tutte').count() === 0,
     'e nessun comando della porta: quelli sono di chi tiene le chiavi');
  ok(await p2.locator('#non-portiere').count() === 1,
     'con scritto perché non li ha');
  ok(await p2.locator('#rubriche-altrui').count() === 0,
     'e senza le rubriche degli altri');
  await b2.close();

  // e il server dice di no comunque, che il bottone assente non è una regola
  const a = await json(await chiama(ALTRO, 'POST', '/api/porta', { email: chiusa }));
  const c = await json(await chiama(ALTRO, 'DELETE',
    `/api/porta?email=${encodeURIComponent(SUA)}`));
  ok(a.stato === 403 && c.stato === 403,
     `e il server rifiuta comunque aprire e chiudere (${a.stato}, ${c.stato})`);
  await chiama(ALTRO, 'DELETE', `/api/rubrica?email=${encodeURIComponent(chiusa)}`);
}

await browser.close();
await chiama(PORTIERE, 'DELETE', `/api/tavolo?id=${idT}`);
for (const x of [GIULIA, CARLO]) {
  await chiama(PORTIERE, 'DELETE', `/api/rubrica?email=${encodeURIComponent(x)}`);
}
await chiama(ALTRO, 'DELETE', `/api/rubrica?email=${encodeURIComponent(SUA)}`);
await stub.chiudi();

console.log(ko === 0
  ? 'test-rubrica: le persone si scrivono una volta, e la porta si apre con loro'
  : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
