// LA LIBRERIA DEI MODULI — un mazzo di tessere riusabili, tutte dello stesso
// ingombro, da cui escono dungeon irregolari.
//
// E' il meccanismo dei giochi a tessere (D&D Adventure System: Castle Ravenloft,
// Legend of Drizzt, Dungeon of the Mad Mage). Guardando il loro foglio dei pezzi
// si capisce che non c'e' niente di procedurale: c'e' un MAZZO di venti pattern
// disegnati, e la varieta' del mazzo fa la mappa. Tre cose li governano:
//
//  1. INGOMBRO UNICO. Tutte le tessere sono lo stesso quadrato, e si accostano
//     su un reticolo. Il profilo a incastro e' solo un aiuto meccanico.
//  2. IL PAVIMENTO ARRIVA AI BORDI, e dove due varchi si incontrano le due
//     stanze si FONDONO: non c'e' una porta, c'e' che li' la roccia non c'e'.
//     E' quel che fa sembrare la mappa scavata invece che piastrellata.
//  3. LE USCITE SONO POCHE E DICHIARATE. Un pezzo ha da una a quattro aperture,
//     segnate sul bordo; il resto del perimetro e' roccia.
//
// Qui il mazzo si genera invece di disegnarlo a mano: ogni modulo e' un CARATTERE
// (quanto e' aperto) piu' un insieme di USCITE, e la roccia la mette `caverna()`
// con un seme preso dal nome — quindi la stessa voce del mazzo esce sempre
// identica, e due voci diverse hanno rocce diverse.

const { TAGLI, caverna, setLato } = require('./sagome');

// quanto e' aperto un pezzo. `forza` moltiplica la soglia della roccia: sopra 1
// la roccia fa fatica a crescere (stanza aperta), sotto 1 dilaga (caverna).
const CARATTERI = {
  sala:      { taglio: 'pieno',     forza: 1.05, varco: 3, che: 'sala aperta' },
  camera:    { taglio: 'angoli',    forza: 0.92, varco: 2, che: 'camera' },
  caverna:   { taglio: 'angoli',    forza: 0.70, varco: 2, che: 'caverna' },
  passaggio: { taglio: 'passaggio', forza: 1.15, varco: 1, che: 'passaggio stretto' },
  cisterna:  { taglio: 'tonda',     forza: 1.10, varco: 2, che: 'sala con colonne' },
};

// le uscite di un pezzo, in forme canoniche: un fondo cieco, un passante, un
// angolo, un raccordo a T, un incrocio
const USCITE = [
  { chiave: 'cieco',    lati: ['S'] },
  { chiave: 'passante', lati: ['N', 'S'] },
  { chiave: 'angolo',   lati: ['S', 'E'] },
  { chiave: 'ti',       lati: ['O', 'S', 'E'] },
  { chiave: 'incrocio', lati: ['N', 'S', 'E', 'O'] },
];

const cellaPorta = (dir, lato) => {
  const m = Math.floor((lato - 1) / 2);
  return dir === 'N' ? [m, 0] : dir === 'S' ? [m, lato - 1]
    : dir === 'O' ? [0, m] : [lato - 1, m];
};

/**
 * Un modulo: le sue caselle di pavimento.
 *
 * @param carattere  chiave di CARATTERI
 * @param lati       ['N','S',...] dove il pezzo si apre
 * @param lato       caselle per lato
 * @param variante   cambia solo la roccia, non la pianta: due «caverne
 *                   passanti» nel mazzo non devono essere lo stesso disegno
 */
function modulo(carattere, lati, lato, variante = 0) {
  const c = CARATTERI[carattere];
  if (!c) throw new Error(`carattere sconosciuto: ${carattere}`);
  setLato(lato);
  const porte = {};
  for (const d of lati) porte[d] = cellaPorta(d, lato);
  const base = (TAGLI[c.taglio] || TAGLI.pieno)(porte);
  const via = new Set(base.map(([x, y]) => `${x},${y}`));
  for (const p of Object.values(porte)) via.delete(p.join(','));
  const celle = [];
  for (let r = 0; r < lato; r++) {
    for (let x = 0; x < lato; x++) if (!via.has(`${x},${r}`)) celle.push([x, r]);
  }
  const nome = `${carattere}-${lati.join('')}-${variante}`;
  return {
    nome,
    che: c.che,
    lati,
    carattere,
    celle: caverna(celle, porte, lato, nome, { varco: c.varco, forza: c.forza }),
    porte,
  };
}

/** Il mazzo intero: ogni carattere in ogni forma d'uscita. */
function libreria(lato = 10, { varianti = 2 } = {}) {
  const fuori = [];
  for (const [chiave] of Object.entries(CARATTERI)) {
    for (const u of USCITE) {
      for (let v = 0; v < varianti; v++) fuori.push(modulo(chiave, u.lati, lato, v));
    }
  }
  return fuori;
}

module.exports = { modulo, libreria, CARATTERI, USCITE, cellaPorta };

