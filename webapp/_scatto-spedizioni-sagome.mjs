// Lo scatto delle cinque spedizioni, in tutte e due le vie. Il conto delle
// tessere e degli sfondi serve a una cosa sola: in una plancia di sei riquadri
// uno sfondo mancante e' un buco nero, e un buco nero somiglia troppo a una
// casella fuori sagoma per accorgersene guardando.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
const guai = [];
p.on('pageerror', (e) => guai.push('errore: ' + e.message));
p.on('response', (r) => { if (r.status() >= 400) guai.push(r.status() + ' ' + r.url().slice(-52)); });
await p.goto('http://127.0.0.1:8017/mockups/stile2/nebbia2-spedizioni-sagome.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(700);
for (const via of ['sag', 'quad']) {
  await p.click(via === 'sag' ? '#b-sag' : '#b-quad');
  await p.waitForTimeout(600);
  const conto = await p.$$eval('.tess', (n) => ({
    tessere: n.length,
    senzaSfondo: n.filter((e) => !e.style.backgroundImage || e.style.backgroundImage === 'none').length,
  }));
  console.log(`${via}: ${conto.tessere} tessere · senza sfondo ${conto.senzaSfondo}`);
  await p.screenshot({ path: `../scatti/spedizioni-${via}.png`, fullPage: true });
}
console.log(guai.length ? guai.slice(0, 6).join(' | ') : 'nessun errore, nessun 404');
await b.close();
