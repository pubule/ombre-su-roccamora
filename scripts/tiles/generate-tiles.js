// Genera le 6 tessere di Spedizione (T1-T6): griglia 4x4 sopra l'artwork
// atmosferico, arredi come tessere modulari separate, porta agganciata a
// UNA cella specifica del bordo (scelta automaticamente evitando le celle
// gia' occupate da un arredo). Stile derivato dal prototipo v3 approvato.
//
// Dati (exits/arredi) presi 1:1 da TILES in src/gen_cards.py.
//
// Uso: node scripts/tiles/generate-tiles.js [ep1|ep2|...|ep20] [--solo-mancanti]
//                                            [--vtt] [--out <cartella>]
// --solo-mancanti: salta le tessere il cui PNG esiste gia' in <Episodio>/board/.
// --vtt: la disegna DALL'ALTO (scripts/tiles/pittura-vtt.js) invece che come
//        veduta in prospettiva. Il pennello vecchio resta finche' non si sceglie.
// --out: scrive altrove — serve al pilota, che non deve toccare le tessere in uso.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { htmlVtt } = require('./pittura-vtt');
// LA SAGOMA DELLA STANZA (direzione 2 del mockup «la forma delle tessere»):
// l'ingombro resta 4x4, il muro segue la pianta. Si accende con OSR_SAGOME=1,
// cosi' le tessere gia' stampate non cambiano finche' la direzione non e' scelta.
const { sagomaDi, setLato } = require('./sagome');
// la taglia della stanza e il suo corredo, dal nome (scripts/tiles/stanze.js)
const { latoDi, arrediInPiu } = require('./stanze');
const ARREDA = process.env.OSR_ARREDA === '1';
const SAGOME = process.env.OSR_SAGOME === '1';
let ALLINEATE = new Map();

const ROOT = path.resolve(__dirname, '..', '..');
const SOLO_MANCANTI = process.argv.includes('--solo-mancanti');
const VTT = process.argv.includes('--vtt');
// --solo T3,T5: genera solo quelle tessere. Il campione ne chiede una o due per
// episodio, e rifare tutte e sei per averne una costa quattro volte il tempo.
const iSolo = process.argv.indexOf('--solo');
const SOLO = iSolo >= 0 ? new Set(process.argv[iSolo + 1].split(',')) : null;
const iOut = process.argv.indexOf('--out');
const OUT_SCELTA = iOut >= 0 ? process.argv[iOut + 1] : null;
const argv = process.argv.slice(2)
  .filter((a, i, tutti) => !a.startsWith('--') && tutti[i - 1] !== '--out'
                           && tutti[i - 1] !== '--solo');
// set per episodio: node scripts/tiles/generate-tiles.js [ep1|ep2|...|ep15]
const SET = (argv[0] || 'ep1').toLowerCase();
const EP_NUM = /^ep(\d{1,2})$/.exec(SET)?.[1];
// IL PRELUDIO NON E' «ep0». Ha le sue tessere in webapp/data/preludio.json come
// tutti gli altri, ma il nome non entra nella regex e lo script usciva con «set
// sconosciuto»: le sue due tessere del campione non si potevano rigenerare.
if (SET !== 'preludio' && (!EP_NUM || +EP_NUM < 1 || +EP_NUM > 20)) {
  console.error('set sconosciuto (preludio, ep1..ep20)'); process.exit(1);
}
const EP_DIR = SET === 'preludio' ? 'Preludio' : `Episodio ${EP_NUM}`;
const OUT_DIR = OUT_SCELTA
  ? path.resolve(ROOT, OUT_SCELTA)
  : path.join(ROOT, EP_DIR, 'board');
fs.mkdirSync(OUT_DIR, { recursive: true });

