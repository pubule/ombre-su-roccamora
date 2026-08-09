// Rimisura la mappa dei win% su TUTTI gli episodi, col pilota, in parallelo.
//
// `misura-episodio.mjs` misura un episodio per volta e ci mette qualche minuto:
// ventuno episodi in fila sono un pomeriggio, ed e' il motivo per cui la mappa
// veniva ritoccata a pezzi e letta come se fosse coerente. Gli episodi non si
// contendono niente — ognuno ha la sua chiave di salvataggio — quindi si
// possono lanciare a gruppi.
//
// Serve ogni volta che si tocca il MOTORE e non un singolo episodio: allora la
// domanda non e' «com'e' andato l'Ep. 15», e' «cos'e' cambiato ovunque».
//
//   node webapp/mappa-pilota.mjs [partite] [paralleli] [ep1,ep2,...]
//
// Vuole il server acceso: node webapp/server.js
import { spawn } from 'child_process';
import fs from 'fs';

const N = Number(process.argv[2]) || 12;
const PAR = Number(process.argv[3]) || 4;
const SOLO = (process.argv[4] || '').split(',').filter(Boolean);

const TUTTI = SOLO.length ? SOLO
  : ['preludio', ...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)]
    .filter((id) => fs.existsSync(`webapp/data/${id}.json`));

// la mappa del 20260724, per vedere cosa si e' mosso invece di leggere numeri nudi
const PRIMA = {
  ep1: 65, ep2: 75, ep3: 75, ep4: 60, ep5: 55, ep6: 60, ep7: 30, ep8: 60,
  ep11: 95, ep13: 87, ep14: 100, ep15: 60, ep17: 100, ep18: 100, ep19: 95,
};

function corri(id) {
  return new Promise((risolvi) => {
    const p = spawn('node', ['webapp/misura-episodio.mjs', id, String(N)],
                    { shell: false });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', () => {});
    p.on('close', () => {
      const v = out.match(/VITTORIE (\d+)\/(\d+) = (\d+)%/);
      const valida = /(?<!NON )VALIDA/.test(out);
      const round = (out.match(/round medi ([\d.]+)/) || [])[1];
      risolvi({ id, pct: v ? Number(v[3]) : 0, vinte: v ? v[1] : '0',
                su: v ? v[2] : String(N), valida, round: round || '—' });
    });
  });
}

const coda = [...TUTTI];
const esiti = [];
async function operaio() {
  while (coda.length) {
    const id = coda.shift();
    process.stderr.write(`  ${id}…\n`);
    esiti.push(await corri(id));
  }
}

console.log(`Mappa pilota — ${N} partite per episodio, ${PAR} in parallelo, 4 eroi\n`);
await Promise.all(Array.from({ length: PAR }, operaio));

esiti.sort((a, b) => TUTTI.indexOf(a.id) - TUTTI.indexOf(b.id));
console.log('| episodio | ora | 20260724 | scarto | round | corsa |');
console.log('|---|---|---|---|---|---|');
for (const e of esiti) {
  const p = PRIMA[e.id];
  const scarto = p == null ? '—'
    : (e.pct - p > 0 ? '+' : '') + (e.pct - p) + (Math.abs(e.pct - p) >= 25 ? ' ⚠' : '');
  console.log(`| ${e.id} | ${e.pct}% (${e.vinte}/${e.su}) | ${p == null ? '—' : p + '%'} `
    + `| ${scarto} | ${e.round} | ${e.valida ? 'valida' : 'NON VALIDA'} |`);
}
const rotte = esiti.filter((e) => !e.valida);
if (rotte.length) console.log(`\n${rotte.length} corse NON VALIDE: ${rotte.map((e) => e.id).join(', ')}`);
console.log('\nNB: lo scarto vale solo dove c\'e\' un riferimento. Le letture a N basso'
  + '\noscillano molto sugli episodi party-dipendenti: uno scarto marcato ⚠ va'
  + '\nri-verificato con N piu\' alto PRIMA di ritarare qualcosa.');
