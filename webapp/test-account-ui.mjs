// Tavoli, offline e divergenza, contro `wrangler dev` (D1 locale vero).
// Uso, in tre terminali:
//   ./deploy/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
//   node webapp/test-account-ui.mjs
import { chromium } from 'playwright';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8787';
let ko = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };

const browser = await chromium.launch();
const nuovaScheda = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });
  p.on('pageerror', (e) => { console.log('   !! pageerror:', e.message); ko++; });
  return p;
};

// --- 1. si parte dai tavoli, non dagli episodi
const p1 = await nuovaScheda();
await p1.goto(BASE, { waitUntil: 'networkidle' });
await p1.waitForTimeout(400);
ok(await p1.getByText(/nuovo tavolo/i).count() > 0, "la prima schermata e' quella dei tavoli");
ok(await p1.getByText('Il Coro Sommerso').count() === 0, 'gli episodi non si vedono prima di avere un tavolo');

// --- 2. creato il tavolo, si arriva a COMPORLO
// La compagnia e chi gioca sono le due cose che servono prima di qualunque
// episodio: mandare agli episodi e poi far tornare indietro con «cambia tavolo»
// era un giro a vuoto, ogni volta.
await p1.getByText(/nuovo tavolo/i).first().click();
await p1.fill('#nome-tavolo', 'Gruppo del giovedì');
await p1.click('#crea-tavolo');
await p1.waitForTimeout(1000);
ok(await p1.locator('.eroe-tile').count() > 0, 'dopo il tavolo si compone la compagnia');
ok(await p1.locator('#email-invito').count() === 1, 'e si invita');

ok(await p1.locator('#eroe-invito').count() === 0,
  'non si assegna un eroe a chi si invita: se lo sceglie ognuno per conto suo');

// UN TAVOLO SI SALVA COMPLETO: senza compagnia e senza invitati «salva il
// tavolo» resta spento, e dice cosa manca
const idTavolo = await p1.evaluate(() => localStorage.getItem('osr.tavolo'));
ok(await p1.locator('#avanti').isDisabled(), 'senza compagnia e senza invitati non si salva');
ok(/compagnia/.test(await p1.locator('#manca-tavolo').innerText())
   && /invitata/.test(await p1.locator('#manca-tavolo').innerText()), 'e si dice cosa manca');

// la compagnia: si salva col tocco sui ritratti, qui via API (la scheda e' un modale)
await p1.evaluate(async (t) => {
  await fetch('/api/party', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tavolo: t, party: ['NINO GRIMALDELLO CAUTO', 'CARLA DOSTI'] }) });
}, idTavolo);
await p1.fill('#nome-invito', 'Ospite');
await p1.fill('#email-invito', 'ospite-uno@esempio.it');
await p1.click('#invita');
await p1.waitForTimeout(900);
ok(await p1.locator('#avanti').isEnabled(), 'con la compagnia e un invitato si salva');

// salvato il tavolo, il CREATORE sceglie il suo eroe come tutti: finche' non lo
// fa vede solo quello, e gli episodi non ci sono
await p1.click('#avanti');
await p1.waitForTimeout(900);
ok(await p1.locator('.griglia-arruolo .eroe-tile').count() === 2,
  'il creatore vede la scelta del proprio eroe');
ok(await p1.getByText('Il Coro Sommerso').count() === 0 && await p1.locator('#entra').count() === 0,
  'e gli episodi ancora no');
await p1.evaluate(async (t) => {
  await fetch('/api/mio-eroe', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tavolo: t, eroi: ['NINO GRIMALDELLO CAUTO'] }) });
}, idTavolo);
await p1.reload({ waitUntil: 'networkidle' });
await p1.waitForTimeout(900);
ok(await p1.getByText('Il Coro Sommerso').count() > 0, 'preso l\'eroe, si arriva agli episodi');
ok(!!idTavolo, 'il tavolo scelto resta sul dispositivo');

