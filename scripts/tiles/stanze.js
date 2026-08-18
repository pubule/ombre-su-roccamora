// QUANTO E' GRANDE UNA STANZA, e cosa ci sta dentro.
//
// Il 4x4 era una taglia sola per tutti: uno stanzino e una navata avevano
// sedici caselle a testa. Qui la taglia la dice il NOME della stanza, con la
// stessa regola con cui il nome dice gia' il pavimento (`PAVIMENTI` in
// pittura-vtt.js) e la pianta (`REGOLE` in sagome.js). I dati non hanno un campo
// «grandezza» e non glielo si aggiunge per una scelta di scenografia: il nome
// ce l'ha gia' dentro, ed e' lo stesso nome che il tavolo sente leggere.
//
// E CON LO SPAZIO VANNO GLI ARREDI. Una sala 6x6 ha trentasei caselle; i dati ne
// riempiono due. Trentaquattro caselle vuote non sono «spazio per muoversi»,
// sono un capannone. Qui la stanza si arreda da sola secondo quel che dice di
// essere — un magazzino accatasta casse, una navata allinea candele, una cripta
// mette altari — e gli arredi si addossano ai muri, che e' dove stanno le cose
// nelle stanze vere e dove non intralciano il passaggio.
//
// QUEL CHE SI AGGIUNGE QUI NON BLOCCA. Gli arredi che fermano le pedine stanno
// nei dati dell'episodio, e il motore legge quelli: questi sono una PROPOSTA per
// i dati, e finche' non ci entrano vanno considerati scenografia. Metterli a
// bloccare senza scriverli nei dati sarebbe l'inganno del Preludio al contrario
// — una casella che sembra occupata e non lo e'.

// nome della stanza -> quante caselle per lato. L'ORDINE E' UNA REGOLA: «la sala
// del capitolo» e' una sala prima che una stanza, e «lo stanzino del daziere» e'
// uno stanzino anche se contiene la parola «stanza».
const TAGLIE = [
  // le piccole: uno stanzino non diventa una piazza perche' e' comodo
  [/stanzin|sottoscala|camerin|abbaino|ripostiglio|cella del|guardiola|garitta|comignol|lucernario/i, 4],
  // le grandi: quel che nel racconto e' vasto, in tavola e' vasto
  [/navata|cistern|salone|piazzal|magazzin|deposito|sala d|sala del|cortile|giardino|mercato|atrio|assemblea|biblioteca|teatro|darsena|cimitero|piano terra|serra|camera del/i, 6],
  // tutto il resto sta in mezzo
];
const LATO_BASE = 5;

function latoDi(tile) {
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, n] of TAGLIE) if (re.test(nome)) return n;
  return LATO_BASE;
}

// nome della stanza -> di che cosa si riempie, in ordine di preferenza. Le
// chiavi sono quelle dei quattordici arredi che il gioco sa gia' disegnare:
// aggiungerne di nuovi vorrebbe dire arte nuova, e non serve.
const CORREDO = [
  [/magazzin|deposito|carico|casse|scorte|dogana|mercantil|quinta/i, ['casse', 'casse', 'casse']],
  [/navata|chiesa|cappell|coro|sagrato|organo|capitolo/i, ['candele', 'candele', 'altare']],
  [/cript|ossari|tomb|sepolt|catacomb/i, ['altare', 'candele', 'candele']],
  [/fonder|forgia|crogiol|officina|forni|macine|torchio|molino/i, ['forma', 'scorie', 'crogiolo']],
  [/ufficio|studio|archivio|scrittoio|notaio|catalogazione|lettura/i, ['scrivania', 'armadio', 'scrivania']],
  [/camera|alloggio|dormitor|cella|branda|stanza di/i, ['branda', 'armadio', 'toeletta']],
  [/cucina|tinello|refettor|osteria|taverna/i, ['stufa', 'scrivania', 'casse']],
  [/molo|banchin|imbarcader|riva|fondamenta|pontile|chiatt|barc/i, ['molo', 'casse', 'molo']],
  [/scavo|galler|cunicol|macerie|rovina|intercapedine|ponteggi/i, ['scorie', 'scorie', 'casse']],
  [/salone|atrio|galleria dei|cimeli|ritratti|assemblea/i, ['candele', 'armadio', 'candele']],
];

function corredoDi(tile) {
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, lista] of CORREDO) if (re.test(nome)) return lista;
  return ['casse', 'candele'];
}

// quante caselle di arredo puo' reggere una stanza senza diventare un magazzino:
// una ogni quattro caselle di pavimento, contando quelle che ci sono gia'.
// A una ogni sei, una sala 6x6 usciva con quattro oggetti su trentasei caselle e
// si leggeva ancora come un capannone: visto sul render, non sul conto.
const QUOTA = 4;

/**
 * Gli arredi da AGGIUNGERE per riempire una stanza cresciuta.
 *
 * Si addossano al muro — la prima casella libera che ha un bordo — perche' e'
 * dove stanno le cose nelle stanze vere e perche' al centro intralcerebbero il
 * passaggio. L'ordine e' deterministico: la stessa tessera esce sempre identica,
 * o il cartoncino stampato e lo schermo direbbero due cose diverse.
 *
 * @param tile      la tessera (serve il nome)
 * @param lato      le caselle per lato
 * @param vive      Set "c,r" delle caselle dentro la sagoma
 * @param occupate  Set "c,r" gia' prese dagli arredi dei dati
 * @param cellePorte  [[c,r], ...] le caselle-porta, che restano sempre libere
 * @returns [[col, row, chiave], ...] in coordinate di disegno
 */
