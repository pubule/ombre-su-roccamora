// La NEBBIA DI SFONDO (js/nebbia.js): e' un effetto decorativo, e deve restare
// tale — dietro a tutto, mai fra il dito e un bottone, mai una ragione per cui
// l'app non parte, e spenta dove non si vede (la plancia a schermo intero).
//
// Uso (servono i vendor: ./fetch_vendor.sh):
//   node webapp/server.js &
//   node webapp/test-nebbia.mjs        (o OSR_BASE=http://127.0.0.1:8793 …)
import { chromium } from 'playwright';

const BASE = process.env.OSR_BASE || 'http://127.0.0.1:8017';
let ko = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) ko++; };

const browser = await chromium.launch();
const nuova = async (opzioni = {}, prima = async () => {}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...opzioni });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400 && /vendor|nebbia/.test(r.url())) errori.push(`${r.status()} ${r.url()}`); });
  await prima(page);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  return { page, ctx, errori };
};
const canvas = (page) => page.locator('#vanta-bg canvas').count();

// --- 1. la nebbia c'e', e non rompe niente
{
  const { page, errori } = await nuova();
  ok(await canvas(page) === 1, 'un canvas WebGL dentro #vanta-bg');
  ok(errori.length === 0, `nessun errore JS e nessun vendor mancante (${errori.slice(0, 2).join(' | ')})`);
  ok(await page.locator('#app').innerText().then((t) => t.trim().length > 0), "e l'app e' partita");

  // DIETRO A TUTTO: l'app ha uno z-index esplicito sopra la nebbia, e la nebbia
  // non prende i tocchi
  const st = await page.evaluate(() => {
    const cs = (e) => getComputedStyle(e);
    const app = document.getElementById('app'), bg = document.getElementById('vanta-bg');
    return { zApp: Number(cs(app).zIndex), zBg: Number(cs(bg).zIndex),
             puntatore: cs(bg).pointerEvents, fissa: cs(bg).position };
  });
  ok(st.zApp > st.zBg, `#app sta sopra la nebbia (z-index ${st.zApp} > ${st.zBg})`);
  ok(st.puntatore === 'none' && st.fissa === 'fixed', 'la nebbia e\' fissa e non prende i tocchi');

  // e un bottone vero, toccato dove sta, e' il bottone — non il canvas
  const preso = await page.evaluate(() => {
    const b = document.querySelector('#app button');
    if (!b) return 'nessun bottone';
    const r = b.getBoundingClientRect();
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return b.contains(e) ? 'bottone' : `altro: ${e && e.tagName}`;
  });
  ok(preso === 'bottone', `un tocco su un bottone arriva al bottone (${preso})`);

  // COSTO: a devicePixelRatio 2 i pixel del canvas sono la meta' per lato
  // (scale 2), cioe' un quarto — non li disegna a risoluzione piena
  const px = await page.evaluate(() => {
    const c = document.querySelector('#vanta-bg canvas');
    return { w: c.width, css: c.clientWidth, dpr: devicePixelRatio };
  });
  ok(px.w <= Math.round(px.css * px.dpr / 2) + 1,
     `il canvas non e' a risoluzione piena (${px.w}px per ${px.css}px CSS, dpr ${px.dpr})`);
  await page.context().close();
}

// --- 2. su un display retina la risoluzione dimezza davvero
{
  const { page } = await nuova({ deviceScaleFactor: 2 });
  const px = await page.evaluate(() => {
    const c = document.querySelector('#vanta-bg canvas');
    return { w: c.width, css: c.clientWidth };
  });
  ok(px.w <= px.css + 1, `a dpr 2 il canvas ha ~1 pixel per pixel CSS, non 2 (${px.w} vs ${px.css})`);
  await page.context().close();
}

// --- 3. chi non vuole animazioni non le ha
{
  const { page } = await nuova({ reducedMotion: 'reduce' });
  const v = await page.evaluate(() => VANTA.current && VANTA.current.options.speed);
  ok(v === 0, `con prefers-reduced-motion la nebbia sta ferma (speed ${v})`);
  await page.context().close();
}

// --- 4. nel modo immersivo (la plancia) la nebbia si nasconde, senza ricrearla
// (fino al 22/09/2026 qui si distruggeva e si ricreava il contesto WebGL ad
// ogni cambio: 36-230ms bloccanti ogni carta pescata — misurato)
{
  const { page } = await nuova();
  await page.evaluate(() => document.getElementById('app').classList.add('immersivo'));
  await page.waitForTimeout(300);
  ok(await canvas(page) === 1, 'in modo immersivo il canvas resta (nascosto, non ricreato)');
  ok(await page.locator('#vanta-bg').evaluate((e) => getComputedStyle(e).display) === 'none',
     'ma e\' display:none: niente disegno (isOnScreen la salta)');
  await page.evaluate(() => document.getElementById('app').classList.remove('immersivo'));
  await page.waitForTimeout(500);
  ok(await canvas(page) === 1, 'e torna uscendone, senza un secondo canvas');
  ok(await page.locator('#vanta-bg').evaluate((e) => getComputedStyle(e).display) !== 'none',
     'di nuovo visibile');
  await page.context().close();
}

// --- 5. senza le librerie (dev locale senza build, mirror caduto) l'app parte lo stesso
{
  const { page, errori } = await nuova({}, (p) => p.route('**/js/vendor/*.js', (r) => r.abort()));
  const soloVendor = errori.filter((e) => !/vendor|ERR_FAILED|net::/.test(e));
  ok(await canvas(page) === 0, 'senza vendor non c\'e\' nessun canvas');
  ok(soloVendor.length === 0, `e nessun errore JS nostro (${soloVendor.slice(0, 2).join(' | ')})`);
  ok(await page.locator('#app').innerText().then((t) => t.trim().length > 0), "e l'app parte lo stesso");
  await page.context().close();
}

await browser.close();
console.log(ko ? `\n${ko} FALLITI` : '\ntest-nebbia: tutto a posto');
process.exit(ko ? 1 : 0);