// -------------------------------------------------------------- il collaudo
if (require.main === module) {
  const assert = require('assert');
  const L = 10;
  const lib = libreria(L);
  console.log(`${lib.length} moduli su ${L}x${L}`);

  const k = ([c, r]) => `${c},${r}`;
  for (const m of lib) {
    const vive = new Set(m.celle.map(k));
    // OGNI USCITA DEV'ESSERE PAVIMENTO, o il pezzo non si aggancia a niente
    for (const d of m.lati) {
      assert.ok(vive.has(k(cellaPorta(d, L))), `${m.nome}: l'uscita ${d} e' murata`);
    }
    // e il pavimento dev'essere tutto attaccato
    const visti = new Set([m.celle[0].join(',')]);
    const coda = [m.celle[0]];
    while (coda.length) {
      const [c, r] = coda.pop();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const q = [c + dc, r + dr];
        if (!vive.has(k(q)) || visti.has(k(q))) continue;
        visti.add(k(q)); coda.push(q);
      }
    }
    assert.strictEqual(visti.size, vive.size, `${m.nome}: pavimento spezzato`);
    assert.ok(m.celle.length >= 12, `${m.nome}: restano ${m.celle.length} caselle`);
  }

  // IL PAVIMENTO ARRIVA AL BORDO: e' il punto di tutto. Se ogni pezzo restasse
  // rientrato, due tessere accostate non si fonderebbero mai e la mappa sarebbe
  // di nuovo una scacchiera — solo con le cornici.
  for (const m of lib) {
    const suBordo = m.celle.filter(([c, r]) => c === 0 || r === 0 || c === L - 1 || r === L - 1);
    assert.ok(suBordo.length >= m.lati.length,
              `${m.nome}: tocca il bordo in ${suBordo.length} caselle`);
  }

  // due caratteri diversi non devono dare la stessa pianta
  const a = JSON.stringify(modulo('sala', ['N', 'S'], L).celle);
  const b = JSON.stringify(modulo('caverna', ['N', 'S'], L).celle);
  assert.notStrictEqual(a, b, 'sala e caverna sono lo stesso disegno');
  // ma lo stesso modulo, due volte, si'
  assert.strictEqual(a, JSON.stringify(modulo('sala', ['N', 'S'], L).celle),
                     'lo stesso modulo cambia a ogni giro');

  const per = {};
  for (const m of lib) per[m.carattere] = (per[m.carattere] || 0) + 1;
  const media = Math.round(lib.reduce((s, m) => s + m.celle.length, 0) / lib.length);
  console.log('per carattere:', Object.entries(per).map(([a2, b2]) => `${a2} ${b2}`).join(' · '));
  console.log(`pavimento medio: ${media} caselle su ${L * L} — il resto e' roccia`);
}

// --------------------------------------------------------------- I DECORI
//
// Dettaglio a terra che NON ostacola il movimento. Il vincolo non e' grafico ma
// di regole lette a occhio: se una cosa non blocca, non deve nemmeno SEMBRARE
// che blocchi. Una cassa o un tavolo su una casella libera fanno esitare chi
// gioca — e un dubbio al tavolo costa piu' di un disegno in meno. Quindi qui
// stanno solo cose PIATTE: detriti, crepe, pozze, muschio, sabbia.
//
// Deterministici come tutto il resto: stesso modulo, stessi detriti, sempre.
// LA CREPA NON C'E' PIU', e non e' una scelta di gusto: il pavimento di pietra
// E' GIA' fatto di crepe e venature. Un segno disegnato sopra sparisce dentro la
// texture per costruzione — visto ingrandendo una tessera al vero, non sul
// contact sheet. Restano le cose che la texture NON ha.
const TIPI_DECORO = ['detriti', 'pozza', 'muschio', 'sabbia'];

// a 0,09 uscivano quattro dettagli su sessanta caselle: un pavimento nudo. La
// densita' giusta si vede sul render, non si calcola.
function decoriDi(celle, porte, lato, nome, { densita = 0.12 } = {}) {
  const seme = (() => {
    let n = 0;
    const t = `decori-${nome}`;
    for (let i = 0; i < t.length; i++) n = (Math.imul(n, 131) + t.charCodeAt(i)) >>> 0;
    return n;
  })();
  const caso = (x, y, salto) => {
    let h = (seme ^ Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ salto) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  // le caselle dei varchi restano pulite: li' si guarda per capire dove si passa
  const varchi = new Set();
  for (const [c, r] of Object.values(porte)) {
    for (let d = -1; d <= 1; d++) varchi.add(`${c + d},${r}`), varchi.add(`${c},${r + d}`);
  }
  const fuori = [];
  for (const [c, r] of celle) {
    if (varchi.has(`${c},${r}`)) continue;
    if (caso(c, r, 11) > densita) continue;
    const tipo = TIPI_DECORO[Math.floor(caso(c, r, 29) * TIPI_DECORO.length)];
    fuori.push([c, r, tipo, caso(c, r, 47)]);
  }
  return fuori;
}

module.exports.decoriDi = decoriDi;
module.exports.TIPI_DECORO = TIPI_DECORO;
