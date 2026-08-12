// DIFFERENZIALE: le statistiche derivate estratte devono rispondere esattamente
// come quelle che stavano dentro digitale.js.
//
// Sono i numeri che decidono quanto dura una serata — Salute massima per taglia
// e vantaggio d'Indagine, durezza dei nemici per episodio, azioni per round,
// dove si arriva muovendo. Sbagliarne uno di uno sposta il bilanciamento di
// tutti e ventuno gli episodi senza che nessun test di comportamento se ne
// accorga: per questo il confronto e' con l'originale, e su stati generati.
//
// Oracolo: webapp/rigenera-oracolo.sh. Impalcatura, sparisce a fine Fase 1.
//
// node webapp/test-motore-stat.mjs
globalThis.localStorage = { setItem() {}, getItem() { return null }, removeItem() {} };

import { readFileSync } from 'fs';
import { _diff as vecchio, _motore } from './public/js/_oracolo.js';
import * as nuovo from './public/motore/stat.js';
import { creaRng, interoFino } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// Dati veri: le statistiche di eroi e nemici sono quelle stampate sulle carte,
// e le formule ci girano sopra. Con dati finti si proverebbe l'aritmetica, non
// il gioco.
const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EROI = COMUNE.eroi.map((e) => e.nome);
const NEMICI = COMUNE.nemici.map((n) => n.nome);

const TESS = [
  { id: 'T1', nome: 'Banchina', exits: { N: 'T2' }, start: 'S', arredi: [[0, 3, 'molo'], [3, 3, 'casse']] },
  { id: 'T2', nome: 'Casse', exits: { S: 'T1', E: 'T3', O: 'T4', N: 'T5 (grata: apri)' }, arredi: [[1, 1, 'casse'], [2, 2, 'casse']] },
  { id: 'T3', nome: 'Candele', exits: { O: 'T2' }, arredi: [[0, 0, 'c'], [3, 0, 'c'], [0, 3, 'c'], [3, 3, 'c']] },
  { id: 'T4', nome: 'Ufficio', exits: { E: 'T2' }, arredi: [[1, 3, 's'], [3, 0, 'b']] },
  { id: 'T5', nome: 'Scala', exits: { S: 'T2', N: 'T6' }, arredi: [[1, 1, 's'], [2, 1, 's'], [1, 2, 's'], [2, 2, 's']] },
  { id: 'T6', nome: 'Cripta', exits: { S: 'T5' }, arredi: [[1, 2, 'a'], [2, 2, 'a'], [3, 3, 'cella']] },
];

// Le leve da cui questi calcoli dipendono, tutte mosse insieme: taglia del
// gruppo, esito d'Indagine, tarature d'episodio, storditi, slancio al primo
// round, chi ha gia' agito, chi e' a terra, la Voce Ferma accesa o spenta.
function scenario(rng) {
  const taglia = 2 + interoFino(rng, 9);                      // da 2 a 10, le taglie vere
  const party = EROI.slice().sort(() => interoFino(rng, 3) - 1).slice(0, taglia);
  const tier = ['slancio', 'preparati', 'nessuno'][interoFino(rng, 3)];

  const ep = {
    tessere: TESS, cartella: 'Episodio 1',
    salute_extra: interoFino(rng, 3),                          // 0, 1 o 2
    nemici_mod: interoFino(rng, 3) === 0
      ? { tutti: { dan: -1 } }
      : (interoFino(rng, 2) ? { [NEMICI[0]]: { dif: 1, fer: -1 } } : null),
    scortato: interoFino(rng, 2)
      ? [{ nome: 'RUGGERO', tile: 'T6', meta: 'T1', mov: 3 }] : [],
  };

  const rivelate = TESS.slice(0, 1 + interoFino(rng, TESS.length)).map((t) => t.id);
  const cella = () => ({ t: rivelate[interoFino(rng, rivelate.length)],
                         x: interoFino(rng, 4), y: interoFino(rng, 4) });
  const round = 1 + interoFino(rng, 9);

  const sp = {
    round, fase: interoFino(rng, 5) ? 'eroi' : 'nemici',
    rivelate, grate: interoFino(rng, 2) ? ['T2-N'] : [],
    nemici: Array.from({ length: interoFino(rng, 5) },
      () => ({ nome: NEMICI[interoFino(rng, NEMICI.length)], pos: cella(), ferite: 0, max: 2 })),
    eroiPos: Object.fromEntries(party.map((n) => [n, cella()])),
    // qualcuno a terra: cambia chi e' l'eroe attivo e chi tiene la Voce Ferma
    vite: Object.fromEntries(party.map((n) => [n, interoFino(rng, 5) ? 1 + interoFino(rng, 8) : 0])),
    azioni: Object.fromEntries(party.filter(() => interoFino(rng, 2))
      .map((n) => [n, ['muovere', 'attaccare'].slice(0, 1 + interoFino(rng, 2))])),
    storditi: interoFino(rng, 3) === 0 ? { [party[0]]: round } : {},
    eroiFatti: party.filter(() => interoFino(rng, 3) === 0),
    eroiAttivo: interoFino(rng, 2) ? party[interoFino(rng, party.length)] : null,
    scortati: ep.scortato.length
      ? [{ liberato: !!interoFino(rng, 2), pos: cella(), mosso: !!interoFino(rng, 2) }] : [],
    scortAttivo: (ep.scortato.length && interoFino(rng, 4) === 0) ? 0 : null,
    voceFerma: interoFino(rng, 2)
      ? { da: party[interoFino(rng, party.length)], round: round - interoFino(rng, 3) } : null,
    uscita: null,
  };

  return { ep, sp, party, tier };
}

