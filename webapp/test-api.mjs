// I cinque endpoint dei salvataggi, contro un `wrangler dev` con D1 locale.
// Servono DUE server, uno per utente: l'isolamento fra account non si puo'
// provare con un solo utente, e provarlo con un id inesistente non prova
// niente (404 perche' non c'e', non perche' e' di un altro). I due `wrangler
// dev` condividono lo stesso D1 locale, quindi il secondo vede davvero i
// tavoli del primo — e deve rifiutarli.
//
// Uso, in tre terminali:
//   ./webapp/build-dist.sh
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:uno@esempio.it --port 8787
//   npx --no-install wrangler dev --var OSR_DEV_EMAIL:due@esempio.it --port 8788
//   node webapp/test-api.mjs
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8787';
const BASE_ALTRO = 'http://127.0.0.1:8788';
let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };
const chiama = (metodo, percorso, corpo) => fetch(BASE + percorso, {
  method: metodo,
  headers: corpo ? { 'Content-Type': 'application/json' } : {},
  body: corpo ? JSON.stringify(corpo) : undefined,
});

// il tavolo si crea
const idT = crypto.randomUUID();
ok((await chiama('POST', '/api/tavolo', { id: idT, nome: 'Gruppo del giovedì' })).ok, 'crea tavolo');

// lo stato lo elenca, e non trascina i salvataggi interi
const stato = await (await chiama('GET', '/api/stato')).json();
ok(stato.email === 'uno@esempio.it', "lo stato riporta l'email verificata");
ok(stato.tavoli.some((t) => t.id === idT), 'il tavolo compare nello stato');
ok(!JSON.stringify(stato).includes('"dati"'), 'lo stato non trascina i salvataggi interi');

// salvataggio e rilettura
await chiama('POST', '/api/salvataggio', { tavolo: idT, episodio: 'ep1', aggiornato: 100, dati: '{"v":1,"ora":24}' });
const letto = await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json();
ok(letto.dati === '{"v":1,"ora":24}', 'rilegge il salvataggio');
ok(letto.aggiornato === 100, 'rilegge la data');

// un pacchetto vecchio arrivato in ritardo NON deve riportare indietro la partita
await chiama('POST', '/api/salvataggio', { tavolo: idT, episodio: 'ep1', aggiornato: 50, dati: '{"vecchio":true}' });
const dopo = await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json();
ok(dopo.aggiornato === 100, 'il salvataggio vecchio non sovrascrive il nuovo');

// uno piu' recente si'
await chiama('POST', '/api/salvataggio', { tavolo: idT, episodio: 'ep1', aggiornato: 200, dati: '{"nuovo":true}' });
ok((await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json()).aggiornato === 200,
  'il salvataggio nuovo sovrascrive il vecchio');

// due tavoli sullo stesso episodio non si toccano: e' il guaio n.2 della spec
const idT2 = crypto.randomUUID();
await chiama('POST', '/api/tavolo', { id: idT2, nome: 'Gruppo del sabato' });
await chiama('POST', '/api/salvataggio', { tavolo: idT2, episodio: 'ep1', aggiornato: 300, dati: '{"sabato":true}' });
ok((await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json()).dati === '{"nuovo":true}',
  'il secondo gruppo non ha sovrascritto il primo');

// un tavolo che non esiste proprio
ok((await chiama('POST', '/api/salvataggio', { tavolo: crypto.randomUUID(), episodio: 'ep1', aggiornato: 1, dati: '{}' })).status === 404,
  'non si scrive su un tavolo inesistente');

// --- isolamento fra account: il pezzo che conta.
// `idT` esiste ed e' di uno@esempio.it. Per l'altro utente non deve esistere.
const altro = (metodo, percorso, corpo) => fetch(BASE_ALTRO + percorso, {
  method: metodo,
  headers: corpo ? { 'Content-Type': 'application/json' } : {},
  body: corpo ? JSON.stringify(corpo) : undefined,
});
let statoAltro;
try {
  statoAltro = await (await altro('GET', '/api/stato')).json();
} catch {
  console.error('FAIL: il secondo server (porta 8788) non risponde — senza, l\'isolamento non e\' provato');
  process.exit(1);      // meglio fermarsi che dichiarare passato un test non eseguito
}
ok(statoAltro.email === 'due@esempio.it', 'il secondo server e\' un altro utente');
ok(!statoAltro.tavoli.some((t) => t.id === idT), 'il tavolo altrui non compare nel mio elenco');
ok((await altro('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).status === 404,
  'non si legge il salvataggio di un altro account, pur conoscendone l\'id');
ok((await altro('POST', '/api/salvataggio', { tavolo: idT, episodio: 'ep1', aggiornato: 999, dati: '{"intruso":true}' })).status === 404,
  'non si scrive nel tavolo di un altro account');
ok((await altro('DELETE', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).status === 404,
  'non si cancella il salvataggio di un altro account');
// e dopo il tentativo, la partita del proprietario e' intatta
ok((await (await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).json()).dati === '{"nuovo":true}',
  'dopo il tentativo altrui la partita e\' intatta');

// cancellazione
await chiama('DELETE', `/api/salvataggio?tavolo=${idT}&episodio=ep1`);
ok((await chiama('GET', `/api/salvataggio?tavolo=${idT}&episodio=ep1`)).status === 404, 'cancella');

// --- eliminare un tavolo si porta via le sue partite
const idT3 = crypto.randomUUID();
await chiama('POST', '/api/tavolo', { id: idT3, nome: 'Da buttare' });
await chiama('POST', '/api/salvataggio', { tavolo: idT3, episodio: 'ep5', aggiornato: 10, dati: '{"a":1}' });
await chiama('POST', '/api/salvataggio', { tavolo: idT3, episodio: 'ep6', aggiornato: 20, dati: '{"b":2}' });
ok((await chiama('DELETE', `/api/tavolo?id=${idT3}`)).ok, 'elimina il tavolo');
const dopoElim = await (await chiama('GET', '/api/stato')).json();
ok(!dopoElim.tavoli.some((t) => t.id === idT3), 'il tavolo eliminato sparisce dall\'elenco');
ok(!dopoElim.salvataggi.some((s) => s.tavolo === idT3),
  'le partite del tavolo eliminato spariscono con lui (cascata)');
ok(dopoElim.tavoli.some((t) => t.id === idT2), 'gli altri tavoli restano');

// e non si elimina il tavolo di un altro account
const idT4 = crypto.randomUUID();
await chiama('POST', '/api/tavolo', { id: idT4, nome: 'Non toccarlo' });
ok((await altro('DELETE', `/api/tavolo?id=${idT4}`)).status === 404,
  "non si elimina il tavolo di un altro account");
ok((await (await chiama('GET', '/api/stato')).json()).tavoli.some((t) => t.id === idT4),
  'dopo il tentativo altrui il tavolo e\' ancora li\'');

// il varco di sviluppo non deve finire in produzione
const cfg = fs.readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
ok(!cfg.includes('OSR_DEV_EMAIL'), 'OSR_DEV_EMAIL non compare in wrangler.jsonc');

console.log(ko ? `${ko} FALLITI` : 'test-api: tutto a posto');
process.exit(ko ? 1 : 0);