// LA TAGLIA DELLA TESSERA, in due manopole invece che in un numero solo.
//
//   OSR_CASELLA  quanti pixel vale una casella (616 = 50 mm alla densita' di
//                stampa di sempre, 12,32 px/mm)
//   OSR_CORNICE  quanto e' spessa la fascia di muro FUORI dal reticolo, in
//                caselle (0 = il muro sta sopra le caselle, com'era)
//
// A valori di default il conto torna a 2464 px = 200 mm e non cambia un pixel.
// La 130 -> 200 mm di allora serviva a portare la casella da 32,5 a 50 mm, il
// minimo per muovere comodo i token; la cornice serve a un'altra cosa ancora —
// che quei 50 mm siano tutti pavimento e non meta' muro.
const PX_MM = 12.32;
const CASELLA = Number(process.env.OSR_CASELLA || 616);
const CORNICE = Number(process.env.OSR_CORNICE || 0);
// OSR_LATO: quante caselle per lato. Quattro e' quel che c'e' sempre stato.
// I DATI PERO' SONO SCRITTI SU UN 4x4 (gli arredi hanno coordinate 0..3), e non
// si riscrivono 249 arredi per provare una taglia: le coordinate si stirano.
// OSR_LATO: un numero per tutte, oppure «auto» — e allora la taglia la dice il
// NOME della stanza (scripts/tiles/stanze.js). Uno stanzino e una navata non
// hanno lo stesso numero di caselle piu' di quanto abbiano lo stesso pavimento.
const LATO_ENV = process.env.OSR_LATO || '4';
const latoPer = (tile) => (LATO_ENV === 'auto' ? latoDi(tile) : Number(LATO_ENV));
// la tessera cresce con le sue caselle: il PASSO resta lo stesso, cosi' una
// pedina e' comoda uguale in uno stanzino e in una cattedrale
const lastraDi = (L) => Math.round(CASELLA * (L + 2 * CORNICE) / 4) * 4;
// 0..3 -> 0..L-1, tenendo gli estremi agli estremi. A L 4 e' l'identita'; piu'
// in la' si aprono corsie in mezzo, ed e' proprio lo spazio per girare attorno
// a un arredo invece di scavalcarlo.
const stira = (i, L) => Math.round((i * (L - 1)) / 3);
// la preferenza per la porta: le caselle piu' centrali per prime, sempre
const pref = (L) => Array.from({ length: L }, (_, i) => i)
  .sort((a, b) => Math.abs(a - (L - 1) / 2) - Math.abs(b - (L - 1) / 2));

// Episodio 2 - 1:1 da src/gen_ep2.py TILES_2 (id, nome, exits, arredi);
// arte di sfondo: artworks/<id>-ep2.png (campo art).
const TILES_EP2 = [
  { id: 'T1', nome: 'Banchina delle Scorie', art: 'T1-ep2.png', exits: { N: 'T2' }, start: 'S',
    arredi: [[0, 3, 'molo'], [3, 0, 'scorie']] },
  { id: 'T2', nome: 'Il Piazzale delle Forme', art: 'T2-ep2.png', exits: { S: 'T1', E: 'T3', N: 'T4' },
    arredi: [[1, 1, 'forma'], [2, 2, 'forma']] },
  { id: 'T3', nome: 'Il Magazzino delle Staffe', art: 'T3-ep2.png', exits: { O: 'T2' },
    arredi: [[1, 0, 'casse'], [3, 1, 'casse'], [0, 3, 'crogiolo']] },
  { id: 'T4', nome: 'La Passerella sul Canale di Scolo', art: 'T4-ep2.png', exits: { S: 'T2', N: 'T5' },
    arredi: [[0, 1, 'molo'], [3, 1, 'molo'], [0, 2, 'molo'], [3, 2, 'molo']] },
  { id: 'T5', nome: "L'Ufficio del Pesatore", art: 'T5-ep2.png', exits: { S: 'T4', E: 'T6' },
    arredi: [[1, 3, 'scrivania'], [3, 0, 'stufa']] },
  { id: 'T6', nome: 'La Sala dei Forni', art: 'T6-ep2.png', exits: { O: 'T5' },
    arredi: [[1, 2, 'crogiolo'], [2, 2, 'forma'], [3, 3, 'forma']] },
];

// TILES 1:1 da src/gen_cards.py (id, nome, exits, arredi)
const TILES_EP1 = [
  { id: 'T1', nome: 'Banchina d’Ingresso', exits: { N: 'T2' }, start: 'S',
    arredi: [[0, 3, 'molo'], [3, 3, 'casse']] },
  { id: 'T2', nome: 'Sala delle Casse', exits: { S: 'T1', E: 'T3', O: 'T4', N: 'T5' },
    arredi: [[1, 1, 'casse'], [2, 2, 'casse']] },
  { id: 'T3', nome: 'Corridoio delle Candele', exits: { O: 'T2' },
    arredi: [[0, 0, 'candele'], [3, 0, 'candele'], [0, 3, 'candele'], [3, 3, 'candele']] },
  { id: 'T4', nome: 'Ufficio del Custode', exits: { E: 'T2' },
    arredi: [[1, 3, 'scrivania'], [3, 0, 'branda']] },
  { id: 'T5', nome: 'Scala al Piano Interrato', exits: { S: 'T2', N: 'T6' },
    arredi: [[1, 1, 'scala'], [2, 1, 'scala'], [1, 2, 'scala'], [2, 2, 'scala']] },
  { id: 'T6', nome: 'Cripta della Cera', exits: { S: 'T5' },
    arredi: [[1, 2, 'altare'], [2, 2, 'altare'], [3, 3, 'cella']] },
];
// Episodi 10-15: stessa topologia di tessere (catena lineare T1..T6, solo
// uscite N/S) - 1:1 da TILES_N in ogni src/gen_epN.py, nomi presi dai
// rispettivi PROMPT-MIDJOURNEY-Episodio-N.md. Arte di sfondo:
// artworks/<id>-ep<N>.png (campo art), stesso pattern di Ep.2. Gli arredi
// sono scelti per ambientazione (nessuna arte nuova: solo i 12 tipi gia'
// in ARREDO_KEYS) - coordinate a coppie per cella gia' validate contro le
// porte, cambia solo l'etichetta.
function catenaLineare(epNum, nomi, arrediPerTessera) {
  const ids = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
  return ids.map((id, i) => ({
    id, nome: nomi[i], art: `${id}-ep${epNum}.png`,
    exits: i === 0 ? { N: ids[1] } : i === ids.length - 1 ? { S: ids[i - 1] } : { S: ids[i - 1], N: ids[i + 1] },
    ...(i === 0 ? { start: 'S' } : {}),
    arredi: arrediPerTessera[i],
  }));
}

