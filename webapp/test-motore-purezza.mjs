// LA BARRIERA DEL MOTORE: in webapp/motore/ non entra l'ambiente.
//
// Il motore deve girare tal quale in tre posti — il browser dell'arbitro, il
// telefono di un giocatore, e domani un Durable Object che non ha nessun DOM.
// Basta un `document` dimenticato in una regola perche' il terzo smetta di
// funzionare, e non se ne accorge nessuno finche' non si deploya.
//
// Sta qui e non dentro i singoli test perche' vale per OGNI file della
// cartella, compresi quelli che verranno: chi aggiunge un modulo al motore non
// deve ricordarsi di aggiungere anche il controllo.
//
// node webapp/test-motore-purezza.mjs
import { readdirSync, readFileSync } from 'fs';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko++; } };

// Si guarda il CODICE, non la prosa: un commento che spiega «qui non si usa
// Math.random» e' esattamente cio' che vogliamo leggere, e non deve far
// fallire niente.
function senzaCommenti(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')      // /* ... */
    .replace(/(^|[^:])\/\/.*$/gm, '$1 ');   // // ... (il [^:] salva gli http://)
}

// Ciascuno di questi, in una regola, rompe il motore fuori dal browser.
const VIETATI = [
  ['document', 'il DOM'],
  ['window', 'il DOM'],
  ['localStorage', 'lo storage del browser'],
  ['sessionStorage', 'lo storage del browser'],
  ['setTimeout', 'i timer: una regola non aspetta, restituisce'],
  ['setInterval', 'i timer'],
  ['requestAnimationFrame', 'l\'animazione, che e\' della vista'],
  ['fetch(', 'la rete: i dati arrivano come argomento'],
  ['Math.random', 'il caso non seminato — si usa motore/rng.js'],
  ['innerHTML', 'l\'html, che e\' della vista'],
  ['alert(', 'il browser'],
  ['confirm(', 'il browser'],
  ['process.', 'node: il motore gira anche nel browser'],
  ['require(', 'CommonJS: il motore e\' ESM'],
];

const dir = 'webapp/public/motore';
let file;
try { file = readdirSync(dir).filter((f) => f.endsWith('.js')); }
catch { console.error(`FAIL: la cartella ${dir} non esiste`); process.exit(1); }

ok(file.length > 0, `${dir} non deve essere vuota`);

for (const f of file) {
  const codice = senzaCommenti(readFileSync(`${dir}/${f}`, 'utf8'));
  for (const [ago, perche] of VIETATI) {
    ok(!codice.includes(ago), `${f} contiene «${ago}» — ${perche}`);
  }
}

// La barriera dev'essere capace di accorgersene davvero: se senzaCommenti()
// mangiasse tutto il file, ogni controllo passerebbe a vuoto e questo test
// direbbe OK per sempre. Qui glielo si dimostra su un caso finto.
{
  const finto = senzaCommenti(`
    // qui non usiamo Math.random, mai
    /* e nemmeno document */
    export const x = () => Math.random();
  `);
  ok(finto.includes('Math.random'), 'la barriera vede il codice vero');
  ok(!finto.includes('document'), 'e non inciampa nei commenti');
}

console.log(ko === 0 ? `TUTTO OK (purezza, ${file.length} file: ${file.join(', ')})` : `${ko} FAIL`);
process.exit(ko ? 1 : 0);
