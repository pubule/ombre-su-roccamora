// Estende un'immagine (tipicamente quadrata, --ar 1:1 da Midjourney) aggiungendo
// una banda di riempimento in basso, cosi' il suo rapporto d'aspetto combacia con
// quello della carta (~2010:2814) e "Auto Fit Art" su cardconjurer non deve piu'
// tagliare i lati per riempire l'altezza (perdendo mani/oggetti in primo piano).
// La banda aggiunta finisce comunque coperta dal riquadro del testo sulla carta.
//
// Uso:
//   node scripts/cardconjurer/pad-art.js --in "artworks/Sibilla.png" --out "artworks/Sibilla.png" --color "#0a1210"

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const CARD_RATIO = 2814 / 2010; // altezza/larghezza carta cardconjurer

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { args[argv[i].slice(2)] = argv[i + 1]; i++; }
  }
  return args;
}

(async () => {
  const args = parseArgs();
  if (!args.in || !args.out) {
    console.error('Richiesti --in e --out. Opzionale --color (default nero) e --ratio (default rapporto carta).');
    process.exit(1);
  }
  const inPath = path.resolve(process.cwd(), args.in);
  const outPath = path.resolve(process.cwd(), args.out);
  const color = args.color || '#000000';
  const ratio = args.ratio ? parseFloat(args.ratio) : CARD_RATIO;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Serve un origin file:// (non about:blank) per poter leggere il file locale via canvas.
  const tmpHtml = path.join(path.dirname(inPath), '.tmp-pad.html');
  fs.writeFileSync(tmpHtml, '<!doctype html><body></body>', 'utf8');
  await page.goto(pathToFileURL(tmpHtml).href);
  fs.unlinkSync(tmpHtml);

  // data: URI invece di file://: due file:// distinti sono origin diversi per
  // Chromium e taintano il canvas (blocca toDataURL). Con data: il src e'
  // "inline", niente cross-origin, niente tainting.
  const inputDataUrl = `data:image/png;base64,${fs.readFileSync(inPath).toString('base64')}`;

  const dataUrl = await page.evaluate(async ({ src, color, ratio }) => {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
    const w = img.naturalWidth;
    const targetH = Math.round(w * ratio);
    const h = Math.max(img.naturalHeight, targetH);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0); // ancorata in alto: il padding va in fondo
    return canvas.toDataURL('image/png');
  }, { src: inputDataUrl, color, ratio });

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
  console.log('Salvato', outPath);

  await browser.close();
})();
