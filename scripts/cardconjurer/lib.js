// Logica condivisa per generare una carta con Card Conjurer (frame Tokens/Marker
// Card di default, trasparente cosi' l'arte si vede) e scaricarla via la funzione
// reale del sito (bordi arrotondati, non lo screenshot del canvas che li fa squadrati).
// Gira contro la copia locale in vendor/cardconjurer/ (vedi serve.js), non piu'
// contro cardconjurer.app: il sito originale (cardconjurer.com) e' gia' stato
// chiuso una volta dopo una diffida, niente dipendenza dalla sua disponibilita'.
const path = require('path');
const fs = require('fs');

const COLOR_CODES = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G', M: 'M', A: 'A', L: 'L' };

async function generateOne(page, card, { cwd = process.cwd(), artist = 'Fabietto' } = {}) {
  const artPath = path.resolve(cwd, card.art);
  const title = card.title;
  const typeLine = card.type || '';
  const rulesText = (card.rules || '').replace(/\\n/g, '\n');
  const color = COLOR_CODES[(card.color || 'B').toUpperCase()] || 'B';
  const group = card.group || 'Tokens';
  const pack = card.pack || 'Marker Card';
  const frameImgMatch = card['frame-img'] || (pack === 'Marker Card' ? 'markerThumb.png' : `Frame${color}Thumb.png`);
  // Windows non accetta " < > : | ? * nei nomi file (es. Nino "Grimaldello" Cauto).
  // "/" e' permesso perche' separa la sottocartella (es. "Nemici/Adepto Incappucciato").
  const outName = (card.file || title).replace(/["<>:|?*]/g, '');

  // --- FRAME ---
  await page.locator('select').nth(1).selectOption({ label: group });
  await page.waitForTimeout(400);
  await page.locator('select').nth(2).selectOption({ label: pack });
  await page.waitForTimeout(800);
  await page.locator(`img[src*="${frameImgMatch}"]`).first().click();
  await page.waitForTimeout(300);
  await page.locator('text="No Mask"').first().click();
  await page.waitForTimeout(300);
  await page.locator('text="Add Frame to Card"').first().click({ force: true });
  await page.waitForTimeout(800);

  // --- ART ---
  await page.locator('text="Art"').first().click({ force: true });
  await page.waitForTimeout(500);
  await page.locator('input[type=file]:visible').first().setInputFiles(artPath);
  await page.waitForTimeout(2000);
  // Bottone esplicito invece della checkbox "Autofit when setting art": la checkbox
  // e' un toggle e lo stato persiste in localStorage tra una carta e l'altra nel
  // batch, quindi puo' finire per essere disattivata invece che attivata.
  await page.locator('text="Auto Fit Art"').first().click();
  await page.waitForTimeout(300);
  // Il sito blocca downloadCard() in silenzio se l'artista e' vuoto: va valorizzato.
  await page.locator('input[placeholder="Artist"]:visible').first().fill(artist);
  await page.waitForTimeout(200);

  // --- TEXT ---
  await page.locator('text="Text"').first().click({ force: true });
  await page.waitForTimeout(500);
  const textarea = page.locator('textarea');

  async function fillTextArea(label, value) {
    if (!value) return;
    const btn = page.locator('h4.text-option', { hasText: label });
    if ((await btn.count()) === 0) return;
    await btn.first().click({ force: true });
    await page.waitForTimeout(300);
    await textarea.fill(value);
    await page.waitForTimeout(400);
  }

  await fillTextArea('Title', title);
  await fillTextArea('Type', typeLine);
  // Newline prima delle statistiche/classe, dopo il divider (stacca il corpo dalla
  // riga statistiche) e a fine testo (margine dai bordi del riquadro).
  const rulesSpaced = rulesText ? `\n${rulesText.replace(/\{divider\}/g, '{divider}\n')}\n` : rulesText;
  await fillTextArea('Rules Text', rulesSpaced);
  // Sulla primissima carta generata in un browser/sessione nuova, il parser dei
  // codici di formattazione {i}...{/i} di cardconjurer non e' ancora "caldo": il
  // primo fill esce dritto invece che corsivo. Rifare il fill una seconda volta
  // (stesso valore) forza un secondo passaggio del parser e lo sistema.
  if (rulesText) await fillTextArea('Rules Text', rulesSpaced);

  // Il canvas di export si ridisegna in modo asincrono/debounced dopo l'ultimo fill:
  // senza questa attesa il download parte prima che il testo sia committato sul canvas.
  await page.waitForTimeout(1500);
  // Sulla primissima carta generata in un browser "freddo" il font corsivo puo' non
  // essere ancora pronto quando scatta lo screenshot (es. {i}...{/i} esce dritto
  // invece che corsivo): aspettare i font e ridare un attimo di margine lo evita.
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(300);

  // --- DOWNLOAD ---
  const outPath = cardDiskPath(cwd, outName);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.evaluate(() => window.downloadCard(false, true)),
  ]);
  await download.saveAs(outPath);
  return outPath;
}

// Layout per-episodio (2026-07-16): le carte vivono DENTRO la cartella del
// loro episodio. Il campo `file` resta la fonte di verita' del bucket
// ('Episodio 1/Luoghi/x', 'Preludio/x', 'Eroi/x'...): qui si traduce in
// percorso su disco - '<Episodio>/cards/<resto>', comuni in 'Comune/cards/'.
function cardDiskPath(root, file) {
  const i = file.indexOf('/');
  const bucket = file.slice(0, i);
  const rest = file.slice(i + 1);
  if (bucket.startsWith('Episodio')) return path.resolve(root, bucket, 'cards', `${rest}.jpg`);
  if (bucket === 'Preludio') return path.resolve(root, 'Preludio', 'cards', `${rest}.jpg`);
  return path.resolve(root, 'Comune', 'cards', `${file}.jpg`);
}

module.exports = { generateOne, cardDiskPath };
