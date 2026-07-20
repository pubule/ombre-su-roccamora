// Self-check del motore multi-tessera della modalita' digitale (digitale.js).
// node webapp/test-digitale.mjs
import { _motore } from './public/js/digitale.js';
const { esploraMosse, camminoGlob, adiacGlob, portaCella, layout, nk, _setup } = _motore;

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// tessere Ep.1 (exits/arredi 1:1 da ep1.json) per il grafo e il pathfinding
const TESS = [
  { id: 'T1', nome: 'Banchina', exits: { N: 'T2' }, start: 'S', arredi: [[0, 3, 'molo'], [3, 3, 'casse']] },
  { id: 'T2', nome: 'Casse', exits: { S: 'T1', E: 'T3', O: 'T4', N: 'T5 (grata: apri)' }, arredi: [[1, 1, 'casse'], [2, 2, 'casse']] },
  { id: 'T3', nome: 'Candele', exits: { O: 'T2' }, arredi: [[0, 0, 'c'], [3, 0, 'c'], [0, 3, 'c'], [3, 3, 'c']] },
  { id: 'T4', nome: 'Ufficio', exits: { E: 'T2' }, arredi: [[1, 3, 's'], [3, 0, 'b']] },
  { id: 'T5', nome: 'Scala', exits: { S: 'T2', N: 'T6' }, arredi: [[1, 1, 's'], [2, 1, 's'], [1, 2, 's'], [2, 2, 's']] },
  { id: 'T6', nome: 'Cripta', exits: { S: 'T5' }, arredi: [[1, 2, 'a'], [2, 2, 'a'], [3, 3, 'cella']] },
];
const ep = { tessere: TESS, cartella: 'Episodio 1', obiettivo: '' };
const mkSp = (over) => ({ rivelate: ['T1'], grate: [], nemici: [], eroiPos: {}, ruggero: { liberato: false, pos: null }, ...over });

// --- layout: T2 a N di T1, T3 a E di T2, ecc.
_setup(ep, mkSp());
const L = layout();
ok(L.T1[0] === 0 && L.T1[1] === 0, 'T1 origine');
ok(L.T2[0] === 0 && L.T2[1] === 1, 'T2 a nord di T1');
ok(L.T3[0] === 1 && L.T3[1] === 1, 'T3 a est di T2');
ok(L.T4[0] === -1 && L.T4[1] === 1, 'T4 a ovest di T2');
ok(L.T5[1] === 2 && L.T6[1] === 3, 'T5, T6 salgono a nord');

// porta S di T1 = ingresso (1,0); porta N di T1 = (1,3)
ok(portaCella(TESS[0], 'S').join() === '1,0', 'ingresso T1 = (1,0)');
ok(portaCella(TESS[0], 'N').join() === '1,3', 'porta N T1 = (1,3)');

// --- reveal: dall'ingresso T1, con budget 4 la porta N raggiunge l'entrata di T2 (coperta)
_setup(ep, mkSp());
let info = esploraMosse({ t: 'T1', x: 1, y: 0 }, 4, new Set());
const revT2 = Object.values(info).find((v) => v.reveal === 'T2');
ok(revT2 && revT2.node.t === 'T2', 'porta N di T1 offre il reveal di T2 (budget 4)');
// con budget 3 non ci si arriva (porta a 3 + attraversamento = 4)
info = esploraMosse({ t: 'T1', x: 1, y: 0 }, 3, new Set());
ok(!Object.values(info).some((v) => v.reveal === 'T2'), 'budget 3 non basta a rivelare T2');

// --- con T2 rivelata, si cammina DENTRO T2 attraversando la porta
_setup(ep, mkSp({ rivelate: ['T1', 'T2'] }));
info = esploraMosse({ t: 'T1', x: 1, y: 0 }, 5, new Set());
ok(Object.values(info).some((v) => v.node.t === 'T2' && !v.reveal), 'con T2 rivelata si entra in T2 a piedi');

// --- grata: la porta N di T2 non si attraversa finche' la grata e' chiusa
const nT2 = portaCella(TESS[1], 'N');
_setup(ep, mkSp({ rivelate: ['T1', 'T2', 'T5'] }));
info = esploraMosse({ t: 'T2', x: nT2[0], y: nT2[1] }, 2, new Set());
ok(!Object.values(info).some((v) => v.node.t === 'T5'), 'grata chiusa: T5 irraggiungibile');
_setup(ep, mkSp({ rivelate: ['T1', 'T2', 'T5'], grate: ['T2-N'] }));
info = esploraMosse({ t: 'T2', x: nT2[0], y: nT2[1] }, 2, new Set());
ok(Object.values(info).some((v) => v.node.t === 'T5'), 'grata aperta: si passa in T5');

// --- adiacenza attraverso la porta T1(N)<->T2(S)
_setup(ep, mkSp({ rivelate: ['T1', 'T2'] }));
ok(adiacGlob({ t: 'T1', x: 1, y: 3 }, { t: 'T2', x: 1, y: 0 }), 'adiac attraverso la porta T1/T2');
ok(!adiacGlob({ t: 'T1', x: 0, y: 0 }, { t: 'T2', x: 3, y: 3 }), 'non adiac tra celle lontane di tessere diverse');

// --- cammino multi-tessera T1 -> T3
_setup(ep, mkSp({ rivelate: ['T1', 'T2', 'T3'] }));
const path = camminoGlob({ t: 'T1', x: 1, y: 0 }, { t: 'T3', x: 1, y: 1 }, new Set());
ok(path.length > 0 && path[path.length - 1].t === 'T3', 'cammino globale T1->T3 arriva in T3');
ok(!path.some((n) => TESS.find((t) => t.id === n.t).arredi.some(([x, y]) => x === n.x && y === n.y)), 'cammino non passa dagli arredi');

console.log(ko === 0 ? 'TUTTO OK (motore multi-tessera)' : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
