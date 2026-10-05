// REGOLA DEL VENTO (Ep.11): modificatori puri. node webapp/test-vento.mjs
import { readFileSync } from 'fs';
import { ventoAttivo, gradiniVento, buioMalus, bonusVento, eroiInProva } from './public/motore/vento.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const CARTE = JSON.parse(readFileSync('webapp/data/carte.json', 'utf8'));
const EP = {}; const ep = (n) => (EP[n] = EP[n] || JSON.parse(readFileSync(`webapp/data/ep${n}.json`, 'utf8')));
const party = COMUNE.eroi.slice(0, 4).map((e) => e.nome);

// pos: tessera di ciascun eroe, nell'ordine del party
const nuova = (n, pos, { oggetti = [], vento, risposte, vite } = {}) => {
  const eroiPos = {}; const v = {};
  party.forEach((nm, i) => { eroiPos[nm] = { t: pos[i], x: i, y: 0 }; if (vite && vite[i] !== undefined) v[nm] = vite[i]; });
  const s = {
    v: 1, episodio: `ep${n}`, modo: 'digitale', party, fase: 'spedizione',
    indagine: { oggetti, caricheUsate: {}, chiusa: true },
    vantaggi: { tier: 'preparati', ...(risposte ? { risposte } : {}) },
    spedizione: { round: 3, fase: 'eroi', rivelate: ['T1'], nemici: [], log: [], eroiPos, vite: v, ...(vento !== undefined ? { vento } : {}) },
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

console.log(ko ? `\n${ko} FALLITI` : '\nTutto verde.');
process.exit(ko ? 1 : 0);
