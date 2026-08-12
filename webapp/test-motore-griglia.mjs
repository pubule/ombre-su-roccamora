// DIFFERENZIALE: la griglia estratta deve rispondere esattamente come quella
// che stava dentro digitale.js prima dell'estrazione.
//
// Perche' un differenziale e non dei casi scritti a mano: qui non si sta
// progettando una regola nuova, si sta spostando codice che gia' funziona e
// su cui poggiano ventuno episodi tarati. La domanda non e' «e' giusto?» ma
// «e' identico?», e a quella risponde solo il confronto con l'originale su
// tanti stati quanti se ne riescono a generare.
//
// L'oracolo lo prepara webapp/rigenera-oracolo.sh. E' impalcatura: sparisce a
// fine Fase 1 insieme a questo file.
//
// node webapp/test-motore-griglia.mjs
globalThis.localStorage = { setItem() {}, getItem() { return null }, removeItem() {} };

import { _diff as vecchio, _motore } from './public/js/_oracolo.js';
import * as nuovo from './public/motore/griglia.js';
import { creaRng, interoFino } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// Le stesse tessere di test-digitale.mjs: exits e arredi 1:1 dall'Ep.1, con
// una grata (T2-N) e una cella (T6) perche' i rami speciali siano esercitati.
const TESS = [
  { id: 'T1', nome: 'Banchina', exits: { N: 'T2' }, start: 'S', arredi: [[0, 3, 'molo'], [3, 3, 'casse']] },
  { id: 'T2', nome: 'Casse', exits: { S: 'T1', E: 'T3', O: 'T4', N: 'T5 (grata: apri)' }, arredi: [[1, 1, 'casse'], [2, 2, 'casse']] },
  { id: 'T3', nome: 'Candele', exits: { O: 'T2' }, arredi: [[0, 0, 'c'], [3, 0, 'c'], [0, 3, 'c'], [3, 3, 'c']] },
  { id: 'T4', nome: 'Ufficio', exits: { E: 'T2' }, arredi: [[1, 3, 's'], [3, 0, 'b']] },
  { id: 'T5', nome: 'Scala', exits: { S: 'T2', N: 'T6' }, arredi: [[1, 1, 's'], [2, 1, 's'], [1, 2, 's'], [2, 2, 's']] },
  { id: 'T6', nome: 'Cripta', exits: { S: 'T5' }, arredi: [[1, 2, 'a'], [2, 2, 'a'], [3, 3, 'cella']] },
];
const EP = { tessere: TESS, cartella: 'Episodio 1', obiettivo: '' };
const PARTY = ['ELENA FOSCO', 'OTTONE BRERA'];

// Stati di spedizione plausibili e vari: quante tessere sono rivelate, se la
// grata e' aperta, dove stanno eroi nemici e PNG, se l'uscita segreta e' stata
// trovata. Sono le cinque cose da cui la geometria dipende.
function statoCasuale(rng) {
  const quante = 1 + interoFino(rng, TESS.length);
  const rivelate = TESS.slice(0, quante).map((t) => t.id);
  const cella = () => ({ t: rivelate[interoFino(rng, rivelate.length)],
                         x: interoFino(rng, 4), y: interoFino(rng, 4) });
  return {
    rivelate,
    grate: interoFino(rng, 2) ? ['T2-N'] : [],
    nemici: Array.from({ length: interoFino(rng, 5) },
      () => ({ nome: 'SGHERRO', pos: cella(), ferite: 0, max: 2 })),
    eroiPos: Object.fromEntries(PARTY.map((n) => [n, cella()])),
    scortati: [{ liberato: interoFino(rng, 2) === 0, pos: cella() }],
    uscita: interoFino(rng, 3) === 0 ? { tile: 'T6', cella: [3, 3], aperta: true } : null,
    vite: { 'ELENA FOSCO': 6, 'OTTONE BRERA': 7 },
    round: 1 + interoFino(rng, 9),
    fase: 'eroi',
    azioni: {},
  };
}

const rng = creaRng(20260812);
let confronti = 0, divergenze = 0;

