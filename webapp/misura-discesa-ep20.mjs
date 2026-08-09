// Quanto Canto costa la DISCESA dell'Ep. 20, prima ancora di entrare nella
// camera. E' la domanda che decide se il finale ha un budget: il pilota misura
// che il gruppo entra in T6 col Canto gia' a 5,5 su 8, e nessuna regola della
// camera puo' recuperare due round persi a monte.
//
// Non gioca l'episodio: replica solo cio' che muove il Canto — il tick di fine
// round, le carte Crescendo pescate, e l'accelerazione che scatta a soglia
// (`cantoBonus` = una carta in piu' per round, quindi piu' Crescendo, quindi
// soglia piu' presto). Il resto della spedizione non tocca il Canto.
//
//   node webapp/misura-discesa-ep20.mjs [round] [partite]
import fs from 'fs';

const ROUND = Number(process.argv[2]) || 10;   // round tipici della discesa T1->T6
const N = Number(process.argv[3]) || 2000;
const TAGLIA = 4;

const carte = JSON.parse(fs.readFileSync('webapp/data/carte.json', 'utf8'));
const comune = JSON.parse(fs.readFileSync('webapp/data/comune.json', 'utf8'));
const ep = JSON.parse(fs.readFileSync('webapp/data/ep20.json', 'utf8'));

const MAZZO = carte.minacce.ep20.filter((c) => !c.title.startsWith('Bivio'));
const CRESCENDO = MAZZO.map((c) => /aggiungete\s+1\s+segnalino/i.test(c.rules || ''));
const OGNI = ep.canto_ogni || 4;
const SOGLIA = ep.soglia_canto != null ? ep.soglia_canto : comune.regole.soglia_canto;
const TETTO = ep.canto_max != null ? ep.canto_max : comune.regole.canto_max;
const [BASE, ALT] = comune.regole.pesca[String(TAGLIA)];

function unaDiscesa() {
  const ordine = MAZZO.map((_, i) => i);
  for (let i = ordine.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordine[i], ordine[j]] = [ordine[j], ordine[i]];
  }
  let indice = 0; let canto = 0; let bonus = false;
  let daCarte = 0; let daTick = 0; let carteTot = 0;
  for (let round = 1; round <= ROUND; round += 1) {
    let quante = BASE + ((ALT && round % 2 === 0) ? 1 : 0) + (bonus ? 1 : 0);
    carteTot += quante;
    while (quante > 0) {
      if (indice >= ordine.length) {                       // rimescolo degli scarti
        for (let i = ordine.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [ordine[i], ordine[j]] = [ordine[j], ordine[i]];
        }
        indice = 0;
      }
      if (CRESCENDO[ordine[indice]] && canto < TETTO) { canto += 1; daCarte += 1; }
      indice += 1; quante -= 1;
      if (canto >= SOGLIA) bonus = true;
    }
    if (round % OGNI === 0 && canto < TETTO) { canto += 1; daTick += 1; }
    if (canto >= SOGLIA) bonus = true;
  }
  return { canto, daCarte, daTick, carteTot };
}

const corse = Array.from({ length: N }, unaDiscesa);
const media = (f) => corse.reduce((s, c) => s + f(c), 0) / N;
const quota = (f) => `${Math.round(100 * corse.filter(f).length / N)}%`;

console.log(`Discesa dell'Ep. 20 — ${ROUND} round, ${TAGLIA} eroi, ${N} repliche`);
console.log(`  mazzo: ${MAZZO.length} carte, di cui Crescendo ${CRESCENDO.filter(Boolean).length}`);
console.log(`  soglia che accelera la pesca: ${SOGLIA}   tetto: ${TETTO}   tick ogni ${OGNI} round`);
console.log('');
console.log(`  Canto all'ingresso nella camera:  ${media((c) => c.canto).toFixed(1)} su ${TETTO}`);
console.log(`    dai Crescendo pescati:          ${media((c) => c.daCarte).toFixed(1)}`);
console.log(`    dal tick di fine round:         ${media((c) => c.daTick).toFixed(1)}`);
console.log(`  carte Minaccia pescate in tutto:  ${media((c) => c.carteTot).toFixed(1)}`);
console.log('');
console.log(`  arriva con 3 o meno di margine:   ${quota((c) => TETTO - c.canto <= 3)}`);
console.log(`  arriva con 2 o meno di margine:   ${quota((c) => TETTO - c.canto <= 2)}`);
console.log(`  arriva gia' al risveglio:         ${quota((c) => c.canto >= TETTO)}`);
