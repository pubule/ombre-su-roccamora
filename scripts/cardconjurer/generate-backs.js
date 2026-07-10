// Genera il PDF fronte/retro degli Approfondimenti (Indizi Nascosti, Testimoni,
// Referti): fronti = le carte gia' generate in cards/, retro = dorso numerato col
// numero del luogo e il tipo. Stampandolo duplex (lato lungo) ogni carta ha sul
// dorso il suo numero di luogo: si tiene un unico mazzo coperto e si cerca la
// carta solo quando si visita quel luogo con l'abilita' giusta (presenza e
// contenuto restano da scoprire).
//
// Uso: node scripts/cardconjurer/generate-backs.js
// Richiede che le carte siano gia' state generate (generate-batch.js indizi/testimoni/referti).

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { INDIZI, TESTIMONI, REFERTI } = require('./cards-data');

const ROOT = path.resolve(__dirname, '../..');
const PER_PAGE = 9;        // griglia 3x3 di carte 63x88mm su A4
const COLS = 3;
const KIND_ORDER = { Indizio: 0, Testimone: 1, Referto: 2 };

function dataUri(file) {
  const p = path.join(ROOT, 'cards', file + '.jpg');
  if (!fs.existsSync(p)) {
    console.warn('  manca il fronte:', p, '(genera prima le carte)');
    return null;
  }
  return 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64');
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// Retro duplex lato lungo: stessa riga, colonne invertite.
function mirror(page) {
  const rows = chunk(page, COLS);
  return rows.flatMap((r) => r.slice().reverse().concat(
    Array(COLS - r.length).fill(null)).slice(0, COLS));
}

function frontCell(c) {
  const uri = dataUri(c.file);
  return uri ? `<div class="card"><img src="${uri}"></div>` : `<div class="card empty"></div>`;
}

function backCell(c) {
  if (!c) return `<div class="card empty"></div>`;
  return `<div class="card back">
    <div class="wave">～</div>
    <div class="num">${c.n}</div>
    <div class="kind">${c.kind}</div>
    <div class="cap">Ombre su Roccamora · Approfondimento</div>
  </div>`;
}

(async () => {
  const cards = [...INDIZI, ...TESTIMONI, ...REFERTI].sort(
    (a, b) => a.n - b.n || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  const pages = chunk(cards, PER_PAGE);

  const sheets = pages.map((p) =>
    `<section class="grid">${p.map(frontCell).join('')}</section>
     <section class="grid">${mirror(p).map(backCell).join('')}</section>`).join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; }
    .grid { width: 210mm; height: 297mm; display: grid;
            grid-template-columns: repeat(${COLS}, 63mm);
            grid-auto-rows: 88mm; justify-content: center; align-content: center;
            gap: 0; page-break-after: always; }
    .card { width: 63mm; height: 88mm; overflow: hidden; }
    .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card.empty { visibility: hidden; }
    .card.back { position: relative; background: #141018; color: #c9a24a;
      border: 2.2mm solid #0d0a12; box-shadow: inset 0 0 0 1.1mm #b08d3e;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; }
    .back .wave { font-size: 10mm; color: #7a1f2b; line-height: 1; opacity: .9; }
    .back .num { font-size: 34mm; font-weight: bold; color: #d8b45a; line-height: 1;
      margin: 2mm 0; text-shadow: 0 0 3mm rgba(176,141,62,.4); }
    .back .kind { font-size: 6.5mm; letter-spacing: .8mm; text-transform: uppercase;
      color: #e7d8a8; }
    .back .cap { position: absolute; bottom: 6mm; font-size: 2.7mm; letter-spacing: .3mm;
      color: #8a7a3e; font-style: italic; }
  </style></head><body>${sheets}</body></html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  const out = path.join(ROOT, 'pdf', 'Ombre-su-Roccamora-07-Approfondimenti.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true });
  await browser.close();
  console.log('Scaricato in', out, `(${cards.length} carte, ${pages.length * 2} pagine)`);
})();
