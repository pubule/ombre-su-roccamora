// IL NEMICO CHE NON PUO' ARRIVARE ACCANTO A UN EROE SI AVVICINA LO STESSO. Ep.1, round 11 di una
// partita vera (07/10/2026): Elena sulla porta fra T5 e T2, le caselle attorno a lei e a Nino prese
// dagli adepti, lo sgherro nella cripta (T6). Nessuna casella libera accanto a un eroe era
// raggiungibile, e il motore lasciava lo sgherro fermo, round dopo round. La regola: si avvicina.
// node webapp/test-nemico-avvicina.mjs
import { readFileSync } from 'fs';
import { pianoNemici } from './public/motore/nemici.js';
import { distGlob } from './public/motore/griglia.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } else console.log('  ok', m); };
const ep = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8'));
const comune = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const party = ['ELENA FOSCO', 'DOTT. ATTILIO MARN', 'SIBILLA REVE', 'NINO “GRIMALDELLO” CAUTO'];
const partita = { v: 1, episodio: 'ep1', party, fase: 'spedizione' };
const sp = { round: 11, fase: 'eroi', rivelate: ['T1', 'T2', 'T4', 'T5', 'T3', 'T6'], grate: ['T2-N'], log: [], storditi: {},
  vite: Object.fromEntries(party.map((p) => [p, 6])),
  eroiPos: { [party[0]]: { t: 'T5', x: 1, y: 0 }, [party[1]]: { t: 'T2', x: 1, y: 3 }, [party[2]]: { t: 'T2', x: 0, y: 0 }, [party[3]]: { t: 'T5', x: 0, y: 0 } },
  scortati: [{ liberato: true, mosso: false, vite: null, pos: { t: 'T5', x: 3, y: 1 } }],
  nemici: [{ nome: 'ADEPTO INCAPPUCCIATO', num: 1, ferite: 0, max: 1, pos: { t: 'T5', x: 0, y: 1 } },
           { nome: 'ADEPTO INCAPPUCCIATO', num: 2, ferite: 0, max: 1, pos: { t: 'T5', x: 3, y: 3 } },
           { nome: 'LO SGHERRO', num: 1, ferite: 0, max: 2, pos: { t: 'T6', x: 0, y: 3 } }] };
let lay = null;
const g = { ep, comune, sp, partita, get _layout() { return lay; }, set _layout(v) { lay = v; } };
const caso = { scegli: () => 0, tira2d6: () => ({ d: [3, 3], tot: 6 }) };
const prima = { ...sp.nemici[2].pos };
const vicinanza = (n) => Math.min(...party.map((p) => distGlob(g, n, sp.eroiPos[p])));
const d0 = vicinanza(prima);
const piano = pianoNemici(g, caso, true);
const s = piano.find((p) => p.nome === 'LO SGHERRO');
ok(JSON.stringify(s.pos1) !== JSON.stringify(prima), `lo sgherro si muove (da ${JSON.stringify(prima)} a ${JSON.stringify(s.pos1)})`);
ok(vicinanza(s.pos1) < d0, `ed e' piu' vicino a un eroe (${d0} -> ${vicinanza(s.pos1)} passi)`);
ok(!Object.values(sp.eroiPos).some((p) => JSON.stringify(p) === JSON.stringify(s.pos1)), 'non finisce sopra un eroe');
console.log(ko ? `${ko} KO` : 'Tutto verde');
process.exit(ko ? 1 : 0);
