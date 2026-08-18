// LA SAGOMA DELLA STANZA — la direzione 2 del mockup «la forma delle tessere».
//
// L'ingombro resta il quadrato 4x4 di sempre: cambia il MURO, che segue la
// pianta invece del rettangolo. Le caselle fuori dalla sagoma non ci sono — il
// nero attorno diventa il «fuori», e la mappa che cresce ha un profilo invece
// di un bordo.
//
// LA SAGOMA LA DICE IL NOME DELLA STANZA, con la stessa regola con cui il nome
// dice gia' il pavimento (`PAVIMENTI` in pittura-vtt.js): i dati non hanno un
// campo «pianta» e non glielo si aggiunge per una scelta di pittura. Il nome
// ce l'ha gia' dentro — «ballatoio», «cisterna», «guglia», «sottoportico» — ed
// e' lo stesso nome che il tavolo sente leggere ad alta voce.
//
// LE PORTE NON SI SPOSTANO. `pickDoorIndex` (generate-tiles.js) e la sua
// gemella `portaCella` (webapp/public/motore/griglia.js) scelgono la casella
// della porta senza sapere niente di sagome: se una sagoma togliesse quella
// casella, il cartoncino e l'app direbbero due cose diverse — la porta murata
// da una parte e aperta dall'altra. Qui la sagoma si adatta alle porte, mai il
// contrario: le caselle-porta e le caselle-arredo si rimettono sempre, e se
// quel che resta non e' tutto attaccato la sagoma viene BUTTATA e si torna al
// quadrato pieno. Meglio una stanza quadrata che una stanza spezzata in due.

// QUANTE CASELLE PER LATO. Quattro e' quel che c'e' sempre stato; i tagli sono
// scritti in funzione di L, non con lo 0 e il 3 murati dentro, cosi' la stessa
// pianta vale su una stanza 5x5 o 6x6 senza riscriverla.
let LATO = 4;
const setLato = (n) => { LATO = n; };

const tutte = () => {
  const out = [];
  for (let r = 0; r < LATO; r++) for (let c = 0; c < LATO; c++) out.push([c, r]);
  return out;
};
const k = ([c, r]) => `${c},${r}`;
const U = () => LATO - 1;                       // l'ultima riga/colonna
// quanto una casella e' lontana dalla fascia centrale — serve a decidere a cosa
// rinunciare per primo quando un taglio va ridotto
const distanza = ([c, r], m1, m2) =>
  Math.max(0, m1 - c, c - m2) + Math.max(0, m1 - r, r - m2);
// L'ANGOLO SMUSSATO CRESCE CON LA STANZA. Togliere una casella per angolo su
// sedici si vede; su trentasei e' una tacca. Qui lo smusso e' un triangolo di
// lato `LATO - 3`: uno su 4x4 (com'era), due su 5x5, tre su 6x6.
// UNA CASELLA fino a 5x5, DUE da 6x6 in su. A `LATO - 3` lo smusso mangiava tre
// caselle per angolo su una 5x5 e ogni stanza usciva a croce: una sala smussata
// deve restare una sala. Visto sul render, non sul conto.
const smusso = () => (LATO <= 5 ? 1 : 2);
const ANGOLI = () => {
  const n = smusso(); const u = U(); const out = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j + i < n; j++) {
      out.push([i, j], [u - i, j], [i, u - j], [u - i, u - j]);
    }
  }
  return [...new Set(out.map(String))].map((k2) => k2.split(',').map(Number));
};

