// Genera UNA carta su cardconjurer.app e la scarica in cards/<title>.jpg.
// Per generare piu' carte in blocco (stesso browser, molto piu' veloce) vedi
// generate-batch.js + cards-data.js.
//
// Uso:
//   node scripts/cardconjurer/generate-card.js ^
//     --art "artworks/Elena.png" ^
//     --title "Elena" ^
//     --type "Creatura — Umano" ^
//     --rules "Testo regole.{divider}{i}\"Flavor text.\"{/i}"
//
// --group/--pack: opzionali, default "Tokens" / "Marker Card"
// --color: solo per pack con varianti colore (es. Showcase Frames/Borderless): W U B R G M A L
// --frame-img: override diretto della sottostringa da matchare nel src del thumbnail frame
// --artist: opzionale, default "Fabietto" (il sito blocca il download se vuoto)
//
// --rules supporta i Text Codes di cardconjurer (es. {i}/{/i} per il corsivo, {divider} per
// la barra flavor text, {fontsize#pt}, ecc). Passali cosi come sono, cardconjurer li
// interpreta lui al rendering. Usa \n per andare a capo dentro l'argomento.

const { chromium } = require('playwright');
const { generateOne } = require('./lib');

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

(async () => {
  const args = parseArgs();
  if (!args.art || !args.title) {
    console.error('Richiesti almeno --art e --title. Vedi commento in cima al file per esempi.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false, slowMo: 20 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
  await page.goto('https://cardconjurer.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const outPath = await generateOne(page, args, { artist: args.artist });
  console.log('Scaricato in', outPath);

  await browser.close();
})();