const TILES_BY_SET = {
  ep1: TILES_EP1,
  ep2: TILES_EP2,
  // Ep.10 - Casa Malfanti, demolizione: tinello sgomberato, scala vera,
  // corridoio illuminato a candele, camera col letto disfatto, sottoscala
  // di stoccaggio, l'intercapedine murata (cella).
  ep10: catenaLineare(10, ['L’Ingresso (il tinello)', 'La Scala che Ripete', 'Il Corridoio dei Nomi',
                           'La Camera che Detta', 'Il Sottoscala', 'L’Intercapedine'],
    [[[0, 3, 'casse'], [3, 0, 'casse']],
     [[1, 1, 'scala'], [2, 2, 'scala']],
     [[0, 1, 'candele'], [3, 2, 'candele']],
     [[1, 2, 'branda'], [2, 0, 'casse']],
     [[1, 1, 'casse'], [2, 2, 'casse']],
     [[0, 2, 'cella']]]),
  // Ep.11 - Torre Civica, topografi: attrezzatura di rilievo (casse) e
  // scale/ballatoi di accesso alla torre, campane a lume di candela.
  ep11: catenaLineare(11, ['L’Abbaino', 'Il Camminamento Ovest', 'La Loggia delle Campane',
                           'Il Tetto a Schiena d’Asino', 'Il Ballatoio della Torre', 'La Guglia'],
    [[[0, 3, 'casse'], [3, 0, 'casse']],
     [[1, 1, 'scala'], [2, 2, 'casse']],
     [[0, 1, 'candele'], [3, 2, 'candele']],
     [[1, 2, 'casse'], [2, 0, 'casse']],
     [[1, 1, 'scala'], [2, 2, 'casse']],
     [[0, 2, 'casse']]]),
  // Ep.12 - Roccamora sui canali, il Corriere: moli e pontili lungo tutto
  // il tragitto, l'archivio con una scrivania.
  ep12: catenaLineare(12, ['L’Archivio Violato', 'Il Ponte dei Sospiri', 'La Fondamenta Stretta',
                           'Il Canale della Nebbia', 'Il Sottoportico', 'Il Cimitero delle Barche'],
    [[[0, 3, 'scrivania'], [3, 0, 'casse']],
     [[1, 1, 'molo'], [2, 2, 'molo']],
     [[0, 1, 'molo'], [3, 2, 'casse']],
     [[1, 2, 'molo'], [2, 0, 'casse']],
     [[1, 1, 'casse'], [2, 2, 'casse']],
     [[0, 2, 'molo']]]),
  // Ep.13 - Molino delle Carte: moli sulla roggia, magazzini e sale di
  // lavorazione a casse (nessun arredo "macina/torchio" dedicato).
  ep13: catenaLineare(13, ['Il Cortile del Molino', 'La Roggia', 'La Sala delle Macine',
                           'I Magazzini di Stracci', 'L’Essiccatoio', 'La Sala del Torchio'],
    [[[0, 3, 'casse'], [3, 0, 'casse']],
     [[1, 1, 'molo'], [2, 2, 'molo']],
     [[0, 1, 'casse'], [3, 2, 'casse']],
     [[1, 2, 'casse'], [2, 0, 'casse']],
     [[1, 1, 'casse'], [2, 2, 'candele']],
     [[0, 2, 'casse']]]),
  // Ep.14 - tetti di Roccamora, il Ricettatore: comignolo come stufa/fumaiolo,
  // candele nei punti di passaggio (lucernario, panni), refurtiva in casse.
  ep14: catenaLineare(14, ['La Gronda', 'Il Comignolo', 'La Terrazza dei Panni',
                           'L’Abbaino', 'Il Lucernario', 'L’Attico del Corso'],
    [[[0, 3, 'casse'], [3, 0, 'casse']],
     [[1, 1, 'stufa'], [2, 2, 'stufa']],
     [[0, 1, 'casse'], [3, 2, 'candele']],
     [[1, 2, 'casse'], [2, 0, 'candele']],
     [[1, 1, 'candele'], [2, 2, 'casse']],
     [[0, 2, 'casse']]]),
  // Ep.15 - Villa-Museo di Braga: scrivanie nei due studi (Braga e quello
  // segreto), teche/altare nella galleria dei cimeli, scale di servizio vere.
  ep15: catenaLineare(15, ['Il Cancello', 'L’Atrio', 'Lo Studio di Braga',
                           'La Galleria dei Cimeli', 'Le Scale di Servizio', 'Lo Studio Segreto'],
    [[[0, 3, 'casse'], [3, 0, 'casse']],
     [[1, 1, 'candele'], [2, 2, 'casse']],
     [[0, 1, 'scrivania'], [3, 2, 'scrivania']],
     [[1, 2, 'casse'], [2, 0, 'altare']],
     [[1, 1, 'scala'], [2, 2, 'scala']],
     [[0, 2, 'scrivania']]]),
};
// Gli episodi senza una voce qui sopra (3-9 e 16-20) prendono le tessere da
// `webapp/data/ep<N>.json`, che le esporta gia' tutte — id, nome, uscite e
// arredi — da src/gen_ep<N>.py. Prima erano semplicemente assenti: lo script
// conosceva ep1/ep2/ep10..ep15 e per gli altri usciva con «set sconosciuto»,
// quindi dodici episodi non hanno mai avuto le tessere di Spedizione.
// Ep.1 e Ep.2 restano scritti a mano: hanno nomi e nomi-file d'arte propri
// (Ep.1 usa artworks/<id>.png) che cambiare vorrebbe dire rigenerare tessere
// gia' stampate.
function dallaWebapp(epNum) {
  const file = path.join(ROOT, 'webapp', 'data', epNum ? `ep${epNum}.json` : 'preludio.json');
  if (!fs.existsSync(file)) return null;
  const tessere = JSON.parse(fs.readFileSync(file, 'utf8')).tessere || [];
  return tessere.map((t, i) => ({
    id: t.id,
    nome: t.nome,
    art: `${t.id}-ep${epNum || 'preludio'}.png`,
    exits: t.exits || {},
    arredi: t.arredi || [],
    ...(i === 0 ? { start: 'S' } : {}),   // la prima tessera e' l'ingresso
  }));
}

