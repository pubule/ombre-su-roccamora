// QUANTE TESSERE SI RIESCONO A COMPORRE, e con cosa.
//
// Uso: node webapp/_copertura-vtt.mjs [webapp/vtt|webapp/vtt-2m] [--misto]
//
// Gira su tutte le 127 tessere dei 21 episodi e, per ognuna, dice: che
// pavimento le tocca, quali arredi ha, e se ognuno di quelli ha davvero un
// disegno in `webapp/vtt/` — cioe' se la tessera esce dipinta o con le sagome
// di ripiego. Sceglie anche un campione: la prima tessera di ogni ambiente,
// piu' quelle che portano un arredo che altrove non compare.
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { pavimentoDi } from '../scripts/tiles/pittura-vtt.js';

const EPISODI = ['preludio', ...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)];
const DIR = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'webapp/vtt';
const MISTO = process.argv.includes('--misto');
// stessa regola di pittura-vtt.js: se manca nella libreria scelta, e il misto e'
// acceso, lo tappa Forgotten Adventures
const c_e = (tipo, nome) => existsSync(`${DIR}/${tipo}/${nome}.png`)
  || (MISTO && existsSync(`webapp/vtt/${tipo}/${nome}.png`));
const arte = (chiave) => c_e('arredi', chiave);
const pav = (nome) => c_e('pavimenti', nome);

const perAmbiente = new Map();
const perArredo = new Map();
const tessere = [];

for (const ep of EPISODI) {
  const d = JSON.parse(readFileSync(`webapp/data/${ep}.json`, 'utf8'));
  for (const t of d.tessere || []) {
    const p = pavimentoDi(t);
    const chiavi = [...new Set((t.arredi || []).map((a) => String(a[2]).toLowerCase()))];
    const dipinta = pav(p) && chiavi.every(arte);
    tessere.push({ ep, id: t.id, nome: t.nome, pav: p, chiavi, dipinta });
    if (!perAmbiente.has(p)) perAmbiente.set(p, []);
    perAmbiente.get(p).push(`${ep}/${t.id}`);
    for (const k of chiavi) {
      if (!perArredo.has(k)) perArredo.set(k, []);
      perArredo.get(k).push(`${ep}/${t.id}`);
    }
  }
}

const dipinte = tessere.filter((t) => t.dipinta).length;
console.log(`libreria: ${DIR}${MISTO ? ' + FA a tappare' : ''}`);
console.log(`tessere: ${tessere.length} · componibili tutte dipinte: ${dipinte}`);
console.log('\nambienti:');
for (const [p, l] of [...perAmbiente].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${p.padEnd(11)} ${String(l.length).padStart(3)} tessere · pavimento dipinto: ${pav(p) ? 'sì' : 'NO'}`);
}
console.log('\narredi:');
for (const [k, l] of [...perArredo].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${k.padEnd(11)} ${String(l.length).padStart(3)} volte · disegno: ${arte(k) ? 'sì' : 'NO'}`);
}

// IL CAMPIONE: una tessera per ambiente, scegliendo quella con piu' arredi —
// una stanza vuota non dimostra niente.
const campione = [];
for (const [p, l] of perAmbiente) {
  const dentro = tessere.filter((t) => t.pav === p);
  dentro.sort((a, b) => b.chiavi.length - a.chiavi.length);
  campione.push(dentro[0]);
}
// e, se un arredo non e' ancora comparso nel campione, la sua prima tessera
for (const [k] of perArredo) {
  if (campione.some((t) => t.chiavi.includes(k))) continue;
  const t = tessere.find((x) => x.chiavi.includes(k));
  if (t) campione.push(t);
}
console.log('\ncampione da generare:');
campione.forEach((t) => console.log(`  ${t.ep}/${t.id} ${t.nome} · ${t.pav} · ${t.chiavi.join(', ') || 'nessun arredo'}`));
writeFileSync('scatti/campione.json', JSON.stringify(campione, null, 1));
