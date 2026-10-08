// GLI OGGETTI NASCOSTI NELLE TESSERE (Ep.2-20). Cercare in una stanza che ne nasconde uno deve metterlo
// nell'inventario del gruppo e farne vedere la carta. Segnalato (08/10/2026): in Ep.2, T2, cercare dava solo
// la riga «Un badile del formatore, corto e pesante...» — niente carta, niente inventario — perche' solo
// l'Ep.1 esportava `oggetti` con `ref` = tessera. Qui, per ogni episodio: ogni oggetto sta su una tessera
// che esiste e che lo dice nel testo «cerca», la sua carta (dove c'e') si trova per nome, e una ricerca
// riuscita lo registra davvero.
// node webapp/test-oggetti-tessera.mjs
import { readFileSync, existsSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { cartaOggetto } from './public/js/engine.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const A = 'ELENA FOSCO';
const party = [A, COMUNE.eroi.find((e) => e.nome.includes('SIBILLA')).nome];

let totale = 0, concarta = 0;
for (let n = 2; n <= 20; n++) {
  const p = `webapp/data/ep${n}.json`; if (!existsSync(p)) continue;
  const EP = JSON.parse(readFileSync(p, 'utf8'));
  for (const o of EP.oggetti || []) {
    totale += 1;
    const t = EP.tessere.find((x) => x.id === o.ref);
    if (!t) { ok(false, `ep${n}: «${o.nome}» sta su una tessera che non esiste (${o.ref})`); continue; }
    if (cartaOggetto(CARTE, `ep${n}`, o.nome)) concarta += 1;
  }
}
ok(totale >= 25, `gli episodi 2-20 portano ${totale} oggetti di tessera (Ep.1 aveva gia' i suoi)`);
ok(concarta >= 11, `${concarta} hanno la carta stampata (Ep.2-8 si'; dall'Ep.9 la carta non e' ancora stata fatta: restano il nome e la riga)`);

// una ricerca vera, Ep.2 T2: l'oggetto entra nell'inventario e l'evento lo porta, con la carta
const EP2 = JSON.parse(readFileSync('webapp/data/ep2.json', 'utf8'));
const stato = {
  v: 1, episodio: 'ep2', modo: 'digitale', party, fase: 'spedizione',
  indagine: { oggetti: [], caricheUsate: {}, chiusa: true }, vantaggi: { tier: 'preparati' },
  spedizione: { round: 2, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, grate: [], compiti: {}, cercate: {}, azioni: {}, storditi: {},
    eroiFatti: [], eroiAttivo: A, scortati: [], insidie: {}, abilita: {}, rivelate: ['T1', 'T2'], nemici: [], log: [],
    eroiPos: { [A]: { t: 'T2', x: 1, y: 1 }, [party[1]]: { t: 'T2', x: 2, y: 1 } }, vite: {} },
};
const out = applica(stato, { tipo: 'cerca', eroe: A, tiri: [[6, 6]] }, { ep: EP2, comune: COMUNE, carte: CARTE });
ok(!out.rifiuto, `cerca in T2 accettata (${(out.rifiuto || {}).motivo || ''})`);
const ev = (out.eventi || []).find((e) => e.tipo === 'cercato');
ok(ev && ev.trovato && /badile/i.test(ev.trovato.nome), `l'evento porta l'oggetto trovato (${ev && ev.trovato && ev.trovato.nome})`);
ok((out.stato.indagine.oggetti || []).some((x) => /badile/i.test(x)), 'e l\'inventario del gruppo lo ha');
ok(ev && ev.trovato && cartaOggetto(CARTE, 'ep2', ev.trovato.nome), 'la sua carta si trova per nome');
// una seconda ricerca non lo duplica
const stato2 = out.stato; stato2.spedizione.cercate = {}; stato2.spedizione.azioni = {}; stato2.spedizione.eroiFatti = [];
const out2 = applica(stato2, { tipo: 'cerca', eroe: A, tiri: [[6, 6]] }, { ep: EP2, comune: COMUNE, carte: CARTE });
ok((out2.stato.indagine.oggetti || []).filter((x) => /badile/i.test(x)).length === 1, 'cercando di nuovo l\'inventario non lo duplica');

// L'OGGETTO RISCHIOSO (Ep.2 T3, la Latta d'Olio): dopo la ricerca (ACUME) c'e' una seconda prova per
// PRENDERLO (NERVI). Segnalato (08/10/2026): al tavolo la finestra dei dadi ripeteva «cercare — media»,
// e sembrava di tirare due volte la stessa cosa. La seconda prova dichiarata e' quella dell'oggetto.
import { provaDi } from './public/motore/azioni.js';
const rischioso = JSON.parse(JSON.stringify(stato));
rischioso.spedizione.eroiPos[A] = { t: 'T3', x: 1, y: 1 }; rischioso.spedizione.rivelate = ['T1', 'T2', 'T3'];
rischioso.indagine.oggetti = [];
const gR = { ep: EP2, comune: COMUNE, carte: CARTE, sp: rischioso.spedizione, partita: rischioso };
const p1 = provaDi(gR, { tipo: 'cerca', eroe: A });
const p2 = provaDi(gR, { tipo: 'cerca', eroe: A, tiri: [[6, 6]] });
ok(p1 && /cercare/.test(p1.titolo) && p1.bonus.some((b) => b.label === 'ACUME'), `la prima prova e' la ricerca (${p1 && p1.titolo})`);
ok(p2 && /prendere/.test(p2.titolo) && p2.bonus.some((b) => b.label === 'NERVI'), `la seconda e' quella dell'oggetto, NERVI (${p2 && p2.titolo})`);
const solo = applica(rischioso, { tipo: 'cerca', eroe: A, tiri: [[6, 6]] }, { ep: EP2, comune: COMUNE, carte: CARTE });
ok(solo.rifiuto && /non bastano/i.test(solo.rifiuto.motivo), 'con un solo dado il motore ne chiede un secondo');
const due = applica(rischioso, { tipo: 'cerca', eroe: A, tiri: [[6, 6], [1, 1]] }, { ep: EP2, comune: COMUNE, carte: CARTE });
ok(!due.rifiuto && (due.stato.indagine.oggetti || []).some((x) => /latta/i.test(x)), 'con due dadi la ricerca si chiude e la latta e nell inventario');
ok(due.eventi.some((e) => e.tipo === 'conseguenza'), 'la seconda prova fallita (2) applica la conseguenza');
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