const TILES = TILES_BY_SET[SET] || dallaWebapp(EP_NUM);
if (!TILES || !TILES.length) {
  console.error(`nessuna tessera per ${SET}: manca webapp/data/${SET}.json (o non ha tessere)`);
  process.exit(1);
}

// Arte vera per arredo (prompt in PROMPT-MIDJOURNEY.md, sezione "Arredi delle
// tessere"): un file artworks/<chiave>.png per chiave di ARREDO_STYLE.
const ARREDO_KEYS = ['molo', 'casse', 'candele', 'scrivania', 'branda', 'scala', 'altare', 'cella',
                     'forma', 'scorie', 'crogiolo', 'stufa', 'armadio', 'toeletta'];
// Solo gli arredi che l'arte ce l'hanno davvero: una chiave senza PNG
// disegnava un riquadro vuoto sulla tessera, indistinguibile da una scelta.
const ARREDO_ART = Object.fromEntries(ARREDO_KEYS
  .filter((k) => {
    const p = path.join(ROOT, 'artworks', `${k}.png`);
    if (fs.existsSync(p)) return true;
    console.log(`arredo senza arte, non disegnato: artworks/${k}.png`);
    return false;
  })
  .map((k) => [k, pathToFileURL(path.join(ROOT, 'artworks', `${k}.png`)).href]));
// zoom oltre il "cover" di base per chi ha l'oggetto piccolo al centro di una
// cornice propria (vedi commento sotto, dove si usa)
const ARREDO_ZOOM = { altare: 1.8 };

// sceglie la cella libera (non occupata da un arredo) piu' centrale lungo
// il bordo della direzione data, cosi' la porta non si sovrappone mai a un arredo
function cellaPorta(dir, idx, L) {
  const u = L - 1;
  return (dir === 'N') ? `${idx},0` : (dir === 'S') ? `${idx},${u}`
    : (dir === 'O') ? `0,${idx}` : `${u},${idx}`;
}

function pickDoorIndex(dir, occupied, L) {
  for (const idx of pref(L)) if (!occupied.has(cellaPorta(dir, idx, L))) return idx;
  return pref(L)[0];
}

