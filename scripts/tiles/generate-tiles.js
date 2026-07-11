// Genera le 6 tessere di Spedizione (T1-T6): griglia 4x4 sopra l'artwork
// atmosferico, arredi come tessere modulari separate, porta agganciata a
// UNA cella specifica del bordo (scelta automaticamente evitando le celle
// gia' occupate da un arredo). Stile derivato dal prototipo v3 approvato.
//
// Dati (exits/arredi) presi 1:1 da TILES in src/gen_cards.py.
//
// Uso: node scripts/tiles/generate-tiles.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'board', 'Episodio 1');
fs.mkdirSync(OUT_DIR, { recursive: true });

const S = 2464; // 1600 * 200/130, arrotondato a multiplo di 4: tessera 130mm->200mm
                // (celle 50mm invece di 32.5mm, minimo richiesto per muovere comodo
                // i token), stessa densita' di stampa di prima

// TILES 1:1 da src/gen_cards.py (id, nome, exits, arredi)
const TILES = [
  { id: 'T1', nome: 'Banchina d’Ingresso', exits: { N: 'T2' },
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

const ARREDO_STYLE = {
  molo: 'repeating-linear-gradient(0deg, #6b4a2c, #6b4a2c 8px, #5a3d24 8px, #5a3d24 16px)',
  casse: 'repeating-linear-gradient(45deg, #8a6a3d, #8a6a3d 10px, #6e5230 10px, #6e5230 20px)',
  candele: 'radial-gradient(circle, #d98c2a 0%, #7a4a12 70%)',
  scrivania: 'repeating-linear-gradient(90deg, #5a4530, #5a4530 10px, #493826 10px, #493826 20px)',
  branda: 'repeating-linear-gradient(0deg, #7a6a52, #7a6a52 6px, #665740 6px, #665740 12px)',
  scala: 'repeating-linear-gradient(0deg, #55606a, #55606a 8px, #444d55 8px, #444d55 16px)',
  altare: 'radial-gradient(circle, #7a1f2b 0%, #4a1219 70%)',
  cella: 'repeating-linear-gradient(90deg, #2a2a2e, #2a2a2e 4px, #111113 4px, #111113 14px)',
};

// sceglie la cella libera (non occupata da un arredo) piu' centrale lungo
// il bordo della direzione data, cosi' la porta non si sovrappone mai a un arredo
function pickDoorIndex(dir, occupied) {
  const pref = [1, 2, 0, 3];
  for (const idx of pref) {
    const key = (dir === 'N' || dir === 'S') ? `${idx},${dir === 'N' ? 0 : 3}` : `${dir === 'O' ? 0 : 3},${idx}`;
    if (!occupied.has(key)) return idx;
  }
  return 1;
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
  const occupied = new Set();
  const arredoHtml = tile.arredi.map(([gx, gy, label]) => {
    const row = 3 - gy;
    occupied.add(`${gx},${row}`);
    const bg = ARREDO_STYLE[label.toLowerCase()] || '#555';
    return `<div class="arredo" style="left:${gx * cell + 6}px; top:${row * cell + 6}px; width:${cell - 12}px; height:${cell - 12}px; background:${bg};">
      <span>${label}</span>
    </div>`;
  }).join('');

  const doorHtml = Object.entries(tile.exits).map(([dir, destRaw]) => {
    const dest = destRaw.match(/^\S+/)[0]; // "T5 (grata: ...)" -> "T5"
    const note = destRaw.slice(dest.length).trim();
    const idx = pickDoorIndex(dir, occupied);
    const styles = {
      N: `left:${idx * cell}px; top:${-13}px; width:${cell}px; height:26px;`,
      S: `left:${idx * cell}px; top:${S - 13}px; width:${cell}px; height:26px;`,
      E: `left:${S - 13}px; top:${idx * cell}px; width:26px; height:${cell};`,
      O: `left:${-13}px; top:${idx * cell}px; width:26px; height:${cell};`,
    };
    const labelPos = {
      N: `left:${idx * cell + cell / 2}px; top:${-48}px;`,
      S: `left:${idx * cell + cell / 2}px; top:${S + 48}px;`,
      E: `left:${S + 95}px; top:${idx * cell + cell / 2}px;`,
      O: `left:${-95}px; top:${idx * cell + cell / 2}px;`,
    };
    const arrowPos = {
      N: `left:${idx * cell + cell / 2}px; top:${-13}px;`,
      S: `left:${idx * cell + cell / 2}px; top:${S + 13}px;`,
      E: `left:${S + 13}px; top:${idx * cell + cell / 2}px;`,
      O: `left:${-13}px; top:${idx * cell + cell / 2}px;`,
    };
    const arrow = { N: '▲', S: '▼', E: '▶', O: '◀' }[dir];
    return `<div class="door" style="${styles[dir]}"></div>
            <div class="door-arrow" style="${arrowPos[dir]}">${arrow}</div>
            <div class="door-label" style="${labelPos[dir]}">verso ${dest}${note ? `<br/><small>${note}</small>` : ''}</div>`;
  }).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:${S + 340}px; height:${S + 340}px; background:#0a0a0c; }
    .stage { position:relative; width:${S}px; height:${S}px; margin:170px; }
    .stage img.art { position:absolute; inset:0; width:${S}px; height:${S}px; object-fit:cover; }
    .cell { position:absolute; border:2px solid rgba(230,195,120,0.55); box-sizing:border-box; }
    .arredo { position:absolute; border-radius:6px; border:2px solid rgba(230,195,120,0.9);
              box-shadow:0 4px 10px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; text-align:center; }
    .arredo span { font-family:'IM Fell English SC', serif; font-size:22px; color:#fff3d6;
                   text-shadow:0 0 6px #000, 0 0 3px #000; text-transform:uppercase; letter-spacing:1px; }
    .door { position:absolute; background:radial-gradient(circle, rgba(242,193,78,0.95) 0%, rgba(242,193,78,0.55) 60%, rgba(242,193,78,0.15) 100%);
            border:4px solid #f2c14e; border-radius:6px; box-shadow:0 0 22px 6px rgba(242,193,78,0.85); }
    .door-arrow { position:absolute; transform:translate(-50%,-50%); font-size:34px; color:#2a1a05;
                  text-shadow:0 0 4px #fff8e0; }
    .door-label { position:absolute; transform:translate(-50%,-50%); white-space:nowrap; text-align:center;
                  font-family:'IM Fell English SC', serif; font-size:26px; font-weight:bold; color:#f2c14e;
                  text-shadow:0 0 8px #000, 0 0 4px #000; background:rgba(10,10,12,0.7); padding:2px 10px; border-radius:4px; }
    .door-label small { display:block; font-family:'Old Standard TT', serif; font-size:14px; color:#e6c47e; font-weight:normal; }
    .title { position:absolute; top:-104px; left:0; font-family:'IM Fell English SC', serif;
             font-size:26px; color:#f2c14e; letter-spacing:1px; white-space:nowrap; }
  </style></head><body>
    <div class="stage">
      <div class="title">${tile.id} — ${tile.nome.toUpperCase()}</div>
      <img class="art" src="${pathToFileURL(path.join(ROOT, 'artworks', `${tile.id}.png`)).href}" />
      ${cellsHtml.join('')}
      ${arredoHtml}
      ${doorHtml}
    </div>
  </body></html>`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: S + 340, height: S + 340 } });

  for (const tile of TILES) {
    const tmpHtml = path.join(OUT_DIR, `.tmp-${tile.id}.html`);
    fs.writeFileSync(tmpHtml, html(tile), 'utf8');
    await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    const outPath = path.join(OUT_DIR, `${tile.id} - ${tile.nome}.png`);
    await page.screenshot({ path: outPath });
    fs.unlinkSync(tmpHtml);
    console.log('ok ->', outPath);
  }

  await browser.close();
})();
