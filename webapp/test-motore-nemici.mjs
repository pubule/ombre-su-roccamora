// DIFFERENZIALE DEL TURNO NEMICI, con il caso reso identico da entrambe le parti.
//
// Il problema: qui il caso decide tutto — chi viene puntato, chi viene colpito,
// se il colpo va a segno. Due implementazioni che tirano dadi diversi danno
// esiti diversi anche se le regole sono le stesse, e il confronto non direbbe
// niente.
//
// La soluzione: si prepara una lista di numeri e la si fa consumare a tutt'e
// due. Il vecchio pesca da `Math.random` (sostituito qui per la durata del
// test), il nuovo dal `caso` che gli si passa. Le due sequenze combaciano
// perche' l'ordine dei consumi e' lo stesso: prima il bersaglio, poi
// l'eventuale scelta fra PNG ed eroe, poi i due dadi.
//
// Si confronta tutto cio' che la notte muove: nemici, vite, PNG scortato, e la
// coda di fine round (canto, traccia, esito, declassamento). Il declassamento
// in particolare — decide se una vittoria e' piena o parziale, e senza
// guardarlo un baco da 0 vittorie piene su 15 passerebbe inosservato.
//
// node webapp/test-motore-nemici.mjs
globalThis.localStorage = { setItem() {}, getItem() { return null }, removeItem() {} };

import { readFileSync, readdirSync } from 'fs';
import { _motore, _diff as vecchio } from './public/js/_oracolo.js';
import * as nuovo from './public/motore/nemici.js';
import * as chiusura from './public/motore/vittoria.js';
import { creaRng, interoFino } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EPISODI = readdirSync('webapp/data')
  .filter((f) => /^(ep\d+|preludio)\.json$/.test(f))
  .map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(`webapp/data/${f}`, 'utf8'))]);
const PARTY = COMUNE.eroi.slice(0, 4).map((e) => e.nome);

// Il rubinetto: una lista di numeri in [0,1) che le due versioni consumano
// nello stesso ordine.
function rubinetto(seme, quanti = 4000) {
  const r = creaRng(seme);
  const v = Array.from({ length: quanti }, () => interoFino(r, 1000000) / 1000000);
  let i = 0;
  return {
    reset() { i = 0; },
    prossimo() { return v[i++ % v.length]; },
    // la faccia che il motore nuovo si aspetta
    caso() {
      return {
        scegli: (n) => Math.floor(this.prossimo() * n),
        tira2d6: () => {
          const a = 1 + Math.floor(this.prossimo() * 6);
          const b = 1 + Math.floor(this.prossimo() * 6);
          return { d: [a, b], tot: a + b };
        },
      };
    },
  };
}

function stato(rng, ep) {
  const tutte = ep.tessere.map((t) => t.id);
  const rivelate = tutte.slice(0, 2 + interoFino(rng, Math.max(1, tutte.length - 1)));
  const cella = () => ({ t: rivelate[interoFino(rng, rivelate.length)],
                         x: interoFino(rng, 4), y: interoFino(rng, 4) });
  const pool = Object.keys(ep.pool || {});
  const scortaSpec = (ep.scortato || [])[0];
  return {
    round: 1 + interoFino(rng, 10), canto: interoFino(rng, 6), fase: 'nemici',
    rivelate, grate: [], log: [], esito: null, compiti: {},
    nemici: Array.from({ length: 1 + interoFino(rng, 6) }, () => {
      const nome = pool.length ? pool[interoFino(rng, pool.length)] : null;
      if (!nome) return null;
      return { nome, num: 1, pos: cella(), ferite: 0, max: 3,
               flash: interoFino(rng, 6) === 0,
               abbattuto: interoFino(rng, 8) === 0 };
    }).filter(Boolean),
    eroiPos: Object.fromEntries(PARTY.map((n) => [n, cella()])),
    vite: Object.fromEntries(PARTY.map((n) => [n, interoFino(rng, 6) ? 2 + interoFino(rng, 6) : 0])),
    scortati: scortaSpec
      ? [{ liberato: !!interoFino(rng, 2), pos: cella(), mosso: false,
           vite: scortaSpec.salute ? 1 + interoFino(rng, 3) : 0 }]
      : [],
    // l'esca in campo: il ramo che porta i nemici via dagli eroi
    esca: interoFino(rng, 4) === 0 ? cella() : null,
    azioni: {}, storditi: {}, eroiFatti: [], bossDestato: false,
  };
}

