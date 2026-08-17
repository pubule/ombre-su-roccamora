// SETACCIO SUGLI ARREDI, su tutti gli episodi: nessuna casella con un arredo
// deve essere un arrivo possibile — ne' camminandoci dentro, ne' entrando da
// una porta (la cella-porta la sceglie `portaCella`, che gli arredi li guarda
// SPECCHIATI: `3 - gy`).
import { readFileSync, readdirSync } from 'fs';
import * as stat from './public/motore/stat.js';
import { arrediSet, chiave, portaCella, dirExit } from './public/motore/griglia.js';

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const ELENA = COMUNE.eroi.find((e) => e.nome.includes('ELENA')).nome;
const eps = readdirSync('webapp/data').filter((f) => /^ep\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.slice(2), 10) - parseInt(b.slice(2), 10));

let guai = 0;
for (const file of eps) {
  const EP = JSON.parse(readFileSync('webapp/data/' + file, 'utf8'));
  for (const tile of EP.tessere || []) {
    const arredi = (tile.arredi || []).map(([x, y]) => `${x},${y}`);
    if (!arredi.length) continue;
    const g = {
      partita: { party: [ELENA], vantaggi: null, indagine: { oggetti: [] } },
      ep: EP, comune: COMUNE,
      sp: { round: 1, canto: 0, fase: 'eroi', rivelate: [tile.id], grate: [], nemici: [],
            eroiPos: {}, vite: { [ELENA]: 6 }, azioni: {}, storditi: {}, eroiFatti: [],
            eroiAttivo: ELENA, scortati: [], insidie: {}, abilita: {}, compiti: {},
            cercate: {}, log: [] },
    };
    // da OGNI cella libera della tessera: si puo' finire sopra un arredo?
    for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) {
      if (arredi.includes(`${x},${y}`)) continue;
      g.sp.eroiPos[ELENA] = { t: tile.id, x, y };
      g.sp.azioni = {};
      const ragg = stat.raggEroe(g, ELENA);
      const sopra = Object.values(ragg)
        .filter((v) => v.node.t === tile.id && arredi.includes(`${v.node.x},${v.node.y}`));
      if (sopra.length) {
        guai++;
        console.log(`${file} ${tile.id}: da ${x},${y} si arriva sull'arredo`,
                    sopra.map((v) => `${v.node.x},${v.node.y}`).join('/'));
      }
    }
    // e la cella-porta: sta sopra un arredo?
    for (const [dir, raw] of Object.entries(tile.exits || {})) {
      const dc = portaCella(tile, dir);
      if (arredi.includes(`${dc[0]},${dc[1]}`)) {
        guai++;
        console.log(`${file} ${tile.id}: la porta ${dir} (verso ${dirExit(raw)}) cade sull'arredo ${dc[0]},${dc[1]}`);
      }
    }
    if (tile.start) {
      const dc = portaCella(tile, tile.start);
      if (arredi.includes(`${dc[0]},${dc[1]}`)) {
        guai++;
        console.log(`${file} ${tile.id}: l'INGRESSO cade sull'arredo ${dc[0]},${dc[1]}`);
      }
    }
  }
}
if (guai) {
  console.log(`\ntest-arredi: ${guai} punti in cui si finisce sopra un arredo`);
  process.exit(1);
}
console.log('test-arredi: nessun arrivo sopra un arredo, in nessun episodio');