// --- 3. una partita giocata qui arriva al server
await p1.evaluate(async () => {
  const { salva } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep1', modo: 'tavolo', party: ['NINO GRIMALDELLO CAUTO'],
          fase: 'indagine', indagine: { ora: 21, chiusa: false }, spedizione: { round: 3 } });
});
await p1.waitForTimeout(4000);                      // la coda si svuota ogni 3s
const stato = await (await fetch(BASE + '/api/stato')).json();
ok(stato.salvataggi.some((s) => s.episodio === 'ep1' && s.tavolo === idTavolo),
  'il salvataggio e\' arrivato al server');

// --- 4. senza rete si gioca lo stesso, e al ritorno la coda si svuota
await p1.context().setOffline(true);
await p1.evaluate(async () => {
  const { salva } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep2', modo: 'tavolo', party: ['NINO GRIMALDELLO CAUTO'],
          fase: 'indagine', indagine: { ora: 19, chiusa: false }, spedizione: { round: 0 } });
});
await p1.waitForTimeout(4000);
ok(await p1.evaluate(() => (localStorage.getItem('osr.dasincronizzare') || '').includes('ep2')),
  'senza rete il salvataggio resta in coda');
ok(await p1.evaluate(() => !!localStorage.getItem(`osr.partita.${localStorage.getItem('osr.tavolo')}.ep2`)),
  'senza rete la partita si salva comunque sul dispositivo');
await p1.context().setOffline(false);
await p1.waitForTimeout(5000);
const stato2 = await (await fetch(BASE + '/api/stato')).json();
ok(stato2.salvataggi.some((s) => s.episodio === 'ep2'), 'tornata la rete, il salvataggio arriva al server');
// e la coda si svuota davvero: una coda che non si svuota rispedisce tutto per
// sempre, e con sendBeacon rimanda stato vecchio a ogni passaggio in secondo piano
ok(await p1.evaluate(() => JSON.parse(localStorage.getItem('osr.dasincronizzare') || '[]').length === 0),
  'dopo la spedizione la coda resta vuota');

// --- 5. due tavoli sullo stesso episodio non si incrociano
await p1.evaluate(async () => {
  const r = await fetch('/api/tavolo', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: crypto.randomUUID(), nome: 'Gruppo del sabato' }),
  });
  const { id } = await r.json();
  localStorage.setItem('osr.tavolo', id);
});
await p1.evaluate(async () => {
  const { salva, carica } = await import('/js/store.js');
  salva({ v: 1, episodio: 'ep1', modo: 'tavolo', party: ['CARLA DOSTI'], fase: 'indagine',
          indagine: { ora: 24, chiusa: false }, spedizione: { round: 0 } });
});
const partitaGiovedi = await p1.evaluate((t) =>
  JSON.parse(localStorage.getItem(`osr.partita.${t}.ep1`)), idTavolo);
ok(partitaGiovedi.indagine.ora === 21 && partitaGiovedi.spedizione.round === 3,
  'il secondo gruppo non ha toccato la partita del primo');

// --- 6. divergenza: l'app chiede, non sovrascrive
const p2 = await nuovaScheda();
await p2.goto(BASE, { waitUntil: 'networkidle' });
await p2.evaluate((t) => {
  localStorage.setItem('osr.tavolo', t);
  // stessa partita, andata avanti QUI dopo l'ultimo allineamento: sul server
  // c'e' la versione del punto 3, e nessuna delle due e' figlia dell'altra
  localStorage.setItem(`osr.partita.${t}.ep1`, JSON.stringify({
    v: 1, episodio: 'ep1', modo: 'tavolo', party: ['NINO GRIMALDELLO CAUTO'],
    fase: 'indagine', aggiornato: Date.now(), sincronizzato: 1,
    indagine: { ora: 18, chiusa: false }, spedizione: { round: 9 } }));
}, idTavolo);
await p2.reload({ waitUntil: 'networkidle' });
await p2.waitForTimeout(500);
await p2.getByText('Il Coro Sommerso').first().click();
await p2.waitForTimeout(400);
await p2.locator('#continua').click();
await p2.waitForTimeout(1200);
ok(await p2.getByText(/due versioni di questa partita/i).count() > 0,
  "con due versioni divergenti l'app chiede invece di sovrascrivere");
