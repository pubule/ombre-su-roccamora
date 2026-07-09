// Genera i 3 reperti stampabili dell'Episodio 1 (diario, registro, fascicolo)
// componendo lo sfondo pergamena + testo + sigillo con Playwright (screenshot di
// una pagina HTML), invece del PDF vettoriale di src/gen_reperti.py.
// Testi presi 1:1 da src/gen_reperti.py (fonte autoritativa).
//
// Layout a flusso normale (niente altezze/posizioni indovinate a mano): il
// body cresce in base al contenuto (height:auto), poi si misura scrollHeight
// e si scatta esattamente quella dimensione — cosi' niente testo tagliato o
// spazi vuoti enormi quando cambiano font-size/testi.
//
// Uso: node scripts/reperti/generate-reperti.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const BG = pathToFileURL(path.join(ROOT, 'artworks', 'Sfondo pergamena per i Reperti.png')).href;
const SEAL_PATH = path.join(ROOT, 'artworks', 'Sigillo.jpg');
const OUT_DIR = path.join(ROOT, 'reperti');
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1500;
const PAD = 190; // margine laterale, tenuto ben dentro i bordi frastagliati della pergamena

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=La+Belle+Aurore&family=IM+Fell+English+SC&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; }
  body { position: relative; background: url('${BG}') center top / ${W}px auto repeat-y; }
  /* Niente pannelli/alone: il testo si "brucia" nella pergamena con lo stesso
     blend mode Multiply che si userebbe in Photoshop/Photopea per un layer
     inchiostro sopra una foto (il colore scurisce in proporzione a quello che
     c'e' gia' sotto, quindi segue ombre/pieghe della carta senza bordi finti). */
  .hand, .serif, .caps { color: #3a2415; mix-blend-mode: multiply; font-weight: bold; }
  .hand { font-family: 'La Belle Aurore', cursive; }
  .serif { font-family: 'Old Standard TT', serif; }
  .caps { font-family: 'IM Fell English SC', serif; letter-spacing: 2px; text-transform: uppercase; }
  .wrap { padding: 140px ${PAD}px 140px ${PAD}px; }
`;

function page(bodyHtml) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>${bodyHtml}</body></html>`;
}

