// REGOLA DEL VENTO (Ep.11): modificatori puri. node webapp/test-vento.mjs
import { readFileSync } from 'fs';
import { applica } from './public/motore/comandi.js';
import { fineRoundNemici } from './public/motore/nemici.js';
import { statoPerPosto } from './public/motore/proiezione.js';
import { ventoAttivo, gradiniVento, buioMalus, bonusVento, eroiInProva } from './public/motore/vento.js';

let ko = 0;
const coda = (sp) => (sp.provaVento || {}).chi || [];
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const EP = {}; const ep = (n) => (EP[n] = EP[n] || JSON.parse(readFileSync(`webapp/data/ep${n}.json`, 'utf8')));
const party = COMUNE.eroi.slice(0, 4).map((e) => e.nome);

// pos: tessera di ciascun eroe, nell'ordine del party
const nuova = (n, pos, { oggetti = [], vento, risposte, vite, mazzo } = {}) => {
  const eroiPos = {}; const v = {};
  party.forEach((nm, i) => { eroiPos[nm] = { t: pos[i], x: i, y: 0 }; if (vite && vite[i] !== undefined) v[nm] = vite[i]; });
  const s = {
    v: 1, episodio: `ep${n}`, modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti, caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati', ...(risposte ? { risposte } : {}) },
    spedizione: { round: 3, canto: 0, cantoBonus: false, fase: 'eroi', esito: null, grate: [], compiti: {}, cercate: {}, azioni: {}, storditi: {}, eroiFatti: [], eroiAttivo: null, scortati: [], insidie: {}, abilita: {}, ...(mazzo ? { mazzo: { pool: [mazzo], ordine: [0], indice: 0 }, minacceDaPescare: 1 } : {}), rivelate: ['T1'], nemici: [], log: [], eroiPos, vite: v, ...(vento !== undefined ? { vento } : {}) },
  };
  return { ep: ep(n), comune: COMUNE, carte: CARTE, sp: s.spedizione, partita: s };
};
const T1 = ['T1', 'T1', 'T1', 'T1'];

// ---- chi tira
let g = nuova(11, ['T1', 'T2', 'T3', 'T2']);
ok(ventoAttivo(g), 'Ep11: regola attiva');
ok(JSON.stringify(eroiInProva(g)) === JSON.stringify([party[1], party[3]]), 'tira solo chi sta su tessera ESPOSTA (T2), non chi e\' al riparo (T1, T3)');
g = nuova(11, ['T1', 'T2', 'T3', 'T2'], { vite: [6, 0, 6, 3] });
ok(JSON.stringify(eroiInProva(g)) === JSON.stringify([party[3]]), 'un eroe a 0 Salute non tira');
g = nuova(11, ['T1', 'T2', 'T3', 'T2']); g.sp.rivelate = [];
ok(!ventoAttivo(g) && eroiInProva(g).length === 0, 'T1 non ancora rivelata: la regola non vale');
g = nuova(1, ['T1', 'T1', 'T1', 'T1']);
ok(!ventoAttivo(g) && eroiInProva(g).length === 0, 'Ep1: nessuna regola del vento');

// ---- difficolta': base Facile, un gradino per Crescendo, +1 T4 (FORTE), +1 T5 (massimo), tetto Difficile
const dif = (vento, t) => gradiniVento(nuova(11, T1, { vento }), t).diff;
ok(dif(0, 'T2') === 'Facile', 'T2 senza Crescendo: Facile');
ok(dif(1, 'T2') === 'Media', '1 Crescendo: Media');
ok(dif(2, 'T2') === 'Difficile', '2 Crescendo: Difficile');
ok(dif(5, 'T2') === 'Difficile', '5 Crescendo: tetto Difficile');
ok(dif(0, 'T4') === 'Media', 'T4 FORTE a vento 0: Media');
ok(dif(1, 'T4') === 'Difficile', 'T4 FORTE + 1 Crescendo: Difficile');
ok(dif(0, 'T5') === 'Facile', 'T5 non e\' «vento al massimo»: Facile');
ok(dif(0, 'T6') === 'Media', 'T6 «Vento al massimo»: Media');
ok(dif(undefined, 'T2') === 'Facile', 'salvataggio vecchio (sp.vento assente): come 0');

// ---- buio
const buio = (oggetti, t) => buioMalus(nuova(11, T1, { oggetti }), t);
ok(buio([], 'T2') === -1, 'tessera ESPOSTA senza lanterna: -1');
ok(buio(['La Lanterna da Guglia'], 'T2') === 0, 'con La Lanterna da Guglia: nessun malus');
ok(buio([], 'T3') === 0, 'tessera riparata: nessun malus');