for (let i = 0; i < 1500 && divergenze < 6; i++) {
  const sp = statoCasuale(rng);
  // due copie indipendenti: nessuna delle due implementazioni deve poter
  // vedere le mutazioni dell'altra
  _motore._setup(EP, JSON.parse(JSON.stringify(sp)), { party: PARTY });
  const g = { ep: EP, sp: JSON.parse(JSON.stringify(sp)), partita: { party: PARTY }, _layout: null };

  const dentroRiv = () => ({ t: sp.rivelate[interoFino(rng, sp.rivelate.length)],
                             x: interoFino(rng, 4), y: interoFino(rng, 4) });
  const a = dentroRiv(), b = dentroRiv();
  const budget = 1 + interoFino(rng, 6);
  const tile = TESS[interoFino(rng, TESS.length)];
  const dir = ['N', 'S', 'E', 'O'][interoFino(rng, 4)];
  const blocco = new Set(sp.nemici.filter((n) => n.pos).map((n) => `${n.pos.t},${n.pos.x},${n.pos.y}`));

  const casi = [
    ['layout', () => vecchio.layout(), () => nuovo.layout(g)],
    ['nk', () => vecchio.nk(a), () => nuovo.nk(a)],
    ['chiave', () => vecchio.chiave([a.x, a.y]), () => nuovo.chiave([a.x, a.y])],
    ['dentro', () => vecchio.dentro([a.x, a.y]), () => nuovo.dentro([a.x, a.y])],
    ['dirExit', () => vecchio.dirExit('T5 (grata: apri)'), () => nuovo.dirExit('T5 (grata: apri)')],
    ['portaCella', () => vecchio.portaCella(tile, dir), () => nuovo.portaCella(tile, dir)],
    ['dirVerso', () => vecchio.dirVerso(tile, b.t), () => nuovo.dirVerso(tile, b.t)],
    ['tileDi', () => vecchio.tileDi(a.t)?.id, () => nuovo.tileDi(g, a.t)?.id],
    ['arrediSet', () => [...vecchio.arrediSet(tile)].sort(), () => [...nuovo.arrediSet(g, tile)].sort()],
    ['grataChiusa', () => vecchio.grataChiusa('T2', 'N', 'T5 (grata: apri)'),
                    () => nuovo.grataChiusa(g, 'T2', 'N', 'T5 (grata: apri)')],
    ['viciniGlob(reveal)', () => vecchio.viciniGlob(a, true), () => nuovo.viciniGlob(g, a, true)],
    ['viciniGlob(no)', () => vecchio.viciniGlob(a, false), () => nuovo.viciniGlob(g, a, false)],
    ['esploraMosse', () => vecchio.esploraMosse(a, budget, new Set(blocco)),
                     () => nuovo.esploraMosse(g, a, budget, new Set(blocco))],
    ['camminoGlob', () => vecchio.camminoGlob(a, b, new Set(blocco)),
                    () => nuovo.camminoGlob(g, a, b, new Set(blocco))],
    ['adiacGlob', () => vecchio.adiacGlob(a, b), () => nuovo.adiacGlob(g, a, b)],
    ['celleAdiacLibere', () => vecchio.celleAdiacLibere(a, new Set(blocco)),
                         () => nuovo.celleAdiacLibere(g, a, new Set(blocco))],
    ['celleLibereTile', () => vecchio.celleLibereTile(tile, [1, 1], 3, new Set()),
                        () => nuovo.celleLibereTile(g, tile, [1, 1], 3, new Set())],
    ['occupati()', () => [...vecchio.occupati()].sort(), () => [...nuovo.occupati(g)].sort()],
    ['occupati(escl,nem)', () => [...vecchio.occupati(`E:${PARTY[0]}`, true, true)].sort(),
                           () => [...nuovo.occupati(g, `E:${PARTY[0]}`, true, true)].sort()],
    ['distGlob', () => vecchio.distGlob(a, b), () => nuovo.distGlob(g, a, b)],
  ];

  for (const [nome, vecchia, nuova] of casi) {
    let va, vb;
    try { va = JSON.stringify(vecchia()); } catch (e) { va = 'ERR:' + e.message; }
    try { vb = JSON.stringify(nuova()); } catch (e) { vb = 'ERR:' + e.message; }
    confronti++;
    if (va !== vb) {
      divergenze++;
      ok(false, `${nome} diverge allo stato #${i}`
        + `\n     stato:   ${JSON.stringify({ riv: sp.rivelate, grate: sp.grate, nem: sp.nemici.length })}`
        + `\n     a=${JSON.stringify(a)} b=${JSON.stringify(b)} budget=${budget} tile=${tile.id} dir=${dir}`
        + `\n     vecchio: ${String(va).slice(0, 240)}`
        + `\n     nuovo:   ${String(vb).slice(0, 240)}`);
    }
  }
}

// Un differenziale che non confronta niente passa sempre. Qui si pretende che
// abbia davvero girato.
ok(confronti > 20000, `il differenziale deve fare molti confronti (fatti ${confronti})`);

console.log(ko === 0 ? `TUTTO OK (griglia, ${confronti} confronti)` : `${ko} FAIL su ${confronti} confronti`);
process.exit(ko ? 1 : 0);
