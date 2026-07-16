// Genera TRE pdf fronte/retro pronti da stampare (non uno solo): Comune
// (Eroi + Nemici/Minacce Malavita, riusabili in ogni episodio), Preludio e
// Episodio 1 (ognuno solo le proprie carte specifiche: Nemici del culto,
// Luoghi, Oggetti, Indizi Nascosti, Testimoni, Referti, Minacce non-
// Malavita). Le tessere T1-T6 stanno nel bucket Episodio 1, NON in Comune:
// sono sue (Episodio 1/board/), il Preludio ne riusa 3 (T1/T2/T4, vedi
// TESSERE_P in src/gen_preludio.py) solo per come e' stato scritto oggi,
// non perche' siano concettualmente un prop condiviso tra episodi - un
// episodio futuro con una propria ambientazione avra' le sue tessere.
// Effetto pratico: per giocare il Preludio serve anche
// `Episodio 1/pdf/Carte-e-Tessere.pdf` (le tessere), non solo Comune + Preludio.
// Chi ha gia' stampato il Comune non ristampa Eroi/Malavita quando arriva
// l'Episodio 1 o un episodio futuro - vedi PROMPT-ESPANSIONE.md. Il bucket
// di ogni carta si legge dal suo campo `file` (gia' la fonte di verita' per
// comune vs episodio-specifico, vedi NEMICI/MINACCE piu' sotto in
// cards-data.js): `Episodio 1/...` -> Episodio 1, `Preludio/...` -> Preludio,
// tutto il resto (Eroi/, Nemici/, Minacce/) -> Comune.
// I fascicoli (Regolamento, Indagine, Spedizione, Soluzione, Schede,
// Preludio) NON sono in questi PDF: sono gia' fronte/retro nativamente
// (PDF multipagina, pagine pari garantite da pad_to_even_pages in
// deluxe_style.py) ma su carta normale A4, mentre carte e tessere vogliono
// cartoncino e impaginazione a taglia fissa - unirli in un solo file
// costringerebbe la stampa a un solo tipo di carta/impostazione per tutto,
// peggio che stamparli separati. "Tutto fronte/retro" vale come garanzia
// per OGNI artefatto, non come "tutto in un unico PDF" (vedi
// scripts/merge-print-all.py, che li riunisce comunque per bucket).
//
// Ogni mazzo usa il proprio artwork di dorso (artworks/Dorso <Nome>.png,
// vedi i prompt in PROMPT-MIDJOURNEY.md - il tipo e' inciso direttamente
// nell'arte generata, niente testo sovrapposto via codice). Se il dorso di un
// mazzo non esiste ancora, quel mazzo viene saltato con un avviso in console —
// non blocca gli altri: rilancia lo script quando generi il dorso mancante,
// non serve toccare il codice. Stessa regola per le tessere (Dorso Tessera
// T1.png...T6.png).
//
// Indizi Nascosti/Testimoni/Referti restano un mazzo coperto unico in gioco
// (vedi regolamento): dorsi diversi per tipo ma stessa famiglia visiva (teal,
// stesso stile), cosi' si riconosce il tipo ma MAI il luogo - niente sulla
// carta deve permettere di dedurre dove cercare (vedi Episodio 1/pdf/Luoghi.pdf,
// generato da src/gen_narrator.py, per quella mappa).
//
// Dimensione carta: 68x95.2mm (rapporto 1.4, identico alle carte reali
// 2010x2814px), il piu' grande possibile in griglia 3x3 su A4 lasciando un
// margine di sicurezza per stampanti non borderless (~1mm ai lati, ~5.5mm
// sopra/sotto). Tessere: 200x200mm (griglia 4x4 da 50mm/casella, vedi
// COME STAMPARE nel Regolamento), una per foglio A4 (troppo grandi per
// affiancarne due), fronte e retro su pagine consecutive.
//
// Uso: node scripts/cardconjurer/generate-print-sheets.js
// Richiede le carte gia' generate (generate-batch.js, tutti i gruppi che vuoi
// includere), le tessere (scripts/tiles/generate-tiles.js) e i dorsi in
// artworks/. Non salva/committa nulla da solo oltre al pdf di output:
// rilancialo quando servono carte/tessere aggiornate.

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const { cardDiskPath } = require('./lib');
const { HEROES, NEMICI, MINACCE, LUOGHI, OGGETTI, INDIZI, TESTIMONI, REFERTI,
        PRELUDIO_LUOGHI, PRELUDIO_APPROFONDIMENTI, PRELUDIO_OGGETTI,
        LUOGHI2, EP2_INDIZI, EP2_TESTIMONI, EP2_REFERTI, EP2_MINACCE, EP2_OGGETTI, EP2_NEMICI } = require('./cards-data');