// LE DUE META' DI UNA PORTA DEVONO COMBACIARE.
//
// Finora ogni tessera sceglieva il proprio indice da sola: se la stanza di la'
// aveva un arredo dove questa apriva il varco, i due varchi finivano su caselle
// diverse e la soglia dava su un muro. Si vede subito accostandole — due buchi
// sfalsati con la pietra in mezzo — e nessun banco lo prendeva, perche' il
// motore fa comunque atterrare chi passa sulla casella d'ingresso.
//
// Qui l'indice e' una proprieta' del COLLEGAMENTO, non della tessera: si sceglie
// una volta sola, il piu' centrale che sia libero DA TUTTE E DUE le parti. Righe
// e colonne si contano dall'alto e da sinistra in tutte e due le tessere, quindi
// l'indice e' lo stesso senza specchiature.
function porteAllineate(tiles) {
  const LDi = new Map(tiles.map((t) => [t.id, latoPer(t)]));
  const occDi = new Map(tiles.map((t) => [t.id, celleOccupate(t, LDi.get(t.id))]));
  const primo = (raw) => String(raw).split(/\s+/)[0];
  const fuori = new Map();                    // "T1|E" -> idx
  for (const t of tiles) {
    for (const [dir, raw] of Object.entries(t.exits || {})) {
      if (fuori.has(`${t.id}|${dir}`)) continue;
      const dest = tiles.find((x) => x.id === primo(raw));
      let back = null;
      if (dest) {
        for (const [d2, r2] of Object.entries(dest.exits || {})) {
          if (primo(r2) === t.id) { back = d2; break; }
        }
      }
      const qui = occDi.get(t.id);
      const la = dest ? occDi.get(dest.id) : null;
      const Lq = LDi.get(t.id), Ll = dest ? LDi.get(dest.id) : Lq;
      // DUE STANZE DI TAGLIA DIVERSA hanno bordi di lunghezza diversa: l'indice
      // va cercato dove esiste in tutte e due, cioe' fino al piu' corto dei due
      // lati. Senza, una porta scelta al quinto posto in una sala 6x6 finirebbe
      // fuori dal muro di uno stanzino 4x4.
      const corto = Math.min(Lq, Ll);
      let idx = pref(corto).find((i) => !qui.has(cellaPorta(dir, i, Lq))
        && (!la || !back || !la.has(cellaPorta(back, i, Ll))));
      if (idx === undefined) idx = pickDoorIndex(dir, qui, Lq);
      fuori.set(`${t.id}|${dir}`, idx);
      if (dest && back) fuori.set(`${dest.id}|${back}`, idx);
    }
  }
  return fuori;
}

// Raggruppa celle adiacenti con lo stesso arredo in un unico rettangolo (4x4
// grid, connessione N/S/E/O): un arredo che occupa piu' celle (es. la scala
// 2x2 di T5) va disegnato una sola volta, non ripetuto identico su ogni
// cella - altrimenti sembrano oggetti diversi invece di uno solo piu' grande.
// le caselle davvero occupate da un arredo, DOPO lo stiramento: e' su queste
// che si scelgono le porte e si taglia la sagoma, non sulle coordinate dei dati
function celleOccupate(tile, L) {
  const fuori = new Set();
  for (const g of groupArredi(tile.arredi || [], L)) {
    for (let r = 0; r < g.rows; r++) {
      for (let c = 0; c < g.cols; c++) fuori.add(`${g.col + c},${g.row + r}`);
    }
  }
  return fuori;
}

