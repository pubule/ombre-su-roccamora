// Le quattro scritture della faccia, sul materiale scelto: pallini, fiammelle,
// cifre, romane. Uno scatto per ognuna nella finestra A al momento del conto,
// dove le facce si leggono ferme.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
const guai = [];
p.on('pageerror', (e) => guai.push(e.message));
await p.goto('http://127.0.0.1:8017/mockups/stile2/nebbia2-dadi.html', { waitUntil: 'networkidle' });
await p.click('[data-materia="d-corno"]');
for (const s of ['s-pallini', 's-lumi', 's-cifre', 's-romane']) {
  await p.click(`[data-segno="${s}"]`);
  await p.click('[data-schermo="a"]');
  await p.click('[data-vai="a|conto"]');
  await p.waitForTimeout(150);
  // un segno solo per faccia: pallini E cifra insieme sarebbero due valori
  const doppi = await p.evaluate(() => [...document.querySelectorAll('.dadi-overlay.schermo .dado-faccia')]
    .filter((f) => [...f.children].filter((c) => getComputedStyle(c).display !== 'none').length !== 1).length);
  console.log(`${s}: facce con piu' (o meno) di un segno: ${doppi}`);
  await p.screenshot({ path: `scatti/segno-${s}.png` });
  await p.click('[data-esci]');
}
await p.screenshot({ path: 'scatti/segni-vetrina.png', clip: { x: 0, y: 560, width: 390, height: 760 } });
console.log('errori:', guai.length ? guai : 'nessuno');
await b.close();
