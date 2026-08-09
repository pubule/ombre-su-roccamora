// La regola dei conflitti: cosa si fa all'apertura di un episodio quando il
// dispositivo e il server non dicono la stessa cosa.
// node webapp/test-sync.mjs
import { decidi } from './public/js/sync.js';

let ko = 0;
const ok = (atteso, l, r, msg) => {
  const a = decidi(l, r).azione;
  if (a !== atteso) { console.error('FAIL:', msg, '— atteso', atteso, 'ricevuto', a); ko++; }
};

ok('niente',  null, null, "non c'e' niente da nessuna parte");
ok('scarica', null, { aggiornato: 10 }, "solo il server ce l'ha: e' un altro dispositivo");
ok('manda',   { aggiornato: 10, sincronizzato: 0 }, null, "solo il dispositivo ce l'ha: prima volta");
ok('niente',  { aggiornato: 10, sincronizzato: 10 }, { aggiornato: 10 }, 'nessuno ha giocato da allora');
ok('manda',   { aggiornato: 20, sincronizzato: 10 }, { aggiornato: 10 }, "ho giocato io, il server e' fermo");
ok('scarica', { aggiornato: 10, sincronizzato: 10 }, { aggiornato: 20 }, "ha giocato l'altro dispositivo");
ok('chiedi',  { aggiornato: 20, sincronizzato: 10 }, { aggiornato: 30 }, 'hanno giocato entrambi: non si decide da soli');
ok('chiedi',  { aggiornato: 30, sincronizzato: 10 }, { aggiornato: 20 }, "entrambi, col locale piu' avanti: si chiede lo stesso");

// un salvataggio nato prima che esistesse la sincronizzazione non ha
// `sincronizzato`: vale come «mai allineato», quindi conta come cambiato
ok('chiedi',  { aggiornato: 20 }, { aggiornato: 30 }, 'senza sincronizzato, il locale conta come cambiato');

// con 'chiedi' devono tornare tutt'e due, o la schermata non puo' mostrarli
const c = decidi({ aggiornato: 20, sincronizzato: 10 }, { aggiornato: 30 });
if (!c.locale || !c.remoto) { console.error('FAIL: chiedi deve restituire le due partite'); ko++; }

// --- la coda: sopravvive alla chiusura dell'app e non accumula doppioni
const { _coda } = await import('./public/js/sync.js');

const finto = {};
globalThis.localStorage = {
  getItem: (k) => finto[k] ?? null,
  setItem: (k, v) => { finto[k] = String(v); },
  removeItem: (k) => { delete finto[k]; },
};

_coda.accoda('t/ep1', { tavolo: 't', episodio: 'ep1', aggiornato: 1, dati: '{}' });
_coda.accoda('t/ep2', { tavolo: 't', episodio: 'ep2', aggiornato: 2, dati: '{}' });
if (_coda.leggi().length !== 2) { console.error('FAIL: la coda non ha due elementi'); ko++; }

// stessa partita accodata di nuovo: resta l'ultima versione, non due copie
_coda.accoda('t/ep1', { tavolo: 't', episodio: 'ep1', aggiornato: 9, dati: '{"nuovo":1}' });
if (_coda.leggi().length !== 2) { console.error('FAIL: la coda duplica la stessa partita'); ko++; }
if (_coda.leggi().find((x) => x.chiave === 't/ep1')?.corpo.aggiornato !== 9) {
  console.error('FAIL: la coda ha tenuto la versione vecchia'); ko++;
}

// la coda vive in localStorage: un'app riaperta la ritrova
if (!finto['osr.dasincronizzare']) { console.error("FAIL: la coda non e' persistente"); ko++; }

// spedizione riuscita: sparisce solo quella spedita
_coda.togli('t/ep1');
if (_coda.leggi().length !== 1 || _coda.leggi()[0].chiave !== 't/ep2') {
  console.error('FAIL: togli() ha tolto la cosa sbagliata'); ko++;
}

console.log(ko ? `${ko} FALLITI` : 'test-sync: tutto a posto');
process.exit(ko ? 1 : 0);
