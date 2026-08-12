// DIFFERENZIALE: lo spawn estratto deve mettere in campo esattamente gli stessi
// nemici, negli stessi posti, dell'originale.
//
// «Negli stessi posti» non e' pignoleria: la casella in cui compare uno sgherro
// decide se il gruppo se lo trova addosso al round dopo o se ha il tempo di
// arrivare alla porta. E la scelta e' deterministica (la casella piu' lontana
// dagli eroi presenti, a parita' la prima trovata), quindi si puo' confrontare
// esattamente.
//
// Si gira sui DATI VERI di tutti e ventuno gli episodi, perche' le espressioni
// regolari dello spawn leggono i testi delle tessere: su tessere finte non si
// proverebbe niente di quello che succede al tavolo.
//
// node webapp/test-motore-minaccia.mjs
globalThis.localStorage = { setItem() {}, getItem() { return null }, removeItem() {} };

import { readFileSync, readdirSync } from 'fs';
import { _diff as vecchio, _motore } from './public/js/_oracolo.js';
import * as nuovo from './public/motore/minaccia.js';
import { creaRng, interoFino } from './public/motore/rng.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const EPISODI = readdirSync('webapp/data')
  .filter((f) => /^(ep\d+|preludio)\.json$/.test(f))
  .map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(`webapp/data/${f}`, 'utf8'))]);
const PARTY = ['ELENA FOSCO', 'OTTONE BRERA', 'NINO MORA', 'CARLA PIETRASANTA']
  .filter((n) => COMUNE.eroi.some((e) => e.nome === n));

function stato(rng, ep) {
  const tutte = ep.tessere.map((t) => t.id);
  const rivelate = tutte.slice(0, 1 + interoFino(rng, tutte.length));
  const cella = () => ({ t: rivelate[interoFino(rng, rivelate.length)],
                         x: interoFino(rng, 4), y: interoFino(rng, 4) });
  const pool = Object.keys(ep.pool || {});
  return {
    round: 1 + interoFino(rng, 12), canto: interoFino(rng, 9), fase: 'nemici',
    rivelate, grate: [], log: [], esito: null, compiti: {},
    nemici: Array.from({ length: interoFino(rng, 4) }, () => {
      const nome = pool.length ? pool[interoFino(rng, pool.length)] : null;
      return nome ? { nome, num: 1, pos: cella(), ferite: 0, max: 2 } : null;
    }).filter(Boolean),
    eroiPos: Object.fromEntries(PARTY.map((n) => [n, cella()])),
    vite: Object.fromEntries(PARTY.map((n) => [n, 1 + interoFino(rng, 7)])),
    scortati: [], azioni: {}, storditi: {}, eroiFatti: [],
    bossDestato: interoFino(rng, 4) === 0,
  };
}

const rng = creaRng(20260812);
let confronti = 0, divergenze = 0, conTesti = 0;

for (let giro = 0; giro < 40 && divergenze < 6; giro++) {
  for (const [id, ep] of EPISODI) {
    if (divergenze >= 6) break;
    const sp = stato(rng, ep);
    const extra = { party: PARTY, comune: COMUNE, episodio: id, indagine: { oggetti: [] } };
    const tileId = sp.rivelate[interoFino(rng, sp.rivelate.length)];
    // il testo vero di una tessera vera: e' li' che vivono le espressioni regolari
    const tile = ep.tessere.find((t) => t.id === tileId) || {};
    const testo = tile.testo || '';
    if (testo) conTesti++;
    const nomePool = Object.keys(ep.pool || {})[0];

    const casi = [
      ['spawnRegex', (V, g) => (V ? vecchio.spawnRegex() : nuovo.spawnRegex(g)).map(([n, r]) => [n, String(r)])],
      ['tessLontana', (V, g) => V ? vecchio.tessLontana() : nuovo.tessLontana(g)],
      ['tileAffollata', (V, g) => V ? vecchio.tileAffollata() : nuovo.tileAffollata(g)],
      ['spawnUno', (V, g) => nomePool
        ? (V ? vecchio.spawnUno(nomePool, tileId) : nuovo.spawnUno(g, nomePool, tileId)) : null],
      ['destaBossSeSoglia', (V, g) => V ? vecchio.destaBossSeSoglia() : nuovo.destaBossSeSoglia(g)],
      ['spawnDaTesto', (V, g) => V ? vecchio.spawnDaTesto(testo, tileId) : nuovo.spawnDaTesto(g, testo, tileId)],
    ];

    for (const [nome, esegui] of casi) {
      const spV = JSON.parse(JSON.stringify(sp));
      const spN = JSON.parse(JSON.stringify(sp));

      _motore._setup(ep, spV, extra);
      let rV, rN;
      try { rV = JSON.stringify(esegui(true, null)); } catch (e) { rV = 'ERR:' + e.message; }

      const g = { ep, comune: COMUNE, sp: spN,
                  partita: { party: PARTY, episodio: id, indagine: { oggetti: [] } }, _layout: null };
      try { rN = JSON.stringify(esegui(false, g)); } catch (e) { rN = 'ERR:' + e.message; }

      confronti++;
      // conta il ritorno E il campo che lascia: chi compare, dove, con quante ferite
      const campoV = JSON.stringify({ n: spV.nemici, b: spV.bossDestato, l: spV.log });
      const campoN = JSON.stringify({ n: spN.nemici, b: spN.bossDestato, l: spN.log });
      if (rV !== rN || campoV !== campoN) {
        divergenze++;
        const che = rV !== rN ? 'il ritorno' : 'il campo che lascia';
        ok(false, `${nome} (${id}): diverge ${che}`
          + `\n     tile=${tileId} canto=${sp.canto} rivelate=${sp.rivelate.join(',')} bossDestato=${sp.bossDestato}`
          + `\n     vecchio: ${(rV !== rN ? rV : campoV).slice(0, 300)}`
          + `\n     nuovo:   ${(rV !== rN ? rN : campoN).slice(0, 300)}`);
      }
    }
  }
}

ok(confronti > 4000, `il differenziale deve fare molti confronti (fatti ${confronti})`);
ok(conTesti > 200, `e girare su tessere che un testo ce l'hanno davvero (viste ${conTesti})`);

// --- IL RAMO BOSS DI spawnRegex E' INERTE, e qui si dice a voce alta.
// `spawnRegex` costruisce un'espressione diversa per il boss (nome intero
// invece della sola radice), ma itera su `ep.pool` — e nessuno dei ventuno
// episodi ci mette dentro il boss: quello compare da `soluzione.boss_tile`,
// come dice il commento. Quindi oggi quel ramo non si percorre mai, e
// sabotarlo non fa fallire niente. Non si toglie — un episodio futuro potrebbe
// volerlo — ma se qualcuno ce lo mette, questo controllo lo fa sapere invece
// di lasciare che una regola non provata diventi di colpo viva.
{
  const conBossNelPool = EPISODI.filter(([, ep]) =>
    (ep.soluzione || {}).boss && Object.keys(ep.pool || {}).includes(ep.soluzione.boss));
  if (conBossNelPool.length) {
    console.log(`  NB: ${conBossNelPool.map(([id]) => id).join(', ')} mettono il boss in ep.pool:`
      + ' il ramo boss di spawnRegex ora e\' vivo e va provato per davvero.');
  }
  ok(true, 'nota sul ramo boss registrata');
}

console.log(ko === 0 ? `TUTTO OK (minaccia, ${confronti} confronti su ${EPISODI.length} episodi)` : `${ko} FAIL su ${confronti} confronti`);
process.exit(ko ? 1 : 0);
