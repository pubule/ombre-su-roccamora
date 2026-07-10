// Genera UN pdf fronte/retro pronto da stampare con TUTTE le carte pronte
// (Eroi, Nemici, Minacce, Luoghi, Oggetti, e il mazzo unico Indizi Nascosti +
// Testimoni + Referti), ogni carta abbinata al dorso della sua famiglia.
//
// Ogni mazzo usa il proprio artwork di dorso (artworks/Dorso carte <Nome>.png,
// vedi i prompt in PROMPT-MIDJOURNEY.md). Se il dorso di un mazzo non esiste
// ancora, quel mazzo viene saltato con un avviso in console — non blocca gli
// altri: rilancia lo script quando generi il dorso mancante, non serve
// toccare il codice.
//
// Il trio Indizi Nascosti/Testimoni/Referti e' un mazzo coperto unico (vedi
// regolamento): stesso dorso per tutti e tre, con SOLO il tipo sovrapposto
// sopra l'arte (mai il luogo: niente sulla carta deve permettere di dedurre
// dove cercare - vedi generate-narrator-reference.js per quella mappa).
//
// Dimensione carta: 68x95.2mm (rapporto 1.4, identico alle carte reali
// 2010x2814px), il piu' grande possibile in griglia 3x3 su A4 lasciando un
// margine di sicurezza per stampanti non borderless (~1mm ai lati, ~5.5mm
// sopra/sotto) invece del margine largo usato in generate-backs.js.
//
// Uso: node scripts/cardconjurer/generate-print-sheets.js
// Richiede le carte gia' generate (generate-batch.js, tutti i gruppi che vuoi
// includere) e i dorsi in artworks/. Non salva/committa nulla da solo oltre
// al pdf di output: rilancialo quando servono carte aggiornate.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { HEROES, NEMICI, MINACCE, LUOGHI, OGGETTI, INDIZI, TESTIMONI, REFERTI } = require('./cards-data');

const ROOT = path.resolve(__dirname, '../..');
const CARD_W = 68;    // mm
const CARD_H = 68 * 1.4; // 95.2mm, stesso rapporto delle carte reali (2010x2814px)
const COLS = 3;
const PER_PAGE = 9;
// Stesso font dei titoli sulle carte (cardconjurer, pack Tokens/Marker Card usa
// 'belerenbsc' per il campo Title - vedi vendor/cardconjurer/js/frames/packTokenMarker.js).
const TITLE_FONT_PATH = path.join(ROOT, 'vendor/cardconjurer/fonts/beleren-bsc.ttf');
const KIND_ORDER = { Indizio: 0, Testimone: 1, Referto: 2 };

// Mazzi con dorso uniforme (stesso identico dorso su ogni carta della famiglia).
const SIMPLE_DECKS = [
  { name: 'Eroi', cards: HEROES, dorso: 'Dorso carte Eroi.png' },
  { name: 'Nemici', cards: NEMICI, dorso: 'Dorso carte Nemici.png' },
  { name: 'Minacce', cards: MINACCE, dorso: 'Dorso carte Minaccia.png' },
  { name: 'Luoghi', cards: LUOGHI, dorso: 'Dorso carte Luogo.png' },
  { name: 'Oggetti', cards: OGGETTI, dorso: 'Dorso carte Oggetti.png' },
];
// Mazzo coperto unico: stesso dorso-arte, ma numero+tipo sovrapposti per carta.
const APPROFONDIMENTI = {
  name: 'Approfondimenti (Indizi/Testimoni/Referti)',
  cards: [...INDIZI, ...TESTIMONI, ...REFERTI].sort(
    (a, b) => a.n - b.n || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]),
  dorso: 'Dorso carte Indizio Nascosto.png',
};