ok(await p2.getByText(/round 9/).count() > 0 && await p2.getByText(/round 3/).count() > 0,
  'la schermata mostra a che punto sono tutt\'e due');

// --- 7. con dei tavoli già esistenti si può comunque crearne un altro
const p3 = await nuovaScheda();
await p3.goto(BASE, { waitUntil: 'networkidle' });
await p3.evaluate(() => { localStorage.removeItem('osr.tavolo'); });
await p3.reload({ waitUntil: 'networkidle' });
await p3.waitForTimeout(500);
ok(await p3.getByText(/nuovo tavolo/i).count() > 0,
  'il pulsante «nuovo tavolo» c\'è anche quando i tavoli esistono già');
const primaDi = (await (await fetch(BASE + '/api/stato')).json()).tavoli.length;
await p3.getByText(/nuovo tavolo/i).first().click();
await p3.fill('#nome-tavolo', 'Terzo gruppo');
await p3.click('#crea-tavolo');
await p3.waitForTimeout(900);
const dopoCrea = (await (await fetch(BASE + '/api/stato')).json()).tavoli;
ok(dopoCrea.length === primaDi + 1 && dopoCrea.some((t) => t.nome === 'Terzo gruppo'),
  'il tavolo in più viene creato');

// --- 8. e si può eliminare, portandosi via le sue partite
const daButtare = dopoCrea.find((t) => t.nome === 'Terzo gruppo');
await p3.evaluate(async (t) => {
  const { impostaTavolo, salva } = await import('/js/store.js');
  impostaTavolo(t.id, t.nome);
  salva({ v: 1, episodio: 'ep3', modo: 'tavolo', party: ['CARLA DOSTI'], fase: 'indagine',
          indagine: { ora: 20, chiusa: false }, spedizione: { round: 1 } });
}, daButtare);
await p3.waitForTimeout(4000);
ok((await (await fetch(BASE + '/api/stato')).json()).salvataggi.some((s) => s.tavolo === daButtare.id),
  'il tavolo da buttare ha una partita sul server');

await p3.goto(BASE, { waitUntil: 'networkidle' });
await p3.evaluate(() => { localStorage.removeItem('osr.tavolo'); });
await p3.reload({ waitUntil: 'networkidle' });
await p3.waitForTimeout(500);
await p3.locator(`.elimina-tavolo[data-id="${daButtare.id}"]`).click();
await p3.waitForTimeout(1500);
const finale = await (await fetch(BASE + '/api/stato')).json();
ok(!finale.tavoli.some((t) => t.id === daButtare.id), 'il tavolo eliminato sparisce');
ok(!finale.salvataggi.some((s) => s.tavolo === daButtare.id),
  'le partite se ne vanno col tavolo');
ok(finale.tavoli.some((t) => t.id === idTavolo), 'gli altri tavoli restano');
ok(await p3.evaluate((id) => !Object.keys(localStorage).some((k) => k.includes(id)), daButtare.id),
  'del tavolo eliminato non resta traccia sul dispositivo');

// --- 9. un tavolo che il server non conosce (cancellato altrove, o di un altro
// account) non manda alla home degli episodi: si torna ai tavoli, dove compare
// fra gli orfani, e si butta solo quando lo decide chi gioca
const orfano = '99999999-aaaa-bbbb-cccc-000000000000';
await p3.evaluate((o) => {
  localStorage.setItem('osr.tavolo', o);
  localStorage.setItem(`osr.partita.${o}.preludio`, '{"v":1}');
  localStorage.setItem('osr.dasincronizzare', JSON.stringify([
    { chiave: `${o}/preludio`, corpo: { tavolo: o, episodio: 'preludio', aggiornato: 1, dati: '{}' } }]));
}, orfano);
await p3.reload({ waitUntil: 'networkidle' });
await p3.waitForTimeout(800);
ok(await p3.getByText('Il Coro Sommerso').count() === 0,
  'con un tavolo sconosciuto al server non si finisce sugli episodi');