function arrediInPiu(tile, lato, vive, occupate, cellePorte) {
  const pavimento = vive.size;
  const quante = Math.max(0, Math.floor(pavimento / QUOTA) - occupate.size);
  if (quante <= 0) return [];

  const vietate = new Set([...occupate]);
  for (const [c, r] of cellePorte) {
    vietate.add(`${c},${r}`);
    // e nemmeno la casella davanti alla porta: un armadio piantato sulla soglia
    // e' un varco murato con un mobile
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) vietate.add(`${c + dc},${r + dr}`);
  }

  // le caselle addossate a un muro, in ordine stabile: prima gli angoli (dove
  // due muri si incontrano), poi i lati. Un oggetto in un angolo si legge come
  // messo li' da qualcuno; in mezzo alla stanza si legge come un ostacolo.
  const muri = (c, r) => [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .filter(([dc, dr]) => !vive.has(`${c + dc},${r + dr}`)).length;
  const posti = [...vive].map((k) => k.split(',').map(Number))
    .filter(([c, r]) => !vietate.has(`${c},${r}`) && muri(c, r) > 0)
    .sort((a, b) => muri(b[0], b[1]) - muri(a[0], a[1])
      || (a[1] - b[1]) || (a[0] - b[0]));

  const lista = corredoDi(tile);
  const fuori = [];
  for (let i = 0; i < Math.min(quante, posti.length); i++) {
    const [c, r] = posti[i];
    fuori.push([c, r, lista[i % lista.length]]);
  }
  return fuori;
}

module.exports = { latoDi, arrediInPiu, corredoDi, TAGLIE, CORREDO };

// ------------------------------------------------------------- il collaudo
if (require.main === module) {
  const assert = require('assert');
  const griglia = (L) => {
    const s = new Set();
    for (let r = 0; r < L; r++) for (let c = 0; c < L; c++) s.add(`${c},${r}`);
    return s;
  };

  assert.strictEqual(latoDi({ nome: 'Lo Stanzino del Daziere' }), 4);
  assert.strictEqual(latoDi({ nome: 'La Navata Sepolta' }), 6);
  assert.strictEqual(latoDi({ nome: 'Il Corridoio delle Candele' }), 5);

  // una stanza grande si riempie, una piccola quasi no
  const grande = arrediInPiu({ nome: 'Il Magazzino delle Scene' }, 6,
                             griglia(6), new Set(['0,0']), [[3, 0]]);
  assert.ok(grande.length >= 4, `il 6x6 resta vuoto: ${grande.length} arredi`);
  const piccola = arrediInPiu({ nome: 'Lo Stanzino' }, 4,
                              griglia(4), new Set(['0,0', '1,1']), [[2, 0]]);
  // il confronto vale piu' di un numero fisso: quel che deve reggere e' che una
  // stanza grande si arredi PIU' di una piccola, non che ne prenda esattamente N
  assert.ok(piccola.length < grande.length,
            `lo stanzino (${piccola.length}) non e' piu' vuoto della sala (${grande.length})`);

  // LA SOGLIA RESTA LIBERA, e anche la casella davanti: un armadio sulla porta
  // e' un varco murato con un mobile
  const porta = [[2, 0]];
  const con = arrediInPiu({ nome: 'La Sala del Capitolo' }, 6, griglia(6), new Set(), porta);
  for (const [c, r] of con) {
    assert.ok(!(c === 2 && r === 0), 'arredo sulla soglia');
    assert.ok(!(c === 2 && r === 1), 'arredo davanti alla soglia');
  }

  // NIENTE ARREDI FUORI SAGOMA. Una stanza a L non deve arredarsi nel vuoto.
  const aL = griglia(6);
  for (let r = 0; r < 3; r++) for (let c = 3; c < 6; c++) aL.delete(`${c},${r}`);
  for (const [c, r] of arrediInPiu({ nome: 'Il Magazzino' }, 6, aL, new Set(), [[0, 5]])) {
    assert.ok(aL.has(`${c},${r}`), `arredo nel vuoto a ${c},${r}`);
  }

  // e la stessa stanza esce sempre uguale
  const a1 = JSON.stringify(arrediInPiu({ nome: 'Il Magazzino' }, 6, griglia(6), new Set(), [[2, 0]]));
  const a2 = JSON.stringify(arrediInPiu({ nome: 'Il Magazzino' }, 6, griglia(6), new Set(), [[2, 0]]));
  assert.strictEqual(a1, a2, 'la stessa tessera esce diversa due volte');

  // il conto vero, su tutte le tessere della campagna
  const fs = require('fs'); const path = require('path');
  const ROOT = path.resolve(__dirname, '..', '..');
  const conto = {}; let caselle = 0, n = 0;
  for (const ep of ['preludio', ...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)]) {
    const f = path.join(ROOT, 'webapp', 'data', `${ep}.json`);
    if (!fs.existsSync(f)) continue;
    for (const t of JSON.parse(fs.readFileSync(f, 'utf8')).tessere || []) {
      const L = latoDi(t); conto[L] = (conto[L] || 0) + 1; caselle += L * L; n++;
    }
  }
  console.log(`${n} tessere · ` + Object.entries(conto).sort()
    .map(([L, c]) => `${L}x${L}: ${c}`).join(' · '));
  console.log(`caselle di gioco in tutta la campagna: ${caselle} (erano ${n * 16})`);
}