const rng = creaRng(20260812);
let confronti = 0, divergenze = 0;

for (let i = 0; i < 1200 && divergenze < 6; i++) {
  const { ep, sp, party, tier } = scenario(rng);
  const extra = { party, comune: COMUNE, vantaggi: { tier } };

  _motore._setup(ep, JSON.parse(JSON.stringify(sp)), extra);
  const g = { ep, comune: COMUNE, sp: JSON.parse(JSON.stringify(sp)),
              partita: { party, vantaggi: { tier } }, _layout: null };

  const nm = party[interoFino(rng, party.length)];
  const nemico = NEMICI[interoFino(rng, NEMICI.length)];
  const st = COMUNE.nemici[interoFino(rng, NEMICI.length)];

  const casi = [
    ['eroe', () => vecchio.eroe(nm)?.nome, () => nuovo.eroe(g, nm)?.nome],
    ['nemStat', () => vecchio.nemStat(nemico), () => nuovo.nemStat(g, nemico)],
    ['movimento', () => vecchio.movimento(nm), () => nuovo.movimento(g, nm)],
    ['fascia', () => vecchio.fascia(party.length), () => nuovo.fascia(g, party.length)],
    ['feriteMaxNem', () => vecchio.feriteMaxNem(st), () => nuovo.feriteMaxNem(g, st)],
    ['saluteMax', () => vecchio.saluteMax(vecchio.eroe(nm)), () => nuovo.saluteMax(g, nuovo.eroe(g, nm))],
    ['specScortati', () => vecchio.specScortati(), () => nuovo.specScortati(g)],
    ['specScort(0)', () => vecchio.specScort(0), () => nuovo.specScort(g, 0)],
    ['statoScortati', () => vecchio.statoScortati(), () => nuovo.statoScortati(g)],
    ['scortAttivo', () => vecchio.scortAttivo(), () => nuovo.scortAttivo(g)],
    ['primo', () => vecchio.primo(nm), () => nuovo.primo(nm)],
    ['eroiAttivoNome', () => vecchio.eroiAttivoNome(), () => nuovo.eroiAttivoNome(g)],
    ['azioniOf', () => vecchio.azioniOf(nm), () => nuovo.azioniOf(g, nm)],
    ['azioneSpesa', () => vecchio.azioneSpesa(nm, 'muovere'), () => nuovo.azioneSpesa(g, nm, 'muovere')],
    ['stordito', () => !!vecchio.stordito(nm), () => !!nuovo.stordito(g, nm)],
    ['azioniMax', () => vecchio.azioniMax(nm), () => nuovo.azioniMax(g, nm)],
    ['azioniRestano', () => vecchio.azioniRestano(nm), () => nuovo.azioniRestano(g, nm)],
    ['bonusVoce nervi', () => vecchio.bonusVoce(nm, 'nervi'), () => nuovo.bonusVoce(g, nm, 'nervi')],
    ['bonusVoce vigore', () => vecchio.bonusVoce(nm, 'vigore'), () => nuovo.bonusVoce(g, nm, 'vigore')],
    ['raggEroe', () => vecchio.raggEroe(nm), () => nuovo.raggEroe(g, nm)],
    ['celleEsca', () => vecchio.celleEsca(nm), () => nuovo.celleEsca(g, nm)],
    ['raggScortato(0)', () => vecchio.raggScortato(0), () => nuovo.raggScortato(g, 0)],
  ];

  for (const [nome, vecchia, nuova] of casi) {
    let va, vb;
    try { va = JSON.stringify(vecchia()); } catch (e) { va = 'ERR:' + e.message; }
    try { vb = JSON.stringify(nuova()); } catch (e) { vb = 'ERR:' + e.message; }
    confronti++;
    if (va !== vb) {
      divergenze++;
      ok(false, `${nome} diverge allo scenario #${i}`
        + `\n     taglia=${party.length} tier=${tier} round=${sp.round} fase=${sp.fase}`
        + `\n     salute_extra=${ep.salute_extra} nemici_mod=${JSON.stringify(ep.nemici_mod)}`
        + `\n     eroe=${nm} azioni=${JSON.stringify(sp.azioni[nm])} stordito=${JSON.stringify(sp.storditi)}`
        + `\n     vecchio: ${String(va).slice(0, 240)}`
        + `\n     nuovo:   ${String(vb).slice(0, 240)}`);
    }
  }
}

// Un differenziale che non confronta niente passa sempre.
ok(confronti > 20000, `il differenziale deve fare molti confronti (fatti ${confronti})`);

console.log(ko === 0 ? `TUTTO OK (stat, ${confronti} confronti)` : `${ko} FAIL su ${confronti} confronti`);
process.exit(ko ? 1 : 0);
