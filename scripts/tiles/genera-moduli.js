// IL FOGLIO DEI MODULI, disegnato dal pennello del gioco.
//
// Uso: node scripts/tiles/genera-moduli.js [--lato 10] [--out cartella]
//
// Ogni voce del mazzo (scripts/tiles/moduli.js) diventa un PNG. Niente cornice e
// bordo aperto: in questa direzione la parete e' la roccia dipinta, e il
// pavimento arriva al bordo perche' due tessere accostate devono fondersi.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { htmlVtt } = require('./pittura-vtt');
const { libreria, cellaPorta } = require('./moduli');

const ROOT = path.resolve(__dirname, '..', '..');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const LATO = Number(arg('--lato', 10));
const CASELLA = Number(arg('--casella', 120));
const OUT = path.resolve(ROOT, arg('--out', 'prova-moduli'));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const lib = libreria(LATO, { varianti: Number(arg('--varianti', 1)) });
  const S = CASELLA * LATO;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: S, height: S } });
  const elenco = [];
  for (const m of lib) {
    // il nome decide pavimento e roccia: «grotta» da' roccia dentro e fuori,
    // chiara sotto i piedi e cupa attorno — e' l'aria delle tessere di riferimento
    // l'id decide la VARIANTE del pavimento: usando il nome del modulo ogni
    // pezzo pescava una pietra diversa, e il mazzo sembrava di cinque giochi.
    // Con il carattere, tutti i pezzi della stessa famiglia hanno lo stesso suolo.
    // UN SUOLO SOLO per tutto il mazzo: con un id per carattere ogni famiglia
    // pescava una pietra diversa, e nel dungeon montato due stanze accostate
    // sembravano di due materiali. In una caverna il pavimento e uno.
    // UN SUOLO SOLO PER TUTTO IL MAZZO. La variante del pavimento si sceglie da
    // id PIU' nome: bastava che il nome cambiasse col carattere perche' due pezzi
    // accostati avessero due pietre diverse, e il dungeon montato sembrava fatto
    // di due materiali. In una caverna il pavimento e' uno.
    const tile = { id: 'grotta', nome: 'La Grotta' };
    const porte = m.lati.map((dir) => {
      const [c, r] = cellaPorta(dir, LATO);
      return { dir, idx: (dir === 'N' || dir === 'S') ? c : r };
    });
    const pagina = htmlVtt(tile, S, {
      gruppi: [], porte, celle: m.celle, cornice: 0, lato: LATO, bordoAperto: true,
    });
    const tmp = path.join(OUT, `.tmp-${m.nome}.html`);
    fs.writeFileSync(tmp, pagina, 'utf8');
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(OUT, `${m.nome}.png`) });
    fs.unlinkSync(tmp);
    elenco.push({ nome: m.nome, che: m.che, lati: m.lati, carattere: m.carattere,
                  pavimento: m.celle.length });
  }
  fs.writeFileSync(path.join(OUT, 'moduli.json'), JSON.stringify(elenco, null, 1));
  await browser.close();
  console.log(`${lib.length} moduli ${LATO}x${LATO} -> ${path.relative(ROOT, OUT)}`);
})();
