// Misura la SPEDIZIONE per COMPOSIZIONE di squadra, non per episodio.
//
// `mappa-pilota.mjs` risponde a «quanto è duro l'Ep. N» con quattro eroi presi
// a caso, e la casualità del party finisce dentro il rumore. Qui la domanda è
// un'altra: **con quali quattro eroi si può giocare?** — cioè quanto pesa la
// composizione rispetto ai dadi.
//
// Le squadre sono estremi scelti a mano, non le 330 combinazioni: se i due
// estremi stanno nella stessa fascia, le combinazioni in mezzo pure. Se non ci
// stanno, la distanza fra gli estremi È la misura dello sbilanciamento.
//
//   node webapp/misura-classi.mjs [partite] [paralleli] [ep1,ep2,...]
//
// Vuole il server acceso: node webapp/server.js
import { spawn } from 'child_process';
import fs from 'fs';

const N = Number(process.argv[2]) || 20;
const PAR = Number(process.argv[3]) || 5;
const EPISODI = (process.argv[4] || 'ep1,ep5,ep7,ep11,ep13,ep20').split(',').filter(Boolean);

// I nomi sono frammenti: misura-episodio.mjs li cerca con `includes`.
const SOLO = (process.argv[5] || '').split(',').filter(Boolean);   // solo queste squadre
const SQUADRE = [
  { id: 'vetro',   party: 'ELENA,CARLA,SERRA,BRERA',      nota: 'ACUME 3×4 · VIGORE 1×4 · 24 salute' },
  { id: 'ferro',   party: 'OTTONE,FANTI,NINO,ATTILIO',    nota: 'VIGORE 3,3,2,2 · 29 salute' },
  { id: 'occulto', party: 'SIBILLA,MARANI,CARBONE,SERRA', nota: 'NERVI 3,3,3,2 · VIGORE 1×4 · 24 salute' },
  { id: 'muti',    party: 'NINO,MARANI,CARBONE,FANTI',    nota: 'l’unica squadra con 0 cariche d’Indagine' },
  { id: 'misto',   party: 'ELENA,OTTONE,ATTILIO,SIBILLA', nota: 'una per mestiere — il party da manuale' },
].filter((s) => !SOLO.length || SOLO.includes(s.id));

function corri(ep, sq) {
  return new Promise((risolvi) => {
    const p = spawn('node', ['webapp/misura-episodio.mjs', ep, String(N)],
                    { shell: false, env: { ...process.env, PARTY: sq.party } });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', () => {});
    p.on('close', () => {
      const v = out.match(/VITTORIE (\d+)\/(\d+) = (\d+)%/);
      const picchi = [...out.matchAll(/picco (\d)/g)].map((m) => Number(m[1]));
      const round = (out.match(/round medi ([\d.]+)/) || [])[1];
      // il pilota si dichiara NON VALIDA da solo: senza questo un numero
      // basso può essere lo strumento incastrato, non la squadra debole
      risolvi({
        ep, sq: sq.id, pct: v ? Number(v[3]) : 0, valida: /(?<!NON )VALIDA/.test(out),
        picco: picchi.length ? picchi.reduce((a, b) => a + b, 0) / picchi.length : 0,
        round: round || '—',
      });
    });
  });
}

const coda = [];
for (const ep of EPISODI) for (const sq of SQUADRE) coda.push([ep, sq]);
const esiti = [];
async function operaio() {
  while (coda.length) {
    const [ep, sq] = coda.shift();
    process.stderr.write(`  ${ep} · ${sq.id}…\n`);
    esiti.push(await corri(ep, sq));
  }
}

console.log(`Bilanciamento per squadra — ${N} partite per casella, ${EPISODI.length} episodi × ${SQUADRE.length} squadre\n`);
for (const s of SQUADRE) console.log(`  ${s.id.padEnd(8)} ${s.party.padEnd(36)} ${s.nota}`);
console.log();
await Promise.all(Array.from({ length: PAR }, operaio));

const cella = (ep, id) => esiti.find((e) => e.ep === ep && e.sq === id);
for (const [titolo, campo] of [['vittorie', 'pct'], ['picco eroi a terra (ansia)', 'picco']]) {
  console.log(`\n### ${titolo}\n`);
  console.log(`| episodio | ${SQUADRE.map((s) => s.id).join(' | ')} | scarto |`);
  console.log(`|---|${SQUADRE.map(() => '---').join('|')}|---|`);
  for (const ep of EPISODI) {
    const v = SQUADRE.map((s) => cella(ep, s.id)?.[campo] ?? 0);
    const fmt = (x) => (campo === 'pct' ? `${x}%` : x.toFixed(1));
    const sc = Math.max(...v) - Math.min(...v);
    console.log(`| ${ep} | ${v.map(fmt).join(' | ')} | ${fmt(sc)} |`);
  }
  const media = (id) => esiti.filter((e) => e.sq === id).reduce((a, e) => a + e[campo], 0) / EPISODI.length;
  const fm = (x) => (campo === 'pct' ? `${x.toFixed(0)}%` : x.toFixed(1));
  console.log(`| **media** | ${SQUADRE.map((s) => `**${fm(media(s.id))}**`).join(' | ')} | |`);
}

const rotte = esiti.filter((e) => !e.valida);
if (rotte.length) console.log(`\n${rotte.length}/${esiti.length} corse NON VALIDE: `
  + rotte.map((e) => `${e.ep}·${e.sq}`).join(', ') + '\n(stalli del pilota: quelle caselle valgono meno delle altre)');
fs.writeFileSync('logs/misura-classi.json', JSON.stringify(esiti, null, 1));
console.log('\ndettaglio in logs/misura-classi.json');
