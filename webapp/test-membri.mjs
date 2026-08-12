// CHI SIEDE AL TAVOLO: l'ACL dei membri, contro un `wrangler dev` con D1 locale.
//
// Servono DUE server, uno per utente. L'isolamento non si prova con un solo
// utente, e provarlo con un id inesistente non prova niente (404 perche' non
// c'e', non perche' e' di un altro). I due `wrangler dev` condividono lo stesso
// D1 locale, quindi il secondo vede davvero i tavoli del primo — e deve
// rifiutarli finche' non e' invitato.
//
// Qui si prova soprattutto quel che NON deve succedere: un invitato che
// cancella la campagna di chi lo ha invitato, un giocatore che invita altra
// gente, due giocatori sullo stesso eroe, un estraneo che legge una partita.
//
// Uso, in tre terminali:
//   ./webapp/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788
//   node webapp/test-membri.mjs
const ARBITRO = 'http://127.0.0.1:8787';       // uno@esempio.it
const GIOCATORE = 'http://127.0.0.1:8788';     // due@esempio.it
const EMAIL_A = 'uno@esempio.it';
const EMAIL_G = 'due@esempio.it';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
const chiama = (base, metodo, percorso, corpo) => fetch(base + percorso, {
  method: metodo,
  headers: corpo ? { 'Content-Type': 'application/json' } : {},
  body: corpo ? JSON.stringify(corpo) : undefined,
});

// --- l'arbitro fa un tavolo e ci mette dentro una partita
const idT = crypto.randomUUID();
ok((await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT, nome: 'Gruppo del giovedì' })).ok,
   'l\'arbitro crea il tavolo');
await chiama(ARBITRO, 'POST', '/api/salvataggio',
  { tavolo: idT, episodio: 'ep1', aggiornato: 100, dati: '{"v":1}' });

