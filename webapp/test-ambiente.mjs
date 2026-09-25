import { readFileSync, readdirSync } from 'fs';
import { pavimentoDi, fuoriDi } from './public/motore/ambiente.js';
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
console.log(guai ? `FAIL ${guai}` : `OK ${n} tessere, pavimento e fuori invariati`);
process.exit(guai ? 1 : 0);
