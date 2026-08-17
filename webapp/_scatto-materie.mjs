// I quattro materiali dentro la stessa finestra (A · il tiro sul vetro,
// momento del conto): e' l'unico confronto che vale, il cubo sullo sfondo che
// avra' davvero.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
const guai = [];
p.on('pageerror', (e) => guai.push(e.message));
await p.goto('http://127.0.0.1:8017/mockups/stile2/nebbia2-dadi.html', { waitUntil: 'networkidle' });
await p.screenshot({ path: 'scatti/dadi-vetrina.png', clip: { x: 0, y: 0, width: 390, height: 620 } });
for (const m of ['d-osso', 'd-vetro', 'd-corno', 'd-ottone']) {
  await p.click(`[data-materia="${m}"]`);
  await p.click('[data-schermo="a"]');
  await p.click('[data-vai="a|conto"]');
  await p.waitForTimeout(150);
  await p.screenshot({ path: `scatti/materia-${m}.png` });
  await p.click('[data-esci]');
}
// la vetrina resta un confronto: quattro materiali diversi anche a scelta fatta
const diversi = await p.$$eval('.vetrina .campione .dado-faccia.f1',
  (fs) => new Set(fs.map((f) => getComputedStyle(f).backgroundImage)).size);
console.log('materiali distinti nella vetrina:', diversi, '(atteso 4)');
console.log('errori:', guai.length ? guai : 'nessuno');
await b.close();