const ROOT = path.resolve(__dirname, '../..');
const CARD_W = 68;    // mm
const CARD_H = 68 * 1.4; // 95.2mm, stesso rapporto delle carte reali (2010x2814px)
const COLS = 3;
const PER_PAGE = 9;

// Mazzi con dorso uniforme (stesso identico dorso su ogni carta della famiglia).
// Indizi/Testimoni/Referti hanno dorsi diversi (il tipo e' inciso nell'arte),
// ma restano concettualmente un unico mazzo coperto in gioco - vedi regolamento.
// Preludio ed Episodio 1 condividono qui lo stesso dorso per tipo (stessa
// famiglia visiva, vedi commento in testa al file): non serve un mazzo a
// parte, il bucket per episodio si separa da solo al momento di stampare
// (vedi bucketOf() piu' sotto), leggendo il campo `file` di ogni carta.
const SIMPLE_DECKS = [
  { name: 'Eroi', cards: HEROES, dorso: 'Dorso Eroe.png' },
  { name: 'Nemici', cards: [...NEMICI, ...EP2_NEMICI], dorso: 'Dorso Nemico.png' },
  { name: 'Minacce', cards: [...MINACCE, ...EP2_MINACCE], dorso: 'Dorso Minaccia.png' },
  { name: 'Luoghi', cards: [...LUOGHI, ...PRELUDIO_LUOGHI, ...LUOGHI2], dorso: 'Dorso Luogo.png' },
  { name: 'Oggetti', cards: [...OGGETTI, ...PRELUDIO_OGGETTI, ...EP2_OGGETTI], dorso: 'Dorso Oggetto.png' },
  { name: 'Indizi Nascosti', cards: [...INDIZI, ...PRELUDIO_APPROFONDIMENTI.filter((c) => c.kind === 'Indizio'), ...EP2_INDIZI],
    dorso: 'Dorso Indizio Nascosto.png' },
  { name: 'Testimoni', cards: [...TESTIMONI, ...PRELUDIO_APPROFONDIMENTI.filter((c) => c.kind === 'Testimone'), ...EP2_TESTIMONI],
    dorso: 'Dorso Testimone.png' },
  { name: 'Referti', cards: [...REFERTI, ...PRELUDIO_APPROFONDIMENTI.filter((c) => c.kind === 'Referto'), ...EP2_REFERTI],
    dorso: 'Dorso Referto.png' },
];