// I TAGLI. Ognuno riceve le porte (per direzione) e torna le caselle da
// SPEGNERE. Coordinate di disegno: colonna 0..3 da sinistra, riga 0..3
// dall'alto — le stesse di `pickDoorIndex` e di `groupArredi`.
const TAGLI = {
  // l'ottagono: quattro angoli smussati. La stanza smette di essere una scatola
  pieno:  () => [],
  angoli: () => ANGOLI(),

  // l'abside: il fondo della navata si chiude in tondo. Si smussa il lato
  // OPPOSTO all'ingresso, che e' quello che si guarda entrando
  abside: (porte) => {
    const dentro = new Set(Object.keys(porte));
    const fondo = ['N', 'S', 'E', 'O'].find((d) => !dentro.has(d)) || 'N';
    return { N: [[0, 0], [U(), 0]], S: [[0, U()], [U(), U()]],
             O: [[0, 0], [0, U()]], E: [[U(), 0], [U(), U()]] }[fondo];
  },

  // la cisterna: tonda, e con le colonne in mezzo. Le colonne sono ostacoli
  // veri — e' l'unica sagoma che toglie caselle DENTRO la stanza
  // le colonne stanno IN FONDO all'elenco apposta: se spezzano l'anello sono le
  // prime a cui si rinuncia, e la cisterna resta almeno tonda
  tonda: () => {
    const u = U(); const col = [];
    // una colonna ogni due caselle e mezzo di luce: due su 4x4, quattro su 6x6
    for (let r = 1; r < u; r += 2) for (let c = 1; c < u; c += 2) col.push([c, r]);
    return ANGOLI().concat(col);
  },

  // il ballatoio gira attorno alla torre: il centro non e' pavimento, e' vuoto.
  // Chi ci cammina ha il vuoto da una parte e la pietra dall'altra
  // il vuoto centrale cresce con la stanza: su 4x4 e' 2x2, su 6x6 e' 4x4
  anello: () => {
    const out = [];
    for (let r = 1; r < U(); r++) for (let cc = 1; cc < U(); cc++) out.push([cc, r]);
    return out;
  },

  // la guglia si stringe salendo: due caselle in cima, quattro alla base
  guglia: () => ANGOLI().concat([[0, 1], [U(), 1]]),

  // il tetto: le falde smussate agli angoli, come le vede chi ci sta sopra
  tetto: () => ANGOLI().concat([[0, 1], [U(), U() - 1]]),

  // la banchina finisce nell'acqua: un angolo di 2x2 non e' pavimento, e' canale.
  // Si sceglie l'angolo piu' lontano dalle porte, o si mangerebbe l'ingresso
  banchina: (porte) => {
    const dentro = new Set(Object.keys(porte));
    const u = U();
    const via = !dentro.has('S') && !dentro.has('E') ? [[u - 1, u], [u, u], [u, u - 1]]
      : !dentro.has('S') && !dentro.has('O') ? [[0, u], [1, u], [0, u - 1]]
      : !dentro.has('N') && !dentro.has('E') ? [[u, 0], [u - 1, 0], [u, 1]]
      : [[0, 0], [1, 0], [0, 1]];
    return via;
  },

  // IL PASSAGGIO e' la sagoma che cambia di piu' le partite: si tengono i due
  // corridoi centrali e si tagliano i BRACCI che non portano a nessuna porta.
  // Due porte opposte danno una fascia larga due caselle — la fila indiana. Due
  // porte ad angolo danno una L. E' il collo di bottiglia che esiste perche' la
  // stanza e' fatta cosi', non perche' una regola lo dice.
  passaggio: (porte) => {
    const u = U();
    const m1 = ((u - 1) / 2) | 0, m2 = m1 + 1;      // la fascia centrale, larga DUE
    // LA FASCIA RESTA LARGA DUE ANCHE IN UNA STANZA PIU' GRANDE: e' la larghezza
    // che fa la fila indiana, e non deve crescere con la stanza. Ogni fascia
    // arriva al bordo solo dal lato dove c'e' davvero una porta — altrimenti si
    // ferma al centro, e non resta un braccio che non porta da nessuna parte.
    const vivo = new Set();
    const da = (q) => (q ? 0 : m1), a_ = (q) => (q ? u : m2);
    for (let r = m1; r <= m2; r++) {
      for (let cc = da(porte.O); cc <= a_(porte.E); cc++) vivo.add(`${cc},${r}`);
    }
    for (let cc = m1; cc <= m2; cc++) {
      for (let r = da(porte.N); r <= a_(porte.S); r++) vivo.add(`${cc},${r}`);
    }
    const via = [];
    for (let r = 0; r <= u; r++) {
      for (let cc = 0; cc <= u; cc++) if (!vivo.has(`${cc},${r}`)) via.push([cc, r]);
    }
    // le caselle piu' lontane dalla fascia si tolgono per PRIME, cosi' se il
    // taglio va ridotto si rinuncia agli angoli e non al cuore del corridoio
    via.sort((p, q) => distanza(q, m1, m2) - distanza(p, m1, m2));
    return via;
  },
};

