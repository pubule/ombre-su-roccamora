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

console.log(ko ? `${ko} FALLITI` : 'test-sync: tutto a posto');
process.exit(ko ? 1 : 0);
