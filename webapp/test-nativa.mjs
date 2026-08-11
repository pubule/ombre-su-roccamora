// L'app installata: icone vere, avvio senza lampo bianco — e lo scorrimento
// che NON si perde.
//
// Due difetti che questo banco esiste per impedire. Il primo c'era davvero: il
// manifest dichiarava un'icona «512x512» puntando a un file 696x678, e nessuno
// se n'era accorto perche' il browser non protesta, si limita a scartarla. Il
// secondo e' quello che verrebbe dopo: la strada breve per «sembrare un'app»
// e' bloccare la pagina (position: fixed, overflow: hidden, touchmove
// annullato), e questa app e' fatta di pagine da leggere.
//
// Uso: node webapp/server.js (altrove) ; node webapp/test-nativa.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:8017';
const TAVOLO = '#0b0b0d';          // --tavolo del fascicolo
let ko = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => { console.log('   !! pageerror:', e.message); ko++; });
await page.addInitScript(() => { window.confirm = () => true; window.alert = () => {}; });

// --- 1. il manifest, e le icone che promette -------------------------------
const manifest = await (await fetch(`${BASE}/manifest.webmanifest`)).json();
ok(manifest.theme_color === TAVOLO && manifest.background_color === TAVOLO,
  `i colori del manifest sono quelli del tema (${manifest.theme_color})`);
ok(!!manifest.start_url && !!manifest.scope && !!manifest.id, 'start_url, scope e id dichiarati');

const misura = async (url) => {
  const r = await fetch(BASE + url);
  if (!r.ok) return { errore: r.status };
  const buf = Buffer.from(await r.arrayBuffer());
  // PNG: larghezza e altezza stanno nell'header IHDR, byte 16..24
  if (buf.slice(1, 4).toString() !== 'PNG') return { errore: 'non e\' un png' };
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), byte: buf.length };
};

const misureAttese = [];
for (const i of manifest.icons) {
  const m = await misura(i.src);
  const [w, h] = i.sizes.split('x').map(Number);
  misureAttese.push(`${i.sizes}${i.purpose === 'maskable' ? ' maskable' : ''}`);
  ok(!m.errore && m.w === w && m.h === h,
    `l'icona ${i.src.split('/').pop()} esiste ed e' davvero ${i.sizes}` +
    (m.errore ? ` — ${m.errore}` : ` (${m.w}x${m.h})`));
}
ok(manifest.icons.some((i) => i.sizes === '192x192'), 'c\'e\' la 192, che Chrome pretende');
ok(manifest.icons.some((i) => i.sizes === '512x512'), 'c\'e\' la 512, che Chrome pretende');
ok(manifest.icons.some((i) => i.purpose === 'maskable'),
  'c\'e\' una maskable: Android ritaglia le icone e senza margine mangia il sigillo');

// --- 2. quel che serve a iOS -----------------------------------------------
await page.goto(BASE, { waitUntil: 'networkidle' });
const testa = await page.evaluate(() => ({
  appleIcon: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') || '',
  titolo: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.content || '',
  capace: !!document.querySelector('meta[name="mobile-web-app-capable"]'),
  tema: document.querySelector('meta[name="theme-color"]')?.content || '',
  avvii: [...document.querySelectorAll('link[rel="apple-touch-startup-image"]')].map((l) => l.href),
}));
const icona = await misura(testa.appleIcon);
ok(!icona.errore && icona.w === 180,
  `l'apple-touch-icon esiste ed e' 180x180 — senza, iOS mette uno screenshot`);
ok(!!testa.titolo, `l'icona ha un nome corto («${testa.titolo}»)`);
ok(testa.capace, 'dichiarata installabile anche col meta moderno');
ok(testa.tema.toLowerCase() === TAVOLO, 'il theme-color della pagina e\' quello del tema');
ok(testa.avvii.length >= 12, `ci sono le immagini di avvio (${testa.avvii.length})`);
let avviiRotti = 0;
for (const u of testa.avvii) { if (!(await fetch(u)).ok) avviiRotti++; }
ok(avviiRotti === 0, `tutte le immagini di avvio si scaricano (${avviiRotti} rotte)`);

// --- 3. LO SCORRIMENTO, che non si tocca -----------------------------------
// e' il punto sollevato dall'autore: «attento a non togliere lo scroll».
const scorre = async (nome) => {
  const prima = await page.evaluate(() => {
    window.scrollTo(0, 0);
    return { alta: document.documentElement.scrollHeight, finestra: window.innerHeight };
  });
  if (prima.alta <= prima.finestra + 4) {
    ok(false, `${nome}: la pagina non e' piu' alta della finestra, non si puo' provare lo scorrimento`);
    return;
  }
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(150);
  const dopo = await page.evaluate(() => window.scrollY);
  ok(dopo > 100, `${nome}: si scorre (scrollY ${Math.round(dopo)} dopo aver chiesto 400)`);
};

await page.evaluate(() => {
  localStorage.clear();
  return fetch('/data/comune.json').then((r) => r.json()).then((c) => {
    localStorage.setItem('osr.partita.ep1', JSON.stringify({
      v: 1, episodio: 'ep1', modo: 'tavolo', plancia: 'fisica',
      party: c.eroi.slice(0, 3).map((e) => e.nome), creata: Date.now(), fase: 'indagine',
      indagine: { ora: 21, lettaLettera: false, visitati: [], scoperti: [], sbloccati: [],
        parole: [], oggetti: [], reperti: [], approfondimentiLetti: [], caricheUsate: {},
        secondoFiato: {}, note: '', risposte: ['', '', '', ''], chiusa: false },
      spedizione: { round: 0, canto: 0, cantoBonus: false, ferite: [], mazzo: null, scarti: [], esito: null },
    }));
  });
});
await page.goto(BASE, { waitUntil: 'networkidle' });
await scorre('home (21 episodi)');

await page.getByText('Il Coro Sommerso').first().click();
await page.waitForTimeout(350);
await page.locator('#continua').click();
await page.waitForTimeout(800);
await scorre('la lettera d\'incarico');

await page.locator('#in-strada').click();
await page.waitForTimeout(700);
await scorre('lo stradario');

await page.locator('#taccuino').click();
await page.waitForTimeout(500);
await scorre('il taccuino');

// la scheda di un eroe: si apre in un pannello che scorre per conto suo
await page.locator('#nav-esci').click();
await page.waitForTimeout(500);

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\ntest-nativa: tutto a posto');
process.exit(ko ? 1 : 0);