const rng = creaRng(20260812);
const tap = rubinetto(4242);
let confronti = 0, divergenze = 0, conEsca = 0, conPng = 0, conFlash = 0;

for (let giro = 0; giro < 25 && divergenze < 5; giro++) {
  for (const [id, ep] of EPISODI) {
    if (divergenze >= 5) break;
    const sp = stato(rng, ep);
    if (sp.esca) conEsca++;
    if (sp.scortati.length && sp.scortati[0].liberato) conPng++;
    if (sp.nemici.some((n) => n.flash)) conFlash++;
    const extra = { party: PARTY, comune: COMUNE, episodio: id,
                    indagine: { oggetti: [] }, modo: 'digitale' };

    const spV = JSON.parse(JSON.stringify(sp));
    const spN = JSON.parse(JSON.stringify(sp));

    // --- vecchio: Math.random dirottato sul rubinetto, e l'eccezione del DOM
    // ignorata (lo stato e' gia' mutato quando faseNemiciAI arriva a disegnare)
    const veroRandom = Math.random;
    tap.reset();
    Math.random = () => tap.prossimo();
    _motore._setup(ep, spV, extra);
    try { vecchio.faseNemiciAI(); } catch { /* vistaNemici tocca il DOM: qui non c'e' */ }
    Math.random = veroRandom;

    // --- nuovo: stessa sequenza, presa dal rubinetto riavvolto
    tap.reset();
    const g = { ep, comune: COMUNE, sp: spN,
                partita: { party: PARTY, episodio: id, indagine: { oggetti: [] }, modo: 'digitale' },
                _layout: null };
    const piano = nuovo.pianoNemici(g, tap.caso(), false);
    nuovo.fineRoundNemici(g, piano);
    // …e la chiusura, che nel vecchio faseNemiciAI stava in coda (`if
    // (!piano.differito) chiudiFaseNemici()`): party-wipe e vittoria. Senza,
    // il confronto direbbe che l'esito diverge quando invece e' il test a non
    // averlo chiesto.
    const fine = chiusura.chiudiFaseNemici(g);
    if (fine) { spN.esito = fine.esito; if (fine.riga) spN.log.push(fine.riga); }

    confronti++;
    // Si confronta tutto cio' che il turno della notte puo' muovere: dove sono
    // finiti i nemici, quanta Salute e' rimasta, il PNG scortato, e la coda di
    // fine round — canto, traccia, esito, e il DECLASSAMENTO, che decide se una
    // vittoria e' piena o parziale e che nessun'altra chiave rivelerebbe.
    const foto = (x) => JSON.stringify({
      n: x.nemici, v: x.vite, s: x.scortati,
      canto: x.canto, round: x.round, traccia: x.traccia,
      esito: x.esito, declassato: x.declassato, compiti: x.compiti,
      fase: x.fase, esca: x.esca,
    });
    const vistaV = foto(spV), vistaN = foto(spN);
    if (vistaV !== vistaN) {
      divergenze++;
      const a = JSON.parse(vistaV), b = JSON.parse(vistaN);
      const diverse = Object.keys(a)
        .filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
        .map((k) => `${k}\n       vecchio ${JSON.stringify(a[k])}\n       nuovo   ${JSON.stringify(b[k])}`);
      ok(false, `il turno nemici diverge (${id})`
        + `\n     nemici=${sp.nemici.length} esca=${!!sp.esca} png=${sp.scortati.length}`
        + `\n     ${diverse.join('\n     ')}`);
    }
  }
}

ok(confronti > 400, `il differenziale deve girare molte volte (fatti ${confronti})`);
// I rami rari vanno esercitati, o il confronto prova solo il caso facile.
ok(conEsca > 20, `l'esca dev'essere in campo qualche volta (viste ${conEsca})`);
ok(conFlash > 20, `e qualche nemico accecato (visti ${conFlash})`);

console.log(ko === 0
  ? `TUTTO OK (nemici, ${confronti} turni su ${EPISODI.length} episodi; esca ${conEsca}, flash ${conFlash}, png ${conPng})`
  : `${ko} FAIL su ${confronti} turni`);
process.exit(ko ? 1 : 0);