function fileDataUri(absPath) {
  if (!fs.existsSync(absPath)) return null;
  const ext = path.extname(absPath).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,` +
    fs.readFileSync(absPath).toString('base64');
}

function cardFrontUri(c) {
  return fileDataUri(path.join(ROOT, 'cards', c.file + '.jpg'));
}

function dorsoUri(name) {
  return fileDataUri(path.join(ROOT, 'artworks', name));
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// Retro duplex lato lungo: stessa riga, colonne invertite (specchio orizzontale).
function mirrorRow(pageCards) {
  const rows = chunk(pageCards, COLS);
  return rows.flatMap((r) => r.slice().reverse().concat(
    Array(COLS - r.length).fill(null)).slice(0, COLS));
}

function frontCell(c) {
  const uri = c && cardFrontUri(c);
  if (!uri) {
    if (c) console.warn('  manca il fronte:', c.file, '(genera prima le carte)');
    return `<div class="card empty"></div>`;
  }
  return `<div class="card"><img src="${uri}"></div>`;
}

// Dorso semplice: stessa arte per ogni carta del mazzo. `bgClass` e' una
// classe CSS (background-image definito UNA volta sola nell'head, vedi
// bgClasses sotto) - mai un data-uri ripetuto in ogni cella, altrimenti la
// stessa immagine da alcuni MB finisce incollata decine di volte nell'HTML
// (per 23 carte Minacce: 200+MB, Chromium crasha su page.setContent).
function plainBackCell(c, bgClass) {
  if (!c) return `<div class="card empty"></div>`;
  return `<div class="card ${bgClass}"></div>`;
}

// Dorso Approfondimenti: stessa arte (classe CSS) + SOLO il tipo (Indizio
// Nascosto/Testimone/Referto), mai il numero del luogo - niente sulla carta
// deve legarla a un luogo/tessera specifico (riusabilita' tra episodi + i
// giocatori non devono poter dedurre dove cercare sfogliando i dorsi). Quale
// carta prendere per quale luogo/tessera sta nel pdf a parte
// (generate-narrator-reference.js), non sulle carte.
function taggedBackCell(c, bgClass) {
  if (!c) return `<div class="card empty"></div>`;
  return `<div class="card tagged ${bgClass}">
    <div class="kind">${c.kind}</div>
  </div>`;
}

function deckSheets(deck, backCellFn, bgClass) {
  const pages = chunk(deck.cards, PER_PAGE);
  return pages.map((p) =>
    `<section class="grid">${p.map(frontCell).join('')}</section>
     <section class="grid">${mirrorRow(p).map((c) => backCellFn(c, bgClass)).join('')}</section>`
  ).join('');
}

(async () => {
  let sheets = '';
  let bgRules = '';
  let bgIndex = 0;

  function registerDorso(deck) {
    if (!deck.cards.length) return null;
    const uri = dorsoUri(deck.dorso);
    if (!uri) {
      console.warn(`Salto "${deck.name}": manca artworks/${deck.dorso}`);
      return null;
    }
    const cls = `bg${bgIndex++}`;
    bgRules += `.${cls}{background-image:url('${uri}');background-size:cover;background-position:center;}\n`;
    return cls;
  }

  for (const deck of SIMPLE_DECKS) {
    const cls = registerDorso(deck);
    if (!cls) continue;
    sheets += deckSheets(deck, plainBackCell, cls);
    console.log(`${deck.name}: ${deck.cards.length} carte`);
  }
  {
    const cls = registerDorso(APPROFONDIMENTI);
    if (cls) {
      sheets += deckSheets(APPROFONDIMENTI, taggedBackCell, cls);
      console.log(`${APPROFONDIMENTI.name}: ${APPROFONDIMENTI.cards.length} carte`);
    }
  }

  if (!sheets) {
    console.error('Nessun mazzo con dorso pronto trovato. Genera almeno un dorso in artworks/ e riprova.');
    process.exit(1);
  }

  const titleFontUri = fileDataUri(TITLE_FONT_PATH);
  if (!titleFontUri) console.warn('Font titolo non trovato:', TITLE_FONT_PATH, '- uso il fallback serif.');

  // Rilievo (emboss): ombra scura ravvicinata per lo spessore inciso, ombra
  // scura sfumata per il distacco dal fondo, controluce chiaro in alto a
  // sinistra per l'effetto "luce che coglie il bordo rialzato".
  const EMBOSS = `
    -0.25mm -0.25mm 0 rgba(255,238,190,.55),
    0.35mm 0.35mm 0 rgba(0,0,0,.9),
    0.7mm 0.7mm 1.2mm rgba(0,0,0,.65)`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; }
    ${titleFontUri ? `@font-face { font-family: 'Beleren'; src: url('${titleFontUri}') format('truetype'); }` : ''}
    .grid { width: 210mm; height: 297mm; display: grid;
            grid-template-columns: repeat(${COLS}, ${CARD_W}mm);
            grid-auto-rows: ${CARD_H}mm; justify-content: center; align-content: center;
            gap: 0; page-break-after: always; }
    .card { width: ${CARD_W}mm; height: ${CARD_H}mm; overflow: hidden; }
    .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card.empty { visibility: hidden; }
    .card.tagged { position: relative;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; color: #d8b45a;
      font-family: ${titleFontUri ? "'Beleren', " : ''}Georgia, serif; }
    .tagged .kind { font-size: 9mm; letter-spacing: .8mm; text-transform: uppercase;
      text-shadow: ${EMBOSS}; padding: 0 4mm; }
    ${bgRules}
  </style></head><body>${sheets}</body></html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle', timeout: 120000 });
  const out = path.join(ROOT, 'pdf', 'Ombre-su-Roccamora-08-Stampa-Completa.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true, timeout: 120000 });
  await browser.close();
  console.log('\nScaricato in', out);
})();