// Comune vs Preludio vs Episodio 1: legge il bucket dal campo `file` di ogni
// carta, gia' la fonte di verita' per comune/episodio-specifico (vedi
// n.file/m.file in cards-data.js). Nessun flag duplicato da tenere
// allineato a mano.
function bucketOf(file) {
  // 'Episodio N/...' -> 'episodioN' (qualunque N: un episodio nuovo non deve
  // toccare questa funzione - bug reale: 'Episodio 2/' non previsto rovesciava
  // le sue 51 carte nel bucket Comune, +12 pagine di stampa per tutti).
  const m = file.match(/^Episodio (\d+)\//);
  if (m) return `episodio${m[1]}`;
  if (file.startsWith('Preludio/')) return 'preludio';
  return 'comune';
}

const OUTPUTS = [
  { key: 'comune', label: 'Comune', out: path.join('Comune', 'pdf', 'Carte.pdf'), tessere: false },
  { key: 'preludio', label: 'Preludio', out: path.join('Preludio', 'pdf', 'Carte.pdf'), tessere: false },
  { key: 'episodio1', label: 'Episodio 1', out: path.join('Episodio 1', 'pdf', 'Carte-e-Tessere.pdf'), tessere: true },
  { key: 'episodio2', label: 'Episodio 2', out: path.join('Episodio 2', 'pdf', 'Carte.pdf'), tessere: false },
];

// id+nome 1:1 da TILES in scripts/tiles/generate-tiles.js (duplicato apposta,
// stesso pattern gia' in uso tra src/gen_cards.py e questo file: moduli
// disaccoppiati, 6 righe, basso rischio di disallineamento).
const TILES = [
  { id: 'T1', nome: 'Banchina d’Ingresso' },
  { id: 'T2', nome: 'Sala delle Casse' },
  { id: 'T3', nome: 'Corridoio delle Candele' },
  { id: 'T4', nome: 'Ufficio del Custode' },
  { id: 'T5', nome: 'Scala al Piano Interrato' },
  { id: 'T6', nome: 'Cripta della Cera' },
];
const TILE_MM = 200; // vedi COME STAMPARE nel Regolamento: 200x200mm, caselle da 50mm

// I dorsi con testo inciso sono 6-7MB l'uno (erano ~1MB da svuotati), e i
// fronti carta a piena risoluzione (2010x2814, ~450KB/cad JPEG) per 60+
// carte superano i 30MB di PDF finale - oltre al limite di alcuni canali di
// condivisione, e' anche piu' immagine di quanta ne serva per stampare una
// carta a 68x95mm (bastano ~400dpi). Imbustarli tutti a piena risoluzione
// come base64 nello HTML crasha anche Chromium su page.setContent per i
// dorsi piu' pesanti (provato: 8 dorsi x 7MB > quello che regge). Un
// riferimento file:// invece funziona per la preview ma page.pdf() lo
// ignora (pagine bianche in stampa - limite del renderer PDF di Chromium
// sulle risorse locali). Soluzione: rimpicciolire ogni immagine (fronti
// carta compresi) UNA volta con Playwright stesso (Image+canvas dentro una
// pagina navigata sul file, cosi' resta same-origin e toDataURL non e'
// bloccato) invece di aggiungere una dipendenza solo per questo.
async function shrinkImage(browser, absPath, maxPx = 1600, quality = 0.88) {
  if (!fs.existsSync(absPath)) return null;
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

function cardFrontUri(browser, c) {
  return shrinkImage(browser, cardDiskPath(ROOT, c.file));
}

async function dorsoUri(browser, name) {
  const p = path.join(ROOT, 'artworks', name);
  return fs.existsSync(p) ? shrinkImage(browser, p, 1400, 0.85) : null;
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

async function frontCell(browser, c) {
  const uri = c && await cardFrontUri(browser, c);
  if (!uri) {
    if (c) console.warn('  manca il fronte:', c.file, '(genera prima le carte)');
    return `<div class="card empty"></div>`;
  }
  return `<div class="card"><img src="${uri}"></div>`;
}

// Dorso semplice: stessa arte per ogni carta del mazzo di provenienza.
// `bgClass` e' una classe CSS (background-image definito UNA volta sola
// nell'head, vedi bgClasses sotto) - mai un data-uri ripetuto in ogni
// cella, altrimenti la stessa immagine da alcuni MB finisce incollata
// decine di volte nell'HTML (per 23 carte Minacce: 200+MB, Chromium
// crasha su page.setContent).
function plainBackCell(item) {
  if (!item) return `<div class="card empty"></div>`;
  return `<div class="card ${item.bgClass}"></div>`;
}

// Impagina in blocco TUTTE le carte del bucket, non mazzo per mazzo: un
// mazzo da 2-3 carte non si merita un foglio tutto suo con 6-7 celle vuote,
// il prossimo mazzo riempie lo spazio che avanza sulla stessa pagina.
// `items` e' [{card, bgClass}] gia' nell'ordine di stampa (l'ordine di
// SIMPLE_DECKS/OUTPUTS a monte); il dorso resta corretto per ogni carta
// perche' viaggia insieme ad essa, non piu' legato alla pagina intera.
// Sequenziale apposta (non Promise.all): ora ogni fronte passa per
// shrinkImage, che apre/chiude una sua pagina Chromium - farne decine in
// parallelo e' inutile rischio di risorse in piu' oltre a quello gia'
// diagnosticato sul documento finale (vedi l'attesa esplicita su
// page.setContent piu' sotto). Piu' lento, ma prevedibile.
async function packedSheets(browser, items) {
  const pages = chunk(items, PER_PAGE);
  let sheets = '';
  for (const p of pages) {
    const fronts = [];
    for (const it of p) fronts.push(await frontCell(browser, it.card));
    const backs = mirrorRow(p).map(plainBackCell);
    sheets += `<section class="grid">${fronts.join('')}</section>
               <section class="grid">${backs.join('')}</section>`;
  }
  return sheets;
}

// Tessere: una per foglio A4 (200mm, troppo grandi per affiancarne due),
// fronte e retro su pagine consecutive cosi' la stampa fronte/retro le
// accoppia automaticamente senza bisogno di specchiare nulla (un solo
// pezzo per pagina, non una griglia da disporre a specchio come le carte).
async function tileSheets(browser) {
  let html = '';
  for (const t of TILES) {
    const frontPath = path.join(ROOT, 'Episodio 1', 'board', `${t.id} - ${t.nome}.png`);
    const backPath = path.join(ROOT, 'artworks', `Dorso Tessera ${t.id}.png`);
    if (!fs.existsSync(frontPath)) {
      console.warn(`  salto tessera ${t.id}: manca "${frontPath}" (genera prima le tessere)`);
      continue;
    }
    if (!fs.existsSync(backPath)) {
      console.warn(`  salto tessera ${t.id}: manca "${backPath}" (dorso tessera mancante)`);
      continue;
    }
    const frontUri = await shrinkImage(browser, frontPath, 1800, 0.85);
    const backUri = await shrinkImage(browser, backPath, 1800, 0.85);
    html += `<section class="tilepage"><div class="tile"><img src="${frontUri}"></div></section>
             <section class="tilepage"><div class="tile"><img src="${backUri}"></div></section>`;
    console.log(`  tessera ${t.id}: ok`);
  }
  return html;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const output of OUTPUTS) {
    console.log(`\n== ${output.label} ==`);
    let sheets = '';
    let bgRules = '';
    let bgIndex = 0;
    const items = []; // {card, bgClass}, in ordine di stampa, impaginati insieme

    async function registerDorso(deck) {
      const uri = await dorsoUri(browser, deck.dorso);
      if (!uri) {
        console.warn(`  salto "${deck.name}": manca artworks/${deck.dorso}`);
        return null;
      }
      const cls = `bg${bgIndex++}`;
      bgRules += `.${cls}{background-image:url('${uri}');background-size:cover;background-position:center;}\n`;
      return cls;
    }

    for (const deck of SIMPLE_DECKS) {
      const cards = deck.cards.filter((c) => bucketOf(c.file) === output.key);
      if (!cards.length) continue;
      const cls = await registerDorso(deck);
      if (!cls) continue;
      for (const card of cards) items.push({ card, bgClass: cls });
      console.log(`  ${deck.name}: ${cards.length} carte`);
    }

    // Un solo impaginamento per TUTTE le carte del bucket (vedi packedSheets):
    // niente pagine mezze vuote per un mazzo piccolo, il successivo riempie
    // lo spazio rimasto sulla stessa griglia 3x3.
    sheets += await packedSheets(browser, items);

    if (output.tessere) {
      console.log('  Tessere:');
      sheets += await tileSheets(browser);
    }

    if (!sheets) {
      console.log(`  (nessuna carta/tessera pronta per questo bucket, salto il PDF)`);
      continue;
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      @page { size: A4; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Georgia, 'Times New Roman', serif; }
      /* riga di tutela su ogni foglio di stampa (le carte circolano
         staccate dal repo): microtesto nel margine basso della pagina,
         fuori dalle carte - non finisce sui componenti ritagliati. */
      .grid::after, .tilepage::after {
        content: '© Fabio Stocco — “Ombre su Roccamora” · uso non commerciale (PolyForm NC 1.0.0) · github.com/pubule/ombre-su-roccamora';
        position: absolute; left: 0; right: 0; bottom: 2.2mm; text-align: center;
        font-size: 5.5pt; font-style: italic; color: #8a7150; }
      .grid, .tilepage { position: relative; }
      .grid { width: 210mm; height: 297mm; display: grid;
              grid-template-columns: repeat(${COLS}, ${CARD_W}mm);
              grid-auto-rows: ${CARD_H}mm; justify-content: center; align-content: center;
              gap: 0; page-break-after: always; }
      .card { width: ${CARD_W}mm; height: ${CARD_H}mm; overflow: hidden; }
      .card img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .card.empty { visibility: hidden; }
      .tilepage { width: 210mm; height: 297mm; display: flex; align-items: center;
                  justify-content: center; page-break-after: always; }
      .tile { width: ${TILE_MM}mm; height: ${TILE_MM}mm; overflow: hidden; }
      .tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
      ${bgRules}
    </style></head><body>${sheets}</body></html>`;

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 120000 });
    // 'networkidle' non basta: le immagini sono data-URI inline (nessuna
    // richiesta di rete da aspettare), ma con ~60+ carte a piena risoluzione
    // nello stesso documento la decodifica non e' istantanea - alcune celle
    // (es. le carte Eroi di Nino e Ottone, viste vuote pur con file corretto
    // e nessun avviso in console) risultavano bianche nel PDF perche' lo
    // screenshot partiva prima che quella specifica <img> avesse finito di
    // decodificare. Attesa esplicita e deterministica invece di un timeout
    // indovinato: aspetta ogni <img> del documento, una per una.
    await page.evaluate(() => Promise.all(Array.from(document.images).map((img) =>
      img.complete ? Promise.resolve() : new Promise((res) => { img.onload = img.onerror = res; }))));
    const out = path.join(ROOT, output.out);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.pdf({ path: out, format: 'A4', printBackground: true, timeout: 120000 });
    await page.close();
    console.log(`  -> ${out}`);
  }

  await browser.close();
})();
