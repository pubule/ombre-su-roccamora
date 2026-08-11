// Il fascicolo, verificato sugli stili CALCOLATI invece che a occhio.
//
// Due cose che l'occhio non sa fare. La prima: accorgersi che un pezzo di app
// e' rimasto al tema vecchio mentre si sistemava il resto — bordi d'oro, angoli
// tondi da 10px, pergamena. La seconda: misurare il contrasto, che su un tema
// scuro e' proprio dove si sbaglia, perche' gli occhi si abituano e i numeri no.
//
// Uso: node webapp/server.js (altrove) ; node webapp/test-stile.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:8017';
let ko = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };

// --- palette del fascicolo (mockups/stile/fascicolo.css) --------------------
const T = {
  tavolo: 'rgb(11, 11, 13)', ardesia: 'rgb(23, 24, 28)', ardesiaAlta: 'rgb(32, 34, 40)',
  osso: 'rgb(222, 219, 212)', ceralacca: 'rgb(163, 37, 58)', nastro: 'rgb(75, 107, 138)',
};
// il tema vecchio: se uno di questi ricompare fuori dalla mappa, siamo tornati indietro
const ORO = [[168, 131, 58], [216, 178, 94], [230, 195, 120], [242, 193, 78]];
const PERGAMENA = [[240, 230, 204], [226, 211, 172], [246, 238, 218], [244, 235, 212]];

// la mappa e' l'eccezione dichiarata: turchese «puoi andare», oro «rivela»,
// rosso «nemico» sono segnali imparati al tavolo, non decorazione
const MAPPA = ['.cella-b', '.cella-mossa', '.tessera-b', '.tess-tag', '.porta-lbl',
  '.tok-board', '.tok-slot', '.oro', '.verde', '.board-digitale', '.board-wrap'];
// DOVE LA CARTA E' AMMESSA — l'elenco e' la tesi del fascicolo, scritta per
// esteso: sono le cose che al tavolo esistono davvero. Se si allunga senza una
// ragione di finzione, la direzione si sta sciogliendo.
const CARTA_VERA = ['.carta', '.lettera-panel', '.reperto-img', '.carta-grande',
  '.galleria-carte', '.dado', '.dado-faccia', '.stampe',
  '.campo'];   // i campi: e' li' che scrive il gruppo, e si scrive su carta
const ESENTI = [...MAPPA, ...CARTA_VERA];

const rgb = (s) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
const vicino = (c, tavolozza, tolleranza = 26) => tavolozza.some((t) =>
  Math.abs(t[0] - c[0]) + Math.abs(t[1] - c[1]) + Math.abs(t[2] - c[2]) < tolleranza);
const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
};
const contrasto = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + .05) / (y + .05);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
page.on('pageerror', (e) => { console.log('   !! pageerror:', e.message); ko++; });
await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });

// seme: una partita in indagine, per arrivare alle schermate che contano
const semina = async () => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.clear();
    return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
      const party = c.eroi.slice(0, 3).map((e) => e.nome);
      localStorage.setItem('osr.partita.ep1', JSON.stringify({
        v: 1, episodio: 'ep1', modo: 'tavolo', plancia: 'fisica', party, creata: Date.now(),
        fase: 'indagine',
        indagine: { ora: 21, lettaLettera: true, visitati: [1], scoperti: [], sbloccati: [],
          parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
          secondoFiato: {}, note: 'la chiave non torna', risposte: ['', '', '', ''], chiusa: false },
        spedizione: { round: 0, canto: 0, cantoBonus: false, ferite: [], mazzo: null, scarti: [], esito: null },
      }));
    });
  });
};

// --- raccolta: ogni elemento visibile, col suo colore e il suo fondo vero ----
const RACCOGLI = (esenti) => {
  const dentroEsente = (el) => esenti.some((s) => el.closest(s));
  const fondoVero = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const st = getComputedStyle(n);
      if (st.backgroundImage && st.backgroundImage !== 'none') return { immagine: true };
      const m = st.backgroundColor.match(/[\d.]+/g);
      if (m && (m.length < 4 || Number(m[3]) > .85)) return { colore: st.backgroundColor };
    }
    return { colore: getComputedStyle(document.body).backgroundColor };
  };
  const out = { testi: [], superfici: [] };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    if (!r.width || !r.height || st.visibility === 'hidden' || st.display === 'none') continue;
    const esente = dentroEsente(el);

    // superfici: bordi e raggi, per accorgersi del tema vecchio
    // il gradiente va guardato dentro: i pannelli di pergamena sono gradienti,
    // e controllando il solo backgroundColor passerebbero inosservati
    out.superfici.push({
      sel: el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName.toLowerCase(),
      bordo: st.borderTopColor, raggio: parseFloat(st.borderTopLeftRadius) || 0,
      fondo: st.backgroundColor, sfumatura: st.backgroundImage,
      immagine: /url\(/.test(st.backgroundImage), esente,
    });

    // testi: solo chi ha testo proprio
    const proprio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!proprio) continue;
    out.testi.push({
      sel: el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName.toLowerCase(),
      testo: el.textContent.trim().slice(0, 40),
      colore: st.color, dim: parseFloat(st.fontSize), grassetto: Number(st.fontWeight) >= 700,
      fondo: fondoVero(el), esente,
    });
  }
  return out;
};

