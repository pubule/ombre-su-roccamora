// LE PISTE FREDDE DICONO UNA COSA SENSATA, in tutti i 127 posti della mappa.
//
// Il difetto, visto al tavolo: si dichiarava il Cimitero Nuovo e l'app
// rispondeva «nessuno risponde, dalla serratura l'odore di una casa che
// dorme». Le cinque frasi erano tutte con un uscio a cui bussare, ma un terzo
// delle voci non ha porte — camposanti, moli, canali, calli — e cinque non
// sono nemmeno posti (una carta, una matrice, il Membro Interno dell'Ep.17).
//
// Qui si classifica OGNI voce vera della mappa e si controlla che la frase
// scelta non nomini cose che li' non ci sono. Niente browser: e' prosa e
// classificazione, gira con node.
//
// Uso: node webapp/test-piste-fredde.mjs
import { readFileSync } from 'fs';
import { tipoVoce, dichiaraVoce } from './public/js/engine.js';

let ko = 0;
const ok = (c, m) => { if (!c) { console.error('FAIL:', m); ko += 1; } };

const COMUNE = JSON.parse(readFileSync('webapp/data/comune.json', 'utf8'));
const VOCI = COMUNE.mappa.voci;

// le parole che presuppongono un EDIFICIO: dove non c'e' una porta, non devono
// comparire nella frase
const DA_EDIFICIO = /\b(bussat|portone|serratura|uscio|davanzale|corridoi|vi apre|custode)/i;
// e quelle che presuppongono l'ACQUA
const DA_ACQUA = /\b(bitte|ormeggiat|attraccat|riva|corrente)/i;

// --- 1. ogni voce ha un tipo, e i tipi sono quelli previsti
{
  const TIPI = new Set(['edificio', 'sepolcro', 'acqua', 'strada', 'altro']);
  const conta = {};
  for (const v of VOCI) {
    const t = tipoVoce(v.nome);
    ok(TIPI.has(t), `«${v.nome}» ha un tipo previsto (visto «${t}»)`);
    conta[t] = (conta[t] || 0) + 1;
  }
  console.log('   tipi:', JSON.stringify(conta));
  // il grosso della citta' sono edifici: se questa cade, la classificazione
  // si e' rotta del tutto (e il banco non sta misurando niente)
  ok(conta.edificio > 60, `gli edifici restano il grosso (${conta.edificio})`);
  ok(conta.sepolcro >= 2, `i camposanti sono riconosciuti (${conta.sepolcro || 0})`);
  ok(conta.acqua >= 5, `i moli e i canali sono riconosciuti (${conta.acqua || 0})`);
  ok(conta.strada >= 10, `vicoli, calli e corti sono riconosciuti (${conta.strada || 0})`);
}

// --- 2. i casi che al tavolo hanno fatto ridere, uno per uno
{
  const attesi = [
    ['Il Cimitero Nuovo', 'sepolcro'],
    ['L’Ossario Comunale', 'sepolcro'],
    ['Il Molo in Disarmo', 'acqua'],
    ['Il Canale Basso', 'acqua'],
    ['La Chiusa Grande', 'acqua'],
    ['I Moli di Levante', 'acqua'],
    ['Calle del Marmo', 'strada'],
    ['Vicolo dei Fonditori', 'strada'],
    ['Corte della Faenza', 'strada'],
    ['Il Ponte delle Catene', 'strada'],
    // hanno un ponte e una corte nel nome, ma la porta ce l'hanno
    ['Taverna del Ponte Rotto', 'edificio'],
    ['La Casa della Corte', 'edificio'],
    ['La Villa sul Lago', 'edificio'],
    // un cimitero di BARCHE: e' acqua
    ['Il Cimitero delle Barche', 'acqua'],
    // e le piste che non sono posti
    ['La Carta di Pregio', 'altro'],
    ['Il Membro Interno', 'altro'],
    ['La Matrice del Decano', 'altro'],
  ];
  for (const [nome, atteso] of attesi) {
    ok(VOCI.some((v) => v.nome === nome), `«${nome}» esiste ancora sulla mappa`);
    ok(tipoVoce(nome) === atteso, `«${nome}» e' ${atteso} (visto «${tipoVoce(nome)}»)`);
  }
}

// --- 3. LA PROVA VERA: la frase non nomina quel che li' non c'e'
//
// Si chiede la frase per OGNI voce, tante volte da pescare tutto il mazzo, e
// si controlla parola per parola. Un episodio in cui la voce non c'e' rende
// ogni dichiarazione una pista fredda: si usa il Preludio, che ha quattro
// luoghi soli.
{
  const EP = JSON.parse(readFileSync('webapp/data/preludio.json', 'utf8'));
  const suoi = new Set((EP.luoghi || []).map((l) => l.voce_mappa));
  let provate = 0;
  for (const v of VOCI) {
    if (suoi.has(v.nome)) continue;             // li' la pista e' calda
    const tipo = tipoVoce(v.nome);
    for (let giro = 0; giro < 30; giro += 1) {  // il mazzo piu' lungo ha 5 frasi
      const esito = dichiaraVoce(EP, COMUNE, v.nome);
      ok(esito.tipo === 'fredda', `«${v.nome}» nel Preludio e' una pista fredda`);
      const f = String(esito.frase || '');
      ok(f.length > 20, `«${v.nome}» ha una frase (${f.slice(0, 40)})`);
      if (tipo !== 'edificio') {
        ok(!DA_EDIFICIO.test(f),
           `«${v.nome}» (${tipo}) non fa bussare a una porta che non c'e': «${f.slice(0, 90)}»`);
      }
      if (tipo !== 'acqua') {
        ok(!DA_ACQUA.test(f),
           `«${v.nome}» (${tipo}) non mette in scena acqua che non c'e': «${f.slice(0, 90)}»`);
      }
      provate += 1;
    }
  }
  console.log(`   frasi controllate: ${provate}`);
  ok(provate > 3000, `il banco ha davvero girato (${provate})`);
}

// --- 4. il banco non e' vacuo: una frase da edificio su un camposanto la
// sonda DEVE vederla
{
  ok(DA_EDIFICIO.test('Nessuno risponde. Dalla serratura, l’odore di una casa che dorme.'),
     'la sonda riconosce la vecchia frase della serratura');
  ok(DA_EDIFICIO.test('Bussate. Una finestra si illumina.'),
     'e riconosce «bussate»');
  ok(!DA_EDIFICIO.test('Il cancello è accostato, la ghiaia intatta.'),
     'e lascia passare quella del camposanto');
}

console.log(ko === 0
  ? '\ntest-piste-fredde: ogni pista fredda parla del posto in cui si e\' andati'
  : `\n${ko} FALLITI`);
process.exit(ko ? 1 : 0);
