// Quanti round servono ad ATTRAVERSARE la discesa dell'Ep. 20, se non
// succedesse niente: niente nemici, niente carte, niente ricerche. Il pavimento
// geometrico.
//
// Serve a separare due diagnosi che si somigliano. Il pilota misura che il
// gruppo entra nella camera al round ~9,8, e con 5,6 Canto su 8 il finale non
// ha budget. Ma quei dieci round sono distanza o attrito? Se il pavimento e'
// gia' nove o dieci, la discesa e' lunga per costruzione e nessuna carta
// alleggerita la accorcia; se e' quattro, li perde altrove.
//
//   node webapp/misura-cammino-ep20.mjs [epId]
import fs from 'fs';
import { _motore } from './public/js/digitale.js';

const { camminoGlob, esploraMosse, _setup, nk } = _motore;

const EPID = (process.argv[2] || 'ep20').replace(/[^a-z0-9]/gi, '');
const ep = JSON.parse(fs.readFileSync(`webapp/data/${EPID}.json`, 'utf8'));
const PASSO = 3;            // caselle per round (Nino ne fa 4: e' l'eccezione)

const tutte = ep.tessere.map((t) => t.id);
const sp = { rivelate: tutte, nemici: [], compiti: {}, round: 1, canto: 0 };
_setup(ep, sp, {});

// tutte le celle di una tessera, meno gli arredi (che murano il passo)
const celle = (t) => {
  const bloccate = new Set((t.arredi || []).map(([x, y]) => `${x},${y}`));
  const out = [];
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) if (!bloccate.has(`${x},${y}`)) out.push({ t: t.id, x, y });
  }
  return out;
};

// il cammino piu' corto fra due tessere: il minimo su tutte le coppie di celle
const fra = (a, b) => {
  let best = Infinity; let dove = null;
  for (const da of celle(a)) {
    for (const a2 of celle(b)) {
      const p = camminoGlob(da, a2, new Set());
      if (p && p.length && p.length < best) { best = p.length; dove = [da, a2]; }
    }
  }
  return { passi: best, dove };
};

// La regola che decide tutto: `esploraMosse` NON espande oltre una casella che
// rivela una tessera nuova (`if (!nb.reveal) nx.push(...)`). Entrare in una
// tessera coperta chiude il movimento del round, qualunque budget resti. Quindi
// ogni tessera costa almeno due round: uno per entrarci, uno per attraversarla.
// Questa e' la simulazione di un eroe solo che scende nel modo migliore
// possibile, senza nemici, senza carte e senza fermarsi mai a cercare.
function discesaMinima() {
  const meta = ep.tessere[ep.tessere.length - 1].id;
  const t0 = ep.tessere[0];
  const partenza = celle(t0)[celle(t0).length - 1];   // la cella piu' lontana dalla porta
  let sp2 = { rivelate: [t0.id], nemici: [], compiti: {}, round: 1, canto: 0 };
  _setup(ep, sp2, {});
  // oracolo delle distanze: a campo interamente rivelato, quanti passi mancano
  // da ogni casella alla camera. Serve a scegliere la mossa che avvicina, non
  // quella che sconfina — un eroe che entra in una tessera nuova nell'angolo
  // sbagliato ci mette poi un round in piu' ad attraversarla.
  _setup(ep, { rivelate: tutte, nemici: [], compiti: {}, round: 1, canto: 0 }, {});
  const arrivo = celle(ep.tessere[ep.tessere.length - 1])[0];
  const distanza = {};
  for (const t of ep.tessere) {
    for (const c of celle(t)) {
      const p = camminoGlob(c, arrivo, new Set());
      distanza[nk(c)] = p && p.length ? p.length : Infinity;
    }
  }
  _setup(ep, sp2, {});

  let pos = partenza; let round = 0; const tappe = [];
  while (pos.t !== meta && round < 40) {
    round += 1;
    const info = esploraMosse(pos, PASSO, new Set());
    let best = null;
    for (const k of Object.keys(info)) {
      const n = info[k].node; const d = distanza[nk(n)];
      if (d == null || d === Infinity) continue;
      if (!best || d < best.d) best = { n, d, dist: info[k].dist };
    }
    if (!best || (best.n.t === pos.t && best.dist === 0)) break;
    if (!sp2.rivelate.includes(best.n.t)) {
      sp2.rivelate.push(best.n.t);
      tappe.push(`round ${round}: entra in ${best.n.t}`);
      _setup(ep, sp2, {});
    }
    pos = best.n;
  }
  return { round, tappe };
}

console.log(`Cammino della discesa — ${EPID}, ${PASSO} caselle per round, campo sgombro`);
console.log('');
let totale = 0;
for (let i = 0; i < ep.tessere.length - 1; i += 1) {
  const a = ep.tessere[i]; const b = ep.tessere[i + 1];
  const { passi } = fra(a, b);
  totale += passi;
  console.log(`  ${a.id} -> ${b.id}  ${String(passi).padStart(2)} passi  = ${(passi / PASSO).toFixed(1)} round`
    + `   (${b.nome.toLowerCase()})`);
}
const primo = ep.tessere[0]; const ultimo = ep.tessere[ep.tessere.length - 1];
const diretto = fra(primo, ultimo);
console.log('');
console.log(`  somma tessera per tessera:      ${totale} passi = ${(totale / PASSO).toFixed(1)} round`);
console.log(`  cammino diretto ${primo.id} -> ${ultimo.id}:      ${diretto.passi} passi = ${(diretto.passi / PASSO).toFixed(1)} round`);
console.log('');
console.log('  NB: e\' un pavimento, non una previsione. Un gruppo vero non parte dalla');
console.log('  cella migliore, non si muove in fila indiana, e ogni tessera nuova va');
console.log('  rivelata entrandoci. Il confronto utile e\' col round d\'ingresso in T6');
console.log('  che misura il pilota.');
console.log('');
const dm = discesaMinima();
console.log(`  PAVIMENTO VERO (un eroe solo, campo sgombro, mai una sosta): ${dm.round} round`);
dm.tappe.forEach((t) => console.log(`    ${t}`));
