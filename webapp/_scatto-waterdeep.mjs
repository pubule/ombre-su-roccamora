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
await p.goto('http://127.0.0.1:8017/mockups/stile2/nebbia2-tessere-waterdeep.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(700);

await p.waitForTimeout(800);
const n = await p.$('.lastraT', (x) => ({tot: x.length, vuoti: x.filter((e) => !e.style.backgroundImage).length}));
console.log('lastre:', n.tot, '· senza sfondo:', n.vuoti);
await p.screenshot({ path: '../scatti/waterdeep.png', fullPage: true });
console.log(guai.length ? guai.slice(0, 6).join(' | ') : 'nessun errore, nessun 404');
await b.close();