ok(await p3.locator('#nuovo-tavolo').count() === 1, 'si finisce sull\'elenco dei tavoli');
ok(await p3.evaluate(() => localStorage.getItem('osr.tavolo')) === null,
  'la scelta del tavolo sconosciuto viene scordata');
ok(await p3.locator(`.elimina-orfano[data-id="${orfano}"]`).count() === 1,
  'il tavolo sconosciuto compare fra gli orfani');
ok(await p3.locator('.elimina-orfano').count() === 1, 'e i tavoli veri non sono orfani');
ok(await p3.evaluate((o) => !!localStorage.getItem(`osr.partita.${o}.preludio`), orfano),
  'le sue partite restano sul dispositivo finche\' non si butta');
await p3.locator(`.elimina-orfano[data-id="${orfano}"]`).click();
await p3.waitForTimeout(600);
ok(await p3.locator('.elimina-orfano').count() === 0, 'buttato, sparisce dall\'elenco');
ok(await p3.evaluate((o) => !Object.keys(localStorage).some((k) => k.includes(o))
    && !(localStorage.getItem('osr.dasincronizzare') || '').includes(o), orfano),
  'dell\'orfano non resta traccia, nemmeno in coda');

// --- 10. CHI HA CREATO IL TAVOLO e' l'arbitro sempre, anche senza eroe; e un
// invitato senza eroe vede SOLO la scelta dell'eroe, anche con il tavolo gia'
// ricordato (l'app apre da li' senza passare dall'elenco)
const ARB = 'uno@esempio.it', OSPITE = 'ospite@esempio.it';
const api = (email, metodo, percorso, corpo) => fetch(BASE + percorso, {
  method: metodo, headers: { 'Content-Type': 'application/json', 'X-Osr-Dev-Email': email },
  body: corpo ? JSON.stringify(corpo) : undefined });
const idOspite = crypto.randomUUID();
await api(ARB, 'POST', '/api/tavolo', { id: idOspite, nome: 'Con ospite' });
await api(ARB, 'PUT', '/api/party', { tavolo: idOspite, party: ['NINO GRIMALDELLO CAUTO', 'CARLA DOSTI'] });
await api(ARB, 'POST', '/api/membri', { tavolo: idOspite, email: OSPITE });   // senza eroe

const elenco = await (await api(ARB, 'GET', `/api/membri?tavolo=${idOspite}`)).json();
ok(elenco.proprietario === ARB, 'il tavolo dice chi l\'ha creato');
ok(elenco.membri.length === 1 && elenco.membri[0].email === OSPITE,
  'ma il creatore non e\' fra i membri: non prende un posto e non si toglie');

await p3.goto(BASE, { waitUntil: 'networkidle' });
await p3.evaluate(() => { localStorage.removeItem('osr.tavolo'); });
await p3.reload({ waitUntil: 'networkidle' });
await p3.locator(`.membri-tavolo[data-id="${idOspite}"]`).click();
await p3.waitForTimeout(800);
ok(await p3.getByText(/ha creato il tavolo/i).count() === 1,
  'nell\'elenco di chi gioca il creatore compare, come arbitro');
ok(await p3.locator('.togli-membro').count() === 1, 'e solo l\'invitato si puo\' togliere');

const ctxO = await browser.newContext({ viewport: { width: 390, height: 844 },
  extraHTTPHeaders: { 'X-Osr-Dev-Email': OSPITE } });
const po = await ctxO.newPage();
po.on('pageerror', (e) => { console.log('   !! pageerror:', e.message); ko++; });
await po.goto(BASE, { waitUntil: 'networkidle' });
await po.evaluate((t) => localStorage.setItem('osr.tavolo', t), idOspite);   // tavolo gia' ricordato
await po.reload({ waitUntil: 'networkidle' });
await po.waitForTimeout(800);
ok(await po.locator('.griglia-arruolo .eroe-tile').count() === 2,
  'l\'invitato senza eroe vede solo la scelta dell\'eroe');