// --- PRIMA DELL'INVITO il giocatore non esiste, per questo tavolo
{
  const s = await (await chiama(GIOCATORE, 'GET', '/api/stato')).json();
  ok(!s.tavoli.some((t) => t.id === idT), 'prima dell\'invito il tavolo non compare nel suo stato');

  const r = await chiama(GIOCATORE, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
  ok(r.status === 404, `e la partita non si legge (visto ${r.status})`);

  const m = await chiama(GIOCATORE, 'GET', `/api/membri?tavolo=${idT}`);
  ok(m.status === 404, `ne' si sa chi ci gioca (visto ${m.status})`);

  const w = await chiama(GIOCATORE, 'POST', '/api/salvataggio',
    { tavolo: idT, episodio: 'ep1', aggiornato: 999, dati: '{"rubato":1}' });
  ok(w.status === 404, `ne' si sovrascrive (visto ${w.status})`);

  const d = await chiama(GIOCATORE, 'DELETE', `/api/tavolo?id=${idT}`);
  ok(d.status === 404, `ne' si cancella (visto ${d.status})`);
}

// --- il tavolo dell'arbitro e' ancora intero
{
  const l = await (await chiama(ARBITRO, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json();
  ok(l.dati === '{"v":1}', 'dopo i tentativi la partita e\' quella di prima');
}

// --- L'INVITO
{
  const r = await chiama(ARBITRO, 'POST', '/api/membri',
    { tavolo: idT, email: EMAIL_G, eroe: 'ELENA FOSCO' });
  ok(r.ok, `l'arbitro invita (visto ${r.status})`);

  const s = await (await chiama(GIOCATORE, 'GET', '/api/stato')).json();
  const t = s.tavoli.find((x) => x.id === idT);
  ok(t, 'ora il tavolo compare nel suo stato');
  ok(t && t.ruolo === 'giocatore', `col ruolo giusto (visto ${t && t.ruolo})`);
  ok(t && t.eroe === 'ELENA FOSCO', `e con l'eroe assegnato (visto ${t && t.eroe})`);

  const l = await chiama(GIOCATORE, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
  ok(l.ok, `e adesso la partita si legge (visto ${l.status})`);
}

// --- MA UN INVITATO NON E' UN PADRONE
{
  const d = await chiama(GIOCATORE, 'DELETE', `/api/tavolo?id=${idT}`);
  ok(d.status === 404, `un invitato NON cancella il tavolo (visto ${d.status})`);

  const inv = await chiama(GIOCATORE, 'POST', '/api/membri',
    { tavolo: idT, email: 'terzo@esempio.it' });
  ok(inv.status === 404, `ne' invita altra gente (visto ${inv.status})`);

  const caccia = await chiama(GIOCATORE, 'DELETE', `/api/membri?tavolo=${idT}&email=${EMAIL_A}`);
  ok(caccia.status === 404, `ne' caccia l'arbitro (visto ${caccia.status})`);

  const canc = await chiama(GIOCATORE, 'DELETE', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
  ok(canc.status === 404, `ne' butta via la partita (visto ${canc.status})`);

  // e il tavolo e' ancora li'
  const s = await (await chiama(ARBITRO, 'GET', '/api/stato')).json();
  ok(s.tavoli.some((t) => t.id === idT), 'dopo tutto questo il tavolo esiste ancora');
  const l = await chiama(ARBITRO, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
  ok(l.ok, 'e la partita pure');
}

// --- QUELLO CHE UN INVITATO PUO' FARE: giocare, e andarsene
{
  const w = await chiama(GIOCATORE, 'POST', '/api/salvataggio',
    { tavolo: idT, episodio: 'ep1', aggiornato: 200, dati: '{"v":2}' });
  ok(w.ok, `un membro salva la partita a cui gioca (visto ${w.status})`);
  const l = await (await chiama(ARBITRO, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json();
  ok(l.dati === '{"v":2}', 'e l\'arbitro se la ritrova aggiornata');

  const m = await (await chiama(GIOCATORE, 'GET', `/api/membri?tavolo=${idT}`)).json();
  ok(m.membri.some((x) => x.email === EMAIL_G), 'un membro vede chi siede al tavolo');
}

// --- DUE GIOCATORI, UN EROE SOLO
{
  const r = await chiama(ARBITRO, 'POST', '/api/membri',
    { tavolo: idT, email: 'terzo@esempio.it', eroe: 'ELENA FOSCO' });
  ok(r.status === 409, `lo stesso eroe a due persone e' rifiutato (visto ${r.status})`);

  const r2 = await chiama(ARBITRO, 'POST', '/api/membri',
    { tavolo: idT, email: 'terzo@esempio.it', eroe: 'OTTONE BRERA' });
  ok(r2.ok, 'un eroe libero invece si assegna');

  // …ma lo stesso eroe in un ALTRO tavolo si puo': il vincolo e' per tavolo
  const idT2 = crypto.randomUUID();
  await chiama(ARBITRO, 'POST', '/api/tavolo', { id: idT2, nome: 'Gruppo del sabato' });
  const r3 = await chiama(ARBITRO, 'POST', '/api/membri',
    { tavolo: idT2, email: EMAIL_G, eroe: 'ELENA FOSCO' });
  ok(r3.ok, 'lo stesso eroe in un altro tavolo va benissimo');
  await chiama(ARBITRO, 'DELETE', `/api/tavolo?id=${idT2}`);
}

// --- email malformate
{
  for (const cattiva of ['non-una-email', '', 'a@b', null, 'x'.repeat(300) + '@y.it']) {
    const r = await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: cattiva });
    ok(r.status === 400, `«${String(cattiva).slice(0, 20)}» rifiutata (visto ${r.status})`);
  }
  const r = await chiama(ARBITRO, 'POST', '/api/membri',
    { tavolo: idT, email: 'quarto@esempio.it', ruolo: 'imperatore' });
  ok(r.status === 400, `un ruolo inventato e' rifiutato (visto ${r.status})`);
}

// --- ANDARSENE: un membro toglie se stesso, e torna estraneo
{
  const r = await chiama(GIOCATORE, 'DELETE', `/api/membri?tavolo=${idT}&email=${EMAIL_G}`);
  ok(r.ok, `un membro puo' togliere se stesso (visto ${r.status})`);

  const s = await (await chiama(GIOCATORE, 'GET', '/api/stato')).json();
  ok(!s.tavoli.some((t) => t.id === idT), 'e il tavolo sparisce dal suo stato');
  const l = await chiama(GIOCATORE, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
  ok(l.status === 404, 'e la partita torna irraggiungibile');
}

// --- CACCIARE: l'arbitro toglie chi vuole
{
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: EMAIL_G, eroe: 'CARLA PIETRASANTA' });
  const r = await chiama(ARBITRO, 'DELETE', `/api/membri?tavolo=${idT}&email=${EMAIL_G}`);
  ok(r.ok, 'l\'arbitro caccia un membro');
  const l = await chiama(GIOCATORE, 'GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
  ok(l.status === 404, 'e quello non legge piu\' niente');
}

// --- il tavolo cancellato porta via i membri (ON DELETE CASCADE)
{
  await chiama(ARBITRO, 'POST', '/api/membri', { tavolo: idT, email: EMAIL_G });
  ok((await chiama(ARBITRO, 'DELETE', `/api/tavolo?id=${idT}`)).ok, 'l\'arbitro cancella il tavolo');
  const s = await (await chiama(GIOCATORE, 'GET', '/api/stato')).json();
  ok(!s.tavoli.some((t) => t.id === idT), 'e i membri se ne vanno con lui');
}

console.log(ko === 0 ? 'test-membri: tutto a posto' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