function groupArredi(arredi, L) {
  const cells = arredi.map(([gx, gy, label]) => ({ col: gx, row: 3 - gy, label }));
  const byKey = new Map(cells.map((c) => [`${c.col},${c.row}`, c]));
  const used = new Set();
  const groups = [];
  for (const start of cells) {
    const startKey = `${start.col},${start.row}`;
    if (used.has(startKey)) continue;
    used.add(startKey);
    const stack = [start];
    let minC = start.col, maxC = start.col, minR = start.row, maxR = start.row;
    while (stack.length) {
      const c = stack.pop();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${c.col + dc},${c.row + dr}`;
        const n = byKey.get(key);
        if (n && n.label === start.label && !used.has(key)) {
          used.add(key);
          stack.push(n);
          minC = Math.min(minC, n.col); maxC = Math.max(maxC, n.col);
          minR = Math.min(minR, n.row); maxR = Math.max(maxR, n.row);
        }
      }
    }
    // LO STIRAMENTO SI FA SUL RETTANGOLO, non sulle singole celle: stirando le
    // celle una per una, la scala 2x2 di T5 si sarebbe spezzata in quattro scale
    // separate coi buchi in mezzo. Qui si stirano gli ESTREMI, e l'arredo si
    // allarga insieme alla stanza.
    const c0 = stira(minC, L), c1 = stira(maxC, L),
      r0 = stira(minR, L), r1 = stira(maxR, L);
    groups.push({ col: c0, row: r0, cols: c1 - c0 + 1, rows: r1 - r0 + 1, label: start.label });
  }
  return groups;
}

function html(tile) {
  const cell = S / 4;
  const cellsHtml = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      cellsHtml.push(`<div class="cell" style="left:${col * cell}px; top:${row * cell}px; width:${cell}px; height:${cell}px;"></div>`);
    }
  }
  // arredi: (gx,gy) convenzione PDF (gy=0 in basso) -> riga schermo = 3-gy
  const occupied = new Set(tile.arredi.map(([gx, gy]) => `${gx},${3 - gy}`));
  const arredoHtml = groupArredi(tile.arredi).map((g) => {
    const art = ARREDO_ART[g.label.toLowerCase()];
    if (!art) return '';   // arte mancante: casella libera, non un riquadro vuoto
    const boxW = g.cols * cell - 12, boxH = g.rows * cell - 12;
    // le art arredo sono quadrate (2048x2048) con l'oggetto piccolo al centro
    // di una cornice decorativa propria: un semplice "cover" lo lascia minuscolo
    // in un riquadro non quadrato (es. l'altare 1x2 di T6). Zoom esplicito in
    // px (equivalente a cover quando zoom=1, dato che l'immagine e' quadrata:
    // scala = max(boxW,boxH)) cosi' l'oggetto riempie meglio il riquadro.
    const zoom = ARREDO_ZOOM[g.label.toLowerCase()] || 1;
    const size = Math.round(Math.max(boxW, boxH) * zoom);
    return `<div class="arredo" style="left:${g.col * cell + 6}px; top:${g.row * cell + 6}px; width:${boxW}px; height:${boxH}px; background-image:url('${art}'); background-size:${size}px ${size}px;"></div>`;
  }).join('');

  // Le porte e la loro etichetta di destinazione stanno DENTRO il bordo della
  // tessera (non fuori, in un margine che poi va tagliato in stampa): senza,
  // ritagliando la tessera pulita si perderebbe l'unico modo per sapere quale
  // T* si aggancia a quale uscita mentre si monta il dungeon sul tavolo.
  const doorHtml = Object.entries(tile.exits).map(([dir, destRaw]) => {
    const dest = destRaw.match(/^\S+/)[0]; // "T5 (grata: ...)" -> "T5"
    const note = destRaw.slice(dest.length).trim();
    const idx = pickDoorIndex(dir, occupied);
    const styles = {
      N: `left:${idx * cell}px; top:0px; width:${cell}px; height:26px;`,
      S: `left:${idx * cell}px; top:${S - 26}px; width:${cell}px; height:26px;`,
      E: `left:${S - 26}px; top:${idx * cell}px; width:26px; height:${cell}px;`,
      O: `left:0px; top:${idx * cell}px; width:26px; height:${cell}px;`,
    };
    const labelPos = {
      N: `left:${idx * cell + cell / 2}px; top:${64}px;`,
      S: `left:${idx * cell + cell / 2}px; top:${S - 64}px;`,
      E: `left:${S - 100}px; top:${idx * cell + cell / 2}px;`,
      O: `left:${100}px; top:${idx * cell + cell / 2}px;`,
    };
    const arrowPos = {
      N: `left:${idx * cell + cell / 2}px; top:${32}px;`,
      S: `left:${idx * cell + cell / 2}px; top:${S - 32}px;`,
      E: `left:${S - 32}px; top:${idx * cell + cell / 2}px;`,
      O: `left:${32}px; top:${idx * cell + cell / 2}px;`,
    };
    const arrow = { N: '▲', S: '▼', E: '▶', O: '◀' }[dir];
    const doorClass = (dir === 'N' || dir === 'S') ? 'door door-h' : 'door door-v';
    return `<div class="${doorClass}" style="${styles[dir]}"></div>
            <div class="door-arrow" style="${arrowPos[dir]}">${arrow}</div>
            <div class="door-label" style="${labelPos[dir]}">verso ${dest}${note ? `<br/><small>${note}</small>` : ''}</div>`;
  }).join('');

  // Nessuna tessera "prima" di T1: gli eroi vi compaiono all'inizio della
  // Spedizione (arrivano dal canale, vedi Regolamento "Eroi sulla porta di
  // T1"), non entrano da un'altra tessera come per ogni altro collegamento.
  // Un bordo dorato "verso Tn" qui farebbe pensare a una settima tessera
  // mancante - stile diverso (teal, non oro) apposta per non confondere le
  // due cose, e freccia rivolta verso il centro (si entra, non si esce).
  const startHtml = tile.start ? (() => {
    const dir = tile.start;
    const idx = 1;
    const styles = {
      N: `left:${idx * cell}px; top:0px; width:${cell}px; height:26px;`,
      S: `left:${idx * cell}px; top:${S - 26}px; width:${cell}px; height:26px;`,
      E: `left:${S - 26}px; top:${idx * cell}px; width:26px; height:${cell}px;`,
      O: `left:0px; top:${idx * cell}px; width:26px; height:${cell}px;`,
    };
    const labelPos = {
      N: `left:${idx * cell + cell / 2}px; top:${64}px;`,
      S: `left:${idx * cell + cell / 2}px; top:${S - 64}px;`,
      E: `left:${S - 100}px; top:${idx * cell + cell / 2}px;`,
      O: `left:${100}px; top:${idx * cell + cell / 2}px;`,
    };
    const arrowPos = {
      N: `left:${idx * cell + cell / 2}px; top:${32}px;`,
      S: `left:${idx * cell + cell / 2}px; top:${S - 32}px;`,
      E: `left:${S - 32}px; top:${idx * cell + cell / 2}px;`,
      O: `left:${32}px; top:${idx * cell + cell / 2}px;`,
    };
    const arrow = { N: '▼', S: '▲', E: '◀', O: '▶' }[dir]; // verso il centro
    const doorClass = (dir === 'N' || dir === 'S') ? 'door door-h start' : 'door door-v start';
    return `<div class="${doorClass}" style="${styles[dir]}"></div>
            <div class="door-arrow start" style="${arrowPos[dir]}">${arrow}</div>
            <div class="door-label start" style="${labelPos[dir]}">ingresso<br/><small>gli eroi iniziano qui</small></div>`;
  })() : '';

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:${S}px; height:${S}px; }
    .stage { position:relative; width:${S}px; height:${S}px; overflow:hidden; }
    .stage img.art { position:absolute; inset:0; width:${S}px; height:${S}px; object-fit:cover; }
    .dim { position:absolute; inset:0; background:rgba(0,0,0,0.75); }
    .cell { position:absolute; border:2px solid rgba(230,195,120,0.55); box-sizing:border-box; }
    .arredo { position:absolute; border-radius:6px; border:2px solid rgba(230,195,120,0.9);
              box-shadow:0 4px 10px rgba(0,0,0,0.6); background-position:center; }
    /* Bagliore della porta: un radial-gradient "circle" unico non basta, si
       schiaccia diversamente in un riquadro largo-basso (N/S) rispetto a uno
       stretto-alto (E/O) - risultato incoerente (barra ben visibile a N/S,
       quasi invisibile a E/O). Un linear-gradient orientato sull'asse corto
       (26px) da' lo stesso "bagliore che sfuma ai bordi" su tutti e 4 i lati. */
    .door { position:absolute; border:4px solid #f2c14e; border-radius:6px; box-shadow:0 0 22px 6px rgba(242,193,78,0.85); }
    .door-h { background:linear-gradient(to bottom, transparent, rgba(242,193,78,0.95) 40%, rgba(242,193,78,0.95) 60%, transparent); }
    .door-v { background:linear-gradient(to right, transparent, rgba(242,193,78,0.95) 40%, rgba(242,193,78,0.95) 60%, transparent); }
    .door-arrow { position:absolute; transform:translate(-50%,-50%); font-size:34px; color:#2a1a05;
                  text-shadow:0 0 4px #fff8e0; }
    .door-label { position:absolute; transform:translate(-50%,-50%); white-space:nowrap; text-align:center;
                  font-family:'IM Fell English SC', serif; font-size:40px; font-weight:bold; color:#f2c14e;
                  text-shadow:0 0 8px #000, 0 0 4px #000; background:rgba(10,10,12,0.7); padding:4px 14px; border-radius:4px; }
    .door-label small { display:block; font-family:'Old Standard TT', serif; font-size:20px; color:#e6c47e; font-weight:normal; }
    /* Ingresso (T1): teal invece di oro, cosi' non si legge come una settima
       tessera mancante ma come un marcatore di natura diversa (inizio, non
       collegamento). */
    .door.start { border-color:#5fb8b0; box-shadow:0 0 22px 6px rgba(95,184,176,0.85); }
    .door-h.start { background:linear-gradient(to bottom, transparent, rgba(95,184,176,0.95) 40%, rgba(95,184,176,0.95) 60%, transparent); }
    .door-v.start { background:linear-gradient(to right, transparent, rgba(95,184,176,0.95) 40%, rgba(95,184,176,0.95) 60%, transparent); }
    .door-arrow.start { color:#0d2b28; text-shadow:0 0 4px #d8f5f0; }
    .door-label.start { color:#8fe0d6; }
    .door-label.start small { color:#bfece6; }
  </style></head><body>
    <div class="stage">
      <img class="art" src="${pathToFileURL(path.join(ROOT, 'artworks', tile.art || `${tile.id}.png`)).href}" />
      <div class="dim"></div>
      ${cellsHtml.join('')}
      ${arredoHtml}
      ${doorHtml}
      ${startHtml}
    </div>
  </body></html>`;
}

(async () => {
  ALLINEATE = porteAllineate(TILES);
  // le porte del collegamento, per chi deve posarci sopra il pezzo-soglia
  if (process.env.OSR_PORTE_JSON) {
    const righe = [];
    ALLINEATE.forEach((v, k) => righe.push({ chiave: k, idx: v }));
    fs.writeFileSync(process.env.OSR_PORTE_JSON, JSON.stringify(righe, null, 1));
  }
  if (CORNICE || CASELLA !== 616 || LATO_ENV !== '4') {
    const tag = [...new Set(TILES.map((t) => latoPer(t)))].sort()
      .map((L) => `${L}x${L} ${(lastraDi(L) / PX_MM).toFixed(0)}mm`).join(' · ');
    console.log(`casella ${(CASELLA / PX_MM).toFixed(0)}mm · muro condiviso `
      + `${(2 * CASELLA * CORNICE / PX_MM).toFixed(0)}mm · tessere: ${tag}`);
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: lastraDi(4), height: lastraDi(4) } });

  for (const tile of TILES) {
    if (SOLO && !SOLO.has(tile.id)) continue;
    const outPath = path.join(OUT_DIR, `${tile.id} - ${tile.nome}.png`);
    if (SOLO_MANCANTI && fs.existsSync(outPath)) {
      console.log("salto (esiste gia') ->", outPath);
      continue;
    }
    // Senza il suo sfondo la tessera esce come un rettangolo vuoto con sopra la
    // griglia: un PNG che sembra fatto e che --solo-mancanti non rifara' mai
    // piu'. Meglio saltarla e dirlo (stesso patto di generate-batch.js).
    //
    // DALL'ALTO non serve: la stanza si costruisce dai DATI (pavimento dal nome,
    // arredi dalle coordinate) e da texture CC0. E' anche il motivo per cui i
    // sette episodi senza illustrazione — 7, 8, 9, 16-20 — potrebbero avere le
    // loro tessere.
    if (!VTT) {
      const artFile = path.join(ROOT, 'artworks', tile.art || `${tile.id}.png`);
      if (!fs.existsSync(artFile)) {
        console.log(`salto ${tile.id}: manca artworks/${path.basename(artFile)}`);
        continue;
      }
    }
    const tmpHtml = path.join(OUT_DIR, `.tmp-${tile.id}.html`);
    // la geometria e' la stessa per tutti e due i pennelli: le celle adiacenti
    // dello stesso arredo si fondono in un oggetto solo, e la porta non cade
    // mai su un arredo
    const L = latoPer(tile);
    const lastra = lastraDi(L);
    setLato(L);
    const occupate = celleOccupate(tile, L);
    const porte = [
      ...Object.keys(tile.exits).map((dir) => ({
        dir, idx: ALLINEATE.has(`${tile.id}|${dir}`)
          ? ALLINEATE.get(`${tile.id}|${dir}`) : pickDoorIndex(dir, occupate, L),
      })),
      ...(tile.start ? [{ dir: tile.start, idx: pref(L)[0] }] : []),
    ];
    // le caselle-porta come le vede la sagoma: le stesse che `pickDoorIndex` ha
    // appena scelto, perche' la sagoma si adatta alle porte e mai il contrario
    const cellePorte = {};
    for (const { dir, idx } of porte) {
      cellePorte[dir] = cellaPorta(dir, idx, L).split(',').map(Number);
    }
    const sagoma = SAGOME
      ? sagomaDi(tile, cellePorte, [...occupate].map((k) => k.split(',').map(Number)))
      : null;
    if (sagoma && sagoma.scartata) {
      console.log(`  ${tile.id}: sagoma «${sagoma.scartata}» buttata (spezzava la stanza), resta quadrata`);
    }
    // GLI ARREDI IN PIU'. Una stanza cresciuta e' una stanza vuota: i dati ne
    // mettono due, e trentasei caselle ne reggono sei. Si aggiungono per regola
    // dal nome — un magazzino accatasta casse, una navata allinea candele — e si
    // addossano ai muri, mai sulla soglia. Sono una PROPOSTA per i dati: finche'
    // non ci entrano, il motore non li conosce e non fermano nessuno.
    const vive = new Set((sagoma ? sagoma.celle : [])
      .map(([x, y]) => `${x},${y}`));
    if (!sagoma) for (let r = 0; r < L; r++) for (let c = 0; c < L; c++) vive.add(`${c},${r}`);
    const extra = ARREDA
      ? arrediInPiu(tile, L, vive, occupate, Object.values(cellePorte))
      : [];
    const gruppi = groupArredi(tile.arredi, L)
      .concat(extra.map(([c, r, label]) => ({ col: c, row: r, cols: 1, rows: 1, label })));
    const pagina = VTT
      ? htmlVtt(tile, lastra, { gruppi, porte, cornice: CORNICE,
                                lato: L, celle: sagoma ? sagoma.celle : null })
      : html(tile);
    // il ritaglio deve seguire la tessera: una sala 6x6 non sta nel riquadro di
    // uno stanzino, e senza questo uscirebbe tagliata senza che nessuno lo dica
    await page.setViewportSize({ width: lastra, height: lastra });
    fs.writeFileSync(tmpHtml, pagina, 'utf8');
    await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    await page.screenshot({ path: outPath });
    fs.unlinkSync(tmpHtml);
    console.log('ok ->', outPath);
  }

  await browser.close();
})();