// ---- bonus
const lab = (b) => b.map((x) => `${x.label}:${x.val}`).join('|');
ok(bonusVento(nuova(11, T1)).length === 0, 'nessun bonus di base');
let b = bonusVento(nuova(11, T1, { oggetti: ['Il Taccuino Ordinato'] }));
ok(b.length === 1 && b[0].val === 1, `Taccuino Ordinato: +1 (${lab(b)})`);
b = bonusVento(nuova(11, T1, { risposte: [false, false, true, false] }));
ok(b.length === 1 && b[0].val === 1, `Domanda 3 esatta: +1 (${lab(b)})`);
b = bonusVento(nuova(11, T1, { risposte: [true, true, false, true] }));
ok(b.length === 0, 'Domanda 3 sbagliata: niente');

// ---- Task 2: il contatore dei Crescendo
const pesca = (n, titolo, o = {}) => {
  const g0 = nuova(n, T1, { ...o, mazzo: titolo });
  return applica(g0.partita, { tipo: 'fase-minaccia' }, { ep: g0.ep, comune: COMUNE, carte: CARTE }).stato.spedizione;
};
ok(pesca(11, 'Crescendo — Il Primo Refolo').vento === 1, 'Crescendo del vento: sp.vento 0 -> 1');
ok(pesca(11, 'Crescendo — Il Vento Gira', { vento: 1 }).vento === 2, 'si sommano: 1 -> 2');
ok(pesca(11, 'Crescendo — La Raffica sulla Guglia').vento === 1, 'anche la Raffica conta');
ok(!pesca(11, 'Danno — Una Tegola in Testa').vento, 'una carta non-vento non lo tocca');
ok(!pesca(2, 'Insidia — Cenere negli Occhi').vento, 'Ep2 («prove di vento» a parole) non lo tocca');

// ---- la Raffica fa cadere il Caposquadra all'ultima Ferita sull'esposto
const raff = (tessera, ferite, titolo = 'Crescendo — La Raffica sulla Guglia') => {
  const g0 = nuova(11, T1, { mazzo: titolo });
  g0.sp.rivelate = ['T1', 'T6']; g0.sp.round = 3;
  g0.sp.nemici = [{ nome: 'IL CAPOSQUADRA', num: 1, ferite, max: 4, pos: { t: tessera, x: 2, y: 2 } }];
  return applica(g0.partita, { tipo: 'fase-minaccia' }, { ep: g0.ep, comune: COMUNE, carte: CARTE }).stato.spedizione;
};
const spR = raff('T6', 3);
ok(spR.esito === 'parziale' && spR.nemici.length === 0, 'Raffica, Caposquadra a 1 Ferita sull esposto: cade, filo perso');
ok(!raff('T3', 3).esito && raff('T3', 3).nemici.length === 1, 'al riparo (T3): non cade');
ok(!raff('T6', 2).esito, 'a 2 Ferite sull esposto: non cade');
ok(!raff('T6', 3, 'Crescendo — Il Primo Refolo').esito, 'un Crescendo senza la clausola della Raffica: non cade');

// ---- Task 2: la coda a inizio round
const fine = (pos, o = {}) => {
  const g = nuova(11, pos, o); g.sp.round = 2; g.sp.fase = 'nemici';
  fineRoundNemici(g, null); return g.sp;
};
let sp = fine(['T1', 'T2', 'T3', 'T3']);
ok(sp.round === 3 && sp.fase === 'eroi' && sp.provaVento && sp.provaVento.round === 3 && JSON.stringify(sp.provaVento.chi) === JSON.stringify([party[1]]), "a fine round: in coda solo chi sta su T2, round nuovo");
sp = fine(['T1', 'T3', 'T3', 'T1']);
ok(!coda(sp).length, 'nessuno esposto: nessuna coda');
sp = fine(['T1', 'T2', 'T3', 'T3'], { vite: [6, 0, 6, 6] });
ok(!coda(sp).length, 'eroe a terra su T2: nessuna coda');
sp = fine(['T1', 'T1', 'T1', 'T1']);
ok(!coda(sp).length, 'round 1 al riparo: coda vuota');