// Sigillo.jpg NON ha un canale alpha vero (e' un .jpg, il formato non lo
// supporta): il pattern a scacchi che sembra "trasparenza" e' in realta'
// disegnato nei pixel RGB stessi da qualunque tool l'abbia esportato. Quindi
// niente overlay/compositing puo' recuperarlo: bisogna fare color-key, cioe'
// sostituire i pixel grigio/bianco neutri (poco saturi, chiari) con un colore
// di sfondo pieno — la cera (rosso) e l'oro sono ben piu' saturi e non vengono toccati.
async function flattenSealToDataUrl(page_, bgColor) {
  const inputDataUrl = `data:image/png;base64,${fs.readFileSync(SEAL_PATH).toString('base64')}`;
  return page_.evaluate(async ({ src, bgColor }) => {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const br = parseInt(bgColor.slice(1, 3), 16);
    const bg = parseInt(bgColor.slice(3, 5), 16);
    const bb = parseInt(bgColor.slice(5, 7), 16);
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max - min < 22 && max > 150) {
        d[i] = br; d[i + 1] = bg; d[i + 2] = bb; d[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }, { src: inputDataUrl, bgColor });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page_ = await browser.newPage({ viewport: { width: W, height: 2000 } });

  const SEAL = await flattenSealToDataUrl(page_, '#5a1018');

  // --- Reperto A: diario di Ruggero ---
  const vociA = [
    "12 del mese. Stanotte di nuovo la musica. Viene da sotto la cripta, ne sono certo: il pavimento la beve e la restituisce alle mie campane. Don Callisto dice che sogno.",
    "15 del mese. Ho trovato una corda d’argento sui gradini della cripta. Non è roba da chiesa. L’ho portata a casa, Bice non deve spaventarsi.",
    "19 del mese. Il liutaio sale all’organo anche di notte, ormai. Stanotte l’ho visto uscire dalla cripta con la sua chiave. Mi ha guardato. Non ha detto nulla.",
    "21 del mese. Le mie campane suonano senza di me e io conto i rintocchi come un condannato conta i gradini. Domani scendo anch’io, e che Dio mi perdoni la curiosità.",
  ];
  const repertoA = page(`
    <div class="wrap"><div style="zoom:0.90;">
      <div class="serif" style="font-style:italic; font-size:38px; color:#3a2415; mix-blend-mode:multiply; margin-bottom:30px;">Reperto A — dal diario di Ruggero Alvise, campanaro</div>
      <div style="font-size:64px; line-height:88px;">
        ${vociA.map((v) => `<p class="hand" style="margin-bottom:30px;">${v}</p>`).join('')}
      </div>
      <div style="margin-top:100px;">
        <div class="serif" style="font-style:italic; font-size:34px; color:#4a4a4e; mix-blend-mode:multiply; margin-bottom:16px;">L’ultima pagina è strappata. Ricalcando a grafite i solchi della penna, affiora:</div>
        <div class="hand" style="font-size:64px; line-height:88px; color:#4a4a4e; mix-blend-mode:multiply;">...alle 3 in punto, ogni notte. Tre rintocchi, poi uno, poi cinque. Non sono io a suonare.</div>
      </div>
    </div></div>
  `);

  // --- Reperto B: registro consegne bottega Ferri ---
  const righeB = [
    ['3 del mese', 'sei corde di minugia, colofonia', 'Teatro dell’Eco', 'saldato'],
    ['7 del mese', 'riparazione violoncello, ponticello', 'Casa Morvilli', 'saldato'],
    ['10 del mese', 'accordatura organo — III settimana', 'Cattedrale di S. Teodoro', 'in opera'],
    ['14 del mese', 'una corda d’argento, su misura', 'commessa privata', 'ritirata'],
    ['18 del mese', 'sedici candele di cera nera', 'C.B., molo terzo', 'pagato B.F.'],
    ['21 del mese', 'quaranta candele di cera nera', 'C.B., molo terzo, il vecchio deposito', 'pagato B.F.'],
  ];
  const repertoB = page(`
    <div class="wrap"><div style="zoom:0.84;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:68px;">bottega b. ferri · liutaio · registro delle consegne</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto B — trovato aperto sul banco da lavoro</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:44px;">
        <thead>
          <tr class="serif" style="font-weight:bold;">
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">data</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">fornitura</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">destinazione</th>
            <th style="text-align:left; border-bottom:2px solid #3a2415; padding:10px 8px; mix-blend-mode:multiply;">nota</th>
          </tr>
        </thead>
        <tbody class="hand">
          ${righeB.map((r) => `<tr>${r.map((v) => `<td style="border-bottom:1px solid #3a2415; padding:20px 8px; font-size:52px; mix-blend-mode:multiply;">${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="hand" style="margin-top:80px; font-size:56px; line-height:72px;">
        il bronzo canta, la pietra risponde, l’acqua ricorda — II mov. quasi pronto
      </div>
    </div></div>
  `);

  // --- Reperto C: fascicolo 1741 dall'Archivio Civico ---
  const decretoC = `Addì XII di novembre, l’anno del Signore MDCCXLI.<br/><br/>
Il Consiglio, udite le testimonianze de’ parroci e de’ barcaioli, <b>bandisce in perpetuo</b> la confraternita detta del <b>CORO SOMMERSO</b>, per pratiche contrarie a Dio ed alla quiete delle acque; la quale confraternita usava radunarsi nelle cavità sotto la Cattedrale, <i>dove l’acqua canta</i>, e quivi levare canti che non sono di questo mondo né per questo mondo.<br/><br/>
Si ordina: che le dette cavità siano murate; che le campane tacciano dal vespro all’alba per un anno intero; che il sigillo della confraternita — <b>un’onda incisa</b> — sia scalpellato ovunque si trovi.<br/><br/>
Chi canterà al di sotto, non si lamenti di ciò che al di sotto risponde.`;
  const consultC = [
    ['1893, marzo', 'don E. Callisto, per la parrocchia'],
    ['1901, ottobre', 'G. Morvilli, storico'],
    ['due mesi or sono', 'B. Ferri, liutaio'],
  ];
  const repertoC = page(`
    <div class="wrap"><div style="zoom:0.73;">
      <div style="text-align:center; margin-bottom:60px;">
        <div class="caps" style="font-size:64px;">atti del consiglio di roccamora · anno mdccxli</div>
        <div class="serif" style="font-style:italic; font-size:36px; color:#3a2415; mix-blend-mode:multiply; margin-top:14px;">Reperto C — fascicolo n. 44, Archivio Civico</div>
      </div>
      <div class="serif" style="font-size:54px; line-height:76px; text-align:justify;">
        ${decretoC}
      </div>
      <div style="text-align:right; margin-top:60px;">
        <img src="${SEAL}" style="width:220px; height:220px; border-radius:50%; transform:rotate(-8deg); box-shadow:0 4px 14px rgba(0,0,0,0.5);" />
      </div>
      <div style="margin-top:60px;">
        <div class="serif" style="font-weight:bold; font-size:40px; margin-bottom:24px;">SCHEDA DELLE CONSULTAZIONI — fascicolo n. 44</div>
        ${consultC.map(([dt, chi]) => `
          <div style="display:flex; border-bottom:1px solid #3a2415; padding:18px 0;">
            <div class="hand" style="width:420px; font-size:44px;">${dt}</div>
            <div class="hand" style="font-size:44px;">${chi}</div>
          </div>`).join('')}
      </div>
    </div></div>
  `);

  const items = [
    ['Reperto A - Diario di Ruggero', repertoA],
    ['Reperto B - Registro delle Consegne', repertoB],
    ['Reperto C - Fascicolo del 1741', repertoC],
  ];

  for (const [name, html] of items) {
    // page.setContent() gira su origin about:blank, che Chromium non lascia
    // caricare risorse file:// (sfondo/sigillo restavano bianchi). Scrivendo
    // l'HTML su disco e navigandoci, l'origin diventa file:// e le immagini
    // locali si caricano normalmente.
    const tmpHtml = path.join(OUT_DIR, `.tmp-${name}.html`);
    fs.writeFileSync(tmpHtml, html, 'utf8');
    await page_.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });
    await page_.evaluate(() => document.fonts.ready);
    await page_.waitForTimeout(300);
    // Layout a flusso: il body non ha altezza fissata, cresce col contenuto.
    // Si misura scrollHeight DOPO il render e si adatta il viewport, cosi'
    // lo screenshot prende esattamente tutto il contenuto (niente tagli,
    // niente spazio vuoto indovinato a mano).
    const contentHeight = await page_.evaluate(() => document.body.scrollHeight);
    await page_.setViewportSize({ width: W, height: contentHeight });
    await page_.waitForTimeout(100);
    const outPath = path.join(OUT_DIR, `${name}.png`);
    await page_.screenshot({ path: outPath });
    fs.unlinkSync(tmpHtml);
    console.log('ok ->', outPath, `(${contentHeight}px)`);
  }

  await browser.close();
})();
