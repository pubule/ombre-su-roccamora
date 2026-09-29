import { readFileSync, readdirSync } from 'fs';
import { pavimentoDi, fuoriDi, alAperto, fuoriDichiarato } from './public/motore/ambiente.js';
const atteso = JSON.parse(readFileSync('webapp/test-ambiente.atteso.json', 'utf8'));
let guai = 0, n = 0;
for (const f of readdirSync('webapp/data').filter((f) => /^(ep\d+|preludio)\.json$/.test(f))) {
  for (const t of JSON.parse(readFileSync('webapp/data/' + f, 'utf8')).tessere) {
    n++; const a = atteso[`${f}:${t.id}`];
    const v = { pav: pavimentoDi(t), fuori: fuoriDi(t) };
    if (v.pav !== a.pav || v.fuori !== a.fuori) { guai++; console.error(`${f}:${t.id} ${t.nome}`, v, 'atteso', a); }
  }
}
if (n !== 127) { guai++; console.error('tessere contate', n, 'attese 127'); }

const no = (msg) => { guai++; console.error(msg); };
const ep1 = JSON.parse(readFileSync('webapp/data/ep1.json', 'utf8')).tessere;
const ep11 = JSON.parse(readFileSync('webapp/data/ep11.json', 'utf8')).tessere;
const tile = (arr, id) => arr.find((t) => t.id === id);

const t1 = tile(ep1, 'T1');
if (fuoriDichiarato(t1) !== 'acqua') no(`fuoriDichiarato(ep1:T1) atteso 'acqua', ottenuto ${fuoriDichiarato(t1)}`);
for (const id of ['T2', 'T3', 'T4', 'T5', 'T6']) {
  const t = tile(ep1, id);
  if (fuoriDichiarato(t) !== null) no(`fuoriDichiarato(ep1:${id}) atteso null, ottenuto ${fuoriDichiarato(t)}`);
}
for (const id of ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']) {
  const t = tile(ep11, id);
  if (alAperto(t) !== true) no(`alAperto(ep11:${id}) atteso true, ottenuto ${alAperto(t)}`);
}
for (const id of ['T2', 'T6']) {
  const t = tile(ep1, id);
  if (alAperto(t) !== false) no(`alAperto(ep1:${id}) atteso false, ottenuto ${alAperto(t)}`);
}

// Fix Task 8/ep8 (29/09/2026): alAperto() testava la riga dei tetti isolata,
// ignorando che «tettoia» contiene «tetto» ma «chiatt» (acqua) vince prima
// nell'elenco ordinato — stessa logica di fuoriDichiarato(), ora condivisa.
// «La Tettoia delle Chiatte» e' coperta, con due uscite vere: non e' un tetto.
const ep8 = JSON.parse(readFileSync('webapp/data/ep8.json', 'utf8')).tessere;
const ep8t2 = tile(ep8, 'T2');
if (alAperto(ep8t2) !== false) no(`alAperto(ep8:T2 «La Tettoia delle Chiatte») atteso false, ottenuto ${alAperto(ep8t2)}`);
if (fuoriDichiarato(ep8t2) !== 'acqua') no(`fuoriDichiarato(ep8:T2) atteso 'acqua', ottenuto ${fuoriDichiarato(ep8t2)}`);

console.log(guai ? `FAIL ${guai}` : `OK ${n} tessere, pavimento e fuori invariati`);
process.exit(guai ? 1 : 0);