// ---- Task 3: il comando prova-vento e il blocco delle azioni
const conCoda = (o = {}, chi = [party[1]], pos = ['T1', 'T2', 'T3', 'T3']) => {
  const g0 = nuova(11, pos, o); g0.sp.provaVento = { round: 3, chi }; return g0.partita;
};
const manda = (st, c) => applica(st, c, { ep: ep(11), comune: COMUNE, carte: CARTE });
const evTiro = (o) => (o.eventi || []).find((e) => e.tipo === 'tiro' && e.causa === 'vento');
const A = party[1];
let o = manda(conCoda(), { tipo: 'prova-vento', eroe: A, tiri: [[6, 6]] });
ok(!o.rifiuto && evTiro(o).ok === true && evTiro(o).soglia === 7, 'riuscita: nessuna conseguenza, soglia 7 a vento 0');
ok(!coda(o.stato.spedizione).length, 'coda svuotata');
ok(!(o.stato.spedizione.vincoli || {})[A], 'riuscita: nessuno scatto perso');
o = manda(conCoda(), { tipo: 'prova-vento', eroe: A, tiri: [[1, 1]] });
let v = (o.stato.spedizione.vincoli || {})[A];
ok(evTiro(o).ok === false && v && v.scatto === true && v.round === 4, 'fallita: perde lo scatto nel round dopo');
ok(o.stato.spedizione.vite[A] === undefined || o.stato.spedizione.vite[A] === COMUNE.eroi.find((x) => x.nome === A).salute, 'fallita a Salute piena: nessun danno');
o = manda(conCoda({ vite: [6, 1, 6, 6] }), { tipo: 'prova-vento', eroe: A, tiri: [[1, 1]] });
ok(o.stato.spedizione.vite[A] === 0, 'fallita a 1 Ferita: 1 danno da vertigine, a terra');
o = manda(conCoda({ vite: [6, 2, 6, 6] }), { tipo: 'prova-vento', eroe: A, tiri: [[1, 1]] });
ok(o.stato.spedizione.vite[A] === 2, 'fallita a 2 Ferite: nessun danno (solo a 1)');
o = manda(conCoda({ vite: [6, 1, 6, 6], oggetti: ['La Corda del Campanaro'] }), { tipo: 'prova-vento', eroe: A, tiri: [[1, 1]] });
v = (o.stato.spedizione.vincoli || {})[A];
ok(o.stato.spedizione.vite[A] === 1 && v && v.scatto === true, 'con la Corda del Campanaro: niente danno, ma lo scatto si perde');
const bonusDi = (oo) => Object.fromEntries(evTiro(oo).bonus.map((x) => [x.label, x.val]));
o = manda(conCoda({ oggetti: ['Il Taccuino Ordinato'] }), { tipo: 'prova-vento', eroe: A, tiri: [[3, 3]] });
ok(bonusDi(o)['Il Taccuino Ordinato'] === 1, 'il bonus del Taccuino si vede nell\'evento');
o = manda(conCoda(), { tipo: 'prova-vento', eroe: A, tiri: [[3, 3]] });
ok(bonusDi(o).Buio === -1, 'il buio -1 compare sull\'esposta');
o = manda(conCoda({ oggetti: ['La Lanterna da Guglia'] }), { tipo: 'prova-vento', eroe: A, tiri: [[3, 3]] });
ok(bonusDi(o).Buio === undefined, 'con la Lanterna da Guglia il buio sparisce');
const soglia = (vento) => evTiro(manda(conCoda({ vento }), { tipo: 'prova-vento', eroe: A, tiri: [[3, 3]] })).soglia;
ok(soglia(0) === 7 && soglia(1) === 9 && soglia(2) === 11 && soglia(4) === 11, 'soglia 7/9/11 a vento 0/1/2, tetto 11');
o = manda(conCoda(), { tipo: 'prova-vento', eroe: party[0], tiri: [[6, 6]] });
ok(o.rifiuto && /vento/i.test(o.rifiuto.motivo), 'un eroe non in coda: rifiuto');
const bloccati = [{ tipo: 'cerca', eroe: party[0] }, { tipo: 'finisci-eroe', eroe: party[0] }, { tipo: 'fase-minaccia' },
                  { tipo: 'muovi', eroe: party[0], nodo: { t: 'T1', x: 1, y: 1 } }, { tipo: 'attacca', eroe: party[0], bersaglio: 0 },
                  { tipo: 'interagisci', eroe: party[0] }];
for (const c of bloccati) {
  o = manda(conCoda(), c);
  ok(o.rifiuto && /prima le prove del vento/i.test(o.rifiuto.motivo), `con la coda aperta «${c.tipo}» e' rifiutato`);
}
o = manda(conCoda(), { tipo: 'carta-vista' });
ok(!(o.rifiuto && /prima le prove del vento/i.test(o.rifiuto.motivo)), 'carta-vista non e\' bloccata');
const st0 = conCoda(); st0.spedizione.provaVento = undefined; delete st0.spedizione.provaVento;
o = manda(st0, { tipo: 'cerca', eroe: party[0], tiri: [[6, 6]] });
ok(!(o.rifiuto && /prima le prove del vento/i.test(o.rifiuto.motivo)), 'a coda vuota le azioni ripartono');
const dopoCoda = conCoda({}, [A, party[3]], ['T1', 'T2', 'T3', 'T2']);
o = manda(dopoCoda, { tipo: 'prova-vento', eroe: A, tiri: [[6, 6]] });
ok(o.stato.spedizione.provaVento && JSON.stringify(o.stato.spedizione.provaVento.chi) === JSON.stringify([party[3]]), 'con due in coda, ne esce uno solo per volta');
const proi = statoPerPosto(conCoda(), { ruolo: 'giocatore', eroi: [party[0]] });
ok(proi.spedizione.provaVento && proi.spedizione.provaVento.chi[0] === A, 'il telefono vede la coda (sa perche\' e\' fermo)');
ok(readFileSync('webapp/worker/partita-do.js', 'utf8').match(/COMANDI_DI_ARBITRO = new Set\([^)]*'prova-vento'/), 'prova-vento e\' un comando di chi arbitra');

console.log(ko ? `\n${ko} FALLITI` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