// nome della stanza -> taglio. L'ORDINE E' UNA REGOLA, non un caso: «la loggia
// delle campane» e' un anello prima che un passaggio, e «il sottoportico» e'
// smussato prima che stretto.
const REGOLE = [
  [/ballatoio|loggia|deambulator/i, 'anello'],
  [/cistern|pozzo|vasca/i, 'tonda'],
  [/guglia|campanil|torre|lanterna/i, 'guglia'],
  [/tetto|abbaino|gronda|comignol|terrazza|lucernario|coppi|falda/i, 'tetto'],
  [/navata|abside|organo|coro|cappell|sagrato|altare|cript|ossari/i, 'abside'],
  [/sottoportico|atrio|salone|piazzal|cortile|mercato|capitolo|assemblea/i, 'angoli'],
  [/corridoio|galler|passerell|ponte|ponticell|calle|vicolo|camminament|cunicol|budello|fondamenta|intercapedine|scala|gradin|snodo|confluenza|quinta|salita/i, 'passaggio'],
  [/banchin|molo|imbarcader|riva|darsena|chiatt|barc|approdo|canale|roggia|marea/i, 'banchina'],
];

function taglioDi(tile) {
  const nome = `${tile.nome || ''} ${tile.id || ''}`;
  for (const [re, quale] of REGOLE) if (re.test(nome)) return quale;
  return 'pieno';
}

// tutte le caselle attaccate a `partenza`, camminando N/S/E/O
function raggiunte(vive, partenza) {
  const visti = new Set([k(partenza)]);
  const coda = [partenza];
  while (coda.length) {
    const [c, r] = coda.pop();
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const p = [c + dc, r + dr];
      if (!vive.has(k(p)) || visti.has(k(p))) continue;
      visti.add(k(p)); coda.push(p);
    }
  }
  return visti;
}

/**
 * La sagoma di una tessera.
 *
 * @param tile     la tessera (serve il nome, che dice il taglio)
 * @param porte    { N:[col,row], S:..., ... } le caselle-porta gia' scelte da
 *                 `pickDoorIndex`: la sagoma si adatta a QUESTE, mai viceversa
 * @param arredi   [[col,row], ...] in coordinate di disegno
 * @returns { taglio, celle, spente, scartata } — `celle` sono quelle vive.
 *          `scartata` dice che il taglio e' stato buttato perche' spezzava la
 *          stanza, e si e' tornati al quadrato pieno.
 */
function sagomaDi(tile, porte, arredi = []) {
  const taglio = taglioDi(tile);
  const ordinate = (TAGLI[taglio] || TAGLI.pieno)(porte).map(k);
  // le caselle che non si possono togliere: le porte e gli arredi. Un arredo
  // sospeso nel vuoto e' un guasto che nessun test vedrebbe — si vede al tavolo
  const intoccabili = new Set([...Object.values(porte), ...arredi].map(k));

  // SI RICUCE, NON SI RINUNCIA.
  //
  // Prima, se il taglio spezzava la stanza, si rinunciava alle sue caselle una
  // alla volta finche' non tornava intera — e su una stanza grande bastava un
  // arredo dei dati capitato in un angolo per far cadere tutto il taglio: «la
  // galleria delle eco» tornava una stanza quadrata perche' aveva una cassa
  // fuori dalla fascia del corridoio.
  //
  // Adesso quel che resta staccato si RIATTACCA: si riaccende il cammino piu'
  // corto fra il pezzo isolato e il corpo della stanza. La pianta perde qualche
  // casella dove serve e la tiene dove conta — e un arredo non resta mai su
  // un'isola.
  const via = new Set(ordinate.filter((s2) => !intoccabili.has(s2)));
  const vive = new Set(tutte().map(k).filter((s2) => !via.has(s2)));
  const celleDi = (v) => [...v].map((s2) => s2.split(',').map(Number));
  let cuciture = 0;
  for (let giro = 0; giro < 8; giro++) {
    const celle0 = celleDi(vive);
    if (!celle0.length) break;
    // il corpo della stanza e' il pezzo piu' grande
    let corpo = null;
    const visti = new Set();
    for (const p0 of celle0) {
      if (visti.has(k(p0))) continue;
      const gruppo = raggiunte(vive, p0);
      gruppo.forEach((x) => visti.add(x));
      if (!corpo || gruppo.size > corpo.size) corpo = gruppo;
    }
    if (corpo.size === vive.size) break;
    // il cammino piu' corto da un pezzo isolato al corpo, attraversando anche
    // le caselle spente: quelle che tocca si riaccendono
    const fuori = celle0.filter((p0) => !corpo.has(k(p0)));
    const coda = fuori.map((p0) => [p0, [p0]]);
    const visto = new Set(fuori.map(k));
    let cammino = null;
    while (coda.length && !cammino) {
      const [[c, r], strada] = coda.shift();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const q = [c + dc, r + dr];
        if (q[0] < 0 || q[1] < 0 || q[0] > U() || q[1] > U() || visto.has(k(q))) continue;
        visto.add(k(q));
        if (corpo.has(k(q))) { cammino = strada.concat([q]); break; }
        coda.push([q, strada.concat([q])]);
      }
    }
    if (!cammino) break;
    for (const q of cammino) { vive.add(k(q)); via.delete(k(q)); }
    cuciture++;
  }
  const migliori = { via, celle: celleDi(vive), rinunciate: cuciture };
  if (!migliori) return { taglio: 'pieno', celle: tutte(), spente: [], scartata: taglio };
  return {
    taglio: migliori.via.size ? taglio : 'pieno',
    celle: migliori.celle,
    spente: [...migliori.via].map((s) => s.split(',').map(Number)),
    // `scartata` non e' piu' «buttata via»: e' «e' stata ridotta», e dice di
    // quanto. A zero il taglio e' uscito intero.
    // `scartata` non e' «buttata via»: dice quante cuciture sono servite a
    // tenere la stanza tutta attaccata. A zero il taglio e' uscito intero.
    scartata: migliori.rinunciate ? `${taglio}: ${migliori.rinunciate} cuciture` : null,
  };
}