ok(await po.getByText(new RegExp(`Tavolo di.*${ARB}`)).count() > 0, 'e sa chi arbitra');
ok(await po.locator('#entra').count() === 0, 'e non c\'e\' modo di andare oltre');
ok(await po.getByText(/la serata non è ancora cominciata/i).count() === 0,
  'non arriva alla schermata d\'attesa senza aver scelto');
// da li' si puo' sempre cambiare tavolo: la scelta non e' un vicolo cieco
await po.locator('#altro-tavolo').click();
await po.waitForTimeout(600);
ok(await po.locator('#nuovo-tavolo').count() === 1 && await po.locator('.griglia-arruolo').count() === 0,
  'con «cambia tavolo» si torna all\'elenco dei tavoli');
// ...e anche quando il tavolo non e' pronto: senza compagnia non c'e' niente da
// scegliere, ma non si resta chiusi dentro
const idVuoto = crypto.randomUUID();
await api(ARB, 'POST', '/api/tavolo', { id: idVuoto, nome: 'Senza compagnia' });
await api(ARB, 'POST', '/api/membri', { tavolo: idVuoto, email: OSPITE });
await po.evaluate((t) => localStorage.setItem('osr.tavolo', t), idVuoto);
await po.reload({ waitUntil: 'networkidle' });
await po.waitForTimeout(800);
ok(await po.getByText(/ancora niente da scegliere/i).count() > 0, 'senza compagnia non c\'e\' niente da scegliere');
ok(await po.locator('#altro-tavolo').count() === 1, 'ma c\'e\' «cambia tavolo»');
await po.evaluate((t) => localStorage.setItem('osr.tavolo', t), idOspite);

await api(OSPITE, 'PUT', '/api/mio-eroe', { tavolo: idOspite, eroi: ['CARLA DOSTI'] });
await po.reload({ waitUntil: 'networkidle' });
await po.waitForTimeout(800);
ok(await po.getByText(/la serata non è ancora cominciata/i).count() > 0,
  'preso l\'eroe, il tavolo si apre');

// --- 11. il creatore ha un posto come gli altri: prende il suo eroe, e gli
// altri vedono che e' preso. E un tavolo suo lasciato a meta' non si apre: ci si
// rientra dalla stessa schermata, che dice cosa manca
const presoDaCreatore = await api(ARB, 'PUT', '/api/mio-eroe', { tavolo: idOspite, eroi: ['NINO GRIMALDELLO CAUTO'] });
ok(presoDaCreatore.ok, 'il creatore puo\' prendersi un eroe');
const dopoPreso = await (await api(ARB, 'GET', `/api/membri?tavolo=${idOspite}`)).json();
ok(dopoPreso.eroiProprietario.join() === 'NINO GRIMALDELLO CAUTO', 'e il tavolo lo dice');
const rifiutato = await api(OSPITE, 'PUT', '/api/mio-eroe', { tavolo: idOspite, eroi: ['NINO GRIMALDELLO CAUTO'] });
ok(rifiutato.status === 409, `e l'invitato non puo' prendere lo stesso (visto ${rifiutato.status})`);
const statoCreatore = await (await api(ARB, 'GET', '/api/stato')).json();
const suo = statoCreatore.tavoli.find((x) => x.id === idOspite);
ok(suo && suo.creatore === 1 && suo.invitati === 1 && suo.eroi.length === 1,
  'lo stato dice che e\' suo, quanti invitati ha e che eroe ha');

await p3.goto(BASE, { waitUntil: 'networkidle' });
await p3.evaluate((t) => localStorage.setItem('osr.tavolo', t), idVuoto);   // senza compagnia
await p3.reload({ waitUntil: 'networkidle' });
await p3.waitForTimeout(800);
ok(await p3.locator('#avanti').count() === 1 && await p3.locator('#avanti').isDisabled(),
  'un tavolo suo senza compagnia non si apre: si torna a completarlo');
ok(/compagnia/.test(await p3.locator('#manca-tavolo').innerText())
   && !/invitata/.test(await p3.locator('#manca-tavolo').innerText()),
  'e dice che manca solo la compagnia (l\'invitato c\'e\')');

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\ntest-account-ui: tutto a posto');
process.exit(ko ? 1 : 0);