const schermate = [];
const guarda = async (nome) => {
  await page.waitForTimeout(350);
  schermate.push({ nome, ...(await page.evaluate(RACCOGLI, ESENTI)) });
};

// --- il giro delle schermate ------------------------------------------------
await semina();
await page.goto(BASE, { waitUntil: 'networkidle' });
await guarda('home');
await page.getByText('Il Coro Sommerso').first().click();
await guarda('episodio');
await page.locator('#continua').click();
await guarda('indagine');
if (await page.locator('#taccuino').count()) {
  await page.locator('#taccuino').click();
  await guarda('taccuino');
}
await browser.close();

console.log(`schermate lette: ${schermate.map((s) => s.nome).join(', ')}\n`);
ok(schermate.length >= 4, 'tutte le schermate raggiunte');

// --- 1. conformità: il tema vecchio non deve sopravvivere -------------------
const superfici = schermate.flatMap((s) => s.superfici.map((x) => ({ ...x, dove: s.nome })));
const oroRimasto = superfici.filter((x) => !x.esente && vicino(rgb(x.bordo), ORO));
ok(oroRimasto.length === 0,
  `nessun bordo d'oro fuori dalla mappa (trovati ${oroRimasto.length}${
    oroRimasto.length ? ': ' + oroRimasto.slice(0, 4).map((x) => `${x.dove}/${x.sel}`).join(', ') : ''})`);

const coloriDi = (s) => (s.match(/rgba?\([^)]+\)/g) || []).map(rgb);
const pergRimasta = superfici.filter((x) => !x.esente && !x.immagine
  && (vicino(rgb(x.fondo), PERGAMENA) || coloriDi(x.sfumatura || '').some((c) => vicino(c, PERGAMENA))));
ok(pergRimasta.length === 0,
  `nessuna superficie di pergamena fuori dalla carta vera (trovate ${pergRimasta.length}${
    pergRimasta.length ? ': ' + pergRimasta.slice(0, 4).map((x) => `${x.dove}/${x.sel}`).join(', ') : ''})`);

const tondi = superfici.filter((x) => !x.esente && x.raggio > 3 && x.raggio < 50);
ok(tondi.length === 0,
  `nessun angolo tondo oltre i 3px (trovati ${tondi.length}${
    tondi.length ? ': ' + tondi.slice(0, 4).map((x) => `${x.dove}/${x.sel} ${x.raggio}px`).join(', ') : ''})`);

// --- 2. contrasto: la parte che l'occhio sbaglia sui temi scuri -------------
const testi = schermate.flatMap((s) => s.testi.map((x) => ({ ...x, dove: s.nome })));
const suImmagine = testi.filter((t) => t.fondo.immagine);
const misurabili = testi.filter((t) => !t.fondo.immagine);
const scarsi = misurabili.map((t) => ({ ...t, r: contrasto(rgb(t.colore), rgb(t.fondo.colore)) }))
  .filter((t) => t.r < (t.dim >= 24 || (t.dim >= 18.66 && t.grassetto) ? 3 : 4.5));

ok(scarsi.length === 0,
  `ogni testo sopra la soglia (${misurabili.length} misurati, ${scarsi.length} sotto)`);
for (const t of scarsi.slice(0, 8)) {
  console.log(`        ${t.dove}/${t.sel} ${t.r.toFixed(2)}:1 — «${t.testo}»`);
}
// niente tagli silenziosi: quel che non si e' potuto misurare si dichiara
console.log(`   (${suImmagine.length} testi su immagine: non misurabili, vanno guardati)`);

console.log(ko ? `\n${ko} FALLITI` : '\ntest-stile: tutto a posto');
process.exit(ko ? 1 : 0);