module.exports = { sagomaDi, taglioDi, TAGLI, REGOLE, setLato };

// ------------------------------------------------------------- il collaudo
// Non un banco: la cosa piu' piccola che si rompe se la logica si rompe. Gira
// con `node scripts/tiles/sagome.js`.
if (require.main === module) {
  const assert = require('assert');
  const porteDi = (o) => o;

  // il passaggio con due porte opposte e' una fascia larga due caselle
  let s = sagomaDi({ nome: 'Il Corridoio delle Candele' },
                   porteDi({ O: [0, 1], E: [3, 1] }));
  assert.strictEqual(s.taglio, 'passaggio');
  assert.strictEqual(s.celle.length, 8, 'fascia 4x2, non ' + s.celle.length);
  assert.ok(!s.celle.some(([, r]) => r === 0 || r === 3), 'le righe di bordo restano');

  // il ballatoio ha il vuoto in mezzo, e resta comunque tutto attaccato
  s = sagomaDi({ nome: 'Il Ballatoio della Torre' }, porteDi({ N: [1, 0], S: [1, 3] }));
  assert.strictEqual(s.taglio, 'anello');
  assert.strictEqual(s.celle.length, 12);

  // UNA PORTA NON SI MURA MAI: se il taglio prende la casella della porta, la
  // casella torna — e il taglio RESTA. Qui la porta N sta nell'angolo, che
  // l'ottagono toglierebbe.
  //
  // Il controllo e' sul TAGLIO, non sulla casella: chiedere solo «la casella
  // c'e'?» e' una domanda vacua, perche' quando la sagoma mura una porta viene
  // buttata e il quadrato pieno quella casella ce l'ha comunque. Provato
  // togliendo la riga che rimette le porte: il banco restava verde.
  s = sagomaDi({ nome: 'Il Sottoportico' }, porteDi({ N: [0, 0], S: [3, 3] }));
  assert.strictEqual(s.taglio, 'angoli', 'sagoma buttata invece di adattata');
  assert.ok(s.celle.some(([c, r]) => c === 0 && r === 0), 'porta N murata');
  assert.ok(s.celle.some(([c, r]) => c === 3 && r === 3), 'porta S murata');

  // UN ARREDO NON RESTA SOSPESO NEL VUOTO, e nemmeno qui la sagoma si butta
  s = sagomaDi({ nome: 'La Cisterna delle Colonne' },
               porteDi({ O: [0, 1] }), [[1, 1]]);
  assert.strictEqual(s.taglio, 'tonda', 'sagoma buttata invece di adattata');
  assert.ok(s.celle.some(([c, r]) => c === 1 && r === 1), 'arredo nel vuoto');

  // UNA SAGOMA CHE SPEZZA LA STANZA VIENE BUTTATA. L'anello con una porta al
  // centro non puo' esistere: quella casella torna, e il giro resta intero.
  s = sagomaDi({ nome: 'La Loggia delle Campane' }, porteDi({ N: [1, 1] }));
  assert.ok(s.celle.some(([c, r]) => c === 1 && r === 1));

  // ogni tessera vera dei 21 episodi produce una sagoma tutta attaccata
  const fs = require('fs'); const path = require('path');
  const ROOT = path.resolve(__dirname, '..', '..');
  let n = 0, scartate = 0; const conto = {}; const buttate = [];
  for (const ep of ['preludio', ...Array.from({ length: 20 }, (_, i) => `ep${i + 1}`)]) {
    const f = path.join(ROOT, 'webapp', 'data', `${ep}.json`);
    if (!fs.existsSync(f)) continue;
    for (const t of JSON.parse(fs.readFileSync(f, 'utf8')).tessere || []) {
      const occ = new Set((t.arredi || []).map(([gx, gy]) => `${gx},${3 - gy}`));
      const porte = {};
      for (const dir of Object.keys(t.exits || {})) {
        const pref = [1, 2, 0, 3];
        let idx = 1;
        for (const i of pref) {
          const key = (dir === 'N' || dir === 'S') ? `${i},${dir === 'N' ? 0 : 3}`
            : `${dir === 'O' ? 0 : 3},${i}`;
          if (!occ.has(key)) { idx = i; break; }
        }
        porte[dir] = (dir === 'N') ? [idx, 0] : (dir === 'S') ? [idx, 3]
          : (dir === 'O') ? [0, idx] : [3, idx];
      }
      const r = sagomaDi(t, porte, [...occ].map((s2) => s2.split(',').map(Number)));
      const vive = new Set(r.celle.map(k));
      assert.strictEqual(raggiunte(vive, r.celle[0]).size, vive.size,
                         `${ep}/${t.id} spezzata`);
      for (const p of Object.values(porte)) {
        assert.ok(vive.has(k(p)), `${ep}/${t.id} porta murata`);
      }
      n++; if (r.scartata) { scartate++; buttate.push(`${ep}/${t.id} (${r.scartata})`); }
      conto[r.taglio] = (conto[r.taglio] || 0) + 1;
    }
  }
  // LA GENERALIZZAZIONE VA PROVATA, non dichiarata: a lato 6 le stesse piante
  // devono uscire intere, o «funziona anche su 6x6» e' una frase e basta.
  setLato(6);
  for (const nome of ['Il Corridoio delle Candele', 'Il Ballatoio della Torre',
                      'La Cisterna delle Colonne', 'La Navata Sepolta', 'La Banchina']) {
    const r = sagomaDi({ nome }, { O: [0, 2], E: [5, 2] });
    const v = new Set(r.celle.map(k));
    assert.ok(r.celle.length > 0, nome);
    assert.strictEqual(raggiunte(v, r.celle[0]).size, v.size, `${nome} spezzata a 6x6`);
  }
  const largo = sagomaDi({ nome: 'Il Corridoio' }, { O: [0, 2], E: [5, 2] });
  assert.strictEqual(largo.celle.length, 12, `il passaggio a 6x6 e' 6x2, non ${largo.celle.length}`);
  setLato(4);

  console.log(`${n} tessere, nessuna spezzata, nessuna porta murata`);
  console.log('tagli:', Object.entries(conto).sort((a, b) => b[1] - a[1])
    .map(([t, c]) => `${t} ${c}`).join(' · '));
  // IL TETTO SUL NUMERO E' IL COLLAUDO VERO. Senza, una regressione che fa
  // buttare meta' delle sagome uscirebbe con tutti i banchi verdi: le tessere
  // tornerebbero quadrate una per una, in silenzio.
  console.log(`sagome ricucite per restare intere: ${scartate} — ${buttate.join(', ')}`);
  assert.ok(scartate <= 14, `troppe cuciture: ${scartate} (il tetto e' 14)`);
  assert.ok((conto.pieno || 0) <= 70, `troppe tessere rimaste quadrate: ${conto.pieno}`);
}
