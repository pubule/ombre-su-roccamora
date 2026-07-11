// Genera UN pdf fronte/retro pronto da stampare con TUTTE le carte pronte
// (Eroi, Nemici, Minacce, Luoghi, Oggetti, Indizi Nascosti, Testimoni,
// Referti), ogni carta abbinata al dorso della sua famiglia.
//
// Ogni mazzo usa il proprio artwork di dorso (artworks/Dorso <Nome>.png,
// vedi i prompt in PROMPT-MIDJOURNEY.md - il tipo e' inciso direttamente
// nell'arte generata, niente testo sovrapposto via codice). Se il dorso di un
// mazzo non esiste ancora, quel mazzo viene saltato con un avviso in console —
// non blocca gli altri: rilancia lo script quando generi il dorso mancante,
// non serve toccare il codice.
//
// Indizi Nascosti/Testimoni/Referti restano un mazzo coperto unico in gioco
// (vedi regolamento): dorsi diversi per tipo ma stessa famiglia visiva (teal,
// stesso stile), cosi' si riconosce il tipo ma MAI il luogo - niente sulla
// carta deve permettere di dedurre dove cercare (vedi pdf/Episodio 1/Luoghi.pdf,
// generato da src/gen_narrator.py, per quella mappa).
//
// Dimensione carta: 68x95.2mm (rapporto 1.4, identico alle carte reali
// 2010x2814px), il piu' grande possibile in griglia 3x3 su A4 lasciando un
// margine di sicurezza per stampanti non borderless (~1mm ai lati, ~5.5mm
// sopra/sotto).
//
// Uso: node scripts/cardconjurer/generate-print-sheets.js
// Richiede le carte gia' generate (generate-batch.js, tutti i gruppi che vuoi
// includere) e i dorsi in artworks/. Non salva/committa nulla da solo oltre
// al pdf di output: rilancialo quando servono carte aggiornate.

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const { HEROES, NEMICI, MINACCE, LUOGHI, OGGETTI, INDIZI, TESTIMONI, REFERTI } = require('./cards-data');

const ROOT = path.resolve(__dirname, '../..');
const CARD_W = 68;    // mm
const CARD_H = 68 * 1.4; // 95.2mm, stesso rapporto delle carte reali (2010x2814px)
const COLS = 3;
const PER_PAGE = 9;

// Mazzi con dorso uniforme (stesso identico dorso su ogni carta della famiglia).
// Indizi/Testimoni/Referti hanno dorsi diversi (il tipo e' inciso nell'arte),
// ma restano concettualmente un unico mazzo coperto in gioco - vedi regolamento.
const SIMPLE_DECKS = [
  { name: 'Eroi', cards: HEROES, dorso: 'Dorso Eroe.png' },
  { name: 'Nemici', cards: NEMICI, dorso: 'Dorso Nemico.png' },
  { name: 'Minacce', cards: MINACCE, dorso: 'Dorso Minaccia.png' },
  { name: 'Luoghi', cards: LUOGHI, dorso: 'Dorso Luogo.png' },
  { name: 'Oggetti', cards: OGGETTI, dorso: 'Dorso Oggetto.png' },
  { name: 'Indizi Nascosti', cards: INDIZI, dorso: 'Dorso Indizio Nascosto.png' },
  { name: 'Testimoni', cards: TESTIMONI, dorso: 'Dorso Testimone.png' },
  { name: 'Referti', cards: REFERTI, dorso: 'Dorso Referto.png' },
];

function fileDataUri(absPath) {
  if (!fs.existsSync(absPath)) return null;
  const ext = path.extname(absPath).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,` +
    fs.readFileSync(absPath).toString('base64');
}

function cardFrontUri(c) {
  return fileDataUri(path.join(ROOT, 'cards', c.file + '.jpg'));
}

// I nuovi dorsi con testo inciso sono 6-7MB l'uno (erano ~1MB da svuotati):
// imbustarli tutti come base64 nello <style> crasha Chromium su
// page.setContent (provato: 8 dorsi x 7MB > quello che regge). Un riferimento
// file:// invece funziona per la preview ma page.pdf() lo ignora (pagine
// bianche in stampa - limite del renderer PDF di Chromium sulle risorse
// locali). Soluzione: rimpicciolire ogni dorso UNA volta con Playwright
// stesso (Image+canvas dentro una pagina navigata sul file, cosi' resta
// same-origin e toDataURL non e' bloccato) invece di aggiungere una
// dipendenza solo per questo.
async function shrinkDorso(browser, absPath, maxPx = 1400, quality = 0.85) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(absPath).href);
  const dataUri = await page.evaluate(({ maxPx, quality }) => {
    const img = document.images[0];
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  }, { maxPx, quality });
  await page.close();
  return dataUri;
}

async function dorsoUri(browser, name) {
  const p = path.join(ROOT, 'artworks', name);
  return fs.existsSync(p) ? shrinkDorso(browser, p) : null;
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

function deckSheets(deck, bgClass) {
  const pages = chunk(deck.cards, PER_PAGE);
  return pages.map((p) =>
    `<section class="grid">${p.map(frontCell).join('')}</section>
     <section class="grid">${mirrorRow(p).map((c) => plainBackCell(c, bgClass)).join('')}</section>`
  ).join('');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let sheets = '';
  let bgRules = '';
  let bgIndex = 0;

  async function registerDorso(deck) {
    if (!deck.cards.length) return null;
    const uri = await dorsoUri(browser, deck.dorso);
    if (!uri) {
      console.warn(`Salto "${deck.name}": manca artworks/${deck.dorso}`);
      return null;
    }
    const cls = `bg${bgIndex++}`;
    bgRules += `.${cls}{background-image:url('${uri}');background-size:cover;background-position:center;}\n`;
    return cls;
  }

  for (const deck of SIMPLE_DECKS) {
    const cls = await registerDorso(deck);
    if (!cls) continue;
    sheets += deckSheets(deck, cls);
    console.log(`${deck.name}: ${deck.cards.length} carte`);
  }

  if (!sheets) {
    console.error('Nessun mazzo con dorso pronto trovato. Genera almeno un dorso in artworks/ e riprova.');
    await browser.close();
    process.exit(1);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; }
    .grid { width: 210mm; height: 297mm; display: grid;
            grid-template-columns: repeat(${COLS}, ${CARD_W}mm);
            grid-auto-rows: ${CARD_H}mm; justify-content: center; align-content: center;
            gap: 0; page-break-after: always; }
    .card { width: ${CARD_W}mm; height: ${CARD_H}mm; overflow: hidden; }
    .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card.empty { visibility: hidden; }
    ${bgRules}
  </style></head><body>${sheets}</body></html>`;

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle', timeout: 120000 });
  const out = path.join(ROOT, 'pdf', 'Ombre-su-Roccamora-08-Stampa-Completa.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true, timeout: 120000 });
  await browser.close();
  console.log('\nScaricato in', out);
})();
